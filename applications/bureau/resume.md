# Shivam Kumar Verma

> +91 91356 68614 | shivam0xverma@gmail.com | [LinkedIn](https://www.linkedin.com/in/shivamv99/) | [GitHub](https://github.com/shivamxverma) | [Portfolio](https://www.shivamworks.dev/)

## Experience

### poiro.com @ Jul 2026 – Present
*Fullstack Developer Intern* @ *Python, FastAPI, MongoDB, Redis, Celery, Cloudflare R2*
- **Graph Query Rewrite:** Replaced one subtree query per nesting level with a single MongoDB **$graphLookup** for the folder tree, and cut folder-edit database round-trips from **3 to 1**.
- **Shared Asset Data Model:** Designed the org-scoped MongoDB models and FastAPI backend for one asset service shared by **3 apps**, and migrated existing assets from each app into it.
- **Fail-Closed Provider Layer:** Integrated Pixabay, Unsplash and Pinterest behind one adapter contract with org-scoped Redis caching, capping paid calls at **500 per org per day** and **5,000 globally**, counted only on cache misses.

### klimb.io @ Nov 2025 – May 2026
*Full Stack Developer Intern* @ *TypeScript, Express.js, PostgreSQL, Redis, AWS*
- **Usage Ledger in PostgreSQL:** Architected a credit ledger enforced in middleware that records every use of **6+ AI features** per customer, replacing on/off feature flags and making usage-based billing possible.

## Projects

### Chatterly | [GitHub](https://github.com/shivamxverma/chatterly) | *Node.js, Apache Kafka, Redis, PostgreSQL, Socket.io*
- **Streaming Ingestion:** Built real-time chat where **Kafka** decouples message ingestion from delivery and persistence; workers batch writes to PostgreSQL while Redis pub/sub fans events across server instances, with offset handling for delivery guarantees.

### Storix | [GitHub](https://github.com/shivamxverma/Storix) | [Live](https://async-doc.vercel.app) | *FastAPI, Celery, Redis, PostgreSQL, AWS S3*
- **Async Ingestion Pipeline:** Developed a PDF ingestion pipeline where FastAPI accepts the upload, **Celery** workers extract off the request path, and Redis pub/sub streams each stage's status to the client.

### DeepDoc | [GitHub](https://github.com/shivamxverma/DeepDoc) | *TypeScript, Azure OpenAI, Pinecone, PostgreSQL*
- **Stage-Level Debugging:** Created a **36-case** evaluation harness that separates indexing, retrieval and generation failures; it traced empty answers to a field the ingestion step never wrote, after prompt changes had failed.

### CodeSM | [GitHub](https://github.com/shivamxverma/CodeSM) | [Live](https://code-sm.vercel.app/) | *Node.js, BullMQ, Redis, PostgreSQL, Docker*
- **Queue-Backed Execution:** Implemented sandboxed grading for **6 languages** on BullMQ workers, with Docker limits of **256 MB**, **32 PIDs** and **0.5 CPU** per run.

## Skills

**Languages:** Python, SQL, TypeScript, C++
**Data Systems:** PostgreSQL, MongoDB, Redis, Apache Kafka, Pinecone, data modelling
**Backend & Pipelines:** FastAPI, Node.js, Express.js, REST APIs, Celery, BullMQ, WebSockets
**Infrastructure:** AWS (EC2, S3), Docker, Kubernetes, Linux, Git, CI pipelines

## Education

### Indian Institute of Information Technology Nagpur @ Nov 2022 – May 2026
*B.Tech in Computer Science and Engineering* @ *Nagpur, Maharashtra*

## Achievements

- **Competitive Programming:** **Top 5% globally** on [LeetCode](https://leetcode.com/u/MahavirCoder/) (**1800+ rating**, 800+ problems solved) · **3-star** on [CodeChef](https://www.codechef.com/users/mahavir99) (1700+) · Pupil on Codeforces.
- **Hackathon:** **3rd place** at Tantrafiesta 2024, IIIT Nagpur.
