---
name: tailor-resume
description: Generate a resume tailored to one specific posting using What/How/Impact bullets and the right framing (backend-infra vs full-stack vs AI-workflow), then run a drafter→reviewer improvement loop until /ats-score passes 80+. Use when preparing a resume for a specific company or JD.
---

# Tailor Resume

Inputs: `applications/{company}/dossier.md`, the JD text, `profile/facts.yaml`,
`profile/learnings.md` (apply any "what converts" evidence to framing choices),
`resumes/base.md` — **the house format and the content floor. Start by copying it, then
re-angle. Never write a resume from scratch.**
Output: `applications/{company}/resume.md`, then
`node scripts/resume-pdf.mjs applications/{company}/resume.md`.

## Format contract (non-negotiable — `resumes/base.pdf` is the reference render)

Section order, always, all of them present:
**Education → Experience → Projects → Technical Skills → Achievements.**
Dropping a section to make room is what tanks the score — Achievements is where the competitive-programming
ratings and the hackathon rank live, and automated scorers read that section for
leadership/drive signal. Cut *bullets*, never sections.

Markdown conventions `resume-pdf.mjs` renders (copy them exactly from base.md):
- `# Shivam Kumar Verma` then `> phone | email | [LinkedIn](…) | [GitHub](…) | [Portfolio](…)`
- `### Org or Project @ Dates` — the ` @ ` pushes dates to the right margin
- `*Job title*` on the line under an org; `*Title* @ *Stack or location*` for two-column subtitles
- Projects: `### Name | [GitHub](url) | [Live](url) | *Stack, comma, separated*`
- Skills: four bold-labelled lines (`**Infrastructure & Runtimes:**`, `**Backend & APIs:**`,
  `**Data Systems:**`, `**Languages & Automation:**`) — reorder within each line so
  JD-relevant tech comes first.

**No summary/objective paragraph.** The base has none. A floating paragraph under the
contact line parses as a stray text block and reads as generic AI filler. Do the tailoring
in the bullets and the skills ordering, not in a mission statement.

Typography is fixed and not a tailoring lever: 10pt Computer Modern (CMU Serif, vendored in
`assets/fonts/`), matching Shivam's own LaTeX resume (`resumes/base-reference.tex`). Never change font or size in the script
to make something fit.

One page, enforced by `resume-pdf.mjs`: it compresses whitespace in 5% steps until the PDF
is one page and prints how far it went. If it reports below ~85%, or warns that it's still
2 pages, the resume is over-stuffed — cut the weakest project bullet, never a section.
Keep project stack lists to ~5 items so the `Name | Live | *stack*` row stays on one line
next to its date.

## Bullet rules

- **Every bullet starts with a strong past-tense action verb.** Architected, Engineered,
  Built, Shipped, Designed, Implemented, Developed, Created, Reduced, Secured, Won.
  Never open with a noun phrase ("RAG pipeline that turns…", "3-service backend with…") —
  that is the single biggest automated-score penalty and it is what dropped the aircfo draft.
- **No verb twice.** Scan the whole document before finalizing; if "Built" opens three
  bullets, two must change. Repetition is scored explicitly by real ATS graders.
- **What / How / Impact in every bullet**: what it was (assume zero context), how (actual
  languages/frameworks inline), impact (users, money, numbers). Bold the numbers and the
  proper nouns a recruiter scans for — that's the base.md house style.
- Max 3–4 bullets per role or project. Cut anything not matching THIS role.
- At least two-thirds of bullets carry a hard number. A bullet with no number and no named
  third party is a candidate for cutting.

## Tailoring levers (use these, not prose)

1. **Which projects appear**, and in what order — lead with the one closest to the JD.
2. **Which 3–4 bullets survive** per entry, and which clause inside each leads.
3. **Framing** — pick ONE per company from the dossier ("Which framing wins here") and use
   that project's `backend_framing`/`fullstack_framing`/`ai_framing` lines from facts.yaml. Same true work,
   framed for the reader — never fabricate.
4. **Keyword surfacing** — mine the JD for hard skills a recruiter would search ("Kafka",
   "FastAPI", "Kubernetes"); make sure each *true* one appears in its exact searchable form, in the
   Skills line and ideally once inside a bullet. No stuffing — the real ATS failure mode is
   being unsearchable, not low density.

## The loop (drafter → reviewer, minimum 2 rounds)

1. **Draft** from base.md against the JD.
2. **Review as a skeptical recruiter** doing an 8-second pass: what's the first line they hit?
   Anything generic, unquantified, or irrelevant to this JD? List concrete edits.
3. Apply edits, run `/ats-score` against the JD, render the PDF, confirm one page.
4. Repeat until ats-score ≥ 80 AND the reviewer pass has no remaining edits. Log each
   round's score in `applications/{company}/log.md`.

Never invent experience, dates, or numbers. Everything must trace to facts.yaml or
stories.md; if something useful is missing from those files, ask Shivam and add it there first.

**Date guardrail:** poiro.com is the only current role (July 2026 – Present). klimb.io ENDED
(November 2025 – March 2026) and must never read "Present". Copy both date ranges verbatim from
`resumes/base.md`.
