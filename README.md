# MIFF: Make It For Free

## 🧭 MIFF Framework — Modular, Remix-Safe Game Development

This project is now maintained as **MIFF**, a modular, engine-agnostic framework stewarded by **R.C. Biscuits**.

> Originally forked from [original repo name], MIFF has been rebuilt for remix safety, contributor empowerment, and AI-driven modularity.  
> All legacy contributions are preserved in commit history. The framework now follows a dual-license model (AGPLv3 + commercial).

📦 Installation: [miffgamemain.vercel.app/getting-started/install](https://miffgamemain.vercel.app/getting-started/install)  
🧑‍💻 Contributor Onboarding: [miffgamemain.vercel.app/contributors/onboarding](https://miffgamemain.vercel.app/contributors/onboarding)

Maintainer: **R.C. Biscuits**  
Visionary architect of MIFF — building a global, remixable ecosystem for modular game creation.

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

See `Documents/Remix_Review_V3.md` for a full assessment including coverage and gaps.

## 📖 Documentation

- **[🌐 Documentation Site](https://miff-framework.github.io/miff)** - Complete guides, API reference, and examples
- **[🚀 Getting Started](https://miffgamemain.vercel.app/getting-started/install)** - Installation and setup guide
- **[🎮 Simulate Tool](https://miff-framework.github.io/miff/getting-started/simulate)** - Scenario testing and validation
- **[🎬 Replay Tool](https://miff-framework.github.io/miff/getting-started/replay)** - Visual replay and debugging
- **[🔍 Inspect Tool](https://miff-framework.github.io/miff/getting-started/inspect)** - Bridge validation and analysis
- **[📚 Contributor Guide](https://miffgamemain.vercel.app/contributors/onboarding)** - How to contribute to MIFF

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
