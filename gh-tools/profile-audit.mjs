#!/usr/bin/env node
/**
 * profile-audit.mjs — audit Shivam's own GitHub as a landing page.
 * Recruiters click the GitHub link before replying; this checks what they'll see.
 *
 *   node gh-tools/profile-audit.mjs            # audits shivamxverma
 *   node gh-tools/profile-audit.mjs <user>
 *
 * Checks: pinned repos vs resume flagships, README + live-link presence on key repos,
 * descriptions, profile README, staleness. Prints a fix list.
 */
import { execSync } from "node:child_process";

const user = process.argv[2] ?? "shivamxverma";
// The repos the resume/outreach leads with — these MUST look good.
const FLAGSHIPS = ["yuvro", "CodeSM", "hireflow", "Storix", "chatterly"];

let token = process.env.GITHUB_TOKEN;
try { token ||= execSync("gh auth token", { encoding: "utf8" }).trim(); } catch {}
const headers = { Accept: "application/vnd.github+json", ...(token && { Authorization: `Bearer ${token}` }) };
const api = async (path) => {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  return res.ok ? res.json() : null;
};

const fixes = [];
const ok = [];

// Pinned repos (GraphQL)
let pinned = [];
if (token) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST", headers,
    body: JSON.stringify({ query: `{ user(login: "${user}") { pinnedItems(first: 6, types: REPOSITORY) { nodes { ... on Repository { name description homepageUrl } } } } }` }),
  });
  pinned = (await res.json())?.data?.user?.pinnedItems?.nodes ?? [];
  const pinnedNames = pinned.map((p) => p.name.toLowerCase());
  const missing = FLAGSHIPS.filter((f) => !pinnedNames.includes(f.toLowerCase()));
  if (missing.length) fixes.push(`Pin the flagships the resume leads with — missing from pins: ${missing.join(", ")} (Profile → Customize your pins)`);
  else ok.push("All resume flagships are pinned.");
} else {
  fixes.push("No token — couldn't check pinned repos. Run `gh auth login` first.");
}

// Profile README
const profileReadme = await api(`/repos/${user}/${user}/readme`);
if (!profileReadme) fixes.push(`No profile README — create repo "${user}/${user}" with a README.md: one-line pitch, 3 flagship links with numbers (CodeSM live demo, Yuvro, Hireflow), shivamworks.dev link.`);
else ok.push("Profile README exists.");

// Flagship repo health
for (const name of FLAGSHIPS) {
  const repo = await api(`/repos/${user}/${name}`);
  if (!repo) { fixes.push(`Repo "${name}" not found under ${user} — resume links to it?`); continue; }
  const problems = [];
  if (!repo.description) problems.push("no description");
  if (!repo.homepage) problems.push("no website/live URL in the repo header");
  const readme = await api(`/repos/${user}/${name}/readme`);
  if (!readme) problems.push("NO README");
  else {
    const content = Buffer.from(readme.content, "base64").toString();
    if (content.length < 500) problems.push("README under 500 chars — add what/how/impact + screenshots");
    if (!/https?:\/\//.test(content.slice(0, 600))) problems.push("no link in README's first screen — put the live URL at the top");
  }
  const staleDays = Math.round((Date.now() - new Date(repo.pushed_at)) / 864e5);
  if (staleDays > 180) problems.push(`last push ${staleDays}d ago — one small commit (README polish counts) resets the "is this maintained?" smell`);
  if (problems.length) fixes.push(`${name}: ${problems.join("; ")}`);
  else ok.push(`${name}: description ✓ live URL ✓ README ✓ fresh ✓`);
}

console.log(`# GitHub profile audit — ${user}\n`);
console.log(`## Looks good\n${ok.map((o) => `- ${o}`).join("\n") || "- (nothing yet)"}\n`);
console.log(`## Fix list (ordered — recruiters see pins first)\n${fixes.map((f, i) => `${i + 1}. ${f}`).join("\n") || "Nothing to fix. 🎉"}`);
