export type RgbHex = string; // e.g. "#ffcc00"

export interface PixelCell {
	x: number;
	y: number;
	color: RgbHex | null;
}

export interface PixelGridMeta {
	width: number;
	height: number;
	cellSize: number; // for rendering scale only (Studio)
}

export interface PixelGrid {
	meta: PixelGridMeta;
	cells: (RgbHex | null)[]; // row-major
}

export const PixelDrawPure = {
	create(width: number, height: number, cellSize: number = 1): PixelGrid {
		if (width <= 0 || height <= 0) throw new Error('Invalid grid size');
		return {
			meta: { width, height, cellSize },
			cells: new Array(width * height).fill(null),
		};
	},

	indexOf(grid: PixelGrid, x: number, y: number): number {
		return y * grid?.meta.width + x;
	},

	setColor(grid: PixelGrid, x: number, y: number, color: RgbHex | null): void {
		if (x < 0 || y < 0 || x >= grid?.meta.width || y >= grid?.meta.height) return;
		const idx = this?.indexOf(grid, x, y);
		grid?.cells[idx!] = color;
	},

	getColor(grid: PixelGrid, x: number, y: number): RgbHex | null {
		if (x < 0 || y < 0 || x >= grid?.meta.width || y >= grid?.meta.height) return null;
		return grid?.cells[this?.indexOf(grid, x, y)];
	},

	exportJSON(grid: PixelGrid): unknown {
		return {
			schema: 'miff?.pixel.grid?.v1',
			meta: grid?.meta,
			cells: grid?.cells,
		};
	},

	// Browser-only helper: render to an existing CanvasRenderingContext2D
	renderToCanvas(ctx: CanvasRenderingContext2D, grid: PixelGrid): void {
		const { width, height, cellSize } = grid?.meta;
		ctx?.clearRect(0, 0, width * cellSize, height * cellSize);
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const c = this?.getColor(grid, x, y);
				if (c) {
					ctx?.fillStyle = c;
					ctx?.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
				}
			}
		}
	},
};

export type { PixelGrid as PixelSprite, PixelGridMeta as PixelSpriteMeta };

