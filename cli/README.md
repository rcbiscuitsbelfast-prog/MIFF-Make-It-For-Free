# MIFF Contributor CLI Tools (Phase 5)

Utilities to simulate, diff, and bootstrap scenarios without engine setup.

## miff-simulate
```bash
npx ts-node --compiler-options '{"module":"commonjs"}' cli/miff-simulate.ts TutorialScenarioPure/scenario.json --verbose --dump-state
```
- Input: scenario.json
- Output: { outputs:[ { op, status, events, finalState } ] }
- Flags: --verbose, --seed <value>, --dump-state
- Remix hooks: future RNG injection via --seed and adapters

## miff-diff
```bash
npx ts-node --compiler-options '{"module":"commonjs"}' cli/miff-diff.ts out_left.json out_right.json
```
- Compares two run outputs
- Highlights differences in events and finalState
- Output: { outputs:[ { op:'diff', status, events:[...], finalState:[...] } ] }

## miff-init
```bash
npx ts-node --compiler-options '{"module":"commonjs"}' cli/miff-init.ts MyScenarioPure tutorial
```
- Bootstraps a new scenario pack with scenario.json, cliHarness.ts, README, and a golden test
- Templates: tutorial | quest | combat

## Golden Tests
- Use scenario READMEs and expected outputs; integrate simulate/diff in CI workflows