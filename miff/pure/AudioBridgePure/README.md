# AudioBridgePure

Abstract audio commands (play/stop/setVolume) for engine adapters.

## CLI
```bash
npx ts-node systems/AudioBridgePure/cliHarness.ts systems/AudioBridgePure/fixtures/audio.json
```

## Remix‑Safe Hooks
- Map IDs to assets externally; keep commands pure
- Defer mixing to adapter layers

## Scenario Links
- WitcherExplorerDemoPure: ambient loops, UI clicks

## Contributing & Tests
- Golden fixtures should verify applied command sequences