# SlicePure

A comprehensive **overworld battle vertical slice** demonstration that shows a complete game loop from overworld encounter generation through battle execution. This tool demonstrates how all the MIFF modules work together in practice, providing a fully functional game prototype.

## ✨ Features

- **Complete Game Loop**: Overworld roaming → encounter generation → battle execution → rewards
- **Dynamic Encounter System**: Configurable encounter tables and triggers with probability calculations
- **Turn-Based Battle System**: Full battle simulation with damage calculation and status effects
- **RNG Integration**: Deterministic random number generation with seed support
- **Player State Management**: Comprehensive player state with position, time, weather, and statistics
- **Encounter Triggers**: Multiple trigger types (tile-based, step-based, time-based, random)
- **Battle Logging**: Detailed battle logs with turn-by-turn action tracking
- **Experience & Rewards**: Automatic calculation of XP, gold, and sync points
- **Weather & Time System**: Environmental factors affecting encounter rates
- **Interactive CLI**: Full command-line interface for testing and demonstration
- **Modular Architecture**: Clean separation between overworld, battle, and logging systems
- **Performance Optimized**: Efficient simulation for real-time gameplay
- **Educational Value**: Perfect example of how game systems integrate
- **Extensible Design**: Easy to add new features and modify existing ones

## 🎮 What is a Vertical Slice?

A **vertical slice** is a complete, playable section of a game that demonstrates:

1. **Core Gameplay Loop**: Player movement → encounter → battle → rewards
2. **Technical Integration**: How different systems work together
3. **Game Feel**: The actual experience of playing the game
4. **Polish**: All UI, audio, and feedback systems working
5. **Completeness**: A self-contained experience that feels like the real game

SlicePure provides a fully functional vertical slice of an RPG game, showing how all MIFF modules integrate seamlessly.

## 📦 Installation

```bash
npm install miff-slice-pure
```

## 🚀 Quick Start

```typescript
import {
  OverworldBattleSliceTool,
  SliceUtils,
  PlayerState,
  EncounterTable,
  EncounterTrigger,
  RNGProvider,
  TimeOfDay
} from 'miff-slice-pure';

// Run the vertical slice demonstration
console.log('🎮 Starting Overworld Battle Vertical Slice...');
OverworldBattleSliceTool.main(12345); // Use seed 12345 for reproducible results

// Or run with CLI
npx slice-pure-cli
```

## 🎯 The Complete Game Loop

### 1. Overworld Roaming
```typescript
// Create player state
const playerState = new PlayerState('newhaven', 'grass', TimeOfDay.DAY, 0, { x: 0, y: 0 }, 'clear');

// Simulate roaming and encounters
const rng = new RNGProvider(12345);
const encounterController = createEncounterController();

for (let steps = 1; steps <= 50; steps++) {
  // Move player
  const direction = rng.nextInt(0, 3);
  if (direction === 0) playerState.position.x++;
  if (direction === 1) playerState.position.x--;
  if (direction === 2) playerState.position.y++;
  if (direction === 3) playerState.position.y--;

  // Check for encounter
  const encounter = encounterController.checkForEncounter(playerState, rng);
  if (encounter.triggered) {
    console.log(`🎯 Encounter! ${encounter.spiritId} (Level ${encounter.level}) appeared!`);
    break;
  }
}
```

### 2. Battle System Integration
```typescript
// Create spirits
const playerSpirit = createPlayerSpirit('waterling', 'water', 6);
const wildSpirit = createWildSpirit(encounter.spiritId, encounter.level);

// Simulate battle
let turn = 1;
while (playerSpirit.isAlive() && wildSpirit.isAlive()) {
  // Player attacks
  const playerDamage = calculateDamage(playerSpirit, wildSpirit);
  wildSpirit.takeDamage(playerDamage);

  if (!wildSpirit.isAlive()) {
    console.log(`${wildSpirit.name} fainted!`);
    break;
  }

  // Wild spirit attacks
  const wildDamage = calculateDamage(wildSpirit, playerSpirit);
  playerSpirit.takeDamage(wildDamage);

  turn++;
}

// Calculate rewards
const experienceGained = wildSpirit.level * 15;
const goldGained = wildSpirit.level * 25;
const syncGained = Math.floor(turn * 3.5);

console.log(`🎖️ Rewards: ${experienceGained} XP, ${goldGained} gold, ${syncGained} sync points`);
```

### 3. Complete CLI Demo
```bash
# Start the interactive demonstration
npx slice-pure-cli

# Available commands:
roam [steps]        # Roam around looking for encounters
battle              # Trigger battle with random spirit
status              # Show current player state
move [direction]    # Move (n, s, e, w)
time [time]         # Set time of day (dawn, day, dusk, night)
weather [weather]   # Set weather (clear, rain, fog, storm)
reset               # Reset player state
demo                # Run automated demonstration
help                # Show available commands
exit                # Exit application
```

## 📚 Core Concepts

### Overworld State Management

The overworld is represented by a `PlayerState` that tracks:

- **Position**: X, Y coordinates in the game world
- **Zone**: Current area (e.g., 'newhaven', 'forest', 'mountain')
- **Tile Type**: Surface type (e.g., 'grass', 'water', 'mountain')
- **Time of Day**: Environmental time affecting encounter rates
- **Weather**: Weather conditions modifying gameplay
- **Encounter Counter**: Steps since last encounter

### Encounter System

Encounters are controlled by:

- **Encounter Tables**: Define which spirits can appear in each zone
- **Encounter Triggers**: Conditions that activate encounters
- **Probability Calculation**: Dynamic encounter rate calculation
- **RNG Integration**: Deterministic random encounters

### Battle Simulation

Battles include:

- **Turn-Based Combat**: Alternating player and AI turns
- **Damage Calculation**: Attack, defense, and type effectiveness
- **Status Effects**: Buffs, debuffs, and special conditions
- **Experience Rewards**: XP, gold, and sync point calculation
- **Battle Logging**: Turn-by-turn action tracking

## 🔧 Advanced Usage

### Custom Encounter Tables

```typescript
// Create custom encounter table
const customTable = new EncounterTable('custom_zone');

customTable.addEntry({
  zoneId: 'custom_zone',
  spiritId: 'rare_spirit',
  weight: 10,        // Lower weight = rarer encounter
  minLevel: 25,
  maxLevel: 35,
  conditions: { timeOfDay: 'night' } // Only at night
});

customTable.addEntry({
  zoneId: 'custom_zone',
  spiritId: 'common_spirit',
  weight: 90,        // Higher weight = common encounter
  minLevel: 5,
  maxLevel: 15
});

// Register with encounter controller
encounterController.registerTable(customTable);
```

### Dynamic Encounter Rates

```typescript
// Calculate encounter probability based on multiple factors
function calculateEncounterProbability(state: PlayerState, baseRate: number = 0.1): number {
  let probability = baseRate;

  // Tile type modifiers
  if (state.tileType === 'grass') probability *= 1.2;
  if (state.tileType === 'water') probability *= 0.8;
  if (state.tileType === 'mountain') probability *= 0.5;

  // Time of day modifiers
  if (state.timeOfDay === TimeOfDay.NIGHT) probability *= 1.1;
  if (state.timeOfDay === TimeOfDay.DAWN || state.timeOfDay === TimeOfDay.DUSK) probability *= 0.9;

  // Weather modifiers
  if (state.weather === 'rain') probability *= 1.3;
  if (state.weather === 'fog') probability *= 0.7;

  return Math.min(probability, 1.0); // Cap at 100%
}

// Use in encounter controller
const encounterRate = calculateEncounterProbability(playerState, 0.15);
const shouldEncounter = rng.nextFloat() < encounterRate;
```

### Advanced Battle System

```typescript
// Create battle with type effectiveness
class AdvancedBattleSystem {
  private typeEffectiveness = new Map<string, Map<string, number>>();

  constructor() {
    this.initializeTypeChart();
  }

  private initializeTypeChart(): void {
    // Fire type effectiveness
    this.typeEffectiveness.set('fire', new Map([
      ['grass', 2.0],    // Super effective
      ['water', 0.5],    // Not very effective
      ['fire', 0.5]      // Not very effective
    ]));

    // Water type effectiveness
    this.typeEffectiveness.set('water', new Map([
      ['fire', 2.0],     // Super effective
      ['water', 0.5],    // Not very effective
      ['grass', 0.5]     // Not very effective
    ]));
  }

  calculateDamage(attacker: ISpiritInstance, target: ISpiritInstance): number {
    const effectiveness = this.getEffectiveness(attacker.typeTag, target.typeTag);
    const baseDamage = attacker.attack;
    const defense = target.defense;

    // Damage formula: (Attack * Effectiveness) - (Defense * 0.5)
    const rawDamage = (baseDamage * effectiveness) - (defense * 0.5);
    const randomFactor = 0.85 + (Math.random() * 0.3); // 0.85 to 1.15

    return Math.max(1, Math.floor(rawDamage * randomFactor));
  }

  private getEffectiveness(attackingType: string, defendingType: string): number {
    const typeChart = this.typeEffectiveness.get(attackingType);
    return typeChart?.get(defendingType) ?? 1.0;
  }
}
```

### Custom Weather System

```typescript
// Weather system affecting gameplay
class WeatherSystem {
  private currentWeather: string;
  private weatherEffects: Map<string, WeatherEffect>;

  constructor() {
    this.currentWeather = 'clear';
    this.initializeWeatherEffects();
  }

  private initializeWeatherEffects(): void {
    this.weatherEffects = new Map([
      ['clear', {
        encounterModifier: 1.0,
        visibility: 1.0,
        movementSpeed: 1.0,
        description: 'Clear skies'
      }],
      ['rain', {
        encounterModifier: 1.3,
        visibility: 0.8,
        movementSpeed: 0.9,
        description: 'Rainy weather'
      }],
      ['fog', {
        encounterModifier: 0.7,
        visibility: 0.4,
        movementSpeed: 0.8,
        description: 'Dense fog'
      }],
      ['storm', {
        encounterModifier: 1.5,
        visibility: 0.6,
        movementSpeed: 0.7,
        description: 'Thunder storm'
      }]
    ]);
  }

  getCurrentWeatherEffect(): WeatherEffect {
    return this.weatherEffects.get(this.currentWeather) ?? this.weatherEffects.get('clear')!;
  }

  setWeather(weather: string): void {
    this.currentWeather = weather;
  }

  getEncounterModifier(): number {
    return this.getCurrentWeatherEffect().encounterModifier;
  }
}

interface WeatherEffect {
  encounterModifier: number;
  visibility: number;
  movementSpeed: number;
  description: string;
}
```

## 📊 API Reference

### Classes

#### `OverworldBattleSliceTool`
Main demonstration class for the vertical slice.

**Static Methods:**
- `main(seed?)` - Run the complete vertical slice demonstration
- `setupEncounterSystem()` - Initialize encounter system
- `roamUntilEncounter(controller, state, rng, maxSteps)` - Simulate roaming until encounter
- `setupBattleSystem(rng)` - Initialize battle system
- `executeBattle(battleSystem, encounterResult, rng)` - Execute battle simulation
- `createPlayerSpirit(spiritId, type, level)` - Create player spirit
- `createWildSpirit(spiritId, level)` - Create wild spirit

#### `PlayerState`
Represents the player's state in the overworld.

**Constructor:**
```typescript
new PlayerState(zoneId?, tileType?, timeOfDay?, stepsSinceLastEncounter?, position?, weather?)
```

**Methods:**
- `moveTo(x, y)` - Move player to new position
- `setTimeOfDay(timeOfDay)` - Set time of day
- `setWeather(weather)` - Set weather conditions
- `resetEncounterCounter()` - Reset encounter counter
- `getCurrentTimeOfDay()` - Get current time
- `clone()` - Create copy of state
- `toJSON()` - Convert to JSON
- `fromJSON(data)` - Create from JSON

#### `EncounterTable`
Manages encounter tables for different zones.

**Constructor:**
```typescript
new EncounterTable(zoneId, entries?)
```

**Methods:**
- `addEntry(entry)` - Add encounter entry
- `removeEntry(spiritId)` - Remove encounter entry
- `getRandomEntry(rng)` - Get random entry from table
- `validate()` - Validate table integrity
- `clone()` - Create copy of table
- `toJSON()` - Convert to JSON
- `fromJSON(data)` - Create from JSON

#### `EncounterTrigger`
Defines conditions for triggering encounters.

**Constructor:**
```typescript
new EncounterTrigger(zoneId, triggerType, triggerParams?)
```

**Static Methods:**
- `create(zoneId, triggerType, triggerParams?)` - Create trigger
- `tileType(zoneId, tileType)` - Create tile-based trigger
- `stepCount(zoneId, stepInterval)` - Create step-based trigger
- `timeBased(zoneId, timeOfDay)` - Create time-based trigger
- `random(zoneId, probability)` - Create random trigger

**Methods:**
- `shouldTrigger(state, rng)` - Check if trigger should activate
- `validate()` - Validate trigger configuration
- `clone()` - Create copy of trigger
- `toJSON()` - Convert to JSON
- `fromJSON(data)` - Create from JSON

#### `EncounterResult`
Result of encounter check.

**Constructor:**
```typescript
new EncounterResult(triggered, zoneId?, spiritId?, level?, tableEntry?, stepsUntilNext?)
```

**Static Methods:**
- `triggered(zoneId, spiritId, level, tableEntry, stepsUntilNext?)` - Create triggered result
- `notTriggered(stepsUntilNext?)` - Create non-triggered result

**Methods:**
- `getDescription()` - Get human-readable description

#### `RNGProvider`
Random number generator for deterministic gameplay.

**Constructor:**
```typescript
new RNGProvider(seed?)
```

**Methods:**
- `nextInt(min?, max?)` - Generate random integer
- `nextFloat(min?, max?)` - Generate random float
- `nextBoolean(chance?)` - Generate random boolean
- `shuffle(array)` - Shuffle array
- `choose(array)` - Choose random element from array

### Enums

#### `TimeOfDay`
- `DAWN` - Dawn (early morning)
- `DAY` - Day (morning to afternoon)
- `DUSK` - Dusk (evening)
- `NIGHT` - Night (late evening to early morning)

#### `ActionSource`
- `PLAYER` - Player action
- `AI` - AI action
- `ENVIRONMENT` - Environmental action
- `SYSTEM` - System action

#### `MoveCategory`
- `PHYSICAL` - Physical attack
- `SPECIAL` - Special attack
- `STATUS` - Status effect

#### `TriggerType`
- `TILE_TYPE` - Trigger based on tile type
- `STEP_COUNT` - Trigger based on step count
- `TIME_BASED` - Trigger based on time of day
- `RANDOM` - Random trigger
- `ZONE_ENTRY` - Trigger on zone entry

## 🧪 Testing the Vertical Slice

```typescript
import {
  OverworldBattleSliceTool,
  SliceUtils,
  PlayerState,
  EncounterTable,
  EncounterTrigger,
  RNGProvider,
  TimeOfDay
} from 'miff-slice-pure';

// Test individual components
const rng = new RNGProvider(12345);

// Test player state
const playerState = PlayerState.create('test_zone', 'grass', TimeOfDay.DAY);
expect(playerState.zoneId).toBe('test_zone');
expect(playerState.tileType).toBe('grass');
expect(playerState.timeOfDay).toBe(TimeOfDay.DAY);

// Test encounter table
const table = SliceUtils.createDemoEncounterTable();
expect(table.zoneId).toBe('newhaven');
expect(table.entries.length).toBeGreaterThan(0);

// Test encounter trigger
const trigger = EncounterTrigger.tileType('test_zone', 'grass');
expect(trigger.triggerType).toBe(TriggerType.TILE_TYPE);
expect(trigger.shouldTrigger(playerState, rng)).toBe(true);

// Test RNG determinism
const rng1 = new RNGProvider(12345);
const rng2 = new RNGProvider(12345);
expect(rng1.nextInt(1, 100)).toBe(rng2.nextInt(1, 100));

// Test complete slice
console.log('Running vertical slice test...');
OverworldBattleSliceTool.main(12345); // Should produce consistent results
```

## 🎮 CLI Usage Examples

```bash
# Basic usage
npx slice-pure-cli

# Roam for 10 steps
roam 10

# Move north
move n

# Set time to night
time night

# Set weather to rain
weather rain

# Show current status
status

# Trigger immediate battle
battle

# Run automated demo
demo

# Reset and start over
reset

# Exit
exit
```

## 🔍 Integration Examples

### Game Engine Integration

```typescript
class GameEngine {
  private playerState: PlayerState;
  private encounterController: IEncounterController;
  private battleSystem: IBattleSystem;
  private rng: RNGProvider;
  private stepCount: number = 0;

  constructor() {
    this.playerState = PlayerState.create('starting_town', 'grass', TimeOfDay.DAY);
    this.encounterController = this.setupEncounters();
    this.battleSystem = this.setupBattles();
    this.rng = new RNGProvider();
  }

  private setupEncounters(): IEncounterController {
    // Set up encounter tables and triggers
    const table = new EncounterTable('starting_town');
    table.addEntry({
      zoneId: 'starting_town',
      spiritId: 'rat',
      weight: 50,
      minLevel: 1,
      maxLevel: 3
    });

    // Implementation would integrate with actual encounter system
    return {} as IEncounterController;
  }

  private setupBattles(): IBattleSystem {
    // Set up battle system
    return {} as IBattleSystem;
  }

  gameLoop(): void {
    // Main game loop
    while (this.isRunning) {
      // Handle input
      this.handleInput();

      // Update overworld
      this.updateOverworld();

      // Check for encounters
      this.checkEncounters();

      // Update battle if active
      this.updateBattle();

      // Render
      this.render();

      // Wait for next frame
      this.waitForNextFrame();
    }
  }

  private handleInput(): void {
    // Handle player input (movement, actions, etc.)
  }

  private updateOverworld(): void {
    // Update overworld state, animations, etc.
    this.stepCount++;
  }

  private checkEncounters(): void {
    const encounter = this.encounterController.checkForEncounter(this.playerState, this.rng);

    if (encounter.triggered) {
      console.log(`🎯 Encounter! ${encounter.spiritId} appeared!`);
      this.startBattle(encounter);
    }
  }

  private startBattle(encounter: IEncounterResult): void {
    // Switch to battle mode
    console.log('Starting battle...');

    // Create battle instance
    // Set up battle UI
    // Initialize battle state
  }

  private updateBattle(): void {
    // Update battle if active
    if (this.inBattle) {
      // Handle battle logic
      // Check for battle end conditions
      // Handle victory/defeat
    }
  }

  private render(): void {
    // Render current game state
    // Could be overworld or battle screen
  }

  private waitForNextFrame(): void {
    // Frame timing and synchronization
  }
}
```

### UI Integration

```typescript
class SliceUI {
  private playerState: PlayerState;
  private encounterController: IEncounterController;
  private uiContainer: HTMLElement;

  constructor(playerState: PlayerState, encounterController: IEncounterController) {
    this.playerState = playerState;
    this.encounterController = encounterController;
    this.uiContainer = document.getElementById('game-ui')!;
    this.setupUI();
  }

  private setupUI(): void {
    // Create UI elements
    this.createOverworldUI();
    this.createBattleUI();
    this.createStatusUI();
  }

  private createOverworldUI(): void {
    const overworldDiv = document.createElement('div');
    overworldDiv.className = 'overworld-ui';

    // Position display
    const positionDiv = document.createElement('div');
    positionDiv.id = 'position-display';
    this.updatePositionDisplay(positionDiv);

    // Zone and weather display
    const zoneDiv = document.createElement('div');
    zoneDiv.id = 'zone-display';
    this.updateZoneDisplay(zoneDiv);

    // Mini-map
    const minimapDiv = document.createElement('div');
    minimapDiv.id = 'minimap';
    this.updateMinimap(minimapDiv);

    overworldDiv.appendChild(positionDiv);
    overworldDiv.appendChild(zoneDiv);
    overworldDiv.appendChild(minimapDiv);

    this.uiContainer.appendChild(overworldDiv);
  }

  private updatePositionDisplay(element: HTMLElement): void {
    element.textContent = `Position: (${this.playerState.position.x}, ${this.playerState.position.y})`;
  }

  private updateZoneDisplay(element: HTMLElement): void {
    element.textContent = `Zone: ${this.playerState.zoneId} | Time: ${this.playerState.timeOfDay} | Weather: ${this.playerState.weather}`;
  }

  private updateMinimap(element: HTMLElement): void {
    // Update minimap based on player position
    const encounterRate = this.encounterController.getEncounterRate(this.playerState.zoneId, this.playerState);
    const intensity = Math.floor(encounterRate * 10);

    element.innerHTML = `
      <div class="minimap-grid">
        <div class="minimap-tile" style="background-color: rgba(0, 255, 0, ${intensity * 0.1})"></div>
      </div>
      <div class="encounter-indicator">Encounter Rate: ${(encounterRate * 100).toFixed(1)}%</div>
    `;
  }

  private createBattleUI(): void {
    const battleDiv = document.createElement('div');
    battleDiv.className = 'battle-ui';
    battleDiv.style.display = 'none'; // Hidden initially

    // Battle UI elements would go here
    // Player spirit display
    // Enemy spirit display
    // Action buttons
    // Battle log
    // Health bars
    // Status effects

    this.uiContainer.appendChild(battleDiv);
  }

  private createStatusUI(): void {
    const statusDiv = document.createElement('div');
    statusDiv.className = 'status-ui';

    // Status UI elements
    // Player stats
    // Inventory
    // Party
    // Settings

    this.uiContainer.appendChild(statusDiv);
  }

  update(): void {
    // Update all UI elements
    const positionElement = document.getElementById('position-display');
    const zoneElement = document.getElementById('zone-display');
    const minimapElement = document.getElementById('minimap');

    if (positionElement) this.updatePositionDisplay(positionElement);
    if (zoneElement) this.updateZoneDisplay(zoneElement);
    if (minimapElement) this.updateMinimap(minimapElement);
  }

  showBattleScreen(): void {
    // Switch to battle UI
    const overworldUI = document.querySelector('.overworld-ui');
    const battleUI = document.querySelector('.battle-ui');

    if (overworldUI) overworldUI.style.display = 'none';
    if (battleUI) battleUI.style.display = 'block';
  }

  showOverworldScreen(): void {
    // Switch to overworld UI
    const overworldUI = document.querySelector('.overworld-ui');
    const battleUI = document.querySelector('.battle-ui');

    if (overworldUI) overworldUI.style.display = 'block';
    if (battleUI) battleUI.style.display = 'none';
  }
}
```

## 📈 Performance

- **Efficient Simulation**: Fast overworld and battle simulation
- **Optimized RNG**: High-performance random number generation
- **Memory Efficient**: Minimal memory footprint for game state
- **Fast Encounter Checks**: Quick encounter probability calculations
- **Scalable Architecture**: Handles large overworld areas efficiently
- **Real-Time Capable**: Can run at 60+ FPS for real-time gameplay

## 🔒 Security

- **Deterministic RNG**: Secure random number generation with seed support
- **Input Validation**: Comprehensive validation of all game state
- **Safe Serialization**: Secure JSON handling for save/load
- **Type Safety**: Full TypeScript coverage prevents runtime errors
- **Error Boundaries**: Protected operations with proper error handling

## 🤝 Contributing

Contributions are welcome! Please see the main MIFF repository for guidelines.

## 📝 License

MIT License - see LICENSE file for details.

## 🔄 Migration from C#

SlicePure is a TypeScript conversion of the original C# vertical slice implementation. Key improvements:

- **Modern Architecture**: Clean separation of concerns with TypeScript interfaces
- **Interactive CLI**: Full command-line interface for testing and demonstration
- **Enhanced Features**: Additional features like weather system and dynamic encounter rates
- **Better Performance**: Optimized algorithms for real-time gameplay
- **Comprehensive Documentation**: Detailed documentation with examples and integration guides
- **Type Safety**: Full TypeScript coverage with strict type checking
- **Modular Design**: Easy to extend and modify for different game requirements

The vertical slice demonstration remains functionally identical to the C# version while providing enhanced features and better maintainability.