## Remix Review v1

This document summarizes gaps, broken interlinks, and improvements across data, battle, audio, UI, and scene setup for the modular spirit battle game.

### Missing components or fields
- `SpiritSpecies`
  - No unique ID registry/validation; possible `spiritID` collisions
  - No dedicated icon; UI reuses `frontSprite`
  - No level/HP model; battle temporarily uses `sync` as HP
- `SongMove`
  - `accuracy` unused (no hit/miss)
  - No cost/cooldown/targeting metadata; `moveType` overloaded
- `PlayerProfile`
  - No default spirit roster linkage; only signature moves
- `BattleItem`
  - No pluggable effect system (`IItemEffect`); only HealHP/Revive stubs
- `EncounterTable`
  - `minLevel/maxLevel` unused by battle setup; level ignored
  - No per-area encounter rate/frequency
- `TrainerParty`
  - `AIProfile` unused by AI (enemy move choice is random)
- `Quest`
  - Objective completion currently mutates authoring assets; progress should be per-save
  - Rewards (Item/Spirit) not integrated with inventory/party
- `DialogTree`
  - Choice UI prefab not provided; no localization keys

### Broken or missing interlinks
- `BattleUIController` → `BattleController`
  - Calls `GetCurrentPlayerSpirit()` but method is not exposed publicly
  - Fainted button disabling uses placeholder HP; no real HP getters
  - `mustSwitchSpirit` not surfaced for UI prompt after faint
- `BattleController`
  - No start/end/turn events; `Trainer` never receives outcome automatically
  - Solo mode enforcement exists; UI visibility only partially enforced
  - Enemy AI ignores `TrainerParty.aiProfile`
- `BattleAudioManager`
  - Spec mentions `PlayMoveStemSynced`; current method is `PlayMoveStem` (does schedule). Add alias/rename for clarity
  - Bar sync based on `AudioSource.time` risks drift over long loops; prefer DSP-time anchoring
- `EncounterTrigger`
  - Calls `TransitionIn()` immediately after `StartBattle` instead of waiting for transition callbacks
  - Sets `isActive` false and never re-enables; no cooldown
  - Uses system clock for time-of-day; consider game time source
- `Trainer`
  - Starts battle, but defeat flag depends on external `OnBattleEnd` call; no subscription to controller outcome
  - Trigger-only approach; no line-of-sight/interaction toggle
- `DialogController` (choices)
  - Requires `choicesPanel` and `choiceButtonPrefab` assignments; no prefab provided here
  - Effect `GiveItem` unimplemented
- `SpiritDexUI`
  - Uses `Resources.FindObjectsOfTypeAll<SpiritSpecies>()`; not build-safe; needs a database/registry
  - `GameData.discoveredSpiritIDs` is never updated on capture
- `QuestManager`
  - Mutates `QuestObjective.isComplete` on ScriptableObject assets; should store progress in `GameData`
  - Money/inventory reward plumbing missing

### Suggestions for improvement or cleanup
- Data/registries
  - Add `SpiritDatabase`, `MoveDatabase`, `ItemDatabase` (ScriptableObject or Addressables), with unique ID validation
  - Add `icon` sprite to `SpiritSpecies` and `BattleItem` for list UIs
- Battle
  - Expose read-only getters: current spirit, `GetPlayerSpiritHP(int)`, enemy remaining, `mustSwitchSpirit`
  - Emit events: `OnBattleStarted`, `OnTurnChanged`, `OnMoveResolved`, `OnBattleEnded(bool playerWon)`
  - Implement `accuracy` and simple hit/miss; consume `EncounterTable` level for wild spawns
  - Implement basic AI using `AIProfile` (Aggressive/Defensive/Balanced/Random)
  - Escape chance instead of auto-escape
  - Make solo-mode UI state persistent (disable spirit move/switch panels until exit)
- Audio
  - Add `PlayMoveStemSynced(AudioClip)` alias; track `bgmDspStart` and compute next bar via `AudioSettings.dspTime`
  - Optional `AudioMixer` routing: BGM/Stems/SFX with exposed volumes
  - Fix debugger to actually select and play a base track clip
- UI
  - Provide dialog choice prefab and wire default references in `DialogController`
  - Replace placeholder HP logic by controller getters; add HP bars in battle UI
  - Switch `SpiritDexUI` to use `SpiritDatabase`; add capture hook to push `spiritID` to `GameData`
  - QuestJournal: add `QuestObjective.description` and display it; show rewards preview
- Encounters/Trainers
  - `EncounterTrigger`: wait for `TransitionOut` complete, then start battle; auto re-enable after battle (or cooldown)
  - `Trainer`: subscribe to `BattleController.OnBattleEnded` to set defeat flag; optionally disable collider when defeated
- Quests
  - Store quest/obj progress in `GameData` sets (active/completed), not assets; migrate on load
  - Implement inventory/party rewards; add currency to `GameData`
- Save
  - Replace `BinaryFormatter` with JSON; handle schema migrations for new fields
- Contributor workflow
  - Add editor menu generators/validators for common assets; check duplicate IDs, null refs, and missing sprites/audio

### Checklist of fixes
- Compile/runtime
  - [ ] Expose `CurrentPlayerSpirit` or make `GetCurrentPlayerSpirit()` public
  - [ ] Expose `GetPlayerSpiritHP(int)` and `PlayerSpiritCount` for UI
  - [ ] Add `OnBattleEnded` and wire `Trainer`/`EncounterTrigger` re-enable via event
  - [ ] Add `PlayMoveStemSynced` (alias); rename usages if needed
  - [ ] Use transition callbacks instead of immediate `TransitionIn()`
- Data/persistence
  - [ ] Add `SpiritDatabase`; stop using `Resources.FindObjects...`
  - [ ] Move quest progress to `GameData` (no ScriptableObject mutation)
  - [ ] Implement `GiveItem` reward and inventory stub (id→count)
  - [ ] Add `QuestObjective.description`; use it in journal
- Battle polish
  - [ ] Implement hit/miss via `accuracy`
  - [ ] Use `EncounterTable` level when spawning wilds
  - [ ] Implement simple AI by `AIProfile`
  - [ ] Escape chance; proactively hide/disable UI in solo mode
- Audio polish
  - [ ] Track BGM start in DSP time; compute precise bar boundary
  - [ ] Optional AudioMixer groups (BGM/Stems/SFX)
- UI/prefabs
  - [ ] Provide dialog choice prefab; wire to `DialogController`
  - [ ] Generate and place `BattleCanvas`, `QuestJournalCanvas`, `SpiritDexCanvas` in starter scene
- Scene hooks
  - [ ] Ensure `QuestManager` in scene; assign to `DialogController`
  - [ ] Place and configure `EncounterTrigger`/`Trainer` prefabs; verify auto-finds
  - [ ] Add `AreaTitleTrigger` with “Moonlight Alley” BGM
  - [ ] Add shrine portal using `TeleportPortal` + `TransitionController`

