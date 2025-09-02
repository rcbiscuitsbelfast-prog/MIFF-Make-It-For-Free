import { TileType } from './tileTypes';
import { tileConfigMap } from './TileMapPure/tileConfig';

export function validateTileConfig(type: TileType): string[] {
  const config = tileConfigMap[type];
  const errors: string[] = [];

  if (typeof config.movementCost !== 'number') {
    errors.push(`Invalid movementCost for ${type}`);
  }
  if (typeof config.walkable !== 'boolean') {
    errors.push(`Invalid walkable flag for ${type}`);
  }
  if (!config.color || typeof config.color !== 'string') {
    errors.push(`Missing or invalid color for ${type}`);
  }
  if (!config.label || typeof config.label !== 'string') {
    errors.push(`Missing or invalid label for ${type}`);
  }

  return errors;
}

export function validateAllTiles(): Record<TileType, string[]> {
  const results: Record<TileType, string[]> = {} as any;
  for (const type of Object.values(TileType)) {
    results[type] = validateTileConfig(type);
  }
  return results;
}
