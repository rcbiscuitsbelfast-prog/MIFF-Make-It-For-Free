import path from 'path';
import fs from 'fs';

test('golden physics flow', () => {
	const root = path.resolve(__dirname, '..');
	const sample = path.resolve(root, 'sample_world.json');
	const commands = path.resolve(root, 'tests/commands.json');
	const out = (global as any).testUtils.runCLI(path.resolve(root, 'cliHarness.ts'), [sample, commands]);
  const got = JSON.parse(out);
  expect(Array.isArray(got.outputs)).toBe(true);
  expect(got.outputs[0]).toMatchObject({ op: 'list', ids: expect.arrayContaining(['b1']) });
  expect(got.outputs[1]).toMatchObject({ op: 'step', dt: expect.any(Number), updated: expect.any(Array) });
  expect(got.outputs[2]).toMatchObject({ op: 'dump', body: expect.objectContaining({ id: 'b1' }) });
});