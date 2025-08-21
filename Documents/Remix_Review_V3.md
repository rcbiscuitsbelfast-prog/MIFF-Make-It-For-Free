## Modular CLI-First Game Framework — Remix Review V3

### 1) Module Inventory

- QuestsPure — ✅ Completed
  - Schema: GameData.quests (Assets/Scripts/NewBark/State/GameData.cs, lines 40–41)
  - Manager: QuestsPure/QuestManager (singleton) (Assets/Scripts/NewBark/QuestsPure/QuestManager.cs)
  - CLI: QuestsPure/cliHarness.ts; sample: QuestsPure/sample_quest_npc.json; golden: QuestsPure/expected_quest.json; test: QuestsPure/tests/goldenQuest.test.ts
  - Docs: QuestsPure/README.md

- InventoryPure — ✅ Completed
  - Schema: GameData.inventory (Assets/Scripts/NewBark/State/GameData.cs, lines 49–51)
  - Manager: InventoryPure/InventoryManager (singleton)
  - CLI: InventoryPure/cliHarness.ts; sample: InventoryPure/sample_commands.json; golden: InventoryPure/expected_output.json

- Dialog (DialogPure) — 🔜 Pending
  - Manager exists: Dialog/DialogManager (singleton)
  - CLI harness: missing (docs mention CLI, but none present)

- NPCsPure — ✅ Completed (CLI present; Python harness)
  - CLI: cli/npcs_pure/harness.py; tests under cli/npcs_pure/tests
  - Runtime interactions handled by InteractionController + Dialog/Quest hooks

- Lore/Codex (CodexPure) — ✅ Completed
  - Schema: GameData.codex (Assets/Scripts/NewBark/State/GameData.cs, lines 123–131)
  - Managers: Lore/CodexManager, LoreDatabase
  - CLI: LorePure/cliHarness.ts; sample: LorePure/sample_commands.json

- SettingsPure — ✅ Completed (ApplySettings not invoked globally; see §4)
  - Schema: GameData.settings
  - Manager: Settings/SettingsManager (singleton, has ApplySettings)
  - CLI: SettingsPure/cliHarness.ts; samples: SettingsPure/sample_init.json, SettingsPure/sample_commands.json

- AudioMixerPure — ✅ Completed
  - Manager: Audio/AudioMixerManager (singleton)
  - CLI: AudioMixerPure/cliHarness.ts; sample: AudioMixerPure/sample_commands.json

- WorldEnhancementsPure — ✅ Completed
  - Managers: OverlayManager, LightingManager, TimedEventManager, ZoneTriggerManager; facade WorldEnhancementsManager (auto-ensures sub-managers)
  - CLI: WorldEnhancementsPure/cliHarness.ts; sample: WorldEnhancementsPure/sample_commands.json

- WorldLayoutPure — ✅ Completed
  - Manager: WorldLayout/MapManager (singleton)
  - CLI: WorldLayoutPure/cliHarness.ts; sample: WorldLayoutPure/sample_commands.json

- MovementPure — ✅ Completed
  - Controllers/Manager: Movement/* including NPCMovementManager (singleton)
  - CLI: MovementPure/cliHarness.ts; sample: MovementPure/sample_commands.json

- CreaturesPure — ✅ Completed (core)
  - Schema: GameData.creatures, GameData.party
  - Managers: PartyManager, EncounterManager; factory CreatureFactory
  - CLI: CreaturesPure/cliHarness.ts; sample: CreaturesPure/sample_commands.json
  - Data: Assets/Resources/species/species.json

- XPLevelingPure — ✅ Completed (v1 core)
  - Schema: GameData.xp, GameData.levels (schema v10)
  - Managers: XP/XPManager, XP/LevelUpManager (loads curve)
  - CLI: XPLevelingPure/cliHarness.ts; sample: XPLevelingPure/sample_commands.json
  - Data: Assets/Resources/levels/level_curve.json

- CombatPure — ✅ Completed (engine + CLI; no Unity integration yet)
  - Engine: CombatPure/engine.ts
  - CLI: CombatPure/cliHarness.ts; sample: CombatPure/sample_commands.json

- SaveMigration — ✅ Completed (migrations inside SaveManager)
- SaveLoadPure — 🔜 Pending (no separate module/CLI; functionality exists via SaveManager)
- AIProfilesPure, StatusEffectsPure, FusionPure, CraftingPure, EquipmentPure, VendorsPure, InputPure (as modular CLI) — 🔜 Pending

### 2) Redundant & Legacy Files

- Documents/johto_map.jpg — not referenced; ARCHIVE
- Documents/kanto_map.png — not referenced; ARCHIVE
- Mixed-language harness: cli/npcs_pure/harness.py — keep (works); consider TS port for consistency

No "Newhaven" remnants found.

### 3) CLI Harness Coverage

- Harness + samples present for: QuestsPure, InventoryPure, LorePure, SettingsPure, AudioMixerPure, WorldEnhancementsPure, WorldLayoutPure, MovementPure, CreaturesPure, XPLevelingPure, CombatPure, NPCsPure
- Golden-output:
  - QuestsPure has golden test (tests/goldenQuest.test.ts + expected_quest.json)
  - InventoryPure has expected_output.json but lacks a test runner
  - Others missing golden tests
- Test runner: package.json lacks jest/vitest; npm test fails by design

### 4) Manager Instantiation & Integration Hooks

- Auto-instantiated once via GameManager.Awake(): QuestManager, InventoryManager, LocalizationManager, DialogManager, PartyManager, EncounterManager, SpeciesDatabase, CodexManager, LoreDatabase, SettingsManager, AudioMixerManager, WorldEnhancementsManager, MapManager, NPCMovementManager, LevelUpManager, XPManager
- Missing call: SettingsManager.ApplySettings() is never invoked after load or on setting change
- Save/Load integrated: GameManager calls SaveManager.Load() on start and SaveManager.Save() on quit

### 5) Schema & Migration Consistency

- Current schema version: v10; min compatible: v2
- Migrations (executed in SaveManager.Load()): v3 quests, v4 inventory, v5 dialogs, v6 creatures/party, v7 codex, v8 settings, v10 xp/levels; v9 doc-only

### 6) Documentation Alignment

- ROADMAP: XPLevelingPure listed as both Pending and Completed (later section). Should be marked Completed (v1 core) and removed from Pending
- DialogPure CLI mentioned in docs, but no CLI module exists; note discrepancy
- README is upstream-focused; add CLI-first harness section and examples

### 7) Code Quality & Architecture

- Engine-agnostic: TS harnesses and Combat engine are agnostic; C# managers are Unity-coupled (expected)
- Coupling: DialogManager directly calls InventoryManager and QuestManager; consider mediator/events for decoupling
- Duplication: Linear-to-dB mapping exists in both TS and C#; acceptable but document as shared formula
- Centralized instantiation: GameManager creates many managers; simple but tightly coupled
- Testing: Golden tests limited; no unified test runner

### 8) Missing High-Impact Systems (by gameplay impact)

- Critical/High:
  - Equipment system (schema, manager, CLI)
  - Combat runtime integration (C# bridge + persistence)
  - SaveLoadPure (multi-slot, autosave, rollback) as module + CLI/tests
  - AI Profiles/Behaviors
  - Status Effects
- Medium:
  - Vendors/Economy, Crafting
  - Story Sequencer/Cutscene DSL
  - Editor Tools (Quest/Dialog editors)
- Low/Infra:
  - DialogPure CLI harness parity
  - Port NPCsPure harness to TS
  - Standardize golden tests + npm test

### Prioritized Action List

- Critical
  - Invoke SettingsManager.ApplySettings() after SaveManager.Load() and on settings changes
  - Add standardized golden-output tests and test runner for all TS harnesses; wire npm test
  - Integrate Combat engine with Unity runtime and GameData checkpoints

- High
  - Implement EquipmentPure (schema, manager, CLI, docs)
  - Implement AIProfilesPure and StatusEffectsPure (schemas, managers, CLI)
  - Add SaveLoadPure CLI for multi-slot/autosave/rollback with tests

- Medium
  - Provide DialogPure CLI harness and tests
  - Introduce mediator/event layer to decouple DialogManager from Inventory/Quests
  - Optionally port NPCsPure harness to TS

- Low
  - Archive unused large images (johto_map.jpg, kanto_map.png)
  - Update ROADMAP to reflect XPLevelingPure completion and DialogPure CLI status
  - Document shared audio volume mapping formula across TS/C#

