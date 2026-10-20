---
name: linkedin-scout
description: Manually browse LinkedIn (via your logged-in Chrome session) for hiring-signal posts, fresh job listings, and warm-network hiring activity — scored the same way as job-scout/signal-scout. Use when asked to check LinkedIn, scout LinkedIn for jobs, or look for hiring/expansion posts on LinkedIn.
---

# LinkedIn Scout

Same goal as `/job-scout` and `/signal-scout` — surface leads early and pre-scored — but a
different mechanism, because LinkedIn is not a public read API like hn.algolia.com or an
open page like Work at a Startup. `signal-scout`'s "Source 2" already flagged why:
**scraping or automating LinkedIn at any volume risks the account.** This skill is the
implementation of that constraint, extended to cover job listings and network signal too,
not just funding-adjacent headcount growth.

## Measured facts (2026-07-30) — read these before choosing a lens

These were tested in Shivam's own session on 2026-07-30 and they change which lens is worth
running. **The Jobs tab was the default channel and it was the wrong one.**

1. **LinkedIn Jobs keyword search does not respect the keyword** (measured on the previous
   owner's niche-stack search; the finding is about LinkedIn, not the stack).
   `keywords=solidity&f_TPR=r604800&sortBy=DD&f_WT=2&geoId=102713980` (India, remote, past
   week) reported "100+ results" and the top rows were *Frontend Developer* at FLIP, an
   *ElectronJS desktop* role at Hired, and a *Full-stack Developer* at Eslanda. Not one
   Solidity role. The relevance engine expands a niche stack term into "software job" and the
   date sort then floats whatever is newest, matched or not.
2. **Quoting and boolean made it worse, not better.** `"solidity" OR "smart contract"` over
   the same window returned 7 rows and **every one was `Promoted`** — paid ads for React,
   full-stack and Amazon SDE roles. So there is no query syntax that fixes lens 2. Don't spend
   another session hunting for one.
3. **Post/content search does respect the query.** In the same session,
   `"hiring a founding engineer"` with Latest + Past week returned, as row one, a genuine
   58-minute-old post hiring a founding AI engineer for a Mumbai startup. The query worked
   exactly as written.

**Therefore: posts are the discovery channel on LinkedIn. The Jobs tab is a *verification*
channel, used company-first, never keyword-first.** Lens 2 below is rewritten around that.

### DOM notes (LinkedIn ships obfuscated class names now)
Class-based selectors are dead: `div.feed-shared-update-v2`, `[data-chameleon-result-urn]`,
`li.artdeco-card`, `.update-components-text` all returned **0 nodes** on the content-search
page. What works:

- **Content search:** `main li` (returned the 6 rendered posts). Read `innerText`.
- **Jobs search:** `li[data-occludable-job-id]`. **Every card renders twice** — dedupe on
  `innerText` or you will double every lead.
- **Alumni cards:** see `/network-scout` lens 3. Dedupe by **name**, not URL: the same person
  appears once under a vanity slug and once under an `ACoAA…` URN slug.

## Hard rules (read before touching the browser)
- **Manual/on-demand only. Never wire this into a cron or scheduled workflow.** HN and the
  funding RSS feeds are fine to poll every 6h because they're public, unauthenticated reads.
  LinkedIn is a logged-in session tied to Shivam's real identity — a ban here is expensive in
  a way a failed scout run on HN never is.
- **One search at a time, read like a human.** Navigate to a search URL, read the results
  with `get_page_text`, decide what's worth a closer look, then move on. Never script a loop
  that opens dozens of profiles or posts back-to-back in one burst.
- **No bulk profile visits.** Looking at a specific person's profile once, because a post or
  a lead calls for it, is fine. Crawling a list of profiles is not — that's exactly the
  pattern LinkedIn's automation detection watches for.
- **If a checkpoint, CAPTCHA, or "verify it's you" prompt appears, stop immediately and tell
  Shivam.** Do not attempt to solve it or click through (prohibited action, and also a signal
  to back off entirely for a while).
- **Session must already be logged in.** Use the tab the user has open, or a new MCP tab —
  never enter LinkedIn credentials.

## What to look for (three lenses, run separately)

### 1. Hiring posts and team-expansion posts (→ `inbox/leads.md` / `inbox/signals.md`)
**This is now the primary lens.** It is the one that measurably works, and it reaches roles
before they are posted anywhere.

URL: `linkedin.com/search/results/content/?keywords={q}&datePosted=%22past-week%22&sortBy=%22date_posted%22`

**The quotes in the values are required.** `datePosted="past-week"` and `sortBy="date_posted"`
are literal quoted strings in the query string (`%22…%22`); without them the filter chips do
not apply and you silently get all-time results sorted by relevance. Confirmed working values:
`datePosted` = `"past-24h"` / `"past-week"` / `"past-month"`, `sortBy` = `"date_posted"` /
`"relevance"`. Verify the chips read **Latest** and **Past week** on the rendered page before
trusting a run.

**Query design — same rule `/x-scout` proved: intent phrase AND role noun, one query at a
time.** LinkedIn's content search matches the phrase, so give it a phrase a hiring human would
actually type, not a topic. Run these as separate searches, don't try to OR them all into one:

*Founder-voice hiring phrases:*
- `"hiring a founding engineer"`, `"looking for a founding engineer"`, `"our first engineer"`
- `"hiring our first backend"`, `"we're hiring a backend engineer"`
- `"hiring a backend engineer"`, `"looking for a platform engineer"`, `"infrastructure engineer"`
- `"hiring an AI engineer"`, `"hiring an agent engineer"`, `"MCP"` + `hiring`
- `"joining us as"`, `"come build with us"`, `"DM me your github"`

*Expansion signal, no role named yet (→ `inbox/signals.md`, A–D as usual):*
- `"just closed our seed"`, `"we raised"`, `"excited to announce our funding"`,
  `"growing the team"`, `"we're expanding the team"`, `"first engineering hire"`

*Rotate the role noun across all three of Shivam's framings* (backend-infra / full-stack / AI-workflow
per `facts.yaml`) rather than searching his whole stack at once. A query that names one role
returns a readable page; a query that names eight returns mush.

**Triage every post before researching it — LinkedIn's hiring-post noise is recruiters, not
bots, and it has a different shape from X's.** Borrow the L1/L2/L3 tiers from `/x-scout` and
add these LinkedIn-specific L3 patterns, all seen in the 2026-07-30 run:

- **"On Hiring Spree" / recruiter-with-unnamed-client.** The verified example: a post hiring a
  "Founding AI Engineer for a Mumbai-based startup" that never names the startup. No named
  company = no dossier, no research, no tailored artifact, so the whole pipeline can't run on
  it. L3 unless a company name is recoverable from the poster's page or the comments.
- **Hashtag-stuffed posts** (`#hiring #AI #Engineer #Mumbai`) are recruiter/aggregator output.
  Founder posts rarely stack hashtags.
- **"Send your CV to hr@…" with no role detail** → L3.
- A 3rd°+ recruiter posting several unrelated roles → same aggregator logic as X. L3.

An **L1 here** is a named company whose own page or site confirms it exists, posted by someone
whose headline puts them *inside* that company. Those go to `inbox/leads.md`, scored A–F per
`job-scout`, and the poster is the founder/HM field — which is the real prize of this lens,
because a named human beats HN's anonymous email every time.

### 2. Company-first job verification (→ `inbox/leads.md`)
**Do not run keyword searches against the Jobs tab.** Measured fact 1 and 2 above: it returns
unrelated roles and promoted ads for anything niche. Use the Jobs surface only where it is
scoped to something already chosen, which removes the relevance engine from the loop:

- **`linkedin.com/company/{slug}/jobs/`** — a specific company's own openings. Reliable,
  because there is nothing to rank. This is the correct way to answer "is company X hiring",
  and it's the query the rest of the pipeline actually needs (lens 1 of `/network-scout`,
  dossier building, checking a signal has turned into a posting).
- **`f_C={companyId}`** on a jobs search to scope to a set of chosen companies at once. Get the
  ids from each company page. Good for sweeping `applications/targets.md` in one pass.
- **"Meet the hiring team"** on an individual job post names a real person, often with a
  Message button. Always check it: it converts a blind application into an `/outreach` target.
  Record the name in the lead line and in the dossier.

If a broad-title search is run anyway (`"backend engineer"`, `"founding engineer"` — titles
match even when stack keywords don't), **filter client-side, because LinkedIn won't**:
dedupe (cards render twice), drop every row tagged `Promoted`, drop rows whose *title* carries
no term from the STRONG/WEAK tiers in `scripts/scout.mjs`, and drop staffing/consultancy
posters. Keep the freshness string LinkedIn gives you (`6 minutes ago`) and the
`Actively reviewing applicants` / applicant-count tag — those are real practicals signals that
HN and WaaS don't provide, and they belong in the why-field.

### 3. Network / 2nd-degree signal (→ tag on either output above)
LinkedIn shows connection degree (1st/2nd/3rd) on every post and profile — use it. When a
hiring-signal post or job listing comes from someone in Shivam's 1st or 2nd degree network,
tag the why-field with `(2nd°, mutual: {name if shown})` or `(1st°)`. This changes the
recommended next move from a cold email (`/outreach`) to a referral ask or direct DM — flag
it explicitly so the pipeline doesn't default to the cold-outreach path when a warmer one
exists.

## Output format
Same line formats as the other two scouts, with `LinkedIn` as the source:
- Signals: `- [ ] **{Company}** — {A-D} | {date} | LinkedIn: {post URL} | why: {one line, include (Nth°) tag if applicable}`
- Leads: `- [ ] **{Company}** — {role} | {A-F} | posted {date} | LinkedIn: {job URL} | why: {one line} | founder/HM: {name/handle if findable}`

## Cross-pipeline dedup
Before appending, check the company name against both `inbox/leads.md` and
`applications/targets.md` (same rule `signal-scout.mjs` follows) — if already tracked, note
`⚠ already in leads.md as "..."` instead of adding a duplicate line.

## Cadence
On-demand only, run whenever Shivam asks. A reasonable default when he doesn't specify:
**lens 1 with 4–6 separate phrase queries, then lens 2 only against companies lens 1 or the
network turned up.** Lens 3 is a tag on the other two, not a pass of its own. Stop and
summarize rather than continuing indefinitely — this is a scout, not a feed.

If a run produces no L1 leads, say so plainly. Given measured fact 1, a zero-lead LinkedIn run
is a normal outcome and **not** a reason to fall back to keyword-searching the Jobs tab. The
better fallback is `/network-scout` lens 3 (alumni), which does not depend on anyone posting.
