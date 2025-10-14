import { TileType } from './tileTypes';

export interface TileMetadata {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
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
