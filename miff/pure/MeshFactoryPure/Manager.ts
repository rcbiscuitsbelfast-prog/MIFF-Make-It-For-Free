/* MeshFactoryPure - deterministic parametric mesh generators (engine-agnostic) */

export interface MeshData { vertices: number[][]; indices: number[][]; metadata?: { type: string; seed: number;
    } }
export interface TreeParams { trunkHeight: number; trunkRadius: number; trunkSegments: number; canopyRadius: number; canopyHeight: number; canopySegments: number; }
export interface RockParams { radius: number; segments: number; noise: number; seed?: number; }

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function toInt(v: any, f: number) { const n = parseInt(String(v)); return Number.isFinite(n) ? n : f; }
function toFloat(v: any, f: number) { const n = parseFloat(String(v)); return Number.isFinite(n) ? n : f; }

class RNG { private s: number; constructor(seed: number){ this.s = seed>>>0; } next(){ this.s += 0x6D2B79F5; let t = Math.imul(this.s ^ (this.s>>>15), 1|this.s); t ^= t + Math.imul(t ^ (t>>>7), 61|t); return ((t ^ (t>>>14))>>>0)/4294967296; } }

export class MeshFactoryManager {
	createTree(params: Partial<TreeParams>, seed = 1): MeshData {
		const trunkHeight = toFloat(params.trunkHeight ?? 4, 4);
		const trunkRadius = toFloat(params.trunkRadius ?? 0.3, 0.3);
		const trunkSegments = clamp(toInt(params.trunkSegments ?? 12, 12), 3, 64);
		const canopyRadius = toFloat(params.canopyRadius ?? 1.2, 1.2);
		const canopyHeight = toFloat(params.canopyHeight ?? 1.5, 1.5);
		const canopySegments = clamp(toInt(params.canopySegments ?? 12, 12), 3, 64);

		// Cylinder trunk
		const verts: number[][] = [];
		const idx: number[][] = [];
		for (let i = 0; i < trunkSegments; i++) {
			const a0 = (i / trunkSegments) * Math.PI * 2;
			const a1 = ((i + 1) / trunkSegments) * Math.PI * 2;
			const x0 = Math.cos(a0) * trunkRadius, z0 = Math.sin(a0) * trunkRadius;
			const x1 = Math.cos(a1) * trunkRadius, z1 = Math.sin(a1) * trunkRadius;
			const y0 = 0, y1 = trunkHeight;
			const base = verts.length;
			verts.push([x0,y0,z0],[x1,y0,z1],[x1,y1,z1],[x0,y1,z0]);
			idx.push([base, base+1, base+2],[base, base+2, base+3]);
		}

		// Cone canopy (approx) positioned on top of trunk
		const rng = new RNG(seed);
		const canopyBaseY = trunkHeight;
		const apex = [0, canopyBaseY + canopyHeight, 0];
		const apexIndex = verts.length; verts.push([apex[0],apex[1],apex[2]]);
		for (let i = 0; i < canopySegments; i++) {
			const a0 = (i / canopySegments) * Math.PI * 2;
			const a1 = ((i + 1) / canopySegments) * Math.PI * 2;
			const rJitter = canopyRadius * (0.9 + 0.2 * rng.next());
			const x0 = Math.cos(a0) * rJitter, z0 = Math.sin(a0) * rJitter;
			const x1 = Math.cos(a1) * rJitter, z1 = Math.sin(a1) * rJitter;
			const y0 = canopyBaseY;
			const base = verts.length;
			verts.push([x0,y0,z0],[x1,y0,z1]);
			idx.push([apexIndex, base, base+1]);
		}

		return { vertices: verts, indices: idx, metadata: { type: 'tree', seed } };
	}

	createRock(params: Partial<RockParams>): MeshData {
		const radius = toFloat(params.radius ?? 1.0, 1.0);
		const segments = clamp(toInt(params.segments ?? 12, 12), 3, 64);
		const noise = toFloat(params.noise ?? 0.15, 0.15);
		const rng = new RNG(params.seed ?? 1);
		const verts: number[][] = [];
		const idx: number[][] = [];
		// Icosahedron-like ringed sphere approximation
		for (let y = 0; y <= segments; y++) {
			const v = y / segments;
			const phi = v * Math.PI; // 0..pi
			for (let x = 0; x <= segments; x++) {
				const u = x / segments;
				const theta = u * Math.PI * 2;
				const n = 1 + (rng.next() - 0.5) * 2 * noise;
				const r = radius * n;
				verts.push([Math.sin(phi) * Math.cos(theta) * r, Math.cos(phi) * r, Math.sin(phi) * Math.sin(theta) * r]);
			}
		}
		const row = segments + 1;
		for (let y = 0; y < segments; y++) {
			for (let x = 0; x < segments; x++) {
				const i0 = y * row + x;
				const i1 = i0 + 1;
				const i2 = i0 + row;
				const i3 = i2 + 1;
				idx.push([i0, i2, i1], [i1, i2, i3]);
			}
		}
		return { vertices: verts, indices: idx, metadata: { type: 'rock', seed: params.seed ?? 0 } };
	}
}

export default MeshFactoryManager;

