# Shivam Kumar Verma

> +91 91356 68614 | shivam.verma.dev00@gmail.com | [LinkedIn](https://www.linkedin.com/in/shivamv99/) | [GitHub](https://github.com/shivamxverma) | [Portfolio](https://www.shivamworks.dev/)

## Education

### Indian Institute of Information Technology, Nagpur @ November 2022 – May 2026
*B.Tech in Computer Science and Engineering* @ *Nagpur, Maharashtra*

## Experience

### poiro.com @ July 2026 – Present
*Fullstack Developer* @ *Python, FastAPI, PostgreSQL, Cloudflare R2, TypeScript*
- **Storage Integrity and Deduplication:** Engineered storage-verified **SHA-256** deduplication in **Python/FastAPI** with a **PostgreSQL** uniqueness guarantee and client-side preflight, preventing duplicate R2 writes under concurrent uploads without trusting client-supplied hashes.
- **Asset Data Model and APIs:** Built the data model, services, and APIs for the asset layer behind AI-generation surfaces; fixed reference-integrity defects that hid nested folders and AI-lineage assets, and replaced depth-dependent tree traversal with a **single aggregation query**.
- **Production Reliability:** Cleared approximately **1,041 Ruff findings across 7 Python trees**, made lint/format checks blocking in CI and pre-push, and added dynamic package discovery so new packages are covered automatically.

### klimb.io @ November 2025 – March 2026
*Full Stack Developer Intern* @ *Node.js, PostgreSQL, Redis, AWS (S3, EC2)*
- **Query Performance:** Rewrote slow **PostgreSQL** queries and restructured recruiter-dashboard data access, reducing p95 latency and memory overhead under concurrent load.
- **Usage Metering:** Designed a PostgreSQL-backed usage-metering and credit ledger across **6+ AI features**, giving product and finance an auditable per-feature consumption record.
- **Session Isolation:** Developed backend services for a **3+ stage** AI interview platform with automated proctoring and strict candidate-level data isolation across concurrent live sessions.

## Projects

### Yuvro | [GitHub](https://github.com/shivamxverma/yuvro) | [Demo](https://drive.google.com/file/d/1Tb_NXvNCp8AcG48K_PUl4GhvSY1ZqiAY/view?usp=sharing) | *Python, FastAPI, PostgreSQL, Kubernetes, AWS S3*
- **Content-Addressed Storage:** Implemented **SHA-256 content-addressed S3 storage** with template manifests and garbage collection, so repeated files are stored once and cleanup is deterministic.
- **Indexed Metadata at Scale:** Modeled the file tree as a self-referential PostgreSQL table indexed on (project, parent), (project, parent, name) and (project, type), keeping lookups fast without storing file contents in the database.

### Hireflow | [GitHub](https://github.com/shivamxverma/hireflow) | *Node.js, TypeScript, BullMQ, Redis, PostgreSQL, Playwright*
- **Multi-Source Ingestion:** Created an ingestion pipeline over **4 sources** (LinkedIn, Wellfound, YC, Telegram via GramJS) with **SHA-256 fingerprints** of normalised title, company and description to drop cross-source duplicates.
- **Isolated Pipeline Stages:** Separated crawling, LLM enrichment and **Playwright** automation onto independent **BullMQ + Redis** queues, so a bot-detection block in one stage never stalls the others and third-party rate limits hold.

### CodeSM | [GitHub](https://github.com/shivamxverma/CodeSM) | [Live](https://code-sm.vercel.app/) | *Node.js, BullMQ, Redis, PostgreSQL, Docker*
- **Sandboxed Execution Engine:** Architected a BullMQ + Redis pipeline that grades untrusted code in **6 languages** inside **Docker** with CPU, memory, process, network and timeout limits, reusing persistent containers and fetching S3 test data one case at a time to bound per-job memory.

## Technical Skills

**Backend & APIs:** Python, FastAPI, Node.js, Express.js, REST APIs, WebSockets, data pipelines, distributed job processing
**Data Systems:** PostgreSQL, Redis, MongoDB, Prisma, Cloudflare R2, AWS S3, content-addressed storage, deduplication pipelines
**Infrastructure & Runtimes:** Docker, Kubernetes, BullMQ, Celery, Linux, Nginx, AWS (EC2, S3), CI/CD
**Languages & Automation:** Python, TypeScript, JavaScript, C++, Playwright, Ruff, ESLint

## Achievements

- **Competitive Programming:** **Top 5% globally** on [LeetCode](https://leetcode.com/u/MahavirCoder/) (**1800+ rating**, 800+ problems solved) · **3-star** on [CodeChef](https://www.codechef.com/users/mahavir99).
- **Tantrafiesta 2024:** **3rd rank** at IIIT Nagpur's hackathon.
