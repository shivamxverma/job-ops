#!/usr/bin/env node
/**
 * actions — the do-this-now board.
 *
 * `dashboard.mjs` answers "what is the state of the pipeline". This answers the only other
 * question that matters at the start of a session: **what do I, Shivam, actually have to do,
 * in what order, and where is the link.**
 *
 * It exists because prose stopped working. `inbox/handoff.md`, `leads.md` and `signals.md` grew
 * past the point where the new rows are findable inside the old ones, so the honest failure mode
 * became: skim, recognise nothing, assume nothing is new, close the file. A checkbox cannot be
 * skimmed past, and a link cannot be "I'll find it later".
 *
 *   node scripts/actions.mjs            # serve on :7777 and open it
 *   node scripts/actions.mjs --port N   # different port
 *   node scripts/actions.mjs --no-open  # don't launch a browser
 *
 * Session-side CLI (used by the /go-live skill, not by hand):
 *   node scripts/actions.mjs live [--note "..."]   register this session as the listener
 *   node scripts/actions.mjs offline               deregister
 *   node scripts/actions.mjs next [--json]         pending commands
 *   node scripts/actions.mjs claim <id>            mark one running
 *   node scripts/actions.mjs done <id> [--result "..."] [--failed]
 *   node scripts/actions.mjs status
 *
 * Four ways a card writes back, which is the whole point:
 *   checkboxes  ticking every step fires `onDone` — mark-processed, or a surgical tracker
 *               status/follow-up rewrite (two cells by index, notes prose untouched).
 *   buttons     server-side actions the browser cannot do itself: reveal a folder in Finder,
 *               open a draft, run a command. Defined per card in `inbox/actions.json`.
 *   Work it     with a session live, the press lands on that session's event stream in ~2s and
 *               it starts working. With none live, it falls back to queueing in
 *               `inbox/intents.json` for the next session start.
 *   Ask         free text straight into the live session, global or per card.
 *
 * **The live half is the thing this board lacked for its whole life.** A node server has no
 * channel into a running Claude session, which is why "Work it" could only ever say "queued —
 * picked up next session". The session opens the channel from its side: `/go-live` arms a
 * Monitor over `scripts/watch-queue.mjs`, and from then on a button press is a line on that
 * session's event stream. The heartbeat that watcher writes is what the LIVE pill reads, so a
 * dead session greys every Claude-backed control within 30s with nothing to clean up. Ported
 * from hack-ops' command centre, where the mechanism was proven first.
 *
 * The server binds to 127.0.0.1 only and refuses to open any path outside the repo.
 */
import { createServer } from "node:http";
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { join, resolve } from "node:path";
import { execFile, execSync } from "node:child_process";
import { loadState, loadTracker, ROOT, TODAY } from "./lib/state.mjs";

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1]; };
const PORT = Number(flag("port", 7777));
const QUEUE = join(ROOT, "inbox/actions.json");
const STATE = join(ROOT, "inbox/.actions-state.json");
const INTENTS = join(ROOT, "inbox/intents.json");
const CTRL_DIR = join(ROOT, "control");
const CQUEUE = join(CTRL_DIR, "queue.json");
const SESSION = join(CTRL_DIR, "session.json");

/** A session counts as listening only while its heartbeat is fresh. The watcher beats every 2s. */
const BEAT_STALE_MS = 30_000;
/** How long a card stays in the "New leads" section after the board first saw it. */
const FRESH_DAYS = 3;
/**
 * How long a `running` command is trusted with no live session before it's declared abandoned.
 * Found 2026-08-24: a session claimed 22 "Work it" commands, then died without ever calling
 * `done`, and every one of them sat rendering "Claude is on it ⟳" for 9+ hours with nothing
 * actually happening — there was no expiry, so a dead claim looked identical to a live one.
 * A generous grace period, not a tight one: a real fork can legitimately run long.
 */
const RUNNING_STALE_MS = 20 * 60_000;

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const readJSON = (p, d) => { try { return JSON.parse(readFileSync(p, "utf8")); } catch { return d; } };
const gradeRank = { A: 0, B: 1, C: 2, D: 3, F: 4, "?": 5 };

// ---------------------------------------------------------------------------
// The live-session bridge
// ---------------------------------------------------------------------------
// Everything Claude-backed on this board is gated on one question: is a session listening
// right now. The answer is never taken on trust — it is the age of a heartbeat that a process
// owned by that session writes every two seconds. A session that dies stops beating, and the
// board notices without anyone telling it.
const ensureCtrl = () => { if (!existsSync(CTRL_DIR)) mkdirSync(CTRL_DIR, { recursive: true }); };
const writeJSON = (p, o) => { ensureCtrl(); writeFileSync(p, JSON.stringify(o, null, 2) + "\n"); };
/**
 * Read the live-session command queue, and reclaim any `running` command that no live session
 * can ever finish. A claim with no live heartbeat behind it for RUNNING_STALE_MS is not "in
 * progress" — the session that owned it is gone — so it is flipped to `failed` with a reason,
 * exactly like a real failure, rather than left to render "Claude is on it" forever. Only
 * touches commands when no session is currently live, so a genuinely long-running task under an
 * active session is never pre-empted.
 */
const loadCQueue = () => {
  const q = readJSON(CQUEUE, { commands: [] });
  q.commands ||= [];
  let dirty = false;
  if (!session().live) {
    for (const c of q.commands) {
      if (c.status !== "running") continue;
      const age = Date.now() - new Date(c.claimed || c.queued || 0);
      if (age > RUNNING_STALE_MS) {
        c.status = "failed";
        c.result = `no session finished this — claimed ${Math.round(age / 60000)}min ago, no live session since`;
        c.finished = new Date().toISOString();
        dirty = true;
      }
    }
    if (dirty) writeJSON(CQUEUE, q);
  }
  return q;
};

function session() {
  const s = readJSON(SESSION, null);
  if (!s) return { live: false, reason: "no session has gone live" };
  const age = Date.now() - new Date(s.beat || s.started || 0);
  if (age > BEAT_STALE_MS) {
    return {
      live: false, stale: true, age: Math.round(age / 1000), started: s.started, note: s.note,
      reason: `last heartbeat ${Math.round(age / 1000)}s ago — the session ended or stopped listening`,
    };
  }
  return { live: true, ...s, age: Math.round(age / 1000) };
}

/** Queue one command for the live session. Refused outright when nothing is listening, because
 *  a button that silently does nothing is the failure this whole mechanism exists to remove. */
function dispatch({ cmd, args = "", label = "", slug = "", cardId = "" }) {
  const sess = session();
  if (!sess.live) return { ok: false, reason: sess.reason };
  const q = loadCQueue();
  const id = Math.random().toString(36).slice(2, 14);
  q.commands.push({
    id, cmd, args, label: label || cmd, slug, cardId,
    origin: "board", status: "pending", queued: new Date().toISOString(),
  });
  writeJSON(CQUEUE, q);
  return { ok: true, id };
}


// ---------------------------------------------------------------------------
// Queue: hand-written items from the skills + derived items from state
// ---------------------------------------------------------------------------
function buildItems() {
  const queue = readJSON(QUEUE, { items: [] });
  const items = (queue.items || []).map((i) => ({ ...i }));
  // subkind is the fine-grained filter bucket for action-kind cards: a hand-written card
  // that didn't set one gets inferred from its id prefix, so every card is filterable.
  for (const i of items) {
    if (i.kind === "action" && !i.subkind) {
      i.subkind = i.id?.startsWith("followup-") ? "followup"
        : i.id?.startsWith("ready-") ? "ready"
        : i.id?.startsWith("hold-") ? "hold" : "other";
    }
  }
  const seen = new Set(items.map((i) => (i.company || "").toLowerCase()));
  const st = loadState();
  const today = TODAY();

  // Overdue follow-ups are never hand-written: they fall out of the clock. `sent` going silent
  // means touch 2 is owed; `followed-up` going silent again means touch 2 already happened and
  // the two-touch-max rule (CLAUDE.md step 8) says close it, not send a third message — these
  // used to render as the same generic "Follow up" card, which is why a company that had
  // already had its second touch kept generating what looked like a request for a third.
  for (const c of st.companies.values()) {
    if (!c.overdue || seen.has(c.display.toLowerCase())) continue;
    const days = c.followUp ? Math.round((new Date(today) - new Date(c.followUp)) / 86400000) : 0;
    const secondSilence = c.status === "followed-up";
    items.push({
      id: `followup-${c.key}`, kind: "action", subkind: "followup", company: c.display, grade: c.grade,
      title: secondSilence
        ? `Mark ghosted — silent since the follow-up (${days > 0 ? `${days}d` : "today"})`
        : `Follow up — ${days > 0 ? `${days}d overdue` : "due today"}`,
      sub: `${c.status} since ${c.since || "?"}${c.role ? ` · ${c.role}` : ""}`,
      buttons: secondSilence
        ? [{ label: "Reveal folder", action: "reveal", target: `applications/${c.folder?.slug || c.key}` }]
        : [
            { label: "Open Gmail drafts", action: "open", target: `https://mail.google.com/mail/u/0/#search/in%3Adrafts+${encodeURIComponent(c.display)}` },
            { label: "Reveal folder", action: "reveal", target: `applications/${c.folder?.slug || c.key}` },
          ],
      steps: secondSilence
        ? ["Two touches are already out with no reply — confirm, then mark ghosted"]
        : ["Read the drafted follow-up", "Send it"],
      background: c.notes || "",
      onDone: secondSilence
        ? { tracker: { company: c.display, status: "ghosted", followUp: "none" } }
        : { tracker: { company: c.display, status: "followed-up", followUp: "+7d" } },
      workable: true,
      workNote: secondSilence
        ? "verify no reply came in (check the live thread, not just the draft), then mark ghosted — two touches max, this is not a third message"
        : "ask Claude to write the follow-up if there is no draft yet, and confirm it was actually sent (not just typed into an open LinkedIn/X thread) before marking followed-up",
    });
  }

  // Folders that are complete but never went out — the work is done, the send is not.
  for (const c of st.companies.values()) {
    if (c.group !== "hold" || seen.has(c.display.toLowerCase())) continue;
    items.push({
      id: `hold-${c.key}`, kind: "action", subkind: "hold", company: c.display, grade: c.grade,
      title: "Drafted and waiting on you",
      sub: c.role || "", background: c.notes || "",
      buttons: [{ label: "Reveal folder", action: "reveal", target: `applications/${c.folder?.slug || c.key}` }],
      steps: ["Review what's in the folder", "Send / submit it"],
      onDone: { markProcessed: "done", slug: c.display },
      workable: true,
    });
  }

  // First-seen stamping. "New" has to mean something checkable, so the board records the first
  // time it ever rendered a card and never rewrites it. Without this, freshness would be a guess
  // off actions.json's mtime, which changes every time any skill appends anything.
  const st8 = readJSON(STATE, {});
  const coldStart = !st8.firstSeen;
  st8.firstSeen ||= {};
  let stamped = false;
  const nowISO = new Date().toISOString();
  const longAgo = new Date(Date.now() - (FRESH_DAYS + 30) * 86400000).toISOString();

  // Cold start (this feature's first ever run) has no history to read, and stamping every card
  // "now" would announce thirty old cards as new — the exact noise the section exists to remove.
  // So on that one run, anything with evidence of prior interaction is backdated: a ticked step,
  // a completion, a hand-added tag, or a Work-it intent all prove the card is not new. Everything
  // else is stamped now and the signal becomes exact from the next scout run onward.
  const touched = new Set([
    ...Object.keys(st8.steps || {}),
    ...Object.keys(st8.complete || {}),
    ...Object.keys(st8.tags || {}),
    ...(readJSON(INTENTS, { intents: [] }).intents || []).map((x) => x.id),
  ]);

  for (const i of items) {
    if (!st8.firstSeen[i.id]) {
      st8.firstSeen[i.id] = coldStart && touched.has(i.id) ? longAgo : nowISO;
      stamped = true;
    }
    i.firstSeen = st8.firstSeen[i.id];
    i.ageDays = (Date.now() - new Date(i.firstSeen)) / 86400000;
  }
  if (stamped) { try { writeFileSync(STATE, JSON.stringify(st8, null, 2)); } catch {} }

  // Which section a card lands in. This is the re-cut: **leads lead.** The old board opened with
  // "Do now" (every overdue follow-up, drafted-and-waiting card and one-off action), which meant
  // a scout run could add four fresh leads and they would render below thirty pieces of
  // housekeeping. A lead decays — a posting fills, a founder stops reading — and a follow-up does
  // not decay nearly as fast, so the fresh ones go on top and the aged, still-undecided ones sink
  // to their own section at the bottom rather than diluting the new pile.
  for (const i of items) i.section = sectionOf(i);

  items.sort((a, b) =>
    (SECTION_RANK[a.section] ?? 9) - (SECTION_RANK[b.section] ?? 9) ||
    (gradeRank[a.grade] ?? 5) - (gradeRank[b.grade] ?? 5) ||
    new Date(b.firstSeen) - new Date(a.firstSeen) ||
    String(a.company).localeCompare(String(b.company)));
  return items;
}

/**
 * A card's section. Kind alone was never enough: a lead found this morning and a lead that has
 * sat undecided for three weeks are the same `kind` and want opposite treatment.
 */
function sectionOf(i) {
  const kind = i.kind || "action";
  if (kind === "lead") return i.ageDays <= FRESH_DAYS ? "fresh" : "aged";
  if (kind === "signal") return "signal";
  if (kind === "network") return "network";
  // A referral ask is warm-channel work whatever `kind` the authoring skill happened to use, and
  // it converts better than anything in the cold pile. Route it by subkind so it never gets lost
  // among the follow-ups.
  if (i.subkind === "referral" || i.subkind === "network") return "network";
  return "now";
}

// ---------------------------------------------------------------------------
// Write-back
// ---------------------------------------------------------------------------
function markProcessed(slug, mode) {
  return new Promise((res) => {
    const args = [join(ROOT, "scripts/mark-processed.mjs"), slug];
    if (mode === "skip") args.push("--skip");
    if (mode === "signal-skip") args.push("--signals", "--skip");
    if (mode === "signal-promote") args.push("--signals", "--promote");
    execFile("node", args, { cwd: ROOT }, (err, stdout, stderr) =>
      res({ ok: !err, out: ((stdout || "") + (stderr || "")).trim() }));
  });
}

/**
 * Rewrite the status and follow-up cells of one tracker row, in place.
 *
 * Deliberately surgical: it finds the row through `loadTracker` (the one parser that has already
 * been bitten twice) and replaces two cells by index, leaving the notes prose and every other row
 * untouched. The board must never be able to reformat the tracker.
 */
function setTrackerCells(company, { status, followUp }) {
  const file = join(ROOT, "applications/tracker.md");
  const row = loadTracker().find((r) => r.company.toLowerCase() === String(company).toLowerCase());
  if (!row) return { ok: false, out: `no tracker row for ${company}` };
  const lines = readFileSync(file, "utf8").split("\n");
  const cells = lines[row.line].split("|");
  if (cells.length < 11) return { ok: false, out: `tracker line ${row.line + 1} has ${cells.length} cells, refusing to edit` };
  if (status) cells[8] = ` ${status} ${TODAY()} `;
  if (followUp) cells[9] = ` ${followUp === "+7d" ? new Date(Date.now() + 6048e5).toISOString().slice(0, 10) : followUp} `;
  lines[row.line] = cells.join("|");
  writeFileSync(file, lines.join("\n"));
  return { ok: true, out: `tracker: ${company} → ${status || "follow-up updated"}` };
}

async function runOnDone(item) {
  const d = item.onDone || {};
  const log = [];
  if (d.markProcessed) log.push((await markProcessed(d.slug || item.company, d.markProcessed)).out);
  if (d.tracker) log.push(setTrackerCells(d.tracker.company || item.company, d.tracker).out);
  return log.filter(Boolean).join(" · ") || "done (no repo write configured for this card)";
}

/**
 * A finished card leaves the board but is meant to be recoverable ("show N done", never
 * destroyed — see the CSS comment below). That promise was only visual until a real accidental
 * click (Shivam ticking a step on a card that hadn't actually happened) showed the repo write
 * itself was never undone, just hidden. This snapshots exactly what `runOnDone` is about to
 * touch, *before* it touches it, so `/api/undo` can put it back byte-for-byte rather than
 * guessing at a prior state.
 */
function snapshotForUndo(item) {
  const d = item.onDone || {};
  const snap = {};
  if (d.tracker) {
    const company = d.tracker.company || item.company;
    const row = loadTracker().find((r) => r.company.toLowerCase() === String(company).toLowerCase());
    if (row) {
      const lines = readFileSync(join(ROOT, "applications/tracker.md"), "utf8").split("\n");
      snap.tracker = { index: row.line, text: lines[row.line] };
    }
  }
  if (d.markProcessed) {
    const onSignals = d.markProcessed === "signal-skip" || d.markProcessed === "signal-promote";
    const file = join(ROOT, onSignals ? "inbox/signals.md" : "inbox/leads.md");
    if (existsSync(file)) {
      const lines = readFileSync(file, "utf8").split("\n");
      const q = String(d.slug || item.company).toLowerCase();
      const re = /^(\s*- \[)([ xX>dD])(\] \*\*(.+?)\*\*)(.*)$/;
      const idx = lines.findIndex((l) => { const m = l.match(re); return m && m[4].toLowerCase().includes(q); });
      if (idx !== -1) snap.markProcessed = { file, index: idx, text: lines[idx], onSignals };
    }
  }
  return snap;
}

/** Reverse exactly what `snapshotForUndo` captured. Best-effort on the GitHub side — the file
 *  restores are what actually matter, a stale-closed issue is a minor loose end, not data loss. */
async function undoOnDone(snap) {
  const log = [];
  if (snap?.tracker) {
    const file = join(ROOT, "applications/tracker.md");
    const lines = readFileSync(file, "utf8").split("\n");
    lines[snap.tracker.index] = snap.tracker.text;
    writeFileSync(file, lines.join("\n"));
    log.push("tracker row restored");
  }
  if (snap?.markProcessed) {
    const { file, index, text, onSignals } = snap.markProcessed;
    const lines = readFileSync(file, "utf8").split("\n");
    lines[index] = text;
    writeFileSync(file, lines.join("\n"));
    log.push(`${onSignals ? "signals.md" : "leads.md"} line restored`);
    const issuedPath = join(ROOT, "inbox/.issued.json");
    const hnId = (text.match(/item\?id=(\d+)/) || [])[1];
    const urlMatch = text.match(/https?:\/\/\S+/);
    const issued = existsSync(issuedPath) ? JSON.parse(readFileSync(issuedPath, "utf8")) : {};
    const issueNo = hnId ? issued[hnId] : urlMatch ? issued[`sig:${urlMatch[0]}`] : undefined;
    if (issueNo) {
      try {
        const state = execSync(`gh issue view ${issueNo} --json state -q .state`, { cwd: ROOT, encoding: "utf8" }).trim();
        if (state === "CLOSED") {
          execSync(`gh issue reopen ${issueNo} --comment ${JSON.stringify("Reopened via JobOps board undo — the earlier close was a mis-click.")}`, { cwd: ROOT, stdio: "pipe" });
          log.push(`GitHub issue #${issueNo} reopened`);
        }
      } catch (e) {
        log.push(`WARNING: could not reopen issue #${issueNo} — check by hand (${(e.message || "").split("\n")[0]})`);
      }
    }
  }
  return log.join(" · ") || "nothing to restore — this card made no tracked repo write";
}

/** `open` on a repo path or an http(s) URL. Anything else is refused. */
function openTarget(target, reveal) {
  if (/^https?:\/\//i.test(target)) { execSync(`open ${JSON.stringify(target)}`); return `opened ${new URL(target).host}`; }
  const p = resolve(ROOT, target);
  if (!p.startsWith(resolve(ROOT))) return "refused: path is outside the repo";
  if (!existsSync(p)) return `not found: ${target}`;
  execSync(`open ${reveal ? "-R " : ""}${JSON.stringify(p)}`);
  return `${reveal ? "revealed" : "opened"} ${target}`;
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------
const SECTIONS = [
  ["fresh",   "New leads",     `found in the last ${FRESH_DAYS} days — A first, then B, then C. These decay: a posting fills and a founder stops reading.`],
  ["now",     "Do now",        "follow-ups on the clock, drafted work waiting on a send, and anything else with your name on it"],
  ["network", "Network",       "warm paths, referrals, alumni asks — the highest-converting channel in the system"],
  ["signal",  "Signals",       "funding hits, no posting exists yet"],
  ["aged",    "Earlier leads", "still undecided, past the freshness window. Work one or pass on it; leaving it here costs nothing but tells you nothing either."],
];
const SECTION_RANK = Object.fromEntries(SECTIONS.map(([k], n) => [k, n]));

/**
 * The Work-it button has three honest states, because the button used to imply more than it
 * does. Pressing it writes to `inbox/intents.json` and nothing else happens: no Claude session
 * is listening, and nothing can be, since a node server has no channel into a running session.
 * The only thing that picks an intent up is the session-start routine. So the button says
 * "queued" until a session has actually handled it, and only then says it is done.
 */
const workBtn = (i, queued, handled, cmd) => {
  if (i.workable === false) return "";
  // Five honest states. The button has always been required to say exactly what it did, because
  // "queued for Claude" once implied work was starting when nothing at all was listening. With a
  // live session the press really does start work, so the label has to be able to say that too.
  let state = "", label = "Work it →";
  if (cmd?.status === "running") { state = "running"; label = "Claude is on it ⟳"; }
  else if (cmd?.status === "done") { state = "claudedone"; label = "done by Claude ✓"; }
  else if (cmd?.status === "failed") { state = "claudedone"; label = "Claude hit a problem"; }
  else if (cmd?.status === "pending") { state = "dispatched"; label = "sent to Claude ✓"; }
  else if (handled.has(i.id)) { state = "claudedone"; label = "done by Claude ✓"; }
  else if (queued.has(i.id)) { state = "queued"; label = "queued for Claude ✓"; }
  return `<button class="act work ${state}" data-action="work" data-company="${esc(i.company || "")}" data-kind="${esc(i.kind || "action")}">${label}</button>`;
};

/** The receipt a finished command leaves on its card. A result line is the only proof the
 *  session actually did the thing, so it is rendered even when the command failed. */
const cmdLine = (cmd) => {
  if (!cmd || (cmd.status !== "done" && cmd.status !== "failed")) return "";
  const txt = cmd.result || (cmd.status === "failed" ? "failed, no reason given" : "done");
  return `<p class="cmdresult${cmd.status === "failed" ? " failed" : ""}">${esc(txt)}</p>`;
};

/**
 * Cards write reasoning in markdown-lite (**bold**, `code`, blank-line paragraphs) because it's
 * the natural way to draft prose. Rendering it as literal asterisks in a wall of text is what
 * made the board unreadable, so this renders the same light subset actual browsers understand.
 */
const md = (s) => esc(s ?? "")
  .split(/\n\s*\n/).map((para) => para
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>"))
  .map((p) => `<p>${p}</p>`).join("");

const SUBKIND_LABEL = {
  followup: "follow-up", ready: "ready to send", hold: "drafted, waiting", other: "action",
};

// Common presets offered in the tag-add box. Free text is always allowed too — this is just
// what autocompletes, so repeat labels stay spelled the same way across cards.
const TAG_PRESETS = [
  "connection not accepted", "video required", "assignment required", "case study required",
  "waiting on reply", "recruiter unresponsive", "interview scheduled", "visa question open",
  "blocked on Shivam", "form gated", "needs manual review", "risky send",
];

/** Deadline badge: red if past, amber inside 48h, neutral otherwise. */
function deadlineBadge(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const ms = d - Date.now();
  const fmt = d.toLocaleString("en-US", { month: "short", day: "numeric",
    ...(iso.includes("T") ? { hour: "numeric", minute: "2-digit", hour12: true } : {}) });
  let cls = "normal", label = `Deadline ${fmt}`;
  if (ms < 0) { cls = "past"; label = `Deadline passed — was ${fmt}`; }
  else if (ms < 48 * 3600e3) { cls = "soon"; label = `Deadline ${fmt} (soon)`; }
  return `<p class="deadline ${cls}">⏰ ${esc(label)}</p>`;
}

const card = (i, done, queued, handled, cmds, live) => {
  // The most recent board-originated command for this card, if any. It is what turns the Work-it
  // button from a promise into a status.
  const cmd = cmds?.get(i.id);
  const checks = done.steps?.[i.id] || {};
  const steps = i.steps || [];
  const hit = steps.filter((_, n) => checks[n]).length;
  const complete = done.complete?.[i.id];
  const btns = [
    ...(i.buttons || []),
    ...(i.links || []).map((l) => ({ label: l.label, action: "open", target: l.url })),
  ];
  // fkind is the single filterable bucket: action cards split by subkind (followup/ready/
  // hold/other), everything else uses its top-level kind (lead/signal/network).
  const fkind = i.kind === "action" ? (i.subkind || "other") : i.kind;
  const gradeLetter = (i.grade || "").trim().charAt(0).toUpperCase();
  // Tags: once a card has been touched via the UI, done.tags[id] is the full authoritative
  // list (additions and removals both land there); untouched cards fall back to whatever the
  // skill authored in actions.json.
  const tags = done.tags?.[i.id] ?? i.tags ?? [];
  const seen = !!done.seen?.[i.id];
  const minimized = !!done.minimized?.[i.id];
  const dismissed = !!done.dismissed?.[i.id];
  return `
<article class="card${complete ? " done" : ""}${seen ? " seen" : ""}${minimized ? " minimized" : ""}${dismissed ? " dismissed" : ""}" data-id="${esc(i.id)}" id="card-${esc(i.id)}"
  data-fkind="${esc(fkind)}" data-grade="${esc(gradeLetter)}" data-stuck="${i.stuck ? "1" : "0"}">
  <header>
    ${i.grade ? `<span class="chip g${esc(gradeLetter)}">${esc(i.grade)}</span>` : ""}
    ${i.kind === "action" ? `<span class="chip sub">${esc(SUBKIND_LABEL[i.subkind] || "action")}</span>` : ""}
    <h3>${esc(i.company || i.title)}</h3>
    <span class="prog">${steps.length ? `${hit}/${steps.length}` : ""}</span>
    <span class="cardctl">
      <button class="ctlbtn ctlseen" data-action="seen" title="${seen ? "Mark unseen" : "Mark as seen — fades the card"}">${seen ? "◐" : "👁"}</button>
      <button class="ctlbtn ctlmin" data-action="min" title="${minimized ? "Expand" : "Minimize"}">${minimized ? "▾" : "–"}</button>
      <button class="ctlbtn ctlclose" data-action="dismiss" title="Remove from the board">×</button>
    </span>
  </header>
  <p class="title">${esc(i.title)}</p>
  ${i.sub ? `<p class="sub">${esc(i.sub)}</p>` : ""}
  ${deadlineBadge(i.deadline)}
  ${i.stuck ? `<p class="stuckline">⚠ Stuck: ${esc(i.stuck)}</p>` : ""}
  <div class="tags">${tags.map((t) => `<span class="tag">${esc(t)}<button class="tagx" data-tag="${esc(t)}" title="remove">×</button></span>`).join("")}
    <span class="tagadd"><input type="text" placeholder="+ label" list="tagpresets" maxlength="60"></span></div>
  ${btns.length || i.workable !== false ? `<div class="btns">${btns.map((b) =>
    `<button class="act" data-action="${esc(b.action || "open")}" data-target="${esc(b.target || "")}">${esc(b.label)}</button>`).join("")}${workBtn(i, queued, handled, cmd)}</div>` : ""}
  ${cmdLine(cmd)}
  ${live ? `<div class="cardask"><input placeholder="Ask Claude about ${esc(i.company || i.title)}…" maxlength="400"><button class="act send" data-action="cardask">Send →</button></div>` : ""}
  ${steps.length ? `<ul class="steps">${steps.map((s, n) => `
    <li><label><input type="checkbox" data-step="${n}"${checks[n] ? " checked" : ""}><span>${esc(s)}</span></label></li>`).join("")}</ul>` : ""}
  ${i.copyText ? `<div class="copybox">
    <div class="copyhead"><span>Message to send</span><button class="copybtn" data-copy="${esc(i.copyText)}">Copy</button></div>
    <pre class="copytext">${esc(i.copyText)}</pre>
  </div>` : ""}
  ${i.background ? `<details><summary>Why / background</summary><div class="bg">${md(i.background)}</div></details>` : ""}
  <p class="fired">${complete ? esc(complete) : ""}</p>
  ${complete ? `<button class="act undo" data-action="undo">Undo — this was a mistake</button>` : ""}
  ${dismissed ? `<button class="act restore" data-action="restore">Restore — bring this card back</button>` : ""}
</article>`;
};

function render() {
  const items = buildItems();
  const done = readJSON(STATE, { steps: {}, complete: {} });
  const intents = readJSON(INTENTS, { intents: [] }).intents || [];
  const pending = intents.filter((x) => !x.handled);
  const queued = new Set(pending.map((x) => x.id));
  const handled = new Set(intents.filter((x) => x.handled).map((x) => x.id));
  const open = items.filter((i) => !done.complete?.[i.id] && !done.dismissed?.[i.id]);
  const finished = items.filter((i) => done.complete?.[i.id]).length;
  const dismissedCount = items.filter((i) => done.dismissed?.[i.id] && !done.complete?.[i.id]).length;

  // The LIVE pill is not a claim, it is the age of a heartbeat written by a process the session
  // owns. That is the whole reason it can be trusted: nothing has to remember to switch it off.
  const sess = session();
  const livePill = sess.live
    ? `<span class="pill live" id="livepill" title="${esc(sess.note || "")}">● LIVE <b>listening</b></span>`
    : `<span class="pill dead" id="livepill" title="${esc(sess.reason || "")}">○ not live</span>`;

  // Free text straight into the session. Disabled, visibly and with the reason, when nothing is
  // listening — a box that swallows a question is worse than no box.
  const askBox = `<div class="askbar${sess.live ? "" : " off"}">
    <input id="askinput" placeholder="${sess.live
      ? "Ask Claude anything, or type a slash command (e.g. /tech-read ao-agents)"
      : "No session listening — say &quot;go live&quot; in a Claude session to enable this"}"
      ${sess.live ? "" : "disabled"}>
    <button id="asksend" class="act send" ${sess.live ? "" : "disabled"}>Send →</button>
  </div>`;

  // Board-originated commands, newest per card. Only presses that came from *this* board are
  // mapped back onto cards; a command typed into the ask bar has no card and is not shown here.
  const cmds = new Map();
  for (const c of loadCQueue().commands) {
    if (!c.cardId) continue;
    const prev = cmds.get(c.cardId);
    if (!prev || new Date(c.queued) >= new Date(prev.queued)) cmds.set(c.cardId, c);
  }

  // A deadline is the one thing on this board that's genuinely time-bound, so it gets its own
  // panel above everything else regardless of which section or filter the card lives under.
  const withDeadline = open.filter((i) => i.deadline && !isNaN(new Date(i.deadline)));
  withDeadline.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  const deadlinePanel = withDeadline.length ? `<div class="deadlines">
    <h2>⏰ Deadlines</h2>
    ${withDeadline.map((i) => {
      const d = new Date(i.deadline);
      const past = d - Date.now() < 0;
      const fmt = d.toLocaleString("en-US", { month: "short", day: "numeric",
        ...(String(i.deadline).includes("T") ? { hour: "numeric", minute: "2-digit", hour12: true } : {}) });
      return `<a href="#card-${esc(i.id)}" class="dlrow ${past ? "past" : ""}">
        <span class="dlwhen">${esc(fmt)}</span><span class="dlwhat">${esc(i.company || i.title)}${past ? " — passed" : ""}</span></a>`;
    }).join("")}
  </div>` : "";

  const body = SECTIONS.map(([kind, label, hint]) => {
    const mine = items.filter((i) => i.section === kind);
    if (!mine.length) return "";
    const left = mine.filter((i) => !done.complete?.[i.id]).length;
    return `<section id="s-${kind}"${left ? "" : ' class="allclear"'}><div class="shead"><h2>${label}</h2><span class="count">${left}</span></div>
      <p class="hint">${hint}</p>
      <div class="cards">${mine.map((i) => card(i, done, queued, handled, cmds, sess.live)).join("")}</div></section>`;
  }).join("");

  // The banner exists because "queued for Claude" was doing work the system does not do.
  // Nothing is listening to intents.json; the next session reads it. Say so, and say the words.
  // The banner has one job: say truthfully what will happen to the queued intents. That answer
  // changed the moment a session could be live, and a banner still saying "nothing is listening"
  // while the pill says LIVE is the same lie the Work-it button used to tell.
  const banner = pending.length ? `<div class="banner">
    <b>${pending.length} queued for Claude</b> — ${esc(pending.map((x) => x.company).join(", "))}.
    ${sess.live
      ? `A session <b>is</b> listening — say <code>run intents</code> to have it pick these up now.`
      : `Nothing is listening right now: open a Claude session and say <code>run intents</code> (or anything at all, it runs at session start).`}
  </div>` : "";

  const nav = SECTIONS.filter(([k]) => items.some((i) => i.section === k))
    .map(([k, l]) => `<a href="#s-${k}">${l} <b>${items.filter((i) => i.section === k && !done.complete?.[i.id]).length}</b></a>`).join("");

  const stuckCount = items.filter((i) => i.stuck && !done.complete?.[i.id]).length;
  const KIND_CHIPS = [
    ["", "All"], ["followup", "Follow-ups"], ["ready", "Ready to send"], ["hold", "Drafted, waiting"],
    ["lead", "Leads"], ["signal", "Signals"], ["network", "Network"],
  ];
  const GRADE_CHIPS = [["", "All"], ["A", "A"], ["B", "B"], ["C", "C"], ["D,F", "D/F"]];
  const filters = `<div class="filters">
    <div class="chipgroup" data-group="kind">
      ${KIND_CHIPS.map(([v, l]) => `<button class="chip-btn${v === "" ? " active" : ""}" data-value="${esc(v)}">${esc(l)}</button>`).join("")}
    </div>
    <div class="chipgroup" data-group="grade">
      <span class="lbl">Grade</span>
      ${GRADE_CHIPS.map(([v, l]) => `<button class="chip-btn${v === "" ? " active" : ""}" data-value="${esc(v)}">${esc(l)}</button>`).join("")}
    </div>
    <div class="chipgroup" data-group="stuck">
      <button class="chip-btn stuckbtn" data-value="1">⚠ Stuck only${stuckCount ? ` (${stuckCount})` : ""}</button>
    </div>
  </div>`;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>JobOps — do now</title>
<style>
 :root{
   --bg:#0d0f13; --panel:#151920; --card:#1a1f28; --card2:#212734;
   --text:#e6e9ef; --dim:#8d94a5; --faint:#5d6474; --line:#272d3a;
   --a:#4fd39a; --b:#5fa8e8; --c:#e0b04c; --hot:#f0655c; --acc:#7c7ff0;
   --r:10px;
 }
 *{box-sizing:border-box;margin:0}
 html{scroll-behavior:smooth}
 body{background:var(--bg);color:var(--text);
   font:15px/1.55 -apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;
   padding:0 20px 80px;max-width:860px;margin:0 auto;-webkit-font-smoothing:antialiased}
 code,.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}

 .top{position:sticky;top:0;background:linear-gradient(var(--bg) 72%,transparent);
   padding:26px 0 14px;z-index:20}
 h1{font-size:23px;letter-spacing:-.02em;font-weight:640}
 .stamp{color:var(--faint);font-size:12.5px;margin-top:4px}
 nav{display:flex;gap:7px;flex-wrap:wrap;margin-top:14px}
 nav a{background:var(--panel);border:1px solid var(--line);border-radius:99px;
   padding:4px 13px;color:var(--dim);text-decoration:none;font-size:12.5px;transition:.15s}
 nav a:hover{border-color:var(--acc);color:var(--text)}
 nav a b{color:var(--text);font-weight:640}

 .filters{display:flex;flex-direction:column;gap:8px;margin-top:12px;padding:12px 13px;
   background:var(--panel);border:1px solid var(--line);border-radius:9px}
 .chipgroup{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
 .chipgroup .lbl{color:var(--faint);font-size:10.5px;text-transform:uppercase;
   letter-spacing:.08em;margin-right:2px}
 .chip-btn{background:var(--card);border:1px solid var(--line);border-radius:99px;
   padding:4px 12px;color:var(--dim);font:inherit;font-size:12px;cursor:pointer;transition:.15s}
 .chip-btn:hover{border-color:var(--acc);color:var(--text)}
 .chip-btn.active{background:var(--acc);border-color:var(--acc);color:#fff}
 .chip-btn.stuckbtn.active{background:var(--hot);border-color:var(--hot);color:#fff}
 .card.filtered-out{display:none}
 section.filtered-empty{display:none}

 section{margin:30px 0}
 .shead{display:flex;align-items:center;gap:9px}
 h2{font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:var(--dim);font-weight:660}
 .count{background:var(--card2);border-radius:99px;padding:1px 9px;font-size:11.5px;color:var(--text);font-weight:600}
 .hint{color:var(--faint);font-size:12.5px;margin:3px 0 13px}
 .cards{display:flex;flex-direction:column;gap:11px}

 .card{background:var(--card);border:1px solid var(--line);border-radius:var(--r);
   padding:15px 17px;transition:.2s;position:relative;overflow:hidden}
 .card:hover{border-color:#333b4d}
 .card::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:transparent}
 /* A finished card leaves the board. It is recoverable behind "show N done", never destroyed —
    hiding what happened would make the board as untrustworthy as the files it replaced. Each
    done card there also carries an Undo button that actually reverses the repo write (tracker
    row / leads.md line restored, GitHub issue reopened if it closed one), not just the UI. */
 .card.done{display:none}
 body.show-done .card.done{display:block;opacity:.45}
 body.show-done .card.done::before{background:var(--a)}
 .card.leaving{opacity:0;transform:translateX(14px);transition:.32s}
 section.allclear{display:none} body.show-done section.allclear{display:block}
 /* Seen: a card Shivam has already read the reasoning on. One click, purely visual, nothing
    written except the flag itself — the point is cutting how much re-reading a busy board costs. */
 .card.seen{opacity:.55}
 .card.seen:hover{opacity:1}
 /* Minimized: collapse everything but the header row. Still on the board, still counted, just
    out of the way until reopened. */
 .card.minimized .title,.card.minimized .sub,.card.minimized .deadline,.card.minimized .stuckline,
 .card.minimized .tags,.card.minimized .btns,.card.minimized .cmdresult,.card.minimized .cardask,
 .card.minimized .steps,.card.minimized .copybox,.card.minimized details,.card.minimized .fired{display:none}
 /* Dismissed: removed from the board entirely, no repo write, recoverable behind "show N
    dismissed" — same non-destructive promise as a done card, for a card that was just noise. */
 .card.dismissed{display:none}
 body.show-dismissed .card.dismissed{display:block;opacity:.4}
 body.show-dismissed .card.dismissed::before{background:var(--hot)}
 .cardctl{display:flex;gap:2px;margin-left:auto}
 .card.done .cardctl,.card.minimized .prog{display:none}
 .ctlbtn{background:none;border:none;color:var(--faint);font:inherit;font-size:13px;
   cursor:pointer;padding:2px 6px;border-radius:6px;line-height:1;transition:.15s}
 .ctlbtn:hover{background:var(--card2);color:var(--text)}
 .ctlclose:hover{background:#2a1616;color:#f0a8a3}
 .card.seen .ctlseen{color:var(--a)}
 .act.restore{display:block;margin-top:10px;border-color:#2f5c44;background:#152a1f;color:var(--a)}
 .act.restore:hover{border-color:var(--a);color:#fff}
 .allclear-msg{display:none}
 body.empty .allclear-msg{display:block}
 body.empty.show-done .allclear-msg{display:none}
 .linky{background:none;border:none;color:var(--b);font:inherit;font-size:12.5px;
   cursor:pointer;padding:0;text-decoration:underline dotted}
 .linky:hover{color:var(--text)}
 .banner{margin-top:13px;background:#1d1a38;border:1px solid #3a3570;border-radius:9px;
   padding:10px 14px;font-size:13px;color:#c9c7ff;line-height:1.5}
 .banner b{color:#fff} .banner code{background:#2b2752;padding:1.5px 7px;border-radius:5px;font-size:12px}
 .card header{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:5px}
 .card h3{font-size:15px;font-weight:640;letter-spacing:-.01em}
 .prog{margin-left:auto;color:var(--faint);font-size:12px;font-variant-numeric:tabular-nums}
 .title{font-size:14.5px;color:var(--text)}
 .sub{color:var(--dim);font-size:13px;margin-top:3px}
 .chip.sub{background:var(--card2);color:var(--dim);border:1px solid var(--line);font-weight:600}
 .stuckline{margin-top:9px;background:#2a1616;border:1px solid #5c2f2f;color:#f0a8a3;
   font-size:12.5px;border-radius:7px;padding:6px 11px;line-height:1.5}
 .deadline{margin-top:8px;font-size:12.5px;font-weight:600;border-radius:7px;
   padding:5px 11px;display:inline-block}
 .deadline.normal{background:var(--card2);color:var(--dim);border:1px solid var(--line)}
 .deadline.soon{background:#332912;color:#e8c46a;border:1px solid #6b5320}
 .deadline.past{background:#2a1616;color:#f0a8a3;border:1px solid #5c2f2f}

 .deadlines{background:var(--panel);border:1px solid var(--line);border-radius:9px;
   padding:12px 14px;margin-top:14px}
 .deadlines h2{font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:var(--dim);
   font-weight:660;margin-bottom:8px}
 .dlrow{display:flex;gap:10px;align-items:baseline;padding:4px 0;text-decoration:none;
   color:var(--text);font-size:13.5px;border-bottom:1px solid var(--line)}
 .dlrow:last-child{border-bottom:none}
 .dlrow:hover .dlwhat{text-decoration:underline}
 .dlrow .dlwhen{color:var(--hot);font-weight:660;font-variant-numeric:tabular-nums;flex:none;min-width:110px}
 .dlrow.past .dlwhen{color:var(--faint)}
 .dlrow.past .dlwhat{color:var(--faint)}

 .tags{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:9px}
 .tag{display:inline-flex;align-items:center;gap:5px;background:#26304a;border:1px solid #35426b;
   color:#a9c2f0;border-radius:99px;padding:2px 5px 2px 11px;font-size:11.5px;font-weight:600}
 .tagx{background:none;border:none;color:#7f93bd;cursor:pointer;font-size:13px;line-height:1;
   padding:2px 6px;border-radius:99px}
 .tagx:hover{background:#3a4770;color:#fff}
 .tagadd input{background:transparent;border:1px dashed var(--line);border-radius:99px;
   padding:3px 11px;color:var(--dim);font:inherit;font-size:11.5px;width:88px;transition:.15s}
 .tagadd input:focus{outline:none;border-style:solid;border-color:var(--acc);color:var(--text);width:150px}
 .tagadd input::placeholder{color:var(--faint)}

 .btns{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}
 .act{background:var(--card2);border:1px solid var(--line);border-radius:7px;padding:5px 12px;
   color:var(--text);font:inherit;font-size:12.5px;cursor:pointer;transition:.15s}
 .act:hover{border-color:var(--b);color:#fff}
 .act:active{transform:translateY(1px)}
 .act.work{border-color:#3a3570;background:#221f45;color:#c3c1ff}
 .act.work:hover{border-color:var(--acc)}
 /* queued = written to intents.json, nothing has read it yet. claudedone = a session handled it. */
 .act.work.queued{background:#33301f;border-color:#6b5f2e;color:#e8d48a;cursor:default}
 .act.work.queued:hover{border-color:#6b5f2e}
 .act.undo{display:block;margin-top:10px;border-color:#6b2e2e;background:#2a1a1a;color:#e89a9a}
 .act.undo:hover{border-color:#c44;color:#fff}
 .act.work.claudedone{background:#152a1f;border-color:#2f5c44;color:var(--a);cursor:default}
 .act.work.claudedone:hover{border-color:#2f5c44}

 .steps{list-style:none;padding:0;margin:13px 0 0}
 .steps li+li{margin-top:2px}
 .steps label{display:flex;gap:10px;align-items:flex-start;cursor:pointer;font-size:14px;
   padding:5px 8px;margin-left:-8px;border-radius:7px;transition:background .15s}
 .steps label:hover{background:var(--card2)}
 .steps input{appearance:none;width:17px;height:17px;flex:none;margin-top:2px;border-radius:5px;
   border:1.5px solid #3d4557;background:transparent;cursor:pointer;transition:.15s;position:relative}
 .steps input:hover{border-color:var(--a)}
 .steps input:checked{background:var(--a);border-color:var(--a)}
 .steps input:checked::after{content:"";position:absolute;left:5px;top:1.5px;width:4px;height:9px;
   border:solid #0b1a12;border-width:0 2px 2px 0;transform:rotate(42deg)}
 .steps input:checked + span{color:var(--faint);text-decoration:line-through}

 details{margin-top:12px}
 summary{color:var(--dim);font-size:12.5px;cursor:pointer;list-style:none;
   display:inline-flex;align-items:center;gap:5px;user-select:none}
 summary::-webkit-details-marker{display:none}
 summary::before{content:"▸";color:var(--faint);transition:.15s}
 details[open] summary::before{transform:rotate(90deg)}
 summary:hover{color:var(--text)}
 .bg{color:var(--dim);font-size:13px;margin-top:9px;line-height:1.6;
   border-left:2px solid var(--line);padding:2px 0 2px 13px}
 .bg p{margin:0 0 10px} .bg p:last-child{margin-bottom:0}
 .bg strong{color:var(--text);font-weight:640}
 .bg code{background:var(--card2);padding:1px 5px;border-radius:4px;font-size:12px}

 .copybox{margin-top:12px;border:1px solid var(--line);border-radius:9px;overflow:hidden;background:var(--card2)}
 .copyhead{display:flex;align-items:center;justify-content:space-between;
   padding:6px 11px;font-size:11.5px;color:var(--dim);text-transform:uppercase;letter-spacing:.06em;
   border-bottom:1px solid var(--line)}
 .copybtn{background:var(--acc);border:none;border-radius:6px;padding:3px 11px;
   color:#fff;font:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:.15s}
 .copybtn:hover{opacity:.85} .copybtn:active{transform:translateY(1px)}
 .copybtn.copied{background:var(--a);color:#062016}
 .copytext{margin:0;padding:11px;font-size:13px;line-height:1.55;color:var(--text);
   white-space:pre-wrap;font-family:inherit;max-height:280px;overflow-y:auto}

 .fired{color:var(--a);font-size:12px;margin-top:10px;min-height:0}
 .fired:empty{display:none}
 .chip{font-size:10.5px;border-radius:5px;padding:1px 7px;font-weight:700;letter-spacing:.03em}
 .gA{background:var(--a);color:#062016}.gB{background:var(--b);color:#04182b}
 .gC{background:var(--c);color:#231a05}.gD,.gF{background:var(--line);color:var(--dim)}
 .none{color:var(--dim);padding:40px 0;text-align:center}
 .toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%) translateY(80px);
   background:var(--card2);border:1px solid var(--line);border-radius:9px;padding:9px 17px;
   font-size:13px;transition:transform .22s;z-index:60;box-shadow:0 8px 30px #0008}
 .toast.show{transform:translateX(-50%) translateY(0)}

 /* --- live-session bridge --- */
 .titlerow{display:flex;align-items:center;gap:11px;flex-wrap:wrap}
 .pill{font-size:11.5px;font-weight:640;border-radius:99px;padding:3px 11px;
   letter-spacing:.01em;white-space:nowrap;cursor:default}
 .pill.live{background:#12301f;border:1px solid #2c6a44;color:#5fd39a}
 .pill.live b{color:#a9f0cb;font-weight:640}
 .pill.dead{background:var(--card2);border:1px solid var(--line);color:var(--faint)}
 .askbar{display:flex;gap:8px;margin-top:12px}
 .askbar input{flex:1;background:var(--panel);border:1px solid var(--line);border-radius:9px;
   padding:9px 13px;color:var(--text);font:inherit;font-size:13.5px}
 .askbar input:focus{outline:none;border-color:var(--acc)}
 .askbar.off input{color:var(--faint);cursor:not-allowed}
 .askbar.off .act.send{opacity:.4;cursor:not-allowed}
 .act.send{background:var(--acc);border-color:var(--acc);color:#fff;font-weight:600}
 .act.send:hover{filter:brightness(1.1);color:#fff}
 .act.work.dispatched{background:#221f45;border-color:#4b46a8;color:#c3c1ff}
 .act.work.running{background:#12233d;border-color:#2f5c96;color:#8fc2f5}
 .act:disabled{opacity:.4;cursor:not-allowed}
 .cmdresult{margin-top:9px;background:#12301f;border:1px solid #2c6a44;color:#a9f0cb;
   font-size:12.5px;border-radius:7px;padding:6px 11px;line-height:1.5}
 .cmdresult.failed{background:#2a1616;border-color:#5c2f2f;color:#f0a8a3}
 .cardask{display:none;gap:7px;margin-top:9px}
 .cardask.open{display:flex}
 .cardask input{flex:1;background:var(--card2);border:1px solid var(--line);border-radius:7px;
   padding:6px 11px;color:var(--text);font:inherit;font-size:12.5px}
 .cardask input:focus{outline:none;border-color:var(--acc)}
</style></head><body>
<div class="top">
  <div class="titlerow">
    <h1>What you have to do</h1>
    ${livePill}
  </div>
  <div class="stamp">${TODAY()} · <b>${open.length}</b> open · ticking every box on a card writes the result back into the repo${
    finished ? ` · <button id="toggle" class="linky">show ${finished} done</button>` : ""}${
    dismissedCount ? ` · <button id="toggle2" class="linky">show ${dismissedCount} dismissed</button>` : ""}</div>
  ${askBox}
  <nav>${nav}</nav>
  ${filters}
  ${banner}
  ${deadlinePanel}
</div>
<datalist id="tagpresets">${TAG_PRESETS.map((t) => `<option value="${esc(t)}">`).join("")}</datalist>
${body || '<p class="none">Nothing queued. Run the scouts, or /autoapply.</p>'}
<p class="none allclear-msg">Everything on the board is done. Nothing is waiting on you.</p>
<div class="toast" id="toast"></div>
<script>
const toast = (m) => { const t = document.getElementById("toast");
  t.textContent = m; t.classList.add("show"); clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 2600); };

const post = (u, b) => fetch(u, { method:"POST", headers:{"content-type":"application/json"},
  body: JSON.stringify(b) }).then(r => r.json());

let wasLive = ${sess.live ? "true" : "false"};
const escHtml = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
let pendingList = ${JSON.stringify(pending.map((x) => x.company))};
const renderBanner = () => {
  let el = document.querySelector(".banner");
  if (!pendingList.length) { if (el) el.remove(); return; }
  const tail = wasLive
    ? \`A session <b>is</b> listening — say <code>run intents</code> to have it pick these up now.\`
    : \`Nothing is listening right now: open a Claude session and say <code>run intents</code> (or anything at all, it runs at session start).\`;
  const html = \`<b>\${pendingList.length} queued for Claude</b> — \${pendingList.map(escHtml).join(", ")}. \${tail}\`;
  if (el) { el.innerHTML = html; return; }
  el = document.createElement("div"); el.className = "banner"; el.innerHTML = html;
  document.querySelector(".top").appendChild(el);
};

// Filter state: empty kind/grade sets mean "no restriction" (the "All" chip).
const filterState = { kinds: new Set(), grades: new Set(), stuckOnly: false };

const applyFilters = () => {
  document.querySelectorAll(".card").forEach((c) => {
    const okKind = !filterState.kinds.size || filterState.kinds.has(c.dataset.fkind);
    const okGrade = !filterState.grades.size || filterState.grades.has(c.dataset.grade);
    const okStuck = !filterState.stuckOnly || c.dataset.stuck === "1";
    c.classList.toggle("filtered-out", !(okKind && okGrade && okStuck));
  });
  recount();
};

const recount = () => {
  const showDone = document.body.classList.contains("show-done");
  const showDismissed = document.body.classList.contains("show-dismissed");
  document.querySelectorAll("section").forEach(s => {
    const cards = [...s.querySelectorAll(".card")];
    const visible = cards.filter(c => !c.classList.contains("filtered-out"));
    const left = visible.filter(c => !c.classList.contains("done") && !c.classList.contains("dismissed")).length;
    s.querySelector(".count").textContent = left;
    s.classList.toggle("allclear", left === 0);
    const shown = visible.filter(c =>
      (showDone || !c.classList.contains("done")) && (showDismissed || !c.classList.contains("dismissed"))).length;
    s.classList.toggle("filtered-empty", shown === 0);
  });
  const visibleCards = [...document.querySelectorAll(".card")].filter(c => !c.classList.contains("filtered-out"));
  const doneCards = visibleCards.filter(c => c.classList.contains("done"));
  const dismissedCards = visibleCards.filter(c => c.classList.contains("dismissed") && !c.classList.contains("done"));
  const open = visibleCards.length - doneCards.length - dismissedCards.length;
  document.querySelector(".stamp b").textContent = open;
  document.body.classList.toggle("empty", open === 0);
  let t = document.getElementById("toggle");
  if (doneCards.length > 0) {
    if (!t) { t = document.createElement("button"); t.id = "toggle"; t.className = "linky";
      document.querySelector(".stamp").append(" · ", t); }
    t.textContent = (showDone ? "hide " : "show ") + doneCards.length + " done";
  } else if (t) t.remove();
  let t2 = document.getElementById("toggle2");
  if (dismissedCards.length > 0) {
    if (!t2) { t2 = document.createElement("button"); t2.id = "toggle2"; t2.className = "linky";
      document.querySelector(".stamp").append(" · ", t2); }
    t2.textContent = (showDismissed ? "hide " : "show ") + dismissedCards.length + " dismissed";
  } else if (t2) t2.remove();
};

document.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip-btn");
  if (!chip) return;
  const group = chip.closest(".chipgroup").dataset.group;
  if (group === "stuck") {
    chip.classList.toggle("active");
    filterState.stuckOnly = chip.classList.contains("active");
    applyFilters();
    return;
  }
  const set = group === "kind" ? filterState.kinds : filterState.grades;
  const groupEl = chip.closest(".chipgroup");
  if (chip.dataset.value === "") {
    set.clear();
    groupEl.querySelectorAll(".chip-btn").forEach(b => b.classList.remove("active"));
    chip.classList.add("active");
  } else {
    groupEl.querySelector('[data-value=""]').classList.remove("active");
    chip.classList.toggle("active");
    for (const v of chip.dataset.value.split(",")) chip.classList.contains("active") ? set.add(v) : set.delete(v);
    if (!set.size) groupEl.querySelector('[data-value=""]').classList.add("active");
  }
  applyFilters();
});

document.addEventListener("change", async (e) => {
  if (e.target.type !== "checkbox") return;
  const card = e.target.closest(".card");
  const j = await post("/api/check", { id: card.dataset.id, step: +e.target.dataset.step, checked: e.target.checked });
  card.querySelector(".prog").textContent = j.total ? j.hit + "/" + j.total : "";
  if (j.fired) { card.querySelector(".fired").textContent = j.fired; toast(j.fired); }
  if (j.complete && !document.body.classList.contains("show-done")) {
    // Let the tick register visually, then the card leaves the board.
    card.classList.add("leaving");
    setTimeout(() => { card.classList.remove("leaving"); card.classList.add("done"); recount(); }, 420);
  } else {
    card.classList.toggle("done", !!j.complete);
    recount();
  }
});

// --- the ask bar ---
const sendAsk = async () => {
  const input = document.getElementById("askinput");
  const btn = document.getElementById("asksend");
  const text = input.value.trim();
  if (!text || input.disabled) return;
  btn.disabled = true;
  const j = await post("/api/ask", { text });
  btn.disabled = false;
  if (j.ok) input.value = "";
  toast(j.msg);
};
document.addEventListener("click", (e) => { if (e.target.id === "asksend") sendAsk(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.id === "askinput") sendAsk();
  // A per-card ask box submits on Enter too; the box only exists while a session is live.
  if (e.key === "Enter" && e.target.closest(".cardask")) e.target.nextElementSibling.click();
});

// --- keep the LIVE pill and in-flight commands honest without a reload ---
// The pill is the age of a heartbeat, so it has to be re-read rather than remembered. This also
// walks a card's Work-it button through claimed -> done as the session actually gets there.
setInterval(async () => {
  let s; try { s = await fetch("/api/live").then(r => r.json()); } catch { return; }
  const pill = document.getElementById("livepill");
  if (pill) {
    pill.className = "pill " + (s.live ? "live" : "dead");
    pill.innerHTML = s.live ? "● LIVE <b>listening</b>" : "○ not live";
    pill.title = s.live ? (s.note || "") : (s.reason || "");
  }
  // A session going live or dying changes which controls make sense, and the honest way to
  // re-derive that is a reload rather than trying to patch every disabled attribute by hand.
  if (s.live !== wasLive) { wasLive = s.live; location.reload(); return; }

  for (const [id, c] of Object.entries(s.cards || {})) {
    const card = document.querySelector('.card[data-id="' + CSS.escape(id) + '"]');
    if (!card) continue;
    const btn = card.querySelector("button.act.work");
    if (btn) {
      btn.classList.remove("dispatched", "running", "claudedone");
      if (c.status === "pending") { btn.classList.add("dispatched"); btn.textContent = "sent to Claude ✓"; }
      else if (c.status === "running") { btn.classList.add("running"); btn.textContent = "Claude is on it ⟳"; }
      else if (c.status === "done") { btn.classList.add("claudedone"); btn.textContent = "done by Claude ✓"; }
      else if (c.status === "failed") { btn.classList.add("claudedone"); btn.textContent = "Claude hit a problem"; }
    }
    if (c.status === "done" || c.status === "failed") {
      let line = card.querySelector(".cmdresult");
      if (!line) {
        line = document.createElement("p");
        line.className = "cmdresult";
        (card.querySelector(".btns") || card).insertAdjacentElement("afterend", line);
      }
      line.classList.toggle("failed", c.status === "failed");
      line.textContent = c.result || (c.status === "failed" ? "failed, no reason given" : "done");
    }
  }
}, 4000);

document.addEventListener("click", (e) => {
  if (e.target.id !== "toggle") return;
  document.body.classList.toggle("show-done");
  recount();
});
document.addEventListener("click", (e) => {
  if (e.target.id !== "toggle2") return;
  document.body.classList.toggle("show-dismissed");
  recount();
});

// Per-card controls: seen (fade), minimize (collapse), dismiss (remove, recoverable), restore.
document.addEventListener("click", async (e) => {
  const ctl = e.target.closest(".ctlbtn");
  if (ctl) {
    const card = ctl.closest(".card");
    if (ctl.dataset.action === "seen") {
      const on = !card.classList.contains("seen");
      card.classList.toggle("seen", on);
      ctl.textContent = on ? "◐" : "👁";
      ctl.title = on ? "Mark unseen" : "Mark as seen — fades the card";
      await post("/api/mark", { id: card.dataset.id, field: "seen", value: on });
    } else if (ctl.dataset.action === "min") {
      const on = !card.classList.contains("minimized");
      card.classList.toggle("minimized", on);
      ctl.textContent = on ? "▾" : "–";
      ctl.title = on ? "Expand" : "Minimize";
      await post("/api/mark", { id: card.dataset.id, field: "minimized", value: on });
    } else if (ctl.dataset.action === "dismiss") {
      card.classList.add("leaving");
      await post("/api/mark", { id: card.dataset.id, field: "dismissed", value: true });
      setTimeout(() => { card.classList.remove("leaving"); card.classList.add("dismissed"); recount(); }, 320);
    }
    return;
  }
  const restore = e.target.closest('button.act.restore');
  if (restore) {
    const card = restore.closest(".card");
    await post("/api/mark", { id: card.dataset.id, field: "dismissed", value: false });
    card.classList.remove("dismissed");
    restore.remove();
    recount();
  }
});

document.addEventListener("click", async (e) => {
  const cb = e.target.closest("button.copybtn");
  if (cb) {
    await navigator.clipboard.writeText(cb.dataset.copy);
    const orig = cb.textContent;
    cb.textContent = "Copied ✓"; cb.classList.add("copied");
    toast("Copied to clipboard");
    setTimeout(() => { cb.textContent = orig; cb.classList.remove("copied"); }, 1800);
    return;
  }
  const b = e.target.closest("button.act");
  if (!b) return;
  const card = b.closest(".card");
  if (b.dataset.action === "work") {
    if (b.classList.contains("queued") || b.classList.contains("claudedone")
        || b.classList.contains("dispatched") || b.classList.contains("running")) return;
    b.disabled = true;
    const j = await post("/api/work", { id: card.dataset.id, company: b.dataset.company, kind: b.dataset.kind });
    b.disabled = false;
    if (j.dispatched) {
      b.classList.add("dispatched"); b.textContent = "sent to Claude ✓";
    } else {
      b.classList.add("queued"); b.textContent = "queued for Claude ✓";
      pendingList.push(b.dataset.company); renderBanner();
    }
    toast(j.msg);
  } else if (b.dataset.action === "cardask") {
    const input = b.previousElementSibling;
    const text = input.value.trim();
    if (!text) return;
    b.disabled = true;
    const j = await post("/api/ask", { text, id: card.dataset.id, company: card.querySelector("h3").textContent });
    b.disabled = false;
    if (j.ok) input.value = "";
    toast(j.msg);
  } else if (b.dataset.action === "undo") {
    if (!confirm("Undo this card? This restores the tracker/leads.md line it changed and reopens the GitHub issue if it closed one, then puts the card back as active.")) return;
    const j = await post("/api/undo", { id: card.dataset.id });
    toast(j.restored);
    card.classList.remove("done");
    card.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
    card.querySelector(".fired").textContent = "";
    const liCount = card.querySelectorAll("li").length;
    card.querySelector(".prog").textContent = liCount ? "0/" + liCount : "";
    b.remove();
    recount();
  } else {
    const j = await post("/api/open", { target: b.dataset.target, reveal: b.dataset.action === "reveal" });
    toast(j.msg);
  }
});

// Tag remove — click the × on any chip.
document.addEventListener("click", async (e) => {
  const x = e.target.closest("button.tagx");
  if (!x) return;
  const card = x.closest(".card");
  await post("/api/tag", { id: card.dataset.id, action: "remove", tag: x.dataset.tag });
  x.closest(".tag").remove();
});

// Tag add — type into the "+ label" box and hit Enter.
document.addEventListener("keydown", async (e) => {
  if (e.key !== "Enter" || !e.target.matches(".tagadd input")) return;
  const val = e.target.value.trim();
  if (!val) return;
  const card = e.target.closest(".card");
  await post("/api/tag", { id: card.dataset.id, action: "add", tag: val });
  const chip = document.createElement("span");
  chip.className = "tag";
  chip.innerHTML = escHtml(val) + '<button class="tagx" data-tag="' + val.replace(/"/g, "&quot;") + '" title="remove">×</button>';
  e.target.closest(".tags").insertBefore(chip, e.target.closest(".tagadd"));
  e.target.value = "";
});
</script></body></html>`;
}

// ---------------------------------------------------------------------------
// Session-side CLI — the half a Claude session drives. Runs and exits before any server starts.
// ---------------------------------------------------------------------------
const SUB = argv[0] && !argv[0].startsWith("--") ? argv[0] : null;
if (SUB) {
  const has = (n) => argv.includes(`--${n}`);
  const arg1 = argv[1];

  if (SUB === "live") {
    writeJSON(SESSION, {
      pid: process.pid, started: new Date().toISOString(), beat: new Date().toISOString(),
      note: flag("note", "listening"),
    });
    if (!existsSync(CQUEUE)) writeJSON(CQUEUE, { commands: [] });
    console.log("session registered — now arm the Monitor over scripts/watch-queue.mjs (persistent),");
    console.log("or the heartbeat goes stale in 30s and every Claude-backed button greys out again.");
    process.exit(0);
  }

  if (SUB === "offline") {
    if (existsSync(SESSION)) unlinkSync(SESSION);
    console.log("session deregistered — board buttons are disabled again");
    process.exit(0);
  }

  if (SUB === "status") {
    const sess = session();
    const q = loadCQueue();
    const by = (st) => q.commands.filter((c) => c.status === st).length;
    console.log(sess.live ? `LIVE — beat ${sess.age}s ago · ${sess.note || ""}` : `not live — ${sess.reason}`);
    console.log(`queue: ${by("pending")} pending · ${by("running")} running · ${by("done")} done · ${by("failed")} failed`);
    process.exit(0);
  }

  if (SUB === "next") {
    const pend = loadCQueue().commands.filter((c) => c.status === "pending");
    if (has("json")) console.log(JSON.stringify(pend, null, 2));
    else if (!pend.length) console.log("nothing pending");
    else for (const c of pend) console.log(`${c.id} :: ${c.cmd}${c.args ? " " + c.args : ""}`);
    process.exit(0);
  }

  if (SUB === "claim" || SUB === "done") {
    const q = loadCQueue();
    const c = q.commands.find((x) => x.id === arg1);
    if (!c) { console.error(`no command ${arg1}`); process.exit(1); }
    if (SUB === "claim") { c.status = "running"; c.claimed = new Date().toISOString(); }
    else {
      c.status = has("failed") ? "failed" : "done";
      c.result = flag("result", "");
      c.finished = new Date().toISOString();
    }
    writeJSON(CQUEUE, q);
    console.log(`${arg1} → ${c.status}${c.result ? `: ${c.result}` : ""}`);
    process.exit(0);
  }

  console.error(`unknown subcommand: ${SUB}`);
  console.error("expected one of: live offline next claim done status");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Serve — 127.0.0.1 only
// ---------------------------------------------------------------------------
const json = (res, o) => { res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };

const server = createServer(async (req, res) => {
  if (req.method === "POST") {
    let raw = ""; for await (const c of req) raw += c;
    const b = JSON.parse(raw || "{}");

    if (req.url === "/api/check") {
      const done = readJSON(STATE, { steps: {}, complete: {}, undo: {} });
      done.steps ||= {}; done.complete ||= {}; done.undo ||= {};
      (done.steps[b.id] ||= {})[b.step] = b.checked;
      if (!b.checked) delete done.steps[b.id][b.step];

      const item = buildItems().find((i) => i.id === b.id);
      const total = (item?.steps || []).length;
      const hit = Object.values(done.steps[b.id]).filter(Boolean).length;
      let fired = "";
      if (total && hit === total && !done.complete[b.id]) {
        done.undo[b.id] = snapshotForUndo(item);   // capture before-state, so /api/undo has something to restore
        fired = await runOnDone(item);
        done.complete[b.id] = fired;
        console.log(`✓ ${item.company}: ${fired}`);
      } else if (hit < total && done.complete[b.id]) {
        delete done.complete[b.id];   // unchecking reopens the card; the repo write is not undone (use Undo for that)
      }
      writeFileSync(STATE, JSON.stringify(done, null, 2));
      return json(res, { hit, total, complete: !!done.complete[b.id], fired });
    }

    // Undo a finished card's repo write and reopen it. Available from "show N done" — the
    // reason this exists: a mis-click (ticking a step on a card that hadn't actually happened)
    // used to be permanent, silently, even though the UI already implied "recoverable."
    if (req.url === "/api/undo") {
      const done = readJSON(STATE, { steps: {}, complete: {}, undo: {} });
      done.steps ||= {}; done.complete ||= {}; done.undo ||= {};
      const snap = done.undo[b.id];
      const restored = await undoOnDone(snap);
      delete done.complete[b.id];
      done.steps[b.id] = {};
      delete done.undo[b.id];
      writeFileSync(STATE, JSON.stringify(done, null, 2));
      console.log(`↺ undo ${b.id}: ${restored}`);
      return json(res, { ok: true, restored });
    }

    // Pure UI state: seen (fade), minimized (collapse), dismissed (hide, recoverable). None of
    // these touch the repo — that's the whole point, they're for cutting board noise, not work.
    if (req.url === "/api/mark") {
      const field = ["seen", "minimized", "dismissed"].includes(b.field) ? b.field : null;
      if (!field) return json(res, { ok: false });
      const done = readJSON(STATE, { steps: {}, complete: {} });
      done[field] ||= {};
      if (b.value) done[field][b.id] = true; else delete done[field][b.id];
      writeFileSync(STATE, JSON.stringify(done, null, 2));
      return json(res, { ok: true });
    }

    if (req.url === "/api/tag") {
      const done = readJSON(STATE, { steps: {}, complete: {}, tags: {} });
      done.tags ||= {};
      // First touch materializes the authored default (from actions.json) into state, so the
      // state list becomes the one source of truth for this card from here on.
      if (!done.tags[b.id]) {
        const item = buildItems().find((i) => i.id === b.id);
        done.tags[b.id] = [...(item?.tags || [])];
      }
      const tag = String(b.tag || "").trim().slice(0, 60);
      if (b.action === "add" && tag && !done.tags[b.id].includes(tag)) done.tags[b.id].push(tag);
      if (b.action === "remove") done.tags[b.id] = done.tags[b.id].filter((t) => t !== b.tag);
      writeFileSync(STATE, JSON.stringify(done, null, 2));
      return json(res, { tags: done.tags[b.id] });
    }

    // Work it. With a session live this really does start work: the press is on that session's
    // event stream within ~2s. With none live it degrades to the old behaviour rather than
    // failing, because "picked up next session" is still better than nothing.
    if (req.url === "/api/work") {
      const item = buildItems().find((i) => i.id === b.id);
      const sess = session();
      if (sess.live) {
        const d = dispatch({
          cmd: "work", args: b.company || "", cardId: b.id, slug: b.company || "",
          label: `Work it: ${b.company || b.id}`,
        });
        console.log(`→ dispatched to live session: ${b.company}`);
        return json(res, { dispatched: true, id: d.id, msg: `${b.company} sent to Claude — it is working on it now` });
      }
      const store = readJSON(INTENTS, { intents: [] });
      store.intents = (store.intents || []).filter((x) => x.id !== b.id);
      store.intents.push({
        id: b.id, company: b.company, kind: b.kind, queued: new Date().toISOString(),
        title: item?.title || "", note: item?.workNote || "", handled: false,
      });
      writeFileSync(INTENTS, JSON.stringify(store, null, 2));
      console.log(`→ queued for Claude: ${b.company}`);
      return json(res, { dispatched: false, msg: `${b.company} queued — no session is listening, so Claude picks it up next session` });
    }

    // Free text (or a slash command) into the live session, from the top bar or a card.
    if (req.url === "/api/ask") {
      const text = String(b.text || "").trim().slice(0, 2000);
      if (!text) return json(res, { ok: false, msg: "nothing to send" });
      const slash = text.startsWith("/");
      const d = dispatch({
        cmd: slash ? text.split(/\s+/)[0] : "ask",
        args: slash ? text.split(/\s+/).slice(1).join(" ") : (b.company ? `${b.company} :: ${text}` : text),
        cardId: b.id || "", slug: b.company || "", label: text.slice(0, 60),
      });
      if (!d.ok) return json(res, { ok: false, msg: d.reason });
      console.log(`→ ask: ${text.slice(0, 90)}`);
      return json(res, { ok: true, id: d.id, msg: "sent to Claude" });
    }

    if (req.url === "/api/open") {
      let msg;
      try { msg = openTarget(b.target, b.reveal); }
      catch (e) { msg = `could not open: ${e.message}`; }
      console.log(`  ${msg}`);
      return json(res, { msg });
    }
  }
  // Polled by the page every few seconds so the LIVE pill and any in-flight command status stay
  // truthful without a reload. Cheap: two small JSON reads.
  if (req.url === "/api/live") {
    const sess = session();
    const cards = {};
    for (const c of loadCQueue().commands) {
      if (!c.cardId) continue;
      const prev = cards[c.cardId];
      if (!prev || new Date(c.queued) >= new Date(prev.queued)) {
        cards[c.cardId] = { status: c.status, result: c.result || "", queued: c.queued };
      }
    }
    return json(res, { live: sess.live, note: sess.note || "", reason: sess.reason || "", cards });
  }

  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(render());
});

server.on("error", (e) => {
  if (e.code !== "EADDRINUSE") throw e;
  const url = `http://localhost:${PORT}`;
  console.log(`a board is already serving on ${url} — reusing it (it re-reads the queue on every load).`);
  if (!argv.includes("--no-open")) { try { execSync(`open "${url}"`); } catch {} }
  process.exit(0);
});

server.listen(PORT, "127.0.0.1", () => {
  const url = `http://localhost:${PORT}`;
  const items = buildItems();
  const done = readJSON(STATE, {});
  console.log(`action board on ${url} — ${items.filter((i) => !done.complete?.[i.id]).length} open of ${items.length}`);
  console.log("ctrl-c to stop");
  if (!argv.includes("--no-open")) { try { execSync(`open "${url}"`); } catch {} }
});
