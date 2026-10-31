# ZeroGrunt AI — outreach (2026-10-21, drafted, not sent)

Both founders asked for an email with "something you're proud of building". Ravi: "No LinkedIn
DMs, please." So: one email to Saurav (CTO, the engineer builds with him), Ravi on CC. Gmail
draft created with resume.pdf attached. Prior contact: none (Gmail search "zerogrunt" empty).

To: saurav@zerogrunt.ai
Cc: ravi@zerogrunt.ai
Subject: Founding engineer: the eval harness I'm proudest of
Attach: applications/zerogrunt-ai/resume.pdf (already attached in the Gmail draft)

> Hi Saurav,
>
> Your fourth question, how you measure whether the agent is actually getting better, is the one I've spent the most time on.
>
> The thing I'm proudest of building is the eval harness for DeepDoc, my RAG app over PDFs. It has 36 cases, 6 of them multi-turn, including Hinglish and prompt-injection cases. It replays retrieval sweeps across 100+ configurations, A/B tests prompts, and tells me whether a bad answer failed at indexing, retrieval or generation. It caught a metadata bug that was blanking every retrieved chunk.
>
> Right now I'm a full-stack intern at poiro.com, where I built the node and group system for an AI workflow builder: each workflow is a DAG of generation steps with typed ports, and groups run as sub-workflows. Before that I built the backend for an AI interview platform at klimb.io that hundreds of candidates went through.
>
> On your second question, I'm curious: when a step fails after an ERP write has already gone through, do you replay from a checkpoint or make every write idempotent so the run can retry?
>
> I can work from Bengaluru and join immediately. Resume attached.
>
> Shivam
> shivamworks.dev | github.com/shivamxverma

(~190 words: longer than a cold DM on purpose, because they asked for a story. No em dashes.)

## Fallback
Vraj Talati (Founding PM, 1st-degree, 450 mutuals). If no reply in a week, a short note to Vraj
saying you emailed Saurav about the founding engineer role.

## Reply — 2026-10-25 (to Saurav's 2026-10-22 questions)

Saurav replied 2026-10-22 15:47 IST: "yours stood out enough that I want to take it forward",
asked for (1) current comp + expectation, (2) start date, (3) a real example of using Claude Code /
Cursor / Codex, "Please don't make this up". Unanswered for 3 days when found.

Gmail draft r-2086528391198192786 on the thread (to Saurav, cc Ravi). Q3 is a placeholder: no
AI-coding-tool story exists in facts.yaml or stories.md, so Shivam writes it himself. Add the
story to profile/stories.md afterwards.

Also corrects two things the first email got wrong against today's facts.yaml: "join
immediately" (now 23 Nov) and the klimb.io AI interview platform line (never_claim since
2026-10-23).
