# Shivam Kumar Verma

> +91 91356 68614 | shivam0xverma@gmail.com | [LinkedIn](https://www.linkedin.com/in/shivamv99/) | [GitHub](https://github.com/shivamxverma) | [Portfolio](https://www.shivamworks.dev/)

## Experience

### poiro.com @ Jul 2026 – Present
*Fullstack Developer Intern* @ *Python, FastAPI, MongoDB, Redis, Celery, Next.js, TypeScript, CI/CD*
- **AI Workflow Engine:** Built the node and group system behind the AI workflow builder: each workflow is a DAG of generation steps passing typed outputs to the next, and groups run nested steps as one sub-workflow.
- **Fail-Closed Provider Layer:** Integrated Pixabay, Unsplash and Pinterest behind one adapter contract with org-scoped Redis caching, capping paid calls at **500 per org per day** and **5,000 globally**, counted only on cache misses.
- **CI Enforcement:** Cleared **1,041** Ruff findings across **7** Python packages and made lint and format checks blocking in CI and pre-push, with package discovery from `pyproject.toml` so new packages can't slip past.

### klimb.io @ Nov 2025 – May 2026
*Full Stack Developer Intern* @ *TypeScript, Express.js, PostgreSQL, Redis, AWS*
- **AI Usage Ledger:** Architected a PostgreSQL credit ledger enforced in middleware that records every use of **6+ AI features** per customer, replacing on/off feature flags and making usage-based billing possible.

## Projects

### DeepDoc | [GitHub](https://github.com/shivamxverma/DeepDoc) | *RAG, Next.js, TypeScript, Azure OpenAI, Pinecone, PostgreSQL*
- **RAG Pipeline:** Designed section-aware chunking, document-scoped vector retrieval, and follow-up rewriting from chat history, then packed ranked, deduplicated context into a token budget tuned across **100+ configurations**.
- **Evaluation Harness:** Created a **36-case** harness (multi-turn, Hinglish, prompt injection) that separates indexing, retrieval and generation failures; it traced empty answers to a field ingestion never wrote, after prompt changes had failed.

### Hireflow | [GitHub](https://github.com/shivamxverma/hireflow) | *Node.js, TypeScript, BullMQ, PostgreSQL, Gemini, Playwright*
- **Grounded LLM Output:** Developed a validator that checks every GPT-4o-mini resume rewrite against the source profile and rejects any skill not in it, so the model cannot invent experience.
- **Multi-Source Ingestion:** Pulled listings from **4** sources (LinkedIn, Wellfound, YC, Telegram) onto separate BullMQ queues, with SHA-256 fingerprints catching cross-source duplicates.

### CodeSM | [GitHub](https://github.com/shivamxverma/CodeSM) | [Live](https://code-sm.vercel.app/) | *Node.js, BullMQ, Redis, PostgreSQL, Docker*
- **Sandboxed Execution:** Implemented isolated grading for **6 languages** on BullMQ workers, with Docker limits of **256 MB**, **32 PIDs** and **0.5 CPU** per run and no network access.

## Technical Skills

**AI Engineering:** RAG, embeddings and vector search, query rewriting, LLM evaluation, Azure OpenAI, Gemini
**Languages:** TypeScript, Python, JavaScript, SQL, C++
**Backend & Frontend:** FastAPI, Node.js, Next.js, React, REST APIs, WebSockets, Celery, BullMQ
**Data & Infrastructure:** PostgreSQL, Redis, Pinecone, MongoDB, Docker, AWS (EC2, S3), CI/CD, Git

## Education

### Indian Institute of Information Technology Nagpur @ Nov 2022 – May 2026
*B.Tech in Computer Science and Engineering* @ *Nagpur, Maharashtra*

## Achievements

- **Competitive Programming:** **Top 5% globally** on [LeetCode](https://leetcode.com/u/MahavirCoder/) (**1800+ rating**, 800+ problems solved) · **3-star** on [CodeChef](https://www.codechef.com/users/mahavir99) (1700+) · Pupil on Codeforces.
- **Hackathon:** **3rd place** at Tantrafiesta 2024, IIIT Nagpur.
