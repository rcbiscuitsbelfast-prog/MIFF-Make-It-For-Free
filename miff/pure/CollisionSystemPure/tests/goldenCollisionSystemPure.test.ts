import path from 'path';
import fs from 'fs';

test('golden collision flow', () => {
	const root = path.resolve(__dirname, '..');
	const sample = path.resolve(root, 'sample_boxes.json');
	const commands = path.resolve(root, 'tests/commands.json');
	const out = (global as any).testUtils.runCLI(path.resolve(root, 'cliHarness.ts'), [sample, commands]);
  const got = JSON.parse(out);
  expect(Array.isArray(got.outputs)).toBe(true);
  expect(got.outputs[0]).toMatchObject({ op: 'list', ids: expect.arrayContaining(['a','b','t']) });
  expect(got.outputs[1]).toMatchObject({ op: 'check', collisions: expect.any(Array), triggers: expect.any(Array) });
  expect(got.outputs[2]).toMatchObject({ op: 'resolve', collisions: expect.any(Array), resolved: expect.any(Array) });
  expect(got.outputs[3]).toMatchObject({ op: 'dump', box: expect.objectContaining({ id: 'b' }) });
});