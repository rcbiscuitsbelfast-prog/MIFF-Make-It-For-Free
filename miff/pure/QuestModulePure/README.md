# QuestModulePure

Plain-text quest definitions → normalized quest objects.

Schema highlights:
- Steps with triggers: talk | collect | defeat | timer
- Optional branching via `branch: condition->next, condition2->next2`
- Rewards: `xp <amount>`, `item <id> <amount>`, `currency <id> <amount>`

CLI usage:
```bash
npx ts-node cli/quest.ts systems/QuestModulePure/fixtures/branching.quest
```

Remix notes:
- Engine-agnostic; no runtime coupling
- Deterministic parsing and output