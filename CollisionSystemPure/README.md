# CollisionSystemPure

Axis-aligned bounding box (AABB) collision detection with overlap computation, simple resolution, and trigger events.

## Schema (v12+ compatible)
- AABB: { id, min:{x,y}, max:{x,y}, isTrigger?:boolean }

## CLI
```bash
npx ts-node --compiler-options '{"module":"commonjs"}' CollisionSystemPure/cliHarness.ts CollisionSystemPure/sample_boxes.json CollisionSystemPure/tests/commands.json
```

Commands:
- list
- upsert <box>
- check
- resolve
- dump <id>

## Remix Hooks
- Feed positions from PhysicsSystemPure to update AABBs before check/resolve.
- Emit triggers to gameplay systems.