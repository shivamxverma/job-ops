# Cluster: data integration / ELT (connector platforms)

Companies: Hevo Data (2026-10-21). Same shape: Fivetran, Airbyte, Stitch, Rivery, Matillion,
Portable, and any startup whose product is "move data from SaaS X into warehouse Y".

## 1. The shape
- **Connectors** per source (hundreds of them): auth, list the objects, page through each, track
  where the last run stopped (an offset / cursor / `updated_at` watermark), respect the source's
  rate limit.
- **A durable buffer** between reading and writing (Kafka is the usual one) so a slow or failing
  warehouse never blocks ingestion, and ingestion can be replayed.
- **Consumers / loaders**: validate, map types, evolve the destination schema, stage files (S3/GCS),
  bulk-load into the warehouse in batches.
- **A scheduler + worker pool** that runs each connector job at a frequency, per object.
- **A failed-records path** (dead-letter queue) with a retention window and a replay button.

## 2. The hard problems
1. **Incremental sync without a reliable change signal.** Many APIs expose no `updated_since`
   filter or sort, so "what changed" is unknowable and the connector must refetch everything or
   trust a weak watermark. Symptom: full refetches, rising API usage, duplicates downstream.
2. **Rate limits are per source account, not per job.** Several pipelines (or several objects of
   one pipeline) share one quota, so independent per-task backoff starves or collides. Symptom:
   historical loads that stall for hours, 429 storms after a deploy.
3. **Pagination that lies.** Offset pagination over a mutating list skips or duplicates rows;
   cursors expire; page sizes change. Symptom: count mismatches between source and destination.
4. **Idempotent loads.** At-least-once delivery from the buffer plus retries means the same record
   lands twice unless there's a stable primary key and an upsert/merge. Symptom: duplicates when
   the source has no natural key.
5. **Schema drift.** A SaaS vendor adds, renames or retypes a field without notice. Symptom:
   failed records on type mismatch, columns appearing as strings.
6. **Connector maintenance at scale.** Hundreds of third-party APIs change under you; each needs
   tests that don't depend on the live vendor. Symptom: silent breakage noticed by a customer.
7. **Historical vs incremental ordering.** A backfill and a live sync of the same object must not
   overwrite newer data with older data.

## 3. The standard trade-offs
- **Full refetch vs watermark** when the API's change signal is weak: correctness vs API cost.
- **Central quota manager vs per-task backoff**: one more stateful service vs thundering herds.
- **Kafka between read and write vs direct load**: replay and isolation vs latency and ops cost.
- **Generated connectors (spec / AI-built) vs hand-written**: coverage speed vs edge cases
  (auth quirks, pagination bugs) that only show up against the real API.
- **Recorded-response tests vs live sandbox tests** for connectors: determinism vs drift.

## 4. Where Shivam's real work touches this
- **Third-party API adapter layer (poiro.com) — closest seam.** Pixabay, Unsplash and Pinterest
  behind one search/download contract; ~2 KB vendor cursors replaced with 32-char cursor tokens;
  org-scoped Redis caching; fail-closed spend caps of 500 calls/org/day and 5,000/day globally;
  2 Pinterest vendors evaluated at 30 concurrent requests. That is problems 2 and 3 at small
  scale (3 sources, not hundreds). Say "three providers", never "connectors at scale".
- **Multi-source ingestion with dedup (Hireflow).** LinkedIn, Wellfound, YC WaaS and Telegram
  ingested on BullMQ queues so a block in one stage can't stall the others; cross-source dedup on
  SHA-256 fingerprints of normalised title + company + description. Problems 4 and 2, personal
  project, adjacent.
- **Keyset pagination (poiro.com asset service).** Problem 3 from the API-provider side, not the
  consumer side. Adjacent.
- **Replay-style test harness (DeepDoc).** 36-case eval harness that replays parameter sweeps and
  separates failure stages. Adjacent to problem 6 (recorded-response connector tests), different
  domain (RAG, not APIs).
- **Not touched:** Kafka, warehouse loading (Snowflake/BigQuery), CDC / log replication, schema
  evolution in a warehouse. Never imply these.
