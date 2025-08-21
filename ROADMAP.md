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
- [x] Data schema stubs drafted with validation strategy
- [x] CLI harness skeleton (seedable, deterministic)
- [x] Battle turn manager prototype

---

## Phased Gameplay Roadmap (with Checklists)

Each phase lists Code Scaffolding and Asset Integration separately, and shows how systems link to gameplay loops.

### M0 — Data + Battle Loop (text‑only CLI)

Goal: Deterministic, seedable battle simulation proving core combat.

- Code Scaffolding
  - [x] Data Schemas (JSON + validation)
    - [x] `Spirit` (id, stats, types/tags, learnset refs)
    - [x] `Move` (id, category, power, accuracy, cost, tags)
    - [x] `StatusEffect` (id, duration, stacking, immunity tags)
    - [x] `Item` (id, type, effect hooks)
    - [x] `EncounterTable` (zone, weights, level ranges)
    - [x] JSON schema + validator and fixtures
  - [x] Battle Core
    - [x] Turn manager and phases (pre, select, resolve, end)
    - [x] Action queue with speed/priority ordering
    - [x] Deterministic RNG provider (seed injectable)
    - [x] Damage formula and type/resistance hooks
    - [x] Status/effect resolution order and timing
    - [x] Win/lose/escape conditions (EscapeLogic)
  - [x] AI Baseline
    - [x] Rule evaluators (hp threshold, type advantage, PP/cost, kill‑secure)
    - [x] Simple priority model with weights
    - [x] Fallback/timeout to safe action
  - [x] CLI/Test Harness
    - [x] Start battle with seed, dump battle log
    - [x] Golden tests for canonical matchups
    - [x] Performance timing on hot paths

- Asset Integration (optional at M0)
  - [ ] None required; use text logs and mock data
- Loop Linkage
  - battle → reward placeholder → heal placeholder

### M1 — Encounters + Party Management (Newhaven Overworld Loop)

Goal: Trigger battles via Newhaven encounter tables, manage party swaps and KO.

- Code Scaffolding
  - [x] Encounter Controller
    - [x] Trigger types (grass/zone/time scripted hooks)
    - [x] Weighted selection and level scaling
  - [x] Team/Party Management
    - [x] Roster and active party slots
    - [x] Swap/KO/faint handling and post‑battle heal hook
    - [x] Reward grant stub (currency/item/xp placeholder)
  - [x] Save/Load v1
    - [x] Versioned JSON snapshot + checksum
    - [x] Migration scaffold
  - [x] Input Abstraction
    - [x] Rebindable actions; keyboard/controller mapping model
  - [x] Minimal UI model
    - [x] State HUD model (hp/status/turn) decoupled from renderer
- Asset Integration
  - [ ] Newhaven zone layout (remix‑safe placeholder tilemap spec)
  - [ ] Encounter table data files
  - [ ] Basic HUD text templates
- Loop Linkage
  - overworld → encounter → battle → reward → heal → roam

### M2 — Progression + Status Effects + Rewards

Goal: Progress feels meaningful; effects impact strategy; basic loot.

- Code Scaffolding
  - [x] Progression
    - [x] XP curves, level‑up, learnset unlocks
    - [x] Evolution conditions framework (level, item, quest flag)
  - [x] Status Effects
    - [x] Buff/debuff stack rules (flat/percent, additive/multiplicative)
    - [x] Timers (turns/seconds) and dispel/cleanse hooks
    - [x] Immunity and overwrite rules
  - [x] Rewards
    - [x] Currency/items/xp distribution
    - [x] Drop tables and rarity weights
  - [x] Lore/Codex hooks
    - [x] Unlock entries on discover/defeat/evolve
- Asset Integration
  - [ ] Placeholder icons for effects and items
  - [ ] Basic codex entries for Newhaven spirits and landmarks
- Loop Linkage
  - battle → reward → level up → learn move → evolve → codex

### M3 — Remix‑Safe Assets + Adapter Stubs (Render/Audio)

Goal: Minimal presentation layer via adapters; still engine‑agnostic.

- Code Scaffolding
  - [x] Render Adapter Interface
    - [x] HUD binding layer; health bars, status badges, dialog
    - [x] Event bus → UI adapter mapping
  - [x] Audio Adapter Interface
    - [x] SFX/Music events and categories
    - [x] Seeded variation for repeated actions
  - [x] Data Tooling
    - [x] Lints, schema docs, fixtures, golden tests
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

## Folder Map (miff/pure/)

| Folder         | Purpose                             |
|----------------|-------------------------------------|
| BattleAIPure   | AI logic and test harness           |
| EffectsPure    | Status effects and aggregator       |
| TeamsPure      | Party composition and swap logic    |
| LorePure       | Codex unlocks and lore flags        |
| SyncPure       | Rhythm challenge and sync logic     |
| ItemsPure      | Item usage flow and results         |
| QuestsPure     | Objectives, flags, and progression  |
| SpiritsPure    | Dex filters, sorting, and queries   |
| EvolutionPure  | Evolution conditions and results    |
| NPCsPure       | NPC data and interactions (stub)    |
| FusionPure     | Fusion rules (experimental, stub)   |

---

## Reality Check: Already Scaffolded vs Still Needed

### Already Scaffolded (Synced into `miff/pure/`)

- AI Baseline (BattleAIPure): rules/policies + harness [Partial]
- Effects System (EffectsPure): effects + aggregator [Partial]
- Teams (TeamsPure): composition rules + tests [Partial]
- Items (ItemsPure): usage manager + results [Partial]
- Lore/Codex (LorePure): flags/unlocks + tests [Partial]
- Quests (QuestsPure): objectives/flags + tests [Partial]
- Spirits Dex utilities (SpiritsPure): filter/sort + tests [Partial]
- Sync (SyncPure): events/challenges + tests [Partial]
- Challenges (ChallengesPure): battle challenges + rulesets [Partial]
- Evolution (EvolutionPure): conditions/results/tests [Partial]
- NPCs (NPCsPure): data + interaction tests [Stub]
- Fusion (FusionPure): rules/results/tests [Stub]

Related tooling present:

- Test harness files for several modules (CLI‑like usage in code)
- README snippets in some module families

Underdocumented but present:

- ChallengesPure, SyncPure have harnesses without high‑level docs

## CLI Harness Coverage

| Module       | CLI Harness | Simulates                         |
|--------------|-------------|-----------------------------------|
| BattleAIPure | ✅           | Move selection, threat eval       |
| SyncPure     | ✅           | Rhythm challenge, sync gain       |
| LorePure     | ✅           | Unlock conditions, codex view     |
| NPCsPure     | ❌           | —                                 |
| BattleLoop   | ✅           | One-turn ordering + logging       |
| Damage       | ✅           | Repeatable calc + breakdown       |
| Encounters   | ✅           | Trigger + weighted selection      |
| Party        | ✅           | Swap, KO, heal flow               |
| Save/Load    | ✅           | Snapshot write/read + validate    |
| Input        | ✅           | Mapping and rebind                |
| HUD          | ✅           | Print before/after resolve        |
| Progression  | ✅           | XP gain, unlocks, evolution       |
| Rewards      | ✅           | Currency/xp/item stub + drops     |
| StatusEffects| ✅           | Stacks, timers, cleanse           |
| Events       | ✅           | Publish/subscribe bus             |
| Render       | ✅           | CLI HUD/dialog adapters           |
| Audio        | ✅           | CLI SFX/music adapters            |
| Tooling      | ✅           | Linter/generator/golden runner    |

### Still Needed (High‑Priority for Newhaven)

- Additional golden tests and broader fixtures
- Optional: placeholder asset integration checklist (sprites, HUD skins, SFX)

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

> **Reminder**: After updating the roadmap, ensure `README.md` reflects the latest scaffolded systems, gameplay loops, and branching policy.

## Milestones (Checklist Summary)

- [x] M0: Data + battle loop prototype (CLI, text‑only)
- [x] M1: Newhaven encounters + party management
- [x] M2: Progression + status effects + rewards
- [x] M3: Remix‑safe assets + adapter stubs (render/audio)
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