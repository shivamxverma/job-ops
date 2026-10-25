# OpenAlex — outreach (2026-09-29)

## Channel
The application form is the only published channel: openalex.org/jobs/software-engineer,
logged-in OpenAlex account, one-shot per role. No hiring email is published, and none is guessed.
The three form answers in `answers.md` are the whole pitch. **No cold email is drafted.**

## Follow-up (only if silent by 2026-10-06)
Their form says "we'll email you either way once we've decided", so silence at 7 days is normal
and the follow-up is light. Target: a reply under the HN post by `caseydm`
(https://news.ycombinator.com/item?id=49524920), which is where the role was posted. Draft:

> Hi Casey, I applied for the Software Engineer role last week through the site. One thing I left
> as a question in my answers: when writebackOnetimeCredits zeroes the Durable Object's consumed
> count before the Postgres UPDATE in waitUntil, is the window if the isolate dies just an
> accepted give-away, or does something reconcile it? Curious either way.
>
> - Shivam

Review before posting. It's public, so keep it to the question and nothing personal.

---

## Follow-up, redrafted 2026-10-24 (overdue since 2026-10-06)

**Before posting:** confirm the site form was actually submitted (tracker said "still has to
create the account, review and click submit"). Check the HN post while logged in: it is from
2026-09-01 and no reply link showed logged-out, so replies may be closed. If closed, there is no
other published channel: leave it, their form promises an email either way.

**Why redrafted:** source re-read 2026-10-24 (repo pushed 2026-10-23). `writebackOnetimeCredits`
now restores the claimed count to the DO when the Postgres UPDATE throws (`/restore-consumed`),
so the old question was out of date. What is left open: isolate eviction between
`/begin-writeback` and the UPDATE, where no catch runs.

**To:** HN reply under caseydm, https://news.ycombinator.com/item?id=49524920

> Hi Casey, I applied for the Software Engineer role through the site last month. A question
> from reading openalex-api-proxy: writebackOnetimeCredits puts the claimed count back on the
> DO if the Postgres UPDATE throws, but if the isolate gets evicted between begin-writeback and
> the UPDATE, nothing runs the restore. Is that window an accepted give-away, or does something
> reconcile it later? Curious either way.
>
> - Shivam
