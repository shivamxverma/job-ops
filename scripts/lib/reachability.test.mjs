#!/usr/bin/env node
/**
 * Backtest for the reachability filter.
 *
 * Two parts:
 *  1. Hand-written cases, each taken from a real line in inbox/leads.md.
 *  2. A backtest over every graded lead in inbox/leads.md — the point is to confirm the
 *     filter does not blow away A/B leads. A false "blocked" on a good lead is the only
 *     expensive error here; a D lead surviving to the judgment pass costs nothing.
 *
 *   node scripts/lib/reachability.test.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { reachability } from "./reachability.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const CASES = [
  ["ONSITE San Francisco, no remote option", "blocked"],
  ["Remote (US) only", "blocked"],
  ["Remote is Americas & Europe only, excludes India", "blocked"],
  ["Hybrid Bay Area 1-2x/wk onsite, no US visa sponsorship", "blocked"],
  ["US citizen/visa only", "blocked"],
  ["We do not sponsor visas", "blocked"],
  ["Remote, Americas and Europe only", "blocked"],
  ["ONSITE Manhattan 4 days/wk", "blocked"],
  ["Remote (US, SF preferred) only", "blocked"],
  ["Hybrid work from Lviv, in-person collaboration days", "blocked"], // "unknown" under the previous owner, who would relocate
  ["Remote (India-based), founding equity", "open"],
  ["Remote Worldwide, full-time", "open"],
  ["Hybrid - Mumbai / Remote (India)", "open"],
  ["Will sponsor work authorization, onsite New York", "blocked"],
  ["This is an in-person role in London. We sponsor visas for the right person.", "blocked"],
  ["Onsite Bengaluru, 5 days a week", "open"],
  ["remote, paid, top Indian fintechs are paying users", "open"],
  ["Agent-trace capture and eval infra. Apply at jobs@geteon.ai", "unknown"],
  ["Full Stack Engineer, React/Next + Node/Python, Remote-India", "open"],
  ["Remote worldwide. Solidity, Node, blockchain.", "open"],
  // First run on Shivam's profile, 2026-09-29: each of these read "open" before the tier reorder.
  ["Remote. Work from anywhere within US time zones (GMT-5 to GMT-10)", "blocked"],
  ["Headquarters: Remote, United States. Remote - US. A fully distributed team.", "blocked"],
  ["REMOTE (anywhere, EST hours) | Full-time contractor", "blocked"],
  ["Full Stack AI Engineer | Remote(Everywhere) | Full-time", "open"],
  ["Cloud / Platform Engineer | REMOTE (SF Bay Area, CA, US · Bengaluru, KA, India)", "open"],
  ["Backend Software Engineer | Remote (Global) | worldwide remote", "open"],
  ["We are a fully distributed team across 12 countries", "open"],
  ["GovStar | Remote (U.S. — Eastern/Central Time) | AI, Full Stack | U.S. Citizens", "blocked"],
  ["Telli (YC F24) is hiring engineers and designers [Berlin, on-site]", "blocked"],
  ["Acme is hiring engineers (Berlin, on-site or remote)", "unknown"],
];

let pass = 0;
const fails = [];
for (const [text, expected] of CASES) {
  const r = reachability({ text });
  if (r.status === expected) pass++;
  else fails.push({ text, expected, got: r });
}
console.log(`unit cases: ${pass}/${CASES.length}`);
for (const f of fails) console.log(`  FAIL  want ${f.expected}, got ${f.got.status} (${f.got.reason})  <- ${f.text}`);

// ---- Backtest over the real corpus.
// Each corpus is judged by its owner's own policy: the live file by Shivam's (India or remote
// only), the previous owner's graded history by his (would relocate with sponsorship). Grades
// are only meaningful against the policy they were given under.
const CORPORA = [
  [join(ROOT, "inbox", "leads.md"), { relocateAbroad: false }],
  [join(ROOT, "_archive-harsh", "inbox", "leads.md"), { relocateAbroad: true }],
];
const leads = CORPORA.filter(([f]) => existsSync(f)).flatMap(([f, policy]) =>
  readFileSync(f, "utf8")
    .split("\n")
    .filter((l) => l.startsWith("- ["))
    .map((l) => ({ grade: (l.match(/\| \**([A-F])\** \| posted/) || [])[1], line: l, policy }))
    .filter((l) => l.grade));

const tally = {};
for (const { grade, line, policy } of leads) {
  const s = reachability({ text: line }, policy).status;
  (tally[grade] ??= { open: 0, blocked: 0, unknown: 0 })[s]++;
}

console.log("\nbacktest over inbox/leads.md (grade -> what the filter would have done):");
console.log("  grade   open  blocked  unknown   total");
for (const g of ["A", "B", "C", "D", "F"]) {
  const t = tally[g];
  if (!t) continue;
  const total = t.open + t.blocked + t.unknown;
  console.log(`    ${g}    ${String(t.open).padStart(5)} ${String(t.blocked).padStart(8)} ${String(t.unknown).padStart(8)} ${String(total).padStart(7)}`);
}

const good = ["A", "B"].reduce((n, g) => n + (tally[g]?.blocked ?? 0), 0);
const goodTotal = ["A", "B"].reduce((n, g) => {
  const t = tally[g];
  return n + (t ? t.open + t.blocked + t.unknown : 0);
}, 0);
const junkDropped = ["D", "F"].reduce((n, g) => n + (tally[g]?.blocked ?? 0), 0);
const junkTotal = ["D", "F"].reduce((n, g) => {
  const t = tally[g];
  return n + (t ? t.open + t.blocked + t.unknown : 0);
}, 0);

console.log(`\n  A/B leads the filter would have wrongly dropped: ${good}/${goodTotal}  <- must stay at 0`);
console.log(`  D/F leads dropped before costing a judgment pass: ${junkDropped}/${junkTotal} (${Math.round((100 * junkDropped) / junkTotal)}%)`);

if (fails.length || good > 0) {
  console.log("\nFAILED");
  process.exit(1);
}
console.log("\nOK");
