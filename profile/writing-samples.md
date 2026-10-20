# Writing samples — Shivam's own words

Source: `founder-outreach-ai/outreach/examples.md` (DMs he wrote as his reference set, 2026).
There is no longer-form corpus yet (no posts, blog, or long answers). **Add real samples here
as he writes them**: sent emails, form answers, LinkedIn posts. Every addition sharpens the
voice match.

## Distilled patterns (what makes it sound like him)

1. **Their product first.** Every message opens on what *they* are building, not on him.
2. **Name the bottleneck before the pitch.** "One challenge you'll likely face as you scale is
   main thread timeouts when handling heavy, long-running render jobs."
3. **One project, one mechanism.** He picks the single project that matches and says how it
   solved the problem, in one sentence.
4. **A soft, specific ask.** "I think I could help accelerate your job queue architecture. Open
   to a quick chat?" He names the area he'd help with.
5. **Signs "- Shivam".** Short, no title, no links block.

## Samples

> Hey Alex,
>
> I noticed you're building an AI video generation platform. One challenge you'll likely face
> as you scale is main thread timeouts when handling heavy, long-running render jobs.
>
> I recently built a sandboxed execution engine (CodeSM) where I solved a similar async
> processing problem using BullMQ, Redis, and persistent Docker containers to keep worker
> throughput high.
>
> I think I could help accelerate your job queue architecture. Open to a quick chat?
>
> - Shivam

> Hey Sarah,
>
> I noticed you're building a browser-based developer workspace. One challenge you'll likely
> face as you scale is provisioning isolated runtimes cleanly while still forwarding raw
> terminal/PTY streams over WebSockets with low latency.
>
> I recently built Yuvro Web IDE, where I split auth/metadata, orchestration, and runtime
> concerns across FastAPI services, provisioned workspace infrastructure through Kubernetes,
> and exposed shell access through a dedicated PTY runner agent.
>
> I think I could help accelerate your workspace orchestration and sandbox architecture. Open
> to a quick chat?
>
> - Shivam

> Hey David,
>
> I noticed you're rolling out new AI features for your CRM. One challenge you'll likely face
> is migrating access control to enforce usage-based limits without breaking existing tenant
> flows.
>
> I recently tackled this at klimb.io, migrating platform access to a PostgreSQL-backed credit
> system via middleware-enforced tracking across 6+ AI features.
>
> I think I could help streamline your monetization architecture. Open to a quick chat?
>
> - Shivam
