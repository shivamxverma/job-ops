# VectorShift — tech read (2026-10-24)

Sources: `stack-probe.json` (this folder), docs.vectorshift.ai/llms.txt, the API reference
(`/api-reference/pipelines/bulk-run`), SDK guides (`/sdk/guides/background-batch`, `/sdk/errors`),
PyPI `vectorshift` release history. No public GitHub repos (org `vectorshift` exists, 0 public).

## 1. The system, as far as it is visible
- **Product engine:** pipelines (node graphs), agents, knowledge bases, tables, "transformations",
  exposed three ways: no-code UI, REST API (`api.vectorshift.ai/v1`, OpenAPI published), Python SDK
  (`pip install vectorshift`, 0.1.10 → 0.1.15 between 10 Jun and 9 Jul 2026). [docs]
- **Pipelines nest:** a pipeline can reference a sub-pipeline, a knowledge base, an integration;
  permission rules apply transitively. [docs: /sdk/errors]
- **Runs have three shapes:** sync `run`, sync `POST /pipeline/{id}/bulk_run` (parallel instances,
  one response with top-level `status: success|failed` plus `run_outputs[]`), and background
  `pipeline.start()` → `RunHandler{task_id, trace_id}` with poll / block / stream / retry / terminate.
  The task id is meant to be persisted so any process can resume polling. [docs]
- **Transformations:** "run arbitrary code in VectorShift's isolated execution environment". [docs]
- **Idempotent definitions:** nodes dedup by `name`, so a re-run build script is a no-op. [docs]
- **Multi-tenant:** API key carries org context; cross-org reads return 404 by design. [docs]
- **Edge:** app and marketing on AWS CloudFront. [probe: `x-amz-cf-id` on app.vectorshift.ai]
  Docs on Mintlify (that is Mintlify's Vercel, not theirs).
- **Product on top (2026):** "AI operating system for private market investors": VDR analysis,
  IC memos, portfolio monitoring, LP reporting, "every figure traced back to the exact document
  and page", "indexed, not just connected", "model agnostic". [vectorshift.ai]

## 2. What they are worried about right now
The company has narrowed from a horizontal no-code builder to one vertical (PE/VC firms).
SOC 2 Type II and GDPR are on the homepage, so enterprise trust and per-firm data isolation are
selling points. The backend JD's own words: "improving workflow run efficiency and scalability",
"manage our database infrastructure".

## 3. The problems this shape forces
1. **Partial failure in batches.** A bulk run over 200 data-room documents where 3 fail: one
   top-level status either throws away 197 good outputs or hides 3 bad ones. [inference from schema]
2. **Retry cost on long pipelines.** Background runs retry "on transient errors". If a worker dies
   at node 6 of 8, a restart from node 0 re-pays every LLM call before it. Checkpointing per node
   output is what makes retries cheap. [inference]
3. **Per-firm fairness.** One firm bulk-running a whole data room can starve another firm's
   interactive queries unless runs are queued and capped per org. [cluster note: llm-in-production §2.2/2.3]
4. **Citations survive chunking.** "Exact document and page" means page metadata has to ride
   through chunking, retrieval and reranking intact. [inference]

## 4. The seam Shivam has already touched
- **Sub-workflows:** at poiro.com he implemented Flowboard's node and group system: typed ports,
  execution order, nested groups that run as sub-workflows. Same object as their sub-pipelines.
- **Isolated execution:** CodeSM runs untrusted code in Docker with no network, read-only root,
  256 MB, 32 PIDs, 0.5 CPU, timeout. Same problem as Transformations.
- **Runs off the request path with live progress:** Storix (FastAPI + Celery + Redis pub/sub →
  WebSocket). Same shape as `start()` + stream.
- **Cost caps per org:** poiro fail-closed caps, 500 calls/org/day and 5,000/day global.
- **Retrieval with sources:** DeepDoc, document-scoped retrieval plus a 36-case eval harness.

## 5. Two questions only an internals reader would ask
1. "When one run inside a `bulk_run` fails, does the response go `failed` for the batch, or do the
   other runs' outputs still come back?" Follow-up: if they say per-run, ask whether a retry re-runs
   only the failed ones. If they say the batch fails, ask whether that's why `start()` exists.
2. "When a background run fails at a late node, does a retry resume from the last completed node's
   output, or start again from the input?" Follow-up: if it restarts, ask how they keep LLM spend on
   retries bounded; if it resumes, ask where node outputs are checkpointed.

## 6. Do not say
- "You run on Vercel / Next.js." (That's the Mintlify docs host.)
- "Your bulk_run drops partial results." It's a schema reading, not a test. Ask, don't claim.
- Anything about their database, queue or language. Not visible. The JD says Python/FastAPI, so
  say that and no more.
- "No-code platform" as their current pitch. It's the engine under the private-markets product now.
