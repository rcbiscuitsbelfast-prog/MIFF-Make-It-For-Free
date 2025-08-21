import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';

test('golden quest flow', () => {
  const root = path.resolve(__dirname, '..');
  const harness = path.resolve(root, 'cliHarness.ts');
  const npc = path.resolve(root, 'sample_quest_npc.json');
  const out = execFileSync('node', [harness, npc, '1234'], {encoding: 'utf-8'});
  const got = JSON.parse(out);
  const expected = JSON.parse(fs.readFileSync(path.resolve(root, 'expected_quest.json'), 'utf-8'));
  expect(got).toEqual(expected);
});