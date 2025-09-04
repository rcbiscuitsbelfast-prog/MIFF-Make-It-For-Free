# MIFF: Make It For Free  
[![Sampler Live](https://img.shields.io/badge/Sampler%20Live-purple)](https://rcbiscuitsbelfast-prog.github.io/MIFF-Make-It-For-Free/)  
[![MIFF CI](https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free/actions/workflows/miff-ci.yml/badge.svg)](https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free/actions/workflows/miff-ci.yml)  
[![Audit](https://img.shields.io/badge/Audit-Sep_2025-green)](docs/audit/MIFF_Audit_2025-09.md)

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

### Access the Web Interface
```bash
# Start the development server
cd site && python3 -m http.server 8000
# Or open directly: site/index.html
```

### Run Game Zones
```bash
# Test individual zones
cd zones/witcher_grove && npm test
cd zones/toppler && npm test
```

---

## 🏗️ Project Structure

MIFF has been refactored for better modularity and contributor onboarding:

```
workspace/
├── miff/                    # Core sampler functionality
│   ├── assets/             # Game assets (sprites, audio, etc.)
│   ├── scenarios/          # Test fixtures and scenarios
│   ├── replay/             # Replay and testing tools
│   ├── scripts/            # Build and utility scripts
│   └── pure/               # 102 Pure modules (engine-agnostic)
│       ├── AIProfilesPure/ # AI and profiling systems
│       ├── CombatPure/     # Combat mechanics
│       ├── DialogPure/     # Dialogue systems
│       ├── InventoryPure/  # Inventory management
│       └── [98 more...]    # Complete modular toolkit
├── site/                   # Web interface and routing
│   ├── zones/              # Zone-specific web pages
│   └── dashboard/          # Main dashboard
├── zones/                  # Game zone implementations
│   ├── witcher_grove/      # Witcher Grove zone
│   ├── spirit_tamer/       # Spirit Tamer zone
│   ├── toppler/            # Toppler physics game
│   └── remix_lab/          # Debug and remix tools
└── [Other modules]         # CLI tools, builders, and utilities
```

**📚 [Contributor Guide](docs/CONTRIBUTOR_GUIDE.md)** - Learn how to contribute and add new zones/drops!

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

See the [Contributor Guide](https://miffgamemain.vercel.app/contributors/onboarding) for full onboarding. New? Try the [Onboarding Challenge](docs/ONBOARDING_CHALLENGE.md).

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

## 🚀 Roadmap

### ✅ Phase 17: CLI Orchestration & Module Stabilization (Complete)
- 6 modules CLI-stable and orchestration-ready
- CLI orchestration hooks implemented across core modules
- Federation CLI scaffolded and operational
- Comprehensive onboarding packs and documentation complete
- TypeScript compilation stability achieved

### 🔜 Phase 18: Federation Hooks & Orchestration Expansion
- **Persistent scenario replay** - Multi-module replay chains
- **Contributor federation guide** - Enhanced onboarding workflows  
- **Legacy module stabilization** - Resolve remaining integration issues
- **Orchestration expansion patterns** - Add federation to CombatPure, InventoryPure, QuestSystemPure

### 🧪 Phase 19+: Scenario Registry & Remix-Safe Expansion
- **Modular scenario registry** - Dynamic scenario loading and management
- **Remix-safe contributor workflows** - Streamlined contribution patterns
- **Persistent world federation** - Cross-session state management
- **AI agent integration** - Multi-agent orchestration using federation hooks

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

**Current Phase**: Phase 17 - CLI Orchestration & Module Stabilization ✅ **COMPLETED**

## 🧩 Current Module Scope

MIFF currently includes **102 Pure modules** in the `miff/pure/` directory, with **6 CI-stable modules** featuring full CLI orchestration:

### Phase 17 CLI-Stable Modules
- **ModdingPure** - Plugin loading, asset bundling, hot-reload
- **DialoguePure** - Branching dialogue engine with variables/flags  
- **VisualReplaySystemPure** - Deterministic visual replay and testing
- **BridgeSchemaPure** - Cross-engine schema validation (Unity/Web/Godot)
- **AudioPure** - Spatial audio system with dynamic mixing
- **NetworkBridgePure** - Multiplayer networking with rollback netcode

Each supports standardized CLI orchestration, deterministic replay, and comprehensive contributor onboarding.

> ⚠️ **Note**: While MIFF contains 102+ modules with various levels of implementation, the current Phase 17 focus stabilized 6 core modules for orchestration. Future phases will incrementally enhance additional subsystems with CLI orchestration and federation support.

**Phase 17 Achievements**:
- 🔗 **6 modules now CLI-stable and orchestration-ready**
- 🛠️ **Standardized CLI operations**: `init`, `teardown`, `replay`, `export` across all modules
- 📚 **Complete onboarding documentation**: Individual guides for each module with examples
- 🔄 **Federation framework**: Multi-module orchestration and persistent scenario replay
- ✅ **CI integration**: `test:phase17` script and pipeline validation

**Recent Milestones**:
- 🎯 Phase 17 CLI Orchestration (6 modules stabilized: ModdingPure, DialoguePure, VisualReplaySystemPure, BridgeSchemaPure, AudioPure, NetworkBridgePure)
- 🧪 CLI Harness Test Refactoring (18+ modules updated)
- 🔧 Type Safety & Build Fixes (TypeScript compilation resolved)
- 📚 Comprehensive Testing Documentation & Onboarding Packs
- 📦 Golden Fixtures for Deterministic Testing
- 🎮 Core Gameplay Systems (11 modules scaffolded)
- 🔍 Quest & Asset Management (2 modules completed)
- 🛡️ CI & Remix Safety (2 audit modules completed)
- 🎬 Visual Replay & Testing (1 system completed)

**What's Next**:
- **Phase 18**: Federation Hooks & Orchestration Expansion
  - Persistent scenario replay across multiple modules
  - Legacy integration stabilization (Jest configuration, DialoguePure unit tests)
  - Orchestration expansion to CombatPure, InventoryPure, QuestSystemPure
  - Enhanced contributor federation workflows

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
- 
## 🧪 Scenario Suite & Modular Playtesting (Phase 16 Prep)

MIFF now includes a fully scaffolded suite of **modular, remix-safe scenarios**, each defined as standalone `.ts` files using `ScenarioPure`. These scenarios are genre-agnostic, engine-agnostic, and ready for orchestration by AI agents or runtime loaders.

### ✅ Scenario Highlights
- **Ember Pact** – Ritual crafting and faction dynamics  
- **Labyrinth of Unspoken Truths** – Puzzle traversal and memory resets  
- **Council of the Fractured Banner** – Reputation and multi-NPC coordination  
- **Dream of Hollow Vale** – Layered realities and memory gating  
- **Stormbound Expanse** – Survival under dynamic weather  
- **Vault of the Three Sigils** – Environmental puzzle progression  
- **Loop Beneath Larkspire** – Time loops and causality  
- **Song of the Silent Bell** – Audio puzzles and tonal sequencing  
- **Harvest Under the Red Moon** – Crafting and weather-based gathering  
- **Mirror of Many Paths** – Branching realities and identity choices  

All scenarios are stored in `/scenarios/` and indexed for future hot-loading and runtime simulation.

### 🧩 What’s Being Scaffolded Now
- `ScenarioRegistry.ts` – for indexing and runtime loading  
- `ScenarioRunnerPure.ts` – for dry-run simulation and logic testing  
- `scenario-metadata.json` – for AI agents to sort, preview, and orchestrate  
- `summaries/` – markdown files describing each scenario’s themes and subsystems  
- `reload-hooks.md` – ideas for hot-loading and live scenario swapping  
- `tags-and-lore.json` – remix hooks and mythic fragments for scenario expansion  

These additions prepare MIFF for **multi-agent orchestration**, **live playtesting**, and **contributor remixing**—without requiring manual wiring. Cursor and Claude will handle integration once runtime orchestration is enabled.

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
- `zones/`: Contains Toppler, Spirit Tamer, Witcher Grove, Synth Nexus, and Remix Lab
- `miff/scenarios/`: Fixture files for each zone
- `miff/assets/`: Free, audit-safe sprites, audio, and fonts

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
- [ ] Create a new file in `zones/` named `your_zone.js`
- [ ] Export a `startZone()` function
- [ ] Use only Pure modules (no engine dependencies)

📦 Fixture File
- [ ] Create a matching fixture in `miff/scenarios/your_zone.fixture.json`
- [ ] Include tap sequence and expected state transitions
- [ ] Validate with `npm run test:golden`

🎨 Assets
- [ ] Add sprites, audio, and fonts to `miff/assets/`
- [ ] Use only remix-safe licenses (CC0, GPL, or public domain)
- [ ] Document asset sources in `miff/assets/README.md`

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
- Sampler Landing: `site/index.html`
- Replay Harness: `sampler/replay/index.html`
- Onboarding Index: `site/onboarding-index.html`
 - CLI Scripts:
  - Golden fixtures: `npm run test:golden`
  - Remix validation: `npm run test:remix`

## 🚀 Milestone: v0.1.0 — Orchestrated & Remix-Ready
- Spirit Tamer integrated
- CI workflows passed
- Multi-agent playtesting ready

## 🧰 Quickstart
```
npm install && npm run typecheck
npm run start:grove && npm run play:spirit
```

### Spirit Tamer: Trial of the Grove (Quickstart)

- Mapping:
  - Fixture: `miff/scenarios/witcher_grove.fixture.json`
  - Zone: `zones/witcher_grove/`
- Playtesting:
  - Open `sampler/replay/index.html` and load the Witcher Grove fixture, or
  - Run `npm run start:grove` to auto-open the Witcher Grove zone via Vite
- Remix safety:
  - Keep assets under `miff/assets/` with CC0/GPL sources
  - Use Pure modules only for logic; avoid engine dependencies

## 🤝 Contributing

We welcome contributions! The project has been refactored for better contributor onboarding:

- **📚 [Contributor Guide](docs/CONTRIBUTOR_GUIDE.md)** - Complete guide to contributing
- **🎮 Add New Zones** - Create new game experiences using Pure modules
- **🔧 Add New Drops** - Contribute engine-agnostic game systems
- **📖 Improve Docs** - Help others understand and use MIFF

### **Quick Start**
```bash
# Fork and clone the repository
git clone https://github.com/your-username/MIFF-Make-It-For-Free.git

# Install dependencies
npm install

# Run tests
npm test

# Start developing!
npm run start:grove
```

See the [Contributor Guide](docs/CONTRIBUTOR_GUIDE.md) for detailed instructions!
