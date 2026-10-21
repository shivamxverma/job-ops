/**
 * Seat fit — is this a seat Shivam can actually sit in, independent of stack overlap?
 *
 * Built after the first run on his profile (2026-09-29): 10 of 11 scripted A/B grades failed on
 * reading the JD, and none of them failed on stack. They failed on the seat: sales engineers,
 * solutions architects, content engineers and a Chief Architect all scored as engineering fits,
 * and a 4+ years bar was invisible off the YC grid. Every scout calls this, so the same posting
 * gets the same seat verdict whichever channel found it.
 *
 * Deltas, not a filter: a penalty sinks the grade and says why, and only a clearly non-engineering
 * title is dropped outright. Candidate is ~8 months professional (facts.yaml
 * knockout_answers.years_of_experience).
 */

const NON_ENG = /\b(pre-?sales( engineers?)?|sales engineers?|solutions? (architect|engineer|consultant)s?|customer (success )?engineers?|support engineers?|content engineers?|technical writer|developer (relations|advocate)|devrel|gtm|go-to-market|account (executive|manager)|recruit\w*|product manager|product marketing|designer|marketing|head of sales|sales)\b/i;
const ENG_WORD = /\b(engineers?|engineering|eng|developers?|swe|sde|programmers?)\b/i;
const TOP_SENIOR = /\b(chief|cto|vp|vice president|head of|director|principal|staff|distinguished|architect)\b/i;
// "SDE - 3", "SDE III", "Software Engineer 3/III/IV" are senior levels on Indian ladders (usually
// 4-7 years); Cloudsek's "SDE - 3 - Frontend" graded B on 2026-10-22 without this.
const SENIOR = /\b(senior|sr\.?|lead)\b|\b(sde|software (development )?engineer)\s*[-–]?\s*(3|iii|4|iv)\b/i;
// Level-1 titles from Indian ATS boards ("SDE I", "SDE-1", "Software Engineer I", "Associate
// Software Development Engineer") are exactly his level; Hevo's "SDE I" graded C without them.
// "SDE II" doesn't match: the trailing \b fails between the two I's.
const JUNIOR = /\b(junior|jr\.?|new grad|graduate|entry[- ]level|early[- ]career|associate( software)?( development)? engineer|sde[- ]?(1|i)|(software|backend|frontend|full.?stack)( development)? engineer[- ]?(1|i))\b/i;

const WORD_NUM = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };

/** Lowest stated years requirement in free text ("4+ years", "3-5 years of experience"), or null. */
export function statedYears(text = "") {
  // "Four or more years" (Interview Resources' own wording) must read the same as "4+ years".
  text = String(text).replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten)(\s+or\s+more)?\b(?=\s+years?)/gi,
    (_, w, more) => `${WORD_NUM[w.toLowerCase()]}${more ? "+" : ""}`);
  const re = /\b(\d{1,2})\s*\+?\s*(?:(?:-|–|to)\s*\d{1,2}\s*)?(?:\+\s*)?years?\b[^.]{0,40}?\b(experience|exp\b|building|in (a |the )?(backend|software|production|industry))/gi;
  let min = null;
  for (const m of String(text).matchAll(re)) {
    const n = Number(m[1]);
    if (n > 0 && n <= 20 && (min === null || n < min)) min = n;
  }
  return min;
}

/**
 * @param {{title?:string, text?:string, minYears?:number|null}} p
 * @returns {{delta:number, reject:string|null, why:string[]}}
 */
export function seatFit({ title = "", text = "", minYears = null } = {}) {
  const why = [];
  let delta = 0;

  // A multi-role title ("hiring across eng, product and GTM", "engineers and designers") keeps
  // its engineering seat: only reject when nothing engineering is left once the non-eng
  // phrases are removed ("Sales Engineer" leaves nothing).
  if (NON_ENG.test(title)) {
    const rest = title.replace(new RegExp(NON_ENG.source, "gi"), " ");
    if (!ENG_WORD.test(rest)) return { delta: 0, reject: "non-engineering seat", why: [`non-eng title: ${title.match(NON_ENG)[0]}`] };
  }

  // "Member of Technical Staff" is a plain IC title at many startups (Composio, DevRev), not
  // Staff level, so it must not trip the "staff" dock.
  const seat = title.replace(/\bmember (of )?(the )?technical staff\b/gi, "MTS");
  if (TOP_SENIOR.test(seat)) { delta -= 30; why.push(`${seat.match(TOP_SENIOR)[0]}-level title`); }
  else if (SENIOR.test(seat)) { delta -= 15; why.push("senior-titled"); }
  else if (JUNIOR.test(seat)) { delta += 8; why.push("junior/new-grad seat"); }

  const years = minYears ?? statedYears(text);
  if (years !== null) {
    if (years >= 5) { delta -= 30; why.push(`${years}+ years stated`); }
    else if (years >= 3) { delta -= 15; why.push(`${years}+ years stated (stretch)`); }
    else if (years >= 2) { delta -= 5; why.push(`${years}+ years stated`); }
    else { delta += 4; why.push("0-1 years ok"); }
  }
  return { delta, reject: null, why };
}

export const grade = (score) => (score >= 80 ? "A" : score >= 62 ? "B" : score >= 45 ? "C" : score >= 30 ? "D" : "F");
