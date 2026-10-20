# Shivam Kumar Verma

> +91 91356 68614 | shivam0xverma@gmail.com | [LinkedIn](https://www.linkedin.com/in/shivamv99/) | [GitHub](https://github.com/shivamxverma) | [Portfolio](https://www.shivamworks.dev/)

## Education

### Indian Institute of Information Technology Nagpur @ Nov 2022 – May 2026
*B.Tech in Computer Science and Engineering* @ *Nagpur, Maharashtra*

## Experience

### poiro.com @ Jul 2026 – Present
*Fullstack Developer Intern* @ *Python, FastAPI, MongoDB, Redis, Celery, TypeScript*
- **Workflow Execution Engine:** Implemented the node and group system behind an AI workflow builder: typed ports between generation steps, **topological execution order** with cycle rejection, and nested groups that run as one sub-workflow.
- **Query Path:** Replaced per-level folder traversal with a single MongoDB **$graphLookup** query and cut folder-edit database round-trips from **3 to 1** in a shared asset service used by **3 apps** (**32** FastAPI routes).
- **Cost Controls:** Engineered fail-closed spend caps (**500** calls/org/day, **5,000** globally) and per-org Redis caching for Pixabay, Unsplash and Pinterest behind one adapter interface.

### klimb.io @ Nov 2025 – May 2026
*Full Stack Developer Intern* @ *TypeScript, Node.js, PostgreSQL, Redis, AWS*
- **Usage Ledger:** Designed a PostgreSQL credit ledger that meters usage of **6+ AI features**, replacing on/off feature flags and making usage-based billing possible.
- **Concurrent Sessions:** Developed the backend for a **3-stage** AI interview platform with automated proctoring and per-candidate data isolation across concurrent live sessions, including a live voice round on OpenAI Realtime.

## Projects

### CodeSM | [GitHub](https://github.com/shivamxverma/CodeSM) | [Live](https://code-sm.vercel.app/) | *C++, Node.js, BullMQ, Redis, Docker, PostgreSQL*
- **Sandboxed Judge:** Architected a runner that compiles and executes untrusted **C, C++, Java, Go, Python and JavaScript** in Docker with no network, a read-only root filesystem, and **256 MB** memory, **32**-process and **0.5**-CPU limits.
- **Async Grading:** Shipped grading on BullMQ + Redis workers so the API returns immediately; one container is reused across a submission's test cases via docker exec, and grading stops at the first failed test.

### Yuvro | [GitHub](https://github.com/shivamxverma/yuvro) | [Demo](https://drive.google.com/file/d/1Tb_NXvNCp8AcG48K_PUl4GhvSY1ZqiAY/view?usp=sharing) | *Python, FastAPI, Kubernetes, PostgreSQL, WebSockets*
- **Per-Project Runtimes:** Built an orchestrator that provisions a Kubernetes deployment, service and ingress per project, with a runner that streams PTY sessions over WebSockets so user code never runs on the API servers.
### DeepDoc | [GitHub](https://github.com/shivamxverma/DeepDoc) | *TypeScript, Next.js, Pinecone, PostgreSQL, Azure OpenAI*
- **Vector Retrieval:** Created section-aware chunking and document-scoped vector search on Pinecone, then tuned ranking across **100+** configurations with a **36-case** evaluation harness and fixed a bug that returned empty results for every query.

## Technical Skills

**Languages & Automation:** C++, Python, TypeScript, SQL, JavaScript, Data Structures & Algorithms
**Infrastructure & Runtimes:** Linux, Docker, Kubernetes, BullMQ, Celery, AWS (EC2, S3)
**Backend & APIs:** Node.js, FastAPI, Express.js, REST APIs, WebSockets
**Data Systems:** PostgreSQL, MongoDB, Redis, Pinecone (vector search), Drizzle, Prisma

## Achievements

- **Competitive Programming:** **Top 5% globally** on [LeetCode](https://leetcode.com/u/MahavirCoder/) (**1800+ rating**, **800+** problems solved) · **3-star** on [CodeChef](https://www.codechef.com/users/mahavir99) (1700+) · Pupil on Codeforces.
- **Hackathon:** Won **3rd place** at IIIT Nagpur Tantrafiesta 2024 by building and presenting a working product.
