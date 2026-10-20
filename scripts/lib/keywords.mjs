/**
 * Shivam's profile keywords — the single source of truth for every scout.
 *
 * These used to be copy-pasted into scout.mjs and yc-scout.mjs separately, which meant a
 * tweak in one silently diverged from the other. Everything imports from here now.
 *
 * strong = the core wedge, one hit is enough to surface a posting.
 * weak   = supporting signal, needs two.
 *
 * Traceable to profile/facts.yaml. Add a keyword here only when it maps to something real
 * in that file — a keyword he can't back in an interview just buys noise. Bare "express" and
 * "node" are deliberately not strong: "express interest" and graph "nodes" are everywhere.
 */
export const STRONG = [
  // backend-infra framing (CodeSM, Yuvro, Storix, Chatterly, poiro.com)
  "backend engineer", "backend developer", "infrastructure engineer", "platform engineer",
  "distributed systems", "node.js", "nodejs", "express.js", "typescript", "fastapi",
  "postgres", "postgresql", "redis", "kafka", "bullmq", "celery", "docker", "kubernetes", "k8s",
  "websocket", "job queue", "message queue",
  // dev-tools framing (CodeSM, Yuvro)
  "developer tools", "devtools", "code execution", "sandbox",
  // AI-workflow framing (Hireflow, klimb.io metering + interview platform). "ai agent" and
  // "agentic" are WEAK: on 2026-09-29 they alone lifted a sales role, a Spanish-speaking
  // solutions architect and a Chief Architect to B.
  "llm", "rag", "playwright",
  // the seat shape that doesn't gate on years
  "founding engineer", "first engineer",
];

export const WEAK = [
  "next.js", "nextjs", "react", "node", "python", "javascript", "mongodb", "prisma",
  "aws", "s3", "cloudflare", "nginx", "linux", "ci/cd", "c++",
  "full-stack", "full stack", "backend", "infra", "platform", "real-time", "realtime",
  "scraping", "automation", "etl", "pipeline", "ai agent", "agentic",
  "remote", "new grad", "junior", "early career", "graduate", "entry level",
];

/**
 * The story-fit set: postings where a specific project is the pitch (CodeSM for execution
 * sandboxes, Yuvro for cloud IDEs, Hireflow for LLM automation, Storix for async ingestion),
 * rather than just a stack overlap. Scored separately and worth +25 in the scouts, which is
 * why it has to be boundary-matched like everything else — see the warning on matchStory below.
 */
export const STORY_INFRA = [
  "code execution", "sandbox", "sandboxed", "developer tools", "devtools", "developer platform",
  "cloud ide", "web ide", "browser automation", "web scraping", "data pipeline", "ingestion",
  "job queue", "message queue", "async", "background jobs", "idempotency", "credits ledger",
  "usage-based billing", "metering", "deduplication", "object storage",
];
export const STORY_AI = [
  // Bare "ai" belongs here and is safe ONLY because of boundary matching: it hits
  // "AI platform" and "Voice AI" while skipping email/maintain/training/retail. Measured on
  // the 2026-07-30 YC run, dropping it would have lost 16 of 31 real AI companies.
  "ai", "ai agent", "agentic", "agents", "llm", "rag",
];
export const STORY = [...STORY_INFRA, ...STORY_AI];

/**
 * Match keywords on WORD BOUNDARIES, not substrings.
 *
 * The scouts used `text.includes(k)` from the start, which meant "defi" matched **define**,
 * **definitely** and **undefined**; "go" matched **going**, **good**, **algorithm**; "rag"
 * matched **storage** and **fragment**. Found 2026-07-30 when the board scout surfaced an
 * Android role and an advertising post as DeFi story-fits. Every scout imports this now, so
 * the same posting scores the same way everywhere.
 */
const boundary = (k) => {
  // Escape regex metacharacters (next.js, node.js), then require a non-word char either side.
  const esc = k.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  // Optional trailing "s" so a plural still counts: a posting saying "ai agents for
  // collections" or "smart contracts" is the same signal as the singular, and requiring an
  // exact match silently dropped those. Safe under the boundaries above (the "s" is inside
  // the match, so "storage" still cannot satisfy "rag").
  return new RegExp(`(?:^|[^a-z0-9])${esc}s?(?:[^a-z0-9]|$)`, "i");
};

const STRONG_RE = STRONG.map((k) => [k.trim(), boundary(k)]);
const WEAK_RE = WEAK.map((k) => [k.trim(), boundary(k)]);
const STORY_RE = STORY.map((k) => [k.trim(), boundary(k)]);

/** @returns {{strong:string[], weak:string[]}} */
export function matchKeywords(text = "") {
  const t = String(text);
  return {
    strong: STRONG_RE.filter(([, re]) => re.test(t)).map(([k]) => k),
    weak: WEAK_RE.filter(([, re]) => re.test(t)).map(([k]) => k),
  };
}

/**
 * Is this posting a story fit (worth +25)?
 *
 * yc-scout.mjs used to ask this with `/agent|llm|ai|crypto|web3|blockchain|defi/i.test(hay)`.
 * With no word boundaries, the bare `ai` alternative matched **email**, **maintain**,
 * **training**, **available** and **retail**, so an email-marketing company scored the full
 * +25 as a story fit. Never inline that regex again; call this.
 *
 * @returns {string[]} the matching story keywords (empty = not a story fit)
 */
export function matchStory(text = "") {
  const t = String(text);
  return STORY_RE.filter(([, re]) => re.test(t)).map(([k]) => k);
}

/**
 * Story points for a matchStory() result. An infra match (a project of his IS the pitch) is
 * worth the full 25; AI vocabulary alone is 12, because every AI company says "agents" and
 * that told the scouts nothing about fit (2026-09-29: 10 of 11 A/B grades were wrong).
 */
export function storyPoints(story = []) {
  if (story.some((k) => STORY_INFRA.includes(k))) return 25;
  if (story.length) return 12;
  return 0;
}
