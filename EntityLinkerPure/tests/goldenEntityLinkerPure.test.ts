import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';

test('golden resolveRefs output', () => {
  const root = path.resolve(__dirname, '..');
  const harness = path.resolve(root, 'cliHarness.ts');
  const sample = path.resolve(root, 'sample_links.json');
  const extern = path.resolve(root, 'sample_extern.json');
  const commands = [ { op: 'resolveRefs' } ];
  const cmdsPath = path.resolve(root, 'tests', 'commands.json');
  fs.writeFileSync(cmdsPath, JSON.stringify(commands, null, 2));
  const out = execFileSync('node', [harness, sample, extern, cmdsPath], { encoding: 'utf-8' });
  const got = JSON.parse(out);
  const expected = JSON.parse(fs.readFileSync(path.resolve(root, 'expected_output.json'), 'utf-8'));
  expect(got).toEqual(expected);
});