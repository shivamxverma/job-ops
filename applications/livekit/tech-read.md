# LiveKit — tech read (2026-10-20)
Cluster: voice/realtime agent frameworks (no `profile/domains/` note yet; candidate for one if a second
company in this shape shows up). Sources: `jd.txt`, `stack-probe.json`, `github-recon.md`, docs pages
read in full: workflows, tasks, agents-handoffs, multimodality/text, server/lifecycle, server/job,
patterns/subagent-delegation (all docs.livekit.io, rendered 2026-10-20). `gh api repos/livekit/agents`
for contributors and releases. The framework is open source, so claims below can be checked in code;
this pass read docs, not source.

## 1. The system, as far as it is visible
- [fact] **One job per room, one OS process per job.** "Each job runs in a separate process to isolate
  agents from each other." (server/job)
- [fact] **Crash = re-dispatch, ~15 s.** "If an agent disconnects from an active room unexpectedly (for
  example, due to an out-of-memory error or crash), LiveKit server detects the disconnection within
  approximately 15 seconds and automatically dispatches a new agent to the room." Deploys drain sessions
  first. (server/lifecycle)
- [fact] **Control hierarchy:** `AgentSession` orchestrates; an `Agent` holds long-lived control and can
  hand off (`update_agent`, or returning an agent from a tool); `AgentTask[T]` takes temporary control and
  `complete(T)`s a typed result; `TaskGroup` runs ordered tasks with backtracking and shares context,
  "summarized on completion". (workflows, tasks, agents-handoffs)
- [fact] **Background work:** async tools, and subagent delegation where "the result arrives in a later
  turn"; tools can be `ToolFlag.CANCELLABLE`. (patterns/subagent-delegation)
- [fact] **Text is a transport feature:** text streams, transcriptions on topic `lk.transcription`,
  speech-synced transcript truncated on interruption. (multimodality/text)
- [fact] Org languages by bytes: Python 37%, TypeScript 28%, Go 16%, Rust 16% (github-recon). Agents
  ships near-weekly (1.8.5 → 1.8.8, Oct 6–15).
- [fact] Docs/status on Vercel + Statuspage (stack-probe attribution: vendor hosts, not their core
  stack). Ashby ATS, 26 roles.

## 2. What they are worried about right now
The JD names it: a **text modality** for channels like SMS, **stateful and durable workflows** spanning
"minutes, hours, or longer", and **agent-to-agent delegation**. The docs already cover in-session
composition (tasks, groups, handoffs, subagents); what they don't describe is state that outlives the
job process or the room.

## 3. The problems this shape forces
- **State lives in the job process.** Chat context, the active agent and TaskGroup progress sit in
  memory in one process. Re-dispatch after a crash starts a new agent; [inference] unless the developer
  persisted state, the conversation restarts. Acute for long or multi-session workflows (an SMS thread
  that resumes the next day has no room or process to live in at all).
- **A room-scoped lifecycle vs. a channel with no room.** "A room is automatically closed when the last
  non-agent participant leaves." SMS has no persistent participant, so text-channel sessions need a
  different anchor than the room. [inference]
- **Delegation across processes.** Subagent results "arrive in a later turn" within one session; an
  agent-to-agent handoff between separate jobs needs a typed contract and at-least-once delivery
  semantics, which is the classic queue problem in a new setting.

## 4. The seam Shivam has already touched
- **Typed steps and groups.** At poiro.com he implemented the node and group system of an AI workflow
  builder: typed ports between generation steps, execution order, groups that run as one sub-workflow
  (stories.md). That is the `AgentTask[T]` / `TaskGroup` shape on a canvas.
- **Realtime voice.** klimb.io: a 3-stage AI interview backend with a live voice round on OpenAI
  Realtime; plus a separate voice interviewer module (WebRTC to OpenAI, backend sideband WebSocket,
  separate transcription, LLM evaluation) whose known gap is finalization/idempotent evaluation.
- **Persisted job state.** CodeSM writes PENDING before enqueueing and moves it RUNNING → COMPLETED in
  workers, with Redis status cache over Postgres. Same instinct the durable-workflow work needs.
- Honest gaps: no LiveKit/WebRTC-at-scale, has not read the agents source yet, ~10 months professional.

## 5. Two questions only an internals reader would ask
1. When a job crashes mid-`TaskGroup` and the server re-dispatches within ~15 s, does the new agent get
   anything back (chat context, which task was active, the typed results already completed), or is
   durable workflow state meant to sit outside the job process entirely?
2. For the text modality over SMS, what anchors a session when there is no room to keep alive between
   messages hours apart: is the plan a room per message burst, or a session object that isn't tied to a
   room at all?

## One hedged observation (usable in outreach)
"From the docs it looks like a session's workflow state lives in the job process, and crash recovery is
a fresh dispatch, so I'm guessing the durable-workflow work is about where that state lives next."
