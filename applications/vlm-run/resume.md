# Shivam Kumar Verma

> +91 91356 68614 | shivam.verma.dev00@gmail.com | [LinkedIn](https://www.linkedin.com/in/shivamv99/) | [GitHub](https://github.com/shivamxverma) | [Portfolio](https://www.shivamworks.dev/)

## Education

### Indian Institute of Information Technology, Nagpur @ November 2022 – May 2026
*B.Tech in Computer Science and Engineering* @ *Nagpur, Maharashtra*

## Experience

### poiro.com @ July 2026 – Present
*Fullstack Developer* @ *TypeScript, Python, FastAPI, Next.js, PostgreSQL, Cloudflare R2*
- **Creative Asset Manager Backend:** Built the data model, services, and APIs for the asset layer used by AI-generation surfaces; fixed production endpoint failures and reference-integrity defects that could hide nested folders and AI-lineage assets, and replaced depth-dependent tree traversal with a **single aggregation query**.
- **Storage Integrity and Deduplication:** Engineered storage-verified **SHA-256** asset deduplication with a database uniqueness guarantee and client-side preflight, preventing duplicate R2 writes without trusting client-supplied hashes.
- **Repository Reliability:** Cleared approximately **1,041 Ruff findings across 7 Python trees**, made lint/format checks blocking in CI and pre-push, and added dynamic package discovery so new packages are covered automatically.

### klimb.io @ November 2025 – March 2026
*Full Stack Developer Intern* @ *TypeScript, Node.js, Express.js, PostgreSQL, Redis, AWS*
- **AI Usage Metering:** Designed a PostgreSQL-backed usage-metering and credit ledger across **6+ AI features**, giving product and finance auditable per-feature usage for consumption-based access control.
- **Data Access Optimization:** Rewrote slow queries and restructured recruiter-dashboard data access, reducing p95 latency and memory overhead for candidate-evaluation and interview operations.
- **AI Interview Platform Backend:** Built backend services for a **3+ stage** AI interview platform with automated proctoring and strict candidate-level data isolation across concurrent live sessions.

## Projects

### Yuvro | [GitHub](https://github.com/shivamxverma/yuvro) | [Demo](https://drive.google.com/file/d/1Tb_NXvNCp8AcG48K_PUl4GhvSY1ZqiAY/view?usp=sharing) | *Python, FastAPI, PostgreSQL, Kubernetes, AWS S3, WebSockets*
- **Isolated Project Runtime:** Built Kubernetes-managed runner environments per project, letting users run code, terminals, previews, and databases without dependency conflicts between workspaces.
- **Indexed Workspace Metadata:** Designed an indexed PostgreSQL file-tree and metadata system for users, workspaces, projects, and folders, enabling fast lookups without storing file contents in the database.
- **Content-Addressed Storage:** Implemented **SHA-256 content-addressed S3 storage** with template manifests and garbage collection, avoiding duplicate file storage and repeated hashing for template-created projects.

### CodeSM | [GitHub](https://github.com/shivamxverma/CodeSM) | [Live](https://code-sm.vercel.app/) | *Node.js, Express.js, BullMQ, Redis, PostgreSQL, Docker, AWS EC2*
- **Asynchronous Evaluation Pipeline:** Built a BullMQ + Redis execution pipeline that persists submissions before background grading, keeping the API responsive during compile and test workloads, with retries for failed jobs.
- **Sandboxed Multi-Language Runtime:** Isolated untrusted C, C++, Java, Go, Python, and JavaScript code in Docker with CPU, memory, process, network, filesystem, timeout, and output limits.
- **Lazy Testcase Processing:** Fetched S3-backed test data one case at a time with early exit on first failure, bounding per-job memory and avoiding unnecessary downloads.

## Technical Skills

**Infrastructure & Runtimes:** Docker, Kubernetes, sandboxed execution, BullMQ, Redis, AWS (EC2, S3), Linux
**Backend & APIs:** Node.js, Express.js, FastAPI, REST APIs, WebSockets, distributed job processing
**Data Systems:** PostgreSQL, Redis, MongoDB, Prisma, Cloudflare R2, content-addressed storage, deduplication pipelines
**Languages & Automation:** TypeScript, JavaScript, Python, C++, Playwright, Postman, Ruff, ESLint, Turbo

## Achievements

- **Competitive Programming:** **Top 5% globally** on [LeetCode](https://leetcode.com/u/MahavirCoder/) (**1800+ rating**, 800+ problems solved) · **3-star** on [CodeChef](https://www.codechef.com/users/mahavir99).
- **Tantrafiesta 2024:** **3rd rank** at IIIT Nagpur's hackathon.
