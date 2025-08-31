# ScoreSystemPure

Additive/multiplicative scoring pipeline with deterministic rounding.

## CLI
```bash
npx ts-node systems/ScoreSystemPure/cliHarness.ts systems/ScoreSystemPure/fixtures/score_events.json
```

## Remix‑Safe Hooks
- Bind score events from any module; keep contract {type,value} JSON
- Fold with session multipliers externally (no engine coupling)

## Scenario Links
- WitcherExplorerDemoPure: exploration milestones & collectibles

## Contributing & Tests
- Cover add/mult composition and overflow bounds in golden tests