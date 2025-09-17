import path from 'path';
// Use standardized runCLI from global test utils (jest.setup.js)

test('golden dumpTypes output', () => {
  const harness = path.resolve(__dirname, '..', 'cliHarness.ts');
  const out = (global as any).testUtils.runCLI(harness, ['dumpTypes']);
  const got = JSON.parse(out);
  const expected = { outputs: [ { op: 'dumpTypes', status: 'ok', issues: [], resolvedRefs: {}, types: ['EntityID','StatBlock','ZoneRef','EquipmentRef','QuestRef'] } ] };
  expect(got).toEqual(expected);
});