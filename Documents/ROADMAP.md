# Roadmap

## ✅ Completed Systems

- InventoryPure
- QuestsPure
- NPCsPure
- ZonesPure
- CodexPure
- SaveMigration
- SaveLoadPure (v1 core)
- XPLevelingPure (v1 core)
- EquipmentPure (v1 core)
- AIProfilesPure (v1 core)
- DialogManager
- InventoryManager
- QuestManager
- SaveManager
- ZoneManager
- CodexManager

> Note: Current schema version is v11 (SaveLoadPure). CLI-first modules are preferred for rapid iteration and engine-agnostic design.

---

## Phased Rollout v2.1

### Phase 1: Core Gameplay
- StatsSystemPure: base character stats + CLI
- SkillTreePure: unlockable skills graph
- CombatCorePure: turn/real-time engine
- StatusEffectsPure: buff/debuff pipeline
- PathfindingPure: grid & navmesh CLI hooks

### Phase 2: Narrative & UI
- DialogueChoicePure: branching convo CLI
- CutscenePure: timeline + keyframe API
- TutorialPure: guided walkthrough scaffolds
- LocalizationPure: text + asset lookup
- UIFrameworkPure: layout + skinning CLI

### Phase 3: Services & Infrastructure
- EventBusPure: pub/sub messaging
- InputMappingPure: rebindable controls
- AnalyticsPure: event tracking CLI
- ValidationPure: data schema checks
- TestHarnessPure: unit/integration CLI
- LoggingPure: runtime diagnostics
- PluginManagerPure: dynamic module loader

### Phase 4: Asset Pipeline
- AssetManifestPure: metadata registry
- TextureAtlasPure: sprite packing CLI
- SpriteSheetPure: animation serialiser
- AudioManagerPure: track mixer + loader

### Phase 5: Optional Features
- NPCsPure: AI agent shell
- FusionPure: entity-component tools
- AchievementsPure: milestone rewards
- LeaderboardPure: scoreboards API
- CloudSavePure: remote persistence
- InAppPurchasePure: transaction flow
- SocialIntegrationPure: share/invite hooks
- ProfilerPure: perf metrics dashboard
- AccessibilityPure: UI/UX a11y toolkit

### Phase 6: Engine Bridges
- UnityBridgePure: C# adapter layer
- UnrealBridgePure: C++/Blueprint hooks
- GodotBridgePure: GDScript API
- CreationEngineBridgePure: bespoke engine port
- WebGLBridgePure: browser runtime layer

---

## Optional vs Core
- Phases 1–4 are core pillars for gameplay, UX, and dev velocity.
- Phase 5 modules are optional extras; adopt as needed per project scope.
- Phase 6 provides bridge layers for specific engines and targets.

## Notes
- All modules are designed to be remix-safe, engine-agnostic, and testable via CLI harnesses.
- Keep migrations in lockstep with schema bumps; prefer non-destructive transforms.
- Prioritize golden-output tests for deterministic verification where feasible.

## Commit and Tag Conventions
- Commit messages: `feat(<module> vN): <summary>` or `chore(<topic>): <summary>`
- Tags: `<module>-vN-core` for module milestones; `roadmap-v<major.minor>` for roadmap updates
- Example: `chore(roadmap): expand phases, add asset pipeline, optional modules, engine bridges`