# JobOps — Shivam's job-application pipeline

Local-first system to find roles early and apply same-day with tailored, human-reviewed
quality. Copilot, not autopilot: **nothing is ever sent or submitted automatically.** The C
lane (`/autoapply`) is built to submit forms and send application email by itself for
**grade-C leads only**, but **it is not authorised yet**: the 2026-08-19 authorisation was the
previous owner's, and until Shivam explicitly says yes, `/autoapply` drafts only. A/B/D and every
message to a named human stay copilot, always. See the autonomy table in
`.claude/skills/autoapply/SKILL.md`.

**Ownership (2026-09-28):** this repo was built by Harsh Kasana and reconfigured for Shivam
Verma. Harsh's whole pipeline history (applications, tracker, inbox, old profile) is in
`_archive-harsh/`. **Never read it as Shivam's history, never cite a fact from it, and never
contact a company or person from it on Shivam's behalf.** Dated incidents quoted in this file
and in `profile/learnings.md` were measured on Harsh's run; the mechanics transfer, the
specifics do not.

## Pipeline (one lead, start to finish)
0. `/signal-scout` → funding/hiring-expansion signals in `inbox/signals.md` (A–D), ahead of any
   job posting existing. Triage manually, promote a hit into step 1 by starting
   `applications/{company}/` and treating it as a lead sourced from a signal, not a listing.
   `/linkedin-scout` covers the same signal, manually, from LinkedIn — never on a cron.
1. `/job-scout` → scored leads in `inbox/leads.md` (A–F). Work A/B only. `/yc-scout` is the
   deep YC channel: `scripts/yc-scout.mjs` pulls the public ycombinator.com job grid (no
   login) and hard-drops the ~40% that are `US citizen/visa only` plus any company that
   hasn't signed into WaaS in 30d (the ghost-job filter), then pulls the full JD, hiring
   manager, and founder bios per lead. **Applying via workatastartup.com still costs 1 of 5
   per week — prefer a direct email or the company's own ATS.** `/linkedin-scout` is a
   manual, on-demand supplement for LinkedIn job listings and hiring posts. `/x-scout` works
   X the same way, manually, and triages every hiring post L1/L2/L3 before research because
   most "we're hiring" posts on X are engagement bait. `/network-scout`
   works the warm channel: maps Shivam's 1st-degree connections into `inbox/network.md`, finds
   who's hiring inside the network (no signal needed), checks pipeline companies for mutuals,
   and drafts the referral ask. Warm path found → referral ask, not cold email. Its **lens 3
   is the alumni engine** and the highest-volume channel in the system: IIIT Nagpur seniors
   (3,051 on the alumni tab) get asked directly whether their team is taking anyone on, since
   most companies hire without posting and there's no other way to find out. Two-stage, because
   a free account can't DM a non-connection: invite, then the ask on accept, state tracked in
   `inbox/referrals.md`. A senior's "yes we're hiring" is promoted into `inbox/leads.md`.
   **`/linkedin-scout`'s Jobs-tab keyword search is measured broken** for niche stacks (returns
   unrelated roles and promoted ads) — use post/content search for discovery and the Jobs tab
   only company-scoped.
2. `/company-research {company}` → `applications/{company}/dossier.md`
2b. `/tech-read {company}` → `applications/{company}/tech-read.md`. **Mandatory for every A/B
   lead**, and the answer to "how do I show I understand their tech without studying each
   company for hours". Starts with `node scripts/stack-probe.mjs {domain} --slug {company}`
   (~20s: their stack from response headers, their own unpublished hosts from the CSP, the
   embedded vendors, the ATS, the docs surface), then reads the docs/API reference, the status
   page's incident history and the changelog, and lands one page: what they run and the evidence
   for each line, the problems their shape forces, the one seam Shivam has already touched, and
   **two questions only an internals reader would ask**. Those questions are the payload:
   questions scale and cannot be wrong the way a claim can, so the file is optimised for them
   plus one hedged observation. The reusable half lives in `profile/domains/{cluster}.md` (write
   once per cluster, reuse across every company in it) so company seven in a cluster costs ten
   minutes, not thirty. `/learn-before-build` is still the deep path when a lead earns it;
   tech-read is what tells you whether it does.
3. `/tailor-resume` → resume.md, drafter→reviewer loop with `/ats-score` until ≥ 80
4. `/outreach` → founder/HM email drafts (Shivam edits + sends himself)
5. `/cover-letter` → if the form has a letter or long "why us" field (needs the dossier)
6. `/apply-pack` → pack.json → JobOps Chrome extension autofills the form → Shivam reviews
   every field and clicks submit
7. `/outcome` → log in `applications/tracker.md`. **Folder-complete = applied:** the moment
   `applications/{company}/` has everything Shivam needs to send (resume/pack/outreach as the
   channel requires), log the row as `sent` with follow-up +7d and run
   `node scripts/mark-processed.mjs "{company}"` (`[d]` + close issue "completed") — don't wait
   for him to confirm the click. Only exception: he says "I'll apply later" → status `hold`,
   no follow-up clock, no mark-processed. `... --skip` when passing on a lead (`[x]` + close
   issue "not planned"). Harvest lessons into `profile/learnings.md`, which every generating
   skill reads before producing anything — this loop is what makes the system self-improving.
8. Follow-up lifecycle (driven by `scripts/followups.mjs` at session start): `sent` + 7 days of
   silence → draft the follow-up email immediately (Gmail draft when the address is known),
   status `followed-up`, clock +7d. `followed-up` + 7 more silent days → status `ghosted`,
   follow-up `none`. Two touches max, then move on. **`followed-up` means sent, never drafted** —
   caught 2026-08-24 on the previous owner's tracker: three rows were marked `followed-up`
   because a nudge was typed into an open LinkedIn compose box, and the status advanced on the
   typing, not on the send click. Gmail drafts are safe to advance
   status on (`create_draft` is a real, checkable object); **a LinkedIn message typed into a
   thread is not** — there is no draft object to verify, so the status must stay at the prior
   stage until confirmed sent (ask Shivam, or read the live thread) rather than assumed. This is
   also why a "due today" follow-up card can be wrong: check the live thread before treating a
   silent `followed-up` company as ghosted-eligible, in case the second touch never went out and
   what looks like touch 3 is actually a still-owed touch 2.
   **No classification may be left ambiguous.** Every lead/company must land in exactly one of:
   `sent` (one touch out, clock running), `followed-up` (two touches out, clock running),
   `ghosted` (two touches out, silence, follow-up `none`, closed), `awaiting-connection` (LinkedIn
   invite sent but not yet accepted — no message is possible, do not draft one, re-check next
   session), `no-channel` (no email/LinkedIn/form exists — closed, follow-up `none`, say why),
   or `hold` (Shivam said later — no clock). Never hand back "it's unclear" or "somewhere between
   X and Y" without picking one and saying why. Whenever a next touch is warranted, produce the
   **exact message text and the exact target (profile URL or email address)** in the same
   breath — never describe that a follow-up is needed without also writing it.

## The C lane (`/autoapply`) — the one autonomous path
**Not authorised by Shivam yet. Until he says so, run it draft-only: no submits, no sends.**
Steps 1–8 above are the A/B pipeline, worked by hand. **C grades get a separate, cheap,
fully autonomous lane**, because ~350 C leads had accumulated as arrows that were never shot:
"quiet-week filler" assumes quiet weeks, and there were none. `node scripts/c-queue.mjs
[--limit N] [--signals]` picks the batch off `lib/state.mjs` (untouched C leads only) and
*holds* what the lane may not act on: WaaS-credit applies, re-posts from companies already in
the tracker, leads with no link. Then `/autoapply` finds each company's real apply channel,
writes a six-line dossier + a swapped-framing resume (ats floor 70, **one** pass, no loop, no
tech-read, no video, no cover letter), **fills and submits the form itself** and **sends the
application email itself with resume.pdf attached**. It sends bare LinkedIn connection requests
but **only drafts** any message to a named human, into `inbox/handoff.md`. C sends get
follow-up `none` — one touch, so the follow-up queue stays A/B's. Never guesses an address,
never fills a field with an anti-AI warning, never answers anything not in `facts.yaml`, never
touches A/B or any company with a tracker row. The volume this lane produces is also the only
honest sample the system will ever have for "what converts".

## Ground rules (from the "Get Hired in 2026" research)
- Truth lives in `profile/facts.yaml`. Never generate a claim that isn't traceable to it or
  `profile/stories.md`. Missing something useful? Ask Shivam, add it there first.
- All output in Shivam's voice per `profile/voice.md`. Banned words: "leverage", "passionate",
  "thrilled", "seamless", "align perfectly", "proven track record". **Banned punctuation: the
  em dash (—) in anything Shivam sends or submits** (emails, HN replies, cover-letter bodies,
  extension autofill) — it's the top "AI wrote this" tell. Rewrite around it. (En dashes `–`
  in date ranges are fine.) Everything should read like Shivam typed it, not like a model.
- **Replies count as pipeline work.** If a lead's next move is replying to an HN comment/thread
  or answering an email (founder, recruiter, HN poster), draft the exact reply text — don't
  just say he should respond — save it (outreach.md or inbox/replies.md), and at the end of the
  turn tell Shivam what it answers, where it is, and that it's his to review and send. Copilot,
  never autopilot: nothing is sent for him.
- Same true work, framed per audience: backend-infra / full-stack / AI-workflow framings
  (`backend_framing`, `fullstack_framing`, `ai_framing`) in facts.yaml.
- Specific beats generic: every message carries one checkable artifact with a number.
- Day-one applications beat perfect day-ten ones. Speed via the pipeline, quality via the loop.
- Ever-evolving: new answers Shivam writes → `profile/stories.md`; new form questions →
  apply-pack staples; conversion data → scout weights. Periodically suggest updates to the
  portfolio (shivamworks.dev) from what accumulates here.

## Ops
- `PLAYBOOK.md` — the daily/weekly operating routine (what Shivam does vs what the system does).
- **Session start:** run `node scripts/followups.mjs` and surface any overdue follow-ups
  before anything else; act on what it prints (draft follow-ups, mark ghosted) per step 8.
  It ends with a drift count — if it is non-zero, run `node scripts/reconcile.mjs` and clear
  what it lists before trusting any other view. Then run `/check-replies` to sweep Gmail for
  responses from active companies. **Then read `inbox/intents.json`**: every entry with
  `handled: false` is a card Shivam pressed **Work it** on since the last session — that is him
  assigning work without switching to chat, so act on each one (the `note` field says what he
  expected), **set `handled: true`**, and say what you did. That flag is not bookkeeping: the
  board's button reads `queued for Claude` until it flips and `done by Claude` after, so leaving
  it false tells him his request is still untouched. Finish by refreshing the board's cards and
  starting it. **If he is going to be working off the board this session, offer `/go-live`** so
  its buttons reach this conversation instead of queuing for the next one.
- **`scripts/lib/state.mjs` — the one source of truth, and the only thing that joins the four
  stores.** `inbox/leads.md` (the checkbox), `applications/{slug}/` (work on disk),
  `applications/tracker.md` (the outcome) and the GitHub issue board each record a company at a
  different moment, and nothing used to reconcile them, so they drifted until none of them could
  be trusted — which is why 80 issues had to be closed by hand on 2026-08-14. Every consumer
  (`dashboard.mjs`, `followups.mjs`, `reconcile.mjs`) reads this one join. Same rule as
  `keywords.mjs` and `reachability.mjs`: **never re-parse tracker.md or leads.md in a new
  script** — add to `state.mjs` instead. Two parser bugs it exists to prevent, both of which
  silently deleted real applications from every view: `status.split(" ")[0]` turned
  `**rejected 2026-08-13**` into `**rejected`, matching no branch, and a bare date regex dropped
  every follow-up cell written as prose (`+7d from send`, `needs manual check`).
- **`node scripts/reconcile.mjs [--fix] [--refresh]` — the drift report.** Names every place the
  four stores disagree and fixes the one-directional ones (`--fix` closes issues for decided
  leads and marks leads.md where the tracker proves an application went out; `--no-issues` keeps
  it local). Everything ambiguous is only reported, with the exact edit to make. It also flags
  **`reposted-after-close`**: a company that rejected or ghosted Shivam and is now hiring again
  — those are new leads, never auto-ticked.
- **`node scripts/scout-yield.mjs [--days N]` — channel health.** Answers "are we getting fewer
  postings, or is it the market" with numbers instead of a feeling, and `scout-all.mjs` prints
  it after every run. Read **scanned vs. new**: a source scanning 226 and yielding 1 is
  *saturated* (the rest were already seen), not broken; a source whose *scanned* count collapses
  is a broken scrape. Measured shape: the HN monthly thread is a **burst** source — 23-37/day in
  the thread's first week, 1-3/day by mid-month, resetting when the next month's thread opens —
  so the pipeline looks dead mid-month unless the other channels are watched separately. The YC
  grid is the best A/B rate in the system (6 A/B from 8 new in the last 7 days).
- **`scripts/lib/today.mjs` — local dates, never UTC.** Every scout used
  `new Date().toISOString().slice(0, 10)`, which is the UTC date, so any run between midnight
  and 05:30 IST wrote to the *previous* day's file and overwrote it. Use `today()` for any
  date stamp; never inline a `toISOString().slice(0, 10)`.
- **Gmail (MCP):** outreach and follow-up emails with a known recipient also land as real
  drafts in Shivam's Gmail via `create_draft` — recipient + subject + body filled, same voice
  rules. Reading and drafting only; **never send, never delete, never modify his mail.**
- **`node scripts/scout-all.mjs` — the morning run.** "Let's start all the scouts" means
  **all** of them, and `/all-scouts` is the skill that enforces it: this script covers the
  six scriptable channels (HN thread, HN job stories, remote boards, YC, Indian startup
  boards, funding signals) in about a minute, then
  prints the three browser channels (`/x-scout`, `/linkedin-scout`, `/network-scout`) as an
  explicit checklist. **Never report a run as done while a channel is unrun** — say which one
  and why. A partial run is fine; a partial run reported as complete is not. Fault-tolerant:
  one dead source never kills the rest.
- **`node scripts/ats-scout.mjs` — the India channel** (`--rediscover`, `--ignore-seen`,
  `--all`, `--discover-only`, `--only a.com,b.com`). Added 2026-10-21 because every other
  scripted source is US-centric while the winnable seats are at Indian startups, which post on
  their own ATS. Companies = `scripts/data/india-startups.txt` (hand list, add freely) + every
  active YC company listing India. For each it opens the site and careers page, follows the link
  to its Greenhouse / Lever / Ashby / Workable board, and confirms it via that ATS's JSON API;
  when the careers page renders client-side it tries the company name as the slug, and accepts
  that board only if its postings name the company **and** one is in India (the same-name trap).
  Registry cached 30 days in `inbox/.ats-registry.json` (unreachable sites are never cached).
  Keka, Darwinbox, Zoho Recruit, Freshteam, Workday are detected but not read yet, and the run
  prints their count so the gap stays visible. Job platforms (Weekday, Apna) are excluded: their
  boards carry clients' roles. Scoring is `lib/board-score.mjs`, shared with board-scout. First
  run: 279 companies, 24 readable boards, 514 roles, 62 past the filters.
- `node scripts/board-scout.mjs` — **the remote-first channel** (`--crypto`, `--all`,
  `--ignore-seen`). Default sources: RemoteOK, Remotive, Himalayas, WeWorkRemotely.
  cryptocurrencyjobs.co is **opt-in only** (`--crypto`): it was built for the previous owner's
  Solidity profile, Shivam has no web3 work, and web3 keywords score no story fit. Added
  2026-07-30 after an audit found **138 of 178 leads came from HN alone** and 74% graded D/F.
  Himalayas and Remotive expose geography as a *structured field* rather than prose. Writes `inbox/boards-*.json`. **`profile/channel-
  strategies.md`** tracks candidate sources not yet wired in (mostly crypto boards probed
  2026-08-24, all client-rendered or bot-walled; low priority for Shivam's profile) plus other sourcing/outreach tactics worth remembering (bounty platforms,
  cold-DM structure) that don't fit one skill's file.
- **`node scripts/hn-jobs.mjs` — HN's `tags=job` corpus** (`--days N`, `--all`, `--include-us`).
  The front-page "X (YC W22) Is Hiring" stories. **A separate corpus from `scout.mjs`, not a
  separate view of it:** those are *comments* on the monthly thread, these are job *stories*,
  posted continuously, and 17k of them existed before JobOps ever read one. Not covered by
  `yc-scout.mjs` either — the grid caps at ~50 per role×location page, so a posting can be
  live and HN-promoted and still never appear there (measured 2026-08-01: 0 of the week's 13
  HN-jobs companies were in that day's yc-scout output). YC URLs reuse `lib/yc-job.mjs` for
  identical filtering/grading; external careers pages and URL-less posts (body inline on HN)
  take a keywords + geo-gate path. Writes `inbox/hnjobs-*.json`.
- **`scripts/lib/yc-job.mjs` — one implementation of the YC hard filters and score**, shared
  by `yc-scout.mjs` and `hn-jobs.mjs` so the same posting can't get two grades depending on
  which channel found it. Same rule as `keywords.mjs`: don't re-inline a local copy.
- **`scripts/lib/reachability.mjs` — the geo gate every scout shares.** Three outcomes:
  `blocked` (a wall is stated, drop it), `open` (remote/India/worldwide/will-sponsor, boost
  it), `unknown` (**keep it** — silence is not a wall, and EON, the best lead in weeks, stated
  no location at all). Measured on the live HN thread: **105 of 201 keyword-matching postings
  dropped on geography**, with 0 of 20 historical A/B leads lost (`node
  scripts/lib/reachability.test.mjs` backtests this against `inbox/leads.md` and must stay at 0).
- **`scripts/lib/keywords.mjs` — one source of truth for profile keywords**, matched on **word
  boundaries**. The scouts used `includes()` from the start, so `defi` matched *undefined*,
  `go` matched *going*, `rag` matched *storage*. Never add a bare `includes()` keyword test.
- **`scripts/lib/fit.mjs` — seat fit, shared by every graded scout** (`yc-job.mjs`,
  `hn-jobs.mjs`, `board-scout.mjs`). Stack overlap says nothing about whether he can sit in the
  seat: on 2026-09-29, 10 of 11 scripted A/B grades were wrong on the seat, not the stack. It
  drops non-engineering titles (sales/solutions/content/customer engineer, GTM, PM, design, but
  keeps a multi-role "eng and GTM" title), docks seniority (Staff/Principal/Chief/Architect
  −30, Senior/Lead −15) and stated years read from free text, including "Four or more years"
  (5+ −30, 3–4 −15, 2 −5). Story fit is tiered in `keywords.mjs`: an infra match +25, AI
  vocabulary alone +12. `node scripts/lib/fit.test.mjs` pins every case from that run.
- `node scripts/yc-scout.mjs` — YC job grid, filtered + scored (`--fresh`, `--include-us`,
  `--all-roles`, `--all`). Public, no login, safe to run often. Writes `inbox/yc-*.json`.
  **The grid is a sample, not the catalogue** (2026-10-21: India page showed 23 postings, and
  AnswerThis's remote-India role, which passes every filter, was on none of the 18 pages), so
  each run also sweeps hiring companies' own `/companies/{slug}/jobs` pages: the yc-oss hiring
  list narrowed to India/remote (~757), recent batches daily, the rest every 4 days, 120 per
  run (`--sweep N`, `--sweep-all`, `--no-sweep`). Rotation state in `inbox/.yc-sweep.json`.
- **Video applications (`/job-video`, `/job-script`, `scripts/video-assets.mjs`,
  `scripts/ui-recon.mjs`) are disabled** until Shivam has his own project footage and a spoken
  voice profile. The asset scripts exit unless run with `--force`, because every path in them
  points at the previous owner's portfolio. The policy they implement, for when they are
  re-enabled: offer a video on A-grade leads, and on B-grade leads when the channel reaches a
  named human and the footage already exists; never for a portal upload at a large company.
  `/outcome` writes `video: yes|no` into every tracker row so the policy can be measured.
- **`node scripts/stack-probe.mjs {domain} [--slug company]` — the technical-depth engine.**
  Codifies what `learnings.md` measured by hand on Wonderdog: stack from response headers, their
  own unpublished hosts from `content-security-policy`, embedded vendors, dev-vs-prod Clerk
  instances, the ATS posting API, `llms.txt` / OpenAPI / health endpoints, DNS vendor
  fingerprints, App Store liveness. **Read its attribution lines before quoting anything**: a
  header on `status.` or `docs.` is Statuspage's or Mintlify's stack and not theirs, and the first
  hop of `x-vercel-id` is the edge nearest whoever ran the probe, not their region. Feeds
  `/tech-read`.
- `node scripts/scout.mjs` — manual scout run (job postings). `node scripts/signal-scout.mjs` —
  manual signal run (funding/hiring-expansion, ahead of postings). When the repo is on GitHub,
  `.github/workflows/scout.yml` runs both every 6h and opens Issues (`lead`/`signal`/`follow-up`)
  via `gh-tools/notify.mjs` — see `gh-tools/README.md` for setup + Telegram.
- `node scripts/mark-processed.mjs "{company}"` — the other half of that loop. Records the
  decision on a lead in `inbox/leads.md` and closes the GitHub issue scout opened for it to
  match: default = done (`[d]`, `✓ processed`, issue "completed"); `--skip` = won't apply
  (`[x]`, `✗ skipped`, issue "not planned"). So an OPEN issue always means an undecided `[ ]`
  lead. `--no-close` updates leads.md only; `--reason "..."` sets the close comment.
- **`node scripts/backup.mjs [--commit]` — the only sanctioned way to commit session churn, and
  never `git add -A`.** Every session leaves churn under `applications/`, `inbox/` and `resumes/`
  that is worth keeping and not worth a story. The habit that produced was a blanket add under a
  `chore(pipeline): backup ...` subject, which buries real features inside a commit nobody reads:
  `efc9a45` swept in the whole live-session bridge (`go-live/SKILL.md`, `watch-queue.mjs`) plus
  `.DS_Store`, and `0b95922` swept in `actions.mjs`, `followups.mjs`, `lib/state.mjs` and
  `CLAUDE.md`. The script stages only those
  three data roots and **cannot reach anything else**, refuses to run if a non-data file is already
  in the index, and — the half that actually closes the hole — **prints what it is leaving behind**,
  because the failure was never that the wrong files went in, it was that nobody noticed. `profile/`
  is deliberately not a data root: a profile change is a real `docs(profile):` commit.
- **`node scripts/actions.mjs` — the control centre, and the interface Shivam actually uses.**
  `dashboard.mjs` answers "what is the state of the pipeline"; this answers "what do *I* have to
  do, in what order, and where is the link". Serves a checkbox board on :7777 and opens it.
  **Checking every step of a card writes back into the repo** — `mark-processed.mjs` for a lead
  or signal, or a surgical status/follow-up cell rewrite on one tracker row (found via
  `loadTracker`, two cells by index, notes untouched; the board must never reformat the tracker).
  Queue lives in `inbox/actions.json`, written by the skills. **This replaces prose handoff.**
  `inbox/leads.md`, `signals.md`, `network.md` and `handoff.md` are the archive, not the
  interface: they are long enough that a run's new rows are unfindable inside the old ones, and
  the measured failure mode is Shivam opening the file, recognising nothing, assuming nothing is
  new, and closing it. Card rules (a step is something *he* does with his hands; all reasoning
  goes behind the `background` dropdown; every link you can give; a "pass" is one checkbox) are
  in `.claude/skills/autoapply/SKILL.md` § 5. Cards also carry **buttons** (`open` a URL,
  `reveal` a folder in Finder, both executed server-side because a browser cannot). Binds to
  127.0.0.1 and refuses to open any path outside the repo.
  - **Section order is `leads → do-now → network → signals → earlier leads`, and that order is
    load-bearing.** The board used to open with "Do now", so a scout run could add four fresh
    leads and render them below thirty pieces of housekeeping — the exact "I can't find what's
    new" failure the board exists to fix. **A lead decays and a follow-up does not**: a posting
    fills, a founder stops reading. Inside every section it is grade order, A before B before C.
  - **"New" is a stamp, not a guess.** The first time the board renders a card it records
    `firstSeen` in `inbox/.actions-state.json` and never rewrites it. Leads stay in **New leads**
    for `FRESH_DAYS` (3), then sink to **Earlier leads** — still undecided, just no longer
    pretending to be news. Never derive freshness from `actions.json`'s mtime; every skill
    append rewrites the whole file.
- **The live-session bridge — the board can now talk to a running Claude session.** A node server has no channel into a running session, which
  is why **Work it** could only ever write `inbox/intents.json` and say "picked up next session".
  The session opens the channel from its side: **`/go-live`** registers it
  (`node scripts/actions.mjs live`) and arms a **persistent Monitor** over
  `scripts/watch-queue.mjs`, whose stdout lines land on the session's event stream as
  `CMD <id> :: <cmd> <args>`.
  - **The LIVE pill is the age of a heartbeat, not a claim.** The watcher rewrites
    `control/session.json` every 2s; anything older than 30s counts as dead and every
    Claude-backed control greys itself out. Kill the session and the watcher dies with it, so
    **nothing has to remember to clean up** — the absence is the signal.
  - **Three ways in:** *Work it* (dispatches when live, falls back to `intents.json` when not —
    it never silently does nothing), the **top ask bar** (free text or a slash command), and a
    **per-card ask box**. `ask` is not a skill: it is Shivam talking through the board, so answer
    it in the conversation as if he had typed it.
  - Session side is `node scripts/actions.mjs live|offline|next|claim|done|status`. **Claim
    before the work, not after** — a command sitting `pending` while you work looks identical to
    one you never saw — and always finish with `done <id> --result "..."`, because that line is
    the receipt Shivam reads on the card. It is one sentence and cannot carry the reasoning, so
    **report in the conversation too**.
  - **A button never authorises an outward action.** A press means research, draft, tailor. It
    never means send, submit or DM; `/autoapply` is not reachable from the board.
  - `control/queue.json` and `control/session.json` are gitignored — machine-local, and a
    committed `session.json` would make every clone claim a session is listening.

- **`node scripts/gate.mjs --queue [--grade A,B,C]` — the gates, moved to scout time.** Five
  checks (`lib/gates.mjs`) run before anyone spends time on a lead: prior contact, posting still
  live, a seat at his level, reachability, a real published channel. Born from the first
  `/autoapply` run, where **six of eight** C leads failed one of these *after* the work started.
  Two implementation notes that are load-bearing: **ATS boards are probed through their JSON
  posting APIs, never their HTML** (`jobs.ashbyhq.com/{slug}` returns 200 with a generic shell
  for a slug that does not exist, and `apply.workable.com/{slug}` 302s to a 200 `/oops`), and
  **403/429 is a bot wall, not a dead posting** (WeWorkRemotely 403s a bare fetch on URLs that
  render fine in a browser), so those are `check`, never `fail`. The Gmail half of the
  prior-contact gate cannot run in a script — Gmail is MCP-only, and it is the store that caught
  the Strello duplicate — so the gate returns `needs-session` and the skills carry it. **Nothing
  here marks anything**: a fail is evidence to skip, not a decision.
- `node scripts/dashboard.mjs [--open] [--refresh]` — render the canonical state from
  `lib/state.mjs` into `dashboard.html`, a one-page pipeline board (signals → lead pile →
  hold/drafted → waiting → followed-up → in play → closed, overdue follow-ups flagged). Ends
  with a **drift panel**: anything the join could not decide is listed there rather than
  dropped, because a board that hides what it cannot parse is worse than no board. Gitignored;
  regenerate after any tracker/inbox change worth seeing.
- `node scripts/resume-pdf.mjs <resume.md>` — ATS-safe PDF via headless Chrome. Renders the
  house format in 10pt Computer Modern (fonts vendored in `assets/fonts/`, no network) to
  match Shivam's own LaTeX resume — `resumes/base-reference.tex` is the untouched original source.
  Auto-compresses whitespace to hold one page and warns if it can't.
- `node scripts/cover-letter-pdf.mjs <cover-letter.md>` — same house typography (CMU Serif,
  one-page compression) for cover letters that need to be **uploaded/attached**. Adds a
  letterhead (name + contact from `profile/facts.yaml`) above the prose. Skip it when the
  letter is a paste-in form field — that text goes straight into pack.json instead.
- GitHub research: `gh-tools/recon.mjs {org} --out` (in /company-research),
  `gh-tools/pr-wedge.mjs {org}` (motivation-3 targets), `gh-tools/profile-audit.mjs`
  (monthly — Shivam's own GitHub is a landing page).
- Extension: load `extension/` unpacked at chrome://extensions (Developer mode).
