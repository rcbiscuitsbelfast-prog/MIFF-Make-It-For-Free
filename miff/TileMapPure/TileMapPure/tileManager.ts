tileManager.tsimport { TileType } from './tileTypes';
import { isWalkable, getMovementCost } from './tileUtils';

export interface Tile {
  x: number;
  y: number;
  type: TileType;
}

export class TileManager {
  private grid: Tile[][] = [];

  constructor(private width: number, private height: number) {
    this.initGrid();
  }

  private initGrid() {
    for (let y = 0; y < this.height; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < this.width; x++) {
        row.push({ x, y, type: TileType.Grass });
      }
      this.grid.push(row);
    }
  }

  public setTile(x: number, y: number, type: TileType) {
    if (this.grid[y] && this.grid[y][x]) {
      this.grid[y][x].type = type;
    }
  }

  public getTile(x: number, y: number): Tile | undefined {
    return this.grid[y]?.[x];
  }

  public isTileWalkable(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    return tile ? isWalkable(tile.type) : false;
  }

  public getMovementCost(x: number, y: number): number {
    const tile = this.getTile(x, y);
    return tile ? getMovementCost(tile.type) : Infinity;
  }

  public getGrid(): Tile[][] {
    return this.grid;
  }
}
