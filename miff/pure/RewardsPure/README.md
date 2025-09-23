# RewardsPure - Reward and Drop System

A comprehensive reward and drop system for handling currency, XP, items, and weighted random selection from drop tables. Supports deterministic rewards based on encounter difficulty and player progression.

## Features

- **Reward Generation**: Dynamic reward calculation based on encounter difficulty
- **Drop Tables**: Weighted random selection from configurable drop tables
- **Level Scaling**: Automatic reward scaling based on level differences
- **Bonus Rewards**: Special reward multipliers for rare encounters
- **Reward History**: Track and analyze reward generation patterns
- **Type-Safe Operations**: Full TypeScript support with comprehensive interfaces
- **Performance Optimized**: Efficient weighted selection algorithms

## Installation

```bash
npm install miff-framework
```

## Usage

### Basic Usage

```typescript
import { RewardManager, RewardStub } from 'miff-framework';

// Create reward manager
const rewardManager = new RewardManager();

// Generate reward for an encounter
const reward = rewardManager.generateRewards('battle', 10, 12);
console.log(reward.toString()); // +7c, +16xp
```

### Advanced Usage

```typescript
import {
  RewardManager,
  DropResolver,
  DropTable,
  RewardUtils,
  RNGProvider
} from 'miff-framework';

// Create reward manager with custom scaling
const rewardManager = new RewardManager();
rewardManager.configureScaling(10, 3, 20, 5);

// Create drop table
const dropTable = RewardUtils.createStandardDropTable([
  { itemId: 'health_potion', weight: 50 },
  { itemId: 'mana_potion', weight: 30 },
  { itemId: 'rare_sword', weight: 5 }
]);

// Create drop resolver
const rng = new RNGProvider(12345);
const dropResolver = new DropResolver(rng);

// Resolve random item from table
const item = dropResolver.resolve(dropTable);
if (item) {
  console.log(`Got item: ${item}`);
}
```

### CLI Usage

```bash
# Start interactive CLI
node cliHarness.ts

# Example CLI session:
rewards> reward battle 10 12
rewards> add health_potion 50
rewards> add rare_sword 5
rewards> drop 100
rewards> demo
```

## API Reference

### Classes

#### RewardStub
Basic reward data structure containing currency, XP, and optional item.

**Constructor:**
- `constructor(currency, xpGain, itemId?)`

**Properties:**
- `currency: number` - Currency amount
- `xpGain: number` - Experience points
- `itemId?: string` - Optional item identifier

**Methods:**
- `toString(): string` - String representation
- `clone(): RewardStub` - Create a copy
- `add(other): void` - Add another reward
- `multiply(factor): void` - Multiply by factor
- `validate(): string[]` - Validate data
- `isEmpty(): boolean` - Check if empty
- `getTotalValue(xpValue): number` - Get total value

#### DropEntry
Drop table entry with item and weight.

**Constructor:**
- `constructor(itemId, weight)`

**Properties:**
- `itemId: string` - Item identifier
- `weight: number` - Selection weight

**Methods:**
- `clone(): DropEntry` - Create a copy
- `validate(): string[]` - Validate data

#### DropTable
Collection of drop entries for weighted selection.

**Constructor:**
- `constructor(entries?)`

**Properties:**
- `entries: DropEntry[]` - Table entries

**Methods:**
- `addEntry(entry): boolean` - Add entry to table
- `removeEntriesByItem(itemId): number` - Remove entries by item
- `getTotalWeight(): number` - Get total weight
- `getEntriesByWeight(): DropEntry[]` - Get entries sorted by weight
- `getDropRate(itemId): number` - Get drop rate for item
- `validate(): string[]` - Validate table
- `clone(): DropTable` - Create a copy

#### RewardManager
Manager for generating rewards based on encounters.

**Methods:**
- `generateRewards(encounterType, playerLevel, enemyLevel)` - Generate basic reward
- `generateRewardsCustom(encounterType, playerLevel, enemyLevel, currencyMult, xpMult)` - Generate with custom multipliers
- `generateBonusRewards(baseReward, bonusType, multiplier)` - Generate bonus rewards
- `calculateExpectedValue(encounterType, playerLevel, enemyLevel, attempts)` - Calculate expected value
- `configureScaling(baseCurrency, levelCurrencyMult, baseXP, levelXPMult)` - Configure reward scaling
- `getScalingConfig()` - Get current scaling configuration

#### DropResolver
Resolver for weighted random selection from drop tables.

**Constructor:**
- `constructor(rng)`

**Methods:**
- `resolve(table): string | null` - Resolve single item
- `resolveMultiple(table, count): string[]` - Resolve multiple items
- `testDropRates(table, simulations): Map<string, number>` - Test drop rates
- `wouldDrop(table, itemId): boolean` - Check if item would drop
- `getDropRate(table, itemId): number` - Get drop rate for item

### Interfaces

#### IRewardStub
Basic reward interface.

**Properties:**
- `currency: number` - Currency amount
- `xpGain: number` - Experience points
- `itemId?: string` - Optional item identifier

#### IDropEntry
Drop table entry interface.

**Properties:**
- `itemId: string` - Item identifier
- `weight: number` - Selection weight

#### IDropTable
Drop table interface.

**Properties:**
- `entries: IDropEntry[]` - Table entries

#### IRNGProvider
RNG provider interface (for dependency injection).

**Methods:**
- `nextInt(min, max): number` - Get random integer
- `nextFloat(min, max): number` - Get random float

### Utility Functions

#### RewardUtils
Static utility functions for common operations.

- `createReward(currency, xpGain, itemId)` - Create reward stub
- `createStandardDropTable(items)` - Create standard drop table
- `createRareDropTable(commonItems, rareItems, rareChance)` - Create table with rare items
- `calculateRewardScaling(playerLevel, enemyLevel)` - Calculate scaling multipliers
- `mergeRewards(rewards)` - Merge multiple rewards
- `splitRewards(reward, recipientCount)` - Split rewards among recipients
- `calculateTotalValue(rewards, xpValue)` - Calculate total value
- `validateReward(reward)` - Validate reward data
- `validateDropTable(table)` - Validate drop table

## Configuration

### Basic Reward Scaling

```typescript
import { RewardManager } from 'miff-framework';

const rewardManager = new RewardManager();

// Configure reward scaling
rewardManager.configureScaling(
  10,  // Base currency for equal level
  3,   // Currency increase per level difference
  20,  // Base XP for equal level
  5    // XP increase per level difference
);

// Generate reward
const reward = rewardManager.generateRewards('battle', 10, 15);
// Result: +25c, +45xp (5 level difference)
```

### Advanced Reward System

```typescript
import { RewardManager, DropTable, RewardUtils } from 'miff-framework';

const rewardManager = new RewardManager();

// Create custom reward manager
class CustomRewardManager extends RewardManager {
  generateRewards(encounterType: string, playerLevel: number, enemyLevel: number) {
    const baseReward = super.generateRewards(encounterType, playerLevel, enemyLevel);

    // Add encounter-specific bonuses
    if (encounterType === 'boss') {
      baseReward.multiply(2); // Double rewards for boss fights
    } else if (encounterType === 'elite') {
      baseReward.multiply(1.5); // 50% bonus for elite fights
    }

    return baseReward;
  }
}

const customManager = new CustomRewardManager();
```

## Examples

### Example 1: Simple Reward Generation

```typescript
import { RewardManager } from 'miff-framework';

const rewardManager = new RewardManager();

// Simulate a battle between level 8 player and level 10 enemy
const reward = rewardManager.generateRewards('battle', 8, 10);
console.log(`Reward: ${reward.toString()}`);
// Output: +9c, +16xp
```

### Example 2: Drop Table System

```typescript
import { DropTable, DropResolver, RNGProvider, RewardUtils } from 'miff-framework';

const rng = new RNGProvider(12345);
const dropResolver = new DropResolver(rng);

// Create drop table
const dropTable = RewardUtils.createStandardDropTable([
  { itemId: 'health_potion', weight: 50 },
  { itemId: 'mana_potion', weight: 30 },
  { itemId: 'common_ore', weight: 100 },
  { itemId: 'rare_gem', weight: 10 },
  { itemId: 'legendary_weapon', weight: 1 }
]);

// Simulate 100 drops
const results = new Map<string, number>();
for (let i = 0; i < 100; i++) {
  const item = dropResolver.resolve(dropTable);
  if (item) {
    results.set(item, (results.get(item) || 0) + 1);
  }
}

console.log('Drop results:');
results.forEach((count, item) => {
  console.log(`${item}: ${count}`);
});
```

### Example 3: Complex Reward System

```typescript
import {
  RewardManager,
  DropTable,
  RewardUtils,
  RNGProvider,
  RewardStub
} from 'miff-framework';

const rewardManager = new RewardManager();
const rng = new RNGProvider(12345);

// Create different drop tables for different areas
const forestTable = RewardUtils.createStandardDropTable([
  { itemId: 'wood', weight: 100 },
  { itemId: 'herb', weight: 50 },
  { itemId: 'forest_crystal', weight: 5 }
]);

const caveTable = RewardUtils.createStandardDropTable([
  { itemId: 'ore', weight: 100 },
  { itemId: 'gem', weight: 20 },
  { itemId: 'cave_crystal', weight: 10 }
]);

// Simulate adventure
const areas = ['forest', 'cave', 'forest', 'cave'];
let totalReward = new RewardStub();

areas.forEach((area, index) => {
  const playerLevel = 5 + index;
  const enemyLevel = 4 + index;

  const reward = rewardManager.generateRewards('exploration', playerLevel, enemyLevel);
  totalReward.add(reward);

  // Random item drop
  const table = area === 'forest' ? forestTable : caveTable;
  const dropResolver = new DropResolver(rng);
  const item = dropResolver.resolve(table);
  if (item) {
    console.log(`Found ${item} in ${area}!`);
  }

  console.log(`Area ${index + 1}: ${reward.toString()}`);
});

console.log(`Total reward: ${totalReward.toString()}`);
```

### Example 4: Reward Analysis

```typescript
import { RewardManager } from 'miff-framework';

const rewardManager = new RewardManager();

// Analyze expected rewards for different scenarios
const scenarios = [
  { playerLevel: 1, enemyLevel: 1, description: 'Equal level fight' },
  { playerLevel: 1, enemyLevel: 5, description: 'Challenging fight' },
  { playerLevel: 10, enemyLevel: 3, description: 'Easy fight' },
  { playerLevel: 20, enemyLevel: 25, description: 'Boss fight' }
];

console.log('Reward Analysis:');
scenarios.forEach(scenario => {
  const expectedValue = rewardManager.calculateExpectedValue(
    'battle',
    scenario.playerLevel,
    scenario.enemyLevel,
    1000
  );

  const reward = rewardManager.generateRewards(
    'battle',
    scenario.playerLevel,
    scenario.enemyLevel
  );

  console.log(`${scenario.description}:`);
  console.log(`  Sample: ${reward.toString()}`);
  console.log(`  Expected value: ${expectedValue.toFixed(2)}`);
});
```

## Testing

```bash
# Run RewardsPure tests
npm test -- --testPathPattern="RewardsPure"

# Run CLI harness tests
node cliHarness.ts
```

## Integration

### With Other Modules
- **RNGPure**: Random number generation for drop resolution
- **EncounterPure**: Reward generation based on encounter results
- **ItemsPure**: Item management and inventory systems
- **ProgressionPure**: Player progression and level management

### Engine Bridges
- **Unity**: Loot system integration
- **Godot**: Drop table management
- **Web**: Client-side reward simulation

## Performance

- **Time Complexity**: O(log n) for weighted selection where n = table entries
- **Space Complexity**: O(r + d) where r = rewards, d = drop tables
- **Optimization Tips**:
  - Cache frequently used drop tables
  - Pre-calculate total weights when possible
  - Use appropriate data structures for large reward histories

## Troubleshooting

### Common Issues
1. **No rewards generated**: Check level parameters and scaling configuration
2. **Wrong drop rates**: Verify drop table weights and total weight calculations
3. **Performance issues**: Consider drop table size and simulation frequency
4. **RNG not working**: Ensure RNG provider is properly initialized

### Debug Tips
- Use `validateReward()` and `validateDropTable()` for data validation
- Test drop rates with `testDropRates()` method
- Check reward history patterns for analysis
- Verify RNG provider randomness

## Contributing

### Adding Features
1. Follow established reward system patterns
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

- **v1.0.0**: Initial TypeScript implementation with core reward and drop systems
- **v1.1.0**: Added reward scaling, bonus systems, and performance optimizations