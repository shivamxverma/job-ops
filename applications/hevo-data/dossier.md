# Hevo Data — dossier (2026-10-21)

Role: **SDE I, Backend team, Bangalore (onsite)**, full time. Lever:
https://jobs.lever.co/hevodata/6cbbe304-e065-4711-bf3e-756795d2bc2a (posted 2026-07-27, still listed).
Found by `ats-scout.mjs` on Hevo's own Lever board.

## Product in one paragraph
No-code data pipelines: Hevo pulls data from SaaS apps and databases (Salesforce, HubSpot, Stripe,
MySQL, Postgres and many more) and loads it into warehouses like Snowflake, BigQuery, Databricks
and Redshift, pitched as a "reliable and cost effective alternative to tools like Fivetran,
Airbyte, Stitch" ([llms.txt](https://hevodata.com/llms.txt)). A Pipeline does a historical load
once ("Recent Data First" for SaaS sources), then incremental syncs on a schedule. Newest bet:
**ConnectAI**, an agent that builds a managed connector for any REST API from its docs or OpenAPI
spec and tests it in Hevo's sandbox: "Hand over the API docs. Get a managed connector in hours."
Early access; demo day 2026-10-22 ([connectai](https://hevodata.com/product/connectai/)).
Not used hands-on yet (free trial exists; worth 20 minutes before an interview).

## People
- **Manish Jethani**, co-founder & CEO. **Sourabh Agarwal**, co-founder & CTO. Founded 2017
  ([YourStory](https://yourstory.com/2021/12/funding-alert-saas-startup-hevo-data-no-code-platform/amp)).
- Hiring manager for the Backend team: unknown. Lever form only, no named contact on the posting.
- Warm path: TODO, check LinkedIn for IIIT Nagpur alumni or 1st-degree connections at Hevo
  (network-scout lens 2) before submitting.
- Common ground: Bangalore; connector-style work (third-party APIs behind one contract).

## Momentum
- $30M Series B, Dec 2021, led by Sequoia Capital India (now Peak XV), with Qualgro, Lachy Groom,
  Chiratae ([Inc42](https://inc42.com/?p=271634)). $1M seed 2017 (IDG Ventures India). No newer
  round found (GUESS that none exists; not verified on Crunchbase).
- Headcount ~242 per an undated Inc42 profile (third-party, don't quote).
- Shipping: ConnectAI in early access (Oct 2026). Lever board had 53 open roles on 2026-10-21.

## Their vocabulary (mirror at most one)
- "Recent Data First" (historical load order for SaaS sources), docs.
- "Hevo Ingestion Controller" ("tracks API rate limits and incremental offsets"), docs.
- "Hand over the API docs. Get a managed connector in hours." (ConnectAI page).
- "Deferred Data Ingestion" (what happens when a source's quota runs out), docs nav.

## Architecture, as far as it is visible
Connectors (poll, track read positions; the Ingestion Controller handles rate limits and offsets)
→ Kafka-based Hevo Event Stream → Consumers (validate, transform, map types, stage to S3/GCS, load).
Jobs run on a distributed task manager with auto-scaled workers. Full read: `tech-read.md`.

## What I'd do in week one
1. Ship the assigned SaaS connector end to end, and alongside it write a **recorded-response test**
   for it: real paginated responses, a 429, an expired cursor, saved and replayed, so the connector
   can be re-checked without hitting the vendor. (From tech-read §3.3; same idea as the DeepDoc
   replay harness, said as an idea, not a claim about their codebase.)
2. Find out how the connector's quota is shared with other Pipelines on the same account before
   writing its retry logic (tech-read §5 Q1).

## Which framing wins
**backend_framing.** Lead with the poiro.com provider adapter layer (three external APIs behind one
contract, cursor tokens, spend caps), then Hireflow (4-source ingestion on BullMQ, fingerprint
dedup), then CodeSM. AI framing only as a secondary line for ConnectAI.

## Draft answers
The Lever form has no free-text questions (resume, name, email, phone, location, current
company, LinkedIn, captcha). These are for a recruiter screen or an email to an engineer.

- **Why Hevo?**
  Connectors are the part of the product I already like working on. At poiro.com I put Pixabay,
  Unsplash and Pinterest behind one search and download contract, swapped their ~2 KB cursors for
  32-character tokens, and added fail-closed caps of 500 calls per org per day. Hevo does that
  for hundreds of sources, and ConnectAI is trying to make building the next one take hours. I'd
  like to work on the part that has to keep those connectors correct.

- **Why this role?**
  The SDE I description is close to what I've done on a smaller scale: third-party APIs, auth,
  pagination, rate limits, and dedup across sources (Hireflow ingests from LinkedIn, Wellfound,
  YC and Telegram and dedups on SHA-256 fingerprints). I'd rather go deep on that at a company
  where it is the product.

- **Current company:** poiro.com (Fullstack Developer Intern, since late Jul 2026; 0 days notice).
- **Current location:** Bangalore is the onsite city he accepts; his current city per facts.yaml is
  Warisaliganj, Bihar. For the location field use "Bengaluru, Karnataka, India" ONLY if Shivam
  confirms he is or will be in Bangalore; otherwise leave it blank. TODO(shivam).
