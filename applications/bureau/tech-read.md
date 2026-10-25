# Bureau — tech read (2026-10-23, light: no public API docs reachable)

## 1. What they run
JD-stated: Python/Java/Scala, Spark + SQL on a data lake, Airflow, Kafka/MSK, AWS (S3, EC2, EMR,
Athena), containers/K8s, graph modelling for the identity graph. Observed: api.bureau.id on
Cloudflare; status page on Vercel/Next.js; docs.bureau.id timed out from here.

## 2. Problems their shape forces
- Late or duplicated device-SDK events feeding real-time risk scores: dedup keys, watermarks.
- Entity resolution across sources at 1B+ identities: the same person under different phone,
  device and email keys.
- Schema drift from partner APIs breaking downstream DAGs quietly.

## 3. Seam Shivam has touched
MongoDB $graphLookup (graph traversal in one query); Kafka ingest decoupled from batched Postgres
writes (Chatterly); Celery pipelines (Storix, poiro); a silent ingestion bug found by stage-wise
tests (DeepDoc). Not touched: Spark, Airflow, lakehouse formats, graph DBs.

## 4. Two questions
1. "When the same person arrives under a new device ID and an old phone number, does the graph
   merge them at ingestion time in the pipeline, or at query time in the decision engine?"
2. "For the real-time decisioning path, is the feature store fed from the same Kafka topics as the
   batch lake, and how do you keep the two from disagreeing on a number?"
