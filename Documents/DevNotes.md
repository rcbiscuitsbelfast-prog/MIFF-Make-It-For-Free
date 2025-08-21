# Dev Notes

## Solutions to solved problems
- TransparentFX layer has to be disabled in Camera's culling mask, to not render the elements on it
- For the OnTriggerStay2D event to work properly, the Rigid2DBody Sleep Mode has to be on "Never Sleep", otherwise this is only triggered once
- The Static flag in the inspector is useful, when enabled, for elements that never move. Optimizes the game, so less calculations are made.
-

## ToDos
- Refactor Movement system (using editor-assigned properties, events like onMoveEnd, move disable/enable, better decoupling,...)
	- MoveTo does not work with warp post movement
	- We need a way to disable step-movement when teleporting, enabling it again for the postWarpMove
	- We need a way to reactivate warping and collisions when movement is finished
- Refactor Warping system after movement one, if needed
- add debug GUI and enable it via the PlayerHouse PC. add steps counter and show it, together with FPS


## Issues
- Maybe warpCoords make moveSteps to not work in WarpController
- Sometimes text dialogs are not in the right order, they get mixed and lost
- Triggering a dialog may not respond to buttons
- When fading on warp player can still move


## Resources
- [Learning Unity 2D - Video Tutorials](https://www.youtube.com/playlist?list=PL0dOETTrhWWCuWcl2OjB3GfvrlfWEzx18)

## GameData Schema and Migration
- Schema version bumped to 3 to include `quests` list for QuestState.
- Migration: `SaveManager.Load()` initializes `quests` if missing and logs migration.
- Schema version bumped to 4 to include `inventory` list for items.
- Migration: `SaveManager.Load()` initializes `inventory` if missing and logs migration.
- Schema version bumped to 5 to include `dialogs` store for branching dialog.
- Migration: `SaveManager.Load()` initializes `dialogs` if missing and logs migration.
- Schema version bumped to 6 to include `creatures` and `party`.
- Migration: `SaveManager.Load()` initializes `creatures` and `party` if missing and logs migration.
- Schema version bumped to 7 to include `codex` and optional `loreEntries` preload.
- Migration: `SaveManager.Load()` initializes `codex.unlocked` if missing and logs migration.
- Schema version bumped to 8 to include `settings` (musicVolume, sfxVolume, language, showSubtitles).
- Migration: `SaveManager.Load()` initializes `settings` if missing and logs migration.

## Species and Creatures JSON
- Species JSON (`Resources/species/species.json`):
```
{
  "species": [
    {"id":"sprout","nameId":"species.sprout","baseHp":35,"baseAttack":10,"baseDefense":8,"baseSpeed":12,"captureRate":60,"allowedMoves":["tackle","grow"]}
  ]
}
```
- Creatures are generated at runtime by `CreatureFactory` and persisted in `GameData.creatures` as entries containing ids, stats, and moves.

## Scene Setup: QuestManager Lifecycle
- `QuestManager` is auto-instantiated by `GameManager.Awake()` if missing, and marked `DontDestroyOnLoad`.
- For explicit scene setup, you may add a `QuestManager` GameObject to `Main.unity`.

## Scene Setup: InventoryManager Lifecycle
- `InventoryManager` is auto-instantiated by `GameManager.Awake()` if missing, and marked `DontDestroyOnLoad`.
- `InventoryUI` stub logs Open/Close and can be wired to a menu later.

## Audio Mixer Integration
- `AudioMixerManager` maps linear [0..1] volumes to decibels via 20*log10(linear) with a floor at -80 dB.
- Ensure Unity AudioMixer exposes parameters `MusicVolume` and `SFXVolume` and is loadable via Resources if not assigned.

## CLI
- QuestsPure: npx ts-node --compiler-options '{"module":"commonjs"}' QuestsPure/cliHarness.ts QuestsPure/sample_quest_npc.json 1234
- InventoryPure: npx ts-node --compiler-options '{"module":"commonjs"}' InventoryPure/cliHarness.ts InventoryPure/sample_commands.json
- CreaturesPure: npx ts-node --compiler-options '{"module":"commonjs"}' CreaturesPure/cliHarness.ts Assets/Resources/species/species.json CreaturesPure/sample_commands.json
- LorePure: npx ts-node --compiler-options '{"module":"commonjs"}' LorePure/cliHarness.ts LorePure/sample_commands.json
- SettingsPure: npx ts-node --compiler-options '{"module":"commonjs"}' SettingsPure/cliHarness.ts SettingsPure/sample_init.json SettingsPure/sample_commands.json
- AudioMixerPure: npx ts-node --compiler-options '{"module":"commonjs"}' AudioMixerPure/cliHarness.ts AudioMixerPure/sample_commands.json

## World Enhancements
- OverlayManager: fade/tint/flash stubs
- LightingManager: ambient presets (day/dusk/night)
- TimedEventManager: schedule and repeat events (logs)
- ZoneTriggerManager: define zones and log enter/exit

## CLI
- WorldEnhancementsPure: npx ts-node --compiler-options '{"module":"commonjs"}' WorldEnhancementsPure/cliHarness.ts WorldEnhancementsPure/sample_commands.json
- WorldLayoutPure: npx ts-node --compiler-options '{"module":"commonjs"}' WorldLayoutPure/cliHarness.ts WorldLayoutPure/sample_commands.json
- MovementPure: npx ts-node --compiler-options '{"module":"commonjs"}' MovementPure/cliHarness.ts MovementPure/sample_commands.json

## CombatPure
- Core engine in TS: `CombatPure/engine.ts`
- Hooks: InventoryHook (items), AIHook (pickAction), SaveHook (onCheckpoint)
- CLI: npx ts-node --compiler-options '{"module":"commonjs"}' CombatPure/cliHarness.ts CombatPure/sample_commands.json

## Completed Systems - Lifecycle Notes
- InventoryPure/InventoryManager: JSON-persisted inventory, CLI for add/remove/inspect; game runtime via `InventoryManager` singleton.
- DialogPure/DialogManager: Pagination, branching, localization integration; CLI for dialog flow.
- QuestsPure/QuestManager: Quest flags, gating, triggers; CLI for quest simulation.
- NPCsPure: Interaction triggers and dialog; CLI present under NPCsPure.
- ZonesPure/ZoneTriggerManager: Define zones and link enter/exit triggers; CLI via WorldEnhancementsPure and WorldLayoutPure.
- CodexPure/CodexManager: Lore unlocks and lookup; CLI for load/list/unlock.
- SaveMigration/SaveManager: Versioned JSON save/load with migration hooks.

## Pending Systems - TODO
- SaveLoadPure: TODO - define multi-slot saves, autosave, rollback checkpoints.
- AIProfilesPure: TODO - define behavior trees/profiles for NPCs/enemies.
- XPLevelingPure: TODO - leveling curves, experience gain, level-up rewards.
- StatusEffectsPure: TODO - buffs/debuffs with durations and resistances.
- FusionPure: TODO - creature fusion mechanics and outcomes.
- CraftingPure: TODO - item recipes and crafting stations.
- EquipmentPure: TODO - gear slots, stat modifiers, and loadouts.
- VendorsPure: TODO - buy/sell economy, inventory refresh.
- InputPure: TODO - decoupled input abstraction with remapping.