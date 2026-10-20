---
name: tech-read
description: Reconstruct a company's architecture from public evidence in about 30 minutes and write applications/{company}/tech-read.md — what they run and the header that proves it, the hard problems that shape forces on them, the one seam Shivam has already touched, and two questions only someone who read the internals would ask. Use for every A/B lead before outreach, resume, video script or cover letter, and whenever Shivam says he wants to show he understands their tech.
---

# Tech Read

## The reframe this skill is built on

Shivam's instinct is right about the effect and wrong about the cause. Small startups do respond
much better to someone who understands their system. But he assumed that means **learning their
tech**, which is why it feels unscalable: properly learning one company's domain is a
`learn-before-build` session, and that is hours, so it caps him at one or two applications a
week.

Learning their tech is not what earns the reply. **Being able to name the specific problem
their architecture forces on them** is. And that is recon plus one page of thinking, not study.

Two consequences run through everything below:

**1. Questions scale, claims don't.** A statement about their internals can be wrong, and a
confidently wrong claim is worse than saying nothing: it proves he *didn't* understand. A
question that presupposes the internals cannot be wrong in the same way, costs him no risk, and
reads as more senior. *"Do you fan the extraction step out per-tenant, or is one worker pool
shared and the noisy-neighbour case handled by priority?"* proves more depth than three
paragraphs of summary, and it invites a reply, which a summary never does. **So the payload of
this file is its questions.**

**2. Cluster once, probe per company.** Their *specific* system is cheap to see from outside.
The *hard problems* are not company-specific at all: every LLM-in-production company has the
same eight, every multi-tenant data platform has the same six. Those get written once into
`profile/domains/{cluster}.md` and reused. Company one in a cluster costs 30 minutes; company
seven costs about ten, because only section 1 and 4 are new.

## Time budget, and whose time it is

| | |
|---|---|
| `node scripts/stack-probe.mjs` | ~20s, scripted |
| `node gh-tools/recon.mjs {org} --out` | ~30s, scripted |
| Docs / API reference / changelog / incidents, read by you | 15 min |
| Writing `tech-read.md` | 10 min |
| **Shivam's own time** | **one page, once, about 5 minutes** |

That last row is the constraint that decides the format. `tech-read.md` is **one page**, and
every line on it is a line he could say out loud. If he has to study the artifact, the artifact
failed and we have just moved the unscalable work rather than removing it.

## Pass 1 — the probe (scripted, evidence-first)

```
node scripts/stack-probe.mjs {domain} --slug {company}
node gh-tools/recon.mjs {org} --out
```

`stack-probe.mjs` codifies what `profile/learnings.md` already measured on Wonderdog and
DualEntry: response headers give the framework, host, auth vendor and rate-limiting posture;
`content-security-policy` names hosts they publish nowhere; a `status.` CNAME, an Ashby posting
API, an `llms.txt` and an empty App Store result are each a finding. Read its output with the
attribution lines: **a header on `status.` or `docs.` belongs to Statuspage or Mintlify, not to
them**, and the first hop of `x-vercel-id` is the edge nearest *you*, not their region.

## Pass 2 — the four artifacts worth reading by hand

Ranked by yield. Stop when you have the architecture, not when you run out of pages.

1. **API reference / docs.** The highest-yield artifact by a distance, and the most skipped.
   Endpoint shapes, pagination style, webhook retry semantics, rate-limit numbers, error codes,
   idempotency keys and object model *are* the architecture, stated by them, in writing. If
   they publish an OpenAPI spec, read the spec.
2. **Status page incident history.** Where the system actually breaks, in their own words, with
   dates. A specific incident is the single most checkable thing he can mention, and nobody
   else applying has read it.
3. **Changelog / release notes.** What they shipped in the last three months tells you what
   they are worried about now, which is what the role is really for.
4. **Engineering blog + the GitHub recon.** Deps prove language and stack; recent committers are
   the likely interviewers; open `bug`/`help-wanted` issues are the roadmap's underside.

The JD's stack list is a *fifth* source and the least reliable one: it is aspirational and often
written by a recruiter. Where the headers and the JD disagree, the headers win, and the
disagreement itself is worth a question.

## Pass 3 — the cluster note

Read `profile/domains/{cluster}.md` for the cluster this company sits in, and write it if it
does not exist yet (`profile/domains/README.md` has the format). Current clusters:
`llm-in-production`, and add others as the pipeline hits them (multi-tenant data platforms,
crypto infra, devtools/CI, real-time collaboration, payments).

The cluster note holds the hard problems and the standard trade-offs. **`tech-read.md` never
restates it** — it names which two or three of the cluster's problems *this* company's shape
makes acute, and why.

## The output: `applications/{company}/tech-read.md`

Six sections. One page. Sections 3 and 4 are the reason it exists.

```markdown
# {Company} — tech read ({date})

## 1. The system, as far as it is visible
5 to 8 lines. Each line: the inference, then the evidence that proves it, inline.
Mark every line [fact] (a header, a doc, a spec) or [inference] (reasoned from evidence).
No line without one of those tags.

## 2. What they are worried about right now
From the changelog, the incidents, and what the role is for. Two or three sentences.

## 3. The problems this shape forces
Two or three, from the cluster note, made specific to this architecture. For each: the
problem in one line, and why *their* shape makes it acute rather than theoretical.

## 4. The seam Shivam has already touched
Exactly one. The place where something in profile/facts.yaml genuinely meets one of the
problems above, with the number. If the honest answer is "adjacent, not the same", say
that here in those words. One real seam beats three stretched ones, and a stretched one
is detectable in about four seconds.

## 5. Two questions only an internals reader would ask
The payload. Each must be unanswerable from their marketing site, answerable by an
engineer there in two sentences, and something Shivam actually wants to know. These go
straight into outreach, the video's close, and the interview.

**The survival test, and it is a hard gate.** A question is only allowed if Shivam can
survive the answer: understand the reply, and ask one sensible follow-up, without
studying anything first. That is a much lower bar than knowing their domain, and it is
not zero. A question he cannot follow up on is a trap he set for himself, because the
reply is the thing he wanted and he cannot use it.

So when a good question sits above that bar, do not delete it and do not send him off to
learn the field. Do one of two things:
- **Write the follow-up with it.** One line in section 5: "if they say X, ask Y; if they
  say Z, that means they chose the queue route." Two branches is enough to hold a thread.
- **Name the one concept**, in one line, that makes the answer legible. One concept is a
  five-minute read, not a `learn-before-build`. If it takes more than one, the question
  is the wrong question for this application.

## 6. Do not say
Where the inference is weak, what would be an overclaim, and any number that is not
verified. Written as the exact sentences to avoid. This section is what makes the rest
safe to use.
```

**Section 6 is not optional.** The whole risk of this skill is that a page of confident
architecture talk goes into an email and one sentence of it is wrong, in front of the person who
built the thing. Naming the weak inferences is what keeps the strong ones usable.

## Where it gets consumed

- **`/outreach`** — one observation and one question from section 5. Never the whole read; a
  cold email that recites their architecture back at them reads like a scrape, not a person.
- **`/job-script`** — clip 1's reason for applying, and clip 3 when the seam is stronger than a
  second project.
- **`/cover-letter`** — sections 3 and 4 are the "why us" answer that isn't generic.
- **`/tailor-resume`** — section 1's real stack beats the JD's wishlist for keyword choice.
- **`/company-research`** — the dossier's "What I'd do in week one" comes out of section 3
  instead of being invented.
- **`/mock-interview` and `/interview-debrief`** — `learnings.md` already has this measured: *a
  system-design prompt at a startup is almost always their own architecture with the labels
  changed.* So `tech-read.md` is the highest-value interview prep in the repo, and it was
  written before the interview existed.

## When to build them something (and when not to)

`tech-read` is tier 1 of three, and they are not alternatives. They are a ladder, and the
whole point is that the cheap rungs tell you whether the expensive one is worth it.

| Tier | What it is | Cost | When |
|---|---|---|---|
| 1 | the observation and the two questions, in the email or the video | ~30 min, mostly Codex's | **every A/B lead** |
| 2 | the seam: work he already has, reframed as their problem | zero new build | every A/B lead, from section 4 |
| 3 | building something for them | hours, all his | see the gate below |

**Tier 2 is the one that gets underrated.** It is already "I did something", and the something
already exists. Section 4 exists to find it.

**The gate on tier 3.** Build only when one of these is true:

- **They replied.** A reply tells you what they actually care about, so the build is targeted
  and, in effect, invited. This is by far the best moment and it is why tier 1 comes first: the
  question is the cheap probe that decides whether to spend the hours.
- **There is a real open issue on their repo** (`node gh-tools/pr-wedge.mjs {org}`). A merged PR
  is the strongest opener that exists, and it cannot read as presumptuous because the work was
  asked for in public.
- **It is genuinely small and uses their public surface** — an hour against their documented API
  or SDK, shown as a link. Not a rewrite of something they own.

**Do not build when** the artifact implies their system is broken in a way they have not agreed
it is broken, when it required guessing at internals section 1 marked `[inference]`, or when
it would be the first thing they ever hear from him at a company that has not replied to
anything. Six hours spent on a company that ghosts is the most expensive failure mode this
pipeline has, and cold-building is how it happens.

## The boundary with `learn-before-build`

They are different tools and confusing them is how this stops scaling.

| | tech-read | learn-before-build |
|---|---|---|
| Cost | 30 min, mostly Codex's | hours, all his |
| Produces | one page he can speak from | understanding he can defend under pressure |
| Run it | **every A/B lead** | when a lead is worth building for, or an interview is booked |

Run `tech-read` first, always. It is also what tells you *whether* a `learn-before-build` is
worth it, and which single concept it should cover.

## Hard rules

- **Every line tagged `[fact]` or `[inference]`.** An untagged line will get repeated as fact.
- **No number that is not verified**, same rule as everything else here: it ends up in his mouth.
- Attribution before assertion. A vendor's header is not their engineering choice.
- One page. If it runs to two, section 1 is too long — cut the lines that are true of every
  company on Vercel.
- No em dashes in anything that will be quoted into an email or said on camera.

## Related

`scripts/stack-probe.mjs` · `gh-tools/recon.mjs` · `gh-tools/pr-wedge.mjs` ·
`company-research` · `outreach` · `job-script` · `cover-letter` · `mock-interview` ·
`profile/domains/` · `profile/learnings.md`
