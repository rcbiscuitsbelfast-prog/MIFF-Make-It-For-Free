import path from 'path';
import fs from 'fs';
import { SafeJSONParser } from '../../shared/security/SafeJSONParser';


test('golden time flow', () => {
	const root = path.resolve(__dirname, '..');
	const commands = path.resolve(root, 'tests/commands.json');
	const out = (global as any).testUtils.runCLI(path.resolve(root, 'cliHarness.ts'), [commands]);
	const got = SafeJSONParser.parse(out);
	
	// Define expected output directly in the test to avoid file system issues
	const expected = {
		"log": [],
		"outputs": [
			{
				"op": "list",
				"timers": [],
				"cooldowns": [],
				"scheduled": []
			},
			{
				"op": "addTimer",
				"id": "t1",
				"status": "ok"
			},
			{
				"op": "addCooldown",
				"id": "cd1",
				"duration": 1.5,
				"status": "ok"
			},
			{
				"op": "schedule",
				"id": "ev1",
				"at": 1,
				"status": "ok"
			},
			{
				"op": "tick",
				"dt": 1,
				"time": 1,
				"fired": ["scheduled:ev1"]
			},
			{
				"op": "tick",
				"dt": 1,
				"time": 2,
				"fired": ["timer:t1", "cooldown:cd1"]
			},
			{
				"op": "dump",
				"time": 2,
				"timers": [],
				"cooldowns": [
					{
						"id": "cd1",
						"duration": 1.5,
						"remaining": 0,
						"category": "general"
					}
				],
				"scheduled": []
			}
		]
	};
	
	expect(got).toEqual(expected);
});