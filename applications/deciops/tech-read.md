# DeciOps — tech read (2026-10-20)

## 1. What they run (and the evidence)
- Marketing site on **Vercel** (`server: Vercel`, `x-vercel-id` on deciops.ai and www). HSTS set, no CSP.
- Mail on **Google Workspace** (MX aspmx.l.google.com), SPF/DMARC configured.
- **Nothing else is public**: no app subdomain, no docs, no API reference, no status page, no GitHub
  org, no App Store listing. The product is demo-gated. Everything below section 1 is inferred from
  their own product copy, not observed. (stack-probe.json)
- Their stated integration targets: **SAP, Oracle, Microsoft Dynamics** (write-back), ERP/TMS
  signals (platform page).

## 2. The problems their shape forces
- **Write-back safety.** Agents writing transfer orders into SAP means retries, partial failures
  and duplicates are business events, not log lines. Needs idempotency keys per decision and a
  reconciliation pass against what the ERP actually recorded.
- **Confidence that means something.** "Auto-Execute above X%" only works if the confidence is
  calibrated against outcomes. That needs an offline eval set of past disruptions and a way to
  measure calibration per agent, per tenant.
- **Multi-agent conflict.** Six agents (Backorder, CTP, Re-balancing, ...) touching the same
  inventory can propose contradictory actions on the same units. Something has to lock or
  arbitrate, which they hint at with "work in concert rather than in conflict".
- **Explainability as data.** The "log of why" has to be stored structured (inputs, policy version,
  score, approver, ERP result), or it can't be audited or learned from.

## 3. The seam Shivam has already touched
- Auditable ledger replacing flags: klimb.io credit ledger across 6+ AI features.
- Stage-separated evaluation: DeepDoc's 36-case harness that separates indexing, retrieval and
  generation failures.
- Fail-closed limits: poiro.com caps of 500 vendor calls/org/day and 5,000/day globally.
- Workflow execution order and sub-workflows: poiro.com Flowboard node/group system.
No ERP, SAP or supply-chain experience. Don't imply any.

## 4. Two questions only an internals reader would ask
1. "When the Backorder agent and the Inventory Re-balancing agent both want the same 450 units at
   Hub_W2, who wins, and is that arbitration a policy rule or another model?"
2. "How do you calibrate the confidence score that gates Auto-Execute: against planner overrides in
   the review queue, or against the outcome after the ERP write-back?"

## 5. One hedged observation (safe to say out loud)
"From the site it looks like the hard part isn't the agents, it's the write-back: making an ERP
transfer order idempotent and auditable when an agent can retry. Is that where most of the
engineering is going right now?"
