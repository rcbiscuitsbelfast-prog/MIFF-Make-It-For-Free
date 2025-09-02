const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

test('golden quest scenario', () => {
	const root = path.resolve(__dirname, '..');
	const harness = path.resolve(root, 'cliHarness.ts');
	const scenario = path.resolve(root, 'scenario.json');
	const out = execFileSync('npx', ['ts-node', '--compiler-options', '{"module":"commonjs"}', harness, scenario, 'run'], { encoding: 'utf-8' });
	const got = JSON.parse(out);
	const expected = JSON.parse(fs.readFileSync(path.resolve(root, 'expected_output.json'), 'utf-8'));
	expect(got).toEqual(expected);
});