# VectorShift — dossier (2026-10-24)

Role: Backend Engineer (India), remote IN, full-time, $20K–$30K, "Any (new grads ok)", no US visa
needed. https://www.ycombinator.com/companies/vectorshift/jobs/fOnABbt-backend-engineer-india

## Product in one paragraph
VectorShift started (YC S23) as a no-code platform for AI pipelines, chatbots, knowledge bases
and automations, with a REST API and Python SDK on the same engine
([Launch YC, Oct 2024](https://www.ycombinator.com/launches/M2d-vectorshift-no-code-ai-automations-platform)).
In 2026 it repositioned as "the AI operating system for private market investors": data-room
(VDR) analysis, IC memos, portfolio monitoring, LP reporting, with every figure traced to the
exact document and page ([vectorshift.ai](https://vectorshift.ai)). The pipeline/KB/agent engine
and SDK are still live and documented ([docs](https://docs.vectorshift.ai/llms.txt)). Not used
first-hand: the platform is demo-gated for the investor product.

## People
- **Alex Leonardi**, co-founder & CEO. Harvard AB/SM Statistics + CS, ex-Blackstone PE data
  science. Runs the 45-min technical round. https://www.linkedin.com/in/alexanderleonardi
- **Albert Mao**, co-founder & COO. Harvard Statistics '21, ex-McKinsey. Runs the 15-min
  behavioral screen. https://www.linkedin.com/in/albert-mao-8b263aa2
- Common ground: none direct. No email address published for either. GUESS-free rule: do not
  construct one.
- Interview loop (from the posting): 15 min behavioral (Albert) → take-home → 45 min technical (Alex).

## Momentum
- $3M seed, Feb 2024 (1984 Ventures, Defy, Formus, YC, Soma, 468, Pioneer)
  ([VentureBeat](https://venturebeat.com/business/exclusive-vectorshift-raises-3m-to-modularize-llm-application-development)); ~$3.5M total (CB Insights).
- Team size 30 per YC page; HQ New York; this req is the India backend seat.
- SDK shipping: 6 PyPI releases 10 Jun – 9 Jul 2026.
- SOC 2 Type II + GDPR on the homepage: selling to regulated buyers.

## Their vocabulary
- "Indexed, not just connected" (homepage)
- "Knowledge that compounds" (homepage)
- "Every answer, fully sourced" (homepage)
- "workflow run efficiency and scalability" (the JD)

## Architecture, as far as it is visible
Pipelines are node graphs that can nest sub-pipelines; runs are sync, bulk (one response for N
parallel runs) or background (`task_id` + poll/stream/retry/terminate); "transformations" run user
code in an isolated environment; org-scoped API keys, 404 on cross-org access. Edge is CloudFront.
Full read: [tech-read.md](tech-read.md).

## What I'd do in week one
1. Per-run status in `bulk_run` so one failed document doesn't decide the fate of the other 199,
   and a retry that re-runs only the failures. (Ask first: tech-read §5 Q1.)
2. Checkpoint each node's output on background runs so a retry resumes at the failed node
   instead of re-paying every LLM call before it.
3. Per-org run queue and fail-closed spend cap so one firm's data-room batch can't starve
   another firm's interactive queries (the poiro.com caps pattern).

## Which framing wins
**backend_framing**, with Flowboard (sub-workflows) and CodeSM (isolated execution) as the two
lead proofs. AI only as context (DeepDoc retrieval with sources), not as the headline.

## Draft answers
**Why VectorShift?**
You run pipelines that call other pipelines, and at poiro.com I built the part of our workflow
builder where a group of nodes runs as its own sub-workflow, with typed ports and execution order
between steps. The interesting part of your engine is the same problem at a bigger scale: making
nested runs fast, retryable and fair across firms when one of them bulk-runs a whole data room.
That's the backend work I want to be doing.

**Why this role?**
The JD asks for workflow run efficiency and scalability, which is exactly where I've spent my
time: runs off the request path with live progress (Storix: FastAPI, Celery, Redis pub/sub to
WebSockets), untrusted code in locked-down containers (CodeSM: no network, read-only root, 256 MB,
32 PIDs), and fail-closed per-org spend caps at poiro.com (500 calls/org/day). I'm a 2026 grad,
so the "new grads ok" line is why I'm applying now rather than in two years.

**Availability:** internship at poiro.com ends 22 Nov 2026, available from 23 Nov.
