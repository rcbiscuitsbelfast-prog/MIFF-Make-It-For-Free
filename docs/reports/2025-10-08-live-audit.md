# MIFF Live Audit Report (2025-10-08)

## Summary
- Fresh TypeScript check found 1,253 errors across multiple modules.
- Jest tests: 197 passed, 100 failed, 4 skipped (770 total). Failures include ESM/CJS config issues, missing/renamed exports, CLI harness module resolution, and type mismatches.
- Website: 83 `index.html` detected; duplication persists across `site/`, `web/`, and `renderworld-hub/`. `lighthouserc.json` and `vercel.json` present.
- CI: 13 workflows. Includes type-check placeholder, test coverage, Codecov, Lighthouse CI, and Snyk security scan. Several steps are tolerant (do-not-fail) based on presence checks.
- Root: 262 files in repository root. Physics exports still present in root (4 JSON, 4 manifest, 4 summaries).

## TypeScript Audit
- Total errors: 1,253 (tsc --noEmit)
- Representative issues:
  - EventBus usage: `on`/`emit` not present on typed `EventBus` in multiple modules.
  - Duplicate/incorrect exports: conflicting declarations and duplicate identifiers.
  - Interface drift: payload/result shapes vs Manager API types (e.g., `EquipmentPure`, `RenderPayloadPure`).
  - Manager imports missing or module paths incorrect in CLI harnesses (Godot/Unity/Web bridges, Physics/Collision/Camera systems).
  - Implicit any and Enum/string literal mismatches in several systems.

## Test Audit (Jest)
- Suites: 201 total; 197 passed, 100 failed, 4 skipped.
- Frequent failure classes:
  - ESM/CJS interop: `SyntaxError: Cannot use import statement outside a module` in CLI helper imports.
  - ts-node/tsx invocation from tests with module path assumptions (`index.ts` vs package main).
  - Golden tests expect older shapes (e.g., `QuestOutput`, `EquipmentOutput`, `RenderPayload` metadata).
  - Contract tests depend on missing/renamed methods (`simulateCraft`, `get` on EnhancedStatsManager`).

## Website Audit
- Duplication: 83 `index.html` files; directories present: `site/` (32 items), `web/` (8), `renderworld-hub/` (6).
- Configs: `lighthouserc.json` present; `vercel.json` present.
- Actions pending: consolidate site structure; normalize canonical routes; ensure CI runs Lighthouse against canonical URLs.

## CI/Workflows
- 13 workflows present:
  - Type-checks run with `npx tsc --noEmit` where `tsconfig.json` exists; some steps `|| echo` to avoid failure.
  - Coverage pipelines with Codecov and artifact uploads.
  - Lighthouse CI workflow configured with `lighthouserc.json`.
  - Snyk security scanning configured (token required in secrets).
- Recommendations:
  - Make type-check and tests fail the build in core CI.
  - Gate merges on minimum coverage.

## Root Hygiene
- Root file count: 262.
- Physics export artifacts present in root (12 files total across JSON/manifests/summaries).
- Multiple config variants in root; consider centralizing under `config/` with symlinks if needed.

## Branch Impact Review
- Branch: `cursor/resume-typescript-error-recovery-4ee5`
  - Touches: `ConvertToUnityPure`, `CutScenePure`, `DebugOverlayPure`, `DialoguePure`, `DrivingSystemPure`, `toppler-demo`.
  - Scope: ~692 insertions / 439 deletions.
  - Likely addresses: duplicate identifiers and interface mismatches in `ConvertToUnityPure`, `CutScene` bridge typings, Driving manager structure.

- Branch: `cursor/continue-audit-recovery-and-fix-typescript-errors-1237`
  - Touches: `ConvertToUnityPure`, `CutScenePure`, `DebugOverlayPure`, `DialoguePure`, `DrivingSystemPure`.
  - Scope: ~724 insertions / 259 deletions.
  - Notable diff indicates expansion of `UnityBuildSummary` (e.g., `buildStrippingInfo`), which should resolve missing property errors and potential duplicate property issues.

- Both branches are ahead of `origin/master` and likely reduce TS errors in impacted modules. They should be reviewed, tested, and merged.

## Next Steps (High Impact)
1) Apply/fold in fixes from the two cursor branches; re-run `tsc` and Jest.
2) Stabilize `EventBus` typing and adapters to align `.on/.emit` usage.
3) Fix ESM/CJS test harness: ensure CLI helpers use ts-node/tsx consistently and import package entry points.
4) Update golden tests to match current output shapes; add migration shims where feasible.
5) Begin website consolidation (reduce `index.html` to single entry; add redirects).
6) Tighten CI gates: fail on type errors; enforce coverage threshold; keep Lighthouse CI.