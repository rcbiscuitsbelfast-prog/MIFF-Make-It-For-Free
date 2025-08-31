# CutsceneSystemPure

Timed track executor for scripted sequences.

## CLI
```bash
npx ts-node systems/CutsceneSystemPure/cliHarness.ts systems/CutsceneSystemPure/fixtures/cutscene.json
```

## Remix‑Safe Hooks
- Define track commands externally; keep timeline JSON only
- Compose with AudioBridgePure and CameraBridgePure for effects

## Scenario Links
- WitcherExplorerDemoPure: intro/outro sequences

## Contributing & Tests
- Golden tests validating event ordering and timings