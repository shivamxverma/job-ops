#!/usr/bin/env node
/**
 * watch-queue — the bridge between a board button and a running Claude session.
 *
 * Ported from hack-ops, where it has been carrying button presses into live sessions since
 * 2026-08-21. The problem it solves is the one the JobOps board has always had and said out
 * loud on its own banner: **a node server has no channel into a running Claude session**, so
 * "Work it" could only ever write `inbox/intents.json` and hope the next session read it.
 *
 * Claude cannot poll. It acts when something arrives on its event stream, and the one thing
 * that puts a line on that stream mid-conversation is a Monitor. So `/go-live` arms a Monitor
 * over this script: it polls `control/queue.json`, prints one line per pending command, and —
 * just as importantly — refreshes the session heartbeat on every tick.
 *
 * The heartbeat is what makes the board's LIVE pill honest. It is written *here*, by the
 * process the session owns, not by the session claiming it once. Kill the session and the
 * monitor dies with it, the beat goes stale within 30s, and every Claude-backed control on the
 * board disables itself. Nothing has to notice the session ended; the absence is the signal.
 *
 *   node scripts/watch-queue.mjs [--interval 2] [--reannounce 120]
 *
 * Emits (one line each, stdout only — stdout IS the event stream):
 *   CMD <id> :: <cmd> <args>
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const num = (n, d) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : Number(argv[i + 1]) || d; };

const INTERVAL = num("interval", 2) * 1000;
/** A command announced but still pending after this long is re-announced: the session missed it. */
const REANNOUNCE = num("reannounce", 120) * 1000;

const DIR = join(ROOT, "control");
const QUEUE = join(DIR, "queue.json");
const SESSION = join(DIR, "session.json");

const readJSON = (p, d) => { try { return JSON.parse(readFileSync(p, "utf8")); } catch { return d; } };
const write = (p, o) => writeFileSync(p, JSON.stringify(o, null, 2) + "\n");

if (!existsSync(SESSION)) {
  console.log("ERR no session registered — run: node scripts/actions.mjs live");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

while (true) {
  // Heartbeat first: if the queue read throws, the beat still went out and the board stays
  // honest about a session that is in fact alive.
  const s = readJSON(SESSION, null);
  if (!s) { console.log("ERR session deregistered — stopping"); process.exit(0); }
  write(SESSION, { ...s, beat: new Date().toISOString() });

  const q = readJSON(QUEUE, { commands: [] });
  let dirty = false;
  for (const c of q.commands || []) {
    if (c.status !== "pending") continue;
    const last = c.announcedAt ? Date.now() - new Date(c.announcedAt) : Infinity;
    if (c.announced && last < REANNOUNCE) continue;
    console.log(`CMD ${c.id} :: ${c.cmd}${c.args ? " " + c.args : ""}`);
    c.announced = true;
    c.announcedAt = new Date().toISOString();
    dirty = true;
  }
  if (dirty) write(QUEUE, q);

  await sleep(INTERVAL);
}
