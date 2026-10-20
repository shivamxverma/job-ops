# CyberAtlas — dossier (2026-09-29)

## Product in one paragraph (as a user, if possible)
External attack surface management for the public sector: CyberAtlas discovers, maps and monitors
exposed infrastructure (domains, subdomains, IPs, web services) "at city, regional, and national
scale" for national CERTs, intelligence services and city and regional authorities. The free
**Subdomain Finder** searches 2.5B indexed domains from a pre-built index (certificate transparency
+ passive DNS, updated daily): exact roots, substrings like `*admin*`, TLD-scoped patterns, all in
the browser or through a free JSON API documented for AI agents in `llm.txt`. Also publishes daily
threat bulletins (131 on record). (Sources: cyberatlas.ai, /finder/about, /finder/llm.txt,
/bulletins, 2026-09-29.) Used the API twice for recon; **the anti-bot Finder query in the
application is Shivam's to run himself.**

## People (founder/HM + contact paths + common ground)
- No founder or team names published on the site, and no GitHub org found. The HN account is
  `cyberatlas` (item 49523704, 2026-09-01). GUESS: small team, likely Europe-based (the bulletins
  are written in UTC); unverified.
- Apply channel: **email atlas@cyberatlas.ai** with CV, subject containing "HN Software Engineer",
  and the anti-bot check: (1) the query you ran on Finder, (2) its first-page results.
- Gmail prior-contact check: not run (Gmail MCP isn't connected this session). No trace of
  CyberAtlas in the archive beyond raw scout JSON; the previous owner never applied.

## Momentum (stage, raise, hiring signals)
No funding or headcount published. Signals of a live, shipping product: public Finder + agent API,
the daily bulletin cadence through 2026-09-27, and a Software Engineer seat posted 2026-09-01.
Remote worldwide, full-time, no years bar stated, no salary stated.

## Their vocabulary (3–5 exact phrases, with source links)
- "Securing Public Infrastructure Before Attackers Strike" — homepage
- "Finder answers from a pre-built index" / "Because the work is already done" — /finder/about
- "a leading-wildcard full scan is never performed" — /finder/llm.txt
- "internet-scale systems processing billions of domains and websites" — HN post

## Architecture, as far as it is visible
Cloudflare in front. Hostnames are partitioned by root/TLD; exact-root queries page as a KV range
scan (`kv:` cursor), substring queries scan their partition and every query is metered by rows
scanned against a daily domain budget (`x-domainscan-cost`, `x-domainbudget-*`). The agent docs
still describe an OpenSearch point-in-time cursor that the live API no longer returns. Full read:
`tech-read.md`.

## What I'd do in week one (2–3 specific initiatives)
1. **Make `llm.txt` a tested contract**: a CI check that runs each documented example against the
   API and fails when the response shape drifts (the cursor format and `total_is_approximate`
   already have). Agents code against that file.
2. **Measure cost per query shape**: log `x-domainscan-cost` against pattern shape and TLD for a
   week to find which patterns (un-scoped substrings, `.com`) dominate the budget before optimising
   anything.
3. **Ingest dedup audit**: count duplicate sightings per hostname across CT and passive DNS for one
   day's batch, which tells you whether key-upsert or append-and-compact is the cheaper merge.

## Which Shivam framing wins here
**backend-infra.** Python/FastAPI (Storix, Yuvro, poiro.com), Redis (CodeSM, Storix, Chatterly),
MongoDB/Postgres, Docker, and pipelines that run outside the request path. Dedup at ingest is the
closest seam (Hireflow SHA-256 fingerprints; poiro.com DB-guaranteed dedup). Queue-based crawling
(Hireflow's Playwright + BullMQ, rate-limited stages) is the second.

**Honest gaps, named in the email:** no Go, no OpenSearch/Elasticsearch, no LMDB, no security /
fingerprinting background, and nothing at billions scale. About 8 months professional.

## Draft answers
- **Why CyberAtlas?** The Finder answers internet-wide substring queries instantly from a
  pre-built index, and the cost header shows what that takes: 54.6M rows for one `.io` query. The
  interesting problems are the index, the daily merge and query cost.
- **Why this role?** Backend services and data pipelines are what he builds; the scale is the
  part he wants to grow into.
- The email is in `outreach.md`. The CV is `resume.pdf` in this folder.
