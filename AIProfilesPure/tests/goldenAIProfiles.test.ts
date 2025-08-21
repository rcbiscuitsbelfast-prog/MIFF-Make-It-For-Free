import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';

test('golden AI profiles flow', () => {
  const root = path.resolve(__dirname, '..');
  const harness = path.resolve(root, 'cliHarness.ts');
  const profiles = path.resolve(root, 'sample_profiles.json');
  const commands = [
    { op: 'listProfiles' },
    { op: 'simulateBehavior', npcId: 'elder' },
    { op: 'simulateBehavior', npcId: 'merchant' },
    { op: 'simulateBehavior', npcId: 'guard1' },
    { op: 'assignRole', npcId: 'merchant', role: 'wanderer' },
    { op: 'simulateBehavior', npcId: 'merchant' },
    { op: 'dumpSchedule', npcId: 'merchant' }
  ];
  const cmdsPath = path.resolve(root, 'tests', 'commands.json');
  fs.writeFileSync(cmdsPath, JSON.stringify(commands, null, 2));
  const out = execFileSync('node', [harness, profiles, cmdsPath], { encoding: 'utf-8' });
  const got = JSON.parse(out);
  const expected = JSON.parse(fs.readFileSync(path.resolve(root, 'expected_output.json'), 'utf-8'));
  expect(got).toEqual(expected);
});

