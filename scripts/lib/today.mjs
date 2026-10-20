/**
 * today.mjs — the pipeline's date, in Shivam's timezone.
 *
 * Every scout stamped its output with `new Date().toISOString().slice(0, 10)`, which is the
 * date in **UTC**. Shivam works in IST (UTC+5:30), so for the five and a half hours between
 * midnight and 05:30 IST the two disagree, and a late-night or early-morning run writes to the
 * *previous* day's file — overwriting the output that is already there. `inbox/yc-2026-08-14.json`
 * was rewritten at 01:20 IST on 08-15 for exactly this reason, and the run before it was lost.
 *
 * The same slice drives the `✓ processed` stamps in leads.md, the follow-up overdue comparison,
 * and the tracker's applied dates. A follow-up due "today" would not come due until 05:30 IST.
 *
 * One local-date implementation, imported everywhere, same rule as keywords.mjs: don't inline
 * a `toISOString().slice(0, 10)` in a script — that is the bug, not a shortcut.
 */

/** YYYY-MM-DD in the machine's local timezone (not UTC). */
export function today(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Local YYYY-MM-DD, `n` days from now. Negative goes back. */
export const daysFromNow = (n, from = new Date()) =>
  today(new Date(from.getTime() + n * 864e5));

/** Whole days between two YYYY-MM-DD strings (or Dates), b - a. */
export const daysBetween = (a, b) =>
  Math.round((new Date(`${String(b).slice(0, 10)}T00:00:00`) - new Date(`${String(a).slice(0, 10)}T00:00:00`)) / 864e5);
