# Revvox: tech read (2026-10-22)

Evidence: `node scripts/stack-probe.mjs revvox.io --slug revvox` (stack-probe.json), revvox.io pages
(careers, about, changelog, blog post of 22 Sep 2026).

## What they run (and the line that proves it)
- **Next.js on Vercel** for revvox.io, www and app (`server: Vercel`, prerendered route). The `bom1` in
  x-vercel-id is the edge nearest the prober, not proof of their region.
- **app.revvox.io/api/health** answers `{"ok":true}`; **api.revvox.io** returns 401 (a real API behind auth).
- **Hosts named only in their CSP:** `voice.revvox.io`, `hooks.revvox.io`, `experts.revvox.io` (which
  redirects to interviews.revvox.io, Vercel DNS). voice and hooks 404 at the root.
- **Vendors embedded:** ElevenLabs (voice), Razorpay (checkout/billing), LinkedIn (interviewer sign-in),
  YouTube nocookie. Google Workspace mail.
- **Product contracts from the changelog:** prompt version recorded per call; versioned knowledge base;
  workspaces isolated with shadow mode; go-live gated on saved questions + saved calling policy + a real
  test call; dials refused with a reason until a calling region is approved.

## Problems their shape forces
1. **Live audio cannot live in a Vercel function.** A phone call is a long-lived bidirectional stream;
   serverless functions time out and do not hold sockets. A separate `voice.` host fits a long-running
   bridge process next to the telephony provider. *Hedged: inference from the host name and the
   platform limit, not something they publish.*
2. **Classification after the fact.** Their audit counted "talked" from the transcript, so a machine
   on the line inflated pick-up rate, mis-staged CRM leads and drove retries into voicemail boxes.
   They now count voicemail/screeners as no answer. The hard residue is the **53 mixed calls**: a
   screener says "stay on the line" and a person picks up seconds later.
3. **Rules-based scoring that a person can check line by line** means each score must keep its
   transcript span and the prompt/knowledge version that produced it: an audit trail problem as much
   as a model problem.
4. **Untrusted code in the coding round**: sandboxing, per-language runtimes, hidden tests, timeouts.

## The seam Shivam has already touched
- klimb.io live voice round over OpenAI Realtime (WebRTC) with transcript scoring, hundreds of candidates.
- CodeSM: Docker sandbox with no network, read-only root fs, dropped caps, memory/PID/CPU caps, BullMQ
  queue, early exit on first failing test. Testing use only.
- DeepDoc eval harness: a quiet data bug found by reading outputs case by case, the same move as their audit.

## Two questions only an internals reader would ask
1. On the 53 mixed calls, is the machine/person call now made live on the calling bridge, so the agent
   holds while a screener is talking, or only on the finished transcript? And does a mixed call count
   as one of the attempts for the "stop at two attempts" rule?
2. Since every call records its prompt version and knowledge-base version, when a customer edits a
   scoring rule, do you re-score past calls against the new rule, or does each Pass/Check/Not fit stay
   pinned to the version it was scored under?

## One hedged observation (safe to say)
"Your audit reads like the eval harness I built for DeepDoc: the number looked fine until someone read
the rows." Do not say they have a bug, a weak spot, or how their voice host is deployed.
