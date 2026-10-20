# Trackerbot — tech read (2026-10-04)

Cluster: `profile/domains/marketplace-seller-automation.md` (written today, first company in it).
Sources: `stack-probe.json` (trackerbot.me), raw headers + login HTML of `app.trackerbot.me`,
Chrome Web Store listings (Trackerbot, PasteMe), the marketing site (pricing, product pages),
Trustpilot (23 reviews), the HN post (item 49926228). No public GitHub org found.

## 1. The system, as far as it is visible
- [fact] **The app is Express on Heroku.** `app.trackerbot.me` CNAMEs to `herokudns.com`; response
  carries `x-powered-by: Express`, `server: Heroku`, `via: 2.0 heroku-router`. The HN post confirms
  Node.js/JS, PostgreSQL, Heroku, AWS S3.
- [fact] **At least 5 web dynos, with Heroku session affinity switched on.** The
  `heroku-session-affinity` cookie decodes to `DynoName: web.5` (session affinity is opt-in on
  Heroku, so they turned it on).
- [fact] **Server-rendered login, jQuery 3.1.1** (Google CDN, a 2016 release), `/js/login.js`,
  a `csrf-token` meta tag plus a `_csrf` cookie.
  - [inference] The `_csrf` cookie + meta-token pair is the default shape of the `csurf`
    middleware. Not proven. Don't say it.
- [fact] **Two Chrome extensions under "SaaS Studio", Sofia:** Trackerbot (10,000 users, v0.2.12.27,
  **updated 2026-10-01**) and PasteMe (2,000 users, v0.1.3.3, updated 2026-08-12).
- [fact] **Two ways to upload a tracking number to eBay:** "Trackerbot Auto" over the eBay API, and
  "Non-API", where the extension "automatically collects tracking details and uploads them to your
  orders" in the seller's own browser, sold as "keeping your account stealth".
- [fact] **Tracking conversion is a metered product.** Amazon/AliExpress tracking gets converted to
  carriers like Aquiline / VDtrack / "BCE" (Bluecare Express) so eBay validates it and the buyer
  doesn't see Amazon. Plans bundle "monthly conversion credits" (200 to 1000) with "bonus
  conversions at $0.05". Plans are capped by **trackings per month** (150 to 5000) and **seller
  accounts** (1 to 10).
- [fact] **Marketing site is a separate no-code site** (Wix-style `/product-page/`,
  `/category/all-products` paths, Fastly in front). Nothing about the product runs there.
- [fact] Scale claims on the site: "8,000 sellers in 20+ countries", "21,579 trackings uploaded"
  per day (the number differs between pages, so treat it as marketing copy).

## 2. What they are worried about right now
- **Upload reliability.** The single most damaging review on Trustpilot: "They failed to enter the
  tracking numbers for 50 of my orders for five days. This software could get your store
  suspended." For their customers a late tracking upload is a seller-metrics hit on eBay, so a
  silent stall is the worst failure the product has.
- **The extension keeps moving.** v0.2.12.x shipped three days before this read. Non-API mode
  works against eBay's own pages, so every eBay UI change is their problem.
- **Hiring a 4th engineer** into a 3-person team to "take features from idea to production"; the
  CTO wants someone "comfortable working independently on a production SaaS product".

## 3. The problems this shape forces
1. **A long-running per-order job with a silent-failure mode.** Each order waits for the supplier's
   tracking to appear, maybe converts it, then gets written to eBay. That's a scheduled, retried,
   per-account job. If one account's job stalls (eBay token expired, supplier page changed, rate
   limit), nothing errors loudly; the seller just finds out days later. Acute here because the
   cost lands on the customer's seller account, not on Trackerbot.
2. **Idempotent writes to the marketplace.** Retry an upload and you can attach the tracking
   twice, or overwrite a correct one. Acute because the same order can be touched by two paths
   (API job and extension).
3. **Work that only runs while a browser is open.** In non-API mode the server can decide what
   needs uploading but can't do it; the seller's extension has to pull and execute. So "uploaded"
   has to be confirmed back, and an extension that hasn't checked in for days is an alert, not
   silence.
4. **State pinned to a dyno.** Affinity on across 5+ dynos means something lives in a dyno's
   memory (sessions, or a connection the extension holds). A dyno restart, which Heroku does at
   least daily, drops it.
5. **A credit ledger.** Monthly allowance + paid overflow at $0.05 + per-plan caps on trackings and
   accounts. That's metering with two pools.

## 4. The seam Shivam has already touched
**Queued jobs with retries, kept off the request path, so one failing source can't stall the
rest.** CodeSM grades submissions in a BullMQ + Redis pipeline outside the request lifecycle with
retries for failed jobs. Hireflow splits ingestion, AI processing and Playwright automation onto
separate BullMQ queues "so a bot-detection block in one stage cannot stall the others", with
SHA-256 fingerprint dedup. That's problems 1 and 2 in a different domain. **Honest distance:**
adjacent, not the same. He hasn't integrated the eBay or Amazon APIs and hasn't shipped a Chrome
extension to users. His Playwright work in Hireflow (driving pages he doesn't control) is the
nearest thing to non-API mode.

Second seam, smaller: **klimb.io's credit ledger** across 6+ AI features covers problem 5.
Third: **Chatterly** fans Socket.io events across server instances with Redis pub/sub, which is
the usual way out of problem 4.

## 5. Two questions only an internals reader would ask
1. **"In non-API mode the extension does the upload from the seller's browser. How does the server
   know an upload actually landed: does the extension read the order back after writing, or
   report success on submit? And what happens when a seller's extension hasn't checked in for a
   couple of days?"**
   - If *"it reports on submit"*: ask whether they've seen eBay accept the form and then not show
     the tracking (that's where a read-back pays off).
   - If *"we alert on stale extensions"*: ask whether the alert goes to the seller or to support.
   - Concept to read first (5 min): how Chrome MV3 service workers are suspended when idle, and
     why extensions use `chrome.alarms` to wake up for scheduled work.
2. **"You run Heroku session affinity across several web dynos. Is that for sessions held in
   memory, or for something long-lived like a connection the extension keeps open?"**
   - If *"in-memory sessions"*: ask whether moving them to Postgres or Redis has come up, since a
     dyno cycle logs those users out.
   - If *"connections"*: ask how they fan a server event to the right dyno (opens the Chatterly
     story naturally).

Hedged observation he can make: "The bonus-conversion pricing reads like a ledger with two pools
(the monthly allowance, then paid at $0.05). I built something like that at klimb.io across 6+ AI
features, curious how you handle a conversion that fails after it's been counted."

## 6. Do not say
- Don't call the 5-day stall a bug in their code. It's one customer's review, undated detail, and
  the cause could be eBay, the supplier, or the seller's own setup.
- Don't mention jQuery's age, csurf, or the missing CSP. Nobody wants a stranger auditing their
  login page in an application email.
- Don't claim eBay/Amazon API or Chrome extension experience. He has neither.
- "Stealth" is their word for non-API mode. Don't comment on what it's stealthy from.
