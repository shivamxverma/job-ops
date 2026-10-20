#!/usr/bin/env node
/**
 * c-queue — the batch selector for /autoapply, the autonomous C-grade lane.
 *
 * The C pile is the biggest thing in the system that never gets worked: A and B get the full
 * pipeline, C gets "quiet-week filler" and there are no quiet weeks, so the arrows sit in the
 * quiver. This picks the batch that lane may run against, and — just as importantly — the ones
 * it may NOT, because the autonomous lane sends real email and clicks real submit buttons.
 *
 * Reads `lib/state.mjs` and nothing else. Never re-parse leads.md or tracker.md here.
 *
 *   node scripts/c-queue.mjs [--grade C] [--limit 8] [--json] [--signals]
 *
 * Three buckets out:
 *   eligible — untouched, ungraded-above-C, no tracker row, no folder, has a link. The batch.
 *   held     — real leads the lane must hand to Shivam instead of acting on (WaaS credit spend,
 *              a prior tracker row = a re-post, no link to apply through).
 *   excluded — already decided or already in flight; counted, not listed.
 */
import { loadState, folderComplete, TODAY } from "./lib/state.mjs";
import { readFileSync } from "node:fs";

const argv = process.argv.slice(2);
const flag = (n, d) => {
  const i = argv.indexOf(`--${n}`);
  return i === -1 ? d : argv[i + 1];
};
const has = (n) => argv.includes(`--${n}`);

const GRADES = String(flag("grade", "C")).toUpperCase().split(/[,\s]+/).filter(Boolean);
const LIMIT = Number(flag("limit", 8));
const JSON_OUT = has("json");

/** Applying through YC's own button spends 1 of 5 per week — never autonomously. */
const isWaaS = (url) =>
  /workatastartup\.com/i.test(url) || /ycombinator\.com\/companies\/[^/]+\/jobs/i.test(url);

const { companies, today } = loadState();

const eligible = [];
const held = [];
let excluded = 0;

for (const c of companies.values()) {
  if (!GRADES.includes(c.grade)) continue;

  // Anything with an outcome row, a folder, or a decided box is out of the lane entirely:
  // this lane opens new applications, it never touches ones already in flight.
  //
  // `folderComplete` is deliberately NOT the test here, and that is the whole lesson of the
  // first smoke run (2026-08-19). Strello Health had an `outreach.md` and nothing else, so it
  // was "incomplete" and the queue offered it as a fresh lead — while Gmail showed Shivam had
  // already emailed jobs@strello.health on 2026-08-06. An autonomous lane would have sent a
  // duplicate application to a company already waiting on him. **Any** folder content is
  // evidence of prior work: hold it and make a human look.
  const lead = c.leads[0] || null;
  const decided = lead && lead.box !== " ";
  if (c.tracker.length && decided) { excluded++; continue; }
  if (decided) { excluded++; continue; }
  if (!lead) { excluded++; continue; }

  const row = { company: c.display, key: c.key, grade: c.grade, role: c.role,
                link: c.link, why: (c.why || "").slice(0, 220), posted: lead.posted };

  // A company that already rejected or ghosted him and is hiring again is a re-post: a real
  // lead, and exactly the kind that must not be re-applied to on autopilot.
  if (c.tracker.length) { held.push({ ...row, hold: "prior-contact", detail: `tracker says ${c.status}${c.since ? ` since ${c.since}` : ""} — re-post, needs Shivam's read` }); continue; }
  if (c.folder) { held.push({ ...row, hold: "folder-exists", detail: `applications/${c.folder.slug}/ already holds ${Object.entries(c.folder.has).filter(([, v]) => v).map(([k]) => k).join(", ") || "files"} — prior work with no tracker row, check Gmail before anything` }); continue; }
  if (!c.link) { held.push({ ...row, hold: "no-link", detail: "lead carries no URL, nothing to apply through" }); continue; }
  if (isWaaS(c.link)) { held.push({ ...row, hold: "waas-credit", detail: "YC/WaaS apply spends 1 of 5 per week — Shivam's call, never the lane's" }); continue; }

  eligible.push(row);
}

// Freshest first: a C lead posted this week converts better than one from three weeks ago.
eligible.sort((a, b) => String(b.posted || "").localeCompare(String(a.posted || "")));
const batch = eligible.slice(0, LIMIT);

// Signals are a different animal: a funding story, no posting, often no engineering seat at
// all. Listed for triage only, never auto-queued.
let signals = [];
if (has("signals")) {
  signals = readFileSync(new URL("../inbox/signals.md", import.meta.url), "utf8")
    .split("\n")
    .map((l) => l.match(/^- \[ \] \*\*(.+?)\*\*\s*—\s*([A-D])\s*\|\s*(.+?)\s*\|\s*(https?:\S+|\S+:\s*https?:\S+)/))
    .filter((m) => m && GRADES.includes(m[2]))
    .map((m) => ({ headline: m[1], grade: m[2], when: m[3], link: (m[4].match(/https?:\S+/) || [])[0] }));
}

if (JSON_OUT) {
  console.log(JSON.stringify({ today, grades: GRADES, limit: LIMIT, batch, eligible, held, signals, excluded }, null, 2));
  process.exit(0);
}

const line = (r, i) => `  ${String(i + 1).padStart(2)}. ${r.company}${r.role ? ` — ${r.role}` : ""}${r.posted ? `  (posted ${r.posted})` : ""}\n      ${r.link || "(no link)"}`;

console.log(`\nc-queue  ${today}  grade ${GRADES.join("/")}  limit ${LIMIT}\n`);
console.log(`BATCH (${batch.length} of ${eligible.length} eligible) — the autonomous lane may run these:`);
console.log(batch.length ? batch.map(line).join("\n") : "  (none)");

if (eligible.length > batch.length) console.log(`\n  ...and ${eligible.length - batch.length} more eligible, over the limit.`);

console.log(`\nHELD (${held.length}) — real leads, but Shivam decides, not the lane:`);
console.log(held.length ? held.map((r, i) => `${line(r, i)}\n      ↳ ${r.hold}: ${r.detail}`).join("\n") : "  (none)");

if (has("signals")) {
  console.log(`\nSIGNALS (${signals.length}) — triage by hand, no posting exists yet:`);
  console.log(signals.length ? signals.map((s, i) => `  ${String(i + 1).padStart(2)}. ${s.headline}  [${s.grade}]\n      ${s.link}`).join("\n") : "  (none)");
}

console.log(`\n${excluded} already decided or in flight, not shown.\n`);
