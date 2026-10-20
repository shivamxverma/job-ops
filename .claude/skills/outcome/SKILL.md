---
name: outcome
description: Log the result of an application or outreach (sent, reply, interview, rejection, offer, ghost) and periodically recalibrate the pipeline — which framings, channels, and lead grades actually convert. Use after any send or any response, and weekly for the review.
---

# Outcome

The pipeline only gets smarter if every send and every response is logged. This is the
"ever-evolving" part.

## Logging
Append to `applications/tracker.md` (create with this header if missing):
```
| date | company | role | grade | channel | framing | ats | status | next follow-up | notes |
```
Statuses: `hold` → `sent` → `followed-up` → replied / screening / interview / offer /
rejected / ghosted.

**Folder-complete = applied.** As soon as `applications/{company}/` holds everything the
channel needs (resume + pack.json for a form, outreach.md for an email apply), log the row as
`sent` dated today with `next follow-up` +7 days, and run mark-processed (below). Don't wait
for Shivam to confirm he clicked submit. Two exceptions:
- Shivam says "I'll apply later" → status `hold`, follow-up `-`, no mark-processed. Flip to
  `sent` (and mark-processed) when he says it went out.
- Shivam later corrects the real send date → fix the date and recompute the follow-up. A day
  or two of drift doesn't matter; the clock does.

**Follow-up lifecycle** (what to do when `followups.mjs` flags a row as overdue):
- status `sent`, no reply → draft the follow-up email NOW, this turn, per /outreach voice
  rules (short, one new proof point or nudge, no em dashes). Save to
  `applications/{company}/outreach.md` under `## Follow-up — {date}`; if the recipient email
  is known, also create it as a Gmail draft (see /outreach "Gmail drafts"). Set status
  `followed-up`, follow-up +7d. Tell Shivam where the draft is.
- status `followed-up`, still no reply → set status `ghosted`, follow-up `none`. Two touches
  max; a third reads desperate. Note it and move on.

When logging any other send, always set `next follow-up` (+5–7 days for outreach). If the lead
originated from `/signal-scout` rather than a job posting, say so in `notes` (e.g. "sourced:
signal, grade A, funding+hiring") — that's what lets the weekly review check whether signal
grades are actually predictive, same as it already does for job-scout grades.

**Two tokens every row carries in `notes`, from 2026-08-17.** Both exist so a claim the pipeline
already believes can eventually be measured instead of repeated:

- **`video: yes` or `video: no`** — the one application that ever drew a personal human reply was
  the one sent as a video, and that is n=1 with nothing recording which applications carried one.
  Until ten rows carry this token, "video works" is a hypothesis. Write it on every row.
- **`tech-read: yes` or `tech-read: no`** — whether `applications/{company}/tech-read.md` existed
  before the application went out. Same reason: the depth play is worth its 30 minutes only if
  reply rate says so.

Use exactly these strings, in the `notes` cell. **Never add a column for either** —
`scripts/lib/state.mjs` parses this table and two parser bugs there have already silently deleted
real applications from every view.

Then in the weekly review, split reply rate by both tokens and say the sample size out loud.

## Mark the lead decided (close the loop on inbox/leads.md + GitHub)
Once a lead is decided, record it so Shivam sees at a glance what's done vs. left:
```
node scripts/mark-processed.mjs "<Company>"          # DONE: pipeline went out → [d], issue closed "completed"
node scripts/mark-processed.mjs "<Company>" --skip   # WON'T APPLY → [x], issue closed "not planned"
```
- Run the **done** form when the company folder is complete and its tracker row becomes
  `sent` (folder-complete = applied). The only case that waits is a `hold` row: run it once
  Shivam lifts the hold.
- Run the **--skip** form when Shivam decides to pass on a lead, so its issue doesn't linger.
- It sets the box char in `inbox/leads.md`, stamps the date (`✓ processed` / `✗ skipped`), and
  closes the GitHub Issue `/job-scout` opened for it with the matching reason. An OPEN issue
  therefore always means an undecided `[ ]` lead.
- `--no-close` updates leads.md only; `--reason "..."` overrides the close comment. Never fails
  on a GitHub hiccup — the box always updates and it tells you if the issue needs a manual close.

## Weekly review (run when asked, or if last review >7 days ago per tracker)
1. Overdue follow-ups → list them first, draft the follow-up via /outreach.
2. Conversion by channel (founder email vs form vs referral) and by framing (backend-infra vs
   full-stack vs AI-workflow) and by lead grade. Small numbers — report counts, not fake %.
2b. Once there's more than a handful of signal-sourced rows: check whether grade-A signals
   (funding + explicit hiring mention) actually reply more than grade-B/C ones. If not enough
   data yet, say so rather than drawing a conclusion from 1–2 rows.
3. Recalibrate: if a framing/channel is outperforming, propose concrete changes to
   job-scout scoring weights, signal-scout's FUNDING/HIRING_HINT/TECH_SECTOR keyword lists
   (in scripts/signal-scout.mjs), and tailor-resume defaults. Apply only after Shivam agrees.
4. Harvest into `profile/learnings.md` (the file every generating skill reads first):
   new form questions seen → its staples section; converting/failing patterns → "what
   converts" / "what didn't work" with honest counts; stories that landed → flag for
   stories.md; new personal facts → "profile updates pending" (and suggest the portfolio
   skills.md edit).
5. Promote or prune: a learning confirmed 3+ times becomes a permanent rule (edit the
   relevant SKILL.md or voice.md, with Shivam's OK); a learning contradicted by new data
   gets deleted. learnings.md should stay short and true, not grow forever.

## Rejection handling
Log the stage it died at. Two rejections at the same stage with the same framing = a signal,
not bad luck — raise it in the next review.
