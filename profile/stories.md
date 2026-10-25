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
building the asset service shared by 3 apps and the node and group system of their AI workflow
builder. On the side he builds the systems he wants to understand end to end: a sandboxed code
execution engine (CodeSM), a Kubernetes-backed cloud IDE (Yuvro), and a RAG app with its own
evaluation harness (DeepDoc). Top 5% on LeetCode. The through-line: async processing,
isolation, and data integrity. Looking for a full-time team where those are the core problems.

## Why I'm looking (stated 2026-10-20)
He wants a full-time role where backend and infrastructure problems are the core of the job, at
more depth and scale than an internship gives him. Frame it as moving toward harder problems,
never away from poiro.com, and never mention poiro internals beyond `facts.yaml`.

## poiro.com: deduplication I built, measured, and the team didn't ship (prototype)
**Problem:** AI-generation surfaces create lots of duplicate uploads, and a hash the browser
sends can't be trusted for correctness.
**What he did:** benchmarked 5 hashes (SHA-256, pHash, dHash, colorhash, xxHash) and picked
xxHash64 for exact duplicates, with pHash planned for near-duplicates. The prototype had a
browser preflight to skip known duplicates, server-side re-verification against R2, and a
database uniqueness index so concurrent uploads couldn't race past the check. Stress test:
10,000 uploads at concurrency 64.
**Outcome:** the team removed content deduplication and kept operation-key idempotency
instead. The asset service today ships "duplicate blocking" at that level, not content hashing.
**How to tell it:** as a design trade-off, not a win. Why server re-verification matters, why
the uniqueness constraint and not an app-level check, and why a team might prefer idempotency
keys over content hashing. **Never say poiro.com storage is SHA-256 deduplicated.**

## poiro.com: the folder tree and the bugs hiding assets (shipped)
**Problem:** production endpoint failures and reference-integrity defects could hide nested
folders and AI-lineage assets, and the folder tree ran one subtree query per nesting level.
**Decision:** replaced the per-level traversal with a single MongoDB `$graphLookup`, and folded
rename, recolor and move into one PATCH so a folder edit takes 1 database round-trip instead of
up to 3. Fixed a crashing `GET /assets/global`, an `AttributeError` at 3 call sites, and
string/ObjectId inconsistencies, with a migration script for the stored data.
**Result:** nested folders and lineage assets resolve again, and the tree lookup is one query
regardless of depth. Context: the asset service is team-built (3 Next.js apps, 32 FastAPI
routes); his part is the core org-scoped models and backend and most of the shared frontend.

## poiro.com: Pinterest without an open-ended bill (shipped)
**Problem:** stock search across providers needed consistent results, and Pinterest access goes
through paid third-party vendors, so every search costs money.
**Decision:** put Pixabay, Unsplash and Pinterest behind one search/download adapter contract.
Compared 2 vendors on 20+ edge-case queries at 30 concurrent requests and chose ScrapeCreators
(full-size images with dimensions in one call, lower cost; the faster one lacked usable
dimensions). Org-scoped Redis cache keyed on provider, media type, org, query and cursor; the
browser gets a 32-character token instead of the ~2 KB vendor cursor; fail-closed caps of 500
vendor calls per org per day and 5,000 globally, charged only on cache misses.
**Result:** repeat searches cost nothing, and a bug or abuse can't run the vendor bill past a
known ceiling. Good for "tell me about a cost or rate-limit problem".

## poiro.com: the node and group system for the AI workflow builder (shipped)
**Problem:** in the visual workflow builder (Flowboard), users needed to bundle steps into
reusable sub-workflows, and collapsed groups had to expose typed inputs and outputs while
nested nodes live in their parent's coordinate space.
**Decision:** he implemented the node and group concept: node types, typed ports (text, image,
video, audio and more), execution order, and nested, collapsible groups that run as
sub-workflows. In #697 he fixed collisions that compared canvas positions with group-relative
ones (now only nodes with the same parent are compared) and shipped collapsed group cards with
typed boundary ports and live child progress.
**Result:** a group can be collapsed into one card that still wires and runs like a single step.
Good for full-stack and "hard frontend state" questions.

## poiro.com: 1,041 lint findings, and making it stick (shipped)
**Problem:** 1,041 Ruff findings across 7 Python packages, checks that were advisory
(`|| true`, changed files only), and new packages never covered.
**Decision:** cleared them (autofix, then manual import-order, unused-import, undefined-name and
bare-except fixes), made whole-tree `ruff format --check` and `ruff check` blocking in CI and
pre-push, and made package discovery read `pyproject.toml` under apps/packages/services instead
of a hand-kept list (4 packages got checked for the first time). When fixing undefined names
would have meant writing missing functions, he reverted that to keep the PR scoped.
**Why it's a story:** rolling strict enforcement out across an existing codebase without
breaking anyone; the fix that lasts is the discovery, not the cleanup. (Another engineer wrote
`ruff.toml` and the lint-staged hook; don't claim them.)

## poiro.com: upgrading 70 dependencies and what it turned up (shipped)
**Problem:** a stale Python baseline and dependency set across 12 lock files.
**Decision:** moved the baseline and CI matrix to Python 3.13, keeping one image (LaMa) on 3.12
because its libraries weren't compatible, rather than forcing it. Refreshed 70 dependencies
(Starlette, langchain-core, Pillow, OpenCV and more), removed ~20 unused direct dependencies
and ~2,500 dead lines; locked entries went 951 to 841.
**What he found on the way:** a route-coverage test that only checked 3 of 443 routes, and
provider API keys committed in old config files. He removed the files and flagged the keys for
rotation (deleting a file doesn't remove it from Git history, so rotation was the real fix).
**Good for:** "tell me about a time you found something nobody asked you to look for".

## poiro.com: the Celery event-loop problem (open branch, #789)
**Problem:** migrating from Motor to PyMongo async (Beanie 1 to 2, 6 packages, ~250 files). The
new client is bound to the first event loop it sees, but the Celery tasks created a fresh loop
per task and left none running between tasks, so idle heartbeats stopped. After an idle period
plus a MongoDB restart, the next write could fail with `AutoReconnect`.
**Decision:** one long-lived event loop per worker process that tasks submit work to (if it
dies, the process exits and gets replaced), one process-local client that rejects cross-loop
use, forked children drop inherited clients, and transaction startup is properly awaited.
**Result on the branch:** idle heartbeats went from 0 to 11 in 6 seconds; strict test fakes
caught missing `await`s in 13 tests. **Not merged as of 2026-10-08: say "I'm leading the
migration", never "shipped".** Strong interview topic: event-loop affinity, fork boundaries,
async work inside synchronous workers.

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
