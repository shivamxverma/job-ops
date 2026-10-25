# Shivam Kumar Verma

> +91 91356 68614 | shivam0xverma@gmail.com | [LinkedIn](https://www.linkedin.com/in/shivamv99/) | [GitHub](https://github.com/shivamxverma) | [Portfolio](https://www.shivamworks.dev/)

## Experience

### poiro.com @ Jul 2026 – Present
*Fullstack Developer Intern* @ *Python, FastAPI, MongoDB, Redis, Celery, Next.js, TypeScript*
- **Fail-Closed Concurrency Caps:** Engineered one adapter contract over Pixabay, Unsplash and Pinterest with org-scoped Redis caching, and capped paid vendor calls fail-closed at **500 per org per day** and **5,000 per day globally**, counted only on cache misses, so a bug or abuse cannot run the bill past a known ceiling.
- **DAG Workflow Engine:** Built the node and group system behind the AI workflow builder: each workflow is a DAG of generation steps with typed ports and a defined execution order, and groups run as nested sub-workflows.
- **Shared Asset Service:** Designed the org-scoped MongoDB models and FastAPI backend for one asset service shared by **3 apps**, and migrated existing assets into it.

### klimb.io @ Nov 2025 – May 2026
*Full Stack Developer Intern* @ *TypeScript, Express.js, PostgreSQL, Redis, AWS*
- **Usage Billing Ledger:** Architected a PostgreSQL credit ledger enforced in middleware that records every use of **6+ AI features** as an auditable per-feature log, replacing on/off feature flags and making usage-based billing possible.

## Projects

### CodeSM | [GitHub](https://github.com/shivamxverma/CodeSM) | [Live](https://code-sm.vercel.app/) | *Node.js, BullMQ, Redis, PostgreSQL, Docker*
- **Resource-Limited Sandbox:** Implemented a runtime for untrusted code in **6 languages** inside Docker with no network, a read-only root filesystem, all capabilities dropped and per-run cgroup limits of **256 MB** memory, **32 PIDs** and **0.5 CPU**, so fork bombs and infinite loops stay contained.
- **Async Grading Pipeline:** Decoupled grading from the API with BullMQ workers on Redis: submissions persist as PENDING, one container is reused across a submission's test cases via docker exec, and grading exits on the first failure.

### Yuvro | [GitHub](https://github.com/shivamxverma/yuvro) | *Python, FastAPI, Kubernetes, PostgreSQL, WebSockets*
- **Per-Project Kubernetes Runtimes:** Orchestrated an on-demand Kubernetes deployment, service and ingress for each project, with a runner that streams PTY sessions over WebSockets and proxies ports, so user code never runs on the API servers.

### DeepDoc | [GitHub](https://github.com/shivamxverma/DeepDoc) | *TypeScript, Azure OpenAI, Pinecone, PostgreSQL*
- **Stage-Level Evaluation Harness:** Created a **36-case** harness (**6 multi-turn**) that separates indexing, retrieval and generation failures; it traced empty answers to a metadata field ingestion never wrote, which no prompt change could fix.

## Skills

**Languages:** Python, TypeScript, SQL, C++
**Infrastructure:** Linux, Docker, Kubernetes, AWS (EC2, S3), CI pipelines, Git
**Backend & Concurrency:** FastAPI, Node.js, Express.js, REST APIs, WebSockets, Celery, BullMQ, idempotency, rate limiting
**Data Systems:** PostgreSQL, MongoDB, Redis, Pinecone
**AI:** RAG, LLM evaluation

## Education

### Indian Institute of Information Technology Nagpur @ Nov 2022 – May 2026
*B.Tech in Computer Science and Engineering* @ *Nagpur, Maharashtra*

## Achievements

- **Competitive Programming:** **Top 5% globally** on [LeetCode](https://leetcode.com/u/MahavirCoder/) (**1800+ rating**, 800+ problems solved) · **3-star** on [CodeChef](https://www.codechef.com/users/mahavir99) (1700+) · Pupil on Codeforces.
- **Hackathon:** **3rd place** at Tantrafiesta 2024, IIIT Nagpur.
