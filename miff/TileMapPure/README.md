# TileMapPure

Modular tile system for MIFF. Provides type-safe tile definitions, configuration, and grid management.

## Modules

- `tileTypes.ts`: Enum of tile categories
- `tileConfig.ts`: Movement cost, walkability, and visual metadata
- `tileUtils.ts`: Accessors for tile properties
- `tileManager.ts`: Grid creation, mutation, and querying

## Usage

```ts
const manager = new TileManager(10, 10);
manager.setTile(2, 3, TileType.Water);
console.log(manager.isTileWalkable(2, 3)); // false
