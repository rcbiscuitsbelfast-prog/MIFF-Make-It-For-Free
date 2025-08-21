# MIFF Game Platform — Newhaven (Pre‑Alpha)

Modular, remix‑safe spirit battle platform built code‑first and engine‑agnostic. The initial scope is the Newhaven zone to validate core systems (AI, team management, battle effects, progression). A 3rd‑person open‑world expansion is a future phase, not part of the current milestone.

## Principles

- Modular, decoupled scaffolding with clear interfaces and adapters
- Remix‑safe data and assets; avoid franchise IP
- Engine‑agnostic runtime; no Unity dependency required
- Gameplay polish and player experience take priority
- One small branch per scaffold/update

## Status

- Pre‑alpha. Documentation scaffolding and roadmap are in place.
- Runtime scaffolding will land incrementally (see Roadmap for milestones).

See `ROADMAP.md` for prioritized tasks and milestone tracking.

## Current Scaffolded Systems

- Documentation: roadmap, contribution guidance, branch policy
- Project direction: Newhaven‑first scope and expansion vision
- Synced engine‑agnostic modules (see `miff/`): AI, effects, teams, items, lore, quests, spirits dex utils, sync, challenges, evolution (partial), NPCs (data + interaction), fusion (rules + harness)

Note: Core runtime modules (battle loop, AI, encounters, team management, save/load, input abstraction, UI adapters) are being implemented next in focused branches.

## Newhaven Gameplay Loops

- In progress for M0: text‑first battle loop prototype (deterministic, seedable)
- Planned for M1+: overworld encounters and party management loop

Until M0 completes, there is no playable runtime in this repo. Contributions should target the scaffolding defined in `ROADMAP.md`.

## Next Steps for Development

1. Land data schemas (spirits, moves, effects, items, encounters) with validation
2. Implement battle loop: turn manager, action queue, damage/status formulas
3. Add baseline AI policy with pluggable evaluators
4. Implement team/party management and encounter controller for Newhaven
5. Introduce save/load (versioned JSON + migrations) and input abstraction
6. Provide text‑first UI surfaces and a CLI test harness

Details and acceptance criteria are tracked in `ROADMAP.md`. Module statuses live in `miff/README.md`.

## Phase Checklist (High‑Level)

- M0: Data + battle loop (CLI, text‑only)
- M1: Encounters + party management (Newhaven)
- M2: Progression + status effects + rewards
- M3: Remix‑safe assets + adapter stubs
- M4: Polishing + QA + contributor docs

## Future Expansion (Vision)

- Open‑world 3rd‑person RPG layer (navigation, camera, streaming world)
- Adapter‑based render/audio implementations (Unity/Godot/Web) kept out‑of‑tree
- Modding APIs and content packaging for community extensions

## Contributing

- Create a new branch per change: `docs/*`, `feat/*`, `refactor/*`, `fix/*`
- Keep modules decoupled and testable; prefer interfaces and adapters
- Add fixtures and seeds for deterministic tests

## License

Licensed under the MIT License. See `LICENSE`.

### Content and IP

Only include remix‑safe, original assets and data. Do not include third‑party IP.

All placeholder assets in `assets/` are original, remix‑safe scaffolds contributed under a CC0‑equivalent intent (public domain). Replace or extend freely.