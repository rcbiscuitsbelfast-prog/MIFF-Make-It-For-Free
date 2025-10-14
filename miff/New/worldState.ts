import { TileManager } from '../TileMapPure/tileManager';

export interface WorldState {
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
