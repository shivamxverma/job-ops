# Smallest — dossier (2026-10-23)

Lead: scripted ATS scout (Ashby), posted 2026-10-22. Role: **Software Engineer, Systems &
Reliability**, Bengaluru onsite, full-time. JD saved in `jd.md`. Apply: Ashby form
https://jobs.ashbyhq.com/smallest/f0879803-4119-4278-bcfc-4f0b25df943b . Board has 3 roles
(this, Senior SDET Bengaluru, Finance Mumbai), so this is a deliberate reliability hire.

## Product in one paragraph
Smallest.ai builds low-latency enterprise voice AI on in-house models: **Lightning** (TTS),
**Pulse** (STT, 38 languages), **Electron** (small language model), **Hydra** (full-duplex
speech-to-speech). These power the **Waves** API suite and **Atoms**, a voice-agent platform for
support, sales, collections and scheduling. Pricing: Free, Personal $49/mo, Business $1,999/mo,
Enterprise; on-prem option; SOC 2 Type II, HIPAA, GDPR, ISO 27001. Python, Node and Java SDKs,
an MCP server, a self-host repo. Not used hands-on yet (free tier exists: worth 20 minutes before
any call). Sources: https://smallest.ai/llms.txt , https://smallest.ai/pricing

## People
- **Sudarshan Kamath**, co-founder & CEO; **Akshat Mandloi**, co-founder & CTO. Both ex-Bosch
  autonomous-vehicles team. HQ San Francisco, engineering in Bengaluru. (Search results:
  entrackr, entrepreneur.com, yourstory.) The CTO is the likely owner of this hire. GUESS.
- Warm paths: not checked. Next: `/network-scout` lens 2 on the Smallest company page (any
  IIIT Nagpur alum or 1st°?).

## Momentum
- Seed **$8M** (Oct 2025, Sierra Ventures; 3one4, Better Capital). **Series A $13M** (Sierra,
  Seligman; 3one4). One source dates it July 2026, unconfirmed. Total > $21M.
  https://yourstory.com/2025/10/saas-startup-smallestai-secures-8m-in-seed-funding-sierra-ventures ,
  https://raising.fi/news/smallest-ai-series-a-july-2026
- GitHub org `smallest-inc` is alive: Python SDK pushed 2026-10-07, MCP server 2026-09-30, a Go
  CLI (`velocity-cli`) 2026-09-02, `Full-Duplex-Bench` 2026-08.
- **Status page (Better Stack, status.smallest.ai) shows the reason for the hire:** "Electron USA
  is down" on Oct 15, Oct 17-18 and again Oct 23; "API USA (atoms, waves, console, payment) is
  down" on Sep 30 and Oct 6; "Documents is down" Oct 12.

## Their vocabulary (mirror at most one)
- "A healthy pod does not mean a successful call. If the caller hears silence, we investigate it
  as a failure." (JD)
- "engineering decisions are audible in the customer experience" (JD)
- "Replace misleading health signals with monitoring that reflects whether customers can complete
  their tasks." (JD)
- "We evaluate demonstrated ability rather than years of experience" (JD)

## Architecture, as far as it is visible
GPU inference for TTS/STT across AWS regions behind multi-tenant APIs with concurrency controls,
billing and webhooks; Python, TypeScript, Go on Kubernetes in AWS; Redis, MongoDB-compatible
stores, Postgres, ClickHouse, RabbitMQ, Temporal (JD). Marketing site and docs on Vercel, status
on Better Stack. Regional components are named per region ("Electron USA", "API USA"). See
tech-read.md.

## What I'd do in week one
1. **A synthetic call as the health check.** Their own line: a healthy pod is not a successful
   call. A probe that places a short real call per region (TTS → STT round trip, measure time to
   first audio byte and whether the transcript comes back) and alerts on that, not on pod status.
   Same idea as DeepDoc's eval: test the thing the user experiences, stage by stage.
2. **An SLO per regional component with an error budget**, starting with Electron USA, which went
   down three times in eight days, so there is a baseline to measure against.
3. **Billing that cannot double-charge on retries**: idempotency keys on usage events written to
   an append-only ledger, the klimb.io pattern; and confirm payment is not in the same failure
   domain as the API (the Oct 6 incident lists "atoms, waves, console, payment" together).

## Which framing wins
**backend_framing.** This is an operator's seat: processes, memory, networking, concurrency,
SLOs. Lead with CodeSM (cgroup limits: 256 MB, 32 PIDs, 0.5 CPU, no network, dropped
capabilities), poiro fail-closed caps (concurrency/cost controls) and klimb.io ledger (billing), Yuvro (per-project Kubernetes runtimes).

## Risks / be straight about
- **The interview is a fundamentals interview.** The JD lists what they probe: process creation,
  signals, cgroups, PID 1, page cache, OOM, fsync, atomic rename, TCP states, TIME_WAIT, Nagle,
  delayed ACKs, UDP for real-time media, the GIL, event loops, query plans, isolation levels,
  replication lag, why percentiles can't be averaged. After the DeciOps feedback ("surface level"),
  this needs real study, not a cheat sheet. Apply now, study in parallel.
- No on-call, SLO, Terraform or production incident experience. Say so; offer the habit
  (measuring before concluding, the DeepDoc story) instead.
- Onsite Bengaluru, available from 23 Nov 2026.

## Draft answers
- **Why Smallest?** Your JD says a healthy pod does not mean a successful call. That is the
  lesson I learned the hard way on a smaller system: my RAG app returned empty answers while every
  component looked fine, and only a test that checked what the user actually got found the bug.
  I want to do that for real-time voice, where the failure is silence on a live call.
- **Why this role?** I like the seat where you own the thing after merge. The closest I have:
  fail-closed caps on paid vendor calls at poiro, a credit ledger at klimb.io that billing reads
  from, and a sandbox that caps memory, PIDs and CPU per run in CodeSM.
