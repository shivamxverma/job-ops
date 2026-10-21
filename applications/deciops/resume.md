# Shivam Kumar Verma

> +91 91356 68614 | shivam0xverma@gmail.com | [LinkedIn](https://www.linkedin.com/in/shivamv99/) | [GitHub](https://github.com/shivamxverma) | [Portfolio](https://www.shivamworks.dev/)

## Experience

### poiro.com @ Jul 2026 – Present
*Fullstack Developer Intern* @ *Python, FastAPI, MongoDB, Redis, Celery, Next.js, TypeScript, Cloudflare R2*
- **AI Workflow Orchestration:** Built the node and group system behind the AI workflow builder: each workflow is a DAG of generation steps with typed ports and a defined execution order, and groups bundle steps into nested sub-workflows that run as one unit.
- **Fail-Closed Spend Caps:** Integrated Pixabay, Unsplash, and Pinterest behind one adapter contract with per-org Redis caching, and capped provider calls fail-closed at **500 per org per day** and **5,000 per day globally** so no workflow can run up vendor costs.
- **Digital Asset Service:** Designed the org-scoped MongoDB models and FastAPI backend for one asset service shared by **3 apps**, migrated existing assets into it, and added upload-time duplicate blocking with pHash and dHash image similarity.

### klimb.io @ Nov 2025 – May 2026
*Full Stack Developer Intern* @ *TypeScript, Express.js, PostgreSQL, Redis, AWS, OpenAI Realtime*
- **Production AI Interview Platform:** Engineered the backend for a **3-stage** AI interview platform used by **hundreds of candidates**, with automated proctoring and strict candidate-level data isolation; its live voice round on OpenAI Realtime asks questions from the candidate's resume and scores the transcript.
- **Auditable Usage Ledger:** Replaced on/off feature flags with a PostgreSQL credit ledger that records every use of **6+ AI features** as an auditable per-feature log, which made usage-based billing possible.

## Projects

### DeepDoc | [GitHub](https://github.com/shivamxverma/DeepDoc) | *RAG, TypeScript, Azure OpenAI, Pinecone, PostgreSQL*
- **LLM Evaluation Harness:** Created a **36-case** evaluation harness (**6 multi-turn**, including Hinglish and prompt-injection cases) that replays retrieval sweeps, A/B tests prompts, and separates indexing, retrieval, and generation failures; it caught a metadata bug that blanked every retrieved chunk.
- **RAG Pipeline:** Developed section-aware chunking, document-scoped vector retrieval, and follow-up query rewriting from chat history, then ranked, deduplicated, and packed context into a token budget, tuned across **100+ configurations**.

### Hireflow | [GitHub](https://github.com/shivamxverma/hireflow) | *Node.js, BullMQ, PostgreSQL, Gemini, GPT-4o-mini, Playwright*
- **Guardrailed LLM Pipeline:** Shipped an AI job-application engine that parses listings with Gemini and rewrites resume bullets with GPT-4o-mini, then validates every rewritten skill against the real profile so the output cannot invent one; used for real applications.
- **Decoupled Queues:** Separated ingestion, AI processing, and Playwright automation onto BullMQ queues so a block in one stage never stalls the others.

### CodeSM | [GitHub](https://github.com/shivamxverma/CodeSM) | [Live](https://code-sm.vercel.app/) | *Node.js, BullMQ, Redis, PostgreSQL, Docker*
- **Sandboxed Execution:** Implemented a locked-down container runtime for **6 languages** with no network, a read-only filesystem, and CPU, memory, and time limits, graded asynchronously on BullMQ workers.

## Skills

**Languages:** Python, TypeScript, SQL, C++
**AI Engineering:** LLM evaluation, RAG, context engineering, embeddings and vector search, query rewriting, prompt A/B testing, OpenAI Realtime
**Backend:** FastAPI, Node.js, Express.js, REST APIs, Celery, BullMQ, WebSockets
**Data & Infrastructure:** Data modelling, PostgreSQL, MongoDB, Redis, Pinecone, Docker, Kubernetes, AWS (EC2, S3)
**Frontend & Tooling:** React, Next.js, Playwright, Git, Linux, CI pipelines

## Education

### Indian Institute of Information Technology Nagpur @ Nov 2022 – May 2026
*B.Tech in Computer Science and Engineering* @ *Nagpur, Maharashtra*

## Achievements

- **Competitive Programming:** **Top 5% globally** on [LeetCode](https://leetcode.com/u/MahavirCoder/) (**1800+ rating**, 800+ problems solved) · **3-star** on [CodeChef](https://www.codechef.com/users/mahavir99) (1700+) · Pupil on Codeforces.
- **Hackathon:** **3rd place** at Tantrafiesta 2024, IIIT Nagpur.
