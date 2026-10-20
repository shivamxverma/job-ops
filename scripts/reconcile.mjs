#!/usr/bin/env node
/**
 * reconcile.mjs — find every place where leads.md, tracker.md, applications/ and the GitHub
 * issue board disagree, and fix the ones that can be fixed safely.
 *
 *   node scripts/reconcile.mjs              # report only (safe, read-only, no network writes)
 *   node scripts/reconcile.mjs --fix        # apply the auto-fixable drift
 *   node scripts/reconcile.mjs --fix --no-issues   # local files only, never touch GitHub
 *   node scripts/reconcile.mjs --refresh    # pull fresh issue states from gh first
 *   node scripts/reconcile.mjs --json       # machine-readable, for the dashboard/CI
 *
 * Why this exists: on 2026-08-14 the issue board had to be swept by hand — 80 issues closed in
 * one batch at 19:29 UTC — because nothing ever told Shivam which of them were already decided.
 * That sweep is the work this script replaces. Drift is not a one-time mess to clean; it is
 * produced continuously by the pipeline (a lead gets applied to, a folder gets built, a reply
 * arrives) and every store records it at a different moment, or not at all.
 *
 * WHAT IT FIXES AUTOMATICALLY (only where the evidence is one-directional):
 *   stale-open-issue  — a lead is decided but its GitHub issue is still open → close it, with
 *                       the reason the decision implies (completed vs. not planned).
 *   lead-not-marked   — the tracker says an application went out but leads.md still shows [ ]
 *                       → set [d] (or [x] when the decision was to skip) and stamp the date.
 * Both directions are safe because the tracker only ever records work that actually happened,
 * so it can promote a lead's state but never retract one. The reverse fix — reopening an issue
 * or clearing a box — is deliberately not implemented: that would let a parsing bug silently
 * undo a real decision.
 *
 * WHAT IT ONLY REPORTS (a human has to decide):
 *   duplicate-tracker-row, folder-without-tracker-row, tracker-row-without-folder,
 *   unparseable-status, unclocked-follow-up, orphan-issue, duplicate-folder.
 * Each of those means two sources disagree about a fact, and picking a winner needs context
 * this script does not have. It prints the exact command or edit to make instead.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { loadState, driftByType, refreshIssues, ROOT, TODAY } from "./lib/state.mjs";

const args = process.argv.slice(2);
const doFix = args.includes("--fix");
const asJson = args.includes("--json");
const quiet = args.includes("--quiet");
// Closing an issue is the only thing here that reaches outside the repo. --no-issues keeps a
// fix run entirely local, for offline work or when the GitHub side wants a human's eyes first.
const noIssues = args.includes("--no-issues");

if (args.includes("--refresh")) {
  try {
    const { issues } = refreshIssues();
    if (!asJson) console.log(`Refreshed issue cache: ${issues.length} issues.\n`);
  } catch (e) {
    console.warn(`WARNING: could not refresh issues (${(e.message || "").split("\n")[0]}). Using the cached copy.\n`);
  }
}

const state = loadState();
const grouped = driftByType(state.drift);

if (asJson) {
  console.log(JSON.stringify({ today: state.today, refreshed: state.refreshed, drift: state.drift }, null, 1));
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
/** What a human should do about each drift type, when the script won't do it itself. */
const REMEDY = {
  "duplicate-tracker-row": "merge the rows in applications/tracker.md by hand — keep the furthest-along status, fold the other row's notes into it",
  "folder-without-tracker-row": "real work with no record: add a tracker row (CLAUDE.md step 7 — folder-complete = applied, status `sent`, follow-up +7d)",
  "tracker-row-without-folder": "a row with nothing behind it: confirm the company name matches its folder, or add it to ALIASES in scripts/lib/state.mjs",
  "unparseable-status": "rewrite the status cell to start with a known status word (see STATUSES in scripts/lib/state.mjs); keep the prose in the notes column",
  "unclocked-follow-up": "put a real date in the follow-up column so the queue can fire; the prose belongs in notes",
  "orphan-issue": "an issue with no lead line: triage it into inbox/leads.md, or close it as not planned",
  "duplicate-folder": "two folders for one company — merge them",
};
const ORDER = ["stale-open-issue", "lead-not-marked", "duplicate-tracker-row", "folder-without-tracker-row",
  "unparseable-status", "unclocked-follow-up", "tracker-row-without-folder", "orphan-issue", "duplicate-folder"];

const types = Object.keys(grouped).sort((a, b) => (ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99));

if (!state.drift.length) {
  console.log("✓ No drift. leads.md, tracker.md, applications/ and the issue board all agree.");
} else if (!quiet) {
  const fixable = state.drift.filter((d) => d.fixable).length;
  console.log(`${state.drift.length} drift item${state.drift.length > 1 ? "s" : ""} across ${state.companies.size} companies` +
    ` — ${fixable} auto-fixable, ${state.drift.length - fixable} need a human.\n`);
  for (const t of types) {
    const items = grouped[t];
    const auto = items.some((i) => i.fixable);
    console.log(`## ${t} (${items.length})${auto ? "  [--fix handles these]" : ""}`);
    if (!auto && REMEDY[t]) console.log(`   → ${REMEDY[t]}`);
    for (const i of items) console.log(`   • ${i.company}: ${i.detail}`);
    console.log("");
  }
}

// ---------------------------------------------------------------------------
// Fix
// ---------------------------------------------------------------------------
if (!doFix) {
  if (state.drift.some((d) => d.fixable)) console.log("Run with --fix to apply the auto-fixable items.");
  process.exit(0);
}

const today = TODAY();
const LEADS = join(ROOT, "inbox", "leads.md");
let lines = readFileSync(LEADS, "utf8").split("\n");
let leadEdits = 0, issuesClosed = 0, issueFails = 0;

// -- leads.md box marks -----------------------------------------------------
// Every edit rewrites one existing line in place, so line numbers never shift and the whole
// batch can be applied from the single snapshot the state load already produced.
for (const d of state.drift.filter((x) => x.fix?.markLead)) {
  const i = d.fix.leadLine;
  const m = lines[i].match(/^(\s*- \[)([^\]])(\] \*\*.+?\*\*)(.*)$/);
  if (!m) { console.warn(`   ! leads.md line ${i + 1} no longer parses — skipped`); continue; }
  const stamp = d.fix.markLead === "x" ? "✗ skipped" : "✓ processed";
  const tail = m[4].replace(/\s*\|\s*[✓✗→] (?:processed|skipped|promoted) \d{4}-\d{2}-\d{2}\s*$/, "");
  lines[i] = `${m[1]}${d.fix.markLead}${m[3]}${tail} | ${stamp} ${today}`;
  console.log(`   [${d.fix.markLead}] ${d.company} (leads.md line ${i + 1})`);
  leadEdits++;
}
if (leadEdits) writeFileSync(LEADS, lines.join("\n"));

// -- GitHub issues ----------------------------------------------------------
// A GitHub failure must never roll back a local mark — same rule mark-processed.mjs follows.
const issueFixes = state.drift.filter((x) => x.fix?.closeIssue);
if (noIssues && issueFixes.length) {
  console.log(`   (--no-issues) skipped ${issueFixes.length} issue close${issueFixes.length === 1 ? "" : "s"}: ` +
    issueFixes.map((d) => `#${d.fix.closeIssue}`).join(", "));
}
for (const d of noIssues ? [] : issueFixes) {
  const { closeIssue: n, reason } = d.fix;
  try {
    execFileSync("gh", ["issue", "close", String(n), "--reason", reason,
      "--comment", `Reconciled via JobOps (${today}): ${d.detail}.`], { stdio: "pipe", cwd: ROOT });
    console.log(`   closed issue #${n} as "${reason}" — ${d.company}`);
    issuesClosed++;
  } catch (e) {
    console.warn(`   ! issue #${n} (${d.company}): ${(e.message || "").split("\n")[0]} — fix by hand: gh issue close ${n} --reason ${reason}`);
    issueFails++;
  }
}

console.log(`\n✓ ${leadEdits} lead mark${leadEdits === 1 ? "" : "s"}, ${issuesClosed} issue${issuesClosed === 1 ? "" : "s"} closed` +
  `${issueFails ? `, ${issueFails} issue failure${issueFails === 1 ? "" : "s"}` : ""}.`);
if (issuesClosed) {
  try { refreshIssues(); console.log("  issue cache refreshed."); } catch { /* cache is advisory */ }
}
const left = state.drift.length - leadEdits - issuesClosed;
if (left > 0) console.log(`${left} item${left === 1 ? "" : "s"} still need a human — see the report above.`);
