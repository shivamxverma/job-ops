#!/usr/bin/env node
/**
 * Thin wrapper — the real recorder lives at ~/.local/bin/meeting-recorder,
 * shared with work-ops (NC meeting transcription). This wrapper pins
 * --product job so recordings land under applications/{company}/interviews/
 * and chain into /interview-debrief instead of /work-meeting.
 */
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";

const SHARED = join(homedir(), ".local", "bin", "meeting-recorder", "meeting.mjs");
const r = spawnSync("node", [SHARED, ...process.argv.slice(2), "--product", "job"],
  { stdio: "inherit" });
process.exit(r.status ?? 1);
