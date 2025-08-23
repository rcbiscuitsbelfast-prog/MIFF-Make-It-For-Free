# StatusEffectsPure

Discrete-time status effects simulation. Schema v12. Engine-agnostic.

## Schema (v12)
- StatusEffect: { id: string; type: 'poison'|'regen'; magnitude: number; duration: number }
- StatusEntity: { id: string; hp: number; effects: StatusEffect[] }

## CLI
```bash
npx ts-node --compiler-options '{"module":"commonjs"}' StatusEffectsPure/cliHarness.ts StatusEffectsPure/sample_status.json StatusEffectsPure/tests/commands.json
```

Commands:
- list
- create <id> <hp> [effects]
- simulate <id>
- dump <id>

## Remix Hooks
- onEffectApplied(entityId, effect)
- onEffectExpired(entityId, effectId)
- onHpChanged(entityId, delta)

## Dependencies
- None. Optionally combine with `StatsSystemPure` for derived resistances.