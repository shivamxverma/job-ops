# SViam — dossier (2026-10-22)

Role: **Founding AI Engineer**, Bengaluru / Remote, full-time. LinkedIn job 4481588356 (posted
2026-10-21); careers page sviam.in/careers/founding-ai-engineer. No years bar. Comp not stated.

## Product
Maya, an AI technical interviewer: the candidate picks a problem, explains their approach and
codes in a browser workspace while Maya asks follow-ups; the session ends in a scorecard with
integrity signals for a hiring team. Sold to engineers (practice, 3 free interviews) and to
companies/campus placement cells (first-round interviews). Backed by ElevenLabs Grants, the Plaksha
Entrepreneurship Support Program 2026, NVIDIA Inception. HQ listed as Palo Alto on LinkedIn
(company page sviam-ai, 58 followers, no employees listed).

Their phrases: "Practice the interview that decides." "A clearer picture of how people think."

## People
- **Vikas Kumar** (linkedin.com/in/vikas-kumar45): built Maya ("a real-time voice agent that runs
  full coding..."). Now **Founding Engineer at The M.A.P. (New York)**; his profile says "Before
  this, I built Maya at SViam". Yet the 2026-10-21 posting and the careers page route applications
  to **vikas.kumar@sviam.in**. Reading: he still screens for SViam, and the new hire takes over the
  Maya seat he built. GUESS, unverified. An intern's post (4 months ago) thanks "Vikas Kumar and the
  team".
- Founder: unnamed on the site ("work directly with the founder").

## The role (careers page + LinkedIn JD)
Build the reasoning loop that drives Maya through an interview; follow-up questions that respond to
what the candidate says and builds; turn live conversation + code into structured, reviewable
evidence; own features to release. Apply: take **3 mock interviews with Maya**, email feedback (what
worked, what felt off, what you'd build) + resume + links to work you're proud of to
vikas.kumar@sviam.in, subject "Application: Founding AI Engineer".

## Why Shivam (the seam is unusually direct)
- klimb.io: backend for a 3-stage AI interview platform, hundreds of candidates, automated
  proctoring, strict candidate-level data isolation, a live voice round on OpenAI Realtime that
  asks questions from the candidate's resume and **scores the transcript** = their "structured
  evidence" problem.
- CodeSM: sandboxed execution of untrusted code for 6 languages = Maya's coding workspace.
- DeepDoc eval harness: how you'd know Maya's follow-ups got better.
- Never claim: the separate GitHub-personalized voice interviewer project's capabilities (facts.yaml
  note), proctoring details beyond "automated proctoring".

## Week one
1. Ground every scorecard claim in a transcript span or a code diff, so a reviewer can click
   through to the evidence instead of trusting the summary.
2. A replay set of recorded sessions to regression-test follow-up quality when the prompt or model
   changes (DeepDoc harness pattern).
