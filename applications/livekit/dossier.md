# LiveKit — dossier (2026-10-20)

Role: **Software Engineer, Agents**, remote (North America / EMEA / APJ), $135K–$300K + equity.
Posting: https://jobs.ashbyhq.com/livekit/1757f49e-7e19-4c45-85f7-e4637dff66fb (published 2026-08-11,
re-promoted in HN Who is hiring, item 49997244). Full JD saved in `jd.txt`.

## Product in one paragraph (as a user, if possible)
LiveKit is an open-source WebRTC stack (`livekit/livekit`, Go, ★21.7k) plus a cloud, and on top of it
the **Agents framework** (`livekit/agents` Python ★14.9k, `agents-js` Node): you write an
`AgentSession` with STT → LLM → TTS (or a realtime model), the agent server dispatches one job per
room, and the framework handles turn detection, interruptions, tools, handoffs and tasks. Customers
named in the JD: OpenAI, Salesforce, Spotify, Meta, "billions of calls each year". Shivam has not
built on LiveKit yet. GUESS-free next step before applying: run the voice quickstart once so the
answers can say "I built X on it".

## People (founder/HM + contact paths + common ground)
- **Russ d'Sa**, co-founder/CEO — https://www.linkedin.com/in/russelldsa/ (from HN post).
- **David Zhao**, co-founder/CTO — https://www.linkedin.com/in/davidzhao/ ; still commits (`davidzhao`,
  14 commits org-wide in 90 days, github-recon.md).
- **Agents repo, most active last 90 days** (`gh api repos/livekit/agents/commits`): chenghao-mou (8),
  adrian-cowham (8), longcw (6), tinalenguyen (5), shawnfeldman (4). Likely Agents-team interviewers.
  Hiring manager: GUESS, not identified; do not name one in outreach.
- Common ground: none personal. Technical common ground is strong (see seam below).

## Momentum (stage, raise, hiring signals)
- **$100M Series C at a $1B valuation, Jan 22 2026, led by Index Ventures**, Salesforce Ventures new;
  ~$183M raised in total. Series B $45M, Apr 2025. Sources:
  [SiliconANGLE](https://siliconangle.com/2026/01/22/livekit-raises-100m-1b-valuation-scale-real-time-ai-media-platform/),
  [Fortune](https://fortune.com/press-releases/livekit-raises-100m-1b-valuation-voice-first-computing-2026-01-22).
  A $40M Series C-1 (Aug 2026) appears on one site only: unverified, don't cite.
- **26 open roles on Ashby** (stack-probe), heavy on engineering: Agents, Distributed Systems (Senior +
  Staff), Backend Real-Time Media, Forward Deployed (US/UK/IE), Developer Success.
- Agents releases weekly: livekit-agents 1.8.5 → 1.8.8 between Oct 6 and Oct 15.

## Their vocabulary (3–5 exact phrases, with source links)
- "the infrastructure layer for the agentic era of computing" (JD, About LiveKit)
- Tasks "run to completion and return a typed result" / "take temporary control" ([workflows doc](https://docs.livekit.io/agents/logic/workflows.md))
- "the result arrives in a later turn" ([subagent delegation](https://docs.livekit.io/agents/logic/patterns/subagent-delegation.md))
- "Split workflows only when you encounter a concrete limitation" ([workflows doc](https://docs.livekit.io/agents/logic/workflows.md))
Use at most ONE of these in any message (voice.md rule 4).

## Architecture, as far as it is visible
Go SFU + Cloud; agent server registers with LiveKit, receives a job per room, **runs each job in its
own process**; on an unexpected agent disconnect the server re-dispatches a new agent in ~15 s
([lifecycle](https://docs.livekit.io/agents/server/lifecycle.md)). Session logic = `AgentSession` →
`Agent` (long-lived control, handoffs) → `AgentTask[T]` (typed result) → `TaskGroup` (ordered steps,
backtracking). Text rides on LiveKit text streams (`lk.transcription`). Details: `tech-read.md`.

## What I'd do in week one (2–3 specific initiatives)
1. **Checkpoint TaskGroup progress outside the job process**, so a re-dispatched agent can resume at
   step N with the collected typed results instead of restarting the conversation. Start as an opt-in
   store interface (in-memory default, Redis/Postgres adapters), because that is the smallest step toward
   the "durable workflows" line in the JD. (Inference: the docs don't say state survives re-dispatch.)
2. **A text-channel test harness** for the new text modality: drive the same `AgentSession` from scripted
   SMS-style turns with no audio pipeline, so text-mode regressions show up in CI the way the voice evals do.

## Which Shivam framing wins here
**ai_framing, held up by backend_framing.** The seat is "LLM-based applications and agentic systems" +
"state, concurrency and asynchronous workflows" + "developer APIs". Lead with: klimb.io's 3-stage
interview backend whose live voice round runs on OpenAI Realtime; the poiro.com typed node/group
workflow builder (typed ports, execution order, groups that run as one sub-workflow, which is the same
shape as `AgentTask[T]` + `TaskGroup`); DeepDoc's eval harness. Backend proof: CodeSM's queue
(PENDING → RUNNING → COMPLETED persisted outside the request). Gap, say it if asked: no LiveKit or
WebRTC-at-scale experience, ~10 months professional.

## Draft answers
**DO NOT PASTE THESE INTO THE LIVEKIT FORM.** The Ashby form says: "for the application process, we ask
that you don't use AI assistance" for its two engineering questions. Shivam writes those himself. These
notes are background for a call or a later conversation only.

- **Why LiveKit?**
  > Your workflow docs say to split an agent only when you hit a concrete limitation, and then pick the
  > smallest construct: a task that returns a typed result, a task group, or a full handoff. I built the
  > same idea for a different domain at poiro.com: typed nodes for AI generation steps, and groups that
  > bundle steps into a sub-workflow that runs as one unit. Doing that for voice agents, where a step can
  > be interrupted mid-sentence, is the harder version of a problem I already like.

- **Why this role? / What excites you?**
  > The durable workflows part. Right now a job lives in one process, and a conversation that spans hours
  > has to survive restarts, redeploys and the user going quiet. At klimb.io I built a voice interviewer
  > module on OpenAI Realtime (browser audio over WebRTC, a backend sideband socket, a separate transcriber,
  > then an LLM scoring the transcript), and the part I'd redo is exactly this: a clean finalization step
  > and one idempotent evaluation, instead of scoring triggered by whichever results poll comes first.
  > (CHECK WITH SHIVAM: this is the "what I'd fix" story in stories.md; confirm he's happy telling it.)

- **Anything else likely on the form:** location (India, remote), work authorization (no US/EU
  authorization; role is remote APJ so not needed), salary (USD $20,000–35,000 per facts.yaml; consider
  leaving blank or "open" since their band starts at $135K, his call), how did you hear (Hacker News).
