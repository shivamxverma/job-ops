# Cardboard — Backend Engineer application (2026-10-21)

Form: https://jobs.ashbyhq.com/cardboard/71a37ec3-d1df-4769-b018-a1c8f986bc1f/application
Bengaluru, **onsite**, full-time. YC W26, team of 8. Founders: Saksham Aggarwal (CEO, BITS Pilani,
ex-Iterate AI, published at ACL), Ishan Sharma (CTO, 4.5 years at HackerRank leading 0→1
products). X: @sxmawl, @ishandeveloper.

Why it's an A: their three "what you'll own" lines map onto real work.
- "Credits and usage, charged fairly and never twice" → klimb.io credit ledger, 6+ AI features.
- "Long-running jobs that recover on their own and report honest progress" → Storix (Celery +
  Redis pub/sub live stages) and CodeSM (BullMQ workers off the request path).
- "you care about cost as much as speed" → poiro.com fail-closed caps, 500/org/day, 5,000/day.
Gap: FFmpeg / codecs (their "bonus"). Never claim it.

## Field values (paste-ready, no em dashes)

- **Name:** Shivam Kumar Verma
- **Email:** shivam0xverma@gmail.com
- **LinkedIn:** https://www.linkedin.com/in/shivamv99/
- **GitHub:** https://github.com/shivamxverma
- **Your personal website:** https://www.shivamworks.dev/
- **Resume:** applications/cardboard/resume.pdf

- **Years of Experience and Graduation Year:**
  > 10 months YOE, all internships at klimb.io and poiro.com (2026 grad)
  (Matches the form's own hint, "Example: 3 YOE (2023 grad)".)

- **One product or piece of software you think is exceptionally well built, and one sentence on why?**
  ⚠ This is your opinion, so confirm it or swap it. Drafted from a tool you've built on twice (CodeSM, Hireflow):
  > BullMQ. It treats a crashed worker as the normal case, detecting stalled jobs and retrying them with backoff, so recovery is the library's default instead of something every app has to reinvent.

  Alternative if you'd rather pick a product (also your call): Linear, Figma, or anything you
  genuinely use daily. One true sentence beats a clever one.

- **Something you shipped end to end that you're proud of?** (short text field)
  > CodeSM (code-sm.vercel.app): a code execution engine where submissions queue on BullMQ and run untrusted code for 6 languages in locked-down Docker containers, off the request path.

- **Optional video:** skip (video pipeline is disabled until you have your own footage).

## Before submitting
- Onsite Bengaluru: fits your rule (Bangalore onsite OK).
- No salary or notice questions on this form. If they ask later: 10-18 LPA expectation,
  immediate start (facts.yaml knockout_answers).
