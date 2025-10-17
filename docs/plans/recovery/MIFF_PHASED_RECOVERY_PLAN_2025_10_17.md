# MIFF Phased Recovery Plan — 2025-10-17

## Objective
Stabilize TypeScript types, fix failing tests/CLIs, harden parsing, and polish workflows.

## Phase 0 — Baseline and Guards (Day 1)
- Add CI job: type-check (tsc --noEmit) + unit tests
- Mock console in tests to reduce noise
- Create central SafeJSONParser and replace top 25 risky JSON.parse
- Gate eval() via SafeExpressionEvaluator in test paths

## Phase 1 — Core Test Type Fixes (2–3 days)
- EffectsPure: update test helpers to match BattleEffect signatures
- TeamsPure: replace unsafe casts with builder pattern for ISpiritInstance
- EvolutionPure: adjust imports (types vs values), update EvolutionManager.create usage
- EventBus timers: align with global fake timers or explicit jest.useFakeTimers()

Success: Unit tests majority pass; core modules green

## Phase 2 — CLI/Demo Hygiene (2–4 days)
- CutScenePure CLI: remove duplicates, add types, proper arg parsing
- CameraSystem CLI: align with manager API; fix Map.size; expose required methods
- Demos: correct relative imports and missing exports

Success: CLI tests pass; demos compile in type-check

## Phase 3 — Security & Error Typing (2 days)
- Replace JSON.parse in high-risk paths with SafeJSONParser
- Narrow catch(error) unknown; wrap with error guards
- Remove remaining eval() in non-test code

Success: Zero high-risk parsing; no TS18046

## Phase 4 — Golden/Integration Re-enable (2–3 days)
- Re-enable golden suites per module after unit green
- Fix integration for Teams, Items, Combat, AI minimally

Success: Golden ≥70% pass; integration core paths pass

## Phase 5 — Workflow Polish (1–2 days)
- Cache deps, upload coverage/artifacts, add link-check/html-validate
- Lighthouse and security gates on main PRs

Success: CI stable, reports available

## Tracking & Deliverables
- Daily report in `docs/reports/` with failures resolved and next targets
- Update `STATUS.md` progress bar per phase

