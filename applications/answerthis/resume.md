# Shivam Kumar Verma

> +91 91356 68614 | shivam0xverma@gmail.com | [LinkedIn](https://www.linkedin.com/in/shivamv99/) | [GitHub](https://github.com/shivamxverma) | [Portfolio](https://www.shivamworks.dev/)

## Experience

### poiro.com @ Jul 2026 – Present
*Fullstack Developer Intern* @ *Python, FastAPI, MongoDB, Redis, Celery, Next.js, React, TypeScript*
- **Full-Stack Asset Service:** Designed the org-scoped data models and FastAPI backend, and built most of the shared Next.js frontend, for one asset service used by **3 apps**, with keyset pagination, direct uploads to Cloudflare R2, and pHash/dHash duplicate blocking.
- **AI Workflow Builder:** Implemented the node and group system in a React Flow canvas where each workflow is a DAG of AI generation steps with typed ports and a defined execution order, and nested groups run as sub-workflows.
- **API Integrations and Spend Caps:** Integrated Pixabay, Unsplash, and Pinterest behind one adapter contract with per-org Redis caching and fail-closed caps of **500 calls per org per day** and **5,000 per day** globally.

### klimb.io @ Nov 2025 – May 2026
*Full Stack Developer Intern* @ *TypeScript, React, Express.js, PostgreSQL, Redis, AWS, OpenAI Realtime*
- **Production AI Interview Platform:** Engineered the backend for a **3-stage** AI interview platform used by **hundreds of candidates**; its live voice round on OpenAI Realtime asks questions from the candidate's resume and scores the transcript.
- **Usage Ledger in PostgreSQL:** Built a credit ledger that records every use of **6+ AI features** as an auditable per-feature log, which made usage-based billing possible.

## Projects

### DeepDoc | [GitHub](https://github.com/shivamxverma/DeepDoc) | *Next.js, TypeScript, Azure OpenAI, Pinecone, PostgreSQL*
- **RAG Pipeline:** Developed structure-aware chunking, document-scoped semantic search on Pinecone, and follow-up question rewriting from chat history, then ranked, deduplicated, and packed context into a token budget, tuned across **100+ configurations**.
- **LLM Evaluation Harness:** Created a **36-case** eval harness (**6 multi-turn**, including Hinglish and prompt-injection cases) that replays retrieval sweeps, A/B tests prompts, and separates indexing, retrieval, and generation failures; it caught a bug that blanked every retrieved chunk.

### Hireflow | [GitHub](https://github.com/shivamxverma/hireflow) | *Node.js, BullMQ, PostgreSQL, Gemini, GPT-4o-mini, Playwright*
- **Guardrailed LLM Pipeline:** Shipped an AI job-application engine that ingests listings from **4 sources**, deduplicates them with SHA-256 fingerprints, rewrites resume bullets with GPT-4o-mini, and rejects any rewritten skill not in the real profile; used for real applications.

### CodeSM | [GitHub](https://github.com/shivamxverma/CodeSM) | [Live](https://code-sm.vercel.app/) | *React, Node.js, BullMQ, PostgreSQL, Docker*
- **Sandboxed Execution:** Architected a code platform that grades untrusted code for **6 languages** in locked-down Docker containers on BullMQ workers, off the request path.

## Skills

**Languages:** Python, TypeScript, JavaScript, SQL, C++
**Frontend:** React, Next.js, React Flow, WebSockets
**Backend & Data:** FastAPI, Node.js, Express.js, REST APIs, PostgreSQL, database design, MongoDB, Redis, Celery, BullMQ
**AI Engineering:** RAG, LLM pipelines, semantic search, vector databases (Pinecone), embeddings, query rewriting, LLM evaluation
**Infrastructure & Tooling:** Docker, Kubernetes, AWS (EC2, S3), Git, CI/CD pipelines, Linux

## Education

### Indian Institute of Information Technology Nagpur @ Nov 2022 – May 2026
*B.Tech in Computer Science and Engineering* @ *Nagpur, Maharashtra*

## Achievements

- **Competitive Programming:** **Top 5% globally** on [LeetCode](https://leetcode.com/u/MahavirCoder/) (**1800+ rating**, 800+ problems solved) · **3-star** on [CodeChef](https://www.codechef.com/users/mahavir99) (1700+) · Pupil on Codeforces.
- **Hackathon:** **3rd place** at Tantrafiesta 2024, IIIT Nagpur.
