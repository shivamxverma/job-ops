# Kontxt.dev — dossier (2026-10-27)

Posting: https://jobs.weekday.works/software-engineer-at-kontxt-dev-wkdybri15h (Weekday, date not
shown). SDE (Full Stack + AI), "first Founding Engineer", Remote India, 0-3 yrs, full-time.
"Competitive salary and meaningful equity", no number.

## Read this first: is it a real job?
**Risk: L2.** Every person on the LinkedIn company page (linkedin.com/company/kontxtai/people,
checked 2026-10-27) is a current full-time SDE at **DViO Digital** (Pune MarTech): Aryan Kumar,
Abhijeet Aayush, Kailash Bisht, Aman Singh. LinkedIn says 6 employees, founded 2026, Bangalore,
1,980 followers. No founder is named anywhere, no funding found, product is waitlist-only.
GUESS: a side project by DViO engineers. "First engineering hire" may mean the first person paid
to do it full-time, or may mean equity-heavy. **The first message has to find out whether it's a
salaried full-time role before Shivam spends more than an hour.** Expected CTC per facts: 10-18 LPA.

## Product
"Nothing starts from zero." A prompt-orchestration layer: listens to GitHub, Sentry/Datadog,
Jira/Linear, Slack, Grafana/logs, links an error to the change and the ticket, and emits one
scoped prompt for Cursor/Claude/ChatGPT/Copilot/Codex/Ollama (kontxt.co.in). Live sources:
codebase/git and error monitoring; issue trackers, chat, metrics, CI are "Soon". Claims 70%
fewer tokens, 10x faster context gathering (their scenarios, not customers). FAQ: private
development, free early access through a waitlist.

## People
- **Aman Singh**, SWE @ DViO ("AI agent orchestration for Martech analytics; FastAPI, Bedrock
  AgentCore, LangChain, Temporal"). **Owns the Kontxt-dev GitHub org** (github.com/Kontxt-dev,
  created 2026-07-19, 0 public repos, only member SSShogunn = Aman). His side repo `continuum`
  ("persistent, personal memory for AI agents, an MCP server") echoes the company tagline
  "the continuum beneath every intelligence". Most likely the technical founder (GUESS).
  linkedin.com/in/aman-singh91 (3rd°, card shows **Message**, so likely open profile).
  github.com/SSShogunn, portfolio.sshogunn.org.
- **Aryan Kumar**, SDE II @ DViO, ex-ShortLoop (YC W23), "LeetCode Guardian". Wrote the
  2026-10-16 launch post ("That's the problem we're working on at Kontxt").
  linkedin.com/in/aryankumar123, 2nd°, 11 mutuals, Connect. Common ground: competitive programming.
- Abhijeet Aayush (DViO, AWS serverless), Kailash Bisht (SDE II @ DViO).
- Email: kontxt.co.in mail is Google Workspace (MX smtp.google.com). No address published. Never guess one.

## Their vocabulary
- "Nothing starts from zero." (site, LinkedIn)
- "Retrieves for coverage, not just similarity" (company post, 2026-08-24)
- "Abstains when the evidence isn't good enough" / "fail closed" (same post)
- "briefing it like a new hire. Every. Single. Chat." (company post, 2026-08-27)
- "Set boundaries: scope limits, no over-engineering" (site)

## Architecture, as far as visible
Stack from the JD: FastAPI, Next.js/React, PostgreSQL, Qdrant, AWS Lambda + Bedrock, Docker,
GitHub Actions, MCP. Site is Next.js (`/_next/image`). The 2026-08-24 post describes the
retrieval core: break a question into obligations, retrieve for coverage, pack evidence without
starving any obligation, extract claims and verify against line-level evidence, abstain otherwise.

## Week one
1. An eval set for the abstain decision: cases where the evidence is sufficient and cases where
   it is missing, scored separately, so "fail closed" has a false-abstain rate and a
   false-answer rate instead of a feeling. Same move as DeepDoc's 36-case harness.
2. Sentry-to-commit linking as a deterministic step before any LLM call (stack frame file + line
   → `git blame` → PR), so the prompt carries a verified link, not a guessed one.

## Framing
**ai_framing**: DeepDoc (coverage/packing/eval harness), Hireflow (validator rejects any skill
not in the source profile, i.e. fail closed against evidence), poiro fail-closed spend caps,
poiro DAG workflow engine. FastAPI + Next.js + Postgres all real.

## Gaps
Qdrant (Pinecone instead), AWS Lambda/Bedrock (EC2/S3 only, Azure OpenAI instead), Jira/Sentry
APIs never integrated. MCP: none in facts.yaml.
