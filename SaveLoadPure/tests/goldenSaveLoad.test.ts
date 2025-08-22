import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';

test('golden save/load/delete/rollback flow', () => {
  const root = path.resolve(__dirname, '..');
  const harness = path.resolve(root, 'cliHarness.ts');
  const saveFile = path.resolve('SaveLoadPure/tests/sample_save_state.json');

  const commands = [
    { op: 'listSlots' },
    { op: 'load', slotId: 'slot-a' },
    { op: 'setRollback', slotId: 'slot-a' },
    { op: 'save', slotId: 'slot-c' },
    { op: 'listSlots' },
    { op: 'rollback', slotId: 'slot-c' },
    { op: 'delete', slotId: 'slot-b' },
    { op: 'dumpState' }
  ];
  const cmdsPath = path.resolve(root, 'tests', 'commands.json');
  fs.mkdirSync(path.dirname(cmdsPath), { recursive: true });
  fs.writeFileSync(cmdsPath, JSON.stringify(commands, null, 2));

  const out = execFileSync('npx', ['ts-node', '--compiler-options', '{"module":"commonjs"}', harness, cmdsPath, saveFile], { encoding: 'utf-8' });
  const got = JSON.parse(out);

  // Basic invariants (timestamps are dynamic, so avoid strict equality)
  expect(got).toHaveProperty('data');
  expect(got.data).toHaveProperty('schemaVersion', 11);
  expect(got.data).toHaveProperty('currentSlot', 'slot-c');
  expect(got.data).toHaveProperty('saves');
  expect(got.data.saves).toHaveProperty('slot-a');
  expect(got.data.saves).toHaveProperty('slot-c');
  expect(got.data.saves).not.toHaveProperty('slot-b');
});

