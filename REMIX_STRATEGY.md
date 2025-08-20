## Remix Strategy: Extending the Engine for New Creatures, Locations, NPCs, Quests, Battles, and Assets

This document outlines a practical path to expand the current engine with new systems and content. It is based on the present codebase (movement, input, dialog, area titles, audio, transitions, save basics) and identifies missing core mechanics with recommended implementations.

### 1) Current Capabilities (what’s already here)
- Movement/input: `PlayerMoveController`, `PlayerController`, Input System.
- Interactions: `InteractionController` raycasts ahead and sends messages; `Dialog` + `DialogController` UI works for basic text.
- Locations: `AreaTitleTrigger` + `AreaTitle` ScriptableObjects switch BGM and keep last area; prefabs like `AreaTrigger.prefab` simplify placement.
- Teleports: `TeleportController` + `TeleportPortal` for doors/stairs transitions with `TransitionController` screen fade.
- Audio: `AudioController` with BGM/SFX channels and transitions.
- Save/load: `SaveManager` + `GameData` with player position, facing, area, time played.

Gaps: no creatures/party/box, no battle system, no encounter tables, no items/bag/shops, no quests/objectives, no branching dialog, no NPC AI/pathing, no UI menus.

### 2) Creatures System
- Data (ScriptableObjects):
  - `CreatureSpecies` (id, display name, types, base stats, growth curve, learnset, sprites/portraits, cries).
  - `Move` (id, name, type, category, power, accuracy, PP, effects, animation).
  - `StatusEffect` and `StatStageEffect` for buffs/debuffs and ailments.
- Runtime data:
  - `CreatureInstance` (species ref, level, IV/EV, current HP/PP, known moves, experience, status).
  - `Party` (list of `CreatureInstance`, size limit e.g., 6) and `Box` storage.
- Serialization: Extend `GameData` to store party, box, dex/seen flags. Use versioned schema fields to remain compatible.
- Assets: Per species spritesheets (front/back, faint, shiny optional), icon sprite, cry audio.

Implementation notes:
- Use ScriptableObjects for authoring, and simple GUIDs/ids in save data.
- Keep a lightweight data registry (e.g., `CreatureDatabase`) for id→asset lookup.

### 3) Map Locations and World Content
- Continue using `AreaTitle` assets for BGM/title and `AreaTitleTrigger` objects per zone.
- Author areas as Unity scenes or sub-tilemap collections; use `TeleportPortal` for doors/route connections.
- Add “encounter settings” per area:
  - `EncounterTable` ScriptableObject with weighted species/levels per time-of-day/terrain (tall grass, cave, water).
  - Place `EncounterTrigger` (2D Collider) over grass/water to roll encounters when stepping (see §5 Encounters).

### 4) NPCs and Dialog/Branching
- NPC prefab:
  - Visual: sprite/animator; Collision layer (interactable layer matches `InteractionController`).
  - Components: `Dialog` and a new `DialogTree` (branching lines, conditions, rewards), optional `QuestGiver`.
  - Optional patrol: `NpcPatrolController` (waypoints, pause times).
- Branching dialog:
  - `DialogTree` ScriptableObject: nodes (text, choices), conditions (quest state, flags), effects (start quest, give item, set flag).
  - Extend `DialogController` to render choices and invoke effects.
- State flags:
  - Add a `FlagStore` (string→bool/int) in `GameData` to represent simple story gates.

### 5) Encounters (Wild and Trainer)
- Wild encounters:
  - `EncounterTrigger` (MonoBehaviour) placed over grass/water, listens to player step events (from `PlayerMoveController` or tile events) and rolls against `EncounterTable`.
  - On success: stop input, call `TransitionController` (battle intro), build a `BattleSetup` (party vs generated wild), then load or overlay the battle UI/state machine.
- Trainer encounters:
  - `Trainer` NPC with a `TrainerParty` asset (creature instances + AI profile). Trigger on proximity/line-of-sight or interaction.
  - After defeat, set a persistent flag to avoid rematch (unless designed otherwise).

### 6) Battle System (Turn-based)
- State machine:
  - States: Intro → TurnStart → CommandSelect → ActionQueue → ResolveAction(s) → TurnEnd → Victory/Defeat/Escape.
  - Components: `BattleController`, `BattleUIController`, `BattleCalculator`.
- Data/calculation:
  - Moves resolve via `BattleCalculator` (damage formula, type matchups, criticals, accuracy/evasion, priority, status).
  - Support multi-turn, switching, items, catch attempts (if designed), XP gain, evolution checks.
- UI:
  - Command menu (Fight/Bag/Party/Run), Move selection, HP/XP bars, status icons, simple battle text box.
- Scene/overlay:
  - Either separate `Battle.unity` scene or overlay canvas. Use `TransitionController` for in/out. Plug into `AudioController` for battle BGM and victory jingle.
- Integrations:
  - Read/write party and items from `GameData`.
  - After battle, return to overworld with updated state.

### 7) Items, Inventory, Shops
- Data: `Item` ScriptableObject (id, name, type, effect, price, icon), subtypes (consumable, ball, key, held).
- Runtime: `Inventory` in `GameData` (id→count), `ShopList` per location.
- UI: Bag menu with categories; shop dialog to buy/sell.
- Effects: `IItemEffect` interface applied in battle or overworld (healing, buffs, escape, revive, status cure).

### 8) Quests and Objectives
- Data: `Quest` ScriptableObject with id, title, description, steps (objectives), rewards (items/flags/creatures/money).
- Runtime: `QuestManager` manages active/completed quests, objective progress; persists in `GameData`.
- Objectives: talk-to, defeat-trainer, collect-item, go-to-area, flag-based. Hook into existing events (dialog choices, area enter, battle result).
- UI: Journal panel listing active quests and progress.

### 9) Sprites, Animations, and Art Pipeline
- Overworld sprites: continue using current anim controller patterns (`Player.controller`, `Sprite.prefab`). Create `CreatureSprites` for battle (front/back), `NpcSprites` for townspeople/trainers.
- Addressables or Resources: optional to decouple scene references from data registries.
- Import presets: keep consistent pixels-per-unit, filter modes, and compression for crisp art.

### 10) Menus and UX
- Pause menu: Save, Options, Party, Bag, Journal (Quests), Map.
- Party UI: reorder, summary screen (stats, moves, types), switch lead.
- Options: text speed, volumes (delegate to `AudioController`), accessibility (high contrast, reduced flashes), language.

### 11) Persistence (Save/Load) Extensions
- Extend `GameData`:
  - `List<CreatureInstanceData> party`, `List<CreatureInstanceData> box`
  - `Dictionary<int,int> inventory`
  - `Dictionary<string,bool> flags`
  - `QuestStateData` for quests/objectives
  - `int money`, `int badges` (if applicable)
- Migration: bump `SchemaVersion` and support `MinCompatibleSchemaVersion`; default missing fields on load.

### 12) Recommended File/Type Additions
- ScriptableObjects:
  - `Assets/Objects/Creatures/CreatureSpecies/*.asset`
  - `Assets/Objects/Moves/*.asset`
  - `Assets/Objects/Encounters/*.asset` (per area)
  - `Assets/Objects/Items/*.asset`
  - `Assets/Objects/Quests/*.asset`
  - `Assets/Objects/Trainers/*.asset`
- Prefabs:
  - `Assets/Prefabs/NPCs/NPC.prefab` (Dialog + optional QuestGiver + Patrol)
  - `Assets/Prefabs/EncounterTrigger.prefab` (collider + encounter script)
  - `Assets/Prefabs/Battle/*` (UI canvases, controllers)

### 13) Integration Points in Current Code
- Encounters: add `EncounterTrigger` that listens to player step ticks (augment `PlayerMoveController` or subscribe to movement events) and rolls per `EncounterTable`.
- Battle start: use `TransitionController` then instantiate `BattleController` and hand it a `BattleSetup` (party vs wild/trainer). Pause input via `GameManager.Input.DeselectTarget()` and restore after.
- Location music: keep `AreaTitleTrigger` BGM control; set area-specific encounter tables on trigger enter.
- Dialog choices: extend `DialogController` to support choices and callbacks to `QuestManager`/`FlagStore`.
- Saving: extend `GameManager.SaveState()`/`LoadState()` to include new `GameData` fields.

### 14) What’s Missing (to add)
- Battle/encounter framework (none in code yet).
- Creatures/moves/status/types (none yet).
- Items/inventory/bag/shops.
- Quests/objectives/journal + branching dialog.
- NPC movement and trainer logic (sight, rematch flags).
- Party/box management UIs.
- Optional: time-of-day, weather, world map UI, cutscenes/camera rails, localization, accessibility options.

### 15) Phased Execution Plan
1. Data layer (ScriptableObjects): species, moves, items, quests, encounter tables, trainers.
2. Party/inventory models and serialization (extend `GameData`).
3. Battle MVP (wild only): turn order, basic moves, HP/XP, run, faint, victory/defeat flow.
4. Encounters in overworld: grass/water triggers tied to areas; battle transitions and BGM.
5. Trainer battles and rewards; trainer NPC prefab.
6. Quests and branching dialog choices; quest UI.
7. Shops and money; bag UI; item usage in battle/overworld.
8. Polish: NPC patrols, cutscenes, more UI, save slots, options/localization.

### 16) Testing/Debugging Hooks
- Editor gizmos for encounter volumes and trainer sight cones.
- In-editor battle launcher with test parties.
- Data validators (duplicate ids, missing sprites, invalid moves).

### 17) Asset Replacement Guidance (Remix)
- Replace branded fonts, BGM/SFX, sprites and tiles (see `REMIX_ASSETS.md`).
- Keep PPU and import settings consistent; ensure animator controllers reference your new clips.

