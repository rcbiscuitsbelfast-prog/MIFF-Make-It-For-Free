# DialogueSystemPure

Branching dialogue nodes with choice navigation.

## CLI
```bash
npx ts-node systems/DialogueSystemPure/cliHarness.ts systems/DialogueSystemPure/fixtures/dialogue.json
```

## Remix‑Safe Hooks
- Keep nodes in JSON; extend choice gating externally
- Compose with QuestModulePure for flags and rewards

## Scenario Links
- WitcherExplorerDemoPure: conversations and branching choices

## Contributing & Tests
- Golden tests for next-node evaluation and invalid choices