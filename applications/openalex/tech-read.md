# OpenAlex — tech read (2026-09-29)

Cluster: `profile/domains/metered-data-api.md` (written today, first company in it).
Sources: `stack-probe.json`, `github-recon.md`, and three public repos read directly:
`openalex-api-proxy` (src/index.ts, src/rateLimiter.ts, wrangler.jsonc), `openalex-elastic-api`
(app.py), `openalex-walden` (CLAUDE.md, CHANGELOG.md, jobs/).

## 1. The system, as far as it is visible
- [fact] **A TypeScript Cloudflare Worker is the front door for `api.openalex.org/*` and
  `content.openalex.org/*`.** `openalex-api-proxy/wrangler.jsonc` routes; stack-probe sees
  `server: cloudflare` on the API host.
- [fact] **Rate limiting and billing live in a `RateLimiter` Durable Object**, one per key
  (`idFromName("credits:"+apiKey)`), holding a daily counter, a prepaid "onetime" counter and a
  per-second token bucket. Daily and onetime counters are **persisted every 10s by alarm**
  (`PERSIST_INTERVAL_MS = 10000`), refunds persist immediately.
- [fact] **Pricing is per endpoint class**: `1 credit = $0.0001`, list = 1, search = 10
  (grandfathered keys 1). The Worker sets `X-Cost-USD` and the Flask app copies it into
  `meta.cost_usd` (`openalex-elastic-api/app.py`, `inject_cost_usd`).
- [fact] **Prepaid balances live in Postgres, reached from the Worker via Hyperdrive**
  (`UPDATE users SET onetime_credits_balance = GREATEST(0, onetime_credits_balance - $1)`).
- [fact] **Behind it, a Flask + elasticsearch-dsl API** with one blueprint per entity and a
  caching extension; Sentry for errors.
- [fact] **The data is built nightly on Databricks** (`openalex-walden`, `databricks.yml`, ~80
  job YAMLs: crossref, datacite, pubmed, repo, landing-page, PDF parsing, affiliation matcher,
  Qwen3 embeddings). `Walden End 2 End` runs at 05:00 UTC; a Guardrails notebook fails the publish
  path if more than **7.5M** `openalex_works` rows carry the run's `updated_date`.
- [inference] **Change detection is content-hash based per work**: walden/CLAUDE.md warns "a small
  entity-side change can re-stamp tens of millions of works" by giving them "a new content hash".
- [fact] **They build with agents**: `CLAUDE.md` + `AGENTS.md` in walden, "agent-maintained md
  corpus" for help.openalex.org, `oxjob #NNN` IDs everywhere.

## 2. What they are worried about right now
Search load and abuse on the keyless tier: an "anon-search ladder" with a global
`SearchHealthController` DO (GREEN/YELLOW/ORANGE/RED) replaced an emergency flag that "503'd ALL
keyless non-GUI works search while armed, 07-01→07-02", plus wide-OR and boolean-operator gates
and an `api-slowdown` runbook. On the data side, bulk corrections that trip the 7.5M guardrail on
intended work (tripped four times, 2026-06-25 → 09-21) and messy-string repair at scale (the
2026-08-18 mojibake fix, ~172K strings on ~189K works).

## 3. The problems this shape forces
1. **Metering at the edge vs. money in the database.** Consumption is counted in a DO and
   settled into Postgres later, so there's always a window where the two disagree. Acute here
   because credits are real prepaid dollars and the DO flushes on a 10s alarm, not per request.
2. **Charge-then-refund needs idempotency.** They charge before calling ES and refund on failure
   (`/refund`, three call sites incl. the 504 path). Any retry of the refund call or of the
   request can double-refund or double-charge unless the call is keyed. Acute because the
   refund endpoint takes a bare `credits` count, no request id.
3. **One bulk change, hundreds of millions of rows.** A content-hash-driven nightly means a
   one-line normalisation can re-stamp tens of millions of works and hold the whole publish for
   a day. Acute because the guardrail is a single global line and publish is all-or-nothing.

## 4. The seam Shivam has already touched
**The credit ledger.** At klimb.io he designed a PostgreSQL-backed usage-metering and credit
ledger across **6+ AI features** (facts.yaml). Their Worker is the same object: per-feature
(per-endpoint) pricing, a consumption log, a balance that must stay right. Honest distance:
**adjacent, not the same.** His ledger was in-process Postgres with no edge counter, so he has
not handled the DO→DB settlement window. He can talk about pricing by feature and auditability;
he has not operated edge counters.

## 5. Two questions only an internals reader would ask
1. **"When `writebackOnetimeCredits` claims and zeroes the DO's consumed count before the
   Postgres UPDATE, what happens if the isolate dies between the two? Is that window just
   accepted as a small give-away, or is there a reconciliation job that catches it?"**
   - If they say *"accepted, amounts are tiny"*: ask whether they've ever measured it, e.g. DO
     consumed-per-day vs. DB balance deltas.
   - If they say *"there's a reconciler"*: ask what it keys on, since the DO only stores a
     running total, not per-request entries.
   - Concept to read first (5 min): Durable Object storage is transactional per object, but a
     Worker's `waitUntil` work can be cut off, so anything after the claim is best-effort.
2. **"Refunds go to the daily pool first because the daily pool is charged first. If a request
   is charged at 23:59 UTC and refunded after midnight, does that refund land on the new day's
   counter?"** (`loadFromStorage` resets the count when the stored date isn't today, and
   `/refund` subtracts from whatever the current day's count is.)
   - If *"yes, and we don't care"*: fair, ask whether the same holds for the onetime pool, where
     it's real money.
   - If *"we tag charges with the day"*: ask where, since the DO's counter is one number.

## 6. Do not say
- Do not call any of §5 a bug. He has read the code, not run it, and the DO semantics may make
  the windows smaller than they look. Ask; never assert.
- Do not say "I've built edge rate limiting" or "Durable Objects". He hasn't.
- Do not claim Spark, PySpark, Databricks or Elasticsearch experience.
- Do not quote "a billion API calls" as his scale, or imply his systems ran at their size.
- Do not name the CTO. The page says "report to our CTO" and names nobody.
- Do not quote walden/CLAUDE.md lines as Jason's words in anything sent. Reading their public
  repo is fine to mention; quoting their internal agent instructions back at them is not.
