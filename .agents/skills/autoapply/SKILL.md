---
name: autoapply
description: Work the C-grade pile end to end without Shivam in the loop — pick the batch, find each company's real apply channel, tailor a cheap resume, then fill and submit the form and send the application email itself. The one lane in JobOps that acts rather than drafts. Use when Shivam says "run autoapply", "work the C leads", "apply to the C grades", "clear the C pile", or "batch apply".
---

# Autoapply — the C lane

Every other skill in this repo is a copilot: it drafts, Shivam sends. **This one is not.** It
exists because the C pile is the largest thing in the system that never gets worked — A and B
get the full pipeline, C is defined as "quiet-week filler" and there has never been a quiet
week, so ~350 leads have accumulated as arrows that were never shot. A C application sent at
70% quality beats a C application never sent at all, and the only way to send them is to stop
putting a human gate in front of each one.

**NOT YET AUTHORISED BY SHIVAM.** The 2026-08-19 authorisation was the previous owner's
(Harsh Kasana) and does not transfer. Until Shivam explicitly says yes in conversation, this
skill **drafts only: never submits a form, never sends an email, never sends a connection
request.** Everything it would have sent goes to `inbox/handoff.md` instead.

The original grant was for C grades only (2026-08-19). The authorisation is
narrow and the boundaries below are the whole point of the skill. When in doubt, hold, don't
send: this account is his real Gmail and his real LinkedIn.

## The autonomy table — read this before every batch

| Action | The lane | Why |
|---|---|---|
| Fill **and submit** a company's own form (Greenhouse, Lever, Ashby, Workable, join.com, Google Form, custom) | **does it** | Reversible-ish, low blast radius, no account needed |
| **Send** the application email, resume.pdf attached, to a **published** address | **does it** | The apply channel the company itself stated |
| **Send** a LinkedIn connection request **with no note** | **does it** | Shivam's call: a bare invite costs nothing if wrong |
| A LinkedIn DM, InMail, X DM, or any message to a named person | **drafts only** | His account, his voice, one wrong message to the wrong person is unrecoverable |
| The YC / Work-at-a-Startup apply button | **never** | Spends 1 of 5 per week. `c-queue` already holds these |
| Any form field carrying an anti-AI warning ("write this by hand", "no LLM") | **never fills it** | Standing rule since Kadoa/DualEntry. Hold the whole company |
| A field whose true answer is not in `profile/facts.yaml` | **never guesses** | Hold the company. A guessed fact is the one thing this pipeline must never emit |
| Creating an account, a password, a payment, a CAPTCHA, an OTP/phone check, an ID upload, a take-home or timed assessment | **never** | Hold, and say exactly what it needs |
| A **guessed** email address (`firstname@company.com`) | **never sends** | Only published addresses. Bounces burn the company forever |
| Anything graded A or B, or any company with a tracker row | **never touches** | Those get the real pipeline, by hand |

Two rules that override everything in the table: **one touch per company per batch** (a form
*or* an email *or* both, never two emails), and **stop the whole batch** on a bot wall, a Gmail
send error, or two consecutive browser failures. A stalled batch reported honestly is fine; a
batch that kept clicking through a wall is not.

## The five gates — run these IN ORDER, before any work, on every company

Measured on the first real run (2026-08-19): **six of the eight companies at the top of the C
pile failed one of these**, and only one application went out. That is the normal shape of this
lane, not a bad day. Most of the work here is triage, and a gate that fires is a success.

Each gate is a yes/no question with a written answer. If a gate fails, write the reason into
`inbox/handoff.md` and go to the next company. **Never argue past a gate.**

1. **Prior contact?** Search Gmail: `mcp__claude_ai_Gmail__search_threads` with
   `"{company} OR {domain} in:anywhere"`. Also look at `applications/{slug}/` on disk. **Any**
   hit, including a folder holding nothing but an old draft, is a stop. Gmail is the only store
   that records what actually went out, and on the first run it was the *only* thing that caught
   that Shivam had already emailed Strello Health 13 days earlier. `c-queue` holds these now, but
   check anyway: the queue reads files, Gmail reads reality.
2. **Posting still live?** Open the link. A 302 to a job board's homepage means the listing was
   pulled (Vidalytics). A careers page listing no roles means the seat may be gone (XenReality,
   sent anyway with "if it is still open" in the first line, which is the right hedge).
3. **A seat at his level?** Read the actual titles on their board, not the headline of the post.
   Langfuse's HN post said "Product Engineers & Backend Engineers"; the live board was **seven
   Senior roles**. Compound's careers page was three Head-of/CFO seats. All-senior or all-exec
   with ~1.5 years is a skip, and the Jito tracker row is what ignoring this costs.
4. **Reachable?** Re-check at the form, not just at the lead. A knockout question whose honest
   answer disqualifies him ("Do you have an EU work permit?" → No), on a **hybrid or on-site**
   role, at a company with **no sponsorship language anywhere**, is a stated wall: skip. Silence
   is still not a wall (`lib/reachability.mjs`), and India-based roles clear this outright,
   because `facts.yaml` states relocation anywhere in India with no conditions.
5. **A real channel, published by them?** Their own careers form, their own ATS board, or an
   address they published. **Verify an ATS board actually belongs to this company** —
   `jobs.ashbyhq.com/compound` is a live board for a wealth-advisory firm, not Compound Finance,
   and a name collision would have applied to the wrong company. No channel found → hold, and
   say what was tried. Never DM, never guess an address, never use a staffing intermediary's
   funnel when the company published its own address.

## 0. Preflight (once per run)

```
node scripts/c-queue.mjs --limit 8            # the batch, the held, the excluded
```

It reads `lib/state.mjs` and nothing else, so it can't disagree with the board. Then:

1. Print the batch to Shivam as a numbered manifest: company, role, link, one line of why.
2. **One gate, at the top, for the whole batch** — `AskUserQuestion`: run all N, drop some, or
   cancel. This is the only time the lane asks anything. Skip it if he invoked with `--go`.
3. Read `profile/learnings.md` § Constraints and § What converts before generating anything,
   same as every other generating skill.

Then work the batch company by company, to completion, without stopping to check in. Anything
that needs him accumulates in the handoff file (§5) and gets reported at the end.

**Signals:** `--signals` lists C-grade funding signals. Do not queue them. Measured 2026-08-19:
of 64 C signals, essentially all are EV manufacturers, housing finance, athleisure brands and
VC fund closes — no engineering seat, no fit. Triage them by hand with
`mark-processed.mjs "<name>" --signals --skip`, and only a signal that names a real software
company with a real engineering need gets promoted into the lead lane. **The lane never cold
emails a founder off a funding headline.**

## 1. Find the channel (the actual work)

Most C leads link to an X post, a LinkedIn company page or an HN comment, not a form. Budget
about 3 minutes per company to find the real apply route, in this order:

1. The posting itself, for a stated channel ("email jobs@…", "apply here").
2. `{domain}/careers`, `/jobs`, `/about`, and the footer.
3. `node scripts/stack-probe.mjs {domain} --slug {company}` — it reports the ATS it detects and
   the posting API, which is usually the fastest route to the real form.
4. Their ATS board directly: `jobs.ashbyhq.com/{co}`, `boards.greenhouse.io/{co}`,
   `jobs.lever.co/{co}`, `apply.workable.com/{co}`.

**No published channel found → hold it.** Do not DM, do not guess an address, do not apply
"via LinkedIn Easy Apply" at a company whose posting you never read. Write it into the handoff
with what you tried.

Also confirm, in one line each, before spending any more time: the role is still open, it's an
engineering seat, and reachability isn't `blocked` (`lib/reachability.mjs`'s rule: silence is
not a wall, a stated wall is). A C lead that fails any of these gets `--skip`, not an
application.

## 2. The cheap lane (about 12 minutes of work per company, not 90)

The C lane is defined by what it *skips*. Do not run `/company-research`, `/tech-read`,
`/job-script`, `/job-video`, or the tailor→ats-score loop. Instead:

- **Micro-dossier** — `applications/{company}/dossier.md`, six lines: what they sell, the stack
  (from stack-probe, with its attribution rules respected), the role's three loudest
  requirements, the honest gap, the one Shivam project that maps, the apply channel. That is
  enough to fill a form truthfully. It is not enough for a video or a cover letter, which is
  why the lane doesn't produce either.
- **Every claim traces to `profile/facts.yaml`, including the skills line.** This bites in a
  specific way: the JD names a technology, the lead note asserts he has it, an older resume in
  `applications/*` already lists it, and none of that is a source. **Docker** is the live
  example — it appears in shipped resumes and in nothing else, so it was cut from both the
  resume and the email mid-run rather than propagated. Copying a base resume copies its
  unsourced claims too. Grep `facts.yaml` for anything you are about to put in the skills line.
- **Resume** — start from the nearest existing tailored resume in `applications/*` with the
  same framing (backend-infra / full-stack / AI-workflow), swap the summary line, the skills line and
  the top three bullets into this JD's vocabulary, then `node scripts/resume-pdf.mjs`. Run
  `/ats-score` **once**. Floor is **70** for C, and there is **no loop**: one revision pass, and
  whatever it scores is what goes, recorded honestly in the tracker. Never invent a keyword to
  clear the floor — the no-overclaim rule outranks the score, always. **If the full JD is not
  readable** (behind a LinkedIn login, an X post with no link, a careers page carrying no JD),
  do **not** score against the lead note's summary and do not print a number: write `not scored`
  and the reason. A score computed against a paraphrase is a fabricated number.
- **pack.json** — write it anyway, even though the lane submits the form itself. It is the
  record of what was answered, and the extension is the fallback when the browser path fails.
- **Cover letter** — only if the form has a required field over ~100 words, and then write it
  straight into pack.json. Never a PDF, never `/cover-letter`, for a C.

Voice rules are fully binding here and there is no human proofread to catch a miss, so they
matter *more* in this lane, not less: `profile/voice.md`, and **no em dashes anywhere** in
anything submitted or sent.

## 3. Submitting a form (Codex in Chrome)

Load the browser tools in one `ToolSearch` call, then per company:

1. New tab per company (`tabs_create_mcp`), navigate to the form.
2. `read_page` for refs. Fill with `form_input` from pack.json + facts.yaml.
3. Resume: find the file input's ref, then `file_upload` with the absolute path to
   `applications/{company}/resume.pdf`. **If the upload is rejected because the path isn't a
   shared folder, that is a hold, not a workaround** — no re-hosting the PDF, no pasting the
   resume as text into a file field. Record it and move on; it's a one-time setup thing for
   Shivam to fix by connecting the repo folder.
4. **Read the whole page back before submitting.** Every field, against pack.json. This is the
   step that replaces Shivam's eyes, so it is not optional and not a skim. A field that filled
   wrong, a dropdown that silently reset, a required field still empty → fix it or hold.
5. Screenshot, submit, then confirm the confirmation. Save the confirmation text (or the
   screenshot path) into `applications/{company}/log.md`. **No confirmation seen = not sent**,
   and the tracker must say so.
6. Close the tab.

Never accept cookie/consent banners beyond declining non-essential, never tick a marketing
opt-in, and never agree to terms that aren't the standard application-accuracy checkbox.

## 4. Sending the email — through the browser, NOT through the Gmail MCP

Only to an address the company published. Body per `/outreach`'s C rules: 50–125 words, one
specific thing about their product from the micro-dossier, one checkable number, one small ask,
no em dashes.

**Do not use `mcp__claude_ai_Gmail__send_message` when a resume is attached.** It takes the PDF
as base64 in the call, which means the file has to pass through the model twice: a 96KB resume
is 132KB of base64, which the Read tool alone priced at **126k tokens**, and it must then be
reproduced verbatim as a parameter. That is not a cost problem, it is a hard blocker — the file
does not even fit in one read. Measured 2026-08-19.

**The browser path costs nothing and works.** Verified end to end on the first run:

1. `navigate` to `https://mail.google.com/mail/u/0/#inbox?compose=new`, then click the
   **Compose** button (the URL alone does not open the composer).
2. `find` for "file input for attaching files, To recipient field, Subject field, message body".
3. `form_input` the **To** and **Subject** fields.
4. `file_upload` the resume with its plain repo path
   (`/Users/shivamverma/Desktop/projects/job-ops/applications/{company}/resume.pdf`). This works — the
   repo needs no special "connected folder" setup, and the bytes never enter context.
5. **The body will NOT take via `form_input`.** Gmail's body is a contenteditable; `form_input`
   reports `Set textarea value to "..."` and the compose window stays empty. Click into the body
   and use `computer` → `type` instead. Newlines are safe; Gmail sends on Cmd+Enter, not Enter.
6. **Screenshot and read the whole compose back** before clicking Send: recipient, subject, the
   full body, and the attachment chip showing the filename and size. This is the step that
   caught the empty body on the first run.
7. Click **Send**, then confirm with `search_threads` (`to:{address} in:sent`) and record the
   thread id. **No thread id = not sent**, and the tracker must say so.

Save the exact sent text to `applications/{company}/outreach.md` under `## Sent {date}` with the
thread id, so what went out is on disk and not only in Gmail.

The Gmail MCP is still the right tool for a **draft with no attachment** — the Strello follow-up
was created that way with `create_draft` + `replyToMessageId` so it nested on the original
thread.

**Still never:** send to a guessed address, send a second email to the same company in one
batch, reply to an existing thread (that's `/check-replies`, and it drafts), or touch any
existing mail in any way.

## 5. The handoff — as board cards, not prose

Everything the lane held goes into **`inbox/actions.json`**, which `node scripts/actions.mjs`
renders as a checkbox board. **Do not write a wall of markdown.** Prose handoff was tried first
and failed for a measured reason: the file grew past the point where Shivam could find what was
his to do inside the background he did not need, so he skimmed it and did nothing.

Append one item per held company:

```json
{
  "id": "{slug}-{what}", "kind": "action", "company": "...", "grade": "C",
  "title": "the imperative, in five words",
  "sub": "one line of why it is on his desk",
  "links": [{ "label": "Gmail draft", "url": "https://mail.google.com/mail/u/0/#search/in%3Adrafts+{company}" }],
  "steps": ["what he does with his hands", "..."],
  "background": "everything else, as long as you like — it is behind a dropdown",
  "tags": ["connection not accepted"],
  "deadline": "2026-08-19T23:59:00+05:30",
  "onDone": { "markProcessed": "done|skip|signal-skip|signal-promote", "slug": "Company Name" }
}
```

Rules that keep the board usable:

- **A step is something Shivam does with his own hands.** "Read the draft", "Send it", "Sign the
  NDA". Anything Codex does is not a step, it is a sentence in `background`. A card whose steps
  are all Codex's work will sit there forever and teach him to ignore the board.
- **All the reasoning goes in `background`**, which renders inside a collapsed dropdown. Long is
  fine there. `title` and `sub` are what he actually reads, so they carry the decision.
- **Give every link you can**: the Gmail draft search, the form URL, the posting, the company
  site, the `file://` path to the folder. A link he has to go find is a task he will not do.
- **`onDone` fires when every box is ticked** and is the only thing that writes back to the repo
  (`mark-processed.mjs`, or a targeted tracker status/follow-up rewrite). Set it to what is
  actually true when those steps are done. If nothing should be written, omit it.
- **A card that means "I'm dropping this" gets exactly one step**, worded as the decision
  ("Passing on this one"), with `onDone` set to skip. Never make a pass take four checkboxes.
- **Set `tags` whenever the card has a real, nameable reason it isn't just a normal open item**
  ("connection not accepted", "video required", "assignment required", "case study required",
  "no channel available"). This is what the board's "Stuck only" filter reads, and Shivam can
  also add/remove tags himself from the UI — his edits persist in `inbox/.actions-state.json`
  and survive the next time this skill rewrites `actions.json`, so never worry about clobbering
  a tag he added by hand; just don't duplicate it.
- **Set `deadline` (ISO 8601, ideally with a time and IST offset) whenever the posting, form, or
  reply states one** — a Google Form closing date, an assignment due time, an interview slot.
  It surfaces in a dedicated "⏰ Deadlines" panel pinned above every section, sorted soonest
  first, which is the one thing on the board that's actually time-bound and easy to miss inside
  a wall of cards otherwise. Once the deadline passes, leave the field as-is — the panel keeps
  showing it (greyed out, marked "passed") until the card itself is marked done.
- **Stale beats missing: refresh, don't duplicate.** Before appending a card for a company,
  check whether one already exists for it in `inbox/actions.json` (by company name, not just
  id) and whether `applications/{slug}/` already has more recent work than the card reflects —
  update that card in place instead of appending a second one with a different id. Two cards
  for the same follow-up is worse than one stale card, because it can silently collide on a
  reused id and corrupt checkbox state for both.

LinkedIn/X messages go in the card's `background` as the drafted text, with the profile URL in
`links`. Offer to open them in tabs at the end of the batch; don't open ten tabs unasked.

Finish the run by starting the board: `node scripts/actions.mjs`.

## 6. Close out every company

Per company, immediately after the send/submit (not batched at the end, or a crash loses it):

- A tracker row via `/outcome`. **Short** — three or four sentences, not the essays A/B rows
  carry. Required in the notes cell: `autoapply`, `video: no`, `tech-read: no`, the ATS score,
  and the confirmation evidence.
- `channel` cell reads e.g. `Ashby form, submitted by autoapply 2026-08-19` or
  `email to careers@x.com, sent by autoapply`.
- **Follow-up: `none`.** A C is one touch. Chasing C leads would flood the queue that exists
  for A and B, which is the pipeline's scarcest attention. If a C replies, `/check-replies`
  catches it and it stops being a C.
- `node scripts/mark-processed.mjs "{company}"` (or `--skip` for the ones triaged out).

At the end of the batch: run `node scripts/reconcile.mjs` and clear anything it lists, then
report to Shivam in one block — submitted, emailed, held (and why), skipped (and why), plus
anything worth writing into `profile/learnings.md`. **A partial batch reported as complete is
the one failure mode that makes this lane unusable**, so name every company that didn't finish.

## What the first run measured (2026-08-19, 8 companies looked at, 1 sent)

Read this before you start, so the throughput does not surprise you into lowering a gate.

- **1 of 8 became an application.** XenReality, by email with the resume attached. Six failed a
  gate (see §gates for each), one was already applied to.
- **The C pile is mostly triage.** Do not read a low send count as failure and do not "find a
  way" to apply to a company that failed a gate. Reporting six honest holds is the lane working.
- **The form-submit path in §3 is still UNTESTED end to end.** No eligible C lead in the first
  batch had a live self-serve form Shivam qualified for. The Langfuse Ashby form was read and its
  fields mapped, then skipped on the work-permit gate. Treat §3 as written-but-unproven: go
  slower there, screenshot more, and write down what actually happens the first time it runs.
- **~12 minutes per company was about right** for the ones that passed. The failures were faster,
  which is the point of ordering the gates before the work.

## What this lane is allowed to learn

C-lane volume is the only thing in JobOps that will ever produce a statistically real answer to
"what converts" — A and B are n=1 each. Write the conversion numbers into `learnings.md` §
What converts with the batch date and honest counts. If the C lane's reply rate turns out to be
zero across thirty sends, that is a finding worth acting on, and the right action is to say so
and propose killing the lane, not to keep firing.
