# Hevo Data — tech read (2026-10-21)

Cluster note: `profile/domains/data-integration-elt.md`. Probe: `stack-probe.json` (same folder).

## 1. The system, as far as it is visible
- [fact] Three stages: **Connectors** (poll the source, track read positions), the **Hevo Event
  Stream** built on Kafka, and long-running **Consumers** that validate, transform, map/promote
  types and stage files to S3/GCS before loading. Source: docs, "Hevo Pipeline Framework".
- [fact] Inside a Connector, a **Hevo Ingestion Controller** "tracks API rate limits and
  incremental offsets", and **Translators** add metadata columns used for dedup. Same page.
- [fact] Jobs run on a distributed task manager: an overseer creates tasks, a coordinator
  auto-scales workers, workers pull tasks from a queue. Each Pipeline job has a 1-hour max run.
  Docs, Pipeline Framework + "Types of Data Synchronization".
- [fact] Historical loads run **Recent Data First** for SaaS sources (Salesforce, Stripe, HubSpot,
  Mixpanel), one task per object, resuming where the last run stopped; historical and log
  replication never run at the same time. Docs, Types of Data Synchronization.
- [fact] The generic **REST API source** can't detect new/changed records, so it saves an offset,
  resets at the last page and refetches; default primary key is `__hevo_id`, which duplicates
  mutable rows unless the user picks a key. Docs, REST API source.
- [fact] Failed Events sit in a queue for 7 days; an Event over 40 MB is dropped. Pipeline Framework.
- [fact] **ConnectAI** (early access): an agent that builds a managed connector from API docs /
  OpenAPI and tests it in Hevo's sandbox. Demo day "Introducing Connect AI" on 2026-10-22.
  hevodata.com/product/connectai.
- [fact] Edge on AWS CloudFront + nginx; Google Workspace, AWS SES, Stripe, Statuspage, HubSpot,
  Zendesk from DNS. stack-probe. [inference] Backend language not visible from outside; the JD
  allows Java/TypeScript/Python.

## 2. What they are worried about right now
Connector coverage and its maintenance cost: ConnectAI exists so a customer doesn't wait for a
native connector, and the SDE I role is literally "implement SaaS connectors". The docs spend a
whole section on source rate limits and "Deferred Data Ingestion", which says quota exhaustion on
SaaS sources is a recurring support issue.

## 3. The problems this shape forces
1. **Shared source quotas across distributed workers.** The docs say a source's rate limit is
   shared across all Pipelines on that account, while jobs run as independent tasks on an
   auto-scaled worker pool. Independent backoff per task is exactly how historical loads stall.
2. **Incremental sync without a change signal.** Their own REST API source admits it can't do
   incremental, so every SaaS connector has to find a trustworthy watermark per object or pay
   for refetches and dedup.
3. **Testing hundreds of connectors (and now AI-generated ones).** ConnectAI moves the bottleneck
   from writing a connector to proving it works: pagination to the last page, auth refresh,
   429 handling, schema learning on real samples.

## 4. The seam Shivam has already touched
The poiro.com **provider adapter layer**: three external APIs (Pixabay, Unsplash, Pinterest)
behind one search/download contract, vendor cursors (~2 KB) replaced by 32-char tokens, and
fail-closed spend caps of 500 calls/org/day and 5,000/day globally. That's problems 1 and 2 at the
scale of three sources, from the consumer side. Honest distance: **adjacent, not the same**: no
Kafka, no warehouse, three providers rather than hundreds.

## 5. Two questions only an internals reader would ask
1. "The docs say a SaaS source's rate limit is shared across every Pipeline on the account, and
   jobs run as separate tasks on an auto-scaled worker pool. Does the Ingestion Controller hold
   one quota per source account that all those tasks draw from, or does each task back off on
   its own 429s?"
   - If **one shared quota**: ask how they size it when the vendor doesn't publish its limit
     (learn it from 429 headers, or a per-connector config).
   - If **per task**: ask whether that's why historical loads go to "Deferred Data Ingestion"
     instead of retrying in place.
   - One concept to make the answer legible: **token bucket** (a counter that refills at a fixed
     rate; each request spends a token).
2. "For a ConnectAI-built connector, what has to pass in the sandbox before it's published:
   paging through to the last page of a real response, or schema learning on a sample?"
   - If they say pagination/replay: ask whether they record responses to re-run the test when the
     vendor's API changes. That's the DeepDoc replay-harness idea, said plainly, not claimed.

## 6. Do not say
- "I've built connectors at scale" / "I know Kafka" / "warehouse loading". Not in facts.yaml.
- "Your rate limiting is per task" as a statement. It's the question, not an observation.
- Any number for Hevo's connector count, customers or headcount (the ~242 is a third-party guess).
- "Hevo's backend is Java." Not visible; the JD lists three languages.
- That Hevo is US-based or India-based as a claim about the team you'd join: the role is
  Bangalore onsite; leave HQ out.
