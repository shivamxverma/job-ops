#!/usr/bin/env node
/**
 * Build the showcase-asset manifest for /job-video.
 *
 * A job video is not a chalkboard explainer. In a chalkboard video the visual layer is a
 * metaphor for the idea; here the visual layer is **the actual thing he built**, on screen,
 * while he talks about it. So the asset library is real product footage, not drawings.
 *
 * The footage already exists: the portfolio repo ships 1080p screen recordings of five
 * shipped projects plus hero stills and the press logos. This script finds them, checks they
 * are readable, pairs each with the checkable numbers from profile/facts.yaml, and writes
 * a manifest the Remotion project imports.
 *
 *   node scripts/video-assets.mjs           # write video/assets.json
 *   node scripts/video-assets.mjs --copy    # also copy media into video/public/
 */
import { writeFileSync, mkdirSync, existsSync, copyFileSync, statSync, readdirSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";


// Disabled 2026-09-28: every path and project below is the previous owner's (Shivam Verma's
// portfolio recordings and local repos). Re-point PROJECTS at Shivam's own footage and repos,
// then delete this guard.
if (!process.argv.includes("--force")) {
  console.error("disabled: this script is still configured for the previous owner's projects. See the note at the top of the file.");
  process.exit(1);
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORTFOLIO = join(homedir(), "PROJECTS", "Me", "portfolio", "public");
const VIDEO = join(ROOT, "video");
const COPY = process.argv.includes("--copy");

/**
 * One entry per project that has real footage. `proof` lines are the numbers he is allowed
 * to say on camera — every one traceable to profile/facts.yaml. `beats` are the moments in
 * the footage worth cutting to, so the editor isn't guessing where the good part is.
 */
const PROJECTS = [
  {
    id: "reacdefi",
    name: "REACTOR / ReacDEFI",
    live: "https://reacdefi.app",
    video: "intro-videos/ReacDEFI-1080.mp4",
    hero: "hero-images/reacdefi-hero.jpg",
    framings: ["web3", "ai-agent"],
    proof: [
      "$9,000 grant from Reactive Network",
      "4 press features: Chainwire, CryptoSlate, Blockchain Magazine, BlockTelegraph",
      "leverage-loop contracts merged into Reactive's official demos repo",
    ],
    beats: "conversational input turning into a deployed on-chain automation — the moment the natural-language prompt becomes a live contract is the hero shot",
  },
  {
    id: "rc-agents",
    name: "rc-agents",
    live: "https://rc-agents.vercel.app",
    video: "intro-videos/rc-agents-1080.mp4",
    framings: ["web3", "ai-agent"],
    proof: [
      "AI agent pays $0.30 USDC via x402 for 24h Aave liquidation protection",
      "agent straight to contract, no human in the loop",
    ],
    beats: "the payment firing without a human — hold on the x402 call and the contract state change",
  },
  {
    id: "hashtro",
    name: "Hashtro",
    live: "https://hashtro.fun",
    video: "intro-videos/Hastro-1080.mp4",
    hero: "hero-images/hashtro-hero.jpg",
    framings: ["backend-infra", "web3"],
    proof: [
      "160 users in the first 48 hours",
      "3-service architecture: Next.js / FastAPI ephemeris / Solana trading",
      "per-IP rate limiting, 24h TTL caching, Supabase RLS on every table",
    ],
    beats: "the three services talking to each other — best footage for a backend/infra framing",
  },
  {
    id: "focuclone",
    name: "FocuClone",
    video: "intro-videos/FocuClone-1080.mp4",
    hero: "hero-images/FocuClone-hero.jpg",
    framings: ["backend-infra"],
    proof: ["finds the usable moments in raw screen recordings and cuts the rest", "automatic voice enhancement"],
    beats: "raw recording in, cut timeline out — the before/after is the whole pitch",
  },
  {
    id: "metrodiaries",
    name: "MetroDiaries",
    video: "intro-videos/metroDiaries-1080.mp4",
    hero: "hero-images/metroDiaries-hero.jpg",
    framings: ["backend-infra"],
    proof: ["32 pre-launch users", "real user interviews before building"],
    beats: "the matching flow — use only when the role is consumer/product, it is the weakest technical story",
  },
];

const PRESS = ["logo/chainwire_logo-200x200.jpg", "logo/cryptoslate.webp", "logo/blocktelegraph-logo.png", "logo/blockchain-magzine.png"];

// ---------------------------------------------------------------- resolve
if (!existsSync(PORTFOLIO)) {
  console.error(`Portfolio media not found at ${PORTFOLIO}`);
  console.error("The showcase layer needs it. Clone/pull ~/PROJECTS/Me/portfolio first.");
  process.exit(1);
}

const ok = (rel) => {
  const p = join(PORTFOLIO, rel);
  if (!existsSync(p)) return null;
  const size = statSync(p).size;
  return size > 1024 ? { rel, path: p, sizeMB: +(size / 1048576).toFixed(1) } : null;
};

const manifest = { generated: new Date().toISOString().slice(0, 10), source: PORTFOLIO, projects: [], press: [], missing: [] };

for (const p of PROJECTS) {
  const video = ok(p.video);
  const hero = p.hero ? ok(p.hero) : null;
  if (!video) { manifest.missing.push(`${p.id}: ${p.video}`); continue; }
  manifest.projects.push({
    ...p,
    video: { file: basename(p.video), sizeMB: video.sizeMB, src: video.rel },
    hero: hero ? { file: basename(p.hero), src: hero.rel } : null,
  });
}
for (const rel of PRESS) {
  const f = ok(rel);
  if (f) manifest.press.push({ file: basename(rel), src: rel });
  else manifest.missing.push(`press: ${rel}`);
}

// ---------------------------------------------------------------- write
mkdirSync(VIDEO, { recursive: true });
writeFileSync(join(VIDEO, "assets.json"), JSON.stringify(manifest, null, 2));

console.log(`Showcase assets for /job-video\n`);
for (const p of manifest.projects) {
  console.log(`  ${p.name.padEnd(20)} ${p.video.file.padEnd(26)} ${String(p.video.sizeMB).padStart(4)}MB  [${p.framings.join(", ")}]`);
  for (const line of p.proof) console.log(`      · ${line}`);
}
console.log(`\n  press logos: ${manifest.press.length}/${PRESS.length}`);
if (manifest.missing.length) {
  console.log(`\n  MISSING (${manifest.missing.length}) — the video can still be built without these:`);
  for (const m of manifest.missing) console.log(`    - ${m}`);
}

if (COPY) {
  const dest = join(VIDEO, "public", "showcase");
  mkdirSync(dest, { recursive: true });
  let n = 0;
  for (const p of manifest.projects) {
    copyFileSync(join(PORTFOLIO, p.video.src), join(dest, p.video.file)); n++;
    if (p.hero) { copyFileSync(join(PORTFOLIO, p.hero.src), join(dest, p.hero.file)); n++; }
  }
  for (const pr of manifest.press) { copyFileSync(join(PORTFOLIO, pr.src), join(dest, pr.file)); n++; }
  console.log(`\n  copied ${n} files → video/public/showcase/`);
}

console.log(`\n  manifest → video/assets.json`);
