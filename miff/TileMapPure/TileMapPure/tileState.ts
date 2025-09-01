import { TileManager } from './tileManager';
import { TileType } from './tileTypes';

export interface TileStateSnapshot {
  width: number;
  height: number;
  tiles: Array<{ x: number; y: number; type: TileType }>;
}

export function snapshotTileState(manager: TileManager): TileStateSnapshot {
  const grid = manager.getGrid();
  const tiles = grid.flat().map(tile => ({
    x: tile.x,
    y: tile.y,
    type: tile.type,
  }));

  return {
    width: grid[0]?.length ?? 0,
    height: grid.length,
    tiles,
  };
}

export function restoreTileState(snapshot: TileStateSnapshot): TileManager {
  const manager = new TileManager(snapshot.width, snapshot.height);
  for (const tile of snapshot.tiles) {
    manager.setTile(tile.x, tile.y, tile.type);
  }
  return manager;
}
