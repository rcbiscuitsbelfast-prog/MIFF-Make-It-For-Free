import { TileType } from './tileTypes';

type AnimationFrame = {
  duration: number;
  sprite: string;
};

const animationRegistry = new Map<TileType, AnimationFrame[]>();

export function registerTileAnimation(tile: TileType, frames: AnimationFrame[]): void {
  animationRegistry.set(tile, frames);
}

export function getTileAnimation(tile: TileType): AnimationFrame[] {
  return animationRegistry.get(tile) ?? [];
}

// Example: water ripple animation
registerTileAnimation(TileType.Water, [
  { duration: 100, sprite: 'water_frame_1.png' },
  { duration: 100, sprite: 'water_frame_2.png' },
  { duration: 100, sprite: 'water_frame_3.png' },
]);
