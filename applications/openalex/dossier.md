# OpenAlex — dossier (2026-09-29)

Role: **Software Engineer** (two seats), $150–200k USD, full-time, **Remote**, reports to the CTO.
Posted HN Who is hiring 2026-09-01 (item 49524920, by `caseydm`); freehire mirror shows it open,
updated 2026-09-17. Role page https://openalex.org/jobs/software-engineer is Cloudflare-walled to
scripts, so the JD text below was read from the page's own source in their public repo
(`ourresearch/openalex-gui`, `src/views/JobsSoftwareEngineerPage.vue`) and the form from
`src/components/Jobs/JobApplicationForm.vue`. Read in full; no canary or AI-addressed
instruction in the listing copy.

**No years bar and no geography wall is stated anywhere** (JD, HN post, form). The form asks for
free-text location only. This is why the lead is B, not C.

## Product in one paragraph (as a user, if possible)
OpenAlex is an open index of the world's scholarly research (works, authors, institutions,
sources, topics, funders, awards), free via REST API, bulk snapshot and a web app. It is the
open replacement for Microsoft Academic Graph and, through the Unpaywall surface, the legacy
open-access lookup. Traffic is "about a billion API calls per month" (HN post). The API is
anonymous-usable with a free **$1/day budget**; above that it's pay-as-you-go prepaid credit or
annual plans (Member $5k/yr = $20/day, Member+ $10k, Partner $20k+) per help.openalex.org/access.
Credits price per endpoint class: `1 credit = $0.0001`, list = 1 credit, search more (10;
"grandfathered" keys pay 1), from `openalex-api-proxy/src/index.ts`. They ship an official MCP
server and a Claude connector, and an OQL query language that "transpiles to the same query
object under the hood" (help.openalex.org/access/querying). Usable free: `curl
https://api.openalex.org/works?filter=...` works with no key.

## People (founder/HM + contact paths + common ground)
- **Jason Priem**: co-founder of OurResearch (the nonprofit behind OpenAlex and Unpaywall).
  228 commits in the last 90 days across the org (`gh-tools/recon.mjs`), by far the top
  committer. Rules in `openalex-walden/CLAUDE.md` are quoted as his ("Jason, 2026-09-26").
  Wrote the jobs-page pitch copy (redline comments in `jobs-redline.yaml`).
- **Casey M (`caseydm`)**: engineer on OpenAlex and Unpaywall since 2022 (blog.openalex.org
  "Meet Casey"), 40 commits in 90d, **posted the HN listing** and did the final red-pen round on
  this exact role page (R27). Most likely first reader of applications. GUESS: whether he is the
  CTO the role reports to is not stated anywhere; don't assert it.
- **Kyle (`kyleourresearch`)**: 20 commits in 90d, reviewed the job-page copy.
- **Rohan (`rohanMantena`)**: joined on a 2026-07-01 offer (page comment: "from Rohan's 2026-07-01
  offer letter = Jason's SWE job description"), so the most recent hire into this same seat.
- Contact path: **the form is the channel**. It requires an OpenAlex account ("Auth via the
  applicant's OpenAlex account; one-shot per (user, role)"), and applications "can't be edited
  once submitted". No published hiring email. HN replies on the thread went unanswered.
- Common ground: none personal. Technical common ground is strong (see Architecture).

## Momentum (stage, raise, hiring signals)
Nonprofit, "funded by grants and enterprise support" (HN). Hiring two engineers plus a Community
Lead and an Operations Associate at the same time (form's `role` prop lists all three), so the
team is growing. 25 of 30 repos pushed in the last 90 days; `openalex-walden` pushed today. The
recent hire in July plus two more seats reads as a real expansion, not a backfill.

## Their vocabulary (3–5 exact phrases, with source links)
- "**you'll notice what's missing, propose it, build it, ship it, and answer the tickets about
  it**" (JD, role section). The one to mirror if mirroring anything.
- "**You love working with messy data — that's the only kind we get.**" (JD, about-you)
- "**relentlessly resourceful**" (JobsAboutYou.vue, attributed to pg)
- "**play jazz, not classical**" (JobsAboutYou.vue)
- "**Guardrails contain bugs; they never set the size or pace of our work**" (Jason, 2026-09-26,
  `openalex-walden/CLAUDE.md`). Internal, so reference the idea, never quote it as theirs.

## Architecture, as far as it is visible
Databricks medallion pipeline (`openalex-walden`, bronze/silver/gold, nightly `Walden End 2 End`
at 05:00 UTC with a 7.5M-row Guardrails check before publish) → Elasticsearch-backed Flask API
(`openalex-elastic-api`) → a TypeScript Cloudflare Worker in front of `api.openalex.org/*`
(`openalex-api-proxy`) that does auth, per-endpoint credit pricing, rate limiting and billing in a
`RateLimiter` Durable Object, writing prepaid-credit consumption back to Postgres via Hyperdrive.
Full read with evidence: [tech-read.md](tech-read.md).

## What I'd do in week one (2–3 specific initiatives)
1. **Get the support queue to teach me the system.** The JD says hard technical tickets land on
   the engineer who understands the system. I'd take a batch of the API ones first (credit/429
   confusion is visibly a live class: the proxy has special cases because "the SPA renders any
   logged-out 429 as the daily-credit modal ... even though NO credits were spent"), and trace
   each through Worker → Durable Object → ES, because that path is where my klimb.io ledger work
   actually applies.
2. **Make the credit writeback provably exactly-once, or learn why it doesn't need to be.**
   `writebackOnetimeCredits` claims-and-resets the DO counter, then runs the Postgres UPDATE, and
   restores only if the UPDATE throws. I'd read it against isolate eviction mid-flight and a
   retried `/refund`, and add a reconciliation check (DO consumed vs DB balance) before proposing
   any change. Framed as a question first (tech-read §5), not a bug report.
3. **Ship one small thing through the nightly.** Pick a messy-data ticket (an affiliation or name
   normalisation), estimate its content-hash blast radius against the 7.5M Guardrails line the way
   `walden/CLAUDE.md` says to, and get it through End 2 End. That's the fastest way to learn the
   pipeline's real rules.

## Which Shivam framing wins here
**backend-infra**, with a data-integrity lean. The story that fits their shape most honestly:
poiro.com SHA-256 dedup with a DB uniqueness guarantee (content hashes as correctness keys,
exactly what their pipeline does per work), the klimb.io credit ledger (their Worker is a credit
ledger), and Hireflow's cross-source ingestion + fingerprint dedup (their bronze layer is
multi-source harvesting). Python + Postgres + Cloudflare R2 are all true and all in their stack.

Honest gaps, name them rather than hide them: **PySpark/Databricks** (none), **Elasticsearch**
(none), "data systems at real scale" (his scale is product-scale, not hundreds of millions of
rows), ~8 months professional experience. The role has no stated bar, so the gap is judgment,
not a knockout.

## Draft answers
The form's three required questions are long-form ("three to six paragraphs is often a good
fit", "Feel free to use AI, or not") and live in [answers.md](answers.md). pack.json carries
them. No anti-AI warning on this form.
