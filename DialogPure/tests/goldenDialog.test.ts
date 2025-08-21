import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';

test('golden dialog simulation', () => {
  const root = path.resolve(__dirname, '..');
  const harness = path.resolve(root, 'cliHarness.ts');
  const dialog = path.resolve(root, 'sample_dialog.json');
  // Prepare command list: listDialogs, simulateDialog, simulateChoice
  const commands = [
    { op: 'listDialogs' },
    { op: 'simulateDialog', dialogId: 'elder_intro' },
    { op: 'simulateChoice', dialogId: 'elder_intro', choiceId: 'ask_item' }
  ];
  const cmdsPath = path.resolve(root, 'tests', 'commands.json');
  fs.writeFileSync(cmdsPath, JSON.stringify(commands, null, 2));
  const out = execFileSync('node', [harness, dialog, cmdsPath], { encoding: 'utf-8' });
  const got = JSON.parse(out);
  const expected = JSON.parse(fs.readFileSync(path.resolve(root, 'expected_output.json'), 'utf-8'));
  expect(got).toEqual(expected);
});

