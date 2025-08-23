# NavigationSystemPure

Grid navigation with deterministic path output.

## CLI
```bash
npx ts-node systems/NavigationSystemPure/cliHarness.ts systems/NavigationSystemPure/fixtures/grid.json
```

## Remix‑Safe Hooks
- Provide grid topology/walls in JSON; pure path finders
- Compose with MountSystemPure for movement modifiers

## Scenario Links
- WitcherExplorerDemoPure: exploration pathing

## Contributing & Tests
- Golden paths for typical grids; include wall avoidance