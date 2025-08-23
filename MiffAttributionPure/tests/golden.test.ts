import path from 'path';
import fs from 'fs';

test('golden attribution ok output', () => {
	const root = path.resolve(__dirname, '..');
	const config = path.resolve(root, 'sample_config.json');
	const commands = path.resolve(root, 'tests/commands.json');
	const got = JSON.parse((global as any).testUtils.runCLI(path.resolve(root, 'cliHarness.ts'), [config, commands]));
	const expected = { 
		outputs: [ 
			{ 
				op: 'showAttribution', 
				status: 'ok', 
				issues: [], 
				resolvedRefs: {}, 
				rendered: { 
					message: 'Powered by MIFF', 
					style: 'console:info', 
					durationMs: 1500,
					license: {
						type: 'AGPLv3 + Commercial',
						version: '3.0',
						url: 'https://www.gnu.org/licenses/agpl-3.0.en.html',
						requirements: [
							'Attribution required',
							'Source code must be open',
							'Commercial use requires license'
						],
						remixSafe: true
					},
					contributors: [
						{
							name: 'R.C. Biscuits',
							role: 'Framework Architect',
							contact: 'miff@yourdomain.dev',
							license: 'CC-BY-SA 4.0'
						}
					],
					remixStatus: 'remix-safe'
				} 
			} 
		] 
	};
	expect(got).toEqual(expected);
});

test('golden attribution skipped when disabled', () => {
	const root = path.resolve(__dirname, '..');
	const config = path.resolve(root, 'tests/cfg_disabled.json');
	const commands = path.resolve(root, 'tests/commands2.json');
	const out = (global as any).testUtils.runCLI(path.resolve(root, 'cliHarness.ts'), [config, commands]);
	const got = JSON.parse(out);
	const expected = { outputs: [ { op:'showAttribution', status:'skipped', issues:[], resolvedRefs:{} } ] };
	expect(got).toEqual(expected);
});