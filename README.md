# MIFF: Make It For Free  
[![Sampler Live](https://img.shields.io/badge/Sampler%20Live-purple)](https://rcbiscuitsbelfast-prog.github.io/MIFF-Make-It-For-Free/)  
[![CI Status](https://github.com/miff-framework/miff/actions/workflows/miff-ci.yml/badge.svg)](https://github.com/miff-framework/miff/actions/workflows/miff-ci.yml)

## 💸 Support MIFF

- [Open Collective – MIFF Collective](https://opencollective.com/miff-collective)
- [Ko-fi – Make It For Free](https://ko-fi.com/miffmakeitforfree#setGoalModal)

**Modular. Remix-Safe. Built with Prompts.**

MIFF is a CLI-first, engine-agnostic game development framework designed for creators of all skill levels—including those with no coding experience. Every module is self-contained, remixable, and validated for compliance, making it easy to build, test, and deploy games across Unity, Web, and Godot.

Created by **R.C. Biscuits** using prompt-driven development and AI-assisted scaffolding, MIFF is more than a framework—it's a movement for accessible, remix-safe game creation.

---

## ✨ Features

- 🧩 Modular gameplay systems (combat, dialogue, rhythm, quests, etc.)  
- 🔗 Engine bridges for Unity, Web, and Godot  
- 🛠️ CLI tools for building and testing  
- 🎮 Scenario packs with playable demos  
- 🔍 Audit modules for remix safety and compliance  
- 📦 Remix-safe assets (CC0, GPL, public domain)  
- 📚 Contributor onboarding with zero friction  

---

## 📦 Modules Overview

### Core Systems
| Module | Description |
|--------|-------------|
| `ProjectileSystemPure` | Projectile physics and lifecycle |
| `HealthSystemPure` | Damage, healing, and health tracking |
| `DialogueSystemPure` | Branching conversations |
| `RhythmSystemPure` | Beat-based gameplay |
| `CutsceneSystemPure` | Scripted sequences |
| `NavigationSystemPure` | Pathfinding and movement |

### Engine Bridges
| Module | Description |
|--------|-------------|
| `UnityBridgePure` | Unity integration |
| `WebBridgePure` | Browser support |
| `GodotBridgePure` | Godot engine compatibility |
| `BridgeSchemaPure` | Unified schema for cross-engine use |

### CLI Tools
| Tool | Purpose |
|------|--------|
| `AutoBuilderCLI` | Build games for Web, Unity, or Godot |
| `RenderPayloadPure` | Convert game state to visual frames |
| `ConvertToWebPure` | Web platform converter |
| `ConvertToUnityPure` | Unity platform converter |
| `ConvertToGodotPure` | Godot platform converter |

### Audit & Validation
| Module | Purpose |
|--------|--------|
| `RemixAuditPure` | Remix safety and modular boundaries |
| `AssetValidatorPure` | Asset license and format checks |
| `CIEnforcerPure` | Contributor standards and CI validation |
| `VisualReplaySystemPure` | Deterministic replay with visual hooks |

---

## 🚀 Getting Started

### Requirements
- Node.js 18+  
- Optional runtime adapters:
  - Unity 2021.3+
  - Modern browser (Web)
  - Godot 4.2+

### Installation
```bash
npm install
```

### Run a CLI Harness
```bash
npx ts-node systems/DialogueSystemPure/cliHarness.ts fixtures/sample_dialogue.json
```

### Build a Demo
```bash
npx ts-node AutoBuilderCLI/cli.ts TopplerDemoPure --fps 24 --debug --out toppler.html
```

---

## 🧪 Try the Sampler

Play the live demo:  
👉 [MIFF Sampler on GitHub Pages](https://rcbiscuitsbelfast-prog.github.io/MIFF-Make-It-For-Free/)

Includes:
- Toppler (physics platformer)  
- Spirit Tamer (rhythm game)  
- Witcher Grove (open-world zone)  
- Remix Lab (debug and replay tools)

---

## 🤝 Contributing

MIFF is built for remixing. To add a new zone or module:

1. Fork the repo  
2. Use only Pure Modules (no engine dependencies)  
3. Add fixtures and assets under `sampler/`  
4. Validate with CLI harnesses and golden tests  
5. Submit a pull request with clear documentation

See the [Contributor Guide](https://miffgamemain.vercel.app/contributors/onboarding) for full onboarding.

---

## 📜 License

MIFF uses a dual-license model:
- GNU Affero General Public License v3.0 (AGPLv3)
- Commercial license (contact per LICENSE.md)

All assets are remix-safe (CC0, GPL, or public domain).  
See `LICENSE.md` for full terms.

---

## 🌍 Vision & Roadmap

> **Ask MIFF AI for a game—and it builds the demo.**  
> Downloadable. Remixable. Ready to expand.

The long-term goal is to integrate MIFF with an AI companion that can:
- Generate playable game demos from natural language prompts  
- Scaffold zones, assets, and logic using Pure Modules  
- Package the result for Web, Unity, or Godot  
- Ensure remix safety and compliance automatically  
- Offer instant onboarding for contributors and educators

### Current Phase:  
✅ Phase 15 — Visual Replay & Testing

### Next Phase:  
🚀 Phase 16 — Funding, Outreach & Global Deployment

📋 [View Full Roadmap](ROADMAP.md)

---

## 📚 Resources

- 🌐 [Documentation Site](https://miff-framework.github.io/miff)  
- 🚀 [Getting Started](https://miffgamemain.vercel.app/getting-started/install)  
- 🎬 [Replay Tool](https://miff-framework.github.io/miff/getting-started/replay)  
- 🔍 [Inspect Tool](https://miff-framework.github.io/miff/getting-started/inspect)  
- 📚 [Contributor Guide](https://miffgamemain.vercel.app/contributors/onboarding)- **[HealthSystemPure](systems/HealthSystemPure/README.md)** - Health management and damage events
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

## Adding a New Zone to MIFF Sampler

🧩 Zone Setup
- [ ] Create a new file in `sampler/zones/` named `your_zone.js`
- [ ] Export a `startZone()` function
- [ ] Use only Pure modules (no engine dependencies)

📦 Fixture File
- [ ] Create a matching fixture in `sampler/scenarios/your_zone.fixture.json`
- [ ] Include tap sequence and expected state transitions
- [ ] Validate with `npm run test:golden`

🎨 Assets
- [ ] Add sprites, audio, and fonts to `sampler/assets/`
- [ ] Use only remix-safe licenses (CC0, GPL, or public domain)
- [ ] Document asset sources in `sampler/assets/README.md`

🧪 Remix Mode
- [ ] Support Remix Mode toggle (debug overlays, CLI triggers)
- [ ] Confirm layout works on mobile and desktop

🔁 Routing
- [ ] Include a back button to return to Synth Nexus
- [ ] Use `ZoneSystemPure` for navigation

📚 Documentation
- [ ] Add a comment header to your zone file explaining its purpose and modules used
- [ ] Update the README with your zone name and description

Keep everything modular, remix-safe, and contributor-friendly. Zones should be playable, testable, and easy to remix.

## MIFF Sampler Quick Links
- Sampler Landing: `sampler/site/index.html`
- Replay Harness: `sampler/replay/index.html`
- Onboarding Index: `sampler/site/onboarding-index.html`
- CLI Scripts:
  - Golden fixtures: `npm run test:golden`
  - Remix validation: `npm run test:remix`

### Spirit Tamer: Trial of the Grove (Quickstart)

- Mapping:
  - Fixture: `sampler/scenarios/witcher_grove.fixture.json`
  - Zone: `sampler/zones/witcher_grove/`
- Playtesting:
  - Open `sampler/replay/index.html` and load the Witcher Grove fixture, or
  - Run `npm run start:grove` to auto-open the Witcher Grove zone via Vite
- Remix safety:
  - Keep assets under `sampler/assets/` with CC0/GPL sources
  - Use Pure modules only for logic; avoid engine dependencies
