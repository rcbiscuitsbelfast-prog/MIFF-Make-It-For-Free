# ItemsPure

A comprehensive **item management system** for handling consumables, key items, equipment, and evolution items with configurable effects and target rules. Supports modular effect system and extensible usage validation.

## ✨ Features

- **Multiple Item Types**: Consumables, key items, equipment, and evolution items
- **Modular Effects**: Configurable effects (heal, revive, buffs, sync boost, evolution, flag unlock)
- **Target Validation**: Flexible target rules (any, fainted only, not fainted, battle only, overworld only)
- **Usage Management**: Complete item registry with validation and consumption tracking
- **Inventory Integration**: Seamless integration with player inventory systems
- **Type Safety**: Full TypeScript support with comprehensive interfaces
- **CLI Interface**: Interactive command-line testing and demonstration

## 📦 Installation

```bash
npm install miff-itemspure
```

## 🚀 Quick Start

```typescript
import {
  Item,
  ItemEffect,
  ItemUsageManager,
  ItemType,
  ItemEffectType,
  ItemUtils
} from 'miff-itemspure';

// Create a player context
const context = {
  playerId: 'player1',
  inventory: { 'health_potion': 5 },
  flags: {}
};

// Create item manager
const manager = new ItemUsageManager(context);

// Create a healing item
const healEffect = new ItemEffect(ItemEffectType.HEAL, 50);
const healthPotion = new Item(
  'health_potion',
  'Health Potion',
  ItemType.CONSUMABLE,
  healEffect,
  'notfainted'
);

// Register and use item
manager.registerItem(healthPotion);
const result = manager.useItem('health_potion', spiritTarget);
console.log(result.message); // "Healed 50 HP"
```

## 📚 Core Concepts

### Item Types

- **Consumable**: Items that are used up when consumed (potions, food)
- **Key Item**: Important items that don't get consumed (keys, badges)
- **Equipment**: Items that can be equipped by spirits
- **Evolution Item**: Items used to evolve spirits

### Effect Types

- **Heal**: Restore HP to target
- **Revive**: Revive fainted spirits with percentage HP
- **Buff Attack/Defense**: Temporarily increase stats
- **Sync Boost**: Increase spirit synchronization level
- **Evolve**: Trigger spirit evolution
- **Unlock Flag**: Set game flags or unlock content

### Target Rules

- **any**: Can be used on any target
- **notfainted**: Target must be conscious
- **faintedonly**: Target must be fainted
- **inbattleonly**: Can only be used in battle
- **overworldonly**: Can only be used in overworld

## 🔧 Basic Usage

### Creating Items

```typescript
// Simple healing potion
const healPotion = new Item(
  'health_potion',
  'Health Potion',
  ItemType.CONSUMABLE,
  new ItemEffect(ItemEffectType.HEAL, 50),
  'notfainted'
);

// Revival item
const reviveItem = new Item(
  'revive',
  'Revive',
  ItemType.CONSUMABLE,
  new ItemEffect(ItemEffectType.REVIVE, 50), // 50% HP
  'faintedonly'
);

// Sync boost item
const syncCrystal = new Item(
  'sync_crystal',
  'Sync Crystal',
  ItemType.CONSUMABLE,
  new ItemEffect(ItemEffectType.SYNC_BOOST, 10),
  'any'
);

// Evolution item
const evolutionStone = new Item(
  'fire_stone',
  'Fire Stone',
  ItemType.EVOLUTION_ITEM,
  new ItemEffect(ItemEffectType.EVOLVE, 0, 'fire_spirit'),
  'any'
);
```

### Managing Items

```typescript
// Create manager
const manager = new ItemUsageManager(playerContext);

// Register items
manager.registerItem(healPotion);
manager.registerItem(reviveItem);

// Use items
const healResult = manager.useItem('health_potion', spirit);
const reviveResult = manager.useItem('revive', faintedSpirit);

console.log(healResult.message);   // "Healed 50 HP"
console.log(reviveResult.message); // "Revived with 25 HP"
```

### Querying Items

```typescript
// Get specific item
const item = manager.getItem('health_potion');

// Get all items
const allItems = manager.getAllItems();

// Get items by type
const consumables = manager.getItemsByType(ItemType.CONSUMABLE);

// Get usable items for target
const usableItems = manager.getUsableItems(spirit);

// Search items
const potions = manager.searchItems('potion');
```

## ⚡ Advanced Usage

### Custom Effects

```typescript
// Create custom effect
class CustomEffect extends ItemEffect {
  constructor() {
    super(ItemEffectType.BUFF_ATTACK, 20, '5 turns');
  }

  apply(context: IPlayerContext, target: ISpiritInstance | null): IUsageResult {
    if (!target) {
      return UsageResult.fail(UsageStatus.INVALID_TARGET, 'No target');
    }

    // Custom logic here
    target.attackMultiplier = (target.attackMultiplier || 1) * 1.2;

    return UsageResult.ok(`Attack increased by 20% for 5 turns`);
  }
}

// Use custom effect
const customItem = new Item(
  'attack_boost',
  'Attack Boost',
  ItemType.CONSUMABLE,
  new CustomEffect(),
  'notfainted'
);
```

### Inventory Integration

```typescript
// Create context with inventory
const context: IPlayerContext = {
  playerId: 'player1',
  inventory: {
    'health_potion': 10,
    'super_potion': 5,
    'revive': 3
  },
  flags: {}
};

// Manager will automatically consume items
const result = manager.useItem('health_potion', spirit);
// Inventory will be updated: 'health_potion': 9
```

### Validation and Error Handling

```typescript
// Validate item
const errors = healPotion.validate();
if (errors.length > 0) {
  console.log('Item validation errors:', errors);
}

// Safe usage with error handling
const result = manager.useItem('unknown_item', spirit);
if (!result.isSuccess) {
  console.log('Usage failed:', result.message);
}
```

## 🛠️ CLI Usage

Run the interactive CLI for testing and demonstration:

```bash
# Run CLI
npx miff-itemspure-cli

# Or run directly with tsx
npx tsx miff/pure/ItemsPure/cliHarness.ts
```

### CLI Commands

- `items` - Show all registered items
- `spirits` - Show available test spirits
- `use [item] [spirit]` - Use item on spirit
- `info [item]` - Show detailed item information
- `search [query]` - Search items by name or ID
- `heal [spirit] [amount]` - Heal spirit
- `damage [spirit] [amount]` - Damage spirit
- `status` - Show system statistics
- `help` - Show help information

## 📊 API Reference

### Classes

#### `Item`
Core item class with properties and methods.

**Properties:**
- `itemID: string` - Unique item identifier
- `name: string` - Display name
- `type: ItemType` - Item category
- `effect: ItemEffect` - Associated effect
- `targetRule: string` - Usage restrictions

**Methods:**
- `applyEffect(context, target)` - Apply item effect
- `canUseOn(target)` - Check if usable on target
- `getDescription()` - Get formatted description
- `clone()` - Create copy of item
- `validate()` - Validate configuration

#### `ItemEffect`
Effect configuration and application logic.

**Properties:**
- `effectType: ItemEffectType` - Type of effect
- `amount: number` - Effect magnitude
- `param?: string` - Effect parameter
- `cooldownSeconds: number` - Cooldown duration
- `maxUses: number` - Usage limit (-1 = unlimited)

**Methods:**
- `apply(context, target)` - Execute effect
- `clone()` - Create copy of effect
- `validate()` - Validate configuration
- `getSummary()` - Get effect description

#### `ItemUsageManager`
Manages item registry and usage.

**Methods:**
- `registerItem(item)` - Add item to registry
- `useItem(itemId, target)` - Use item
- `canUseItem(itemId, target)` - Check usability
- `getItem(itemId)` - Retrieve item
- `getAllItems()` - Get all items
- `searchItems(query)` - Search items
- `removeItem(itemId)` - Remove item
- `updateItem(itemId, updates)` - Update item

### Enums

#### `ItemType`
- `CONSUMABLE` - Used up when consumed
- `KEY_ITEM` - Permanent important items
- `EQUIPMENT` - Equippable items
- `EVOLUTION_ITEM` - Evolution triggers

#### `ItemEffectType`
- `HEAL` - Restore HP
- `REVIVE` - Revive fainted spirits
- `BUFF_ATTACK` - Increase attack
- `BUFF_DEFENSE` - Increase defense
- `SYNC_BOOST` - Boost sync level
- `EVOLVE` - Trigger evolution
- `UNLOCK_FLAG` - Set game flags

#### `UsageStatus`
- `SUCCESS` - Item used successfully
- `INVALID_TARGET` - Invalid target for item
- `EFFECT_BLOCKED` - Effect cannot be applied
- `ALREADY_USED` - Item already consumed

### Utility Functions

#### `ItemUtils.createStandardItemSet()`
Creates a set of common RPG items for testing.

#### `ItemUtils.createHealItem(id, name, amount, targetRule?)`
Creates a healing item.

#### `ItemUtils.createReviveItem(id, name, percent, targetRule?)`
Creates a revival item.

#### `ItemUtils.filterItems(items, criteria)`
Filters items by specified criteria.

#### `ItemUtils.validateItemRegistry(items)`
Validates a collection of items.

## ⚙️ Configuration

### Effect Configuration

```typescript
const healEffect = new ItemEffect(
  ItemEffectType.HEAL,
  75,                    // Heal 75 HP
  undefined,             // No parameter needed
  0,                     // No cooldown
  10                     // Max 10 uses
);
```

### Item Configuration

```typescript
const item = new Item(
  'super_potion',
  'Super Potion',
  ItemType.CONSUMABLE,
  healEffect,
  'notfainted'          // Target rule
);
```

### Manager Configuration

```typescript
const context = {
  playerId: 'player1',
  inventory: { 'super_potion': 5 },
  flags: { 'quest_complete': false }
};

const manager = new ItemUsageManager(context);
```

## 🧪 Testing

```typescript
import { Item, ItemEffect, ItemUsageManager, ItemEffectType } from 'miff-itemspure';

// Create test item
const testItem = new Item(
  'test_heal',
  'Test Heal',
  ItemType.CONSUMABLE,
  new ItemEffect(ItemEffectType.HEAL, 30)
);

// Create manager with mock context
const mockContext = {
  playerId: 'test',
  inventory: { 'test_heal': 1 },
  flags: {}
};

const manager = new ItemUsageManager(mockContext);
manager.registerItem(testItem);

// Test usage
const result = manager.useItem('test_heal', mockSpirit);
console.log(result.isSuccess); // true
console.log(result.message);   // "Healed 30 HP"
```

## 🔍 Integration Examples

### Battle System Integration

```typescript
// In battle system
const healResult = manager.useItem('health_potion', currentSpirit);
if (healResult.isSuccess) {
  // Update battle UI
  updateSpiritHP(currentSpirit);
  removeItemFromInventory('health_potion');
}
```

### Overworld Integration

```typescript
// Outside battle
const reviveResult = manager.useItem('revive', faintedSpirit);
if (reviveResult.isSuccess) {
  // Return spirit to party
  party.addSpirit(faintedSpirit);
  showMessage(reviveResult.message);
}
```

### Evolution System Integration

```typescript
// Evolution trigger
const evolutionResult = manager.useItem('fire_stone', candidateSpirit);
if (evolutionResult.isSuccess) {
  // Handle evolution
  const evolvedSpirit = evolveSpirit(candidateSpirit, 'fire_spirit');
  replaceSpiritInParty(candidateSpirit, evolvedSpirit);
}
```

## 📈 Performance

- **Memory Efficient**: Minimal memory footprint for item definitions
- **Fast Lookup**: O(1) item retrieval by ID
- **Optimized Validation**: Cached validation results where possible
- **Scalable Registry**: Efficient handling of large item collections

## 🔒 Security

- **Input Validation**: All inputs validated before processing
- **Safe Execution**: Protected against malicious effect configurations
- **Error Isolation**: Effect failures don't crash the system
- **Type Safety**: Full TypeScript coverage prevents runtime errors

## 🤝 Contributing

Contributions are welcome! Please see the main MIFF repository for guidelines.

## 📝 License

MIT License - see LICENSE file for details.

## 🔄 Migration from C#

ItemsPure is a TypeScript conversion of the original C# implementation. Key differences:

- **Type Safety**: Enhanced with TypeScript interfaces
- **Modularity**: Improved separation of concerns
- **CLI Tools**: Added interactive testing interface
- **Documentation**: Comprehensive examples and API docs

The core functionality remains identical to the original C# version while adding modern JavaScript/TypeScript capabilities.