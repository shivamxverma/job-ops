#!/usr/bin/env node
/**
 * JobOps scout — pulls the current HN "Who is Hiring?" thread via hn.algolia.com,
 * keyword-filters comments against Shivam's profile, and writes new hits to inbox/.
 * Run manually, via cron, or let the /job-scout skill run it.
 *
 *   node scripts/scout.mjs            # current month
 *   node scripts/scout.mjs 2026-06    # specific month
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { reachability } from "./lib/reachability.mjs";
import { matchKeywords } from "./lib/keywords.mjs";
import { today } from "./lib/today.mjs";
import { writeDayFile } from "./lib/day-file.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INBOX = join(ROOT, "inbox");
const SEEN_FILE = join(INBOX, ".seen.json");

const EXCLUDE = ["unpaid", "equity only"];
// Geography used to be handled by the three strings above, which caught almost nothing —
// 58% of every dead lead in the file died on a wall this scout had already waved through.
// `lib/reachability.mjs` replaces them. `--all` keeps blocked postings for auditing.
const KEEP_BLOCKED = process.argv.includes("--all");

const month = process.argv.slice(2).find((a) => /^\d{4}-\d{2}$/.test(a)) ?? new Date().toISOString().slice(0, 7);
const [y, m] = month.split("-").map(Number);
const monthName = new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-US", { month: "long", timeZone: "UTC" });

async function algolia(path) {
  const res = await fetch(`https://hn.algolia.com/api/v1/${path}`);
  if (!res.ok) throw new Error(`Algolia ${res.status} on ${path}`);
  return res.json();
}

// 1. Find the thread.
// whoishiring posts on the 1st at 15:00 UTC and Algolia indexes it some minutes later, so
// on the 1st of a month there is a window where the current thread does not exist yet. This
// used to exit(1) and take the whole HN channel down with it for a day — silently, because
// last month's thread is still the live one until the new one lands. Fall back to it.
const label = (dy, dm) => `${new Date(Date.UTC(dy, dm - 1, 1)).toLocaleString("en-US", { month: "long", timeZone: "UTC" })} ${dy}`;
async function findThread(dy, dm) {
  const want = label(dy, dm);
  const search = await algolia(
    `search?query=${encodeURIComponent(`Ask HN: Who is hiring? (${want})`)}&tags=story,author_whoishiring`
  );
  return search.hits.find((h) => h.title?.includes(want) && /who is hiring/i.test(h.title));
}

let thread = await findThread(y, m);
if (!thread && !process.argv.some((a) => /^\d{4}-\d{2}$/.test(a))) {
  const py = m === 1 ? y - 1 : y, pm = m === 1 ? 12 : m - 1;
  thread = await findThread(py, pm);
  if (thread) console.log(`${monthName} ${y} thread not posted yet — falling back to ${label(py, pm)}.`);
}
if (!thread) {
  console.error(`No "Who is hiring" thread found for ${monthName} ${y} (or the month before).`);
  process.exit(1);
}
console.log(`Thread: ${thread.title} (${thread.objectID}), ~${thread.num_comments} comments`);

// 2. Pull all top-level comments (paginated)
const comments = [];
for (let page = 0; ; page++) {
  const data = await algolia(
    `search_by_date?tags=comment,story_${thread.objectID}&hitsPerPage=1000&page=${page}`
  );
  comments.push(...data.hits.filter((h) => String(h.parent_id) === String(thread.objectID)));
  if (page >= data.nbPages - 1) break;
}
console.log(`Top-level postings: ${comments.length}`);

// 3. Score
const seen = existsSync(SEEN_FILE) ? JSON.parse(readFileSync(SEEN_FILE, "utf8")) : {};
const clean = (html = "") =>
  html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x2F;/g, "/")
      .replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();

const hits = [];
const rejects = { excluded: 0, keywords: 0, blocked: 0 };
const blockedBy = {};
for (const c of comments) {
  if (seen[c.objectID]) continue;
  const raw = clean(c.comment_text);
  const text = raw.toLowerCase();
  if (EXCLUDE.some((k) => text.includes(k))) { rejects.excluded++; continue; }
  const { strong, weak } = matchKeywords(raw);
  if (strong.length < 1 && weak.length < 2) { rejects.keywords++; continue; }

  const reach = reachability({ text: raw });
  if (reach.status === "blocked" && !KEEP_BLOCKED) {
    rejects.blocked++;
    blockedBy[reach.reason] = (blockedBy[reach.reason] ?? 0) + 1;
    seen[c.objectID] = new Date().toISOString(); // decided; never spend on it again
    continue;
  }

  hits.push({
    id: c.objectID,
    author: c.author,
    created: c.created_at,
    url: `https://news.ycombinator.com/item?id=${c.objectID}`,
    matched: { strong, weak },
    reachability: reach,
    firstLine: raw.slice(0, 160),
    text: raw,
  });
  seen[c.objectID] = new Date().toISOString();
}

console.log(
  `Filtered: ${hits.length} kept (rejected — keyword miss ${rejects.keywords}, ` +
  `unpaid/equity-only ${rejects.excluded}, geography ${rejects.blocked})`
);
if (rejects.blocked) {
  const top = Object.entries(blockedBy).sort((a, b) => b[1] - a[1]).slice(0, 5);
  console.log(`  geo walls hit: ${top.map(([r, n]) => `${r} ×${n}`).join(", ")}`);
}

// 4. Write
mkdirSync(INBOX, { recursive: true });
const stamp = today();
if (hits.length) {
  const out = join(INBOX, `hn-${stamp}.json`);
  writeDayFile(out, { thread: thread.title, threadId: thread.objectID, pulled: stamp }, hits);
  writeFileSync(SEEN_FILE, JSON.stringify(seen, null, 2));
  console.log(`NEW: ${hits.length} matches → ${out}`);
  for (const h of hits.slice(0, 15)) console.log(`  [${h.matched.strong.join(",") || h.matched.weak.join(",")}] ${h.firstLine}`);
  if (hits.length > 15) console.log(`  ... and ${hits.length - 15} more`);
} else {
  writeFileSync(SEEN_FILE, JSON.stringify(seen, null, 2));
  console.log("No new matches since last run.");
}
