# EncounterPure - Encounter Management System

A comprehensive encounter management system for handling random encounters, encounter tables, trigger conditions, and player state tracking. Supports zone-based encounters, weighted selection, and level scaling for modular gameplay systems.

## Features

- **Encounter Tables**: Configurable encounter tables with weighted selection
- **Trigger System**: Multiple trigger types (zone entry, tile type, time of day)
- **Level Scaling**: Dynamic level calculation based on encounter entries
- **Player State Tracking**: Comprehensive player state management
- **RNG Integration**: Weighted random selection using external RNG providers
- **Type-Safe Operations**: Full TypeScript support with comprehensive interfaces
- **Performance Optimized**: Efficient encounter checking and table management

## Installation

```bash
npm install miff-framework
```

## Usage

### Basic Usage

```typescript
import { EncounterController, EncounterTable, PlayerState, TriggerType } from 'miff-framework';

// Create controller
const controller = new EncounterController();

// Create encounter table
const table = new EncounterTable('forest');
table.addEntry({
  zoneId: 'forest',
  spiritId: 'sprout',
  weight: 50,
  minLevel: 2,
  maxLevel: 4
});

// Register table
controller.registerTable(table);

// Create player state
const playerState = new PlayerState('forest', 'grass', 'day', 0);

// Check for encounters
const rng = new RNGProvider(12345);
const result = controller.checkForEncounter(playerState, rng);

if (result.triggered) {
  console.log(`Encounter! ${result.spiritId} (level ${result.level})`);
}
```

### Advanced Usage

```typescript
import {
  EncounterController,
  EncounterTrigger,
  PlayerState,
  TriggerType,
  EncounterUtils
} from 'miff-framework';

// Create controller with multiple zones
const controller = new EncounterController();

// Setup Newhaven zone
const newhavenTable = EncounterUtils.createStandardTable('newhaven', [
  { spiritId: 'ember', weight: 40, minLevel: 3, maxLevel: 5 },
  { spiritId: 'ripple', weight: 35, minLevel: 3, maxLevel: 5 },
  { spiritId: 'sprout', weight: 25, minLevel: 2, maxLevel: 4 }
]);

// Setup triggers
const grassTrigger = EncounterUtils.createTileTrigger('newhaven', 'grass');
const nightTrigger = EncounterUtils.createTimeTrigger('newhaven', 'night');

controller.registerTable(newhavenTable);
controller.registerTrigger(grassTrigger);
controller.registerTrigger(nightTrigger);
```

### CLI Usage

```bash
# Start interactive CLI
node cliHarness.ts

# Example CLI session:
encounter> zone newhaven
encounter> add ember 40
encounter> add ripple 35
encounter> trigger tile grass
encounter> simulate 100
encounter> demo
```

## API Reference

### Classes

#### EncounterTableEntry
Entry in an encounter table with weight and level constraints.

**Constructor:**
- `constructor(zoneId, spiritId, weight, minLevel, maxLevel)`

**Properties:**
- `zoneId: string` - Zone identifier
- `spiritId: string` - Spirit type identifier
- `weight: number` - Selection weight
- `minLevel: number` - Minimum encounter level
- `maxLevel: number` - Maximum encounter level

**Methods:**
- `clone(): EncounterTableEntry` - Create a copy
- `validate(): string[]` - Validate entry data

#### EncounterTable
Collection of encounter entries for a zone.

**Constructor:**
- `constructor(zoneId, entries?)`

**Properties:**
- `zoneId: string` - Zone identifier
- `entries: EncounterTableEntry[]` - Table entries

**Methods:**
- `addEntry(entry): boolean` - Add entry to table
- `removeEntriesBySpirit(spiritId): number` - Remove entries by spirit
- `getTotalWeight(): number` - Get total weight of entries
- `getEntriesForLevel(level): EncounterTableEntry[]` - Get entries for level
- `getEntriesByWeight(): EncounterTableEntry[]` - Get entries sorted by weight
- `validate(): string[]` - Validate entire table
- `clone(): EncounterTable` - Create a copy

#### EncounterTrigger
Trigger condition for encounters.

**Constructor:**
- `constructor(triggerType, triggerParams, zoneId)`

**Properties:**
- `triggerType: TriggerType` - Type of trigger
- `triggerParams: Record<string, string>` - Trigger parameters
- `zoneId: string` - Zone identifier

**Methods:**
- `matches(playerState): boolean` - Check if trigger matches player state
- `clone(): EncounterTrigger` - Create a copy

#### PlayerState
Player state for encounter checking.

**Constructor:**
- `constructor(zoneId, tileType, timeOfDay, stepsSinceLastEncounter)`

**Properties:**
- `zoneId: string` - Current zone
- `tileType: string` - Current tile type
- `timeOfDay: string` - Current time of day
- `stepsSinceLastEncounter: number` - Steps since last encounter

**Methods:**
- `incrementSteps(): void` - Increment step counter
- `resetSteps(): void` - Reset step counter
- `clone(): PlayerState` - Create a copy

#### EncounterResult
Result of an encounter check.

**Constructor:**
- `constructor(triggered, zoneId, spiritId, level)`

**Properties:**
- `triggered: boolean` - Whether encounter occurred
- `zoneId?: string` - Zone where encounter occurred
- `spiritId?: string` - Spirit encountered
- `level: number` - Encounter level

**Static Methods:**
- `createSuccess(zoneId, spiritId, level)` - Create successful result
- `createFailure()` - Create failed result
- `clone()` - Create a copy

#### EncounterController
Main controller for encounter management.

**Methods:**
- `registerTable(table): boolean` - Register encounter table
- `registerTrigger(trigger): boolean` - Register encounter trigger
- `checkForEncounter(playerState, rng): IEncounterResult` - Check for encounters
- `getTable(zoneId): EncounterTable | null` - Get table for zone
- `getAllTables(): EncounterTable[]` - Get all registered tables
- `getAllTriggers(): readonly EncounterTrigger[]` - Get all registered triggers
- `clear(): void` - Clear all data
- `getTableCount(): number` - Get number of tables
- `getTriggerCount(): number` - Get number of triggers

### Enums

#### TriggerType
Trigger condition types.

```typescript
export enum TriggerType {
  ZONE_ENTRY = 'zone_entry',
  TILE_TYPE = 'tile_type',
  TIME_OF_DAY = 'time_of_day'
}
```

### Interfaces

#### IEncounterTableEntry
Encounter table entry interface.

**Properties:**
- `zoneId: string` - Zone identifier
- `spiritId: string` - Spirit identifier
- `weight: number` - Selection weight
- `minLevel: number` - Minimum level
- `maxLevel: number` - Maximum level

#### IEncounterTable
Encounter table interface.

**Properties:**
- `zoneId: string` - Zone identifier
- `entries: IEncounterTableEntry[]` - Table entries

#### IEncounterTrigger
Encounter trigger interface.

**Properties:**
- `triggerType: TriggerType` - Trigger type
- `triggerParams: Record<string, string>` - Trigger parameters
- `zoneId: string` - Zone identifier

#### IPlayerState
Player state interface.

**Properties:**
- `zoneId: string` - Current zone
- `tileType: string` - Current tile type
- `timeOfDay: string` - Current time of day
- `stepsSinceLastEncounter: number` - Steps since last encounter

#### IEncounterResult
Encounter result interface.

**Properties:**
- `triggered: boolean` - Whether encounter occurred
- `zoneId?: string` - Zone identifier
- `spiritId?: string` - Spirit identifier
- `level: number` - Encounter level

#### IRNGProvider
RNG provider interface (for dependency injection).

**Methods:**
- `nextInt(min, max): number` - Get random integer
- `nextBool(probability): boolean` - Get random boolean

### Utility Functions

#### EncounterUtils
Static utility functions for common operations.

- `createStandardTable(zoneId, entries)` - Create standard encounter table
- `createTileTrigger(zoneId, tileType)` - Create tile-based trigger
- `createTimeTrigger(zoneId, timeOfDay)` - Create time-based trigger
- `createZoneTrigger(zoneId)` - Create zone entry trigger
- `calculateEncounterChance(stepsSinceLast)` - Calculate encounter probability
- `selectWeightedEntry(entries, rng)` - Select weighted random entry
- `validatePlayerState(state)` - Validate player state

## Configuration

### Basic Encounter Setup

```typescript
import { EncounterController, EncounterTable, TriggerType } from 'miff-framework';

const controller = new EncounterController();

// Create simple table
const table = new EncounterTable('forest');
table.addEntry({
  zoneId: 'forest',
  spiritId: 'sprout',
  weight: 100,
  minLevel: 1,
  maxLevel: 3
});

// Add zone entry trigger
const trigger = {
  triggerType: TriggerType.ZONE_ENTRY,
  triggerParams: {},
  zoneId: 'forest'
};

controller.registerTable(table);
controller.registerTrigger(trigger);
```

### Advanced Multi-Zone Setup

```typescript
import { EncounterController, EncounterUtils, TriggerType } from 'miff-framework';

const controller = new EncounterController();

// Create multiple zones
const zones = [
  {
    id: 'newhaven',
    entries: [
      { spiritId: 'ember', weight: 40, minLevel: 3, maxLevel: 5 },
      { spiritId: 'ripple', weight: 35, minLevel: 3, maxLevel: 5 },
      { spiritId: 'sprout', weight: 25, minLevel: 2, maxLevel: 4 }
    ]
  },
  {
    id: 'grassland',
    entries: [
      { spiritId: 'sprout', weight: 50, minLevel: 2, maxLevel: 4 },
      { spiritId: 'ripple', weight: 30, minLevel: 2, maxLevel: 4 },
      { spiritId: 'stone', weight: 20, minLevel: 3, maxLevel: 5 }
    ]
  }
];

// Register all zones
zones.forEach(zone => {
  const table = EncounterUtils.createStandardTable(zone.id, zone.entries);
  controller.registerTable(table);

  // Add triggers for each zone
  controller.registerTrigger(EncounterUtils.createTileTrigger(zone.id, 'grass'));
});
```

## Examples

### Example 1: Simple Forest Encounters

```typescript
import { EncounterController, PlayerState, RNGProvider } from 'miff-framework';

const controller = new EncounterController();
const rng = new RNGProvider(12345);

// Create forest encounter table
const forestTable = new EncounterTable('forest');
forestTable.addEntry({
  zoneId: 'forest',
  spiritId: 'sprout',
  weight: 100,
  minLevel: 1,
  maxLevel: 3
});

// Register table and zone trigger
controller.registerTable(forestTable);
controller.registerTrigger({
  triggerType: TriggerType.ZONE_ENTRY,
  triggerParams: {},
  zoneId: 'forest'
});

// Simulate player movement
const playerState = new PlayerState('forest', 'grass', 'day', 0);

for (let step = 1; step <= 50; step++) {
  playerState.incrementSteps();
  const result = controller.checkForEncounter(playerState, rng);

  if (result.triggered) {
    console.log(`Step ${step}: Encounter! ${result.spiritId} (level ${result.level})`);
    break;
  }
}
```

### Example 2: Complex Multi-Zone System

```typescript
import {
  EncounterController,
  PlayerState,
  TriggerType,
  EncounterUtils,
  RNGProvider
} from 'miff-framework';

const controller = new EncounterController();
const rng = new RNGProvider(12345);

// Setup multiple zones with different encounter rates
const zones = [
  {
    id: 'newhaven',
    tileTypes: ['grass', 'road'],
    timeRanges: ['day', 'night'],
    encounters: [
      { spiritId: 'ember', weight: 40, minLevel: 3, maxLevel: 5 },
      { spiritId: 'ripple', weight: 35, minLevel: 3, maxLevel: 5 },
      { spiritId: 'sprout', weight: 25, minLevel: 2, maxLevel: 4 }
    ]
  },
  {
    id: 'grassland',
    tileTypes: ['grass', 'flower'],
    timeRanges: ['day'],
    encounters: [
      { spiritId: 'sprout', weight: 50, minLevel: 2, maxLevel: 4 },
      { spiritId: 'ripple', weight: 30, minLevel: 2, maxLevel: 4 },
      { spiritId: 'stone', weight: 20, minLevel: 3, maxLevel: 5 }
    ]
  }
];

// Register all zones
zones.forEach(zone => {
  const table = EncounterUtils.createStandardTable(zone.id, zone.encounters);
  controller.registerTable(table);

  // Add triggers for each tile type
  zone.tileTypes.forEach(tileType => {
    controller.registerTrigger(EncounterUtils.createTileTrigger(zone.id, tileType));
  });
});

// Simulate player exploring different zones
const playerStates = [
  new PlayerState('newhaven', 'grass', 'day', 0),
  new PlayerState('grassland', 'grass', 'day', 0)
];

playerStates.forEach((state, index) => {
  console.log(`\nExploring ${state.zoneId}...`);

  let encounters = 0;
  for (let step = 1; step <= 100; step++) {
    state.incrementSteps();
    const result = controller.checkForEncounter(state, rng);

    if (result.triggered) {
      encounters++;
      console.log(`  Step ${step}: ${result.spiritId} (level ${result.level})`);
    }
  }

  console.log(`Total encounters: ${encounters}`);
});
```

### Example 3: Dynamic Encounter System

```typescript
import {
  EncounterController,
  PlayerState,
  EncounterUtils,
  RNGProvider
} from 'miff-framework';

const controller = new EncounterController();
const rng = new RNGProvider(12345);

// Create adaptive encounter system
class DynamicEncounterSystem {
  private baseTables = new Map<string, EncounterTable>();
  private currentDifficulty = 1;

  constructor(controller: EncounterController) {
    this.setupBaseTables(controller);
  }

  private setupBaseTables(controller: EncounterController) {
    // Create base tables for different difficulty levels
    for (let difficulty = 1; difficulty <= 5; difficulty++) {
      const table = this.generateTableForDifficulty('forest', difficulty);
      this.baseTables.set(difficulty.toString(), table);
      controller.registerTable(table);
    }
  }

  private generateTableForDifficulty(zoneId: string, difficulty: number): EncounterTable {
    const baseEntries = [
      { spiritId: 'sprout', baseWeight: 50, minLevel: 1, maxLevel: 3 },
      { spiritId: 'ripple', baseWeight: 30, minLevel: 2, maxLevel: 4 },
      { spiritId: 'stone', baseWeight: 20, minLevel: 3, maxLevel: 5 }
    ];

    const entries = baseEntries.map(entry => ({
      ...entry,
      weight: Math.floor(entry.baseWeight * (1 + (difficulty - 1) * 0.2)),
      minLevel: Math.max(1, entry.minLevel + (difficulty - 1)),
      maxLevel: Math.max(entry.minLevel, entry.maxLevel + (difficulty - 1))
    }));

    return EncounterUtils.createStandardTable(zoneId, entries);
  }

  updateDifficulty(newDifficulty: number, controller: EncounterController) {
    this.currentDifficulty = Math.max(1, Math.min(5, newDifficulty));

    // Switch active table
    const activeTable = this.baseTables.get(this.currentDifficulty.toString())!;
    // Implementation would activate the appropriate table
  }
}

// Usage
const encounterSystem = new DynamicEncounterSystem(controller);
const playerState = new PlayerState('forest', 'grass', 'day', 0);

console.log('Exploring with increasing difficulty...\n');

for (let difficulty = 1; difficulty <= 3; difficulty++) {
  console.log(`--- Difficulty Level ${difficulty} ---`);
  encounterSystem.updateDifficulty(difficulty, controller);

  let encounters = 0;
  for (let step = 1; step <= 50; step++) {
    playerState.incrementSteps();
    const result = controller.checkForEncounter(playerState, rng);

    if (result.triggered) {
      encounters++;
      console.log(`  Step ${step}: ${result.spiritId} (level ${result.level})`);
    }
  }

  console.log(`Encounters at difficulty ${difficulty}: ${encounters}\n`);
}
```

## Testing

```bash
# Run EncounterPure tests
npm test -- --testPathPattern="EncounterPure"

# Run CLI harness tests
node cliHarness.ts
```

## Integration

### With Other Modules
- **RNGPure**: Random number generation for encounter selection
- **EventSystemPure**: Trigger events on encounters
- **PlayerStatePure**: Player state management
- **QuestSystemPure**: Update quest objectives based on encounters

### Engine Bridges
- **Unity**: Random encounter system integration
- **Godot**: Area-based encounter management
- **Web**: Location-based encounter simulation

## Performance

- **Time Complexity**: O(log n) for weighted selection where n = table entries
- **Space Complexity**: O(t + r) where t = tables, r = triggers
- **Optimization Tips**:
  - Cache frequently accessed tables
  - Pre-calculate total weights when possible
  - Use appropriate data structures for trigger matching

## Troubleshooting

### Common Issues
1. **No encounters**: Check trigger conditions and table registration
2. **Wrong spirits**: Verify table entries and zone matching
3. **Level issues**: Check min/max level constraints in table entries
4. **Performance**: Consider table size and trigger complexity

### Debug Tips
- Use `getAllTables()` and `getAllTriggers()` to inspect registration
- Test triggers individually with `matches()` method
- Verify RNG provider is working correctly
- Check player state values match trigger conditions

## Contributing

### Adding Features
1. Follow established encounter management patterns
2. Add comprehensive tests for new functionality
3. Update this documentation
4. Ensure type safety with TypeScript

### Code Style
- Use TypeScript strict mode
- Follow ESLint configuration
- Maintain consistent naming (camelCase)
- Add JSDoc comments for all public APIs

## License

MIT

## Version History

- **v1.0.0**: Initial TypeScript implementation with core encounter system
- **v1.1.0**: Added trigger system and player state management
- **v1.2.0**: Enhanced weighted selection and performance optimizations