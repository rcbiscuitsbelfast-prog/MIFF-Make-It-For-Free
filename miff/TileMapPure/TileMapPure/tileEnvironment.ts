import { TileType } from './tileTypes';

export interface EnvironmentalEffect {
  temperature: number;
  humidity: number;
  hazard?: string;
}

const environmentMap = new Map<TileType, EnvironmentalEffect>();

export function setEnvironment(tile: TileType, effect: EnvironmentalEffect): void {
  environmentMap.set(tile, effect);
}

export function getEnvironment(tile: TileType): EnvironmentalEffect | undefined {
  return environmentMap.get(tile);
}

// Example effects
setEnvironment(TileType.Sand, {
  temperature: 42,
  humidity: 10,
  hazard: 'heatstroke',
});

setEnvironment(TileType.Water, {
  temperature: 18,
  humidity: 95,
});
