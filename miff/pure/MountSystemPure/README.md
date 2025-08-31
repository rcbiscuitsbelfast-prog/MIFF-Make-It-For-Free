# MountSystemPure

Mount/dismount entities with a pure, overridable state machine.

## CLI
```bash
npx ts-node systems/MountSystemPure/cliHarness.ts systems/MountSystemPure/fixtures/mounts.json
```

## Remix‑Safe Hooks
- Define mount rules externally; keep state output JSON
- Compose with NavigationSystemPure for speed modifiers

## Scenario Links
- WitcherExplorerDemoPure: horse mounts and travel boosts

## Contributing & Tests
- Golden tests for mount/dismount sequences and edge cases