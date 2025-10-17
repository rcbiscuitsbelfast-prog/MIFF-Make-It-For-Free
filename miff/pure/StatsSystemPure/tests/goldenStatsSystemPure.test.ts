import path from 'path';
import fs from 'fs';

test('golden stats flow', () => {
	const root = path.resolve(__dirname, '..');
	const stats = path.resolve(root, 'sample_stats.json');
	const commands = path.resolve(root, 'tests/commands.json');
	const out = (global as any).testUtils.runCLI(path.resolve(root, 'cliHarness.ts'), [stats, commands]);
	const got = JSON.parse(out);
	
	// Define expected output directly in the test to avoid file system issues
	const expected = {
		"log": [],
		"outputs": [
			{
				"op": "list",
				"ids": []
			},
			{
				"id": "hero",
				"stats": [
					{
						"key": "hp",
						"base": 30
					}
				]
			},
			{
				"op": "setStat",
				"id": "hero",
				"key": "atk",
				"base": 8
			},
			{
				"id": "hero",
				"total": 38
			},
			{
				"op": "dump",
				"id": "hero",
				"stats": [
					{
						"key": "hp",
						"base": 30
					},
					{
						"key": "atk",
						"base": 8
					}
				]
			}
		]
	};
	
	expect(got).toEqual(expected);
});