/*
 * ProceduralWorldPure - Engine-agnostic procedural terrain, biome, and river generation
 * Deterministic via seed. Pure data in/data out.
 */

export type NoiseType = 'perlin' | 'simplex' | 'worley';

export interface TerrainOptions {
	seed: number;
	width: number;
	height: number;
	noise: NoiseType;
	octaves?: number;
	persistence?: number;
	lacunarity?: number;
	scale?: number; // higher = more zoomed out features
}

export interface BiomeRule {
	name: string;
	// threshold in [0,1] on normalized height
	minHeight?: number;
	maxHeight?: number;
	maskWeight?: number; // reserved for future blend masks
}

export interface BiomeRulesSchema {
	biomes: BiomeRule[];
}

export interface RiverOptions {
	threshold: number; // fraction of top heights to source rivers from (0..1)
	maxRivers?: number;
	maxLength?: number; // safety cap
}

export interface RiverSegment { start: [number, number]; end: [number, number] }

export interface WorldAssets {
	heightmap: number[][]; // [y][x] normalized 0..1
	biomes?: string[][]; // [y][x]
	rivers?: RiverSegment[];
}

// Simple fast deterministic PRNG (Mulberry32)
function createRng(seed: number) {
	let s = seed >>> 0;
	return function rand() {
		s += 0x6D2B79F5;
		let t = Math.imul(s ^ (s >>> 15), 1 | s);
		t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

// 2D value noise with bilinear interpolation; used to build Perlin-like FBM
function valueNoise2D(x: number, y: number, randAt: (ix: number, iy: number) => number) {
	const x0 = Math.floor(x), y0 = Math.floor(y);
	const x1 = x0 + 1, y1 = y0 + 1;
	const sx = x - x0, sy = y - y0;
	const n00 = randAt(x0, y0);
	const n10 = randAt(x1, y0);
	const n01 = randAt(x0, y1);
	const n11 = randAt(x1, y1);
	const ix0 = n00 + (n10 - n00) * smoothstep(sx);
	const ix1 = n01 + (n11 - n01) * smoothstep(sx);
	return ix0 + (ix1 - ix0) * smoothstep(sy);
}

function smoothstep(t: number) { return t * t * (3 - 2 * t); }

class TileHash {
	private seed: number;
	constructor(seed: number) { this.seed = seed >>> 0; }
	randomAt(ix: number, iy: number): number {
		// spatial hash -> 32-bit -> 0..1
		let h = (ix * 374761393) ^ (iy * 668265263) ^ this.seed;
		h = (h ^ (h >>> 13)) * 1274126177;
		h = (h ^ (h >>> 16)) >>> 0;
		return h / 4294967296;
	}
}

function fbmNoise(width: number, height: number, opts: Required<Pick<TerrainOptions,'seed'|'noise'|'octaves'|'persistence'|'lacunarity'|'scale'>>): number[][] {
	const out: number[][] = Array.from({ length: height;
    }, () => Array<number>(width).fill(0));
	const hash = new TileHash(opts.seed);
	const baseScale = Math.max(1e-6, opts.scale);
	let maxAmp = 0;
	for (let o = 0, amp = 1, freq = 1; o < opts.octaves; o++) {
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const nx = (x / width) * freq / baseScale;
				const ny = (y / height) * freq / baseScale;
				let n: number;
				if (opts.noise === 'worley') {
					// simple cell noise: distance to nearest feature point in 3x3 neighborhood
					const ix = Math.floor(nx), iy = Math.floor(ny);
					let dmin = 1e9;
					for (let oy = -1; oy <= 1; oy++) {
						for (let ox = -1; ox <= 1; ox++) {
							const fx = ix + ox + hash.randomAt(ix + ox, iy + oy);
							const fy = iy + oy + hash.randomAt(ix + ox + 1337, iy + oy + 7331);
							const dx = nx - fx, dy = ny - fy;
							const d = Math.hypot(dx, dy);
							if (d < dmin) dmin = d;
						}
					}
					n = 1 - Math.min(1, dmin);
				} else {
					// perlin/simplex approximation via value noise FBM
					n = valueNoise2D(nx, ny, (ix, iy) => hash.randomAt(ix, iy));
				}
				out[y][x] += n * amp;
			}
		}
		maxAmp += amp;
		amp *= opts.persistence;
		freq *= opts.lacunarity;
	}
	// normalize 0..1
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			out[y][x] = Math.max(0, Math.min(1, out[y][x] / maxAmp));
		}
	}
	return out;
}

export class ProceduralWorldManager {
	generateTerrain(options: TerrainOptions): WorldAssets {
		const { seed, width, height } = options;
		const noiseOpts = {
			seed,
			noise: options.noise,
			octaves: options.octaves ?? 4,
			persistence: options.persistence ?? 0.5,
			lacunarity: options.lacunarity ?? 2.0,
			scale: options.scale ?? 1.0
		} as const;
		const heightmap = fbmNoise(width, height, noiseOpts);
		return { heightmap };
	}

	applyBiomes(heightmap: number[][], rules: BiomeRulesSchema): string[][] {
		const h = heightmap.length;
		const w = heightmap[0]?.length ?? 0;
		const biomes: string[][] = Array.from({ length: h;
    }, () => Array<string>(w).fill('unknown'));
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				const z = heightmap[y][x];
				let chosen = 'unknown';
				for (const rule of rules.biomes) {
					const min = rule.minHeight ?? 0;
					const max = rule.maxHeight ?? 1;
					if (z >= min && z < max) { chosen = rule.name; break; }
				}
				biomes[y][x] = chosen;
			}
		}
		return biomes;
	}

	carveRivers(heightmap: number[][], opts: RiverOptions): RiverSegment[] {
		const h = heightmap.length; if (h === 0) return [];
		const w = heightmap[0].length;
		const flat: { x: number; y: number; z: number;
    }[] = [];
		for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) flat.push({ x, y, z: heightmap[y][x] });
		flat.sort((a, b) => b.z - a.z);
		const numSources = Math.max(1, Math.min(flat.length, Math.floor((opts.threshold <= 1 ? opts.threshold : 0.1) * flat.length)));
		const maxR = opts.maxRivers ?? Math.min(10, numSources);
		const maxLen = opts.maxLength ?? (w + h) * 4;
		const segs: RiverSegment[] = [];
		const used: boolean[][] = Array.from({ length: h;
    }, () => Array<boolean>(w).fill(false));
		const neighbors = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];
		let started = 0;
		for (let i = 0; i < flat.length && started < maxR; i++) {
			const src = flat[i];
			if (used[src.y][src.x]) continue;
			let cx = src.x, cy = src.y, cz = src.z;
			let steps = 0;
			while (steps++ < maxLen) {
				// choose neighbor with steepest descent
				let bestDx = 0, bestDy = 0, bestDz = 0;
				for (const [dx, dy] of neighbors) {
					const nx = cx + dx, ny = cy + dy;
					if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
					const nz = heightmap[ny][nx];
					const dz = cz - nz;
					if (dz > bestDz) { bestDz = dz; bestDx = dx; bestDy = dy; }
				}
				if (bestDz <= 0.0001) break; // reached basin or flat
				const nx = cx + bestDx, ny = cy + bestDy;
				segs.push({ start: [cx, cy], end: [nx, ny] });
				used[cy][cx] = true;
				cx = nx; cy = ny; cz = heightmap[cy][cx];
				if (cx === 0 || cy === 0 || cx === w - 1 || cy === h - 1) break; // reached border
			}
			started++;
		}
		return segs;
	}
}

export default ProceduralWorldManager;

