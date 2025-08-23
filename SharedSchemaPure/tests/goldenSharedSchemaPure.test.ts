import { execFileSync } from 'child_process';
import path from 'path';

test('golden dumpTypes output', () => {
  const harness = path.resolve(__dirname, '..', 'cliHarness.ts');
  const out = execFileSync('npx', ['ts-node', '--compiler-options', '{"module":"commonjs"}', harness, 'dumpTypes'], { encoding: 'utf-8' });
  const got = JSON.parse(out);
  const expected = { outputs: [ { op: 'dumpTypes', status: 'ok', issues: [], resolvedRefs: {}, types: ['EntityID','StatBlock','ZoneRef','EquipmentRef','QuestRef'] } ] };
  expect(got).toEqual(expected);
});