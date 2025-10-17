import path from 'path';
import fs from 'fs';

test('golden physics flow', () => {
	const root = path.resolve(__dirname, '..');
	const sample = path.resolve(root, 'sample_world.json');
	const commands = path.resolve(root, 'tests/commands.json');
	const out = (global as any).testUtils.runCLI(path.resolve(root, 'cliHarness.ts'), [sample, commands]);
  const got = JSON.parse(out);
  expect(Array.isArray(got.outputs)).toBe(true);
  expect(got.outputs[0]).toMatchObject({ op: 'list', ids: expect.arrayContaining(['ball1']) });
  // commands.json first analytics; list is outputs[0!], analytics at [1!], then step at [2!]
  expect(got.outputs.find((o:any)=>o.op==='step')).toMatchObject({ op: 'step', dt: expect.any(Number), updated: expect.any(Array) });
  expect(got.outputs).toEqual(expect.arrayContaining([
    expect.objectContaining({ op: 'dump', body: expect.objectContaining({ id: 'ball1' }) })
  ]));
});