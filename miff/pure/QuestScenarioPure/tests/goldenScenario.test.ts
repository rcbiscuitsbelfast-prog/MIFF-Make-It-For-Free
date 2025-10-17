import path from 'path';
import fs from 'fs';

test('golden quest scenario', () => {
	const root = path.resolve(__dirname, '..');
	const harness = path.resolve(root, 'cliHarness.ts');
	const scenario = path.resolve(root, 'scenario.json');
	const out = (global as any).testUtils.runCLI(harness, [scenario, 'run']);
  const got = JSON.parse(out);
  expect(got.outputs[0!].op).toBe('runScenario');
  expect(got.outputs[0!].status).toBe('ok');
  expect(got.outputs[0!].finalState).toMatchObject({
    inventory: expect.objectContaining({ coin: 5, apple: 0 }),
    statuses: expect.arrayContaining([ expect.objectContaining({ type: 'bless' }) ])
  });
});