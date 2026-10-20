---
name: x-scout
description: Scout X (Twitter) for real hiring posts via Shivam's logged-in Chrome session — hiring-intent search, founder threads, and the warm channel — then triage each post for whether the company is actually hiring or just farming engagement, check the company is worth working for, and draft the DM. Also handles person-first DMs (lens 5) when Shivam hands over an interesting profile with no hiring signal at all. Use when asked to check X/Twitter for jobs, find hiring posts, DM someone on X, or work the X channel.
---

# X Scout

X is a real hiring channel, but it has the worst signal-to-noise of anything in this pipeline.
Two measured facts from building this skill, both of which drive the design:

1. **Topic keywords fail.** A query built on `"hiring" + "ai agents"` returned 1 real hiring
   post in 6 — the rest were people posting *about* AI agents. A query built on
   **hiring-intent phrase + role noun** returned 5 in 5.
2. **The top result was fake.** In that clean run, one account had posted three different
   "We're hiring" posts in four hours — a healthcare SaaS, an unnamed "early-stage startup",
   and an insurance company. That is not an employer. That is an aggregator account farming
   replies. This is the normal case on X, not an edge case.

So this skill is two skills stapled together: **find the posts**, then **prove the post is
real** before a single minute goes into a DM.

## Hard rules (read before touching the browser)

Same posture as `/linkedin-scout` — this runs on Shivam's real, logged-in account.

- **Manual/on-demand only. Never wire this into a cron.** HN and RSS are public
  unauthenticated reads; X is his identity and his ~1000-follower audience.
- **One search at a time, read like a human.** Navigate, extract, decide, move on. Never
  script a loop that opens dozens of profiles back to back.
- **Never post, reply, follow, like, or send a DM.** Copilot, not autopilot. Everything this
  skill produces is a draft for Shivam to send himself.
- **Stop immediately on any CAPTCHA, rate-limit screen, or "verify it's you" prompt** and
  tell Shivam. Do not attempt to solve it.
- **Never enter credentials.** Use the session that's already open.

## Step 1 — search

Navigate to `x.com/search?q={encoded}&f=live` (`f=live` is Latest; without it you get the
algorithmic "Top" tab, which buries fresh posts). Extract the timeline with `javascript_tool`
rather than `get_page_text` — `get_page_text` returns only the first article. This works:

```js
[...document.querySelectorAll('article[role="article"]')].map(a => ({
  handle: (a.innerText.match(/@[A-Za-z0-9_]+/) || [''])[0],
  time:   a.querySelector('time')?.getAttribute('datetime') || '',
  link:   [...a.querySelectorAll('a[href*="/status/"]')].map(x => x.href)
            .find(x => /\/status\/\d+$/.test(x)) || '',
  text:   a.innerText.replace(/\s+/g, ' '),
}))
```

Scroll and re-extract to page further; dedupe on the status link.

**Query design — the rule is intent phrase AND role noun.** Never search a bare technology.

```
("we're hiring" OR "we are hiring" OR "looking to hire" OR "join us as" OR "hiring our first")
("founding engineer" OR "backend engineer" OR "platform engineer" OR "full stack engineer" OR "infrastructure engineer")
(remote OR india)
-is:retweet -filter:replies
```

Operators confirmed working as of July 2026: `from:` `to:` `"exact phrase"` `OR` `-term`
`min_faves:` `min_retweets:` `min_replies:` `since:` `until:` `filter:links` `filter:images`
`-filter:replies` `-is:retweet` `lang:en`. Useful additions:

- `since:YYYY-MM-DD` set to ~7 days back — day-one applications are the whole thesis.
- `min_faves:3` as a light bot filter. Don't go higher: **real founder hiring posts often have
  single-digit engagement**, and the viral ones are usually the aggregators. High engagement
  is a *weak negative* signal here, not a positive one.
- `-"DM me" -"comment interested" -"repost this"` strips the engagement-bait template
  directly. This one query edit removes most of the noise.

Run four lenses, separately:

1. **Founder hiring posts** — the query above, varying the role nouns across Shivam's framings
   (backend-infra / full-stack / AI-workflow, per `facts.yaml`).
2. **"Who's hiring" threads** — search `("who's hiring" OR "hiring thread") lang:en` plus VC
   and accelerator accounts that run them. The *replies* are the leads. Open the thread and
   extract replies; each reply is a separate company.
3. **The warm channel.** This is the highest-conversion lens and the most-skipped. The one
   well-documented "got hired on X" pattern is not viral posting — it is a person seeing a
   post from someone they *already talked to* and DMing them. So search
   `from:{handle} (hiring OR "join us")` across accounts Shivam already interacts with, and
   check `inbox/network.md` for overlap. A warm X contact beats a cold DM the same way
   `/network-scout`'s referral path beats `/outreach`.
4. **Inbound.** Shivam's X account is TODO(shivam) (none recorded in `facts.yaml`). Once it
   is, search his own mentions (`to:{handle}` and `@{handle}`) for anyone who has already asked
   what he's working on — those are warm and free. Note them; don't act on them.
5. **Person-first.** See below. No post required, no hiring signal required.

## Lens 5 — person-first DMs (the profile *is* the lead)

Lenses 1–4 all start from a post. This one starts from a **person**: Shivam sees an interesting
profile (investor, founder, protocol dev, ecosystem lead) and wants his name in their head
regardless of whether they're hiring today. The DM is cheap, the timeline is long, and the
asymmetry is the whole point: a job posting is a one-week window, a person who remembers you is
a two-year one. Accept this lens whenever Shivam hands over a handle, even with nothing else.

**It is not the same message as a hiring-post reply, and treating it like one is how it fails.**

- **Never ask "are you hiring".** Cold-asking a stranger for a job invites a no, and a no closes
  the channel for a year. Ask something they can answer without deciding anything about him.
- **The ask scales to what they control.** A founder controls a seat, so it's fine to say he's
  looking. An **investor or ecosystem/BD person controls a list**, not a seat: the ask is
  "if a portfolio company needs someone who writes X, put me on that list", which costs them
  one forward and no commitment. Never pitch an investor as if he were raising, and say
  explicitly that he isn't — VCs read every cold DM as a pitch by default.
- **Lead with the artifact, not the introduction.** They have no reason to care who he is yet;
  they might care that CodeSM runs untrusted code in 6 languages inside Docker sandboxes.
- **Pick the artifact off their thesis, not off his ranking.** Dev-tools / infra → CodeSM or
  Yuvro. AI / automation → Hireflow's hallucination validator. Media / AI-generation → the
  poiro.com asset dedup layer. Real-time → Storix or Chatterly.
- Same mechanics as any DM: three to five sentences, one number, live link, no em dash, end on
  a question or an offer, never "looking forward to hearing from you".

**Verify the affiliation before writing, because an X bio is a self-assigned title.** For a
person-first target the checks are about the *org*, not the post:

- Open the org's own site and its own X handle. **A mismatch between the handle in their bio and
  the handle on the fund's site is a real finding** and usually means the bio names a
  differently-scoped entity, or one that no longer exists in the shape claimed.
- **Check when the org last posted.** A fund whose account has been silent for two years has no
  live deal flow, therefore no portfolio-hiring list to be added to, therefore the DM is worth
  four sentences and not forty. This is the single highest-value check in this lens.
- **Yap-score accounts.** A pinned post celebrating Wallchain / Moni / Kaito scores, "smart
  followers", or airdrop-farming metrics means the account is optimised for crypto-Twitter
  engagement rewards. That is not disqualifying on its own, but it downgrades how much the
  stated title is worth and it means the reply rate is a lottery. Note it, keep the DM short,
  and never build a plan around the reply.
- Thin original timeline (mostly reposts) → they are a reader, not a poster. A short DM lands
  better than a long one, and a public reply is pointless because nobody is watching.

Tier these the same L1/L2/L3 way, with one difference: **for person-first targets the tier sets
the message length and the expectation, not whether to send.** Only L3 safety hits (step 4) stop
a send outright. Record the tier and the reason so a later run doesn't redo the research.

**Output** → the draft goes in `inbox/replies.md` (no company folder; there's no application
here) and the person gets a line in `inbox/network.md` under `## X contacts (person-first)` so
the relationship is tracked across channels and nobody gets DM'd twice. No `applications/`
folder, no tracker row, no follow-up clock: **this lens has no follow-up.** One DM, then leave
it. A second unprompted DM to someone who never replied is the exact move that burns a contact
permanently.

## Step 2 — legitimacy triage (do this before any research)

Grade every hit **L1 / L2 / L3** before spending research time. The single most useful check
is one click: **open the poster's profile and look at their recent posts.**

**L3 — discard, don't research.** Any one of these is enough:
- The same account has posted multiple "we're hiring" posts for *unrelated* companies. That's
  an aggregator or a lead-gen account, not an employer. (Observed directly: three unrelated
  hiring posts in four hours from one handle.)
- "DM me for details" / "comment 'interested'" / "repost + follow to apply" — the mechanic
  exists to farm follows and replies. Real hiring posts link to a JD or name an email.
- No company named anywhere in the post or bio.
- A recruiter account with no named client.

**L2 — real-looking, unverifiable.** A named company but a thin or unreachable footprint.
Worth a DM, not worth deep research. This is the case Shivam asked about explicitly: **draft
the DM anyway** — the cost of a DM is two minutes, and an unverifiable early-stage company is
sometimes just an early-stage company. Grade it C, mark it `L2 (unverified)` in the lead line
so the reason is on the record, and keep the DM short: a lead you can't research doesn't earn
a long message.

**L1 — verified employer.** Treat as a real lead. Signals:
- The poster is a founder/employee *of the named company* per their bio, and the company
  account exists.
- The post links to a real JD, careers page, or ATS (Ashby/Greenhouse/Lever/join.com).
- The post names a specific problem and specific stack rather than a generic role blurb.
- Account age and posting history are consistent with the company's existence — a founder
  account created last month for a company claiming Series A is a contradiction.

## Step 3 — is the company worth working for

Only for L1 and promising L2. Reuse the pipeline instead of inventing checks:

- Company site + GitHub → `gh-tools/recon.mjs {org} --out` gives real commit activity. A
  "fast-growing team" with a dead repo is a data point.
- Cross-check funding claims against the sources `/signal-scout` already uses. If they claim a
  raise, it should be findable.
- Check the company against `inbox/leads.md`, `inbox/signals.md`, and
  `applications/targets.md` before adding — X posts frequently duplicate roles already found
  on HN or WaaS. If it's already tracked, note `⚠ already in leads.md as "..."` and stop.
- Then hand off to `/company-research` for anything graded A/B.

## Step 4 — safety (this one is specific to Shivam)

Any developer with a public portfolio is a target for the fake-recruiter attack, and crypto
roles are where it concentrates: the attack that runs on X and Telegram: a "recruiter" DMs
about a crypto role, then sends a take-home that asks you to clone a repo and run it. The repo
is the payload. This is now one of the largest single categories of crypto theft.

**Hard rules, no exceptions:**
- **Never clone, install, or run anything sent by a recruiter or DM contact**, and flag it to
  Shivam in bold whenever an inbound conversation heads that way. No legitimate company needs
  you to run their binary to interview you.
- Treat "move this to Telegram/WhatsApp" as a **major** red flag, not a preference.
- Treat urgency ("final call in 30 minutes", "start Monday") as a red flag.
- Unrealistic comp with a vague JD, or a recruiter reachable only at Gmail/Telegram → L3.
- Never share a wallet address, seed phrase, or private key. Obviously — but the attack works
  by arriving inside a conversation that already feels real.

Anything matching these gets logged as L3 with the reason, and Shivam gets told plainly.

## Step 5 — output

**Leads** → `inbox/leads.md`, standard format, source `X:`, with the tier on the record:

```
- [ ] **{Company}** — {role} | {A-F} | posted {date} | X: {post URL} | why: {one line, incl. L1/L2 tier and how it was verified} | founder/HM: @{handle}
```

**The DM draft** → `applications/{company}/outreach.md` for A/B leads, or `inbox/replies.md`
for L2 one-offs not worth a folder yet. Follow `/outreach` and `profile/voice.md`, plus what
the channel demands:

- **Three sentences.** X DMs are read on a phone, next to fifty others. Founders who hire from
  DMs consistently describe the same shape: who you are, what you've built that's relevant,
  what you want — nothing else.
- **One checkable artifact with a number**, per the ground rules. Live link. For a
  dev-tools / sandbox company that's CodeSM (6 languages, live at code-sm.vercel.app); for
  infra / platform it's Yuvro (Kubernetes per-workspace runtimes); for AI automation it's
  Hireflow; for real-time backend it's Storix or Chatterly. Pick the one that matches *their* problem.
- **Reference the actual post.** The DM should be impossible to have sent to anyone else.
- **No em dashes** (`—`) anywhere in the draft. Banned punctuation, top AI tell, and it stands
  out badly in a short DM.
- **No pitch close.** End with a question or an offer, not "looking forward to hearing from you".
- If their DMs are closed, draft a public reply instead and say so — and note that replying in
  public to a hiring post is itself pipeline work under the CLAUDE.md replies rule.

At the end of the turn, tell Shivam: what was found, what tier each lead got and why, where the
drafts are, and that they are his to review and send. Nothing goes out automatically.

## Cadence

On-demand. One pass = the four lenses, a handful of searches each, triage, and drafts for the
survivors. Stop and summarize rather than crawling indefinitely. If a run produces zero L1
leads, say so plainly — that is a normal outcome on X and a real result, not a failed run.
