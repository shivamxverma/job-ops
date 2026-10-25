# Interview Resources — outreach (2026-09-29)

**Channel:** the role page form, https://www.interviewresources.app/careers/full-stack-ai-engineer-backend
(fields: Your name · Email · Message to the recruiter · consent checkbox). No resume upload, no
email apply (the HN post says his inbox is spammed). The message IS the application.

**⚠ Rewrite this in your own words before sending.** The founder says "Human-written messages
are more likely to get a response" and "No cover letter template, please." Use the draft for
structure and facts, then type it yourself. Keep the facts, change the sentences.

**Before sending, fill these two:** expected salary (their band: $30k–$90k, adjusted for
location) and your notice period at poiro.com (they target joining on 1 October).

**Optional, ten minutes, worth it:** buy the $1.49 starter pack, run one report on a company
you're actually interviewing with, and swap in one real sentence about what it got right or
wrong. Nobody else applying will have done that.

---

## Form message (draft, ~120 words + a facts line)

**Name:** Shivam Kumar Verma
**Email:** shivam.verma.dev00@gmail.com

> Hi Sayan,
>
> I read the research route. The run lives inside the request so the SSE stream stays simple.
> I hit that exact trade in Storix: moving PDF extraction onto Celery workers meant relaying
> worker events through Redis pub/sub so the user could still watch live.
>
> The rest is stuff I've built. A Postgres credit ledger across 6+ AI features at klimb.io.
> CodeSM grades submissions on BullMQ with retries. Hireflow has an LLM step that had to be
> correct, not just impressive: it rejects any rewritten skill that isn't in my real profile.
>
> Honest gap: about 8 months professional, not 4 years. Currently at poiro.com on the asset
> backend.
>
> One question I couldn't answer from the repo: what calls /api/cron/reap? vercel.json has no
> crons entry.
>
> Shivam
> github.com/shivamxverma · shivamworks.dev
>
> Remote from Bihar, India. Expected salary: {TODO}. Notice at poiro.com: {TODO}.

---

## Raw material (if you'd rather write it from scratch)

- **What you noticed about them:** the research run is inline in the POST route with
  `maxDuration = 300`, streaming SSE. They dropped Inngest on purpose because streaming is easy
  when work and stream share a request. The queue is parked at M4 "if timeouts bite", and the
  role asks you to "move long-running work onto a durable queue".
- **Your seam:** Storix (Celery + Redis pub/sub → WebSocket live status). Say it's
  Python/Celery, not their TS stack.
- **Proof with numbers:** credit ledger across 6+ AI features (klimb.io); CodeSM runs 6
  languages in Docker sandboxes on BullMQ with retries; ~1,041 Ruff findings cleared across 7
  Python trees at poiro.com (only if you want a reliability point).
- **Their phrases (use at most one):** "correct, not just impressive", "evaluations rather than
  vibes", "cancellation that actually cancels".
- **The question:** what schedules `/api/cron/reap`, given `vercel.json` has no `crons` key.
  If they say an external cron: ask whether the in-flight window is longer than 300s. If they
  say "good catch": offer the one-line `crons` PR.
- **Don't say:** that the reaper never runs, that they're on the Hobby plan, that the pipeline
  times out, or that dropping Inngest was wrong (see tech-read.md §6).

---

## Follow-up (send 2026-10-06 only if the form gets no reply)

**To:** X DM, https://x.com/sayandedotcom (his published contact on /about)

> Hey Sayan, applied for the back-end leaning role last week through the careers form. Short
> version: I've built the off-request-path + live progress pattern (Storix) and a Postgres
> credit ledger (klimb.io), and I'd genuinely like to know what schedules your reap cron.
> Happy to jump straight to the take-home if that's easier. Shivam

---

## Follow-up, redrafted 2026-10-24 (overdue since 2026-10-13)

**Before sending:** confirm the careers-form message actually went out (tracker said "blocked on
Shivam: rewrite in your own words"). If it never went, this is not a follow-up: send the form
first. The form used the retired address shivam.verma.dev00@gmail.com, so check that inbox for a
reply too. Repo re-checked 2026-10-24: last push 2026-08-31, vercel.json still has no `crons`
key, so the question still holds.

**To:** X DM, https://x.com/sayandedotcom

> Hey Sayan, I applied for the back-end leaning AI engineer role a few weeks back through the
> careers form. Short version: I've built the off-request-path pattern with live progress
> (Storix: Celery workers, Redis pub/sub out to the browser) and a Postgres credit ledger across
> 6+ AI features at klimb.io. One thing I still can't answer from the repo: what schedules
> /api/cron/reap? vercel.json has no crons entry. Happy to go straight to a take-home if the seat
> is still open.
>
> - Shivam
