# Playbook — running JobOps daily and weekly

The system does the reading, drafting, and remembering. Shivam does the deciding and the
sending. Every routine below is "open Claude Code in this repo and say the thing".

## Daily (~30–45 min, mornings work best)

**1. Open a session. Say nothing special.**
Session start auto-runs `node scripts/followups.mjs` and `/check-replies`. That means:
- Overdue follow-ups get drafted immediately and land in Gmail drafts.
- Replies/rejections/interview invites found in the inbox update the tracker, and any reply
  that deserves an answer gets a drafted response (Gmail draft + outreach.md).
- Rows silent 7 days after a follow-up get marked ghosted.

**2. Clear the Gmail drafts folder.** (5–10 min)
Everything waiting there was drafted by the pipeline and is yours to edit and send. Send or
delete each one; don't let drafts age. This is the single highest-leverage daily habit — the
whole follow-up system rests on it.

**3. Look at the board.**
`node scripts/dashboard.mjs --open` (or ask for it). Read it left to right: signals worth
promoting? lead pile A/Bs waiting? anything red (overdue)? anything stuck in "waiting" past
its date? One glance, no spreadsheet archaeology.

**4. Work ONE lead end to end.** (the main block)
Pick the best A/B from the pile and run the pipeline on it:
`/company-research {company}` → `/tailor-resume` → `/outreach` → `/cover-letter` (if the form
needs one) → `/apply-pack`. When the folder is complete it's logged as `sent` automatically
and the follow-up clock starts. Say "hold" if you're genuinely applying later. One lead done
well daily beats three done thin.

**5. Top up the pile only if it's low.**
Scout runs every 6h on GitHub Actions. If the pile has no A/Bs: `/job-scout` (now covers HN,
WaaS, Indeed, Peerlist/Wellfound) or `/signal-scout`. With LinkedIn open in Chrome:
`/linkedin-scout` for postings/signals, `/network-scout` reverse lens to check a pipeline
company for mutual connections before sending anything cold.

## Weekly (~1 hr, pick a fixed day)

**1. `/outcome` weekly review.**
Conversion by channel (founder email vs form vs referral), by framing (backend-infra vs full-stack
vs AI-workflow), by lead grade. It proposes recalibrations to scout weights and harvests lessons
into `profile/learnings.md`. Approve or reject the proposals — this loop is what makes the
system smarter than a spreadsheet.

**2. One `/network-scout` mapping session.**
40–50 connections into `inbox/network.md` per session until the map is built, then it's a
5-minute refresh. Once mapped, run the forward lens: who in the network works somewhere
hiring your stack right now. Max 2–3 referral asks drafted per week; asks are a currency.

**3. Prune and decide.**
Anything in the lead pile older than ~2 weeks: apply it, or `mark-processed --skip` it. An
undecided lead rotting in the pile costs attention every single day. Same for signals.

**4. Ghosts get one glance, not grief.**
Rows that went ghosted this week: check `/outcome` logged them, note any pattern (same
channel? same framing?), move on. Two touches was the plan; the plan worked.

## Monthly
- `node gh-tools/profile-audit.mjs` — the GitHub profile is a landing page; audit it.
- Refresh `inbox/network.md` (people change jobs).
- Reread `profile/learnings.md` top to bottom; promote 3×-confirmed lessons into permanent
  skill rules, delete anything contradicted.

## When a reply actually lands (any day, drop everything)
Day-one replies beat day-three replies more than any other speed in this pipeline.
`/check-replies` will have drafted the response already; edit, send, and tell the session
what happened so `/outcome` logs the stage change. Interview invite → say so and prep starts
(dossier reread + likely questions from the JD).

## What Shivam never has to do anymore
Remember follow-up dates. Notice silent threads. Re-find the apply link. Re-type the same
form answers. Wonder which framing is working. Draft from scratch.

## What only Shivam can do
Press send. Decide hold vs go. Take the calls. Be the person the writing sounds like.
