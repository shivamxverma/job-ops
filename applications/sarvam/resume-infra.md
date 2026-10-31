# Shivam Kumar Verma

> +91 91356 68614 | shivam0xverma@gmail.com | [LinkedIn](https://www.linkedin.com/in/shivamv99/) | [GitHub](https://github.com/shivamxverma) | [Portfolio](https://www.shivamworks.dev/)

## Experience

### poiro.com @ Jul 2026 – Present
*Fullstack Developer Intern* @ *Python, FastAPI, Celery, Redis, MongoDB, Docker, Turborepo, CI/CD*
- **CI Enforcement:** Cleared **1,041** Ruff findings across **7** Python packages, made whole-tree lint and format checks blocking in **CI** and pre-push, and replaced a hand-kept package list with automatic discovery from `pyproject.toml`, so **4** packages were checked for the first time.
- **Dependency and Build Upgrade:** Moved the Python baseline and CI matrix to **3.13**, refreshed **70** dependencies across **12** lock files, and replaced **28** hand-written Docker COPY lines with `turbo prune` across **3** images; flagged provider API keys found committed in old configs for rotation.
- **Provider Adapter Layer:** Integrated Pixabay, Unsplash, and Pinterest behind one adapter contract with org-scoped Redis caching and fail-closed spend caps of **500 calls/org/day** and **5,000/day** globally, to stop runaway provider costs.

### klimb.io @ Nov 2025 – May 2026
*Full Stack Developer Intern* @ *TypeScript, Express.js, PostgreSQL, Redis, AWS*
- **Usage-Based Billing Ledger:** Designed a PostgreSQL credit ledger that meters each customer's usage of **6+ AI features**, replacing on/off feature flags with an auditable per-feature log that made usage-based pricing possible.

## Projects

### Yuvro | [GitHub](https://github.com/shivamxverma/yuvro) | [Demo](https://drive.google.com/file/d/1Tb_NXvNCp8AcG48K_PUl4GhvSY1ZqiAY/view?usp=sharing) | *Python, FastAPI, Kubernetes, PostgreSQL, AWS S3*
- **Kubernetes Orchestrator:** Built a FastAPI orchestrator that provisions a Kubernetes Deployment, Service, Ingress, and optional database for each project on demand, split into **4** planes so infrastructure actions never leak into user-facing APIs.
- **Storage Garbage Collection:** Stored files once by SHA-256 content hash in S3 and automated cleanup with a scheduled job that deletes files no project references.

### CodeSM | [GitHub](https://github.com/shivamxverma/CodeSM) | [Live](https://code-sm.vercel.app/) | *Node.js, BullMQ, Redis, PostgreSQL, Docker*
- **Hardened Linux Sandbox:** Engineered a Docker runtime for untrusted code in **6** languages with no network, a read-only root filesystem, all capabilities dropped, and limits of **256 MB** memory, **32** processes, and **0.5** CPU, so fork bombs and infinite loops stay contained.
- **Async Grading Queue:** Offloaded grading to BullMQ workers so the API returns instantly, reusing one container per submission across its test cases with `docker exec`.

### DeepDoc | [GitHub](https://github.com/shivamxverma/DeepDoc) | *RAG, Next.js, TypeScript, Azure OpenAI, Pinecone*
- **LLM Eval Harness:** Wrote a **36**-case evaluation suite that separates indexing, retrieval, and generation failures, which caught a bug that was blanking every retrieved chunk.

## Technical Skills

**Infrastructure:** Linux, Docker, Kubernetes, CI/CD, Git, AWS (EC2, S3), Cloudflare R2
**Languages:** Python, TypeScript, SQL, C++
**Backend & Queues:** FastAPI, Celery, BullMQ, Kafka, Node.js, REST APIs, WebSockets
**Data:** PostgreSQL, MongoDB, Redis, Pinecone
**AI Engineering:** LLM evaluation, RAG, Azure OpenAI, Gemini

## Education

### Indian Institute of Information Technology Nagpur @ Nov 2022 – May 2026
*B.Tech in Computer Science and Engineering* @ *Nagpur, Maharashtra*

## Achievements

- **Competitive Programming:** **Top 5% globally** on [LeetCode](https://leetcode.com/u/MahavirCoder/) (**1800+ rating**, 800+ problems solved) · **3-star** on [CodeChef](https://www.codechef.com/users/mahavir99) (1700+) · Pupil on Codeforces.
- **Hackathon:** **3rd place** at Tantrafiesta 2024, IIIT Nagpur's hackathon.
