# Shivam Kumar Verma

> +91 91356 68614 | shivam0xverma@gmail.com | [LinkedIn](https://www.linkedin.com/in/shivamv99/) | [GitHub](https://github.com/shivamxverma) | [Portfolio](https://www.shivamworks.dev/)

## Experience

### poiro.com @ Jul 2026 – Present
*Fullstack Developer Intern* @ *Python, FastAPI, MongoDB, Redis, Celery, Next.js, TypeScript, Cloudflare R2, Turborepo*
- **DAG Workflow Engine:** Built the node and group system behind the AI workflow builder: each workflow is a DAG of generation steps passing typed outputs to the next, and groups bundle steps into reusable sub-workflows that run as one unit.
- **Digital Asset Service:** Designed the data model and APIs for one shared asset service that replaced separate storage in **3 apps**, and migrated all existing assets into it; added folders, reusable prompt Elements, and upload-time duplicate blocking with pHash and dHash image similarity.
- **Provider Adapter Layer:** Integrated Pixabay, Unsplash, and Pinterest behind one common adapter interface, with per-org Redis caching to avoid repeat API calls and spend caps to stop runaway provider costs.

### klimb.io @ Nov 2025 – May 2026
*Full Stack Developer Intern* @ *TypeScript, Express.js, PostgreSQL, Redis, AWS, OpenAI Realtime*
- **Usage-Based Billing Ledger:** Replaced on/off feature flags with a credit ledger that meters each customer's usage of **6+ AI features**, which made usage-based pricing possible.
- **AI Interview Platform:** Built the backend for a **3-stage** AI interview platform with automated proctoring; its live voice round on OpenAI Realtime asks questions drawn from the candidate's resume and scores the transcript.

## Projects

### Yuvro | [GitHub](https://github.com/shivamxverma/yuvro) | [Demo](https://drive.google.com/file/d/1Tb_NXvNCp8AcG48K_PUl4GhvSY1ZqiAY/view?usp=sharing) | *Replit (Web IDE), Python, FastAPI, PostgreSQL, Kubernetes, AWS S3, WebSockets*
- **Content-Addressed Storage:** Stores each file once by its content hash, so identical files across projects are never duplicated, with a scheduled garbage collector that deletes files no project references.
- **Per-Project Containers on Kubernetes:** Starts an isolated container for each project on demand, with a live WebSocket terminal, file editor, app preview, and database browser, so user code never runs on the main servers.

### CodeSM | [GitHub](https://github.com/shivamxverma/CodeSM) | [Live](https://code-sm.vercel.app/) | *Code Platform, Node.js, Express.js, BullMQ, Redis, PostgreSQL/Drizzle, Docker, AWS S3*
- **Sandboxed Code Execution:** Runs every submission in a locked-down container with no network, a read-only filesystem, and CPU, memory, and time limits, so infinite loops, fork bombs, and network calls stay contained.
- **Async Grading Queue:** Moved grading onto BullMQ workers so the API responds instantly; each submission reuses one container across its test cases and stops at the first failed test.

### DeepDoc | [GitHub](https://github.com/shivamxverma/DeepDoc) | *RAG, Next.js, TypeScript, Azure OpenAI, Pinecone, PostgreSQL/Drizzle, Vercel Blob*
- **RAG Pipeline:** Splits each PDF into section-aware chunks by topic, searches only that document's vectors, and rewrites follow-up questions using chat history so they retrieve the right sections.
- **Retrieval Ranking and Tuning:** Ranks matches by score, drops weak and duplicate chunks, and packs the best into a token budget; tuned these settings across **100+ configurations** and fixed a bug that returned empty results for every query.

## Skills

**Languages:** C++, Python, TypeScript, SQL
**Backend:** FastAPI, Node.js, Express.js, REST APIs, WebSockets, Celery, BullMQ
**Data & Infrastructure:** PostgreSQL, MongoDB, Redis, Pinecone, Docker, Kubernetes, AWS (EC2, S3)
**AI Engineering:** RAG, embeddings and vector search, query rewriting, LLM evaluation
**Frontend & Tooling:** React, Next.js, Git, Linux, CI pipelines

## Education

### Indian Institute of Information Technology Nagpur @ Nov 2022 – May 2026
*B.Tech in Computer Science and Engineering* @ *Nagpur, Maharashtra*

## Achievements

- **Competitive Programming:** **Top 5% globally** on [LeetCode](https://leetcode.com/u/MahavirCoder/) (**1800+ rating**, 800+ problems solved) · **3-star** on [CodeChef](https://www.codechef.com/users/mahavir99) (1700+) · Pupil on Codeforces.
