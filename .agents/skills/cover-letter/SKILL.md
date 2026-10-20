---
name: cover-letter
description: Write a cover letter or long-form "why us / why you" answer that reads like Shivam already works there — researched, specific, in their vocabulary, mapped to their actual gap. Use for any form field or attachment longer than ~100 words. Requires a dossier; refuse to write without one.
---

# Cover Letter

The goal is a specific psychological effect in the reader's head: *"this person has done
their homework, already thinks about our problem the way we do, and I can picture their
first month."* Everything below serves that effect.

Inputs: `applications/{company}/dossier.md` (mandatory — if missing, run /company-research
first; a letter without research is worse than no letter), JD, `profile/facts.yaml`,
`profile/stories.md`, `profile/voice.md`, `profile/learnings.md`.
Output: `applications/{company}/cover-letter.md`. Then:
- If the letter goes in a **form field** (paste-in "why us" / additional info), copy the text
  into pack.json (via /apply-pack) — no PDF needed.
- If it's an **upload/attachment**, render a PDF in the same house typography as the resume:
  `node scripts/cover-letter-pdf.mjs applications/{company}/cover-letter.md` → `cover-letter.pdf`.
  The script wants a first line of `# {Company} — cover letter ({date})` as its title (used to
  build the letterhead, not printed verbatim), then blank-line-separated paragraphs, then an
  optional signoff line. It reuses the CMU Serif fonts and one-page whitespace compression from
  the resume renderer, so the letter matches the resume.

## The theory (why each part exists)
- **Founder-mode test (PG):** the reader pattern-matches "does this person talk in
  specifics, numbers, and 'here's what I'd do' — or in titles, years, and enthusiasm?"
  Employee-mode letters die in 8 seconds.
- **Unity beats liking (Cialdini):** "I love what you're building" = flattery, discounted
  instantly. Unity is *demonstrated*: use their frame correctly, talk about their problem
  as someone inside it. Show membership, never claim it.
- **Accommodation (Giles):** mirror exactly ONE unusual, company-specific phrase from the
  dossier's vocabulary section — the phrase a competitor would never use. More than one, or
  generic buzzwords, flips from rapport to detectable technique.
- **Specificity is costly to fake (Julian Shapiro):** every paragraph needs a number, a name,
  or a checkable link. Generic polish is free, so readers discount it; specifics read as
  effort, and effort reads as sincerity.
- **Do things that don't scale:** the strongest possible content is one unscalable thing done
  for THEM — used their product and noticed something real, read their public code, found a
  concrete gap. If the dossier has this, lead with it. It cannot be templated, which is
  exactly why it works.

## Structure (150–250 words, 4 paragraphs, never more than one page)
1. **The hook — their world, not yours.** Open with the specific observation about their
   product/post/changelog (from dossier), and the tension or opportunity in it. Never open
   with "I am writing to apply for…" or anything about yourself.
2. **The bridge — proof you've solved their shape of problem.** ONE project, the one the
   dossier picked as the winning framing, told as What/How/Impact with its number
   ($9K grant, 160 users/48h, 3-service microarchitecture…). Resist listing a second
   project; one deep beats three shallow.
3. **The initiative — your first month, concretely.** 2–3 sentences: "I'd start with X
   because Y" pulled from the dossier's "what I'd do in week one". This is the paragraph
   that creates the "I can picture them here" effect. Must be plausible and humble-specific,
   not grandiose.
4. **The close — small ask, checkable link.** One sentence: happy to walk through code /
   the live product; link; availability fact from facts.yaml if relevant. No begging, no
   "I would be honored".

## Quality gate (run before saving — reject and rewrite on any failure)
- [ ] Could the first paragraph have been written about any other company? → rewrite.
- [ ] Zero banned words (voice.md list); sentence lengths vary; sounds like stories.md.
- [ ] Zero em dashes (—) in the letter body (voice.md rule 7) — the reader clocks them as AI.
      Rewrite around each one. (The `# … — cover letter (date)` title line is an internal
      parsing token for the PDF script, never shown to the reader, so it's exempt.)
- [ ] Exactly one mirrored company phrase, used naturally.
- [ ] Every claim traceable to facts.yaml; at least 2 numbers/links total.
- [ ] Paragraph 3 names something on THEIR actual roadmap/product, not a generic ambition.
- [ ] Read it as the founder: does anything smell like a template with the name swapped?
- [ ] Under 250 words.

Log the letter's framing choice in `applications/{company}/log.md` so /outcome can later
correlate letter style with replies.
