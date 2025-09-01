import { TileType } from './tileTypes';

export interface TileStatusEffect {
  name: string;
  duration: number;
  impact: string;
}

const statusMap = new Map<TileType, TileStatusEffect[]>();

export function addTileStatus(type: TileType, effect: TileStatusEffect): void {
  if (!statusMap.has(type)) {
    statusMap.set(type, []);
  }
  statusMap.get(type)!.push(effect);
}

export function getTileStatuses(type: TileType): TileStatusEffect[] {
  return statusMap.get(type) ?? [];
}

// Example effects
addTileStatus(TileType.Forest, { name: 'Poison Spores', duration: 3, impact: 'reduce health' });
addTileStatus(TileType.Sand, { name: 'Heat Exhaustion', duration: 2, impact: 'slow movement' });
