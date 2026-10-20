---
name: all-scouts
description: Run every scout in the pipeline in one pass — HN, crypto/remote boards, YC, funding signals, X, LinkedIn, and the warm network — without skipping any of them, then triage what came back. Use when Shivam says "let's start all the scouts", "start the scouts", "run all scouts", "morning scout run", or opens a session asking to scout everything.
---

# All Scouts

The morning run. **"All" is the whole point of this skill: every channel, every time.**

Before this existed, a scout run meant remembering four commands and three browser skills,
and the browser ones were always the ones that got dropped. That is measurably how the
pipeline ended up with 138 of 178 leads from a single source and a warm-network map 1.4%
built. A run that quietly covers four of seven channels is the failure this skill exists to
prevent.

## Hard rule

**Never report a run as done while any channel is unrun.** If a channel is genuinely blocked
(Chrome not logged in, a board down, a rate limit), say which one, why, and that the run is
partial. Partial is fine. Partial-and-unmentioned is not.

## Step 1 — the scriptable half (one command, ~20s)

```
node scripts/scout-all.mjs
```

Runs, in order, each fault-tolerant so one failure never kills the rest:

| Scout | Source | Notes |
|---|---|---|
| `scout.mjs` | HN "Who is hiring" | now geo-filtered — it drops ~half the thread before it costs a judgment pass |
| `board-scout.mjs` | cryptocurrencyjobs.co, RemoteOK, Remotive, Himalayas, WeWorkRemotely | the crypto + remote-first channel |
| `yc-scout.mjs` | ycombinator.com job grid | visa + ghost-job filtered |
| `signal-scout.mjs` | Inc42, YourStory, Blume | funding signals, ahead of any posting |

Add `--quick` to skip YC's slow full-JD pass when Shivam is in a hurry.

Read the printed summary. Note which scouts returned nothing — **"no new matches" is a real
result, not a failure**, and should be reported as such rather than padded.

## Step 2 — the browser half (not scriptable, not optional)

These need Shivam's logged-in Chrome session and per-post judgment. The hard rules in
`linkedin-scout/SKILL.md` forbid automating them, which is exactly why they need a human-driven
skill rather than a cron. Run all three, in this order:

1. **`/x-scout`** — hiring-intent phrase + role noun (never a bare technology), then L1/L2/L3
   triage before any research. Most "we're hiring" posts on X are engagement bait.
2. **`/linkedin-scout`** — use the **content/post search**. The Jobs tab keyword search is
   measured broken for niche stacks: it ignores the keywords and serves a generic feed.
3. **`/network-scout`** — the warm channel, including the alumni engine. Lowest volume,
   highest conversion, and historically the most skipped.

Each writes into `inbox/leads.md` / `inbox/signals.md` in the standard line format and dedups
against what is already tracked.

## Step 3 — triage and hand off

1. **Judgment pass on the new JSON.** `inbox/boards-{date}.json` and `inbox/yc-{date}.json`
   carry mechanical scores only. Grade them properly into `inbox/leads.md` — the script's A
   is a hypothesis, and it is routinely wrong in both directions (a script A that is onsite-only
   is a C; a script C on a crypto-native board with a founding seat may be a B).
2. **Reachability is advisory, not gospel.** `status: unknown` means nothing was stated, which
   is *not* a wall — the best lead of the last fortnight (EON) stated no location at all. Treat
   unknown as "ask before investing", never as a reject.
3. **Every A grade gets offered the video pipeline** (`/job-video`). The single fastest human
   reply this pipeline has ever produced (9 hours, personally written) was to a video
   application. That is the strongest signal in the outcome data and it should be acted on.
4. **Regenerate the dashboard**: `node scripts/dashboard.mjs`.

## Step 4 — write the board, then report

**`inbox/leads.md`, `signals.md` and `network.md` are the archive, not the interface.** They are
long enough now that a run's new rows are unfindable inside the old ones, and the measured
failure mode is real: Shivam opens the file, recognises nothing, assumes nothing is new, and
closes it. So a scout run does not end at a file append.

**Append one card per fresh A/B lead to `inbox/actions.json`**, then start the board with
`node scripts/actions.mjs`. Card shape and rules are in `.Codex/skills/autoapply/SKILL.md` § 5.
For scout output specifically:

- `kind` is `"lead"`, `"signal"` or `"network"`; the board sorts A before B before C inside each.
- The lead's one-line why goes in `sub`. The full lead note goes in `background`, behind the
  dropdown.
- `links` carries the posting, the company site, and the ATS board if the probe found one.
- A lead card gets **one step, worded as the decision to drop it** ("Passing on this one"), with
  `onDone.markProcessed: "skip"`. Working a lead is not a checkbox: Shivam says "work X" in chat
  and the pipeline runs. Say that in the card's `background` so the choice is visible.
- **Do not card 27 low-grade signals.** Card the ones worth a decision and add a single bulk card
  offering to sweep the rest. Measured 2026-08-19: of 30 untriaged A/B signals, all but two were
  fund closes, wealthtech platforms or roundup articles with no engineering seat.

## Step 5 — report

Tell Shivam, in this order:

- That the board is open, and how many cards are waiting on him.
- New A/B leads, with the one-line why and what the next move is (apply / referral ask / DM).
- What each channel returned, **including the zeros**, so the coverage is visible.
- Anything that failed or was skipped, and why.
- Overdue follow-ups if `scripts/followups.mjs` flagged any.

Keep it short. A scout run that produces two real leads and five honest zeros is a good run,
and should read like one.

## Related

`PLAYBOOK.md` (the daily routine) · `job-scout` · `board-scout` · `yc-scout` · `x-scout` ·
`linkedin-scout` · `network-scout` · `signal-scout` · `job-video`
