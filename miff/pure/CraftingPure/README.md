# CraftingPure

Schema v13. Recipes that consume inputs to produce outputs and optional stat modifiers.

## Schema (v13)
- Recipe: { id: string; inputs: Record<string,number>; outputs: Record<string,number>; statMods?: StatBlock }
- Inventory: Record<string,number>

## CLI
```bash
npx ts-node --compiler-options '{"module":"commonjs"}' CraftingPure/cliHarness.ts CraftingPure/sample_recipes.json CraftingPure/tests/commands.json
```

Ops:
- list
- create
- simulate
- dump

Output format:
- { op, status, result, issues }

## Remix Hooks
- onCraftComplete(recipeId, result)

## Dependencies
- Reuses `StatBlock` from `SharedSchemaPure`