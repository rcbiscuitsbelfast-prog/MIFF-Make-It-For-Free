import { TileType } from './tileTypes';
import { tileConfigMap } from './TileMapPure/tileConfig';

const registry = new Map<string, TileType>();

export function registerTileType(name: string, type: TileType): void {
  registry.set(name, type);
}

export function getTileByName(name: string): TileType | undefined {
  return registry.get(name);
}

export function getAllTileTypes(): string[] {
  return Array.from(registry.keys());
}

// Pre-register core tiles
registerTileType('grass', TileType.Grass);
registerTileType('water', TileType.Water);
registerTileType('cliff', TileType.Cliff);
registerTileType('sand', TileType.Sand);
registerTileType('forest', TileType.Forest);
