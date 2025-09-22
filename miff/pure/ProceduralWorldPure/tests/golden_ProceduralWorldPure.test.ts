import path from 'path';
import fs from 'fs';

test('golden terrain + biomes + rivers deterministic', () => {
	const root = path.resolve(__dirname, '..');
	const cli = path.resolve(root, 'cliHarness.ts');

	const out1 = (global as any).testUtils.runCLI(cli, ['world:generate-terrain', '--seed', '123', '--size', '32x24', '--noise', 'perlin']);
	const got1 = JSON.parse(out1);
	expect(Array.isArray(got1.outputs)).toBe(true);
	const heightmap = (got1.outputs[0].heightmap as number[][]);
	expect(heightmap.length).toBe(24);
	expect(heightmap[0].length).toBe(32);
	// determinism: sample a few cells - assert stable rounded values for seed 123
	const sample = [heightmap[0][0], heightmap[5][10], heightmap[23][31]].map(v => Number(v.toFixed(4)));
	expect(sample).toEqual([0.4886, 0.5750, 0.4926]);

	const biomeSchema = path.resolve(root, 'schemas/biomeSchema.example.json');
	const tmpHeight = path.resolve(root, 'tests/tmp_heightmap.json');
	fs.writeFileSync(tmpHeight, JSON.stringify(heightmap));
	const out2 = (global as any).testUtils.runCLI(cli, ['world:apply-biomes', '--heightmap', tmpHeight, '--rules', biomeSchema, '--seed', '123']);
	const got2 = JSON.parse(out2);
	const biomes = got2.outputs[0].biomes as string[][];
	expect(biomes.length).toBe(24);
	expect(biomes[0].length).toBe(32);

	const out3 = (global as any).testUtils.runCLI(cli, ['world:carve-rivers', '--heightmap', tmpHeight, '--threshold', '0.01', '--seed', '123']);
	const got3 = JSON.parse(out3);
	const rivers = got3.outputs[0].rivers as any[];
	expect(Array.isArray(rivers)).toBe(true);
	expect(rivers.length).toBeGreaterThanOrEqual(1);
});

