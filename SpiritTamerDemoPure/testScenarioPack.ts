import path from 'path';
import fs from 'fs';

test('SpiritTamerDemoPure scenario matches golden', () => {
	const cli = path.resolve('SpiritTamerDemoPure/cliHarness.ts');
	const out = (global as any).testUtils.runCLI(cli, []);
	const got = JSON.parse(out);
	const expected = JSON.parse(fs.readFileSync(path.resolve('SpiritTamerDemoPure/fixtures/spiritTamer.golden.json'), 'utf-8'));
	expect(got).toEqual(expected);
});