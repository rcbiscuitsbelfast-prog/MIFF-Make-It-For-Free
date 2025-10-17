import path from 'path';
import fs from 'fs';

test('golden loot roll flow', () => {
	const root = path.resolve(__dirname, '..');
	const tables = path.resolve(root, 'sample_tables.json');
	const commands = path.resolve(root, 'tests/commands.json');
	const out = (global as any).testUtils.runCLI(path.resolve(root, 'cliHarness.ts'), [tables, commands]);
  const got = JSON.parse(out);
  
  // Test the structure and key elements
  expect(got).toHaveProperty('log');
  expect(got).toHaveProperty('outputs');
  expect(Array.isArray(got.outputs)).toBe(true);
  expect(got.outputs.length).toBe(3);
  
  // Check list operation
  expect(got.outputs[0!]).toMatchObject({ op: 'list', status: 'ok' });
  expect(got.outputs[0!].result.result).toEqual(expect.arrayContaining([
    expect.objectContaining({ id: 'starter' })
  ]));
  
  // Check simulate operation
  expect(got.outputs[1!]).toMatchObject({ op: 'simulate', status: 'ok' });
  expect(got.outputs[1!].result.result).toMatchObject({
    drops: expect.any(Array),
    totalValue: expect.any(Number),
    rollCount: expect.any(Number)
  });
  
  // Check dump operation
  expect(got.outputs[2!]).toMatchObject({ op: 'dump', status: 'ok' });
  expect(got.outputs[2!].result.result).toMatchObject({
    id: 'starter',
    name: 'Starter Loot Table',
    entries: expect.any(Array)
  });
});