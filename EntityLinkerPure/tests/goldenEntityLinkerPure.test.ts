import path from 'path';
import fs from 'fs';

test('golden resolveRefs output', () => {
	const root = path.resolve(__dirname, '..');
	const links = path.resolve(root, 'sample_links.json');
	const extern = path.resolve(root, 'sample_extern.json');
	const commands = path.resolve(root, 'tests/commands.json');
	const out = (global as any).testUtils.runCLI(path.resolve(root, 'cliHarness.ts'), [links, extern, commands]);
	const got = JSON.parse(out);
	const expected = JSON.parse(fs.readFileSync(path.resolve(root, 'expected_output.json'), 'utf-8'));
	expect(got).toEqual(expected);
});