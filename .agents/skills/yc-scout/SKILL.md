---
name: yc-scout
description: Scout live YC-backed startup jobs from ycombinator.com — the public job grid, the company directory, RFS and Launches — hard-filtered on visa/experience/company-activity, scored A–F, with the full JD and founder names pulled per lead. Use when asked to check YC, Work at a Startup, find YC jobs, or scout YC-backed companies.
---

# YC Scout

`/job-scout` already treats Work at a Startup as "a directory of targets". This skill is the
real version of that: YC's public site exposes far more than the WaaS Apply button does, and
none of it needs a login.

**The one number that matters:** a typical run scans ~360 live postings and ~27 survive
Shivam's hard constraints. Most of the cut is a single field — 40%+ of YC postings are
`US citizen/visa only`, which is unwinnable for him no matter how good the fit reads. Every
minute spent reading those is wasted. Filter first, judge second.

## Hard constraint: the WaaS application cap

Scouting YC is free. **Applying through workatastartup.com is capped at 5 applications per
week** (see `profile/learnings.md`). Applying via the company's own ATS or a founder email
does *not* count against it. So: never queue WaaS applies without checking the week's
remaining quota, and when a company is reachable by a direct email or their own careers page,
prefer that route and save the quota.

## Step 1 — run the script

```
node scripts/yc-scout.mjs              # eng roles, visa-open, active companies
node scripts/yc-scout.mjs --fresh      # only postings created in the last 30 days
node scripts/yc-scout.mjs --include-us # include US-only roles (rarely worth it)
node scripts/yc-scout.mjs --all        # ignore the seen-list, re-emit everything
```

It fans out over `/jobs/role/{role}/{location}`, dedupes by job id, applies the hard filters
below, enriches from the yc-oss mirror of YC's company index (team size, stage, tags), scores
A–F on `/job-scout`'s weights, and writes `inbox/yc-YYYY-MM-DD.json`.

The hard filters it applies, and why each one is a *hard* filter and not a scoring penalty:

| Field | Rule | Why |
|---|---|---|
| `visa` | drop `US citizen/visa only` | Shivam needs sponsorship or remote-from-India. Not a stretch — a wall. |
| `minExperience` | drop `5+ years` and above | Graduating May 2026. 3+ is a stretch worth taking; 6+ is not. |
| `lastActive` | drop companies quiet > 30d | This is when the company last signed into WaaS. **This is the ghost-job filter** — an old posting from an active company is fine (reqs sit up for years), but any posting from a company that hasn't logged in for a month is shouting into a void. |
| `role` | eng only unless `--all-roles` | |

`createdAt` is deliberately *not* a hard filter. A posting created "over 2 years ago" from a
company that logged in 3 days ago is live; posting age is noise, company activity is signal.

## Step 2 — deep-dive each A/B lead

The script gives you the shortlist. Now go one level deeper, per lead. Fetch the job page
(`jobUrl` in the JSON) — it is server-rendered with an Inertia `data-page` attribute holding
everything the listing page omits:

- **`job.description`** — the complete JD in markdown, usually 3–4k characters. This is the
  exact text `/tailor-resume` and `/ats-score` need. Save it into
  `applications/{company}/jd.md` so the tailoring loop scores against the real thing rather
  than a summary.
- **`job.interview_process`** — what they actually do. Often names a take-home or a paid work
  trial; changes how much prep a lead is worth.
- **`job.hiringManager`** — first and last name. This is the `/outreach` target, and it beats
  a generic careers@ address every time.
- **`company.founders[]`** — full bios plus `linkedin_url`, `twitter_url`, `github_url`,
  `year_founded`, `team_size`, `primary_group_partner`. Founder bios are the best raw material
  for the "why us" hook because they say what the founder personally cares about.

Extract it the same way `scripts/yc-scout.mjs` does (find `data-page="`, take to the next `"`,
HTML-unescape, `JSON.parse`) — either with a throwaway node script or WebFetch on the job URL.
Feed all of it into `/company-research` rather than making that skill re-derive it.

## Step 3 — the other YC surfaces

These are lower-volume than the job grid but they get you *ahead* of postings, which is the
whole point of `/signal-scout`. Use them when the grid is thin or when a lead needs context.

- **`ycombinator.com/companies`** — the directory. Don't scrape the page; use the yc-oss
  mirror of YC's own Algolia index, which is public, rebuilt daily, and needs no key:
  `https://yc-oss.github.io/api/companies/hiring.json` (~1,500 companies flagged hiring),
  plus `/api/batches/{batch}.json`, `/api/industries/{name}.json`, `/api/tags/{tag}.json`,
  and `/api/meta.json` for the index. Fields include `team_size`, `stage`, `batch`,
  `isHiring`, `tags`, `regions`, `website`.
  **The highest-value slice: the newest batch with `isHiring: true` and `team_size` under 10.**
  Those companies are hiring their first engineers and often have no posting up yet — that's
  a `/signal-scout` A-grade situation, so promote them into `inbox/signals.md`, not
  `inbox/leads.md`, and reach the founder directly.
- **`ycombinator.com/launches`** — Launch YC posts. A company launching this week is at peak
  "we need to ship faster" and peak founder-reachability. Cross-check launches against the
  hiring list; a launch + `isHiring` is a warm cold-email moment, and the launch post itself
  gives you the specific artifact to reference.
- **`ycombinator.com/rfs`** — Requests for Startups. Not jobs. Read it as **the thesis YC is
  funding next**, which tells you which batch companies will exist in 6 months and which of
  Shivam's framings to lead with. If RFS is heavy on AI agents and dev tools, the
  ai_framing (Hireflow) or dev-tools framing (CodeSM/Yuvro) is the one to open with across the whole pipeline — note that in
  `profile/learnings.md` rather than treating it as a lead.
- **`ycombinator.com/people`** and the blog/library are background reading, not scouting
  surfaces. Skip them on a normal run.

Note on the URLs in YC's own marketing: `/jobs?role=eng`, `?location=remote`, and
`?languageid=1` **do not filter anything** — the query params are ignored and you get the
same 20-item landing page. Only the path form `/jobs/role/{role}/{location}` filters. Valid
location slugs are exactly: `remote`, `india`, `san-francisco`, `new-york`, `los-angeles`,
`seattle`, `boston`, `austin`. Any other slug silently returns unfiltered results, which
looks like a successful filter and isn't.

## Step 4 — write leads

Append survivors to `inbox/leads.md` in the standard format, with `YC:` as the source and the
batch tag on the company:

```
- [ ] **{Company}** (YC {batch}) — {role} | {A-F} | posted {createdAt} ago, company active {lastActive} ago | YC: {jobUrl} | why: {one line} | founder/HM: {name}
```

Dedupe against `inbox/leads.md` and `applications/targets.md` first, exactly as
`/linkedin-scout` does — several YC companies are already in the pipeline.

Adjust the script's mechanical grade with judgment before writing. Things the script can't see:

- **Comp listed in the wrong unit.** India roles sometimes show as `$1.5K - $2.5K / monthly`
  and Indian rupee ranges as `₹1.5M - ₹3M`. Read them before reacting to the number.
- **Dev-tools, sandbox/code-execution, cloud-IDE and async-pipeline companies are a strong
  signal for Shivam specifically** (CodeSM, Yuvro, Storix). The script only sees the stack words.
- **Team size 2–10 + founding-engineer title** is where his shipped side projects
  actually outweigh the years-of-experience gap. Grade those up.
- **A 3+ years bar is a stretch, not a wall** — take it when the stack fit is exact. A 6+
  bar the script already dropped.

Never auto-apply. This skill ends at a ranked list plus, for A leads, a saved `jd.md` and a
named human to write to.
