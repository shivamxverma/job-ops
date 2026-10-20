# Hunar.AI — dossier (2026-10-20)

Source of the lead: funding signal (Inc42, 2026-10-19) that turned into a posting the next day.
Posting: **Back End Developer, Bengaluru (Hybrid)**, LinkedIn https://www.linkedin.com/jobs/view/4479964555/
(posted 2026-10-20, "Over 100 applicants", Easy Apply; external apply link https://apply.hunar.ai/job/h3PhX2jk).
JD bar: **4–6 years**, Python with Django or FastAPI, system design, concurrency, async processing,
caching, message queues, reliability. Poster-added requirement: "4+ years of experience in Engineering".

## Product in one paragraph
Conversational voice agents for frontline workforce: sourcing, screening, onboarding, training,
surveys, retention, over voice calls, WhatsApp and web. Two products: **Hunar Voice** (self-serve agents
"configured in under five minutes") and **Hunar Connect** (end-to-end workforce management). Claims:
"tested at 1M calls/day", 99.97% uptime, 700–900 ms response latency (hunar.ai); LinkedIn says
"500K+ calls every day". Customers: Croma (570+ stores), Dr Lal PathLabs (13 lakh candidates screened),
Bluedart, Delhivery, Tata 1mg, Aditya Birla Capital, Swiggy (LinkedIn "used by").

## People
- **Krishna Khandelwal**, co-founder/CEO; **Shantanu Bhattacharyya**, co-founder (PhD, Carnegie Mellon),
  2nd° on LinkedIn. **Urvashi Soni**, Founding Engineer, 2nd°. Engineers on LinkedIn: Niraj Kumar
  (Backend Engineer), Nikhil Bhandari (SDE), Akshay Rathee and Ritik Kumar Sharma (FDE), all 2nd°.
- 51–200 people; 11 in engineering, 19 in Greater Bengaluru (LinkedIn People tab).

## Momentum
Rs 40 Cr (~$4.2M) Series A led by Blume Ventures, 2026-10-19; funds to "strengthen its AI
infrastructure, develop its products, and improve its go-to-market" (Inc42). Backend posting went up
the day after. Founded 2022, HQ Bengaluru; offices Mumbai, Bangalore, Gurugram.

## Their vocabulary
- "Turn conversations into better workforce outcomes." (hunar.ai tagline)
- "Anything faster feels like a scripted IVR." (hunar.ai)
- "infant attrition" (hunar.ai retention section; their word for first-month attrition)
- "Hunar's hybrid stack stands out by handling real-time interruptions smoothly" (blog: TTS-STT vs VTV)

## Architecture, as far as it is visible
Google Cloud (server: Google Frontend on api./status.), Webflow marketing site, Google Workspace mail
(stack-probe). Engine: hybrid on voice-to-voice audio models with in-house pre/post-processing for
interruptions and pauses; customers can choose LLM, TTS and telephony (blog). Backend JD says Python
(Django/FastAPI), queues, caching. See tech-read.md.

## What I'd do in week one
1. Per-call state machine audit: every call (dialled, connected, screened, summarised, synced to ATS)
   as explicit persisted states with idempotent transitions, so a retry at 500K calls/day can't
   double-count or double-message a candidate. Same pattern as CodeSM's PENDING→RUNNING→COMPLETED.
2. Per-tenant usage metering on the call pipeline (minutes, LLM tokens, telephony cost per customer),
   the credit-ledger work from klimb.io, which matters more once they choose LLM/TTS/telephony per client.

## Which framing wins
**backend_framing with the voice-AI story on top.** klimb.io's 3-stage AI interview backend with a live
voice round on OpenAI Realtime is nearly their product. Backend proof: CodeSM queues, Python/FastAPI/
Celery/Redis at poiro.com. Honest gap: the posting wants 4–6 years; he has ~10 months. Say it first.

## Draft answers
Outreach is the channel (see outreach.md), not a long-form application.
