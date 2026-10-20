# VLM Run — outreach (2026-09-29, C lane, DRAFT ONLY, not sent)

To: hiring@vlm.run (published in their HN Who is hiring post, item 49541233)
Subject: Founding Infrastructure Engineer (HN): Shivam Verma
Attach: applications/vlm-run/resume.pdf (base resume, not scored: the JD is a four-sentence HN post)

> Hi VLM Run team,
>
> Saw the Founding Infrastructure Engineer post on HN. Serving open-weight VLMs across a mixed GPU fleet looks like it turns into a placement problem fast: which model stays warm on which card, and what a cold load costs the request that triggers it.
>
> I haven't run GPUs. The closest I've built is CodeSM, a sandboxed runner for 6 languages in Docker, where cold starts were the cost, so I reuse persistent containers instead of starting one per job. And Yuvro, a FastAPI orchestrator that provisions a Kubernetes deployment, service and ingress per workspace.
>
> GitHub: https://github.com/shivamxverma (CodeSM, Yuvro). Open to a quick chat if the seat is still open?
>
> - Shivam

Checks: 112 words, 0 em dashes, 0 banned words, one number (6 languages) + links. The GPU
placement line is an inference about their problem, phrased as "looks like", not a claim about
their system.

## Gmail draft (2026-09-29)
Draft id r-2396472312635019385, to hiring@vlm.run. Not sent. Attach applications/vlm-run/resume.pdf before sending.

## Draft v2 (2026-09-29, current)
Rewritten at Shivam's request: sharper opening, one project with its repo link, GitHub in the signature, no resume mention. The Gmail draft is the source of truth for the exact text.
