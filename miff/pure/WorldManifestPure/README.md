# WorldManifestPure

A comprehensive world manifest system for MIFF games. Manages world creation, asset anchoring, tile placement, procedural generation, and world validation with full CLI support.

## Features

- **World Management**: Create, manage, and organize game worlds with multiple zones
- **Asset Anchoring**: Place and track assets with precise positioning and metadata
- **Tile-Based System**: Grid-based tile placement with multi-layer support
- **Procedural Generation**: Generate world content with configurable parameters
- **Zone Management**: Add, remove, and manage zones within worlds
- **Asset Registry**: Track asset usage and locations across worlds
- **Statistics & Analytics**: Comprehensive world and asset statistics
- **Multi-Format Export**: Export world data in JSON, CSV, Markdown, HTML, YAML, XML formats
- **Validation**: Comprehensive world manifest validation

## Usage

### Basic API

```typescript
import { WorldManifestManager, WorldGenerationConfig } from './Manager';
import { WorldManifestPure } from './index';

const manager = new WorldManifestManager();

// Create a world
const result = manager.createWorld('my-world', 'My World', 50, 40);

// Add a zone
manager.addZone('my-world', 'forest-zone', 'Forest Zone', 25, 20);

// Place assets
manager.placeAsset('my-world', 'forest-zone', 10, 15, 'tree-oak', 1, {
  collision: true,
  interactive: false,
  tags: ['nature', 'obstacle']
});

// Generate procedural content
const config: WorldGenerationConfig = {
  seed: 12345,
  density: 0.6,
  style: 'forest',
  assetPool: ['tree-oak', 'tree-pine', 'bush-small', 'rock-moss']
};
manager.generateWorld(result.world!, 'forest-zone', config);
```

### CLI Usage

```bash
# List all worlds
npx tsx cliHarness.ts list

# Create a new world
npx tsx cliHarness.ts create my-world "My World" 50 40

# Add a zone to the world
npx tsx cliHarness.ts addZone my-world forest-zone "Forest Zone" 25 20

# Place an asset
npx tsx cliHarness.ts placeAsset my-world forest-zone 10 15 tree-oak 1

# Generate procedural content
npx tsx cliHarness.ts generate my-world forest-zone --seed 12345 --density 0.6 --style forest

# Find assets in an area
npx tsx cliHarness.ts findAssets my-world forest-zone 5 5 15 15

# Get world statistics
npx tsx cliHarness.ts stats my-world

# Export world data
npx tsx cliHarness.ts export my-world yaml
npx tsx cliHarness.ts export my-world manifest
npx tsx cliHarness.ts export my-world summary

# Validate world
npx tsx cliHarness.ts validate my-world

# Remove an asset
npx tsx cliHarness.ts removeAsset my-world forest-zone 10 15 1

# Remove a zone
npx tsx cliHarness.ts removeZone my-world forest-zone

# Delete a world
npx tsx cliHarness.ts delete my-world

# Get global statistics
npx tsx cliHarness.ts globalStats
```

## Data Structures

### WorldManifest
```typescript
interface WorldManifest {
  schema: string;                // Schema identifier (e.g., "miff.world.v1")
  version: string;               // Version string
  zones: WorldZone[];            // Array of zones in the world
  metadata?: {
    title?: string;              // Human-readable world title
    description?: string;        // World description
    created?: string;            // ISO timestamp of creation
    author?: string;             // World author
  };
}
```

### WorldZone
```typescript
interface WorldZone {
  id: string;                    // Unique zone identifier
  name: string;                  // Human-readable zone name
  width: number;                 // Zone width in tiles
  height: number;                // Zone height in tiles
  tiles: WorldTile[];            // Array of tiles in the zone
  metadata?: {
    style?: string;              // Visual style (e.g., "pixel-topdown")
    preset?: string;             // Generation preset used
    generated?: boolean;         // Whether zone was procedurally generated
  };
}
```

### WorldTile
```typescript
interface WorldTile {
  x: number;                     // X coordinate (0-based)
  y: number;                     // Y coordinate (0-based)
  assetId: string;               // Asset identifier
  layer: number;                 // Layer (0=background, 1=midground, 2=foreground)
}
```

### AssetAnchor
```typescript
interface AssetAnchor {
  assetId: string;               // Asset identifier
  x: number;                     // X coordinate
  y: number;                     // Y coordinate
  layer: number;                 // Layer number
  zoneId: string;                // Zone containing the asset
  metadata?: {
    rotation?: number;           // Rotation in degrees
    scale?: number;              // Scale multiplier
    collision?: boolean;         // Has collision
    interactive?: boolean;       // Can be interacted with
    tags?: string[];             // Asset tags
  };
}
```

### WorldGenerationConfig
```typescript
interface WorldGenerationConfig {
  seed?: number;                 // Random seed for deterministic generation
  density?: number;              // Density (0-1) of asset placement
  style?: 'forest' | 'dungeon' | 'city' | 'desert' | 'water' | 'mixed';
  layering?: 'simple' | 'complex'; // Layer complexity
  assetPool?: string[];          // Available assets for generation
}
```

## Generation Styles

### Forest
- **Assets**: Trees, bushes, rocks, grass patches
- **Density**: Medium to high (0.4-0.8)
- **Layers**: Background vegetation, midground trees, foreground details

### Dungeon
- **Assets**: Walls, floors, torches, chests, doors, traps
- **Density**: High (0.6-0.9)
- **Layers**: Background floors, midground walls, foreground objects

### City
- **Assets**: Buildings, roads, lamp posts, fountains, trees
- **Density**: Medium (0.4-0.7)
- **Layers**: Background roads, midground buildings, foreground details

### Desert
- **Assets**: Sand dunes, cacti, rocks, oases
- **Density**: Low to medium (0.2-0.5)
- **Layers**: Background sand, midground features, foreground details

## Export Formats

### Standard Formats
- **JSON**: Complete world data with full structure
- **CSV**: Tabular format for tile and asset data
- **Markdown**: Human-readable documentation format
- **HTML**: Web-ready presentation format
- **YAML**: Configuration-friendly format
- **XML**: Structured markup format

### World-Specific Formats
- **manifest**: Full world manifest with anchors and metadata
- **summary**: Condensed world overview with key metrics
- **tiles**: Flat list of all tiles across all zones

## CLI Operations

| Operation | Description | Arguments |
|-----------|-------------|-----------|
| `create` | Create new world | worldId, name, width, height |
| `get` | Get world details | worldId |
| `list` | List all worlds | - |
| `addZone` | Add zone to world | worldId, zoneId, name, width, height |
| `removeZone` | Remove zone from world | worldId, zoneId |
| `placeAsset` | Place asset in world | worldId, zoneId, x, y, assetId, [layer] |
| `removeAsset` | Remove asset from location | worldId, zoneId, x, y, [layer] |
| `findAssets` | Find assets in area | worldId, zoneId, x, y, endX, endY |
| `generate` | Generate world content | worldId, zoneId, [--options] |
| `validate` | Validate world manifest | worldId |
| `stats` | Get world statistics | worldId |
| `export` | Export world data | worldId, [format] |
| `delete` | Delete world | worldId |
| `globalStats` | Get global statistics | - |

### Generation Options
- `--seed <number>`: Set random seed
- `--density <float>`: Set generation density (0-1)
- `--style <string>`: Set generation style (forest, dungeon, city, desert)
- `--layering <string>`: Set layer complexity (simple, complex)

## Testing

```bash
# Run unit tests
npm test

# Run golden tests
npm run test:golden

# Test CLI harness
npx tsx cliHarness.ts list
npx tsx cliHarness.ts globalStats
```

## Fixtures

- `fixtures/sample_world.json`: Valid world manifest for testing
- `fixtures/generation_configs.json`: Sample generation configurations

## Integration

WorldManifestPure integrates seamlessly with other MIFF systems:

- **AssetManifestPure**: References asset manifests for tile content
- **PixelGenPure**: Provides world data for pixel art generation
- **SessionManifestPure**: Supplies world contexts for multiplayer sessions
- **ZoneServerPure**: Manages world state for multiplayer gameplay

## Performance

- **Efficient Lookups**: Uses Maps for O(1) world and asset lookups
- **Memory Management**: Automatic cleanup of asset anchors when assets are removed
- **Batch Operations**: Efficient handling of multiple tile operations
- **Deterministic Generation**: Consistent results with seed-based randomization

## Validation

The module provides comprehensive validation:

- **Schema Validation**: Ensures proper world manifest structure
- **Bounds Checking**: Validates tile positions within zone boundaries
- **Asset Validation**: Checks for required asset identifiers
- **Layer Validation**: Ensures valid layer numbers
- **Zone Validation**: Validates zone dimensions and properties

## Error Handling

Comprehensive error handling with detailed messages:

- World not found errors
- Zone not found errors
- Out of bounds placement errors
- Invalid dimension errors
- Duplicate world/zone errors
- Asset placement conflicts

All operations return structured responses with `ok` status and detailed error arrays when applicable.

## Examples

### Creating a Forest World
```typescript
// Create world
const world = manager.createWorld('enchanted-forest', 'Enchanted Forest', 40, 30);

// Add zones
manager.addZone('enchanted-forest', 'clearing', 'Forest Clearing', 20, 15);
manager.addZone('enchanted-forest', 'deep-woods', 'Deep Woods', 20, 15);

// Generate forest content
manager.generateWorld(world.world!, 'clearing', {
  seed: 12345,
  density: 0.5,
  style: 'forest',
  assetPool: ['tree-oak', 'tree-birch', 'bush-berry', 'flower-wild']
});

// Place special assets
manager.placeAsset('enchanted-forest', 'clearing', 10, 7, 'shrine-ancient', 2, {
  interactive: true,
  tags: ['quest', 'magical']
});
```

### Dungeon Generation
```typescript
const dungeon = manager.createWorld('dark-dungeon', 'Dark Dungeon', 25, 20);

manager.generateWorld(dungeon.world!, 'dark-dungeon', {
  seed: 54321,
  density: 0.8,
  style: 'dungeon',
  layering: 'complex',
  assetPool: ['wall-stone', 'floor-stone', 'torch', 'chest-locked', 'door-iron']
});
```

## Remix Hooks

This module supports the following remix hooks for customization:

- `world.create`: Called when a new world is created
- `world.zone.add`: Called when a zone is added to a world
- `world.asset.place`: Called when an asset is placed
- `world.generate`: Called during procedural generation
- `world.validate`: Called during world validation

## License

MIT License - Part of the MIFF (Make It For Free) framework.