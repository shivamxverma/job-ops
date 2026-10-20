# Marketplace seller automation (eBay / Amazon / dropshipping tools)

First written 2026-10-04 for Trackerbot. Reuse for any company whose customers are marketplace
sellers: tracking uploaders, repricers, listers, order-fulfilment helpers, dropshipping suites.

## The shape
- The customer's real risk is their **seller account metrics** (late tracking, "item not
  received" cases, defect rate). Every product in the cluster sells protection of those metrics.
- Two integration paths, nearly always both: the **official marketplace API** (eBay Trading/Sell
  APIs, Amazon SP-API) with OAuth tokens that expire, and a **browser extension** that acts inside
  the seller's own logged-in session ("non-API", "stealth", "manual" mode).
- Work is **per order, long-running and scheduled**: wait for supplier tracking, transform it
  (tracking conversion), write it to the marketplace, then watch delivery status.
- Pricing is **metered**: orders/trackings per month, seller accounts per plan, paid overflow
  credits.

## Problems the shape forces
1. Silent per-account stalls (expired token, supplier page change, rate limit) surface as a
   customer's metrics hit days later. Wants per-account health checks and loud alerts.
2. Idempotent marketplace writes: retries and two paths (API + extension) touching one order.
3. Extension-executed work only runs while the browser is open; needs check-ins and a read-back
   to confirm the write landed.
4. Marketplace UI changes break the extension path without warning; frequent extension releases
   are normal in this cluster.
5. Credit ledgers with an allowance pool and a paid pool.

## Shivam's seams
- CodeSM: BullMQ + Redis jobs off the request path, retries.
- Hireflow: per-stage queues so one blocked source can't stall the rest; Playwright against pages
  he doesn't control; SHA-256 fingerprint dedup.
- klimb.io: credit ledger across 6+ AI features.
- Chatterly: Redis pub/sub fan-out across server instances.
- Not his: eBay/Amazon API integrations, shipped Chrome extensions.

## Good questions in this cluster
- How do you confirm an extension-made write actually landed on the marketplace?
- What tells you an account's uploads have stalled before the seller notices?
- How do you stop the API path and the extension path from both writing the same order?
