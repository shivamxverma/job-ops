# Trackerbot — outreach (2026-10-04)

**Channel:** email **dobrev.d10@gmail.com**, Dobri Dobrev (CTO/co-owner). It's the apply channel
from his HN post (item 49926228): "email me with your LinkedIn, GitHub, CV, or whatever best
demonstrates your experience". So the CV goes on this first email, unlike a cold one.
**Attach:** `applications/trackerbot/resume.pdf`. **You attach it by hand in Gmail**: the Gmail
tool can't carry a PDF (see learnings.md, "Attaching a PDF through the Gmail MCP").
**Gmail draft:** created 2026-10-04, no attachment yet.

---

**To:** dobrev.d10@gmail.com
**Subject:** Full-Stack Developer (Node.js) from HN: Shivam Verma

> Hi Dobri,
>
> Applying for the Full-Stack Developer (Node.js) role from your HN post.
>
> The part of Trackerbot I'd most want to own is the background work that gets trackings onto
> eBay orders. If that stalls for one seller, it can stay quiet until their metrics show it.
> That's the kind of backend I like building. In CodeSM (Node/Express, Postgres, BullMQ + Redis)
> each submission is saved first, then graded in a background job that retries on failure. In
> Hireflow, ingestion from 4 sources, AI processing and browser automation run on separate
> queues, so one blocked site can't stall the rest.
>
> Honest gaps: I haven't shipped a Chrome extension or used the eBay or Amazon APIs yet.
>
> I'm in India, fully remote, happy to overlap with Sofia hours, and can start immediately. CV
> attached.
>
> Shivam
> linkedin.com/in/shivamv99 · github.com/shivamxverma · shivamworks.dev

(Body ~120 words. Mirrored phrase: "trackings". Every claim traces to facts.yaml; the
start-immediately line is `knockout_answers.start_date`, the Sofia line confirmed by Shivam
2026-10-04.)

**Before you send:** read it once out loud and change anything that doesn't sound like you.
Salary isn't in the email on purpose. If he asks, the post's €35-45k range is the answer.

---

## Follow-up (send 2026-10-11 if no reply, same thread)

> Hi Dobri, bumping this in case it got buried under HN replies. Still keen on the Node.js role.
> If it helps, I'm happy to start with the take-home before a call.
>
> Shivam

---

## For the intro call (from tech-read.md §5, ask one, not both)
1. In non-API mode the extension does the upload from the seller's browser. How does the server
   know an upload actually landed: does the extension read the order back, or report success on
   submit? And what happens when a seller's extension hasn't checked in for a couple of days?
2. You run Heroku session affinity across several web dynos. Is that for sessions held in
   memory, or for something long-lived like a connection the extension keeps open?
