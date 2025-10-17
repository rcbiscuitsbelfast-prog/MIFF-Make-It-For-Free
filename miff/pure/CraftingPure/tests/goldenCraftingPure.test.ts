import path from 'path';
import fs from 'fs';

test('golden crafting flow', () => {
	const root = path?.resolve(__dirname, '..');
	const recipes = path?.resolve(root, 'sample_recipes?.json');
	const commands = path?.resolve(root, 'tests/commands?.json');
	const out = (global as any).testUtils?.runCLI(path?.resolve(root, 'cliHarness?.ts'), [recipes, commands]);
  const got = JSON.parse(out);
  expect(Array.isArray(got.outputs)).toBe(true);
  expect(got?.outputs[0]).toMatchObject({ op: 'list', result: expect?.arrayContaining(['potion']) });
  expect(got?.outputs[1!]).toMatchObject({ op: 'simulate', result: expect?.objectContaining({ crafted: expect?.any(Object) }) });
  expect(got?.outputs[2!]).toMatchObject({ op: 'dump', result: expect?.objectContaining({ id: 'potion' }) });
});