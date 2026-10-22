// Write a scout's dated hits file without losing earlier runs from the same day.
//
// Each scout marks a posting "seen" the moment it reports it, so a hit exists in exactly one
// place: the day file it was first written to. Overwriting that file on a second same-day run
// (which the 6-hourly GitHub schedule makes routine) deleted the morning's hits for good.
// So: keep the previous hits, let a re-scored hit with the same id replace its old copy, and
// add the run counters together so scout-yield.mjs still reads a day's totals.
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const COUNTERS = ["scanned", "survived"];

export function writeDayFile(path, meta, hits) {
  let prev = null;
  if (existsSync(path)) {
    try { prev = JSON.parse(readFileSync(path, "utf8")); } catch { prev = null; }
  }
  const fresh = new Set(hits.map((h) => String(h.id)));
  const kept = (prev?.hits ?? []).filter((h) => !fresh.has(String(h.id)));
  const out = { ...meta };
  for (const k of COUNTERS) {
    if (typeof meta[k] === "number" && typeof prev?.[k] === "number") out[k] = meta[k] + prev[k];
  }
  out.hits = [...kept, ...hits];
  writeFileSync(path, JSON.stringify(out, null, 2));
  return out.hits.length;
}
