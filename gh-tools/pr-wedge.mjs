#!/usr/bin/env node
/**
 * pr-wedge.mjs — find one real, small, in-stack issue at a target company that Shivam
 * could fix with a PR. A merged PR in their repo is the strongest possible application.
 *
 *   node gh-tools/pr-wedge.mjs <org> [extra keywords...]
 *   node gh-tools/pr-wedge.mjs zed-industries typescript electron
 *
 * Ranks open issues by: stack match (his languages) + freshness + low competition
 * (few comments, unassigned). Reserve this for motivation-3 targets — a PR is real work.
 */
import { execSync } from "node:child_process";

const org = process.argv[2];
if (!org) { console.error("Usage: node gh-tools/pr-wedge.mjs <org> [keywords...]"); process.exit(1); }
const extraKw = process.argv.slice(3).map((k) => k.toLowerCase());

const STACK = ["typescript", "javascript", "python", "c++",
  "next.js", "nextjs", "react", "fastapi", "node", "express", "postgres", "redis", "kafka",
  "docker", "kubernetes", "bullmq", "celery", "playwright", "llm", "agent", ...extraKw];

let token = process.env.GITHUB_TOKEN;
try { token ||= execSync("gh auth token", { encoding: "utf8" }).trim(); } catch {}
const api = async (path) => {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { Accept: "application/vnd.github+json", ...(token && { Authorization: `Bearer ${token}` }) },
  });
  return res.ok ? res.json() : null;
};

const repos = (await api(`/orgs/${org}/repos?sort=pushed&per_page=15`)) ?? (await api(`/users/${org}/repos?sort=pushed&per_page=15`));
if (!repos) { console.error(`No org/user "${org}".`); process.exit(1); }

const candidates = [];
for (const r of repos.filter((r) => !r.fork && !r.archived).slice(0, 8)) {
  const issues = (await api(`/repos/${r.full_name}/issues?state=open&sort=created&direction=desc&per_page=50`)) ?? [];
  for (const i of issues) {
    if (i.pull_request) continue;
    const text = `${i.title} ${i.body ?? ""}`.toLowerCase();
    const labels = i.labels.map((l) => (typeof l === "string" ? l : l.name).toLowerCase());
    const stackHits = STACK.filter((k) => text.includes(k) || (r.language ?? "").toLowerCase() === k);
    let score = stackHits.length * 3;
    if (labels.some((l) => /good.first|help.wanted|starter|easy/.test(l))) score += 6;
    if (labels.some((l) => /bug/.test(l))) score += 3;
    if (!i.assignee && !i.assignees?.length) score += 3; else score -= 5;
    if (i.comments <= 2) score += 2;
    const ageDays = (Date.now() - new Date(i.created_at)) / 864e5;
    if (ageDays < 30) score += 2;
    if (/roadmap|discussion|question|tracking/.test(labels.join(" ") + i.title.toLowerCase())) score -= 4;
    if (score >= 6) candidates.push({ score, repo: r.name, lang: r.language, i, stackHits, labels });
  }
}

candidates.sort((a, b) => b.score - a.score);
if (!candidates.length) {
  console.log(`No good wedge issues at ${org} right now. Alternatives: fix something you hit while actually USING their product, or check their docs repo for gaps.`);
} else {
  console.log(`# PR-wedge candidates at ${org}\n`);
  for (const c of candidates.slice(0, 10)) {
    console.log(`- **[${c.repo}#${c.i.number}](${c.i.html_url})** (score ${c.score}, ${c.lang ?? "?"}) ${c.i.title}`);
    console.log(`  labels: ${c.labels.join(", ") || "none"} · comments: ${c.i.comments} · stack: ${c.stackHits.join(", ") || "repo language only"}`);
  }
  console.log(`\nPick ONE. Comment on the issue first ("I'd like to take this — planning X"), fix it properly, then reference the merged PR in your outreach. Log it in the company's log.md.`);
}
