# MIFF Game Platform Roadmap — Newhaven Focus

Guiding principles:

- Modular, decoupled scaffolding
- Remix-safe assets and data
- Engine-agnostic (no Unity dependency) via adapters
- Gameplay-first polish and UX clarity
- Small, testable branches; prompt-driven scaffolding

## Status Snapshot (Pre‑Alpha)

- Documentation scaffolding established (this roadmap, updated README)
- Runtime scaffolding pending: first passes land next in focused branches
- Scope: Single contained zone (Newhaven) to validate core systems and loops

### Current Progress Checklist

- [x] Branching policy adopted (one branch per scaffold/update)
- [x] Roadmap v2 (this document) with phases and checklists
- [x] README aligned to Newhaven scope and non‑Unity stance
- [ ] Data schema stubs drafted with validation strategy
- [ ] CLI harness skeleton (seedable, deterministic)
- [ ] Battle turn manager prototype

---

## Phased Gameplay Roadmap (with Checklists)

Each phase lists Code Scaffolding and Asset Integration separately, and shows how systems link to gameplay loops.

### M0 — Data + Battle Loop (text‑only CLI)

Goal: Deterministic, seedable battle simulation proving core combat.

- Code Scaffolding
  - [ ] Data Schemas (JSON + validation)
    - [ ] `Spirit` (id, stats, types/tags, learnset refs)
    - [ ] `Move` (id, category, power, accuracy, cost, tags)
    - [ ] `StatusEffect` (id, duration, stacking, immunity tags)
    - [ ] `Item` (id, type, effect hooks)
    - [ ] `EncounterTable` (zone, weights, level ranges)
    - [ ] JSON schema + validator and fixtures
  - [ ] Battle Core
    - [ ] Turn manager and phases (pre, select, resolve, end)
    - [ ] Action queue with speed/priority ordering
    - [ ] Deterministic RNG provider (seed injectable)
    - [ ] Damage formula and type/resistance hooks
    - [ ] Status/effect resolution order and timing
    - [ ] Win/lose/escape conditions
  - [ ] AI Baseline
    - [ ] Rule evaluators (hp threshold, type advantage, PP/cost, kill‑secure)
    - [ ] Simple priority model with weights
    - [ ] Fallback/timeout to safe action
  - [ ] CLI/Test Harness
    - [ ] Start battle with seed, dump battle log
    - [ ] Golden tests for canonical matchups
    - [ ] Performance timing on hot paths
- Asset Integration (optional at M0)
  - [ ] None required; use text logs and mock data
- Loop Linkage
  - battle → reward placeholder → heal placeholder

### M1 — Encounters + Party Management (Newhaven Overworld Loop)

Goal: Trigger battles via Newhaven encounter tables, manage party swaps and KO.

- Code Scaffolding
  - [ ] Encounter Controller
    - [ ] Trigger types (grass/zone/time scripted hooks)
    - [ ] Weighted selection and level scaling
  - [ ] Team/Party Management
    - [ ] Roster and active party slots
    - [ ] Swap/KO/faint handling and post‑battle heal hook
    - [ ] Reward grant stub (currency/item/xp placeholder)
  - [ ] Save/Load v1
    - [ ] Versioned JSON snapshot + checksum
    - [ ] Migration scaffold
  - [ ] Input Abstraction
    - [ ] Rebindable actions; keyboard/controller mapping model
  - [ ] Minimal UI model
    - [ ] State HUD model (hp/status/turn) decoupled from renderer
- Asset Integration
  - [ ] Newhaven zone layout (remix‑safe placeholder tilemap spec)
  - [ ] Encounter table data files
  - [ ] Basic HUD text templates
- Loop Linkage
  - overworld → encounter → battle → reward → heal → roam

### M2 — Progression + Status Effects + Rewards

Goal: Progress feels meaningful; effects impact strategy; basic loot.

- Code Scaffolding
  - [ ] Progression
    - [ ] XP curves, level‑up, learnset unlocks
    - [ ] Evolution conditions framework (level, item, quest flag)
  - [ ] Status Effects
    - [ ] Buff/debuff stack rules (flat/percent, additive/multiplicative)
    - [ ] Timers (turns/seconds) and dispel/cleanse hooks
    - [ ] Immunity and overwrite rules
  - [ ] Rewards
    - [ ] Currency/items/xp distribution
    - [ ] Drop tables and rarity weights
  - [ ] Lore/Codex hooks
    - [ ] Unlock entries on discover/defeat/evolve
- Asset Integration
  - [ ] Placeholder icons for effects and items
  - [ ] Basic codex entries for Newhaven spirits and landmarks
- Loop Linkage
  - battle → reward → level up → learn move → evolve → codex

### M3 — Remix‑Safe Assets + Adapter Stubs (Render/Audio)

Goal: Minimal presentation layer via adapters; still engine‑agnostic.

- Code Scaffolding
  - [ ] Render Adapter Interface
    - [ ] HUD binding layer; health bars, status badges, dialog
    - [ ] Event bus → UI adapter mapping
  - [ ] Audio Adapter Interface
    - [ ] SFX/Music events and categories
    - [ ] Seeded variation for repeated actions
  - [ ] Data Tooling
    - [ ] Lints, schema docs, fixtures, golden tests
- Asset Integration
  - [ ] Remix‑safe sprite placeholders (spirits/moves/UI skin)
  - [ ] SFX set (UI, hit, ambient Newhaven loop)
  - [ ] Music stubs (Newhaven, battle)
- Loop Linkage
  - same loops, with presentational feedback

### M4 — Polishing, QA Scenarios, Contributor Docs

Goal: Smooth interactions, clear feedback, robust contributor onboarding.

- Code Scaffolding
  - [ ] Performance pass (damage calc, AI eval)
  - [ ] Edge‑case handling and error surfaces
  - [ ] Test scenario library and CLI UX
- Asset Integration
  - [ ] Accessiblity review of HUD text size/contrast (adapter‑level)
  - [ ] Audio mix balance
  - [ ] Credits/licensing metadata
- Loop Linkage
  - stable, well‑messaged loops with failure/retry clarity

### Later (Post‑Newhaven)

- Open‑world 3rd‑person expansion (navigation, camera, streaming terrain)
- Network/Co‑op experiments
- Modding APIs and content packaging

---

## System ↔ Gameplay Loop Linkage Map

- battle core → reward → progression → evolution → lore/codex
- encounters → battle → reward → heal → roam → encounters
- team management → battle choices (swap) → status effects → outcomes
- save/load → continuity across loops
- adapters (render/audio) → feedback for all loops

---

## Code Work Remaining (Detailed)

- Data: schemas, validators, fixtures, migrations
- Battle: phases, queueing, RNG, formulas, effects ordering
- AI: evaluators, priority/weights, fallback safety
- Team: roster, swaps, KO, revive/heal hooks
- Encounters: triggers, weighted tables, level scaling
- Progression: XP, learnsets, evolution conditions
- Rewards: currency/items/xp, drop tables
- Status Effects: stacks, timers, immunity, cleanse
- Save/Load: versioned snapshots, checksum, migrations
- Input & UX: abstraction, event bus, HUD model
- Testing: CLI harness, golden tests, perf timings

## Asset Completion / Integration (Detailed)

- Zone: Newhaven tilemap spec, collision, triggers
- Sprites: spirits/portraits, move/FX sheets (placeholders)
- UI: minimal HUD skin, fonts (remix‑safe)
- Audio: SFX and music stubs
- Docs: licensing metadata and credits

---

## Contributor Notes

- Branching: one branch per change (`docs/*`, `feat/*`, `refactor/*`, `fix/*`)
- Scope: keep modules decoupled; design via interfaces and adapters
- Testing: seedable CLI runs; include fixtures and golden tests
- Acceptance criteria: deterministic outputs, validated data, no runtime engine dependency
- Review size: small, focused edits with clear DoD

## Remix‑Safe Design Principles

- No third‑party IP; original or public‑domain assets only
- Data‑driven content (JSON) for easy remixing and auditing
- Adapters isolate engine specifics; default runtime is headless/CLI
- Clear licensing for any included placeholders

---

## Milestones (Checklist Summary)

- [ ] M0: Data + battle loop prototype (CLI, text‑only)
- [ ] M1: Newhaven encounters + party management
- [ ] M2: Progression + status effects + rewards
- [ ] M3: Remix‑safe assets + adapter stubs (render/audio)
- [ ] M4: Polishing, QA scenarios, contributor docs

---

## Suggestions: Next Scaffolds (Gameplay‑First)

1) Ship M0 core slices in this order:
- [ ] Deterministic RNG provider with test
- [ ] Action queue + phase loop
- [ ] Minimal damage formula + two sample moves
- [ ] AI baseline with two evaluators and golden test
- [ ] CLI harness that prints battle log from seed

2) Start M1 with encounter triggers and party swap flow before Save/Load polish.

3) Defer contributor tooling (linters/docs generators) until M0 loops feel good.

---

## Branching & Contribution

- One branch per scaffold/update: `docs/`, `feat/`, `refactor/`, `fix/`
- Keep modules decoupled; prefer interfaces and adapters
- Land small, testable slices; include seeds and fixtures

