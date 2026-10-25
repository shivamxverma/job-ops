# Offer plan: 25 LPA by 22 Nov 2026

Mark with `[x]`. Every topic: name it, go one level down, then my own example with a number.

## Schedule
**Weekdays:** wake 7:45 · apply 8:00-8:45 · office 10-7 (leave a 2-line note on where you
stopped) · break 7-8 (no screens) · DSA 8:00-8:45 (mixed problem types) ·
9:00-11:45 one theme only:
- Mon / Tue / Thu = **build night** (20 min concept reading, then DeepDoc)
- Wed / Fri = **study night** (1 system design + Poiro depth)

End of every block: 1-minute ready-to-resume note (where I stopped, next step, open question).
11:45 shutdown: tick the list. Lights out 12:30.

**Weekends:** apply 10-11 · DSA 11-12 · build 12-3 (Sun to 2:30) · lunch ·
Sat: system design + Poiro depth + weekly review · Sun: mock with Claude + fix answers + plan ·
6-9 break · office 9 PM-1 AM.

**Rules:** bad day = 1 DSA problem + 1 small build task, then sleep. Cut system design before
sleep. A booked interview takes that evening's build slot. Slipped two weeks running = cut it.

## Every day
DSA 1 hour (mostly medium: graphs, DP, heaps) + 5-10 applications.

- [ ] Sun 25 Oct (weekend)
- [ ] Mon 26 Oct (build night)
- [ ] Tue 27 Oct (build night)
- [ ] Wed 28 Oct (study night)
- [ ] Thu 29 Oct (build night)
- [ ] Fri 30 Oct (study night)
- [ ] Sat 31 Oct (weekend)
- [ ] Sun 01 Nov (weekend)
- [ ] Mon 02 Nov (build night)
- [ ] Tue 03 Nov (build night)
- [ ] Wed 04 Nov (study night)
- [ ] Thu 05 Nov (build night)
- [ ] Fri 06 Nov (study night)
- [ ] Sat 07 Nov (weekend)
- [ ] Sun 08 Nov (weekend)
- [ ] Mon 09 Nov (build night)
- [ ] Tue 10 Nov (build night)
- [ ] Wed 11 Nov (study night)
- [ ] Thu 12 Nov (build night)
- [ ] Fri 13 Nov (study night)
- [ ] Sat 14 Nov (weekend)
- [ ] Sun 15 Nov (weekend)
- [ ] Mon 16 Nov (build night)
- [ ] Tue 17 Nov (build night)
- [ ] Wed 18 Nov (study night)
- [ ] Thu 19 Nov (build night)
- [ ] Fri 20 Nov (study night)
- [ ] Sat 21 Nov (weekend)
- [ ] Sun 22 Nov (weekend)

---

## Week 1 (Sun 25 Oct - Sun 1 Nov): Poiro depth + ingestion queue

### Week 1 night by night
- [ ] Sun 25: Poiro one-pager first draft (12-3) · learn the system design framework (3:30-4:30) · CodeSM half page
- [ ] Mon 26 (build): read DDIA ch. 11 · design the jobs + documents tables
- [ ] Tue 27 (build): Postgres metadata · upload enqueues a job · worker extracts, chunks, embeds
- [ ] Wed 28 (study): design CodeSM · Poiro: asset service + $graphLookup
- [ ] Thu 29 (build): retries + backoff + dead-letter queue · idempotent re-upload
- [ ] Fri 30 (study): design a rate limiter · Poiro: adapters + fail-closed caps + Flowboard
- [ ] Sat 31: job status over SSE · design DeepDoc ingestion · klimb ledger half page · 5-min Poiro run-through · review
- [ ] Sun 1: finish + notes · mock (Poiro, CodeSM, queues) · fix weak answers · plan week 2

### Poiro one-pager
- [ ] Write the one-pager (problem, my part, why, what I rejected, how it fails, number)
- [ ] Asset service: org-scoped models, keyset pagination, direct R2 uploads (say team-built)
- [ ] Folder tree: per-level queries to one `$graphLookup`, edits 3 round-trips to 1
- [ ] Provider adapters: one contract for Pixabay/Unsplash/Pinterest, Redis cache, 32-char cursors
- [ ] Fail-closed caps: 500/org/day, 5,000/day global, and why fail-closed
- [ ] Flowboard: typed ports, execution order, groups as sub-workflows, PR #697
- [ ] Ruff 1,041 findings + 70 deps + 84 dead files
- [ ] Open branches (say "on a branch"): Beanie 2 migration, aiobotocore session
- [ ] Explain it out loud in 5 min with no notes, while being interrupted with "why?"
- [ ] Half page: CodeSM (queue, Docker limits, cgroups, one container per submission)
- [ ] Half page: klimb credit ledger (how it stays correct under concurrent requests)
- [ ] 60-second intro written and rehearsed

### DeepDoc: ingestion queue + Postgres
- [ ] Read DDIA ch. 11 (queues), at-least-once delivery, idempotency
- [ ] Move document and chunk metadata into Postgres (+ pgvector or keep Pinecone, decide why)
- [ ] Upload enqueues a job, worker extracts, chunks, embeds
- [ ] Retries with backoff + dead-letter queue
- [ ] Idempotent jobs: re-uploading the same file doesn't duplicate chunks
- [ ] Job status streamed to the UI (SSE)
- [ ] Notes: what, why, rejected, how it breaks, number

### System design
- [ ] Learn the framework: requirements, estimates, API, data model, diagram, bottleneck, failures
- [ ] Design 1: CodeSM code execution engine (45 min, out loud)
- [ ] Design 2: DeepDoc ingestion pipeline
- [ ] Design 3: Rate limiter

### Sunday mock
- [ ] Mock: Poiro + CodeSM + queues, scored

---

## Week 2 (Mon 2 - Sun 8 Nov): tool calling + chat-to-database

Build nights: Mon, Tue, Thu + weekend. Study nights: Wed (URL shortener), Fri (chat system), Sat (RAG support bot).

### DeepDoc
- [ ] Read: the agent loop, function calling, JSON schemas
- [ ] Tool calling: search docs, cite source, (one more tool)
- [ ] Step cap + token/cost budget per request + timeout
- [ ] Read DDIA ch. 7 (transactions, isolation levels)
- [ ] Chat-to-database (text-to-SQL) working on a sample DB
- [ ] Guardrail: read-only DB role
- [ ] Guardrail: table allowlist
- [ ] Guardrail: statement timeout + row limit
- [ ] Guardrail: parse and validate SQL before it runs
- [ ] Guardrail: any write needs human approval
- [ ] Prompt-injection test cases added to the eval set
- [ ] Notes for each feature

### System design
- [ ] Design 4: URL shortener
- [ ] Design 5: Chat system
- [ ] Design 6: RAG support bot

### Sunday mock
- [ ] Mock: databases + agents + text-to-SQL guardrails, scored

---

## Week 3 (Mon 9 - Sun 15 Nov): MCP + semantic cache + eval in CI

Build nights: Mon, Tue, Thu + weekend. Study nights: Wed (notifications), Fri (agent with human approval), Sat (redo weakest).

### DeepDoc
- [ ] Read: what MCP is and why it exists
- [ ] MCP server exposing DeepDoc search (test from Claude or Cursor)
- [ ] Read: caching patterns (cache-aside, TTL, invalidation, stampede)
- [ ] Semantic cache with a similarity threshold
- [ ] Pick the threshold from eval data (false hits vs hit rate), write down why
- [ ] Hybrid retrieval (BM25 + vector) + reranking, compare recall@k
- [ ] Eval harness runs in CI and fails on regression
- [ ] Rate limiting per user (Redis)
- [ ] Notes for each feature

### System design
- [ ] Design 7: Notification system
- [ ] Design 8: Agent that acts only with human approval
- [ ] Design 9: Redo the weakest one from weeks 1-2

### Sunday mock
- [ ] Mock: full AI engineer loop (LLM basics, RAG, MCP, caching), scored

---

## Week 4 (Mon 16 - Sun 22 Nov): numbers, deploy, resume

Build nights: Mon, Tue, Thu + weekend. Study nights: Wed (DeepDoc end to end), Fri (Yuvro / file storage), Sat (random, timed).

### DeepDoc
- [ ] Tracing + per-request cost and latency logging
- [ ] Load test (k6): p50 / p95 / throughput
- [ ] Record numbers: p95, cost/query, cache hit rate, eval score before/after
- [ ] Docker + deploy + graceful shutdown (SIGTERM)
- [ ] README with architecture diagram + numbers
- [ ] 2-min demo video
- [ ] Add numbers to facts.yaml, update resume

### System design
- [ ] Design 10: Full DeepDoc production design (my own system, end to end)
- [ ] Design 11: File storage / Yuvro
- [ ] Design 12: One random problem, timed

### Final mocks
- [ ] Mock: DSA round
- [ ] Mock: backend depth round
- [ ] Mock: system design round
- [ ] Mock: founder round (intro, my part, comp as a range)

---

## Offer tracker
- [ ] 1st interview booked
- [ ] 3 interviews in progress
- [ ] Final round reached
- [ ] Offer >= 25 LPA
