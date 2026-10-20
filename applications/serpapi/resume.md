# Shivam Kumar Verma

> +91 91356 68614 | shivam.verma.dev00@gmail.com | [LinkedIn](https://www.linkedin.com/in/shivamv99/) | [GitHub](https://github.com/shivamxverma) | [Portfolio](https://www.shivamworks.dev/)

## Education

### Indian Institute of Information Technology, Nagpur @ November 2022 – May 2026
*B.Tech in Computer Science and Engineering* @ *Nagpur, Maharashtra*

## Experience

### poiro.com @ July 2026 – Present
*Fullstack Developer* @ *TypeScript, Python, FastAPI, Next.js, PostgreSQL, Cloudflare R2*
- **Asset Data Model and APIs:** Built the data model, services, and APIs for the asset layer behind AI-generation surfaces; fixed production endpoint failures and reference-integrity defects that hid nested folders and AI-lineage assets, and replaced depth-dependent tree traversal with a **single aggregation query**.
- **Storage Integrity and Deduplication:** Engineered storage-verified **SHA-256** deduplication with a database uniqueness guarantee and client-side preflight, preventing duplicate R2 writes without trusting client-supplied hashes.
- **Codebase Reliability:** Cleared approximately **1,041 Ruff findings across 7 Python trees**, made lint/format checks blocking in CI and pre-push, and added dynamic package discovery so new packages are covered automatically.

### klimb.io @ November 2025 – March 2026
*Full Stack Developer Intern* @ *TypeScript, React, Node.js, Express.js, PostgreSQL, Redis, AWS*
- **Usage Metering:** Designed a PostgreSQL-backed usage-metering and credit ledger across **6+ AI features**, giving product and finance an auditable per-feature consumption record.
- **Query Performance:** Rewrote slow queries and restructured recruiter-dashboard data access, reducing p95 latency and memory overhead under concurrent load.
- **AI Interview Platform:** Developed backend services for a **3+ stage** AI interview platform with automated proctoring and strict candidate-level data isolation across concurrent live sessions.

## Projects

### Hireflow | [GitHub](https://github.com/shivamxverma/hireflow) | *Node.js, TypeScript, Playwright, BullMQ, Redis, PostgreSQL*
- **Scraping and Browser Automation:** Created an ingestion pipeline that scrapes listings from **4 sources** (LinkedIn, Wellfound, YC, Telegram via GramJS) and applies through **Playwright**, with each stage on its own **BullMQ** queue so a bot-detection block in one never stalls the others and third-party rate limits hold.
- **Parsing and Dedup:** Implemented LLM parsing of stack and seniority with Gemini, plus **SHA-256 fingerprints** of normalised title, company and description to drop cross-source duplicates.

### CodeSM | [GitHub](https://github.com/shivamxverma/CodeSM) | [Live](https://code-sm.vercel.app/) | *Node.js, Express.js, BullMQ, Redis, Docker, AWS EC2*
- **Sandboxed Execution Engine:** Architected a BullMQ + Redis pipeline that grades untrusted code in **6 languages** (including JavaScript) inside **Docker** with CPU, memory, network and timeout limits, keeping the API responsive with retries for failed jobs.
- **Lazy Testcase Processing:** Fetched S3-backed test data one case at a time with early exit on the first failure, bounding per-job memory on **AWS EC2**.

### Storix | [GitHub](https://github.com/shivamxverma/Storix) | [Live](https://async-doc.vercel.app) | *FastAPI, Celery, Redis, Next.js, WebSockets*
- **Live Async Pipeline:** Shipped a PDF ingestion flow where **Celery** workers extract off the request path and Redis pub/sub relays each stage to a **Next.js** client over WebSockets.

## Technical Skills

**Backend & APIs:** Node.js, Express.js, FastAPI, Next.js, REST APIs, WebSockets, BullMQ, Celery
**Data Systems:** MongoDB, PostgreSQL, Redis, Prisma, Cloudflare R2, AWS S3
**Infrastructure & Runtimes:** Linux, AWS (EC2, S3), Docker, Kubernetes, Nginx, Git, CI/CD
**Languages & Automation:** JavaScript, TypeScript, Python, C++, Playwright, GramJS, Postman

## Achievements

- **Competitive Programming:** **Top 5% globally** on [LeetCode](https://leetcode.com/u/MahavirCoder/) (**1800+ rating**, 800+ problems solved) · **3-star** on [CodeChef](https://www.codechef.com/users/mahavir99).
- **Tantrafiesta 2024:** **3rd rank** at IIIT Nagpur's hackathon.
