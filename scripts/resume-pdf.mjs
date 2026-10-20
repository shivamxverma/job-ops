#!/usr/bin/env node
/**
 * resume-pdf.mjs — markdown resume → ATS-safe PDF via headless Chrome. No dependencies.
 *
 *   node scripts/resume-pdf.mjs resumes/base.md
 *   node scripts/resume-pdf.mjs applications/acme/resume.md   # → resume.pdf next to it
 *
 * Renders the house format (matches resumes/base.pdf): serif, small-caps name and section
 * headings with rules, right-aligned dates, one page, single column.
 *
 * Markdown conventions this understands beyond plain md:
 *   # Name                      → centered small-caps name
 *   > a | b | c                 → centered contact line (links allowed)
 *   ### Left title @ Right      → bold left / bold right on one row (org + dates)
 *   *Subtitle* @ *Right*        → italic subtitle row (job title + CGPA etc.)
 * The ` @ ` separator is what pushes text to the right margin. Everything else is normal
 * markdown: `## Section`, `- bullet`, **bold**, *italic*, [text](url).
 */
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

// Computer Modern (CMU Serif) — the same face LaTeX uses, so generated resumes are
// typographically identical to resumes/base-reference.pdf. Embedded as data URIs because
// headless Chrome renders from a temp file outside the repo.
const fontDir = resolve(dirname(fileURLToPath(import.meta.url)), "../assets/fonts");
const face = (file, weight, style) =>
  `@font-face{font-family:CMUSerif;font-weight:${weight};font-style:${style};` +
  `src:url(data:font/woff2;base64,${readFileSync(resolve(fontDir, file)).toString("base64")}) format("woff2")}`;
const fonts = [
  face("cmu-serif-500-roman.woff2", 400, "normal"),
  face("cmu-serif-700-roman.woff2", 700, "normal"),
  face("cmu-serif-500-italic.woff2", 400, "italic"),
  face("cmu-serif-700-italic.woff2", 700, "italic"),
].join("\n");

const input = process.argv[2];
if (!input) { console.error("Usage: node scripts/resume-pdf.mjs <resume.md>"); process.exit(1); }
const md = readFileSync(input, "utf8");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.+?)\*/g, "<i>$1</i>")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

// "left @ right" → two-column row; plain text → single cell.
const row = (line, cls) => {
  const at = line.split(" @ ");
  return at.length > 1
    ? `<div class="${cls}"><span>${inline(at[0])}</span><span>${inline(at.slice(1).join(" @ "))}</span></div>\n`
    : `<div class="${cls}"><span>${inline(line)}</span></div>\n`;
};

let html = "", inList = false;
for (const line of md.split("\n")) {
  const closeList = () => { if (inList) { html += "</ul>\n"; inList = false; } };
  if (/^# /.test(line)) { closeList(); html += `<h1>${inline(line.slice(2))}</h1>\n`; }
  else if (/^> /.test(line)) { closeList(); html += `<p class="contact">${inline(line.slice(2))}</p>\n`; }
  else if (/^## /.test(line)) { closeList(); html += `<h2>${inline(line.slice(3))}</h2>\n`; }
  else if (/^### /.test(line)) { closeList(); html += row(line.slice(4), "entry"); }
  else if (/^- /.test(line)) { if (!inList) { html += "<ul>\n"; inList = true; } html += `<li>${inline(line.slice(2))}</li>\n`; }
  else if (line.trim() === "") closeList();
  else { closeList(); html += row(line, "sub"); }
}
if (inList) html += "</ul>\n";

// Type scale is fixed at the LaTeX original's sizes (CMR10 body, CMR9 contact, CMBX12 name,
// CMCSC10 section heads) so every generated resume looks identical. Only `d`, the vertical
// whitespace density, flexes to make a long resume fit one page — never the font size.
const styles = (d) => `
  ${fonts}
  @page { margin: ${13 * d}mm ${14 * d}mm; size: A4; }
  body { font: 10pt/${1.26 * d} CMUSerif, Georgia, "Times New Roman", serif; color: #000;
         max-width: 100%; -webkit-font-smoothing: antialiased; }
  h1 { font-size: 21pt; font-weight: normal; font-variant: small-caps; letter-spacing: .01em;
       text-align: center; margin: 0 0 3pt; }
  .contact { text-align: center; font-size: 9pt; margin: 0 0 ${8 * d}pt; }
  h2 { font-size: 11pt; font-weight: bold; font-variant: small-caps; letter-spacing: .02em;
       border-bottom: .6pt solid #000; padding-bottom: 1pt; margin: ${9 * d}pt 0 ${3 * d}pt; }
  /* One spacing rule for every entry block, so sections never drift apart visually. */
  .entry, .sub { display: flex; justify-content: space-between; gap: 10pt; }
  .entry { font-weight: bold; margin: ${6 * d}pt 0 0; }
  .sub { font-weight: normal; margin: 0; }
  h2 + .entry, h2 + .sub { margin-top: ${2 * d}pt; }
  /* :not(:only-child) matters — a single-span row (e.g. a Skills line) must be free to
     wrap, or long lines silently overflow the page edge and lose text. */
  .entry span:last-child:not(:only-child), .sub span:last-child:not(:only-child) {
    text-align: right; white-space: nowrap; }
  ul { margin: ${1.5 * d}pt 0 0 13pt; padding: 0; }
  li { margin: ${1.5 * d}pt 0; padding-left: 1pt; }
  a { color: #000; text-decoration: underline; }
  h2, .entry, .sub { break-after: avoid; } li { break-inside: avoid; }
`;

const out = resolve(input.replace(/\.md$/, ".pdf"));
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const pageCount = (f) =>
  Math.max(...[...readFileSync(f).toString("latin1").matchAll(/\/Count\s+(\d+)/g)].map((m) => +m[1]), 1);

const render = (d) => {
  const tmp = resolve(tmpdir(), `resume-${Date.now()}.html`);
  writeFileSync(tmp, `<!doctype html><meta charset="utf-8"><style>${styles(d)}</style><body>${html}</body>`);
  execFileSync(chrome, ["--headless", "--disable-gpu", `--print-to-pdf=${out}`, "--no-pdf-header-footer", `file://${tmp}`], { stdio: "pipe" });
  unlinkSync(tmp);
  return pageCount(out);
};

// A resume must be one page. Tighten whitespace in small steps before giving up, and say so
// — a silently 2-page resume is worse than a warning.
let density = 1, pages = render(1);
while (pages > 1 && density > 0.8) { density = +(density - 0.05).toFixed(2); pages = render(density); }
console.log(`PDF → ${out}`);
if (density < 1) console.log(`  note: whitespace compressed to ${Math.round(density * 100)}% to hold one page; font size unchanged.`);
if (pages > 1) console.error(`  WARNING: still ${pages} pages at minimum density — cut a bullet or a project.`);
