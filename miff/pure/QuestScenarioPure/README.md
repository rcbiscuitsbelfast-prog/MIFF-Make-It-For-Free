# QuestScenarioPure

Schema v13. Branching questline with NPC interaction, inventory changes, and status effects.

## Scenario
- NPCs: villager
- Inventory: apple
- Branches: deterministic first-choice selection for golden test

## CLI
```bash
npx ts-node --compiler-options '{"module":"commonjs"}' QuestScenarioPure/cliHarness.ts QuestScenarioPure/scenario.json run
```

Output format:
- { op, status, events, finalState }

## Remix Hooks
- onScenarioStart(scenario)
- onQuestComplete(questId)
- onStatusApplied(entityId, effect)

## Dependencies
- References `QuestsPure`, `InventoryPure`, `StatusEffectsPure` concepts in a pure, simulated fashion