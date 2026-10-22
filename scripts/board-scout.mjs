#!/usr/bin/env node
/**
 * JobOps board scout — the channel the pipeline was missing.
 *
 * Diagnosis that produced this file (2026-07-30): of 178 leads ever scouted, 138 came from
 * one source, HN "Who is hiring", which is overwhelmingly US-onsite. 74% of everything
 * graded D/F and geography was a factor in 58% of those. The pipeline wasn't underperforming,
 * it was pointed at a market the candidate mostly can't be hired into.
 *
 * So this pulls two kinds of source HN is not:
 *   remote — boards where "can this person actually take the job" is a structured field
 *            instead of something you discover in paragraph six of a JD. The default.
 *   crypto — opt-in only (`--crypto`). Built for the previous owner's Solidity profile;
 *            Shivam has no web3 work, so it is off by default and scores no story fit.
 *
 * Every posting goes through lib/reachability.mjs before it costs a judgment pass.
 *
 *   node scripts/board-scout.mjs              # remote-first boards, reachable only
 *   node scripts/board-scout.mjs --crypto     # crypto-native boards only (opt-in)
 *   node scripts/board-scout.mjs --remote     # remote-first boards only
 *   node scripts/board-scout.mjs --all        # keep geo-blocked postings too (audit)
 *   node scripts/board-scout.mjs --ignore-seen
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { reachability } from "./lib/reachability.mjs";
import { matchKeywords } from "./lib/keywords.mjs";
import { scorePosting, isEngTitle } from "./lib/board-score.mjs";
import { today } from "./lib/today.mjs";
import { writeDayFile } from "./lib/day-file.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INBOX = join(ROOT, "inbox");
const SEEN_FILE = join(INBOX, ".board-seen.json");

const flag = (n) => process.argv.includes(`--${n}`);
const KEEP_BLOCKED = flag("all");
const IGNORE_SEEN = flag("ignore-seen");
const ONLY = flag("crypto") ? "crypto" : "remote";
const UA = { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) JobOps/1.0" };

const MAX_AGE_DAYS = 30;

// ---------------------------------------------------------------- helpers
const strip = (s = "") =>
  String(s).replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ").trim();

const days = (d) => {
  const t = Date.parse(d);
  return Number.isNaN(t) ? null : Math.floor((Date.now() - t) / 86400000);
};

/** Minimal RSS <item> reader — these feeds are small and well-formed; no dep needed. */
function rssItems(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, block]) => {
    const tag = (t) => {
      const m = block.match(new RegExp(`<${t}(?:[^>]*)>([\\s\\S]*?)</${t}>`));
      return m ? strip(m[1].replace(/<!\[CDATA\[|\]\]>/g, "")) : "";
    };
    return { title: tag("title"), description: tag("description"), link: tag("link") || tag("guid"), pubDate: tag("pubDate") };
  });
}

async function getJSON(url) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
}
async function getText(url) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`${r.status}`);
  return r.text();
}

// ---------------------------------------------------------------- sources
// Each returns normalized postings. Verified reachable 2026-07-30; a source that breaks
// is reported and skipped rather than killing the run — one dead board must never cost
// you the other four.
const SOURCES = [
  {
    name: "cryptocurrencyjobs.co",
    kind: "crypto",
    async fetch() {
      const xml = await getText("https://cryptocurrencyjobs.co/index.xml");
      return rssItems(xml).map((it) => {
        const [role, company] = it.title.split(/\s+at\s+/);
        return {
          id: `ccj:${it.link}`,
          title: role ?? it.title,
          company: company ?? "",
          url: it.link,
          posted: it.pubDate,
          // The description carries the geo wording ("remotely anywhere in Europe").
          location: it.description,
          text: `${it.title} ${it.description}`,
        };
      });
    },
  },
  {
    name: "remoteok.com",
    kind: "remote",
    async fetch() {
      const rows = await getJSON("https://remoteok.com/api");
      return rows.filter((r) => r.id && r.position).map((r) => ({
        id: `rok:${r.id}`,
        title: strip(r.position),
        company: strip(r.company),
        url: r.url || r.apply_url,
        posted: r.date,
        location: r.location ?? "",
        tags: r.tags ?? [],
        text: `${r.position} ${(r.tags ?? []).join(" ")} ${strip(r.description).slice(0, 1500)} ${r.location ?? ""}`,
      }));
    },
  },
  {
    name: "remotive.com",
    kind: "remote",
    async fetch() {
      const { jobs } = await getJSON("https://remotive.com/api/remote-jobs?category=software-dev");
      return jobs.map((j) => ({
        id: `rmv:${j.id}`,
        title: j.title,
        company: j.company_name,
        url: j.url,
        posted: j.publication_date,
        // Remotive's own geo field is a comma-separated region list ("Americas, Europe,
        // Israel" / "Worldwide" / "India"), i.e. the same shape as Himalayas' structured
        // restrictions rather than prose — so it is passed as restrictions, not as text.
        location: j.candidate_required_location ?? "",
        locationRestrictions: (j.candidate_required_location ?? "")
          .split(",").map((x) => x.trim()).filter(Boolean),
        tags: j.tags ?? [],
        text: `${j.title} ${(j.tags ?? []).join(" ")} ${strip(j.description).slice(0, 1500)} ${j.candidate_required_location ?? ""}`,
      }));
    },
  },
  {
    name: "himalayas.app",
    kind: "remote",
    async fetch() {
      // The only source with structured restrictions — reachability uses them directly.
      const { jobs } = await getJSON("https://himalayas.app/jobs/api?limit=500");
      return jobs.map((j) => ({
        id: `him:${j.guid ?? j.title + j.companyName}`,
        title: j.title,
        company: j.companyName,
        url: j.applicationLink || `https://himalayas.app/companies/${j.companySlug}`,
        posted: j.pubDate ?? null,
        location: (j.locationRestrictions ?? []).join(", "),
        locationRestrictions: j.locationRestrictions,
        seniority: j.seniority ?? [],
        tags: j.categories ?? [],
        text: `${j.title} ${(j.categories ?? []).join(" ")} ${strip(j.excerpt ?? "")} ${(j.seniority ?? []).join(" ")}`,
      }));
    },
  },
  {
    name: "weworkremotely.com",
    kind: "remote",
    async fetch() {
      const xml = await getText("https://weworkremotely.com/categories/remote-programming-jobs.rss");
      return rssItems(xml).map((it) => {
        const [company, role] = it.title.split(/\s*:\s*/);
        return {
          id: `wwr:${it.link}`,
          title: role ?? it.title,
          company: company ?? "",
          url: it.link,
          posted: it.pubDate,
          location: it.description,
          text: `${it.title} ${it.description}`,
        };
      });
    },
  },
];

// ---------------------------------------------------------------- pull
const active = SOURCES.filter((s) => !ONLY || s.kind.includes(ONLY));
const all = [];
const sourceOf = new Map();
for (const s of active) {
  try {
    const rows = await s.fetch();
    for (const r of rows) {
      if (sourceOf.has(r.id)) continue;
      sourceOf.set(r.id, s);
      all.push({ ...r, source: s.name, kind: s.kind });
    }
    console.log(`${s.name.padEnd(24)} ${String(rows.length).padStart(4)} postings`);
  } catch (e) {
    console.log(`${s.name.padEnd(24)}  --  unreachable (${e.message}), skipped`);
  }
}
console.log(`Unique postings: ${all.length}`);

// ---------------------------------------------------------------- filter
const rejects = { stale: 0, keywords: 0, blocked: 0, nonEng: 0 };
const blockedBy = {};
// RemoteOK and WWR are general boards, so most of what they return is not an engineering
// role at all. The title test lives in lib/board-score.mjs (isEngTitle).

const live = all.filter((j) => {
  const age = days(j.posted);
  if (age !== null && age > MAX_AGE_DAYS) { rejects.stale++; return false; }
  // A title has to look like an engineering role AND not look like a non-eng one.
  if (!isEngTitle(j.title)) { rejects.nonEng++; return false; }

  const { strong, weak } = matchKeywords(j.text);
  if (strong.length < 1 && weak.length < 2) { rejects.keywords++; return false; }

  const reach = reachability({ text: j.text, location: j.location, locationRestrictions: j.locationRestrictions });
  j._reach = reach;
  j._strong = strong;
  j._weak = weak;
  if (reach.status === "blocked" && !KEEP_BLOCKED) {
    rejects.blocked++;
    blockedBy[reach.reason] = (blockedBy[reach.reason] ?? 0) + 1;
    return false;
  }
  return true;
});

console.log(
  `After filters: ${live.length} (rejected — keyword miss ${rejects.keywords}, ` +
  `non-eng ${rejects.nonEng}, geography ${rejects.blocked}, >${MAX_AGE_DAYS}d old ${rejects.stale})`
);
if (rejects.blocked) {
  const top = Object.entries(blockedBy).sort((a, b) => b[1] - a[1]).slice(0, 5);
  console.log(`  geo walls hit: ${top.map(([r, n]) => `${r} ×${n}`).join(", ")}`);
}

// ---------------------------------------------------------------- score
// Mechanical only. The /board-scout skill does the judgment pass on top, same as YC.
const seen = existsSync(SEEN_FILE) ? JSON.parse(readFileSync(SEEN_FILE, "utf8")) : {};
const hits = [];

for (const j of live) {
  if (!IGNORE_SEEN && seen[j.id]) continue;
  const { _strong: strong, _weak: weak, _reach: reach } = j;
  // Scoring lives in lib/board-score.mjs, shared with ats-scout.mjs.
  // Only a genuinely crypto-native board earns the bonus, and RemoteOK only when the posting
  // itself is crypto — it is a general board that merely carries some web3 roles.
  const crypto = j.source === "cryptocurrencyjobs.co";
  const { score, grade, why } = scorePosting({
    title: j.title, text: j.text ?? "", matched: { strong, weak }, reach, ageDays: days(j.posted),
    bonus: crypto ? 6 : 0, bonusWhy: crypto ? "crypto-native board" : "",
  });
  hits.push({
    id: j.id, grade, score, source: j.source, kind: j.kind,
    company: j.company, title: j.title, url: j.url, posted: j.posted,
    location: j.location, reachability: reach, tags: (j.tags ?? []).slice(0, 8),
    matched: { strong, weak }, why,
  });
  seen[j.id] = new Date().toISOString();
}

hits.sort((a, b) => b.score - a.score);

// ---------------------------------------------------------------- write
mkdirSync(INBOX, { recursive: true });
const stamp = today();
writeFileSync(SEEN_FILE, JSON.stringify(seen, null, 2));

if (!hits.length) {
  console.log("\nNo new board postings since last run.");
  process.exit(0);
}

const out = join(INBOX, `boards-${stamp}.json`);
writeDayFile(out, { pulled: stamp, scanned: all.length, survived: live.length }, hits);
console.log(`\nNEW: ${hits.length} postings → ${out}\n`);

for (const h of hits.filter((h) => "ABC".includes(h.grade)).slice(0, 20)) {
  console.log(`[${h.grade}] ${h.company || "?"} — ${h.title}`);
  console.log(`      ${h.source} · ${h.location?.slice(0, 60) || "location not stated"}`);
  console.log(`      why: ${h.why.join(" · ")}`);
  console.log(`      ${h.url}`);
}
const rest = hits.filter((h) => "DF".includes(h.grade)).length;
if (rest) console.log(`(+ ${rest} D/F postings in the JSON, not shown)`);
console.log(`\nNext: /board-scout reads ${out}, does the judgment pass, writes leads to inbox/leads.md.`);
