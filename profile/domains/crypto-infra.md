# Crypto/chain infra — the shape and its hard problems

## The shape
A company in this cluster has a normal web backend (Next.js/Vercel, Go/TS API on Railway/Fly/
Render, Postgres/Redis) bolted onto a chain-facing layer that behaves nothing like the rest of
the stack: an RPC provider (Helius, Alchemy, Infura), a wallet/auth vendor (Privy, WalletConnect,
Dynamic) sitting in front of custody, and either a settlement contract they own or a set of
external venues/protocols they read from and settle against. The web layer is disposable and
swappable; the chain layer is where the actual product risk lives.

## The hard problems
- **Finality vs. UX.** Chain state isn't final the instant it's mined — Solana slots and EVM
  blocks can both revert. Anything that credits a user (P&L, a settled position, a payout) before
  finality is a race against a reorg; anything that waits for full finality is slow enough users
  notice. Every company here has picked a point on this line, usually silently.
  - Totalis-specific: settlement events flow through webhooks documented as "at-least-once,"
    deduplicated by event ID, with explicit "don't assume ordering" guidance — that's a team
    that has clearly thought about delivery, but delivery correctness and *chain-state*
    correctness (a settled position that gets reorg'd) are different problems, and the docs
    don't say which side of finality a `position.settled` event fires on.
- **Custody boundary.** Once a vendor (Privy, etc.) holds keys or delegates signing, the
  company's own backend is trusted with authorization logic but not custody — a bug there is an
  authz bug, not a stolen-funds bug, which changes the blast radius of a mistake but not whether
  it gets caught in code review.
- **Price/quote staleness under real-world triggers.** Any system that lets a user act on a
  quoted price (a parlay commit, a swap, a liquidation) has to define staleness in either time,
  price-delta, or both, and the wrong choice shows up exactly when it matters most (a fast-moving
  news event, a market crash) rather than in ordinary conditions.
- **External venue dependency.** Aggregating over other people's markets/protocols (Kalshi,
  Polymarket, Aave, a DEX) means your uptime and correctness are bounded by theirs, and their
  API/contract changes are effectively unannounced deploys into your system.
- **Idempotent settlement.** Anything that pays out or credits a balance must be safe to process
  twice, because retries, replays, and duplicate webhook deliveries are the normal case in this
  cluster, not the exception (Totalis's own docs say this explicitly: dedupe on event ID).

## The standard trade-offs
- **Fast provisional credit vs. safe finalized credit** — show the user a result immediately and
  reconcile later, or make them wait for finality. Affects perceived speed and the size of the
  "we have to claw this back" surface.
- **Build the venue-integration layer thin and pass through venue semantics, vs. build a real
  abstraction over multiple venues** — the second is more work but insulates the rest of the
  system from any one venue's API changes.
- **Custody vendor vs. self-custody** — a vendor (Privy) trades control for not building wallet
  security yourself; every company here has made this trade somewhere.

## Where Shivam's real work touches this
- **None directly.** No smart-contract, chain or custody work in `profile/facts.yaml`. Don't
  pitch into this cluster on crypto credentials.
- **Adjacent only:** the generic backend seams (async job processing on BullMQ/Celery, Kafka
  ingestion in Chatterly, SHA-256 content-addressed storage) apply to crypto companies' off-chain
  services. Frame them as backend-infra, never as web3 experience.
