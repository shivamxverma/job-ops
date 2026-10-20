# Cluster — LLM / agent systems in production

Companies whose product puts a model in the path of real user work: extraction and ETL agents,
coding agents, support agents, research agents, anything sold as "the AI does X for you".

The largest cluster in the pipeline. Kadoa, Category Labs, MixRank, Gooseworks, Atria, Evaboot,
String and most YC-grid leads sit here.

---

## 1. The shape

Almost every one of these is the same five pieces with different vendors:

1. An **ingest / trigger** layer: a crawl, a webhook, a queue, a cron, or a user action.
2. A **context assembly** step: retrieval, chunking, schema selection, tool listing. This is
   where most of the real engineering is, and where nobody's marketing site looks.
3. **One or more model calls**, usually chained, increasingly with tool-calling loops.
4. A **validation / repair** step: schema check, retry, escalate, or fall back to deterministic
   code. Whether this exists is the single biggest quality difference between two companies with
   identical stacks.
5. A **durable store** of runs, so a result can be shown, audited, and replayed.

The vendor layer on top (Vercel, Clerk, Supabase, Temporal, a queue, Postgres, a vector DB) is
the part that shows up in headers and matters least.

---

## 2. The hard problems

**1. Non-determinism breaks every testing habit the team already has.** The same input returns a
different output tomorrow, so a passing test suite is no longer evidence. Teams reach for eval
harnesses and golden sets, and then discover the golden set is now the maintenance burden. The
symptom: shipping slows down not because of bugs but because nobody can tell if a prompt change
was an improvement.

**2. It works in the demo and falls over at concurrency.** A chained pipeline that takes 8
seconds and calls three providers has a p99 nothing like its p50, and provider rate limits turn a
per-user problem into a global one. The symptom: it worked for the founder's demo account and
degraded the week real traffic arrived.

**3. Cost per run is unbounded by default, and the customer's plan is not.** Tokens scale with
input size, retries multiply it, and a tool-calling loop can decide to do more work. The symptom:
a margin conversation that turns into an architecture conversation, and a hard cap being added
somewhere it hurts.

**4. Partial failure is the normal case, so retries have to be idempotent.** Step 3 of 5 failed
after two model calls were already paid for and one side effect already happened. Without run-level
idempotency and checkpointing, a retry either double-charges or double-writes. The symptom:
duplicate rows, duplicate emails, or a bill nobody can reconstruct.

**5. Extraction quality is a schema problem long before it is a model problem.** A loose schema
gets plausible garbage; a strict one gets refusals and empty fields. Whoever owns the schema owns
the quality metric. The symptom: prompt engineering that plateaus, then a rewrite that makes the
output type-checked and suddenly works.

**6. Multi-tenancy plus a shared worker pool equals noisy neighbours.** One customer's 40,000-row
job starves everyone else, because the queue is fair per job and not per tenant. The symptom:
support tickets that correlate with one big customer's schedule.

**7. Nobody can explain why a specific run produced a specific answer, and someone will ask.**
Without storing the exact prompt, context, model version and tool results per run, a customer
complaint is unanswerable and a regression is unfindable. Provider model versions change under
you. The symptom: "it used to work" with no way to check.

**8. Prompts are code that lives outside the code.** Versioning, review, rollback and per-tenant
overrides all have to be reinvented, usually twice. The symptom: a prompt edited in production to
fix one customer, silently changing behaviour for everyone.

**9. The human-in-the-loop boundary is a product decision disguised as an infrastructure one.**
Where the gate sits (before send, before write, sampled review, none) decides the trust story,
the latency, and the support cost. The symptom: a company that removed the gate to look
autonomous and now has a correction workflow instead.

---

## 3. The standard trade-offs

Each of these is a fork every company here has taken. Asking *which way* they went is the cheapest
way to sound like an engineer who has built one.

| Fork | One side costs | The other side costs |
|---|---|---|
| Agent loop vs fixed pipeline | unpredictable cost and latency, hard to debug | can't handle inputs you didn't anticipate |
| Big context vs retrieval | tokens, and attention dilution on long inputs | a retrieval layer to build, tune and evaluate |
| Strict output schema vs free text + parse | refusals, empty fields, prompt fighting | silent garbage that passes validation |
| Model-repairs-itself vs deterministic fallback | another non-deterministic step in the retry path | code that has to cover the long tail by hand |
| Sync request vs queue + webhook | timeouts, and a p99 the user feels | a job store, status UI, and delivery semantics |
| One frontier model vs router/cascade | cost per run | quality variance and two providers to babysit |
| Fine-tune vs prompt + context | a data pipeline and a retraining story | ceiling on quality, and per-call cost forever |
| Gate before action vs autonomous | throughput, and it looks less impressive | a correction workflow, and a trust incident eventually |

---

## 4. Where Shivam's real work touches this

Honest mapping. The distance is stated, because a stretched seam is detectable in about four
seconds.

- **Problem 5 (schema before model) and problem 1 (validate-and-gate): direct.** Hireflow
  rewrites resume bullets with GPT-4o-mini, then a post-processing validator rejects any skill
  that is not in his real profile. That is a deterministic check wrapped around a
  non-deterministic step, which is the validation/repair piece of the shape above. He has not
  built a golden-set eval harness and should say so if asked.
- **Problem 2 (dies at concurrency) and the sync-vs-queue fork: direct.** CodeSM grades
  submissions through BullMQ + Redis outside the request lifecycle, with retries; Storix moves
  PDF extraction to Celery and streams stage events back over Redis pub/sub + WebSockets.
  Hireflow separates ingestion, LLM processing and Playwright on different queues so one
  stage's failure (a bot-detection block) doesn't stall the rest.
- **Problem 3 (unbounded cost): adjacent, and a strong one.** At klimb.io he built a
  PostgreSQL-backed usage-metering and credit ledger across 6+ AI features. That is per-feature
  consumption accounting, the thing a cost cap is built on. It metered usage; it did not cap
  token spend per run, so say "metering", not "cost control".
- **Problem 4 (idempotent retries): adjacent.** Content-hash dedup three times over: SHA-256
  fingerprints of normalised postings in Hireflow, server-verified SHA-256 asset dedup with a DB
  uniqueness constraint at poiro.com, content-addressed S3 in Yuvro. Dedup, not run-level
  checkpointing.
- **Problem 6 (noisy neighbours): partial.** Strict candidate-level data isolation across
  concurrent live sessions on the klimb.io AI interview platform; per-workspace Kubernetes
  isolation in Yuvro. Isolation, not per-tenant queue fairness.
- **Problems 7, 8, 9 (run explainability, prompt versioning, the human gate):** no real
  experience. Ask them instead.

Also on-point when the company generates media: poiro.com is the asset layer behind
AI-generation surfaces (lineage between generated and derived assets, dedup, reference
integrity), which is the durable-store piece of the shape above.
