---
name: signal-scout
description: Watch Indian startup-funding news for "just raised, about to hire" signals — reach a company before a job posting exists. Use when asked to check funding signals, find companies about to hire, or refresh inbox/signals.md.
---

# Signal Scout

`/job-scout` finds companies that have *already* posted a role — you're one of hundreds of
applicants by the time you see it. Signal-scout finds companies *before* the JD exists: the
event that creates headcount budget (a funding round) or the state that implies it (a
one-person team that's clearly outgrowing itself). The earlier signal, the warmer the door.

## Source 1 — funding feeds (automated)
`node scripts/signal-scout.mjs` polls Inc42 + YourStory RSS (Entrackr has no working feed as
of 2026-07), keyword-scores each article, and appends new hits to `inbox/signals.md`.

Grading is mechanical and deliberately blunt — it's a radar, not a verdict:
- **A** — funding keyword + explicit hiring/team-expansion language, OR funding + tech-sector
  fit + an early-stage round (pre-seed/seed/angel — budget just appeared). Message this week.
- **B** — funding keyword + tech-sector fit (SaaS/AI/fintech/devtools/infra), recent,
  not a late-stage round.
- **C** — funding keyword only, sector/fit unclear from the blurb — worth a 30-second look.
- **D** — funding + an off-sector keyword (D2C/beauty/real-estate/agri/manufacturing/etc — an
  eng hire is rarely the point of that raise), a late-stage round (Series C+, likely already
  staffed), or stale (>30 days).

Two things happen automatically before you see a line:
- **Cross-source dedup** — the same round often gets covered by Inc42 and YourStory with
  near-identical headlines; the script merges them by extracted company name, keeps the better
  grade, and notes the dropped source (`also: Inc42`) in the why field.
- **Cross-pipeline dedup** — each hit is checked against `inbox/leads.md` and
  `applications/targets.md` by company name; if it's already tracked there, the why field says
  so (`⚠ already in leads.md as "..."`) instead of surfacing as an unconnected duplicate.

Triage manually: open each `[ ]` line, sanity-check the company against `profile/facts.yaml`
stack/stage fit exactly like `/job-scout` does, then record the decision:
```
node scripts/mark-processed.mjs "<Company>" --signals --promote   # → applications/{company}/
node scripts/mark-processed.mjs "<Company>" --signals --skip      # not pursuing
```
Promoting sets `[>]` and comments on the signal's GitHub issue (if one exists) without closing
it — the issue only closes once the real leads.md outcome is decided (applied or passed), same
as the rest of the pipeline. Skipping sets `[x]` and closes the issue as "not planned".

## Source 2 — LinkedIn (manual, on-demand — see `/linkedin-scout`)
Not automatable safely: scraping LinkedIn at any volume risks the account, so this is its own
skill with its own hard rules (one search at a time, no bulk profile visits, never on a cron).
Run `/linkedin-scout` for founder hiring-signal posts, direct job listings, and warm-network
("2nd degree") hiring activity — it writes into `inbox/signals.md` and `inbox/leads.md` using
the same grading rubrics as this file and `/job-scout`. Company-page People-tab headcount
graphs (sharp uptick, few live job posts = hiring off-board) are also worth a look per-company,
one at a time, once a lead already cleared Source 1 or came from a target list.

## Promoting a signal
When a signal clears manual triage, treat it exactly like an A/B lead: create
`applications/{company}/` and run `/company-research` on it. Mark the signals.md line `[>]`
(promoted) so it's not re-triaged, and note in the dossier that it originated as a funding
signal, not a job posting — that context should shape the outreach ask ("saw you just raised —
growing the team?" rather than replying to a listing).

## Not yet built
Per-person "voice fingerprint" research (founder/team vocabulary, recent posts, what they're
visibly proud of) and message drafting for LinkedIn outreach are the next stages — deliberately
not automated yet because they need to stay one-target-at-a-time to (a) actually be personal and
(b) not trip LinkedIn's automation detection. Extend `/company-research` and `/outreach` for
this rather than building a new batch pipeline.

## Cadence
Run alongside `/job-scout` — same session, same frequency. If wired into
`.github/workflows/scout.yml`, it runs on the same 6h cron and commits `inbox/` the same way.
