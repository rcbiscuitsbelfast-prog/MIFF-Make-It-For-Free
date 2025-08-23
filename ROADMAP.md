# MIFF Framework Roadmap

## Principles
- CLI-first, engine-agnostic, remix-safe modules
- Deterministic golden-output tests for all modules
- Strict schemas with versioning (current: v12 for new modules)

## Modules Overview (by domain)
- Core Data & Flow (completed)
  - InventoryPure — CLI harness, samples, golden test
  - SaveLoadPure — CLI harness, samples
  - QuestsPure — CLI harness, samples, tests
  - NPCsPure — CLI harness, samples, golden tests (v13)
- Character Progression (completed)
  - StatsSystemPure — v12. CRUD and simulate totals
  - SkillTreePure — v12. Unlock with prerequisites
  - XPLevelingPure — Level curves (existing)
  - EquipmentPure — Gear slots (existing)
- Combat & Effects (completed in Phase 1)
  - CombatCorePure — v12. Basic damage resolution
  - StatusEffectsPure — v12. Poison/regen tick system
- Navigation & World (completed in Phase 1)
  - PathfindingPure — v12. Grid BFS
  - WorldLayoutPure — Tiles/regions (existing)
  - MovementPure — Kinematic intents (existing)
  - ZonesPure — Area definitions (existing)
- Interop & Validation (completed in Phase 2)
  - SharedSchemaPure — v12. Common types and CLI dumpTypes
  - EntityLinkerPure — v12. Cross-module reference resolution
  - ValidationPure — v12. Cross-module validation engine
- Attribution & Licensing (completed in Phase 2.1/v13)
  - MiffAttributionPure — v13. Attribution popup module
  - LICENSE.md — Dual license (AGPLv3 + commercial)
  - CONTRIBUTING.md — CLA and dual-license notes
- Derived Systems (completed in Phase 3/v13)
  - CraftingPure — v13. Recipes and stat modifiers
  - LootTablesPure — v13. Drop rates and stat rolls
  - EconomyPure — v13. Pricing and vendor logic
- Scenario Packs (completed in Phase 4/v13)
  - TutorialScenarioPure — v13. Basics walkthrough
  - QuestScenarioPure — v13. Branching questline
  - CombatScenarioPure — v13. Arena combat demo
- Gameplay Systems (completed in Phase 10)
  - ProjectileSystemPure — v14. Projectile physics and lifecycle
  - ScoreSystemPure — v14. Score tracking and events
  - HealthSystemPure — v14. Health management and events
  - InputSystemPure — v14. Input mapping and processing
  - CameraBridgePure — v14. Camera control and following
  - RhythmSystemPure — v14. Beat timing and rhythm logic
  - AudioBridgePure — v14. Audio playback and control
  - MountSystemPure — v14. Entity mounting and movement
  - DialogueSystemPure — v14. Branching dialogue system
  - CutsceneSystemPure — v14. Scripted sequence control
  - NavigationSystemPure — v14. Pathfinding and movement
- Quest & Asset Management (completed in Phase 12)
  - QuestSystemPure — v14. Quest logic and progress tracking
  - AssetValidatorPure — v14. Asset validation and compliance
- CI & Remix Safety (completed in Phase 13)
  - RemixAuditPure — v14. Module compliance and remix-safety
  - CIEnforcerPure — v14. Contributor standards and CI validation
- Visual Replay & Testing (completed in Phase 14)
  - VisualReplaySystemPure — v14. Deterministic replay with visual hooks
- Content & Systems (existing)
  - DialogPure — Branching text
  - LorePure — Databank
  - AudioMixerPure — Pure audio routing
  - WorldEnhancementsPure — Props and decorations
  - AIProfilesPure — Behavior profiles

## Phase 1 — Core Gameplay Modules (Schema v12)
- [x] StatsSystemPure (updated for v12)
- [x] SkillTreePure (updated for v12)
- [x] CombatCorePure (new)
- [x] StatusEffectsPure (new)
- [x] PathfindingPure (new)

Tag: `phase1-v12-core`

## Phase 2 — Interop & Validation (Schema v12)
- [x] SharedSchemaPure (new)
- [x] EntityLinkerPure (new)
- [x] ValidationPure (new)

Tag: `phase2-v12-interop`

### Phase 2 Completion Checklist
- [x] Standardized output format: { op, status, issues, resolvedRefs }
- [x] Shared types exported and consumable across modules
- [x] EntityLinker supports extern map injection and deterministic resolution
- [x] Validation supports configurable rules and deterministic reports
- [x] Golden-output tests for all ops

## Phase 2.1 — Attribution & Licensing (Schema v13)
- [x] MiffAttributionPure (new)
- [x] LICENSE.md (dual license)
- [x] CONTRIBUTING.md (CLA + dual-license)

Tag: `phase2-v13-attribution`

### Attribution & Licensing Checklist
- [x] Attribution module with override hooks and golden tests
- [x] Dual-license file with commercial contact
- [x] CLA in contributing guide

## Phase 3 — Derived Systems (Schema v13)
- [x] CraftingPure (new)
- [x] LootTablesPure (new)
- [x] EconomyPure (new)

Tag: `phase3-v13-derived`

### Phase 3 Completion Checklist
- [x] Managers with simulateCraft/rollLoot/calculatePrice
- [x] CLI harnesses list/create/simulate/dump
- [x] Samples and expected outputs for golden tests
- [x] READMEs with schema v13, hooks, dependencies

## Phase 4 — Scenario Packs (Schema v13)
- [x] TutorialScenarioPure (new)
- [x] QuestScenarioPure (new)
- [x] CombatScenarioPure (new)
- [x] TopplerDemoPure — Physics + Collision + Time (genre: physics platform)
- [x] SpiritTamerDemoPure — Rhythm + Collision + Time (genre: rhythm taming)
- [ ] WitcherExplorerDemoPure — Navigation + Dialogue + Quests (genre: explorer)

Tag: `phase4-v13-scenarios`

### Phase 4 Completion Checklist
- [x] Scenario modules with run/dump operations
- [x] CLI harnesses for scenario execution
- [x] Sample scenarios and expected outputs
- [x] Golden tests for deterministic scenario runs
- [x] Asset injection hooks
- [x] Visual replay via RenderReplayPure

## Phase 5 — Codebase Cleanup & NPCsPure Regeneration (Schema v13)
- [x] NPCsPure (regenerated in TypeScript)
- [x] Unity artifacts cleanup
- [x] Duplicate files removal
- [x] CI pipeline verification

Tag: `phase5-v13-cleanup-complete`

### Phase 5 Completion Checklist
- [x] NPCsPure module with complete TypeScript implementation
- [x] Unity-specific directories removed (Assets/, Packages/, ProjectSettings/, UserSettings/)
- [x] Duplicate files deleted (LICENSE, Documents/ROADMAP.md)
- [x] Large unused assets removed (~9MB+ savings)
- [x] .gitignore updated to exclude Unity artifacts
- [x] CI pipeline verified and functional
- [x] All test files updated to use ts-node
- [x] No references to deleted files remain

## Phase 9 — Advanced Testing Infrastructure (Schema v1) ✅ COMPLETED
- [x] CLI Harness Test Refactoring — All golden tests use `testUtils.runCLI`
- [x] Type Safety Improvements — Fixed `RenderReplayPure` and `BridgeSchemaPure` type issues
- [x] CI/CD Build Fixes — Resolved TypeScript compilation errors
- [x] Testing Documentation — Comprehensive CLI testing guidelines in `TESTING.md`

Tag: `phase9-v1-testing-overhaul`

### Phase 9 Completion Checklist
- [x] Refactored 18 `golden*.test.ts` files to use `testUtils.runCLI`
- [x] Fixed `ERR_UNKNOWN_FILE_EXTENSION` errors in CLI test execution
- [x] Resolved TypeScript type mismatches in core modules
- [x] Excluded `miff-nextjs` from root TypeScript configuration
- [x] Added comprehensive CLI testing guidelines to `TESTING.md`
- [x] Documented best practices and troubleshooting for CLI tests
- [x] Verified CI workflow passes with `tsc --noEmit`
- [x] Improved test pass rate from 3 to 13+ test suites

## Completion Checklist
- [x] Managers with core logic: list/create/simulate/dump
- [x] CLI harnesses for each module
- [x] Sample JSON data per module
- [x] Golden-output tests validating core flows
- [x] READMEs with schema, CLI usage, remix hooks, dependencies
- [x] Roadmap updated and tagged

## Recent Phase Completions

### Phase 10 — Core Gameplay Systems ✅ COMPLETED
- [x] All 11 core gameplay modules scaffolded with CLI harnesses
- [x] Golden tests for deterministic behavior validation
- [x] Complete documentation and remix-safe hooks
- [x] Ready for contributor onboarding and integration

### Phase 12 — Quest & Asset Management ✅ COMPLETED  
- [x] QuestSystemPure with quest logic and progress tracking
- [x] AssetValidatorPure with compliance and remix-safety validation
- [x] Golden tests and comprehensive documentation
- [x] CLI harnesses for all operations

### Phase 13 — CI & Remix Safety ✅ COMPLETED
- [x] RemixAuditPure for module compliance scanning
- [x] CIEnforcerPure for contributor standards validation
- [x] Automated remix-safety compliance checking
- [x] Golden tests for audit and enforcement systems

### Phase 14 — Visual Replay & Testing ✅ COMPLETED
- [x] VisualReplaySystemPure for deterministic scenario replay
- [x] Enhanced AutoBuilderCLI with multi-platform support
- [x] Asset injection and build flow validation
- [x] Performance analysis and bottleneck identification

## Phase 6 — Engine Bridges (Schema v1)
- [x] UnityBridgePure (new)
- [x] WebBridgePure (new)
- [x] GodotBridgePure (new)
- [x] BridgeSchemaPure (new)

Tag: `phase6-v1-engine-bridges`

### Phase 6 Completion Checklist
- [x] Engine-specific bridge modules with render/simulate/interop operations
- [x] Unified BridgeSchemaPure for cross-engine compatibility
- [x] CLI harnesses for each bridge with engine-specific configurations
- [x] Golden tests for deterministic bridge output
- [x] READMEs with schema v1, engine integration notes, remix hooks

## Phase 7 — Visual Tools (Schema v1)
- [x] RenderReplayPure (new)
- [x] DebugOverlayPure (new)
- [x] BridgeInspectorPure (new)

Tag: `phase7-v1-visual-tools`

### Phase 7 Completion Checklist
- [x] Visual replay tool for renderData payloads
- [x] Debug overlay for real-time visualization
- [x] Bridge inspector for validation and analysis
- [x] CLI harnesses with export and configuration options
- [x] Golden tests for deterministic tool output

## Phase 8 — Documentation Site (Schema v1)
- [x] Comprehensive documentation site built with Astro
- [x] GitHub Pages deployment with automatic CI/CD
- [x] Auto-generated CLI documentation
- [x] Getting started guides and tutorials
- [x] Architecture and contributor documentation

Tag: `phase8-v1-documentation`

### Phase 8 Completion Checklist
- [x] Documentation site at https://miff-framework.github.io/miff
- [x] GitHub Actions workflow for automatic deployment
- [x] Complete getting started guides (install, simulate, replay, inspect)
- [x] Architecture documentation (modularity, engine-agnostic, remix-safety)
- [x] Contributor onboarding and licensing guides
- [x] Auto-generated CLI reference from harness files
- [x] Responsive design with dark mode support
- [x] SEO optimization and sitemap generation

## Phase 10 — Performance Profiling (Schema v1)
- [ ] Memory usage baselines
- [ ] Hot-path timers and budgets
- [ ] Profiling harness CLI

## Phase 11 — Auto Builder (Schema v1)
- [x] RenderPayloadPure — GameState to frames generator
- [x] ConvertToWebPure — CanvasRenderPlayer for HTML5
- [x] AutoBuilderCLI — Build demo.html from scenario pack

Tag: `phase11-v1-auto-builder`

## Phase 14 — Visual Replay & Testing Infrastructure (Schema v14)
- [x] VisualReplaySystemPure (v14) — Deterministic scenario replay with visual hooks
- [x] Enhanced AutoBuilderCLI — Multi-platform support with asset injection

Checklist:
- [x] Deterministic replay of game states and input streams
- [x] Visual hooks for engine-agnostic replay
- [x] Performance analysis and bottleneck identification
- [x] Multi-platform build support (Web, Unity, Godot)
- [x] Asset injection via AssetManifestPure
- [x] Golden tests for full build flow validation

Tag: `phase14-v1-visual-replay-complete`

## Phase 15 — Funding, Outreach & Global Deployment (Schema v15)
- [ ] Funding strategy and sustainability planning
- [ ] Global contributor outreach and community building
- [ ] Remix safety enforcement and compliance monitoring
- [ ] Multi-language documentation and localization
- [ ] Enterprise partnerships and commercial licensing

### Phase 15 Goals
- **Funding**: Secure sustainable funding for continued development
- **Outreach**: Build global community of contributors and users
- **Compliance**: Maintain remix safety across all modules and contributions
- **Localization**: Support multiple languages and regional markets
- **Partnerships**: Establish commercial partnerships for enterprise use

Tag: `phase15-v15-funding-outreach`

## Phase 12 — Custom Content & Asset Validation (Schema v13/14)
- [x] QuestModulePure (v13) — Parse/validate quest DSL; normalized objects
- [x] AssetManifestPure (v13) — Normalize manifests; remix-safe audit
- [x] QuestSystemPure (v14) — Quest logic, progress tracking, completion system
- [x] AssetValidatorPure (v14) — Asset bundle validation, remix-safe compliance

Checklist:
- [x] CLI harnesses: `quest`, `manifest`, `quest-system`, `asset-validator`
- [x] Golden fixtures for branching/timed quests and sprite/audio/bundle manifests
- [x] Remix-safe hooks for overrides and audit policies
- [x] Quest state management and event processing
- [x] Asset validation with license and platform compliance

## Phase 13 — CI Enforcement & Contributor Safety (Schema v14)
- [x] Type checks (tsconfig + tsconfig.test)
- [x] Golden tests on PR
- [x] CLI validation runs in CI
- [x] Remix audit gates for manifests
- [x] RemixAuditPure (v14) — Module compliance scanning and remix-safety validation
- [x] CIEnforcerPure (v14) — Contributor onboarding standards and CI validation

Checklist:
- [x] Automated remix-safety compliance checking
- [x] CI standards enforcement for all modules
- [x] Contributor onboarding validation
- [x] Golden tests for audit and enforcement systems

## Patch 3 — Physics & Time Systems (Schema v1) ✅ COMPLETED
- [x] PhysicsSystemPure — CLI harness, samples, golden test
- [x] CollisionSystemPure — CLI harness, samples, golden test
- [x] TimeSystemPure — CLI harness, samples, golden test

Tag: `phase3-v1-physics-complete`

## Patch 4 — Rendering & Bridge Converters (Schema v1) ✅ COMPLETED
- [x] RenderPayloadPure — Frame builder, CLI, golden tests
- [x] ConvertToUnityPure — Converter + CLI + golden tests
- [x] ConvertToWebPure — Converter + CLI + golden tests
- [x] ConvertToGodotPure — Converter + CLI + golden tests

Tag: `phase4-v1-rendering-complete`

## Contributor Onboarding
- Each module folder contains: Manager.ts, cliHarness.ts, sample_*.json, tests/golden*.test.ts, README.md
- Run harnesses with `npx ts-node` as shown in module READMEs
- Add new modules under schema v12+, keeping remix hooks isolated
- **📚 [Complete Contributor Guide](https://miff-framework.github.io/miff/contributors/onboarding)**
- **🌐 [Documentation Site](https://miff-framework.github.io/miff)**

// 🧩 MIFF Roadmap Extension: Modular Scaffolding + Genre Validation

## 🔧 Stage 1: Full Module Scaffolding

### 🎯 Goal  
Scaffold all core Pure modules needed to support three target genres. Each module must be:
- Engine-agnostic  
- Remix-safe  
- Scenario-testable  
- CI-validated with golden fixtures  

### 📦 Modules to Scaffold

| Category         | Module Name             | Purpose                                           |
|------------------|--------------------------|---------------------------------------------------|
| Core Systems     | PhysicsSystemPure        | Simulate forces, velocity, collisions             |
|                  | ProjectileSystemPure     | Spawn/update/despawn projectiles                 |
|                  | CollisionSystemPure      | Detect overlaps, trigger hit events              |
|                  | ScoreSystemPure          | Track player score                               |
|                  | HealthSystemPure         | Manage entity health and death                   |
| Input & Control  | InputSystemPure          | Unified input mapping                            |
|                  | CameraBridgePure         | Decoupled camera control                         |
| Rhythm Gameplay  | RhythmSystemPure         | Beat timing, input windows, combo logic          |
|                  | AudioBridgePure          | Abstract audio playback                          |
| Mount & Movement | MountSystemPure          | Entity mounting/dismounting                      |
| Adventure Logic  | DialogueSystemPure       | Branching dialogue, triggers, conditions         |
|                  | QuestSystemPure          | Track quest states and objectives                |
| Narrative Flow   | CutsceneSystemPure       | Scripted non-blocking sequences                  |
| Navigation       | NavigationSystemPure     | Pathfinding and movement goals                   |

Use CLI:  
```bash
miff scaffold module <ModuleName> --pure
```
## 🎮 Stage 2: Game-by-Game Build

Build one game at a time using only the scaffolded Pure modules.

### 🕹️ Game 1: Physics Shooter – *Toppler*

| Systems Used                          |
|--------------------------------------|
| PhysicsSystemPure, ProjectileSystemPure, CollisionSystemPure  
| ScoreSystemPure, HealthSystemPure, InputSystemPure  
| CameraBridgePure  

Steps:
- Write scenario harness: projectile → collision → score  
- Build CLI test suite  
- Scaffold Unity/WebGL adapter  
- Fetch free pixel-art assets  
- Deploy playable demo  

---

### 🎵 Game 2: Rhythm RPG – *Newhaven K-Pop Exorcist*

| Systems Used                          |
|--------------------------------------|
| RhythmSystemPure, AudioBridgePure, ScoreSystemPure  
| HealthSystemPure, DialogueSystemPure, CutsceneSystemPure  
| InputSystemPure  

Steps:
- Write beat-timing scenario harness  
- Validate combo logic and health impact  
- Integrate audio events  
- Build visual adapter  
- Deploy playable demo  

---

### 🗺️ Game 3: Open-World Adventure – *Witcher-style Explorer*

| Systems Used                          |
|--------------------------------------|
| NavigationSystemPure, MountSystemPure, DialogueSystemPure  
| QuestSystemPure, CameraBridgePure, InputSystemPure  

Steps:
- Write mount → navigate → dialogue → quest scenario  
- Validate branching logic  
- Build adapter and UI overlays  
- Deploy playable demo  

---

## ✅ Final Deliverables

- Three genre demos with free assets  
- CI coverage, remix-ready docs  
- Foundation for Auto-Builder CLI
