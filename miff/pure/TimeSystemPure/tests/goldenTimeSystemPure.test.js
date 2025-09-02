const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

test('golden time flow', () => {
	const root = path.resolve(__dirname, '..');
	const commands = path.resolve(root, 'tests/commands.json');
	const cli = path.resolve(root, 'cliHarness.ts');
	const out = execFileSync('npx', ['ts-node', '--compiler-options', '{"module":"commonjs"}', cli, commands], { encoding: 'utf-8' });
	const got = JSON.parse(out);
	
	// Extract the runScenario output from the outputs array
	expect(got.outputs).toBeDefined();
	expect(got.outputs).toHaveLength(1);
	expect(got.outputs[0].op).toBe('runScenario');
	expect(got.outputs[0].status).toBe('ok');
	
	const expected = JSON.parse(fs.readFileSync(path.resolve(root, 'expected_output.json'), 'utf-8'));
	expect(got).toEqual(expected);
});