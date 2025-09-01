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

// Additional functions for orchestrator integration
const activeLoot = new Map<string, { x: number; y: number; items: string[] }>();

export function spawnLoot(x: number, y: number, items: string[]): void {
  const key = `${x},${y}`;
  activeLoot.set(key, { x, y, items });
}

export function collectLoot(x: number, y: number): string[] {
  const key = `${x},${y}`;
  const loot = activeLoot.get(key);
  if (loot) {
    activeLoot.delete(key);
    return loot.items;
  }
  return [];
}

export function getLootAt(x: number, y: number): string[] {
  const key = `${x},${y}`;
  const loot = activeLoot.get(key);
  return loot ? loot.items : [];
}
