# Shivam Kumar Verma

> +91 91356 68614 | shivam0xverma@gmail.com | [LinkedIn](https://www.linkedin.com/in/shivamv99/) | [GitHub](https://github.com/shivamxverma) | [Portfolio](https://www.shivamworks.dev/)

## Education

### Indian Institute of Information Technology Nagpur @ Nov 2022 – May 2026
*B.Tech in Computer Science and Engineering* @ *Nagpur, Maharashtra*

## Experience

### poiro.com @ Jul 2026 – Present
*Fullstack Developer Intern* @ *Python, FastAPI, TypeScript, MongoDB, Redis, Celery*
- **AI Workflow Builder:** Implemented the node and group system behind an AI generation workflow builder: typed ports between steps, **topological execution order** with cycle rejection, and nested groups that run as one sub-workflow.
- **Provider Integrations:** Engineered one adapter interface over Pixabay, Unsplash and Pinterest with per-org Redis caching and fail-closed spend caps (**500** calls/org/day, **5,000** globally).
- **Asset Service:** Replaced per-level folder traversal with a single MongoDB **$graphLookup** query and cut folder edits from **3** database round-trips to **1** in an asset service shared by **3 apps**.

### klimb.io @ Nov 2025 – May 2026
*Full Stack Developer Intern* @ *TypeScript, Express.js, PostgreSQL, Redis, AWS*
- **Usage Ledger:** Designed a PostgreSQL credit ledger that meters usage of **6+ AI features**, replacing on/off feature flags and making usage-based billing possible.

## Projects

### DeepDoc | [GitHub](https://github.com/shivamxverma/DeepDoc) | *TypeScript, Next.js, Azure OpenAI, Pinecone, PostgreSQL*
- **Conversational RAG:** Created section-aware chunking, document-scoped vector search and follow-up query rewriting from database-backed chat history, so multi-turn questions retrieve the right sections.
- **Evaluation Harness:** Tuned retrieval across **100+** configurations with a **36-case** harness (**6** multi-turn, prompt-injection and Hinglish cases) that separates indexing, retrieval and generation failures; it caught a bug that returned empty results for every query.

### Hireflow | [GitHub](https://github.com/shivamxverma/hireflow) | *TypeScript, BullMQ, Redis, Playwright, GPT-4o-mini*
- **LLM Pipeline:** Architected ingestion from **4** sources, LLM parsing and Playwright applying as separate BullMQ queues so a bot-detection block in one stage never stalls the others, with a validator that rejects any rewritten skill not in the real profile.

### CodeSM | [GitHub](https://github.com/shivamxverma/CodeSM) | [Live](https://code-sm.vercel.app/) | *Node.js, BullMQ, Redis, Docker, PostgreSQL*
- **Async Execution:** Shipped a judge that persists each submission as PENDING, grades it on BullMQ workers inside locked-down Docker containers for **6** languages, and records RUNNING and COMPLETED states so the API never waits on execution.

## Technical Skills

**Languages & Automation:** Python, TypeScript, JavaScript, SQL, C++, Playwright
**Backend & APIs:** FastAPI, Node.js, Express.js, REST APIs, WebSockets, WebRTC
**Infrastructure & Runtimes:** Celery, BullMQ, Docker, Kubernetes, AWS (EC2, S3)
**Data Systems:** PostgreSQL, MongoDB, Redis, Pinecone, RAG, LLM evaluation

## Achievements

- **Competitive Programming:** **Top 5% globally** on [LeetCode](https://leetcode.com/u/MahavirCoder/) (**1800+ rating**, **800+** problems solved) · **3-star** on [CodeChef](https://www.codechef.com/users/mahavir99) (1700+) · Pupil on Codeforces.
- **Hackathon:** Won **3rd place** at IIIT Nagpur Tantrafiesta 2024 by building and presenting a working product.
