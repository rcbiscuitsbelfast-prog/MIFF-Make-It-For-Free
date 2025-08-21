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

## Scene Setup: QuestManager Lifecycle
- `QuestManager` is auto-instantiated by `GameManager.Awake()` if missing, and marked `DontDestroyOnLoad`.
- For explicit scene setup, you may add a `QuestManager` GameObject to `Main.unity`.

## Scene Setup: InventoryManager Lifecycle
- `InventoryManager` is auto-instantiated by `GameManager.Awake()` if missing, and marked `DontDestroyOnLoad`.
- `InventoryUI` stub logs Open/Close and can be wired to a menu later.

## CLI
- QuestsPure: npx ts-node --compiler-options '{"module":"commonjs"}' QuestsPure/cliHarness.ts QuestsPure/sample_quest_npc.json 1234
- InventoryPure: npx ts-node --compiler-options '{"module":"commonjs"}' InventoryPure/cliHarness.ts InventoryPure/sample_commands.json