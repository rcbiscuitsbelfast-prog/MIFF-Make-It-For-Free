# MIFF: Godot Integration and Export Roadmap (Q4 2025)

## Overview
This document captures the module inventory, test status, Godot integration plan, sampler uplift, and packaging/export strategy for Web and Android (AAB/APK).

## Current Status
- Tests: 117/121 suites passed, 638/643 tests, 4 skipped (local in-band Jest).
- Phase 13 modules with golden tests: ProceduralWorldPure, MeshFactoryPure, TextureSynthPure, NodeGraphPure.
- Vite/Vitest upgraded; sampler build harness present.

## Module Inventory (selected)
- Core gameplay: AvatarSystemPure, CombatCorePure, Quests*, PathfindingPure, StatusEffectsPure, StatsSystemPure, XPLevelingPure, InventoryPure, CraftingPure, EconomyPure, RewardsPure, MovementPure, TimeSystemPure, InputSystemPure.
- Bridges & schema: RenderPayloadPure, GodotBridgePure, WebBridgePure, UnityBridgePure, CameraBridgePure, AudioBridgePure, BridgeSchemaPure.
- Procedural/content: ProceduralWorldPure, MeshFactoryPure, TextureSynthPure, NodeGraphPure.
- Simulation/visual: PhysicsSystemPure, CollisionSystemPure, VisualItemEventPure, RenderReplayPure, VisualReplaySystemPure.
- Orchestration/demos: SpiritTamerDemoPure, TopplerDemoPure, WitcherExplorerDemoPure, TutorialScenarioPure.
- Tooling/validation: ValidationPure, AssetManifestPure, AssetValidatorPure, RemixAuditPure, LicenseAuditPure, CIEnforcerPure, TestHarnessPure, PerfMetricsPure.

## Godot Integration Plan
- Canonical frame: RenderPayloadPure -> GodotBridgePure for scene updates.
- Tick order: Input -> Status/Effects -> Movement/Physics -> Combat -> Quests/Story -> Render.
- Determinism: RNGPure + SyncManagerPure; replay via RenderReplayPure.
- Content: ProceduralWorldPure -> tilemaps/meshes; MeshFactoryPure -> glTF/vertices; TextureSynthPure -> Base64; orchestrate via NodeGraphPure.
- HUD/audio: HUDPure overlays via annotations; AudioBridgePure to Godot busses.

### Immediate Actions
1) Expand GodotBridgePure adapters (materials/textures, tilemap/navmesh, cameras, input mapping).
2) Add bridge contract golden tests using recorded RenderPayload frames.
3) Integrate ProceduralWorldPure outputs into Godot tilemap + PathfindingPure nav.

## Sampler Website Uplift
- Launcher embedding Godot HTML5 export; run scenarios (TutorialScenarioPure, SpiritTamerDemoPure).
- Scenario Loader UI (JSON + seed) with DebugOverlayPure.
- Asset prewarm via AssetManifestPure; validate with ValidationPure.

## Additional Modules To Add
- Mobile UX: HapticsPure, TouchGesturePure, PermissionsPure.
- Optional: AnalyticsPure, MonetizationPure (privacy-first defaults).
- Cloud: CloudSavePure (SaveLoad sync).
- Scene: SceneStatePure (snapshot/restore scenes).
- L10n/Accessibility: LocalizationPure, AccessibilityPure.
- Packaging: ExportWebPure, ExportAndroidPure.

## Android Packaging Plan (AAB/APK)
- ExportAndroidPure
  - CLI: `export:android --preset Release --aab --keystore @env:KEYSTORE --alias @env:ALIAS --ks-pass @env:KSPASS --key-pass @env:KEYPASS`.
  - Validate SDK/NDK/Java, Godot templates, versioning.
- GitHub Actions
  - Godot 4 headless + export templates, cache Gradle/SDK.
  - Use secrets for signing; upload AAB/APK artifacts; optional Play upload.
- Godot project
  - Minimal project with JS bridge to ingest RenderPayloadPure; presets for HTML5/Android.

## Web Packaging Plan
- ExportWebPure + workflow to emit HTML5 builds with preload manifests; deploy to Pages/Netlify/Vercel.

## Milestones
- M1: GodotBridge tests, ProceduralWorld->Tilemap, sampler launcher (HTML5).
- M2: ExportWebPure workflow + deploy.
- M3: ExportAndroidPure + manual CI; signed AAB.
- M4: Mobile UX modules integration.

## Risks
- SDK/toolchain setup; signing key management.
- Determinism across replay/bridge layers.
- Asset pipeline performance (web textures/meshes).

## Rollback
- Feature branches per module; revert workflows if instability occurs.