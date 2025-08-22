# CombatCorePure

Core, engine-agnostic combat resolution. Schema v12. Provides list/create/simulate/dump via CLI.

## Schema (v12)
- CombatEntity: { id: string; hp: number; atk: number; def: number }
- Sample file: { entities: CombatEntity[] }

## CLI
```bash
npx ts-node --compiler-options '{"module":"commonjs"}' CombatCorePure/cliHarness.ts CombatCorePure/sample_combat.json CombatCorePure/tests/commands.json
```

Commands:
- list
- create <id> <hp> <atk> <def>
- simulate <attackerId> <defenderId>
- dump <id>

## Remix Hooks
- onCombatVictory(attackerId, defenderId)
- onDamageApplied(entityId, amount)

## Dependencies
- None. Integrates with `StatsSystemPure` or `SkillTreePure` via external modifiers.