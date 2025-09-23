# HUDPure - Battle HUD Management System

A comprehensive battle HUD management system for displaying spirit states, turn information, and battle progress. Supports real-time updates, status effects visualization, and cross-platform rendering through adapters.

## Features

- **Spirit State Management**: Complete spirit health, status effects, and metadata tracking
- **Battle Phase Tracking**: Turn-based battle state management with phase transitions
- **Real-time Updates**: Event-driven updates with comprehensive change tracking
- **Multi-platform Rendering**: CLI, Unity, and Godot renderer support
- **Health Visualization**: HP bars, health percentages, and critical status indicators
- **Status Effect Display**: Visual representation of buffs, debuffs, and status effects
- **Battle Statistics**: Comprehensive battle analysis and progress tracking
- **Type-Safe Operations**: Full TypeScript support with comprehensive interfaces

## Installation

```bash
npm install miff-framework
```

## Usage

### Basic Usage

```typescript
import { BattleHUDModel, SpiritHUDState, TurnHUDState } from 'miff-framework';

// Create spirits
const playerSpirit = new SpiritHUDState('waterling', 'Waterling', 60, 60);
const opponentSpirit = new SpiritHUDState('ember', 'Ember', 45, 45);

// Create turn state
const turnState = new TurnHUDState('SelectAction', 'waterling', 'water_burst -> ember');

// Create HUD model
const hudModel = new BattleHUDModel([playerSpirit], [opponentSpirit], turnState);

// Display battle state
console.log(`Battle Phase: ${hudModel.turn.phaseName}`);
console.log(`Player HP: ${playerSpirit.currentHP}/${playerSpirit.maxHP}`);
console.log(`Opponent HP: ${opponentSpirit.currentHP}/${opponentSpirit.maxHP}`);
```

### Advanced Usage

```typescript
import {
  BattleHUDModel,
  HUDManager,
  CLIHUDRenderer,
  HUDPureUtils,
  HUDUpdateType
} from 'miff-framework';

// Create comprehensive battle setup
const playerSpirits = [
  new SpiritHUDState('waterling', 'Waterling', 52, 60, ['regen'], 12, 'water'),
  new SpiritHUDState('sprout', 'Sprout', 0, 30, ['poison'], 8, 'grass')
];

const opponentSpirits = [
  new SpiritHUDState('ember', 'Ember', 28, 45, [], 15, 'fire')
];

const hudModel = HUDPureUtils.createStandardHUD(playerSpirits, opponentSpirits, {
  phaseName: 'SelectAction',
  activeSpiritId: 'waterling',
  actionPreview: 'water_burst -> ember'
});

// Create HUD manager with renderer
const renderer = new CLIHUDRenderer();
const hudManager = new HUDManager(hudModel, renderer);

// Listen for updates
hudManager.onUpdate((event) => {
  console.log(`HUD Update: ${event.type}`);
  if (event.spiritId) {
    console.log(`  Spirit: ${event.spiritId}`);
  }
});

// Render current state
console.log(hudManager.render());
```

### CLI Usage

```bash
# Start interactive CLI
node cliHarness.ts

# Example CLI session:
hud> add player waterling Waterling 60 60
hud> add opponent ember Ember 45 45
hud> phase SelectAction waterling
hud> damage ember 14
hud> status waterling poison
hud> render
hud> simulate 5
hud> demo
```

## API Reference

### Classes

#### SpiritHUDState
Spirit state for HUD display with health, status effects, and metadata.

**Constructor:**
- `constructor(spiritId, name, currentHP, maxHP, statusEffects, level?, element?, position?)`

**Properties:**
- `spiritId: string` - Unique spirit identifier
- `name: string` - Display name
- `currentHP: number` - Current health points
- `maxHP: number` - Maximum health points
- `statusEffects: string[]` - Array of status effect names
- `level?: number` - Spirit level (optional)
- `element?: string` - Elemental type (optional)
- `position?: number` - Battle position (optional)

**Computed Properties:**
- `hpPercentage: number` - Health percentage (0-100)
- `isFullHealth: boolean` - Whether at maximum health
- `isCritical: boolean` - Whether at critical health (≤25%)
- `isLowHealth: boolean` - Whether at low health (≤50%)
- `healthStatus: string` - Health status category
- `isKO: boolean` - Whether knocked out

**Methods:**
- `takeDamage(amount): number` - Apply damage and return actual damage dealt
- `heal(amount): number` - Apply healing and return actual healing done
- `addStatusEffect(effect): void` - Add status effect
- `removeStatusEffect(effect): boolean` - Remove status effect
- `hasStatusEffect(effect): boolean` - Check for status effect
- `getHealthBar(width): string` - Get health bar string representation
- `getDisplayName(): string` - Get formatted display name
- `getStatusString(): string` - Get formatted status effects string
- `clone(): SpiritHUDState` - Create a copy
- `snapshot(): ISpiritHUDState` - Create snapshot for comparison
- `validate(): string[]` - Validate spirit data

#### TurnHUDState
Turn state for battle progression tracking.

**Constructor:**
- `constructor(phaseName, activeSpiritId?, actionPreview?, turnNumber?, roundNumber?)`

**Properties:**
- `phaseName: string` - Current battle phase
- `activeSpiritId?: string` - ID of active spirit (optional)
- `actionPreview?: string` - Preview of next action (optional)
- `turnNumber?: number` - Current turn number (optional)
- `roundNumber?: number` - Current round number (optional)

**Methods:**
- `getDisplayString(): string` - Get formatted display string
- `isPhase(phaseName): boolean` - Check if in specific phase
- `isActionPhase: boolean` - Check if in action phase
- `isResolutionPhase: boolean` - Check if in resolution phase
- `clone(): TurnHUDState` - Create a copy
- `validate(): string[]` - Validate turn data

#### BattleHUDModel
Complete battle HUD model with all spirits and state.

**Constructor:**
- `constructor(player, opponent, turn, metadata?)`

**Properties:**
- `player: SpiritHUDState[]` - Player spirits
- `opponent: SpiritHUDState[]` - Opponent spirits
- `turn: TurnHUDState` - Turn state
- `metadata?: Record<string, any>` - Additional metadata (optional)

**Computed Properties:**
- `allSpirits: ISpiritHUDState[]` - All spirits (player + opponent)
- `livingSpirits: ISpiritHUDState[]` - All living spirits
- `koSpirits: ISpiritHUDState[]` - All KO'd spirits
- `isBattleOver: boolean` - Whether battle is complete
- `battleResult: string` - Battle result ('player_win', 'opponent_win', 'ongoing')

**Methods:**
- `getSpirit(spiritId): ISpiritHUDState | null` - Get spirit by ID
- `getSpiritsBySide(side): ISpiritHUDState[]` - Get spirits by side
- `addSpirit(spirit, side): boolean` - Add spirit to side
- `removeSpirit(spiritId): boolean` - Remove spirit by ID
- `updateSpirit(spiritId, updates): boolean` - Update spirit by ID
- `updateTurn(updates): void` - Update turn state
- `getBattleSummary()` - Get battle status summary
- `clone(): BattleHUDModel` - Create a copy
- `snapshot(): IBattleHUDModel` - Create snapshot for comparison
- `validate(): string[]` - Validate entire model

#### CLIHUDRenderer
CLI renderer for text-based HUD display.

**Methods:**
- `render(model): string` - Render complete HUD model
- `renderSpirit(spirit): string` - Render individual spirit
- `renderTurn(turn): string` - Render turn state
- `renderHealthBar(currentHP, maxHP, width): string` - Render health bar

#### HUDManager
Manager for coordinating HUD updates and rendering.

**Constructor:**
- `constructor(model, renderer)`

**Methods:**
- `updateModel(updates): void` - Update the HUD model
- `render(): string` - Render current HUD state
- `onUpdate(callback): void` - Add update callback
- `removeUpdateCallback(callback): void` - Remove update callback
- `updateSpirit(spiritId, updates): void` - Update specific spirit
- `updateTurn(updates): void` - Update turn state
- `changePhase(phaseName, activeSpiritId?, actionPreview?): void` - Change battle phase
- `getModel(): IBattleHUDModel` - Get current model snapshot
- `clear(): void` - Clear HUD and reset to empty state

### Interfaces

#### ISpiritHUDState
Spirit HUD state interface.

**Properties:**
- `spiritId: string` - Unique spirit identifier
- `name: string` - Display name
- `currentHP: number` - Current health points
- `maxHP: number` - Maximum health points
- `statusEffects: string[]` - Array of status effect names
- `isKO: boolean` - Whether knocked out
- `level?: number` - Spirit level (optional)
- `element?: string` - Elemental type (optional)
- `position?: number` - Battle position (optional)

#### ITurnHUDState
Turn HUD state interface.

**Properties:**
- `phaseName: string` - Current battle phase
- `activeSpiritId?: string` - ID of active spirit (optional)
- `actionPreview?: string` - Preview of next action (optional)
- `turnNumber?: number` - Current turn number (optional)
- `roundNumber?: number` - Current round number (optional)

#### IBattleHUDModel
Battle HUD model interface.

**Properties:**
- `player: ISpiritHUDState[]` - Player spirits
- `opponent: ISpiritHUDState[]` - Opponent spirits
- `turn: ITurnHUDState` - Turn state
- `metadata?: Record<string, any>` - Additional metadata (optional)

#### IHUDRenderer
HUD renderer interface for different platforms.

**Methods:**
- `render(model): string` - Render complete HUD model
- `renderSpirit(spirit): string` - Render individual spirit
- `renderTurn(turn): string` - Render turn state
- `renderHealthBar(currentHP, maxHP, width): string` - Render health bar

#### IHUDUpdateEvent
HUD update event interface.

**Properties:**
- `type: HUDUpdateType` - Type of update
- `spiritId?: string` - Affected spirit ID (optional)
- `data?: any` - Update data (optional)
- `timestamp: number` - Event timestamp

### Enums

#### HUDUpdateType
Types of HUD update events.

```typescript
export enum HUDUpdateType {
  SPIRIT_UPDATE = 'spirit_update',
  TURN_UPDATE = 'turn_update',
  PHASE_CHANGE = 'phase_change',
  BATTLE_END = 'battle_end'
}
```

### Utility Functions

#### HUDPureUtils
Static utility functions for common HUD operations.

- `renderHealthBar(currentHP, maxHP, width)` - Render health bar string
- `createStandardHUD(playerSpirits, opponentSpirits, turnState)` - Create standard HUD model
- `createSpirit(spiritId, name, currentHP, maxHP, options)` - Create spirit with options
- `calculateHealthStats(model)` - Calculate comprehensive health statistics
- `getSpiritsByPriority(model)` - Get spirits sorted by health priority
- `validateHUDModel(model)` - Validate entire HUD model

## Configuration

### Basic Battle Setup

```typescript
import { BattleHUDModel, SpiritHUDState, TurnHUDState } from 'miff-framework';

// Create player spirit
const playerSpirit = new SpiritHUDState(
  'waterling',
  'Waterling',
  60,  // current HP
  60,  // max HP
  [],  // no status effects
  12,  // level 12
  'water'  // water element
);

// Create opponent spirit
const opponentSpirit = new SpiritHUDState(
  'ember',
  'Ember',
  45,  // current HP
  45,  // max HP
  ['burn'],  // has burn status
  15,  // level 15
  'fire'  // fire element
);

// Create turn state
const turnState = new TurnHUDState(
  'SelectAction',
  'waterling',
  'water_burst -> ember'
);

// Create complete HUD model
const hudModel = new BattleHUDModel(
  [playerSpirit],
  [opponentSpirit],
  turnState
);
```

### Advanced Battle Configuration

```typescript
import {
  BattleHUDModel,
  HUDManager,
  CLIHUDRenderer,
  HUDPureUtils
} from 'miff-framework';

// Create multiple spirits for each side
const playerSpirits = [
  new SpiritHUDState('waterling', 'Waterling', 52, 60, ['regen'], 12, 'water', 1),
  new SpiritHUDState('sprout', 'Sprout', 25, 30, ['poison'], 8, 'grass', 2),
  new SpiritHUDState('crystal', 'Crystal', 40, 40, [], 10, 'crystal', 3)
];

const opponentSpirits = [
  new SpiritHUDState('ember', 'Ember', 28, 45, ['burn'], 15, 'fire', 1),
  new SpiritHUDState('stone', 'Stone', 35, 50, [], 18, 'earth', 2)
];

// Create HUD with comprehensive metadata
const hudModel = new BattleHUDModel(
  playerSpirits,
  opponentSpirits,
  new TurnHUDState('SelectAction', 'waterling', 'water_burst -> ember', 1, 1),
  {
    battleType: 'story_battle',
    location: 'forest_clearing',
    difficulty: 'normal'
  }
);

// Create HUD manager with event tracking
const renderer = new CLIHUDRenderer();
const hudManager = new HUDManager(hudModel, renderer);

hudManager.onUpdate((event) => {
  console.log(`Battle Update: ${event.type} at ${new Date(event.timestamp).toISOString()}`);
});

// Real-time battle simulation
setInterval(() => {
  // Simulate damage
  if (Math.random() < 0.3) {
    const targetSpirit = opponentSpirits[Math.floor(Math.random() * opponentSpirits.length)];
    const damage = Math.floor(Math.random() * 15) + 5;
    hudManager.updateSpirit(targetSpirit.spiritId, {
      currentHP: Math.max(0, targetSpirit.currentHP - damage)
    });
  }
}, 2000);
```

## Examples

### Example 1: Simple Battle Display

```typescript
import { BattleHUDModel, SpiritHUDState, TurnHUDState, CLIHUDRenderer } from 'miff-framework';

// Create simple battle
const playerSpirit = new SpiritHUDState('hero', 'Hero', 100, 100, [], 10);
const enemySpirit = new SpiritHUDState('goblin', 'Goblin', 30, 30, [], 5);

const hudModel = new BattleHUDModel(
  [playerSpirit],
  [enemySpirit],
  new TurnHUDState('SelectAction', 'hero', 'attack -> goblin')
);

// Render using CLI renderer
const renderer = new CLIHUDRenderer();
console.log(renderer.render(hudModel));
```

### Example 2: Real-time Battle Simulation

```typescript
import {
  HUDManager,
  CLIHUDRenderer,
  SpiritHUDState,
  TurnHUDState,
  HUDPureUtils
} from 'miff-framework';

// Create battle manager
const playerSpirits = [
  new SpiritHUDState('warrior', 'Warrior', 100, 100, [], 15),
  new SpiritHUDState('mage', 'Mage', 60, 60, ['shield'], 12)
];

const enemySpirits = [
  new SpiritHUDState('orc', 'Orc', 80, 80, [], 14),
  new SpiritHUDState('archer', 'Archer', 40, 40, [], 13)
];

const hudModel = HUDPureUtils.createStandardHUD(playerSpirits, enemySpirits);
const renderer = new CLIHUDRenderer();
const hudManager = new HUDManager(hudModel, renderer);

// Track battle events
hudManager.onUpdate((event) => {
  console.log(`[${new Date(event.timestamp).toLocaleTimeString()}] ${event.type}`);
});

// Simulate battle progression
let turn = 1;
const battleInterval = setInterval(() => {
  // Random action
  const randomPlayer = playerSpirits[Math.floor(Math.random() * playerSpirits.length)];
  const randomEnemy = enemySpirits[Math.floor(Math.random() * enemySpirits.length)];

  if (randomPlayer && randomEnemy) {
    const damage = Math.floor(Math.random() * 20) + 10;
    hudManager.updateSpirit(randomEnemy.spiritId, {
      currentHP: Math.max(0, randomEnemy.currentHP - damage)
    });

    hudManager.changePhase('ResolveAction', randomPlayer.spiritId, `${randomPlayer.name} attacks ${randomEnemy.name} for ${damage}`);
  }

  // Display current state
  console.clear();
  console.log(`=== Turn ${turn} ===`);
  console.log(hudManager.render());

  turn++;

  // End battle if someone wins
  const model = hudManager.getModel();
  const playerLiving = model.player.filter(s => !s.isKO).length;
  const enemyLiving = model.opponent.filter(s => !s.isKO).length;

  if (playerLiving === 0 || enemyLiving === 0) {
    console.log(`\n🏆 Battle Over! ${playerLiving > 0 ? 'Player' : 'Enemy'} wins!`);
    clearInterval(battleInterval);
  }
}, 3000);
```

### Example 3: Status Effect Management

```typescript
import { SpiritHUDState, HUDPureUtils } from 'miff-framework';

// Create spirit with multiple status effects
const spirit = new SpiritHUDState(
  'test_spirit',
  'Test Spirit',
  75,  // current HP
  100, // max HP
  ['poison', 'regen', 'haste'], // status effects
  20,  // level
  'fire' // element
);

console.log(`Spirit: ${spirit.getDisplayName()}`);
console.log(`Health: ${spirit.currentHP}/${spirit.maxHP} (${spirit.hpPercentage.toFixed(1)}%)`);
console.log(`Status: ${spirit.getStatusString()}`);
console.log(`Health Bar: ${spirit.getHealthBar(20)}`);
console.log(`Health Status: ${spirit.healthStatus}`);
console.log(`Is Critical: ${spirit.isCritical}`);
console.log(`Has Poison: ${spirit.hasStatusEffect('poison')}`);
console.log(`Has Burn: ${spirit.hasStatusEffect('burn')}`);

// Add and remove status effects
spirit.addStatusEffect('burn');
console.log(`After adding burn: ${spirit.getStatusString()}`);

spirit.removeStatusEffect('poison');
console.log(`After removing poison: ${spirit.getStatusString()}`);
```

### Example 4: Battle Statistics Analysis

```typescript
import { BattleHUDModel, SpiritHUDState, TurnHUDState, HUDPureUtils } from 'miff-framework';

// Create complex battle scenario
const playerSpirits = [
  new SpiritHUDState('tank', 'Tank', 150, 150, ['shield'], 25),
  new SpiritHUDState('dps', 'DPS', 80, 100, ['haste'], 20),
  new SpiritHUDState('healer', 'Healer', 60, 60, ['regen'], 22)
];

const opponentSpirits = [
  new SpiritHUDState('boss', 'Boss', 200, 300, ['armor'], 30),
  new SpiritHUDState('minion1', 'Minion 1', 20, 50, ['poison'], 18),
  new SpiritHUDState('minion2', 'Minion 2', 0, 50, ['stun'], 18)
];

const hudModel = HUDPureUtils.createStandardHUD(playerSpirits, opponentSpirits, {
  phaseName: 'BossFight',
  turnNumber: 5,
  roundNumber: 2
});

// Analyze battle state
console.log('=== Battle Analysis ===');
console.log(`Phase: ${hudModel.turn.phaseName}`);
console.log(`Turn: ${hudModel.turn.turnNumber}, Round: ${hudModel.turn.roundNumber}`);

const stats = HUDPureUtils.calculateHealthStats(hudModel);
console.log(`\nHealth Statistics:`);
console.log(`Player Total HP: ${stats.playerTotal.toFixed(0)}%`);
console.log(`Opponent Total HP: ${stats.opponentTotal.toFixed(0)}%`);
console.log(`Player Average HP: ${stats.playerAverage.toFixed(1)}%`);
console.log(`Opponent Average HP: ${stats.opponentAverage.toFixed(1)}%`);

console.log(`\nLiving Spirits:`);
console.log(`Player: ${hudModel.player.filter(s => !s.isKO).length}/${hudModel.player.length}`);
console.log(`Opponent: ${hudModel.opponent.filter(s => !s.isKO).length}/${hudModel.opponent.length}`);

console.log(`\nBattle Result: ${hudModel.battleResult}`);
console.log(`Battle Over: ${hudModel.isBattleOver ? 'Yes' : 'No'}`);

console.log(`\nPriority Order (KO first, then by HP):`);
HUDPureUtils.getSpiritsByPriority(hudModel).forEach((spirit, index) => {
  console.log(`  ${index + 1}. ${spirit.name} (${spirit.hpPercentage.toFixed(0)}% HP) ${spirit.isKO ? '[KO]' : ''}`);
});
```

## Testing

```bash
# Run HUDPure tests
npm test -- --testPathPattern="HUDPure"

# Run CLI harness tests
node cliHarness.ts
```

## Integration

### With Other Modules
- **CombatPure**: Real-time combat state updates
- **StatusEffectsPure**: Status effect visualization and management
- **InputPure**: Player input handling for HUD interactions
- **EventSystemPure**: Event-driven battle state changes
- **PerfPure**: Battle performance monitoring and optimization

### Engine Bridges
- **Unity**: Real-time 3D HUD rendering with UGUI
- **Godot**: 2D battle UI system integration
- **Web**: HTML5 Canvas-based battle visualization

## Performance

- **Time Complexity**: O(1) for spirit updates, O(n log n) for priority sorting
- **Space Complexity**: O(p + o) where p = player spirits, o = opponent spirits
- **Optimization Tips**:
  - Cache frequently accessed spirit data
  - Use snapshots for comparison instead of full clones
  - Batch multiple updates when possible
  - Consider spirit pooling for frequently changing battles

## Troubleshooting

### Common Issues
1. **HUD not updating**: Check if update callbacks are properly registered
2. **Spirit data validation errors**: Ensure HP values are within valid ranges
3. **Performance issues**: Consider reducing update frequency for large battles
4. **Memory leaks**: Properly remove update callbacks when HUD is destroyed

### Debug Tips
- Use `validate()` methods to check data integrity
- Monitor update history for unexpected changes
- Test with `CLIHUDRenderer` for simple debugging
- Check battle statistics for analysis

## Contributing

### Adding Features
1. Follow established HUD management patterns
2. Add comprehensive tests for new functionality
3. Update this documentation
4. Ensure type safety with TypeScript
5. Consider performance impact of new features

### Code Style
- Use TypeScript strict mode
- Follow ESLint configuration
- Maintain consistent naming (camelCase)
- Add JSDoc comments for all public APIs
- Keep methods focused and single-purpose

## License

MIT

## Version History

- **v1.0.0**: Initial TypeScript implementation with core HUD system
- **v1.1.0**: Added real-time updates, event system, and performance optimizations
- **v1.2.0**: Enhanced status effect visualization and battle statistics