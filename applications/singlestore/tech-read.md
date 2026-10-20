# SingleStore — tech read (2026-10-06)

Cluster: `profile/domains/distributed-sql-engine.md` (written today, first company in it).
Sources: `stack-probe.json`, `github-recon.md`, docs (`code-generation.md`,
`how-the-columnstore-works.md`, release notes Aug 2026), SIGMOD'22 paper abstract, Universal Storage
blog parts 1-3, the Envoy/Wasm Private Link post. The engine is closed source, so nothing here is
read from engine code. Status-page incident JSON did not return (not Statuspage's public API shape
at `status.singlestore.com`); not read.

## 1. The system, as far as it is visible
- [fact] **Queries are compiled per shape: SQL → MPL → MBC bytecode → LLVM → machine code**, literals
  extracted and replaced by `@`, so one plan serves every value. Docs, "Codegen Architecture".
- [fact] **Default `interpreter_mode` is `interpret_first`** (since MemSQL 6.8): the first run is
  interpreted while compilation runs in parallel, later runs use the compiled plan. Docs.
- [fact] **Two-layer plancache per node** (aggregator and each leaf has its own): in-memory, expiring
  after `plan_expiration_minutes` (default 720), then on-disk under `plancachedir`, reloaded on next
  use. `ANALYZE TABLE` invalidates plans for tables that changed a lot. Docs.
- [fact] **Columnstore = sorted row segments of ~hundreds of thousands of rows**, per-segment min/max
  metadata for segment elimination, a per-segment **delete bitmask**, and an **in-memory segment**
  for fresh writes that is flushed to disk blobs. Docs.
- [fact] **Unique keys on columnstore exist "via an extension of our existing hash indexes"** (7.1,
  single column; multi-column upsert from 7.5). Universal Storage parts 2 and 3.
- [inference] **Columnstore indexes are per segment and merged later.** The Aug 2026 release added a
  "full-text index merger which combines per-segment full-text indexes to create a cross-segment
  full-text index". Whether hash indexes follow the same per-segment-plus-merge shape is not
  published.
- [fact] **Their cloud API sits behind Envoy** (`x-envoy-upstream-service-time` on
  `api.singlestore.com`, stack-probe), and the Private Link tier is Envoy plus a C++ Wasm filter.
  Site/docs are on CloudFront.

## 2. What they are worried about right now
Making one engine cover search and AI workloads without a second system: vector index, full-text
with cross-segment merging, Iceberg external tables, `RETURNING`, Kafka/Kinesis ingest. Plus
observability of the engine itself (`MV_MEMORY_USAGE`, time-based invalidation of the cross-query
statistics cache). The India new-grad req lists exactly those areas: vector index, fault tolerance,
SIMD/LLVM codegen, optimiser search and costing.

## 3. The problems this shape forces
- **One plan per query shape.** Parameterising literals is what makes compile-once pay off, and it
  is also why a plan costed for a rare value runs for a common one. Acute here because compilation
  is expensive enough that they cache plans for 12 hours and persist them to disk, and the docs
  already carry "Overriding Parameterization of Queries".
- **Uniqueness across a write buffer and many immutable segments.** An insert has to prove the key
  is absent from the in-memory segment and every on-disk segment, under concurrency, without a scan.
  Acute because universal storage promises OLTP behaviour (upserts, unique keys) on columnar data.
- **Stale statistics vs cached plans.** The cache only helps if plans stay good as data shifts;
  hence `ANALYZE` invalidation and the new time-based stats-cache invalidation.

## 4. The seam Shivam has already touched
**The uniqueness guarantee, from the user side.** At poiro.com the asset dedup relies on a database
uniqueness constraint so two concurrent uploads can't race past an application-level check
(facts.yaml, poiro bullet 2; stories.md "never trust the client's hash"). He has *relied on* that
guarantee; he has not built one. Adjacent, not the same, and it should be said that way.
Second-order: CodeSM reuses containers instead of paying a cold start per submission, the same
"pay the expensive setup once, reuse it" trade the plancache makes. Analogy only.

## 5. Two questions only an internals reader would ask
1. **"For unique keys on a columnstore, is each row segment carrying its own hash index, so an insert
   probes every segment plus the in-memory one, or is there a cross-segment index like the new
   full-text merger builds?"**
   - Concept to know first (one): *a hash index per immutable segment*, so lookups cost one probe per
     segment until something merges them.
   - If they say per segment: ask "what keeps the probe count bounded as segments pile up, is it the
     background merger?". If they say a global index: ask "how is it kept consistent with segment
     merges and deletes, is it rebuilt or patched?".
2. **"Since plans are compiled once per query shape and cached for hours, how do you handle a
   predicate whose selectivity swings a lot between literals? Does the optimiser ever keep more than
   one plan per shape, or is that what the parameterization overrides are for?"**
   - Concept to know first (one): *parameter-sensitive plans* (a.k.a. parameter sniffing in SQL
     Server): a cached plan chosen for one value is bad for another.
   - If they say "one plan, users override": ask "do you see that in support tickets often?". If they
     say "multiple plans / re-optimise on skew": ask "what triggers it, the stats or runtime feedback?".

Both survive the follow-up test: each answer is two sentences from an engine engineer and each branch
has a sensible next line he can ask without reading the source.

## 6. Do not say
- Do not say "you use a global hash index" or "per-segment hash index" as fact. Not published.
- Do not say "plans are re-optimised on skew" or "you have the parameter sniffing problem". Ask.
- Do not quote the 12h default as their production setting on Helios; it is the documented default.
- Do not name a CEO (sources disagree) or cite headcount 543 / ARR 34% as current.
- Do not call CodeSM "a compiler" or "engine work". It runs compilers in sandboxes.
- Do not claim professional C or C++. It is in his skills list and in CodeSM's supported runtimes only.
- Do not say the dedup work "implemented a unique index". It used one.
