# Shivam Kumar Verma

> +91 91356 68614 | shivam0xverma@gmail.com | [LinkedIn](https://www.linkedin.com/in/shivamv99/) | [GitHub](https://github.com/shivamxverma) | [Portfolio](https://www.shivamworks.dev/)

## Experience

### poiro.com @ Jul 2026 – Present
*Fullstack Developer Intern* @ *Python, FastAPI, MongoDB, Redis, Celery, Next.js, TypeScript, Cloudflare R2*
- **Cost Controls on Provider Calls:** Integrated Pixabay, Unsplash, and Pinterest behind one adapter contract with per-org Redis caching, and capped provider calls fail-closed at **500 per org per day** and **5,000 per day** globally, so no workflow can run up vendor costs.
- **Shared Media Asset Service:** Designed the org-scoped MongoDB models and FastAPI backend for one asset service used by **3 apps**, with direct uploads to Cloudflare R2, keyset pagination, and upload-time duplicate blocking with pHash and dHash image similarity.
- **AI Workflow Engine:** Implemented the node and group system behind the AI workflow builder: each workflow is a DAG of generation steps with typed ports and a defined execution order, and nested groups run as sub-workflows.

### klimb.io @ Nov 2025 – May 2026
*Full Stack Developer Intern* @ *TypeScript, Express.js, PostgreSQL, Redis, AWS*
- **Usage-Based Credits Ledger:** Built a PostgreSQL credit ledger that meters usage across **6+ AI features** as an auditable per-feature log, replacing on/off feature flags so customers are billed by what they actually use.
- **AI Interview Platform:** Engineered the backend for a **3-stage** AI interview platform used by **hundreds of candidates**, with automated proctoring and strict candidate-level data isolation.

## Projects

### CodeSM | [GitHub](https://github.com/shivamxverma/CodeSM) | [Live](https://code-sm.vercel.app/) | *TypeScript, Node.js, BullMQ, Redis, PostgreSQL, Docker*
- **Queue-Backed Execution:** Architected a code execution engine where the API stores a pending submission and BullMQ workers run untrusted code for **6 languages** off the request path, in Docker with no network, a read-only filesystem, and CPU, memory, and time limits.
- **Cheap per-Job Work:** Reused one container per submission across its test cases and streamed test cases from S3 one at a time, stopping at the first failure.

### Storix | [GitHub](https://github.com/shivamxverma/Storix) | [Live](https://async-doc.vercel.app) | *FastAPI, Celery, Redis, PostgreSQL, WebSockets*
- **Live Job Progress:** Shipped an async PDF ingestion pipeline where Celery workers extract off the request path and Redis pub/sub relays each stage to the client over WebSockets, so users see real progress instead of a spinner.

### Hireflow | [GitHub](https://github.com/shivamxverma/hireflow) | *TypeScript, Node.js, BullMQ, PostgreSQL, Playwright*
- **Isolated Pipeline Stages:** Split ingestion from **4 sources**, AI processing, and Playwright automation onto separate BullMQ queues so a block in one stage never stalls the others; used for real applications.

## Skills

**Languages:** TypeScript, Python, SQL, C++
**Backend & Jobs:** Node.js, Express.js, BullMQ, Celery, FastAPI, REST APIs, WebSockets
**Data & Infrastructure:** PostgreSQL, Redis, MongoDB, Docker, Kubernetes, AWS (EC2, S3), Cloudflare R2
**AI:** LLM pipelines, OpenAI Realtime, RAG, LLM evaluation
**Frontend & Tooling:** React, Next.js, Git, Linux, CI pipelines

## Education

### Indian Institute of Information Technology Nagpur @ Nov 2022 – May 2026
*B.Tech in Computer Science and Engineering* @ *Nagpur, Maharashtra*

## Achievements

- **Competitive Programming:** **Top 5% globally** on [LeetCode](https://leetcode.com/u/MahavirCoder/) (**1800+ rating**, 800+ problems solved) · **3-star** on [CodeChef](https://www.codechef.com/users/mahavir99) (1700+) · Pupil on Codeforces.
- **Hackathon:** **3rd place** at Tantrafiesta 2024, IIIT Nagpur.
