---
name: job-video
description: Turn a raw talking-head clip Shivam records into a finished job-application video — his real project UI and screen recordings on stage, face-cam PiP, karaoke subtitles, and chalk annotation drawn on top of the actual product. Use for any A-grade lead, or when he says he has recorded a video for an application, wants to edit a job video, or asks for the video pipeline.
---

**Disabled until Shivam has his own footage and a voice-video profile.** The asset scripts (`video-assets.mjs`, `ui-recon.mjs`) exit unless run with `--force`, and every project/footage reference below belongs to the previous owner.

# Job Video

**Why this exists.** Across 32 applications the pipeline has produced exactly one real human
reply: Andrew at AveryIQ, **9 hours after sending, personally written**. It was a rejection,
but it was the only time a human actually engaged with an application, and it was the only
application sent as a **video**. That is the strongest single signal in the outcome data.

So every **A-grade lead gets offered this**. Shivam records; you edit.

## Which leads get a video (B-grade policy, 2026-08-17)

**A-grade: always.** Unchanged.

**B-grade: yes, but only when the marginal cost is a recording and nothing else.** Two conditions,
both required:

1. **The channel reaches a named human** — a founder email, a DM, or a warm referral. A video
   uploaded into an ATS portal at a company big enough to have one is watched by nobody, and that
   is the case where this is pure waste.
2. **The footage already exists** for the framing this role needs (`video/assets.json`). No new
   screen recordings, no new project. If a B-grade needs footage built first, it does not get a
   video.

Under those two conditions the extra cost is one recording session, and with `/job-script` that
is five clips of 25 seconds or less. That is cheap enough to be worth a B.

**Everything else: no.** C and below never, and a B whose only route in is a portal never.

### The honest caveat, and the fix

**The evidence for video is n=1.** One personal reply out of one video, across 32 applications.
That is the strongest signal in the outcome data and it is also a single data point, so the
policy above is an experiment, not a finding.

It cannot become a finding until the tracker records which applications carried a video, and
right now it does not. So **every tracker row from now on carries a `video: yes` or `video: no`
token in its notes cell**, written by `/outcome`, so reply rate can actually be computed by
channel and by grade. Do not add a tracker column for it: `scripts/lib/state.mjs` parses that
table, and a schema change there is the exact class of thing that has silently deleted real
applications from every view twice already.

Revisit this policy once there are ten videos with outcomes attached.

## The structural difference from `/chalkboard-video`

Read `chalkboard-video` first — the Remotion laws, the karaoke caption system, the SFX
palette, the transcription pipeline and the templates all carry over unchanged. **Do not
re-derive them.** What changes is the visual layer, and it is a real inversion:

| | chalkboard-video | job-video |
|---|---|---|
| Stage shows | a chalk **metaphor** for the idea | **the actual product**, running |
| Chalk is | the whole visual language | annotation drawn *on top of* real UI |
| Proves | that he can explain a concept | that the thing exists and he built it |
| Fails when | the metaphor is lazy | the viewer can't tell what they're looking at |

A hiring manager watching this has one question: *did this person actually build something?*
A beautiful chalk drawing does not answer it. **Thirty seconds of the real product doing the
thing, with his voice over it, does.**

So: **the footage is the argument, chalk is the pointer.** Use chalk for arrows, circles,
callout labels and the number stamps — never to replace a shot of the product.

## Step 0 — the brief, in Notion, BEFORE he records

**This is now the first thing that happens when an A-grade lead appears.** Shivam records from
his own head, in his own words, but he can only do that if he already knows what this company
is, who built it, and which of his own projects to reach for. The brief is that knowledge, and
it goes to Notion so he can read it on a phone before hitting record.

**Never send him to record without one.** A re-record costs more than a brief.

### Where it goes

| | |
|---|---|
| Page | 🎬 Job Video Briefs — `https://app.notion.com/p/3ada8f6580e6815db767f6e47a036a3a` |
| Database | Briefs — `data_source_id: 8c9751d9-490b-4b1f-82e9-804c4648646c` |
| Config | `video/notion.json` |

Create with the Notion MCP (`notion-create-pages`, parent `data_source_id`). Set `Name` to
`{Company} — {Role}`, plus Company, Role, Grade, Framing, Projects, Target length,
Application, and `Status: brief ready`. Update `Status` as it moves: recorded → edited → sent.

Unlike learn-ops this runs **in-session via the MCP connector**, not under launchd, so there is
no Keychain token to mint. A brief is only ever written when Shivam is in a session anyway.

### How long the video should be

Pick the target before writing the script, because it decides how many projects fit.

| Channel | Target | Why |
|---|---|---|
| Email attachment / ATS upload | **75–90s** | the default. Long enough for two proofs and the gap, short enough that a recruiter finishes it |
| Founder cold email at a tiny startup | **60s** | a founder reading their own inbox gives you less |
| X / LinkedIn DM | **45–60s**, vertical | plays inline, competes with a feed |
| Explicitly requested "tell us about yourself" video | up to **2:00** | they asked, so the budget is real. Still never over |

Two projects at 75–90s. **One** project under 60s. Three is a portfolio review, not an
application, and it is the most common way these go wrong.

### What the brief must contain

Eight sections. Sections 3 and 6 are the ones that make it worth writing.

1. **The one-line target** — company, role, grade, where he applies, deadline pressure.
2. **What they actually do**, in two sentences, in language he could say out loud. Not their
   marketing line. If you cannot explain their product simply, the research isn't done.
3. **The research detail.** One specific, checkable, non-obvious thing that proves he looked:
   a tool they built, a paper, a named audit, a post-mortem, how their process differs from
   competitors. **Generic praise is worse than saying nothing** — "I love what you're building"
   is the exact sentence that marks a mass-applier. This section is the whole reason the brief
   exists.
4. **Founders and who's watching** — names, backgrounds, what they personally care about, and
   who will actually watch this video (founder? recruiter? engineer?). The register changes.
5. **Their vocabulary** — 3–5 exact terms they use. He should say **at most one** of them.
   More reads as mimicry, and `profile/voice.md` allows exactly one mirrored phrase.
6. **The framing decision, with the tension named.** Which of his projects map onto this role,
   and **where the map breaks**. Many good leads are not a clean fit; pretending otherwise is
   how a video gets worse than no video. Name the gap here so section 8 can use it.
7. **The beat map** — the five beats below, with a target duration and the point of each.
8. **The rough script** — see the rule below.

### The script rule — CORRECTED 2026-08-17

This section used to say the opposite, and it was wrong. It read: *"scaffolding, not a
teleprompter… beats and talking points, not sentences to read"*, on the theory that a read
script sounds read.

**Shivam corrected it: he does not speak comfortably off the cuff on camera, and a brief full of
talking points means the recording never gets made.** No video is a worse outcome than a
slightly-read one, and this is the only channel that has ever produced a personal human reply.

So the brief carries the beats, the facts and the framing, and **the full word-for-word script
comes from `/job-script`** — numbered clips, each to a measured word budget at his real 195 wpm,
in the spoken register from video-ops' `profile/voice-video.md`, plus a speak-only page he keeps
open under the webcam. He uses it as a stick and departs from it wherever he wants, which is his
call to make on camera rather than ours to force by withholding the words.

Section 8 of the brief is therefore just a pointer: which projects, which seam, which gap. Run
`/job-script` for the words.

Rules that carry into both: **no em dashes**, no banned words, every number traceable to
`profile/facts.yaml`.

## Step 0b — assets

```
node scripts/video-assets.mjs --copy
```

Writes `video/assets.json` and copies real 1080p screen recordings into
`video/public/showcase/`. Available today:

| Project | Footage | Best framing | Hero moment |
|---|---|---|---|
| REACTOR / ReacDEFI | 76s | web3, ai-agent | natural-language prompt becoming a live deployed contract |
| rc-agents | 54s | web3, ai-agent | the $0.30 USDC x402 payment firing with no human in the loop |
| Hashtro | 47s | backend-infra | the three services talking to each other |
| FocuClone | 29s | backend-infra | raw recording in, cut timeline out |
| MetroDiaries | 39s | consumer only | weakest technical story, use sparingly |

Plus 4 press logos (Chainwire, CryptoSlate, Blockchain Magazine, BlockTelegraph) for the
credibility stamp, and hero stills.

**Every `proof` line in the manifest is traceable to `profile/facts.yaml`.** Nothing else goes
on screen as a claim. If a number isn't in that file, it doesn't appear — the same rule that
governs every other generated artifact in this repo.

## Step 1 — pick the framing before anything else

The company's JD decides which projects appear and in what order. Read the dossier.

- **web3 / smart contracts** → REACTOR first (grant + press + upstream merge is the strongest
  credential he has), rc-agents second.
- **AI agents / LLM infra** → rc-agents first (agent-to-contract payment is genuinely rare),
  REACTOR's RAG pipeline second.
- **backend / infra / platform** → Hashtro first (3 services, rate limiting, caching, and the
  honest "v1 fell over under load" story), FocuClone second.
- **full-stack / product** → Hashtro, then FocuClone.

Two projects is the right number for a 60–90s video. Three is a portfolio review, not an
application.

## Step 2 — transcribe, never trust the script

Same as `chalkboard-video`: Whisper with token-level timestamps, then word-level karaoke
chunks. He improvises on camera; the transcript is the truth.

## Step 3 — beat map, in this shape

Job videos have a fixed dramatic structure that chalkboard explainers don't. Write the beat
table against the real word timestamps:

```
[0:00–0:08]  HOOK        full-frame face-cam. Name, and the one sentence about why THIS company.
                         No product yet. They are deciding whether to keep watching.
[0:08–0:35]  PROOF 1     stage = project footage full-bleed, face-cam drops to PiP.
                         Chalk callout stamps the number as he says it.
[0:35–1:00]  PROOF 2     second project. Same treatment, different hue.
[1:00–1:15]  THE GAP     back toward face-cam. The honest limitation, stated plainly.
                         This is the beat that makes the rest believable — do not cut it.
[1:15–1:30]  CLOSE       face-cam full-frame, live links on screen, one question to them.
```

**The GAP beat is not optional.** Shivam's voice rules (`profile/voice.md`) are built on stating
limits plainly, and the one application that got a personal reply led with an honest gap. A
video that only claims wins reads like every other one.

## Step 4 — layout

Use `WideStage.tsx` from the chalkboard templates — landscape stage + face-cam PiP + full-screen
zoom windows is exactly this shape, already written.

- **Landscape 1920×1080** for email attachments and ATS uploads (the default).
- **Vertical 1080×1920** only for an X/LinkedIn DM, where it plays inline. Reframe the stage
  as a phone-shaped window, do not letterbox.
- Face-cam PiP bottom-right, ~22% width, rounded, thin chalk border so it reads as deliberate.
- **Never let the PiP cover UI he is pointing at.** Move it, don't shrink it further.

## Step 4b — the on-screen panels come from the CODE, not the footage

`node scripts/ui-recon.mjs` reads his actual project repos and writes `video/ui/{project}.json`:
real design tokens, the component inventory, routes, and on-screen copy.

**Why this beats cropping the recordings.** A 1080p screen recording scaled into a 400px panel
is mush, and mush is indistinguishable from a stock template. Rebuilding a miniature of the real
screen in Remotion, from the real palette and the real type, stays sharp at any size and lets a
stick figure point *at a specific element*.

Extracted and verified:

| Project | Palette | Type | Screens |
|---|---|---|---|
| Hashtro | `#0a0a0f` bg, `#d4a017` gold, `#f5c842`, `#22c55e`/`#ef4444` win-loss | Space Grotesk, Aldrich, Inter | `AstroCard`, `TradeConfirm`, `TradeExecution`, `TradeResults` |
| REACTOR / ReacDEFI | `#18181b`, `#3f3f46`, `#27272a`, `#a1a1aa`, `#f5f5f5` | (glass-card, Tailwind) | `automations`, `markets`, `web3` |

Use the recordings for the **wide establishing shot**, the rebuilt panels for **anything a
stick figure interacts with**. Re-run after any UI refactor; the script reports a screen it
can no longer resolve rather than rendering an empty panel.

## Step 5 — annotate the real UI

This is the craft of this skill. While footage plays:

- **Circle the thing he names**, on the frame where he names it, timed to the word.
- **Number stamps** land on the beat: `$9,000`, `160 users in 48h`, `$0.30 USDC`. Use the
  count-up from `anim.ts`, then hold. One number per board, never a dashboard of them.
- **Zoom** into the region that matters rather than showing the whole 1080p frame — a hiring
  manager on a laptop cannot read a full-screen app at 1/4 scale.
- **Freeze** the footage under a callout when he explains something static, then resume. A
  moving background under a static point costs comprehension.
- One hue per project, carried across every annotation for that project.

## Step 6 — captions, sound, verify

- Karaoke word tracer (`KaraokeCaptions.tsx`), placed to never block the UI. **Assume it is
  watched muted** — an ATS reviewer at their desk will not turn sound on. The captions are the
  primary channel, not an accessibility afterthought.

**Audio: `node scripts/video-audio.mjs`** (`--cues` prints the sheet without generating).

Still **no background music** — beds were tried in the X videos and cut, and on a job
application they make it read like an ad. But five **stingers** exist, one per beat, because a
1–2 second musical moment marks a beat without carpeting the video:

| Sound | Lands on | Character |
|---|---|---|
| `sting-open` | first frame | one warm note, so it doesn't open on dead air |
| `ui-appear` | a panel drawing on | 0.35s tick, not music |
| `sting-proof` | **the number stamp** | rising minor third to a fifth. The cue viewers remember |
| `sting-gap` | the honest limitation | deliberately unresolved second. It should sit slightly wrong |
| `sting-close` | the links appearing | the only resolved chord in the video. The full stop |

**Max two cues per beat.** More reads as a slot machine. Stingers ~0.30, `ui-appear` ~0.22,
everything under the voice. Standard SFX (chalk-write, pop-soft, whoosh) still come from the
chalkboard library: copy its `synth.mjs` into `video/scripts/` and run it once.
- Verify by looking: `npx tsc --noEmit`, then still-render the key beats
  (`npx remotion still <id> --frame=N --scale=0.4 out.png`) and actually open the images before
  the full render.

## Step 7 — deliver

- Render to `applications/{company}/video.mp4`. Keep it **under 25MB** so it attaches to an
  email without a Drive link — most ATS upload fields cap well below that too.
- Log it in the tracker row: `channel: email + video`.
- **Never send it.** Same rule as everything else here: it goes in the folder, he reviews it,
  he sends it.

## Hard rules

- Every on-screen claim traceable to `profile/facts.yaml`. No invented metrics, ever.
- **No em dashes** in any on-screen text or caption — same ban as every other artifact.
- Every motion a pure function of `useCurrentFrame()`; every random value seeded. Remotion
  renders on parallel workers and non-determinism produces corrupted output.
- If the recording is unusable (audio clipping, unreadable screen capture), **say so and ask
  for a re-record.** Polishing a bad take wastes his time and produces something worse than
  no video.

## Related

`chalkboard-video` (the engine) · `company-research` (framing) · `outreach` · `apply-pack` ·
`profile/facts.yaml` · `profile/voice.md` · `scripts/video-assets.mjs`
