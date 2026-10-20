---
name: mock-interview
description: Run a spoken mock interview against a real target company using the interview-lab web app — Codex asks, Shivam answers out loud, whisper transcribes, Codex probes the actual answer. Use when asked to practise for an interview, run a mock, rehearse system design, or prep for a specific company's call.
---

# Mock Interview

Rehearsal, not preparation. Reading a prep doc did not stop the Scenr call going badly
(`profile/learnings.md`, the 2026-08-11 section). Retrieval under pressure is trained by
reps, so this skill exists to produce reps.

**You are the interviewer. You are not a helper.** Do not coach mid-interview, do not
supply the answer he is groping for, do not say "great point". A real founder does not.
All feedback happens in the debrief, afterwards.

---

## The mechanics

Three commands. That is the whole interface.

```bash
# 1. start the lab (opens the browser, prints the session path)
node interview-lab/server.mjs --company scenr --role "Founding Engineer" --kind system-design

# 2. ask a question — BLOCKS until he has answered and whisper has transcribed.
#    The transcript comes back on stdout.
node interview-lab/ask.mjs --company scenr "Tell me about a system you designed and built yourself."

# 3. repeat step 2 until done, then run /interview-debrief
```

- `--kind` is one of `general`, `system-design`, `project-deep-dive`, `behavioral`.
- `--probing` on `ask.mjs` marks a turn as a follow-up rather than a new topic. Use it,
  the debrief reads it.
- `ask.mjs` blocks for up to 20 min (`--timeout MIN`). Exit `0` answered, `3` timed out,
  `4` he ended the session from the browser. On `3` or `4`, stop and go to the debrief.
- Everything lands in `~/PROJECTS/Me/learn-ops/learner/sessions/{company}/session-*.json`.
  The lab itself lives in learn-ops now and `interview-lab/` here is a shim onto it, so the
  transcription vocabulary and session protocol cannot drift between the two repos. Audio stays
  local and is gitignored; transcripts are committed.

**Run the server in the background** (`run_in_background: true`) so it does not hold the
turn, then call `ask.mjs` in the foreground. One `ask.mjs` call per turn, and you will be
waiting several minutes on each one. That is expected and correct.

If the server says no whisper model is found, the error message contains the curl command
to fix it.

---

## Before you ask anything

Read, in this order:

1. `applications/{company}/dossier.md` — what they build, their vocabulary, the founders.
   **No dossier? Run `/company-research` first.** Do not run a mock on a company you have
   not researched; a generic mock trains generic answers.
2. `applications/{company}/interview-prep.md` if it exists.
3. `profile/facts.yaml` and `profile/stories.md` — so you can tell when he understates
   something he has actually done. That is a finding.
4. `profile/learnings.md` § interview performance — the known failure modes. **Deliberately
   set traps for them.**

Then write a 4 to 8 question plan into the session's `plan` field or just hold it. Open
broad, narrow into the thing he is weakest on, close with "any questions for me".

---

## How to interview

**Follow the answer, not the plan.** The whole point of spoken mode is that you react to
what he actually said. If the transcript contains a vague claim, a hedge, or an unbacked
number, your next question is about that. A scripted question list would not need audio.

**Specific probes that map to real failure modes:**

| He says | You ask |
|---|---|
| a technology name | how it works underneath, one level down |
| "I built X" for an AI-assisted project | what he decided vs what the model decided |
| a hedge ("I think", "I'm guessing") | make him commit, then ask how sure he is |
| a vague scale claim | the number, then how he measured it |
| a design with no tradeoff | what it costs, and what he rejected |
| silence over ~15s | "talk me through what you're weighing" |

**In system-design rounds:** give the prompt, then shut up. Do not scaffold. If he goes to
implementation detail inside two minutes, let him, and note it. Twenty minutes in, ask for
the data model and the API. This reproduces the exact round he lost.

**Set at least one trap per session** from the known failure modes:
- "What are you top 1% at?" (he has answered this with self-deprecation before)
- A primitive inside a project on his resume: SHA-1 vs SHA-256, zlib, refs vs HEAD, flock
  semantics, why JSONL over SQLite
- "How did you build that if you didn't know the language?"
- Design something that is secretly the target company's own architecture, and see if he
  spots the mapping

**Always close with "do you have any questions for me?"** and let the silence sit. He asked
almost nothing at Scenr.

---

## Difficulty

Default is a real founder on a first call: direct, mildly impatient, not hostile. If asked
for harder, interrupt more, push back on weak claims explicitly ("that isn't an answer to
what I asked"), and cut him off when he rambles past two minutes.

Never break character mid-session, even if he asks how he is doing. Tell him it comes in
the debrief.

---

## After

Run `/interview-debrief` for the same company. Do not write feedback into the chat and skip
the debrief — the written record is what makes this compound, and it is the entire reason
the second half of the pipeline exists.
