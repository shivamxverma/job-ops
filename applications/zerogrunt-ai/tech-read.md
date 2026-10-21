# ZeroGrunt AI — tech read (2026-10-21)

Cluster note: `profile/domains/llm-in-production.md` (problems 1, 4, 5, 7), plus the ERP write-back
half of `profile/domains/data-integration-elt.md` (idempotent loads).

## 1. The system, as far as it is visible
- [fact] Edge: Cloudflare on zerogrunt.ai; AWS CloudFront on app.; api. answers through Envoy with
  `x-request-id` tracing. stack-probe.
- [inference] Envoy + request IDs on a bootstrapped team's API points at a managed service mesh or
  gateway (often Istio on Kubernetes, or AWS App Mesh). Don't state which.
- [fact] CSP embeds `view.officeapps.live.com`: Office/Excel attachments render in the app.
- [fact] Agents take invoices over email, update ERPs, learn from past entries, escalate
  exceptions. zerogrunt.ai.
- [fact] Open problems, per the CTO: changing business context, mid-workflow failure recovery,
  learning from human corrections, measuring improvement. Saurav's post.

## 2. What they are worried about right now
Exactly the four questions in Saurav's post: they have customers and workflows running, and now
need the agent to get reliably better rather than just work.

## 3. The problems this shape forces
1. **Partial failure with real side effects** (cluster #4): a workflow that has already posted
   one ERP entry and fails on the next can't simply be retried. Writes need an idempotency key.
2. **Measuring improvement** (cluster #1): finance output is checkable field by field (amount,
   vendor, GL code), so an eval set is unusually tractable here, and unusually necessary.
3. **Corrections as data** (cluster #7): a reviewer's fix is only reusable if the run stored the
   exact inputs, context and output that produced the mistake.

## 4. The seam Shivam has already touched
**DeepDoc's 36-case eval harness**: replays retrieval sweeps across 100+ configurations, A/B tests
prompts, and separates indexing, retrieval and generation failures; it caught a metadata bug that
blanked every retrieved chunk. That's problem 2 in a different domain (PDF Q&A, not invoices).
Honest distance: **adjacent, not the same**.

## 5. Two questions only an internals reader would ask
1. "When a workflow fails after one ERP write has already gone through, do you replay from a
   checkpoint, or make every write idempotent so the whole run can retry?"
   - If **checkpoint**: ask where the state lives between steps.
   - If **idempotent writes**: ask what the key is (invoice ID + line, or an operation ID).
   - One concept: **idempotency key** (a unique ID per action so doing it twice has the effect
     of doing it once). He's seen this at poiro: the team chose operation-key idempotency.
2. "When a reviewer corrects an agent's output, does the correction go into the prompt as an
   example next time, or into an eval set the agent is scored on?"
   - Either answer opens the eval-set conversation (his strongest seam).

## 6. Do not say
- "You run Istio / Kubernetes." Inference only.
- "I've built finance or ERP integrations." Not in facts.yaml.
- That poiro's dedup or idempotency work was his: the SHA-256 dedup was a prototype the team
  replaced with operation-key idempotency (facts.yaml never_claim). He can say he's seen the
  trade-off, not that he shipped it.
- Any customer count or revenue for ZeroGrunt.
