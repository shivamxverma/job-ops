---
name: outreach
description: Draft founder cold emails, hiring-manager emails, X DMs, referral asks, and HN "who wants to be hired" posts for a specific company, in Shivam's voice, using the researched dossier. Use after company-research, never before.
---

# Outreach

Inputs: `applications/{company}/dossier.md`, `profile/voice.md`, `profile/stories.md`,
`profile/learnings.md` (check "what converts" before picking angle), templates below. Output: drafts in `applications/{company}/outreach.md`. **Drafts only —
Shivam sends everything himself after edit.**

## Hard rules
- 50–125 words. No resume attached first-contact — one live link (shivamworks.dev or the most
  relevant project URL).
- Must contain: one specific thing noticed about THEIR product (from dossier), one checkable
  proof point with a number (grant/press/users), one explicit small ask (15 min).
- Mirror exactly ONE company-specific phrase from the dossier's vocabulary section. Never
  generic buzzwords.
- Founder-mode framing: a specific initiative or observation, not title/years/enthusiasm.
- If the dossier can't fill a bracket with something true and specific, STOP and say the
  research isn't done — a generic send burns the company forever.
- One follow-up after 5–7 days is normal; draft it at the same time. Max 2–3 total touches.

## Voice check (every draft, before you save it)
Everything here is text Shivam will paste and send, so `profile/voice.md` is binding — most of
all rule 7: **no em dashes (—) anywhere.** Not in the subject, not in the body, not in the
signoff. Rewrite around them (two sentences, a comma, or parentheses). The templates below are
written em-dash-free on purpose; keep them that way when you fill them. It should read like
Shivam typed it fast, not like an assistant polished it.

## Templates (fill, then rewrite in Shivam's voice)
**Founder cold email** — Subject: `{specific thing noticed}, a question`
> Hi {Name}, saw you just shipped {X}. I built something similar in {project} and hit
> {specific non-obvious problem}, solved it by {one sentence}. I've been {relevant proof, e.g.
> building the SHA-256 asset dedup layer at poiro.com; CodeSM sandboxes 6 languages in Docker}.
> Would 15 minutes be useful before you fill your next engineering seat? Happy to send code
> either way.
> Shivam
> shivamworks.dev

**Hiring-manager email**: common ground → proof point with number → one ask. 50–125 words.
**Informational chat** (no opening yet): genuine technical question about their team's work.
**Value Validation pitch** (top 3–5 targets only): short concrete writeup of how he'd close a
real gap at their company; the ask is a side effect. Highest effort, use sparingly.
**HN "Who wants to be hired"**: `Location / Remote / Relocate / Technologies / Résumé / Email`,
opens with a quantified outcome not a title, portfolio link first, narrow named specialization
("full-stack + smart-contract engineer who ships production end-to-end"), posted within hours
of the thread going up on the 1st.

## Reply drafts (HN threads + email replies)
Whenever working a lead means **replying** rather than cold-opening — a founder answered
Shivam's email, someone responded to his HN "who wants to be hired" comment, an HN poster is
hiring and the move is to reply in-thread, a recruiter emailed back — draft the actual reply.
Don't just tell Shivam he should respond; write the exact text he can paste.

- Same voice rules (no em dashes, one checkable number/link, one small ask, 40–120 words).
- Quote or name the specific thing they said so the reply reads as a real answer, not a
  template. Match their register: an HN comment reply is shorter and more casual than an email.
- Save it to `applications/{company}/outreach.md` under a dated `## Reply — {context}` heading
  (or `inbox/replies.md` if there's no company folder yet), so nothing is auto-sent.
- **Then, at the very end of your turn, tell Shivam plainly:** what it's replying to, where the
  draft is, and that it's ready for him to review and send/post himself. This is a copilot —
  the draft waits for his hand on the send button.

## Gmail drafts (after saving outreach.md)
When the recipient's email address is known (founder email, HM email, follow-up, reply), also
create the message as a **draft in Shivam's Gmail** with the Gmail MCP tool
`mcp__claude_ai_Gmail__create_draft` (load via ToolSearch if deferred): recipient, subject,
and body filled, body identical to what's in outreach.md after the voice check (so: no em
dashes, 50–125 words). For a reply, fetch the thread with `search_threads`/`get_thread` first
and create the draft on that thread so it nests correctly.
- outreach.md stays the source of truth; the Gmail draft is a convenience copy. If Shivam edits
  one, he edits in Gmail (that's what gets sent).
- **Never send. Never touch existing mail.** Drafting only; the send button is his.
- End of turn: tell Shivam the draft is sitting in his Gmail drafts folder, who it's to, and
  what it says in one line. No email address available (form-only apply, HN thread, X DM) →
  skip this section; there's nothing to draft in Gmail.

## Channel picks per lead grade
A-grade: founder email + form submission same day + informational chat with a team engineer.
B-grade: form + hiring-manager email. C-grade: **don't work it here** — the C pile runs through
`/autoapply`, which writes its own short email and sends it itself. This skill drafts; that one
acts. Only reason to draft a C email here is if Shivam asks for one specifically.
