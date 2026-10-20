---
name: check-replies
description: Sweep Shivam's Gmail for responses from companies in the application tracker — replies, rejections, interview invites — update tracker.md to match, and draft the response when one is owed. Run at session start (after followups.mjs) or whenever asked to check for replies.
---

# Check replies

The other half of the follow-up loop: `followups.mjs` watches the calendar, this skill watches
the inbox. Read-only on mail except creating reply drafts. **Never send, never delete, never
archive/label/mark-read anything.**

## Procedure
1. Read `applications/tracker.md`. Active rows = status `sent`, `followed-up`, `replied`,
   `screening`, `interview`. Skip `hold`, `rejected`, `ghosted`, `offer` (unless asked).
2. For each active company, search Gmail with `mcp__claude_ai_Gmail__search_threads` (load the
   Gmail tools via ToolSearch first, in one call: search_threads, get_thread, create_draft).
   Query by the contact address from the tracker/outreach.md when known
   (`from:shvilesh@logen.io`), else by company name and domain (`from:@betterstack.com OR
   "Better Stack"`), scoped `after:` the row's applied date. Also check ATS senders — Ashby,
   Greenhouse, Lever, Workable, join.com send from their own domains with the company name in
   subject/body.
3. Classify each hit and act:
   - **Real reply from a human** → status `replied` (date). Surface what they said, then
     draft the response per /outreach "Reply drafts" (voice.md binding, no em dashes): save to
     `applications/{company}/outreach.md` under `## Reply — {date}` AND create it as a Gmail
     draft on that thread. Set next follow-up `-` (ball's in Shivam's court now).
   - **Interview / call invite** → status `screening` or `interview`, note the proposed time.
     If it's a scheduling link, say so; don't book anything.
   - **Rejection** (human or ATS-generated) → status `rejected` (date), follow-up `none`,
     log the stage it died at per /outcome. No reply draft unless Shivam wants one.
   - **Auto-ack only** ("we received your application") → note it in the row's notes if
     useful; status unchanged.
4. Nothing found for a row → say nothing per-company; the calendar side handles silence.
5. End of turn, one summary: which companies moved, what changed in the tracker, which drafts
   are waiting in Gmail for his review. If nothing moved: "inbox quiet, tracker unchanged."

## Guardrails
- Tracker edits follow /outcome conventions (status vocabulary, dates, mark-processed is NOT
  re-run here — it already ran at folder-complete).
- Don't paraphrase a rejection into softer words; quote the operative line.
- A newsletter/marketing mail from a tracked company is not a reply. Ignore it.
- If Gmail search errors or the MCP is unavailable, report that plainly and move on; never
  guess at inbox state.

## Write what needs his hand onto the board

Gmail is reachable only from a session (the MCP), so there is no cron that can watch the inbox.
This skill *is* the watcher, and it runs at session start. Its job does not end at a tracker edit:
**anything a reply leaves owing to Shivam becomes a card in `inbox/actions.json`**, then
`node scripts/actions.mjs`. Card rules are in `.claude/skills/autoapply/SKILL.md` § 5.

- A reply needing an answer → a card whose steps are `["Read the draft", "Send it"]`, with a
  button straight to the Gmail draft
  (`{"label":"Open the Gmail draft","action":"open","target":"https://mail.google.com/mail/u/0/#search/in%3Adrafts+{company}"}`)
  and the thread. `onDone.tracker` sets the status the reply moved it to.
- An interview or call invite → `kind: "action"`, grade the company carries, steps for the real
  actions (confirm a time, prep). Put the proposed times in `sub`, not in the background.
- A rejection → no card. The tracker row is the record and there is nothing for him to do.
- A request for a document, a form, an ID, a signature → a card, because those are exactly the
  items that get lost in a thread. One step per artifact they asked for.

**A reply card is the highest-priority thing on the board.** It is a human who answered, which is
the scarcest event in this pipeline: 178+ leads to produce the first one. Put it in the `action`
section (which renders first) and say in the turn summary that it is there.
