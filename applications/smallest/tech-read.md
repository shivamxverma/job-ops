# Smallest — tech read (2026-10-23)

## 1. What they run (and the evidence)
- **Stated in the JD:** Python, TypeScript, Go on Kubernetes in AWS; Redis, MongoDB-compatible
  stores, Postgres, ClickHouse, RabbitMQ, Temporal; GPU inference for TTS/STT across AWS regions;
  multi-tenant APIs, concurrency controls, billing, webhooks.
- **Observed:** docs.smallest.ai on Vercel (the docs vendor's stack, not theirs); status page on
  Better Stack with components named per region ("Electron USA", "API USA (atoms, waves, console,
  payment)", "Documents"); `app.smallest.ai/api/health` answers; Google Workspace mail; HSTS, no
  CSP. GitHub `smallest-inc`: Python/Node/Java SDKs, an MCP server (TS), a Go CLI, a self-host
  repo, `Full-Duplex-Bench`. (stack-probe.json)
- **Not visible:** their internal service graph, which cloud regions, how inference is scheduled.

## 2. The problems their shape forces
- **Health that lies.** A GPU pod can be Ready while the model is stuck, the queue is full or the
  first audio byte takes 2 s. Only an end-to-end synthetic call measures what the caller hears.
- **Tail latency, not averages.** Voice quality is set by p99 time to first audio. Percentiles per
  region/pod cannot be averaged into a global number; you need histograms merged before the
  quantile.
- **Concurrency limits per tenant on scarce GPUs.** Admission control and backpressure, or one
  tenant's batch job starves everyone's live calls.
- **Billing under retries.** Usage events from at-least-once queues (RabbitMQ) need idempotency
  keys or customers get double-charged. Payment sharing a failure domain with the API (Oct 6
  incident groups them) is worth asking about.
- **Long-running call workflows** (Temporal) that must survive a pod dying mid-call.
- **Incident pattern:** Electron USA down 3 times in 8 days (Oct 15, 17-18, 23). Repeat incidents
  on one component usually mean the same cause without a fix, which is exactly the JD's
  "turn recurring incidents into better controls".

## 3. The seam Shivam has already touched
- Resource limits per untrusted process: CodeSM runs code with 256 MB memory, 32 PIDs, 0.5 CPU,
  no network, read-only root, capabilities dropped, a timeout. That is cgroups and namespaces in
  practice.
- Fail-closed concurrency/cost limits: poiro caps of 500 vendor calls/org/day, 5,000 global,
  counted on cache misses only.
- Metering and billing: klimb.io PostgreSQL credit ledger across 6+ AI features.
- Measuring before concluding: DeepDoc eval harness separating indexing, retrieval, generation.
- **Not touched:** on-call, SLOs, Terraform, GPU inference, telephony/SIP, packet captures.

## 4. Two questions only an internals reader would ask
1. "Electron USA has been down three times since Oct 15. Are those the same contributing cause,
   and is the health check that pages you based on the pod or on a synthetic call?"
2. "For per-tenant concurrency on GPU inference, do you reject at admission when a tenant is at its
   limit, or queue, and how do you keep a queued live call from turning into silence on the line?"

## 5. One hedged observation (safe to say out loud)
"From the status page it looks like payment sits in the same incident component as the API in
the US region. Is billing on the request path, or does it read usage events asynchronously?"
