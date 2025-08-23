# AutoBuilderCLI

Generate a web demo (demo.html) from a scenario pack using RenderPayloadPure and ConvertToWebPure.

Usage:

```bash
npx ts-node AutoBuilderCLI/cli.ts TopplerDemoPure --fps 24 --debug --out toppler.html
npx ts-node AutoBuilderCLI/cli.ts SpiritTamerDemoPure --out demo.html
```

Conventions:
- Scenario module path: `<Name>/ScenarioPack<Name>.ts`
- Supported exports: `generateGameState()`, `toGameState()`, or `runScenario()`
- If `runScenario()` is used, the CLI adapts the result into a minimal `GameState`.

Flags:
- `--fps <number>`: playback rate (default 30)
- `--debug`: overlay HUD
- `--out <path>`: output HTML path (default ./demo.html)

Remix-safe and engine-agnostic. Works with ts-node or bundlers.