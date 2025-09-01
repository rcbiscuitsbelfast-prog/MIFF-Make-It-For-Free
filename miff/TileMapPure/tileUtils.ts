import { TileType } from './tileTypes';
import { tileConfigMap } from './tileConfig';

export function isWalkable(type: TileType): boolean {
  return tileConfigMap[type].walkable;
}

export function getMovementCost(type: TileType): number {
  return tileConfigMap[type].movementCost;
}

export function getTileColor(type: TileType): string {
  return tileConfigMap[type].color;
}

export function getTileLabel(type: TileType): string {
  return tileConfigMap[type].label;
}
