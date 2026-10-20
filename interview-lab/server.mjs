#!/usr/bin/env node
// Shim. The lab now lives in learn-ops and serves both modes from one codebase, so the
// transcription vocabulary, the session protocol and the UI cannot drift between the interview
// side and the study side. This forwards to it with --mode interview.
//
//   node interview-lab/server.mjs --company scenr --role "..." [--port N]

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const LAB = process.env.LAB_HOME || join(homedir(), 'PROJECTS', 'Me', 'learn-ops', 'lab');
const entry = join(LAB, 'server.mjs');

if (!existsSync(entry)) {
  console.error(`The lab is not at ${LAB}.\nClone learn-ops next to job-ops, or set LAB_HOME.`);
  process.exit(1);
}

spawn(process.execPath, [entry, '--mode', 'interview', ...process.argv.slice(2)], {
  stdio: 'inherit',
}).on('exit', (c) => process.exit(c ?? 0));
