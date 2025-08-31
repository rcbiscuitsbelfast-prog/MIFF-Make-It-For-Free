# CameraBridgePure

Simple follow/lerp camera bridge for engine‑agnostic rendering.

## CLI
```bash
npx ts-node systems/CameraBridgePure/cliHarness.ts systems/CameraBridgePure/fixtures/camera.json
```

## Remix‑Safe Hooks
- Swap follow strategy (snap/lerp) via harness
- Keep outputs JSON for renderer adapters (Web/Unity/Godot)

## Scenario Links
- WitcherExplorerDemoPure: exploration camera, dialogue framing

## Contributing & Tests
- Test lerp stability and rounding; compare golden positions