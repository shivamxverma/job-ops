#!/usr/bin/env node
/**
 * JobOps ATS scout — Indian startups' own job boards (Greenhouse, Lever, Ashby, Workable).
 *
 *   node scripts/ats-scout.mjs                  # discover new boards, then pull every board
 *   node scripts/ats-scout.mjs --rediscover     # re-check every site, ignore the 30-day cache
 *   node scripts/ats-scout.mjs --ignore-seen    # re-emit postings already shown
 *   node scripts/ats-scout.mjs --all            # keep geo-blocked postings too
 *   node scripts/ats-scout.mjs --discover-only  # build/refresh the registry, pull nothing
 *
 * Why it exists (2026-10-21): every other scripted channel is US-centric (HN, YC, US remote
 * boards), while the seats Shivam can actually win are at Indian startups, which post on their
 * own ATS and almost nowhere the scouts looked.
 *
 * How it finds a company's board: it opens the company's site and careers page and follows
 * the link to the ATS, then confirms it through that ATS's public JSON API. Slugs are never
 * guessed from the company name — `jobs.ashbyhq.com/compound` is a live board belonging to a
 * different company entirely (see lib/gates.mjs). The result is cached per domain in
 * inbox/.ats-registry.json and re-checked every 30 days.
 *
 * Companies come from scripts/data/india-startups.txt plus every active YC company that lists
 * India (yc-oss mirror). Boards on Keka, Darwinbox, Zoho Recruit, Freshteam, SmartRecruiters
 * or Workday are recorded but not read yet; the summary counts them so the gap stays visible.
 *
 * Filters and scoring are shared: lib/board-score.mjs (same grades as board-scout),
 * lib/keywords.mjs, lib/reachability.mjs. Don't re-inline them here.
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { matchKeywords } from "./lib/keywords.mjs";
import { reachability } from "./lib/reachability.mjs";
import { scorePosting, isEngTitle } from "./lib/board-score.mjs";
import { today } from "./lib/today.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INBOX = join(ROOT, "inbox");
const SEEDS_FILE = join(ROOT, "scripts", "data", "india-startups.txt");
const REGISTRY_FILE = join(INBOX, ".ats-registry.json");
const SEEN_FILE = join(INBOX, ".ats-seen.json");

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const REDISCOVER = flag("rediscover");
const IGNORE_SEEN = flag("ignore-seen");
const KEEP_BLOCKED = flag("all");
const DISCOVER_ONLY = flag("discover-only");

const REDISCOVER_DAYS = 30;
// A role still listed on the company's own board is open; age only flags evergreen ghosts.
const MAX_AGE_DAYS = 120; // same cutoff as the YC no-lastActive ghost rule
const UA = { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36" };

// ---------------------------------------------------------------- helpers
const DEBUG = !!process.env.ATS_DEBUG;
async function get(url, asJson = false) {
  try {
    const res = await fetch(url, { headers: UA, redirect: "follow", signal: AbortSignal.timeout(12000) });
    if (!res.ok) { if (DEBUG) console.error(`  ${res.status} ${url}`); return null; }
    return asJson ? await res.json() : await res.text();
  } catch (e) {
    if (DEBUG) console.error(`  ERR ${e.cause?.code ?? e.name} ${url}`);
    return null;
  }
}

async function pool(items, n, fn) {
  const out = [];
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); }
  }));
  return out;
}

const decode = (s = "") => s
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
const stripHtml = (s = "") => decode(decode(s)).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const daysSince = (iso) => (iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 864e5) : null);

const domainOf = (url = "") => {
  try { return new URL(/^https?:/.test(url) ? url : `https://${url}`).hostname.replace(/^www\./, "").toLowerCase(); }
  catch { return null; }
};

// `IN` matched case-sensitively so the word "in" doesn't count (same rule as lib/yc-job.mjs).
const inIndia = (s = "") => /\bIN\b/.test(s) ||
  /india|bengaluru|bangalore|mumbai|delhi|gurugram|gurgaon|hyderabad|pune|chennai|noida|kolkata|ahmedabad|jaipur|kochi|indore|chandigarh/i.test(s);
// "Remote - US", "Remote (EU)", "Remote, United Kingdom": remote, but not from India.
const REMOTE_LOCKED = /remote\s*[-–—(,:|]\s*(us|usa|u\.s\.|united states|north america|americas|canada|uk|united kingdom|europe|eu|emea|latam|germany|france|spain|poland|singapore|australia|brazil|mexico)\b/i;

// ---------------------------------------------------------------- ATS adapters
// Each one: the link pattern that names the board on a company's own site, and the public
// JSON API that lists its postings, normalised to one shape.
const ATS = {
  ashby: {
    link: /(?:jobs\.ashbyhq\.com|api\.ashbyhq\.com\/posting-api\/job-board)\/([A-Za-z0-9._%-]+)/g,
    api: (s) => `https://api.ashbyhq.com/posting-api/job-board/${s}?includeCompensation=true`,
    list: (j) => j?.jobs,
    norm: (p, s) => ({
      id: `ashby:${s}:${p.id}`, title: p.title,
      location: [p.location, ...(p.secondaryLocations ?? []).map((l) => l.location)].filter(Boolean).join(" / "),
      remote: p.isRemote || /remote/i.test(p.workplaceType ?? ""),
      posted: p.publishedAt, url: p.jobUrl, text: p.descriptionPlain ?? stripHtml(p.descriptionHtml),
    }),
  },
  greenhouse: {
    link: /(?:boards|job-boards)(?:-api)?\.greenhouse\.io\/(?:v1\/boards\/|embed\/job_board(?:\/js)?\?for=)?([A-Za-z0-9_-]+)/g,
    api: (s) => `https://boards-api.greenhouse.io/v1/boards/${s}/jobs?content=true`,
    list: (j) => j?.jobs,
    norm: (p, s) => ({
      id: `greenhouse:${s}:${p.id}`, title: p.title, location: p.location?.name ?? "",
      remote: /remote/i.test(p.location?.name ?? ""),
      // updated_at moves on every edit; first_published is the real post date when present.
      posted: p.first_published ?? null, url: p.absolute_url, text: stripHtml(p.content),
    }),
  },
  lever: {
    link: /jobs\.lever\.co\/([A-Za-z0-9._-]+)/g,
    api: (s) => `https://api.lever.co/v0/postings/${s}?mode=json`,
    list: (j) => (Array.isArray(j) ? j : null),
    norm: (p, s) => ({
      id: `lever:${s}:${p.id}`, title: p.text,
      location: (p.categories?.allLocations ?? [p.categories?.location]).filter(Boolean).join(" / "),
      remote: /remote/i.test(p.workplaceType ?? "") || /remote/i.test(p.categories?.location ?? ""),
      posted: p.createdAt ? new Date(p.createdAt).toISOString() : null, url: p.hostedUrl,
      text: [p.descriptionPlain, ...(p.lists ?? []).map((l) => `${l.text} ${stripHtml(l.content)}`), p.additionalPlain].filter(Boolean).join(" "),
    }),
  },
  workable: {
    link: /apply\.workable\.com\/(?:api\/v1\/widget\/accounts\/)?([A-Za-z0-9_-]+)/g,
    api: (s) => `https://apply.workable.com/api/v1/widget/accounts/${s}?details=true`,
    list: (j) => j?.jobs,
    norm: (p, s) => ({
      id: `workable:${s}:${p.shortcode}`, title: p.title,
      location: [p.city, p.state, p.country].filter(Boolean).join(", "),
      remote: !!p.telecommuting, posted: p.published_on ?? p.created_at ?? null, url: p.url,
      text: stripHtml(p.description),
    }),
  },
};
// Recorded so the coverage gap is visible, not read (no public JSON API we trust yet).
const UNREAD = [
  ["keka", /\.keka\.com/i], ["darwinbox", /darwinbox\.in|darwinbox\.com\/.*career/i],
  ["zoho-recruit", /zohorecruit\.|recruit\.zoho/i], ["freshteam", /freshteam\.com/i],
  ["smartrecruiters", /smartrecruiters\.com/i], ["workday", /myworkdayjobs\.com/i],
  ["recruitee", /recruitee\.com/i], ["turbohire", /turbohire\.co/i],
];
const BAD_SLUG = /^(embed|api|v1|jobs|job|careers|static|assets|js|css|images?|favicon|posting-api|job-board|widget|accounts|for)$/i;

// ---------------------------------------------------------------- discovery
async function discover(domain, name) {
  const home = await get(`https://${domain}`);
  const pages = [home ?? ""];
  // Careers pages: the usual paths plus any careers/jobs link the homepage itself carries
  // (which is how careers.{domain} and Notion careers pages get found).
  const linked = [...(home ?? "").matchAll(/href=["']([^"']*(?:career|jobs|join-us|work-with-us|hiring)[^"']*)["']/gi)]
    .map((m) => { try { return new URL(m[1], `https://${domain}`).href; } catch { return null; } })
    .filter((u) => u && !/\.(png|jpe?g|svg|css|js)(\?|$)/i.test(u));
  const tries = [...new Set([`https://${domain}/careers`, `https://${domain}/jobs`, ...linked])].slice(0, 6);
  for (const u of tries) pages.push((await get(u)) ?? "");
  const html = pages.join("\n");

  for (const [ats, a] of Object.entries(ATS)) {
    const slugs = [...new Set([...html.matchAll(a.link)].map((m) => decodeURIComponent(m[1])).filter((s) => !BAD_SLUG.test(s)))];
    for (const slug of slugs.slice(0, 3)) {
      const j = await get(a.api(slug), true);
      const list = a.list(j);
      if (Array.isArray(list)) return { ats, slug, open: list.length };
    }
  }

  // Most careers pages render the job list client-side, so the ATS link never appears in the
  // HTML (196 of 279 on the first run). Fall back to the company's own name as the slug, but
  // only accept a board that proves it is theirs: its postings must name the company AND at
  // least one must be in India. That second test is what shuts out same-name US companies
  // (the `jobs.ashbyhq.com/compound` trap in lib/gates.mjs).
  const guessed = await guessBoard(domain, name);
  if (guessed) return guessed;

  for (const [ats, re] of UNREAD) if (re.test(html)) return { ats, slug: null, unread: true };
  return { ats: null, slug: null, reachable: !!home };
}

async function guessBoard(domain, name) {
  const label = domain.split(".")[0];
  const flat = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const dashed = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const slugs = [...new Set([flat, label, dashed])].filter((s) => s.length >= 3);
  // The company has to be named in its own postings. Short or generic names ("Fi", "Open")
  // match too much prose, so those must show their domain instead.
  const tokens = [name, label].filter((t) => t.length >= 4).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const named = tokens.length
    ? new RegExp(`\\b(${tokens.join("|")})\\b`, "i")
    : new RegExp(domain.replace(/\./g, "\\."), "i");
  for (const [ats, a] of Object.entries(ATS)) {
    if (ats === "workable") continue; // Workable answers for accounts that aren't the company (stack-probe.mjs)
    for (const slug of slugs) {
      const list = a.list(await get(a.api(slug), true));
      if (!Array.isArray(list) || !list.length) continue;
      const posts = list.slice(0, 40).map((p) => a.norm(p, slug));
      const india = posts.some((p) => inIndia(p.location ?? ""));
      const isTheirs = posts.some((p) => named.test(`${p.title} ${p.text}`));
      if (india && isTheirs) return { ats, slug, open: list.length, guessed: true };
    }
  }
  return null;
}

function siteName(domain) {
  const label = domain.split(".")[0];
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// ---------------------------------------------------------------- seeds
const seeds = new Map(); // domain -> { name, source }
if (existsSync(SEEDS_FILE)) {
  for (const line of readFileSync(SEEDS_FILE, "utf8").split("\n")) {
    const d = domainOf(line.replace(/#.*/, "").trim());
    if (d && d.includes(".")) seeds.set(d, { name: siteName(d), source: "seed list" });
  }
}

const yc = (await get("https://yc-oss.github.io/api/companies/all.json", true)) ?? [];
for (const c of yc) {
  if (c.status !== "Active" || !c.website) continue;
  if (!/india/i.test(JSON.stringify([c.all_locations, c.regions]))) continue;
  const d = domainOf(c.website);
  if (!d) continue;

  seeds.set(d, { name: c.name, source: `YC ${c.batch ?? ""}`.trim() });
}
// --only a.com,b.com: just these companies (testing a domain without a full run).
const ONLY = (() => { const i = argv.indexOf("--only"); return i >= 0 ? argv[i + 1].split(",").map(domainOf) : null; })();
if (ONLY) for (const d of [...seeds.keys()]) if (!ONLY.includes(d)) seeds.delete(d);
if (ONLY) for (const d of ONLY) if (!seeds.has(d)) seeds.set(d, { name: siteName(d), source: "--only" });
const fromYC = [...seeds.values()].filter((s) => s.source.startsWith("YC")).length;
console.log(`Companies: ${seeds.size} (${seeds.size - fromYC} from the seed list, ${fromYC} YC companies in India)`);

// ---------------------------------------------------------------- registry
const registry = existsSync(REGISTRY_FILE) ? JSON.parse(readFileSync(REGISTRY_FILE, "utf8")) : {};
// An unreachable site is never cached: on 2026-10-21 a network blip marked 253 of 279 sites
// unreachable in one run, and caching that would have hidden them for a month.
const due = [...seeds.keys()].filter((d) => REDISCOVER || !registry[d] || registry[d].reachable === false ||
  daysSince(registry[d].checked) > REDISCOVER_DAYS);
if (due.length) {
  console.log(`Finding job boards for ${due.length} companies (cached for ${REDISCOVER_DAYS} days after this)...`);
  await pool(due, 8, async (d) => {
    const r = await discover(d, seeds.get(d).name);
    registry[d] = { name: seeds.get(d).name, source: seeds.get(d).source, ...r, checked: new Date().toISOString() };
  });
  mkdirSync(INBOX, { recursive: true });
  writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));
}

// Job platforms whose boards carry their clients' roles, not their own: Weekday's Workable
// had 1,016 postings and Apna's was admission counsellors. Add any such domain here.
const PLATFORMS = new Set(["weekday.works", "apna.co"]);
for (const d of PLATFORMS) seeds.delete(d);

const known = [...seeds.keys()].map((d) => [d, registry[d]]).filter(([, r]) => r);
const readable = known.filter(([, r]) => r.slug && ATS[r.ats]);
const byAts = {};
for (const [, r] of known) { const k = r.ats ?? (r.reachable === false ? "site unreachable" : "no board found"); byAts[k] = (byAts[k] ?? 0) + 1; }
console.log(`Boards: ${readable.length} readable — ` +
  Object.entries(byAts).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(", "));

if (DISCOVER_ONLY) process.exit(0);

// ---------------------------------------------------------------- pull
const all = [];
await pool(readable, 6, async ([domain, r]) => {
  const a = ATS[r.ats];
  const list = a.list(await get(a.api(r.slug), true));
  if (!Array.isArray(list)) return;
  for (const p of list) {
    const n = a.norm(p, r.slug);
    if (n.title) all.push({ ...n, company: r.name, domain, ats: r.ats, companySource: r.source });
  }
});
console.log(`Open postings on those boards: ${all.length}`);

// ---------------------------------------------------------------- filter
const rejects = { nonEng: 0, stale: 0, abroad: 0, keywords: 0, blocked: 0 };
const live = all.filter((j) => {
  if (!isEngTitle(j.title)) { rejects.nonEng++; return false; }
  const age = daysSince(j.posted);
  if (age !== null && age > MAX_AGE_DAYS) { rejects.stale++; return false; }
  // ATS location is a structured field, so it is trusted more than free text: a named city
  // outside India that isn't remote is an onsite-abroad seat (Postman's SF reqs, etc.).
  const loc = j.location ?? "";
  if (!KEEP_BLOCKED && loc && !inIndia(loc) && (!j.remote && !/remote|anywhere|worldwide/i.test(loc) || REMOTE_LOCKED.test(loc))) {
    rejects.abroad++; return false;
  }
  const m = matchKeywords(`${j.title} ${j.text}`);
  if (m.strong.length < 1 && m.weak.length < 2) { rejects.keywords++; return false; }
  const reach = reachability({ text: j.text, location: loc });
  if (reach.status === "blocked" && !KEEP_BLOCKED) { rejects.blocked++; return false; }
  j._m = m; j._reach = reach;
  return true;
});
console.log(`After filters: ${live.length} (rejected — non-eng ${rejects.nonEng}, onsite outside India ${rejects.abroad}, ` +
  `>${MAX_AGE_DAYS}d old ${rejects.stale}, keyword miss ${rejects.keywords}, geography ${rejects.blocked})`);

// ---------------------------------------------------------------- score
const seen = existsSync(SEEN_FILE) ? JSON.parse(readFileSync(SEEN_FILE, "utf8")) : {};
const hits = [];
for (const j of live) {
  if (!IGNORE_SEEN && seen[j.id]) continue;
  const { score, grade, why } = scorePosting({
    title: j.title, text: j.text, matched: j._m, reach: j._reach, ageDays: daysSince(j.posted),
  });
  hits.push({
    id: j.id, grade, score, source: `${j.ats} (${j.companySource})`, company: j.company, domain: j.domain,
    title: j.title, url: j.url, posted: j.posted, location: j.location, reachability: j._reach,
    matched: j._m, why,
  });
  seen[j.id] = new Date().toISOString();
}
hits.sort((a, b) => b.score - a.score);
writeFileSync(SEEN_FILE, JSON.stringify(seen, null, 2));

if (!hits.length) {
  console.log("No new ATS postings since last run.");
  process.exit(0);
}

// A second run the same day appends to the day's file instead of replacing it (yc-scout
// overwrote a 104-hit file this way on 2026-10-21).
const out = join(INBOX, `ats-${today()}.json`);
const prev = existsSync(out) ? JSON.parse(readFileSync(out, "utf8")) : null;
const merged = [...(prev?.hits ?? []).filter((h) => !hits.some((n) => n.id === h.id)), ...hits].sort((a, b) => b.score - a.score);
writeFileSync(out, JSON.stringify({
  pulled: today(), scanned: all.length + (prev?.scanned ?? 0), survived: live.length + (prev?.survived ?? 0), hits: merged,
}, null, 2));
console.log(`\nNEW: ${hits.length} postings → ${out}\n`);

for (const h of hits.filter((h) => "AB".includes(h.grade)).slice(0, 25)) {
  console.log(`[${h.grade}] ${h.company} — ${h.title}\n      ${h.location || "location not stated"} | ${h.source}` +
    `${h.posted ? ` | posted ${daysSince(h.posted)}d ago` : ""}\n      why: ${h.why.join(" · ")}\n      ${h.url}\n`);
}
const grades = hits.reduce((acc, h) => (acc[h.grade] = (acc[h.grade] ?? 0) + 1, acc), {});
console.log(`Grades: ${Object.entries(grades).sort().map(([g, n]) => `${g} ${n}`).join(", ")}`);
console.log("Next: triage the A/B hits into inbox/leads.md and the board (same judgment pass as /board-scout).");
