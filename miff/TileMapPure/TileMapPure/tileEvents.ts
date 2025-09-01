import { TileType } from './tileTypes';

type TileEvent = {
  type: 'enter' | 'exit' | 'interact';
  handler: (x: number, y: number, tile: TileType) => void;
};

const eventMap = new Map<TileType, TileEvent[]>();

export function registerTileEvent(tile: TileType, event: TileEvent): void {
  if (!eventMap.has(tile)) {
    eventMap.set(tile, []);
  }
  eventMap.get(tile)!.push(event);
}

export function triggerTileEvent(tile: TileType, type: 'enter' | 'exit' | 'interact', x: number, y: number): void {
  const events = eventMap.get(tile);
  if (!events) return;
  for (const e of events) {
    if (e.type === type) {
      e.handler(x, y, tile);
    }
  }
}
