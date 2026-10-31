# Story Bank

Indexed answers in Shivam's own framing. Seeded 2026-09-28 from `founder-outreach-ai`; rebuilt
2026-10-20 from his updated knowledge base in `self-profile/` (resume 2026-10-19, poiro
internship report 2026-10-08, project deep-dives), which corrected several claims the first
version got wrong. These are the raw material for "tell me about yourself", behavioral
questions, and any form field asking for a personal answer. Use the *substance*; polish per
audience but keep the specifics. **Every entry is problem → decision → result, and nothing is
added that his source files don't state.** When he answers a new question in his own words,
add it here.

**Before quoting any number, check its status tag:**
- *shipped*: merged / in use, safe to state as done.
- *open branch*: real work, not merged as of 2026-10-08. Say "I'm leading" or "on my branch".
- *prototype*: built and measured, then not adopted. Say so; it is still a good story.

Full evidence and claim limits per project: `self-profile/projects/{project}.md`.

**Gaps still to fill with Shivam:** a failure or mistake story in his own words, a disagreement
with a teammate, and any hard number on the klimb.io p95 improvement. (Candidates for the first
two are flagged inline below with *ask Shivam*: don't tell them until he confirms.)

## The arc (tell me about yourself)
CSE at IIIT Nagpur, graduated May 2026. Gravitated to the backend work nobody sees but everyone
feels: queues, sandboxes, storage layers. Interned at klimb.io (Nov 2025 to May 2026), where he
built a usage-based credit ledger across 6+ AI features. Now a Fullstack Developer Intern at poiro.com,
building the asset library every AI generation files into (shared by 3 web apps), the async
worker runtime under their Celery jobs, and the auth that lets outside AI agents run apps over
MCP. On the side he builds the systems he wants to understand end to end: a sandboxed code
execution engine (CodeSM), a Kubernetes-backed cloud IDE (Yuvro), and a RAG app with its own
evaluation harness (DeepDoc). Top 5% on LeetCode. The through-line: async processing,
isolation, and data integrity. Looking for a full-time team where those are the core problems.

## Why I'm looking (stated 2026-10-20)
He wants a full-time role where backend and infrastructure problems are the core of the job, at
more depth and scale than an internship gives him. Frame it as moving toward harder problems,
never away from poiro.com, and never mention poiro internals beyond `facts.yaml`.

<!-- poiro.com stories replaced 2026-10-28 from self-profile/projects/poiro-work-report.md (read
from the code on `dev`). The earlier poiro stories were removed at Shivam's request. -->

## poiro.com: one library every generation files into (shipped on dev)
**Problem:** AI generations came from many surfaces (boards, app runs, storyboards and more),
and a provider's output URL expires. A library that only stores the URL ends up showing broken
pictures, each surface would save results its own way or not at all, and without the model and
prompt nobody can see how an asset was made or make it again.
**Decision:** one Creative Asset Manager (CAM) with three ways in: presigned upload, stock
import, and one function, `register_produced_asset`, that every generation path calls. It copies
the bytes into our own storage under a key built from the content, so the same file is stored
once, and skips the download when the URL is already ours. Model, prompt and reference images
are stored with the asset. Saving an asset never fails the user's job: if it can't save now, the
call is written down as a pending filing and a background task retries it.
**Result:** one library and one shared UI package used by 3 web apps, no dead provider links,
and provenance for every generation. Good for "design a durable store behind flaky upstreams"
and "how do you keep a side effect from failing the main request".

## poiro.com: three stock providers, one adapter, a spend limit on every call (shipped on dev)
**Problem:** users need stock photos and video next to their own assets, every provider's API
is different, and Pinterest is paid per call.
**Decision:** a `StockAssetAdapter` base class with two methods, `search` and `get_download`,
one adapter per provider (Unsplash, Pixabay, Pinterest). A runtime picks the adapter and, before
every call, checks the provider is switched on and the spend limit allows it; Pinterest is only
offered when its key is set. Search results are cached in Redis per org. **Not shared across
orgs on purpose:** a faster answer would reveal what another org searched for. Imports cap the
bytes one import reads and how many run at once, rate-limit each user, and hash the bytes that
actually arrived. When a provider changes its response shape, the user gets a 502 naming the
missing field instead of a crash.
**Result:** adding a provider is one adapter, a teammate's repeat search isn't paid for twice,
and a schema change upstream is a clear error, not an outage. Good for cost, rate-limit and
"third-party API changed under you" questions; the per-org cache is a nice privacy trade-off.

## poiro.com: async code inside synchronous Celery workers (shipped on dev)
**Problem:** Celery can't run `async` tasks. Making a new event loop per task breaks every
client bound to the previous loop (httpx, PyMongo, R2), and a loop that stops between tasks also
stops the Mongo heartbeats, so after a server restart the next write fails on a dead connection.
**Decision:** one asyncio loop per worker process, running forever on its own thread, never
replaced. A task hands it a function that builds the coroutine, not the coroutine itself, so a
Celery retry gets a fresh one. Many Celery threads share the loop so their waits overlap. On a
timeout the coroutine is cancelled and given time to clean up. If the loop dies, the process
exits so Celery starts a clean one; a forked child starts its own loop. Shutdown closes things in
a fixed order: Mongo, leftover work, Redis, Forge, R2. In auth-service, retries are carried back
to the task's own thread.
**Result:** heartbeats keep running between tasks and loop-bound clients stay valid. Strong
interview topic: event-loop affinity, fork boundaries, cancellation and ordered shutdown.

## poiro.com: one database client per process instead of one per task (shipped on dev)
**Problem:** a new Mongo client per task means a new connection pool and new background
monitors every time, which is a lot of churn under load, and an async client only works on the
loop that created it.
**Decision:** in the Forge worker, one Mongo client, one Redis pool and one orchestrator per
loop, shared by every task, replacing the per-task context. Redis uses a blocking pool, so in a
burst a task waits briefly for a connection instead of failing mid-job. In the main backend, a
`LoopBoundMongoClient` holds the process's one client and refuses any other loop, and Beanie is
set up once when the worker starts.
**Trade-offs he can defend:** one client per loop means every task must run on that loop and
nothing on it may block; process-wide state is easy to reach but has to be reset after `fork`
(the code does); Forge still uses **Motor, not Beanie**, because moving it is a larger change
across the Forge repositories. No measured numbers: never quote connection or latency savings.

## poiro.com: letting outside AI agents run apps over MCP (shipped on dev, server not in repo)
**Problem:** users want to drive Poiro from their AI assistant, but an agent needs hard limits
on what it can do and how much it can spend.
**Decision:** one MCP connection is one grant: one user, one org, scopes (`apps:read`,
`apps:run`, `assets:write`) and credit caps per day and per run. Access tokens are RS256 and
last up to an hour; refresh tokens rotate, and reusing an old one revokes the grant. Other
services verify tokens against auth-service's public keys (JWKS), so they can check tokens but
can't mint them. Every request re-checks the grant: user active, still in the org, and the org
has both the `mcp` and `infinite` apps on. Agent-started runs and assets are labelled
`submitted_via="mcp"`.
**Trade-offs:** RS256 over HS256 costs key management and rotation; the per-request grant check
is one extra call but makes revocation immediate; v1 grants all scopes at consent, so users
can't pick narrower permissions yet. **The MCP server and its tool definitions are not in this
repo; never claim them.**

## poiro.com: Elements, consistent characters across generations (partly built)
**Problem:** keeping a character, prop or place looking the same across many generations
without re-uploading the same reference images every time.
**What is built:** an element is a named set of reference images with a handle like
`@char_hero`. Create, edit, delete, restore and add images. Handles come from the name
(`char_`, `prop_`, `loc_`) and a clash is refused rather than silently suffixed. The 8-image cap
is checked under an org lock so two concurrent adds can't both slip past it.
**What is not:** nothing on dev turns `@handle` in a prompt into the element's images yet. Say
"the handle resolution is the next step", never that it works.
**Trade-offs:** an element is a root folder with a category and handle, not its own collection,
so it reuses the folder tree and its locking, but ordinary folders share those fields and the
code has to guard them (category and handle can't change once set). Refusing a duplicate handle
is stricter, but the user always gets the handle they typed. A small image cap keeps the
conditioning input predictable but limits how many angles a user can store.

## poiro.com: Flowboard drag performance (plan only, nothing built)
**Problem:** on a big board, each drag frame re-runs the whole board page (about 8,600 lines),
including turning the whole board into a JSON string even when the dialog that uses it is closed.
**The plan:** only the canvas re-renders. Keep React Flow in controlled mode (uncontrolled
applies changes before our handler runs, breaking selection rules and undo/save), move nodes to
a zustand store so readers fetch only what they need (cost: about 50 `setNodes` call sites and
many hooks), accept that selectors still scan every node per frame (fine around 280 nodes, may
need an index beyond), and leave the load freeze to a separate plan.
**How to tell it:** as a design you wrote and can defend. **Nothing is implemented and there are
no before/after numbers.**

## poiro.com: element tagging (not built)
No source on dev. The open design questions, from session notes: tag by asset id (survives URL
changes, but every reader looks it up) or by URL, and rewrite tags in Forge's transformer layer
(one place for every provider and app, but the backend must understand the tag format) or in the
frontend. Use only as "how would you design this".

## klimb.io: feature flags to a credit ledger (shipped)
**Problem:** premium AI capabilities were gated by on/off feature flags, so finance couldn't
audit usage per feature or bill by consumption.
**Decision:** a PostgreSQL-backed usage-metering and credit ledger across 6+ AI features,
enforced in middleware.
**Result:** an auditable per-feature usage log in place of binary toggles, so customers can be
billed by usage. Maps to any company moving to usage-based pricing.

## CodeSM: running code you don't trust
**Problem:** execute arbitrary submissions (fork bombs, infinite loops, network attempts),
grade them asynchronously, and never take the host down.
**Decisions:** the API saves a PENDING submission and puts it on a BullMQ + Redis queue, so it
returns immediately. Workers run code in Docker with no network, a read-only root filesystem, a
64 MB tmpfs, all capabilities dropped, no-new-privileges, 256 MB memory, 32 processes, 0.5 CPU
and a timeout. **One container per submission**, reused across that submission's test cases
with `docker exec` and then destroyed, so test cases don't each pay container startup. Test
cases load from S3 one at a time and grading stops at the first failure. API and workers share
one Drizzle/PostgreSQL schema, after a migration off MongoDB. Gemini generates four progressive
hints per problem.
**Languages:** C, C++, Java, Go, Python, JavaScript. Live at code-sm.vercel.app; used for
testing, no real users. Containers are defense-in-depth, not an absolute boundary (shared
kernel); say that before an interviewer does.

## Yuvro: where to draw the boundaries in a cloud IDE
**Problem:** instant browser workspaces (editor, terminal, preview, database browser) without
letting infrastructure actions leak into user-facing APIs.
**Decisions:** four planes: the client, an init-service for auth and metadata, an orchestrator
that owns Kubernetes resources (per-project deployment, service, ingress, optional database),
and a thin runner in each project for PTY streaming, file I/O and port proxying. Files can be
stored once by content hash in S3, with template manifests and a scheduled job that deletes
files no project references. The file tree is a self-referential `nodes` table with indexes
chosen for expansion, uniqueness and type filters.
**Hard parts:** streaming raw PTY over WebSockets with real shell behaviour, and keeping
metadata, blob storage and workspace files in sync without orphans.
**Known limit:** runner storage is node-local hostPath, so it's single-node today; good to raise
yourself when asked how it scales.

## DeepDoc: the bug that blanked every answer
**Problem:** a personal PDF Q&A app (Next.js, Azure OpenAI, Pinecone, PostgreSQL) gave empty
or wrong answers, and prompt tweaks weren't the fix.
**Decision:** built an evaluation harness first: 36 cases on one document, 6 of them multi-turn
(lists, vague and Hinglish questions, missing evidence, prompt injection), replaying retrieval
parameter sweeps without new API calls, prompt A/B, and an LLM judge, so each failure could be
pinned to indexing, retrieval or generation.
**What it found:** retrieval required a `pageNumber` field that ingestion never wrote, which
blanked the text of every match. Also chunk truncation dropping content, sentence splitting on
dotted tokens like `Node.js`, and an index drift in topic-shift detection.
**Then:** section-aware chunking that keeps headings and bullets with their section, follow-up
questions rewritten into standalone queries from chat history, and ranked, deduplicated context
packed into a token budget.
**Don't claim:** an accuracy percentage, production users, or background ingestion (it runs
inline). Tuned across 100+ configurations (per the 2026-10-20 resume).

## Hireflow: stopping the LLM from inventing skills
**Problem:** tailoring resumes to job descriptions at volume without the model making things up.
**Decision:** GPT-4o-mini rewrites the bullets, then a validator checks every rewritten skill
against his real profile and rejects anything that isn't in it.
**Also:** ingestion (LinkedIn, Wellfound, YC, Telegram via GramJS), AI processing and Playwright
application run on separate BullMQ queues, so a bot-detection block in one stage doesn't stall
the rest; cross-source duplicates are caught with SHA-256 fingerprints of normalised title,
company and description. He used it for his own real job applications (count not recorded yet).

## Storix: no more blind background jobs
**Problem:** heavy PDF extraction blocks the web server and times out, and moving it to a worker
leaves the user staring at nothing.
**Decision:** FastAPI + Celery for the work, and Redis pub/sub bridging stateless Celery worker
events to a stateful WebSocket connection, so the Next.js client sees every stage live.

## Chatterly: decoupling ingest from delivery
Kafka queues incoming messages so Postgres writes can be batched by workers while Redis pub/sub
broadcasts across Socket.io instances. The hard part was delivery guarantees (at-least-once vs
exactly-once via Kafka offsets) and reconnects.

## founder-outreach-ai: outreach as a system
Built his own knowledge base and prompt pipeline for cold outreach: experience and projects as
structured markdown, a framework for inferring a startup's likely engineering bottleneck, and a
strict 4-beat DM (hook, bottleneck, proof, low-pressure ask). Used for a founder DM campaign in
June 2026 (results not recorded). Good for "how do you approach a problem that isn't code".

## Competitive programming
LeetCode top 5% globally (1,800+, 800+ problems), CodeChef 3-star (1,700+), Codeforces Pupil
(max 1,261). 3rd place at Tantrafiesta 2024, IIIT Nagpur's hackathon (project not recorded).

## Spoken answer that landed: an AI agent, in the company's own terms (DeciOps call, 2026-10-23)
"An agent is an LLM that decides the next action, calls a tool, checks the result, and loops
until the job is done. Say warehouse 1 sees a demand spike and needs 500 units now: the agent
detects it, checks stock at warehouse 2, and creates the transfer. Above a confidence threshold
it runs on its own; below it a planner approves." Reuse the shape: definition, then their case.

## How I use Claude Code on a feature (Shivam's own words, 2026-10-25)
Source: Shivam, in chat, for the ZeroGrunt Q3 answer. Reusable for any "how do you use AI coding
tools" question (Lumari, SuperApp, ZeroGrunt).
1. Understand the requirement, the feature, and the existing code's behaviour and design first.
2. Come up with his own solution, then use Claude to challenge it (why the design is good or bad,
   what to improve). He built a skill that reviews a plan before execution.
3. Split the plan into phases, PRs of about 1,000 lines each; a small change stays one PR.
4. Execute the plan.
5. Review the code and fix it with a Claude review skill.
6. Test: written test cases, manual testing in Chrome, Playwright tests.
7. Open the PR.
8. Repeat the tests on staging and prod.
Gap: no single concrete feature named yet. Ask for one example (what feature, what Claude got
wrong, what he fixed) before using this where a "real problem" example is required.
