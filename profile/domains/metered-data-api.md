# Metered data API — cluster note (2026-09-29, first written for OpenAlex)

Companies that sell (or give away with a budget) read access to a large dataset over an API:
scholarly indexes, company/people data, web-scale crawls, search APIs. OpenAlex, CyberAtlas and
SerpApi all sit here.

## 1. The shape
- A large batch-built dataset (nightly or streaming ETL) published into a search/serving store.
- A thin read API over that store, with query parsing, filters, facets, cursor pagination.
- An edge or gateway layer that authenticates keys, prices each request, and rate-limits.
- A billing store (usually Postgres) that holds balances and plans.
- A free/anonymous tier that is both the growth channel and the abuse surface.

## 2. The hard problems
1. **Metering vs. settlement.** Counting happens where the request is (edge, gateway memory);
   money lives in a database. The two drift, and the design question is how big a window you
   accept and who eats it. Symptom: balances that don't match usage logs.
2. **Charge-before-serve with refunds.** Pricing a request before you know it succeeded means a
   refund path, and a refund path needs idempotency or retries double-refund. Symptom: users
   with more credit than they bought.
3. **Heavy-query pricing.** One wide boolean/OR query can cost 1000× a list call. Flat pricing
   gets abused; complexity pricing needs a cheap pre-parse. Symptom: search latency spikes from
   a few keys.
4. **Keyless-tier shedding.** The anonymous tier has to degrade before paying users feel it,
   which needs a global health signal, not just per-key limits. Symptom: emergency kill flags.
5. **Bulk rebuild blast radius.** A small upstream normalisation can touch most of the dataset;
   a publish gate on "rows changed" catches bugs and also blocks intended work. Symptom:
   manual overrides and skipped nightlies.
6. **Messy multi-source ingest and entity resolution.** Deduplicating the same thing arriving
   from many sources with different spellings, encodings and IDs. Symptom: duplicate entities,
   junk entities with real-looking counts.

## 3. The standard trade-offs
- Count in memory and flush periodically (cheap, lossy on crash) vs. write per request
  (correct, expensive at edge scale).
- Fail-open on billing-store errors (availability) vs. fail-closed (revenue integrity).
- Price per endpoint class (simple, gameable) vs. per estimated query cost (fair, needs a parser).
- Global publish gate (simple, blocks everything) vs. per-entity or per-change-class gates.

## 4. Where Shivam's real work touches this
- **Problem 1/2, adjacent:** klimb.io PostgreSQL credit ledger across **6+ AI features**,
  per-feature consumption records for finance. In-process, no edge counter, so the settlement
  window is new to him.
- **Problem 6, direct:** Hireflow ingests **4 sources** and drops cross-source duplicates with
  **SHA-256 fingerprints** of normalised title, company and description. poiro.com's SHA-256
  dedup with a **DB uniqueness guarantee** is the same "hash is a correctness key" idea.
- **Problem 5, adjacent:** none at dataset scale. Yuvro's content-addressed S3 with garbage
  collection is the nearest (content hashes decide what changed), at small scale.
- **Nothing** on problems 3 and 4. Don't stretch.
