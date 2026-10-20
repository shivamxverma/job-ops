---
name: board-scout
description: Scout crypto-native and remote-first job boards (cryptocurrencyjobs.co, RemoteOK, Remotive, Himalayas, WeWorkRemotely) — remote-first boards by default, where remote is the norm rather than a concession; the crypto board is opt-in via --crypto and scores no web3 story fit (Shivam has no web3 work). Use when asked to check remote boards, crypto jobs, or run the board scout.
---

# Board Scout

The channel added on 2026-07-30 after the pipeline audit. The finding that produced it:

> 178 leads scouted, **138 from a single source** (HN Who is Hiring). 74% graded D/F, and
> geography was a factor in 58% of those. The pipeline wasn't underperforming — it was
> pointed at a market Shivam mostly can't be hired into.

Two kinds of source HN is not:

- **crypto** — opt-in only (`--crypto`). Built for the previous owner's Solidity profile;
  Shivam has no web3 work, so crypto postings only fit when the seat is plain backend/infra.
- **remote-first** (the default) — boards where "can this person actually take the job" is a **structured
  field** (Himalayas' `locationRestrictions`, Remotive's `candidate_required_location`)
  instead of something you discover in paragraph six of a JD.

## Run it

```
node scripts/board-scout.mjs              # all sources
node scripts/board-scout.mjs --crypto     # crypto-native only
node scripts/board-scout.mjs --remote     # remote-first only
node scripts/board-scout.mjs --all        # keep geo-blocked postings, for auditing the filter
node scripts/board-scout.mjs --ignore-seen
```

Writes `inbox/boards-{date}.json`. Dedups via `inbox/.board-seen.json`.

## What the script does and does not decide

It is **mechanical only**, exactly like `yc-scout.mjs`. It filters and scores; you do the
judgment pass. Specifically it:

- drops anything whose title isn't an engineering role (`ENG_HINT` must match, `NON_ENG` must
  not) — these are general boards, so most of what they return is PM/design/sales
- drops postings older than 30 days
- requires 1 strong or 2 weak profile keywords, matched on **word boundaries** via
  `lib/keywords.mjs`
- runs `lib/reachability.mjs` and drops `blocked`, keeping `open` and `unknown`
- scores stack 35 / story 25 / stage 25 / practicals 15 and grades A–F

## Doing the judgment pass

Read the JSON and write real leads into `inbox/leads.md` in the standard format, source
`board:` plus the board name. The script's grade is a **hypothesis** and is routinely wrong
both ways:

- A senior-titled role on a reachable board can still be worth a C line rather than a drop —
  `senior` in a title is often aspirational at a 10-person company.
- A script B from a general board with a vague JD is usually a C or D once you read it.
- A crypto-native posting with a founding seat and no years bar can outrank its score.

**Three things to verify before grading anything A or B:**

1. **Open the posting.** RSS descriptions truncate, and the wall is usually in the body.
2. **Check reachability by hand.** `unknown` means nothing was stated — that is a question to
   ask, never a reject. `open` from a structured field is trustworthy; `open` inferred from
   prose deserves a look.
3. **Dedup** against `inbox/leads.md`, `inbox/signals.md` and `applications/targets.md`. These
   boards syndicate heavily and repost roles already found on HN or YC. If it's tracked, write
   `⚠ already in leads.md as "..."` and stop.

## Known source quirks

| Source | Quirk |
|---|---|
| `cryptocurrencyjobs.co` | RSS only. Title is `"{Role} at {Company}"`; the geo wording lives in the description. |
| `remoteok.com` | General board with crypto tags, **not** a crypto board — it gets no crypto score bonus. Location is a city string, so reachability reads prose. Descriptions contain a "mention the word X" anti-scraper token; ignore it. |
| `remotive.com` | `candidate_required_location` is a comma-separated region list, parsed as structured restrictions. |
| `himalayas.app` | The best source in the set: real `locationRestrictions` and `seniority` arrays. |
| `weworkremotely.com` | RSS. Title is `"{Company}: {Role}"`. Description is HTML with the HQ in it. |

A source that 404s or rate-limits is reported and skipped, never fatal. If one stays dead
across runs, say so — a silently dead board looks identical to a quiet market.

## Related

`all-scouts` · `job-scout` · `yc-scout` · `lib/reachability.mjs` · `lib/keywords.mjs`
