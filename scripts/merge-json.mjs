#!/usr/bin/env node
// Git merge driver for the scouts' JSON state in inbox/.
//
// Two writers touch these files: Shivam's local sessions and the 6-hourly GitHub Action. Both
// only ever ADD (a posting seen, an issue opened, a day's hits), so a line-based merge
// conflicts on files whose correct merge is obvious: keep everything both sides added.
//
//   seen / registry maps  {id: timestamp|value}   union of keys; on a clash keep the later timestamp
//   day hit files         {..., hits: [...]}      union of hits by id; counters merged 3-way
//   anything else         unchanged git behaviour (exit 1 = conflict, resolve by hand)
//
// Wired by .gitattributes (`merge=jsonunion`) plus a one-time local config:
//   git config merge.jsonunion.driver "node scripts/merge-json.mjs %O %A %B"
// Without that config git silently falls back to its normal merge, so nothing breaks.
import { readFileSync, writeFileSync } from "node:fs";

const [basePath, oursPath, theirsPath] = process.argv.slice(2);
const read = (p) => {
  const s = readFileSync(p, "utf8").trim();
  return s ? JSON.parse(s) : null;
};

let base, ours, theirs;
try {
  base = read(basePath);
  ours = read(oursPath);
  theirs = read(theirsPath);
} catch {
  process.exit(1); // unparseable (already conflicted, or not JSON): let git report it
}

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
const ISO = /^\d{4}-\d{2}-\d{2}T/;

function pick(a, b) {
  if (typeof a === "string" && typeof b === "string" && ISO.test(a) && ISO.test(b)) return a > b ? a : b;
  return a ?? b;
}

function mergeMap(o, a, b) {
  o = o || {};
  const out = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const inA = k in a, inB = k in b;
    // a key one side deleted and the other left untouched stays deleted
    if (!inA && k in o && JSON.stringify(b[k]) === JSON.stringify(o[k])) continue;
    if (!inB && k in o && JSON.stringify(a[k]) === JSON.stringify(o[k])) continue;
    out[k] = inA && inB ? pick(a[k], b[k]) : inA ? a[k] : b[k];
  }
  return out;
}

let merged;
if (isObj(ours) && isObj(theirs) && Array.isArray(ours.hits) && Array.isArray(theirs.hits)) {
  merged = { ...theirs, ...ours };
  for (const k of ["scanned", "survived"]) {
    if (typeof ours[k] === "number" && typeof theirs[k] === "number") {
      merged[k] = ours[k] + theirs[k] - (typeof base?.[k] === "number" ? base[k] : 0);
    }
  }
  const byId = new Map();
  for (const h of [...theirs.hits, ...ours.hits]) byId.set(String(h.id), h);
  merged.hits = [...byId.values()];
} else if (isObj(ours) && isObj(theirs)) {
  merged = mergeMap(isObj(base) ? base : {}, ours, theirs);
} else {
  process.exit(1);
}

writeFileSync(oursPath, JSON.stringify(merged, null, 2) + "\n");
process.exit(0);
