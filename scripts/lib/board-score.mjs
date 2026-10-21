/**
 * One scorer for postings that arrive as free text with a location: the remote boards
 * (board-scout.mjs) and company ATS boards (ats-scout.mjs). Moved out of board-scout.mjs on
 * 2026-10-21 so the two can't grade the same posting differently — same rule as
 * keywords.mjs, fit.mjs and yc-job.mjs. Mechanical only; the skills do the judgment pass.
 *
 * stack 35 / story 25 / stage 25 / practicals 15, same weights as /job-scout.
 */
import { seatFit, grade as gradeOf } from "./fit.mjs";

// Story fit is derived from the boundary-matched keywords, never from a fresh substring
// regex over the body (that is how an Android role scored as a DeFi story fit).
const INFRA = ["code execution", "sandbox", "developer tools", "devtools", "kafka", "bullmq", "celery", "job queue", "message queue", "distributed systems"];
const AGENT = ["ai agent", "agentic", "llm", "rag", "playwright"];

/** Titles that are not an engineering seat. Title-based, because a JD body says "engineering" even for a PM req. */
export const NON_ENG = /\b(designer|design|marketing|sales|recruit\w*|customer (support|success)|community manager|content writer|copywriter|account (executive|manager)|social media|non.tech|product manager|project manager|program manager|chief of staff|video editor|editor|analyst|accountant|hr\b|people ops|operations manager|business development|partnerships?|writer|translator|tutor|teacher|virtual assistant|bookkeep\w*|paralegal|nurse|therapist)\b/i;
// "Member of Technical Staff" / "MTS" is how many Indian startups title SWE roles (Composio
// had 5 of them on 2026-10-21, all missed); "Forward Deployed Engineering Intern" has no "engineer".
export const ENG_HINT = /\b(engineer|developer|programmer|swe|sde|architect|devops|sre|full.?stack|backend|back.end|frontend|front.end|cto|technical lead|member of technical staff|mts|forward deployed engineer\w*)\b/i;
export const isEngTitle = (title = "") => ENG_HINT.test(title) && !NON_ENG.test(title);

/**
 * @param {object} p
 * @param {string} p.title
 * @param {string} [p.text]       posting body
 * @param {{strong: string[], weak: string[]}} p.matched   from matchKeywords(text)
 * @param {{status: string, reason: string}} p.reach       from reachability()
 * @param {number|null} [p.ageDays]
 * @param {number} [p.bonus]      source-specific points (e.g. the crypto-native board)
 * @param {string} [p.bonusWhy]
 * @returns {{score: number, grade: string, why: string[]}}
 */
export function scorePosting({ title, text = "", matched, reach, ageDays = null, bonus = 0, bonusWhy = "" }) {
  const { strong, weak } = matched;
  let score = 0;
  const why = [];

  // stack 35
  if (strong.length >= 2) { score += 35; why.push(`stack: ${strong.slice(0, 4).join(", ")}`); }
  else if (strong.length === 1) { score += 25; why.push(`stack: ${strong[0]}`); }
  else { score += 15; why.push(`stack (weak): ${weak.slice(0, 3).join(", ")}`); }

  // story 25
  const infraHit = strong.filter((k) => INFRA.includes(k));
  const agentHit = strong.filter((k) => AGENT.includes(k));
  if (infraHit.length) { score += 25; why.push(`story fit: CodeSM/Yuvro/Storix (${infraHit.join(", ")})`); }
  else if (agentHit.length) { score += 25; why.push(`story fit: Hireflow/klimb.io AI metering (${agentHit.join(", ")})`); }
  else if (weak.length >= 2) score += 10;

  // stage 25: founding seats and small teams are where a projects-over-years bar exists
  if (/founding|first engineer|early engineer|founding engineer/i.test(title)) {
    score += 20; why.push("founding-eng seat");
  }
  const seat = seatFit({ title, text });
  score += seat.delta; why.push(...seat.why);
  if (seat.reject) why.push(seat.reject);

  // practicals 15
  if (reach.status === "open") { score += 12; why.push(`reachable: ${reach.reason}`); }
  else { score += 4; why.push("location not stated (ask before investing)"); }
  if (bonus) { score += bonus; if (bonusWhy) why.push(bonusWhy); }
  if (ageDays !== null && ageDays <= 7) { score += 6; why.push(`posted ${ageDays}d ago`); }

  return { score, grade: seat.reject ? "F" : gradeOf(score), why };
}
