---
name: learn-before-build
description: Teach Shivam the concepts behind something we're about to build for a lead — paced, interactive, story-first — before or while actually building it, so he can defend it in an email reply or an interview, not just point at code Codex wrote. Use when he says "teach me", "I don't know this", "walk me through it", "explain like a journey", or when a build (an eval harness, a demo, a technical answer) rests on concepts he can't yet explain himself.
---

# Learn before build

Copilot, not autopilot, applies to understanding as much as it applies to sending an email.
A build he can't explain is a liability the moment someone asks him one follow-up question
about it — in a reply thread, on a call, or in an interview. This skill is the pass that
happens before (or interleaved with) the actual implementation, so the thing that gets built
is one he actually owns.

**This is not `/mock-interview` or the daily `learn-ops` read.** `learn-ops` teaches whatever
is next on a fixed daily cadence, disconnected from any specific lead. This skill exists
because a specific company, a specific promise, or a specific build made a concept urgent
*right now* — it's scoped to that build and stops once he can defend it.

## The shape, in order

Each numbered step is normally its own message. Do not collapse steps into one wall of text —
the whole point is that he can grab one idea before the next one lands.

1. **Fast overview.** Plain language, no jargon, a short numbered list of the ideas in the
   order they'll be taught. This is the map so he knows how many stops there are and isn't
   lost mid-journey. One or two lines per idea, nothing more.
2. **The story.** A concrete scenario with a named example (a fake customer, a fake company,
   a specific moment) walked through beat by beat, ending exactly where the naive approach
   visibly breaks. Do not name the jargon term or the solution inside the story — the goal is
   for him to feel "yeah, we need something to solve here" before he's told what that
   something is called.
3. **Predicted questions, answered.** Anticipate the 2–4 questions a reasonable person would
   have right after that story lands, state each one plainly, and answer it in a short
   paragraph — one question at a time, not all four stacked in one block if the topic is
   dense. End with a light check-in ("keep going, or pause here?") rather than assuming the
   pace is right.
4. **A toy example.** Numbers or cases small enough to trace by hand — five rows, not fifty —
   using the story's own scenario, so the mechanism is visible before any real tool or API
   enters the picture.
5. **The build map.** Only after the concept lands: lay out the actual pieces of the real
   implementation as small, independently checkable steps, each one traceable back to a
   concept just taught. This is where the handoff to real building happens.

## Pacing rules

- Default chunk is small: one idea, a few short paragraphs, maybe one table. Never dump the
  whole journey — overview through build map — in a single message.
- Wait for a response between chunks. "Keep going" / "let's move" / "yes" means continue at
  the same pace and depth.
- If he says it's dragging, widen the chunks: fold the predicted-questions step into fewer,
  denser answers, or skip straight to the toy example.
- If he says he's lost, split further: one question per message instead of two or three, and
  slow the story down to smaller beats.
- Follow his stated pace, don't pre-guess it — the first chunk each session should be on the
  smaller side until he's told you which way to move.

## The test that decides when to stop teaching and start building

Not "does the code work" — that's the build's job to prove. The bar here is narrower: **could
he restate the idea in his own words if someone pushed back on it in a reply or on a call?**
A light, low-pressure check ("so in your own words, why does X..."), not a quiz, is enough to
tell. If the answer is confused, that's the sign to add one more story/example beat before
moving to the build map, not to move on anyway because the explanation was technically given.

## Record it, or it decays silently

**A concept taught here and not written down will be forgotten and nobody will find out until an
interview.** That is not hypothetical: the 2026-08-14 baseline exam scored 14.5/50 across areas
`learner.md` listed as fluent, because nothing in the system had ever tested anything.

So when the concept lands, record it:

```bash
cd ~/PROJECTS/Me/learn-ops
node scripts/tested.mjs --record \
  --concept "check-then-act / flock" --status taught \
  --area Concurrency --evidence learner/exams/flock/
```

**Use `--status taught`, never `tested`.** A lesson that just happened proves nothing — he can
restate anything ten minutes after hearing it. `taught` puts it on the re-test schedule
(`learner/tested.md`, +21d), which is the point. It becomes `tested` only when the lab asks him
cold, later, and he **builds an explanation he was never given** — that is the bar, and reciting
a taught one does not clear it.

If the session ends with a lab test (`/mock-interview` against the concept), record the result
instead and `/interview-debrief` handles the write.

## Where this feeds back into the pipeline

- If a real interview or reply later exposes that a concept taught this way didn't actually
  stick, that's a `profile/learnings.md` entry (`/interview-debrief` already reads that file)
  — not a reason to re-run this skill from scratch on the same topic.
- Once the concept series is done and the build map is agreed, the actual implementation is
  ordinary building — proceed like any other technical task in this repo, referencing the
  lead's `dossier.md`/`log.md` for what the build is actually for.

## Sibling method, different medium

The same overview → story → predicted-Q&A → toy-example sequence is also used, adapted for a
non-interactive written piece (no pacing, no back-and-forth), in:

- `learn-ops/.Codex/skills/read/SKILL.md` — the daily concept deep-dive.
- `article-ops/.Codex/skills/article-write/SKILL.md` — published technical explainers.

Both fold the "predicted questions" step into inline prose (ask flatly, answer flatly) rather
than a literal Q&A block, since a published piece can't pause for a reply. This skill is the
interactive version, built for exactly the back-and-forth `/loop` this conversation used —
keep it that way; don't flatten it into a one-shot essay just because the written skills exist.
