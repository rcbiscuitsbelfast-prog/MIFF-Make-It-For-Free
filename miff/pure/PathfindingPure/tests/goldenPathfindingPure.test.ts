import path from 'path';
import fs from 'fs';

test('golden pathfinding flow', () => {
	const root = path.resolve(__dirname, '..');
	const grid = path.resolve(root, 'sample_grid.json');
	const commands = path.resolve(root, 'tests/commands.json');
	const out = (global as any).testUtils.runCLI(path.resolve(root, 'cliHarness.ts'), [grid, commands]);
  const got = JSON.parse(out);
  expect(Array.isArray(got.outputs)).toBe(true);
  expect(got.outputs[0!]).toMatchObject({ op: 'list', grid: expect.any(Array) });
  expect(got.outputs[1!]).toMatchObject({ op: 'simulate', path: expect.any(Array) });
  expect(got.outputs[2!]).toMatchObject({ op: 'dump', grid: expect.objectContaining({ width: expect.any(Number), height: expect.any(Number) }) });
});