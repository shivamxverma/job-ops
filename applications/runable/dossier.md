# Runable — dossier (2026-10-25)

Role: Software Engineer Intern (New Grad), Bengaluru, on-site, full-time internship (+PPO per
aggregators). Posting: https://runable.com/careers/software-engineer-intern-new-grad
Apply: email team@runable.com with GitHub, CP/OSS profile, and one thing built + what he owned.
"A short note beats a long resume." (posting)

## Product in one paragraph
A general AI agent for small businesses: from one prompt it builds and deploys websites and
mobile apps, slides, docs, reports, carousels, videos, and (since the Aug 2026 raise) runs growth
work: paid campaigns, social posting, cold email, SEO/AEO, support. Side products: Claw (the
agent inside Discord/Telegram/Slack/iMessage), Meet (notetaker), Flow (dictation). Credit-metered:
1,500 free daily credits capped at 15,000/month, plan credits, top-ups that never expire, and
auto-refill; spend order is plan, then top-up, then daily (runable.com/faq.md). Claims SOTA on
GAIA, DRACO, BrowseComp, SlidesBench for "Runable 2.0" (runable.com/notification.md). Not used
hands-on yet: GUESS on the feel; Shivam can try the free tier before the founder call.

## People
- **Saksham Sarda**, co-founder & CTO, leads engineering. Ex early engineer at Unlock Labs (NY).
  Runs the 15-min intro call per the senior posting. (runable.com/about, careers/senior-software-engineer.md)
- **Umesh Kumar**, co-founder & CEO, IIT Roorkee, sold SkoolStream, ex-Salesforce.
  LinkedIn: linkedin.com/in/umesh-k-iitr (2nd°, 19 mutuals).
- **Ashutosh Singh**, Engineering @ Runable, **IIIT Nagpur alum**, 2nd°, 200+ mutuals.
  linkedin.com/in/4shutosh. Invite + ask drafted in inbox/referrals.md (Run 2026-10-25).
- Ankit Kumar, SDE, IIIT Ranchi '25, LeetCode Knight: proof they hire recent grads with CP records.
- GitHub `cloudycotton`: top committer on runablehq last 90d (8 commits). Identity not checked.

## Momentum
- Series A $21M, 2026-08-26, co-led by Susquehanna VC and Nexus, Together Fund + Array VC
  following; $65M post (TechCrunch). Founded April 2025.
- $2M ARR three weeks after turning on monetization; 1.5M users; team of 15 at the raise
  (runable.com/blogs/runable-grow). LinkedIn now shows 11-50, 14 in engineering.
- Open roles: Staff SWE, Senior SWE, Growth Engineer (GTM), Growth Eng Intern, SWE Intern (New
  Grad), all Bangalore on-site. Raise money explicitly earmarked for engineering hiring.

## Their vocabulary
- "Titles are useful; shipped work is more useful." (careers posting)
- "this is not a collectibles quest" (on the CP/OSS/medal requirement, careers posting)
- "Boring technology is welcome when it works." (careers posting)
- "Made for coding agents that share one computer across many chats" (runablehq/preview README)
- "the operating team for small businesses" (Series A blog)

## Architecture, as far as it is visible
TypeScript + Postgres + Redis + DBOS (durable workflows on Postgres) per the senior posting's
nice-to-haves; GCP storage with signed URLs (project `runable-458805`, staging project
`runable-sandbox`), Cloudflare in front, E2B for sandboxed code execution, Vercel AI gateway,
Pipedream for connected apps, Autumn + Stripe for credits/billing (sub-processors page).
Open-source tooling in Rust (`preview`). Full read: tech-read.md.

## What I'd do in week one
1. Make `preview` handle the app that ignores `$PORT`: today it prints a framework hint
   (`vite --port $PORT`) after the fact. For the known table entries, offer the rewritten
   command in the JSON line itself so the agent can retry without parsing prose.
2. Turn the sandbox benchmark (`runablehq/benchmark`, 1 run per provider) into N runs with
   p50/p95 and cold vs warm create, so the provider choice rests on a distribution.
3. Credits: property tests for the three-bucket spend order (plan, top-up, daily reset with a
   monthly cap) on the boundaries: a task that spans the daily reset, a top-up landing mid-task.

## Which framing wins
**backend_framing**, led by CodeSM (sandboxed execution, queue off the request path) with
Yuvro as the second artifact (per-workspace runtimes with port proxying = the `preview` problem
solved the container way). The klimb credit ledger is the third angle if credits come up.

## Draft answers
- **Why Runable?** I read `preview` before writing this. It solves the problem I hit building
  Yuvro from the other side: I gave every project its own container so ports never collide,
  you let many chats share one machine and remember who holds which port. The intern seat
  works on the agent runtime and sandboxed execution, which is the part of CodeSM I enjoyed most.
- **What did you own?** CodeSM end to end: API, BullMQ workers, Docker sandbox limits, S3 test
  loading, schema migration from MongoDB to Postgres. Used for testing only, no real users
  (facts.yaml never_claim).
