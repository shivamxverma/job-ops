#!/usr/bin/env node
/**
 * Audio for /job-video — the SFX cue sheet plus short musical stingers.
 *
 * Two deliberate departures from `chalkboard-video`'s sound rules, and one thing kept:
 *
 *  KEPT: **no background music under speech.** Beds were tried in the X videos and cut —
 *  they buzz, they fight the voice, and on a job application they make it read like an ad.
 *
 *  ADDED: **stingers.** Shivam asked for "some little musics, not bgm", which is exactly the
 *  right instinct for this format. A stinger is 1–2 seconds, lands on a specific beat, and
 *  stops. It marks a moment; it does not carpet the video. Five of them, one per beat of the
 *  job-video structure, so the shape of the video is audible even when it is watched muted
 *  and then re-watched with sound.
 *
 *  ADDED: **a cue sheet.** Which sound fires on which beat is a decision, not an improvisation,
 *  and writing it down is what stops a video ending up at 2 SFX per second.
 *
 * Everything is synthesized from math with a seeded PRNG, so runs are byte-identical and
 * nothing is downloaded or licensed.
 *
 *   node scripts/video-audio.mjs             # stingers + cue sheet
 *   node scripts/video-audio.mjs --cues      # print the cue sheet only, generate nothing
 *
 * Output: video/public/audio/*.mp3 and video/audio-cues.json. Requires ffmpeg.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdirSync, unlinkSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "video", "public", "audio");
const SR = 44100;
const TAU = Math.PI * 2;
const CUES_ONLY = process.argv.includes("--cues");

// ---------------------------------------------------------------- cue sheet
/**
 * The beat structure from job-video/SKILL.md, with its sound. Density is the point: at most
 * two cues per beat. The voice is the star; audio confirms what the eye already saw.
 */
const CUES = [
  {
    beat: "HOOK", window: "0:00–0:08",
    cues: [{ at: "on the first frame", sound: "sting-open", why: "one soft note so the video does not start on dead air" }],
  },
  {
    beat: "PROOF 1", window: "0:08–0:35",
    cues: [
      { at: "when the UI panel draws on", sound: "ui-appear", why: "confirms the screen arriving, ~0.2s" },
      { at: "on the number stamp", sound: "sting-proof", why: "the $9,000 / 160-users moment. This is the one cue viewers remember" },
    ],
  },
  {
    beat: "PROOF 2", window: "0:35–1:00",
    cues: [
      { at: "on the panel swap", sound: "ui-appear", why: "same cue, same meaning — consistency is why it reads as a system" },
      { at: "on the number stamp", sound: "sting-proof", why: "transposed up a tone by the renderer so it is not a literal repeat" },
    ],
  },
  {
    beat: "THE GAP", window: "1:00–1:15",
    cues: [{ at: "as the honest limitation is stated", sound: "sting-gap", why: "unresolved interval, no percussion. It should feel like the sentence it accompanies, not like a mistake" }],
  },
  {
    beat: "CLOSE", window: "1:15–1:30",
    cues: [{ at: "as the links appear", sound: "sting-close", why: "the only resolved chord in the video. It is the full stop" }],
  },
];

if (CUES_ONLY) {
  console.log("\n/job-video audio cue sheet\n");
  for (const b of CUES) {
    console.log(`  ${b.beat.padEnd(9)} ${b.window}`);
    for (const c of b.cues) console.log(`      ${c.sound.padEnd(12)} ${c.at}\n                   ${c.why}`);
  }
  console.log("\n  Rule: max 2 cues per beat, no music bed, mix under the voice.\n");
  process.exit(0);
}

// ---------------------------------------------------------------- synth
const buf = (sec) => ({ L: new Float64Array(Math.ceil(sec * SR)), R: new Float64Array(Math.ceil(sec * SR)), n: Math.ceil(sec * SR) });
const midi = (m) => 440 * 2 ** ((m - 69) / 12);

/** Additive tone with an exponential pluck decay — the whole palette is built from this. */
function tone(b, { at, dur, freq, amp = 0.2, harmonics = [1, 0.4, 0.18], decay = 3, attack = 0.006, pan = 0, vibrato = 0 }) {
  const start = Math.floor(at * SR);
  const len = Math.floor(dur * SR);
  for (let i = 0; i < len; i++) {
    const idx = start + i;
    if (idx < 0 || idx >= b.n) continue;
    const t = i / SR;
    const env = (t < attack ? t / attack : 1) * Math.exp(-decay * t);
    let s = 0;
    for (let h = 0; h < harmonics.length; h++) {
      const f = freq * (h + 1) * (1 + (vibrato ? 0.004 * Math.sin(TAU * 5 * t) : 0));
      s += harmonics[h] * Math.sin(TAU * f * t);
    }
    const v = s * env * amp;
    b.L[idx] += v * (1 - Math.max(0, pan));
    b.R[idx] += v * (1 + Math.min(0, pan));
  }
}

/** Soft filtered-noise transient, for the UI-appear tick. */
function noise(b, { at, dur, amp = 0.06, decay = 40, seed = 7 }) {
  let a = seed >>> 0;
  const rnd = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296 - 0.5;
  };
  const start = Math.floor(at * SR);
  const len = Math.floor(dur * SR);
  let lp = 0;
  for (let i = 0; i < len; i++) {
    const idx = start + i;
    if (idx < 0 || idx >= b.n) continue;
    const t = i / SR;
    lp += 0.18 * (rnd() - lp); // one-pole lowpass, takes the fizz off
    const v = lp * Math.exp(-decay * t) * amp;
    b.L[idx] += v;
    b.R[idx] += v;
  }
}

function writeWav(b, path) {
  const n = b.n;
  const data = Buffer.alloc(n * 4);
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(b.L[i]), Math.abs(b.R[i]));
  const g = peak > 0.98 ? 0.98 / peak : 1;
  for (let i = 0; i < n; i++) {
    data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(b.L[i] * g * 32767))), i * 4);
    data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(b.R[i] * g * 32767))), i * 4 + 2);
  }
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + data.length, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(data.length, 40);
  writeFileSync(path, Buffer.concat([h, data]));
}

// ---------------------------------------------------------------- the five stingers
// Key of A minor throughout so they belong to one video. Kept sparse: two or three notes
// each. Anything busier competes with speech.
const A3 = 57, C4 = 60, D4 = 62, E4 = 64, G4 = 67, A4 = 69, B4 = 71, C5 = 72, E5 = 76;

const PIECES = {
  // One warm note. Presence, not melody.
  "sting-open": () => {
    const b = buf(1.6);
    tone(b, { at: 0, dur: 1.5, freq: midi(A3), amp: 0.16, decay: 2.2, harmonics: [1, 0.3, 0.1] });
    tone(b, { at: 0.02, dur: 1.4, freq: midi(E4), amp: 0.09, decay: 2.4, harmonics: [1, 0.25] });
    return b;
  },
  // Rising minor third into a fifth — reads as "here is the evidence", not as a fanfare.
  "sting-proof": () => {
    const b = buf(1.9);
    tone(b, { at: 0.00, dur: 0.9, freq: midi(A4), amp: 0.17, decay: 4.5 });
    tone(b, { at: 0.13, dur: 0.9, freq: midi(C5), amp: 0.16, decay: 4.5 });
    tone(b, { at: 0.26, dur: 1.5, freq: midi(E5), amp: 0.19, decay: 2.6, harmonics: [1, 0.35, 0.12] });
    tone(b, { at: 0.26, dur: 1.5, freq: midi(A3), amp: 0.08, decay: 2.0, harmonics: [1, 0.2] });
    return b;
  },
  // Deliberately unresolved: a major second held against the root. It should sit slightly
  // wrong, because it plays under him saying what he cannot do yet.
  "sting-gap": () => {
    const b = buf(2.2);
    tone(b, { at: 0, dur: 2.1, freq: midi(A3), amp: 0.13, decay: 1.5, harmonics: [1, 0.25, 0.08] });
    tone(b, { at: 0.05, dur: 2.0, freq: midi(B4), amp: 0.10, decay: 1.6, harmonics: [1, 0.2], vibrato: 1 });
    return b;
  },
  // The only resolved chord in the video. A minor triad, arpeggiated, left to ring.
  "sting-close": () => {
    const b = buf(2.6);
    tone(b, { at: 0.00, dur: 2.4, freq: midi(A3), amp: 0.15, decay: 1.3, harmonics: [1, 0.3, 0.12] });
    tone(b, { at: 0.10, dur: 2.3, freq: midi(C4), amp: 0.12, decay: 1.4 });
    tone(b, { at: 0.20, dur: 2.2, freq: midi(E4), amp: 0.12, decay: 1.4 });
    tone(b, { at: 0.30, dur: 2.1, freq: midi(A4), amp: 0.14, decay: 1.2, harmonics: [1, 0.3, 0.1] });
    return b;
  },
  // Not music. A 0.2s tick for a panel arriving.
  "ui-appear": () => {
    const b = buf(0.35);
    noise(b, { at: 0, dur: 0.12, amp: 0.05, decay: 55 });
    tone(b, { at: 0.01, dur: 0.3, freq: midi(G4), amp: 0.07, decay: 16, harmonics: [1, 0.2] });
    return b;
  },
};

// ---------------------------------------------------------------- run
try {
  execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
} catch {
  console.error("ffmpeg not on PATH. `brew install ffmpeg`, then re-run.");
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
console.log("Synthesizing /job-video stingers\n");

for (const [name, make] of Object.entries(PIECES)) {
  const b = make();
  const wav = join(OUT, `${name}.wav`);
  const mp3 = join(OUT, `${name}.mp3`);
  writeWav(b, wav);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", wav, "-codec:a", "libmp3lame", "-b:a", "192k", mp3]);
  unlinkSync(wav);
  console.log(`  ${name.padEnd(14)} ${(b.n / SR).toFixed(2)}s`);
}

writeFileSync(join(ROOT, "video", "audio-cues.json"), JSON.stringify({ generated: new Date().toISOString().slice(0, 10), rule: "max 2 cues per beat, no music bed, mix under the voice", beats: CUES }, null, 2));

console.log(`\n  → video/public/audio/  (5 files)`);
console.log(`  → video/audio-cues.json`);
console.log(`\n  Standard SFX (chalk-write, pop-soft, ui-success, whoosh...) come from the`);
console.log(`  chalkboard-video library: copy templates/synth.mjs into video/scripts/ and run`);
console.log(`  \`node scripts/synth.mjs sfx\` once. These five stingers are job-video only.`);
console.log(`\n  Mix: stingers ~0.30, ui-appear ~0.22, both UNDER the voice. See --cues.`);
