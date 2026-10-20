# Learnings — the self-improvement ledger

> **Ownership note (2026-09-28).** This repo changed hands from Harsh Kasana to Shivam Verma.
> Every dated entry below 2026-09-28 was measured on **Harsh's** search: the pipeline mechanics
> (channel behaviour, parser bugs, research moves, ATS quirks) transfer, but anything about his
> stack, his outcomes or his constraints does not, so never quote those as Shivam's. Harsh's
> personal outcome, interview and profile sections are in `_archive-harsh/profile/`.
> (Fixed 2026-10-20: a find-and-replace had turned "Harsh" into "Shivam" in this note and in 12
> pre-handover lines, which made Harsh's history read as Shivam's.)

## Constraints (hard limits — check before batching sends)
- **Y Combinator / Work at a Startup caps applications at 5 per week** (per-account, not
  per-company). Applying through workatastartup.com/jobs/* or the WaaS profile-apply flow
  counts against it — applying via a company's own external ATS (Ashby, join.com, direct
  email) does not. Wifi Dabba (2026-07-24) used 1 of this week's 5. Check remaining quota
  before queuing more WaaS applies in the same week.
- **~40% of YC postings are `US citizen/visa only`** (146 of 360 on the 2026-07-26 run; of the
  eng-role subset it's the single largest cut). Unwinnable for anyone who needs US sponsorship (Harsh then, Shivam now) regardless of fit, and no
  job board surfaces it before you've read the JD. `scripts/yc-scout.mjs` drops them up front —
  360 postings scanned, 27 survived. Don't hand-browse YC listings; run the script.
- **`lastActive` beats posting age as a liveness signal.** YC exposes when a company last
  signed into Work at a Startup. Reqs sit up for years at active companies (a 2-year-old
  posting from a company that logged in 3 days ago is live), while a fresh posting from a
  company quiet for months is a ghost. Filter on company activity, not posting date.

This file is what makes JobOps evolve. `/outcome` writes here after every response and every
weekly review; every generating skill (tailor-resume, outreach, cover-letter, apply-pack)
reads it BEFORE generating. Nothing in here is permanent — entries get promoted (into
skill rules, voice.md, or facts.yaml) or deleted when proven wrong.

## What converts (update with evidence, keep counts honest)
<!-- Shivam's outcomes only, starting 2026-09-28. e.g. "founder DMs citing CodeSM got 2/5 replies from dev-tools startups" -->

## Outcome data
<!-- Filled by /outcome from applications/tracker.md. -->

## Interview performance
<!-- One section per real or mock interview, written by /interview-debrief. -->

## Profile updates pending
<!-- Facts Shivam states in conversation that belong in facts.yaml / stories.md. -->
- ~~Fill every TODO(shivam) in `profile/facts.yaml`~~ Done 2026-10-04: CGPA 7.51, notice 0 days
  (start immediately), US sponsorship confirmed. Salary, relocation, time zone, contract and
  take-home answers superseded by the 2026-10-20 quiz (see facts.yaml `knockout_answers`).
- ~~Raft-KV (Go)~~ Closed 2026-10-20: Shivam says it was never built. Never claim Raft or Go
  systems work. (`self-profile/context/skills.md` §7 still lists it; his file to delete.)
- facts.yaml re-synced 2026-10-20 against `self-profile/` (resume 2026-10-19). poiro.com is an
  **internship** on **MongoDB**, and the SHA-256 dedup there **never shipped** (prototype,
  removed). `stories.md` rebuilt from `self-profile/` the same day. **Still open:**
  `resumes/base.md` and the 7 applications listed below still carry the old claim.
- Open TODO(shivam) in facts.yaml (2026-10-20): poiro.com and klimb.io one-liners, Codeforces /
  AtCoder / X links, Hireflow application count, DeepDoc tuning count (175 vs 100+), hackathon
  project, exact current salary.

## Profile drift (2026-10-20) — facts.yaml had stopped matching its own source
- **facts.yaml was built once from Shivam's knowledge base and never re-synced**, while that
  knowledge base kept getting corrected. By 2026-10-20 facts.yaml still said full-time (it's an
  internship), PostgreSQL (it's MongoDB), klimb.io ending March (May), and a shipped SHA-256
  dedup at poiro.com (a prototype the team removed). Every skill trusts facts.yaml, so the false
  dedup claim reached the resume or email of **7 applications**: CyberAtlas, OpenAlex, SerpApi,
  Trackerbot, VLM Run, Colonist (draft answers) and Interview Resources (dossier).
- **Rule:** when Shivam says his knowledge base changed, diff `self-profile/` against facts.yaml
  and stories.md before generating anything. A "never claim" line per project in facts.yaml is
  what stops a corrected claim from coming back.

## First run on Shivam's profile (2026-09-29)
- **The scripted A/B grades were mostly wrong for him.** 11 A/B from HN jobs + boards + YC; on
  reading the JDs, 10 failed: US-timezone only (Stable), all-Staff seats (Nango), sales roles
  (QuestDB, Fin), Berlin onsite (Telli), 4+ years (Dalus, Supero). AI-agent keywords carry too
  much of the score. The best lead came from the *ungraded* HN monthly thread, not the graded
  channels. Until weights are retuned, read the HN thread's reachable non-senior comments before
  trusting a scripted A.
- **The HN post and the role page can state different bars.** Interview Resources' HN post said
  "curiosity matters more"; its role page says 4+ years. Always read the role page before
  grading, and quote both when naming the gap.
- **No resume upload means no tailor-resume.** When the form is name + email + one message, the
  message is the whole application; spend the time on the tech-read and the message instead.
- **Retuned the same day** (`scripts/lib/fit.mjs`, tiered `storyPoints`, reachability tiers):
  the 11 false A/B became 0 on a same-postings rerun, every one with a stated reason, and the
  one real A/B-grade seat on the grid (Seal, founding product engineer, any experience) held B.
  The geo gate's real bug was rule order: "work from anywhere within US time zones" and
  "fully distributed" on a Remote-US role matched as open before any region lock was checked.
  It is now explicit-India → worldwide → time-zone lock → region lock → weak culture phrases.
  Reachability backtest (now also over `_archive-harsh/inbox/leads.md`, 89 A/B) still drops 0.
- **A public product repo beats every other source.** Reading their actual route handler gave a
  question (what schedules the reaper cron) no one else applying will ask.

## Channel calibration (LinkedIn inbound DMs)
- **"AI Fellowship" / RLHF-eval recruiter DMs quote below-market rates by default.** Handshake
  AI's Soumi De pitched "up to $10/hr" for a role their own public posting lists at "up to
  $40/hr, depending on the project" (2026-07-28) — the DM template quotes the generalist floor
  regardless of the recipient's background. These are legitimate companies (real revenue, real
  recruiters) but gig/contractor work, not engineering hires: no team, no equity, no ladder.
  Worth a quick reply asking about a technical/domain-specific track (better pay, uses real
  skills) rather than either ignoring it or applying into the generalist pool at face value.

## Channel calibration (the source audit, 2026-07-30)
- **The pipeline's bottleneck was source selection, not pipeline quality.** 178 leads, 1 human
  reply. **138 of the 178 came from HN "Who is hiring" alone, 74% graded D/F, and geography was
  a factor in 58% of the dead ones.** A well-built machine pointed at a market Harsh mostly
  cannot be hired into. Fix was channels, not tuning: five crypto/remote-first boards added, a
  shared reachability gate run before any judgment pass (drops 105 of 201 keyword-matching HN
  postings, 0 of 20 historical A/B leads lost), and word-boundary keyword matching.
- **Never test a keyword with `includes()`.** Every scout had done it since the first one, so
  `defi` matched *undefined*, `go` matched *going*, `rag` matched *storage*. That is how an
  Android role and an advertising post scored as DeFi story fits. One shared
  `scripts/lib/keywords.mjs` with boundary regexes now owns this.
  **Third instance, in a different repo, 2026-08-01:** learn-ops' coverage matcher shipped with
  the same bare `includes()`, so `metric` matched *asymmetric* and filed a read about keyword
  matching under Observability — the tracker for the lesson reproduced the lesson. The reason
  this class of bug hides is that **over-matching never looks like a bug: too many results reads
  as coverage.** Only an assertion that a known-bad pair does *not* match will catch it.
- **A fix that lands in a shared module is only as wide as its call sites.** `keywords.mjs` was
  written as the single source of truth and its docstring says every scout imports it. `scout.mjs`
  and `board-scout.mjs` do; **`scripts/yc-scout.mjs` still has its own `STRONG`/`WEAK` arrays
  (lines 48/53) and still matches with `includes()`** — and the two lists have already diverged
  (yc-scout has x402/api/distributed, keywords.mjs has foundry/wagmi/viem/agentic/langchain).
  Worst case is `api` and `rag` as substrings: *storage* and *leverage* each score a STRONG `rag`
  hit worth +25, and 356 YC postings went through that matcher on 2026-07-30. Also worth noting
  where the test went — `reachability.mjs` shipped with a 91-line backtest; `keywords.mjs`, the
  thing that had actually been failing, shipped with a docstring and no test.
  **RESOLVED 2026-07-30:** yc-scout now imports `matchKeywords`/`matchStory`, its local lists are
  deleted, and `scripts/lib/keywords.test.mjs` (26 cases) locks the behaviour in. Three things
  the fix turned up that the original diagnosis missed:
  1. **The worse bug was the story-fit regex, not the STRONG lists.** yc-scout scored +25 with
     `/agent|llm|ai|crypto|web3|blockchain|defi/i` and no boundaries, so the bare `ai` alternative
     matched **em·ai·l**, **m·ai·ntain**, **tr·ai·ning**, **ret·ai·l** and **av·ai·lable**. +25 is
     a quarter of the score and it was the least guarded test in the file.
  2. **Deleting a dangerous keyword is the wrong fix; bounding it is the right one.** First pass
     dropped bare `ai` from the story set and that lost **16 of 31** genuine AI companies on the
     same day's run ("AI platform", "Voice AI", "AI Copilot"). Boundary matching keeps `ai` and
     rejects `email` at the same time. That is the entire argument for the module.
  3. **Exact matching silently dropped plurals.** `ai agent` did not match "ai agents for
     collections", `smart contract` missed "smart contracts", `llm` missed "llms". `boundary()`
     now allows one optional trailing `s`, which is safe because the `s` sits inside the match
     (*storage* still cannot satisfy `rag`).
  Measured after the fix on the 31 postings that survived today's filter: story-fit agrees with
  the old regex on all 31 (no true positives lost) and one phantom STRONG hit is gone (ParadeDB,
  a Postgres storage role, was scoring `rag` out of "sto·rag·e"). **The false-positive rate over
  the full ~356-posting scan was not measured, only over the 31 survivors, so treat pre-fix YC
  grades as suspect rather than quantified.**
- 🥇 **When a careers page shows a salary and nothing else, the JD is inside the embedded form.**
  Clouted (2026-07-31) renders every posting client-side off a Webflow CMS: `curl` and WebFetch got
  the title, "$140,000 – $210,000" and "Full-time", and **zero** lines of responsibilities, stack,
  location or requirements. All of it lived in the **Tally** form the page embeds. Grepping the raw
  HTML for `tally.so/embed/{id}` and opening `tally.so/r/{id}` in the browser returned the entire
  posting *plus* every application question. That is where the deciding facts were: **"Location: San
  Francisco, CA (Hybrid)"**, "5+ years", and the two knockouts ("legally authorized to work in the
  US", "require sponsorship"). **Generalize it:** on any careers page whose JD body is empty, grep
  for an embedded form host (tally.so, typeform, ashbyhq, greenhouse, lever, join.com) before
  concluding the posting is thin. A lead was 20 minutes from being graded on a salary number alone.
- 🚨 **Read every role on the careers page, not just the one the post advertised.** Clouted's
  LinkedIn post sold a **Founding Software Engineer** that turned out to be SF-hybrid with a US-auth
  knockout. The same careers page's **general application** states "Location: Various / Los Angeles,
  San Francisco, Manila, or **Remote**", names "Engineering & Product: full-stack engineers, data/ML,
  AI/agent builders", and says they "hire for talent and drive over pedigree". Same company, same
  day, one door shut and one open. The advertised seat is a marketing artifact; the careers page is
  the actual inventory. **An "Open Application (pitch us a role!)" line is not filler** — it is the
  only channel in this pipeline where the candidate names the seat instead of matching a JD.
- **A rebrand hides the company's real geography.** "Clouted" reads as a Los Angeles AI startup
  until the site footer says **"Clout Kitchen Holdings Inc. d/b/a Clouted"** — Clout Kitchen being a
  Manila company. That is why Manila is a listed office and why 4 of its non-US roles carry PHP
  salary bands, which in turn is why remote-Asia is a plausible ask there and would not be at a pure
  SF startup. **Check the footer's legal entity name on every dossier.** It is one line and it
  changed the grade here.
- **LinkedIn's Jobs-tab keyword search is broken for niche stacks; its post/content search is
  not.** Measured in one session: `solidity` + past-week + date-sort + India + remote claimed
  100+ results and returned a Frontend role, an ElectronJS role and a full-stack role — zero
  Solidity. Quoted as `"solidity" OR "smart contract"` it returned 7 rows, all Promoted ads. The
  same session's *content* search for `hiring a founding engineer` returned a real 58-minute-old
  post as row one. **Posts are the discovery channel on LinkedIn; use the Jobs tab only
  company-scoped.** Also: LinkedIn's class names are obfuscated now — `feed-shared-update-v2` and
  `data-chameleon-result-urn` both match zero nodes; `main li` still works.
- **On X, check a VC/fund bio two ways before drafting a DM.** Does the fund's own site link that
  same handle, and when did the fund last post? A profile reading "Co-founder {Fund}" used
  @LuaVentures while the fund's site listed @LuaLab_Help (different entities), and the fund's
  account had been silent 2.7 years. Both checks are one click and decide whether the DM is four
  sentences or forty. This became lens 5 of `/x-scout` — person-first DMs, where the profile is
  the lead and there is no hiring post at all.
- **Referral asks should not wait for a posting.** The old referral path was gated on finding an
  opening first, which is why it stayed empty: most companies hire without posting. `/network-scout`
  lens 3 now asks IIIT Nagpur seniors directly whether their team is taking anyone on, so the
  answer *is* the lead source. Two-stage by necessity (a free LinkedIn account can't DM a
  non-connection): 300-char invite note, then the real ask on accept, with state tracked in
  `inbox/referrals.md` — otherwise accepted invites just evaporate.

- **Drive the alumni engine off role and stack terms, never off seniority-sounding titles.**
  First lens-3 run (2026-07-30): `?keywords=founder` on the IIIT Nagpur alumni tab returned 12
  rows that were almost all *current students* running campus ventures ('27, "final year"), who
  have no referral power at all. `?keywords=backend engineer` returned exactly the target
  profile — Groww, Mindtickle, Citi, Purplle, Josh Talks, AlphaGrep, IIITN'24/'25, 250 to 500
  mutuals each. `?keywords=blockchain` was diluted and produced no crypto-company alum.
  **`?keywords=founding engineer` is the query `founder` should have been:** 32 alumni, four of
  them the actual first engineer at a real startup. That person personally knows every open seat
  in the company, which is the whole thing the alumni engine is trying to buy. Run it every pass.

- **The warm channel replies. The cold channel does not.** First real evidence, 2026-07-30:
  8 alumni invites went out at ~12:50, **Sachin Yadav (Uptitude) accepted within 15 minutes**, and
  Artur Chmaro (vlayer, 1st°) **answered a cold-ish DM in 18 minutes**. Twenty-four hours later
  (2026-07-31) the invite number closed at **3 accepts out of 8 cold 2nd-degree invites**, with one
  stage-2 ask already out — a ~38% accept rate on a channel that costs one 300-char note per person.
  That makes lens 3 the highest-conversion channel in the system by a wide margin. Compare that to the cold
  application channel: 29 sends, 0 human replies, 3 template rejections. Same person, same
  artifacts, same voice; the only variable is whether there was a shared context (campus, or an
  existing connection). **Reply rate is a property of the channel, not of the message.**
- **A "no" from a warm contact is worth more than silence from ten applications, because it comes
  with a reason.** vlayer's was "we are aiming for more mature projects with big volumes atm" —
  that is a company moving upmarket, not a company that disliked the candidate, and it tells you
  not to re-check them for a while. Record the reason on the row; never re-ask.
- **LinkedIn's message composer discards the draft when you switch threads.** Measured directly:
  typed a reply to Artur, clicked into Sachin's thread, came back and the box was empty. It is not
  a per-thread draft store. **When staging more than one DM, put each thread in its own tab.**

## Channel calibration (the follow-up batch, 2026-08-01)

The first time five follow-ups came due at once, and the useful finding is not about the emails.
**Two of the five had no second touch available at all**, and that was decided at *apply* time,
months before the follow-up clock existed.

- 🚨 **Whether a lead can be followed up is a property of the channel, and it should be graded
  before applying, not discovered seven days later.** Of five overdue rows: Pango had a real
  founder address in a real thread (clean follow-up), Armatrix and Certa needed a *different*
  channel found from scratch, and **TechHavenLabs and Binance had none and went straight to
  `ghosted` on channel exhaustion rather than on silence.** A form-only or Easy-Apply send is a
  one-touch lead by construction. That is not a reason never to send one, but it means a
  form-only B and an email-reachable B are not the same lead, and the grade should say so.
- **"Pending" is not "silence", and confusing the two invents a touch that never happened.**
  Armatrix sat as `pending-connection` for 10 days; Vishrant Dave's profile still read 2nd° and
  Pending on 2026-08-01, so the DM was never delivered and never seen. There was no first touch
  to follow up on. The fix was a channel switch (contact@armatrix.in, published on their own site
  with real MX, so verified rather than guessed) and the clock restarts at touch 1.
- **A bare "just bumping this" is the weakest possible second touch and it was sitting
  pre-written in two folders.** It asks the reader to re-read the first email and gives them
  nothing new to react to. The rewrite carries a *second* artifact and restates the wedge in the
  company's own problem terms, then offers an explicit exit ("if it's filled, say so and I'll
  stop"). Draft follow-ups this way from the start; a placeholder bump written at apply time is
  worse than no placeholder.
- **Re-name the gap you disclosed.** Certa's application named the AWS gap openly, so the
  follow-up names it again. Dropping it on the second touch reads as hoping they forgot.

## Channel calibration (all-scouts run 2026-08-01)
- 🚨 **`OR`-ing quoted phrases in LinkedIn *content* search silently breaks phrase matching.**
  `"hiring a smart contract engineer" OR "hiring a solidity" OR "looking for a solidity
  developer"` returned, alongside one staffing post, **two "Solid Waste Management Engineer"
  roles** — 9–12 years, landfill management, composting. The quotes work on a *single* phrase
  (measured 2026-07-30 and still true today); the moment they are OR'd, LinkedIn falls back to
  loose token matching and `solid` matches `Solidity`. **Same rule as the Jobs tab: one plain
  phrase per search.** This is the content-search twin of the keyword bug in `keywords.mjs`.
- **X lens 2 ("who's hiring" threads) is now measured dead, twice.** The query returned
  *literally zero results* — not noise, no results at all. Second consecutive run confirming it.
  It should be dropped from `/x-scout` rather than re-run.
- **Both channels' noise has the same tell and it is one field: who posted it.** Every drop
  today was an agency recruiter, an HR consultant with a gmail apply address, or an aggregator
  reposting through a jobs site. Every keeper was posted by someone whose headline puts them
  *inside* the named company. Checking the poster's affiliation first is cheaper than reading
  the JD and it discards ~80% of both feeds.

## Channel calibration (alumni engine, 2026-07-31)
- **A 2nd-degree alumni invite that gets a *written reply*, not just an accept, is the real
  signal.** Soumalya Roy accepted and wrote back within a minute; every other accept that day was
  silent. **Founding engineers are the highest-value target for the ask-first channel** — they
  know every open seat months before a posting exists. Also: **the stage-2 ask has to be rewritten
  when they reply**, because a "thanks for connecting" opener reads wrong as an answer to a
  greeting (event `20260731T133833-43e500`).

## Channel calibration (from the all-channels run 2026-07-28)
- **LinkedIn Jobs `sortBy=DD` destroys keyword relevance.** Sorting by date makes LinkedIn
  return essentially every remote-India posting in recency order and ignore the query: a search
  for `AI agent engineer` returned an Image Annotator, a Coding Instructor, a Gujarati photo
  study and a Lead Generation Specialist. Default (relevance) sort respects the keywords. **Use
  default sort plus `f_TPR=r604800` for freshness; never `sortBy=DD` with a broad keyword.**
- **Boolean `OR` inside LinkedIn Jobs keywords returns zero and fails silently.** The query
  `"AI agents" OR "LLM" backend engineer` produced a "Jobs you may be interested in" fallback
  block, which looks like results and is not. If the header stops naming your query, you got
  zero. Use one plain phrase per search.
- **Agency listings can outscore real companies on stack fit and still be un-researchable.**
  Scoutit's Full Stack Engineer (2026-07-28) was the tightest literal stack match in weeks, but
  it is a sourcing agency posting for an unnamed "client: Bessemer Venture Partners", so there
  is no company to research, no founder to email, and no dossier possible. Grade these on the
  apply-and-see path only, and never spend research time trying to identify the client.
- **The whole X run produced zero L1 leads, and that is the normal outcome.** 8 posts across
  two intent-phrase queries: 5 aggregator/hashtag-spam accounts, 1 recruiter with no named
  client (Plexus, crypto), 1 real-but-walled (Kalepa, Warsaw, work authorisation required,
  Staff level), 1 L2 (ScreenSentinel, 3 followers, Google Form). **A cheap L2/L3 check that
  worked: follower count and join date on the poster's profile.** A company claiming "one of
  the most ambitious AI products" with 3 followers and 3 posts is answering the question for
  you. Lens 4 (his own mentions) was all social banter, zero hiring inbound.

## Channel calibration (Work at a Startup reach-out box, 2026-08-02)
- **YC's reach-out modal pre-judges the application and tells you so, before you type.** On
  Kontigo's founding-engineer seat the box carried an orange note: *"It looks to us like your
  qualifications might not match this job. We recommend double-checking the qualifications and
  using your best judgement about whether it makes sense to apply anyway."* It is reacting to a
  stated bar (here, 3+ years vs Harsh's ~1.5), and the footer adds that applications "may be
  evaluated using AI-assisted tools". **It is a warning, not a block, and a human still reads
  the message.** Two consequences worth keeping: (1) treat it as free intel about which stated
  requirement their matcher is weighting, and (2) **answer it inside the message rather than
  letting the filter get the last word** — the Kontigo draft closes with "your form already
  flagged that at me, so I'd rather say it than have the filter say it", which converts their
  objection into evidence of self-awareness. Do not soften the honest number in response to the
  warning; that is exactly the wrong direction.
- **The reach-out box has a 50-character minimum**, so it is a real message, not a note field.
  Budget for it like a DM (~100 to 140 words) and open by naming any email already sent, or two
  touches read as one template firing twice.

## Channel calibration (from /x-scout run 2026-07-26)
- **X "who's hiring" threads are the opposite of HN's.** Searching `("who's hiring" OR "hiring
  thread")` on X returns *job seekers* asking for work, not employers offering it. Lens 2 of
  `/x-scout` produced zero leads and should be deprioritized or dropped; HN's thread culture
  does not transfer to X.
- **HN's `tags=job` corpus catches YC postings the YC grid structurally cannot, and it is not a
  one-off.** Kontigo (S24, founding engineer, will sponsor, remote) came in through
  `hn-jobs.mjs` on 2026-08-02 and was absent from the same day's `yc-scout.mjs` output —
  the second consecutive week that happened. Cause is not a bug: the public grid caps at ~50
  results per role×location page with no pagination, so a live, HN-promoted YC posting can be
  permanently invisible there. Measured the week before: **0 of 13 HN-jobs companies appeared in
  that day's yc-scout run.** The two are separate corpora (job *stories* vs *comments* on the
  monthly thread), not two views of one, and neither substitutes for the other.
- **X caught a YC company that `yc-scout.mjs` structurally cannot.** Hub (YC S26) was found via
  the founder's own post, but is missing from the script's output for two reasons worth fixing:
  (1) the location slug grid covers only US cities + `india`/`remote`, so Europe-scoped roles
  never appear, and (2) the role's `visa` field reads `US citizen/visa only` on a France-only
  posting, which the hard filter drops. **The visa filter has a false-negative mode on non-US
  roles where the field is mis-set.** Treat the two scouts as complementary, not redundant.
- 🚨 **A keyword scorer cannot see an idea, and on X that is the whole job.** Second measured
  confirmation: an LSM-tree KV database built from scratch in TypeScript — the best post of the
  run — scored **−21** (nothing matched any keyword list, plus a staleness penalty), while a
  question-bot's "what are you building this weekend?" scored **16**. The lesson for `/x-scout`:
  running a hunt with the score **gate off** is load-bearing, not a nicety. Use the score to
  order the reading, never to drop posts before a human has looked
  (event `20260802T055249-9459f9`).
- **Account join date is a cheap, strong scam check.** @Arbmarket pitched an Arbitrum protocol
  role from an account created in **February 2010** (Arbitrum launched 2021) while also posting
  token-pump promos. Repurposed/purchased account. Check join date against the company's
  claimed founding date on every crypto lead.
- **A real-looking founder post can still be a dead role.** JurisIQ's founding-backend post was
  legitimate, and closed 21 hours later at 300 applications. On X, check the poster's *newer*
  posts for a close/update before drafting anything.

## Channel calibration (HuntingCube, first run 2026-07-30)

- 🥇 **HuntingCube's browse page is a client-rendered shell over `POST /api/jobs/search`, and the
  API returns far more than the page shows.** No login, no key. Body shape is
  `{filters:{}, page:1, limit:100}` — **the `filters` key must be present or the endpoint 500s with
  `"Failed to perform job search"`**, which is why every obvious guess (`{query}`, `{keyword}`,
  `{page,limit}`) looks like a broken API. `pageSize` is forced to 100 and cursor pagination is
  `pagination.nextSearchAfter` echoed back as `searchAfter`. **Full index: 9,814 postings in 99
  requests**, each carrying fields the rendered page never displays: `clientName`,
  `yearsOfExperienceMin/Max`, `budgetMin/Max`, `primarySkills`, `secondarySkills`, `status`,
  `createdAt`, `stageCounts`, `hiringTeam`, `noPoachCompanies`, `consultingFees`, `rewardScheme`.
  `filters:{query:"..."}` does work but is a fuzzy ES multi_match that returns 1,020 hits for
  `solidity` with unrelated titles at the top — **pull the whole index and match locally with
  `scripts/lib/keywords.mjs` instead of trusting their relevance.**
- 🚨 **88% of what HuntingCube serves is dead. 8,660 of 9,814 are `status: closed`**, 714 `on_hold`,
  59 `cancelled`, and only **381 `active`** — and the browse UI happily renders closed reqs with an
  Apply button and no visible state. Nothing on that page tells you. **Filter `status === 'active'`
  before reading a single JD**; it turns a 9,814-row board into a 381-row one, which is small enough
  to grade by hand in one pass.
- **`clientName` is populated but not trustworthy, and it fails in the flattering direction.** The
  index lists a "Fullstack Developer" at **Google, Chandigarh/Panchkula, ₹8-15L** and a "Backend
  Developer" at **Adobe, Bangalore, ₹20-50L**. The second is plausible, the first is not a Google
  req by any reading. This is a recruitment marketplace (the schema has `consultingFees` and
  `rewardScheme`), so the client field is whatever the posting agency typed. **Verify the company
  on its own careers page or LinkedIn before writing a dossier line that names it.**
- **The board's shape: enterprise/services India hiring, on-site, senior-titled.** Zero real web3
  roles among the 381 active (the one `solidity` keyword hit was a Java req at Guardant Health,
  keyword-stuffed), almost everything On-site, and the modal experience band is 5-9 years. **Its
  actual value to this pipeline is the AI/agentic cluster**, which is dense and freshly dated, plus
  the salary bands, which are stated in structured fields — the only channel in the repo where comp
  is a number before any conversation happens.
- **A company appearing 12 times in one day's postings is a hiring-expansion signal, and the API
  makes it visible for free.** Deutsche Telekom Digital Labs has ~12 active AI/agentic reqs all
  dated 2026-07-29 (agentic, full-stack AI, AI backend, frontend AI, Java+AI). Grouping the active
  set by `clientName` is a `/signal-scout` move that costs one line of code and needs no funding
  news at all. **Confirmed 2026-08-04, applied:** cross-checked the cluster against Instahyre,
  independent of HuntingCube, per the `clientName`-is-untrustworthy warning above. It's real and
  bigger than the HuntingCube view showed: Instahyre lists Lead AI Engineer and Director of
  Engineering (Agentic) in the same cluster, so this is a multi-level team build, not a batch of
  IC backfills. **A JD with no named hiring manager isn't a dead end — theorg.com's team pages
  found the actual target (Anurag Tiwari, Head of Talent Acquisition scoped explicitly to GenAI
  hiring) in one lookup**, which is now a standard move for any board-sourced lead with no name on
  the posting itself.

## Research moves (2026-07-30)

- 🚨 **Two "independent startups" in this pipeline turned out to be ventures of the same investor's
  studio, and nothing on either job post said so.** Patenova (applied 2026-07-27) and Envelon AI /
  LitigationVault (2026-07-30) are both **PatentVC** in-house ventures — Raj Abhyanker, 3000 Sand Hill
  Rd — and `applications/patenova/dossier.md` had already named LitigationVault as a PatentVC
  initiative six days earlier. **The generalisable tell: on a studio venture, the founder's LinkedIn
  lists the studio as their employer, not the startup they're named as CEO of.** Dhruv Channa's
  profile reads "Founder & CEO - Envelon AI" with **PatentVC** in the company field, exactly as Luke
  Butler's did for Patenova. Three more shared markers, all cheap to check: LinkedIn company page
  reads **0-1 employees**, the page's **website field points at a different brand** than the job post,
  and the domain is **months old** (`envelon.ai` 2026-06-11, `litigationvault.ai` 2026-03-31).
  **What to do about it:** check the founder's employer field before writing a dossier, grep
  `applications/` for the investor's name (that one grep would have caught this in seconds), and if
  it's the second application into the same studio, **name the overlap in the message** rather than
  hope the shared reviewer doesn't notice.

- **Google Workspace MX records are the cheapest proof that an apply address is real**, and they
  are worth checking on any company with no web presence. Sarvya Sampanna had **no site (404 over
  HTTP, self-signed cert over HTTPS), no MCA registry entry, and no LinkedIn company page**, so
  every other signal said "unverifiable". `dig +short MX` returned `aspmx.l.google.com`: somebody
  pays for that mailbox and reads it. That single check is the difference between "don't bother"
  and "worth exactly one email".
- **An IndiaMart profile is a real research source for small Indian companies, and its URL slug
  can identify the entity.** The only trace of Sarvya Sampanna was
  `indiamart.com/sarvy-sampanna-h-r/` (the slug itself contains "h-r"), which gave the legal name,
  GST year, city, proprietor name and full service list. **The service list is the tell:** software
  development sitting next to **SEO and "business promotion services"** means agency, not product.
  Add IndiaMart/ZaubaCorp to the check order for any Indian company with no site.
- **A surname match between the job poster and a company registry contact is a strong signal that
  the "client" is the poster's own shop.** "Neeraj Pande" posted the role; the entity's IndiaMart
  contact is "P Pande (Proprietor)". That reframed a "founding engineer at a B2B procurement
  marketplace" into "first product hire at a 9-year-old services shop, or a client placement", which
  no amount of reading the job post would have surfaced.
- **For a growth/DevRel application, list the company's public repos by star count *ascending*.**
  The wedge is their best-but-ignored artifact, not their flagship. Entelligence AI posted two seats
  on X with no careers page and no form, so a DM was the only channel and every other applicant was
  going to lead with the same praise for the main product. `Entelligence-AI/skills` holds *entloop*,
  an MIT-licensed Claude Code skill that loops a PR to a 5/5 review — genuinely good, **0 stars**,
  untouched for two months. Naming that as a **distribution** problem rather than a product one is
  both the proof of having actually looked and a demonstration of the job being applied for. Sorting
  descending finds what everyone already knows about; ascending finds the thing you can be useful
  about in the first sentence (event `20260730T083903-42ce26`).
- **When a company is unverifiable, the correct application has no "why us" paragraph at all.**
  Sarvya Sampanna's email is the first in the repo written without one, deliberately: no site, blog
  or changelog exists, so every sentence of company-specific flattery would be invented, and an
  invented one is worse than none. Lead on artifacts and stack fit, and put the two disqualifying
  questions in the body instead of saving them for a reply that may not arrive.

## Research moves (2026-07-31)

- 🚨 **A careers page that renders only a title and a salary means the JD lives inside the
  embedded form.** Clouted's page gave `curl` the title, the salary band and "Full-time" and
  nothing else; the entire JD *and every application question* sat in the Tally form the page
  embeds. Grep the HTML for `tally.so/embed/{id}` and open `tally.so/r/{id}`. That is where
  "San Francisco, CA (Hybrid)" and the US work-authorization knockout were — the two facts that
  decided the whole application. Generalize the grep to typeform / ashby / greenhouse / lever
  (event `20260731T025315-b8a632`).
- **Apply to the open application, not the seat the hiring post advertised.** Clouted's
  advertised Founding Software Engineer is SF-hybrid with a US-auth knockout; the *same* careers
  page's general application says "Various / Los Angeles, San Francisco, Manila, or Remote" and
  names engineering explicitly. Same company, same day, one door shut and one open. **The
  advertised seat is a marketing artifact; the careers page is the real inventory**, and an
  "Open Application (pitch us a role!)" line is the only channel where you name the seat instead
  of matching a JD (event `20260731T025315-696b7c`).
- 🚨 **A board's structured Country field can be stricter than the JD prose, and the scrape
  misses it.** Wonderdog was graded **B** on "geo unknown, not blocked" because board-scout
  captured the WWR job *body* and never the listing's structured Country field, which reads
  Canada + USA. The prose mentions location nowhere. This is the inverse of the MSPilot lesson
  (body stricter than the field). **Read the rendered listing's structured fields before writing
  any geo grade** (event `20260731T025145-37a619`).
- **Three `curl -I` calls are a full stack dossier.** Wonderdog's architecture came entirely from
  response headers: `server: Vercel` + `x-nextjs-prerender` + `vary: rsc` = Next.js App Router;
  `x-clerk-auth-reason` = Clerk, and **its value separates a production instance
  (`session-token-and-uat-missing`) from a development one (`dev-browser-missing`)** — their
  internal CRM runs dev while the AI product runs prod. Separately,
  `content-security-policy: frame-ancestors` leaked two undisclosed company domains
  (event `20260731T025145-04a782`).
- **A threshold with no stated noise floor is the recurring bug, not the matching logic.** Three
  instances in a fortnight are one shape: this repo's bare-`ai` regex scoring +25, x-ops' +45
  circle bonus clearing the bar on relationship alone, and a training book's 200 kcal weekly rule.
  The categories were right every time; what was missing was **the instrument's noise floor,
  written in the same units as the threshold, next to it.** Applies directly to every scout
  weight in `scripts/` (event `20260801T022241-26760a`).

## Research moves (2026-08-02, Kontigo)

- 🚨 **The posting's own numbers can be the stalest thing in the dossier.** Kontigo's YC page
  said ~10 people and a $40K–$120K band; the company had closed a **$20M seed two months
  earlier** and claims $1B+ in payment volume. A YC job card is written once and rarely
  re-edited, so treat headcount and salary on it as *when it was posted*, not as current. The
  practical consequence: the salary answer asks what the band means **now**, post-round, instead
  of anchoring to a number that predates the money (event `20260802T053248-fb7095`).
- **The person you most want to write to is often named nowhere on the posting.** Kontigo's CTO
  appears on neither the JD nor the YC company page and surfaced only in a **compliance vendor's
  press release**. Vendor/partner press releases quote titles that a company's own site never
  publishes — worth a search pass on any lead where the JD names no engineering leader
  (event `20260802T053248-fb7095`).

## Research moves (2026-08-02, Scenr)

- 🥇 **A Binary / apply.so form hands you the entire posting in one `curl`, including fields the
  rendered page never shows.** `curl https://binary.so/{id}` returns a Next.js flight payload
  containing the full JD body, **every question with its exact helper text and field ID**, the
  option lists for selects, and three timestamps: `createdTimestamp`, `publishedTimestamp` and
  **`lastUpdatedTimestamp`**. Scenr's read created 2026-07-28, published 07-29, **last updated
  yesterday** — which is a far better liveness signal than posting age. It also exposed
  **`multipleSubmissions: false`** and `emailVerificationRequired: true`, i.e. *one shot, no
  correcting a mistake*, which changes how the whole application should be prepared and is
  invisible in the UI until you have already submitted. Same family as the Tally and Ashby
  lessons: **the deciding facts live in the embedded form's payload, not the page.** Add
  `binary.so` / `apply.so` to the grep list.
- 🚨 **The anti-AI warning has a softer cousin and it should trigger the same rule.** DualEntry's
  was "AI-generated answers will be auto disqualified". Scenr's is *"Write in your own words, no
  AI polish needed. Rough, real and specific is what we want. Generic answers won't advance."*
  No stated penalty, so it is easy to read as a tone note and generate anyway. **Treat it as the
  hard version.** The `do_not_autofill` + `answers-raw-material.md` path now applies to any
  instruction asking for the candidate's own words, not just to explicit disqualification
  threats. Weigh it against what the company *is*: Scenr sells a product whose entire purpose is
  detecting the gap between what an engineer says and what they can do, and their homepage case
  study is a candidate who cleared two verbal rounds and then could not debug a database. The
  cost of generating there is not a style penalty, it is the whole application.
- **`/signup` returning 404 while `/login` returns 200 is a ten-second read on company stage.**
  `app.scenr.io` is a real Next.js console with working `/login` and `/scenarios` routes and **no
  signup route at all**, so the homepage's "Try It" CTA lands a visitor on a wall and the only
  real funnel is the founder's cal.com link. That is not a bug to mock in outreach, it is
  evidence the company is pre-self-serve and every customer today comes through a founder call.
  Cheaper than reading a pricing page. Probe `/signup`, `/login`, `/pricing` on any app subdomain
  before writing the momentum section.
- **A founder's non-fork repos are the only ones that mean anything, and the fork list will lie to
  you in the flattering direction.** Jenish Togadiya's GitHub showed `job-ops` ("DevOps principles
  applied to job hunting"), `hive` (agent framework) and a Rust Claude Code implementation, which
  read as an extraordinary set of overlaps with this repo. **All three are forks.** Filtering to
  `fork == false` left the real signal, which was still strong and was different: `Redis-
  Implementation-Rust`, a from-scratch Kotlin HTTP server, and a k8s `kind` homelab pushed six
  weeks before the company's domain was registered. **Always filter `fork == false` before
  writing a single line of common ground**, or the dossier ends up claiming someone built
  something they starred.

## What didn't work
<!-- e.g. "leading with hackathon wins got 0/4 replies from backend teams — leads now open with the Go/Terraform story" -->
- **Self-reported /ats-score ran ~30 points hot** (airCFO: self 87, Resume Worded 55, Jul 2026).
  The rubric scored prose quality and missed mechanics. Fixed by adding countable pre-checks
  to /ats-score: verb-first openers, repeated verbs, bullets without numbers, buzzword hits,
  missing sections. **Treat the external grader as the gate, not the self-score.**
  Confirmed: same content rebuilt against the fixed rubric scored **77** on Resume Worded
  (55 → 77), so the mechanics were the whole gap — not the writing.
- **Dropping the Achievements section to make room cost more than it saved.** The grant,
  hackathon placements, and bounties are what automated graders read as leadership/drive
  signal. Cut bullets, never sections.
- **Noun-phrase bullet openers** ("RAG pipeline that turns…", "3-service backend with…") were
  the single largest mechanical penalty. Every bullet now opens with a past-tense action verb.

## Research moves that produced real leverage
- **A dead company domain is not evidence of a dead company. Check the LinkedIn company page's
  own website field.** Patenova (Jul 2026) was parked as unverifiable for 6 days because
  `patenova.ai` doesn't serve. Its LinkedIn About page lists the website as **patentworth.ai**,
  which is a complete live product. The brand on the job post and the brand on the product are
  often different at pre-launch companies. **Check the company page website field before grading
  a lead down for "no public footprint."**
- **WHOIS the domain on every unfamiliar company.** `whois patenova.ai` returned registrant
  **LegalForce RAPC Worldwide, P.C.** (a patent law firm), which unwound the whole story: the
  "VC-backed startup" is an in-house venture of that firm's IP investment arm, at the arm's own
  Sand Hill address. Registration date also dates the venture. Cheap, fast, and it surfaces
  parent-company relationships that no job post will mention.
- **🥇 Actually using the product is the highest-yield research step there is, when a free tier
  exists.** Five minutes on patentworth.ai produced the single best outreach asset in the repo so
  far: their *own homepage showcase patent* (Samsung quantum-dot **color filters**) is classified
  in domain **"Agriculture"**, and because the valuation is expressed as `9.9× an Agriculture
  domain baseline`, the wrong label produces the wrong price. That one finding beat the résumé
  entirely on a lead where the résumé could not compete (573 applicants, and a genuine ML-modeling
  gap). **Promote this: `/company-research` should always try the free tier and look for a
  specific, checkable defect, not just read the marketing copy.** A bug you can name is worth more
  than any amount of "I admire what you're building."
- **Check company headcount on the LinkedIn company page, not the job post.** Patenova reads
  "0-1 employees, 1 associated member" whose function is **Business Development**. That reframed
  "founding engineer" into "employee #2, only engineer, non-technical founder, no technical
  mentor" — a bigger risk factor than the skills gap, and invisible from the posting alone.

## Tooling shortcuts worth reusing
- 🚨 **Greenhouse's "Location (City)" field is a Google Places autocomplete widget, and the
  extension autofill can't fully satisfy it.** Sourcegraph (2026-08-05): the box showed "Please
  enter your location" and blocked submit even after the extension filled text into it. The
  field only registers as answered once a real suggestion is clicked from Google's live
  dropdown (giving it a place_id/lat-lng object), which a programmatic value-set never
  triggers, and which an ad blocker on the Maps/Places API domain can suppress entirely even
  for a human typing by hand. Fix at the source: `profile/facts.yaml: identity.city` was blank
  (only `location: India` existed, no city), now set to "New Delhi, India" so future pack.json
  files at least have a value to try. **But the real fix is manual: click the field, type by
  hand, wait for the dropdown, and click a suggestion** rather than trusting autofill or a
  tab-away. Expect this on any Greenhouse board with a location field, not just this one.
- 🚨 **A job board's structured fields can be stricter than its own JD prose, and the scrape can
  miss them.** Wonderdog (WWR, 2026-07-31) was graded **B on "geo: unknown, not blocked"** because
  `scripts/board-scout.mjs` captured the JD body and never captured the listing's structured
  **`Country`** field, which reads **Canada + USA**. The prose mentions location nowhere. Same
  class of error as the MSPilot lesson, inverted: there the body was stricter than the field, here
  the field is stricter than the body. **Rule: before writing a geo grade off a board scrape, open
  the rendered listing and read the structured fields.** Worth teaching `board-scout.mjs` to pull
  WWR's `Country`/`Region` chips into the JSON, since geography is the single most common reason
  leads die.
- 🥇 **Three `curl -I` calls are a stack dossier.** Wonderdog's whole architecture came from
  response headers, with no browser and no guessing: `server: Vercel` + `x-nextjs-prerender: 1` +
  `vary: rsc, next-router-state-tree` = Next.js **App Router** on Vercel;
  **`x-clerk-auth-reason`** = Clerk auth, and its *value* distinguishes a production instance
  (`session-token-and-uat-missing`) from a **development** one (`dev-browser-missing`). Their
  internal CRM is on a dev instance and their AI product is not, which is a specific, checkable,
  ten-second-verifiable observation to raise in a conversation. Run `curl -sI` on every subdomain
  before writing a dossier.
- 🥇 **`content-security-policy: frame-ancestors` leaks a company's internal org chart.**
  `app.wonderdoghealth.com` listed `spark.wonderdoghealth.com`, `spark.wonder.dog`,
  **`spark-dev.wonder.dog`** and **`crm.wndrdg.com`** — which revealed a self-built internal CRM,
  a separate dev environment, and two *additional company domains* nobody publishes. Nothing on
  any public page says any of this. Check the CSP header on every app subdomain.
- **`https://itunes.apple.com/search?term=X&entity=software` is a free instant liveness check on
  any "we have an app" claim.** Wonderdog's press release promises members an "AI-powered app";
  there is no listing under `wonderdog` or `wonder dog health`, in a result set that returns
  Embark Vet and Pawp happily. Second time this exact check produced wedge material (Fixxly was
  the first). It costs one API call and it turns a marketing claim into a named unbuilt surface.
- **Ashby job boards expose a public posting API — use it instead of scraping the rendered page.**
  `curl "https://api.ashbyhq.com/posting-api/job-board/{org}?includeCompensation=true"` returns
  every listed req with the full JD, exact comp bands, and, critically, **`secondaryLocations`**.
  DualEntry's Hardcore Engineer req renders as "Remote (EMEA, EU, LATAM, UK, NORDICS)" in most
  aggregators, but the payload lists `Remote (India)` with `addressCountry: India`,
  `addressLocality: Bengaluru`. **A geo wall in the headline location is not proof of a geo wall.**
  WebFetch on the Ashby page returns almost nothing (client-rendered); the API returns everything.
  Also lets you compare sibling reqs — DualEntry's Senior/Staff Backend req carries the real stack
  detail the level-agnostic "Hardcore Engineer" post omits entirely. Worth checking on every
  Ashby lead before grading it. (The `non-user-graphql` endpoint that would return the application
  *form* fields has introspection disabled and rejects guessed field names — read the form in the
  browser instead.)

## Scouting heuristics (from /company-research runs)
- 🚨 **A raise is not a hiring signal until the People tab says there is an engineering org.**
  K25.ai (2026-07-30) raised $7.5M at a $250M valuation and shows 7 associated members on
  LinkedIn: 7 tagged Business Development, 2 IT, zero engineering. Money in the door is not the
  same as a team to join. Same lead, second tell: the first-person "we raised" in the LinkedIn
  post came from the **community director**, not a founder — **read the poster's actual title
  before grading the lead**, because a non-founder writing "we" reads like insider intent and
  isn't. Note this sits alongside the Fixxly heuristic below and cuts the other way: zero
  engineers is a strong signal *only* when the money is explicitly earmarked for the product and
  a launch date is close, and even then it is an argument, not evidence (see Outcome data).
- 🏆 **Read the team page and count the engineers. Zero engineers on a funded pre-launch team is
  the single best signal this pipeline can find.** Fixxly (2026-07-30) raised $5.5M from Accel,
  Lightspeed and Fireside, publishes five founding-team bios totalling ~80 years across home
  services, supply chain, category ops, marketing and product strategy, and **not one of them is
  an engineer** while the stated use of funds is to "strengthen its technology platform" and the
  launch date is 33 days out. That combination means the need is structural and urgent, there is
  no JD yet, and therefore **no applicant flood** — the exact opposite of the DualEntry failure
  mode ("thousands of applications" for one req). Make this a standard pass on every funded
  signal: open the team page, count engineers, and if the answer is zero, promote it above its
  grade. A missing GitHub org corroborates it (`gh-tools/recon.mjs` found nothing for Fixxly).
- **Check the company's own product claims against the app stores / the live product.** Fixxly's
  FAQ answers "Is there a mobile app?" with "Yes", and there is no listing in either store and no
  store link anywhere on the site. That took two minutes and produced a line in the email that
  no other applicant will have. Generalise: the gap between what the marketing page claims and
  what actually ships is free wedge material, and finding it is what "being a genuine user" means
  for a company that has not launched yet.
- **A real, well-funded company can have no LinkedIn company page at all.** Fixxly has tier-1
  press (Inc42, Entrackr, YourStory), three top-tier investors and a Google Workspace domain, and
  LinkedIn company search returns "No results found". **This corrects the instinct from Sarvya
  Sampanna**, where a missing company page was correctly read as a red flag: absence of a page is
  only evidence when the press and funding trail is *also* missing. Weigh the whole set, never
  the one field. (Employees can still be found: searching *people* for the company name surfaced
  the HR manager when the company search returned nothing, and she was the warm path.)
- 🚨 **YC's structured `minExperience` field lies, and it lies in the direction that wastes time.**
  MSPilot (2026-07-28) listed `3+ years` in the field that `scripts/yc-scout.mjs` hard-filters on,
  while the JD body asked for **"5+ years of backend/platform engineering experience"** and comp
  "benchmarked for senior/staff-level engineers". The script's 5+ wall never fired, so a role that
  should have been dropped mechanically came through graded **A**. Same run, same lead: the title
  said "(Hybrid, Lviv)" but only the body spelled out "in-person collaboration days" in Ukraine.
  **Rule: never write an A/B grade from the script's fields alone — fetch the JD body first and
  re-read the experience bar and the location words there.** The script filters volume; the body
  decides the grade.
- **The company's own ATS is the liveness test, not the funding headline.** Urban Harvest
  (2026-07-27) had a ₹341 Cr Series D, ₹385 Cr revenue and 453% headcount growth, and its own
  careers portal had **one opening: a Quality Supervisor posted a year ago**. A neglected careers
  page next to a big raise means the money is going to ops/working capital, not engineering.
  Check the company's real ATS (greytHR, Ashby, Lever, Keka) and the LinkedIn Jobs tab **before**
  building a dossier, not after. Cost of the check: one page load.
- **An employee's LinkedIn headline is the best stack intel for companies with no public GitHub.**
  Urban Harvest has no GitHub org, but an SDE's headline listed the entire stack
  ("Angular, React, Node.js, NestJS | PostgreSQL, MongoDB, Redis | AWS, GCP | POS & Logistics").
  Search `/company/{slug}/people/?keywords=engineering` before concluding the stack is unknowable.
- **Company-name collisions are real and cost research time.** "Urban Harvest" matched a Houston
  nonprofit (`urbanharvest.org`), a Namibian firm, and an unrelated 1-repo GitHub org, none of them
  the target. Confirm the entity via a funding article's founder names before trusting any domain.
  The real domain here (`uharvest.in`) was not the obvious guess.

- 🏆 **When a company has no findable website by name search, search GitHub code/repo search
  instead of more web queries.** Bactrix (2026-08-12) had zero hits for "bactrix.com",
  "Bactrix LTD" or "Bactrix AI" on web search, but `gh api search/repositories?q=bactrix`
  surfaced a public docking-study repo whose own description contained the citation
  `Timoulali, O. (2026). Bactrix: AI Multi-Agent Platform for Antimicrobial Drug Repurposing.
  https://bactrix.com` — the real domain, the founder's full name, and the system's own
  self-description in one hit. Academic/scientific-adjacent startups (drug discovery, biotech,
  research tooling) are far more likely to have a citable GitHub artifact than a normal SEO
  footprint this early. Try `gh api "search/repositories?q={name}"` before giving up on a
  stealth/pre-launch company.

## Resume mechanics gotchas
- **The literal buzzword ban has a false positive: `leverage` inside "leveraged trades".** It's a
  legitimate finance term for Hashtro's perps, but any regex-based grader (and the CLAUDE.md rule)
  reads it as the banned corporate verb. Rewrite to "margin trades". Same class of trap to watch:
  "end to end" as filler vs. as a genuine description.
- **When a project appears in both Experience and Projects, cut the Projects copy and spend the
  space on a role-relevant project instead.** For Urban Harvest, dropping the duplicated ReacDEFI
  entry made room for terraform-in-go/git-in-go, which was far stronger evidence for a company
  whose actual problem is inventory state across warehouses.

## Form questions seen in the wild → add to apply-pack staples when repeated
<!-- e.g. "'What's a strong opinion you hold about software?' — Ashby, seen 2x" -->
- **"No cover letter — show us something you built + how you work with agents"** — Orbit
  (join.com, Jul 2026), seen 1x. Likely to repeat at other agentic-dev-forward shops. Good
  answer shape: one live checkable project (link + number) + a concrete process description
  (spec → agent executes → human verifies), not a generic "I love AI tools" line.
- 🚨 **"AI-generated answers will be auto disqualified"** — DualEntry (Ashby, Jul 2026), seen 1x,
  attached to two personal-story questions ("How did you get into computers?", "Why do you believe
  you're a hardcore engineer?"). **This is a hard stop for the pipeline, not a style note.**
  New rule for /apply-pack: when a form field carries an anti-AI warning, do NOT draft it and do
  NOT autofill it. List it under `do_not_autofill` in pack.json and ship a separate
  `answers-raw-material.md` containing Harsh's own facts from `stories.md`/`facts.yaml`, the
  questions he needs to answer for himself, the shape that works, and the traps — **fragments and
  prompts, never paste-ready prose.** Generating polished text for those fields is the single
  fastest way to lose an otherwise grade-A application. Expect this to spread: high-signal startups
  are adding it precisely because generated answers now flood their funnels.
- 🥇 **The "how did you know it was working?" question** — Scenr (Binary, 2026-08-02), seen 1x, and
  worth adding to the staples because it is the hardest question this pipeline has met. Verbatim:
  *"If quality had quietly dropped one day, would you have found out? What did you check, how
  often, and how many cases did you check against? Use numbers. If you didn't have anything set up
  for this, it's fine. Tell us what you'd do differently if it had to run for six months with
  nobody watching."* Note the explicit permission to answer "I had nothing set up" — that clause is
  the tell that they are scoring *awareness of the failure mode*, not tooling. The shape that
  works: admit the gap first, name a real defect that survived undetected with a number on how
  long, say what actually surfaced it (measuring output beats reading code), then state the honest
  limit of what you measured. Harsh has an unusually good true answer here (the `includes()`
  keyword bug that scored `storage` as a `rag` hit across 178 leads), so this question should be
  treated as an *asset* when it appears, not a hazard.
- **"Tell us about an AI system you built that ran without constant human oversight"** — Scenr
  (Binary, 2026-08-02), seen 1x, paired with the question above as a two-parter about the *same*
  system. Expect this pairing to spread at agent-infra companies. Pick the system in part one
  knowing part two is coming: the most impressive autonomous system is often not the one with the
  best drift story, and the drift story is what scores.

## Measurement gaps (2026-08-03) — two places the pipeline was lying to itself

- **LinkedIn stage-1 invites fail silently, and they gate whole applications.** 0 of 4 alumni
  invites sent 2026-07-30 had been accepted 3 days later, and separately **Luke Butler
  (Patenova)** and **Aastik Aggarwal (Urban Harvest)** never accepted either, so both of those
  applications died at a stage nobody was measuring. The two-stage invite→ask mechanic tracks
  state *after* acceptance and treats the invite itself as free and reliable. It is neither.
  **What to change:** an unaccepted invite means the first touch was never delivered. Those rows
  are not "sent and ignored", they are **"never sent"**, and marking them `ghosted` at day 7
  hides the real failure. Track invite-accepted as its own state in `inbox/referrals.md`, and
  when an invite is still unaccepted at day 7, the move is a second channel, not a ghost mark.
  (event `20260803T032700-36a501`)

- **The tracker said "drafted, not sent" on a lead that had already been sent *and replied to*.**
  REM Labs: the DM and resume went out, **Bharatram Natarajan replied 2026-08-01** with a soft no
  plus an explicit invitation to apply anyway, and two days later the tracker still read
  "drafted, not sent". `followups.mjs` never surfaced it because **a row with no send date has no
  follow-up clock** — so the one lead in the whole pipeline that produced a human reply was the
  only one the alerting structurally could not see.
  **What to change:** reply detection cannot depend on the tracker being current. It has to sweep
  the inbox channels directly (`/check-replies` at session start, not on demand), and a row with
  a drafted-but-unsent status needs its own staleness clock rather than none at all.
  (event `20260803T032820-5394c6`)

## Research moves (2026-08-03/04)

- 🥇 **A YC blurb can be a year stale and describe a different business model than the company's
  own website. Read both, and date them.** Minerva (YC Spring 2025): the YC profile and the May
  2025 press describe an AI accounting *platform* whose stated ambition was to "replace all
  bookkeeping, accounting and tax filing jobs" and whose founders put accountants at ~10 years
  from obsolete. The 2026 site describes a **roll-up**: they *acquire* practices doing $500K–$20M
  in revenue, relocate into them, and the copy now reads "embed, don't dictate" and "your craft
  stays intact". That is the opposite pitch, 12 months apart, and **the YC blurb is what every
  other applicant is reading.** The move that found it was cheap: scrape the live site *and* the
  oldest press piece, then diff the thesis rather than the facts. Two payoffs: (1) it is the one
  observation in an opener that provably nobody else has, and (2) it re-reads the role — a
  forward-deployed seat is a support function in the platform story and **the entire delivery
  mechanism** in the roll-up story. Generalize it: **when the YC card and the homepage disagree,
  the homepage is the company and the card is a fossil.** Related to the RamAIn/Clouted finding
  below, but a different axis: that one is listing-vs-listing, this one is thesis-vs-thesis.
- **A site with no email anywhere is not the same as a site with no mailbox.** Minerva publishes
  no address at all (the only contact path on tryminerva.ai is a *sell-us-your-firm* form) and has
  no careers page, but `dig MX tryminerva.ai` returns Google Workspace, which proves mailboxes
  exist and proves nothing about the local part. Same shape as the TechHavenLabs rule (Namecheap
  PrivateEmail MX = a mailbox, not an address) and the Envelon guess. **MX is evidence of
  reachability, never evidence of an address.** The check costs one `dig` and it correctly stops
  the guess from being sent.
- **A company's advertised job and its actual opening can be two different seats, and the walled
  one is the one that ranks.** RamAIn (YC W26): the YC listing is San Francisco and carries the
  literal string `US citizen/visa only`, a hard drop. The "SF & BLR" expansion exists **only in
  the founders' own LinkedIn posts**, with no gate and a promised 24h reply. This is the **second
  time** the pattern decided a lead (Clouted was the first), so it is not a one-off.
  Same listing, second finding: the bar read "Bachelor's with hands-on agentic systems experience
  OR a recent MS/PhD" at 1+ years, which turned an assumed research gap into a door already open —
  the outreach had been written *apologising for something the JD did not require*.
  **What to change:** on any hard geo/visa drop, check the founders' own posts before closing the
  lead, and read the experience bar literally before conceding anything in the email.
  (event `20260803T034733-e6c99e`)

- **An open-source PR gate on a job application creates an applicant queue, so the obvious issues
  are gone before you get there.** SuperPlane: 115 open PRs, every well-specified unassigned issue
  from the past week already had one (two with competing PRs from different applicants on the same
  issue), older good-first-issues assigned to staff.
  **What to change:** on a PR-gated application, do not hunt for an unclaimed bug, hunt for an
  unclaimed bug **class** — nobody can race you to a bug that has no issue filed. (Here: fabricated
  example payloads across 49 integrations, of which only GitHub had ever been audited.)
  (event `20260803T043035-211b94`)

- **A new noise shape on X: a content farm reposting one real founder's hiring post verbatim,
  minus the apply email.** `@konig0000` (100+ posts/day) copied a real backend hiring post word for
  word 11 hours later with the company name and apply address stripped. Not an aggregator listing
  many companies — a plagiarist laundering one real post for reach. **Anyone applying through the
  copy reaches nobody.**
  **What to change:** `/x-scout` verification must be **poster-first, not text-first**. A post that
  reads authentic is not evidence; the account that posted it is.
  (event `20260804T035006-89174f`)

- **Corrected `facts.yaml` where it contradicted `stories.md`, rather than picking the flattering
  version.** facts.yaml said the ReacDEFI conversational pipeline was *hardened* after failing at
  scale; stories.md said the feature was *removed entirely*. Harsh confirmed: removed. The hardened
  version sounds better and is the one a generator would reach for, which is exactly why the
  conflict had to go to him instead of being resolved silently — REM Labs asks applicants for the
  hardest distributed-system failure they have debugged, so the wrong version would have been
  fabricated technical detail in a real application.
  **What to change:** when two profile files disagree on a fact, never resolve it in-flight. Ask.
  (event `20260803T042025-d11e81`)

## Research moves (2026-08-04)

- **A YC company blurb can be a year stale and pitch the opposite thesis from its own website.**
  Minerva (YC Spring 2025): the YC card and May 2025 press pitch an AI accounting platform aiming
  to replace all bookkeeping and tax jobs. The 2026 site pitches a roll-up that acquires practices
  and promises "your craft stays intact" — the opposite pitch, 12 months apart, and the stale card
  is what every other applicant reads. Diff the thesis (not just the facts) between the live site
  and the oldest press piece — it's cheap and it re-reads the role too: forward-deployed is a
  support function in the platform story and the whole delivery mechanism in the roll-up story.
- **The founder who posts a job is often not the reachable one — check the People tab before
  drafting outreach.** SwaVid: Preet Shah posted the founding-engineer role and is 2nd degree, but
  his LinkedIn card offers only Follow, no Connect, so a free account has no invite path to him.
  Co-founder Arjav Doshi, also 2nd degree, does offer Connect. The company's People tab answers
  this in one page view, before any outreach is drafted.

## Process gap (2026-08-12, The Syndicate)

- **An X DM got drafted straight off the leads.md summary, with no dossier ever built — the
  pipeline order (research before outreach) got skipped for a fast L1 lead.** Caught only when
  the folder was audited before logging it as sent. The original DM held up fine content-wise
  once the dossier existed (Hashtro hook, both honest gaps already named), but it was luck, not
  process — a dossier would also have caught things the summary alone couldn't (the founder's
  first name, that he's the sole public technical+business voice with no co-founder/CTO found,
  the exact hiring-post language to mirror, the Heat/epoch payout mechanic as a sharper
  technical hook than the generic "backend problem" line the first draft used). **Never let
  channel speed (DM feels lighter than a form) skip company-research — a dossier is cheap and
  outreach without one is a guess wearing specifics.**

## Pipeline integrity (2026-08-14/15 — the four stores that never checked each other)

`inbox/leads.md` (a checkbox), `applications/{company}/` (work on disk), `applications/tracker.md`
(the outcome + follow-up clock), and the GitHub issue board each recorded a company at a different
moment, and nothing reconciled them. Once they disagreed, none of them was trustworthy, which is
why 80 issues had to be swept closed by hand on 2026-08-14. Built `scripts/lib/state.mjs` to join
all four on a normalised company key and derive one canonical status; every disagreement is
reported as drift rather than silently resolved, because a board that hides what it can't parse is
worse than no board.

- **Two parser bugs, both invisible, both deleting real applications from every view.**
  `status.split(" ")[0]` turned a status written `**rejected 2026-08-13**` into `**rejected`,
  which matched no known branch and vanished from the dashboard and the follow-up queue — bold
  markdown alone was enough to erase an application. A separate bare-date regex dropped every
  follow-up written as prose (`"+7d from send"`, `"needs manual check"`), leaving six applications
  with no clock at all. **ReferRush — an offer in hand — was invisible on the board because of the
  first bug alone.** Lesson: a parser that silently drops what it can't match is a data-loss bug
  wearing the costume of a formatting choice; surface the unparseable case, never discard it.
- **A company re-posting a role after ghosting you looks identical to an untracked lead unless you
  compare dates.** Joining leads to applications on company name alone made four live re-postings
  (Railway, Kadoa, MixRank, Category Labs — two of them A-grade) look like leads that were simply
  never ticked off. Auto-ticking them would have buried a live second chance under a stale first
  attempt. Fix: a tracker row only accounts for a lead posted at or before the application date;
  anything posted after a terminal outcome (rejected/ghosted) is a fresh opportunity, flagged as
  one rather than merged away.
- **The HN "Who is hiring" thread is a burst source, not a steady stream, and it was 138 of the
  pipeline's first 178 leads.** Measured 23-37 new postings/day in the thread's first week,
  falling to 1-3/day by mid-month, resetting when the next month's thread opens. Because one
  channel dominated so heavily, mid-month looked like a dead market when it was actually a
  scheduling artifact of a single source. `scripts/scout-yield.mjs` now separates **scanned**
  (what a source returned) from **new** (what hadn't been seen before) specifically so saturation
  (226 scanned, 1 new — everything else was already seen) reads differently from a broken scrape
  (scanned count itself collapsing). The YC job grid turned out to be the stronger channel by
  conversion rate: 6 A/B leads from 8 new postings in one week, against HN's raw volume.

## Research moves (2026-08-14, Rivet) — a false assumption caught before it reached outreach
- **"Solana project = Rust experience" is not true and should never be assumed again.**
  inbox/leads.md's original Rivet note assumed "Harsh's Rust exposure is Solana program work
  (Hashtro)" — checked against facts.yaml, Hashtro's Solana integration is entirely via the
  Flash Trade SDK (client-side/TypeScript), not on-chain Rust program authorship. There is no
  Rust anywhere in facts.yaml or stories.md. `resumes/base.md` still lists "Rust" and
  "Solana/Anchor" on the Technical Skills line with no traceable source — dropped both for the
  Rivet application (74% Rust codebase per gh-tools/recon.mjs, a company that would actually
  test this) but the house resume itself should get the same fix so a future company-scoped
  resume doesn't inherit the same unverified claim.

## Pipeline design (2026-08-17) — the two things that were capping application quality

- 🥇 **A script rule written for the wrong person blocks the whole channel.** `job-video` step 0
  said the script must be "beats and talking points, not sentences to read", on the theory that a
  read script sounds read. Harsh's correction: he does not speak off the cuff on camera, so that
  rule does not produce a better video, it produces **no video**, on the only channel that has
  ever drawn a personal human reply. **A read script beats an unrecorded one.** Now `/job-script`
  writes every word, five numbered clips on the fixed HOOK/PROOF/PROOF/GAP/CLOSE beats, to a word
  budget at his measured 195 wpm, with a speak-only page for the window under the webcam. The
  clip-by-clip shape is itself the fix for the confidence problem: a fumbled take costs 25 seconds
  of re-recording, not 90. General lesson: when a rule exists to protect quality and the person it
  governs cannot execute it, the rule is producing zero, and zero is the worst quality available.
- 🥇 **"Show them you understand their tech" is recon, not study, and the two have completely
  different costs.** Studying each company properly is a `learn-before-build`, which is hours, so
  it caps him at one or two applications a week and he had written the whole idea off as
  unscalable. But the work splits: their *specific* system is visible from outside in about 20
  seconds of scripted probing, and the *hard problems* are not company-specific at all, so they
  get written once per cluster into `profile/domains/{cluster}.md` and reused. Company one in a
  cluster costs 30 minutes, company seven costs ten.
- 🥇 **Questions scale, claims don't.** A statement about a company's internals can be wrong, and
  a confidently wrong one proves he *didn't* understand, in front of the person who built it. A
  question that presupposes the internals cannot fail that way, costs nothing to be uncertain
  about, reads more senior, and invites a reply, which a summary never does. So `tech-read.md` is
  optimised for two questions plus one hedged observation, and it ends with a **Do not say**
  section naming the weak inferences. That section is what makes the strong ones safe to use.
- **The docs and the incident history are the two artifacts nobody applying has read.** Ranked by
  yield: API reference/OpenAPI spec (endpoint shapes, retry semantics, rate limits, idempotency
  and the object model *are* the architecture, written down by them), then the status page's
  incident history (where it actually breaks, with dates), then the changelog (what they are
  worried about now), then GitHub. The JD's stack list is the least reliable source in the set and
  it is the one everybody uses. Kadoa's `docs.kadoa.com/llms.txt` handed over its entire product
  architecture as a page index in one curl.
- 🚨 **Attribution before assertion, or the recon tool puts a false claim in his mouth.** Three
  real errors caught while building `stack-probe.mjs` against kadoa.com, all of which would have
  read as confident and been wrong: `x-runtime` (Rails) on `status.kadoa.com` is Atlassian's
  stack, not theirs; a `x-powered-by: Next.js` on `dashboard.mintlify.com` is their docs vendor;
  and the **first** hop of `x-vercel-id` (`bom1`) is the edge nearest *whoever ran the probe*, so
  reading it as their region would have had him telling a US company they deploy in India. Only
  the last hop is their configured compute region. The script now tags every technology with its
  attribution and splits CSP-discovered hosts into their own unpublished hosts (the org chart)
  versus embedded third-party vendors (what they bought instead of building).
- **The video claim is n=1 and nothing was recording it.** One personal reply, one video, 32
  applications, and no field anywhere saying which applications carried a video. So `/outcome` now
  writes `video: yes|no` and `tech-read: yes|no` into every tracker row's notes cell (**not** a new
  column: `state.mjs` parses that table and has already been bitten twice), and the B-grade video
  policy is explicitly an experiment until ten videos have outcomes attached.

## Channel calibration (LinkedIn invite latency, 2026-08-17)

**A pending LinkedIn invite at day 9 is not a dead channel, and treating it as one cost RamAIn
two weeks.**

On 2026-08-03 the RamAIn plan wrote a rule into `applications/ramain/outreach.md`: if Vansh
Ramani (CTO, YC W26) has not accepted by day 7, count it as touch 1 never delivered and switch
channels rather than nudge. On 2026-08-12, still pending at day 9, the file was updated to
declare the invite undelivered and demote it to backup. **He accepted on 2026-08-17, day 14.**

What the rule got right: never nudge into a channel that was never opened, and never re-invite.
What it got wrong: **"pending" and "undelivered" are not the same state.** Founders at 2-to-10
person companies clear their LinkedIn invite queue in batches, not daily, so the correct read on
a pending founder invite is "no channel *yet*", which means keep working the other channels
without closing the row, rather than declaring the person unreachable.

Practical change, applied to `inbox/referrals.md` run 5 the same day:
- Day 7 pending → switch to the other channel (comment, form, email) as the *primary*, exactly
  as before. That half stands.
- But **do not write the row off**, and do keep the stage-2 message drafted and ready. The cost
  of keeping it is zero; the cost of writing it off is that an acceptance two weeks later lands
  on a lead nobody is watching, and the reply window is a day or two.
- **Check the connections list, not just the sent-invites list, on every scout run.** The
  acceptance showed up as a row in `mynetwork/invite-connect/connections/` dated the same day and
  nowhere else. Nothing in the pipeline would have surfaced it otherwise.

Four alumni invites from 2026-07-30 are still pending at 18 days under the same rule. They are
marked `no-reply` on the board, but under this correction that means "no channel", not "gone".

## Pipeline design (2026-08-19) — the C lane, and what the first autonomous run measured

Harsh's call: the C pile (~350 leads) was arrows never shot, because "quiet-week filler" assumes
quiet weeks and there were none. `/autoapply` is the one lane in JobOps that acts instead of
drafting: it submits forms and sends application email itself for grade C only. First run below.

- 🚨 **Gmail is the only store that knows what was actually sent, and nothing was checking it.**
  `c-queue` offered Strello Health as a fresh C lead. Harsh had emailed `jobs@strello.health`
  himself on 2026-08-06, 13 days earlier, and it was logged **nowhere** — no tracker row, no
  leads.md tick. An autonomous lane would have sent a duplicate application to a company already
  waiting on him. Root cause: `folderComplete()` requires a dossier plus one other artifact, and
  Strello's folder held only an `outreach.md`, so it read as "incomplete" and therefore fresh.
  **Fixed two ways:** `c-queue.mjs` now holds on *any* folder content, and a Gmail search is
  gate 1 in the skill. General lesson: a completeness test is not an existence test, and the
  cheapest evidence of prior contact lives outside the repo entirely.
- 🥇 **Attaching a PDF through the Gmail MCP is impossible, and the browser does it for free.**
  `send_message` takes attachments as base64 in the call, so a 96KB resume is 132KB of base64
  that must pass through the model twice. The Read tool priced that single file at **126k
  tokens** and truncated it at 22k of 132k characters, so it does not even fit in one read. The
  fix is not optimisation, it is a different mechanism: open Gmail's composer in Chrome and
  `file_upload` the plain repo path. Bytes never enter context, no connected-folder setup was
  needed, and it worked first try. **Any time a tool wants file *contents* as a parameter, look
  for the path-based route before costing it out.**
- 🥇 **`form_input` silently fails on contenteditable, and reports success.** Gmail's compose
  body took `form_input` with a cheerful `Set textarea value to "..."` and stayed completely
  empty. Only the read-back screenshot caught it. `computer` → `type` after clicking into the
  body works. **This is the whole argument for the read-the-page-back-before-submitting rule:**
  the failure mode is not an error, it is a confident success message over an empty field.
- 🥇 **Six of eight C leads failed a gate. That is the lane working, not the lane failing.**
  Langfuse's Ashby form asks "Do you have an EU work permit?" on a **hybrid** EU role with every
  seat Senior and no sponsorship language (the HN post advertised "Product Engineers & Backend
  Engineers"; the live board was seven Senior titles). Vidalytics' listing 302s to the WeWorkRemotely
  homepage, pulled. Scicom AI has no resolving domain and no link in the post, so no channel
  exists. Runta is on-site SF/Singapore doing kernel-and-VMM work he has none of. Compound's
  three seats are CFO and two Head-of roles. **The gates have to run before the work**, or twelve
  minutes per company gets spent on companies that were never applicable.
- **An ATS board can belong to a different company with the same name.**
  `jobs.ashbyhq.com/compound` is live and returns five real jobs — for a wealth-advisory firm, not
  Compound Finance. Verify the board is theirs before reading a single JD off it.
- **Don't score an ATS number against a JD you could not read.** XenReality's full JD sits behind
  a LinkedIn login. The tracker row says `not scored` and why, rather than a number computed from
  the lead note's paraphrase of the JD.
- **A base resume carries its unsourced claims into every copy.** **Docker** appears in shipped
  resumes across `applications/*` and in `profile/facts.yaml` **not at all**. XenReality lists it
  as a requirement and the lead note asserted the mapping, which is exactly the pressure that
  makes an unsourced claim feel true. Cut from both the resume and the email mid-run. Worth Harsh
  deciding: either add Docker to facts.yaml with real evidence, or it stops appearing anywhere.

## C-lane batch, second real run (2026-08-20, 8 companies looked at, 2 sent)

- **The gates kept holding the same fraction as run one.** 2 of 8 became applications
  (Entiovi, Polar Browser); 6 held on a real gate: RyzerX and HomeRun had no apply channel at
  all (real, funded companies, just no form/email/job posting anywhere reachable), Scicom AI
  was an unverifiable 13-follower account whose bio link resolved to an unrelated Malaysian
  BPO, Runta failed reachability (all three roles on-site SF/Singapore, no sponsorship
  language), Sequent Tech failed the seniority gate (careers page shows only two roles, both
  Senior), and the mememandir X lead was an internship with no company named anywhere — a
  level mismatch plus nothing to build a dossier against. Second data point that ~1 in 4 C
  leads clears every gate; treat that as the lane's real throughput, not a bad batch.
- 🚨 **A company's own X/LinkedIn account is not proof the hiring post is real, and thin social
  proof is cheap to check.** Scicom AI Enterprise Solutions posted "Backend Engineer" from
  @ScicomAI, 13 followers, joined April 2026, 7 posts, 0 following — and the account's own bio
  link (`future.scicom.app`) rendered as a live chatbot for **Scicom (MSC) Berhad**, a Malaysian
  BPO with no connection to an "AI Enterprise Solutions" arm. The specific post itself had gone
  fully inert (no text recoverable, just the profile fallback view) within 3 days of posting.
  Follower count + join date + bio-link mismatch is a three-second check that would have saved
  the ~12 minutes otherwise spent building a dossier around a company that may not exist as
  described.
- **An Indeed-native "Apply with Indeed" button requires creating an Indeed account, which the
  C lane may never do — but the same posting often has a direct channel on the company's own
  site.** Entiovi Technologies' Indeed listing only offers Indeed's own quick-apply flow (visibly
  unauthenticated, "Sign in" in the header). Their own `entiovi.com/careers.html` mirrors the
  identical JD with an "Apply for this role" link that resolves to a plain `mailto:` — same
  posting, same requirements, zero account needed. **Rule: before holding an Indeed-only lead
  for the account-creation gate, check `{domain}/careers` for the same posting mirrored with a
  direct channel.** This is the same shape as the Tally/Ashby-embedded-form lesson: the real
  channel often lives one hop from where the lead was found.
- **A LinkedIn company page with real followers and a real domain can still have no live apply
  channel anywhere.** RyzerX (2,087 LinkedIn followers, Hyderabad, funded-looking fintech
  tokenization product, real site at ryzerx.capital) had zero jobs on its LinkedIn Jobs tab, no
  `/careers` page on its own domain (404), and the specific "Move Smart Contract Engineer" post
  the lead cited was no longer findable anywhere in the company's own feed 9 days after posting
  — company legitimacy and channel availability are two separate checks, and a real company
  regularly fails the second one on an old post.
- **A funding-signal article with no hiring information anywhere is not a lead, it's a
  reminder to check back later.** HomeRun's ₹100 Cr raise-in-talks article (Inc42) names zero
  engineering roles, no careers page, and no contact info — the same shape the skill already
  warns about for signals promoted before a real seat exists. Holding it rather than inventing
  an outreach target was the correct move, not a miss.

## Channel calibration (technical depth as recon, 2026-08-17)

- **Reading CONTRIBUTING before writing code, not after, is now the rule.** Built and tested a
  fix for hyperdx#1362 (all 3105 tests green) before reading their CONTRIBUTING.md, which
  requires a maintainer to vouch a contributor before a first PR is even reviewed — enforced by
  a bot, and stated outright to be a defense against AI-written PRs on a job posting that
  already carries an anti-AI canary. Pushing would have been permanent, under a real handle, at
  a company actively screening for exactly this. The fix itself stands as a real story regardless:
  `orderBy || defaultSearchConfig?.orderBy || defaultOrderBy` treated a deliberately cleared
  order-by field (empty string, falsy) the same as an unset one, silently re-adding a clause the
  author had removed — fixed by making the optional/cleared distinction explicit
  (`undefined` vs `''`).
- **A company's own recon surface is visible from outside in about 20 seconds, and it beats
  hours of learning their stack.** `scripts/stack-probe.mjs` reads response headers, CSP-leaked
  internal hosts, and docs/incident history to land on two questions only an internals reader
  would ask — questions scale where claims can be wrong in front of the person who built the
  thing. One concrete miss it prevents: reading the *first* hop of `x-vercel-id` as a company's
  deployment region, when only the *last* hop is the configured compute region (same class of
  error as `x-runtime` on a status page reading as the vendor's stack, not the company's).
- **A pending LinkedIn invite at day 9 is "no channel yet," not a dead one.** A founder-CTO
  accepted a 2026-08-03 invite on 2026-08-17 — 5 days after the lead had been written off as
  never-delivered at the day-9 mark. Switching to a backup channel at day 7 is still correct;
  closing the row before checking the connections list (the only place an acceptance surfaces)
  is not.
- **The fastest channel measured so far is a warm X intro, not any form.** Asked a follower
  about an open Applied AI seat, got a founding recruiter's email back, sent resume, got a
  personal answer in 25 hours. The answer was a no, but the latency — warm X intro beating every
  application form in the pipeline on speed — is the reusable finding.
- **Attaching a file through a tool that wants base64 is a hard blocker, not a cost to
  optimize.** Gmail MCP's `send_message` wants attachments as base64 in the call; a 96KB PDF
  becomes 132KB of base64, priced at 126k tokens by the Read tool and truncated at 22k
  characters — it doesn't fit in one read. Driving Chrome's own compose window and using
  `file_upload` with the plain repo path cost zero context and worked first try. When a tool
  wants file contents as a parameter, find the path-based route before costing the base64 out.
- **`form_input` can report success on a contenteditable field and leave it empty.** Gmail's
  compose body took a `form_input` "set textarea value" call and stayed blank; only a
  screenshot read-back caught it before send. Clicking in and using `type` works. The failure
  mode — a confident success message over an empty field — is the whole argument for reading a
  page back before submitting anything.
- **Two accepted LinkedIn invites went unnoticed for weeks because nothing read the sent-invite
  manager.** An invite that drops off that list after a few weeks was accepted, not expired —
  cross-checking it against the referral tracker found two rows still marked invite-sent that
  were actually 1st-degree connections, one of whom had also changed employer, so a parked
  ask was addressed to the wrong company. Every referral-channel pass should start there before
  a new search.
- **Go to the ATS, not the board that syndicated it.** A WeWorkRemotely listing carried neither
  employment type nor location scope; the company's own Workable posting stated "Remote,
  Contract, Medellin Colombia" in its first line — two disqualifiers invisible on the
  aggregator. Same rule the liveness gates already apply to reachability now applies to grading.
- **A stated seniority bar can produce a *new*, better-fit role instead of a rejection, if the
  gap is named honestly up front and there's a real project to talk about instead.** FunnelStory
  (2026-08-26): the dossier's honest-gap framing ("Principal Engineer" vs ~1.5y experience,
  stated plainly rather than hidden) meant the founder walked in already knowing the mismatch,
  so the call could spend its 15 minutes on what Harsh had actually built (lifelog, the
  job-scout pipeline) instead of defending the title. Founder's own reaction was to open a new
  forward-deployed-engineer role shaped around that background, not to reject the overqualified
  mismatch. Reusable shape: naming a real gap plus one concrete artifact to discuss can convert
  a "you don't fit this role" into "let me make a role that fits you" — worth trying deliberately
  on other stated-bar mismatches, not just accepting the B-grade downgrade the gap implies.

## Measurement gaps (2026-08-30) — two more places the pipeline was lying to itself

Same shape as the 2026-08-03 pair and the four-stores problem: a check that reports health from a
partial read. Both found by reading the real data rather than the summary.

1. **`reconcile.mjs` reports "no drift" while 17 follow-up issues sit open on closed
   applications.** It joins `leads.md`, `tracker.md`, `applications/` and the lead/signal issues —
   but it never checks follow-up-labelled issues against tracker status. So a company can go
   ghosted, rejected, or even reach **offer**, and its follow-up issue stays open forever under a
   clean drift report. Current count: 13 ghosted, 1 rejected, 3 at offer (including FunnelStory,
   which has an accepted offer and an open follow-up). **Fix is a fifth check inside reconcile,
   not a manual sweep** — a hand sweep is exactly what the reconciler exists to replace, and it
   will be skipped the week it matters.

2. **`referrals.md` "last swept" read two weeks stale when it was two days.** The run headings are
   not chronological: run numbers repeat (two Run 4s, 5s, 10s, 11s, 12s), and the topmost heading
   in the In-flight section is Run 15 dated 2026-08-16 while the genuine latest sweep is Run 20
   dated 2026-08-28 at the *bottom* of the file. Judging staleness by heading position or by run
   number is wrong by twelve days. **Sort by date, never by position or by a number that repeats.**

   The same read found the board is **not short of names** — it has four accepted alumni whose
   stage-2 asks have been drafted and unsent for five consecutive sweeps. The bottleneck was never
   sourcing; it is that a drafted-but-unsent item has no state that any sweep reports on.

## Tooling gap (2026-08-30) — the single source of truth does not parse

`profile/facts.yaml` is declared the single source of truth by this repo, by the portfolio's
`instructions.md`, and by the vault. **It has not been valid YAML for some time** — it fails on an
unquoted scalar containing a colon-space, inside the JobOps entry: `74% graded D/F: 5 new sources
added`. Present in the committed version, so it predates its discovery.

Nothing has broken, and that is the point worth keeping. Every consumer reads this file as prose
rather than parsing it, so a structural error in a file that advertises structure survived
indefinitely with no symptom. Two honest options, and picking neither is the current state:
**validate it (a parse step in CI or in `reconcile.mjs`), or stop calling it YAML.**

Same shape as the four-stores problem and the drift report: the failure is not the bug, it is that
nothing was ever positioned to notice it.

## Channel calibration (warm channel, 2026-09-01) — the referral tracker was wrong in both directions

`inbox/referrals.md` reported four alumni asks as unsent across **five consecutive sweeps**. Reading
the live LinkedIn threads instead of the file showed: **one had actually gone out nine days
earlier**, one had no open ask in the thread at all, and only two were genuinely unsent. So the
file was not simply behind — it was wrong optimistically *and* pessimistically at the same time,
which is worse than stale, because neither direction of error is correctable by "assume the file
lags reality".

Same shape as the `followed-up`-means-typed-not-sent bug from 2026-08-24 and the four-stores
problem: **LinkedIn produces no draft object and no send receipt, so nothing in this repo can ever
observe a LinkedIn message's real state.** A file that records intent gets read as a record of
fact.

**Rule: reading the live thread is step one of a warm-channel run, before anything is drafted or
any state is advanced.** A sweep that starts from `referrals.md` re-drafts asks that already went
out, which is the one failure mode this channel cannot afford — it lands on a real senior's inbox
as a duplicate.

## Channel calibration (2026-09-02) — the staffing-marketplace false positive is now a measured pattern, not a one-off

Three separate companies have now produced the identical false positive in `board-scout.mjs`, five
postings across three runs:

| Company | Board | Runs | What the scout matched on |
| --- | --- | --- | --- |
| Lemon.io | Remotive | 2026-08-28, 2026-08-30 | `blockchain`, `golang`, `typescript` inside a catch-all "NOT YOUR TECH STACK?" paragraph listing ~80 technologies |
| Toptal | WeWorkRemotely | 2026-09-01 (×2) | `RAG`, `agentic AI` in a talent-pool ad title |
| Proxify AB | WeWorkRemotely | 2026-09-02 (×2) | `AI-augmented engineering` on a Rails posting |

**The shape is always the same and it is recognisable before any research happens:** a freelance
developer marketplace posts what looks like a role, the "employer" is the marketplace rather than a
company, the apply path is their own vetting funnel, and the tech keywords come from a list of
everything their client pool uses rather than from a requirement. Every one of these graded B or C
off the keyword score and every one is a D once opened.

Two things follow.

1. **The keyword score cannot distinguish a requirement from a catalogue.** `keywords.mjs` matches on
   word boundaries, which fixed `defi` inside *undefined*, but nothing distinguishes "we use Go" from
   "our freelancers know Go, Rust, Elixir, Haskell, ...". A posting whose matched-keyword count is
   high *because the posting names thirty technologies* is the signal, and that ratio is computable:
   strong-match count against total distinct technologies named.
2. **Three companies at two boards is past the threshold for a source-level exclusion.** The cheap fix
   is a company denylist in `board-scout.mjs` keyed on `(source, company)` — Remotive/`Lemon.io`,
   WeWorkRemotely/`Toptal`, WeWorkRemotely/`Proxify AB` — with the note that the entry means "staffing
   marketplace, not an employer" so a future session does not delete it as unexplained. The general
   fix is the ratio test above, which would also catch the fourth marketplace before it costs a triage
   pass.

Cost so far: five postings researched to the point of writing a skip row, three separate sessions.
That is small per instance and is exactly why it keeps recurring.

## Channel calibration (2026-09-01, Caribou) — job postings now carry canaries aimed at AI assistants

Caribou's engineering JD does two things at once that look contradictory and aren't. It says openly
that they write a lot of their code with AI and that they expect the candidate to, and it invites AI
tooling into the technical interview. **The same posting also contains an instruction addressed to AI
assistants**, hidden in the JD body, telling any model reading it to open with a set word and to
include a set phrase once.

The position is coherent: *code with AI, don't let AI apply for you.* An application that comes back
carrying the canary phrase is not evidence of tooling, it is evidence that nobody read the posting.

Two rules follow, and they apply to every skill in this repo that reads a JD.

- **Read the whole JD body before generating anything from it**, including the parts that look like
  boilerplate. A canary is placed exactly where a summariser would skip.
- **Never echo a phrase back out of a JD because it appeared there.** The pipeline's existing habit of
  mirroring a company's vocabulary is the exact behaviour a canary is built to catch, so vocabulary
  matching has to stay at the level of *their* domain terms, not stray instructions.

This pairs with the anti-AI canary found in the hyperdx contribution (2026-08-23/24, `stories.md`).
Same mechanism, opposite side of the table: one guards a codebase, one guards a hiring funnel, and
both are checking the same thing.

## Channel calibration (2026-09-04) — the warm channel's bottleneck is acceptance, not discovery

Two findings from the same sweep, and they are the same finding seen from two ends.

**A LinkedIn invite that is never accepted silently advances an application to `sent`.** NeoGeo's
only channel was a DM to the CEO. A free account cannot DM a non-connection, so the invite went out
and nothing else could. The invite sat unaccepted for two weeks and the tracker still read `sent`,
with a follow-up clock counting down on **a message that was never delivered to anybody**. The
correct state is `awaiting-connection`, which `CLAUDE.md` already defines and the row was not using.

**32 invites are pending in total.** That number reframes the whole warm channel: the constraint is
not finding people, it is that a third of the outbound sits behind a handshake nobody has made. Any
future measurement of "did the referral channel work" that counts invites sent rather than invites
accepted is measuring the wrong variable.

**And the tracker cannot be its own evidence.** Sweeping Gmail and opening every LinkedIn thread by
hand before drafting a single follow-up, **three of 34 rows were owed nothing at all**:

- one was a **rejection sitting unread for 8 days** — the queue was about to nudge a closed thread
- one had **already been answered from mobile the day before**, so a duplicate would have gone to
  the same founder
- one had **never been contacted at all** — the unaccepted-invite case above

The mechanism worth remembering: **LinkedIn's own message search returns no result for threads that
demonstrably exist**, so a search that finds nothing is not evidence of absence and must never be
used as one. Only opening the thread counts. 26 rows were closed as `ghosted` in the same pass, each
checked against a real send record rather than against the tracker's claim about itself.

## Form policy (2026-10-20, LiveKit) — "don't use AI assistance" fields are Shivam's, full stop
- LiveKit's Ashby form puts a notice above its two engineering questions: "for the application process,
  we ask that you don't use AI assistance." The C lane already refuses fields like this; the A/B path
  must too. **Fill the factual fields (name, email, resume, authorization, links), leave every field under
  such a notice empty, and don't hand Shivam a draft to paste there either.** Dossier draft answers for
  that company get a DO-NOT-PASTE banner. Track the row as `hold` (blocked on him), not `sent`.
- Check for this before writing any form answers: it's a sentence on the form page, not in the JD.
