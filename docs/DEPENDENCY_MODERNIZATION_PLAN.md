# Dependency Modernization Plan (Q4 2025)

## Goals
- Remove deprecated transitive packages (glob < 9, inflight) via upstream upgrades
- Address npm audit advisories (vite/vitest chain; esbuild advisory via vite bump)
- Keep Jest 29 pin for compatibility; explore Vitest migration in 2026

## Summary of Outdated Packages
- jest 29.7.0 (latest 30.x) — keep 29 pinned for stability
- jest-environment-jsdom 29.7.0 — keep aligned with Jest 29
- @types/jest 29.x — compatible
- vite 5.4.x (latest 7.x) — major upgrade required
- vitest 2.1.x (latest 3.x) — major upgrade required (dependent on vite)
- esbuild 0.25.x — keep aligned with vite choice
- puppeteer 22.x (latest 24.x) — can upgrade independently
- sharp 0.34.x — patch upgrade fine

## Phased Plan
### Phase A (safe upgrades)
- puppeteer 22.x -> 24.x
- sharp 0.34.3 -> 0.34.4
- @types/node 24.5.1 -> 24.5.2

### Phase B (tooling stability)
- Pin Jest 29.x, jsdom 29.x across CI and local
- Ensure runInBand in CI; document worker-mode risks

### Phase C (Vite/Vitest track) [separate feature branch]
- Create branch: feature/tooling-vite7-vitest3
- Upgrade vite 5.x -> 7.x; vitest 2.x -> 3.x
- Run sampler/site builds; adjust config (vite.config.ts)
- Replace deprecated APIs; run perf smoke tests

## Validation
- Full in-band test run must be green
- Sampler/site dev server smoke-test
- Update AUDIT_REPO.md upon completion

## Rollback Plan
- Keep lockfile and branch-based upgrade; revert via Git if instability occurs