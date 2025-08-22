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

Tag: `phase4-v13-scenarios`

### Phase 4 Completion Checklist
- [x] Scenario modules with run/dump operations
- [x] CLI harnesses for scenario execution
- [x] Sample scenarios and expected outputs
- [x] Golden tests for deterministic scenario runs

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

## Completion Checklist
- [x] Managers with core logic: list/create/simulate/dump
- [x] CLI harnesses for each module
- [x] Sample JSON data per module
- [x] Golden-output tests validating core flows
- [x] READMEs with schema, CLI usage, remix hooks, dependencies
- [x] Roadmap updated and tagged

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

## Next Phases (high level)
- Phase 9: Advanced Tooling — Performance profiling, debugging tools
- Phase 10: Community Features — Plugin system, marketplace

## Contributor Onboarding
- Each module folder contains: Manager.ts, cliHarness.ts, sample_*.json, tests/golden*.test.ts, README.md
- Run harnesses with `npx ts-node` as shown in module READMEs
- Add new modules under schema v12+, keeping remix hooks isolated
- **📚 [Complete Contributor Guide](https://miff-framework.github.io/miff/contributors/onboarding)**
- **🌐 [Documentation Site](https://miff-framework.github.io/miff)**