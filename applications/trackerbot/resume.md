# Shivam Kumar Verma

> +91 91356 68614 | shivam.verma.dev00@gmail.com | [LinkedIn](https://www.linkedin.com/in/shivamv99/) | [GitHub](https://github.com/shivamxverma) | [Portfolio](https://www.shivamworks.dev/)

## Education

### Indian Institute of Information Technology, Nagpur @ November 2022 – May 2026
*B.Tech in Computer Science and Engineering* @ *Nagpur, Maharashtra*

## Experience

### poiro.com @ July 2026 – Present
*Fullstack Developer* @ *TypeScript, Python, FastAPI, Next.js, PostgreSQL, Cloudflare R2*
- **Storage Integrity and Deduplication:** Engineered storage-verified **SHA-256** asset deduplication backed by a **PostgreSQL** uniqueness guarantee and a client-side preflight, preventing duplicate **Cloudflare R2** writes without trusting client-supplied hashes.
- **Creative Asset Manager Backend:** Built the data model, services, and APIs for the asset layer behind AI-generation surfaces; fixed production endpoint failures and reference-integrity defects that hid nested folders, and replaced depth-dependent tree traversal with a **single aggregation query**.
- **Repository Reliability:** Cleared approximately **1,041 Ruff findings across 7 Python trees**, made lint/format checks blocking in CI and pre-push, and added dynamic package discovery so new packages are covered automatically.

### klimb.io @ November 2025 – March 2026
*Full Stack Developer Intern* @ *TypeScript, Node.js, Express.js, PostgreSQL, Redis, AWS*
- **AI Usage Metering:** Designed a **PostgreSQL**-backed usage-metering and credit ledger across **6+ AI features** in a **Node.js/Express** backend, replacing binary feature flags with an auditable per-feature usage log for finance.
- **Data Access Optimization:** Rewrote slow **PostgreSQL** queries and restructured recruiter-dashboard data access, reducing p95 latency and memory overhead under concurrent load.
- **AI Interview Platform Backend:** Developed backend services for a **3+ stage** AI interview platform with automated proctoring and strict candidate-level data isolation across concurrent live sessions.

## Projects

### CodeSM | [GitHub](https://github.com/shivamxverma/CodeSM) | [Live](https://code-sm.vercel.app/) | *Node.js, Express.js, BullMQ, Redis, PostgreSQL, AWS S3*
- **Background Job Pipeline:** Architected a **BullMQ + Redis** pipeline that persists each submission in **PostgreSQL** before grading it outside the request lifecycle, keeping the **Express** API responsive and retrying failed jobs automatically.
- **Sandboxed Multi-Language Runtime:** Isolated untrusted code in **6 languages** (C, C++, Java, Go, Python, JavaScript) in Docker with CPU, memory, network, filesystem, timeout, and output limits, reusing containers instead of starting one per submission.
- **Lazy Testcase Processing:** Streamed **AWS S3**-backed test data one case at a time with early exit on the first failure, bounding per-job memory and skipping unnecessary downloads.

### Hireflow | [GitHub](https://github.com/shivamxverma/hireflow) | *Node.js, TypeScript, BullMQ, PostgreSQL, Playwright*
- **Decoupled Ingestion Queues:** Split ingestion from **4 sources** (LinkedIn, Wellfound, YC Work at a Startup, Telegram via GramJS), AI processing, and browser automation onto separate **BullMQ** queues, so a bot-detection block in one stage cannot stall the others.
- **Deduplication and Browser Automation:** Implemented **SHA-256** fingerprints of the normalised title, company, and description so a listing arriving from several sources is stored once in **PostgreSQL**, then automated submission on third-party sites with **Playwright** within each source's rate limits.

## Technical Skills

**Backend & APIs:** Node.js, Express.js, REST APIs, background job processing, WebSockets, FastAPI
**Data Systems:** PostgreSQL, Redis, Prisma, MongoDB, Cloudflare R2, deduplication pipelines
**Infrastructure & Runtimes:** AWS (S3, EC2), BullMQ, Docker, Linux, CI/CD, Kubernetes
**Languages & Automation:** JavaScript, TypeScript, Python, C++, Playwright, React, Next.js, Postman, ESLint

## Achievements

- **Competitive Programming:** **Top 5% globally** on [LeetCode](https://leetcode.com/u/MahavirCoder/) (**1800+ rating**, 800+ problems solved) · **3-star** on [CodeChef](https://www.codechef.com/users/mahavir99).
- **Tantrafiesta 2024:** **3rd rank** at IIIT Nagpur's hackathon.
