import path from 'path';
import fs from 'fs';

test('golden collision flow', () => {
	const root = path.resolve(__dirname, '..');
	const sample = path.resolve(root, 'sample_boxes.json');
	const commands = path.resolve(root, 'tests/commands.json');
	const out = (global as any).testUtils.runCLI(path.resolve(root, 'cliHarness.ts'), [sample, commands]);
  const got = JSON.parse(out);
  expect(Array.isArray(got.outputs)).toBe(true);
  expect(got.outputs[0]).toMatchObject({ op: 'list', result: { ids: expect.arrayContaining(['player','wall1','enemy1']) } });
  expect(got.outputs[1]).toMatchObject({ op: 'check', result: { collisions: expect.any(Array), triggers: expect.any(Array) } });
  expect(got.outputs[2]).toMatchObject({ op: 'resolve', result: { collisions: expect.any(Array), resolved: expect.any(Array) } });
  expect(got.outputs[3]).toMatchObject({ op: 'dump' });
});