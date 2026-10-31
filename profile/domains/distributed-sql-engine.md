# Distributed SQL engine (HTAP / analytical databases)

First written 2026-10-06 for SingleStore. Covers companies whose product *is* the database engine
(SingleStore, ParadeDB, QuestDB-style, ClickHouse-style), not companies that merely use one.

## 1. The shape
- A coordinator/aggregator tier that parses, plans and routes; worker/leaf nodes holding partitions.
- A storage format per workload: row-oriented for point writes, columnar segments for scans, often
  both with a write buffer in front of immutable columnar segments.
- An optimiser (search + costing) fed by table statistics, and an executor that is either
  vectorised-interpreted or compiled (LLVM or similar), usually with a plan cache.
- Replication/log for durability, increasingly with object storage (S3) as the bottom tier.
- A wire protocol borrowed from Postgres or MySQL so existing clients work.

## 2. The hard problems
1. **Plan reuse vs parameter sensitivity.** Caching a plan per query shape amortises
   planning/compilation, but one plan is chosen for one value's selectivity. Symptom: the same query
   is fast for one literal and pathologically slow for another.
2. **Stale statistics.** Costing is only as good as the stats; data drifts faster than stats are
   refreshed. Symptom: a plan regression after a bulk load with no query change.
3. **Write buffer vs immutable segments.** Fresh writes land in a mutable buffer and get flushed to
   immutable segments; deletes become bitmasks; merges rewrite segments. Symptom: scan cost and
   point-lookup cost rise with segment count until the merger catches up.
4. **Constraints on columnar data.** Unique keys and point lookups need an index that spans the buffer
   and every segment. Symptom: insert latency grows with segment count; upserts are slow or
   restricted to single-column keys.
5. **Distributed joins and data movement.** Shard-key choice decides whether a join is local or needs
   a broadcast/reshuffle. Symptom: one query moves gigabytes between leaves.
6. **Compile latency.** A compiled executor is fast on the second run and slow on the first. Symptom:
   tail latency dominated by first-seen query shapes; mitigated by interpret-while-compiling.
7. **Memory accounting.** In-memory buffers, plan caches and hash tables compete for RAM on each node.
   Symptom: out-of-memory errors with no single obvious owner.

## 3. The standard trade-offs
- Interpret (vectorised) vs compile (codegen): startup latency vs steady-state speed.
- One plan per shape vs per-parameter plans: cache size and compile cost vs plan quality.
- Per-segment indexes vs a global index: cheap writes and simple merges vs bounded lookups.
- Merge eagerly vs lazily: write amplification vs read amplification.
- Shared-nothing local disk vs object storage bottom tier: latency vs elasticity and cost.

## 4. Where Shivam's real work touches this
- **Limits under concurrency (user side):** poiro.com Elements check their 8-image cap under an
  org lock so two concurrent adds can't both slip past it (facts.yaml). Adjacent: he used the
  lock, didn't build the database guarantee.
- **Query shape and cost (user side):** klimb.io query rewrites cut p95 (no figure recorded,
  never quote one).
- **Pay setup once, reuse:** CodeSM reuses containers instead of per-submission cold starts, and
  bounds per-job memory by fetching test cases one at a time. Analogy to plan caching and memory
  accounting, not the same thing.
- **Algorithms:** LeetCode top 5%, 800+ problems. Relevant to new-grad engine screens, which test DSA.
- **Distance, said plainly:** no engine source read or written, no professional C/C++.
