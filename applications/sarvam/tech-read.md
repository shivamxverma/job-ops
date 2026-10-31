# Sarvam — tech read (2026-10-27), CPU Infra lens

Sources: stack-probe.json (run 2026-10-27), docs.sarvam.ai/llms.txt, status.sarvam.ai, the JD.

## 1. What they run, and the evidence
| Claim | Evidence | Confidence |
|---|---|---|
| Cloudflare in front of all own hosts | `server: cloudflare`, `cf-ray` on sarvam.ai, docs, dashboard, auth, k.sarvam.ai | high |
| Kubernetes behind the site | `200 /healthz` on sarvam.ai and www | medium (k8s-style path, not proof) |
| Request tracing on the API | `x-request-id: 20261027_<uuid>` on api.sarvam.ai (date-prefixed) | high |
| Azure in the serving path for assets | `blob.core.windows.net`, `azurefd.net` embedded on their pages | medium |
| OpenTelemetry-based observability (SigNoz Cloud, India region) | `ingest.in.signoz.cloud` embedded | medium (seen client-side; backend use is a GUESS) |
| Docs on Fern, CMS on Sanity, status on incident.io | buildwithfern.com, sanity.studio in CSP; Next.js RSC headers on status. | high, but vendor stacks, not theirs |
| Multi-cloud K8s incl. Indian sovereign clouds, Cloudflare, identity, secrets, cost, CI/CD | the JD | stated |
| Real-time media: voice agents over telephony + WebRTC | JD ("real-time voice and WebRTC infrastructure"), status page Telephony/Calls components, docs (bring your own telephony or rent a number) | high |

Unpublished own hosts seen: `cdn.sarvam.ai`, `k.sarvam.ai`.

## 2. Problems their shape forces
- **One delivery pipeline, four clouds.** The same service has to deploy to Azure, AWS, GCP and a
  sovereign cloud with different IAM, load balancers and quotas. Drift between clusters is the
  default state unless the pipeline enforces it.
- **Real-time media on Kubernetes.** SIP/RTP and WebRTC want UDP port ranges and stable public
  IPs, which fights K8s Services and autoscaling. Usually solved with a separate media fleet or
  hostNetwork pods; either way it's a second operational model next to the API.
- **Data residency vs. observability.** A sovereign-cloud cluster exists so data stays in India
  under certain controls; logs and traces carry request content. Where telemetry is shipped from
  those clusters is a policy question as much as a tooling one.
- **Toil volume.** 45 open roles means a lot of new engineers asking for access, environments and
  deploy help. The JD says this outright and wants it automated.

## 3. The seam Shivam has already touched
- Yuvro's orchestrator owns per-project K8s Deployments, Services and Ingress, which is the same
  provisioning-on-request shape as "self-service for product teams".
- Removing manual steps: lint package discovery from `pyproject.toml` (4 packages checked for the
  first time), 28 hand-written Docker COPY lines replaced with `turbo prune` across 3 images.
- Security basics: found provider keys committed in old configs during the 70-dependency upgrade
  and pushed for rotation, not just deletion.
- Linux/container depth: CodeSM's hardened sandbox (no network, read-only root, dropped caps,
  cgroup memory/pid/CPU limits).

## 4. Two questions only an internals reader would ask
1. Do the voice agents' SIP and WebRTC media run on the same Kubernetes clusters as the APIs, or
   on a separate fleet with host networking? UDP port ranges and stable IPs are usually where
   K8s stops being the easy answer.
2. For the sovereign-cloud clusters, do traces and logs leave that boundary for SigNoz, or is
   there a collector and backend per cloud? Feels like the place where data residency and
   observability pull in opposite directions.

**One hedged observation:** `api.sarvam.ai/version` returns `0.0.0`, so the build version is
probably not being stamped at deploy time. Wiring the git SHA into it is a small, real piece of
"make the pipeline tell you what's running". Raise as a question, not a criticism.
