---
name: interview-debrief
description: Score a mock or real interview brutally, per answer, and write the lessons back into observations.md, learnings.md, stories.md and the dossier. Use after any mock-interview session, or when Shivam reports back from a real call with a transcript or recall.
---

# Interview Debrief

The loop-closer. Without this, reps produce nothing and the second half of the pipeline
never compounds.

## Tone: brutal. This is set deliberately and is not a mood.

Shivam asked for brutal. It means:

- **Lead with the verdict and a number.** "This was a fail, ~25%." Not "some strong moments,
  and a few areas to work on."
- **Quote him.** Never paraphrase a weak answer into something more defensible than what he
  said. The exact words are in the session file. Use them.
- **Rank by damage, not by order of occurrence.** The worst thing first.
- **No compliment sandwich.** Strengths go in their own section, after, and only if real.
- **Name the pattern, not just the instance.** "You disowned a correct answer" beats "you got
  SHA-256 wrong", because the first one is the thing that repeats.

Brutal is not cruel. Attack the answer, never him, and every criticism carries the better
answer that was available. "That was weak" is useless; "that was weak, and here is the
version you already had the facts for" is the product.

**Do not soften across sessions.** If the same failure appears three mocks running, say
that it is the third time and that nothing has changed.

---

## Inputs

- **Mock:** `~/PROJECTS/Me/learn-ops/learner/sessions/{company}/session-*.json` (most recent). Turns carry
  `question`, `answer`, `duration_s`, `word_count`, `words_per_min`, `probing`.
- **Real interview:** whatever Shivam gives you — a transcript, a summary, or spoken recall.
  Ask for the interviewer's closing line verbatim; it is the cheapest outcome signal there
  is ("we'll reach out if we want to schedule another round" = soft no).

Also read `dossier.md`, `profile/facts.yaml`, `profile/stories.md`, and
`profile/learnings.md` § interview performance, so you can spot the answer he *had* and
did not give.

---

## Score each answer

| Dimension | What you are judging |
|---|---|
| **Substance** | Did it answer the question asked, or an easier nearby one? |
| **Specificity** | A number, a name, a mechanism. Or adjectives? |
| **Calibration** | Confidence matched to correctness. Disowning a right answer scores worse than being wrong. |
| **Structure** | Did he drive, or seek validation and wander? |
| **Self-presentation** | Did he state his own work plainly, or undersell it? |

Per turn: score /5, quote the worst line, give the better answer in one or two sentences.
Then an overall verdict with a percentage and a one-line reason.

**Use the delivery metrics — they are why this is spoken.** `words_per_min` under ~110 with
a long duration usually means groping, not thinking. Over ~180 usually means nerves. A
30-word answer to a system-design prompt is a non-answer regardless of content. Long
`duration_s` with low `word_count` is dead air; say so, because it reads as freezing in a
real call.

---

## Then write it down. All four, every time.

1. **`applications/{company}/mock/observations.md`** (findings stay in job-ops even though the raw session lives in learn-ops) — append, never overwrite. Date, session
   kind, verdict, per-answer notes, and a **Repeat offenders** list at the top that grows
   across sessions. This file is the point of the skill.
2. **`profile/learnings.md`** § interview performance — only *generalisable* lessons, phrased
   so they apply to the next company, not this one. Anything company-specific stays in
   `observations.md`.
3. **`profile/stories.md`** — any answer that came out genuinely well. Spoken answers are
   often better than written ones; that is worth harvesting. Also add to
   `learnings.md` § "Phrases/stories that landed".
4. **`applications/{company}/dossier.md`** — for real interviews only, a **Confirmed on the
   call** section. One 45-minute call produced facts eight weeks of OSINT got wrong (Scenr:
   3 people, angel-funded). Treat interviews as a research channel.

5. **`learn-ops/learner/tested.md`** — the measured layer, via the script. One row per concept
   the session actually probed, including the ones he failed:

   ```bash
   cd ~/PROJECTS/Me/learn-ops
   node scripts/tested.mjs --record --concept "Go channels, buffered vs unbuffered" \
     --status gap --area Go --score 0/5 --evidence learner/exams/baseline/
   ```

   Status is `gap` (never learned), `decayed` (knew it once — `/revise`, not a new read),
   `taught` (a lesson happened, proves nothing yet), or `tested`. **`tested` requires that he
   built an explanation he was never given.** Reciting a taught one is `taught`, however fluent
   it sounded. Ask him directly which misses are `gap` and which are `decayed` — he sorts himself
   accurately when asked to reflect, far better than he performs live, and the two need opposite
   remedies.

   `node scripts/tested.mjs --due` is what surfaces a concept whose re-test has come round.

For a real interview, also update the tracker row via `/outcome`, including the closing line
verbatim.

---

## Two moves to consider at the end

**The recovery artifact.** If the miss was *demonstrable* (a design, a debug, an algorithm)
rather than rapport or seniority, going away and doing it properly within 24h is worth
proposing. It converts "couldn't do it" into "couldn't do it in 20 minutes under pressure".
Template: `applications/scenr/gha-design.md` + `followup-email.md`. It does not work for a
character or framing miss, and one sentence of ownership beats three.

**Feed it back into the pipeline.** If he could not defend a project under questioning, that
project should not be leading his resume. Say so, and flag it for `/tailor-resume`.
Defensibility is a selection criterion, not just keyword fit.

---

## Close with the drill

End every debrief with the smallest next rep: the one question to re-answer, or the one
primitive to go read. Not a study plan. One thing.
