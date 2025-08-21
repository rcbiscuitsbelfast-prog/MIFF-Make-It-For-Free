# QuestsPure - Contributor Guide

## Define a new Quest
1. In Unity, create a `QuestDefinition` via: Assets → Create → NewBark → Quest Definition.
2. Fill fields:
   - id (unique), title, description
   - steps[] (ordered list of step ids + descriptions)
   - conditions[] (optional preconditions by type/key/value)
   - rewards[] (optional rewards)
   - zone, npcTrigger, codexUnlock (optional metadata)

## Quest State and Persistence
- `GameData` includes a `quests` list of entries `{ id, step, status }`.
- Save/Load uses JSON, so quest progress persists across sessions.

## Link NPC Dialog to Quests
- On a `Dialog` component:
  - To trigger/advance a quest: set `questId`, optional `questStep`, and optional `questStatus` (Active/Completed/Failed).
  - To gate dialog by quest state: set `requireQuestId`, optional `requireStatus`, and `requireMinStep`.
- The `QuestManager` updates the quest state at runtime.

## CLI Harness (QuestsPure)
- Run quest simulation:
  - npx ts-node --compiler-options '{"module":"commonjs"}' QuestsPure/cliHarness.ts QuestsPure/sample_quest_npc.json 1234
- Golden test fixture: `QuestsPure/expected_quest.json`

## Remix Safety
- No hardcoded quest logic in code. All triggers/gates are data-driven via `Dialog` fields and `QuestDefinition` assets.
- Extendable: add new `QuestCondition`/`QuestReward` types in data; interpret them in systems (e.g., inventory) without modifying core quest schema.