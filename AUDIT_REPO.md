# MIFF Repository Audit — Sep 2025 (Phase 13)

This audit summarizes current repo health, module completeness, test status, placeholders/stubs, and recommended next steps.

## Executive Summary
- Master is buildable; tests run in-band for reliability due to worker IPC concerns.
- Phase 13 delivered a complete, engine-agnostic procedural generation suite (ProceduralWorldPure, MeshFactoryPure, TextureSynthPure, NodeGraphPure) with CLI harnesses, schemas, and golden tests. These new modules are deterministic (seeded) and pass.
- Ongoing stabilization work from Phase 12 was merged (ours-precedence) to avoid conflicts; targeted fixes will be reconciled in follow-up PRs.

## Test Status (in-band Jest)
- Full run result (Sep 22, 2025): 121 suites total (117 run, 4 skipped). 643 tests total — 614 passed, 24 failed, 5 skipped.
- New Phase 13 suites: all PASS (ProceduralWorldPure, MeshFactoryPure, TextureSynthPure, NodeGraphPure).
- Skipped tests remain as before (legacy/slow paths).

## High-Risk/Red Items
- Jest worker IPC incompatibility: continue using in-band; consider pinning Jest or migrating subset to Vitest.
- RenderReplayPure golden flow relies on `sample_replay.json` presence; exports for JSON/MD/HTML currently produce empty `{}` or fail — fix manager/exporters and include stable golden.

## Placeholders, Stubs, and Incomplete Code
- Intentional placeholders in `docs/` and `docs/godot/` for web/Godot exports and demo pages.
- Stubs in `jest.setup.js` for canvas, network, and DialogueParser; acceptable for CI.
- Minor placeholder comment in `miff/pure/RenderPayloadPure/cliHarness.ts` (ok).

## Module Completeness Snapshot
- Strong: AssetValidatorPure, CIEnforcerPure, QuestSystemPure, TimeSystemPure, AIProfileIntegrationLayer, ProceduralWorldPure, MeshFactoryPure, TextureSynthPure, NodeGraphPure
- Needs attention: RenderReplayPure (golden/exports alignment), VisualReplaySystemPure (temp export content), PathfindingPure (algorithm/diagonal + stats), HealthSystemPure (aliveEntities expectation), SessionManifestPure (fixtures/validation), NPCsPure (filters/CLI modes), SettingsPure (save command), ProjectileSystemPure (CLI output shape), RemixModePure (manifest minimal shape)
- Missing/legacy: Several C# legacy modules remain (conversion/removal backlog)

## Repo Hygiene
- Structure is clean and discoverable. Module tests live under `miff/pure/*/tests`.
- Jest single-config canonicalized; setup provides stable CI environment.
- Numerous docs/audits exist under `docs/`; keep and link from README.

## Failing Areas (from latest run)
1) RenderReplayPure
- CLI `replay-golden` cannot find `sample_replay.json` and marks sessions as error; JSON/MD/HTML exporters write `{}`.
- Action: Add/verify `sample_replay.json`, fix loader to support both embedded and file-based formats, ensure exporters write non-empty content with summaries.

2) VisualReplaySystemPure
- Temp export validation fields are `undefined` in golden test.
- Action: Ensure writer emits scenarioId/config/exportFormat fields; update test or shape accordingly.

3) PathfindingPure
- Dijkstra/diagonal tests fail; stats show mismatched counts (expected 3 successes, saw 2).
- Action: Review neighbor generation and cost heuristics; verify diagonal allowance and stats accumulation.

4) HealthSystemPure
- Stats test expects 2 alive, got 3.
- Action: Align test fixture operations or update manager semantics (dead vs <=0 HP) consistently.

5) SessionManifestPure
- List total/filters return 0; validation fails for a test fixture; duplicate errors mismatch.
- Action: Seed default sessions in test harness or load fixtures; align error messages.

6) SettingsPure
- `save` command returns error.
- Action: Ensure CLI writes expected path and returns structured envelope.

7) NPCsPure
- Creation returns error; zone filter expectation mismatched; `dump` falls back to help.
- Action: Validate sample paths, ensure `dump` command implemented; adjust fixtures/zones.

8) ProjectileSystemPure
- CLI output missing `op: 'projectiles.step'` and fields expected by golden.
- Action: Standardize CLI output envelope and operation naming.

9) RemixModePure
- Minimal manifest fields `firstChange.block/pos` are undefined.
- Action: Ensure sample mutation populates `firstChange` or adjust expectations.

## Recommendations (Actionable)
1) Testing infrastructure
- Pin `jest-worker`/`jest-runner` and `jest` to known-good set; or force in-band in CI.
- Evaluate Vitest migration for speed/stability in Node 18+/22.

2) RenderReplayPure
- Add stable golden fixture and unify loader. Fix exporters to produce non-empty JSON/MD/HTML per expectations.

3) VisualReplaySystemPure
- Confirm csv/summary temp export verification reads stderr note or decouple export side-effects from stdout JSON.

4) HealthSystemPure
- Align `aliveEntities` expectation vs setup; either fix test setup to kill one entity or adjust calculation semantics.

5) Legacy module backlog
- Continue C# conversions or mark as archived; reduce surface area.

6) Documentation
- README, ROADMAP updated for Phase 13 (done). Keep audit linked; add developer notes for CLI envelope and seed reproducibility.

## Phase 13 Addendum
- Added engine-agnostic procedural generation modules:
  - ProceduralWorldPure (terrain, biomes, rivers)
  - MeshFactoryPure (tree, rock meshes)
  - TextureSynthPure (gradients, noise)
  - NodeGraphPure (JSON graph executor)
- Standardized CLI envelope: { log: string[], outputs: any[] }
- Golden tests per module with fixed seeds ensure reproducibility
- Schemas added for terrain, mesh, texture, graph

## Next Steps (5–7 days)
- Day 1–2: Fix RenderReplayPure golden + exporters; VisualReplay temp export fields
- Day 2–3: PathfindingPure algorithm/diagonal/statistics alignment; HealthSystemPure stat semantics
- Day 3–4: SessionManifestPure/NPCsPure/SettingsPure CLI and fixtures; ProjectileSystemPure CLI op naming
- Day 5–7: Re-run full suite; target >95% pass; open PR reconciling stabilization branch contents beyond ours-merge

## Next Steps (7–10 days)
- Day 1–2: Fix RenderReplayPure golden/exports, HealthSystemPure stats, VisualReplay csv/summary checks.
- Day 3–4: Pin Jest deps or migrate subset to Vitest; update CI to run in-band short-term.
- Day 5–7: Convert/remove 5–8 legacy C# modules; add missing tests for AssetManifestPure/QuestModulePure/QuestTimelinePure/VisualItemEventPure.
- Day 8–10: Raise pass rate >90%, cut small release, update docs and changelog.

## Opinionated Assessment
MIFF is ambitious and modular, with strong CLI-first patterns and remix-safe discipline. The primary drag right now is test harness friction (Jest worker) and a handful of module-specific golden alignment issues. With focused fixes and CI stabilization, the framework can present a very credible v0.2 milestone with wide module coverage and reproducible demo flows.

---
Generated by automated audit tooling and targeted test runs on Sep 22, 2025.