import { TileManager } from '../TileMapPure/TileMapPure/tileManager';
import { TileType } from '../TileMapPure/TileMapPure/tileTypes';

export interface WorldState {
  zone: string;
  tiles: TileManager;
  flags: Record<string, boolean>;
  npcs: Record<string, { x: number; y: number }>;
}

let currentState: WorldState | null = null;

export function initWorld(zone: string, width: number, height: number): void {
  currentState = {
    zone,
    tiles: new TileManager(width, height),
    flags: {},
    npcs: {},
  };
}

export function getWorld(): WorldState | null {
  return currentState;
}

export function setFlag(name: string, value: boolean): void {
  if (currentState) {
    currentState.flags[name] = value;
  }
}

export function placeNPC(id: string, x: number, y: number): void {
  if (currentState) {
    currentState.npcs[id] = { x, y };
  }
}
