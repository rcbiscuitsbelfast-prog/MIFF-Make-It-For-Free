import path from 'path';
import fs from 'fs';

test('golden attribution ok output', () => {
	const root = path.resolve(__dirname, '..');
	const config = path.resolve(root, 'sample_config.json');
	const commands = path.resolve(root, 'tests/commands.json');
	const out = (global as any).testUtils.runCLI(path.resolve(root, 'cliHarness.ts'), [config, commands]);
	const got = JSON.parse(out);
	const expected = { outputs: [ { op:'showAttribution', status:'ok', issues:[], resolvedRefs:{}, rendered:{ message:'Powered by MIFF', style:'console:info', durationMs:1500 } } ] };
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