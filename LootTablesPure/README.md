# LootTablesPure

Schema v13. Deterministic loot rolling for golden tests; production can inject RNG.

## Schema (v13)
- LootEntry: { id, weight, rarity, statRolls? }
- LootTable: { id, entries: LootEntry[] }

## CLI
```bash
npx ts-node --compiler-options '{"module":"commonjs"}' LootTablesPure/cliHarness.ts LootTablesPure/sample_tables.json LootTablesPure/tests/commands.json
```

Ops:
- list
- create
- simulate
- dump

Output format:
- { op, status, result, issues }

## Remix Hooks
- onLootDrop(tableId, drops)
- Inject RNG or selection strategy for non-deterministic environments

## Dependencies
- None