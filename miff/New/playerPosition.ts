import { TileType } from '../TileMapPure/TileMapPure/tileTypes';
import { TileManager } from '../TileMapPure/TileMapPure/tileManager';
import { isWalkable } from '../TileMapPure/TileMapPure/tileUtils';

export interface PlayerPosition {
  x: number;
  y: number;
}

let position: PlayerPosition = { x: 0, y: 0 };

export function getPlayerPosition(): PlayerPosition {
  return position;
}

export function movePlayer(dx: number, dy: number, manager: TileManager): boolean {
  const newX = position.x + dx;
  const newY = position.y + dy;
  const tile = manager.getTile(newX, newY);

  if (!tile || !isWalkable(tile.type)) {
    return false;
  }

  position = { x: newX, y: newY };
  return true;
}

export function setPlayerPosition(x: number, y: number): void {
  position = { x, y };
}
