# TutorialScenarioPure

Schema v13. Walkthrough of basic systems: stats, quests, and combat.

## Scenario
- Entities: hero, slime
- Steps: show stats, start quest, combat

## CLI
```bash
npx ts-node --compiler-options '{"module":"commonjs"}' TutorialScenarioPure/cliHarness.ts TutorialScenarioPure/scenario.json run
```

Output format:
- { op, status, events, finalState }

## Remix Hooks
- onScenarioStart(scenario)
- onQuestComplete(questId)
- onCombatVictory(attackerId, defenderId)

## Dependencies
- References `StatsSystemPure`, `QuestsPure`, `CombatCorePure` concepts in a pure, simulated fashion