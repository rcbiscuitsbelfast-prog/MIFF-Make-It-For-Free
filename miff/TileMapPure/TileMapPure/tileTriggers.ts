import { TileType } from './tileTypes';

type TriggerFn = (x: number, y: number, type: TileType) => void;

const triggerMap = new Map<TileType, TriggerFn>();

export function registerTileTrigger(type: TileType, fn: TriggerFn): void {
  triggerMap.set(type, fn);
}

export function runTileTrigger(x: number, y: number, type: TileType): void {
  const fn = triggerMap.get(type);
  if (fn) fn(x, y, type);
}

// Example: register a trigger for water tiles
registerTileTrigger(TileType.Water, (x, y) => {
  console.log(`Splash at (${x}, ${y})`);
});
