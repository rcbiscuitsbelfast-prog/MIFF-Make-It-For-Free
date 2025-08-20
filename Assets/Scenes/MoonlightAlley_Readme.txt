Create the scene `MoonlightAlley.unity` in Unity and set up:

- Systems:
  - Add `QuestManager` (populate available quests, e.g., "Echoes of the Alley").
  - Add `BattleController` + `BattleUIController` + `BattleAudioManager`.
  - Add `SpiritDexCanvas.prefab` and `QuestJournalCanvas.prefab` (from Tools menu) to the scene or load via HUD.

- Area Title:
  - Place `AreaTitleTrigger` with an `AreaTitle` asset titled "Moonlight Alley" and BGM.

- Encounters:
  - Place `EncounterTrigger.prefab` in mist patches and alley corners.
  - Assign the starter `EncounterTable` with 6 spirits. Set terrain to Urban or Shrine.

- Trainer (Echo Syndicate - Riko):
  - Place `Trainer.prefab` and assign a `TrainerParty` with 3 spirits and a fight style.
  - Set `defeatFlagID` to prevent rematch.

- NPC (Dr. Hyeon):
  - Place an NPC with `DialogTreeStarter` that references a `DialogTree` which starts the quest "Echoes of the Alley" and includes branching choices.

- UI Access:
  - Add HUD or Pause menu buttons to call `SpiritDexUI.ShowDex()` and `QuestJournalUI.ShowJournal()`.

- Optional Shrine Portal:
  - Add `TeleportPortal` + `TransitionController` for shrine transition.

