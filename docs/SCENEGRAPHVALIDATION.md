# Scene Graph Validation

## Per-Zone Setup
- Minimal `scene` with `entities` array and `addEntity()` logging
- Add a `player` (or cursor) entity upon assets ready/boot

## Logs
- `[Scene] Entity added: <entity>`
- `[Scene] Entities count: <n>`

## Steps
1. Confirm at least one entity is added early in boot.
2. Verify scene count increases as gameplay initializes.