# CyberAtlas — tech read (2026-09-29)

Evidence: two requests against their public API (`/v1/domains/search`, anonymous tier), their
`/finder/llm.txt` and `/finder/about`, `stack-probe.json`, the HN post (item 49523704). No public
GitHub org found. Cluster: no note yet; closest is "internet-scale data platform / search".

## 1. The system, as far as it is visible
- Fronted by Cloudflare; mail on Google Workspace. [fact: `server: cloudflare`, MX records]
- Hostnames are partitioned by registrable root / TLD. An exact-root query reports
  `x-domainscan-root: stripe.com` and `x-domainscan-cost: 152` = its row count. [fact: headers]
- Exact-root paging is a **key-value range scan**: the cursor decodes to `kv:bfcm.stripe.com`,
  the last key returned. Consistent with the JD's "Redis/LMDB". [fact: cursor; inference: which KV]
- A substring query scans its whole partition: `*vpn*.io` cost **54,632,341** rows (all of
  `.io`) and still answered in ~1.6s end to end. [fact: header + timing from India; inference: a
  linear scan, not an index lookup, is what the cost header counts]
- Every query is metered against a budget: `x-domainbudget-limit: 10000000000`, decremented by
  the scan cost, alongside a 2,000/day request limit. [fact: headers; inference: per-IP daily]
- `llm.txt` shows a cursor starting `eyJwaXQi` (`{"pit"…`, Elasticsearch/OpenSearch point-in-time)
  and says wildcard totals are "~0.2% high", but the live cursor is `{"p":null,"a":[60993]}` and
  returned `total_is_approximate: false`. [fact: both; inference: the search backend changed after
  the doc was written, possibly OpenSearch → custom scan]
- Scale they publish: 2.5B indexed domains, 99.6M scanned IPs, 94.7M analyzed pages, 570+
  fingerprinting rules; sources are certificate transparency + passive DNS, "updated daily". [fact]

## 2. What they are worried about right now
The role lists "data pipelines, search, fingerprinting, vulnerability detection, malware detection,
and performance optimization" on "billions of domains". The Finder is newly public with an agent
API and daily bulletins (131 on record), so query cost and ingest freshness at that scale are the
live problems. [inference]

## 3. The problems this shape forces
- **Query cost grows with partition size, not result size.** A 3-row answer from `.io` cost 54.6M
  row-reads. A large TLD like `.com`, or an un-scoped `*admin*`, is where a per-query budget stops
  being a formality.
- **Daily merge of two sources into one record per hostname.** CT logs and passive DNS both emit
  sightings of the same hosts, so dedup at ingest (and first-seen / last-seen) is a constant cost at
  2.5B keys.
- **Docs drifting from the API** once agents are a first-class consumer (`llm.txt` is the contract
  an agent codes against).

## 4. The seam Shivam has already touched
**Dedup at ingest, across sources.** Hireflow merges listings from LinkedIn, Wellfound, YC and
Telegram and drops duplicates with SHA-256 fingerprints of the normalised title, company and
description; at poiro.com he made SHA-256 asset dedup safe under concurrent uploads with a DB
uniqueness constraint. **Adjacent, not the same: his volumes are thousands to low millions, theirs
are billions**, and he has not used LMDB, OpenSearch or Go. Backup seam: the per-query budget is
consumption metering, which he built as a Postgres credit ledger across 6+ AI features at klimb.io.

## 5. Two questions only an internals reader would ask
1. **"`*vpn*.io` reports a scan cost of ~54.6M, the whole `.io` partition, yet comes back in about
   1.5s. Is that a straight scan over a memory-mapped partition, or is there a substring index in
   front that the cost header doesn't reflect?"**
   - If "straight scan": ask how an un-scoped `*admin*` over all 2.5B is kept affordable, and
     whether that's what the 10B daily budget is sized for.
   - If "trigram index": ask how they keep it current with the daily additions.
   - One concept to have ready: a trigram index stores every 3-letter substring → list of
     hostnames, so `*vpn*` only touches hosts containing "vpn".
2. **"When CT logs and passive DNS both see the same hostname, do you upsert on the hostname key at
   ingest, or append every sighting and compact later?"**
   - If upsert: ask how first-seen / last-seen are tracked per source.
   - If append + compact: ask how often compaction runs, and what the Finder serves in between.

## 6. Do not say
- "Your search is a linear scan." The cost header suggests it; the mechanism is unconfirmed.
- "You moved off OpenSearch." Only a doc/cursor mismatch supports it, and the JD still lists it.
- "Your docs are wrong." True in two details, but it reads as nitpicking in a first message.
- "You use LMDB." The JD says "Redis/LMDB"; the `kv:` cursor doesn't say which.
- Any claim of security, Go, OpenSearch or billions-scale experience. None is in facts.yaml.
- Numbers other than the ones they publish (2.5B, 99.6M, 94.7M, 570+) or the two headers above.
