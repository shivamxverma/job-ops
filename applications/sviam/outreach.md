# SViam — application (2026-10-22, prepared, NOT sent; klimb claims removed 2026-10-27)

Channel: email to **vikas.kumar@sviam.in**, subject **"Application: Founding AI Engineer"**,
resume.pdf attached. Their bar: take **3 mock interviews with Maya at sviam.in first**, then send
feedback + resume + links + what you'd build. Note: Vikas built Maya and now works at The M.A.P. in
NYC; the posting still routes to him (see dossier).

## Step 1: take the 3 mocks (your part, ~1.5 hours)
sviam.in → Start practicing → sign up as a candidate. While doing them, jot down:
1. **One moment a follow-up felt sharp**: Maya caught something about your approach. What exactly?
2. **One moment it felt off**: a follow-up that ignored what you'd just said, a repeat, a lag, a
   misheard term, or feedback that didn't match what you actually did.
3. **The scorecard**: did it point to specific moments (a line you said, a line of code), or only
   give summary judgments? This is the one to watch: it's their "structured evidence" problem and
   the thing your DeepDoc eval harness is closest to (splitting where a failure came from).
4. Anything on integrity signals (tab switches, paste detection) you noticed.

## Step 2: the email (fill the three [brackets] from your notes, keep everything else)

> Hi Vikas,
>
> I took three mock interviews with Maya this week. Feedback first, since you asked for it.
>
> What worked: [one specific follow-up that caught something real, in one sentence].
>
> What felt off: [one specific moment, in one sentence, plus why it mattered to you as the candidate].
>
> What I'd build: [your observation about the scorecard], so I'd tie every scorecard claim to the exact transcript span or code change behind it, so a hiring team can check the evidence instead of trusting the summary. I'd also keep a replay set of recorded sessions to re-run whenever the prompt or model changes, the way my DeepDoc eval harness replays 36 cases and splits retrieval failures from generation failures.
>
> Why me: I built CodeSM, which runs untrusted code in 6 languages in locked-down Docker containers (no network, read-only filesystem, 256 MB and 0.5 CPU per run), graded on BullMQ workers, and adds interview practice on top: resume-personalized questions with written-answer scoring, voiced through Murf AI. That's the same shape as Maya's coding workspace. At poiro.com I'm building the DAG workflow engine behind their AI generation steps.
>
> Resume attached. CodeSM: code-sm.vercel.app
>
> Shivam

Before sending: no em dashes, keep it under ~230 words, and the bracketed lines must be things you
actually saw. If Maya's scorecard already links claims to evidence, swap that line for whatever you
found weakest.

## Step 3: send
Tell Claude "SViam mocks done" plus your three notes. Claude will put the email into a Gmail draft
with clean links and resume.pdf attached (and check it for the redirect-link bug) for you to send.
