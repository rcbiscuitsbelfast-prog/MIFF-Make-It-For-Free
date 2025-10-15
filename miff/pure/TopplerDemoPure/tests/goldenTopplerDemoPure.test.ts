import path from 'path';
import fs from 'fs';
import { SafeJSONParser } from '../../shared/security/SafeJSONParser';


test('TopplerDemoPure scenario matches golden', () => {
	const cli = path.resolve('miff/pure/TopplerDemoPure/cliHarness.ts');
	const out = (global as any).testUtils.runCLI(cli, []);
	const got = SafeJSONParser.parse(out);
	const goldenPath = path.resolve(process.cwd(), 'miff/pure/TopplerDemoPure/fixtures/toppler.golden.json');
	const expected = SafeJSONParser.parse(fs.readFileSync(goldenPath, 'utf-8'));
	expect(got).toEqual(expected);
});
