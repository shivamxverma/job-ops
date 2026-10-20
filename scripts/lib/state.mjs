/**
 * state.mjs — the one place that answers "what is actually going on with this company".
 *
 * JobOps kept the same fact in four stores that never checked each other:
 *
 *   inbox/leads.md        a checkbox  — [ ] undecided, [d] applied, [x] won't apply
 *   applications/{slug}/  a folder    — dossier/resume/pack, i.e. work actually done
 *   applications/tracker.md a row     — status + follow-up clock
 *   GitHub Issues         a lead card — "what's left", per CLAUDE.md
 *
 * Nothing reconciled them, so they drifted, and once they disagree none of them is a source
 * of truth. Measured on 2026-08-15, before this module existed:
 *
 *   • 77 leads were decided in leads.md while their GitHub issue was still open, so the
 *     issue board showed 90 open leads when only 13 were genuinely undecided.
 *   • 8 leads sat at [ ] while a tracker row said the application had gone out.
 *   • 12 application folders had no tracker row at all.
 *   • REM Labs had two tracker rows with two different statuses.
 *
 * The rule this module enforces: **the four stores are inputs, not authorities.** Each one is
 * parsed, they are joined on a normalised company key, and one canonical status is derived
 * from the join. Where they disagree the disagreement is *reported as drift*, never silently
 * resolved and never silently dropped — the old parsers did `status.split(" ")[0]`, which
 * turned "**rejected 2026-08-13**" into "**rejected", matched no known status, and made the
 * row invisible on the dashboard and in the follow-up queue. Bold markdown quietly deleted
 * an application from the board. That class of bug is what `drift` exists to make loud.
 *
 * Consumers: dashboard.mjs (renders it), followups.mjs (clocks it), reconcile.mjs (fixes it).
 * Same rule as keywords.mjs and reachability.mjs — don't re-inline a local copy of any of this.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { today, daysBetween } from "./today.mjs";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), "utf8") : "");
// Local, not UTC — a follow-up due today must come due at 00:00 IST, not at 05:30. See today.mjs.
export const TODAY = today;

// ---------------------------------------------------------------------------
// Company identity
// ---------------------------------------------------------------------------
/**
 * The join key. Company names arrive spelled three different ways for the same company
 * ("Wifi Dabba, Inc. (YC W17)" / "wifi-dabba" / "Wifi Dabba"), so everything decorative is
 * stripped: parentheticals (batch tags, legal aliases), legal suffixes, punctuation, spaces.
 * Aggressive on purpose — a false merge is visible as a duplicate-row drift, a false split
 * is invisible and recreates the exact problem this module exists to end.
 */
export const key = (name) =>
  String(name || "")
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")               // "(YC W22)", "(formerly Monad Labs)"
    .replace(/\b(inc|llc|ltd|limited|pvt|private|corp|co|gmbh|labs?|technologies|holdings)\b/g, " ")
    .replace(/[^a-z0-9]+/g, "")
    .trim();

/** Names that normalise apart but are one company. Extend here, not in a consumer. */
export const ALIASES = {
  categorylabsfmrmonad: "categorylabs",
  categorylabsformerlymonad: "categorylabs",
  fixxlyfixxly: "fixxly",
  urbanharvestorganicutfresh: "urbanharvest",
  aisensywhatsappengagementplatformproductoftriny: "aisensy",
  envelonailitigationvaultapatentvcinhouseventure: "envelonai",
  mitte: "mitte",
  // Folder is `gooseworks-ai/`, tracker row is "Gooseworks (YC W23)". Both are the same
  // company; the batch suffix and the .ai in the slug normalise apart. Added 2026-08-16.
  gooseworksycw23: "gooseworksai",
  gooseworks: "gooseworksai",
  // Folder is `ao-agents/`, tracker row is "AO (Agent Orchestrator)" (the product name; the
  // GitHub org is `Untrivial-ai`). Nothing about the display name normalises to the slug.
  // Added 2026-08-23.
  aoagentorchestrator: "aoagents",
  aoagentorchestratoruntrivialai: "aoagents",
  // Folder is `traceroot/`, tracker row is "TraceRoot.AI (YC S25)" — the .ai and batch suffix
  // normalise apart. Added 2026-08-25.
  tracerootai: "traceroot",
};
export const canon = (name) => {
  const k = key(name);
  return ALIASES[k] || k;
};

// ---------------------------------------------------------------------------
// Status vocabulary
// ---------------------------------------------------------------------------
/**
 * The canonical statuses, in pipeline order. `rank` drives dashboard column placement and
 * "which of two rows wins" when a company somehow has two.
 */
export const STATUSES = {
  lead:         { rank: 0,  group: "pile",    label: "undecided lead" },
  skipped:      { rank: 1,  group: "closed",  label: "won't apply" },
  hold:         { rank: 2,  group: "hold",    label: "on hold" },
  drafted:      { rank: 3,  group: "hold",    label: "drafted, Shivam to send" },
  // A LinkedIn/X connection request sent but not yet accepted. Distinct from `sent` on purpose:
  // there is no channel to message through yet, so no follow-up clock should ever start here.
  // Found 2026-08-24: "sent (connect pending)" was parsing to plain `sent` (parseStatus only
  // reads the token before "("), which is only safe by accident when the follow-up cell also
  // happens to start with "none" — any other phrasing would have produced a false overdue card.
  "awaiting-connection": { rank: 3.5, group: "hold", label: "invite sent, not accepted yet" },
  sent:         { rank: 4,  group: "waiting", label: "sent" },
  "followed-up":{ rank: 5,  group: "waiting", label: "followed up" },
  replied:      { rank: 6,  group: "play",    label: "replied" },
  screening:    { rank: 7,  group: "play",    label: "screening" },
  interview:    { rank: 8,  group: "play",    label: "interview" },
  offer:        { rank: 9,  group: "play",    label: "offer" },
  rejected:     { rank: 10, group: "closed",  label: "rejected" },
  ghosted:      { rank: 10, group: "closed",  label: "ghosted" },
  closed:       { rank: 10, group: "closed",  label: "closed" },
  // A tracker row exists but its status prose maps to nothing known. Used to silently become
  // `sent` (see the join below), which put it in the same overdue-follow-up pool as a real send
  // — a made-up status word could generate a false "follow up" card. Kept out of every group
  // that drives a clock; the `unparseable-status` drift entry is what actually surfaces it.
  // group "hold" (not "pile") deliberately: it lands in the dashboard's existing Hold column,
  // which is exactly "needs Shivam's attention", rather than needing a new column of its own.
  "needs-review": { rank: 1.5, group: "hold", label: "unrecognized status — needs review" },
};

/**
 * Free-text status → canonical. Shivam writes the tracker by hand and in prose, so this has to
 * survive bold markdown, trailing dates, em-dash commentary and parentheticals. Anything it
 * cannot map returns null, which becomes an `unparseable-status` drift rather than a row that
 * quietly vanishes from every view.
 */
const STATUS_SYNONYMS = {
  applied: "sent", "ask-sent-pending": "drafted", "channel": "drafted",
  interviewed: "interview", interviewing: "interview", offered: "offer",
  "in-conversation": "replied", reply: "replied", responded: "replied",
  phone: "screening", screen: "screening", call: "screening",
  declined: "rejected", reject: "rejected", ghost: "ghosted", dead: "closed",
  pending: "sent", waiting: "sent", "followed": "followed-up", followup: "followed-up",
};
export function parseStatus(raw) {
  if (!raw) return { status: null, date: null, raw };
  const clean = String(raw).replace(/\*\*/g, "").replace(/`/g, "").trim();
  const date = (clean.match(/(\d{4}-\d{2}-\d{2})/) || [])[1] || null;
  // A connection request sent but not accepted — checked before the first-token split, because
  // this phrasing is almost always written as "sent (connect pending)", and the first token
  // alone ("sent") would otherwise fold it into a real send with a follow-up clock running.
  if (/connect(ion)?\s*(pending|not\s*accepted)|invite\s*(pending|not\s*accepted|sent.*not.*accept)/i.test(clean)) {
    return { status: "awaiting-connection", date, raw: clean };
  }
  // First token, minus any trailing punctuation; "followed-up 2026-08-12" → "followed-up".
  const head = clean.split(/[\s(—,]/)[0].toLowerCase().replace(/[^a-z-]/g, "");
  const status = STATUSES[head] ? head : STATUS_SYNONYMS[head] || null;
  return { status, date, raw: clean };
}

/**
 * The follow-up column is prose as often as it is a date ("+7d from send", "needs manual
 * check (HuntingCube dashboard)", "none until accepted"). A bare date regex silently dropped
 * every one of those from the queue, so they are returned explicitly as `manual` — a thing
 * with no clock that still needs a human, which is different from having no follow-up at all.
 */
export function parseFollowUp(raw) {
  const clean = String(raw || "").replace(/\*\*/g, "").trim();
  if (!clean || /^(none|n\/a|-)\b/i.test(clean)) return { due: null, manual: null };
  const due = (clean.match(/(\d{4}-\d{2}-\d{2})/) || [])[1] || null;
  return { due, manual: due ? null : clean };
}

// ---------------------------------------------------------------------------
// Source 1 — inbox/leads.md
// ---------------------------------------------------------------------------
const BOX_STATUS = { " ": "lead", d: "sent", x: "skipped", ">": "lead" };

export function loadLeads(file = "inbox/leads.md") {
  const out = [];
  read(file).split("\n").forEach((line, i) => {
    const m = line.match(/^(\s*)- \[(.)\] \*\*(.+?)\*\*\s*(.*)$/);
    if (!m) return;
    const [, , boxRaw, name, rest] = m;
    const box = (boxRaw || " ").toLowerCase() === "x" ? "x" : (boxRaw || " ").toLowerCase();
    out.push({
      line: i, name, key: canon(name), box: box.trim() ? box : " ",
      // Two layouts in the wild: leads.md puts the grade in its own column between pipes
      // ("— {role} | **B** | posted ..."), signals.md puts it straight after the em dash
      // ("— B | Fri, 14 Aug 2026 | ..."). Match either, or the Signals column renders empty.
      grade: (rest.match(/\|\s*\**([A-F])\**\s*\|/) || rest.match(/^—\s*\**([A-F])\**\s*\|/) || [])[1] || "?",
      role: (rest.match(/^—\s*(.+?)\s*\|/) || [])[1] || "",
      why: (rest.match(/why:\s*(.+?)(?:\s*\|\s*founder|$)/) || [])[1] || "",
      posted: (rest.match(/posted (\d{4}-\d{2}-\d{2})/) || [])[1] || null,
      link: (rest.match(/https?:\/\/\S+/) || [])[0] || "",
      hnId: (rest.match(/item\?id=(\d+)/) || [])[1] || null,
      promoted: box === ">",
    });
  });
  return out;
}

// ---------------------------------------------------------------------------
// Source 2 — applications/tracker.md
// ---------------------------------------------------------------------------
export function loadTracker(file = "applications/tracker.md") {
  const out = [];
  read(file).split("\n").forEach((line, i) => {
    const c = line.split("|").map((s) => s.trim());
    if (c.length < 11 || c[1] === "date" || c[1].startsWith("---")) return;
    const [, date, company, role, grade, channel, framing, ats, statusRaw, followRaw, notes] = c;
    const { status, date: statusDate, raw } = parseStatus(statusRaw);
    const { due, manual } = parseFollowUp(followRaw);
    out.push({
      line: i, date, company, key: canon(company), role, grade, channel, framing, ats, notes,
      status, statusDate, statusRaw: raw, followUp: due, followUpManual: manual,
    });
  });
  return out;
}

// ---------------------------------------------------------------------------
// Source 3 — applications/ folders
// ---------------------------------------------------------------------------
/** A folder is evidence of work done. Which artefacts exist tells us how far it got. */
export function loadFolders(dir = "applications") {
  const base = join(ROOT, dir);
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const files = readdirSync(join(base, d.name));
      return {
        slug: d.name, key: canon(d.name), files,
        has: {
          dossier: files.includes("dossier.md"),
          resume: files.some((f) => /^resume\.(md|pdf)$/.test(f)),
          outreach: files.includes("outreach.md"),
          pack: files.includes("pack.json"),
          coverLetter: files.includes("cover-letter.md"),
          log: files.includes("log.md"),
        },
        mtime: statSync(join(base, d.name)).mtime.toISOString().slice(0, 10),
      };
    });
}

/**
 * Folder-complete = applied, per CLAUDE.md step 7: the moment the folder holds everything
 * Shivam needs to send, the row is `sent`. A dossier alone is research, not an application.
 */
export const folderComplete = (f) => !!(f && f.has.dossier && (f.has.resume || f.has.outreach || f.has.pack));

// ---------------------------------------------------------------------------
// Source 4 — GitHub issues (cached, so every consumer works offline)
// ---------------------------------------------------------------------------
const ISSUE_CACHE = "inbox/.issues.json";

/**
 * Refresh the local issue cache from `gh`. Kept separate from `loadIssues` so that reading
 * state never blocks on the network — a dashboard render must not fail because GitHub is
 * unreachable, same principle mark-processed.mjs already follows.
 */
export function refreshIssues() {
  const json = execFileSync(
    "gh", ["issue", "list", "--state", "all", "--limit", "1000", "--json", "number,title,state,labels,createdAt"],
    { encoding: "utf8", cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] }
  );
  const issues = JSON.parse(json).map((i) => ({
    number: i.number, title: i.title, state: i.state.toLowerCase(),
    labels: i.labels.map((l) => l.name), createdAt: i.createdAt.slice(0, 10),
  }));
  const payload = { refreshed: new Date().toISOString(), issues };
  writeFileSync(join(ROOT, ISSUE_CACHE), JSON.stringify(payload, null, 1));
  return payload;
}

export function loadIssues() {
  const raw = read(ISSUE_CACHE);
  if (!raw) return { refreshed: null, issues: [], byNumber: new Map() };
  const p = JSON.parse(raw);
  return { ...p, byNumber: new Map(p.issues.map((i) => [i.number, i])) };
}

/** inbox/.issued.json maps HN post id (or "sig:<url>") → the issue number scout opened. */
export function loadIssued() {
  const raw = read("inbox/.issued.json");
  return raw ? JSON.parse(raw) : {};
}

// ---------------------------------------------------------------------------
// The join
// ---------------------------------------------------------------------------
/**
 * Build the canonical per-company state.
 *
 * Precedence for the derived status, strongest evidence first:
 *   1. a tracker row     — the only store that records an *outcome*
 *   2. a complete folder — work went out even if the row was never written
 *   3. the leads.md box  — a decision with no work behind it yet
 *
 * Everything the join notices but cannot decide becomes a drift entry. Drift is the product
 * here, not a diagnostic: it is the list of places where Shivam currently cannot trust the board.
 */
export function loadState() {
  const leads = loadLeads();
  const tracker = loadTracker();
  const folders = loadFolders();
  const { issues, byNumber, refreshed } = loadIssues();
  const issued = loadIssued();
  const today = TODAY();
  const drift = [];
  const companies = new Map();

  const upsert = (k, display) => {
    if (!companies.has(k)) companies.set(k, { key: k, display, leads: [], tracker: [], folder: null, issue: null, drift: [] });
    const c = companies.get(k);
    if (display && display.length > (c.display || "").length) c.display = display;
    return c;
  };

  for (const l of leads) upsert(l.key, l.name).leads.push(l);
  for (const t of tracker) upsert(t.key, t.company).tracker.push(t);
  for (const f of folders) {
    const c = upsert(f.key, f.slug);
    if (c.folder) drift.push({ type: "duplicate-folder", key: f.key, detail: `${c.folder.slug} and ${f.slug}` });
    else c.folder = f;
  }

  // Attach the GitHub issue via the HN id / signal URL that scout recorded for the lead.
  for (const c of companies.values()) {
    for (const l of c.leads) {
      const n = l.hnId ? issued[l.hnId] : l.link ? issued[`sig:${l.link}`] : undefined;
      if (n && byNumber.has(n)) { c.issue = byNumber.get(n); break; }
    }
  }

  for (const c of companies.values()) {
    // --- duplicate tracker rows: keep the furthest-along, report the rest ----
    if (c.tracker.length > 1) {
      drift.push({
        type: "duplicate-tracker-row", key: c.key, company: c.display,
        detail: c.tracker.map((t) => `line ${t.line + 1}: ${t.statusRaw}`).join("  ||  "),
        fixable: false,
      });
      c.tracker.sort((a, b) => (STATUSES[b.status]?.rank ?? -1) - (STATUSES[a.status]?.rank ?? -1));
    }
    const row = c.tracker[0] || null;
    const lead = c.leads[0] || null;

    // --- derive the canonical status ---------------------------------------
    if (row && row.status) {
      c.status = row.status;
      c.since = row.statusDate || row.date;
    } else if (row) {
      drift.push({
        type: "unparseable-status", key: c.key, company: c.display,
        detail: `tracker line ${row.line + 1}: "${row.statusRaw}" maps to no known status`,
        fixable: false,
      });
      // A row exists, so something happened, but the prose doesn't say what — `needs-review`
      // keeps it visible (drift entry above) without also feeding it into overdue-follow-up
      // logic under a guessed status, which used to be able to fire a false "follow up" card
      // off a status word nobody had actually mapped to "sent".
      c.status = "needs-review";
      c.since = row.date;
    } else if (folderComplete(c.folder)) {
      c.status = "sent";
      c.since = c.folder.mtime;
    } else if (lead) {
      c.status = BOX_STATUS[lead.box] || "lead";
      c.since = lead.posted;
    } else {
      c.status = "lead";
      c.since = c.folder?.mtime || null;
    }

    c.group = STATUSES[c.status]?.group || "pile";
    c.role = row?.role || lead?.role || "";
    c.grade = (row?.grade || lead?.grade || "?").match(/[A-F]/)?.[0] || "?";
    c.channel = row?.channel || "";
    c.applied = row?.date || null;
    c.notes = row?.notes || "";
    c.why = lead?.why || "";
    c.link = lead?.link || "";
    c.followUp = row?.followUp || null;
    c.followUpManual = row?.followUpManual || null;
    c.overdue = !!(c.followUp && c.followUp <= today && ["sent", "followed-up", "replied", "screening"].includes(c.status));
    c.daysSince = c.since ? daysBetween(c.since, today) : null;

    // --- drift ------------------------------------------------------------
    const decided = lead && lead.box !== " " && lead.box !== ">";

    /**
     * A re-posting is not a stale lead. Railway rejected Shivam on 2026-07-23 and posted the
     * role again on 08-03; Kadoa, MixRank and Category Labs (an A-grade DeFi match) did the
     * same. Joining on company alone makes all four look like "already applied, just never
     * ticked", and auto-ticking them would bury four live leads — the exact silent-loss bug
     * this module exists to stop, arriving through the fix rather than the parser.
     *
     * So: a tracker row only accounts for a lead that existed at or before the application.
     * A lead posted *after* a terminal outcome is a fresh opportunity, and the fact that the
     * company already rejected or ghosted Shivam is context he wants, not a reason to hide it.
     */
    const terminal = ["rejected", "ghosted", "closed"].includes(c.status);
    const repost = !!(lead && lead.posted && row?.date && lead.posted > row.date);
    if (repost && terminal) {
      drift.push({
        type: "reposted-after-close", key: c.key, company: c.display,
        detail: `${c.status}${row.statusDate ? ` ${row.statusDate}` : ""} on the ${row.date} application, but posted again ${lead.posted} (grade ${lead.grade !== "?" ? lead.grade : c.grade}) — triage as a new lead`,
        fixable: false,
      });
      // The live posting is the current truth about this company, so the board shows the lead
      // and carries the old outcome alongside it rather than filing it under Closed.
      if (lead.box === " ") {
        c.priorOutcome = `${c.status}${row.statusDate ? ` ${row.statusDate}` : ""} (applied ${row.date})`;
        c.status = "lead";
        c.group = "pile";
        // The new posting's grade, not the old application's — MixRank's earlier row was
        // graded B, the re-post is an A, and the pile has to sort on the live one.
        if (lead.grade !== "?") c.grade = lead.grade;
        c.since = lead.posted;
        c.daysSince = daysBetween(lead.posted, today);
        c.overdue = false;
      }
    }
    // A re-post's lead line and issue are about the new posting, so neither is stale.
    const coveredByTracker = !!row && !repost;

    // The big one: the issue board claims a lead is still open when it isn't.
    if (c.issue && c.issue.state === "open" && !repost && (decided || c.group !== "pile")) {
      drift.push({
        type: "stale-open-issue", key: c.key, company: c.display, issue: c.issue.number,
        detail: `issue #${c.issue.number} open but lead is ${decided ? `[${lead.box}]` : c.status}`,
        fixable: true, fix: { closeIssue: c.issue.number, reason: c.status === "skipped" ? "not planned" : "completed" },
      });
    }
    // Applied, but leads.md never got the mark — the "is this traced?" confusion.
    //
    // `group !== "pile"` is not sufficient on its own, and this is the bug it hides: the **hold**
    // group (`hold`, `drafted`) means the exact opposite of applied — the folder is built and
    // nothing went out. Auto-marking those `[d]` writes "applied" into leads.md for an
    // application that never happened, which is precisely the class of silent falsehood this
    // module exists to prevent. A hold is decided by Shivam sending, not by the folder existing.
    // Found 2026-08-23, after four hold rows were added in one session and the fixer offered to
    // mark them all as applied. (`applications/inrisk-labs` is the pre-existing casualty: its
    // leads.md line reads `[d] ✓ processed` while its own note says "Left `[ ]` on purpose: this
    // is undecided, not applied".)
    const appliedGroup = c.group !== "pile" && c.group !== "hold";
    if (lead && lead.box === " " && appliedGroup && (coveredByTracker || (!row && folderComplete(c.folder)))) {
      drift.push({
        type: "lead-not-marked", key: c.key, company: c.display,
        detail: `leads.md line ${lead.line + 1} is [ ] but status is ${c.status}`,
        fixable: true, fix: { markLead: c.status === "skipped" ? "x" : "d", leadLine: lead.line },
      });
    }
    // Real work on disk that the tracker never recorded.
    if (folderComplete(c.folder) && !row) {
      drift.push({
        type: "folder-without-tracker-row", key: c.key, company: c.display,
        detail: `applications/${c.folder.slug}/ is folder-complete (${Object.entries(c.folder.has).filter(([, v]) => v).map(([k2]) => k2).join(", ")}) but has no tracker row`,
        fixable: false,
      });
    }
    // A row pointing at nothing on disk. Only worth flagging while the application is live —
    // a closed or rejected row with no folder is a lead that was researched and dropped, which
    // is a normal end state, not a bookkeeping error.
    if (row && !c.folder && !["closed", "rejected", "ghosted", "skipped"].includes(c.status)) {
      drift.push({
        type: "tracker-row-without-folder", key: c.key, company: c.display,
        detail: `tracker row "${row.company}" has no applications/ folder`, fixable: false,
      });
    }
    // A clock that will never fire because the cell is prose.
    if (c.followUpManual && ["sent", "followed-up", "replied"].includes(c.status)) {
      drift.push({
        type: "unclocked-follow-up", key: c.key, company: c.display,
        detail: `follow-up is "${c.followUpManual}" — no date, so the queue can never surface it`,
        fixable: false,
      });
    }
    c.drift = drift.filter((d) => d.key === c.key);
  }

  // Open lead issues that match no leads.md line at all.
  const seenIssues = new Set([...companies.values()].map((c) => c.issue?.number).filter(Boolean));
  for (const i of issues) {
    if (i.state === "open" && i.labels.includes("lead") && !seenIssues.has(i.number)) {
      drift.push({
        type: "orphan-issue", key: `issue-${i.number}`, company: i.title.replace(/^\[lead\]\s*/, "").slice(0, 60),
        issue: i.number, detail: `issue #${i.number} (opened ${i.createdAt}) maps to no leads.md line`,
        fixable: false,
      });
    }
  }

  return { companies, leads, tracker, folders, issues, drift, refreshed, today };
}

/** Group the drift by type, for reporting. */
export const driftByType = (drift) =>
  drift.reduce((m, d) => ((m[d.type] ||= []).push(d), m), {});
