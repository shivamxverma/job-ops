# Cnvrted: Backend Engineering Intern, Bangalore hybrid (2026-10-23, C lane)

Apply: https://docs.google.com/forms/d/e/1FAIpQLSfr_88vYF7bUefW_KsMevV5XOT6G9aq93-32j6WALV69LAUvg/viewform (needs your Google sign-in; I couldn't read the questions)
Resume: applications/cnvrted/resume.pdf (backend framing)
Internship, not full-time. Poster: Dhruv Pradeep (founding team). 500+ applicants in round 1.

If it asks why / about a project:
> I'm doing backend work at poiro.com right now (FastAPI, MongoDB, Redis, Celery) and I'd like a backend seat at an early team where I own what I ship. The project I'd point to is Storix: FastAPI takes the upload, Celery workers do the extraction off the request path, and Redis pub/sub streams each stage's status back to the client. https://github.com/shivamxverma/Storix

## Standard answers (paste as asked)
- Name: Shivam Kumar Verma | Email: shivam0xverma@gmail.com | Phone: +91 91356 68614
- LinkedIn: https://www.linkedin.com/in/shivamv99/ | GitHub: https://github.com/shivamxverma | Portfolio: https://www.shivamworks.dev/
- Current role / employer: Fullstack Developer Intern, poiro.com
- Current pay: Rs 35,000 per month internship stipend
- Expected CTC (full-time): 10 to 18 LPA
- Notice period: none. Internship ends 22 November, available from 23 November.
- Location: open to fully remote, or onsite/hybrid in Bangalore.
- Graduation: B.Tech CSE, IIIT Nagpur, May 2026

## Form answers (2026-10-24)
Cnvrted = signal-based B2B lead-gen (funding, job posts, launches); agent "Orka" turns a brief into a research workflow + shortlist. Source: cnvrted.com homepage.

1. Stuck job: worker died/hung with job still "running", agent loop or slow site with no timeout, or per-customer rate limit/concurrency cap. Check last log + heartbeat, requeue; fix = heartbeat + stale-job recovery, per-step timeout and step limit.
2. AI on the field: both; faster shipping vs code you don't understand and quiet failures; DeepDoc 36-case harness found the ingestion bug.
3. What it does + feature: watchlist alerting on a saved account's new signal.
4. Paid API timeout: pending record + idempotency key, retry with same key, or check provider status first; reconcile job; poiro.com hard caps.
5. Improve: show signal date/source, rank fresh signals higher.
6. 10x slowdown in 3 days: measure first; queue + workers + per-customer cap; cache repeated company lookups; per-API rate limiter.
7. First month: job reliability (heartbeat/timeout, idempotent paid calls, per-customer limits) + open backend tickets.
8. Outside work: Shivam's own answer (only CP is in facts).
9. https://code-sm.vercel.app
10. https://www.linkedin.com/in/shivamv99/
(Full paste text was given in chat 2026-10-24.)
