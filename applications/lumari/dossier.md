# Lumari — dossier (2026-10-25)

Role: Software Engineer (full-stack, AI agents). Own site: San Francisco, **Remote (IN)**, new
grads ok. YC posting: SF, US citizen/visa only, $110K-$170K, 0.20-3.00%. See outreach.md for
why the channel is the CTO, not WaaS.

## Product in one paragraph
YC X25 (Spring 2025). AI "digital workers" for direct-materials procurement: send RFQs from the
team's own Gmail, capture supplier replies, extract line items, lead times, MOQs, freight terms
from PDFs/Excel/images/emails, normalise them for side-by-side comparison, chase missing info,
then track POs through delivery and sync back to SAP/NetSuite/Oracle/JDE/Procore. Suppliers
never touch a portal. Configurable autonomy with approval layers; behaviour configured in plain
English SOPs. SOC 2 Type 1+2, CASA Tier 2 (Gmail API restricted scopes). Case studies: OFS (RFQ
"10x faster"), Carbon Robotics, Ultima Genomics. (lumari.io llms page)

## People
- **Eshani Mehta**, co-founder & CEO. Ex-Stripe (payments intelligence), Robinhood, Snap; UC Berkeley CS.
- **Sam Lamba**, co-founder & CTO. Ex-Google eng lead (2 AI patents), Amazon, Tesla; Duke ECE+CS.
  linkedin.com/in/samarthlamba, 2nd°, mutuals Aditya Lahiri, Fenil Suchak.
- LinkedIn company page /company/lumari-ai is gone (redirects to "unavailable"): GUESS they
  renamed with the lumari.io to lumari.ai move.

## Momentum
YC X25, "well-funded" (no round found). Domain moved lumari.io to lumari.ai. Hiring a SWE with an
India remote option.

## Their vocabulary
- "always-on digital workers" (YC page)
- "the manual chase" (YC launch post)
- "Zero supplier friction" / "no rip-and-replace" (lumari.io)

## Architecture, as far as it is visible
Next.js App Router on Vercel (`app.lumari.io`, functions in iad1), Cloudflare in front of the
marketing site, Cal.com for demos. Gmail inbound via webhooks + API; bidirectional ERP sync.
JD stack: React, TypeScript, Python, FastAPI, Next.js. (stack-probe.json)

## What I'd do in week one
1. An extraction check that every normalised field (price, lead time, MOQ) cites a span in the
   supplier's document, and anything without one goes to the approval layer instead of the ERP.
2. Replay a folder of real supplier replies through extraction after every prompt change and
   diff the normalised matrix, the DeepDoc eval-harness idea applied to quotes.

## Which framing wins
**ai_framing**: Hireflow's validator (LLM output can't invent a skill), DeepDoc's eval harness,
poiro Flowboard (typed ports, sub-workflows) for the agent-orchestration line.
