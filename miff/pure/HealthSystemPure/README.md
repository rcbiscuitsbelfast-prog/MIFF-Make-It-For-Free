# HealthSystemPure - Advanced Health Management System

A comprehensive health system providing damage/healing, status effects, regeneration, shields, and complete health management with deterministic outcomes.

## Features

- **Health Management**: Complete entity health tracking with customizable max HP
- **Damage/Healing**: Deterministic damage and healing calculations
- **Shield System**: Advanced shield mechanics with absorption and duration
- **Regeneration**: Flexible regeneration effects with configurable intervals
- **Immunities & Resistances**: Element-based immunity and resistance systems
- **Status Effects**: Integration with status effect systems
- **Statistics Tracking**: Comprehensive health statistics and analytics
- **Export Capabilities**: Multiple export formats for health data

## Installation

```bash
npm install miff-framework
```

## Usage

### Basic Usage

```typescript
import { HealthSystemManager, HealthEntity } from 'miff-framework';

// Create health system
const healthSystem = new HealthSystemManager();

// Create a health entity
const player: HealthEntity = {
  id: 'player',
  maxHp: 100,
  currentHp: 100,
  shields: [],
  regeneration: [],
  immunities: [],
  resistances: {},
  lastUpdate: Date.now()
};

// Add entity to system
healthSystem.createEntity('player', 100, { currentHp: 100 });

// Apply damage
const damageResult = healthSystem.applyDamage('player', 25, 'physical');
console.log(`Player health: ${damageResult.currentHp}`);
```

### Advanced Usage

```typescript
// Add shields
healthSystem.addShield('player', {
  id: 'magic_shield',
  type: 'magical',
  amount: 50,
  maxAmount: 50,
  absorption: 0.8,
  duration: 30000
});

// Add regeneration
healthSystem.addRegeneration('player', {
  id: 'health_regen',
  type: 'hp',
  amount: 5, // 5 HP per second
  duration: 60000,
  interval: 1000,
  expiresAt: Date.now() + 60000
});

// Get statistics
const stats = healthSystem.getStatistics();
console.log(`Total entities: ${stats.totalEntities}`);
console.log(`Alive entities: ${stats.aliveEntities}`);
```

### CLI Usage

```bash
# Run with fixture file
node cliHarness.ts fixtures/health_events.json

# Run with default fixtures
node cliHarness.ts

# Run health simulation
node cliHarness.ts --simulate combat
```

## API Reference

### Interfaces

#### HealthEntity
- `id: string` - Unique identifier for the entity
- `maxHp: number` - Maximum health points
- `currentHp: number` - Current health points
- `shields: Shield[]` - Array of active shields
- `regeneration: RegenerationEffect[]` - Array of regeneration effects
- `immunities: string[]` - Array of immunities
- `resistances: Record<string, number>` - Resistance percentages by type
- `lastUpdate: number` - Last update timestamp
- `metadata?: Record<string, any>` - Optional metadata

#### Shield
- `id: string` - Unique shield identifier
- `type: 'physical' | 'magical' | 'elemental' | 'all'` - Shield type
- `amount: number` - Current shield amount
- `maxAmount: number` - Maximum shield capacity
- `absorption: number` - Damage absorption percentage (0-1)
- `duration?: number` - Duration in milliseconds (-1 for permanent)
- `expiresAt?: number` - Expiration timestamp
- `metadata?: Record<string, any>` - Optional metadata

#### RegenerationEffect
- `id: string` - Unique effect identifier
- `type: 'hp' | 'shield' | 'both'` - Effect type
- `amount: number` - Regeneration amount per second
- `duration: number` - Total duration in seconds
- `interval: number` - Tick interval in seconds
- `lastTick: number` - Last tick timestamp
- `expiresAt: number` - Expiration timestamp
- `metadata?: Record<string, any>` - Optional metadata

### Classes

#### HealthSystemManager
Main class for managing health entities and operations.

**Constructor:**
- `constructor()` - Create new health system manager

**Core Methods:**
- `createEntity(id: string, maxHp: number, options?: EntityOptions): void` - Create new health entity
- `applyDamage(entityId: string, amount: number, type?: DamageType): HealthResult` - Apply damage to entity
- `applyHealing(entityId: string, amount: number): HealthResult` - Apply healing to entity
- `addShield(entityId: string, shield: Shield): void` - Add shield to entity
- `addRegeneration(entityId: string, effect: RegenerationEffect): void` - Add regeneration effect
- `getStatistics(): HealthStats` - Get system statistics

**Utility Methods:**
- `exportData(format: 'json' | 'csv' | 'xml'): string` - Export health data
- `reset(): void` - Reset all entities to full health
- `cleanup(): void` - Remove dead entities

### Utility Types

#### HealthStats
- `totalEntities: number` - Total entities in system
- `aliveEntities: number` - Currently alive entities
- `deadEntities: number` - Dead entities
- `averageHp: number` - Average health percentage
- `totalShields: number` - Total active shields
- `activeRegeneration: number` - Active regeneration effects
- `damageDealt: number` - Total damage dealt
- `healingDone: number` - Total healing done
- `eventTypes: Record<string, number>` - Event type counts
- `damageTypes: Record<string, number>` - Damage type counts

## Configuration

### Basic Configuration

```typescript
const basicConfig = {
  maxEntities: 1000,
  defaultMaxHp: 100,
  enableStatistics: true
};
```

### Advanced Configuration

```typescript
const advancedConfig = {
  ...basicConfig,
  enableDetailedLogging: true,
  customDamageFormulas: {
    critical: (damage) => damage * 2,
    glancing: (damage) => damage * 0.5
  },
  regenerationTickRate: 1000
};
```

## Testing

```bash
# Run HealthSystem tests
npm test -- --testPathPattern="HealthSystemPure"

# Run specific test
npm test -- --testNamePattern="should provide health statistics"
```

## Examples

### Example 1: Combat Scenario
```typescript
import { HealthSystemManager } from 'miff-framework';

const healthSystem = new HealthSystemManager();

// Create combatants
healthSystem.createEntity('hero', 100, { currentHp: 100 });
healthSystem.createEntity('goblin', 50, { currentHp: 50 });

// Combat loop
while (healthSystem.getStatistics().aliveEntities > 1) {
  const damage = Math.floor(Math.random() * 20) + 10;
  const result = healthSystem.applyDamage('goblin', damage, 'physical');

  if (!result.alive) {
    console.log('Goblin defeated!');
    break;
  }
}
```

### Example 2: Healing Station
```typescript
// Create healing station
healthSystem.createEntity('healing_station', 1000, { currentHp: 1000 });

// Add regeneration to nearby entities
healthSystem.addRegeneration('hero', {
  id: 'healing_aura',
  type: 'hp',
  amount: 10,
  duration: 5000,
  interval: 1000,
  expiresAt: Date.now() + 5000
});
```

## Migration from C#

### API Changes
- C# `ApplyDamage(entityId, amount, type)` → TypeScript `applyDamage(entityId, amount, type)`
- C# `GetStatistics()` → TypeScript `getStatistics()`
- C# `AddShield(entityId, shield)` → TypeScript `addShield(entityId, shield)`

### Breaking Changes
- Event handling now uses callbacks instead of events
- Shield absorption is now a percentage (0-1) instead of decimal
- Regeneration intervals are in milliseconds instead of ticks

### Migration Guide
1. Update method calls to camelCase naming
2. Convert percentage values to decimal (e.g., 80% → 0.8)
3. Update event handling to use callback pattern
4. Replace C# Random with RNGProvider for deterministic behavior

## Integration

### With Other Modules
- **StatusEffectsPure**: Apply status effects that modify health calculations
- **CombatPure**: Integration with combat system for damage application
- **NPCsPure**: Health management for NPCs and creatures
- **QuestSystemPure**: Health-based quest conditions

### Engine Bridges
- **Unity**: Direct integration with Unity health components
- **Godot**: Godot Area2D/3D health triggers
- **Web**: Canvas-based health bars and UI

## Performance

- **Time Complexity**: O(1) for most operations, O(n) for statistics where n = entity count
- **Space Complexity**: O(n) where n = number of entities
- **Optimization Tips**:
  - Use entity pooling for frequently created/destroyed entities
  - Cache statistics objects to avoid recalculation
  - Remove expired regeneration effects regularly

## Troubleshooting

### Common Issues
1. **Shields not absorbing damage**: Check shield type matches damage type
2. **Regeneration not working**: Verify regeneration interval and duration settings
3. **Memory leaks**: Call cleanup() regularly to remove dead entities

### Debug Tips
- Enable detailed logging with `enableDetailedLogging: true`
- Use `exportData('json')` to inspect entity states
- Monitor statistics with `getStatistics()` for system health

## Contributing

### Adding Features
1. Follow established interface patterns
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

- **v1.0.0**: Initial TypeScript implementation
- **v1.1.0**: Added shield system and regeneration
- **v1.2.0**: Enhanced statistics and export capabilities