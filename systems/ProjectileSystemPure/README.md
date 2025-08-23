# ProjectileSystemPure

Minimal, deterministic projectile updates (position, velocity, TTL) for engine‑agnostic simulations.

## CLI
```bash
# Step a batch of projectiles (example harness)
npx ts-node systems/ProjectileSystemPure/cliHarness.ts systems/ProjectileSystemPure/fixtures/projectiles.json
```

## Remix‑Safe Hooks
- Override integration step (dt) and rounding via harness options
- Inject spawn/despawn rules externally (no engine coupling)
- Compose with CollisionSystemPure for hits; keep data contracts JSON‑only

## Scenario Links
- WitcherExplorerDemoPure: arrows/bolts in exploration encounters

## Contributing & Tests
- Keep updates pure and rounded for deterministic goldens
- Add golden tests in tests/ that run the CLI and compare JSON outputs