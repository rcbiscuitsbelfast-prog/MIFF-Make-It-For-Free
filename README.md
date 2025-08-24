# MIFF: Make It For Free

**© R.C. Biscuits. All rights reserved. Generated using AI tools under user direction.**

## 🧭 MIFF Framework — Modular, Remix-Safe Game Development

**MIFF** is a modular, remix-safe, multi-platform game framework designed for rapid iteration and contributor empowerment. Built with engine-agnostic modules that can be composed into complete games across Unity, Web, and Godot platforms.

> Originally forked from [original repo name], MIFF has been rebuilt for remix safety, contributor empowerment, and AI-driven modularity.  
> All legacy contributions are preserved in commit history. The framework now follows a dual-license model (AGPLv3 + commercial).

📦 Installation: [miffgamemain.vercel.app/getting-started/install](https://miffgamemain.vercel.app/getting-started/install)  
🧑‍💻 Contributor Onboarding: [miffgamemain.vercel.app/contributors/onboarding](https://miffgamemain.vercel.app/contributors/onboarding)

Maintainer: **R.C. Biscuits**  
Visionary architect of MIFF — building a global, remixable ecosystem for modular game creation.

## 🎯 What's Included

### 🧩 Core Systems
- **[ProjectileSystemPure](systems/ProjectileSystemPure/README.md)** - Projectile physics and lifecycle management
- **[ScoreSystemPure](systems/ScoreSystemPure/README.md)** - Score tracking and event processing
- **[HealthSystemPure](systems/HealthSystemPure/README.md)** - Health management and damage events
- **[InputSystemPure](systems/InputSystemPure/README.md)** - Input mapping and processing
- **[CameraBridgePure](systems/CameraBridgePure/README.md)** - Camera control and following
- **[RhythmSystemPure](systems/RhythmSystemPure/README.md)** - Beat timing and rhythm logic
- **[AudioBridgePure](systems/AudioBridgePure/README.md)** - Audio playback and control
- **[MountSystemPure](systems/MountSystemPure/README.md)** - Entity mounting and movement
- **[DialogueSystemPure](systems/DialogueSystemPure/README.md)** - Branching dialogue system
- **[CutsceneSystemPure](systems/CutsceneSystemPure/README.md)** - Scripted sequence control
- **[NavigationSystemPure](systems/NavigationSystemPure/README.md)** - Pathfinding and movement

### 🔗 Engine Bridges
- **[UnityBridgePure](UnityBridgePure/README.md)** - Unity integration and rendering
- **[WebBridgePure](WebBridgePure/README.md)** - Web/HTML5 platform support
- **[GodotBridgePure](GodotBridgePure/README.md)** - Godot engine integration
- **[BridgeSchemaPure](BridgeSchemaPure/README.md)** - Unified cross-engine schema

### 🎮 Scenario Packs
- **[TopplerDemoPure](TopplerDemoPure/README.md)** - Physics platformer demo
- **[SpiritTamerDemoPure](SpiritTamerDemoPure/README.md)** - Rhythm taming game
- **[WitcherExplorerDemoPure](WitcherExplorerDemoPure/README.md)** - Open-world adventure

### 🛠️ CLI Tools & Builders
- **[AutoBuilderCLI](AutoBuilderCLI/README.md)** - Multi-platform game builder
- **[RenderPayloadPure](RenderPayloadPure/README.md)** - GameState to frame converter
- **[ConvertToWebPure](ConvertToWebPure/README.md)** - Web platform converter
- **[ConvertToUnityPure](ConvertToUnityPure/README.md)** - Unity platform converter
- **[ConvertToGodotPure](ConvertToGodotPure/README.md)** - Godot platform converter

### 🔍 Audit & Validation Modules
- **[QuestSystemPure](systems/QuestSystemPure/README.md)** - Quest logic and progress tracking
- **[AssetValidatorPure](systems/AssetValidatorPure/README.md)** - Asset validation and compliance
- **[RemixAuditPure](systems/RemixAuditPure/README.md)** - Module compliance and remix-safety
- **[CIEnforcerPure](systems/CIEnforcerPure/README.md)** - Contributor standards and CI validation
- **[VisualReplaySystemPure](systems/VisualReplaySystemPure/README.md)** - Deterministic replay with visual hooks

### 📊 Legacy & Core Modules
- **[InventoryPure](InventoryPure/README.md)** - Inventory management system
- **[SaveLoadPure](SaveLoadPure/README.md)** - Save/load functionality
- **[QuestsPure](QuestsPure/README.md)** - Quest system (legacy)
- **[NPCsPure](NPCsPure/README.md)** - NPC management
- **[CombatPure](CombatPure/README.md)** - Combat system
- **[StatsSystemPure](StatsSystemPure/README.md)** - Character statistics
- **[SkillTreePure](SkillTreePure/README.md)** - Skill progression
- **[CraftingPure](CraftingPure/README.md)** - Crafting system
- **[LootTablesPure](LootTablesPure/README.md)** - Loot generation
- **[EconomyPure](EconomyPure/README.md)** - Economic systems

---

[![MIFF CI](https://github.com/miff-framework/miff/actions/workflows/miff-ci.yml/badge.svg)](https://github.com/miff-framework/miff/actions/workflows/miff-ci.yml)

**🌐 [Documentation Site](https://miff-framework.github.io/miff)** | **📚 [Contributor Guide](https://miff-framework.github.io/miff/contributors/onboarding)**

Modular, engine‑agnostic, CLI‑first game framework

Started with a Retro-style 2D RPG engine and became a set of engine-agnostic, CLI-first gameplay modules for rapid iteration.

## Requirements

- Node.js 18+ (for CLI harnesses)  
- Optional runtime adapters (choose what you need):
  - Unity 2021.3+
  - Modern browser (Web)
  - Godot 4.2+

## CLI-First Modules

Each module comes with a self-contained CLI harness under the repository root. Run with ts-node:

- QuestsPure: `npx ts-node --compiler-options '{"module":"commonjs"}' QuestsPure/cliHarness.ts QuestsPure/sample_quest_npc.json 1234`
- InventoryPure: `npx ts-node --compiler-options '{"module":"commonjs"}' InventoryPure/cliHarness.ts InventoryPure/sample_commands.json`
- CreaturesPure: `npx ts-node --compiler-options '{"module":"commonjs"}' CreaturesPure/cliHarness.ts CreaturesPure/sample_commands.json`
- LorePure: `npx ts-node --compiler-options '{"module":"commonjs"}' LorePure/cliHarness.ts LorePure/sample_commands.json`
- SettingsPure: `npx ts-node --compiler-options '{"module":"commonjs"}' SettingsPure/cliHarness.ts SettingsPure/sample_init.json SettingsPure/sample_commands.json`
- AudioMixerPure: `npx ts-node --compiler-options '{"module":"commonjs"}' AudioMixerPure/cliHarness.ts AudioMixerPure/sample_commands.json`
- WorldEnhancementsPure: `npx ts-node --compiler-options '{"module":"commonjs"}' WorldEnhancementsPure/cliHarness.ts WorldEnhancementsPure/sample_commands.json`
- WorldLayoutPure: `npx ts-node --compiler-options '{"module":"commonjs"}' WorldLayoutPure/cliHarness.ts WorldLayoutPure/sample_commands.json`
- MovementPure: `npx ts-node --compiler-options '{"module":"commonjs"}' MovementPure/cliHarness.ts MovementPure/sample_commands.json`
- XPLevelingPure: `npx ts-node --compiler-options '{"module":"commonjs"}' XPLevelingPure/cliHarness.ts XPLevelingPure/sample_commands.json`
- CombatPure: `npx ts-node --compiler-options '{"module":"commonjs"}' CombatPure/cliHarness.ts CombatPure/sample_commands.json`
- SaveLoadPure: `npx ts-node --compiler-options '{"module":"commonjs"}' SaveLoadPure/cliHarness.ts SaveLoadPure/tests/sample_commands.json SaveLoadPure/tests/save_state.json`
- EquipmentPure: `npx ts-node --compiler-options '{"module":"commonjs"}' EquipmentPure/cliHarness.ts EquipmentPure/sample_equipment.json EquipmentPure/tests/commands.json`
- AIProfilesPure: `npx ts-node --compiler-options '{"module":"commonjs"}' AIProfilesPure/cliHarness.ts AIProfilesPure/sample_profiles.json AIProfilesPure/tests/commands.json`
- NPCsPure (Python): coming soon

New tools:
- QuestModulePure: `npx ts-node cli/quest.ts systems/QuestModulePure/fixtures/branching.quest`
- AssetManifestPure: `npx ts-node cli/manifest.ts systems/AssetManifestPure/fixtures/sprites.json`
- AutoBuilderCLI: `npx ts-node AutoBuilderCLI/cli.ts TopplerDemoPure --fps 24 --debug --out toppler.html`

See `Documents/Remix_Review_V3.md` for a full assessment including coverage and gaps.

## 📖 Documentation

- **🌐 Documentation Site**: https://miff-framework.github.io/miff
- **🚀 Getting Started**: https://miffgamemain.vercel.app/getting-started/install
- **🎮 Simulate Tool**: https://miff-framework.github.io/miff/getting-started/simulate
- **🎬 Replay Tool**: https://miff-framework.github.io/miff/getting-started/replay
- **🔍 Inspect Tool**: https://miff-framework.github.io/miff/getting-started/inspect
- **📚 Contributor Guide**: https://miffgamemain.vercel.app/contributors/onboarding

## 🚀 Project Status

**Current Phase**: Phase 15 - Visual Replay & Testing ✅ **COMPLETED**

**Recent Milestones**:
- 🧪 CLI Harness Test Refactoring (18+ modules updated)
- 🔧 Type Safety & Build Fixes (TypeScript compilation resolved)
- 📚 Comprehensive Testing Documentation
- 📦 Golden Fixtures for Deterministic Testing
- 🎮 Core Gameplay Systems (11 modules scaffolded)
- 🔍 Quest & Asset Management (2 modules completed)
- 🛡️ CI & Remix Safety (2 audit modules completed)
- 🎬 Visual Replay & Testing (1 system completed)

**What's Next**:
- Phase 16: Funding, Outreach & Global Deployment

**📋 [View Full Roadmap](ROADMAP.md)** - Complete development phases and progress tracking

### Patch Status

- Patch 3 (PhysicsSystemPure, CollisionSystemPure, TimeSystemPure): ✅ Completed, CLIs and golden tests passing
- Patch 4 (Rendering & Bridge Modules — RenderPayloadPure, ConvertToUnityPure, ConvertToWebPure, ConvertToGodotPure): ✅ Completed, CLIs and golden tests passing

## Remix Hooks

See each module README for `Remix Hooks` sections describing override points and safe extension guidelines.

### Remix-Safe Disclaimer

- MIFF ships without proprietary assets or IP.  
- Modules are engine-agnostic and data-driven.  
- Forks and remixes should maintain modular boundaries and avoid embedding closed assets.

## License

This project is offered under a dual-license model:
- GNU Affero General Public License v3.0 (AGPLv3)
- Commercial license (contact per LICENSE.md)

See LICENSE.md for full terms.

## MIFF Sampler Overview

1. Purpose
- The MIFF Sampler is a mobile-first showcase of modular zones built with Pure systems.
- It demonstrates puzzle, combat, narrative, and debug flows using remix-safe assets and fixtures.

2. Structure
- `sampler/main.js`: Entry point
- `sampler/zones/`: Contains Toppler, Spirit Tamer, Witcher Grove, Synth Nexus, and Remix Lab
- `sampler/scenarios/`: Fixture files for each zone
- `sampler/assets/`: Free, audit-safe sprites, audio, and fonts

3. How to Run
- Call `startSampler()` from `sampler/main.js` to launch Synth Nexus
- Tap zone buttons to navigate
- Use Remix Lab to toggle debug mode and replay fixtures

4. How to Contribute
- Add new zones using Pure modules only
- Use fixture files for validation
- Keep all assets remix-safe (CC0 or GPL)
- Export `startZone()` from each zone file

5. Validation
- Use CLI harnesses to replay fixtures and run golden tests
- Zones must pass Remix Mode and mobile-first layout checks
