# EquipmentPure

Modular equipment system: equip/unequip, stat modifiers, inventory sync, and engine-agnostic hooks. Includes a CLI harness and golden tests.

## Schema

```ts
export type StatModifier = { stat: string; value: number };
export type EquippedItem = {
  id: string;
  name: string;
  slot: string; // weapon | armor | mount
  modifiers: StatModifier[];
  source: string; // e.g., inventory id
};
// GameData.equipment: { [slot: string]: EquippedItem }
```

## CLI

```bash
npx ts-node --compiler-options '{"module":"commonjs"}' EquipmentPure/cliHarness.ts EquipmentPure/sample_equipment.json EquipmentPure/tests/commands.json
```

Commands:
- listEquipment
- equip <itemId> <slot>
- unequip <slot>
- dumpModifiers
- syncInventory

## Remix Hooks

- onEquip(item)
- onUnequip(slot, item?)
- onModifierApplied(modifier, item)

## Golden Test

- `EquipmentPure/tests/goldenEquipment.test.ts` validates equip/unequip, modifiers, and inventory sync against `EquipmentPure/expected_output.json`.