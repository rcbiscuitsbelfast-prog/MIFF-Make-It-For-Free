import path from 'path';
import fs from 'fs';

test('golden equipment flow', () => {
	const root = path.resolve(__dirname, '..');
	const equipment = path.resolve(root, 'sample_equipment.json');
	const commands = path.resolve(root, 'tests/commands.json');
  const out = (global as any).testUtils.runCLI(path.resolve(root, 'cliHarness.ts'), [equipment, commands]);
  const got = JSON.parse(out);
  // Assert deterministic shape and key fields without relying on external fixture count
  expect(Array.isArray(got.outputs)).toBe(true);
  expect(got.outputs.length).toBe(6);
  // ops sequence
  expect(got.outputs.map((o: any) => o.op)).toEqual([
    'listEquipment','equip','equip','dumpModifiers','unequip','syncInventory'
  ]);
  // listEquipment payload shape
  expect(got.outputs[0!].equipped).toEqual([
    { slot:'weapon', item:null },
    { slot:'armor', item:null },
    { slot:'mount', item:null },
  ]);
  // modifiers payload shape - unwrap EquipmentOutput result
  expect(got.outputs[3!].modifiers.result).toEqual([
    { stat:'atk', value:10 },
    { stat:'spd', value:2 },
    { stat:'def', value:8 },
    { stat:'hp', value:20 },
  ]);
});

