# MIFF Game Platform Roadmap — Newhaven Focus

Guiding principles:

- Modular, decoupled scaffolding
- Remix-safe assets and data
- Engine-agnostic (no Unity dependency) via adapters
- Gameplay-first polish and UX clarity

## Status Snapshot (Pre‑Alpha)

- Documentation scaffolding established (this roadmap, updated README)
- Runtime scaffolding pending: first passes land next in small, focused branches
- Scope: Single contained zone (Newhaven) to validate core systems and loops

## Priorities

### Now (Newhaven vertical slice)

- Data schemas: Spirits, Moves, Effects, Items, Encounters (JSON + validation)
- Battle core: turn manager, action queue, deterministic RNG injection, damage + status formulas, effect resolution ordering
- AI baseline: simple rule/priority system with pluggable evaluators
- Team management: roster, active party, swaps, faint/KO flow, revive/heal hooks
- Encounters: overworld triggers, weighted tables, level ranges, scripted beats
- Save/Load: versioned JSON snapshots, migration rules, checksum
- Input abstraction: keyboard/controller mapping, rebindable, device-agnostic
- UX scaffolds: text-first battle log, state HUD model, event bus for UI
- Test harness/CLI: simulate battles, seedable for reproducibility

### Next

- Progression: XP/level curves, learnsets, unlock tables, drop/loot rules
- Status/VFX abstraction: event-to-effect mapping with adapter interface
- Audio events: SFX/Music bus and event names, adapter interface
- Quest/events: lightweight objectives and triggers for Newhaven beats
- Tooling: data lints, schema docs, fixtures, golden tests
- Adapters: thin Unity/Godot/Web renderer bridges (optional, out-of-tree)

### Later

- Open-world 3rd‑person expansion (navigation, camera, streaming terrain)
- Network/Co‑op experiments
- Modding APIs and content packaging

## Game Status

### Code Work Remaining

- Define JSON schemas and validators for core data types
- Implement battle loop (initiative, selection, resolution, end conditions)
- Implement status effects (timers, stacking, immunity, cleansing)
- Implement AI policy interface and a baseline policy set
- Implement encounter controller and Newhaven encounter tables
- Implement team/party systems; swaps, fainting, rewards
- Implement save/load with migrations and integrity checks
- Implement input abstraction and event bus
- Build text-first UI surfaces for battle and overworld messages
- Create CLI test runner and golden test suite
- Performance pass on hot paths (damage calc, AI eval)

### Asset Completion / Integration

- Zone map: Newhaven tilemap (remix-safe), collision, triggers
- Spirit sprites/portraits (placeholder-friendly pack)
- Move/FX spritesheets and particles (adapter-ready)
- UI skin: minimal remix-safe HUD elements and fonts
- SFX: hits, UI, ambient Newhaven loop
- Music: Newhaven theme and battle theme
- Packaging: licensing metadata and credits

## Milestones

- [ ] M0: Data + battle loop prototype (CLI, text-only)
- [ ] M1: Newhaven encounters + party management
- [ ] M2: Status effects + rewards/progression
- [ ] M3: Remix-safe assets pass + adapter stubs (render/audio)
- [ ] M4: Polishing pass, QA scenarios, docs for contributors

## Branching & Contribution

- One branch per scaffold/update: docs/, feat/, refactor/, fix/
- Keep modules decoupled; prefer interfaces and adapters
- Land small, testable slices; include seeds and fixtures

