---
name: network-scout
description: Mine Shivam's own LinkedIn network for warm referral paths — map 1st-degree connections into inbox/network.md, cross-check pipeline companies for mutuals, and run the alumni engine (lens 3) that asks IIIT Nagpur seniors whether their team is hiring instead of waiting for a posting — then draft the invite and the referral ask. Use when asked to find referrals, ask seniors/alumni for a referral, check the network, map connections, or find a warm path into a company.
---

# Network Scout

Cold outreach converts worse than a referral, and Shivam's network is hiring even when nobody
posts a signal. This skill works that channel in both directions. It shares every hard rule in
`linkedin-scout/SKILL.md` — **read that section first**: manual/on-demand only, never cron,
read like a human, no bulk profile visits, stop dead on any checkpoint/CAPTCHA, never enter
credentials.

## The map: `inbox/network.md`
A cached, human-readable index of who Shivam knows and where they work, so we never re-crawl
LinkedIn to answer "does anyone I know work somewhere relevant?". Format:

```
# Network map (built by /network-scout — refresh ~monthly, small batches)
Last refreshed: YYYY-MM-DD (N connections mapped)

- **{Name}** — {role/headline} @ {Company} | 1st° | relevance: {high/med/low + why one-liner} | linkedin.com/in/{slug}
```

### Building / refreshing it
- Open `linkedin.com/mynetwork/invite-connect/connections/` in the logged-in session, scroll
  a few pages, read with `get_page_text`. **Batch limit: ~40–50 connections per session**,
  then stop and save progress; note where you left off. A 500-connection network takes a few
  sessions — that's fine, the map compounds.
- Name + headline + company from the list page is enough. Do NOT open individual profiles
  during mapping; that's the bulk-visit pattern the linkedin-scout rules ban.
- Tag relevance while mapping: high = works at a startup/tech company that could plausibly
  hire Shivam's stack; med = tech-adjacent or big-co eng; low = off-field. Low still gets a
  line (people change jobs) but skip its companies in lens 1.
- Refresh ~monthly or when Shivam says the map feels stale. On refresh, update changed
  rows rather than appending duplicates.

## Lens 1 — forward: my network → who's hiring (no signal needed)
For high/med companies in the map, check for open roles that fit (careers page or company
LinkedIn jobs tab via WebFetch where possible; the browser only when needed). A hiring match =
a lead for `inbox/leads.md` scored A–F per job-scout, with the why-field tagged
`(warm: {Name}, 1st°)` — and the next move is the referral ask below, not a cold email.
Even with no specific posting, a high-relevance connection at a growing company can be worth
an informational ping; flag those separately, max 2–3 per run, don't spam the network.

## Lens 2 — reverse: pipeline company → who do I know there
When a company enters the pipeline (or on demand for tracked ones): open its LinkedIn
company page → People, read the connection-degree info. A 1st° hit = referral ask directly.
A 2nd° hit = note the mutual connection and draft the intro ask **to the mutual**, not to the
stranger. Record the finding in the company's dossier.md under `## Warm paths` and tag the
tracker row's notes.

## Lens 3 — the alumni engine (seniors) — **the volume channel**

Lenses 1 and 2 are gated on knowing a company is hiring. That gate is the reason the referral
pipeline stayed thin: **most companies are hiring and never post it, and you cannot find that
out without asking someone inside.** So this lens inverts it. No signal, no posting, no open
role required. Pick seniors from Shivam's own college, ask each one whether their team is taking
anyone on, and let the answers *be* the lead source.

This is the highest-yield channel available to a 2026 grad and it is almost pure upside: an
IIIT Nagpur senior has an employee-referral bonus riding on a good hire, shares 200–500 mutual
connections with Shivam, and remembers being in his position two years ago.

### Finding them (UPDATED 2026-10-24: the alumni tab's keyword box is broken)

**Measured 2026-10-24:** `/school/.../people/?keywords=` now redirects to `/alumni/` and drops
the keyword, and typing in the alumni search box sends you to people search filtered by
`currentCompany` = the college, which returns current students and staff, not alumni. Use
people search with the **school** filter instead (works, returns grad-year headlines and
mutual counts, Connect/Message state readable with `get_page_text`):

```
https://www.linkedin.com/search/results/people/?keywords={q}&schoolFilter=%5B%2214538459%22%5D
```

Adding a city to the keywords (`backend engineer bengaluru`) is the cheapest way to cut
students out of the results. The section below is the old method, kept for history.

### Finding them (verified 2026-07-30, now broken)

The alumni tab, which needs **zero profile visits** and therefore doesn't touch the
bulk-visit ban:

```
https://www.linkedin.com/school/indian-institute-of-information-technology-nagpur/people/?keywords={q}
```

3,051 alumni are on there. `?keywords=` works as a real URL param and searches title, keyword
and company, so drive it from the URL and never fight the UI. Verified gotchas:

- **The "Where they work" facets are useless.** The top entries are the college itself and
  campus clubs (CRISPR IIIT Nagpur, IOTICS CLUB, Crescendo, the T&P Cell). Company targeting
  has to come from the keyword box.
- **The pager is stale** — it says "Page 1 of 6" even when the keyword filter has cut the set
  to 10 results. Trust the `N alumni` count, not the pager.
- **Dedupe by name, not by URL.** The same person appears twice, once under a vanity slug and
  once under an `ACoAA…` URN slug.
- **`Connect` vs `Follow` on the card is the gate.** A card offering only *Follow* has no
  invite path on a free account: skip it, don't plan a message around it.

Each card already gives everything needed to decide, with no profile opened: name, degree,
full headline (company **and** grad year, e.g. `IIITN'25`, `IIIT N’25`), and the mutual count.
Extraction that works (class names are obfuscated, so walk up from the profile anchor):

```js
const seen = new Set();
[...document.querySelectorAll('a[href*="/in/"]')].map(a => {
  let n = a, box = null;
  for (let i = 0; i < 8 && n; i++) { n = n.parentElement;
    if (n && /·\s*(1st|2nd|3rd)/.test(n.innerText) && n.innerText.length < 600) box = n; }
  if (!box) return null;
  const t = box.innerText.replace(/\s*\n\s*/g, ' | ').replace(/\s+/g, ' ').trim();
  const name = t.split(' | ')[0];
  if (seen.has(name)) return null; seen.add(name);
  return { name, deg: (t.match(/·\s*(1st|2nd|3rd)/) || [])[1],
           mutuals: (t.match(/([\d,]+) other mutual/) || [])[1],
           canConnect: /\| Connect$/.test(t), headline: t, slug: a.href.split('?')[0] };
}).filter(Boolean);
```

**Queries to run** (one at a time, read the page, move on): company names worth working for
(`Google`, `Atlassian`, `Rippling`, `Zerodha`, `Razorpay`, `Coinbase`, `Amazon`…), then role
and stack terms (`SDE`, `backend`, `blockchain`, `founding engineer`, `Go`, `Rust`, `infra`,
`platform`, `AI engineer`), then `founder` and `CTO` on their own — an alumnus who started a
company is the single best row this lens can return, because he can hire directly.

### Who qualifies as a senior worth an ask

- **Graduated 2021–2025** — 1 to 5 years out. This is the sweet spot: campus memory is intact
  *and* they have referral rights. Read the grad year straight off the headline.
- **Currently at a product company or a startup**, in engineering. Service/consulting shops
  refer into a hiring pool, not a team; low value, deprioritise.
- **A founder or CTO alumnus outranks everything**, regardless of year. Route those to a direct
  ask, not a referral ask: they don't refer, they hire.
- **Skip current students and 2026 grads** (no referral power, they're competing for the same
  seats) and **skip anyone 8+ years out** who has no campus overlap to trade on.
- **One person per company per cycle.** Two simultaneous asks inside one company reads as
  spray-and-pray and can get both ignored. Queue the second as a backup.

### The two-stage mechanic (this is why the old pipeline stalled)

A senior is almost always **2nd or 3rd degree**, and on a free account **you cannot DM a
non-connection**. So a referral ask is never one message, it is a state machine, and every ask
needs the state tracked or it evaporates:

```
queued → invite-sent → accepted → ask-sent → replied | nudged | no-reply | closed
```

- **Stage 1, the invite.** Send a connection request. If LinkedIn offers the note box, use it:
  **300 characters hard limit**, and its only job is to make accepting obvious. Free accounts
  get very few notes, so when the box isn't offered, send the bare invite — the shared college
  plus 200+ mutuals carries it, and a bare invite from an alum is normally accepted.
- **Stage 2, the ask.** Only after they accept. This is the real message, drafted per the
  templates below. Written at the same time as the invite and parked in `inbox/referrals.md`
  so that acceptance is a two-second copy-paste rather than a fresh writing job.
- **Nudge:** one only, and only if they accepted the invite but never answered the ask, 7 days
  later, two sentences. Acceptance is consent to one nudge; never answering twice is not.
  Never nudged twice, and never a nudge to someone who ignored the invite itself.

### Volume

LinkedIn's own invite ceiling is ~100/week, but acceptance rate matters more than volume here.
**Cap: 8 invites per run, ~15–20 per week**, and no more than **5 stage-2 asks drafted per run**.
The rest go into `inbox/referrals.md` as `queued`. A thin, well-targeted set of asks that get
answered beats forty that get ignored and burn the college channel for everyone behind him.

### Output: `inbox/referrals.md`

One board, so the state survives across sessions. Every row, plus the drafted messages:

```
- **{Name}** — {role} @ {Company} | IIITN'{yy} | {2nd/3rd}° | {N} mutuals | state: {queued|invite-sent|accepted|ask-sent|replied|nudged|no-reply|closed} | {date of last state change} | {one-line why}
```

Anything a senior tells us (they're hiring, they're not, a team name, a hiring manager) is a
**pipeline input**: promote a "yes we're hiring" straight into `inbox/leads.md` scored A–F with
the why-field tagged `(warm: {Name}, alumni referral)`, and note a "no" on the row so the
company isn't re-checked for a while. That answer is worth more than any scout run, because
nobody else has it.

## Referral-ask drafts (the deliverable)
Every hit ends in a drafted message, not a suggestion. Voice rules from `profile/voice.md`
and `writing-samples.md` are binding: no em dashes, one checkable artifact with a number,
40–100 words, reads like Shivam typed it. Save to `applications/{company}/outreach.md` under
`## Referral ask — {Name} ({date})`, or `inbox/replies.md` if no folder exists yet.

**1st° referral ask (LinkedIn DM):** open with the real context of how they know each other
(from the map/headline; if unknown, say so plainly: "we connected a while back around X").
Then: the specific role, one proof point, and a small, decline-friendly ask:
> Hey {Name}, saw {Company} has a {role} seat open. I've been building exactly that kind of
> thing ({one-line proof with a number, e.g. "CodeSM runs untrusted code in 6 languages in Docker sandboxes, live at code-sm.vercel.app"}).
> Would you be up for referring me, or pointing me at whoever's hiring for it? No stress if
> that's awkward, happy either way. {link}

**2nd° intro ask (to the mutual):** even shorter. Name the target person/company, one line on
why it's a genuine fit, and make it easy to forward: include a 2-sentence blurb they can
paste. The mutual should have to do zero writing.

### Alumni templates (lens 3) — save to `inbox/referrals.md`

**Stage 1, the invite note (≤300 characters, count it).** It is not the ask. It exists only to
get accepted, so it names the shared college, what he does in one clause, and nothing else. No
link, no numbers, no request.

> Hi {Name}, I'm Shivam, IIIT Nagpur CSE '26. I do backend and infra work at poiro.com right
> now. Been following what you're up to at {Company} and would like to stay connected with
> seniors from campus.

**Opening check before any stage-2 ask (mandatory, re-run on the day it is sent).** Before
drafting or sending the ask, check the company's own careers board for a seat at his level
(new grad / SDE-1 / AMTS / 0–2 yrs, in India or remote-India) and read the posting's stated
years, because titles lie (Salesforce "SMTS/MTS" JR338172 asked for 6+ years).
- **Big company with a public board** (Workday, Greenhouse, Lever, Ashby, own careers site):
  no fitting opening → **do not send the ask.** Leave the row `accepted`, note
  `ask parked: no junior India opening on {date}`, and re-check each run. Opening found → the
  ask names that exact job ID + link and says the resume is attached. Measured 2026-10-23:
  Mahesh Vaishnav (Walmart) and Satyajit Ghosh (Eightfold) both answered the open ask with
  "send the job id", which spends the one ask for nothing.
- **Startup with no public board:** the open "is your team taking anyone on" question below is
  the right ask, because no board exists to check and a senior is the only way to find out.

**Stage 2, the ask (after they accept).** The whole design point: **ask the question whose
answer nobody else has, and attach the referral to it conditionally**, so one message does both
jobs and neither one is a dead end. Never open with "are you hiring" as a bare yes/no, never
open with "can I ask you something", and never make him read a resume to answer.

> Hey {Name}, thanks for connecting. Quick and blunt one, and a no is completely fine.
>
> I graduated IIIT Nagpur this year, I'm doing backend work at poiro.com, and I'm looking for
> a {role} seat. {one artifact with a number, e.g. "I built CodeSM, a sandboxed code execution
> engine for 6 languages on BullMQ + Docker, live at code-sm.vercel.app"}.
>
> Is your team at {Company} taking anyone on right now? And if there's anything open that fits,
> would you be up for dropping my name in the referral portal? Takes you two minutes and I'll
> send whatever you need. If it's not a good time, no stress, still glad to be connected.
> shivamworks.dev

Why it's shaped that way, and what not to "improve":
- **"a no is completely fine" up front.** Removes the social cost of ignoring him, which is the
  actual reason cold asks go unanswered.
- **"the referral portal" is deliberately concrete.** "Can you help me" needs them to invent
  the action. "Drop my name in the portal" is a two-minute task they've done before, and their
  referral bonus is on the other side of it.
- **The hiring question and the referral ask ride together.** If the answer is no, he still got
  the intel, which is the thing this lens exists to buy. Log it either way.
- **Two artifacts maximum, ideally one.** A senior at a big company is skimming on a phone.
- 90–130 words, no em dash, one live link, per `profile/voice.md`.

**Founder/CTO alumnus — direct, not a referral.** They can hire, so don't ask them to pass a
name to somebody else:

> Hey {Name}, Shivam here, IIIT Nagpur '26 (CSE). Saw you're building {Company}. I build the
> asset backend behind AI-generation surfaces at poiro.com, and on the side a Kubernetes-backed
> cloud IDE (Yuvro) and a sandboxed code execution engine (CodeSM). Are you adding engineers at
> the moment? shivamworks.dev

**The nudge (once, 7 days, only after an accepted invite):**

> Hey {Name}, just floating this back up in case it got buried. No worries at all if the
> answer's no or now isn't the time.

These are DMs Shivam sends himself. End of turn: list each draft, who it's to, what it asks,
where it's saved. Nothing is ever sent for him.

## Cadence and volume
- On-demand only. A normal run = one lens, not all of them.
- Max 2–3 referral asks drafted per run for lenses 1 and 2 even if there are more hits — asks
  are a currency; queue the rest in network.md with a `(hit, not yet asked)` tag.
- **Lens 3 runs on its own cadence and its own caps** (8 invites, 5 stage-2 asks per run,
  15–20 invites/week). It is the lens to reach for when the posting-driven scouts come back
  empty, which per `/linkedin-scout`'s measured facts is often.
- **Every lens-3 run starts by reading `inbox/referrals.md`**, not by searching: advance the
  rows that are already in flight (accepted invites needing their stage-2 ask, 7-day nudges
  due, asks to mark `no-reply`) before adding anyone new. A board full of `invite-sent` rows
  with nothing drafted behind them is the failure mode this file exists to prevent.
- Log sent asks and their outcomes via /outcome like any other channel (`channel: referral`),
  so the weekly review learns whether warm paths actually convert better here.
