# Bureau — dossier (2026-10-23)

Lead: ATS scout after widening the seed list (66 Bengaluru startups added). Role: **Data
Engineer**, Bangalore, posted 2026-09-22, still open; a **Senior Data Engineer** req is open
too, so the data team is growing. JD in `jd.md`. Apply: Ashby
https://jobs.ashbyhq.com/bureau/0896ed82-d54c-4e35-81a9-bb3818056034

## Product in one paragraph
A unified risk-decisioning platform for compliance, fraud and transaction risk: one decision
engine over an identity knowledge graph (JD: "1 billion+"; 2024 press: "over half a billion
identities"), Graph Neural Networks on top. 150+ banks, fintechs, retailers and platforms; device
SDKs (web/mobile, RASP) feed it. Not usable without a sales contract. (JD; fintech.global 2024)

## People
- **Ranjan Reddy**, founder & CEO (ex-Qubecell, Boku Identity). CTO / head of data not found.
- Warm paths: not checked. Next: IIIT Nagpur alumni at Bureau via `/network-scout` lens 2.

## Momentum
- **$30M Series B, Dec 2024**, led by Sorenson Capital with PayPal Ventures; $50M+ total (JD).
  https://fintech.global/2024/12/18/risk-intelligence-platform-bureau-secures-30m-series-b-funding/
- 19 open roles on Ashby (eng, data, sales, product), expanding APAC → Americas, Europe.

## Their vocabulary (mirror at most one)
- "You debug rather than guess, and you can explain what actually went wrong" (JD)
- "at Bureau a wrong number is a wrong risk decision" (JD)
- "keep our schemas and contracts sane as the system grows" (JD)

## Architecture, as far as it is visible
JD: batch + streaming pipelines from device SDKs, internal services, partner APIs; Airflow DAGs;
Spark + SQL on a data lake; Kafka/MSK; AWS (S3, EC2, EMR, Athena); ClickHouse/Databricks/
Snowflake exposure; graph DBs. Observed: api.bureau.id behind Cloudflare, status page on
Next.js/Vercel, Google Workspace, HubSpot. See tech-read.md.

## What I'd do in week one
1. **Data-quality checks as contracts** on the SDK ingestion path: schema and null-rate checks
   that fail the DAG before a bad batch reaches a risk decision. The DeepDoc lesson: a field the
   ingestion step never wrote blanked everything downstream, silently.
2. **Consumer-lag and freshness alerts** per Kafka topic tied to the decisioning path, not just
   broker health.

## Which framing wins
**backend_framing, data-leaning.** Lead with the MongoDB $graphLookup rewrite (one graph query
instead of one per level; 3 round-trips to 1), Chatterly (Kafka decoupling ingest from batched
Postgres writes), Storix (Celery pipeline off the request path), the klimb.io Postgres ledger
(SQL), DeepDoc (the ingestion bug its eval caught).

## Risks / be straight about
- Asks **1–3 years**; Shivam has ~10 months of internships.
- **No Spark, no Airflow, no data lake.** JD allows "a genuine willingness to ramp up quickly"
  for Spark. Never claim either.
- Expect SQL depth: window functions, query plans, OLTP vs OLAP (the DeciOps gap; study it).

## Draft answers
- **Why Bureau?** A wrong number at Bureau is a wrong risk decision, which is the kind of data
  work I want: where a silent pipeline bug has a cost. I hit a small version of that in my RAG
  app, where ingestion never wrote one field and every answer came back empty while each part
  looked fine. I found it by testing each stage separately, not by guessing.
- **Availability:** from 23 November 2026, Bangalore.
