---
name: company-research
description: Build a research dossier on a target company — product, founders, funding, hiring signals, their exact vocabulary, and drafted answers to "why us" style questions. Use before tailoring a resume or writing outreach for any company.
---

# Company Research

Input: company name (+ posting link if available).
Output: `applications/{company-slug}/dossier.md`. Every later stage reads this file.

## Research passes
Use WebSearch for discovery (find the company site, blog, socials, funding news). For
pulling actual page content — especially anything multi-page like a blog/changelog/docs —
use Firecrawl instead of WebFetch: it returns pre-cleaned markdown per page and can map or
crawl a whole site in one call, so a 5-10 page research pass costs a fraction of the tokens
and doesn't drag nav/footer noise into context.

```
node scripts/lib/firecrawl.mjs map <site-url>              # list URLs fast, pick targets
node scripts/lib/firecrawl.mjs scrape <url>                 # one page → clean markdown
node scripts/lib/firecrawl.mjs crawl <site-url> --limit 15  # whole site/section → markdown per page
```

Key lives in `.env` (gitignored, never commit it) as `FIRECRAWL_API_KEY`. Falls back to
Firecrawl's keyless free tier (rate-limited) if the key is missing. Reach for WebFetch only
for a single one-off page where Firecrawl isn't worth the round trip.

1. **Product** — what it does, who pays, recent launches/changelog. `map` the site first to
   find the blog/changelog/pricing pages, then `crawl` or `scrape` them. If usable free,
   actually describe what using it feels like ("being a genuine user is a huge plus" — YC's
   own advice).
2. **People** — founders + likely hiring manager: names, X/LinkedIn/GitHub, what they post
   about, anything shared with Shivam (backend infra, async pipelines, dev tools, applied AI, India, IIIT Nagpur, competitive programming).
3. **Money & momentum** — batch/stage, last raise, headcount trend, repeat job postings
   (a company posting the same seat monthly is growing).
4. **Voice capture** — pull 3–5 *unusual, company-specific* phrases from their blog/changelog/
   product copy (use the `crawl` output from pass 1). NOT industry buzzwords — the one weird
   phrase a competitor would never use. (This powers accommodation in outreach; generic
   mirroring reads as manipulation.)
5. **GitHub recon** — if they have a public org, run
   `node gh-tools/recon.mjs {org} --out` and fold the findings in: their ACTUAL languages
   vs the JD's claims, whether the code is alive, top recent committers (likely
   interviewers/HM — cross-reference with the People pass), and any labeled wedge issues.
   For motivation-3 targets, follow with `node gh-tools/pr-wedge.mjs {org}` — a merged PR
   is the strongest opener that exists.
6. **The gap** — one concrete thing Shivam could ship for them in week one, stated as an
   initiative ("I'd add X to Y because Z"), per YC's lead-with-2-3-initiatives guidance.
7. **The tech read (A/B leads: mandatory).** Run `node scripts/stack-probe.mjs {domain} --slug
   {company}`, then `/tech-read {company}`. Twenty seconds of scripted recon plus one page of
   reasoning, and it is what makes pass 6 an architectural observation instead of a guess: the
   week-one initiative should come out of `tech-read.md` section 3 (the problems their shape
   forces), and their real stack from section 1 beats the JD's wishlist for the resume's keyword
   choice. **Read the docs / API reference during this pass, not the marketing site** — it is the
   highest-yield artifact for a company's actual architecture and the most commonly skipped.

## Dossier format
```
# {Company} — dossier ({date})
## Product in one paragraph (as a user, if possible)
## People (founder/HM + contact paths + common ground)
## Momentum (stage, raise, hiring signals)
## Their vocabulary (3–5 exact phrases, with source links)
## Architecture, as far as it is visible (3–4 lines + link to tech-read.md; A/B leads)
## What I'd do in week one (2–3 specific initiatives)
## Which Shivam framing wins here (backend-infra / full-stack / AI-workflow — pick from facts.yaml)
## Draft answers
- Why {company}? (specific, references real product detail, Shivam's voice per profile/voice.md)
- Why this role? / What excites you?
- Anything else likely on their form
```

Cite sources inline. If a claim can't be sourced, mark it GUESS — never let a guess reach a
form answer unverified.
