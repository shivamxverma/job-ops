---
name: job-scout
description: Find fresh job postings matching Shivam's profile from HN Who is Hiring, Work at a Startup, Indeed (MCP), Peerlist/Wellfound (browser), and target companies; score each A–F for fit and write scored leads into inbox/. Use when asked to scout, find jobs, check who's hiring, or refresh leads.
---

# Job Scout

Goal: surface postings *early* (day-one applications convert best) and pre-score them so time
only goes to A/B leads.

## Sources (in order)
1. **HN Who is Hiring** — run `node scripts/scout.mjs` (queries hn.algolia.com for the current
   month's thread + keyword-matched comments). It writes raw hits to `inbox/hn-YYYY-MM-DD.json`.
   On the 1st of a month the new thread may not exist yet; the script falls back to last
   month's, which is still the live one until the new one lands.
2. **HN job stories** — run `node scripts/hn-jobs.mjs`. **A different corpus from source 1,
   not a different view of it:** HN's `tags=job` are the front-page "X (YC W22) Is Hiring"
   posts, which never appear as comments on the monthly thread and post continuously. They
   are also not reliably covered by `/yc-scout` — the public grid caps at ~50 per page, so a
   posting can be HN-promoted and still never surface there. Writes `inbox/hnjobs-*.json`,
   already graded A–F on the same rubric.
3. **Work at a Startup** — fetch https://www.workatastartup.com/companies filtered for
   backend, infra, dev-tools and AI roles (WebFetch; if blocked, note it and ask the user to browse with the
   extension open). Treat WaaS as a *directory of targets* — the real channel is the founder's
   inbox, not the Apply button.
4. **Indeed (MCP)** — use the connected Indeed tools (`mcp__claude_ai_Indeed__search_jobs`,
   `get_job_details`, `get_company_data`; load via ToolSearch if deferred). Run 3–4 targeted
   queries, not one broad one: "backend engineer Kafka remote", "founding engineer developer tools",
   "backend engineer TypeScript Node remote India", plus one rotating query from whatever
   framing converted best per learnings.md. `search_jobs` needs a location + country code per
   call: run each query twice, `location: "remote"` with `country_code: "IN"` and again with
   `"US"` (US-remote listings sometimes allow global). Filter hard before scoring: posted ≤7 days,
   remote/India-friendly or Bengaluru, skip staffing-agency reposts (unnamed client = C max,
   same as the Sourcebae rule). Pull `get_company_data` only for hits that survive filtering —
   it feeds stage/size into the normal A–F scoring. Indeed skews big-company/recruiter-mill,
   so expect a low hit rate; it's a supplement for coverage, not the primary channel, and the
   founder's inbox still beats the Apply button wherever a founder is findable.
5. **Peerlist + Wellfound (browser only)** — both 403 plain fetches, so this sub-source runs
   only when the Chrome session is available; skip silently in headless/scripted runs.
   - **Peerlist** (`peerlist.io/jobs`): Indian, dev-native, founders post directly, low
     applicant counts — the best geo/stage fit of any board here. Filter Remote/India, sort
     newest; the browse pages need no login. Read with `get_page_text`, human pace.
   - **Wellfound** (`wellfound.com/jobs`): startup-heavy but noisy, and real filters need
     Shivam's login. If a logged-in session exists, one search pass for founding-eng/backend/infra
     roles, remote-India; if not logged in, note it and move on rather than fight the wall.
   - Same browser etiquette as linkedin-scout: one search at a time, no scripted bursts, stop
     on any CAPTCHA/verify wall. Score A–F as usual; tag the source (`Peerlist:`/`Wellfound:`)
     and note applicant counts where shown (both display them — a practicals signal).
6. **Target list** — check `applications/targets.md` companies' careers pages for new roles.
7. **Repeat posters** — search past months on hn.algolia.com for companies posting the same
   role monthly = actually growing. Flag these.

## Scoring (A–F) against profile/facts.yaml
- **Stack fit** (does the role touch: Node/TypeScript, FastAPI/Python, Postgres/Redis,
  queues (BullMQ/Celery/Kafka), Docker/Kubernetes, LLM workflows/Playwright?) — weight 35%
- **Stage fit** (seed–Series B, founder still hiring personally) — 25%
- **Story fit** (would CodeSM/Yuvro/Hireflow/Storix or the poiro.com asset work be a *directly relevant* flex here?) — 25%
- **Practicals** (remote-friendly / India-friendly / new-grad-open / posted <7 days ago) — 15%

A = apply today with full pipeline. B = apply this week. C = only if the week is quiet.
D/F = log and skip.

## Output
Append scored leads to `inbox/leads.md` as:
`- [ ] **{Company}** — {role} | {A-F} | posted {date} | {source+link} | why: {one line} | founder/HM: {name/handle if findable}`

Never auto-apply to anything. Scout ends at a ranked list.
