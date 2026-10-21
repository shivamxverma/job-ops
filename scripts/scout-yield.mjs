#!/usr/bin/env node
/**
 * scout-yield.mjs — channel health over time, from the scout outputs already on disk.
 *
 *   node scripts/scout-yield.mjs            # last 14 days
 *   node scripts/scout-yield.mjs --days 30
 *   node scripts/scout-yield.mjs --json
 *
 * "We're not getting many postings the last few days — or is it just the market?" was not
 * answerable before this: every scout printed its own run and nothing kept score, so a channel
 * that had quietly died looked exactly like a channel having a slow week.
 *
 * The distinction this makes visible is **scanned vs. new**. A source that scans 226 postings
 * and yields 1 lead is not broken — it is saturated, because the other 12 that passed the
 * filters were already seen on previous days. A source whose *scanned* count collapses is a
 * different problem entirely: the scrape broke, or the corpus really did dry up.
 *
 * Read it that way:
 *   scanned holds steady, new → 0   the source is saturated; widen it or accept its rate
 *   scanned collapses               the scrape broke, or the corpus is genuinely empty
 *   new holds, A/B → 0              the source still posts, but not roles Shivam can take
 *
 * The known shape of this pipeline, measured 2026-08-15: the HN monthly thread is a *burst*
 * source — 23-37 hits/day in the first week of the thread, 1-3/day by mid-month, resetting
 * when the September thread opens. It carried 138 of the first 178 leads, so when it tapers
 * the whole pipeline looks dead unless the other channels are being watched separately.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./lib/state.mjs";
import { today, daysFromNow } from "./lib/today.mjs";

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const days = Number((args[args.indexOf("--days") + 1] || "").match(/^\d+$/)?.[0] || 14);
const since = daysFromNow(-days + 1);

const INBOX = join(ROOT, "inbox");
if (!existsSync(INBOX)) { console.log("No inbox/ yet."); process.exit(0); }

/**
 * Each scout writes `{prefix}-YYYY-MM-DD.json`; the prefix is the channel.
 *
 * `graded: false` matters. scout.mjs (the HN monthly thread) deliberately does not score its
 * hits — grading is the /job-scout judgment pass, which reads the JSON afterwards. So an A/B
 * count of 0 on that channel means "this script never assigns grades", not "nothing good came
 * through". Reporting those as a real zero would libel the pipeline's highest-volume source.
 */
const CHANNELS = {
  hn: { label: "HN thread", graded: false, note: "monthly Who-is-hiring thread — a burst source, tapers mid-month" },
  hnjobs: { label: "HN job stories", graded: true, note: "tags=job front-page posts, continuous" },
  boards: { label: "Crypto/remote boards", graded: true, note: "5 boards; saturates fast, watch scanned not new" },
  yc: { label: "YC job grid", graded: true, note: "public grid, visa + ghost-job filtered" },
  ats: { label: "Indian startup boards", graded: true, note: "company ATS boards; coverage grows with scripts/data/india-startups.txt" },
};

const rows = [];
for (const f of readdirSync(INBOX)) {
  const m = f.match(/^([a-z]+)-(\d{4}-\d{2}-\d{2})\.json$/);
  if (!m || !CHANNELS[m[1]] || m[2] < since) continue;
  let j;
  try { j = JSON.parse(readFileSync(join(INBOX, f), "utf8")); } catch { continue; }
  const hits = j.hits || [];
  const grades = hits.reduce((acc, h) => (acc[h.grade || "?"] = (acc[h.grade || "?"] || 0) + 1, acc), {});
  rows.push({
    channel: m[1], date: m[2],
    scanned: j.scanned ?? null,
    passed: j.survived ?? null,
    fresh: hits.length,
    ab: (grades.A || 0) + (grades.B || 0),
    grades,
  });
}

if (asJson) { console.log(JSON.stringify({ since, through: today(), rows }, null, 1)); process.exit(0); }

if (!rows.length) { console.log(`No scout output in the last ${days} days.`); process.exit(0); }

const chans = Object.keys(CHANNELS).filter((c) => rows.some((r) => r.channel === c));

console.log(`Scout yield, ${since} → ${today()} (${days}d)\n`);
console.log("  scanned = pulled from the source · new = not seen before · A/B = worth working\n");

const W = 22;
for (const c of chans) {
  const mine = rows.filter((r) => r.channel === c).sort((a, b) => a.date.localeCompare(b.date));
  const tot = mine.reduce((a, r) => ({
    scanned: a.scanned + (r.scanned || 0), fresh: a.fresh + r.fresh, ab: a.ab + r.ab,
  }), { scanned: 0, fresh: 0, ab: 0 });
  console.log(`\x1b[1m${CHANNELS[c].label}\x1b[0m — ${CHANNELS[c].note}`);
  const abTot = CHANNELS[c].graded ? `${tot.ab} A/B` : "ungraded here (the /job-scout judgment pass grades this one)";
  console.log(`  ${mine.length} run${mine.length === 1 ? "" : "s"} · ${tot.scanned} scanned · ${tot.fresh} new · ${abTot}`);
  // A compact per-day strip: date, new, and a bar so a taper is visible at a glance.
  const max = Math.max(1, ...mine.map((r) => r.fresh));
  for (const r of mine) {
    const bar = "█".repeat(Math.round((r.fresh / max) * 18));
    const ab = CHANNELS[c].graded && r.ab ? ` \x1b[32m${r.ab} A/B\x1b[0m` : "";
    const sc = r.scanned != null ? `${String(r.scanned).padStart(4)} scanned →` : "".padStart(14);
    console.log(`    ${r.date}  ${sc} ${String(r.fresh).padStart(3)} new  ${bar}${ab}`);
  }
  console.log("");
}

// The one-line verdict per channel, so a dead source is called out rather than inferred.
console.log("\x1b[1mVerdict\x1b[0m");
for (const c of chans) {
  const mine = rows.filter((r) => r.channel === c).sort((a, b) => a.date.localeCompare(b.date));
  const recent = mine.slice(-3), earlier = mine.slice(0, -3);
  const avg = (xs, k) => (xs.length ? xs.reduce((a, r) => a + (r[k] || 0), 0) / xs.length : 0);
  const newNow = avg(recent, "fresh"), newBefore = avg(earlier, "fresh");
  const scanNow = avg(recent, "scanned"), scanBefore = avg(earlier, "scanned");
  let verdict;
  if (scanBefore > 20 && scanNow < scanBefore * 0.4) verdict = "\x1b[31mscanned count collapsed — check the scrape\x1b[0m";
  else if (newBefore > 1.5 && newNow < newBefore * 0.4) verdict = "\x1b[33msaturated: still scanning fine, but repeats what it already showed\x1b[0m";
  else if (CHANNELS[c].graded && avg(mine, "ab") === 0) verdict = "\x1b[33mposting, but nothing graded A/B in this window\x1b[0m";
  else verdict = "\x1b[32mhealthy\x1b[0m";
  console.log(`  ${CHANNELS[c].label.padEnd(W)} ${verdict}`);
}
console.log(`\n  Browser channels (/x-scout, /linkedin-scout, /network-scout) leave no JSON, so they\n  cannot appear here — an empty week there is invisible to this report by construction.`);
