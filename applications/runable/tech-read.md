# Runable — tech read (2026-10-25)

## 1. What they run, and the evidence
| Layer | What | Evidence |
|---|---|---|
| Edge | Cloudflare | `server: cloudflare` on runable.com and api.runable.com (stack-probe.json) |
| App | TypeScript, Postgres, Redis, DBOS | Senior SWE posting "Nice to have: Postgres, Redis, DBOS, Cloudflare, or GCP" |
| Durable execution | DBOS (Postgres-backed workflows) | same posting; "resumable workflows" in every eng JD |
| Storage | GCS signed URLs, prod project `runable-458805`, staging `runable-sandbox` | image URLs on runable.com/notification.md |
| Sandboxes | E2B | sub-processors page ("Sandboxed code execution") |
| Models | Anthropic, OpenAI, GCP, AWS, Azure; Vercel as AI gateway | sub-processors page |
| Integrations | Pipedream (connected-app auth + execution), Recall.ai (Meet), Sendblue (iMessage), Twilio | sub-processors page |
| Billing | Autumn + Stripe + RevenueCat; credit buckets plan / top-up / daily | sub-processors + faq.md |
| OSS tooling | Rust: `preview` (v0.2.0, 2026-10-18), Bun/TS `benchmark` | github.com/runablehq |
| Status page | Rails headers on status.runable.com | vendor's stack, not theirs (stack-probe attribution) |

## 2. The shape
Many long-running agent tasks, each needing a sandbox, a dev server and a port, metered in
credits, resumable after a crash. `preview` says the sandbox is shared: "coding agents that share
one computer across many chats". So per-machine resource arbitration (ports, process trees,
logs) is their problem, not the orchestrator's.

## 3. Problems that shape forces
- **Ports on a shared machine.** `preview` picks the name's last port, else a random free port in
  3000–9999 not in any other preview's state file, checked by a bind test (src/ports.rs). The
  state file is written right after spawn "so a run killed while waiting can still be found"
  (src/run.rs). Apps that ignore `$PORT` (Vite defaults to 5173) are handled after failure with a
  per-framework hint table (src/messages.rs), not by rewriting the command.
- **Remembered ports grow.** Ports stay reserved while any state file remembers them. Whether
  `stop` deletes state was not checked: GUESS that long-lived machines accumulate reservations.
- **Sandbox choice.** `benchmark` compared E2B, Daytona, Blaxel at 1 run each (Daytona 2.56 s
  total vs E2B 4.06 s); E2B is still the listed sub-processor. n=1 says nothing about p95.
- **Credits across resumable work.** A DBOS workflow that resumes after a crash must not
  double-charge; with three buckets and a daily reset, a task spanning midnight has an ordering
  question.

## 4. The seam Shivam has touched
- CodeSM: untrusted code in Docker (no network, read-only root, 256 MB, 32 PIDs, 0.5 CPU,
  timeout), grading queued on BullMQ off the request path. Same job as E2B, done by hand.
- Yuvro: per-project Kubernetes runtime whose runner proxies ports and streams PTYs. The
  opposite answer to `preview`'s problem (isolate instead of share).
- klimb.io credit ledger across 6+ AI features (Postgres, auditable per-feature log).

## 5. Two questions only an internals reader would ask
1. When two chats both run a Vite app that ignores `$PORT`, both land on 5173 and the second
   fails with the bind hint. Is the hint the whole fix, or is rewriting known commands with
   `--port $PORT` before spawn on the table?
2. The sandbox benchmark had Daytona creating faster than E2B on a single run, and E2B is still
   the provider. Was that decided on cold-start numbers, or does a warm pool make create time
   irrelevant for you?

## Hedged observation (safe to say)
"preview writes its state right after spawn, so a killed run can still be found and stopped.
That's the same reason I store CodeSM submissions as PENDING before queueing them."
