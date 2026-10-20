#!/usr/bin/env node
/**
 * mark-processed.mjs — record a decision on a lead (or signal) and close its GitHub issue to
 * match.
 *
 *   node scripts/mark-processed.mjs "airCFO"               # DONE: applied / pipeline went out
 *   node scripts/mark-processed.mjs "Cora AI" --skip       # SKIP: decided not to apply
 *   node scripts/mark-processed.mjs logen --reason "..."   # custom close comment
 *   node scripts/mark-processed.mjs orbit --no-close       # update leads.md only
 *
 *   node scripts/mark-processed.mjs "30 Sundays" --signals --promote  # signal → applications/
 *   node scripts/mark-processed.mjs "Raghu Vamsi" --signals --skip    # signal → not pursuing
 *
 * Leads live in inbox/leads.md as markdown checkboxes. The box state is the decision:
 *   [ ] = still on the pile        [d] = done / applied (pipeline went out)
 *   [x] = decided not to apply
 * This script sets that state AND closes the matching GitHub Issue /job-scout opened for the
 * lead (mapped HN post id → issue number via inbox/.issued.json), with the right close reason:
 *   done  → [d], stamp "✓ processed <date>", issue closed as "completed"
 *   --skip → [x], stamp "✗ skipped <date>",  issue closed as "not planned"
 * so an open issue always means an undecided [ ] lead — that's the "what's left" board.
 *
 * With --signals, the same box-state logic runs against inbox/signals.md instead, with a third
 * state: [>] = promoted (moved into applications/{company}/ for deep research). Promoting does
 * NOT close the signal's GitHub issue — the decision that closes it is the eventual leads.md
 * outcome, so promoting only leaves a comment. "done" mode isn't valid on signals (a signal
 * isn't applied-to, only promoted or skipped) — pass --promote or --skip explicitly.
 *
 * Never fails the local mark because GitHub was unreachable — the box always updates; a GitHub
 * problem is a warning. Reversible: reset the box char, `gh issue reopen <n>`.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { today } from "./lib/today.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LEADS = join(ROOT, "inbox", "leads.md");
const SIGNALS = join(ROOT, "inbox", "signals.md");
const ISSUED = join(ROOT, "inbox", ".issued.json");

const args = process.argv.slice(2);
const noClose = args.includes("--no-close");
const skip = args.includes("--skip");
const onSignals = args.includes("--signals");
const promote = args.includes("--promote");
const reasonIdx = args.indexOf("--reason");
const reasonValIdx = reasonIdx === -1 ? -1 : reasonIdx + 1;
const reason = reasonIdx !== -1 ? args[reasonValIdx] : (skip ? "decided not to apply" : "pipeline run — applied");
const query = args.filter((a, i) => !a.startsWith("--") && i !== reasonValIdx).join(" ").trim();
if (!query) {
  console.error('Usage: node scripts/mark-processed.mjs "<company>" [--skip] [--reason "..."] [--no-close]');
  console.error('       node scripts/mark-processed.mjs "<company>" --signals [--promote|--skip]');
  process.exit(1);
}
if (onSignals && !promote && !skip) {
  console.error('Signals need an explicit decision: add --promote (moving to applications/) or --skip.');
  process.exit(1);
}

const FILE = onSignals ? SIGNALS : LEADS;
const fileLabel = onSignals ? "signals.md" : "leads.md";

// The decision → box char, stamp, and GitHub close reason all in one place.
const mode = skip
  ? { char: "x", stamp: "✗ skipped", ghReason: "not planned", word: "skipped", close: true }
  : promote
  ? { char: ">", stamp: "→ promoted", ghReason: null, word: "promoted", close: false }
  : { char: "d", stamp: "✓ processed", ghReason: "completed", word: "processed", close: true };

const stampDate = today();
const lines = readFileSync(FILE, "utf8").split("\n");
const q = query.toLowerCase();

// A tracked line: "- [ ] **Company** — ... | ... | HN: ...item?id=NNN | ..." (leads) or
// "- [ ] **Company** — A | date | Source: https://... | why: ..." (signals).
const trackedRe = /^(\s*- \[)([ xX>dD])(\] \*\*(.+?)\*\*)(.*)$/;
const matches = [];
lines.forEach((line, i) => {
  const m = line.match(trackedRe);
  if (m && m[4].toLowerCase().includes(q)) matches.push({ i, m, line });
});

if (matches.length === 0) {
  console.error(`No entry in inbox/${fileLabel} matches "${query}". Check the **bold company name**.`);
  process.exit(1);
}
if (matches.length > 1) {
  console.error(`"${query}" matches ${matches.length} entries — be more specific:`);
  matches.forEach(({ m }) => console.error(`  • ${m[4]}`));
  process.exit(1);
}

const { i, m, line } = matches[0];

// 1. Set the box char + stamp the date (drop any prior stamp so it never doubles up).
if (m[2].toLowerCase() === mode.char) {
  console.log(`Already marked [${mode.char}] (${mode.word}): ${m[4]}.`);
} else {
  const tail = m[5].replace(/\s*\|\s*[✓✗→] (?:processed|skipped|promoted) \d{4}-\d{2}-\d{2}\s*$/, "");
  lines[i] = `${m[1]}${mode.char}${m[3]}${tail} | ${mode.stamp} ${stampDate}`;
  writeFileSync(FILE, lines.join("\n"));
  console.log(`Marked [${mode.char}] in ${fileLabel}: ${m[4]} (${mode.stamp} ${stampDate}).`);
}

// 2. Update the matching GitHub issue — close it if this decision closes the loop, otherwise
//    (promote) just leave a comment so the issue stays open until the real leads.md outcome.
if (noClose) process.exit(0);
const hnId = (line.match(/item\?id=(\d+)/) || [])[1];
const urlMatch = line.match(/https?:\/\/\S+/);
const issued = existsSync(ISSUED) ? JSON.parse(readFileSync(ISSUED, "utf8")) : {};
const issueNo = hnId ? issued[hnId] : urlMatch ? issued[`sig:${urlMatch[0]}`] : undefined;
if (!issueNo) {
  console.log("  note: no GitHub issue tracked for this entry.");
  process.exit(0);
}

try {
  const state = execFileSync("gh", ["issue", "view", String(issueNo), "--json", "state", "-q", ".state"], { encoding: "utf8" }).trim();
  if (!mode.close) {
    if (state === "CLOSED") {
      console.log(`  GitHub issue #${issueNo} already closed — leaving as is.`);
    } else {
      execFileSync("gh", ["issue", "comment", String(issueNo), "--body", `Promoted via JobOps (${stampDate}): ${reason}. Issue stays open until the leads.md outcome is decided.`], { stdio: "pipe" });
      console.log(`  Commented on GitHub issue #${issueNo} (left open — promotion isn't the final decision).`);
    }
  } else if (state === "CLOSED") {
    console.log(`  GitHub issue #${issueNo} already closed.`);
  } else {
    execFileSync("gh", ["issue", "close", String(issueNo), "--reason", mode.ghReason, "--comment", `${mode.word[0].toUpperCase()}${mode.word.slice(1)} via JobOps (${stampDate}): ${reason}.`], { stdio: "pipe" });
    console.log(`  Closed GitHub issue #${issueNo} as "${mode.ghReason}".`);
  }
} catch (e) {
  console.warn(`  WARNING: could not update issue #${issueNo} (${(e.message || "").split("\n")[0]}). The box is set; handle it by hand with: gh issue ${mode.close ? "close" : "comment"} ${issueNo}`);
}
