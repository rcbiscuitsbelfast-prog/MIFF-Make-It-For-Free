import path from 'path';
import fs from 'fs';

test('golden economy flow', () => {
	const root = path.resolve(__dirname, '..');
	const economy = path.resolve(root, 'sample_economy.json');
	const commands = path.resolve(root, 'tests/commands.json');
	const out = (global as any).testUtils.runCLI(path.resolve(root, 'cliHarness.ts'), [economy, commands]);
  const got = JSON.parse(out);
  expect(Array.isArray(got.outputs)).toBe(true);
  expect(got.outputs[0]).toMatchObject({ op: 'list', result: expect.arrayContaining(['r_potion','shop']) });
  expect(got.outputs[1]).toMatchObject({ op: 'simulate', result: expect.objectContaining({ itemId: 'potion' }) });
  expect(got.outputs[2]).toMatchObject({ op: 'dumpVendor', result: expect.objectContaining({ id: 'shop' }) });
  expect(got.outputs[3]).toMatchObject({ op: 'dumpRule', result: expect.objectContaining({ id: 'r_potion', itemId: 'potion' }) });
});