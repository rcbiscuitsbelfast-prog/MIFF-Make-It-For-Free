# MIFF: Make It For Free

[![Sampler Live](https://img.shields.io/badge/Sampler%20Live-purple)](https://rcbiscuitsbelfast-prog.github.io/MIFF-Make-It-For-Free/site/index.html)
[![MIFF Studio](https://img.shields.io/badge/MIFF%20Studio%20Builder-blue)](https://rcbiscuitsbelfast-prog.github.io/MIFF-Make-It-For-Free/site/studio/index.html)
[![CI Status](https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free/actions/workflows/ci-cd.yml)

MIFF is a modular, engine‑agnostic, CLI‑first game framework for building, remixing, and exporting games across Web, Unity, and Godot. It is designed for both programmers and non‑coders, with a focus on remix‑safe content and prompt‑driven creation.

— Modular. Remix‑Safe. Prompt‑Driven.

## Overview

- **What it is**: A library of self‑contained “Pure” modules (combat, dialogue, physics, quests, etc.), a simple CLI, and a static site with live samplers.
- **Who it’s for**: Indie devs, students, educators, modders, and AI agents.
- **What it does**: Compose modules, run CLIs to simulate or export, and ship to Web or bridge to Unity/Godot.

## Getting Started (5 minutes)

1) Install prerequisites
```bash
npm install
```

2) Run your first demo (no coding)
```bash
node cli/test-cli.cjs --demo toppler
```

3) Explore live samplers
- Sampler Landing: `https://rcbiscuitsbelfast-prog.github.io/MIFF-Make-It-For-Free/site/index.html`
- MIFF Studio Builder: `https://rcbiscuitsbelfast-prog.github.io/MIFF-Make-It-For-Free/site/studio/index.html`

4) Next steps (optional)
- Run tests: `npm test`
- Try a CLI harness: `npx ts-node miff/pure/CombatPure/cliHarness.ts`

## Features & Capabilities

- Modular “Pure” systems: Combat, Dialogue, Rhythm, Physics, Save/Load, Quests, Teams, Effects, Lore, RNG, etc.
- Export targets: Web (HTML), Unity bridge, Godot bridge.
- Deterministic replay and golden tests for stability.
- Remix‑safe by design: curated CC0/GPL/public‑domain assets and audit modules.
- Samplers and scenarios for quick playtesting.

## Documentation & Links

- Docs home: `docs/README.md`
- Testing guide: `docs/TESTING.md`
- Roadmap: `ROADMAP_UPDATE.md`
- CLI quick start: `cli/README.md`
- Module docs (per‑module): see `miff/pure/**/README.md`
- Website docs: `docs/site/README.md`

## For Non‑Coders: Remix Without Writing Code

- Use the live Sampler and Studio to preview and tweak modules/themes.
- Replace assets under `miff/assets/` (keep licenses remix‑safe) and refresh the page.
- Use `cli/test-cli.cjs` to run demos with custom parameters.
- Export to Web HTML with presets (see docs site) — no build tools required.

## Project Structure (high level)

```
miff/
  pure/                 # Engine-agnostic modules (each has README + CLI)
  assets/               # Remix-safe art/audio/fonts
cli/                    # CLI tools (compiled + sources)
docs/                   # Documentation site and guides
site/                   # Static sampler site
tests/                  # Golden and integration tests
```

## Contributing (friendly and practical)

We welcome contributions from both coders and non‑coders.

- Read `docs/CONTRIBUTOR_GUIDE.md` and `docs/CONTRIBUTOR_ONBOARDING.md`.
- Keep modules engine‑agnostic and deterministic. Add or update golden tests.
- Document remix hooks in each module’s `README.md`.
- Ensure assets remain remix‑safe and credited in `miff/assets/README.md`.

Quick start for developers:
```bash
git clone https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free.git
cd MIFF-Make-It-For-Free
npm install
npm test
```

## License

Dual‑license model:
- GNU Affero General Public License v3.0 (AGPLv3)
- Commercial license (see `LICENSE.md`)

All bundled assets are remix‑safe (CC0, GPL, or public domain).

## Transparency & Tone

We aim to be humble, transparent, and contributor‑friendly. MIFF is a living project: modules ship when they are deterministic, documented, and remix‑safe. See `COMPLETE_MODULE_AUDIT.md` and audit reports in the repo root for details.

## Appendix: Popular Modules

- `CombatPure`, `DialogueSystemPure`, `RhythmSystemPure`, `EffectsPure`, `SavePure`, `TeamsPure`, `SpiritsPure`, `BattleLoopPure`, `RewardsPure`, `InputPure`, `EventBusPure`, `LogPure`, `MagicSystemPure`, `CameraSystemPure`, `DrivingSystemPure`, `TeleportationSystemPure`, `WeatherSystemPure`.

For AI agents and maintainers, see `README.AI.md`.
