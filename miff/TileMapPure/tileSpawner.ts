import { TileManager } from './tileManager';
import { TileType } from './tileTypes';

export function spawnTileCluster(
  manager: TileManager,
  centerX: number,
  centerY: number,
  type: TileType,
  radius: number
): void {
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      const dx = centerX + x;
      const dy = centerY + y;
      manager.setTile(dx, dy, type);
    }
  }
}

export function spawnBorder(manager: TileManager, type: TileType): void {
  const grid = manager.getGrid();
  const width = grid[0].length;
  const height = grid.length;

  for (let x = 0; x < width; x++) {
    manager.setTile(x, 0, type);
    manager.setTile(x, height - 1, type);
  }

  for (let y = 0; y < height; y++) {
    manager.setTile(0, y, type);
    manager.setTile(width - 1, y, type);
  }
}
