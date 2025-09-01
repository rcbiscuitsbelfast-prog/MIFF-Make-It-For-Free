import { TileManager } from './tileManager';
import { TileType } from './tileTypes';

export function applyScenarioTiles(manager: TileManager, scenario: string): void {
  switch (scenario) {
    case 'grove':
      manager.setTile(5, 5, TileType.Forest);
      manager.setTile(6, 5, TileType.Forest);
      manager.setTile(7, 5, TileType.Grass);
      break;
    case 'coast':
      manager.setTile(0, 0, TileType.Sand);
      manager.setTile(1, 0, TileType.Water);
      manager.setTile(2, 0, TileType.Cliff);
      break;
    default:
      // fallback to default terrain
      break;
  }
}
