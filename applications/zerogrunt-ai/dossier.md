# ZeroGrunt AI — dossier (2026-10-21)

Role: **Founding Engineer (first engineer)**, Bengaluru (k9n listing; CEO is in Bengaluru, CTO in
Dubai), Competitive + Equity. No years bar stated.
Sources: Saurav Shah's and Ravi Singla's own LinkedIn posts (2026-10-20). The TalentXminds repost
that surfaced it links to a WhatsApp group, not a JD.

## Product
AI agents for finance back-offices: they read invoices over email (handwritten and multi-page),
answer vendor queries, update ERPs, learn from past entries and escalate exceptions, with a human
still in charge ([zerogrunt.ai](https://zerogrunt.ai)). "BPO-in-a-box". SOC 2 Type II, ISO 27001.
Bootstrapped, paying enterprise customers (both founders' posts).

## People
- **Ravi Singla**, Founder & CEO, Bengaluru. 14 years in product management. 2nd-degree. Asks for
  **email only, "No LinkedIn DMs, please"**: ravi@zerogrunt.ai.
- **Saurav Shah**, Co-founder & CTO, Dubai. Built Rippling's India engineering team from scratch
  (Ravi's post). Hiring post: "DM me or email saurav@zerogrunt.ai with something you're proud of
  building." The engineer "builds directly with me".
- **Vraj Talati**, Founding PM, **1st-degree** (450 mutuals). Warm path, not needed for the
  application since both founders publish an email.

## Momentum
Founding PM hired ~3 months ago via LinkedIn; first engineer now. Customers live.

## Their vocabulary (mirror at most one)
- Saurav's four open problems, verbatim: (1) "How do you give an agent useful business context as
  that context keeps changing?" (2) "How do you recover when one step fails halfway through a
  workflow?" (3) "How do you turn a person's correction into something the agent gets right next
  time?" (4) "How do you measure whether it's actually getting better?"
- "agents that can own entire business workflows"

## Architecture, as far as it is visible
zerogrunt.ai and www behind Cloudflare; app. on AWS CloudFront; api. answers with Envoy
(`x-envoy-upstream-service-time`) and `x-request-id` tracing; CSP embeds Microsoft's Office
document viewer (viewing invoices/attachments). Google Workspace mail. See `tech-read.md`.

## What I'd do in week one
1. An eval set of real (anonymised) invoices with expected ERP entries, replayed on every prompt
   or model change, scored per field, which is Saurav's question 4 and the DeepDoc harness pattern.
2. Make each workflow step's side effect idempotent (an operation key per ERP write) so a failed
   run can retry from the top without double-posting, which is question 2.

## Which framing wins
**ai_framing.** Lead with the DeepDoc eval harness (his Q4), then the poiro workflow builder (DAG
of steps, sub-workflows), the Hireflow validator (guardrail against invented output), klimb.io's
production AI backend and the usage ledger.

## Draft answer: "something you're proud of building"
The DeepDoc eval harness. Email text in `outreach.md`.
