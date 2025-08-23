# StatsSystemPure

Minimal stats system with CRUD and simulate methods. Engine-agnostic; includes CLI harness and golden test.

## Schema (v12 additions)
- GameData.stats: EntityStats[]
- EntityStats: { id: string; stats: { key: string; base: number }[] }

## CLI
```bash
npx ts-node --compiler-options '{"module":"commonjs"}' StatsSystemPure/cliHarness.ts StatsSystemPure/sample_stats.json StatsSystemPure/tests/commands.json
```

Commands:
- list
- create <id> [stats]
- setStat <id> <key> <base>
- simulate <id>
- dump <id>

## Remix Hooks
- Integrate with Combat or SkillTree by layering modifiers on top of base stats.
- Extend simulate() to compute derived values (DPS, EHP) as needed.