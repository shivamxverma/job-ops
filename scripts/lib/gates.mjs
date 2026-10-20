/**
 * Gates — the "is this worth anything" check, moved to scout time.
 *
 * Measured 2026-08-19 on the first `/autoapply` run: **six of the eight companies at the top of
 * the C pile failed a basic gate**, and each failure was discovered only after a human (or the
 * model) had already spent time on it. One listing 302'd to a job board's homepage. One company's
 * domain did not resolve at all. One advertised "Product Engineers" on HN and had seven Senior
 * titles on its live board. That is the same class of waste `reachability.mjs` was written to
 * kill in 2026-07-30, arriving through a different door.
 *
 * So: the gates run before the work, not after it. Three of the five are mechanical and live
 * here. Two are not, and this module says so rather than pretending:
 *
 *   posting-live   mechanical — fetch it
 *   seat-level     mechanical — the title and the years bar are text
 *   reachability   mechanical — delegated to lib/reachability.mjs, unchanged
 *   channel        mechanical-ish — probe the obvious apply routes, report what answered
 *   prior-contact  PARTLY: the repo half is checkable here, the Gmail half is not.
 *                  Gmail lives behind an MCP that only a session can reach, and Gmail is the
 *                  only store that knows what actually went out (it is what caught the Strello
 *                  Health duplicate). So this gate returns `needs-session` and the skills carry
 *                  the instruction. Do not "fix" this by dropping the Gmail check.
 *
 * Same rule as `keywords.mjs` and `reachability.mjs`: one implementation, shared. Never inline
 * a local copy of a gate.
 */
import { loadState, folderComplete } from "./state.mjs";
import { reachability } from "./reachability.mjs";

export const VERDICT = { PASS: "pass", FAIL: "fail", CHECK: "check" };

const timeout = (ms) => { const c = new AbortController(); setTimeout(() => c.abort(), ms); return c.signal; };

/** A title or bar that sits above ~1 year of experience. */
const SENIOR_TITLE = /\b(senior|staff|principal|lead engineer|head of|vp of|vice president|director|chief|architect|sr\.?)\b/i;
const YEARS_BAR = /\b(\d+)\+?\s*(?:-\s*\d+\s*)?years?\b[^.]{0,40}\b(experience|exp\b)/i;
const CANDIDATE_YEARS = 0.7;  // facts.yaml knockout_answers.years_of_experience (~8 months, Sep 2026)

/**
 * Gate 2 — is the posting still there?
 *
 * The tell is not only a 404. A pulled listing on a job board 302s to the board's own homepage,
 * which returns 200 and looks alive: Vidalytics' WeWorkRemotely URL did exactly that. So a
 * redirect that lands on `/` when the original had a real path is a fail, not a pass.
 */
export async function gatePostingLive(url) {
  if (!url) return { gate: "posting-live", verdict: VERDICT.CHECK, detail: "no URL on the lead" };
  try {
    const r = await fetch(url, { redirect: "follow", signal: timeout(12000) });
    const from = new URL(url), to = new URL(r.url);
    // 403/429 is a bot wall, not a dead posting. WeWorkRemotely 403s a bare fetch on a URL that
    // renders fine in a browser, so calling that a FAIL would silently drop live leads — the
    // exact class of error `reachability.mjs` is backtested against. Hand it to a human.
    if (r.status === 403 || r.status === 429)
      return { gate: "posting-live", verdict: VERDICT.CHECK, detail: `HTTP ${r.status} to a bare fetch — a bot wall, not proof it is gone. Open it in the browser.` };
    if (r.status >= 400)
      return { gate: "posting-live", verdict: VERDICT.FAIL, detail: `HTTP ${r.status}` };
    if (from.pathname.replace(/\/$/, "").length > 1 && to.pathname.replace(/\/$/, "").length <= 1)
      return { gate: "posting-live", verdict: VERDICT.FAIL, detail: `redirected to the site root (${to.host}/) — listing pulled` };
    if (to.host !== from.host)
      return { gate: "posting-live", verdict: VERDICT.CHECK, detail: `redirected to ${to.host}${to.pathname}` };
    return { gate: "posting-live", verdict: VERDICT.PASS, detail: `HTTP ${r.status}` };
  } catch (e) {
    return { gate: "posting-live", verdict: VERDICT.FAIL, detail: `unreachable (${e.name === "AbortError" ? "timeout" : e.message})` };
  }
}

/** Gate 3 — is there a seat at his level, or is everything Senior/Head-of? */
export function gateSeatLevel(role = "", text = "") {
  const bar = (role + " " + text).match(YEARS_BAR);
  const years = bar ? Number(bar[1]) : null;
  if (years != null && years > CANDIDATE_YEARS + 1.5)
    return { gate: "seat-level", verdict: VERDICT.FAIL, detail: `stated bar is ${years}+ years vs ~${CANDIDATE_YEARS}` };
  if (SENIOR_TITLE.test(role))
    return { gate: "seat-level", verdict: VERDICT.CHECK, detail: `title reads senior ("${role.trim().slice(0, 60)}") — check the live board for a non-senior seat before spending anything` };
  if (years != null)
    return { gate: "seat-level", verdict: VERDICT.PASS, detail: `stated bar ${years}+ years, clears` };
  return { gate: "seat-level", verdict: VERDICT.PASS, detail: "no seniority bar stated" };
}

/** Gate 4 — geography. Delegated wholesale; this module adds nothing to it. */
export function gateReachability(text = "", location = "") {
  const r = reachability({ text, location });
  return {
    gate: "reachability",
    verdict: r.status === "blocked" ? VERDICT.FAIL : VERDICT.PASS,
    detail: `${r.status}${r.reason ? ` — ${r.reason}` : ""}${r.status === "unknown" ? " (silence is not a wall: keep, and ask)" : ""}`,
  };
}

/**
 * Gate 5 — does a channel exist that Shivam can actually apply through?
 *
 * Probes the routes that exist in practice. It does NOT try to be clever: a hit here means
 * "something answered at this URL", and whether the board is really theirs is a human check
 * (`jobs.ashbyhq.com/compound` is a live board belonging to a different company entirely).
 */
export async function gateChannel(domain, slug) {
  if (!domain) return { gate: "channel", verdict: VERDICT.CHECK, detail: "no domain known — find one before anything else" };
  const s = (slug || domain.split(".")[0]).replace(/[^a-z0-9-]/gi, "").toLowerCase();
  const hits = [];

  // ATS boards are probed through their JSON APIs, never their HTML. Measured 2026-08-19:
  // `jobs.ashbyhq.com/runta` returns HTTP 200 with a generic "Jobs" shell for a slug that does
  // not exist, and `apply.workable.com/runta` 302s to `/oops` which is also a 200. Both would
  // have been reported as a live board. The posting APIs cannot lie the same way: they either
  // return an array of real postings or they do not answer.
  const apis = [
    [`https://api.ashbyhq.com/posting-api/job-board/${s}`, (j) => j?.jobs?.length, `https://jobs.ashbyhq.com/${s}`],
    [`https://boards-api.greenhouse.io/v1/boards/${s}/jobs`, (j) => j?.jobs?.length, `https://job-boards.greenhouse.io/${s}`],
    [`https://api.lever.co/v0/postings/${s}?mode=json`, (j) => (Array.isArray(j) ? j.length : 0), `https://jobs.lever.co/${s}`],
  ];
  await Promise.all(apis.map(async ([api, count, human]) => {
    try {
      const r = await fetch(api, { signal: timeout(9000) });
      if (!r.ok) return;
      const n = count(await r.json());
      if (n) hits.push(`${human} (${n} open)`);
    } catch { /* a dead probe is a non-answer, not an error */ }
  }));

  // Their own careers page. A redirect to the site root, or to a vendor's not-found page, is
  // not a careers page.
  const DEAD_PATH = /^\/(oops|404|not-?found|error)\b/i;
  await Promise.all([`https://${domain}/careers`, `https://${domain}/jobs`].map(async (u) => {
    try {
      const r = await fetch(u, { redirect: "follow", signal: timeout(9000) });
      const p = new URL(r.url).pathname;
      if (r.ok && p.replace(/\/$/, "").length > 1 && !DEAD_PATH.test(p)) hits.push(r.url);
    } catch { /* same */ }
  }));

  if (!hits.length)
    return { gate: "channel", verdict: VERDICT.FAIL, detail: "no careers page and no ATS board answered — never DM and never guess an address" };
  return { gate: "channel", verdict: VERDICT.CHECK, detail: `answered: ${hits.join("  ")} — verify the board is actually theirs (a name collision put a wealth-advisory firm's board under "compound")` };
}

/** Gate 1, repo half. The Gmail half cannot run here; see the module header. */
export function gatePriorContact(company) {
  const st = loadState();
  const c = [...st.companies.values()].find((x) => x.display.toLowerCase() === String(company).toLowerCase());
  if (!c) return { gate: "prior-contact", verdict: VERDICT.CHECK, detail: "nothing in the repo — still search Gmail before sending (needs a session)" };
  if (c.tracker.length) return { gate: "prior-contact", verdict: VERDICT.FAIL, detail: `tracker says ${c.status}${c.since ? ` since ${c.since}` : ""} — a re-post, not a new lead` };
  if (c.folder) return { gate: "prior-contact", verdict: VERDICT.FAIL, detail: `applications/${c.folder.slug}/ exists${folderComplete(c.folder) ? " and is complete" : " with prior work"} — check Gmail before touching it` };
  return { gate: "prior-contact", verdict: VERDICT.CHECK, detail: "clean in the repo — still search Gmail before sending (needs a session)" };
}

/**
 * Run every mechanical gate over one lead.
 * `pass` is false if ANY gate failed. `check` items are for a human, never auto-dropped.
 */
export async function runGates({ company, role = "", url = "", domain = "", slug = "", text = "", location = "" }) {
  const results = [
    gatePriorContact(company),
    await gatePostingLive(url),
    gateSeatLevel(role, text),
    gateReachability(text || role, location),
    await gateChannel(domain, slug),
  ];
  return {
    company, pass: !results.some((r) => r.verdict === VERDICT.FAIL),
    failed: results.filter((r) => r.verdict === VERDICT.FAIL).map((r) => r.gate),
    results,
  };
}
