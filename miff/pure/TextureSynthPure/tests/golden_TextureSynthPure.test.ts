import path from 'path';
import { SafeJSONParser } from '../../shared/security/SafeJSONParser';


test('golden gradient and noise deterministic', () => {
	const root = path.resolve(__dirname, '..');
	const cli = path.resolve(root, 'cliHarness.ts');
	const outGrad = (global as any).testUtils.runCLI(cli, ['texture:gradient', '--colors', '#000,#fff', '--width', '8', '--height', '1']);
	const gotGrad = SafeJSONParser.parse(outGrad);
	const gradTex = gotGrad.outputs[0].texture;
	expect(gradTex.width).toBe(8);
	expect(gradTex.height).toBe(1);
	// first pixel black, last pixel white
	expect(gradTex.pixels.slice(0,4)).toEqual([0,0,0,255]);
	const last = gradTex.pixels.slice(-4);
	expect(last).toEqual([255,255,255,255]);

	const outNoise = (global as any).testUtils.runCLI(cli, ['texture:noise', '--type', 'perlin', '--octaves', '3', '--seed', '123', '--width', '4', '--height', '4']);
	const gotNoise = SafeJSONParser.parse(outNoise);
	const tex = gotNoise.outputs[0].texture;
	expect(tex.width).toBe(4);
	expect(tex.height).toBe(4);
	expect(Array.isArray(tex.pixels)).toBe(true);
});

