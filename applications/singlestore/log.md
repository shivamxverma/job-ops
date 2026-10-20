# SingleStore — log

- 2026-10-06 — lead from HN Who is hiring Oct 2026 (item 49962002, Pancham Khaitan, AI Platform).
  That req (Greenhouse 7573638) states 4+ years + mentoring, so C. Retargeted to the India
  university-grad SWE req 8212128 (published 2026-09-17; C/C++, OS/concurrency, DSA, no years bar),
  graded B. Twin req 8000966 (Database Engine, India, same requirements, published 2026-06-11) also open.
  JD bodies read in full from the Greenhouse API, no canary.
- 2026-10-06 — recon: `stack-probe.mjs singlestore.com` (CloudFront site, Envoy on api., Greenhouse 43
  roles, llms.txt on docs), `gh-tools/recon.mjs singlestore-labs` (SDKs/notebooks only, engine is
  closed source; output moved to github-recon.md here). Status-page incident JSON unavailable.
- 2026-10-06 — read: codegen docs (MPL → MBC → LLVM, interpret_first, plancache 720 min + on-disk),
  columnstore docs (segments, delete bitmask, in-memory segment, hash indexes), Universal Storage blog
  parts 2-3 (unique keys via hash index extension), Aug 2026 release notes (cross-segment full-text
  index merger), Envoy + Wasm Private Link post, SIGMOD'22 abstract. Funding: Vector Capital growth
  buyout closed 2025-09-10.
- 2026-10-06 — wrote dossier.md, tech-read.md, new cluster note profile/domains/distributed-sql-engine.md
  (+ README row). No IIIT Nagpur alumni found by web search; LinkedIn alumni tab not checked.
  No resume, outreach, tracker or actions.json changes.
- 2026-10-20 — tailor-resume for req 8212128 (systems framing; Education first for a university-grad seat). Round 1 ats-score 83 (4/10 bullets without a number, "algorithms" not searchable, Yuvro storage bullet off-target). Round 2: cut that bullet, added "Data Structures & Algorithms" to skills; 3/9 bullets without a number, no repeated verbs, one page verified from the render. Score ~86. Not claimed (not true): multithreading, fault tolerance, SIMD/LLVM, optimiser work. The dossier's "seam" (shipped poiro SHA-256 dedup) is false and was NOT used.
