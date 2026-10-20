# Optexity — dossier (2026-10-20, short form)

Lead: "Founding Software Engineer, Bengaluru (on-site), ₹20-40 LPA, 2+ yrs", seen only on the HireDoor
aggregator via LinkedIn (https://lnkd.in/ghC6WVSG). Optexity's own LinkedIn: "No jobs right now", 2-10
employees, SF HQ; careers Notion page deleted. Treat the posting as L2 (unverified); the founders'
headlines say they are hiring, which is the stronger signal.

## Product
"Integrate with any web portal, even ones without APIs" (LinkedIn tagline). Browser automation that
turns portal workflows into reliable APIs (optexity.com). Co-founder headline narrows it: "Get an API for
any EHR or Payer Portal", i.e. healthcare: electronic health records and insurer portals. Site says
"We've just raised $4M in funding"; Together Fund's co-founder Shubham Gupta is listed on their page
(likely investor, GUESS on round details).

## People (all 2nd° on LinkedIn, https://www.linkedin.com/company/optexity/people/)
- **Shivam Goyal**, Co-Founder, "We're hiring!", IIT Delhi CSE. ← target
- **Sankalp Garg**, Co-Founder, "(Hiring)", ex-Apple, ex-AWS. ← backup
- Founding engineers: Soham Haldar (ex-Onfinance AI, ex-Compose), Sanjay Singh Rajpoot. Prince Yadav
  ("Turning messy human workflows into autonomous AI agents"). Chief of Staff: Aryan Sarva.

## Their vocabulary
- "Integrate with any web portal, even ones without APIs." (LinkedIn)
- "Get an API for any EHR or Payer Portal" (Sankalp Garg headline)

## Architecture (inference, closed source)
Headless browsers driving third-party portals behind an API they expose. Problems that shape forces:
selector drift when a portal ships a UI change, per-portal sessions/2FA/captcha, rate limits and
lockouts per customer credential, and making a flaky UI action look like an idempotent API call.

## Seam
**Hireflow**: Playwright automation against LinkedIn, Wellfound, YC; ingestion, LLM processing and
browser automation on separate BullMQ queues so a bot-detection block in one stage doesn't stall the
rest; SHA-256 fingerprints to dedupe across sources. Plus CodeSM's persisted job states.
Honest gaps: no healthcare/EHR exposure, posting asks 2+ yrs, Bengaluru on-site is fine for him.

## Two internals questions
1. When a payer portal ships a UI change mid-week, how do you find out: synthetic checks per portal, or
   the first failing customer call?
2. Is a portal action exposed as an idempotent API call (safe to retry after a timeout), or does the
   caller have to check state first?
