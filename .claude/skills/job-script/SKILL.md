---
name: job-script
description: Write the full word-for-word script for a job-application video — numbered clips, each to a measured word budget at his measured speaking rate, in his own spoken register, plus a speak-only page he can keep open under the webcam while recording. Use whenever Shivam is about to record a video for an application, or says "give me the script", "I need a script for this one", or that he can't record without one.
---

**Disabled until Shivam has his own footage and a voice-video profile.** The asset scripts (`video-assets.mjs`, `ui-recon.mjs`) exit unless run with `--force`, and every project/footage reference below belongs to the previous owner.

# Job Script

**This skill exists because of a correction Shivam made on 2026-08-17.** The original
`job-video` step 0 wrote the script as "beats and talking points, not sentences to read", on
the theory that a read script sounds read. That theory is wrong *for him*, and it was blocking
the highest-signal channel in the pipeline: he does not speak comfortably off the cuff on
camera, so a brief with talking points means no recording gets made at all. **A script he can
read beats a video he never records.** No video is the worst outcome available.

So: full sentences, every word, always. He uses it as a stick, and he departs from it wherever
he wants. That departure is his call to make on camera, not ours to force by withholding the
words.

## Read these first, in this order

1. **The voice-video profile (spoken register): does not exist yet for Shivam.** The previous
   owner's lived in a separate video-ops repo that is not on this machine. Until Shivam records
   enough clips to measure his register and speaking rate, fall back to `profile/voice.md`.
2. `profile/voice.md` — the written-voice rules that still apply (banned words, em dash ban).
3. `applications/{company}/dossier.md` and `tech-read.md` — what he's actually talking about.
4. `profile/facts.yaml` — every number that reaches his mouth comes from here.

Where the two voice files disagree, **`voice-video.md` wins**: this is speech, not prose.

## The word budget is not advisory

He speaks at **195 wpm, measured across 25 real clips.** Over budget means he re-records, and
a re-record is the exact cost this skill exists to avoid.

| Clip | Words |
|---|---|
| 8s | 26 |
| 10s | 33 |
| 15s | 49 |
| 20s | 65 |
| 25s | 81 |
| 30s | 98 |

Whole-video totals: **60s = 195 words · 75s = 244 · 90s = 293.** Count the spoken words. Do
not estimate them, and do not count board directions or margin bullets.

## Shape: one clip per beat, and that is the point

`job-video` step 3 fixes the dramatic structure, and the script must land on it exactly.
Default 90s landscape:

| Clip | Beat | Target | Words | Must do |
|---|---|---|---|---|
| 1 | HOOK | 8s | 26 | his name, and the one sentence about why **this** company |
| 2 | PROOF 1 | 25s | 81 | the strongest project for this framing, one number |
| 3 | PROOF 2 | 25s | 81 | second project, or the **seam** from `tech-read.md` |
| 4 | THE GAP | 15s | 49 | the honest limitation, stated flat |
| 5 | CLOSE | 15s | 49 | links, and one real question to them |

**Five separate clips is the answer to "I'm not good at this."** He records them one at a time
and `job-video` composites them, so a fumbled take costs 25 seconds of re-recording, never 90.
Say this in the hand-off every time, because it is the thing that makes recording feel
survivable.

At 60s: drop PROOF 2, and give the 25 seconds to PROOF 1 and the GAP. Never drop the GAP.

## How to write lines he can read off a screen

He is reading while looking near the lens, so the physical constraint is real:

- **One sentence per line.** A line break is where he breathes.
- **Twelve words per line, hard ceiling.** He has to take a line in one glance, then say it to
  the camera. A 25-word line forces him to read *at* the screen and it shows.
- **No subordinate clauses.** His own speech chains with `So`, `But`, `Now`, `That's why`. Two
  short sentences always beat one correct long one.
- **Nothing he would stumble on.** Read every line aloud. If you stumble, he will.
- **No number he has to get right from memory.** Numbers go in the line, spelled the way he'd
  say them (`nine thousand dollars`, not `$9,000`) so the reading doesn't break stride.

## Register, concretely

Everything in `voice-video.md` carries over, including the parts that look like errors and are
not: `different different`, `stuffs`, `so many`, `very fast`, `let's say`, `basically`,
`must be having`, `or you can say`, `and all that`. **A script that reads like clean American
tech-YouTube English is a failed script even when every fact is right.**

Four differences from a video-ops script, because the audience is one hiring manager and not
an audience:

1. **No teaching voice.** Drop "today we will try to understand". He is not explaining a
   concept, he is showing a thing he built.
2. **The metaphor requirement is off.** A domestic metaphor is his signature in an explainer
   and it reads as padding in a 90-second application. Use one only if it is doing real work.
3. **The trade-off requirement becomes the GAP beat.** `voice-video.md` says a clip with no
   trade-off is a paragraph. Here the whole trade-off lands in clip 4, once, about himself.
4. **The ending is a question, not a scope admission.** No "so that was it for now", no thank
   you. Close on the links and one thing he actually wants to know from them.

Still banned, hard: em dashes anywhere. "Passionate", "thrilled", "leverage", "seamless",
"proven track record", "align perfectly". Any hype word (there is not one `insane` or
`game-changer` in 1400 seconds of him). Agenda openings. "Key takeaways".

## The five checks before hand-off

1. **Clip 1 opens on a claim or a question, not a greeting.** He has never said "hey guys". And
   the reason he names for applying is checkable and specific: it comes out of `tech-read.md`
   or the dossier's research detail, never "I love what you're building", which is the exact
   sentence that marks a mass-applier.
2. **Every number traces to `profile/facts.yaml`.** He says it aloud and it becomes his claim,
   permanently, in a file a company keeps.
3. **The GAP is really a gap.** A fake limitation ("sometimes I care too much about quality")
   is worse than no clip 4. Name a real thing he has not done. The one application that ever
   drew a personal human reply led with an honest gap.
4. **Read every clip aloud against the clock.** Over budget → cut a sentence, never tell him
   to speak faster.
5. **Word count per clip, written in the heading, counted not guessed.**

## Hand back three files

**1. `applications/{company}/script.md`** — the working script. Per clip: heading with target
seconds and word count, a `> Board:` line (`/video-beats` reads it), the spoken text, and a
short margin bullet list. The bullets are what let him read it once and then speak it.

**2. `applications/{company}/script-speak.md`** — **the one he actually records from.** Clip
number, target seconds, and the words. Nothing else. No word budgets, no board directions, no
reasoning. He opens this in a window directly below the webcam, so anything extra on the page
is noise at exactly the wrong moment. The only thing allowed at the bottom is a short
**Hold these** list: numbers not to overstate, claims not to assert.

**3. The Notion brief row** (`🎬 Job Video Briefs`, see `video/notion.json`) — add a
`🗣️ Script — speak only` child page with the same content as file 2, so it is on his phone,
and set `Status: script ready`.

Then tell him: which clip you are least sure about and why, that the five clips are recorded
separately so a bad take costs 25 seconds, and that the script is his to rewrite.

## Related

`job-video` (the edit) · `company-research` · `tech-read` (clip 3's material) ·
`video-ops /video-script` (the parent skill) · `profile/facts.yaml`
