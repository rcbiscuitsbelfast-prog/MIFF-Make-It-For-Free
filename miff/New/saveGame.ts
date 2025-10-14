import { getWorld } from './worldState';
import { getPlayerPosition } from './playerPosition';

export interface SaveData {
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
  player: { x: number; y: number };
  flags: Record<string, boolean>;
  npcs: Record<string, { x: number; y: number }>;
}

export function saveGame(): SaveData | null {
  const world = getWorld();
  const player = getPlayerPosition();
  if (!world) return null;

  return {
    zone: world.zone,
    player,
    flags: { ...world.flags },
    npcs: { ...world.npcs },
  };
}
