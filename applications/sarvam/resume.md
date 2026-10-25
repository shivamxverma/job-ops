# Shivam Kumar Verma

> +91 91356 68614 | shivam0xverma@gmail.com | [LinkedIn](https://www.linkedin.com/in/shivamv99/) | [GitHub](https://github.com/shivamxverma) | [Portfolio](https://www.shivamworks.dev/)

## Experience

### poiro.com @ Jul 2026 – Present
*Fullstack Developer Intern* @ *Python, FastAPI, MongoDB, Redis, Celery, Next.js, TypeScript, Cloudflare R2*
- **AI Workflow Engine:** Built the node and group system behind the AI workflow builder: each workflow is a DAG of generation steps passing typed outputs to the next, and groups run nested steps as one sub-workflow.
- **Fail-Closed Provider Layer:** Integrated Pixabay, Unsplash and Pinterest behind one adapter contract with org-scoped Redis caching, capping paid calls at **500 per org per day** and **5,000 globally**, counted only on cache misses.
- **Shared Asset Service:** Designed the org-scoped MongoDB models and FastAPI backend for one asset service shared by **3 apps**, with AI provenance on every asset and pHash/dHash duplicate blocking at upload.

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
