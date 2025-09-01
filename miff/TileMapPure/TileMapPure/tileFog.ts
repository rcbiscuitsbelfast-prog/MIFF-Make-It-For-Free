export interface FogTile {
  x: number;
  y: number;
  visible: boolean;
  discovered: boolean;
}

const fogGrid: FogTile[][] = [];

export function initFog(width: number, height: number): void {
  fogGrid.length = 0;
  for (let y = 0; y < height; y++) {
    const row: FogTile[] = [];
    for (let x = 0; x < width; x++) {
      row.push({ x, y, visible: false, discovered: false });
    }
    fogGrid.push(row);
  }
}

export function revealFog(x: number, y: number, radius: number): void {
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const tx = x + dx;
      const ty = y + dy;
      const tile = fogGrid[ty]?.[tx];
      if (tile) {
        tile.visible = true;
        tile.discovered = true;
      }
    }
  }
}

export function getFogState(): FogTile[][] {
  return fogGrid;
}
