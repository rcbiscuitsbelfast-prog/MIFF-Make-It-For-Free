# CombatScenarioPure

Schema v13. Arena-style combat with loot and simple progression.

## Scenario
- Enemies: slime, goblin
- Loot: references starter table concept
- Progression: +XP per win

## CLI
```bash
npx ts-node --compiler-options '{"module":"commonjs"}' CombatScenarioPure/cliHarness.ts CombatScenarioPure/scenario.json run
```

Output format:
- { op, status, events, finalState }

## Remix Hooks
- onScenarioStart(scenario)
- onCombatVictory(attackerId, defenderId)
- onLootDrop(sourceId, drops)

## Dependencies
- References `CombatCorePure` and `LootTablesPure` concepts in a pure, simulated fashion