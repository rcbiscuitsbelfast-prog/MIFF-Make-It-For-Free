import path from 'path';
import fs from 'fs';

test('golden crafting flow', () => {
	const root = path.resolve(__dirname, '..');
	const recipes = path.resolve(root, 'sample_recipes.json');
	const commands = path.resolve(root, 'tests/commands.json');
	const out = (global as any).testUtils.runCLI(path.resolve(root, 'cliHarness.ts'), [recipes, commands]);
	const got = JSON.parse(out);
	const expected = JSON.parse(fs.readFileSync(path.resolve(root, 'expected_output.json'), 'utf-8'));
	expect(got).toEqual(expected);
});