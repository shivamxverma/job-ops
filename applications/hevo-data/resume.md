# Shivam Kumar Verma

> +91 91356 68614 | shivam0xverma@gmail.com | [LinkedIn](https://www.linkedin.com/in/shivamv99/) | [GitHub](https://github.com/shivamxverma) | [Portfolio](https://www.shivamworks.dev/)

## Experience

### poiro.com @ Jul 2026 – Present
*Fullstack Developer Intern* @ *Python, FastAPI, MongoDB, Redis, Celery, Next.js, TypeScript*
- **Third-Party API Connectors:** Integrated the Pixabay, Unsplash, and Pinterest REST APIs as connectors behind one search and download adapter contract, replaced their roughly **2 KB** pagination cursors with **32-character** tokens, and load-tested **2** Pinterest vendors at **30** concurrent requests.
- **Rate Limits and Caching:** Added per-org Redis caching and fail-closed caps of **500 provider calls per org per day** and **5,000 per day** globally, so no workflow can exhaust a vendor quota or run up costs.
- **Digital Asset Service:** Designed the org-scoped MongoDB models and FastAPI backend for one asset service shared by **3 apps**, with keyset pagination and direct uploads to Cloudflare R2.
- **Query Performance:** Rewrote the folder tree to use a single MongoDB **$graphLookup** instead of one query per nesting level, and cut folder-edit database round-trips from **3 to 1**.

### klimb.io @ Nov 2025 – May 2026
*Full Stack Developer Intern* @ *TypeScript, Express.js, PostgreSQL, Redis, AWS*
- **Usage-Based Billing Ledger:** Built a PostgreSQL credit ledger that meters usage across **6+ AI features** as an auditable per-feature log, replacing on/off feature flags so customers could be billed by usage.
- **AI Interview Platform:** Engineered the backend for a **3-stage** AI interview platform used by **hundreds of candidates**, with automated proctoring and strict candidate-level data isolation.

## Projects

### Hireflow | [GitHub](https://github.com/shivamxverma/hireflow) | *Node.js, TypeScript, BullMQ, Redis, PostgreSQL*
- **Multi-Source Ingestion:** Developed ingestion from **4 sources** (LinkedIn, Wellfound, YC Work at a Startup, and Telegram via GramJS) and deduplicated listings across sources with SHA-256 fingerprints of the normalised title, company, and description.
- **Decoupled Pipeline Stages:** Split ingestion, AI parsing, and Playwright automation onto separate BullMQ queues, so a block in one stage never stalls the others and each source's rate limits hold.

### CodeSM | [GitHub](https://github.com/shivamxverma/CodeSM) | [Live](https://code-sm.vercel.app/) | *Node.js, BullMQ, Redis, PostgreSQL, Docker, AWS S3*
- **Async Execution Engine:** Architected a code execution engine where the API stores a pending submission and BullMQ workers grade it off the request path, running untrusted code for **6 languages** in Docker with no network, a read-only filesystem, and CPU, memory, and time limits.
- **Test-Case Streaming:** Reused one container per submission across its test cases and streamed test cases from S3 one at a time, exiting on the first failure.

### Storix | [GitHub](https://github.com/shivamxverma/Storix) | [Live](https://async-doc.vercel.app) | *FastAPI, Celery, Redis, PostgreSQL, WebSockets*
- **Async Ingestion Pipeline:** Shipped a PDF ingestion pipeline where FastAPI accepts the upload, Celery workers extract it off the request path, and Redis pub/sub relays each stage to the client over WebSockets.

## Skills

**Languages & Fundamentals:** Python, TypeScript, SQL, C++, OOP, data structures and algorithms
**Backend & APIs:** REST APIs, JSON, FastAPI, Node.js, Express.js, Celery, BullMQ, WebSockets
**Data Pipelines:** API integrations, cursor pagination, rate limiting, caching, deduplication, job queues
**Data & Infrastructure:** PostgreSQL, MongoDB, Redis, Docker, Kubernetes, AWS (EC2, S3), Cloudflare R2
**Frontend & Tooling:** React, Next.js, Playwright, Git, Linux, CI pipelines

## Education

### Indian Institute of Information Technology Nagpur @ Nov 2022 – May 2026
*B.Tech in Computer Science and Engineering* @ *Nagpur, Maharashtra*

## Achievements

- **Competitive Programming:** **Top 5% globally** on [LeetCode](https://leetcode.com/u/MahavirCoder/) (**1800+ rating**, 800+ problems solved) · **3-star** on [CodeChef](https://www.codechef.com/users/mahavir99) (1700+) · Pupil on Codeforces.
- **Hackathon:** **3rd place** at Tantrafiesta 2024, IIIT Nagpur.
