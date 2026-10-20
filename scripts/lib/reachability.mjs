/**
 * Reachability filter — the thing that was missing.
 *
 * 74% of everything the pipeline had ever scouted graded D/F, and geography was a factor
 * in 58% of those. Every one of them cost a judgment pass, and some cost a whole dossier,
 * to establish something a regex could have decided at scout time.
 *
 * `yc-scout.mjs` already did this against YC's structured `visa` field and dropped 151 of
 * 356 postings in a single run. This module is that idea generalised to free text, so every
 * scout can share one definition of "can Shivam actually take this job".
 *
 * Three outcomes, and the middle one matters:
 *   blocked  — a wall is stated. Drop it, record why.
 *   open     — remote-friendly or India/Asia/worldwide is stated. Boost it.
 *   unknown  — nothing stated either way. KEEP IT. Silence is not a wall, and the best
 *              lead of the last fortnight (EON) stated no location at all.
 */

// Order matters: the first pattern that hits wins, so the specific carve-outs that
// RESCUE a posting are checked before the broad blocks.
// Tier 1: India/Asia named explicitly, or sponsorship offered. Nothing overrides these.
const OPEN_EXPLICIT = [
  [/\bremote\b[^.]{0,40}\b(india|asia|apac|ist\b)/i, "remote incl. India/Asia"],
  [/\b(india|bengaluru|bangalore|mumbai|delhi|gurugram|gurgaon|hyderabad|pune|noida|chennai)\b/i, "India-based"],
];

/**
 * The candidate's own policy. Shivam (facts.yaml work_auth.relocation, 2026-09-29): India or
 * remote only, so a sponsored onsite role abroad is a wall, not an opening. The previous owner
 * would relocate, which is why the archive backtest passes { relocateAbroad: true }.
 */
export const CANDIDATE = { relocateAbroad: false };
// Tier 2: an unambiguous worldwide statement about the role itself.
const OPEN_WORLDWIDE = [
  [/\bremote\s*[:(-]?\s*(worldwide|globally|global|anywhere|everywhere)\b/i, "remote worldwide"],
  [/\banywhere in the world\b/i, "remote worldwide"],
  [/\bany time ?zone\b|\btimezone[- ]agnostic\b/i, "timezone agnostic"],
];
// Tier 4: company-level culture phrases. Weak on purpose: "work from anywhere within US time
// zones" (Stable, 2026-09-29) and "fully distributed" on a Remote-US role (Legion) both read as
// open until the lock below was checked first.
const OPEN_WEAK = [
  [/\b(work from anywhere|globally distributed|fully distributed)\b(?![^.]{0,25}\b(within|in the)\b)/i, "fully distributed"],
];
// Time-zone locks beat even "remote (anywhere)": "REMOTE (anywhere, EST hours)" is a night
// shift from India, not a worldwide role.
const TZ_LOCKED = [
  [/\b(within|in) (the )?(us|u\.s\.|north american?|american|eu|european) time ?zones?\b|\bus time ?zones?\b/i, "US/EU time zones only"],
  [/\bgmt\s*-\s*\d{1,2}\s*(to|-|–)\s*gmt\s*-\s*\d{1,2}\b/i, "Americas time-zone window"],
  [/\b(est|pst|cst|pt|et)\s+(hours|business hours)\b/i, "US-hours required"],
];
// Tier 3: region locks. Checked before the weak opens, after the explicit and worldwide ones.
const LOCKED = [
  [/\bremote\s*[:(,-]?\s*(us|usa|u\.s\.|united states|us[- ]based|americas|north america|canada|uk|eu|europe|emea|latam)\b/i, "remote but region-locked"],
];

/**
 * Negation guard. "Remote is Americas & Europe only, excludes India" mentions India and would
 * otherwise read as an OPEN match — the word is there, the meaning is the opposite. Any
 * India/Asia mention sitting next to an exclusion word is disqualified from rescuing a posting.
 */
const NEGATED_REGION =
  /\b(exclud\w*|except|outside|other than|apart from|excluding|not open to|not available in)\b[^.]{0,25}\b(india|asia|apac)\b|\b(india|asia|apac)\b[^.]{0,20}\b(not eligible|excluded|not included|not supported|is out of scope)\b/i;

const BLOCKED = [
  // Work authorisation. The single biggest killer in the YC channel.
  [/(\bus|\bu\.s\.) ?(citizens?|citizenship)( only| required)?\b/i, "US citizens only"],
  [/\b(us|u\.s\.)[- ]?(work )?(authoriz|authoris)ation (is )?required\b/i, "US work authorization required"],
  [/\bmust be (a )?(us|u\.s\.|american) citizen\b/i, "US citizen required"],
  // "no US visa sponsorship" and "no sponsorship available" both have to land here.
  [/\bno\b[^.]{0,20}\bsponsorship\b|\bwe (do not|don't|cannot|can't) sponsor\b|\bsponsorship (is )?not (available|offered|provided)\b/i, "no sponsorship"],
  [/\bsecurity clearance\b|\bTS\/SCI\b/i, "security clearance"],
  [/\bgreen card\b|\bcitizens? or permanent residents?\b/i, "citizen/PR only"],
  [/\bwork authoriz(ation|ed) (in|for) the (us|u\.s\.|united states)\b/i, "US work authorization"],

  // Geo-fenced "remote" (the "Remote - US" form is in LOCKED, checked earlier).
  [/\b(us|usa|eu|uk|europe|emea|canada|latam|americas)[- ]only\b/i, "region-only"],
  [/\bmust (be|reside|live) (located )?in the (us|u\.s\.|united states|uk|eu)\b/i, "must reside in region"],
  [/\b(us|eu|uk|canada)[- ]based (candidates?|applicants?|only)\b/i, "region-based candidates only"],
  [/\beligible to work in the (us|u\.s\.|uk|eu)\b/i, "regional work eligibility"],

  // Onsite / hybrid with no remote escape.
  [/\b(onsite|on-site|in[- ]office|in[- ]person)\s*(only|required)\b/i, "onsite only"],
  [/\bhybrid\b[^.]{0,40}\b\d\s*(-\s*\d\s*)?(days?|x)\s*[\/ ]?\s*(a |per )?(week|wk)\b/i, "hybrid, fixed office days"],
  [/\bhybrid\b[^.]{0,40}\bonsite\b|\bonsite\b[^.]{0,40}\bhybrid\b/i, "hybrid with onsite days"],
  // "ONSITE Manhattan 4 days/wk" states the wall without ever saying "only".
  [/\bon-?site\b[^.]{0,40}\b\d\s*(-\s*\d\s*)?days?\s*[\/ ]?\s*(a |per )?(week|wk)\b/i, "onsite N days/week"],
  [/\brelocat(e|ion) (to|is) (required|expected)\b/i, "relocation required"],
  [/\bno remote\b|\bnot (a )?remote\b|\bremote is not\b/i, "explicitly not remote"],
];

/** Structured location-restriction arrays (Himalayas, and anything else that ships them). */
const REGION_OK = /india|asia|apac|worldwide|global|anywhere/i;

/**
 * @param {object} input
 * @param {string} [input.text]        free-text JD / posting body
 * @param {string} [input.location]    a location string if the source has one
 * @param {string[]} [input.locationRestrictions] structured restriction list, if any
 * @param {string} [input.visa]        structured visa field, if any
 * @returns {{status:"open"|"blocked"|"unknown", reason:string}}
 */
export function reachability({ text = "", location = "", locationRestrictions, visa = "" } = {}, { relocateAbroad = CANDIDATE.relocateAbroad } = {}) {
  // 1. Structured restrictions beat prose every time — no regex needed and no false positives.
  if (Array.isArray(locationRestrictions) && locationRestrictions.length) {
    const ok = locationRestrictions.some((r) => REGION_OK.test(String(r)));
    return ok
      ? { status: "open", reason: `restrictions include ${locationRestrictions.filter((r) => REGION_OK.test(String(r))).join("/")}` }
      : { status: "blocked", reason: `restricted to ${locationRestrictions.slice(0, 3).join("/")}` };
  }

  // 2. Structured visa field (YC ships this).
  if (/US citizen\/visa only/i.test(visa)) return { status: "blocked", reason: "US citizen/visa only" };
  if (relocateAbroad && /will sponsor/i.test(visa)) return { status: "open", reason: "will sponsor" };

  // YC's visa line "US citizenship/visa not required" says the opposite of a wall, and the
  // "US citizens" block below would otherwise read it as one (Educato, Minerva).
  const hay = `${location} ${text}`.replace(/\bUS citizenship\/visa not required\b/gi, "");

  // 3. Open patterns first, so "Remote (India)" is never caught by a broad region block —
  //    unless the India/Asia mention is itself an exclusion, in which case it rescues nothing.
  const negated = NEGATED_REGION.test(hay);
  for (const [re, reason] of OPEN_EXPLICIT) {
    if (!re.test(hay)) continue;
    if (negated && /india|asia|apac/i.test(reason)) continue;
    return { status: "open", reason };
  }
  if (relocateAbroad && /\bwill sponsor\b|\bwe sponsor visas\b/i.test(hay)) return { status: "open", reason: "will sponsor" };
  for (const [re, reason] of TZ_LOCKED) if (re.test(hay)) return { status: "blocked", reason };
  // India-based cities already returned open above, so any onsite/in-person/hybrid role with no
  // remote option left here is abroad.
  if (!relocateAbroad && /\b(in[- ]person|on-?site|in[- ]office|hybrid)\b/i.test(hay) && !/\bremote\b/i.test(hay)) {
    return { status: "blocked", reason: "onsite outside India (not relocating)" };
  }
  for (const [re, reason] of OPEN_WORLDWIDE) if (re.test(hay)) return { status: "open", reason };
  for (const [re, reason] of LOCKED) if (re.test(hay)) return { status: "blocked", reason };
  for (const [re, reason] of OPEN_WEAK) if (re.test(hay)) return { status: "open", reason };
  for (const [re, reason] of BLOCKED) if (re.test(hay)) return { status: "blocked", reason };

  // HN "Who is hiring" uses a pipe header: `Company | Role | City | ONSITE | Full-time`.
  // A bare ONSITE there is the whole answer, but only when the word "remote" appears
  // nowhere else in the posting — plenty of them read `ONSITE or REMOTE`.
  if (/\|\s*on-?site\b/i.test(hay) && !/\bremote\b/i.test(hay)) {
    return { status: "blocked", reason: "onsite (no remote mentioned)" };
  }

  // Same wall in the bracket form HN job-story titles use: "[Berlin, on-site]" (Telli).
  if (/[\[(][^\])]*\bon-?site\b[^\])]*[\])]/i.test(hay) && !/\bremote\b/i.test(hay)) {
    return { status: "blocked", reason: "onsite (no remote mentioned)" };
  }

  return { status: "unknown", reason: "no location or authorization stated" };
}

/** Convenience: should this posting survive to the judgment pass? Unknown survives on purpose. */
export const isReachable = (input) => reachability(input).status !== "blocked";
