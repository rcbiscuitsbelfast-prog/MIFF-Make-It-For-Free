# Module Inventory Report

**Date:** October 16, 2025  
**Location:** miff/pure/

---

## Summary

### Total Module Count: **179 directories**

**Breakdown:**
- **Pure Modules:** 168 (game systems, engines, managers)
- **Demo Modules:** 7 (example implementations)
- **Support Directories:** 2 (shared utilities, demos folder)

**Total Functional Modules:** 175

---

## Pure Modules (168)

These are the core MIFF framework modules:

- AdvancedRenderingPure
- AIProfilesPure
- AIPure
- AssetManifestPure
- AssetValidatorPure
- AudioBridgePure
- AudioMixerPure
- AudioPure
- AvatarAssetRegistryPure
- AvatarRendererGodotPure
- AvatarRendererWebPure
- AvatarSystemPure
- BattleAIPure
- BattleLoopPure
- BlockBuilderPure
- BridgeInspectorPure
- BridgeSchemaPure
- ButtonStylePure
- CameraBridgePure
- CameraSystemPure
- ChainManagerPure
- ChainValidatorPure
- ChallengesPure
- CharacterGeneratorPure
- CIEnforcerPure
- ClueSystemPure
- CollisionSystemPure
- CombatCorePure
- CombatPure
- CombatScenarioPure
- ConvertToGodotPure
- ConvertToUnityPure
- ConvertToWebPure
- CraftingPure
- CreaturesPure
- CutScenePure
- CutsceneSystemPure
- DebugOverlayPure
- DialogPure
- DialoguePure
- DialogueSystemPure
- DrivingSystemPure
- EconomyPure
- EffectsPure
- EncounterPure
- EntityLinkerPure
- EquipmentPure
- EventBusPure
- EventsPure
- EvolutionPure
- ExportAndroidPure
- ExportWebPure
- FusionPure
- GameMenuPure
- GodotBridgePure
- HapticsPure
- HealthSystemPure
- HUDPure
- IdleSystemPure
- InputPure
- InputSystemPure
- InteractableRegistryPure
- InventoryPure
- ItemsPure
- JointAnimPure
- LicenseAuditPure
- LogPure
- LootTablesPure
- LorePure
- MagicSystemPure
- MeshFactoryPure
- MiffAttributionPure
- ModdingPure
- MountSystemPure
- MovementPure
- NavigationSystemPure
- NetworkBridgePure
- NodeGraphPure
- NPCsPure
- ObstacleCoursePure
- OverlayFXPure
- OverlinkPure
- PartyPure
- PathfindingPure
- PerfMetricsPure
- PerfPure
- PermissionsPure
- PetCollectionPure
- PhysicsSystemPure
- PixelAnimPure
- PixelDrawPure
- PixelGenPure
- PlatformBridgePure
- PlayerStatePure
- PrefabBuilderPure
- ProceduralWorldPure
- ProfilerPure
- ProgressionPure
- ProjectileSystemPure
- QuestModulePure
- QuestScenarioPure
- QuestsPure
- QuestSystemPure
- QuestTimelinePure
- RacingSystemPure
- RaidSystemPure
- RemixAuditPure
- RemixModePure
- RemixTaggingPure
- RenderPayloadPure
- RenderReplayPure
- RenderWorldPure
- RestaurantSimulationPure
- RewardsPure
- RhythmChallengePure
- RhythmSystemPure
- RitualSystemPure
- RNGPure
- SaveLoadPure
- SavePure
- SceneBuilderPure
- ScoreSystemPure
- SessionManifestPure
- SettingsPure
- SharedSchemaPure
- SimpleGamePure
- SkeletonAnimatorPure
- SkillTreePure
- SlicePure
- SnapBuilderPure
- SocialDeductionPure
- SpiritsPure
- SpiritTamerDemoPure
- SplashScreenPure
- SportsSystemPure
- StartMenuPure
- StatsSystemPure
- StatusEffectsPure
- StorySystemPure
- SurvivalSystemPure
- SyncManagerPure
- SyncPure
- TeamsPure
- TeleportationSystemPure
- TestHarnessPure
- TextureSynthPure
- ThemeParkPure
- TimelineSystemPure
- TimeSystemPure
- TopplerDemoPure
- TouchGesturePure
- TutorialScenarioPure
- TycoonSystemPure
- UnityBridgePure
- UnrealBridgePure
- ValidationPure
- VisualItemEventPure
- VisualReplaySystemPure
- WeatherSystemPure
- WebBridgePure
- WebSocketBridgePure
- WebSocketServerPure
- WitcherExplorerDemoPure
- WorldEnhancementsPure
- WorldLayoutPure
- WorldManifestPure
- XPLevelingPure
- ZoneServerPure

---

## Demo Modules ($DEMO_MODULES)

Example implementations showcasing module usage:

- RenderPayloadPure
- SaveLoadPure
- spirit-tamer-demo
- SpiritTamerDemoPure
- toppler-demo
- TopplerDemoPure
- WitcherExplorerDemoPure

---

## Module Categories

### Core Systems
- EventBusPure, EventsPure
- SceneBuilderPure
- PhysicsPure
- RenderWorldPure

### Game Systems
- CombatPure
- QuestSystemPure
- DialogueSystemPure
- InventorySystemPure
- AchievementsPure

### Gameplay
- IdleSystemPure
- TycoonSystemPure
- PetCollectionPure
- SkillTreePure

### AI & Behavior
- AIPure
- TeamBehaviorPure
- NPCSystemPure

### Utilities
- SaveLoadPure
- LocalizationPure
- AudioPure
- InputSystemPure

### Integration
- UnrealBridgePure
- ExportPipelinePure

---

## Error Distribution

Based on current analysis (1,135 total errors):

**Top 10 Error-Heavy Modules:**
1. PetCollectionPure/Manager.ts - 54 errors
2. ExportPipelinePure.ts - 54 errors
3. CutScenePure/cli.ts - 49 errors
4. RenderWorldPure/index.ts - 46 errors
5. WitcherExplorerDemoPure/index.ts - 45 errors
6. UnrealBridgePure/UnrealSceneBuilderPure.ts - 41 errors
7. TycoonSystemPure/Manager.ts - 34 errors
8. SlicePure/index.ts - 33 errors
9. SpiritTamerDemoPure/index.ts - 32 errors
10. AIPure/Manager.ts - 30 errors

**Modules with Zero Errors:**
- IdleSystemPure ✅ (recently fixed)

---

## Module Health Status

### Healthy (0 errors)
- IdleSystemPure ✅

### Needs Attention (1-20 errors)
- Estimated: ~80 modules

### Major Issues (20-50 errors)
- Estimated: ~15 modules

### Critical (50+ errors)
- PetCollectionPure - 54 errors
- ExportPipelinePure - 54 errors
- CutScenePure - 49 errors
- RenderWorldPure - 46 errors (in progress)
- WitcherExplorerDemoPure - 45 errors

---

*Generated: October 16, 2025*  
*Total Modules: Pure ($PURE_MODULES) + Demos ($DEMO_MODULES) = $((PURE_MODULES + DEMO_MODULES))*
