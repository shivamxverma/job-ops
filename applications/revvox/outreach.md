# Revvox: outreach (drafted 2026-10-22, nothing sent)

Two touches, same day, Shivam sends both. Proof chosen off their product: klimb.io voice round (= Dial /
AI first interview), CodeSM (= coding round), DeepDoc eval bug (= their "what broke" ask, and the same
shape as their talked-calls audit). Resume: reused from applications/deciops (AI framing, ats 88), saved
here as resume.pdf. **Attach it to the Gmail draft before sending.**

## 1. Email to hello@revvox.io (their published careers channel)
**Subject:** Working at Revvox
Gmail draft created 2026-10-22 (see tracker row). Text:

> Hi Aastha and Tanay,
>
> Your careers page asks engineers to send what they built and what broke, so here are both.
>
> Built: at klimb.io I wrote the backend for an AI interview platform, including a live voice round on
> OpenAI Realtime (WebRTC) that asks questions from the candidate's resume and scores the transcript.
> Hundreds of candidates went through it. Separately I built CodeSM, which runs untrusted code in 6
> languages inside locked-down Docker containers (no network, read-only filesystem, memory and CPU caps)
> with grading on a BullMQ queue. That is close to your coding round.
>
> Broke: my RAG app DeepDoc kept returning empty answers and I kept tweaking prompts. I stopped and built
> a 36-case eval harness instead, and it showed retrieval needed a pageNumber field that ingestion never
> wrote, which blanked every match. Your talked-calls audit felt familiar for that reason.
>
> One question from reading it: on the 53 mixed calls, is the machine-or-person decision now made live
> on the calling bridge, or only on the finished transcript?
>
> I graduated from IIIT Nagpur this year, I'm a backend intern at poiro.com in Bengaluru, and I'm looking
> for a full-time role. Resume attached.
>
> Shivam
> shivamworks.dev

## 2. LinkedIn DM to Prince Kumar Singh (1st°, Message works)
Target: https://www.linkedin.com/in/iprincekumarsingh/

> Hey Prince, saw Revvox on your profile and went through the site. Liked that the careers page asks
> engineers for what they built and what broke. Closest thing I've built: the backend for an AI
> interview platform at klimb.io with a live voice round that scores the transcript, hundreds of
> candidates through it. Also CodeSM, a Docker sandbox that runs untrusted code in 6 languages, which is
> basically your coding round. Is the team adding an engineer before the 16 Nov launch? Sent the longer
> version to hello@revvox.io too. shivamworks.dev

## If they reply
Prep from tech-read.md §"Two questions". Say the honest gap up front if asked about telephony: the voice
work was WebRTC in the browser, not PSTN calls.

## 3. LinkedIn DM to Prince, v2 (2026-10-23) — USE THIS ONE
The email to hello@revvox.io bounced on 2026-10-22 (550 5.1.1, "account does not exist") even
though it is the address on revvox.io/careers, and it went without the resume (3 KB). The v1 DM
above was never sent. This replaces both. Attach applications/revvox/resume.pdf in the DM.

> Hey Prince, heads up first: hello@revvox.io bounces ("account does not exist"), and it's the
> address on your careers page, so applications sent there are getting lost. I tried it yesterday.
>
> What I was sending: I built the backend for an AI interview platform at klimb.io with a live
> voice round on OpenAI Realtime, hundreds of candidates through it, and CodeSM, a Docker sandbox
> that runs untrusted code in 6 languages, which is close to your coding round. Resume attached.
> Is the team adding an engineer before the 16 Nov launch? shivamworks.dev


## Follow-up 1: LinkedIn nudge to Prince (drafted 2026-10-30, not sent)
Thread checked 2026-10-30: last message is your 10-23 v2 DM with the resume, no reply. The v2 DM
said the klimb.io AI interview + voice round was your work, which facts.yaml retracted on 10-23, so
this nudge corrects it in one line. Target: https://www.linkedin.com/in/iprincekumarsingh/ (Message).
Two touches max: if he is silent by 2026-11-06, Revvox goes to ghosted.

> Hey Prince, floating this back up in case it got buried. One correction to my last message: the AI interview and voice round at klimb.io weren't my work. What I built there was the Postgres credit ledger that tracks usage across 6+ AI features. CodeSM stands as written. Is Revvox adding an engineer before the 16 Nov launch? No worries if not.

**SENT 2026-10-30 19:25 IST** (Follow-up 1 above), verified in the LinkedIn thread.
