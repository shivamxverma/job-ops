# Shivam Kumar Verma

> +91 91356 68614 | shivam0xverma@gmail.com | [LinkedIn](https://www.linkedin.com/in/shivamv99/) | [GitHub](https://github.com/shivamxverma) | [Portfolio](https://www.shivamworks.dev/)

## Experience

### poiro.com @ Jul 2026 – Present
*Fullstack Developer Intern* @ *Python, FastAPI, MongoDB, Redis, Celery, asyncio, Next.js, TypeScript, Cloudflare R2*
- **AI Generation Asset Pipeline:** Built the library every AI generation files into, shared by **3 web apps**: one function copies output out of expiring provider URLs, stores each file once by content key, keeps model, prompt and references, and retries in the background so filing never fails a job.
- **Agent Access over MCP:** Built the auth that lets outside AI agents run apps over MCP: per-connection grants with **3 scopes** and per-day and per-run credit caps, RS256 tokens verified through JWKS, and rotating refresh tokens that revoke the grant on reuse.
- **Stock Provider Adapter:** Integrated Unsplash, Pixabay and Pinterest behind one adapter that checks a spend limit before every paid call and caches searches in Redis per org.

### klimb.io @ Nov 2025 – May 2026
*Full Stack Developer Intern* @ *TypeScript, Express.js, PostgreSQL, Redis, AWS*
- **AI Usage Ledger:** Architected a PostgreSQL credit ledger enforced in middleware that records every use of **6+ AI features** per customer, replacing on/off feature flags and making usage-based billing possible.

## Projects

### DeepDoc | [GitHub](https://github.com/shivamxverma/DeepDoc) | *RAG, Next.js, TypeScript, Azure OpenAI, Pinecone, PostgreSQL*
- **RAG Pipeline:** Splits each PDF into section-aware chunks, searches only that document's vectors, rewrites follow-up questions from chat history, and packs deduplicated context into a token budget.
- **Evaluation Harness:** Created a **36-case** harness (multi-turn, Hinglish, prompt injection) that separates indexing, retrieval and generation failures; it traced empty answers to a field ingestion never wrote, after prompt changes had failed.

### Storix | [GitHub](https://github.com/shivamxverma/Storix) | [Live](https://async-doc.vercel.app) | *FastAPI, Celery, Redis, PostgreSQL, AWS S3*
- **Async Ingestion Pipeline:** Developed a PDF ingestion pipeline where FastAPI accepts the upload, **Celery** workers extract off the request path, and Redis pub/sub streams each stage's status to the client.

### CodeSM | [GitHub](https://github.com/shivamxverma/CodeSM) | [Live](https://code-sm.vercel.app/) | *Node.js, BullMQ, Redis, PostgreSQL, Docker*
- **Sandboxed Execution:** Implemented isolated grading for **6 languages** on BullMQ workers, with Docker limits of **256 MB**, **32 PIDs** and **0.5 CPU** per run and no network access.

## Skills

**AI Engineering:** RAG, embeddings and vector search, query rewriting, LLM evaluation, Azure OpenAI, Gemini
**Languages:** Python, TypeScript, SQL, C++
**Backend:** FastAPI, Node.js, Express.js, REST APIs, WebSockets, Celery, BullMQ
**Data & Infrastructure:** PostgreSQL, MongoDB, Redis, Pinecone, Docker, Kubernetes, AWS (EC2, S3)

## Education

### Indian Institute of Information Technology Nagpur @ Nov 2022 – May 2026
*B.Tech in Computer Science and Engineering* @ *Nagpur, Maharashtra*

## Achievements

- **Competitive Programming:** **Top 5% globally** on [LeetCode](https://leetcode.com/u/MahavirCoder/) (**1800+ rating**, 800+ problems solved) · **3-star** on [CodeChef](https://www.codechef.com/users/mahavir99) (1700+) · Pupil on Codeforces.
- **Hackathon:** **3rd place** at Tantrafiesta 2024, IIIT Nagpur.
