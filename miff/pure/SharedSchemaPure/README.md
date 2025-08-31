# SharedSchemaPure

Common reusable schema types for MIFF (v12). CLI-first, engine-agnostic, remix-safe.

## Types (v12)
- EntityID: string
- StatBlock: { key: string; base: number }[]
- ZoneRef: { zoneId: string }
- EquipmentRef: { itemId: string }
- QuestRef: { questId: string }

## CLI
```bash
npx ts-node --compiler-options '{"module":"commonjs"}' SharedSchemaPure/cliHarness.ts dumpTypes
```

Ops:
- dumpTypes
- list
- dump

## Remix Hooks
- Expose and re-export types for other modules to import.

## Dependencies
- None. Purely type/schema export module.