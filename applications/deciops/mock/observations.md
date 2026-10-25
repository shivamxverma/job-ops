# DeciOps — interview observations

## Repeat offenders (grows across sessions)
1. **Numbers he can't defend.** Said a CTC / conversion figure to a founder who had already
   checked the market. One indefensible number cost the whole negotiation. (2026-10-23)
2. **Names, not mechanisms.** Projects, databases and LangChain were each named, never explained
   one level down, with no number attached. (2026-10-23)
3. **Describes the product, not his part.** "What did you do" got what poiro does. (2026-10-23)
4. **Availability story changes between channels.** Email: join immediately, 0 notice, in
   Bengaluru. Call: internship runs to 22 Nov. (2026-10-23)

## 2026-10-23 — REAL, 1st round, founder Laxmipat Malu (recall only, no transcript)
**Verdict: ~35%, soft fail.** The one DeciOps-specific answer (agents) was decent; everything
else was named, not explained, and the comp claims collapsed under the founder's own research,
which gave him the lever to go from 6-8 LPA to a 5 LPA cap. Closing (Shivam's recall): "you have surface level knowledge, do not know anything in depth, so I will give 5 LPA, not more, because I have to guide you for 3-6 months, then I will increase your compensation." = a conditional offer, not a no.

| # | Question | Score | Worst line (his recall) | Better answer he had |
|---|---|---|---|---|
| 1 | Tell me about yourself | 2/5 | "Overall, I know frontend, backend, and AI systems." | The prepared intro: credit ledger across 6+ AI features, 36-case eval harness, 500/org/day caps. Also "codeSM, which is a lead cultivation platform" is wrong: CodeSM is a sandboxed code runner for 6 languages. |
| 2 | Company, founders, comp | 1/5 | "they will convert me, and then they will give me 10 LPA CTC" | Only state what is in writing: current stipend as it is, expectation as a range, "flexible for the right founding seat". |
| 3 | Your work at the company | 2/5 | "we can create multiple nodes, and based on those nodes, we can directly create the video" | His part: typed ports, execution order, groups as sub-workflows, PR #697; plus the fail-closed vendor caps. |
| 4 | What is an AI agent, where to use | 3.5/5 | "An AI agent is an access to tools." | Definition: an LLM that picks the next action, calls a tool, reads the result, loops to the goal. Warehouse example was right and on-target. Jira example auto-merges code on a confidence score with no tests or review: add CI + human review for anything risky. |
| 5 | What is LangChain | 1/5 | "It provides multiple tools." | Framework for LLM apps: prompt templates, model wrappers, loaders/splitters, retrievers over vector stores, tool calling/agents, LangGraph for stateful loops. "I built DeepDoc without it, on Azure OpenAI + Pinecone directly, so I owned each stage, which is how the eval caught the pageNumber bug." |
| 6 | Databases, how many types, joins | 1.5/5 | "There are two databases: MongoDB, Postgres" | Those are products, not types. Types: relational, document, key-value, vector, graph, time-series, search. He has used four: Postgres (klimb ledger), MongoDB (poiro), Redis (caps/cache), Pinecone (DeepDoc). Joins: rows in normalised tables matched on keys; Mongo's answer is embedding or $lookup, and he replaced per-level folder queries with one $graphLookup at poiro. |
| 7 | Expected comp | n/a | ended at 5 LPA cap | Negotiation was lost at #2, not here. |

**Strength (real):** tied the agent answer to DeciOps's own warehouse case and reached the
confidence-threshold idea unprompted.

**Open, ask Shivam:** closing line verbatim; true stipend; whether 22 Nov is a real end date
(facts.yaml says 0 notice); whether 5 LPA was an offer or a stated ceiling; which misses were
gap vs decayed.
