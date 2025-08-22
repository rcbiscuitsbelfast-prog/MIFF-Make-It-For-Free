import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';

test('golden crafting flow', () => {
  const root = path.resolve(__dirname, '..');
  const harness = path.resolve(root, 'cliHarness.ts');
  const sample = path.resolve(root, 'sample_recipes.json');
  const commands = [
    { op: 'list' },
    { op: 'simulate', recipeId: 'potion', inventory: { herb: 3, water: 1 } },
    { op: 'dump', id: 'potion' }
  ];
  const cmdsPath = path.resolve(root, 'tests', 'commands.json');
  fs.writeFileSync(cmdsPath, JSON.stringify(commands, null, 2));
  const out = execFileSync('node', [harness, sample, cmdsPath], { encoding: 'utf-8' });
  const got = JSON.parse(out);
  const expected = JSON.parse(fs.readFileSync(path.resolve(root, 'expected_output.json'), 'utf-8'));
  expect(got).toEqual(expected);
});