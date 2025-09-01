import { TileType } from './tileTypes';

export interface TileMetadata {
  biome: string;
  elevation: number;
  tags: string[];
}

const metadataMap = new Map<TileType, TileMetadata>();

export function setTileMetadata(tile: TileType, data: TileMetadata): void {
  metadataMap.set(tile, data);
}

export function getTileMetadata(tile: TileType): TileMetadata | undefined {
  return metadataMap.get(tile);
}

// Example metadata
setTileMetadata(TileType.Forest, {
  biome: 'temperate',
  elevation: 2,
  tags: ['dense', 'wildlife'],
});
