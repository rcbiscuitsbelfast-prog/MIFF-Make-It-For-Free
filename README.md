# MIFF: Make It For Free

Engine-agnostic modular game development framework for building games that work across Web, Unity, and Godot.

[![CI Status](https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free/actions/workflows/ci-core.yml/badge.svg)](https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free/actions/workflows/ci-core.yml)

---

## What It Is

A library of self-contained game system modules (combat, dialogue, physics, quests, etc.), a CLI toolkit, and static web demos. The framework is designed for modularity and cross-platform compatibility.

**Current State:**
- 234 Pure modules implemented
- 1,393 test files
- 0 npm security vulnerabilities
- Active development

---

## Quick Start

1. **Install dependencies**
```bash
npm install
```

2. **Run tests**
```bash
npm test
```

3. **Try a demo**
```bash
node cli/test-cli.cjs --demo toppler
```

4. **Explore modules**
```bash
npx ts-node miff/pure/CombatPure/cliHarness.ts
```

---

## Project Status

**Current Phase:** Infrastructure improvements in progress

See [STATUS.md](STATUS.md) for current metrics and [ROADMAP.md](ROADMAP.md) for timeline.

**Quick Links:**
- [Latest Audit](docs/audit/historical/MIFF_COMPREHENSIVE_SUPER_AUDIT_2025_10_15.md) - October 15, 2025
- [Module Index](docs/MIFF_MODULE_INDEX_2025.md) - 234 modules catalogued
- [Recovery Plan](docs/plans/recovery/MIFF_PHASED_RECOVERY_PLAN_2025_10_15.md) - 6-phase improvement plan
- [Build Plan](docs/plans/MIFF_PHASED_BUILD_PLAN_2025_10_15.md) - Multi-platform build system

---

## Features

**Core Systems:**
- Combat, dialogue, quests, physics
- Save/load, inventory, teams
- AI, pathfinding, effects
- Audio, camera, input handling
- Magic, spirits, rhythm mechanics

**Supported Platforms:**
- Web (HTML/JavaScript export)
- Unity (C# bridge modules)
- Godot (GDScript bridge modules)

**Testing:**
- Golden tests for determinism
- 1,393 test files
- Integration and unit tests

---

## Documentation

**Essential:**
- [Getting Started Guide](docs/README.md)
- [Module Index](docs/MIFF_MODULE_INDEX_2025.md) - All 234 modules
- [Status & Metrics](STATUS.md)
- [Roadmap](ROADMAP.md)

**Audits & Reports:**
- [Latest Comprehensive Audit](docs/audit/historical/MIFF_COMPREHENSIVE_SUPER_AUDIT_2025_10_15.md) (Oct 15, 2025)
- [Latest Professional Audit](docs/audit/latest/MIFF_ULTIMATE_AUDIT_2025.md)
- [All Audits](docs/audit/)

**Plans:**
- [Recovery Plan](docs/plans/recovery/MIFF_PHASED_RECOVERY_PLAN_2025_10_15.md)
- [Build Plan](docs/plans/MIFF_PHASED_BUILD_PLAN_2025_10_15.md)
- [Implementation Plan](docs/plans/MIFF_IMPLEMENTATION_PLAN_2025.md)

**For Contributors:**
- [Contributor Onboarding](docs/CONTRIBUTOR_ONBOARDING_GUIDE.md)
- [Contributor Guide](docs/CONTRIBUTOR_QUICK_START.md)
- [Community Guidelines](docs/COMMUNITY_GUIDELINES.md)

---

## Web Demos

Live examples hosted on GitHub Pages:

- [Main Site](https://rcbiscuitsbelfast-prog.github.io/MIFF-Make-It-For-Free/)
- [Sampler](https://rcbiscuitsbelfast-prog.github.io/MIFF-Make-It-For-Free/site/sampler/)
- [Studio](https://rcbiscuitsbelfast-prog.github.io/MIFF-Make-It-For-Free/studio/)
- [RenderWorld](https://rcbiscuitsbelfast-prog.github.io/MIFF-Make-It-For-Free/renderworld/)

---

## Project Structure

```
miff/
  pure/                 # Engine-agnostic modules
  assets/               # Game assets (remix-safe)
cli/                    # CLI tools and harnesses
docs/                   # Documentation
site/                   # Web demos
tests/                  # Test suites
```

---

## Module Categories

**Core Game Systems (28 modules):**
Combat, dialogue, quests, inventory, save/load, teams, effects, rewards, battle loop, input, event bus, logging

**AI & ML (12 modules):**
Pathfinding, behavior trees, decision making, procedural generation, machine learning integration

**Physics & Simulation (15 modules):**
Physics, collision, driving, teleportation, navigation, movement

**Audio & Visual (10 modules):**
Audio, camera, weather, magic effects, spirits, rhythm

**Data & Infrastructure (20 modules):**
RNG, time, config, schema, sync, localization, analytics

**Platform Bridges (8 modules):**
Unity bridge, Godot bridge, Web bridge, transport layers

**UI & Rendering (12 modules):**
HUD, menus, overlays, rendering, texture synthesis

See [Module Index](docs/MIFF_MODULE_INDEX_2025.md) for complete list with implementation details.

---

## Contributing

Contributions welcome from both coders and non-coders.

**For Developers:**
1. Read [Contributor Guide](docs/CONTRIBUTOR_QUICK_START.md)
2. Check [Active Issues](https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free/issues)
3. Follow module patterns (see existing modules)
4. Add tests for all changes
5. Maintain engine-agnostic design

**Quick Setup:**
```bash
git clone https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free.git
cd MIFF-Make-It-For-Free
npm install
npm test
```

---

## Module List

Popular modules: `CombatPure`, `DialogueSystemPure`, `RhythmSystemPure`, `EffectsPure`, `SavePure`, `TeamsPure`, `SpiritsPure`, `BattleLoopPure`, `RewardsPure`, `InputPure`, `EventBusPure`, `LogPure`, `MagicSystemPure`, `CameraSystemPure`, `DrivingSystemPure`, `TeleportationSystemPure`, `WeatherSystemPure`, `PathfindingPure`, `InventoryPure`, `QuestsPure`, `AIPure`, `PhysicsPure`

For complete list: [Module Index](docs/MIFF_MODULE_INDEX_2025.md)

---

## For AI Agents

See [README.AI.md](README.AI.md) for AI integration guide and architectural patterns.

---

## License

Dual license:
- GNU Affero General Public License v3.0 (AGPLv3)
- Commercial license available

Assets are remix-safe (CC0, GPL, or public domain). See `LICENSE.md` for details.

---

## Links

- **Repository:** https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free
- **Documentation:** [docs/README.md](docs/README.md)
- **Status:** [STATUS.md](STATUS.md)
- **Roadmap:** [ROADMAP.md](ROADMAP.md)
- **Issues:** https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free/issues
