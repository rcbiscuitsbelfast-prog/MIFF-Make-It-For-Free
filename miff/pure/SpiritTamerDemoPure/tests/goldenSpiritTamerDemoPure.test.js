const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

test('SpiritTamerDemoPure scenario matches golden', () => {
	const cli = path.resolve('miff/pure/SpiritTamerDemoPure/cliHarness.ts');
	const out = execFileSync('npx', ['ts-node', '--compiler-options', '{"module":"commonjs"}', cli], { encoding: 'utf-8' });
	const got = JSON.parse(out);
	
	// Extract the runScenario output from the outputs array
	expect(got.outputs).toBeDefined();
	expect(got.outputs).toHaveLength(1);
	expect(got.outputs[0].op).toBe('runScenario');
	expect(got.outputs[0].status).toBe('ok');
	
	const expected = JSON.parse(fs.readFileSync(path.resolve('miff/pure/SpiritTamerDemoPure/fixtures/spiritTamer.golden.json'), 'utf-8'));
	expect(got.outputs[0].finalState).toEqual(expected);
});
