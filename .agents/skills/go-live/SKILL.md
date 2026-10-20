---
name: go-live
description: Attach this Codex session to the JobOps control centre so its buttons dispatch real work into this conversation. Use when Shivam says "go live", "listen to the board", "take the board", "control centre", or asks why the board's Work-it button says "queued" instead of doing something.
---

# Go Live

Makes this session the one the control centre talks to. Until a session does this, **Work it**
only queues into `inbox/intents.json` for the next session, and the ask boxes are disabled and
say so — deliberately, because a button that silently does nothing is worse than no button.

## What is actually happening

`scripts/actions.mjs` serves the board and writes button presses to `control/queue.json`. A node
server has no channel into a running Codex session, which is the entire reason the board could
only ever say "queued — Codex picks it up next session". The session opens the channel from its
side: a **persistent Monitor** over `scripts/watch-queue.mjs`, whose stdout lines arrive here as
events. That same watcher writes the heartbeat the board's LIVE pill reads. Kill this session and
the watcher dies with it, the beat goes stale in 30s, and every Codex-backed control disables
itself. The absence is the signal, so nothing has to remember to clean up.

Ported from a sibling repo's command centre (hack-ops, the previous owner's), where the mechanism was proven first.

## Going live

1. Register, then arm, in this order:

   ```
   node scripts/actions.mjs live --note "<one line on what this session is for>"
   ```

   Then arm the watcher with the **Monitor** tool, `persistent: true`:

   - `command`: `node scripts/watch-queue.mjs`
   - `description`: `JobOps control centre queue`

   `persistent: true` is not optional. A timeout means the board goes dark mid-session with no
   warning, which is exactly the failure this mechanism exists to prevent.

2. Start the board if it is not already up (it is a server, so background it):

   ```
   node scripts/actions.mjs --no-open      # run_in_background: true
   ```

   Tell Shivam the URL: http://localhost:7777

3. Drain anything already waiting: `node scripts/actions.mjs next`. Presses made while nothing
   was listening were refused outright, but a session that died mid-command leaves real work
   behind, and `inbox/intents.json` may hold Work-it presses from the fallback path — handle
   those per the session-start routine in `AGENTS.md`.

## Handling a command

Every Monitor event looks like:

```
CMD c1a2b3c4 :: work AO (Agent Orchestrator)
CMD d5e6f7g8 :: /tech-read ao-agents
CMD h9i0j1k2 :: ask AO (Agent Orchestrator) :: is the Go share real or vendored deps
```

For each one, in order:

1. **`node scripts/actions.mjs claim <id>` before the work, not after.** The board turns the
   card blue and Shivam can see you picked it up. A command that sits `pending` while you work
   looks identical to one you never saw.
2. Do the work:
   - **`work <Company>`** is Shivam assigning a lead. Run the pipeline for it as if he had typed
     "work X" in chat: `/company-research` → `/tech-read` → `/tailor-resume` → `/outreach`, to
     whatever depth the grade earns. **A-grade gets the video offered.**
   - **`/skill args`** is a slash command. Invoke that skill exactly as written.
   - **`ask`** is not a skill. It is Shivam talking to you through the board: answer it in the
     conversation exactly as if he had typed it. The args arrive as `Company :: question` when it
     came from a card, and as bare text from the top bar — use the company for context.
3. **`node scripts/actions.mjs done <id> --result "<one line Shivam can read on the board>"`**,
   or `--failed` with the reason. The result line is the receipt and it renders on the card, so
   "dossier + tech-read written, resume 84, DM drafted in outreach.md" beats "done".

Report each command in the conversation too. **The board is a trigger, not a replacement for the
transcript** — a result line is one sentence and cannot carry the reasoning.

## Rules the board does not relax

Every ground rule in `AGENTS.md` still applies to work that arrives this way, and three matter
more here because a button makes them easy to forget:

- **Nothing is ever sent or submitted.** A press means draft, research, tailor. It never means
  send an email, submit a form, or fire a DM. The C lane (`/autoapply`) is the only autonomous
  path and it is not reachable from a button.
- **Truth still lives in `profile/facts.yaml`.** A button does not authorise a claim that isn't
  traceable to it.
- **`work` on a lead does not decide the lead.** Marking it done/skipped in `leads.md` stays
  Shivam's call through the card's own checkboxes, not something the pipeline does because it
  finished researching.

## Going offline

`node scripts/actions.mjs offline`, or just end the session — the watcher dies with it and the
board notices within 30s. `node scripts/actions.mjs status` says which state you are in.
