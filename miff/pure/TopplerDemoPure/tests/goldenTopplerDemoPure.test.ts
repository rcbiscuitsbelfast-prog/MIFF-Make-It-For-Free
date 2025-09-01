import path from 'path';
import fs from 'fs';

test('TopplerDemoPure scenario matches golden', () => {
	const cli = path.resolve('miff/pure/TopplerDemoPure/cliHarness.ts');
	const out = (global as any).testUtils.runCLI(cli, []);
	const got = JSON.parse(out);
	const goldenPath = path.resolve(process.cwd(), 'miff/pure/TopplerDemoPure/fixtures/toppler.golden.json');
	const expected = JSON.parse(fs.readFileSync(goldenPath, 'utf-8'));
	expect(got).toEqual(expected);
});
