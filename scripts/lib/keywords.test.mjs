#!/usr/bin/env node
/**
 * Regression test for scripts/lib/keywords.mjs.
 *
 *   node scripts/lib/keywords.test.mjs
 *
 * Why this file exists: keywords.mjs was written to fix substring matching across the scouts,
 * shipped with a docstring and no test, and then yc-scout.mjs kept its own `includes()` copy
 * for another day without anything noticing. reachability.mjs shipped with a backtest and had
 * no such drift. Every case below is a real false positive that scored points in a live run.
 *
 * Must stay at 0 failures.
 */
import { matchKeywords, matchStory, STRONG, WEAK, STORY } from "./keywords.mjs";

let failures = 0;
const check = (label, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) { failures++; console.log(`  ✗ ${label}\n      expected ${JSON.stringify(expected)}\n      got      ${JSON.stringify(actual)}`); }
  else console.log(`  ✓ ${label}`);
};

console.log("\nSubstring false positives (the bug this module exists to prevent):");
// Each of these scored real points before word-boundary matching landed.
check("'storage' does not match rag",        matchKeywords("object storage engineer").strong, []);
check("'leverage' does not match rag",       matchKeywords("leverage our platform").strong.filter((k) => k === "rag"), []);
check("'undefined' does not match defi",     matchKeywords("fixing undefined errors").strong, []);
check("'going'/'good' do not match go",      matchKeywords("going to be a good fit").strong, []);
check("'rapid' does not match api",          matchKeywords("rapid prototyping").weak, []);
check("'email' does not story-match ai",     matchStory("email marketing tools"), []);
check("'maintain' does not story-match ai",  matchStory("maintain training portals"), []);
check("'retail chains' stays clean",         matchStory("retail chains and supply"), []);

console.log("\nTrue positives still match:");
check("kafka",               matchKeywords("Kafka engineer, streaming").strong, ["kafka"]);
check("rag as a real word",  matchKeywords("build RAG pipelines").strong, ["rag"]);
check("node.js escapes ok",  matchKeywords("Node.js services").strong, ["node.js"]);
check("'express interest' is not express.js", matchKeywords("express interest below").strong, []);
check("next.js escapes ok",  matchKeywords("Next.js frontend").weak, ["next.js"]);
check("founding engineer",   matchKeywords("Founding Engineer, our first engineer").strong, ["founding engineer", "first engineer"]);
check("story: llm",          matchStory("LLM infrastructure"), ["llm"]);
check("story: code execution", matchStory("secure code execution"), ["code execution"]);

console.log("\nBare 'ai' is a real signal and must survive boundary matching:");
// Dropping it lost 16 of 31 genuine AI companies on the 2026-07-30 YC run.
check("'AI platform' matches",   matchStory("AI platform for phone-first sellers"), ["ai"]);
check("'Voice AI' matches",      matchStory("Voice AI"), ["ai"]);
check("'AI Copilot' matches",    matchStory("AI Copilot for insights"), ["ai"]);
check("but 'email' still not",   matchStory("email marketing"), []);
check("and 'available' not",     matchStory("available immediately"), []);

console.log("\nPlurals count as the same signal:");
check("'ai agents'",         matchStory("ai agents for collections").includes("ai agent"), true);
check("'job queues'",        matchKeywords("durable job queues").strong.includes("job queue"), true);
check("'llms'",              matchStory("serving LLMs at scale").includes("llm"), true);
check("plural keeps guard",  matchKeywords("object storage").strong, []);

console.log("\nList hygiene:");
const dupes = (arr) => arr.filter((k, i) => arr.indexOf(k) !== i);
check("no duplicate STRONG", dupes(STRONG), []);
check("no duplicate WEAK",   dupes(WEAK), []);
check("no duplicate STORY",  dupes(STORY), []);
check("STRONG/WEAK disjoint", STRONG.filter((k) => WEAK.includes(k)), []);

console.log(failures === 0 ? "\nPASS — 0 failures\n" : `\nFAIL — ${failures} failure(s)\n`);
process.exit(failures === 0 ? 0 : 1);
