# Trackerbot — dossier (2026-10-04)

**Lead:** Full-Stack Developer (Node.js), REMOTE, €35-45k/year. HN Who is hiring, October 2026,
item 49926228, posted 2026-10-01 by the CTO/co-owner (HN `dobrevd10`).
**Apply:** email dobrev.d10@gmail.com "with your LinkedIn, GitHub, CV, or whatever best
demonstrates your experience". No form, no ATS.
**Process (stated):** short intro call → small take-home → discussion of your solution → offer.
"No LeetCode and no six-round interview process."
**Grade: A.** Stack is his (Node.js, PostgreSQL, AWS S3), no years bar, fully remote with no
location wall, a named human reads the email, and €35-45k is roughly 34-43 LPA, above his 10-18 LPA
range. Gaps: Chrome extension development ("a big plus"), Heroku ("a plus"), eBay/Amazon APIs.
**Prior contact:** none (Gmail searched for trackerbot / dobrev.d10 / trackerbot.me; not in
tracker or leads).

## Product in one paragraph (as a user, if possible)
Trackerbot is for eBay and Amazon dropshippers. When a seller buys an item from a supplier (often
Amazon or AliExpress), Trackerbot picks up the supplier's tracking number and uploads it to the
marketplace order automatically, so the seller's "late tracking" metric stays clean
([trackerbot.me](https://www.trackerbot.me)). It can convert Amazon/AliExpress tracking into
carriers like Aquiline/VDtrack/Bluecare Express so eBay validates it and the buyer doesn't see
Amazon as the source ([Chrome Web Store listing](https://chromewebstore.google.com/detail/trackerbot/gfdldleopmcdjppengcjkpfafjhcabpj)).
It also monitors delivery status, sends auto messages to buyers at sold/shipped/delivered, nudges
for feedback, and has a title builder. **PasteMe** is a companion extension that copies a buyer's
name and address from the marketplace into the supplier's checkout in one click, even between
computers ([PasteMe listing](https://chromewebstore.google.com/detail/pasteme/mldpfbeejkkbecmfingchdolpfpglnog)).
Three products: Trackerbot Auto (eBay API), Trackerbot Non-API (the extension uploads from the
seller's browser, "keeping your account stealth"), Trackerbot for Amazon. 14-day free trial, plans
$14.99-$109.99/mo capped by trackings per month and seller accounts
([pricing](https://www.trackerbot.me/pricing)). Not used first-hand: it needs a live eBay/Amazon
seller account.

## People (founder/HM + contact paths + common ground)
- **Dobri Dobrev**, CTO and co-owner, wrote the HN post and reads the applications. Previously
  Senior Product Manager at Yahoo! ([LinkedIn](https://www.linkedin.com/in/dobri-dobrev-a75b7855/),
  background via [The Recursive](https://www.therecursive.com/bootstrapped-e-commerce-startup-trackerbot-gets-acquired-by-quadra-group-to-grab-the-shopify-market/)
  and CB Insights search snippets). Product-manager-turned-CTO: expect him to care about
  shipping features end to end and owning them, which is what the post says.
- **Valentin Delkov**, co-founder, previously ran multimillion-dollar eBay/Amazon stores (same
  sources). The domain expert.
- **"Stan"** runs the YouTube channel ([youtube.com/c/Trackerbot](https://www.youtube.com/c/Trackerbot)).
  Marketing/education, not engineering.
- Team: 3 engineers including Dobri; office in Sofia, Bulgaria (optional).
- **Common ground with Shivam:** queued background jobs with retries (CodeSM, Hireflow), browser
  automation on pages he doesn't control (Hireflow, Playwright), a credit ledger (klimb.io).
  No shared network, no India link. Cold email is the channel and the one he asked for.

## Momentum (stage, raise, hiring signals)
- Bootstrapped and profitable (HN post). **Quadra Group / Quadra Capital Partners took a majority
  stake in January 2023**, framed as a push into the Shopify market
  ([The Recursive, 2023-01-25](https://www.therecursive.com/bootstrapped-e-commerce-startup-trackerbot-gets-acquired-by-quadra-group-to-grab-the-shopify-market/), paywalled; stake size unknown).
  No Shopify product visible on the site today, so that plan's status is unknown (GUESS that it's
  still on the table).
- "Trusted by over 8,000 sellers in 20+ countries"; Trackerbot extension at 10,000 users,
  PasteMe at 2,000.
- Shipping: Trackerbot extension v0.2.12.27 released 2026-10-01.
- Hiring: one engineer to grow a team of 3. Also cross-posted to freehire.me. First time we've seen
  them on HN.
- Reviews: 4.0 on Trustpilot (23 reviews), 4.2 on the Chrome store (22 ratings). Integrates with
  AutoDS ([partner page](https://www.autods.com/partners/trackerbot/)).

## Their vocabulary (3–5 exact phrases, with source links)
- **"never lose a case again"** ([home](https://www.trackerbot.me)), the eBay INR case framing.
- **"keeping your account stealth"** (Chrome store listing), their name for non-API mode.
- **"take features from idea to production"** (HN post), what the seat is.
- **"comfortable working independently on a production SaaS product"** (HN post).
- **"Trackings uploaded"**, "trackings" as a count noun everywhere. Using "trackings" once in the
  email reads like someone who read their site.
Mirror at most one.

## Architecture, as far as it is visible
Express on Heroku (≥5 web dynos, session affinity on), PostgreSQL, S3, server-rendered pages with
jQuery, plus two Chrome extensions that do the marketplace work in the seller's browser in
non-API mode. The work is a per-order scheduled job: wait for supplier tracking, convert, write to
eBay/Amazon, watch delivery. Full read in [tech-read.md](tech-read.md).

## What I'd do in week one (2–3 specific initiatives)
1. **A per-account "uploads stalled" check.** I'd add a scheduled job that flags any seller whose
   orders have had supplier tracking available for more than N hours without a successful upload,
   and alert them (and support) before eBay's metric does, because the worst review they have is a
   seller finding 50 orders un-uploaded after five days.
2. **Idempotent uploads with a read-back.** I'd key each upload on order id + tracking number, and
   in non-API mode have the extension confirm the tracking shows on the order before marking it
   done, so retries can't double-write and "submitted" doesn't get mistaken for "landed".
3. Only if they're feeling it: **move whatever needs session affinity into Postgres/Redis** so a
   daily dyno cycle doesn't drop state. (GUESS that this hurts them; ask first, see tech-read Q2.)

## Which Shivam framing wins here
**backend_framing, aimed at reliability of background work.** Lead with CodeSM (BullMQ + Redis
off the request path, retries) and Hireflow (per-stage queues so one blocked source can't stall
the rest, Playwright on pages he doesn't control, SHA-256 dedup). Back it with klimb.io's credit
ledger. The role is called full-stack and he'll touch UI, so the resume should keep React/Next.js
visible, but the story is "the jobs that upload trackings don't go quiet".
Name the gaps plainly: no shipped Chrome extension, no eBay/Amazon API work, Heroku only in
passing. Don't bluff the extension. Point at Hireflow's Playwright work as the nearest thing.

## Draft answers
(Voice per `profile/voice.md`. No em dashes. Shivam edits before anything goes out.)

- **Why Trackerbot?**
  Your customers' worst day is a late tracking upload, because it lands on their seller metrics,
  not yours. That makes the boring part of the product, a job that waits for a tracking number and
  writes it to eBay, the part that has to never go quiet. That's the kind of backend work I like
  most. At CodeSM I run grading as BullMQ jobs off the request path with retries, and in Hireflow I
  split ingestion and Playwright automation onto separate queues so one blocked source can't stall
  the others. I'd like to do that for a product with 8,000 sellers depending on it.

- **Why this role?**
  A team of three on a profitable product means I'd own features from idea to production instead
  of a slice of one. Node.js and Postgres are what I work in every day. The part I haven't done is
  ship a Chrome extension to real users, and in non-API mode that's where your uploads actually
  happen, so it's the thing I'd want to learn first.

- **Expected salary:** the posting says €35-45k. Default answer: "The €35-45k range in the post
  works for me." (facts.yaml's USD figure is lower than this range; don't quote it here.)
- **Start date / notice:** "I can start immediately. I have no notice period." (facts.yaml)
- **Location:** "I'm in India and work fully remote. I'm comfortable overlapping with Sofia
  hours." (India is UTC+5:30, Sofia UTC+3 in summer, so a 2.5-3.5h gap. The overlap claim is
  a GUESS about his willingness; confirm with Shivam.)
- **Take-home:** expect Node.js + Postgres, probably something with a scheduled job or an API
  integration. Not a form field, but worth a prep note.
