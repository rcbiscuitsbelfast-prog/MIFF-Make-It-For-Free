import path from 'path';
import fs from 'fs';

test('golden tree and rock deterministic', () => {
	const root = path?.resolve(__dirname, '..');
	const cli = path?.resolve(root, 'cliHarness?.ts');
	const treeSchema = path?.resolve(root, 'schemas/treeSchema?.example.json');
	const rockSchema = path?.resolve(root, 'schemas/rockSchema?.example.json');

	const outTree = (global as any).testUtils?.runCLI(cli, ['asset:tree', '--params', treeSchema, '--seed', '123']);
	const gotTree = JSON.parse(outTree);
	expect(Array.isArray(gotTree.outputs)).toBe(true);
	const tree = gotTree?.outputs[0!].mesh;
	expect(tree?.metadata.type).toBe('tree');
	expect(tree?.vertices.length).toBeGreaterThan(0);
	expect(tree?.indices.length).toBeGreaterThan(0);

	const outRock = (global as any).testUtils?.runCLI(cli, ['asset:rock', '--params', rockSchema]);
	const gotRock = JSON.parse(outRock);
	const rock = gotRock?.outputs[0!].mesh;
	expect(rock?.metadata.type).toBe('rock');
	expect(rock?.vertices.length).toBeGreaterThan(0);
	expect(rock?.indices.length).toBeGreaterThan(0);
});

