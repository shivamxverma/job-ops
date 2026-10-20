# Interview Resources — dossier (2026-09-29)

## Product in one paragraph (as a user, if possible)
Paste a company name (optionally a JD, interviewers, rounds) and an agent researches the public
web with Tavily, then Gemini synthesizes interview questions grouped by round. Each question
carries a confidence level and links to its sources; anything inferred from funding stage or
comparable companies ships tagged *Inferred* and capped below High. Below three substantial
sources it broadens instead of shipping a thin report. Priced in one-off credit packs ($1.49 /
$6.49 / $12.49), a typical run ~46 credits (under $0.50), hard-capped at 260. Shipped publicly
July 2026. (Sources: /about, /pricing, /changelog, scraped 2026-09-29.) Not used hands-on yet:
**GUESS-free option before sending: Shivam runs one $1.49 report on a company he's interviewing
with and mentions one real thing about it.**

## People (founder/HM + contact paths + common ground)
- **Sayan De**, solo founder ("one person, not a company with a content team", /about). Built it
  after losing evenings to Glassdoor/Reddit threads. X: https://x.com/sayandedotcom · GitHub:
  https://github.com/sayandedotcom (236 commits in the last 90 days, TypeScript 87%).
- Also builds **refhired.com** (job referrals, pushed 2026-09-14) and an AI Slack bot on
  Cloudflare Workers + Durable Objects (pushed 2026-09-28). He lives in the job-search domain.
- **Common ground (real):** Shivam built Hireflow, a job-application engine (multi-source listing
  ingestion, LLM resume tailoring with an anti-hallucination validator). Same domain, same
  "don't let the model invent things" instinct as the Inferred/evidence rule.
- Apply channel: the role page form (name, email, "Message to the recruiter"). The HN post adds:
  include CV, GitHub, one proud project with links, expected salary and location, and "Human-
  written messages are more likely to get a response." hello@interviewresources.app exists but
  the HN post says "No Email; my email is spammed", so use the form.
- ⚠ The previous owner of this pipeline (Harsh Kasana) applied here on 2026-09-04. Irrelevant to
  Shivam's candidacy, but Shivam's message must be his own and must not echo that one.

## Momentum (stage, raise, hiring signals)
- $250k seed, profitable, 3k+ paid users (HN post 49534032, 2026-09-02).
- Hiring 2 Full Stack AI Engineers (front-end / back-end leaning) + 1 GTM Lead. Posted on HN in
  August and again in September: the seats are still open. Salary $30k–$90k "flexible based on
  experience, impact, and per capita". Target joining date 1 October.
- Process: 30-min founder call → paid take-home on the real stack → 90-min systems conversation
  about the pipeline → scope/money.

## Their vocabulary (3–5 exact phrases, with source links)
- "cancellation that actually cancels" — backend role page
- "Improve output quality with evaluations rather than vibes" — backend role page
- "a pipeline change that nobody can see in the report is not finished" — backend role page
- "shows its sources instead of asking you to trust it" — /about
- "Write us something real... beats three pages of adjectives" — backend role page

## Architecture, as far as it is visible
Next.js 16 on Vercel (`iad1`), Drizzle + Postgres, Tavily + Gemini. The research run executes
inline in the route handler and streams SSE, capped at 300s; a queue was dropped on purpose and
parked at M4. Credits use a reserve/settle ledger with row locks and unique-ref idempotency, and a
reaper route sweeps stuck runs, but nothing visible schedules it. Full read: `tech-read.md`.

## What I'd do in week one (2–3 specific initiatives)
1. **Confirm the reaper is scheduled** (add the `crons` entry to `vercel.json` if it isn't), so a
   run killed at 300s never strands a customer's reserved credits. One-line fix, directly on the
   money path.
2. **Measure before migrating:** log per-run duration by effort level into `researches` and chart
   p50/p99, which answers PRD §14's second open question with data before anyone builds a queue.
3. **If p99 is near 300s, move the run to a queue while keeping the live progress stream** (worker
   publishes stage events, route subscribes and forwards over SSE), the same pattern he built in
   Storix.

## Which Shivam framing wins here
**backend-infra**, with ai_framing as the close second. The role's centre of gravity is the queue,
the ledger, Postgres under concurrent writes and LLM correctness:
- Storix: long-running work moved off the request path, progress streamed live (the exact M4 problem).
- klimb.io: PostgreSQL credit ledger across 6+ AI features (their credits ledger).
- CodeSM: persist-then-grade on BullMQ + Redis with retries (durable queue, idempotent retries).
- Hireflow: validator that rejects rewritten skills not in the real profile ("correct, not just
  impressive").
- poiro.com: SHA-256 dedup guaranteed by a DB uniqueness constraint (same instinct as their
  unique-`paymentRef` idempotency).

**The honest gap, to name in the message, not hide:** the role asks for 4+ years; Shivam has
about 8 months professional (klimb.io internship + poiro.com since Jul 2026). Their own page says
to apply anyway ("We would rather read a good application to the wrong opening than miss you
entirely"), and the HN post says curiosity matters more than the listed extras.

## Draft answers
The only field is **"Message to the recruiter"** ("No cover letter template, please. Tell us what
you have built and why this role."), and the founder asks for human-written messages. So
`outreach.md` holds a draft for Shivam to **rewrite in his own words**, not to paste.

- **Why Interview Resources?** It's the rule that nothing gets presented as evidence unless it
  is. He built the same guard into Hireflow's resume tailoring, and he reads the Inferred tag as
  the product rather than a feature.
- **Why this role?** Their open problems (moving a multi-minute run off the request path without
  losing the progress stream, a credits ledger, and correctness measured with evals) are the three
  things he has built, in Storix, at klimb.io and in Hireflow.
- **Expected salary / location:** location Warisaliganj, Bihar, India (remote). Salary is
  TODO(shivam): the band is $30k–$90k, adjusted for location, so pick a number before sending.
- **Joining date:** they target 1 October; Shivam is employed at poiro.com, and his notice period
  is TODO(shivam). Say it plainly.
