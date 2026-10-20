# Hunar.AI — tech read (2026-10-20, short form: closed source, no public GitHub org found)

## 1. The system, as far as it is visible
- [fact] GCP-hosted API/status (`server: Google Frontend`, stack-probe). api.hunar.ai root 404s.
- [fact] Voice engine is a hybrid built on voice-to-voice models plus in-house interruption/pause
  handling; per-customer choice of LLM, TTS and telephony; evaluations and summaries generated from audio
  (blog: choosing-the-right-voice-ai-model).
- [claim, theirs] 1M calls/day tested, 500K+/day in production, 700–900 ms responses, 99.97% uptime.
- [fact] Channels: voice calls, WhatsApp, web (hunar.ai).
- [fact] Backend hiring wants Python Django/FastAPI, queues, caching, concurrency (LinkedIn JD).

## 3. The problems this shape forces
- **Outbound call fan-out at 500K/day is a scheduling problem**: telephony concurrency limits, retries on
  no-answer, calling-hour windows per region, and never calling the same candidate twice on a retry.
- **Pluggable LLM/TTS/telephony per customer** means per-tenant routing, failover and cost attribution.
- **Two channels (WhatsApp + voice) for one candidate** need one conversation state, not two.

## 4. The seam Shivam has already touched
klimb.io: live voice interview round on OpenAI Realtime + transcript scoring; per-candidate isolation
across concurrent sessions; credit ledger metering 6+ AI features. CodeSM: persisted job states and
queue workers with early exit. poiro.com: provider adapter layer with per-org caching and fail-closed caps.

## 5. Two questions only an internals reader would ask
1. When a screening call drops mid-conversation, does the retry resume from the last answered question,
   or start the screen over? Where does that partial state live?
2. With LLM, TTS and telephony chosen per customer, is routing and failover decided per call at dial
   time, or fixed per tenant in config?
