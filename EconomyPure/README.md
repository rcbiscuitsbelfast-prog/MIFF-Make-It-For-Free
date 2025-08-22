# EconomyPure

Schema v13. Item pricing and vendor logic with deterministic pricing.

## Schema (v13)
- PriceRule: { id, itemId, basePrice, modifiers? }
- VendorState: { id, inventory, markup, markdown }

## CLI
```bash
npx ts-node --compiler-options '{"module":"commonjs"}' EconomyPure/cliHarness.ts EconomyPure/sample_economy.json EconomyPure/tests/commands.json
```

Ops:
- list
- createRule
- createVendor
- simulate
- dumpRule
- dumpVendor

Output format:
- { op, status, result, issues }

## Remix Hooks
- onPriceChange(vendorId, itemId, price)

## Dependencies
- None