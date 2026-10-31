# Shivam Kumar Verma

> +91 91356 68614 | shivam0xverma@gmail.com | [LinkedIn](https://www.linkedin.com/in/shivamv99/) | [GitHub](https://github.com/shivamxverma) | [Portfolio](https://www.shivamworks.dev/)

## Experience

### poiro.com @ Jul 2026 – Present
*Full Stack Developer Intern* @ *Python, FastAPI, MongoDB, Redis, Celery, Next.js, TypeScript, Cloudflare R2*
- **Creative Asset Manager:** Built one library where every upload and AI generation is saved through a single path, so users can organise assets into folders to build a full film or video. Stored each generation's model, prompt and reference images, and added Elements: reusable character, prop and location image sets with @handles for the prompt box.
- **Async Celery Worker Runtime:** Gave each Celery worker one long-lived event loop and a shared Mongo client and Redis pool, cutting connection churn and ending dead-connection write failures after database restarts.
- **MCP Agent Access:** Built the auth layer that lets AI assistants like Claude run Poiro apps for a user, capped by scopes and daily and per-run credit limits; RS256 tokens are verified via JWKS, refresh tokens rotate, and grants are checked on every request so revoking access is instant.

### klimb.io @ Nov 2025 – May 2026
*Full Stack Developer Intern* @ *TypeScript, Express.js, PostgreSQL, Redis, AWS*
- **Usage-Based Billing Ledger:** Built a credit ledger to replace on/off feature flags, metering every use of 6+ AI features per customer and debiting it from their balance, which let klimb charge customers by usage.

## Projects

### CodeSM | [GitHub](https://github.com/shivamxverma/CodeSM) | [Live](https://code-sm.vercel.app/) | *Code Platform, Node.js, Express.js, BullMQ, Redis, PostgreSQL/Drizzle, Docker, AWS S3*
- **Sandboxed Code Execution:** Ran each submission in an isolated Docker container with no network, a read-only filesystem and CPU, memory and time limits, containing infinite loops, fork bombs and network calls.
- **Async Grading Queue:** Moved grading to BullMQ workers so the API returns instantly; each submission runs all its test cases in one reused container and stops at the first failure.

### DeepDoc | [GitHub](https://github.com/shivamxverma/DeepDoc) | *RAG, Next.js, TypeScript, Azure OpenAI, Pinecone, PostgreSQL/Drizzle, Vercel Blob*
- **RAG Pipeline:** Built a PDF Q&A pipeline that splits documents into section-aware chunks, searches only the active document's vectors, and rewrites follow-up questions from chat history before retrieval.
- **Retrieval Ranking and Tuning:** Ranked retrieved chunks by score, filtered out weak and duplicate matches, and packed the best into a fixed token budget; tuned chunking and retrieval settings across 100+ configurations.

### Yuvro | [GitHub](https://github.com/shivamxverma/yuvro) | [Live](https://drive.google.com/file/d/1Tb_NXvNCp8AcG48K_PUl4GhvSY1ZqiAY/view?usp=sharing) | *Replit (Web IDE), Python, FastAPI, PostgreSQL, Kubernetes, AWS S3, WebSockets*
- **Content-Addressed Storage:** Stored every file once by its content hash, deduplicating identical files across projects, with a scheduled garbage collector that deletes unreferenced files.
- **Per-Project Containers on Kubernetes:** Ran each project in its own on-demand Kubernetes container with a live WebSocket terminal, file editor, app preview and database browser, keeping user code off the main servers.

## Skills

**Languages:** Python, TypeScript, SQL
**Backend:** FastAPI, Node.js, Express.js, Celery, BullMQ, asyncio, REST APIs, WebSockets, JWT/OAuth
**Databases:** PostgreSQL, MongoDB, Redis, Pinecone
**Cloud & DevOps:** Docker, Kubernetes, AWS S3, Cloudflare R2
**AI:** RAG, Vector Search, Azure OpenAI, MCP
**Frontend & Tools:** React, Next.js, Git, Turborepo

## Education

### Indian Institute of Information Technology Nagpur @ Nov 2022 – May 2026
*B.Tech in Computer Science and Engineering* @ *Nagpur, Maharashtra*

## Achievements

- **[LeetCode](https://leetcode.com/u/MahavirCoder/):** Top 5% globally with a **1800+** contest rating and **800+** problems solved.
- **[CodeChef](https://www.codechef.com/users/mahavir99):** **3-star** coder with a 1700+ rating.
