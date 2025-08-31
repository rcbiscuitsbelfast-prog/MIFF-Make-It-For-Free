# PhysicsSystemPure

Deterministic 2D physics stepper with velocity, gravity, friction, and movement updates. Engine-agnostic and remix-safe.

## Schema (v12+ compatible)
- World: { defaultGravity?: {x,y}, defaultFriction?: number, bodies: Body[] }
- Body: { id, position:{x,y}, velocity:{x,y}, mass:number, gravity?:{x,y}, friction?:number }

## CLI
```bash
npx ts-node --compiler-options '{"module":"commonjs"}' PhysicsSystemPure/cliHarness.ts PhysicsSystemPure/sample_world.json PhysicsSystemPure/tests/commands.json
```

Commands:
- list
- create <body>
- step <dt>
- dump <id>

## Remix Hooks
- Compose with CollisionSystemPure to resolve overlaps after step.
- Compose with TimeSystemPure to schedule fixed-delta updates.