# Interview Resources — tech read (2026-09-29)

Cluster: `profile/domains/llm-in-production.md`. Evidence: public repo
github.com/sayandedotcom/interviewresources (read 2026-09-29), `stack-probe.json`, the careers page.

## 1. The system, as far as it is visible
- Next.js 16 on Vercel, compute pinned to `iad1`, Drizzle + Postgres, better-auth. [fact: repo
  README, `vercel.json` `"regions": ["iad1"]`, `server: Vercel` header]
- The whole research run (Tavily search + extract, Gemini plan/compress/synthesize) executes
  **inline in the POST route handler** and streams progress back as SSE, `maxDuration = 300`.
  [fact: `app/api/research/route.ts`, comment: "runs inline in the route for now"]
- Inngest was planned and **dropped on purpose**: "progress streaming is trivial when the work
  and the stream live in the same request". A queue is milestone M4, "if timeouts bite". [fact:
  PRD.md §8/§13]
- Credits are a reserve → settle/release ledger: `select … for update` on the user row, and a
  unique `paymentRef` (`reservation:{ref}`, `reservation-settlement:{ref}`) with
  `onConflictDoNothing` as the idempotency key. One running run per user is a partial unique
  index. [fact: `lib/credits.ts`, `lib/db/schema.ts`]
- Runs abandoned by a dead handler are swept by `/api/cron/reap` (stuck runs + stale
  reservations). The route says it is "invoked by Vercel Cron (see vercel.json)", but
  `vercel.json` has **no `crons` key** and CI has no schedule. [fact that the key is absent;
  inference that the scheduler lives somewhere else or is missing]
- Payments: Dodo webhooks, idempotent on unique provider payment/refund ids. [fact: webhook route]

## 2. What they are worried about right now
M3, the quality loop, is "in progress", and PRD §14's first open question is "Accuracy is
unmeasured... Highest priority." The second is whether the 300s ceiling actually bites, which
needs p99 duration data nobody has yet. The role is written for both: evals "rather than
vibes", and "move long-running work onto a durable queue with retries, idempotency, and
cancellation that actually cancels".

## 3. The problems this shape forces
- **Partial failure mid-run (cluster #4).** The run lives inside one HTTP request. If the
  function is killed at 300s, the `catch` never runs, so the row stays `running` and the credit
  reservation stays held until the reaper fires. The ledger is built well for this; the
  weak link is whatever schedules the reaper.
- **Sync vs queue (the cluster's trade-off table).** The reason they stayed inline is the SSE
  progress stream. Moving to a queue means rebuilding progress as worker → broker → client,
  which is exactly the cost they chose not to pay.
- **Non-determinism vs tests (cluster #1).** Accuracy is unmeasured, and grading a question as
  evidence-backed vs Inferred is an LLM call whose correctness nobody is scoring yet.

## 4. The seam Shivam has already touched
**Storix**: he moved heavy PDF extraction off the request path onto Celery workers and kept the
user watching live by relaying worker events through Redis pub/sub to a WebSocket. That is
the exact problem that kept Interview Resources inline: how to keep the progress stream once the
work leaves the request. **Adjacent, not the same**: his was Python/Celery/WebSockets, theirs
would be TypeScript, a queue like Inngest or BullMQ, and SSE. Backup seam: CodeSM persists a
submission before grading on BullMQ with retries, and he built a PostgreSQL credit ledger across
6+ AI features at klimb.io.

## 5. Two questions only an internals reader would ask
1. **"What actually calls `/api/cron/reap`? `vercel.json` has no `crons` entry, so is it an
   external scheduler, or does a run killed at the 300s ceiling keep its reservation held until
   someone notices?"**
   - If they say "an external cron (cron-job.org / GitHub Actions)": ask how often it runs and
     whether `RUN_INFLIGHT_WINDOW_MS` is set longer than 300s, so a live run is never reaped.
   - If they say "huh, good catch": offer to add the `crons` entry as a first PR. That's the
     whole fix.
2. **"When the run moves off the request path, do you want progress to keep flowing over the
   same SSE connection (worker publishes, route subscribes) or switch the client to polling the
   `researches` row?"**
   - If pub/sub: that's his Storix pattern. Ask which broker they'd use on Vercel (likely a
     hosted Redis) and how a reconnecting client catches up on missed events.
   - If polling: ask how often, and whether the report page needs partial results mid-run.
   - One concept to have ready: pub/sub means the worker publishes events to a channel, and the
     web process subscribed to it forwards them to the browser. He's built this.

## 6. Do not say
- "Your reaper never runs." Unknown: it may be scheduled outside the repo. Ask, don't assert.
- "You're on the Vercel Hobby plan." Only a code comment mentions the Hobby ceiling.
- "Your pipeline times out." PRD says the ceiling is unmeasured; nobody knows yet.
- "Inngest was the wrong call to drop." They dropped it deliberately and said why.
- Anything about the build running migrations (`buildCommand: pnpm db:migrate:run && pnpm build`)
  against production from preview deploys. Env setup isn't visible; don't raise it cold.
- Any number of theirs except ones they publish: ~46 credits / under $0.50 a run, 260-credit
  cap, 3k+ paid users and a $250k seed (HN post).
