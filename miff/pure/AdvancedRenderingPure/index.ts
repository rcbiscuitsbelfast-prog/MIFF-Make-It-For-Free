// AdvancedRenderingPure
// Stateless pixel-matrix post-processing: outline, shading, lighting

export type Pixel = string | null; // hex color like "#RRGGBB" or null for transparent
export type PixelMatrix = Pixel[][]; // [y][x]

export interface OutlineOptions {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
	color: string; // outline color hex
	thickness: 1 | 2;
}

export interface ShadingOptions {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
	strength: number; // 0..1 multiplier
	ambient: number; // 0..1 base darkening
}

export interface LightingOptions {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
	direction: { x: number; y: number }; // normalized 2D light direction
	int: string; // hex color for light tint
	intStrength: number; // 0..1
}

function clamp01(v: number): number { return Math.max(0, Math.min(1, v)); }

function hexToRgb(hex: string): { r: number; g: number; b: number } {
	const h = hex.replace('#', '');
	const r = parseInt(h.substring(0, 2), 16);
	const g = parseInt(h.substring(2, 4), 16);
	const b = parseInt(h.substring(4, 6), 16);
	return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number): string {
	const hr = r.toString(16).padStart(2, '0');
	const hg = g.toString(16).padStart(2, '0');
	const hb = b.toString(16).padStart(2, '0');
	return `#${hr}${hg}${hb}`;
}

function lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }

export const AdvancedRenderingPure = {
	applyOutline(): PixelMatrix {
		const h = matrix.length;
		const w = matrix[0]?.length || 0;
		const result: PixelMatrix = matrix.map(row => row.slice());
		const dirs = [
			[-1, 0], [1, 0], [0, -1], [0, 1],
			[-1, -1], [1, -1], [-1, 1], [1, 1]
		];
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				if (matrix[y][x]) continue; // only draw outline on empty pixels
				let nearSolid = false;
				for (const [dx, dy] of dirs) {
					const nx = x + dx;
					const ny = y + dy;
					if (nx >= 0 && nx < w && ny >= 0 && ny < h && matrix[ny][nx]) { nearSolid = true; break; }
				}
				if (nearSolid) result[y][x] = options.color;
			}
		}
		if (options.thickness === 2) {
			return AdvancedRenderingPure.applyOutline(result, { ...options, thickness: 1 });
		}
		return result;
	},

	applyShading(matrix: PixelMatrix, options: ShadingOptions): PixelMatrix {
		const h = matrix.length;
		const w = matrix[0]?.length || 0;
		const ambient = clamp01(options.ambient);
		const strength = clamp01(options.strength);
		const result: PixelMatrix = matrix.map(row => row.slice());
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				const p = matrix[y][x];
				if (!p) continue;
				const { r, g, b } = hexToRgb(p);
				const shade = clamp01(ambient + strength * (y / Math.max(1, h - 1))); // simple vertical gradient
				result[y][x] = rgbToHex(Math.floor(r * shade), Math.floor(g * shade), Math.floor(b * shade));
			}
		}
		return result;
	},

	applyLighting(matrix: PixelMatrix, options: LightingOptions): PixelMatrix {
		const h = matrix.length;
		const w = matrix[0]?.length || 0;
		const tintRGB = hexToRgb(options.int);
		const result: PixelMatrix = matrix.map(row => row.slice());
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				const p = matrix[y][x];
				if (!p) continue;
				const { r, g, b } = hexToRgb(p);
				const nx = (x / Math.max(1, w - 1)) * 2 - 1;
				const ny = (y / Math.max(1, h - 1)) * 2 - 1;
				const nl = clamp01((nx * options.direction.x + ny * options.direction.y + 1) / 2);
				const t = options.intStrength * nl;
				result[y][x] = rgbToHex(
					Math.floor(lerp(r, tintRGB.r, t)),
					Math.floor(lerp(g, tintRGB.g, t)),
					Math.floor(lerp(b, tintRGB.b, t))
				);
			}
		}
		return result;
	}
};

export default AdvancedRenderingPure;

