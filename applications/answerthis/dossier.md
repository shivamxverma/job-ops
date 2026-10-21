# AnswerThis — dossier (2026-10-21)

Role: **Product Engineer (Full-Time, Remote, India)**, 1+ yrs, ₹20-35 LPA, US hours with daily
standups. YC: https://www.ycombinator.com/companies/answerthis/jobs/GQBe22o-product-engineer-full-time-remote-india
Found on LinkedIn (JobJunction4u repost) and confirmed by the yc-scout company-page sweep.

## Product in one paragraph
An AI research assistant: you ask a scientific question, it searches multiple academic databases
and answers with line-by-line citations; you verify and save sources to a library, analyse them,
and draft with an AI assistant. Zotero and Mendeley integrations, exports that keep citations and
equations ([YC page](https://www.ycombinator.com/companies/answerthis)). Pitch: literature reviews
from weeks to hours, "a system of record for scientists". Not used hands-on yet: sign up at
answerthis.io before any call and run one real query (20 minutes).

## People
- **Ayush Garg**, founder/CEO, San Francisco. Started publishing peer-reviewed work at 16, built
  open-source research tools (pygetpapers, an IPCC report parser). LinkedIn 2nd-degree with a
  Message button: https://www.linkedin.com/in/ayush4921/ . Posts about research method: latest
  (~3 weeks ago) on duplicate study reports, "give them a shared study ID" so the same participants
  don't count as independent evidence.
- **Ryan McCarroll**, co-founder/CMO, product and growth. https://www.linkedin.com/in/ryan-mccarroll-/
- Mutual: **Devaansh Bhandari** (1st-degree) can introduce to Ayush.
- No published email anywhere (site, llms.txt, sitemap, YC page). Never guess one.

## Momentum
YC F25, team of 6, founded 2024. Claims >$1M ARR, cash-flow positive, 200k+ researchers (YC job
page; launch post says 250k+ queries in two months). Hiring their first engineer in India.

## Their vocabulary (mirror at most one)
- "system of record for scientists" (YC job page)
- "line-by-line citations" (YC description)
- "a shared study ID" (Ayush's post) ← the one to use, it's his own words and a real problem

## Architecture, as far as it is visible
answerthis.io on nginx; app. and staging. behind Cloudflare with AWS-style object storage; a
`main_api` health endpoint at api.answerthis.io reporting a database check and a Python-style
ISO timestamp. JD: Next.js + React + Tailwind frontend, Python/FastAPI + Postgres backend, RAG
with a vector DB. Full read: `tech-read.md`.

## What I'd do in week one
1. Study-level dedup on retrieved papers: group results that share a trial registration or DOI
   family under one study ID before they reach the answer, so one trial doesn't read as three
   independent citations (Ayush's own post; Hireflow-style fingerprinting).
2. A small retrieval eval set for citation quality (does each cited line support the claim),
   replayed on every prompt or retrieval change, like DeepDoc's 36-case harness.

## Which framing wins
**ai_framing + fullstack.** Lead with DeepDoc (RAG on Pinecone, query rewriting, dedup + token
budget, 36-case eval harness), then the poiro asset service (FastAPI backend + shared Next.js
frontend for 3 apps), then klimb.io (production AI backend, hundreds of users).

## Gaps to be honest about
- Tailwind: not in facts.yaml. Don't claim.
- Citation networks / academic tooling: none. DeepDoc is PDF Q&A, the nearest.
- "Strong eye for UI/UX": he built most of poiro's shared Next.js frontend (facts.yaml); no design
  portfolio. Don't oversell.

## Draft answers
- **Why AnswerThis?** Your post about giving duplicate reports a shared study ID is the kind of
  problem I like: the answer looks right until you notice three citations are one trial. I've
  dealt with the small version of it twice, deduplicating job listings across four sources in
  Hireflow and dropping duplicate chunks before they reach the prompt in DeepDoc.
- **Why this role?** It's the full stack I work in now: FastAPI and Postgres behind Next.js, plus
  retrieval. At poiro.com I designed the backend and built most of the shared Next.js frontend for
  an asset service used by 3 apps, and DeepDoc is a RAG app with a 36-case eval harness.
- **US hours:** yes, 4+ hours overlap, IST evenings and nights are fine (facts.yaml).
- **Notice:** 0 days.
