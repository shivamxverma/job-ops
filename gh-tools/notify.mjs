#!/usr/bin/env node
/**
 * notify.mjs — runs after scout.mjs + signal-scout.mjs (in Actions or locally).
 * 1. Opens a GitHub Issue for each not-yet-issued strong scout hit  → phone push via GitHub app.
 * 2. Opens issues for grade-A signals (funding + explicit hiring mention) from inbox/signals.md.
 * 3. Opens issues for overdue follow-ups found in applications/tracker.md.
 * 4. Optional: sends a Telegram summary if TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID are set.
 *
 * Env: GITHUB_TOKEN (or falls back to `gh auth token`), GH_REPO ("owner/repo",
 *      falls back to `gh repo view`), TELEGRAM_* optional.
 * Dedupe state: inbox/.issued.json (committed by the workflow).
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INBOX = join(ROOT, "inbox");
const ISSUED_FILE = join(INBOX, ".issued.json");
// Per-category caps — kept separate so a busy HN month can't starve signal issues (or vice
// versa) by eating a shared budget first. Follow-ups stay uncapped: rare, and always worth a push.
const MAX_LEAD_ISSUES = 10;
const MAX_SIGNAL_ISSUES = 5;

const sh = (cmd) => execSync(cmd, { encoding: "utf8" }).trim();
const token = process.env.GITHUB_TOKEN || sh("gh auth token");
const repo =
  process.env.GH_REPO ||
  sh('gh repo view --json nameWithOwner -q .nameWithOwner');

// --dry-run: print what would be opened, touch nothing (no issues, no .issued.json, no Telegram).
const DRY = process.argv.includes("--dry-run");

async function gh(path, body) {
  if (DRY && body) return { number: 0 };
  const res = await fetch(`https://api.github.com/repos/${repo}/${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`);
  return res.json();
}

const issued = existsSync(ISSUED_FILE) ? JSON.parse(readFileSync(ISSUED_FILE, "utf8")) : {};
const created = [];

// ---- 1. Lead issues from scout hits (strong matches only) ----
let leadCount = 0;
const files = readdirSync(INBOX).filter((f) => f.startsWith("hn-") && f.endsWith(".json"));
for (const f of files) {
  const { hits = [] } = JSON.parse(readFileSync(join(INBOX, f), "utf8"));
  for (const h of hits) {
    if (issued[h.id] || h.matched.strong.length === 0) continue;
    if (leadCount >= MAX_LEAD_ISSUES) break;
    const title = `[lead] ${h.firstLine.slice(0, 90)}`;
    const body = [
      `**Matched:** strong: \`${h.matched.strong.join(", ")}\`${h.matched.weak.length ? ` · weak: \`${h.matched.weak.join(", ")}\`` : ""}`,
      `**Posted:** ${h.created} by ${h.author}`,
      `**HN link:** ${h.url}`,
      "",
      "### Posting",
      h.text.slice(0, 3500),
      "",
      "---",
      "Next: grade it with `/job-scout`, then run the pipeline if A/B.",
    ].join("\n");
    const issue = await gh("issues", { title, body, labels: ["lead"] });
    issued[h.id] = issue.number;
    created.push(`#${issue.number} ${title}`);
    leadCount++;
  }
}

// ---- 1b. Lead issues from the graded scouts (boards, YC, HN job stories, India ATS) ----
// These carry a script grade. Only A/B get an issue; the grade is a hypothesis until the
// /all-scouts judgment pass, and the issue says so. Keys are prefixed by source because ids
// are only unique inside one source.
const GRADED = [
  { prefix: "boards-", key: "boards", url: (h) => h.url },
  { prefix: "yc-", key: "yc", url: (h) => h.jobUrl },
  { prefix: "hnjobs-", key: "hnjobs", url: (h) => h.jobUrl || h.hnUrl },
  { prefix: "ats-", key: "ats", url: (h) => h.url },
];
let gradedCount = 0;
for (const src of GRADED) {
  const srcFiles = readdirSync(INBOX).filter((f) => f.startsWith(src.prefix) && f.endsWith(".json"));
  for (const f of srcFiles) {
    const { hits = [] } = JSON.parse(readFileSync(join(INBOX, f), "utf8"));
    for (const h of hits) {
      const key = `${src.key}:${h.id}`;
      if (issued[key] !== undefined || !["A", "B"].includes(h.grade)) continue;
      if (gradedCount >= MAX_LEAD_ISSUES) break;
      const title = `[lead] ${h.grade} · ${h.company} — ${String(h.title).slice(0, 70)}`;
      const body = [
        `**${h.company}**: ${h.title}`,
        `**Script grade:** ${h.grade} (score ${h.score}), source \`${src.key}\` (${h.source ?? f})`,
        h.location ? `**Location:** ${h.location}` : "",
        `**Link:** ${src.url(h) ?? "n/a"}`,
        "",
        ...(Array.isArray(h.why) ? h.why.map((w) => `- ${w}`) : []),
        "",
        "---",
        "The grade is the script's guess. Grade it properly in the next `/all-scouts` session before working it.",
      ].filter((l) => l !== "").join("\n");
      const issue = await gh("issues", { title, body, labels: ["lead"] });
      issued[key] = issue.number;
      created.push(`#${issue.number} ${title}`);
      gradedCount++;
    }
  }
}

// ---- 2. Signal issues from signals.md (grade A only — funding + explicit hiring mention) ----
let signalCount = 0;
const signalsPath = join(INBOX, "signals.md");
if (existsSync(signalsPath)) {
  const sigRe = /^- \[ \] \*\*(.+?)\*\* — A \| (.+?) \| (\S+): (\S+) \| why: (.+)$/;
  for (const line of readFileSync(signalsPath, "utf8").split("\n")) {
    const m = line.match(sigRe);
    if (!m) continue;
    const [, company, date, source, link, why] = m;
    const key = `sig:${link}`;
    if (issued[key]) continue;
    if (signalCount >= MAX_SIGNAL_ISSUES) break;
    const title = `[signal] ${company} — funding + hiring`;
    const body = [
      `**${company}** — grade A signal (${date}, ${source})`,
      `**Why:** ${why}`,
      `**Link:** ${link}`,
      "",
      "This is a funding signal, not a job posting — no JD exists yet. Reach out before one",
      "does: `/company-research` then `/outreach` framed as \"saw you just raised, growing the",
      "team?\" rather than replying to a listing.",
      "",
      "---",
      "Triage in `inbox/signals.md`, mark `[>]` once promoted to `applications/{company}/`.",
    ].join("\n");
    const issue = await gh("issues", { title, body, labels: ["signal"] });
    issued[key] = issue.number;
    created.push(`#${issue.number} ${title}`);
    signalCount++;
  }
}

// ---- 3. Overdue follow-ups from tracker.md ----
const trackerPath = join(ROOT, "applications", "tracker.md");
const today = new Date().toISOString().slice(0, 10);
if (existsSync(trackerPath)) {
  for (const line of readFileSync(trackerPath, "utf8").split("\n")) {
    const cells = line.split("|").map((s) => s.trim());
    // | date | company | role | grade | channel | framing | ats | status | next follow-up | notes |
    if (cells.length < 11 || cells[1] === "date" || cells[1].startsWith("---")) continue;
    const [, date, company, role, , , , , status, followup] = cells;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(followup) || followup > today) continue;
    if (["rejected", "offer", "ghosted"].includes(status)) continue;
    const key = `fu:${company}:${followup}`;
    if (issued[key]) continue;
    const issue = await gh("issues", {
      title: `[follow-up] ${company} — due ${followup}`,
      body: `**${company}** (${role}) applied ${date}, status **${status}** — follow-up was due **${followup}**.\n\nDraft it with \`/outreach\` (follow-up mode), send, then \`/outcome ${company}: followed up\`.`,
      labels: ["follow-up"],
    });
    issued[key] = issue.number;
    created.push(`#${issue.number} follow-up: ${company}`);
  }
}

if (!DRY) writeFileSync(ISSUED_FILE, JSON.stringify(issued, null, 2));
console.log(created.length ? `Created:\n  ${created.join("\n  ")}` : "Nothing new to notify.");

// ---- 4. Optional Telegram summary ----
const { TELEGRAM_BOT_TOKEN: tg, TELEGRAM_CHAT_ID: chat } = process.env;
if (tg && chat && created.length && !DRY) {
  const text = [
    `🎯 JobOps: ${created.length} new item(s)`,
    ...created.slice(0, 8).map((c) => `• ${c}`),
    `\nhttps://github.com/${repo}/issues`,
  ].join("\n");
  const res = await fetch(`https://api.telegram.org/bot${tg}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
  });
  console.log(res.ok ? "Telegram sent." : `Telegram failed: ${await res.text()}`);
}
