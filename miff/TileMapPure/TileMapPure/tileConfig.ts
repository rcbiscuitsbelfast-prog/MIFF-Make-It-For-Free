import { TileType } from './tileTypes';

export interface TileConfig {
  movementCost: number;
  walkable: boolean;
  color: string;
  label: string;
}

export const tileConfigMap: Record<TileType, TileConfig> = {
  [TileType.Grass]: {
    movementCost: 1,
    walkable: true,
    color: '#4CAF50',
    label: 'Grass',
  },
  [TileType.Water]: {
    movementCost: Infinity,
    walkable: false,
    color: '#2196F3',
    label: 'Water',
  },
  [TileType.Cliff]: {
    movementCost: Infinity,
    walkable: false,
    color: '#9E9E9E',
    label: 'Cliff',
  },
  [TileType.Sand]: {
    movementCost: 2,
    walkable: true,
    color: '#FFEB3B',
    label: 'Sand',
  },
  [TileType.Forest]: {
    movementCost: 3,
    walkable: true,
    color: '#2E7D32',
    label: 'Forest',
  },
};
