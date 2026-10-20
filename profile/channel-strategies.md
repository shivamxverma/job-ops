# Channel strategies — sourcing and outreach tactics worth reusing

Where job/lead-sourcing and outreach ideas land when they're worth keeping but don't fit
neatly into one skill's file. Read before building a new scout or outreach tactic — check here
first for what's already been tried and what a probe found, so a channel doesn't get
re-investigated from scratch.

## Job board sources — probed 2026-08-24

Source list came from a web3-jobs X thread (Smaris, @Smaris, 2026-08-23). Cross-checked
against `scripts/board-scout.mjs`'s existing sources and probed each new one for a scrapable
feed (RSS/JSON) before deciding whether to wire it in.

**Already covered** (`board-scout.mjs`): cryptocurrencyjobs.co, RemoteOK, Remotive,
Himalayas, WeWorkRemotely.

**Probed, not automatable — no RSS/JSON, client-rendered (Next.js) or bot-walled:**
- `web3.career` — no `/rss.xml` or `/feed` (404). Homepage is a near-empty SSR shell
  (~15 lines) that hydrates client-side — needs a headless browser, not a fetch.
- `crypto-careers.com` — same shape, Next.js app (`frontend-cryptocareers`), `/feed`
  redirects to a 404 page, not a real feed.
- `cryptojobslist.com` — 403 on homepage, `/feed`, and `/api/jobs`. Looks like a bot wall
  (same class of block as WeWorkRemotely's bare-fetch 403, per `lib/gates.mjs`'s note that
  403/429 means blocked-for-bots, not dead) rather than an actually-down site.
- `jobstash.xyz` — `/api/jobs` 404s, `/jobs` 308-redirects. JS app front end.
- `remote3.co` — `/feed` and `/rss.xml` both 404 (redirects to `www.` first).
- `beincrypto.com/jobs` — `/feed` 403s.

**Verdict:** none of these are worth a `board-scout.mjs` source entry as-is — they'd need a
headless browser (Chrome via claude-in-chrome) to render, which is a different cost profile
than the current sources (all plain `fetch()`, ~seconds, no browser session). If the automated
board-scout ever feels thin, these are the next candidates for a **browser-based scout**
(same pattern as `/linkedin-scout` or `/x-scout` — logged-in Chrome session, manual/on-demand,
not a cron job) rather than folding them into the scriptable pipeline. Re-probe before
building — sites change their rendering approach.

**Not yet checked:** `midnight.network/careers`, `jobs.dragonfly.xyz/jobs`, `block.xyz/careers`,
`jobs.solana.com`, `jobs.avax.network`, `ethereumjobboard.com` — these are single-company or
single-ecosystem boards, lower leverage than an aggregator. Worth a quick RSS/JSON probe only
if a specific company/ecosystem on the list becomes a real target.

## Bounty / contest platforms — a channel job-ops doesn't use at all

Different mechanism from applying to a posting: build something (a bounty submission, a
contest entry) and get noticed or paid for it directly. This is proof-of-work-first hiring,
adjacent to `/tech-read`'s "show you understand their tech" logic but executed as a shippable
artifact instead of a research doc.

- Superteam Earn (`earn.superteam.fun`) — Solana-ecosystem bounties and grants.
- ScribbleDAO (`scribble.network`) — writing/content bounties.
- Others named in the same thread (WizzHQ, First Dollar, Rova) — not evaluated, lower
  confidence signal.

Not wired into any scout. If pursued, this is its own workflow, not a lead grade — a bounty
win becomes evidence in `profile/stories.md` and `facts.yaml`, the same way the $9K Reactive
grant and hackathon wins already function as checkable proof-of-work.

## Cold-DM tactic (X/Discord) — already covered, not new

The thread's playbook (find the company on X → identify team members → follow → join their
Discord if any → short, specific DM: point out a problem, propose a solution, 3 paragraphs
max) matches what `/outreach` and `/x-scout` already do: dossier-grounded, specific, one
checkable artifact, brief. No process change — confirms the existing approach rather than
adding to it.

## Volume framing ("10 DMs/day, 300/month") — reconciled, not adopted directly

Contradicts this pipeline's default (A/B leads worked by hand, one done well beats three done
thin — see `CLAUDE.md`), but the volume argument is already accounted for by the **C lane**
(`/autoapply`): C-grade leads get the numbers-game treatment autonomously, while A/B stays
hand-worked. Don't apply raw DM-volume logic to A/B leads.
