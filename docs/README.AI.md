# MIFF – AI Bootstrap Guide

Audience: AI agents, automation scripts, advanced contributors.

MIFF is a modular, remix-safe, prompt-driven framework. This guide provides the minimum architecture, protocols, and constraints an AI needs to extend MIFF safely.

## 1) Purpose and Architecture

- Core principle: small, deterministic, engine-agnostic "Pure" modules in `miff/pure/**`.
- Inputs/Outputs: JSON in, JSON out. No side-effects beyond return values and logs.
- Adapters: Bridges for Web/Unity/Godot live outside of Pure modules.
- Determinism: Golden tests and seeded RNG are required for all logic.

High-level structure:
```
/miff/pure/              # Modules with README + index.ts + tests + cliHarness.ts
/cli/                    # Compiled CLI entry points and helpers
/docs/                   # Docs site and contributor guides
/site/                   # Static HTML samplers and studio
/tests/                  # Integration and golden tests
```

## 2) Module Map (sample)

| Module | Purpose | Key deps | Exports | Remix-Safe |
|---|---|---|---|---|
| CombatPure | Damage, types, resolution | RNG, Effects | `simulateTurn`, types | Yes |
| DialogueSystemPure | Branching dialogue | none | `advanceDialogue`, types | Yes |
| RhythmSystemPure | Beat timing and judge | none | `createBeatmap`, `judge` | Yes |
| EffectsPure | Buffs, debuffs, stacks | none | `applyEffects`, types | Yes |
| SavePure | JSON persistence | Schemas | `save`, `load`, validators | Yes |
| TeamsPure | Team composition and rules | Schemas | `validateTeam` | Yes |
| RewardsPure | Drops and tables | RNG | `rollDrops` | Yes |
| EventBusPure | Subscriptions and events | none | `createBus`, `emit` | Yes |
| InputPure | Raw->action mapping | none | `mapInput` | Yes |
| BattleLoopPure | Turn orchestration | Combat, Teams | `runBattle` | Yes |

Notes:
- Each module must expose a stable `index.ts` with typed exports.
- Include `cliHarness.ts` for deterministic demo runs.
- Provide `tests/golden_*.test.ts` with fixed seeds and JSON fixtures.

## 3) Test Infrastructure

- CLI: `cli/test-cli.cjs` supports running demos and smoke tests.
- Jest config: see `jest.config.cjs` (or module tests under `miff/pure/**/tests`).
- Golden policy: tests must be deterministic; acceptable noise = 0. Flaky tests must be quarantined and annotated with rationale.
- Thresholds: All new/modified modules require at least one golden test and one negative case.

Run basics:
```bash
npm test
node cli/test-cli.cjs --demo toppler
```

## 4) Export Capabilities

- Web: static HTML export with pre-rendered states and minimal JS drivers.
- Unity/Godot: use bridge modules to translate Pure outputs into engine runtime calls.
- Constraints: Pure modules do not import engine SDKs; bridges are translation layers.

## 5) Contributor Protocols (AI-friendly)

Naming
- Files: `Manager.ts`, `index.ts`, `cliHarness.ts`, `README.md`, `tests/golden_*.test.ts`.
- Functions: verbs for actions (e.g., `simulateTurn`, `applyEffects`). Types: nouns (e.g., `BattleState`).

Onboarding Flow
- Create module folder in `miff/pure/<ModuleName>`.
- Implement core logic in `index.ts`. Keep functions pure; no I/O.
- Add `cliHarness.ts` that reads JSON from stdin or sample fixtures and prints JSON.
- Write golden tests with fixed seeds. Include at least one error case.
- Document Remix Hooks in the module `README.md`.

Documentation Expectations
- Update root `README.md` only with high-level references.
- Keep deep details in module readmes and `docs/**`.

## 6) Roadmap Hooks

Priority modules for optimization/extension
- Export pipeline consolidation (`miff/pure/ExportPipelinePure.ts`).
- Cross-engine schema stability (`miff/pure/SharedSchemaPure`).
- Performance profiling hooks (`miff/pure/PerfPure`).
- Asset pipeline safety (`miff/pure/AssetValidatorPure`).

Extension suggestions
- Add additional genre systems (e.g., `StealthSystemPure`, `BuilderSystemPure`).
- Expand conversion tools (`ConvertToWebPure`, `ConvertToUnityPure`, `ConvertToGodotPure`).

## 7) AI Integration Readiness

What an AI agent should know
- Prefer composition over inheritance; modules interact via typed data.
- Keep interfaces stable; add new fields under `experimental?` flags when necessary.
- Do not introduce nondeterminism; gate RNG via explicit seeds.
- Maintain remix-safety: do not add closed assets or license-ambiguous files.

Common Operations
```bash
# Create a new module scaffold (manual steps for now)
mkdir -p miff/pure/FooSystemPure/tests
printf '%s\n' 'export function doFoo() { return { ok: true }; }' > miff/pure/FooSystemPure/index.ts
printf '%s\n' 'import { doFoo } from "./index"; test("foo",()=>{ expect(doFoo()).toEqual({ok:true}); });' > miff/pure/FooSystemPure/tests/golden_FooSystemPure.test.ts
printf '%s\n' 'import { doFoo } from "./index"; console.log(JSON.stringify(doFoo()));' > miff/pure/FooSystemPure/cliHarness.ts
npm test
```

Validation Checklist
- Types exported from `index.ts`
- `cliHarness.ts` runs without network/file I/O
- Golden tests pass locally and in CI
- README includes Remix Hooks + usage examples

## 8) References

- Root overview: `README.md`
- Tests: `docs/TESTING.md`
- Contributor onboarding: `docs/CONTRIBUTOR_ONBOARDING.md`
- CI/CD: `.github/workflows/ci.yml`
- Module audits: `COMPLETE_MODULE_AUDIT.md`, `COMPREHENSIVE_AUDIT_REPORT.md`

— Keep it deterministic, documented, and remix-safe.