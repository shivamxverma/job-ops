# gh-tools — the GitHub layer of JobOps

Four tools + one GitHub Actions workflow. Together they turn JobOps from "a tool you must
remember to run" into "a system that taps your shoulder" — and add the research moves that
make you sound like you read their code (because you did).

| Tool | What it does | When |
|------|--------------|------|
| `.github/workflows/scout.yml` | Runs the HN scout + funding-signal scout **every 6h on GitHub's servers**, opens an Issue per strong lead, grade-A signal, and overdue follow-up | Automatic, forever |
| `notify.mjs` | The issue-opener + optional Telegram ping (run by the workflow; can run locally too) | Automatic |
| `recon.mjs` | Company GitHub recon: real stack vs JD claims, code alive?, **top committers = likely interviewers**, wedge signals | Per target, during `/company-research` |
| `pr-wedge.mjs` | Finds ONE small in-stack open issue at a target you could fix — a merged PR is the strongest application there is | Motivation-3 targets only |
| `profile-audit.mjs` | Audits YOUR GitHub as a landing page (pins, READMEs, live links, staleness) | Monthly + before any big push |

---

## One-time setup (~10 min)

### 1. Push job-ops to a private repo
```bash
cd ~/PROJECTS/Me/job-ops
git init && git add -A && git commit -m "JobOps"
gh repo create job-ops --private --source=. --push
```

### 2. That's it for issues — the workflow is already wired
`scout.yml` uses the built-in `GITHUB_TOKEN`; no secret needed. Check it under the repo's
**Actions** tab → "JobOps Scout" → *Run workflow* to test immediately instead of waiting
for the 6-hour cron. New leads appear as Issues labeled `lead`, grade-A funding/hiring signals
as `signal`, overdue follow-ups as `follow-up`.

### 3. Push notifications on your phone (pick one or both)

**GitHub mobile (zero setup):** install the GitHub app → log in → Settings →
Notifications → enable push for Issues on the `job-ops` repo. Every new lead = a push.

**Telegram (optional):** bots can't message a handle directly — you need a bot + chat id:
1. In Telegram, message **@BotFather** → `/newbot` → name it (e.g. `jobops_shivam_bot`) →
   copy the **bot token**.
2. Open your new bot's chat and send it any message (this is required — bots can only
   reply to chats that messaged them first).
3. Get your chat id: open `https://api.telegram.org/bot<TOKEN>/getUpdates` in a browser →
   find `"chat":{"id": <number>}`.
4. Add both as repo secrets: repo → Settings → Secrets and variables → Actions →
   `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`. Next run, you get a summary message per
   batch of new leads.

### 4. Local auth for recon/wedge/audit
Already done if `gh auth status` works (it does on this machine). The scripts borrow
`gh auth token` automatically.

---

## Using them — example prompts (say these to Claude in job-ops/)

- **Recon during research** (also runs automatically inside `/company-research` now):
  > `/company-research zed-industries — role: <link>. Include the GitHub recon.`
  or standalone: `run gh-tools/recon.mjs on vercel with --out and summarize what matters for my outreach`

- **Find a PR wedge at a dream company:**
  > `run pr-wedge on zed-industries with keywords rust electron, and help me pick the one issue where I can realistically ship a quality PR this week`

- **Monthly profile check:**
  > `run the github profile audit and turn the fix list into 30-minute tasks, ordered by what a recruiter sees first`

- **Triage from your phone:** comment on a lead Issue in the GitHub app (e.g. "grade this
  one, looks interesting"), then next time you're at the laptop:
  > `check open lead issues on the repo, grade any I commented on, and start the pipeline for the best one`

## How the pieces talk
```
GitHub Actions (every 6h, laptop off)
  └─ scout.mjs → inbox/hn-*.json  (committed back to the repo)
       └─ notify.mjs ─ opens Issues:  [lead] ...   [follow-up] ...
                     ─ Telegram summary (if secrets set)
                            ↓
   your phone buzzes → you comment/triage → at the laptop, Claude picks it up
```
Dedupe state lives in `inbox/.seen.json` (scout) and `inbox/.issued.json` (notify), both
committed by the workflow — so local runs and Actions runs never double-notify.

**Note:** if you also run scout locally, `git pull` before and push after, or the
workflow's commit and yours will diverge.
