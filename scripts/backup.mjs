#!/usr/bin/env node
/**
 * backup.mjs — stage the pipeline's *data* churn, and refuse to touch anything else.
 *
 *   node scripts/backup.mjs              # show what would be staged, and what is being left
 *   node scripts/backup.mjs --commit     # stage the data paths and commit them
 *   node scripts/backup.mjs --commit -m "..."   # override the generated subject
 *
 * Why this exists (builder-ops F13, confirmed in this repo 2026-09-05).
 *
 * Every session produces churn under applications/, inbox/ and resumes/ that is worth keeping
 * but is not worth a story: a scout wrote four JSON files, a tracker cell moved, a dossier grew.
 * The habit that produced was `git add -A` plus a message starting `chore(pipeline): backup ...`,
 * and that is a trap, because ~/.claude-machine/CLAUDE.md makes the commit message load-bearing:
 * lifelog parses every commit deterministically, `chore` scores -1, and anything under 3 is
 * collapsed into "Also: N smaller commits" and never described individually.
 *
 * So a feature committed inside a backup is not mislabelled. It is deleted from his profile.
 * Both blanket commits in this repo did exactly that:
 *
 *   efc9a45  chore(pipeline): backup accumulated pipeline state ...
 *            swept in .claude/skills/go-live/SKILL.md (100 new lines) and
 *            scripts/watch-queue.mjs — i.e. the entire live-session bridge — plus .DS_Store
 *   0b95922  chore(pipeline): backup accumulated applications, inbox scans and scripts
 *            swept in scripts/actions.mjs, scripts/followups.mjs, scripts/lib/state.mjs,
 *            scripts/interview-menubar.2s.sh (new) and CLAUDE.md
 *
 * F13's suggested fix was "make the backup job stage explicit paths". This repo has no backup
 * job — the scout workflow already stages `inbox/` correctly and there is no launchd agent. The
 * blanket add was a *session habit*, so the fix has to be a tool a session reaches for instead.
 * Hence this script, and the rule in CLAUDE.md that points at it.
 *
 * The staging half is the obvious part. The half that actually closes the finding is that this
 * prints what it is NOT staging, because the failure was never "the wrong files went in" — it
 * was that nobody noticed the feature going in. A leftover list turns silent absorption into a
 * visible debt: those files still owe a real, typed, scoped commit of their own.
 */

import { execFileSync } from "node:child_process";
import { today } from "./lib/today.mjs";

/** Directories whose churn is data: regenerated or appended every session, never a feature. */
const DATA_PATHS = ["applications", "inbox", "resumes"];

/**
 * Everything else is code or claims-about-Shivam and must be committed deliberately, with its own
 * type and scope. profile/ is deliberately NOT here: a sink sync is a real `docs(profile):`
 * commit (see 8c389eb), not backup noise.
 */

const args = process.argv.slice(2);
const doCommit = args.includes("--commit");
const msgIdx = args.findIndex((a) => a === "-m" || a === "--message");
const customMsg = msgIdx !== -1 ? args[msgIdx + 1] : null;

const git = (...a) => execFileSync("git", a, { encoding: "utf8" });

/** Porcelain v1 lines are "XY path"; renames are "XY old -> new". We only need the path. */
function changed() {
  return git("status", "--porcelain")
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const path = line.slice(3);
      const arrow = path.indexOf(" -> ");
      return arrow === -1 ? path : path.slice(arrow + 4);
    });
}

const all = changed();
if (all.length === 0) {
  console.log("nothing to back up — working tree is clean");
  process.exit(0);
}

const isData = (p) => DATA_PATHS.some((d) => p === d || p.startsWith(`${d}/`));
const data = all.filter(isData);
const rest = all.filter((p) => !isData(p));

console.log(`\n[1mDATA — safe to back up (${data.length})[0m`);
if (data.length === 0) console.log("  (none)");
else {
  const byDir = {};
  for (const p of data) (byDir[p.split("/")[0]] ??= []).push(p);
  for (const [dir, files] of Object.entries(byDir)) {
    console.log(`  ${dir}/  ${files.length} file(s)`);
  }
}

if (rest.length) {
  console.log(`\n[1mLEFT UNSTAGED — these owe a real commit (${rest.length})[0m`);
  for (const p of rest) console.log(`  ${p}`);
  console.log(
    "\n  Not a warning to click past. A chore commit scores -1 and gets collapsed out of\n" +
      "  every digest, so anything real in this list disappears from his profile if it rides\n" +
      "  along. Commit these separately with their own type and scope."
  );
}

if (!doCommit) {
  console.log("\n(dry run — pass --commit to stage and commit the data paths)");
  process.exit(0);
}

if (data.length === 0) {
  console.log("\nnothing staged: no data churn to back up");
  process.exit(0);
}

// Stage only the data roots. Never `git add -A`, never a bare `git add .` — a backup that can
// only reach the directories it backs up cannot absorb anything else, which is the whole point.
const roots = DATA_PATHS.filter((d) => data.some((p) => p === d || p.startsWith(`${d}/`)));
git("add", "--", ...roots);

const staged = git("diff", "--cached", "--name-only").split("\n").filter(Boolean);
const leaked = staged.filter((p) => !isData(p));
if (leaked.length) {
  // Something was already in the index before this ran. Refuse rather than commit it silently.
  console.error(
    `\n[31mREFUSING TO COMMIT[0m — ${leaked.length} non-data file(s) were already staged:\n` +
      leaked.map((p) => `  ${p}`).join("\n") +
      "\n\nUnstage them (git restore --staged <path>) and re-run, or commit them properly first."
  );
  process.exit(1);
}

const subject = customMsg ?? `chore(pipeline): back up ${roots.join(", ")} churn through ${today()}`;
const body =
  `Data-only backup: ${staged.length} file(s) under ${roots.map((r) => `${r}/`).join(", ")}.\n` +
  `Staged by scripts/backup.mjs, which cannot reach anything outside those roots.\n` +
  (rest.length
    ? `\nDeliberately left out of this commit (${rest.length} file(s)), still owing their own:\n` +
      rest.map((p) => `  ${p}`).join("\n") + "\n"
    : "");

git("commit", "-m", subject, "-m", body);
console.log(`\n[32mcommitted[0m ${staged.length} data file(s)`);
if (rest.length) console.log(`${rest.length} file(s) still uncommitted, on purpose — see above`);
