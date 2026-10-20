#!/usr/bin/env node
/**
 * JobOps signal-scout — watches Indian startup-funding RSS feeds for "just raised, about to
 * hire" signals, ahead of any job posting existing. Companion to scout.mjs (which watches
 * posted jobs); this watches the event that creates the headcount budget in the first place.
 *
 *   node scripts/signal-scout.mjs
 *
 * Sources: Inc42, YourStory, Blume Ventures (Entrackr has no working RSS feed as of 2026-07,
 * dropped; Peak XV/Accel have no public feed either — Next.js apps, no RSS route).
 * Dedup state: inbox/.signals-seen.json (by article link).
 * Output: appends scored hits to inbox/signals.md, annotated against leads.md/targets.md if
 * the company is already tracked elsewhere in the pipeline.
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INBOX = join(ROOT, "inbox");
const SEEN_FILE = join(INBOX, ".signals-seen.json");
const SIGNALS_FILE = join(INBOX, "signals.md");
const LEADS_FILE = join(ROOT, "inbox", "leads.md");
const TARGETS_FILE = join(ROOT, "applications", "targets.md");

const FEEDS = [
  { name: "Inc42", url: "https://inc42.com/feed/" },
  { name: "YourStory", url: "https://yourstory.com/feed" },
  { name: "Blume", url: "https://blume.vc/blog/feed" },
];

// A hit needs a funding keyword to be a signal at all — everything else just refines the grade.
const FUNDING = [
  "raises", "raised", "raising", "funding round", "seed round", "seed funding",
  "series a", "series b", "series c", "series d", "pre-seed", "secures", "bags",
  "closes round", "million in funding", "crore funding", "fresh funding",
];
const HIRING_HINT = [
  "hiring", "hire", "expand its team", "expand team", "grow its team", "growing its team",
  "engineering team", "grow headcount", "new hires", "scale its team", "build its team",
  "tech team",
];
const TECH_SECTOR = [
  "saas", "ai", "artificial intelligence", "genai", "fintech",
  "devtool", "developer tool", "api", "infra", "agent", "llm", "software", "platform",
  "deeptech", "cloud",
];
// Rounds this late usually already have a full eng team — the "about to hire" thesis weakens.
const LATE_STAGE = ["series c", "series d", "series e", "series f", "pre-ipo", "ipo"];
// Rounds this early are the sharpest "about to hire" signal — budget just appeared.
const EARLY_STAGE = ["pre-seed", "seed round", "seed funding", "angel round"];
// Sectors where an engineering hire is rarely the point of the raise — downgrades, doesn't kill
// (a hiring-hint match still overrides this, since that's a direct statement, not an inference).
const OFF_SECTOR = [
  "d2c", "beauty", "skincare", "cosmetics", "fmcg", "real estate", "proptech", "agritech",
  "dairy", "poultry", "textile", "apparel", "jewellery", "furniture", "bakery", "restaurant",
  "qsr", "gym chain", "fitness studio", "ev maker", "ev startup", "aerospace", "defence",
  "manufacturing",
];
const LOCATION_TAG = ["bengaluru", "bangalore"];

const clean = (html = "") =>
  html.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "").replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&").replace(/&#8217;/g, "'").replace(/&#8220;|&#8221;/g, '"')
      .replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

function parseRss(xml, sourceName) {
  const items = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRe.exec(xml))) {
    const block = m[1];
    const title = clean((block.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "");
    const link = clean((block.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || "");
    const pubDate = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || "";
    const desc = clean(
      (block.match(/<description>([\s\S]*?)<\/description>/) || [])[1] ||
      (block.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/) || [])[1] || ""
    );
    if (title && link) items.push({ source: sourceName, title, link, pubDate, desc });
  }
  return items;
}

const has = (text, keyword) =>
  new RegExp(`\\b${keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(text);

function grade(text, ageDays) {
  const funding = FUNDING.filter((k) => has(text, k));
  if (funding.length === 0) return null;
  const hiring = HIRING_HINT.filter((k) => has(text, k));
  const sector = TECH_SECTOR.filter((k) => has(text, k));
  const late = LATE_STAGE.some((k) => has(text, k));
  const early = EARLY_STAGE.some((k) => has(text, k));
  const offSector = OFF_SECTOR.some((k) => has(text, k));

  let g;
  if (hiring.length > 0) g = "A";
  else if (offSector) g = "D";
  else if (sector.length > 0 && early && ageDays <= 21) g = "A";
  else if (sector.length > 0 && !late && ageDays <= 14) g = "B";
  else if (ageDays <= 30) g = "C";
  else g = "D";

  const stage = early ? "early-stage" : late ? "late-stage" : null;
  const location = LOCATION_TAG.find((k) => has(text, k)) || null;
  return { grade: g, funding, hiring, sector, stage, location };
}

// Best-effort company name: try "X raises/secures/bags/closes/announces", then the "In X" tail
// used by co-lead/investor-led headlines ("Norwest Co-Leads $40Mn Round In Raghu Vamsi
// Aerospace"), else fall back to the full title.
function extractCompany(title) {
  const lead = title.match(/^(.+?)\s+(?:raises|raised|secures|bags|closes|announces)\b/i);
  if (lead) return lead[1].trim();
  const tail = title.match(/\bin\s+([A-Z][\w&.'-]+(?:\s+[A-Z][\w&.'-]+){0,4})\s*$/);
  if (tail) return tail[1].trim();
  return title.trim();
}

function loadTrackedCompanies(path) {
  if (!existsSync(path)) return [];
  const names = [];
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/\*\*(.+?)\*\*/) || line.match(/^\|\s*(.+?)\s*\|/);
    if (m && m[1] && m[1] !== "company") names.push(m[1].trim());
  }
  return names;
}

function findTracked(company, trackedLeads, trackedTargets) {
  const c = company.toLowerCase();
  const inLeads = trackedLeads.find((n) => c.includes(n.toLowerCase()) || n.toLowerCase().includes(c));
  if (inLeads) return `already in leads.md as "${inLeads}"`;
  const inTargets = trackedTargets.find((n) => c.includes(n.toLowerCase()) || n.toLowerCase().includes(c));
  if (inTargets) return `already in targets.md as "${inTargets}"`;
  return null;
}

const seen = existsSync(SEEN_FILE) ? JSON.parse(readFileSync(SEEN_FILE, "utf8")) : {};
const hits = [];

for (const feed of FEEDS) {
  let xml;
  try {
    const res = await fetch(feed.url, { headers: { "User-Agent": "Mozilla/5.0 (JobOps signal-scout)" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    xml = await res.text();
  } catch (e) {
    console.error(`Skipping ${feed.name}: ${e.message}`);
    continue;
  }
  const items = parseRss(xml, feed.name);
  console.log(`${feed.name}: ${items.length} items`);
  for (const item of items) {
    if (seen[item.link]) continue;
    const text = `${item.title} ${item.desc}`.toLowerCase();
    const ageDays = item.pubDate
      ? Math.floor((Date.now() - new Date(item.pubDate).getTime()) / 86400000)
      : 0;
    const scored = grade(text, ageDays);
    seen[item.link] = new Date().toISOString();
    if (!scored) continue;
    hits.push({ ...item, ...scored, ageDays });
  }
}

mkdirSync(INBOX, { recursive: true });
writeFileSync(SEEN_FILE, JSON.stringify(seen, null, 2));

if (!existsSync(SIGNALS_FILE)) {
  writeFileSync(
    SIGNALS_FILE,
    [
      "# Signals (scored by scripts/signal-scout.mjs)",
      "",
      "Funding/hiring-expansion signals, not job postings — the point is to reach a company",
      "*before* a JD exists. Grades: A = funding + explicit hiring mention, or funding + tech",
      "sector + early-stage round | B = funding + tech-sector fit, recent, not late-stage |",
      "C = funding, unclear fit | D = funding but off-sector, late-stage, or stale (>30d).",
      "",
      "Box states: `[ ]` = untriaged  `[>]` = promoted to applications/{company}/ for deep",
      "research  `[x]` = not pursuing. Set with:",
      '  `node scripts/mark-processed.mjs "<Company>" --signals --promote`',
      '  `node scripts/mark-processed.mjs "<Company>" --signals --skip`',
      "",
      "## Active",
      "<!-- - [ ] **{Company}** — {A-D} | {date} | {source+link} | why: {one line} -->",
      "",
    ].join("\n")
  );
}

// Same funding round often gets covered by two sources with near-identical headlines — dedupe
// by extracted company name, keeping the better grade (and noting the dropped source in why).
function dedupeBySource(items) {
  const byCompany = new Map();
  for (const h of items) {
    const company = extractCompany(h.title);
    const key = company.toLowerCase();
    const existing = byCompany.get(key);
    if (!existing || h.grade < existing.grade) {
      if (existing) h.otherSource = existing.source;
      byCompany.set(key, { ...h, company });
    } else {
      existing.otherSource = h.source;
    }
  }
  return [...byCompany.values()];
}

if (hits.length) {
  const trackedLeads = loadTrackedCompanies(LEADS_FILE);
  const trackedTargets = loadTrackedCompanies(TARGETS_FILE);
  const deduped = dedupeBySource(hits);
  deduped.sort((a, b) => (a.grade < b.grade ? -1 : a.grade > b.grade ? 1 : 0));
  const lines = deduped.map((h) => {
    const company = h.company;
    const tracked = findTracked(company, trackedLeads, trackedTargets);
    const why = [
      h.hiring.length ? `hiring mention (${h.hiring[0]})` : null,
      h.stage ? `stage: ${h.stage}` : null,
      h.sector.length ? `sector: ${h.sector.slice(0, 2).join(", ")}` : null,
      `funding: ${h.funding[0]}`,
      h.location ? `📍 ${h.location}` : null,
      tracked ? `⚠ ${tracked}` : null,
      h.otherSource ? `also: ${h.otherSource}` : null,
    ].filter(Boolean).join("; ");
    return `- [ ] **${company}** — ${h.grade} | ${h.pubDate ? h.pubDate.slice(0, 16) : "date unknown"} | ${h.source}: ${h.link} | why: ${why}`;
  });
  const content = readFileSync(SIGNALS_FILE, "utf8");
  const marker = "## Active";
  const idx = content.indexOf(marker);
  const insertAt = idx + marker.length;
  const updated = content.slice(0, insertAt) + "\n" + lines.join("\n") + "\n" + content.slice(insertAt).replace(/^\n+/, "\n");
  writeFileSync(SIGNALS_FILE, updated);
  const dupeNote = hits.length > deduped.length ? ` (${hits.length - deduped.length} cross-source dupes merged)` : "";
  console.log(`NEW: ${deduped.length} signals${dupeNote} → inbox/signals.md`);
  for (const h of deduped.slice(0, 15)) console.log(`  [${h.grade}] ${h.title}`);
  if (deduped.length > 15) console.log(`  ... and ${deduped.length - 15} more`);
} else {
  console.log("No new signals.");
}
