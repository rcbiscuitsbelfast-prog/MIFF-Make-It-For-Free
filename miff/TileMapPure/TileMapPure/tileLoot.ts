import { TileType } from './tileTypes';

export interface LootDrop {
  item: string;
  chance: number; // 0 to 1
}

const lootTable = new Map<TileType, LootDrop[]>();

export function registerLoot(tile: TileType, drops: LootDrop[]): void {
  lootTable.set(tile, drops);
}

export function rollLoot(tile: TileType): string[] {
  const drops = lootTable.get(tile) ?? [];
  return drops
    .filter(drop => Math.random() < drop.chance)
    .map(drop => drop.item);
}

// Example loot
registerLoot(TileType.Forest, [
  { item: 'herb', chance: 0.6 },
  { item: 'wood', chance: 0.8 },
]);

registerLoot(TileType.Cliff, [
  { item: 'stone', chance: 0.9 },
]);
