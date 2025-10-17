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
			
			// Generate actual pixel data
			const pixelData = this.generatePixelData(pattern, p, seed + i);
			
			assets.push({
				id: `${preset}_${pattern}_${i + 1}`,
				style: p.style,
				layer: pixelData, // Actual pixel data as base64
				anchor: { x: p.width / 2, y: p.height - 2 },
				metadata: 
					seed: seed + i,
					preset,
					generated: true,
					width: width: p.width,
					height: p.height
				}
			});
		}
		return assets;
	},

	// Generate actual pixel data for a pattern
	generatePixelData(pattern: string, preset: PixelGenPreset, seed: number): string {
		// Check if we're in a browser environment
		if (typeof document === 'undefined') {
			// Use Node.js canvas polyfill
			try {
				const { createCanvas } = require('canvas');
				const canvas = createCanvas(preset.width, preset.height);
				const ctx = canvas.getContext('2d');
				
				// Generate pixel art based on pattern
				const imageData = ctx.createImageData(preset.width, preset.height);
				const data = imageData.data;
				
				// Use seeded random for consistent generation
				const rng = (offset: number) => this.random(seed + offset);
				
				for (let y = 0; y < preset.height; y++) {
					for (let x = 0; x < preset.width; x++) {
						const idx = (y * preset.width + x) * 4;
						const pixelSeed = seed + x + y * preset.width;
						
						// Generate pattern-specific pixel data
						const pixel = this.generatePatternPixel(pattern, x, y, preset, pixelSeed);
						
						data[idx] = pixel.r;     // Red
						data[idx + 1] = pixel.g; // Green
						data[idx + 2] = pixel.b; // Blue
						data[idx + 3] = pixel.a; // Alpha
					}
				}
				
				ctx.putImageData(imageData, 0, 0);
				return canvas.toDataURL('image/png');
			} catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
				// Fallback if canvas polyfill fails
				return `data:image/png;base64,${this.generateFallbackPixelData(pattern, preset, seed)}`;
			}
		}
		
		const canvas = document.createElement('canvas');
		canvas.width = preset.width;
		canvas.height = preset.height;
		const ctx = canvas.getContext('2d');
		
		if (!ctx) {
			// Fallback if canvas context creation fails
			return `data:image/png;base64,${this.generateFallbackPixelData(pattern, preset, seed)}`;
		}
		
		// Generate pixel art based on pattern
		const imageData = ctx.createImageData(preset.width, preset.height);
		const data = imageData.data;
		
		// Use seeded random for consistent generation
		const rng = (offset: number) => this.random(seed + offset);
		
		for (let y = 0; y < preset.height; y++) {
			for (let x = 0; x < preset.width; x++) {
				const idx = (y * preset.width + x) * 4;
				const pixelSeed = seed + x + y * preset.width;
				
				// Generate pattern-specific pixel data
				const pixel = this.generatePatternPixel(pattern, x, y, preset, pixelSeed);
				
				data[idx] = pixel.r;     // Red
				data[idx + 1] = pixel.g; // Green
				data[idx + 2] = pixel.b; // Blue
				data[idx + 3] = pixel.a; // Alpha
			}
		}
		
		ctx.putImageData(imageData, 0, 0);
		return canvas.toDataURL('image/png');
	},
	
	// Generate a single pixel for a pattern
	generatePatternPixel(pattern: string, x: number, y: number, preset: PixelGenPreset, seed: number): { r: number; g: number; b: number; a: number } {
		const rng = (offset: number) => this.random(seed + offset);
		
		switch (pattern) {
			case 'tree':
				return this.generateTreePixel(x, y, preset, rng);
			case 'bush':
				return this.generateBushPixel(x, y, preset, rng);
			case 'rock':
				return this.generateRockPixel(x, y, preset, rng);
			case 'grass':
				return this.generateGrassPixel(x, y, preset, rng);
			case 'house':
				return this.generateHousePixel(x, y, preset, rng);
			case 'fence':
				return this.generateFencePixel(x, y, preset, rng);
			case 'path':
				return this.generatePathPixel(x, y, preset, rng);
			case 'well':
				return this.generateWellPixel(x, y, preset, rng);
			case 'wall':
				return this.generateWallPixel(x, y, preset, rng);
			case 'door':
				return this.generateDoorPixel(x, y, preset, rng);
			case 'chest':
				return this.generateChestPixel(x, y, preset, rng);
			case 'torch':
				return this.generateTorchPixel(x, y, preset, rng);
			default:
				return { r: 128, g: 128, b: 128, a: 255 }; // Default gray
		}
	},
	
	// Pattern-specific pixel generators
	generateTreePixel(x: number, y: number, preset: PixelGenPreset, rng: (offset: number) => number): { r: number; g: number; b: number; a: number } {
		const centerX = preset.width / 2;
		const centerY = preset.height / 2;
		const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
		
		if (y > centerY + 1) {
			// Trunk
			return { r: 101, g: 67, b: 33, a: 255 };
		} else if (dist < preset.width / 3) {
			// Leaves
			return { r: 34, g: 139, b: 34, a: 255 };
		}
		return { r: 0, g: 0, b: 0, a: 0 }; // Transparent
	},
	
	generateBushPixel(x: number, y: number, preset: PixelGenPreset, rng: (offset: number) => number): { r: number; g: number; b: number; a: number } {
		if (y > preset.height / 2 && rng(x + y) > 0.3) {
			return { r: 0, g: 100, b: 0, a: 255 };
		}
		return { r: 0, g: 0, b: 0, a: 0 };
	},
	
	generateRockPixel(x: number, y: number, preset: PixelGenPreset, rng: (offset: number) => number): { r: number; g: number; b: number; a: number } {
		const centerX = preset.width / 2;
		const centerY = preset.height / 2;
		const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
		
		if (dist < preset.width / 4) {
			return { r: 105, g: 105, b: 105, a: 255 };
		}
		return { r: 0, g: 0, b: 0, a: 0 };
	},
	
	generateGrassPixel(x: number, y: number, preset: PixelGenPreset, rng: (offset: number) => number): { r: number; g: number; b: number; a: number } {
		if (rng(x + y) > 0.7) {
			return { r: 50, g: 205, b: 50, a: 255 };
		}
		return { r: 34, g: 139, b: 34, a: 255 };
	},
	
	generateHousePixel(x: number, y: number, preset: PixelGenPreset, rng: (offset: number) => number): { r: number; g: number; b: number; a: number } {
		if (x > 2 && x < preset.width - 2 && y > 2 && y < preset.height - 2) {
			return { r: 160, g: 82, b: 45, a: 255 }; // House body
		} else if (y <= 2 && x >= 1 && x < preset.width - 1) {
			return { r: 139, g: 69, b: 19, a: 255 }; // Roof
		}
		return { r: 0, g: 0, b: 0, a: 0 };
	},
	
	generateFencePixel(x: number, y: number, preset: PixelGenPreset, rng: (offset: number) => number): { r: number; g: number; b: number; a: number } {
		if ((x === 0 || x === preset.width - 1) && y > 1) {
			return { r: 101, g: 67, b: 33, a: 255 };
		}
		return { r: 0, g: 0, b: 0, a: 0 };
	},
	
	generatePathPixel(x: number, y: number, preset: PixelGenPreset, rng: (offset: number) => number): { r: number; g: number; b: number; a: number } {
		if (y === Math.floor(preset.height / 2) || x === Math.floor(preset.width / 2)) {
			return { r: 184, g: 134, b: 11, a: 255 };
		}
		return { r: 0, g: 0, b: 0, a: 0 };
	},
	
	generateWellPixel(x: number, y: number, preset: PixelGenPreset, rng: (offset: number) => number): { r: number; g: number; b: number; a: number } {
		const centerX = preset.width / 2;
		const centerY = preset.height / 2;
		const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
		
		if (dist < preset.width / 3) {
			return { r: 105, g: 105, b: 105, a: 255 };
		}
		return { r: 0, g: 0, b: 0, a: 0 };
	},
	
	generateWallPixel(x: number, y: number, preset: PixelGenPreset, rng: (offset: number) => number): { r: number; g: number; b: number; a: number } {
		if (x === 0 || x === preset.width - 1 || y === 0 || y === preset.height - 1) {
			return { r: 105, g: 105, b: 105, a: 255 };
		}
		return { r: 0, g: 0, b: 0, a: 0 };
	},
	
	generateDoorPixel(x: number, y: number, preset: PixelGenPreset, rng: (offset: number) => number): { r: number; g: number; b: number; a: number } {
		if (x === Math.floor(preset.width / 2) && y > 1 && y < preset.height - 1) {
			return { r: 101, g: 67, b: 33, a: 255 };
		}
		return { r: 0, g: 0, b: 0, a: 0 };
	},
	
	generateChestPixel(x: number, y: number, preset: PixelGenPreset, rng: (offset: number) => number): { r: number; g: number; b: number; a: number } {
		if (x > 2 && x < preset.width - 2 && y > 2 && y < preset.height - 2) {
			return { r: 160, g: 82, b: 45, a: 255 };
		}
		return { r: 0, g: 0, b: 0, a: 0 };
	},
	
	generateTorchPixel(x: number, y: number, preset: PixelGenPreset, rng: (offset: number) => number): { r: number; g: number; b: number; a: number } {
		const centerX = preset.width / 2;
		const centerY = preset.height / 2;
		
		if (x === centerX && y >= centerY) {
			return { r: 101, g: 67, b: 33, a: 255 }; // Torch handle
		} else if (Math.abs(x - centerX) <= 1 && y < centerY) {
			return { r: 255, g: 165, b: 0, a: 255 }; // Flame
		}
		return { r: 0, g: 0, b: 0, a: 0 };
	},
	
	// Fallback for Node.js environment
	generateFallbackPixelData(pattern: string, preset: PixelGenPreset, seed: number): string {
		// Simple base64-encoded 1x1 pixel as fallback
		return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
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