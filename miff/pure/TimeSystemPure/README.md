# TimeSystemPure

Deterministic time utilities providing timers, cooldowns, frame tracking, and simple scheduling. Engine-agnostic and remix-safe.

## Schema (v12+ compatible)
- Timer: { id, duration, remaining, repeat? }
- Cooldown: { id, duration, remaining }
- Scheduled: { id, at, payload? }

## CLI
```bash
npx ts-node --compiler-options '{"module":"commonjs"}' TimeSystemPure/cliHarness.ts TimeSystemPure/tests/commands.json
```

Commands:
- list
- addTimer <timer>
- addCooldown <id> <duration>
- schedule <id> <at>
- cancel <id>
- tick <dt>
- dump

## Remix Hooks
- Use with fixed-delta loops to drive PhysicsSystemPure and CollisionSystemPure.