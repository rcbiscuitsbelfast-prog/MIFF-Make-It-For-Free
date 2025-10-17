# MIFF Comprehensive Super Audit — 2025-10-17

## Executive Summary
- Scope: Full repository audit (code, tests, workflows, docs, web assets)
- State: Functional framework; TypeScript issues concentrated in tests and select CLIs; CI config present
- Risks: Type errors in tests/CLIs, noisy logging in tests, some API/test drift
- Priorities: P0 fix test TS errors in core modules; P1 address CLI/type hygiene; P2 workflow polish

## Inventory (auto)
- TypeScript files: ~900+ in `miff/*`, total TS ~900+
- Test files discovered: 200+ (Jest roots `miff/pure`)
- Workflows: 12 active YAML in `.github/workflows`
- HTML pages: 140+ across `docs/`, `web/`, `site/`, `miff/`
- Modules (`miff/pure/*/index.ts`): 150+; Managers present for ~70

## TypeScript Check Results (tsc --noEmit)
- Errors present. Representative samples:
  - CutScenePure: duplicate functions, implicit any, wrong symbol usage, missing exports
  - ConvertToUnityPure: wrong property in UnityBuildSummary
  - Demos: missing imports/paths, API drift (EventBus emit)
  - Shared utils: unknown error typing

## Test Execution (npm run test:ci)
- Unit: FAIL (numerous TS errors within tests; logging noise)
- Integration: FAIL (teams, evolution, combat, items, ai)
- Golden: FAIL
- Performance: PASS
- CLI tests: FAIL
- Common patterns:
  - EffectsPure tests calling outdated signatures
  - TeamsPure casting to `ISpiritInstance` with mismatched shape
  - EvolutionPure tests importing types that became value enums/classes
  - EventBus timer tests misusing fake timers expectations
  - WebSocketBridge test triggers console warnings (acceptable but noisy)

## Code Quality Signals (grep-based)
- console.log occurrences (ts): 6,878 across ~334 files (heavy test/cli logging)
- JSON.parse usages (ts): 508 across 262 files (review for security)
- eval( usages (ts): 11 across 6 files (guard or replace with Safe evaluator)
- @ts-ignore: 0 (healthy)
- any annotations: ~1,585 `: any`, ~812 `as any` (needs reduction in critical paths)
- TODO/FIXME/HACK/XXX: 196 matches (triage to issues backlog)

## Workflows Audit
- Present: test-coverage, security, release, testing, build-deploy, monitoring, lighthouse, link-check, coverage, maintenance, audit-ci, ci-core
- Recommendations: add type-check job; cache node_modules; ensure jest html/artifacts upload; tighten audit levels

## Web/HTML Audit
- 141 HTML pages detected. Spot-check: docs/site and web/* load static assets; ensure CSP headers (script/style) and integrity for prod

## Documentation Audit
- Many audit docs already exist. Recommend consolidating to canonical: `STATUS.md`, `ROADMAP.md`, latest audit in `docs/audit/latest/`

## Detailed Findings
1) Test Type Drift
- EffectsPure: test helper signatures don’t match `BattleEffect` API
- TeamsPure: unsafe object-to-interface casts — replace with builder or strict factory
- EvolutionPure: type/value import mismatch; manager.create signature now requires EventBus + context

2) CLI and Demos Typing
- CutScenePure CLI: duplicate functions, implicit any, incorrect flag wiring
- CameraSystem CLI: methods not on Manager; outdated stats usage; Map length misuse
- Demos import paths stale; fix to relative pure paths

3) Error-typing Hygiene
- Widespread TS18046 on catch(error: unknown) — add narrowers or `instanceof Error`

4) Logging Noise in Tests
- Extensive console.log/console.warn in unit tests; add test logger or mock console

5) Security/Parsing
- 508 JSON.parse: audit callsites; use SafeJSONParser in external-input paths
- 11 eval(): gated usage; replace with SafeExpressionEvaluator or remove in tests

6) Build/Config
- jest config uses ts-jest with roots limited to `miff/pure`; ensure tests outside are intentional

## Metrics Snapshot
- Passing suites (current run): minimal due to TS compile errors inside tests (prior baseline reported ~46% when pinned to Oct 8 state)

## Recommendations
- Short-term stabilize test types and CLIs; then re-enable golden/integration incrementally
- Add CI job: type-check + unit tests with `--maxWorkers=2` to reduce flakiness
- Introduce structured logger and silence test logs via Jest setup

