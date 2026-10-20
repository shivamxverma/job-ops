# Shivam Kumar Verma

> +91 91356 68614 | shivam.verma.dev00@gmail.com | [LinkedIn](https://www.linkedin.com/in/shivamv99/) | [GitHub](https://github.com/shivamxverma) | [Portfolio](https://www.shivamworks.dev/)

## Education

### Indian Institute of Information Technology, Nagpur @ November 2022 – May 2026
*B.Tech in Computer Science and Engineering* @ *Nagpur, Maharashtra*

## Experience

### poiro.com @ July 2026 – Present
*Fullstack Developer* @ *Python, FastAPI, PostgreSQL, Cloudflare R2, TypeScript*
- **Storage Integrity and Deduplication:** Engineered storage-verified **SHA-256** deduplication in **Python/FastAPI** with a **PostgreSQL** uniqueness guarantee and client-side preflight, preventing duplicate **Cloudflare R2** writes under concurrent uploads without trusting client-supplied hashes.
- **Asset Data Model and APIs:** Built the data model, services, and APIs for the asset layer behind AI-generation surfaces; fixed reference-integrity defects that hid nested folders and AI-lineage assets, and replaced depth-dependent tree traversal with a **single SQL aggregation query**.
- **Codebase Reliability:** Cleared approximately **1,041 Ruff findings across 7 Python trees**, made lint/format checks blocking in CI and pre-push, and added dynamic package discovery so new packages are covered automatically.

### klimb.io @ November 2025 – March 2026
*Full Stack Developer Intern* @ *Node.js, TypeScript, PostgreSQL, Redis, AWS (S3, EC2)*
- **Usage Metering and Credit Ledger:** Designed a PostgreSQL-backed usage-metering and credit ledger across **6+ AI features**, replacing binary feature flags with an auditable per-feature consumption record for finance.
- **Query Performance:** Rewrote slow **SQL** queries and restructured recruiter-dashboard data access, reducing p95 latency and memory overhead under concurrent load.
- **Session Isolation:** Developed backend services for a **3+ stage** AI interview platform with automated proctoring and strict candidate-level data isolation across concurrent live sessions.

## Projects

### Hireflow | [GitHub](https://github.com/shivamxverma/hireflow) | *TypeScript, BullMQ, Redis, PostgreSQL, Gemini, Playwright*
- **Multi-Source Ingestion and Dedup:** Created an ingestion pipeline over **4 sources** (LinkedIn, Wellfound, YC, Telegram via GramJS) that parses stack and seniority with **Gemini** and drops cross-source duplicates with **SHA-256 fingerprints** of normalised title, company and description.
- **LLM Output Validation:** Implemented a validator that rejects any GPT-4o-mini rewritten skill not present in the candidate's real profile, so the model's output cannot invent data, with each stage on its own **BullMQ** queue so one blocked source never stalls the rest.

### Storix | [GitHub](https://github.com/shivamxverma/Storix) | [Live](https://async-doc.vercel.app) | *Python, FastAPI, Celery, Redis, PostgreSQL, AWS S3*
- **Async PDF Extraction Pipeline:** Architected a **FastAPI** upload path that hands PDF extraction to **Celery** workers off the request path, relaying each stage's progress through Redis pub/sub to the client over WebSockets.

### Yuvro | [GitHub](https://github.com/shivamxverma/yuvro) | [Demo](https://drive.google.com/file/d/1Tb_NXvNCp8AcG48K_PUl4GhvSY1ZqiAY/view?usp=sharing) | *Python, FastAPI, PostgreSQL, Kubernetes, AWS S3*
- **Content-Addressed Storage:** Deduplicated workspace files with **SHA-256 content-addressed S3 storage** with template manifests and garbage collection, and modeled the file tree as a self-referential PostgreSQL table indexed on **3 composite keys** for fast lookups.

### CodeSM | [GitHub](https://github.com/shivamxverma/CodeSM) | [Live](https://code-sm.vercel.app/) | *Node.js, BullMQ, Redis, PostgreSQL, Docker*
- **Sandboxed Execution Engine:** Shipped a BullMQ + Redis pipeline that grades untrusted code in **6 languages** inside **Docker** with CPU, memory, network and timeout limits, fetching S3 test data one case at a time to bound per-job memory.

## Technical Skills

**Data Systems:** SQL, PostgreSQL, Redis, MongoDB, Prisma, Cloudflare R2, AWS S3, data pipelines, ETL, deduplication, content-addressed storage
**Backend & APIs:** Python, FastAPI, Node.js, Express.js, REST APIs, WebSockets, Celery, BullMQ, distributed job processing
**Infrastructure & Runtimes:** Docker, Kubernetes, Linux, Nginx, AWS (EC2, S3), CI/CD, Git
**Languages & Automation:** Python, TypeScript, JavaScript, C++, LLM integration (Gemini, GPT-4o-mini), Playwright, Ruff

## Achievements

- **Competitive Programming:** **Top 5% globally** on [LeetCode](https://leetcode.com/u/MahavirCoder/) (**1800+ rating**, 800+ problems solved) · **3-star** on [CodeChef](https://www.codechef.com/users/mahavir99).
- **Tantrafiesta 2024:** **3rd rank** at IIIT Nagpur's hackathon.
