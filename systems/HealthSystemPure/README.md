# HealthSystemPure

Clamped damage/heal pipeline with deterministic outcomes.

## CLI
```bash
npx ts-node systems/HealthSystemPure/cliHarness.ts systems/HealthSystemPure/fixtures/health_events.json
```

## Remix‑Safe Hooks
- Inject damage formulas externally; keep inputs/outputs JSON
- Compose with StatusEffectsPure for modifiers

## Scenario Links
- WitcherExplorerDemoPure: NPC encounters and hazards

## Contributing & Tests
- Edge cases: zero/overmax clamping, chained events