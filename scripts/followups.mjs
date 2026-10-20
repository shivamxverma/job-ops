#!/usr/bin/env node
/**
 * followups.mjs — print overdue and upcoming follow-ups. Run at the start of any session
 * (CLAUDE.md tells Claude to). The Actions workflow also opens Issues for overdue ones;
 * this is the instant local view.
 *
 * Reads the canonical state from lib/state.mjs rather than re-parsing tracker.md. The old
 * inline parser did `statusRaw.split(" ")[0]`, which turned "**ghosted 2026-08-11**" into
 * "**ghosted" — a value matching no known status, so the row fell through every branch and
 * the application vanished from the queue. Bold markdown was enough to hide an application.
 * It also dropped any row whose follow-up cell was prose ("+7d from send", "needs manual
 * check (LinkedIn, not email)") because it only matched a leading date, so those rows had no
 * clock and no way to ever surface. Both classes are now printed, not skipped.
 */
import { loadState, STATUSES } from "./lib/state.mjs";

const state = loadState();
const today = state.today;
const soon = new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10);

const overdue = [], upcoming = [], unclocked = [];

for (const c of state.companies.values()) {
  // Closed outcomes have no clock: rejected/ghosted/offer are terminal, hold is deliberate.
  // awaiting-connection has no channel to message through yet; needs-review is an unrecognized
  // status that must not run a guessed clock (see state.mjs's STATUSES comments).
  if (["rejected", "ghosted", "offer", "closed", "hold", "skipped", "lead",
       "awaiting-connection", "needs-review"].includes(c.status)) continue;

  // Lifecycle per CLAUDE.md step 8: sent + 7 silent days → 2nd touch; followed-up + 7 → ghost.
  const action =
    c.status === "followed-up" ? "ACTION: no reply after follow-up → mark ghosted, move on"
    : c.status === "sent" ? "ACTION: draft follow-up now (Gmail draft if address known), set followed-up +7d"
    : c.status === "drafted" ? "ACTION: draft is written and waiting on Shivam to send"
    : "ACTION: check thread, decide next step";
  const row = `${c.display} (${c.role || "role not recorded"}) — ${c.channel || "channel not recorded"}, ` +
    `applied ${c.applied || "date not recorded"}, status: ${c.status}`;

  if (c.followUpManual) {
    unclocked.push(`${row}, follow-up: "${c.followUpManual}"\n      ${action}`);
  } else if (!c.followUp) {
    continue;
  } else if (c.followUp <= today) {
    overdue.push(`${row}, due: ${c.followUp}\n      ${action}`);
  } else if (c.followUp <= soon) {
    upcoming.push(`${row}, due: ${c.followUp}`);
  }
}

const bullet = (rows) => rows.map((r) => "  - " + r).join("\n");
if (overdue.length) console.log(`⚠️  OVERDUE follow-ups:\n${bullet(overdue)}`);
if (upcoming.length) console.log(`${overdue.length ? "\n" : ""}Upcoming (next 2 days):\n${bullet(upcoming)}`);
if (unclocked.length) {
  console.log(`${overdue.length || upcoming.length ? "\n" : ""}No clock (follow-up column is prose, so these can never come due on their own):\n${bullet(unclocked)}`);
}
if (!overdue.length && !upcoming.length && !unclocked.length) console.log("No follow-ups due. ✓");

// Drift is surfaced here too: a session that starts by trusting this queue should be told
// immediately if the stores behind it disagree, rather than finding out days later.
if (state.drift.length) {
  console.log(`\n${state.drift.length} state drift item${state.drift.length > 1 ? "s" : ""} — run: node scripts/reconcile.mjs`);
}
