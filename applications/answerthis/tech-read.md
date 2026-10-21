# AnswerThis — tech read (2026-10-21)

Cluster note: `profile/domains/llm-in-production.md` (problems 1, 2, 3, 7 apply). Probe:
`stack-probe.json`.

## 1. The system, as far as it is visible
- [fact] Marketing site on nginx (answerthis.io); `app.` and `staging.` behind Cloudflare serving
  from S3-compatible object storage (`x-amz-request-id` with an `nyc3` region suffix). stack-probe.
- [inference] That `nyc3` suffix is DigitalOcean Spaces' naming, not AWS S3, so the app front
  end is likely a static build on DO Spaces behind Cloudflare. Verify before saying it.
- [fact] `api.answerthis.io/api/health` returns `{"service":"main_api","database":"healthy"}` with
  a Python `isoformat()` timestamp. [inference] Python API (the JD says FastAPI) with one primary DB.
- [fact] JD stack: Next.js + React + Tailwind, Python/FastAPI, Postgres, RAG over a vector DB
  (FAISS/Weaviate/Pinecone named), Docker, CI/CD. YC job page.
- [fact] Answers search "multiple academic databases" and cite line by line; Zotero/Mendeley
  integrations; exports keep citations and equations. YC page.

## 2. What they are worried about right now
Six people, >$1M ARR and a first India engineer hire: the bottleneck is shipping speed across
the whole stack. Ayush's posts are about research rigour (duplicate study reports), so answer
trust is the product's real currency.

## 3. The problems this shape forces
1. **Citation faithfulness is an eval problem, not a prompt problem** (cluster #1). "Line-by-line
   citations" are only valuable if each cited line supports the claim, and that can only be held
   steady with a golden set re-run on every change.
2. **Duplicate evidence across sources.** Searching several academic databases returns the same
   paper (preprint + journal version) and several papers on the same trial. Without dedup at the
   paper and study level, the answer over-counts evidence, the exact issue in Ayush's post.
3. **Cost and latency per query** (cluster #2, #3): multi-database search + reranking + a long
   synthesis per question, at 200k+ users on a $1M ARR budget.

## 4. The seam Shivam has already touched
**DeepDoc's 36-case eval harness** (6 multi-turn, incl. Hinglish and prompt-injection cases) that
replays retrieval sweeps, A/B tests prompts and separates indexing, retrieval and generation
failures, plus ranked, **deduplicated** context packed into a token budget. That is problem 1 and
a slice of problem 2 on a personal PDF app. Honest distance: **adjacent, not the same**: one
user's PDFs, not academic databases; no citation-network work.

## 5. Two questions only an internals reader would ask
1. "When two databases return the same paper (say the arXiv preprint and the journal version),
   where do you merge them: before reranking, or after the answer is drafted?"
   - If **before**: ask what key they merge on (DOI, title fingerprint, or both).
   - If **after**: ask whether that's why a citation can sometimes point at the preprint.
   - One concept: **DOI** (the stable ID most journal papers carry; preprints often lack one).
2. "How do you check a line-by-line citation actually supports its sentence: a fixed eval set you
   re-run, or spot checks?"
   - If **eval set**: ask how it's labelled (researchers, or a model as judge).
   - If **spot checks**: that's the opening for the week-one eval idea; don't pitch it in the reply,
     just note it.

## 6. Do not say
- "You're on DigitalOcean" or "your backend is FastAPI" as facts. Both are inferences.
- Any user, revenue or query number beyond the YC page's own, and not the 200k vs 250k mismatch.
- "I've built citation tooling" / "I know Tailwind" / "academic workflows". Not in facts.yaml.
- That DeepDoc has users or accuracy gains. facts.yaml: none exist.
