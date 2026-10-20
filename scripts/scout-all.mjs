#!/usr/bin/env node
/**
 * Run every scriptable scout, in one command, without skipping any.
 *
 * "Start all the scouts" has to mean all of them. Before this existed, a morning run meant
 * remembering four commands and three browser skills, and the browser ones were the ones
 * that got dropped — which is how the warm channel ended up 1.4% built while HN got scouted
 * every single day.
 *
 * This half is the scriptable half. It is deliberately fault-tolerant: a scout that throws
 * is reported and the run continues, because one dead source must never cost you the rest.
 *
 * The BROWSER half (X, LinkedIn, network) cannot be scripted — it needs Shivam's logged-in
 * session and per-post judgment, and the hard rules in linkedin-scout/SKILL.md forbid
 * automating it. The /all-scouts skill drives those, and prints them as a checklist here so
 * a run that stops early is visibly incomplete rather than silently partial.
 *
 *   node scripts/scout-all.mjs           # every scriptable scout
 *   node scripts/scout-all.mjs --quick   # skip the slow YC full-JD pass
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const QUICK = process.argv.includes("--quick");

const SCOUTS = [
  { name: "HN Who is Hiring", script: "scout.mjs", args: [], why: "the original channel, now geo-filtered" },
  { name: "HN job stories", script: "hn-jobs.mjs", args: [], why: "hn.algolia.com tags=job — the front-page 'X (YC W22) Is Hiring' posts, a separate corpus from the monthly thread" },
  { name: "Remote boards", script: "board-scout.mjs", args: [], why: "4 sources: RemoteOK, Remotive, Himalayas, WWR (crypto board is opt-in: --crypto)" },
  { name: "YC job grid", script: "yc-scout.mjs", args: QUICK ? [] : ["--fresh"], why: "public grid, visa + ghost-job filtered" },
  { name: "Funding signals", script: "signal-scout.mjs", args: [], why: "Inc42/YourStory/Blume, ahead of any posting" },
];

const BROWSER_SCOUTS = [
  ["/x-scout", "hiring-intent search + L1/L2/L3 triage + the warm channel"],
  ["/linkedin-scout", "content search (the jobs tab returns noise), 3 lenses"],
  ["/network-scout", "warm referral paths — the highest-conversion channel and the least built"],
];

const results = [];
const started = Date.now();

for (const s of SCOUTS) {
  const bar = "─".repeat(Math.max(0, 66 - s.name.length));
  console.log(`\n\x1b[1m── ${s.name} ${bar}\x1b[0m`);
  console.log(`   ${s.why}\n`);
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [join(HERE, s.script), ...s.args], {
    stdio: "inherit",
    timeout: 5 * 60 * 1000,
  });
  const secs = ((Date.now() - t0) / 1000).toFixed(0);
  if (r.error?.code === "ETIMEDOUT") {
    results.push({ ...s, status: "timeout", secs });
    console.log(`\n   \x1b[33m! timed out after ${secs}s, continuing\x1b[0m`);
  } else if (r.status !== 0) {
    results.push({ ...s, status: "failed", secs });
    console.log(`\n   \x1b[31m! exited ${r.status} after ${secs}s, continuing\x1b[0m`);
  } else {
    results.push({ ...s, status: "ok", secs });
  }
}

// ---------------------------------------------------------------- summary
console.log(`\n\n\x1b[1m${"═".repeat(70)}\x1b[0m`);
console.log(`\x1b[1mSCRIPTABLE SCOUTS — ${((Date.now() - started) / 1000).toFixed(0)}s total\x1b[0m\n`);
for (const r of results) {
  const mark = r.status === "ok" ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m";
  console.log(`  ${mark} ${r.name.padEnd(28)} ${r.status.padEnd(8)} ${r.secs}s`);
}

const failed = results.filter((r) => r.status !== "ok");
if (failed.length) {
  console.log(`\n  \x1b[33m${failed.length} scout(s) did not complete — say so in the summary, do not quietly drop them.\x1b[0m`);
}

// A run that exits 0 having found nothing looks identical to a healthy one, which is how a
// dead source stays invisible for a week. The yield report puts today's numbers next to the
// last fortnight's, so a taper (the HN thread mid-month) reads differently from a breakage.
console.log(`\n\x1b[1mCHANNEL HEALTH — last 7 days\x1b[0m`);
spawnSync(process.execPath, [join(HERE, "scout-yield.mjs"), "--days", "7"], { stdio: "inherit" });

console.log(`\n\x1b[1mSTILL TO RUN — browser channels, not scriptable\x1b[0m`);
console.log(`  These need the logged-in Chrome session and per-post judgment. Skipping one`);
console.log(`  makes the run incomplete, and they are where the warm leads actually are.\n`);
for (const [cmd, why] of BROWSER_SCOUTS) console.log(`  ☐ ${cmd.padEnd(18)} ${why}`);
console.log(`\n  Then: triage new A/B leads, and for any A grade offer the /job-video pipeline.`);
console.log(`\x1b[1m${"═".repeat(70)}\x1b[0m\n`);

process.exit(0);
