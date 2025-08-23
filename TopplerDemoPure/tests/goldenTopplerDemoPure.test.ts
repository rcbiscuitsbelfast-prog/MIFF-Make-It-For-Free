import path from 'path';
import fs from 'fs';

test('TopplerDemoPure scenario matches golden', () => {
	const cli = path.resolve('TopplerDemoPure/cliHarness.ts');
	const out = (global as any).testUtils.runCLI(cli, []);
	const got = JSON.parse(out);
	const expected = JSON.parse(fs.readFileSync(path.resolve('TopplerDemoPure/fixtures/toppler.golden.json'), 'utf-8'));
	expect(got).toEqual(expected);
});
