#!/usr/bin/env node
/**
 * JobOps YC scout — pulls live YC job postings from ycombinator.com/jobs, hard-filters
 * them against Shivam's constraints, pre-scores what survives, and writes hits to inbox/.
 *
 *   node scripts/yc-scout.mjs                 # eng roles, visa-open only
 *   node scripts/yc-scout.mjs --all-roles     # every role category, not just engineering
 *   node scripts/yc-scout.mjs --include-us    # keep "US citizen/visa only" postings too
 *   node scripts/yc-scout.mjs --stale 60      # allow companies quiet up to 60d (default 30)
 *   node scripts/yc-scout.mjs --fresh         # only postings created in the last 30 days
 *   node scripts/yc-scout.mjs --all           # ignore .yc-seen.json, re-emit everything
 *
 * Why this works without a login: /jobs/role/{role}/{location} is server-rendered with an
 * Inertia `data-page` attribute carrying the full job objects — including the three fields
 * no job board shows you up front: `visa`, `minExperience`, and `lastActive` (when the
 * company last signed into Work at a Startup). Those are the whole filter.
 *
 * The Apply button behind these postings goes to workatastartup.com, which DOES need a
 * login and burns one of Shivam's 5 weekly WaaS applications — see profile/learnings.md.
 * Scouting here is free; applying is not. This script never applies to anything.
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { matchKeywords, matchStory, storyPoints } from "./lib/keywords.mjs";
import { YC, ycProps, toDays, minYears, rejectReason, scoreJob, toHit, ycCompanies } from "./lib/yc-job.mjs";
import { today } from "./lib/today.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INBOX = join(ROOT, "inbox");
const SEEN_FILE = join(INBOX, ".yc-seen.json");

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

const ALL_ROLES = flag("all-roles");
const INCLUDE_US = flag("include-us");
const FRESH_ONLY = flag("fresh");
const IGNORE_SEEN = flag("all");
const MAX_QUIET_DAYS = Number(opt("stale", 30));

// The grid. Each page caps at ~50 postings with no working pagination, so coverage comes
// from fanning out over role x location slugs and deduping by job id. Location slugs are
// the ones YC itself links in the sidebar — anything else silently falls back to unfiltered.
const ROLES = ALL_ROLES ? ["all"] : ["all", "software-engineer"];
const LOCATIONS = ["", "/remote", "/india", "/san-francisco", "/new-york", "/boston", "/austin", "/seattle", "/los-angeles"];

// Keyword tiers live in scripts/lib/keywords.mjs — one strong hit, or two weak, to count as
// stack fit. This file used to keep its own copies and match them with includes(), which
// diverged from the shared lists AND scored substrings (`rag` inside *storage*, `api` inside
// *rapid*). Do not reintroduce a local list; edit keywords.mjs so every scout moves together.

// The Inertia scrape, the "about 2 months" parser, the hard filters and the score all live
// in lib/yc-job.mjs so hn-jobs.mjs grades the same posting the same way. Don't re-inline them.

console.log(`Fetching ${ROLES.length * LOCATIONS.length} YC job pages...`);
const byId = new Map();
for (const role of ROLES) {
  for (const loc of LOCATIONS) {
    const p = await ycProps(`${YC}/jobs/role/${role}${loc}`);
    for (const j of p?.jobPostings ?? []) byId.set(j.id, j);
  }
}
const all = [...byId.values()];
console.log(`Unique postings: ${all.length}`);

// ---- Hard filters: the things that make a posting unwinnable regardless of how good it looks.
const FILTER = { allRoles: ALL_ROLES, includeUS: INCLUDE_US, maxQuietDays: MAX_QUIET_DAYS, freshOnly: FRESH_ONLY };
const rejects = { role: 0, visa: 0, exp: 0, "onsite-abroad": 0, quiet: 0, stale: 0, incomplete: 0 };
const live = all.filter((j) => {
  const why = rejectReason(j, FILTER);
  if (why) { rejects[why]++; return false; }
  return true;
});
console.log(
  `After filters: ${live.length} (rejected — non-eng ${rejects.role}, US-visa-gated ${rejects.visa}, ` +
  `too senior ${rejects.exp}, onsite outside India ${rejects["onsite-abroad"]}, company quiet >${MAX_QUIET_DAYS}d ${rejects.quiet}` +
  (FRESH_ONLY ? `, posting >30d old ${rejects.stale}` : "") + `, incomplete ${rejects.incomplete})`
);

// ---- Enrich from the yc-oss mirror of YC's own Algolia index: team size, stage, tags.
const ycdb = await ycCompanies();
console.log(ycdb.size ? `Enrichment: ${ycdb.size} YC companies flagged hiring.`
                      : "Enrichment: yc-oss unreachable, continuing without it.");

// ---- Score. Mechanical only — the /yc-scout skill does the judgment pass on top.
const seen = existsSync(SEEN_FILE) ? JSON.parse(readFileSync(SEEN_FILE, "utf8")) : {};
const hits = [];

for (const j of live) {
  if (!IGNORE_SEEN && seen[j.id]) continue;
  const co = ycdb.get((j.companyName ?? "").toLowerCase());
  hits.push(toHit(j, co, scoreJob(j, co, { matchKeywords, matchStory, storyPoints }), { source: "yc-grid" }));
  seen[j.id] = new Date().toISOString();
}

hits.sort((a, b) => b.score - a.score);

mkdirSync(INBOX, { recursive: true });
const stamp = today();
writeFileSync(SEEN_FILE, JSON.stringify(seen, null, 2));

if (!hits.length) {
  console.log("No new YC postings since last run.");
  process.exit(0);
}

const out = join(INBOX, `yc-${stamp}.json`);
writeFileSync(out, JSON.stringify({ pulled: stamp, scanned: all.length, survived: live.length, hits }, null, 2));
console.log(`\nNEW: ${hits.length} postings → ${out}\n`);

for (const h of hits.filter((h) => "ABC".includes(h.grade))) {
  console.log(
    `[${h.grade}] ${h.company} (${h.batch})${h.teamSize ? `, ${h.teamSize} people` : ""} — ${h.title}\n` +
    `      ${h.location}\n` +
    `      visa: ${h.visa} | exp: ${h.minExperience} | ${h.salaryRange ?? "no comp listed"}` +
    `${h.equityRange ? ` + ${h.equityRange}` : ""}\n` +
    `      posted ${h.createdAt} ago, company active ${h.lastActive} ago\n` +
    `      ${h.oneLiner}\n` +
    `      why: ${h.why.join(" · ")}\n` +
    `      ${h.jobUrl}\n`
  );
}
const dropped = hits.length - hits.filter((h) => "ABC".includes(h.grade)).length;
if (dropped) console.log(`(${dropped} more graded D/F — in the JSON, not worth printing.)`);
console.log(`Next: /yc-scout reads ${out}, does the judgment pass, and writes leads to inbox/leads.md.`);
