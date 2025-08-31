# InputSystemPure

Map raw input events (keys/taps) to actions with deterministic ordering.

## CLI
```bash
npx ts-node systems/InputSystemPure/cliHarness.ts systems/InputSystemPure/fixtures/inputs.json
```

## Remix‑Safe Hooks
- Provide bindings in JSON; keep mapping pure
- Compose with RhythmSystemPure for timed taps

## Scenario Links
- WitcherExplorerDemoPure: interaction, dialogue advance, map toggles

## Contributing & Tests
- Cover binding conflicts and ordering; golden fixtures compare action streams