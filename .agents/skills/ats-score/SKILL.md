---
name: ats-score
description: Score a resume against a specific job description on a 100-point rubric (keyword coverage, bullet mechanics, quantification, section completeness, format safety) and list the exact edits to gain the missing points. Use inside the tailor-resume loop or standalone.
---

# ATS Score

Inputs: resume markdown + JD text. Output: score /100, per-category breakdown, ranked edit
list. Passing bar: **80**.

Calibration: this rubric exists to predict what real graders (Resume Worded, Jobscan,
recruiter screens) will say. A draft that scored 80 here and 55 there means the rubric was
gamed — the mechanical checks below are the ones that got missed, so run them literally,
counting, before scoring anything subjective.

## Mechanical pre-checks (run first, they are cheap and they decide most of the loss)

Count these explicitly and show the counts in your output:
- **Bullets not opening with a past-tense action verb.** Noun-phrase openers ("RAG pipeline
  that…", "3-service backend with…", "Agents pay…") are the #1 penalty. Target: zero.
- **Repeated opening verbs.** List each verb with its count. Any verb used 3+ times = fix.
- **Bullets with no hard number.** Target: under one-third.
- **Buzzword/filler hits.** Banned outright per AGENTS.md: leverage, passionate, thrilled,
  seamless, align perfectly, proven track record. Also flag as filler: end-to-end,
  production-grade, robust, cutting-edge, best-in-class, results-driven, spearheaded,
  utilized, responsible for, helped, worked on, various, several, deep dive, synergy.
- **Missing sections.** Education, Experience, Projects, Technical Skills, Achievements must
  all be present with those standard headings.
- **Consistency.** Tense uniform within each entry, date format identical across entries,
  bullet terminal punctuation uniform, no spelling errors.

## Rubric (100 pts)

1. **Searchable keyword coverage — 25 pts.** Extract the JD's hard requirements (languages,
   frameworks, domains, seniority markers). Each *true-for-Shivam* requirement present in
   exact searchable form = full credit; synonym only = half; absent = zero. List
   requirements that are true but missing (fix) vs. not true (never add).
2. **Bullet mechanics — 20 pts.** From the pre-checks: verb-first openers, no repeated
   verbs, What/How/Impact complete in each bullet. Score the weakest bullets, not the
   average. Any noun-phrase opener caps this category at 10.
3. **Quantification & checkability — 15 pts.** Numbers, live URLs, named third-party
   validation (competitive-programming rank, hackathon placement, live links) near the top. First 3 lines must survive
   an 8-second pass.
4. **Section completeness & signal — 15 pts.** All five sections present. Achievements
   section carries the LeetCode/CodeChef ratings and the hackathon rank — this is what graders read as
   leadership and drive signal, and dropping it costs the whole category. No floating
   summary paragraph.
5. **Relevance density — 10 pts.** % of content a reader for THIS role would care about.
   Every off-target project or bullet costs points.
6. **Format safety — 10 pts.** Single column, standard headings, no tables/images, parseable
   dates, contact info as real text, **exactly one page** (render it and check — don't
   assume).
7. **Generic-AI smell — 5 pts (negative screen).** Any banned-word hit, uniform sentence
   rhythm, or unquantified enthusiasm = 0 here plus a mandatory edit.

## Output format

```
SCORE: NN/100 (pass ≥ 80)

PRE-CHECKS
  noun-phrase openers: N  → [list them]
  repeated verbs:      Built ×3, Designed ×2
  bullets w/o number:  N of M
  buzzword hits:       N  → [list them]
  missing sections:    [...]

| Category | pts | max | top fix |
...

EDITS (ranked by points gained):
1. ...
```

Be harsh. An inflated score wastes an application on a real company. Also flag
knockout-question risks visible in the JD (visa, years-of-experience, degree requirements)
with the honest answer from facts.yaml `knockout_answers`.
