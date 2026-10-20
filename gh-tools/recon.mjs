#!/usr/bin/env node
/**
 * recon.mjs — GitHub recon on a target company for the /company-research dossier.
 *
 *   node gh-tools/recon.mjs <org-or-user>            # e.g. node gh-tools/recon.mjs zed-industries
 *   node gh-tools/recon.mjs <org> --out dossier      # append to applications/<org>/github-recon.md
 *
 * Answers: what do they ACTUALLY build with (vs the JD's claims), is the code alive,
 * who are the engineers (top recent committers ≈ likely interviewers/HM), and is there
 * a PR-wedge opportunity (good-first-issue / help-wanted counts).
 * Auth: GITHUB_TOKEN env or `gh auth token` (higher rate limits + private-org visibility).
 */
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const org = process.argv[2];
if (!org) { console.error("Usage: node gh-tools/recon.mjs <org-or-user> [--out dossier]"); process.exit(1); }

let token = process.env.GITHUB_TOKEN;
try { token ||= execSync("gh auth token", { encoding: "utf8" }).trim(); } catch {}

async function api(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { Accept: "application/vnd.github+json", ...(token && { Authorization: `Bearer ${token}` }) },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub ${res.status} on ${path}`);
  return res.json();
}

const repos =
  (await api(`/orgs/${org}/repos?sort=pushed&per_page=30`)) ??
  (await api(`/users/${org}/repos?sort=pushed&per_page=30`));
if (!repos) { console.error(`No GitHub org/user named "${org}" found.`); process.exit(1); }

const ninetyDaysAgo = new Date(Date.now() - 90 * 864e5).toISOString();
const langTotals = {};
const committers = {};
const active = repos.filter((r) => !r.fork && r.pushed_at > ninetyDaysAgo);
const top = [...active].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 6);

for (const r of top) {
  const langs = (await api(`/repos/${r.full_name}/languages`)) ?? {};
  for (const [l, bytes] of Object.entries(langs)) langTotals[l] = (langTotals[l] ?? 0) + bytes;
  const commits = (await api(`/repos/${r.full_name}/commits?since=${ninetyDaysAgo}&per_page=100`)) ?? [];
  for (const c of commits) {
    const login = c.author?.login;
    if (login && !login.includes("[bot]")) committers[login] = (committers[login] ?? 0) + 1;
  }
}

const totalBytes = Object.values(langTotals).reduce((a, b) => a + b, 0) || 1;
const langLine = Object.entries(langTotals).sort((a, b) => b[1] - a[1]).slice(0, 8)
  .map(([l, b]) => `${l} ${Math.round((100 * b) / totalBytes)}%`).join(" · ");
const people = Object.entries(committers).sort((a, b) => b[1] - a[1]).slice(0, 8);

// PR-wedge signal
let wedge = [];
for (const r of top.slice(0, 4)) {
  for (const label of ["good first issue", "help wanted"]) {
    const issues = (await api(`/repos/${r.full_name}/issues?labels=${encodeURIComponent(label)}&state=open&per_page=5`)) ?? [];
    wedge.push(...issues.filter((i) => !i.pull_request).map((i) => `- [${r.name}#${i.number}](${i.html_url}) ${i.title} *(${label})*`));
  }
}

const md = `## GitHub recon — ${org} (${new Date().toISOString().slice(0, 10)})

**Repos:** ${repos.length} fetched, ${active.length} pushed in last 90 days ${active.length === 0 ? "⚠️ codebase looks quiet — verify they build in public at all" : ""}
**Actual languages (top repos, by bytes):** ${langLine || "n/a"}
> Compare against the JD's claimed stack — mismatch is a dossier finding either way.

**Most-active repos:**
${top.map((r) => `- [${r.name}](${r.html_url}) ★${r.stargazers_count} — pushed ${r.pushed_at.slice(0, 10)}${r.description ? ` — ${r.description}` : ""}`).join("\n") || "- none active"}

**Top committers last 90d (likely engineers/interviewers — look them up on X/LinkedIn):**
${people.map(([login, n]) => `- [\`${login}\`](https://github.com/${login}) — ${n} commits`).join("\n") || "- none visible"}

**PR-wedge candidates (open good-first-issue / help-wanted):**
${wedge.slice(0, 10).join("\n") || "- none labeled — run pr-wedge.mjs with keywords for a deeper scan"}
`;

if (process.argv.includes("--out")) {
  const dir = join(ROOT, "applications", org.toLowerCase());
  mkdirSync(dir, { recursive: true });
  const out = join(dir, "github-recon.md");
  writeFileSync(out, md);
  console.log(`Written → ${out}\n\n${md}`);
} else {
  console.log(md);
}
