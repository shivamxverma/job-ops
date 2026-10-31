# Sarvam — dossier (2026-10-27), for the Infrastructure Engineer (CPU Infra) seat

Posting: https://jobs.ashbyhq.com/sarvam/f09b6a35-e2d1-4833-8bc5-2b495991d882 (published
2026-10-26 06:29 UTC, Bengaluru, full-time, no comp listed). One of 45 open Ashby roles.

**Already applied here twice this week** (C lane, 2026-10-23): SDE Tejas and Agent Engineer, both
`sent`, no reply. A third application to the same company inside a week is fine at a 45-role
company, but this one should read as the deliberate pick, not a spray: lead with why infra.

## Product in one paragraph
Indic-language AI "used at population scale": speech, text and document models for 22 Indian
languages plus English, sold as REST, WebSocket and batch APIs (STT, TTS, translation, chat,
document extraction), with Python/JS SDKs (docs.sarvam.ai/llms.txt). On top: no-code platforms,
namely Samvaad voice agents (phone and chat in 11 languages, from ₹3/min, bring-your-own telephony or
rent a number), Cowork agents wired into Gmail/Slack/Notion, coding agents, Doc Agents and
Content Studio (dubbing, voice cloning). Consumer app "Indus by Sarvam" on the App Store,
updated 2026-10-20 (stack-probe). Status page (status.sarvam.ai) tracks ~20 components across
APIs, Voice Agents (Calls, Telephony, Call Scheduling, RAG) and agents; Jul–Oct 2026 uptime
99.77% for Chat Completion (lowest), 99.95% Telephony, 99.97% for most speech APIs.

## People
- **Hiring team for CPU Infra: not named anywhere public.** GUESS: reports into whoever owns
  platform; no LinkedIn post found.
- Rohit Agrawal, Staff SRE at Sarvam ("Building GPU Infra"), 2nd°, Follow-only (no Connect):
  https://www.linkedin.com/in/rohit-agrawal-kroozz/. GPU side, so adjacent rather than the
  hiring manager. A connect would need a note, and October's personalised invites are used up.
- Kartik K., ex-Sarvam FDE (now ElevenLabs), IIIT Nagpur, invite pending:
  https://www.linkedin.com/in/kartikkinge/. Could say who runs CPU infra once he accepts.
- No current IIIT Nagpur alum found at Sarvam (LinkedIn school search, 2026-10-27).
- Public GitHub (sarvamai) top committers are SDK/devrel (adityachaudhary-sarvam, vinayak-sarvam);
  not infra. See github-recon.md.

## Momentum
- 45 open roles on Ashby (2026-10-27), this one posted the day before. Hiring across the board.
- Funding (from memory, VERIFY before quoting): $41M Series A in Dec 2023 led by Lightspeed with
  Peak XV and Khosla; picked under the IndiaAI Mission in 2025 to build a sovereign foundation
  model. The JD's "Indian sovereign clouds" line fits that.

## Their vocabulary (from the JD, the only first-party source for this seat)
- "everything outside the GPU fleet"
- "notice something done by hand every day, ask why it can't run itself"
- "builds and runs what it builds"
- "has built infrastructure outside a ticket"
- "fixes causes rather than the same symptom twice"

## Architecture, as far as it is visible (full detail: tech-read.md)
Cloudflare in front of every own host (sarvam.ai, docs, dashboard, auth, k.sarvam.ai); a
k8s-style `/healthz` on sarvam.ai; `api.sarvam.ai/version` answers `0.0.0`, and `x-request-id`
is date-prefixed (`20261027_<uuid>`). Azure Blob + Azure Front Door embedded on their pages, and
SigNoz Cloud's India ingest (`ingest.in.signoz.cloud`), so OpenTelemetry for frontend telemetry
at least. Docs on Fern, CMS on Sanity, status on incident.io (Next.js RSC headers on status.).
JD adds: K8s across Azure/AWS/GCP + Indian sovereign clouds, Cloudflare, identity, secrets,
observability, cost, CI/CD; real-time voice and WebRTC underneath the agents.

## What I'd do in week one
1. Shadow on-call and keep a tally of every manual request (access, provisioning, "why is my
   deploy stuck"), then automate the top one first, the way the lint package list became
   discovery from `pyproject.toml` at poiro.
2. A secrets sweep across repos and images: the dependency upgrade at poiro is where he found
   provider keys committed in old configs and pushed for rotation rather than deletion.
3. An alert-triage helper in the JD's own shape: reads the firing alert plus the last deploys
   for that service and posts a likely-cause line, human approves anything that acts.

## Which framing wins
**backend_framing**, leaning infra: Yuvro (orchestrator that owns per-project K8s Deployments,
Services, Ingress), CodeSM (hardened Docker: no network, read-only root, caps dropped, cgroup
limits), poiro CI/lint enforcement and the 70-dependency upgrade, the Celery event-loop fix.

## Gaps (state, never paper over)
- 2–5 yrs asked; he has ~10 months of internships. Their hard filter is "built infrastructure
  outside a ticket and can show the code", which Yuvro meets.
- No Terraform, Prometheus/Grafana, on-call rotation or cloud certification in facts.yaml.
- AWS is EC2/S3 only; no Azure/GCP.

## Draft answers
- **Why Sarvam / this role?** "The line that got me was asking why something can't run itself.
  The work I'm proudest of at poiro is exactly that: lint was advisory and only ran on a hand-kept
  list of packages, so new packages were never checked. I made it blocking in CI and pre-push and
  made discovery read pyproject.toml, which picked up 4 packages nobody had been checking. On my
  own I built Yuvro, a cloud IDE where a FastAPI orchestrator provisions a Kubernetes deployment,
  service and ingress per project. I want to do that full time on infrastructure that runs voice
  and speech for a whole country."
