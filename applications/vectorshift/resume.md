# Shivam Kumar Verma

> +91 91356 68614 | shivam0xverma@gmail.com | [LinkedIn](https://www.linkedin.com/in/shivamv99/) | [GitHub](https://github.com/shivamxverma) | [Portfolio](https://www.shivamworks.dev/)

## Experience

### poiro.com @ Jul 2026 – Present
*Fullstack Developer Intern* @ *Python, FastAPI, MongoDB, Redis, Celery, Next.js, TypeScript, Cloudflare R2*
- **DAG Workflow Engine:** Built the node and group system behind a visual AI workflow builder: each workflow is a DAG of generation steps passing typed outputs between ports in execution order, and nested groups run as **sub-workflows** in one unit.
- **Digital Asset Service:** Designed the org-scoped MongoDB models and **FastAPI** backend for one asset service shared by **3 apps** (**32 routes**, keyset pagination), migrated existing assets into it, and replaced one subtree query per folder level with a single `$graphLookup`, cutting folder-edit database round-trips from **3 to 1** for query performance.
- **Provider Adapter Layer:** Integrated Pixabay, Unsplash, and Pinterest behind one adapter contract with per-org Redis caching and fail-closed spend caps of **500 calls/org/day** and **5,000/day** globally to stop runaway provider costs.
- **Python Codebase Health:** Cleared **1,041** Ruff findings across **7** Python packages, made lint blocking in CI, moved the baseline to Python 3.13, and refreshed **70** dependencies.

### klimb.io @ Nov 2025 – May 2026
*Full Stack Developer Intern* @ *TypeScript, Express.js, PostgreSQL, Redis, AWS*
- **Usage-Based Billing Ledger:** Replaced on/off feature flags with a PostgreSQL credit ledger that meters each customer's usage of **6+ AI features**, which made usage-based pricing possible.

## Projects

### CodeSM | [GitHub](https://github.com/shivamxverma/CodeSM) | [Live](https://code-sm.vercel.app/) | *Node.js, BullMQ, Redis, PostgreSQL, Docker*
- **Sandboxed Code Execution:** Engineered an isolated runtime for **6 languages** where each submission runs in a container with no network, a read-only root, **256 MB** memory, **32** PIDs, and a CPU and time limit, so infinite loops and fork bombs stay contained.
- **Async Grading Queue:** Moved grading off the request path onto BullMQ workers so the API returns instantly; each submission reuses **1** container across all its test cases, loaded from S3 one at a time, and exits at the first failure.

### Yuvro | [GitHub](https://github.com/shivamxverma/yuvro) | [Demo](https://drive.google.com/file/d/1Tb_NXvNCp8AcG48K_PUl4GhvSY1ZqiAY/view?usp=sharing) | *Python, FastAPI, PostgreSQL, Kubernetes, AWS S3*
- **Workspace Orchestrator:** Architected a **4**-plane cloud IDE whose **FastAPI** orchestrator provisions per-project Kubernetes deployments, services and ingress on demand, with a runner streaming PTY sessions over WebSockets.
- **Storage and Schema:** Implemented content-addressed file storage in S3 with scheduled garbage collection, over a self-referential PostgreSQL file tree with **3** composite indexes for path lookups.

### DeepDoc | [GitHub](https://github.com/shivamxverma/DeepDoc) | *RAG, Next.js, TypeScript, Azure OpenAI, Pinecone, PostgreSQL*
- **RAG Pipeline:** Developed section-aware chunking, document-scoped vector retrieval, and follow-up rewriting from chat history, ranked and deduplicated into a token budget.
- **Evaluation Harness:** Created a **36-case** eval suite (**6** multi-turn) that sweeps **100+** retrieval configurations and separates indexing, retrieval and generation failures.

## Skills

**Languages:** Python, TypeScript, SQL, C++
**Backend:** FastAPI, Celery, Node.js, Express.js, REST APIs, WebSockets, BullMQ
**Data & Infrastructure:** PostgreSQL, MongoDB, Redis, Pinecone, Docker, Kubernetes, AWS (EC2, S3)
**AI Engineering:** RAG, embeddings and vector search, LLM evaluation, AI workflow orchestration
**Frontend & Tooling:** React, Next.js, Git, Linux, CI pipelines

## Education

### Indian Institute of Information Technology Nagpur @ Nov 2022 – May 2026
*B.Tech in Computer Science and Engineering* @ *Nagpur, Maharashtra*

## Achievements

- **Competitive Programming:** **Top 5% globally** on [LeetCode](https://leetcode.com/u/MahavirCoder/) (**1800+ rating**, 800+ problems solved) · **3-star** on [CodeChef](https://www.codechef.com/users/mahavir99) (1700+) · Pupil on Codeforces.
- **Hackathon:** **3rd place**, Tantrafiesta 2024, IIIT Nagpur.
