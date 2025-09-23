# EvolutionPure Module

## Overview

**EvolutionPure** is a comprehensive spirit evolution system for the MIFF framework, enabling spirits to evolve based on various conditions including level, items, sync levels, lore flags, time of day, and location. The system supports complex evolution chains, multiple condition types, and flexible evolution mechanics.

## Features

### 🧬 Evolution System
- **Flexible Evolution Conditions**: Level-based, item-based, sync-based, lore flags, time conditions, location-based
- **Evolution Chains**: Multi-stage evolution paths with complex requirements
- **Condition Validation**: Comprehensive validation of evolution requirements
- **Dynamic Evolution**: Real-time checking of evolution availability

### 📊 Condition Types
- **Level Requirements**: Evolve at specific level thresholds
- **Item Requirements**: Require specific items to evolve
- **Sync Requirements**: Need high sync percentages
- **Lore Flags**: Unlock evolutions through story progression
- **Time Conditions**: Evolve only during specific times of day
- **Location Conditions**: Evolve only at specific locations
- **Friendship Levels**: Evolve based on spirit friendship
- **Battle Count**: Evolve after winning specific number of battles

### 🔍 Evolution Management
- **Species Registration**: Register evolution data for each species
- **Target Resolution**: Determine next evolution stage for spirits
- **Condition Checking**: Validate all evolution requirements
- **Chain Tracking**: Follow complete evolution paths
- **Statistics**: Comprehensive evolution system analytics

### 💾 Data Management
- **JSON Serialization**: Export/import evolution data
- **Validation**: Comprehensive data validation
- **Mock Data**: Testing utilities and mock objects
- **Error Handling**: Robust error handling and reporting

## Installation

```bash
npm install @miff/evolution-pure
```

## Usage

### Basic Evolution Setup

```typescript
import { EvolutionManager, EvolutionCondition, SpeciesEvolutionData } from '@miff/evolution-pure';

// Create evolution manager
const manager = EvolutionManager.create(playerContext);

// Register simple level-based evolution
const levelEvolution = SpeciesEvolutionData.levelEvolution('pikachu', 'raichu', 25);
manager.registerSpeciesEvolution(levelEvolution);

// Register item-based evolution
const itemEvolution = SpeciesEvolutionData.itemEvolution('eevee', 'vaporeon', 'water_stone');
manager.registerSpeciesEvolution(itemEvolution);
```

### Complex Evolution Chains

```typescript
// Create multi-stage evolution chain
const chain = EvolutionUtils.createLevelEvolutionChain('basic_spirit', [15, 30, 50]);
chain.forEach(evolution => manager.registerSpeciesEvolution(evolution));

// Create evolution with multiple conditions
const complexEvolution = new SpeciesEvolutionData('starter', 'legendary', [
  EvolutionCondition.levelAtLeast(50),
  EvolutionCondition.syncAtLeast(80),
  EvolutionCondition.requiresItem('legendary_crystal'),
  EvolutionCondition.loreFlag('defeated_final_boss')
]);
manager.registerSpeciesEvolution(complexEvolution);
```

### Evolution Checking and Execution

```typescript
// Create spirit
const spirit = EvolutionUtils.createMockSpirit('pikachu', 25);

// Check if spirit can evolve
const canEvolve = manager.canEvolve(spirit);
const target = manager.getEvolutionTarget(spirit);

if (canEvolve && target) {
  console.log(`Can evolve to: ${target}`);

  // Attempt evolution
  const result = manager.evolveSpirit(spirit);

  if (result.isSuccess) {
    console.log(`Evolution successful: ${result.newSpeciesId}`);
  } else {
    console.log(`Evolution failed: ${result.message}`);
  }
}
```

### Evolution Statistics

```typescript
const stats = manager.getEvolutionStatistics();

console.log(`Total species: ${stats.totalSpecies}`);
console.log(`Evolvable species: ${stats.evolvableSpecies}`);
console.log(`Max evolution chain: ${stats.maxChainLength}`);

console.log('Conditions by type:');
Object.entries(stats.conditionsByType).forEach(([type, count]) => {
  console.log(`  ${type}: ${count}`);
});
```

## API Reference

### Classes

#### EvolutionManager
Main interface for evolution operations.

**Methods:**
- `registerSpeciesEvolution(data: ISpeciesEvolutionData): void`
- `canEvolve(spirit: IEvolutionSpiritInstance): boolean`
- `getEvolutionTarget(spirit: IEvolutionSpiritInstance): string | null`
- `evolveSpirit(spirit: IEvolutionSpiritInstance): IEvolutionResult`
- `getAvailableEvolutions(spirit: IEvolutionSpiritInstance): string[]`
- `getEvolutionChain(speciesId: string): string[]`
- `validateEvolutionData(): string[]`
- `getEvolutionStatistics(): Record<string, any>`

#### EvolutionCondition
Represents a single evolution condition.

**Static Methods:**
- `create(type: EvolutionConditionType, intValue?: number, stringValue?: string): EvolutionCondition`
- `levelAtLeast(level: number): EvolutionCondition`
- `requiresItem(itemId: string): EvolutionCondition`
- `syncAtLeast(syncLevel: number): EvolutionCondition`
- `loreFlag(flagId: string): EvolutionCondition`
- `timeOfDay(hour: number): EvolutionCondition`
- `atLocation(locationId: string): EvolutionCondition`
- `friendshipLevel(level: number): EvolutionCondition`
- `battleCount(count: number): EvolutionCondition`

#### SpeciesEvolutionData
Holds evolution data for a species.

**Static Methods:**
- `create(speciesId: string, targetId?: string, conditions?: IEvolutionCondition[]): SpeciesEvolutionData`
- `levelEvolution(speciesId: string, targetId: string, level: number): SpeciesEvolutionData`
- `itemEvolution(speciesId: string, targetId: string, itemId: string): SpeciesEvolutionData`
- `syncEvolution(speciesId: string, targetId: string, syncLevel: number): SpeciesEvolutionData`

#### EvolutionResult
Result of evolution attempts.

**Static Methods:**
- `success(newSpeciesId: string, message?: string): EvolutionResult`
- `failure(status: EvolutionStatus, message: string): EvolutionResult`

### Enums

#### EvolutionStatus
- `SUCCESS`: Evolution completed successfully
- `CONDITIONS_NOT_MET`: Evolution conditions not satisfied
- `ALREADY_EVOLVED`: Spirit already at target evolution
- `INVALID_SPIRIT`: Invalid or null spirit
- `EVOLUTION_NOT_FOUND`: No evolution data found

#### EvolutionConditionType
- `LEVEL_AT_LEAST`: Require minimum level
- `REQUIRES_ITEM`: Require specific item
- `SYNC_AT_LEAST`: Require minimum sync percentage
- `LORE_FLAG`: Require lore flag to be set
- `TIME_OF_DAY`: Require specific time of day
- `AT_LOCATION`: Require specific location
- `FRIENDSHIP_LEVEL`: Require minimum friendship
- `BATTLE_COUNT`: Require minimum battle victories
- `EVOLUTION_ITEM`: Require evolution-specific item

#### TimeOfDay
- `DAWN`: 4-6 AM
- `MORNING`: 6-12 PM
- `AFTERNOON`: 12-5 PM
- `EVENING`: 5-8 PM
- `NIGHT`: 8-11 PM
- `MIDNIGHT`: 11 PM - 4 AM

## Configuration

### Player Context Setup

```typescript
const context: IPlayerContext = {
  playerId: 'player123',
  currentLocationId: 'forest_area',
  gameData: {
    onboardingFlags: new Map([
      ['tutorial_complete', true],
      ['first_boss_defeated', false]
    ]),
    timeOfDay: TimeOfDay.AFTERNOON,
    inventory: new Map([
      ['water_stone', 1],
      ['fire_stone', 0]
    ])
  },
  getInventory(): Map<string, number> {
    return this.gameData?.inventory || new Map();
  },
  getFlag(flagKey: string): boolean {
    return this.gameData?.onboardingFlags?.get(flagKey) || false;
  },
  getCurrentLocation(): string {
    return this.currentLocationId || '';
  },
  getTimeOfDay(): TimeOfDay {
    return this.gameData?.timeOfDay || TimeOfDay.AFTERNOON;
  }
};
```

### Evolution Chain Configuration

```typescript
// Simple chain
const simpleChain = EvolutionUtils.createLevelEvolutionChain('basic', [10, 25, 50]);

// Complex conditions
const complexEvolution = new SpeciesEvolutionData('rare_spirit', 'legendary_spirit', [
  EvolutionCondition.levelAtLeast(60),
  EvolutionCondition.syncAtLeast(90),
  EvolutionCondition.requiresItem('legendary_orb'),
  EvolutionCondition.loreFlag('ancient_power_awakened'),
  EvolutionCondition.friendshipLevel(100)
]);

// Time-based evolution
const timeEvolution = new SpeciesEvolutionData('moon_spirit', 'lunar_spirit', [
  EvolutionCondition.timeOfDay(4), // Dawn
  EvolutionCondition.atLocation('moon_temple')
]);
```

## Testing

### Unit Testing

```typescript
describe('EvolutionPure', () => {
  let manager: EvolutionManager;
  let mockSpirit: IEvolutionSpiritInstance;

  beforeEach(() => {
    manager = EvolutionManager.create(EvolutionUtils.createMockPlayerContext());
    mockSpirit = EvolutionUtils.createMockSpirit('test_spirit', 25);
  });

  test('should register and check evolution', () => {
    const evolution = SpeciesEvolutionData.levelEvolution('test_spirit', 'evolved_form', 30);
    manager.registerSpeciesEvolution(evolution);

    expect(manager.canEvolve(mockSpirit)).toBe(false); // Level 25 < 30

    mockSpirit.level = 35;
    expect(manager.canEvolve(mockSpirit)).toBe(true);
    expect(manager.getEvolutionTarget(mockSpirit)).toBe('evolved_form');
  });
});
```

### Integration Testing

```typescript
test('should handle complete evolution workflow', () => {
  // Setup evolution chain
  const chain = EvolutionUtils.createLevelEvolutionChain('starter', [20, 40, 60]);
  chain.forEach(evolution => manager.registerSpeciesEvolution(evolution));

  // Test progression through chain
  let spirit = EvolutionUtils.createMockSpirit('starter', 15);
  expect(manager.canEvolve(spirit)).toBe(false);

  spirit.level = 25;
  const result1 = manager.evolveSpirit(spirit);
  expect(result1.isSuccess).toBe(true);
  expect(result1.newSpeciesId).toBe('starter_evo_1');

  spirit.level = 45;
  const result2 = manager.evolveSpirit(spirit);
  expect(result2.isSuccess).toBe(true);
  expect(result2.newSpeciesId).toBe('starter_evo_2');

  spirit.level = 65;
  const result3 = manager.evolveSpirit(spirit);
  expect(result3.isSuccess).toBe(true);
  expect(result3.newSpeciesId).toBe('starter_evo_3');
});
```

## CLI Usage

```bash
# Start interactive CLI
node miff/pure/EvolutionPure/cliHarness.ts

# Run demo with sample data
node miff/pure/EvolutionPure/cliHarness.ts --demo

# Register evolution from command line
node miff/pure/EvolutionPure/cliHarness.ts --register-evolution "pikachu" "raichu" level 25

# Test evolution from command line
node miff/pure/EvolutionPure/cliHarness.ts --test-evolution "pikachu"
```

## CLI Commands

- `create <name> <type> <level>` - Create test spirit
- `evolve <species_id>` - Attempt evolution
- `check <species_id>` - Check evolution possibilities
- `register <species> <target> [condition] [value]` - Register evolution
- `chain <species_id>` - Show evolution chain
- `stats` - Show system statistics
- `validate` - Validate evolution data
- `demo` - Run evolution demo

## Examples

### Pokemon-Style Evolution

```typescript
// Eevee evolutions
const eeveeEvolutions = [
  SpeciesEvolutionData.itemEvolution('eevee', 'vaporeon', 'water_stone'),
  SpeciesEvolutionData.itemEvolution('eevee', 'jolteon', 'thunder_stone'),
  SpeciesEvolutionData.itemEvolution('eevee', 'flareon', 'fire_stone'),
  SpeciesEvolutionData.itemEvolution('eevee', 'espeon', 'sun_stone'), // Day time
  SpeciesEvolutionData.itemEvolution('eevee', 'umbreon', 'moon_stone')  // Night time
];

eeveeEvolutions.forEach(evolution => manager.registerSpeciesEvolution(evolution));
```

### Level-Based Progression

```typescript
// Dragon evolution chain
const dragonChain = EvolutionUtils.createLevelEvolutionChain('dratini', [30, 55]);
manager.registerSpeciesEvolution(SpeciesEvolutionData.levelEvolution('dragonair', 'dragonite', 55));

// Register all evolutions
dragonChain.forEach(evolution => manager.registerSpeciesEvolution(evolution));
```

### Complex Legendary Evolution

```typescript
const legendaryEvolution = new SpeciesEvolutionData('mew', 'mewtwo', [
  EvolutionCondition.levelAtLeast(70),
  EvolutionCondition.syncAtLeast(100),
  EvolutionCondition.requiresItem('mew_dna'),
  EvolutionCondition.loreFlag('mew_research_complete'),
  EvolutionCondition.battleCount(1000)
]);

manager.registerSpeciesEvolution(legendaryEvolution);
```

## Performance

- **Efficient Condition Checking**: O(1) condition validation per check
- **Fast Evolution Resolution**: Quick target resolution for spirits
- **Memory Efficient**: Minimal memory footprint for evolution data
- **Scalable Architecture**: Supports large numbers of species and evolution chains

## Integration

### With SpiritsPure
```typescript
import { SpiritManager } from '@miff/spirits-pure';
import { EvolutionManager } from '@miff/evolution-pure';

const spiritManager = new SpiritManager();
const evolutionManager = EvolutionManager.create(playerContext);

// Register evolution data
const evolution = SpeciesEvolutionData.levelEvolution('pichu', 'pikachu', 15);
evolutionManager.registerSpeciesEvolution(evolution);

// Create spirit and check evolution
const spirit = spiritManager.createSpirit('pichu', 'electric', 20);
if (evolutionManager.canEvolve(spirit)) {
  const result = evolutionManager.evolveSpirit(spirit);
  if (result.isSuccess) {
    spiritManager.updateSpiritSpecies(spirit, result.newSpeciesId!);
  }
}
```

### With ItemsPure
```typescript
import { ItemUsageManager } from '@miff/items-pure';

const itemManager = new ItemUsageManager(playerContext);

// Create evolution that requires item
const stoneEvolution = SpeciesEvolutionData.itemEvolution('eevee', 'vaporeon', 'water_stone');
evolutionManager.registerSpeciesEvolution(stoneEvolution);

// Check if player has required item
const hasStone = itemManager.hasItem('water_stone');
if (hasStone) {
  const result = evolutionManager.evolveSpirit(eeveeSpirit);
  if (result.isSuccess) {
    itemManager.consumeItem('water_stone');
  }
}
```

## Troubleshooting

### Common Issues

1. **Evolution not available**
   - Check if all conditions are met
   - Verify spirit level and stats
   - Ensure required items are in inventory
   - Check location and time conditions

2. **Conditions not validating**
   - Verify player context is properly configured
   - Check flag values and inventory contents
   - Ensure time and location are correctly set

3. **Performance issues**
   - Large numbers of conditions can slow validation
   - Consider caching frequently checked conditions
   - Optimize complex evolution chains

### Debug Mode

```typescript
// Enable debug logging
process.env.DEBUG = 'evolution-pure:*';

// Get detailed evolution information
const requirements = EvolutionUtils.getEvolutionRequirements(manager, speciesId);
console.log('Evolution requirements:', requirements);

// Validate all evolution data
const errors = manager.validateEvolutionData();
if (errors.length > 0) {
  console.log('Validation errors:', errors);
}
```

## Contributing

1. Follow existing code style and patterns
2. Add comprehensive tests for new condition types
3. Update documentation for API changes
4. Ensure backward compatibility

## License

MIT License - see LICENSE file for details.

## Version History

- **v1.0.0**: Initial release with core evolution system
- **v1.1.0**: Added complex condition chains and CLI tools
- **v1.2.0**: Performance optimizations and integration features

---

**EvolutionPure** - Flexible, powerful evolution system for modern game development.