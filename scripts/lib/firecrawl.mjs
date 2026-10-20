/**
 * firecrawl.mjs — thin wrapper around the Firecrawl REST API for multi-page company
 * research. Plain fetch, no SDK dependency (this repo has no package.json / npm deps).
 *
 * Why: WebFetch pulls one page of raw HTML into the model's context per call, so
 * researching a company's product/blog/changelog across 5-10 pages burns tokens fast
 * and loses budget to nav/footer noise. Firecrawl returns pre-cleaned markdown per page
 * and can map/crawl a whole site in one call, so the same research pass costs far less
 * context and covers more ground.
 *
 * Key comes from FIRECRAWL_API_KEY in the environment, or job-ops/.env (gitignored —
 * never commit it). Free-tier key as of 2026-08-04; swap for a paid key if it runs out.
 *
 * CLI:
 *   node scripts/lib/firecrawl.mjs scrape <url>
 *   node scripts/lib/firecrawl.mjs map <url>
 *   node scripts/lib/firecrawl.mjs crawl <url> [--limit N]
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function loadKey() {
  if (process.env.FIRECRAWL_API_KEY) return process.env.FIRECRAWL_API_KEY;
  try {
    const env = readFileSync(join(ROOT, ".env"), "utf8");
    const line = env.split("\n").find((l) => l.startsWith("FIRECRAWL_API_KEY="));
    if (line) return line.slice("FIRECRAWL_API_KEY=".length).trim();
  } catch {}
  return null;
}

const KEY = loadKey();
const BASE = "https://api.firecrawl.dev/v2";

async function call(path, body) {
  const headers = { "Content-Type": "application/json" };
  if (KEY) headers.Authorization = `Bearer ${KEY}`;
  const res = await fetch(`${BASE}${path}`, { method: "POST", headers, body: JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(`Firecrawl ${path} failed: ${res.status} ${json.error ?? JSON.stringify(json)}`);
  }
  return json.data ?? json;
}

/** Scrape one URL, return clean markdown (+ optional metadata). */
export async function scrape(url, { formats = ["markdown"] } = {}) {
  return call("/scrape", { url, formats });
}

/** Discover URLs on a site (fast, no content) — use before crawl to pick targets. */
export async function mapSite(url, { search } = {}) {
  return call("/map", { url, ...(search && { search }) });
}

/** Crawl a site (or a subset via includePaths) and return markdown per page. */
export async function crawl(url, { limit = 20, includePaths } = {}) {
  const started = await call("/crawl", { url, limit, ...(includePaths && { includePaths }) });
  const jobId = started.id ?? started.jobId;
  if (!jobId) return started; // some responses come back synchronous
  // poll
  const headers = KEY ? { Authorization: `Bearer ${KEY}` } : {};
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await fetch(`${BASE}/crawl/${jobId}`, { headers });
    const json = await res.json();
    if (json.status === "completed") return json.data ?? json;
    if (json.status === "failed") throw new Error(`Firecrawl crawl ${jobId} failed`);
  }
  throw new Error(`Firecrawl crawl ${jobId} timed out after 60s`);
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const [cmd, url, ...rest] = process.argv.slice(2);
  if (!KEY) console.error("Warning: no FIRECRAWL_API_KEY found (env or .env) — falling back to keyless free tier, rate-limited.");
  try {
    if (cmd === "scrape") {
      const { markdown } = await scrape(url);
      console.log(markdown);
    } else if (cmd === "map") {
      const data = await mapSite(url);
      console.log(JSON.stringify(data.links ?? data, null, 2));
    } else if (cmd === "crawl") {
      const limitIdx = rest.indexOf("--limit");
      const limit = limitIdx >= 0 ? Number(rest[limitIdx + 1]) : 20;
      const data = await crawl(url, { limit });
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.error("Usage: node scripts/lib/firecrawl.mjs <scrape|map|crawl> <url> [--limit N]");
      process.exit(1);
    }
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
