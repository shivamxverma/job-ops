/**
 * Shared logic for YC job postings — the hard filters, the score, and the Inertia scrape.
 *
 * Two scouts see the same postings by different routes: yc-scout.mjs walks the public job
 * grid, and hn-jobs.mjs arrives at individual postings from HN's `tags=job` stories. They
 * must filter and grade identically, or the same role gets two different grades depending
 * on which channel found it first. Same reason keywords.mjs exists: one source of truth.
 */
import { seatFit, grade as gradeOf } from "./fit.mjs";

export const YC = "https://www.ycombinator.com";

const dec = (s) => s
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">").replace(/&amp;/g, "&");

/** Pull the Inertia page props out of a server-rendered YC page. Null if it isn't one. */
export async function ycProps(url) {
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (JobOps scout)" } });
  if (!res.ok) return null;
  const html = await res.text();
  const i = html.indexOf('data-page="');
  if (i < 0) return null;
  const end = html.indexOf('"', i + 11);
  try {
    return JSON.parse(dec(html.slice(i + 11, end))).props;
  } catch {
    return null;
  }
}

/** "about 2 months" / "3 days" / "almost 2 years" / "about 7 hours" -> days, null if unparseable. */
export function toDays(rel) {
  if (!rel) return null;
  const m = String(rel).match(/(\d+)\s*(hour|day|week|month|year)/i);
  if (!m) return /hour|minute/i.test(rel) ? 0 : null;
  const n = Number(m[1]);
  return { hour: n / 24, day: n, week: n * 7, month: n * 30, year: n * 365 }[m[2].toLowerCase()];
}

/** minExperience -> the lowest number of years the posting will consider. */
export function minYears(exp) {
  if (!exp) return 0;
  if (/any|new grad/i.test(exp)) return 0;
  const m = exp.match(/(\d+)/);
  return m ? Number(m[1]) : 0;
}

/**
 * The things that make a posting unwinnable regardless of how good the fit is.
 * Returns null to keep, or the name of the reject bucket it died in.
 */
export function rejectReason(j, opts = {}) {
  const { allRoles = false, includeUS = false, maxQuietDays = 30, freshOnly = false, relocateAbroad = false } = opts;
  if (!allRoles && j.role !== "eng") return "role";
  if (j.isIncomplete) return "incomplete";
  // The big one. ~73% of YC postings are "US citizen/visa only" — Shivam needs sponsorship
  // or remote-from-India, so those are dead on arrival no matter how good the fit is.
  if (!includeUS && /US citizen\/visa only/i.test(j.visa ?? "")) return "visa";
  // Graduating May 2026. Anything asking 5+ years is a wall, not a stretch.
  if (minYears(j.minExperience) > 4) return "exp";
  // India or remote only (facts.yaml work_auth.relocation). YC's location string carries
  // "Remote" when a remote option exists, e.g. "San Francisco, CA, US / Remote".
  // `IN` is YC's country code; matched case-sensitively so the word "in" doesn't count.
  const inIndia = (s) => /\bIN\b/.test(s) || /india|bengaluru|bangalore|mumbai|delhi|gurugram|hyderabad|pune|chennai|noida/i.test(s);
  if (!relocateAbroad && j.location && !/remote/i.test(j.location) && !inIndia(j.location)) return "onsite-abroad";
  // "Remote (US)", "Remote (FR; CH)": remote, but only from those countries. Seen on company
  // pages, which carry far more of these than the grid. Bare "Remote" stays open.
  if (!relocateAbroad && j.location && !inIndia(j.location)) {
    const remotes = j.location.match(/remote(\s*\([^)]*\))?/gi) ?? [];
    if (remotes.length && remotes.every((r) => /\(/.test(r))) return "onsite-abroad";
  }
  // Ghost-job filter: `lastActive` is when the company last signed into WaaS. An old
  // posting from an active company is fine (they leave reqs up); any posting from a
  // company that hasn't logged in for a month is shouting into a void.
  const quiet = toDays(j.lastActive);
  if (quiet !== null && quiet > maxQuietDays) return "quiet";
  // Company /jobs pages carry no `lastActive`, so the check above can't run on them. Fall
  // back to the posting's own age: an evergreen req up for 4+ months with no activity signal
  // is a ghost (the first sweep graded a 7-year-old posting A without this).
  if (quiet === null && !j.lastActive) {
    const age = toDays(j.createdAt);
    if (age !== null && age > 120) return "quiet";
  }
  if (freshOnly) {
    const age = toDays(j.createdAt);
    if (age !== null && age > 30) return "stale";
  }
  return null;
}

/**
 * Score a posting. Mechanical only — the /yc-scout skill does the judgment pass on top.
 * stack 35 / stage 25 / story 25 / practicals 15 — same weights as /job-scout.
 * `co` is the yc-oss company record (team size, stage, tags) or null.
 */
export function scoreJob(j, co, { matchKeywords, matchStory, storyPoints }) {
  const hay = [j.title, j.companyOneLiner, (j.skills ?? []).join(" "), j.roleSpecificType, (co?.tags ?? []).join(" ")]
    .join(" ").toLowerCase();
  const { strong, weak } = matchKeywords(hay);

  let score = 0;
  const why = [];
  if (strong.length >= 2) { score += 35; why.push(`stack: ${strong.slice(0, 4).join(", ")}`); }
  else if (strong.length === 1) { score += 25; why.push(`stack: ${strong[0]}`); }
  else if (weak.length >= 2) { score += 15; why.push(`stack (weak): ${weak.slice(0, 3).join(", ")}`); }

  const team = co?.team_size ?? null;
  if (team !== null && team <= 15) { score += 25; why.push(`${team}-person team`); }
  else if (team !== null && team <= 50) { score += 15; why.push(`${team}-person team`); }
  else if (team !== null) { score += 5; why.push(`${team}-person team`); }
  else score += 10;
  if (/founding|first engineer|early engineer/i.test(j.title)) { score += 10; why.push("founding-eng seat"); }

  const story = matchStory(hay);
  const pts = storyPoints(story);
  if (pts) { score += pts; why.push(`story fit${pts < 25 ? " (AI vocab only)" : ""}: ${story.slice(0, 3).join(", ")}`); }
  else if (weak.length >= 2) score += 10;

  if (/remote/i.test(j.location ?? "")) { score += 6; why.push("remote"); }
  if (/\bIN\b|India|Bengaluru|Bangalore|Delhi|Gurugram|Mumbai/i.test(j.location ?? "")) { score += 5; why.push("India-based"); }
  if (/Will sponsor/i.test(j.visa ?? "")) { score += 4; why.push("will sponsor"); }
  const seat = seatFit({ title: j.title, minYears: j.minExperience ? minYears(j.minExperience) : null });
  score += seat.delta; why.push(...seat.why);
  const age = toDays(j.createdAt);
  if (age !== null && age <= 14) { score += 5; why.push(`posted ${j.createdAt} ago`); }
  if (j.hiringManager) why.push(`HM: ${j.hiringManager.first_name} ${j.hiringManager.last_name}`);

  const grade = seat.reject ? "F" : gradeOf(score);
  return { score, grade, why, team };
}

/** The record shape both scouts write into inbox/*.json. */
export function toHit(j, co, scored, extra = {}) {
  return {
    id: j.id, grade: scored.grade, score: scored.score, company: j.companyName, batch: j.companyBatchName,
    title: j.title, location: j.location, visa: j.visa, minExperience: j.minExperience,
    salaryRange: j.salaryRange, equityRange: j.equityRange, skills: j.skills,
    oneLiner: j.companyOneLiner, createdAt: j.createdAt, lastActive: j.lastActive,
    teamSize: scored.team, stage: co?.stage ?? null, tags: co?.tags ?? [], website: co?.website ?? null,
    hiringManager: j.hiringManager ? `${j.hiringManager.first_name} ${j.hiringManager.last_name}` : null,
    jobUrl: j.url?.startsWith("http") ? j.url : YC + j.url,
    companyUrl: j.companyUrl?.startsWith("http") ? j.companyUrl : YC + j.companyUrl,
    why: scored.why, ...extra,
  };
}

/** yc-oss mirror of YC's own index: team size, stage, tags. Empty map if unreachable. */
export async function ycCompanies() {
  const db = new Map();
  try {
    const res = await fetch("https://yc-oss.github.io/api/companies/hiring.json");
    if (res.ok) for (const c of await res.json()) db.set(c.name.toLowerCase(), c);
  } catch { /* enrichment is optional; the scouts run fine without it */ }
  return db;
}
