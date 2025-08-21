# Roadmap

## CLI Harness Coverage

| Module   | CLI Harness | Simulates                         |
|----------|-------------|-----------------------------------|
| NPCsPure | ✅           | Dialog + quest flag simulation    |

Note: NPCsPure CLI harness added with seedable interaction flow.

## Systems Overview

- Player Movement and Animation
  - Status: Implemented. Tile-based steps via `MoveDirector`/`MovePath`; animator parameters (`MoveX`, `MoveY`, `LastMoveX`, `LastMoveY`, `Speed`). Snapping offset supported.
  - Gaps: No pathfinding or NPC avoidance; no slopes; limited run-state handling.
  - Next: Add NPC collision avoidance, queued moves, and configurable movement grid.

- Input System
  - Status: New Input System with message-dispatch to focused target; throttle for holds.
  - Gaps: SendMessage coupling; no rebinding UI; limited multiplayer.
  - Next: Replace SendMessage with interfaces/events; add input rebinding menu.

- Dialog System
  - Status: Pagination via `DialogScroller`; UI transitions and SFX; NPC dialog triggers.
  - Gaps: No branching choices; no localization; no variables/macros in text.
  - Next: Add branching choices, variables (e.g., player name), and CSV/JSON localization.

- Audio (BGM/SFX)
  - Status: Two channels with volume and BGM fade transitions; play-when-idle SFX.
  - Gaps: No mixer groups; no ducking; no playlist/shuffle.
  - Next: Integrate Unity AudioMixer, add ducking and zone-based playlists.

- World/Tilemap
  - Status: Area titles with BGM switch; time-of-day `TileSwapScheduler`.
  - Gaps: No world streaming; limited time/weather effects.
  - Next: Add weather overlays, lighting, and scene streaming hooks.

- Teleport/Warp
  - Status: Portals with fade-out/in, drop-zone and post-drop steps, turn-around delay handling.
  - Gaps: No conditional locks; no cutscene auto-routing.
  - Next: Add conditions (keys/badges), cutscene steps DSL.

- Save/Load State
  - Status: JsonUtility-based save/load with schema versioning; position, direction, area.
  - Gaps: No inventory, party, quests, time-of-day/weather, visited flags.
  - Next: Extend `GameData` for inventory, party, quests; add migration utilities.

- NPCs and Interactions
  - Status: Raycast-based interact layer; dialog trigger; CLI harness simulates dialog + quest flag.
  - Gaps: No pathing NPCs, schedules, or interactions beyond dialog.
  - Next: Add NPC schedules, patrol paths, and simple quest script hooks.

- UI/Transitions
  - Status: Screen fade in/out, message relay to teleporter.
  - Gaps: No pause/menu UI, inventory UI, or settings.
  - Next: Build pause menu (save/load, settings), inventory UI, and map.

- Tooling/Editor
  - Status: Custom drawers for Tag/Layer; hierarchy filter window.
  - Gaps: No quest editor, dialog editor, or tile metadata tools.
  - Next: Create ScriptableObject-based quest and dialog editors.

## Technical Debt and Fixes

- Fixed: Editor-only import in `PlayerController.cs` guarded by `#if UNITY_EDITOR`.
- Fixed: Snap/clamp behavior corrected in `MovePath.ClampAxis`.
- Fixed: Save system now JSON-based; removed BinaryFormatter.
- Fixed: Input hold throttle set to 75ms (float).
- Fixed: QuestManager auto-instantiated by `GameManager.Awake()` (DontDestroyOnLoad); added debug log.
- Fixed: Migration hook in `SaveManager.Load()` initializes empty QuestState for schema < 3.
- Pending: Replace SendMessage usages with events/interfaces.
- Pending: Add unit tests for dialog pagination, movement clamp, and teleport edge cases.

## Near-Term Milestones (Next Stages)

1) Quests v1
- Add `QuestState` to `GameData` (dictionary of flags/steps)
- ScriptableObject `QuestDefinition` with steps and conditions
- NPC dialog integration to set/check quest flags

2) Inventory v1
- Add `InventoryState` to `GameData` (items + counts)
- Basic inventory UI and item pickup interaction

3) Party/Creatures v0 (stub)
- Data model placeholders in `GameData`
- CLI harness extension to simulate encounter -> capture flag

4) Dialog Choices and Localization
- Choice nodes with player selection
- JSON/CSV localization and font switching

5) Menu/Settings
- Pause menu with audio/input settings and save/load slot UI

6) Audio Mixer Integration
- Add AudioMixer, expose BGM/SFX groups, implement ducking

7) World Enhancements
- Weather overlays, lighting, and schedule-aware BGM

## Release Readiness Checklist

- [x] Unity compile passes and scenes load
- [x] Player movement, dialog, audio, teleport validated
- [x] Save/Load JSON works cross-platform
- [x] NPCsPure CLI harness green on golden
- [ ] Basic quest flags persisted in `GameData`
- [ ] Pause/inventory UI works on target platforms