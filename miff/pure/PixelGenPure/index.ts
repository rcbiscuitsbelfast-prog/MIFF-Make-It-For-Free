export type RgbHex = string; // e.g. "#ffcc00"

export interface PixelAsset {
	id: string;
	style: string; // e.g. "pixel-topdown", "pixel-side"
	layer: string; // filename or data URL
	anchor: { x: number; y: number };
	metadata?: {
		seed?: number;
		preset?: string;
		generated?: boolean;
	};
}

export interface PixelGenPreset {
	name: string;
	style: string;
	width: number;
	height: number;
	colors: RgbHex[];
	patterns: string[]; // e.g. ["tree", "bush", "rock"]
}

export const PixelGenPure = {
	presets: {
		forest: {
			name: "forest",
			style: "pixel-topdown",
			width: 16,
			height: 16,
			colors: ["#228B22", "#32CD32", "#8FBC8F", "#654321", "#8B4513"],
			patterns: ["tree", "bush", "rock", "grass"]
		},
		village: {
			name: "village",
			style: "pixel-topdown", 
			width: 16,
			height: 16,
			colors: ["#8B4513", "#A0522D", "#D2691E", "#CD853F", "#F4A460"],
			patterns: ["house", "fence", "path", "well"]
		},
		dungeon: {
			name: "dungeon",
			style: "pixel-topdown",
			width: 16,
			height: 16,
			colors: ["#696969", "#2F4F4F", "#708090", "#A9A9A9", "#C0C0C0"],
			patterns: ["wall", "door", "chest", "torch"]
		}
	} as Record<string, PixelGenPreset>,

	generate(preset: string, seed: number = 12345, count: number = 1): PixelAsset[] {
		const p = this.presets[preset];
		if (!p) throw new Error(`Unknown preset: ${preset}`);
		
		const assets: PixelAsset[] = [];
		for (let i = 0; i < count; i++) {
			const pattern = p.patterns[Math.floor(this.random(seed + i) * p.patterns.length)];
			const color = p.colors[Math.floor(this.random(seed + i + 1000) * p.colors.length)];
			
			assets.push({
				id: `${preset}_${pattern}_${i + 1}`,
				style: p.style,
				layer: `${preset}_${pattern}_${i + 1}.png`, // Stub: would generate actual pixel data
				anchor: { x: p.width / 2, y: p.height - 2 },
				metadata: {
					seed: seed + i,
					preset,
					generated: true
				}
			});
		}
		return assets;
	},

	// Simple seeded random number generator
	random(seed: number): number {
		const x = Math.sin(seed) * 10000;
		return x - Math.floor(x);
	},

	exportManifest(assets: PixelAsset[]): unknown {
		return {
			schema: "miff.pixel.assets.v1",
			generated: new Date().toISOString(),
			assets
		};
	}
};