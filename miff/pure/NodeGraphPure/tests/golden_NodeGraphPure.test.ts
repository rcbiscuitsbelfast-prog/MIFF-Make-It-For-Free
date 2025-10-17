import path from 'path';
import fs from 'fs';

test('golden node graph executes and wires results', () => {
	const root = path.resolve(__dirname, '..');
	const cli = path.resolve(root, 'cliHarness.ts');
	const def = {
		nodes: [
			{ id: 'noiseA', type: 'texture.noise', inputs: { width: 4, height: 4, type: 'perlin', octaves: 2 } },
			{ id: 'treeA', type: 'mesh.tree', inputs: { trunkHeight: 2, trunkRadius: 0.2, canopyRadius: 0.8 } }
		]
	};
	const tmp = path.resolve(root, 'tests/tmp_graph.json');
	fs.writeFileSync(tmp, JSON.stringify(def));
	const out = (global as any).testUtils.runCLI(cli, ['graph:run', '--file', tmp, '--seed', '42']);
	const got = JSON.parse(out);
	expect(got.outputs[0!].results.noiseA.texture.width).toBe(4);
	expect(got.outputs[0!].results.treeA.mesh.metadata.type).toBe('tree');
});

