# SingleStore — dossier (2026-10-06)

Role: **Software Engineer, India** (university-graduate req), Greenhouse
https://job-boards.greenhouse.io/singlestore/jobs/8212128, first published 2026-09-17.
A twin req with word-for-word identical requirements, **Software Engineer | Database Engine | India**
(https://job-boards.greenhouse.io/singlestore/jobs/8000966, published 2026-06-11), is also open.
Found via the HN Oct 2026 post by Pancham Khaitan (item 49962002), which advertised a *different*
req: Software Engineer, AI Platforms (jobs/7573638, **4+ years**, mentoring juniors, so not this seat).

Requirements of 8212128, read in full from the Greenhouse API (no canary or hidden instruction in
the body): B.S. CS/EE/CE; "deep understanding of C.S. fundamentals, in particular operating
systems, concurrency, multithreading, and server architectures"; "strong programming skills with
C++ or C"; "firm grasp of algorithms and data structures". Work described: LLM and vector index,
cluster fault tolerance, SQL performance "with techniques like SIMD and LLVM codeGen", "search and
costing modules for the query optimiser". No years bar. Location just "India"; offices in
Bangalore (named in the JD boilerplate), Hyderabad and Pune per Instahyre/Wellfound listings
([Instahyre](https://www.instahyre.com/job-314749-software-engineer-at-singlestore-bangalore-hyderabad-pune/)).
Remote is **not** stated, so assume office-based in India (fits `relocation` in facts.yaml).
Form: name, email, phone, resume, **optional cover letter**, LinkedIn, website. Nothing else.
Pay: a third-party listing for an India engine SWE shows ₹10L-16L
([dreamworkhq](https://www.dreamworkhq.com/job/13993ce2-4600-4136-bac8-66f67383fb88)), GUESS that it
is this req; it overlaps his 10-18 LPA.

## Product in one paragraph (as a user, if possible)
SingleStore (formerly MemSQL) is a distributed SQL database that runs transactions and analytics
on one engine: MySQL wire protocol, aggregator nodes that plan and route, leaf nodes that hold
partitions, and "universal storage", a columnstore with an in-memory rowstore segment for fresh
writes plus hash indexes so point lookups and unique keys work on columnar data
([SIGMOD'22 paper](https://dl.acm.org/doi/10.1145/3514221.3526055),
[docs: how the columnstore works](https://docs.singlestore.com/cloud/create-a-database/columnstore/how-the-columnstore-works/)).
Queries are compiled: SQL → their plan language MPL → bytecode MBC → LLVM → machine code, cached
per query *shape* in a plancache ([codegen docs](https://docs.singlestore.com/cloud/query-data/advanced-query-topics/code-generation/)).
The cloud product is **Helios**; the AI push is vector search, full-text, an MCP server and
"Aura" GPU/CPU compute next to data. A free shared tier exists. Not tried hands-on in this pass:
worth 10 minutes before an interview (run one query twice and look at `PROFILE` compile time).

## People (founder/HM + contact paths + common ground)
- **Pancham Khaitan**, Software Engineer, posted the HN thread entry and published
  `pkhaitan@singlestore.com` ([blog author page](https://www.singlestore.com/blog/author/pancham-khaitan/),
  [panchamkhaitan.com](https://panchamkhaitan.com/about)). Previously data products at Peak AI. Wrote the
  "build an app prototype with an AI agent using MCP" post. **Different team** (AI Platform), not the
  engine new-grad seat. Useful as a router, not the hiring manager.
- **Tanuj Mittal and Aditya Poptani** wrote the Envoy + Wasm Private Link post (2026-04-20): a
  shared L4 routing tier, C++ Wasm filter, rewritten from Go after "severe memory leaks" under
  connection churn ([post](https://www.singlestore.com/blog/how-we-scaled-private-link-routing-across-aws-azure-and-gcp-using-envoy-and-wasm/)).
  Cloud/infra side, not engine.
- **Engine authorship (paper):** Adam Prout, Szu-Po Wang, Joseph Victor, Zhou Sun, Yongzhu Li, Jack
  Chen, Evan Bergeron, Eric N. Hanson, et al. US-based as far as visible; GUESS. Eric Hanson writes the
  Universal Storage blog series.
- **India entity:** SingleStore India Pvt Ltd (Hyderabad-registered), 94 employees as of 2024-03-31
  ([Zauba](https://www.zaubacorp.com/SINGLESTORE-INDIA-PRIVATE-LIMITED-U72100TS2020FTC184305)). India
  engine lead not identified.
- **IIIT Nagpur alumni at SingleStore:** none found by web search. The real check is the LinkedIn
  alumni tab (search "SingleStore"), which is `/network-scout` lens 3 and was not run here.
- GitHub `singlestore-labs` top committers (s2-ktran, akwong-singlestore, tclendaniel-singlestore,
  kesmit13) work on SDKs/notebooks, not the engine. See `github-recon.md`.
- **Common ground:** competitive programming (the JD's "firm grasp of algorithms"), CodeSM running
  untrusted C/C++, and his poiro.com dedup prototype (benchmarked 5 hashes; server re-verification plus a DB uniqueness index; not shipped, the team chose operation-key idempotency).

## Momentum (stage, raise, hiring signals)
- Growth buyout led by **Vector Capital**, closed 2025-09-10, reported ~$500M; prior funding $558M
  over 14 rounds ([SingleStore release](https://www.singlestore.com/media-hub/releases/singlestore-announces-growth-buyout-led-by-vector-capital/),
  [TechTarget](https://www.techtarget.com/searchdatamanagement/news/366630612/SingleStore-agrees-to-growth-buyout-by-private-equity-firm)).
  ARR growth of 34% was cited at the deal. Current CEO: sources disagree (Raj Verma vs Eric
  Frenkiel), GUESS, do not name one.
- ~543 employees (2026-06-30, third-party). 43 open Greenhouse reqs today, including a fresh batch of
  new-grad/intern reqs posted 2026-09-15 to 09-17 (US "New Grad 2027" engine and Helios reqs, India
  SWE 8212128, India Cloud Platform Engineer). A campus-cycle hiring push, so the India req is live.
- Last month's release notes (Aug 2026): Kinesis pipelines, mTLS to Kafka, `UPDATE/DELETE ...
  RETURNING`, a full-text index merger that "combines per-segment full-text indexes to create a
  cross-segment full-text index", time-based invalidation of the cross-query statistics cache, a new
  `MV_MEMORY_USAGE` view ([release notes](https://docs.singlestore.com/cloud/release-notes/)).

## Their vocabulary (3–5 exact phrases, with source links)
- "query shape" (codegen docs: plans are compiled and reused per shape, literals replaced by `@`)
- "universal storage" (their name for the unified rowstore/columnstore table type, blog series + paper)
- "segment elimination" (columnstore docs: skipping row segments by min/max metadata)
- "interpret_first" (default `interpreter_mode`: interpret while compiling in the background)
- "one copy, one engine, no seams" (blog title, their positioning line)

## Architecture, as far as it is visible
Aggregator/leaf cluster, MySQL protocol, compiled queries via MPL → MBC → LLVM with a two-layer
plancache (in-memory, 12h `plan_expiration_minutes` default, then on-disk), universal storage
(columnstore + in-memory rowstore segment + per-segment hash indexes + delete bitmasks), Envoy in
front of their cloud API. Detail and evidence: `tech-read.md`.

## What I'd do in week one (2–3 specific initiatives)
New-grad engine seat, so these are deliberately small and honest.
1. **Reproduce a plan-reuse regression in a test.** One plan per query shape means a literal with very
   different selectivity reuses a plan costed for another value. I'd write the minimal repro case
   (skewed column, two literals, `PROFILE` both) as a test the optimiser team can keep, before
   touching any costing code.
2. **Measure before optimising.** Start every perf ticket from `PROFILE` / `SHOW PROFILE JSON`
   `compile_time_stats` and the new `MV_MEMORY_USAGE` view, the way he started the poiro.com tree fix
   from the slow query, not from a guess.
3. Pick up whatever bug-fix queue new grads get. Saying more than that about an engine he has never
   seen the source of is an overclaim.

## Which Shivam framing wins here (backend-infra / full-stack / AI-workflow — pick from facts.yaml)
**backend_framing, pushed toward systems fundamentals.** Lead with CodeSM (untrusted C/C++ under
CPU/memory/process limits, container reuse instead of per-run cold start, bounded per-job memory),
the poiro.com $graphLookup fix (one query instead of one per nesting level), and the competitive-programming line (LeetCode top 5%, 800+ problems).
AI framing is wrong for this req; it belongs to the 4+ year AI Platform seat.
**Honest gap:** C++ is in his skills list and CodeSM runs C++, but there is no professional C/C++ and
no OS/engine-level project. Say so if asked; don't dress Chatterly or CodeSM up as engine work.

## Draft answers
The form has no required free-text field. These are for the optional cover-letter box or a short
note. No em dashes; edit in his own words.

- **Why SingleStore?**
  > Most databases make you pick: a row store for writes or a column store for scans. You put both
  > behind one table and then had to make unique keys and point lookups work on columnar data. That's
  > the part I want to work on. At poiro.com I prototyped duplicate blocking on a database uniqueness
  > index so two concurrent uploads of the same file couldn't both land (the team went with
  > idempotency keys instead), and I never had to think about how that guarantee gets built when the
  > rows are spread across segments. I'd like to.

- **Why this role?**
  > It's C/C++ systems work with an algorithms bar, and that's where I'm strongest outside my day job:
  > LeetCode top 5% with 800+ problems, and CodeSM, a code execution engine that runs untrusted C, C++
  > and four other languages in Docker under CPU, memory, process and timeout limits. I graduated in
  > May 2026 and I've been shipping backend infra since, but I want the layer underneath it.

- **Anything else likely on the form:** start date "Immediately. I have no notice period."; location
  India (open to any India office); salary if asked "10-18 LPA" (facts.yaml).
