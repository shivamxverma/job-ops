#!/usr/bin/env node
/**
 * gate — run the five gates over one lead, or over the whole undecided pile.
 *
 *   node scripts/gate.mjs --company "Runta" --role "MTS Core Runtime" --url https://... --domain runta.com
 *   node scripts/gate.mjs --queue [--grade A,B,C] [--limit 20]
 *
 * Point of `--queue`: it answers "which of these leads is already dead" without a human reading
 * a single one. On the first C batch that would have been six of eight, before any work.
 *
 * Nothing here decides anything on its own. A FAIL is evidence to skip and the reason to write
 * down; a CHECK is a human's call. The gates never tick a box in leads.md.
 */
import { runGates, VERDICT } from "./lib/gates.mjs";
import { loadState } from "./lib/state.mjs";

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1]; };
const has = (n) => argv.includes(`--${n}`);

const MARK = { [VERDICT.PASS]: "✓", [VERDICT.FAIL]: "✗", [VERDICT.CHECK]: "?" };

const domainOf = (url) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; } };
/** A posting URL on a job board is not the company's domain. */
const AGGREGATOR = /(news\.ycombinator|ycombinator\.com|linkedin\.com|x\.com|twitter\.com|indeed\.|weworkremotely|remoteok|remotive|himalayas|cryptocurrencyjobs|to\.indeed)/i;

function print(res) {
  console.log(`\n${res.pass ? "PASS" : "FAIL"}  ${res.company}${res.failed.length ? `  (failed: ${res.failed.join(", ")})` : ""}`);
  for (const r of res.results) console.log(`  ${MARK[r.verdict]} ${r.gate.padEnd(14)} ${r.detail}`);
}

if (has("queue")) {
  const grades = String(flag("grade", "A,B,C")).toUpperCase().split(/[,\s]+/).filter(Boolean);
  const limit = Number(flag("limit", 20));
  const st = loadState();
  const pile = [...st.companies.values()]
    .filter((c) => c.status === "lead" && c.leads[0] && c.leads[0].box === " " && grades.includes(c.grade))
    .sort((a, b) => "ABCDF?".indexOf(a.grade) - "ABCDF?".indexOf(b.grade))
    .slice(0, limit);

  console.log(`gate --queue  ${st.today}  grade ${grades.join("/")}  ${pile.length} undecided leads\n`);
  const out = [];
  for (const c of pile) {
    const url = c.link || "";
    const d = domainOf(url);
    const res = await runGates({
      company: c.display, role: c.role, url,
      domain: AGGREGATOR.test(url) ? "" : d, slug: c.key,
      text: `${c.role} ${c.why}`, location: "",
    });
    out.push(res);
    print(res);
  }
  const dead = out.filter((r) => !r.pass);
  console.log(`\n${dead.length} of ${out.length} already fail a gate: ${dead.map((r) => r.company).join(", ") || "none"}`);
  console.log(`Nothing was marked. Skip them with: node scripts/mark-processed.mjs "<Company>" --skip\n`);
  process.exit(0);
}

const company = flag("company");
if (!company) {
  console.error("usage: node scripts/gate.mjs --company NAME [--role R] [--url U] [--domain D] [--text T]\n       node scripts/gate.mjs --queue [--grade A,B,C] [--limit N]");
  process.exit(1);
}
const url = flag("url", "");
print(await runGates({
  company, role: flag("role", ""), url,
  domain: flag("domain", AGGREGATOR.test(url) ? "" : domainOf(url)),
  slug: flag("slug", ""), text: flag("text", ""), location: flag("location", ""),
}));
console.log("");
