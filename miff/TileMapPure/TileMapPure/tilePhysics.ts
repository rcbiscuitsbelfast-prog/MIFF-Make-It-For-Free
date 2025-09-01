import { TileType } from './tileTypes';

export interface PhysicsProfile {
  friction: number;
  bounce: number;
  sinkDepth: number;
}

const physicsMap = new Map<TileType, PhysicsProfile>();

export function setTilePhysics(type: TileType, profile: PhysicsProfile): void {
  physicsMap.set(type, profile);
}

export function getTilePhysics(type: TileType): PhysicsProfile | undefined {
  return physicsMap.get(type);
}

// Example profiles
setTilePhysics(TileType.Grass, { friction: 0.8, bounce: 0.1, sinkDepth: 0 });
setTilePhysics(TileType.Water, { friction: 0.2, bounce: 0, sinkDepth: 1 });
setTilePhysics(TileType.Cliff, { friction: 1.0, bounce: 0.3, sinkDepth: 0 });
