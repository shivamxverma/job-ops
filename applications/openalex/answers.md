# OpenAlex — form answers (2026-09-29)

Form: openalex.org/jobs/software-engineer → section 3, three required questions. Their guidance:
"remarkable, compelling answers ... Feel free to use AI, or not ... three to six paragraphs is
often a good fit." No anti-AI warning. Still: **read each one aloud and change anything that
doesn't sound like you before pasting.** Applications are one-shot and can't be edited after
submit.

Checked: zero em dashes, zero banned words, every claim traces to facts.yaml / stories.md.

---

## 3.1 Why do you want to work here?

I read your code before writing this. openalex-api-proxy, the Worker in front of api.openalex.org, is the part I keep going back to. Every request gets priced by endpoint class, counted in a Durable Object, refunded if the upstream call fails, and the prepaid part gets settled into Postgres later. That's a credit ledger. I built one at klimb.io across 6+ AI features, in plain Postgres, and yours is the harder version of the same thing: the counting happens at the edge and the money lives somewhere else.

That's the pattern I noticed across the repos. The problems I like are the ones where the data has to stay right while a lot is moving: the same entity arriving from different sources, a hash deciding what changed, a balance that has to add up. At poiro.com I built SHA-256 dedup for our asset storage where the server verifies the content itself and a database uniqueness constraint backs it, because an application-level check races under concurrent uploads. Reading walden's notes on content hashes re-stamping tens of millions of works was the same idea at a scale I haven't worked at yet, and that's the point.

The other reason is how you work. "Notice what's missing, propose it, build it, ship it, and answer the tickets about it" is the job I want. I'd rather do that where the output is used by a billion API calls a month than on a feature nobody measures.

And the mission is simple enough that I don't need to dress it up. An open index of research, free to anyone, including a student in India who can't pay for Scopus.

---

## 3.2 What will you do in your first week?

Mostly read, trace and ask, and ship one small thing so I learn the release path for real.

Days one and two: I'd take a batch of API support tickets and trace each one through the Worker, the RateLimiter Durable Object and Elasticsearch. Your job page says the hard technical questions land on whoever understands the system, so I'd rather start understanding it through real user problems than through a tour. The 429 path looks like a good place to start. There's already special handling because the app shows the daily-credit modal on a 429 that didn't spend any credits, which tells me users are confused about limits.

Day three: I'd write down how credits flow from charge to refund to the Postgres writeback, and bring two questions to whoever owns the proxy. First, `writebackOnetimeCredits` claims and zeroes the Durable Object's consumed count before the UPDATE runs inside `waitUntil`, so what happens if the isolate dies between the two? Second, refunds go to the daily pool first, so does a request charged at 23:59 UTC and refunded after midnight come off the new day's count? Both might be accepted trade-offs. I'd want to know which before touching anything, and I'd want a small reconciliation check (Durable Object consumption vs. database balance) either way.

Days four and five: one messy-data fix through the nightly. Something small from the queue, like an affiliation string or name normalisation. Before shipping I'd estimate how many works get a new content hash against the Guardrails line, because a small entity change can hold up the whole publish. Getting one change through End 2 End without tripping it would teach me more about walden than a week of reading.

By Friday I'd want: a few tickets closed, a short written map of the credit path with those two questions answered, and one change live in the data.

---

## 3.3 What's the coolest thing you've ever built?

CodeSM, a code execution engine that runs untrusted submissions in C, C++, Java, Go, Python and JavaScript without taking the host down. It's live at code-sm.vercel.app.

The hard part isn't running code, it's running code that's trying to hurt you. Fork bombs, infinite loops, network calls, huge outputs. Each submission runs in Docker with CPU, memory, process, network, filesystem, timeout and output limits, and grading happens on a BullMQ + Redis queue so the API returns as soon as the submission is saved, with retries when a job fails.

The decision I'm happiest with was not doing the obvious thing. A fresh container per submission is the easy design, but cold starts were the cost. So I reuse persistent containers, and fetched test data from S3 one case at a time with early exit on the first failing case, which keeps per-job memory bounded no matter how big the test set is.

A close second is Hireflow, because it's closer to your data problems. It pulls job listings from LinkedIn, Wellfound, YC and Telegram, and the same job shows up in several places with different titles and formatting. I dedupe them with SHA-256 fingerprints of the normalised title, company and description. It also uses an LLM to rewrite resume bullets, with a validator that rejects any skill the model adds that isn't in the real profile. I didn't trust the model to not make things up, so I made it unable to.

---

## Anything else (optional)

Being straight about experience: about 8 months professional (a 5-month internship at klimb.io, then full-time at poiro.com since July 2026). I haven't used Spark, Databricks or Elasticsearch, and I haven't worked at your data scale. Python, SQL/Postgres and pipelines are what I use every day, and I learn a system fastest by reading its code, which is how I wrote the answers above. I'm based in India.
