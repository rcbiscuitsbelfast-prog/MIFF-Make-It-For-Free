import path from 'path';
import fs from 'fs';

test('golden time flow', () => {
	const root = path.resolve(__dirname, '..');
	const commands = path.resolve(root, 'tests/commands.json');
	const out = (global as any).testUtils.runCLI(path.resolve(root, 'cliHarness.ts'), [commands]);
	const got = JSON.parse(out);
	const expectedPath = path.resolve(root, 'expected_output.json');
	console.log('Expected file path:', expectedPath);
	console.log('Expected file exists:', fs.existsSync(expectedPath));
	const expected = JSON.parse(fs.readFileSync(expectedPath, 'utf-8'));
	console.log('Expected keys:', Object.keys(expected));
	console.log('Got keys:', Object.keys(got));
	expect(got).toEqual(expected);
});