STUDY PLAN: 4 weeks, from the resume
Goal: defend every resume line 10 minutes deep, and pass DSA, CS fundamentals, backend deep dive, system design and behavioral rounds.
Format: [] Item [topics it covers]. Mark done as [x].


WEEK 1: Databases, Node/TS, klimb (billing ledger)

[] Explain the credit ledger end to end: tables, why append-only, how the balance is computed [Postgres: schema design, append-only ledger, double-entry basics, stored balance vs SUM over entries]
[] Stop double spend when two requests debit the same customer at the same time [Postgres: transactions, isolation levels (Read Committed, Repeatable Read, Serializable), SELECT FOR UPDATE, optimistic locking with a version column]
[] Make metering idempotent so a retried request never charges twice [Backend: idempotency keys, unique constraints, ON CONFLICT DO NOTHING, at-least-once delivery]
[] SQL core plus 25 practice problems [SQL: JOIN types, GROUP BY/HAVING, subqueries, CTEs, window functions (ROW_NUMBER, RANK, SUM OVER), NULL handling]
[] Find why a query is slow and fix it (your klimb query optimization work) [Postgres: B-tree index, composite index column order, partial index, covering index, seq scan vs index scan, EXPLAIN ANALYZE]
[] Answer "what happens on an UPDATE in Postgres" [Postgres: MVCC, WAL, VACUUM, dead tuples, connection pooling with PgBouncer]
[] Node event loop: explain why queue workers keep the API responsive [Node.js: event loop phases, microtasks vs macrotasks, libuv thread pool, blocking the loop, worker_threads]
[] Async JavaScript [JavaScript: promises, async/await error handling, Promise.all vs allSettled vs race, unhandled rejections, closures, this binding]
[] TypeScript interview set [TypeScript: generics, union and intersection types, type narrowing, utility types (Partial, Pick, Omit, Record), unknown vs any, interface vs type]
[] Express API structure at klimb [Express: middleware chain, error middleware, JWT vs sessions, request validation with zod, rate limiting; Prisma: schema, migrations, transactions]
[] Redis at klimb: what you cached and why [Redis: data types, TTL, cache-aside, cache invalidation, eviction policies (LRU, LFU)]
[] DSA: 15 problems [DSA: arrays, hashing, two pointers, sliding window, prefix sums]


WEEK 2: Python, FastAPI, MongoDB, Celery, poiro (DAG engine, asset service, adapters)

[] DAG workflow engine: how a workflow is stored, validated and run [DSA: DAG, topological sort (Kahn's algorithm), cycle detection; typed node outputs, schema validation between steps]
[] Run independent nodes in parallel and handle a failed node [Celery: chain, group, chord, retries, partial failure, resuming from the failed step]
[] Groups as reusable sub-workflows that run as one unit [Design: composition, nested DAG vs flatten at run time, versioning a group]
[] Celery and queue basics [Celery: broker vs result backend, Redis as broker, acks_late, visibility timeout, idempotent tasks, at-least-once delivery]
[] FastAPI internals [FastAPI: ASGI, async def vs def (threadpool), dependency injection, Pydantic validation, BackgroundTasks vs Celery]
[] Python fundamentals [Python: GIL, threading vs multiprocessing vs asyncio, generators, decorators, context managers, mutable default args]
[] Digital asset service: data model, APIs, migrating 3 apps into one service [MongoDB: embedding vs referencing; Migration: backfill, dual write, verification, rollback plan]
[] MongoDB basics [MongoDB: compound indexes, ESR rule, aggregation pipeline, multi-document transactions, write concern, read concern]
[] Duplicate blocking with pHash and dHash [Algorithms: perceptual hashing, Hamming distance, choosing a threshold, fast lookup of near-duplicate hashes (BK-tree, bucket by prefix)]
[] Folders and prompt Elements [DB: tree modelling (parent reference, materialized path), move and rename, permissions per org]
[] Uploads to Cloudflare R2 [Object storage: S3 API, presigned URLs, multipart upload, content-type handling, CDN caching]
[] Provider adapter layer over Pixabay, Unsplash and Pinterest [Design patterns: adapter, strategy; OOP: interfaces, abstract classes; normalizing errors and handling third-party rate limits]
[] Per-org Redis caching and spend caps [Redis: key namespacing per org, TTL, atomic INCR counters, rate limiting (fixed window, sliding window, token bucket), atomicity with Lua or MULTI]
[] Turborepo monorepo [Tooling: workspaces, shared packages, build caching, task pipelines]
[] DSA: 15 problems [DSA: stack, monotonic stack, binary search, linked list, binary trees]


WEEK 3: OS, networking, containers, CodeSM and Yuvro

[] Sandboxed code execution: every limit and why [Docker: --network none, --read-only, --memory, --cpus, --pids-limit, non-root user, seccomp, wall-clock timeout]
[] What a container is under the hood [OS/Linux: namespaces (pid, net, mnt, user), cgroups, chroot, container vs VM]
[] Fork bomb, infinite loop, out of memory: what the OS does [OS: process vs thread, fork/exec, signals (SIGTERM, SIGKILL), OOM killer, scheduling]
[] OS fundamentals round [OS: virtual memory, paging, page faults, deadlock (4 conditions), mutex vs semaphore, context switch, system calls]
[] Async grading queue on BullMQ [BullMQ: jobs, workers, concurrency, retries and backoff, stalled jobs; why one container per submission, stopping at the first failed test]
[] Content-addressed storage in Yuvro [Hashing: SHA-256, collisions, dedup; GC: reference counting vs mark and sweep; race between an upload and the GC]
[] Per-project containers on Kubernetes [Kubernetes: pods, deployments, services, namespaces, resource requests and limits, PVCs, scale to zero, cold start]
[] Live WebSocket terminal, editor and preview [Networking: WebSocket handshake, WebSocket vs polling vs SSE, PTY; scaling WebSockets (sticky sessions, pub/sub)]
[] Networking fundamentals round [Networking: what happens when you type a URL, DNS, TCP vs UDP, 3-way handshake, HTTP/1.1 vs HTTP/2, TLS, L4 vs L7 load balancers]
[] Security for running user code and public APIs [Security: isolation, least privilege, authn vs authz, SQL injection, XSS, CSRF, secrets management]
[] AWS you list [AWS: EC2, S3 (storage classes, presigned URLs), IAM roles and policies, VPC basics]
[] DSA: 15 problems [DSA: graphs BFS/DFS, heaps, intervals, union-find]


WEEK 4: AI/RAG, system design, behavioral, mocks

[] DeepDoc RAG pipeline end to end [RAG: section-aware vs fixed-size chunking, embeddings, Pinecone namespaces and metadata filters, query rewriting with chat history]
[] Retrieval ranking and tuning: what the 100+ configs were and how you measured them [RAG: similarity scores, top-k, score threshold, dedup, token budget packing, reranking; Eval: recall@k, MRR]
[] The empty-results bug as a story: symptom, root cause, fix [Behavioral: STAR, debugging process]
[] Vector search basics [Embeddings: cosine vs dot product, ANN indexes (HNSW), dimensions, hybrid search (BM25 plus vector)]
[] LLM evaluation [AI: eval sets, LLM as judge, hallucination checks, prompt versioning]
[] System design concepts [Design: horizontal scaling, caching layers, DB replication, sharding, CAP, consistency models, queues, rate limiting, idempotency]
[] Design: usage-based billing system at scale [Design: ledger, metering pipeline, exactly-once charging, invoicing]
[] Design: online code judge at scale [Design: submission queue, sandbox pool, autoscaling workers, result storage]
[] Design: AI workflow builder / job orchestrator [Design: DAG scheduler, retries, state store, cost control per org]
[] Design: URL shortener and rate limiter [Design: ID generation, caching, token bucket, distributed counters]
[] Behavioral: 6 STAR stories written and said out loud [Behavioral: hardest bug, the 3-app migration, a conflict, ownership, a failure, why this company]
[] 2-minute intro, plus 1 minute out loud on each resume bullet [Communication: what, how, impact, tradeoff]
[] 3 full mock interviews [DSA round, resume deep dive round, system design round]
[] DSA: 15 problems [DSA: dynamic programming, plus revision of your weakest topic]
[] Final resume check: cut or reword any line you can't defend 10 minutes deep [Resume]
