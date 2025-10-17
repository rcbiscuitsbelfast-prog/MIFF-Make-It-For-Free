/* NodeGraphPure - JSON-based node graph executor for chaining pure operations */

export type NodeId = string;

export interface GraphNode {
	id: NodeId;
	type: string; // e.g., 'noise', 'gradient', 'blend', 'mesh.tree', 'mesh.rock'
	inputs?: Record<string, any>; // static inputs
	sources?: Record<string, NodeId>; // dynamic wiring from other node outputs
}

export interface GraphDefinition {
	nodes: GraphNode[];
}

export interface ExecutionResult {
	results: Record<NodeId, any>;
}

export class NodeGraphManager {
	execute(graph: GraphDefinition, services: {
		textureNoise: (opts: any) => any,
		textureGradient: (opts: any) => any,
		meshTree: (opts: any) => any,
		meshRock: (opts: any) => any
	}): ExecutionResult {
		const results: Record<NodeId, any> = {};
		const byId: Record<string, GraphNode> = Object.fromEntries(graph.nodes.map((n: any) => [n.id, n]));
		const order = graph.nodes.slice();
		for (const node of order) {
			const resolvedInputs = { ...(node.inputs||{}) } as any;
			if (node.sources) {
				for (const [k, fromId] of Object.entries(node.sources)) {
					resolvedInputs[k] = results[fromId];
				}
			}
			let out: any;
			switch (node.type) {
				case 'texture.noise': out = { texture: services.textureNoise(resolvedInputs) }; break;
				case 'texture.gradient': out = { texture: services.textureGradient(resolvedInputs) }; break;
				case 'mesh.tree': out = { mesh: services.meshTree(resolvedInputs) }; break;
				case 'mesh.rock': out = { mesh: services.meshRock(resolvedInputs) }; break;
				default: out = { error: `Unknown node type: ${node.type}` };
			}
			results[node.id] = out;
		}
		return { results };
	}
}

export default NodeGraphManager;

