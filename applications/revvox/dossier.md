# Revvox: dossier (2026-10-22)

**Source:** warm network. Prince Kumar Singh is a 1st° connection whose headline reads "Founder, Revvox ·
AI voice agents that call your leads and interview your candidates · First clients live, public launch
16 Nov · revvox.io". Found by /network-scout lens 1 (1st° founder search), not a posting.

## What they do
AI calling agents for businesses that pay for leads and applicants. The agent ("Vira") calls each lead
or applicant within minutes, inside the customer's calling hours, in 10 languages, asks the customer's
questions, scores answers by the customer's rules (not the model's) and pushes the outcome to the CRM.
Products: **Dial** (applicant phone screening: Pass / Check / Not fit, interview booked on the call),
**Loop** (sales lead qualification), **Talk** (website chat that calls back), plus interview rounds:
a **coding round in a sandbox with hidden tests** (early access), expert interviews, mock interviews.
Pricing per lead or applicant handled, not per minute.

## People
- **Founders per revvox.io/careers:** Aastha Bewaja and Tanay Bewaja.
- **Prince Kumar Singh** (1st°, linkedin.com/in/iprincekumarsingh): headline says Founder, Revvox; his
  About says he leads tech at Offline by Happy Hour (consumer app, backend, internal tools) and runs
  HyperBrain Labs (MVP studio). Revvox was first tested at Offline by Happy Hour: 30,000+ real calls
  (revvox.io/about). So he is inside the build either way, but the site does not list him as a founder:
  **don't call him "the founder" in the email to hello@**, and let him define his own role.

## Hiring
- revvox.io/careers: "No open roles listed right now. We still want to hear from you." Three kinds of
  people wanted; the first: **"Engineers: You have shipped real-time, voice or telephony systems, or a
  TypeScript product people pay for. Send what you built and what broke."** Channel: hello@revvox.io,
  subject "Working at Revvox".
- "Small team, whole problem. Everyone talks to customers, reads transcripts and ships."

## Their vocabulary (use it)
"talked" call, Pass / Check / Not fit, go-live is earned, shadow mode, calling hours, consent,
"the rules decide, not the model", every answer keeps its transcript quote, prompt version per call.

## Evidence they publish (house style is dated numbers)
- Audit 19-22 Sep 2026, one travel customer: 226 of 739 "talked" calls were voicemail or call
  screeners, 53 mixed, 460 real (62%). Talked used to mean "one lead-side line in the transcript".
- Changelog: Jul 2026 every answer keeps its transcript quote; Aug: versioned knowledge base, prompt
  version recorded per call, multi-workspace with shadow mode, go-live gated on saved questions +
  policy + a real test call; Sep: calling regions approved before first dial.

## Why Shivam fits (all traceable to facts.yaml / stories.md)
- klimb.io: backend for a 3-stage AI interview platform incl. a live voice round (OpenAI Realtime over
  WebRTC) that asks from the candidate's resume and scores the transcript; hundreds of candidates.
  This is Dial + AI first interview.
- CodeSM: sandboxed code execution, 6 languages in locked-down Docker, BullMQ grading off the request
  path, test cases with early exit. This is their coding round. Testing use only, never claim users.
- DeepDoc: the eval harness that found a silent ingestion bug (missing `pageNumber` blanked every
  match). Same shape as their talked-call audit: a metric that looked fine until the data was read.

## Risks
- No posted role, so no stated level or pay. ~1 year of internships vs "shipped real-time or telephony
  systems": klimb's voice round is the honest claim; he has not done PSTN telephony.
- Founder-identity mismatch above. Small team: expect a take-home or a paid trial.
