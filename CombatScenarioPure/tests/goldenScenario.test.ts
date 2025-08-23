import path from 'path';
import fs from 'fs';

test('golden combat scenario', () => {
	const root = path.resolve(__dirname, '..');
	const harness = path.resolve(root, 'cliHarness.ts');
	const scenario = path.resolve(root, 'scenario.json');
	const out = (global as any).testUtils.runCLI(harness, [scenario, 'run']);
	const got = JSON.parse(out);
	const expected = JSON.parse(fs.readFileSync(path.resolve(root, 'expected_output.json'), 'utf-8'));
	expect(got).toEqual(expected);
});