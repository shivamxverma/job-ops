# Wyre AI — application (2026-10-25)

Form: https://docs.google.com/forms/d/e/1FAIpQLSdhqQOn4xAt17GRlc4vzI-0pIwv_rHzWAMQ-ZDqGKa1Q9DAqg/viewform
(linked from https://wyreai.io/career/junior-ai-engineer-generative-ai/ "Apply for this role").
Signed in as shivam0xverma@gmail.com; the form records the Google account on upload.
Questions contact on the form: radha.ananthanarayan@wyreai.io (named there, not guessed).

Resume to upload: applications/wyre-ai/resume.pdf (= resumes/ai.md, AI framing, DeepDoc + Storix
already on it).

## Field values (paste-ready, no em dashes)

- **Full Name:** Shivam Kumar Verma
- **Email:** shivam0xverma@gmail.com
- **Phone:** +91 91356 68614
- **LinkedIn:** https://www.linkedin.com/in/shivamv99/
- **Current Location:** Warisaliganj, Bihar, India
- **Current Job Title:** Fullstack Developer Intern
- **Current Company:** poiro.com
- **Total Years Of Experience:** 0-1 years
- **Willing to work from Hyderabad in the future?** **No** ⚠ your profile says onsite only in
  Bangalore. If you'd actually consider Hyderabad, change this before submitting; it may cost
  the application.
- **Technologies:** tick Python, LLMs / Generative AI, RAG / LangChain, Vector databases,
  NLP / Embeddings / Semantic Search, OCR / PDF Document Processing, FastAPI / Backend APIs.
  (No OCR claimed anywhere; the box is shared with PDF processing, which you have.)
- **Current Employment Status:** Internship
- **Availability to start:** 1 month (internship ends 22 Nov, start 23 Nov)
- **Total Current Compensation:** Rs 35,000 per month internship stipend. No bonus or stock.
- **Expected Compensation:** 10-18 LPA

**Have you worked on any hands-on Generative AI, LLM, or RAG projects? Please explain.**
> Yes. DeepDoc is a question-answering app over PDFs that I built and rebuilt this month. It splits each PDF into section-aware chunks that keep headings and bullets with their section, searches only that document's vectors in Pinecone, rewrites follow-up questions into standalone queries using the chat history, and packs ranked, deduplicated context into a token budget for Azure OpenAI. I also built a 36-case evaluation harness (6 multi-turn, including Hinglish and prompt-injection cases) that tells me whether a bad answer failed at indexing, retrieval or generation. It found a metadata bug that was blanking every retrieved chunk, after prompt changes hadn't helped. github.com/shivamxverma/DeepDoc

**Briefly describe an AI/ML project you've built. What technologies did you use, and what was your specific contribution?**
> Hireflow, which I built alone and used for my own job applications. It ingests job listings from LinkedIn, Wellfound, YC Work at a Startup and Telegram, uses Gemini to parse each one's stack and seniority, and rewrites resume bullets with GPT-4o-mini. Then a validator rejects any rewritten skill that isn't in my real profile, so the model can't invent one. Ingestion, AI processing and Playwright automation run on separate BullMQ queues so a block in one stage doesn't stall the others. Stack: Node.js, TypeScript, BullMQ, Redis, PostgreSQL, Playwright, Gemini, GPT-4o-mini. github.com/shivamxverma/hireflow

**What interests you about this role, and how does it align with your career goals?**
> Construction drawings and specs are the kind of documents where retrieval quietly fails: a requirement sits in a spec section that never mentions the drawing it applies to. That's the problem I keep coming back to in DeepDoc, where most of my time went into finding out why an answer was wrong rather than writing prompts. I want my first full-time role to be on document intelligence with real users and real documents, and a team that measures whether extraction got better instead of guessing.

## Checks
- Prior contact: Gmail search "wyre" clean (2026-10-25).
- Claims: DeepDoc ai_framing, Hireflow ai_framing/backend_framing, availability, current_salary,
  salary_expectation, location city, all from facts.yaml. "rebuilt this month" = DeepDoc built
  "Jul 2025 prototype, rebuilt Oct 2026".
