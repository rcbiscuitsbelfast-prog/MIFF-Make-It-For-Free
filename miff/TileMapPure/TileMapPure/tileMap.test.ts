import { TileManager } from './tileManager';
import { TileType } from './tileTypes';

describe('TileManager', () => {
  let manager: TileManager;

  beforeEach(() => {
    manager = new TileManager(5, 5);
  });

  test('initializes with default tiles', () => {
    const tile = manager.getTile(0, 0);
    expect(tile?.type).toBe(TileType.Grass);
  });

  test('sets and retrieves tile type', () => {
    manager.setTile(2, 2, TileType.Water);
    const tile = manager.getTile(2, 2);
    expect(tile?.type).toBe(TileType.Water);
  });

  test('walkability check works', () => {
    manager.setTile(1, 1, TileType.Cliff);
    expect(manager.isTileWalkable(1, 1)).toBe(false);
  });

  test('movement cost returns correct value', () => {
    manager.setTile(3, 3, TileType.Forest);
    expect(manager.getMovementCost(3, 3)).toBe(3);
  });
});
