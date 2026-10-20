#!/usr/bin/env node
/**
 * cover-letter-pdf.mjs — markdown cover letter → PDF via headless Chrome. No dependencies.
 *
 *   node scripts/cover-letter-pdf.mjs applications/orbit/cover-letter.md
 *
 * Same house typography as resume-pdf.mjs (CMU Serif, one page) but renders plain prose
 * paragraphs instead of the resume's structured rows. Expects the file's first line to be
 * a `# Company — cover letter (date)` title (used only to derive the header, not printed
 * verbatim) followed by blank-line-separated paragraphs. Renders a letterhead (name +
 * contact line, from profile/facts.yaml) above the body.
 */
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fontDir = resolve(ROOT, "assets/fonts");
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
if (!input) { console.error("Usage: node scripts/cover-letter-pdf.mjs <cover-letter.md>"); process.exit(1); }
const md = readFileSync(input, "utf8");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.+?)\*/g, "<i>$1</i>")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

const lines = md.split("\n");
const titleLine = lines[0].replace(/^#\s*/, "");
// "Company — cover letter (date)" → { company, date }
const titleMatch = titleLine.match(/^(.*?)\s*—\s*cover letter\s*\(([^)]+)\)/);
const company = titleMatch ? titleMatch[1].trim() : titleLine.trim();
const date = titleMatch ? titleMatch[2].trim() : "";

// Everything after the title line, split on blank lines → paragraphs. A lone "— Name"
// signoff line is rendered without the paragraph's justified block spacing.
const body = lines.slice(1).join("\n").trim();
const paras = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

let html = "";
for (const p of paras) {
  const isSignoff = /^—\s*\S/.test(p);
  html += `<p class="${isSignoff ? "signoff" : "body"}">${inline(p.replace(/\n/g, " "))}</p>\n`;
}

const identity = JSON.parse(execFileSync("node", ["-e",
  `const fs=require('fs');const yaml=fs.readFileSync('${resolve(ROOT, "profile/facts.yaml")}','utf8');` +
  `const g=(k)=>{const m=yaml.match(new RegExp(k+':\\\\s*(.+)'));return m?m[1].trim():'';};` +
  `console.log(JSON.stringify({name:g('full_name'),email:g('email'),phone:g('phone')}));`
]).toString());

const styles = (d) => `
  ${fonts}
  @page { margin: ${18 * d}mm ${20 * d}mm; size: A4; }
  body { font: 10pt/${1.4 * d} CMUSerif, Georgia, "Times New Roman", serif; color: #000;
         max-width: 100%; -webkit-font-smoothing: antialiased; }
  h1 { font-size: 18pt; font-weight: normal; font-variant: small-caps; letter-spacing: .01em;
       text-align: center; margin: 0 0 3pt; }
  .contact { text-align: center; font-size: 9pt; margin: 0 0 ${10 * d}pt; }
  .meta { display: flex; justify-content: space-between; font-size: 9pt; margin: 0 0 ${12 * d}pt;
          border-bottom: .6pt solid #000; padding-bottom: ${4 * d}pt; }
  p.body { margin: 0 0 ${9 * d}pt; text-align: left; }
  p.signoff { margin: ${6 * d}pt 0 0; }
  a { color: #000; text-decoration: underline; }
  p { break-inside: avoid; }
`;

const out = resolve(input.replace(/\.md$/, ".pdf"));
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const pageCount = (f) =>
  Math.max(...[...readFileSync(f).toString("latin1").matchAll(/\/Count\s+(\d+)/g)].map((m) => +m[1]), 1);

const render = (d) => {
  const tmp = resolve(tmpdir(), `cover-letter-${Date.now()}.html`);
  const header =
    `<h1>${inline(identity.name)}</h1>` +
    `<p class="contact">${inline(identity.email)} | ${inline(identity.phone)}</p>` +
    `<div class="meta"><span>${date}</span><span>Re: ${inline(company)}</span></div>`;
  writeFileSync(tmp, `<!doctype html><meta charset="utf-8"><style>${styles(d)}</style><body>${header}${html}</body>`);
  execFileSync(chrome, ["--headless", "--disable-gpu", `--print-to-pdf=${out}`, "--no-pdf-header-footer", `file://${tmp}`], { stdio: "pipe" });
  unlinkSync(tmp);
  return pageCount(out);
};

let density = 1, pages = render(1);
while (pages > 1 && density > 0.75) { density = +(density - 0.05).toFixed(2); pages = render(density); }
console.log(`PDF → ${out}`);
if (density < 1) console.log(`  note: whitespace compressed to ${Math.round(density * 100)}% to hold one page.`);
if (pages > 1) console.error(`  WARNING: still ${pages} pages at minimum density — trim a paragraph.`);
