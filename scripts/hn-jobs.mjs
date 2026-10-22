#!/usr/bin/env node
/**
 * JobOps HN jobs scout — the `tags=job` corpus on hn.algolia.com.
 *
 *   node scripts/hn-jobs.mjs             # last 30 days
 *   node scripts/hn-jobs.mjs --days 60   # wider window
 *   node scripts/hn-jobs.mjs --all       # ignore .hnjobs-seen.json, re-emit everything
 *   node scripts/hn-jobs.mjs --include-us
 *
 * This is a different corpus from scout.mjs, not a different view of the same one. scout.mjs
 * reads *comments* on the monthly "Who is Hiring?" thread. HN also carries first-class **job
 * stories** — the front-page "X (YC W22) Is Hiring" posts, which are their own Algolia tag,
 * never appear as comments, and post continuously rather than once a month. 17k of them
 * exist and JobOps had never looked at one.
 *
 * They are also not covered by yc-scout.mjs: that walks the public job grid, which caps at
 * ~50 per role×location page with no pagination, so a posting can be live and HN-promoted
 * and still never surface there. Measured on 2026-08-01, none of the 13 companies on HN's
 * jobs tab that week appeared in the day's yc-scout output.
 *
 * Most of these URLs point back at ycombinator.com, so the YC path reuses lib/yc-job.mjs
 * verbatim — same visa/experience/ghost-job filters, same score, same grade. Non-YC URLs
 * (the company's own careers page) get the lighter text path: keywords + the shared geo gate.
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { matchKeywords, matchStory, storyPoints } from "./lib/keywords.mjs";
import { seatFit, grade as gradeOf } from "./lib/fit.mjs";
import { reachability } from "./lib/reachability.mjs";
import { ycProps, rejectReason, scoreJob, toHit, ycCompanies, YC } from "./lib/yc-job.mjs";
import { today } from "./lib/today.mjs";
import { writeDayFile } from "./lib/day-file.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INBOX = join(ROOT, "inbox");
const SEEN_FILE = join(INBOX, ".hnjobs-seen.json");

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

const DAYS = Number(opt("days", 30));
const IGNORE_SEEN = flag("all");
const FILTER = { includeUS: flag("include-us"), maxQuietDays: Number(opt("stale", 30)) };

const cutoff = Math.floor(Date.now() / 1000) - DAYS * 86400;

async function algolia(path) {
  const res = await fetch(`https://hn.algolia.com/api/v1/${path}`);
  if (!res.ok) throw new Error(`Algolia ${res.status} on ${path}`);
  return res.json();
}

// 1. Every job story inside the window. Sorted by date, so stop at the first one past it.
const stories = [];
for (let page = 0; ; page++) {
  const data = await algolia(`search_by_date?tags=job&hitsPerPage=100&page=${page}`);
  let done = false;
  for (const h of data.hits) {
    if (h.created_at_i < cutoff) { done = true; break; }
    stories.push(h);
  }
  if (done || page >= data.nbPages - 1) break;
}
console.log(`HN job stories in the last ${DAYS}d: ${stories.length}`);

const seen = existsSync(SEEN_FILE) ? JSON.parse(readFileSync(SEEN_FILE, "utf8")) : {};
const fresh = stories.filter((s) => IGNORE_SEEN || !seen[s.objectID]);
console.log(`New since last run: ${fresh.length}`);

const ycdb = fresh.length ? await ycCompanies() : new Map();

const clean = (html = "") =>
  html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x2F;/g, "/").replace(/&#39;/g, "'")
      .replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ").trim();

const hits = [];
const rejects = { role: 0, visa: 0, exp: 0, "onsite-abroad": 0, quiet: 0, stale: 0, incomplete: 0, keywords: 0, blocked: 0, unreadable: 0, gone: 0 };

/**
 * The lighter path: free text instead of structured fields. Used for a company's own careers
 * page and for HN job stories that carry their body inline with no link at all. No visa or
 * experience fields exist here, so it is keywords + the shared geo gate and nothing more.
 */
function fromText(s, text, url) {
  const hay = `${s.title} ${text}`;
  const { strong, weak } = matchKeywords(hay);
  if (strong.length < 1 && weak.length < 2) { rejects.keywords++; return; }

  const reach = reachability({ text: hay });
  if (reach.status === "blocked") { rejects.blocked++; return; }

  const story = matchStory(hay);
  const seat = seatFit({ title: s.title, text });
  let score = strong.length >= 2 ? 35 : strong.length === 1 ? 25 : 15;
  score += storyPoints(story);
  if (reach.status === "open") score += 10;
  if (/founding|first engineer|early engineer/i.test(s.title)) score += 10;
  score += 10; // no team-size signal available off-platform; same default the YC path uses
  score += seat.delta;

  hits.push({
    id: s.objectID,
    grade: seat.reject ? "F" : gradeOf(score),
    score,
    company: s.title.replace(/\s+[-–(]?\s*(is |Is )?hiring.*$/i, "").trim(),
    title: s.title,
    jobUrl: url,
    matched: { strong, weak },
    reachability: reach,
    why: [
      strong.length ? `stack: ${strong.slice(0, 4).join(", ")}` : `stack (weak): ${weak.slice(0, 3).join(", ")}`,
      story.length ? `story fit (${story.slice(0, 3).join(", ")})` : null,
      `geo: ${reach.status}`,
      seat.reject, ...seat.why,
    ].filter(Boolean),
    source: "hn-jobs-external",
    hnUrl: `https://news.ycombinator.com/item?id=${s.objectID}`,
    hnPosted: s.created_at,
    excerpt: text.slice(0, 400),
  });
}

/**
 * Mark seen only once a posting has actually been judged. A network blip is not a decision:
 * writing it to seen anyway buries the lead permanently on the strength of one failed GET.
 * That is exactly how a live grade-B posting (Tasklet) disappeared during development — its
 * careers page timed out, the title alone missed on keywords, and it was never looked at
 * again. Anything that throws stays unseen and gets retried on the next run.
 */
const decide = (s) => { seen[s.objectID] = new Date().toISOString(); };

for (const s of fresh) {
  const url = s.url;

  // No link at all: HN carries the whole posting as story text. The search index doesn't
  // return that field, so it costs one extra call to /items/{id} — worth it, these are
  // typically the founder writing the ad by hand rather than pasting an ATS link.
  if (!url) {
    let item;
    try { item = await algolia(`items/${s.objectID}`); } catch { rejects.unreadable++; continue; }
    const text = clean(item?.text ?? "");
    if (!text) { rejects.unreadable++; decide(s); continue; }
    fromText(s, text, `https://news.ycombinator.com/item?id=${s.objectID}`);
    decide(s);
    continue;
  }

  const isYC = /ycombinator\.com\/companies\//.test(url);
  if (isYC) {
    // ---- YC path: structured job objects, graded exactly as yc-scout grades them.
    // A 404 here means the posting was filled or pulled since HN promoted it — a correct
    // drop, so it gets its own bucket. A thrown fetch is not a decision; leave it unseen.
    let props;
    try { props = await ycProps(url); } catch { rejects.unreadable++; continue; }
    if (!props) { rejects.gone++; decide(s); continue; }

    // Two URL shapes on the jobs tab: a specific posting (props.job) and a company's whole
    // jobs page (props.jobPostings). The latter needs company fields grafted on, since the
    // grid supplies them per-posting but the company page keeps them one level up.
    let jobs = [];
    if (props.job) jobs = [props.job];
    else if (props.jobPostings?.length) {
      const co = props.company ?? {};
      jobs = props.jobPostings.map((j) => ({
        ...j,
        companyName: j.companyName ?? co.name,
        companyOneLiner: j.companyOneLiner ?? co.one_liner,
        companyBatchName: j.companyBatchName ?? co.batch_name,
        companyUrl: j.companyUrl ?? `/companies/${co.slug}`,
      }));
    }
    if (!jobs.length) { rejects.unreadable++; decide(s); continue; }
    decide(s);

    for (const j of jobs) {
      const why = rejectReason(j, FILTER);
      if (why) { rejects[why]++; continue; }
      const co = ycdb.get((j.companyName ?? "").toLowerCase());
      hits.push(toHit(j, co, scoreJob(j, co, { matchKeywords, matchStory, storyPoints }), {
        source: "hn-jobs",
        hnUrl: `https://news.ycombinator.com/item?id=${s.objectID}`,
        hnTitle: s.title,
        hnPosted: s.created_at,
      }));
    }
  } else {
    // ---- External path: the company's own careers page (Ashby, Greenhouse, bespoke).
    // A title on its own almost never carries enough stack signal to survive the keyword
    // gate, so judging a posting whose body failed to load would be judging nothing. Retry
    // it next run instead of burning it.
    let text = "";
    try {
      const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (JobOps scout)" }, redirect: "follow" });
      if (!res.ok) { rejects.gone++; decide(s); continue; }
      text = clean(await res.text()).slice(0, 20000);
    } catch { rejects.unreadable++; continue; }
    fromText(s, text, url);
    decide(s);
  }
}

hits.sort((a, b) => b.score - a.score);

mkdirSync(INBOX, { recursive: true });
writeFileSync(SEEN_FILE, JSON.stringify(seen, null, 2));

console.log(
  `Filtered: ${hits.length} kept (rejected — non-eng ${rejects.role}, US-visa-gated ${rejects.visa}, ` +
  `too senior ${rejects.exp}, company quiet ${rejects.quiet}, keyword miss ${rejects.keywords}, ` +
  `geography ${rejects.blocked}, posting gone ${rejects.gone}, unreadable ${rejects.unreadable})`
);

if (!hits.length) {
  console.log("No new HN job stories worth a look.");
  process.exit(0);
}

const stamp = today();
const out = join(INBOX, `hnjobs-${stamp}.json`);
writeDayFile(out, { pulled: stamp, windowDays: DAYS, scanned: stories.length }, hits);
console.log(`\nNEW: ${hits.length} postings → ${out}\n`);

for (const h of hits.filter((h) => "ABC".includes(h.grade))) {
  console.log(
    `[${h.grade}] ${h.company}${h.batch ? ` (${h.batch})` : ""}${h.teamSize ? `, ${h.teamSize} people` : ""} — ${h.title}\n` +
    (h.location ? `      ${h.location}\n` : "") +
    (h.visa ? `      visa: ${h.visa} | exp: ${h.minExperience} | ${h.salaryRange ?? "no comp listed"}\n` : "") +
    (h.oneLiner ? `      ${h.oneLiner}\n` : "") +
    `      why: ${h.why.join(" · ")}\n` +
    `      ${h.jobUrl}\n      HN: ${h.hnUrl}\n`
  );
}
const dropped = hits.length - hits.filter((h) => "ABC".includes(h.grade)).length;
if (dropped) console.log(`(${dropped} more graded D/F — in the JSON, not worth printing.)`);
console.log(`Next: /job-scout reads ${out}, does the judgment pass, and writes leads to inbox/leads.md.`);
