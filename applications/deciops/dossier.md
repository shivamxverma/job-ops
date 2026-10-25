# DeciOps — dossier (2026-10-20)

Lead: founder post on LinkedIn, 2026-10-20 ~23:10 IST. Roles: AI / AI Platform Engineer (2-7 yrs),
Decision Product Engineer (2-6 yrs), Founding/Platform (3-8), ERP/Manufacturing (3-10). Bengaluru,
full-time, immediate joiners preferred. Apply: DM the founder or email jobs@deciops.ai with the
role + "2-3 lines about what you've built that you're most proud of".

## Product in one paragraph
DeciOps is a "Decision Operating System" for supply chains: it sits above ERP, planning (APS),
control towers and decision-intelligence tools, and closes the last gap, from *recommending* an
action to *executing* it. Loop is **Sense → Evaluate → Decide → Execute → Learn**: monitor signals
across ERP/TMS/external data, simulate trade-offs with specialised agents (Backorder, CTP,
Inventory Re-balancing, Supply Planning, Order Prioritization, Order Delays RCA), pick an action
against business policy and a confidence score, then **write back to SAP, Oracle or Microsoft
Dynamics**. Planners set "Auto-Execute" rules for high-confidence decisions and "Review Required"
for outliers; every action carries a log of "why". No public demo or self-serve product, enterprise
"Request Demo" only, so this is a description from their site, not from use.
Sources: https://www.deciops.ai/platform , https://www.deciops.ai/how-it-works , https://www.deciops.ai/about

## People
- **Laxmipat Malu**, Founder & CEO, Greater Bengaluru. 2nd° to Shivam, mutual: **Manish Kumar
  Jaiswal** (not in inbox/network.md, so relationship strength unknown). 2,539 followers.
  Profile shows a **Message** button (Premium/open profile), so a direct DM may be possible
  without an invite. https://www.linkedin.com/in/laxmipatmalu/
- Background (third-party profile, humantic.ai, not first-party, treat as likely): ~14 years in
  data analytics delivery; Head of Delivery, Data Analytics at **Sigmoid**; before that Happiest
  Minds, Virtusa, Accenture; MIT Sloan exec program. Reads as an enterprise data/analytics
  delivery leader turned founder, which fits a product sold to supply-chain enterprises.
- Legal entity: **Inferonix Systems Pvt Ltd** (deciops.ai/terms).
- Common ground with Shivam: Bengaluru; nothing else verified. No GitHub org found.

## Momentum
- Domain registered 2026-03-30. No funding found in search (GUESS: pre-seed or bootstrapped).
- First public hiring post, across 4 role families at once = building the founding team now.
- Tiny surface: marketing site on Vercel, Google Workspace mail, no app, no docs, no status page.

## Their vocabulary (mirror at most one)
- "continuous operational decision execution" (about)
- "Autonomous where possible. Human where necessary." (platform)
- "Insight without action is just overhead." (about, manifesto)
- "We prefer working systems over polished presentations" (about, culture) and, in the post,
  "reliable engineering over demos that merely work"
- "Decision Terminal" / confidence-gated "Auto-Execute" vs "Review Required" (platform)

## Architecture, as far as it is visible
Public surface is a static marketing site on Vercel; the product itself is not reachable. What the
product description forces, regardless of stack: (1) an agent layer that proposes actions with a
confidence score, (2) a policy/threshold gate deciding auto-execute vs human review, (3) an
idempotent, audited write-back into ERPs that were not designed to be written by an agent, and
(4) outcome capture feeding back into the decision logic. See tech-read.md.

## What I'd do in week one
1. **An eval harness for the agents before they touch an ERP.** Replay a fixed set of historical
   disruptions (stock-out at a node, late supplier) through the Backorder/CTP agents and score the
   decision + confidence against what a planner actually did, separating "wrong signal", "wrong
   option set" and "wrong pick" failures. Same shape as DeepDoc's 36-case harness that separates
   indexing, retrieval and generation failures.
2. **An append-only decision ledger** behind the "full log of why": every decision, its inputs,
   policy version, confidence, who/what approved it, and the ERP write-back result, so a write-back
   that fails or is retried is visible and never double-applied. Same pattern as the klimb.io
   per-feature credit ledger that replaced on/off flags with an auditable log.
3. **Fail-closed limits on autonomous execution** (per-tenant caps on auto-executed actions per
   day), the same mechanism as poiro.com's 500/org/day and 5,000/day global caps on vendor calls.

## Which framing wins
**ai_framing**, with backend-infra proof. They explicitly want LLMs, agents, RAG, orchestration and
"reliable engineering over demos". Lead with DeepDoc's eval harness + klimb.io AI interview backend
+ credit ledger; Flowboard's execution-order/sub-workflow node system for orchestration.
Role to name: **AI / AI Platform Engineer**. Fallback: Decision Product Engineer.

## Risks / gaps to be straight about
- Years: they ask 2+; Shivam has ~1 year of internships (klimb.io Nov 2025-May 2026, poiro.com
  Jul 2026-now). The post's "learns fast over 100% of a checklist" is the opening; don't hide it.
- No supply-chain / ERP / SAP experience. Don't claim any.

## Draft answers
- **Why DeciOps?** Most AI products I've seen stop at a recommendation. DeciOps writes the decision
  back into SAP or Oracle, which means the hard part is not the model, it's knowing when the agent
  is allowed to act and proving afterwards why it did. That's the part I like building: at klimb.io
  I replaced feature flags with an auditable per-feature credit ledger, and on DeepDoc I built a
  36-case eval harness that told me exactly which stage failed.
- **Why this role?** The AI Platform seat is where an agent's output turns into a governed action:
  evals, confidence thresholds, the audit trail and the write-back. I've built each of those
  pieces at small scale and want to build them where a wrong action costs real money.
- **What have you built that you're most proud of (2-3 lines)?** see inbox/replies.md DeciOps email.

## Confirmed on the call (2026-10-23, 1st round with Laxmipat)
- Format: ~30 min, founder alone. Intro → current company + its founders + current comp and
  conversion → his work → "what is an AI agent, where would you use it" → "what is LangChain"
  → "types of databases, Postgres vs MongoDB, how joins work" → expected comp.
- Comp: founder said his own research puts this seat at 6-8 LPA max, and capped Shivam at 5 LPA
  after the technical answers. Treat 6-8 LPA as their band for a fresher AI Platform Engineer.
- He tests definitions, not system design: LangChain and DB types are fair game in round 1.
