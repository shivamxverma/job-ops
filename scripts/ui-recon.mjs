#!/usr/bin/env node
/**
 * UI recon — read the real codebases to rebuild real screens, instead of cropping video.
 *
 * The first version of the video pipeline used the portfolio's screen recordings. That works
 * for a wide shot but not for the thing that actually reads on a laptop: a small, sharp,
 * *legible* panel of one screen while a stick figure points at it. A 1080p recording scaled
 * to a 400px window is mush.
 *
 * So this reads the source of truth instead. Design tokens, component inventory, routes and
 * on-screen copy come out of the repo, and the Remotion project rebuilds a miniature of the
 * real screen with the real palette and the real type. It looks like his product because it
 * is drawn from his product, and it stays sharp at any size.
 *
 *   node scripts/ui-recon.mjs               # every configured project
 *   node scripts/ui-recon.mjs hashtro       # one project
 *
 * Writes video/ui/{project}.json. Read-only: it never touches the project repos.
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, basename, extname, relative } from "node:path";
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
const OUT = join(ROOT, "video", "ui");
const HOME = homedir();

/**
 * Where each project actually lives, and which sub-tree holds its UI. `screens` name the
 * panels worth rebuilding — chosen because they are the moments Shivam talks about, not
 * because they are the biggest files.
 */
const PROJECTS = [
  {
    id: "hashtro",
    name: "Hashtro",
    root: join(HOME, "PROJECTS", "PERSONAL PROJECTS", "hashtro"),
    ui: ["frontend/app", "frontend/components"],
    css: ["frontend/app/globals.css"],
    screens: [
      { component: "AstroCard", says: "the chart that becomes trade parameters" },
      { component: "TradeConfirm", says: "the confirm step before real money moves" },
      { component: "TradeExecution", says: "a 30-second leveraged perp actually firing" },
      { component: "TradeResults", says: "the outcome, win or lose" },
    ],
  },
  {
    id: "reacdefi",
    name: "REACTOR / ReacDEFI",
    root: join(HOME, "reacdefi"),
    ui: ["apps/client/app", "apps/client/components", "packages/ui"],
    css: ["apps/client/app/globals.css"],
    screens: [
      { component: "automations", says: "a no-code DeFi automation being assembled" },
      { component: "markets", says: "live market data the automation reacts to" },
      { component: "web3", says: "the wallet connection and the deploy" },
    ],
  },
];

// ---------------------------------------------------------------- extractors

/** Walk a directory for source files, skipping the usual noise. */
function walk(dir, out = [], depth = 0) {
  if (depth > 6 || !existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (/^(node_modules|\.next|\.git|dist|build|out|coverage)$/.test(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out, depth + 1);
    else if (/\.(tsx|jsx|ts|css)$/.test(e.name)) out.push(p);
  }
  return out;
}

/**
 * Pull design tokens. Handles both shapes seen in his repos: Tailwind v4 `@theme { --color-x }`
 * blocks (hashtro) and raw hex sprinkled through `@apply`/class strings (reacdefi).
 */
function tokens(cssFiles, allFiles) {
  const named = {};
  const loose = new Map();

  for (const f of cssFiles) {
    if (!existsSync(f)) continue;
    const src = readFileSync(f, "utf8");
    for (const [, k, v] of src.matchAll(/--(color-[a-z0-9-]+|[a-z]+-[a-z0-9-]*):\s*([^;]+);/gi)) {
      const val = v.trim();
      if (/^#|rgba?\(|hsl/.test(val)) named[k] = val;
    }
    for (const [, font] of src.matchAll(/font-family:\s*["']([^"',]+)/gi)) {
      named[`font-${font.toLowerCase().replace(/\s+/g, "-")}`] = font;
    }
  }

  // Frequency-ranked hex across the whole UI tree — this is what actually appears on screen.
  for (const f of allFiles) {
    const src = readFileSync(f, "utf8");
    for (const [, hex] of src.matchAll(/#([0-9a-f]{6}|[0-9a-f]{3})\b/gi)) {
      const h = `#${hex.toLowerCase()}`;
      loose.set(h, (loose.get(h) ?? 0) + 1);
    }
  }

  const palette = [...loose.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([hex, n]) => ({ hex, uses: n }));

  return { named, palette };
}

/** Component inventory — file name plus a one-line hint of what it renders. */
function components(files) {
  return files
    .filter((f) => /\.(tsx|jsx)$/.test(f) && /^[A-Z]/.test(basename(f)))
    .map((f) => {
      const src = readFileSync(f, "utf8");
      const text = [...src.matchAll(/>\s*([A-Z][A-Za-z0-9 '’,.!?%$-]{3,42})\s*</g)]
        .map((m) => m[1].trim())
        .filter((s) => !/^[A-Z_]+$/.test(s))
        .slice(0, 6);
      return { component: basename(f, extname(f)), file: f, copy: [...new Set(text)] };
    });
  // Deliberately NOT filtered on `copy.length`. A component that renders only icons, canvas
  // or mapped children yields no literal text, and dropping it made TradeExecution — the
  // single best shot in Hashtro, a leveraged perp actually firing — look like it had been
  // renamed. Absence of copy is not absence of a screen.
}

/** Next.js app-router routes = the screens a viewer would actually see. */
function routes(uiDirs) {
  const found = [];
  for (const d of uiDirs) {
    if (!existsSync(d)) continue;
    for (const f of walk(d)) {
      if (!/\/(page|layout)\.(tsx|jsx)$/.test(f)) continue;
      const rel = relative(d, dirname(f)) || "/";
      found.push(rel === "." ? "/" : `/${rel}`);
    }
  }
  return [...new Set(found)].sort();
}

// ---------------------------------------------------------------- run
const only = process.argv.slice(2).find((a) => !a.startsWith("--"));
const targets = only ? PROJECTS.filter((p) => p.id === only) : PROJECTS;
if (!targets.length) {
  console.error(`Unknown project "${only}". Known: ${PROJECTS.map((p) => p.id).join(", ")}`);
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
let wrote = 0;

for (const p of targets) {
  if (!existsSync(p.root)) {
    console.log(`${p.name.padEnd(22)} SKIP — repo not found at ${p.root}`);
    continue;
  }
  const uiDirs = p.ui.map((d) => join(p.root, d));
  const files = uiDirs.flatMap((d) => walk(d));
  if (!files.length) {
    console.log(`${p.name.padEnd(22)} SKIP — no UI source under ${p.ui.join(", ")}`);
    continue;
  }

  const tok = tokens(p.css.map((c) => join(p.root, c)), files);
  const comps = components(files);
  const rts = routes(uiDirs);

  // Resolve the named screens against what actually exists, so a renamed component is
  // reported rather than silently rendering an empty panel.
  const screens = p.screens.map((s) => {
    const hit = comps.find((c) => c.component.toLowerCase() === s.component.toLowerCase());
    const dirHit = files.find((f) => f.toLowerCase().includes(`/${s.component.toLowerCase()}/`));
    return {
      ...s,
      found: Boolean(hit || dirHit),
      component: hit?.component ?? s.component,
      copy: hit?.copy ?? [],
      file: hit?.file ? relative(p.root, hit.file) : dirHit ? relative(p.root, dirname(dirHit)) : null,
    };
  });

  const spec = {
    id: p.id,
    name: p.name,
    generated: new Date().toISOString().slice(0, 10),
    repo: p.root,
    tokens: tok,
    routes: rts,
    screens,
    componentCount: comps.length,
    components: comps.slice(0, 60).map(({ component, copy }) => ({ component, copy })),
  };

  writeFileSync(join(OUT, `${p.id}.json`), JSON.stringify(spec, null, 2));
  wrote++;

  const missing = screens.filter((s) => !s.found);
  console.log(`${p.name.padEnd(22)} ${String(comps.length).padStart(3)} components · ${rts.length} routes · ${tok.palette.length} palette colors`);
  console.log(`   palette: ${tok.palette.slice(0, 6).map((c) => c.hex).join(" ")}`);
  const fonts = Object.entries(tok.named).filter(([k]) => k.startsWith("font-"));
  if (fonts.length) console.log(`   fonts:   ${fonts.map(([, v]) => v).join(", ")}`);
  console.log(`   screens: ${screens.filter((s) => s.found).map((s) => s.component).join(", ") || "none resolved"}`);
  if (missing.length) console.log(`   ⚠ not found (renamed?): ${missing.map((s) => s.component).join(", ")}`);
}

console.log(`\n${wrote} spec(s) → video/ui/`);
console.log("These drive the small on-screen panels in /job-video. Rebuild after any UI refactor.");
