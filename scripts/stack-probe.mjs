#!/usr/bin/env node
/**
 * stack-probe.mjs — reconstruct a company's stack from public evidence, in about 20 seconds.
 *
 *   node scripts/stack-probe.mjs kadoa.com
 *   node scripts/stack-probe.mjs kadoa.com --slug kadoa      # writes applications/kadoa/
 *   node scripts/stack-probe.mjs kadoa.com --json            # machine output only
 *
 * WHY THIS EXISTS. Small startups respond to candidates who visibly understand their system,
 * and studying a company properly does not scale past one or two applications a week. But the
 * useful 80% of "I understand your architecture" is not study at all, it is *recon*, and
 * `profile/learnings.md` already proved it twice on Wonderdog (2026-07-31): three `curl -I`
 * calls gave the whole stack from response headers, `x-clerk-auth-reason` separated their
 * production instance from their dev one, and `content-security-policy: frame-ancestors`
 * leaked two undisclosed company domains plus a self-built internal CRM. None of that was in
 * any public page. All of it is checkable in ten seconds by the person reading the email.
 *
 * That lesson sat in learnings.md as prose for two weeks and got run by hand once. This is it
 * codified, so every A/B lead gets it instead of the leads someone remembered to probe.
 *
 * Evidence only. Every finding carries the header, record, or status code that produced it, so
 * `/tech-read` can tell an inference from a fact and Shivam never asserts a guess. Fault
 * tolerant by design: one dead subdomain, one blocked HEAD, one missing DNS record never kills
 * the run.
 *
 * Writes applications/{slug}/stack-probe.json when --slug is given (or inferred from the
 * domain), and always prints the summary.
 */
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveMx, resolveTxt, resolveCname, resolve4 } from "node:dns/promises";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const jsonOnly = args.includes("--json");
const raw = args.find((a) => !a.startsWith("--"));
if (!raw) {
  console.error("Usage: node scripts/stack-probe.mjs <domain> [--slug name] [--json]");
  process.exit(1);
}
const apex = raw.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
const slugArg = args[args.indexOf("--slug") + 1];
const slug = args.includes("--slug") && slugArg && !slugArg.startsWith("--")
  ? slugArg
  : apex.split(".")[0].toLowerCase();

const TIMEOUT = 8000;
const SUBDOMAINS = [
  "", "www", "app", "api", "docs", "dashboard", "admin", "status", "console",
  "portal", "auth", "blog", "dev", "staging", "help", "developers",
];

/** Header -> what it proves. Value patterns narrow it further where the value carries meaning. */
const HEADER_FINGERPRINTS = [
  { header: "server", match: /vercel/i, tech: "Vercel", kind: "hosting" },
  { header: "server", match: /cloudflare/i, tech: "Cloudflare", kind: "cdn" },
  { header: "server", match: /^awselb|elasticbeanstalk/i, tech: "AWS ELB", kind: "hosting" },
  { header: "server", match: /gws|google frontend/i, tech: "Google Cloud", kind: "hosting" },
  { header: "server", match: /nginx/i, tech: "nginx", kind: "hosting" },
  { header: "server", match: /railway/i, tech: "Railway", kind: "hosting" },
  { header: "server", match: /fly\/|fly.io/i, tech: "Fly.io", kind: "hosting" },
  { header: "x-nextjs-prerender", tech: "Next.js (prerendered route)", kind: "framework" },
  { header: "x-nextjs-cache", tech: "Next.js", kind: "framework" },
  { header: "x-powered-by", match: /next\.js/i, tech: "Next.js", kind: "framework" },
  { header: "x-powered-by", match: /express/i, tech: "Express", kind: "framework" },
  { header: "vary", match: /rsc|next-router-state-tree/i, tech: "Next.js App Router (React Server Components)", kind: "framework" },
  { header: "x-remix-response", tech: "Remix", kind: "framework" },
  { header: "x-sveltekit-page", tech: "SvelteKit", kind: "framework" },
  { header: "x-clerk-auth-reason", tech: "Clerk (auth)", kind: "auth" },
  { header: "x-clerk-auth-status", tech: "Clerk (auth)", kind: "auth" },
  { header: "x-supabase-api-version", tech: "Supabase", kind: "backend" },
  { header: "x-amz-cf-id", tech: "AWS CloudFront", kind: "cdn" },
  { header: "x-amz-request-id", tech: "AWS (S3/API GW)", kind: "hosting" },
  { header: "x-fastly-request-id", tech: "Fastly", kind: "cdn" },
  { header: "x-served-by", match: /cache-/i, tech: "Fastly", kind: "cdn" },
  { header: "x-shopify-stage", tech: "Shopify", kind: "platform" },
  { header: "x-webflow-render", tech: "Webflow", kind: "platform" },
  { header: "x-framer-page", tech: "Framer", kind: "platform" },
  { header: "x-vercel-id", tech: "Vercel edge", kind: "hosting" },
  { header: "x-render-origin-server", tech: "Render", kind: "hosting" },
  { header: "fly-request-id", tech: "Fly.io", kind: "hosting" },
  { header: "cf-ray", tech: "Cloudflare", kind: "cdn" },
  { header: "x-envoy-upstream-service-time", tech: "Envoy (service mesh / Istio)", kind: "infra" },
  { header: "x-kong-upstream-latency", tech: "Kong API gateway", kind: "infra" },
  { header: "x-ratelimit-limit", tech: "application-level rate limiting", kind: "infra" },
  { header: "x-request-id", tech: "request tracing", kind: "infra" },
  { header: "x-runtime", tech: "Rails", kind: "framework" },
  { header: "x-django-version", tech: "Django", kind: "framework" },
  { header: "x-drupal-cache", tech: "Drupal", kind: "platform" },
  { header: "x-litespeed-cache", tech: "LiteSpeed / WordPress", kind: "platform" },
  { header: "x-hubspot-correlation-id", tech: "HubSpot CMS", kind: "platform" },
];

/** DNS TXT/CNAME/MX fragments -> the vendor they prove is in use. */
const DNS_FINGERPRINTS = [
  [/google-site-verification|aspmx\.l\.google\.com|googlemail/i, "Google Workspace (mail)"],
  [/outlook\.com|protection\.outlook/i, "Microsoft 365 (mail)"],
  [/zoho/i, "Zoho (mail)"],
  [/_dmarc|v=spf1/i, "SPF/DMARC configured"],
  [/sendgrid/i, "SendGrid"],
  [/mailgun/i, "Mailgun"],
  [/amazonses|_amazonses/i, "AWS SES"],
  [/postmark/i, "Postmark"],
  [/resend/i, "Resend"],
  [/loops\.so/i, "Loops"],
  [/customer\.io/i, "Customer.io"],
  [/intercom/i, "Intercom"],
  [/stripe/i, "Stripe"],
  [/atlassian|statuspage/i, "Atlassian / Statuspage"],
  [/notion/i, "Notion (hosted page)"],
  [/webflow/i, "Webflow"],
  [/framer/i, "Framer"],
  [/vercel/i, "Vercel"],
  [/netlify/i, "Netlify"],
  [/github\.io|pages\.github/i, "GitHub Pages"],
  [/readme\.io|readmeio/i, "ReadMe (API docs)"],
  [/mintlify/i, "Mintlify (docs)"],
  [/gitbook/i, "GitBook (docs"],
  [/docusaurus/i, "Docusaurus (docs)"],
  [/hubspot/i, "HubSpot"],
  [/salesforce|pardot/i, "Salesforce"],
  [/zendesk/i, "Zendesk"],
  [/cloudflare/i, "Cloudflare"],
  [/fastly/i, "Fastly"],
  [/openai|anthropic/i, "LLM vendor domain verification"],
];

/** Paths worth one GET each. Presence alone is the finding. */
const PATHS = [
  { path: "/robots.txt", why: "crawl rules, and sitemaps/admin paths they name themselves" },
  { path: "/sitemap.xml", why: "surface inventory: how many pages, what sections exist" },
  { path: "/llms.txt", why: "they publish an LLM-facing map of their own docs" },
  { path: "/.well-known/security.txt", why: "a security contact means someone owns it" },
  { path: "/openapi.json", why: "the public API surface, in full" },
  { path: "/swagger.json", why: "the public API surface, in full" },
  { path: "/api/openapi.json", why: "the public API surface, in full" },
  { path: "/graphql", why: "GraphQL endpoint exists (introspection may be off)" },
  { path: "/api/health", why: "health endpoint, sometimes with version + dependencies" },
  { path: "/healthz", why: "k8s-style health endpoint (suggests k8s)" },
  { path: "/version", why: "build/version endpoint" },
  { path: "/_next/static", why: "confirms Next.js build output" },
];

const now = () => new Date().toISOString();
const uniq = (a) => [...new Set(a)];

async function fetchWithTimeout(url, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    return await fetch(url, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "user-agent": "Mozilla/5.0 (compatible; jobops-stack-probe)" },
      ...opts,
    });
  } finally {
    clearTimeout(t);
  }
}

/** HEAD first (cheap); some hosts 405 a HEAD, so fall back to a ranged GET. */
async function probeHost(host) {
  for (const [method, extra] of [["HEAD", {}], ["GET", { headers: { range: "bytes=0-2048" } }]]) {
    try {
      const res = await fetchWithTimeout(`https://${host}/`, { method, ...extra });
      const headers = {};
      for (const [k, v] of res.headers) headers[k.toLowerCase()] = v;
      return { host, ok: true, status: res.status, finalUrl: res.url, headers, method };
    } catch (err) {
      if (method === "GET") return { host, ok: false, error: String(err.name || err.message) };
    }
  }
  return { host, ok: false, error: "unreachable" };
}

/** CSP is the org chart: frame-ancestors and connect-src name hosts nobody publishes. */
function domainsFromCsp(headers) {
  const csp = headers["content-security-policy"] || headers["content-security-policy-report-only"] || "";
  if (!csp) return { csp: "", domains: [] };
  const found = csp.match(/[a-z0-9*.-]+\.[a-z]{2,}/gi) || [];
  const own = found
    .map((d) => d.replace(/^\*\./, "").toLowerCase())
    .filter((d) => !/(google|gstatic|googleapis|doubleclick|facebook|fbcdn|twitter|x\.com|linkedin|cloudflare|cloudflareinsights|sentry|segment|intercom|stripe|hotjar|posthog|mixpanel|amplitude|vercel|jsdelivr|unpkg|cdnjs|youtube|vimeo|hcaptcha|recaptcha|clerk|supabase|amazonaws|typekit|fontawesome)\./i.test(d));
  return { csp, domains: uniq(own) };
}

function fingerprintHeaders(headers) {
  const hits = [];
  for (const fp of HEADER_FINGERPRINTS) {
    const val = headers[fp.header];
    if (val === undefined) continue;
    if (fp.match && !fp.match.test(val)) continue;
    hits.push({ tech: fp.tech, kind: fp.kind, evidence: `${fp.header}: ${val}` });
  }
  // The value of this one is the finding, not the header. Measured on Wonderdog.
  const clerk = headers["x-clerk-auth-reason"];
  if (clerk) {
    const env = /dev-browser/i.test(clerk) ? "development" : "production";
    hits.push({
      tech: `Clerk instance looks like ${env}`,
      kind: "auth",
      evidence: `x-clerk-auth-reason: ${clerk}`,
      note: "dev-browser-missing = a development instance; session-token-and-uat-missing = production",
    });
  }
  // x-vercel-id chains edge -> ... -> compute. The FIRST hop is the edge nearest to whoever ran
  // the probe (bom1 here means Mumbai, i.e. Shivam), so it says nothing about the company. Only
  // the LAST hop is their configured function region. Getting this backwards would have him
  // telling a company they deploy in India when they deploy in us-east-1.
  const vercelId = headers["x-vercel-id"];
  if (vercelId) {
    const hops = String(vercelId).split("::");
    const compute = hops.length > 1 ? hops[hops.length - 2] : null;
    if (compute) {
      hits.push({
        tech: `Vercel functions run in ${compute}`,
        kind: "hosting",
        evidence: `x-vercel-id: ${vercelId}`,
        note: `the first hop (${hops[0]}) is the edge nearest the prober, not their region. Only the compute hop is theirs.`,
      });
    }
  }
  if (headers["strict-transport-security"] && !headers["content-security-policy"]) {
    hits.push({ tech: "HSTS set, no CSP", kind: "security-posture", evidence: "strict-transport-security present, content-security-policy absent" });
  }
  return hits;
}

async function probePaths(host) {
  const out = [];
  await Promise.all(PATHS.map(async ({ path, why }) => {
    try {
      const res = await fetchWithTimeout(`https://${host}${path}`, { method: "GET", headers: { range: "bytes=0-4096" } });
      if (res.status >= 400) return;
      const ct = res.headers.get("content-type") || "";
      let body = "";
      try { body = (await res.text()).slice(0, 4000); } catch {}
      if (/<html/i.test(body) && !path.endsWith(".xml")) return; // an SPA 200 for everything
      out.push({ url: `https://${host}${path}`, status: res.status, contentType: ct, why, preview: body.slice(0, 700) });
    } catch {}
  }));
  return out;
}

async function dnsProbe(host) {
  const rec = { host };
  await Promise.all([
    resolveMx(host).then((r) => (rec.mx = r.map((x) => x.exchange)), () => {}),
    resolveTxt(host).then((r) => (rec.txt = r.map((x) => x.join(""))), () => {}),
    resolveCname(host).then((r) => (rec.cname = r), () => {}),
    resolve4(host).then((r) => (rec.a = r.slice(0, 4)), () => {}),
  ]);
  const blob = [...(rec.mx || []), ...(rec.txt || []), ...(rec.cname || [])].join(" ");
  rec.vendors = uniq(DNS_FINGERPRINTS.filter(([re]) => re.test(blob)).map(([, name]) => name));
  return rec;
}

/**
 * The ATS is worth knowing before the application, and Ashby's posting API returns the full JD,
 * comp, and secondaryLocations that every aggregator drops (learnings.md, DualEntry 2026-08).
 */
async function atsProbe(org) {
  const out = [];
  const tries = [
    { name: "Ashby", url: `https://api.ashbyhq.com/posting-api/job-board/${org}?includeCompensation=true` },
    { name: "Greenhouse", url: `https://boards-api.greenhouse.io/v1/boards/${org}/jobs?content=true` },
    { name: "Lever", url: `https://api.lever.co/v0/postings/${org}?mode=json` },
    { name: "Workable", url: `https://apply.workable.com/api/v1/widget/accounts/${org}?details=true` },
  ];
  await Promise.all(tries.map(async ({ name, url }) => {
    try {
      const res = await fetchWithTimeout(url);
      if (!res.ok) return;
      const body = await res.text();
      if (body.length < 40) return;
      let count = null;
      try {
        const j = JSON.parse(body);
        count = Array.isArray(j) ? j.length : (j.jobs?.length ?? j.meta?.total ?? null);
      } catch {}
      // A 200 with zero roles means the guessed org slug resolved to somebody else's empty
      // account, not that this company uses this ATS. Railway returned exactly that on Workable
      // while its real board was on Ashby with 8 reqs.
      if (count === 0) return;
      out.push({ ats: name, url, openRoles: count, bytes: body.length });
    } catch {}
  }));
  return out;
}

/** A free liveness check on any "we have an app" claim. Two wedges found this way already. */
async function appStoreProbe(name) {
  try {
    const res = await fetchWithTimeout(`https://itunes.apple.com/search?term=${encodeURIComponent(name)}&entity=software&limit=5`);
    if (!res.ok) return null;
    const j = await res.json();
    return {
      query: name,
      results: (j.results || []).map((r) => ({ name: r.trackName, seller: r.sellerName, updated: r.currentVersionReleaseDate })),
    };
  } catch { return null; }
}

async function main() {
  const hosts = SUBDOMAINS.map((s) => (s ? `${s}.${apex}` : apex));
  const live = (await Promise.all(hosts.map(probeHost))).filter((r) => r.ok);

  // CSP on any live host names hosts nobody publishes. Probe those too, one extra round.
  const discovered = uniq(live.flatMap((r) => domainsFromCsp(r.headers).domains))
    .filter((d) => !hosts.includes(d));
  const extra = discovered.length ? (await Promise.all(discovered.slice(0, 12).map(probeHost))).filter((r) => r.ok) : [];

  const allLive = [...live, ...extra];
  const ownHost = (h) => h === apex || h.endsWith(`.${apex}`);

  // Attribution matters more than detection. status.{apex} CNAMEs to Statuspage, so its
  // `x-runtime` header proves Atlassian runs Rails and proves nothing about this company. A
  // technology seen only on a host they do not control is the vendor's, and saying otherwise
  // out loud is exactly the kind of confident wrong claim /tech-read exists to prevent.
  const tech = {};
  for (const h of allLive) {
    const mine = ownHost(h.host);
    for (const hit of fingerprintHeaders(h.headers)) {
      const key = hit.tech;
      tech[key] ||= { tech: hit.tech, kind: hit.kind, note: hit.note, seenOn: [], evidence: [], onOwnHost: false };
      tech[key].seenOn.push(h.host);
      tech[key].onOwnHost ||= mine;
      tech[key].evidence = uniq([...tech[key].evidence, hit.evidence]);
    }
  }
  for (const t of Object.values(tech)) {
    // A host under their apex can still be a vendor's product (docs on Mintlify, status on
    // Statuspage). Flag the known-vendor subdomains so the attribution stays honest.
    const vendorish = uniq(t.seenOn).every((h) => /^(status|docs|help|support|blog)\./.test(h) || !ownHost(h));
    t.attribution = !t.onOwnHost ? "third-party host — the vendor's stack, not theirs"
      : vendorish ? "only on a docs/status/blog host — likely the vendor's product, verify before claiming"
      : "their own hosts";
  }

  const pathHosts = uniq(allLive.map((h) => h.host)).filter((h) => /^(|www|app|api|docs|developers)\./.test(h) || h === apex || h === `www.${apex}`);
  const paths = (await Promise.all(pathHosts.slice(0, 6).map(probePaths))).flat();
  const dns = await Promise.all(uniq([apex, ...discovered.slice(0, 4)]).map(dnsProbe));
  const ats = await atsProbe(apex.split(".")[0]);
  const appStore = await appStoreProbe(apex.split(".")[0]);

  const report = {
    domain: apex,
    slug,
    probedAt: now(),
    liveHosts: allLive.map((h) => ({
      host: h.host, status: h.status, finalUrl: h.finalUrl,
      csp: domainsFromCsp(h.headers).domains,
      headers: h.headers,
    })),
    // Two different findings, and conflating them produces a false claim. A host under their own
    // apex that appears nowhere public is their internal org chart (Wonderdog's self-built CRM
    // and its dev environment came out this way). An external host is a vendor they embed, which
    // is useful for a different reason: it tells you what they chose to buy instead of build.
    undisclosedOwnHosts: discovered.filter((d) => d === apex || d.endsWith(`.${apex}`)),
    embeddedVendorHosts: discovered.filter((d) => !(d === apex || d.endsWith(`.${apex}`))),
    stack: Object.values(tech).sort((a, b) => a.kind.localeCompare(b.kind)),
    publicPaths: paths,
    dns,
    ats,
    appStore,
    notRun: [
      "GitHub org: node gh-tools/recon.mjs <org> --out",
      "PR wedge: node gh-tools/pr-wedge.mjs <org>",
      "Engineering blog, changelog, and status-page incident history: read them by hand",
    ],
  };

  if (!jsonOnly) print(report);
  else console.log(JSON.stringify(report, null, 2));

  const dir = join(ROOT, "applications", slug);
  if (existsSync(dir) || args.includes("--slug")) {
    mkdirSync(dir, { recursive: true });
    const out = join(dir, "stack-probe.json");
    writeFileSync(out, JSON.stringify(report, null, 2));
    if (!jsonOnly) console.log(`\nwrote applications/${slug}/stack-probe.json`);
  } else if (!jsonOnly) {
    console.log(`\n(no applications/${slug}/ yet, nothing written. pass --slug ${slug} to create it)`);
  }
}

function print(r) {
  const line = (s = "") => console.log(s);
  line(`\n=== stack probe: ${r.domain} ===`);
  line(`${r.liveHosts.length} live hosts, ${r.stack.length} technologies fingerprinted\n`);

  line("LIVE HOSTS");
  for (const h of r.liveHosts) line(`  ${String(h.status).padEnd(4)} ${h.host}${h.finalUrl && !h.finalUrl.includes(h.host) ? ` -> ${h.finalUrl}` : ""}`);

  if (r.undisclosedOwnHosts.length) {
    line("\nTHEIR OWN HOSTS, NOT PUBLISHED ANYWHERE (from CSP)");
    for (const d of r.undisclosedOwnHosts) line(`  ${d}`);
    line("  ^ this is the internal org chart. A dev/staging/admin host here is a real observation.");
  }
  if (r.embeddedVendorHosts.length) {
    line("\nVENDORS THEY EMBED (external hosts in their CSP)");
    for (const d of r.embeddedVendorHosts) line(`  ${d}`);
    line("  ^ not their infrastructure. Tells you what they bought instead of building.");
  }

  line("\nSTACK (with the header that proves it)");
  for (const t of r.stack) {
    line(`  [${t.kind}] ${t.tech}`);
    line(`      ${t.evidence[0]}   (${uniq(t.seenOn).slice(0, 3).join(", ")})`);
    if (t.attribution !== "their own hosts") line(`      ATTRIBUTION: ${t.attribution}`);
    if (t.note) line(`      note: ${t.note}`);
  }

  if (r.publicPaths.length) {
    line("\nPUBLIC PATHS THAT ANSWERED");
    for (const p of r.publicPaths) line(`  ${p.status} ${p.url}  — ${p.why}`);
  }

  line("\nDNS");
  for (const d of r.dns) {
    if (d.mx) line(`  ${d.host} MX: ${d.mx.slice(0, 2).join(", ")}`);
    if (d.cname) line(`  ${d.host} CNAME: ${d.cname.join(", ")}`);
    if (d.vendors?.length) line(`  ${d.host} vendors: ${d.vendors.join(", ")}`);
  }

  if (r.ats.length) {
    line("\nATS");
    for (const a of r.ats) line(`  ${a.ats}: ${a.openRoles ?? "?"} open roles — ${a.url}`);
  }

  if (r.appStore?.results?.length === 0) line(`\nAPP STORE: nothing published under "${r.appStore.query}". If they claim an app, that gap is a wedge.`);
  else if (r.appStore?.results?.length) line(`\nAPP STORE: ${r.appStore.results.map((x) => `${x.name} (updated ${String(x.updated).slice(0, 10)})`).join(", ")}`);

  line("\nSTILL YOURS TO RUN");
  for (const n of r.notRun) line(`  - ${n}`);
}

main().catch((err) => { console.error(`stack-probe failed: ${err.message}`); process.exit(1); });
