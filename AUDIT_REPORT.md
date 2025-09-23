# MIFF Repository Audit (Sep 2025)

## Summary
- Status: Stable. Core phases M1–M4 completed; exports/launcher/contracts in place
- Tests: 130 suites total (126 passing, 4 skipped), 656 tests (651 passing, 5 skipped)
- CI: Sharded Jest, PR snapshot artifacts (PPM), README→docs auto-sync
- Docs/Tools: Golden diff visualizer (`site/tools/diff.html`), `docs/modules/` auto-synced

## Phases & Deliverables
- M1 Godot bridge contracts + launcher
  - GodotBridgePure contract tests passing
  - Site launcher with scenario picker, seed, JS bridge and prewarm
  - CI job for bridge contract tests
- M2 ExportWebPure
  - CLI to emit web export + `preload.manifest.json`
  - `export-web.yml` workflow (manual trigger)
- M3 ExportAndroidPure
  - CLI with signing validation; CI-safe placeholders (AAB/APK)
  - `export-android.yml` workflow (manual trigger)
- M4 Mobile UX
  - HapticsPure, TouchGesturePure, PermissionsPure: managers, CLIs, tests (passing)

## Bridges & Contracts
- GodotBridgePure
  - Adapters include TileMap (materialAtlas, tileIndices) and NavigationRegion (polygons)
  - ProceduralWorld → Godot contract test (tilemap/nav) passing
- Web/Unity contracts
  - Invariant tests validate engine tag and items/issues structure
- Camera/WebSocket bridges
  - Contract tests pass (API/envelope invariants)

## CI & Automation
- Sharded Jest: matrix runs via `scripts/jest-shard.js`, `jest-sharded.yml`
- Snapshots on PRs: `sampler-snapshots.yml` produces per-engine `.ppm` artifacts; comments PR with artifact info
- README sync: `scripts/sync-readmes.js` → `docs/modules/` + `readme-sync.yml` artifact

## Site & Tools
- `site/src` launcher integrated; `site/tools/diff.html` for golden vs actual JSON comparison
- `docs/site/TOOLS.md` created; `site/index.html` links tools

## Test & Coverage
- Suites: 126/130 passing; tests: 651/656 passing; 0 failing in full suite runs
- Coverage gates set globally (22/18/22/22) with per-module ratchets for highly covered modules

## Modules (Highlights)
- Strong: BridgeSchemaPure, PathfindingPure, RenderPayloadPure, TimeSystemPure, StatusEffectsPure
- New: HapticsPure, TouchGesturePure, PermissionsPure (tests passing)
- Needs attention: Some legacy and low-coverage modules (e.g., EconomyPure, large managers with sparse tests); C# legacy modules earmarked for cleanup

## Exports & Launcher
- Web export CLI working (copy+manifest; headless export pending)
- Android export CLI placeholder outputs for CI; headless + Gradle integration pending
- Launcher: embeds Godot export; frame forwarding and prewarm in place

## Pending / Next Steps
- Replace Android placeholder with real Godot headless export + Gradle signing
- Expand Godot adapter to generate tile indices from ProceduralWorld biomes/heights; deeper atlas mapping tests
- Wire RenderReplayPure to produce real per-step frames in snapshots (beyond sample)
- Strengthen per-module coverage ratchets; add more fuzzing (Physics/Collision)
- Optional: PR bot enhancements (link diff visualizer with baseline/actual JSON)

## Risks
- Toolchain setup for real Android exports (SDK/NDK, templates)
- Maintaining determinism across bridge layers and replay
- Performance/size of web assets without headless export pipeline

---
Generated automatically during Phase 12+ stabilization and integration work.