# JobOps

A personal job-application pipeline: find roles the day they're posted, apply the same day
with a tailored resume (ATS ≥ 80), a researched cover letter, and personal answers — without
the mechanical typing, and without ever sending anything you didn't review.

> 📖 **Full operator's manual:** the book *JobOps: The Operator's Manual* in your
> markdown-kindle (Career shelf) — read that first. GitHub-layer setup: `gh-tools/README.md`.

Built on the research in *Get Hired in 2026* (markdown-kindle → 05-career): founder cold
emails convert at 5–15% vs 2–5% for board applications; specificity beats volume; generic AI
text is now a *negative* signal; the tool shape that actually gets people hired is
scrape → score → tailor → track, with a human on every send.

---

## How to think about this system

Claude does the **mechanical and research work**: finding postings, researching companies,
drafting, scoring, filling forms. You do the **judgment work**: deciding which companies
matter, adding the one personal touch a template can't have, and clicking send/submit.
There are exactly **five moments where the system stops and waits for you** — everything
between them is automated:

```
        CLAUDE DOES                          YOU DO
 ┌──────────────────────────┐
 │ scout.mjs + /job-scout   │
 │ finds & grades postings  │──────▶  ① Pick which A/B leads to pursue (2 min)
 └──────────────────────────┘
 ┌──────────────────────────┐
 │ /company-research        │
 │ builds dossier.md        │──────▶  ② Skim dossier — is anything wrong/GUESS? (3 min)
 └──────────────────────────┘
 ┌──────────────────────────┐
 │ /tailor-resume ⇄ /ats-score
 │ loops until score ≥ 80   │──────▶  ③ Read final resume once — is it true & you? (2 min)
 │ /outreach + /cover-letter│
 └──────────────────────────┘
 ┌──────────────────────────┐
 │ /apply-pack → pack.json  │
 │ extension autofills form │──────▶  ④ Edit outreach in YOUR words, send it.
 └──────────────────────────┘         Review every form field, click Submit. (10 min)
 ┌──────────────────────────┐
 │ /outcome logs + learns   │──────▶  ⑤ Tell Claude what happened (reply? silence?
 └──────────────────────────┘         interview?) whenever it happens. (30 sec)
```

Touchpoint ④ is the one that decides everything — that final 10 minutes of *your* edits is
what separates this from the mass-apply tools that get 95% no-response rates. The system
buys you that time by removing everything else; don't spend the savings on skipping it.

---

## One-time setup (15 minutes)

1. **Fill your profile gaps.** Open `profile/facts.yaml` and add what's missing —
   phone number and LinkedIn URL are currently empty and will come out as blank form fields
   until you fill them. Skim `profile/stories.md` and `profile/voice.md` once: if anything
   there doesn't sound like you, fix it now — every future output inherits from these three
   files. **This is the highest-leverage edit you'll ever make in this repo.**
2. **Check Node works:** `node scripts/scout.mjs` from this directory. You should see the
   current month's HN thread and match counts land in `inbox/`.
3. **Load the extension:** Chrome → `chrome://extensions` → enable *Developer mode* →
   *Load unpacked* → select the `extension/` folder. Pin it to the toolbar.
4. **Make a base resume PDF once:** export `resumes/base.md` to PDF however you like
   (e.g. `pandoc resumes/base.md -o resumes/base.pdf`, or paste into your usual tool).
   Tailored variants get the same treatment per company.
5. **Seed your target list:** open `applications/targets.md` and add the 10–20 companies
   you already know you want (motivation-scored 0–3). Ask Claude to help populate it from
   Work at a Startup / your own reading. This list is what makes scouting *yours* instead
   of keyword-generic.

---

## Daily use (~15 min unless you're applying)

Open Claude Code **in this directory** (the skills and CLAUDE.md only load from here):

```
cd ~/PROJECTS/Me/job-ops && claude
```

- **Morning check:** say `/job-scout` — it runs the scout, grades new hits against your
  profile, and updates `inbox/leads.md`. Glance at the A/B rows. Nothing good? Done for
  the day.
- **When a lead is worth it:** say
  `run the full pipeline for <company>, posting: <link or pasted JD>` —
  Claude will chain research → resume loop → outreach → cover letter → pack.json, and stop
  at each of your five touchpoints. A full A-grade application takes ~20–30 min of your
  attention total, most of it touchpoint ④.
- **When any reply/rejection/silence happens:** say `/outcome <company>: <what happened>`.
  Thirty seconds. This is the input the whole learning loop runs on — skipping it is how
  the system stays dumb.

### Weekly (Sunday, ~10 min)
Say `/outcome weekly review`. You get: overdue follow-ups (with drafts ready), what's
converting by channel/framing with honest counts, and proposed recalibrations — which only
apply after you say yes.

### Monthly (the 1st, as early as you can)
- `/job-scout` the moment the new HN *Who is Hiring* thread is up — visibility decays in hours.
- Consider posting in *Who wants to be hired* (format is in the outreach skill).
- After YC Demo Days (spring/fall): push Work at a Startup hard — freshly funded = hiring spike.

---

## How the self-improvement actually works (not hand-waving)

The loop is a file: **`profile/learnings.md`**.

1. Every `/outcome` call writes evidence there: which framing got replies, which form
   questions keep appearing, which stories landed in interviews, new facts about you.
2. Every *generating* skill (tailor-resume, outreach, cover-letter, apply-pack) reads it
   **before producing anything** — so a lesson logged Tuesday changes Wednesday's resume.
3. At weekly review, learnings confirmed 3+ times get **promoted** into permanent rules
   (edited into the skill files or voice.md, with your OK); learnings contradicted by new
   data get deleted. The file stays short and true instead of growing into noise.
4. Same flow feeds your public profile: when your answers reveal something not yet in
   `stories.md`/`facts.yaml`/portfolio `skills.md`, it lands in "profile updates pending"
   so your public-facing profile evolves with the same data.

So: **the more honestly you log outcomes, the better every future application gets.**
That's the entire contract.

---

## The quality theory, in one paragraph (what every skill is enforcing)

A founder reading your message is pattern-matching one thing: *does this person already
operate in our world?* That's produced by four mechanisms the skills encode — founder-mode
language (specifics, numbers, "here's what I'd do", never titles-and-enthusiasm), unity
over flattery (demonstrate you think about their problem; never say "I love what you're
building"), one mirrored company-specific phrase (theirs, not industry buzzwords — more
than one reads as a technique), and checkable specificity (every claim carries a number,
name, or live link, because specifics are costly to fake and readers now smell generic AI
text instantly). The `/cover-letter` skill is the fullest encoding of this; read it once —
it will also make you better at the live conversations no tool can attend for you.

---

## Layout

```
job-ops/
├── CLAUDE.md              # pipeline rules — auto-read by every Claude session here
├── profile/               # ★ THE part you own. Everything generated traces back here.
│   ├── facts.yaml         #   hard truth: identity, projects (dual framings), knockouts
│   ├── stories.md         #   your Q&A answers — add every new one you write
│   ├── voice.md           #   how you write; banned words
│   └── learnings.md       #   the self-improvement ledger (written by /outcome, read by all)
├── .claude/skills/        # job-scout · company-research · tailor-resume · ats-score
│                          # outreach · cover-letter · apply-pack · outcome
├── .github/workflows/     # scout runs every 6h on GitHub, opens lead/follow-up Issues
├── gh-tools/              # GitHub layer: notify · recon · pr-wedge · profile-audit
│                          # → setup + example prompts in gh-tools/README.md
├── scripts/               # scout.mjs · followups.mjs (overdue check) · resume-pdf.mjs · cover-letter-pdf.mjs · mark-processed.mjs
├── inbox/                 # raw scout hits + leads.md (the A–F shortlist)
├── applications/
│   ├── targets.md         # your 20–40 company LAMP list
│   ├── tracker.md         # every send + outcome
│   └── {company}/         # dossier · resume · outreach · cover-letter · pack.json · log
├── resumes/base.md        # master resume; tailored variants derive from it
└── extension/             # Chrome MV3 autofill — fills from pack.json, NEVER submits
```

## Extension in 20 seconds
Open the application form → click the JobOps icon → paste the company's `pack.json` →
**Load pack** → **Fill this page**. It fills matched fields (never overwriting anything
already typed), lists what it couldn't match so you fill those by hand, and has no code
path that clicks submit. Attach the resume PDF yourself — file uploads are deliberately
manual.

## What this system will never do
Mass-apply, auto-send, auto-submit, or invent a fact. Wonsulting shut down its bulk
auto-apply after a 2% interview rate; LinkedIn suspends accounts for bot-like application
patterns; recruiters pattern-match template-smell into instant rejection. The constraint
isn't caution — it's the strategy.
