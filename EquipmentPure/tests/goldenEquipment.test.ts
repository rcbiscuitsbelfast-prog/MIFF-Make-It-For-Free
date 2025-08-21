import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';

test('golden equipment flow', () => {
  const root = path.resolve(__dirname, '..');
  const harness = path.resolve(root, 'cliHarness.ts');
  const catalog = path.resolve(root, 'sample_equipment.json');
  const commands = [
    { op: 'listEquipment' },
    { op: 'equip', itemId: 'dragon_lance', slot: 'weapon' },
    { op: 'equip', itemId: 'frost_armor', slot: 'armor' },
    { op: 'dumpModifiers' },
    { op: 'unequip', slot: 'weapon' },
    { op: 'syncInventory' }
  ];
  const cmdsPath = path.resolve(root, 'tests', 'commands.json');
  fs.writeFileSync(cmdsPath, JSON.stringify(commands, null, 2));
  const out = execFileSync('node', [harness, catalog, cmdsPath], { encoding: 'utf-8' });
  const got = JSON.parse(out);
  const expected = JSON.parse(fs.readFileSync(path.resolve(root, 'expected_output.json'), 'utf-8'));
  expect(got).toEqual(expected);
});

