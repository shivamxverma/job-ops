# DeciOps: 1st round prep (Fri 2026-10-23, 14:30-15:00 IST)

- **Who:** Laxmipat Malu, Founder & CEO (founder@deciops.ai, +91 9900 488227). ~14 yrs data
  analytics delivery (Sigmoid, Happiest Minds, Virtusa, Accenture). Expect a delivery leader's
  questions: what did you ship, how do you know it works, can you start, where are you.
- **Link:** https://meet.google.com/opw-aiez-obv (phone: +1 260-758-0297, PIN 596510738)
- **Before:** RSVP "Yes" on the invite in Gmail. Join 2 min early. Resume.pdf open on screen.
- 30 minutes, founder-led, first round: mostly fit + screening, maybe one design question.

## Fix this before he asks: location
Your reply said Q6 "Warisaliganj, Bihar" and Q7 "In Bengaluru: Yes". He will notice.
Have one sentence ready that is true, e.g. "I'm at home in Bihar right now, I'll be in Bengaluru
and can start immediately" (or whatever the real answer is). Say it first if he looks at it.

## 60-second intro (from stories.md, the arc)
IIIT Nagpur CSE, graduated May 2026. Two internships: klimb.io (Nov 2025 to May 2026), backend
for a 3-stage AI interview platform hundreds of candidates went through, with a live voice round,
and a Postgres credit ledger logging every use of 6+ AI features. Now at poiro.com, the node and
group system of an AI workflow builder, and fail-closed caps on vendor APIs. On the side, DeepDoc,
a RAG app with a 36-case eval harness. Through-line: making AI features auditable and measurable,
which is the part DeciOps says is hard.

## Likely questions, short answers
- **"You have ~1 year, we asked for 2+."** Yes, and I said so in my first email. What I can show
  is the exact pieces this seat needs at small scale: an audit ledger (klimb.io), an eval harness
  that pins failures to a stage (DeepDoc), hard caps on automated actions (poiro.com). No notice
  period.
- **"Why DeciOps?"** Most AI products stop at a recommendation. You write back into SAP/Oracle,
  so the hard part is knowing when the agent may act and proving afterwards why it did.
- **"Walk me through the credit ledger."** On/off flags meant finance couldn't audit or bill by
  usage. Built a Postgres usage ledger across 6+ AI features enforced in middleware: every use is
  a record, billing comes from the log. Same shape as a decision ledger.
- **"How do you know an LLM system works?"** DeepDoc: answers were empty, prompt tweaks didn't
  help. Built 36 cases first (multi-turn, Hinglish, missing evidence, prompt injection), replayed
  retrieval sweeps without new API calls, LLM judge. Found retrieval needed a `pageNumber` field
  ingestion never wrote, which blanked every chunk. Don't claim an accuracy %.
- **"Orchestration / agents?"** Flowboard: workflows as DAGs of steps with typed ports and an
  execution order; groups collapse and run as sub-workflows. Be clear it's a workflow builder,
  not autonomous agents.
- **"What would you do differently?"** klimb.io voice module: evaluation ran when the results
  page polled, so overlapping polls could evaluate twice. Fix: close the transcript, then one
  idempotent queued evaluation. (Only tell it as your mistake if it was yours.)
- **Design question, if any: "agent writes a transfer order to SAP, the call times out."**
  Idempotency key per decision, write to an append-only ledger before the call (state: pending),
  retry with the same key, reconcile against what the ERP actually recorded, never re-apply a
  decision marked done. Cap auto-executed actions per tenant per day, fail closed.
- **CTC:** current 10-15 LPA (as sent), expected 10-18 LPA. **Start:** immediately.
- **No ERP/SAP/supply-chain experience.** Say so plainly if asked; don't bluff.

## Your two questions (end of call)
1. "When the Backorder agent and the Re-balancing agent both want the same units at a hub, who
   wins, and is that arbitration a policy rule or another model?"
2. "How do you calibrate the confidence score that gates Auto-Execute: against planner
   overrides in the review queue, or against the outcome after write-back?"
Backup: "What would the first month look like for this seat?"

## After
Thank-you note same day (draft it with Claude), then /interview-debrief with what was asked.
