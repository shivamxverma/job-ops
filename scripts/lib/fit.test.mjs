#!/usr/bin/env node
/**
 * Regression test for scripts/lib/fit.mjs and the 2026-09-29 retune.
 *
 *   node scripts/lib/fit.test.mjs
 *
 * Every case is a real posting from the first scout run on Shivam's profile, labelled by
 * reading the JD. That run graded 11 postings A/B and 10 of them were wrong on the seat, not
 * the stack. Must stay at 0 failures.
 */
import { seatFit, statedYears } from "./fit.mjs";
import { matchStory, storyPoints } from "./keywords.mjs";

let failures = 0;
const check = (label, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) { failures++; console.log(`  ✗ ${label}\n      expected ${JSON.stringify(expected)}\n      got      ${JSON.stringify(actual)}`); }
  else console.log(`  ✓ ${label}`);
};
const rejected = (title, text = "") => seatFit({ title, text }).reject !== null;
const delta = (title, text = "", minYears = null) => seatFit({ title, text, minYears }).delta;

console.log("\nNon-engineering seats are dropped (each scored A/B on 2026-09-29):");
check("QuestDB Pre-Sales Engineer",        rejected("Pre-Sales Engineer, North America"), true);
check("QuestDB Sales Engineer",            rejected("QuestDB (YC S20) Is Hiring a Sales Engineer"), true);
check("Fin Solutions Architect",           rejected("Solutions Architect -Spanish Speaking"), true);
check("Lingo.dev content engineer",        rejected("Lingo.dev (YC F24) is hiring a senior content engineer"), true);
check("Mastra customer engineer",          rejected("Customer Engineer"), true);

console.log("\nEngineering seats survive:");
check("multi-role 'eng, product and GTM'", rejected("Nango (YC W23) is hiring across eng, product and GTM"), false);
check("'engineers and designers'",         rejected("Telli (YC F24) is hiring engineers and designers"), false);
check("Full Stack AI Engineer",            rejected("Full Stack AI Engineer (Back-end leaning)"), false);
check("Product Engineer",                  rejected("Stable (YC W20) Is Hiring Product Engineers"), false);
check("Platform Engineer",                 rejected("Cloud / Platform Engineer"), false);
check("Backend Software Engineer",         rejected("Backend Software Engineer"), false);

console.log("\nSeniority sinks the grade, hard for the top of the ladder:");
check("Chief Architect -30",               delta("Chief Architect"), -30);
check("Staff Backend Engineer -30",        delta("Staff Backend Engineer"), -30);
check("Senior AI Engineer -15",            delta("Senior AI Engineer"), -15);
check("plain engineer 0",                  delta("Backend Software Engineer"), 0);
check("new grad +8",                       delta("Software Engineer, New Grad"), 8);

console.log("\nIndian ATS titles (2026-10-21 ats-scout run):");
check("Member of Technical Staff is not Staff", delta("Member of Technical Staff - Platform Eng"), 0);
check("Member Technical Staff variant 0",  delta("Member of the Technical Staff, Product Eng"), 0);
check("'Member Technical Staff' (Composio) 0", delta("Member Technical Staff - Applied AI Engineer"), 0);
check("SDE I +8 (Hevo)",                   delta("SDE I"), 8);
check("SDE-1 +8",                          delta("SDE-1, Backend"), 8);
check("Software Engineer I +8",            delta("Software Engineer I"), 8);
check("Associate SDE +8",                  delta("Associate Software Development Engineer"), 8);
check("SDE II stays 0",                    delta("SDE II"), 0);
check("Software Engineer II stays 0",      delta("Software Engineer II"), 0);
check("'Engineer In' is not level 1",      delta("Software Engineer In Test"), 0);
check("Staff Engineer still -30",          delta("Staff Engineer"), -30);
check("SDE - 3 - Frontend -15 (Cloudsek)", delta("SDE - 3 - Frontend"), -15);
check("SDE III -15",                       delta("SDE III"), -15);
check("Software Engineer 4 -15",           delta("Software Engineer 4"), -15);
check("SDE 2 still 0",                     delta("SDE 2"), 0);

console.log("\nStated years are read from free text:");
check("4+ years (Interview Resources)",    statedYears("Four or more years building backend systems in TypeScript or another strongly typed language"), 4);
check("3+ years (Stable)",                 statedYears("3+ years of experience as a product engineer"), 3);
check("2-3+ years (AiMi)",                 statedYears("looking for 2-3+ years hands-on experience"), 2);
check("no bar stated",                     statedYears("we hire on fundamentals and side projects"), null);
check("'three years of experience'",      statedYears("three years of experience with Postgres"), 3);
check("company age is not a bar",          statedYears("operating for 5 years, profitable"), null);
check("4+ years costs -15",                delta("Full Stack AI Engineer", "4+ years building backend systems"), -15);
check("YC minExperience 4 costs -15",      delta("Software Engineer", "", 4), -15);
check("5+ years costs -30",                delta("Software Engineer", "5+ years of experience"), -30);

console.log("\nStory points: infra match beats AI vocabulary:");
check("AI vocab only = 12",                storyPoints(matchStory("AI agent platform for support teams")), 12);
check("infra match = 25",                  storyPoints(matchStory("durable job queue, sandboxed code execution")), 25);
check("both = 25",                         storyPoints(matchStory("LLM agents with a data pipeline")), 25);
check("neither = 0",                       storyPoints(matchStory("marketplace for sneakers")), 0);

console.log(failures === 0 ? "\nPASS — 0 failures\n" : `\nFAIL — ${failures} failure(s)\n`);
process.exit(failures === 0 ? 0 : 1);
