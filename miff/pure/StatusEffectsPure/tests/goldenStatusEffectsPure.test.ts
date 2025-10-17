import path from 'path';
import fs from 'fs';

test('golden status effects flow', () => {
	const root = path.resolve(__dirname, '..');
	const status = path.resolve(root, 'sample_status.json');
	const commands = path.resolve(root, 'tests/commands.json');
	const out = (global as any).testUtils.runCLI(path.resolve(root, 'cliHarness.ts'), [status, commands]);
  const got = JSON.parse(out);
  expect(Array.isArray(got.outputs)).toBe(true);
  expect(got.outputs[0]).toMatchObject({ op: 'list', ids: expect.arrayContaining(['hero']) });
  expect(got.outputs[1]).toMatchObject({ id: 'hero', hpDelta: -2 });
  expect(got.outputs[2]).toMatchObject({ op: 'dump', id: 'hero' });
  expect(got.outputs[2].effects).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: 'p1', category: 'poison', magnitude: 2 })
    ])
  );
});