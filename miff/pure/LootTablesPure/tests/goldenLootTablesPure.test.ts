import path from 'path';
import fs from 'fs';

test('golden loot roll flow', () => {
	const root = path.resolve(__dirname, '..');
	const tables = path.resolve(root, 'sample_tables.json');
	const commands = path.resolve(root, 'tests/commands.json');
	const out = (global as any).testUtils.runCLI(path.resolve(root, 'cliHarness.ts'), [tables, commands]);
  const got = JSON.parse(out);
  expect(Array.isArray(got.outputs)).toBe(true);
  expect(got.outputs[0]).toMatchObject({ op: 'list', result: expect.arrayContaining(['starter']) });
  expect(got.outputs[1]).toMatchObject({ op: 'simulate', result: expect.objectContaining({ drops: expect.any(Array) }) });
  expect(got.outputs[2]).toMatchObject({ op: 'dump', result: expect.objectContaining({ id: 'starter' }) });
});