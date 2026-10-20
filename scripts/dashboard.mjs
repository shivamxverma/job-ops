#!/usr/bin/env node
/**
 * dashboard.mjs — render the canonical pipeline state into one static HTML board
 * (dashboard.html at repo root). No deps, no network.
 *
 *   node scripts/dashboard.mjs            # write dashboard.html, print path
 *   node scripts/dashboard.mjs --open     # also open it in the default browser
 *   node scripts/dashboard.mjs --refresh  # pull fresh GitHub issue states first
 *
 * Everything shown comes from lib/state.mjs, so this board and `followups.mjs` and
 * `reconcile.mjs` can never disagree — they read one join, not three parsers.
 *
 * The board previously re-parsed tracker.md itself and shared the `split(" ")[0]` bug: a
 * status written as "**rejected 2026-08-13**" matched no column filter, so the card was
 * dropped from the render entirely. ReferRush — an offer in hand — was invisible on the board
 * for that reason. Columns now key off the canonical `group`, so a company always lands
 * somewhere, and anything the join could not decide is shown in the Drift panel instead of
 * being silently omitted. A board that hides what it cannot parse is worse than no board.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { loadState, loadLeads, driftByType, refreshIssues, STATUSES, ROOT } from "./lib/state.mjs";

if (process.argv.includes("--refresh")) {
  try { refreshIssues(); } catch (e) { console.warn(`WARNING: issue refresh failed (${(e.message || "").split("\n")[0]}) — using cache.`); }
}

const state = loadState();
const today = state.today;
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const all = [...state.companies.values()];

// ---- columns --------------------------------------------------------------
const gradeOrder = { A: 0, B: 1, C: 2, D: 3, F: 4, "?": 5 };
const byGrade = (a, b) => gradeOrder[a.grade] - gradeOrder[b.grade];
const byDue = (a, b) => (a.followUp || "9999").localeCompare(b.followUp || "9999");
const byRecent = (a, b) => (b.since || "").localeCompare(a.since || "");

const pile = all.filter((c) => c.status === "lead" && (c.leads.length || c.folder)).sort(byGrade);
const hold = all.filter((c) => c.group === "hold").sort(byRecent);
const waiting = all.filter((c) => c.status === "sent").sort(byDue);
const followed = all.filter((c) => c.status === "followed-up").sort(byDue);
const inPlay = all.filter((c) => c.group === "play").sort(byRecent);
const closed = all.filter((c) => ["rejected", "ghosted", "closed"].includes(c.status)).sort(byRecent);
const overdue = all.filter((c) => c.overdue);
const unclocked = all.filter((c) => c.followUpManual && ["sent", "followed-up", "replied", "screening", "interview"].includes(c.status));

// Signals stay a separate file with its own box states; parsed here directly since it is a
// pre-lead store (no company folder or tracker row exists yet by definition).
const signals = loadLeads("inbox/signals.md").filter((s) => (s.box === " " || s.box === ">") && ["A", "B"].includes(s.grade));

const drift = driftByType(state.drift);

// ---- cards ----------------------------------------------------------------
const chip = (cls, text) => `<span class="chip ${cls}">${esc(text)}</span>`;
const gradeChip = (g) => chip("g" + g, g);
const age = (c) => (c.daysSince == null ? "" : `<span class="days">${c.daysSince}d</span>`);

const appCard = (c) => `
  <div class="card${c.overdue ? " overdue" : ""}">
    <div class="top">${c.folder ? `<a href="applications/${esc(c.folder.slug)}/">${esc(c.display)}</a>` : esc(c.display)}
      ${gradeChip(c.grade)}${age(c)}</div>
    <div class="sub">${esc(c.role)}</div>
    <div class="meta">${esc((c.channel || "").slice(0, 110))}</div>
    ${c.followUp ? `<div class="due${c.overdue ? " hot" : ""}">${c.overdue ? "⚠ OVERDUE " : "follow-up "}${c.followUp}</div>` : ""}
    ${c.followUpManual ? `<div class="due warn">no clock: ${esc(c.followUpManual.slice(0, 70))}</div>` : ""}
  </div>`;

const leadCard = (c) => `
  <div class="card">
    <div class="top">${c.link ? `<a href="${esc(c.link)}">${esc(c.display)}</a>` : esc(c.display)} ${gradeChip(c.grade)}</div>
    <div class="sub">${esc(c.role)}</div>
    <div class="meta">${esc(c.why.slice(0, 170))}${c.why.length > 170 ? "…" : ""}</div>
  </div>`;

const signalCard = (s) => `
  <div class="card">
    <div class="top">${s.link ? `<a href="${esc(s.link)}">${esc(s.name)}</a>` : esc(s.name)} ${gradeChip(s.grade)}${s.promoted ? chip("promo", "→ promoted") : ""}</div>
    <div class="meta">${esc(s.why.slice(0, 170))}</div>
  </div>`;

const closedCard = (c) => `
  <div class="card dim">
    <div class="top">${esc(c.display)} ${chip(c.status === "rejected" ? "bad" : "gone", c.status)}${age(c)}</div>
    <div class="sub">${esc(c.role)}</div>
  </div>`;

const playCard = (c) => `
  <div class="card hot-border">
    <div class="top">${c.folder ? `<a href="applications/${esc(c.folder.slug)}/">${esc(c.display)}</a>` : esc(c.display)}
      ${chip("play", STATUSES[c.status].label)}${age(c)}</div>
    <div class="sub">${esc(c.role)}</div>
    <div class="meta">${esc((c.notes || "").slice(0, 150))}</div>
  </div>`;

const col = (title, cards, list, hint = "") => `
  <section class="col"><h2>${title} <span class="count">${list.length}</span></h2>${hint ? `<p class="hint">${hint}</p>` : ""}
  <div class="cards">${list.map(cards).join("") || '<div class="empty">nothing here</div>'}</div></section>`;

const driftPanel = !state.drift.length ? "" : `
<section class="drift">
  <h2>⚠ State drift <span class="count">${state.drift.length}</span></h2>
  <p class="hint">Places where leads.md, tracker.md, applications/ and the GitHub issue board disagree.
     Nothing here is hidden from the board above — it is listed so the board can be trusted.
     Fix the auto-fixable ones with <code>node scripts/reconcile.mjs --fix</code>.</p>
  ${Object.entries(drift).map(([type, items]) => `
    <div class="dgroup"><h3>${esc(type)} <span class="count">${items.length}</span>${items.some((i) => i.fixable) ? chip("auto", "--fix") : ""}</h3>
      <ul>${items.map((i) => `<li><b>${esc(i.company)}</b> — ${esc(i.detail)}</li>`).join("")}</ul></div>`).join("")}
</section>`;

const html = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>JobOps board</title>
<style>
  :root{--bg:#0f1115;--panel:#171a21;--card:#1e222b;--text:#d7dae0;--dim:#8b90a0;--line:#2a2f3a;
    --a:#4fc08d;--b:#5b9dd9;--c:#c9a84c;--hot:#e0564f;--warn:#d8973c;--promo:#9d7bd8}
  *{box-sizing:border-box;margin:0}
  body{background:var(--bg);color:var(--text);font:14px/1.45 ui-monospace,Menlo,monospace;padding:20px}
  header{display:flex;flex-wrap:wrap;gap:16px;align-items:baseline;margin-bottom:6px}
  h1{font-size:18px} .stamp{color:var(--dim);font-size:12px}
  .alert{color:var(--hot);font-weight:bold}
  .warnline{color:var(--warn);font-weight:bold}
  .totals{color:var(--dim);font-size:12px;margin-bottom:14px}
  .board{display:flex;gap:14px;overflow-x:auto;align-items:flex-start;padding-bottom:12px}
  .col{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:12px;min-width:270px;max-width:330px;flex:1}
  .col h2{font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--dim);margin-bottom:8px}
  .count{background:var(--card);border-radius:8px;padding:1px 8px;font-size:12px;color:var(--text)}
  .hint{color:var(--dim);font-size:11px;margin-bottom:8px}
  .cards{display:flex;flex-direction:column;gap:8px;max-height:70vh;overflow-y:auto}
  .card{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:9px 10px}
  .card.overdue,.card.hot-border{border-color:var(--hot)}
  .card.dim{opacity:.55}
  .top{display:flex;gap:6px;flex-wrap:wrap;align-items:baseline;font-weight:bold}
  .top a{color:var(--text);text-decoration:underline dotted var(--dim)}
  .days{margin-left:auto;color:var(--dim);font-weight:normal;font-size:12px}
  .sub{color:var(--text);font-size:12px;margin-top:2px}
  .meta{color:var(--dim);font-size:11px;margin-top:3px}
  .due{font-size:11px;margin-top:5px;color:var(--b)}
  .due.hot{color:var(--hot);font-weight:bold} .due.warn{color:var(--warn)}
  .chip{font-size:10px;border-radius:6px;padding:0 6px;font-weight:bold}
  .gA{background:var(--a);color:#08130d}.gB{background:var(--b);color:#0a1420}.gC{background:var(--c);color:#1c1608}
  .gD,.gF,.g\\?{background:var(--line);color:var(--dim)}
  .promo{background:var(--promo);color:#150d22}.play{background:var(--a);color:#08130d}
  .auto{background:var(--b);color:#0a1420;margin-left:8px}
  .bad{background:var(--hot);color:#1d0908}.gone{background:var(--line);color:var(--dim)}
  .empty{color:var(--dim);font-size:12px;padding:6px}
  .drift{background:var(--panel);border:1px solid var(--hot);border-radius:10px;padding:14px;margin-top:18px}
  .drift h2{font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--hot);margin-bottom:6px}
  .dgroup{margin-top:12px}
  .dgroup h3{font-size:12px;color:var(--text);margin-bottom:4px}
  .dgroup ul{margin:0;padding-left:20px;color:var(--dim);font-size:12px}
  .dgroup li{margin:2px 0} .dgroup b{color:var(--text)}
  code{background:var(--card);padding:1px 5px;border-radius:4px}
</style></head><body>
<header>
  <h1>JobOps board</h1>
  <span class="stamp">generated ${new Date().toISOString().slice(0, 16).replace("T", " ")} · node scripts/dashboard.mjs</span>
  ${overdue.length ? `<span class="alert">⚠ ${overdue.length} overdue follow-up${overdue.length > 1 ? "s" : ""}</span>` : ""}
  ${unclocked.length ? `<span class="warnline">${unclocked.length} with no follow-up clock</span>` : ""}
  ${state.drift.length ? `<span class="alert">⚠ ${state.drift.length} drift</span>` : ""}
</header>
<p class="totals">${state.companies.size} companies tracked · ${state.tracker.length} tracker rows · ${state.folders.length} folders ·
  issue cache ${state.refreshed ? esc(state.refreshed.slice(0, 16).replace("T", " ")) : "never refreshed (run --refresh)"}</p>
<div class="board">
${col("Signals", signalCard, signals, "funding hits, pre-posting (A/B)")}
${col("Lead pile", leadCard, pile, "undecided leads, best grade first")}
${col("On hold / drafted", appCard, hold, "folder ready, waiting on Shivam to send")}
${col("Waiting", appCard, waiting, "sent, clock running")}
${col("Followed up", appCard, followed, "2nd touch out, 7d to ghost")}
${col("In play", playCard, inPlay, "replied / screening / interview / offer")}
${col("Closed", closedCard, closed, "rejected / ghosted")}
</div>
${driftPanel}
</body></html>`;

const out = join(ROOT, "dashboard.html");
writeFileSync(out, html);
console.log(`dashboard.html written — ${state.companies.size} companies, ${pile.length} undecided leads, ${inPlay.length} in play, ` +
  `${overdue.length} overdue${unclocked.length ? `, ${unclocked.length} unclocked` : ""}${state.drift.length ? `, ⚠ ${state.drift.length} drift` : ""}`);
console.log(out);
if (process.argv.includes("--open")) execSync(`open "${out}"`);
