# Domain notes — the amortised half of technical depth

**Why this directory exists.** Showing a startup you understand their system is the highest-yield
thing an application can do and the thing that scales worst, because the obvious way to do it is
to study each company. That caps Shivam at one or two applications a week.

The way out is that the work splits cleanly in two, and only one half is per-company:

| | Per company | Written once |
|---|---|---|
| What | *their* stack, their incidents, their docs | the hard problems that any company of this shape has |
| Cost | ~30 min, mostly scripted (`/tech-read`) | ~1 hour, once, reused forever |
| Lives in | `applications/{company}/tech-read.md` | **here** |

So company one in a cluster costs half an hour and company seven costs ten minutes, because by
then the only new parts are their specific architecture and which of the known problems it makes
acute.

## The format

One file per cluster, `{cluster}.md`, and it holds exactly four things:

1. **The shape** — what a company in this cluster looks like architecturally, in five lines. The
   pieces that are always there regardless of vendor choice.
2. **The hard problems** — six to ten, each in two or three sentences: what it is, why it is
   unavoidable given the shape, and the symptom that shows it is biting. These are the source of
   `tech-read.md` section 3, and they are why a question can be asked without studying anything.
3. **The standard trade-offs** — the forks every company here has to take, and what each side
   costs. A trade-off is what lets Shivam ask *which* way they went instead of guessing.
4. **Where Shivam's real work touches this** — mapped to `profile/facts.yaml` entries, with the
   number and the honest distance. This is the source of `tech-read.md` section 4, and it is the
   part that keeps a seam from being stretched: if the closest thing in this section is
   "adjacent, not the same", then that is what the application says.

## Rules

- **No invented numbers.** A domain note is allowed to state engineering facts about a *class* of
  system. It is not allowed to attribute a number to a company, or to Shivam, that is not in
  `profile/facts.yaml` or a cited source.
- **Problems, not tutorials.** This is not `learn-before-build`. A note that explains how to
  implement something has drifted; the useful content is what goes wrong and what it costs.
- **Update it from outcomes.** When an interview or a founder reply shows one of these problems
  was the real one (or that a listed problem is not actually a problem in practice), edit the
  note. `/interview-debrief` and `/outcome` should both write back here.
- Every note stays under about 150 lines. If it is longer, it is two clusters.

## Clusters

| File | Covers | Pipeline companies |
|---|---|---|
| `llm-in-production.md` | LLM/agent systems doing real work for users | the largest cluster by far |
| `distributed-sql-engine.md` | companies whose product is the database engine (HTAP, columnar, compiled queries) | SingleStore |

Write a new note the first time a cluster shows up twice. Likely next, based on the lead pile:
multi-tenant data platforms, crypto/chain infra, devtools and CI, real-time collaboration,
payments and ledgers.
