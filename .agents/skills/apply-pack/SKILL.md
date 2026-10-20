---
name: apply-pack
description: Assemble the final application pack for one company — every form field answered (identity, links, knockouts, custom questions), final resume, cover note — as pack.json for the JobOps Chrome extension to autofill. Use as the last step before Shivam opens the application form.
---

# Apply Pack

Inputs: dossier.md, final resume.md (must already be ats-score ≥ 80), outreach.md,
cover-letter.md (run /cover-letter first if the form has a letter or long "why us" field),
`profile/facts.yaml`, `profile/learnings.md` (its "form questions seen" section extends
the staples below). Output: `applications/{company}/pack.json`.

## pack.json shape (the extension consumes exactly this)
```json
{
  "company": "acme",
  "role": "Founding Engineer",
  "generated": "2026-07-18",
  "identity": {
    "first_name": "Shivam", "last_name": "Verma", "full_name": "Shivam Kumar Verma",
    "email": "shivam.verma.dev00@gmail.com", "phone": "+91 91356 68614",
    "location": "India", "city": "Warisaliganj, Bihar", "country": "India",
    "linkedin": "https://www.linkedin.com/in/shivamv99/", "github": "https://github.com/shivamxverma",
    "portfolio": "https://www.shivamworks.dev/", "twitter": ""
  },
  "resume_file": "resume.pdf",
  "answers": [
    { "match": ["why.*(company|us|here)", "interested in"], "text": "..." },
    { "match": ["sponsor", "visa", "work authoriz"], "text": "..." },
    { "match": ["start date", "available"], "text": "..." },
    { "match": ["salary", "compensation"], "text": "..." },
    { "match": ["tell us about yourself", "about you"], "text": "..." },
    { "match": ["proudest|impressive|project"], "text": "..." },
    { "match": ["cover letter", "additional information", "anything else"], "text": "<from cover-letter.md>" }
  ],
  "notes_for_shivam": ["anything needing his judgment before submit"]
}
```

## Rules
- Every custom answer: Shivam's voice (profile/voice.md), specific to this company (from
  dossier), 1 checkable number/link where natural, honest per facts.yaml knockout_answers.
- **These answers get autofilled and submitted as Shivam's own words, so voice.md is binding —
  especially rule 7: no em dashes (—) in any answer text.** They're the clearest AI tell on a
  form. Use commas, periods, or parentheses instead. Read each answer back and ask "does this
  sound like Shivam typed it, or like a model generated it?" Rewrite until it's the former.
- `match` entries are case-insensitive regexes the extension runs against form labels.
  Anticipate the actual questions from the posting if visible; include the six staples above
  always.
- Anything uncertain (phone, compensation number, references) goes into `notes_for_shivam`
  instead of a guessed answer.
- Remind Shivam at the end: extension fills, **he reviews every field and clicks submit**.
