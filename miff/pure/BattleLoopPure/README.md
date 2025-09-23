# BattleLoopPure

A comprehensive **battle loop management system** for orchestrating turn-based battles, phase progression, action ordering, and battle completion. Supports deterministic execution with configurable RNG providers and event integration.

## ✨ Features

- **Phase Management**: Structured battle phases (PreTurn → SelectAction → ResolveAction → EndTurn)
- **Deterministic Execution**: Reproducible battle outcomes with seed-based RNG
- **Action Ordering**: Priority-based action queue with tie-breaking
- **Battle State Tracking**: Complete battle state management and history
- **Event Integration**: Event bus support for logging and external systems
- **Configurable End Conditions**: Custom battle completion criteria
- **CLI Interface**: Interactive command-line testing and battle simulation

## 📦 Installation

```bash
npm install miff-battlelooppure
```

## 🚀 Quick Start

```typescript
import {
  BattleLoopController,
  BattlePhaseManager,
  ActionQueue,
  BattleEndManager,
  BattleAction,
  BattleResult,
  BattlePhase,
  ActionSource,
  BattleLoopUtils
} from 'miff-battlelooppure';

// Create battle system
const rng = BattleLoopUtils.createDefaultRNG();
const logger = BattleLoopUtils.createDefaultLogger();
const eventBus = BattleLoopUtils.createDefaultEventBus();

const battleController = new BattleLoopController(rng, logger, eventBus);

// Define action selector (player/AI logic)
const actionSelector = (actorId: number, availableMoves: string[]) => {
  // Your action selection logic here
  return BattleAction.create(
    actorId,
    2, // target
    'attack',
    0,
    50,
    ActionSource.PLAYER
  );
};

// Execute battle turn
const availableActors = [1, 2];
const availableMoves = {
  1: ['attack', 'defend', 'heal'],
  2: ['attack', 'defend', 'special']
};

const battleState = battleController.executeTurn(
  12345, // seed for deterministic execution
  actionSelector,
  availableActors,
  availableMoves
);

console.log(`Battle phase: ${battleState.currentPhase}`);
console.log(`Turn: ${battleState.turnNumber}`);
console.log(`Actions processed: ${battleState.processedActions.length}`);
```

## 📚 Core Concepts

### Battle Phases

The battle system progresses through structured phases:

- **PRE_TURN**: Preparation phase before turn starts
- **SELECT_ACTION**: Action selection phase (AI/player decisions)
- **RESOLVE_ACTION**: Action execution and effect resolution
- **END_TURN**: Turn cleanup and state updates

### Action Ordering

Actions are ordered deterministically based on:

- **Priority**: Higher priority actions execute first (0-10 range)
- **Speed**: Higher speed breaks priority ties
- **Tie-breaker**: Random seed-based tie-breaking for identical actions
- **Timestamp**: Earlier actions have priority for identical scores

### Battle State

Complete battle state tracking includes:

- Current turn number and phase
- Action queues (pending, processing, completed)
- Battle result and completion status
- Timing information and metadata

## 🔧 Basic Usage

### Creating Battle System

```typescript
// Create battle controller with dependencies
const rng = BattleLoopUtils.createDefaultRNG();
const logger = BattleLoopUtils.createDefaultLogger();
const eventBus = BattleLoopUtils.createDefaultEventBus();

const battleController = new BattleLoopController(rng, logger, eventBus);

// Or use the standard controller
const standardController = BattleLoopUtils.createStandardController();
```

### Managing Battle Phases

```typescript
const phaseManager = new BattlePhaseManager();

// Get current phase
const currentPhase = phaseManager.getCurrentPhase();
console.log(`Current phase: ${currentPhase}`);

// Advance to next phase
const nextPhase = phaseManager.advancePhase();
console.log(`Advanced to: ${nextPhase}`);

// Listen to phase changes
phaseManager.onPhaseChanged = (from, to) => {
  console.log(`Phase changed from ${from} to ${to}`);
};

phaseManager.onPhaseEntered = (phase) => {
  console.log(`Entered phase: ${phase}`);
  console.log(`Description: ${BattlePhaseManager.getPhaseDescription(phase)}`);
};
```

### Working with Actions

```typescript
// Create player action
const playerAction = BattleAction.player(
  1, // actor ID
  2, // target ID
  'fire_blast',
  5, // priority
  75, // speed
  'Using type advantage'
);

// Create AI action
const aiAction = BattleAction.ai(
  2,
  1,
  'water_splash',
  3,
  60,
  'Counter-attacking'
);

// Validate action
const errors = playerAction.validate();
if (errors.length > 0) {
  console.log('Action validation errors:', errors);
}

// Compare actions for ordering
const comparison = BattleAction.compareActions(playerAction, aiAction);
console.log(`Action comparison result: ${comparison}`); // Negative = player first
```

### Action Queue Management

```typescript
const actionQueue = new ActionQueue(rng);

// Add actions to queue
actionQueue.enqueue(playerAction);
actionQueue.enqueue(aiAction);

// Process actions in order
while (!actionQueue.isEmpty()) {
  const nextAction = actionQueue.dequeue();
  if (nextAction) {
    console.log(`Processing: ${nextAction.getSummary()}`);
    // Process the action
  }
}

// Get queue information
console.log(`Queue length: ${actionQueue.getLength()}`);
console.log(`All actions: ${actionQueue.getAllActions().length}`);

// Get actions by criteria
const playerActions = actionQueue.getActionsBySource(ActionSource.PLAYER);
const actorActions = actionQueue.getActionsByActor(1);
```

### Battle End Conditions

```typescript
const endManager = new BattleEndManager();

// Register custom end condition
endManager.registerEndCondition(BattleResult.PLAYER_WIN, (state) => {
  const playerActions = state.actionsThisTurn.filter(a => a.source === ActionSource.PLAYER);
  const opponentActions = state.actionsThisTurn.filter(a => a.source === ActionSource.AI);

  if (playerActions.length > 0 && opponentActions.length === 0) {
    return BattleResult.PLAYER_WIN;
  }

  return BattleResult.ONGOING;
});

// Check battle end
const currentState = battleController.getBattleState();
const result = endManager.checkBattleEnd(currentState);

if (result !== BattleResult.ONGOING) {
  console.log(`Battle ended: ${endManager.getBattleEndReason(result)}`);
  battleController.forceEndBattle(result);
}
```

## ⚡ Advanced Usage

### Custom RNG Provider

```typescript
class CustomRNGProvider {
  private seed: number = 0;

  setSeed(seed: number): void {
    this.seed = seed;
  }

  nextInt(min: number = 0, max: number = 100): number {
    // Custom random number generation
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return Math.floor((this.seed / 233280) * (max - min)) + min;
  }

  nextFloat(min: number = 0, max: number = 1): number {
    // Custom float generation
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return ((this.seed / 233280) * (max - min)) + min;
  }

  shuffle<T>(array: T[]): T[] {
    // Custom shuffle implementation
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// Use custom RNG
const customRNG = new CustomRNGProvider();
const customController = new BattleLoopController(customRNG);
```

### Event Integration

```typescript
// Create event bus
const eventBus = BattleLoopUtils.createDefaultEventBus();

// Subscribe to battle events
const unsubscribe = eventBus.subscribe('battle/phase', (phase: BattlePhase) => {
  console.log(`Battle phase changed to: ${phase}`);
});

eventBus.subscribe('battle/phase_entered', (phase: BattlePhase) => {
  console.log(`Entered battle phase: ${phase}`);
});

// Create controller with event bus
const controller = new BattleLoopController(rng, logger, eventBus);

// Cleanup
// unsubscribe();
```

### Custom Battle Logic

```typescript
class CustomBattleController extends BattleLoopController {
  private customRules: Map<string, any> = new Map();

  constructor(rng: IRNGProvider, logger?: ILogger, eventBus?: IEventBus) {
    super(rng, logger, eventBus);
  }

  // Override turn execution with custom logic
  executeTurn(
    seed: number,
    actionSelector: ActionSelector,
    availableActors: number[],
    availableMoves: Record<number, string[]>
  ): IBattleState {
    // Apply custom rules before turn
    this.applyCustomRules();

    // Execute standard turn
    const state = super.executeTurn(seed, actionSelector, availableActors, availableMoves);

    // Apply custom rules after turn
    this.applyCustomRules();

    return state;
  }

  private applyCustomRules(): void {
    // Custom battle logic here
    // e.g., special effects, modified action ordering, etc.
  }

  setCustomRule(key: string, value: any): void {
    this.customRules.set(key, value);
  }

  getCustomRule(key: string): any {
    return this.customRules.get(key);
  }
}
```

### Battle State Validation

```typescript
// Validate battle state
const state = battleController.getBattleState();
const errors = BattleLoopUtils.validateBattleState(state);

if (errors.length > 0) {
  console.log('Battle state validation errors:');
  errors.forEach(error => console.log(`  ❌ ${error}`));
} else {
  console.log('✅ Battle state is valid');
}

// Compare battle states
const state1 = battleController.getBattleState();
const state2 = previousController.getBattleState();

const areEqual = BattleLoopUtils.compareBattleStates(state1, state2);
console.log(`States are equal: ${areEqual}`);
```

## 🛠️ CLI Usage

Run the interactive CLI for testing and battle simulation:

```bash
# Run CLI
npx miff-battlelooppure-cli

# Or run directly with tsx
npx tsx miff/pure/BattleLoopPure/cliHarness.ts
```

### CLI Commands

- `battle [turns]` - Run battle simulation with specified number of turns
- `phase` - Show current battle phase and phase history
- `state` - Show current battle state including actions and results
- `history` - Show complete battle history across all turns
- `stats` - Show battle statistics including action counts and timing
- `actors` - Show all available actors and their moves
- `moves` - Show all available moves by actor
- `addactor [id]` - Add new actor to the battle
- `addmove [actor] [move]` - Add new move to existing actor
- `clear` - Clear current battle state and reset
- `demo` - Run demonstration battle with sample data
- `help` - Show help information

## 📊 API Reference

### Classes

#### `BattleLoopController`
Main orchestrator for battle loops and turn execution.

**Methods:**
- `getBattleState()` - Get current battle state
- `getCurrentPhase()` - Get current battle phase
- `advancePhase()` - Advance to next phase
- `executeTurn(seed, actionSelector, actors, moves)` - Execute complete turn
- `reset()` - Reset battle state
- `setEndCondition(result, checker)` - Set custom end condition
- `forceEndBattle(result)` - Force battle end
- `getBattleStatistics()` - Get battle performance statistics

#### `BattlePhaseManager`
Manages battle phase transitions and events.

**Properties:**
- `onPhaseChanged` - Event fired when phase changes
- `onPhaseEntered` - Event fired when entering phase

**Methods:**
- `getCurrentPhase()` - Get current phase
- `advancePhase()` - Advance to next phase
- `getPhaseHistory()` - Get phase transition history
- `reset()` - Reset to initial phase
- `forceSetPhase(phase)` - Force set specific phase

#### `BattleAction`
Immutable battle action with ordering and validation.

**Static Methods:**
- `create(actorId, targetId, moveId, priority?, speed?, source?, debugNotes?, metadata?)`
- `player(actorId, targetId, moveId, priority?, speed?, debugNotes?, metadata?)`
- `ai(actorId, targetId, moveId, priority?, speed?, debugNotes?, metadata?)`
- `fromJSON(data)` - Create from JSON data

**Methods:**
- `getSummary()` - Get action description
- `clone()` - Create copy of action
- `validate()` - Validate action parameters
- `toJSON()` - Convert to JSON

#### `ActionQueue`
Priority queue for deterministic action ordering.

**Methods:**
- `enqueue(action)` - Add action to queue
- `dequeue()` - Remove and return next action
- `peek()` - Get next action without removing
- `getAllActions()` - Get all actions
- `getActionsByActor(actorId)` - Get actions for specific actor
- `getActionsBySource(source)` - Get actions by source type
- `removeActionsByActor(actorId)` - Remove actions by actor
- `clear()` - Clear all actions
- `validateActions()` - Validate all queued actions

#### `BattleEndManager`
Manages battle completion conditions and results.

**Methods:**
- `registerEndCondition(result, checker)` - Register end condition
- `removeEndCondition(result)` - Remove end condition
- `checkBattleEnd(state)` - Check if battle should end
- `getBattleEndReason(result)` - Get reason for battle end
- `forceEndBattle(result)` - Force battle end
- `reset()` - Reset end manager state

### Enums

#### `BattlePhase`
- `PRE_TURN` - Pre-turn preparation
- `SELECT_ACTION` - Action selection phase
- `RESOLVE_ACTION` - Action resolution phase
- `END_TURN` - Turn cleanup phase

#### `ActionSource`
- `UNKNOWN` - Unknown action source
- `PLAYER` - Player-controlled action
- `AI` - AI-controlled action

#### `BattleResult`
- `ONGOING` - Battle is continuing
- `PLAYER_WIN` - Player team wins
- `OPPONENT_WIN` - Opponent team wins
- `DRAW` - Battle ends in draw

### Utility Functions

#### `BattleLoopUtils.createDefaultRNG()`
Creates default RNG provider.

#### `BattleLoopUtils.createDefaultEventBus()`
Creates default event bus.

#### `BattleLoopUtils.createDefaultLogger()`
Creates default console logger.

#### `BattleLoopUtils.createStandardController()`
Creates standard battle loop controller.

#### `BattleLoopUtils.validateBattleState(state)`
Validates battle state consistency.

#### `BattleLoopUtils.compareBattleStates(state1, state2)`
Compares two battle states for equality.

#### `BattleLoopUtils.calculateActionPriority(baseSpeed, modifiers?)`
Calculates action priority from speed and modifiers.

#### `BattleLoopUtils.getBattleResultDescription(result)`
Gets human-readable battle result description.

#### `BattleLoopUtils.getExpectedPhaseSequence(turnNumber)`
Gets expected phase sequence for validation.

## ⚙️ Configuration

### Battle Controller Configuration

```typescript
// Custom configuration
const customRNG = new CustomRNGProvider();
const customLogger = new CustomLogger();
const customEventBus = new CustomEventBus();

const controller = new BattleLoopController(customRNG, customLogger, customEventBus);

// Set custom end conditions
controller.setEndCondition(BattleResult.PLAYER_WIN, (state) => {
  // Custom win condition
  return BattleResult.PLAYER_WIN;
});
```

### Action Configuration

```typescript
// Create action with custom parameters
const action = BattleAction.create(
  1, // actor ID
  2, // target ID
  'fire_blast', // move ID
  BattleLoopUtils.calculateActionPriority(75, { priority: 2 }), // priority
  75, // speed
  ActionSource.PLAYER, // source
  'Using fire type advantage', // debug notes
  { effectiveness: 2.0 } // metadata
);
```

### Phase Management Configuration

```typescript
const phaseManager = new BattlePhaseManager();

// Custom phase event handlers
phaseManager.onPhaseChanged = (from, to) => {
  console.log(`Battle phase transitioned: ${from} → ${to}`);
  // Custom logic for phase changes
};

phaseManager.onPhaseEntered = (phase) => {
  console.log(`Entered phase: ${phase}`);
  // Custom logic when entering phases
};
```

## 🧪 Testing

```typescript
import {
  BattleLoopController,
  BattleAction,
  ActionSource,
  BattleLoopUtils
} from 'miff-battlelooppure';

// Create test battle system
const rng = BattleLoopUtils.createDefaultRNG();
const controller = new BattleLoopController(rng);

// Create test actions
const action1 = BattleAction.player(1, 2, 'attack', 5, 60);
const action2 = BattleAction.ai(2, 1, 'defend', 3, 50);

// Define action selector
const actionSelector = (actorId: number, moves: string[]) => {
  return actorId === 1 ? action1 : action2;
};

// Execute test turn
const state = controller.executeTurn(
  12345,
  actionSelector,
  [1, 2],
  {
    1: ['attack', 'defend', 'heal'],
    2: ['attack', 'defend', 'special']
  }
);

// Verify results
console.log(`Turn: ${state.turnNumber}`);
console.log(`Phase: ${state.currentPhase}`);
console.log(`Actions processed: ${state.processedActions.length}`);

// Test phase management
const phaseManager = controller.getPhaseManager();
console.log(`Current phase: ${phaseManager.getCurrentPhase()}`);
console.log(`Phase history: ${phaseManager.getPhaseHistory().join(' → ')}`);
```

## 🔍 Integration Examples

### Game Engine Integration

```typescript
class GameEngine {
  private battleController: BattleLoopController;
  private gameState: GameState;

  constructor() {
    const rng = BattleLoopUtils.createDefaultRNG();
    const logger = BattleLoopUtils.createDefaultLogger();
    this.battleController = new BattleLoopController(rng, logger);
  }

  startBattle(playerId: number, opponentId: number): void {
    // Initialize battle state
    this.gameState.currentBattle = {
      playerId,
      opponentId,
      turnNumber: 1,
      phase: BattlePhase.PRE_TURN
    };

    // Start battle loop
    this.runBattleLoop();
  }

  private runBattleLoop(): void {
    const actionSelector = this.createActionSelector();
    const availableActors = this.getAvailableActors();
    const availableMoves = this.getAvailableMoves();

    // Execute turn
    const battleState = this.battleController.executeTurn(
      Date.now(), // Use current time as seed
      actionSelector,
      availableActors,
      availableMoves
    );

    // Update game state based on battle results
    this.updateGameState(battleState);

    // Check if battle should continue
    if (battleState.battleResult === BattleResult.ONGOING) {
      setTimeout(() => this.runBattleLoop(), 100); // Continue next turn
    } else {
      this.endBattle(battleState.battleResult);
    }
  }

  private createActionSelector(): ActionSelector {
    return (actorId: number, availableMoves: string[]) => {
      // AI logic or player input handling
      const moveIndex = Math.floor(Math.random() * availableMoves.length);
      return BattleAction.create(
        actorId,
        this.gameState.currentBattle!.opponentId,
        availableMoves[moveIndex]
      );
    };
  }

  private getAvailableActors(): number[] {
    return [this.gameState.currentBattle!.playerId, this.gameState.currentBattle!.opponentId];
  }

  private getAvailableMoves(): Record<number, string[]> {
    return {
      [this.gameState.currentBattle!.playerId]: ['attack', 'defend', 'heal'],
      [this.gameState.currentBattle!.opponentId]: ['attack', 'defend', 'special']
    };
  }

  private updateGameState(battleState: IBattleState): void {
    this.gameState.currentBattle!.turnNumber = battleState.turnNumber;
    this.gameState.currentBattle!.phase = battleState.currentPhase;

    // Update entity HP, status effects, etc.
    battleState.actionsThisTurn.forEach(action => {
      // Apply action effects to game entities
    });
  }

  private endBattle(result: BattleResult): void {
    console.log(`Battle ended: ${BattleLoopUtils.getBattleResultDescription(result)}`);

    // Clean up battle state
    this.gameState.currentBattle = null;

    // Trigger game over or victory screens
    if (result === BattleResult.PLAYER_WIN) {
      this.showVictoryScreen();
    } else {
      this.showGameOverScreen();
    }
  }

  private showVictoryScreen(): void {
    console.log('🎉 Victory! Player wins the battle!');
  }

  private showGameOverScreen(): void {
    console.log('💀 Game Over! Player lost the battle!');
  }
}
```

### Turn-Based Strategy Game Integration

```typescript
class TurnBasedStrategy {
  private battleController: BattleLoopController;
  private units: Map<number, GameUnit> = new Map();
  private currentPlayerTurn: number = 1;

  constructor() {
    const rng = BattleLoopUtils.createDefaultRNG();
    const logger = BattleLoopUtils.createDefaultLogger();
    this.battleController = new BattleLoopController(rng, logger);
  }

  initializeUnits(): void {
    // Create player units
    this.units.set(1, new GameUnit(1, 'Warrior', 100, 10, ['sword_attack', 'shield_defense']));
    this.units.set(2, new GameUnit(2, 'Mage', 80, 8, ['fireball', 'heal', 'teleport']));

    // Create enemy units
    this.units.set(3, new GameUnit(3, 'Goblin', 60, 12, ['club_attack', 'flee']));
    this.units.set(4, new GameUnit(4, 'Orc', 120, 6, ['axe_attack', 'rage']));
  }

  executePlayerTurn(unitId: number, targetId: number, moveId: string): void {
    if (!this.isPlayerUnit(unitId)) {
      console.log('Not a player unit!');
      return;
    }

    const unit = this.units.get(unitId);
    if (!unit) return;

    const action = BattleAction.player(
      unitId,
      targetId,
      moveId,
      BattleLoopUtils.calculateActionPriority(unit.speed, { priority: 1 }),
      unit.speed,
      `Player ${unit.name} using ${moveId}`
    );

    // Validate action
    const errors = action.validate();
    if (errors.length > 0) {
      console.log('Invalid action:', errors);
      return;
    }

    // Execute action
    this.processAction(action);
  }

  executeAITurn(): void {
    const aiUnits = Array.from(this.units.values()).filter(unit => !this.isPlayerUnit(unit.id));

    for (const unit of aiUnits) {
      const action = this.selectAIMove(unit);
      if (action) {
        this.processAction(action);
      }
    }
  }

  private selectAIMove(unit: GameUnit): BattleAction | null {
    const availableMoves = unit.availableMoves;
    if (availableMoves.length === 0) return null;

    // Simple AI: target random enemy
    const playerUnits = Array.from(this.units.values()).filter(u => this.isPlayerUnit(u.id));
    if (playerUnits.length === 0) return null;

    const target = playerUnits[Math.floor(Math.random() * playerUnits.length)];
    const move = availableMoves[Math.floor(Math.random() * availableMoves.length)];

    return BattleAction.ai(
      unit.id,
      target.id,
      move,
      BattleLoopUtils.calculateActionPriority(unit.speed),
      unit.speed,
      `AI ${unit.name} using ${move}`
    );
  }

  private processAction(action: BattleAction): void {
    console.log(`Processing action: ${action.getSummary()}`);

    const actor = this.units.get(action.actorId);
    const target = this.units.get(action.targetId);

    if (!actor || !target) {
      console.log('Invalid actor or target');
      return;
    }

    // Apply move effects
    switch (action.moveId) {
      case 'attack':
        this.applyDamage(target, 20);
        break;
      case 'heal':
        this.applyHealing(actor, 15);
        break;
      case 'defend':
        actor.defense += 5;
        break;
      // Add more move types as needed
    }

    // Check if target is defeated
    if (target.health <= 0) {
      console.log(`${target.name} is defeated!`);
      this.units.delete(target.id);
    }
  }

  private applyDamage(unit: GameUnit, damage: number): void {
    unit.health -= damage;
    console.log(`${unit.name} takes ${damage} damage (${unit.health} HP remaining)`);
  }

  private applyHealing(unit: GameUnit, healing: number): void {
    unit.health = Math.min(unit.maxHealth, unit.health + healing);
    console.log(`${unit.name} heals ${healing} HP (${unit.health} HP)`);
  }

  private isPlayerUnit(unitId: number): boolean {
    return unitId <= 2; // Player units have IDs 1-2
  }

  getBattleState(): IBattleState {
    return this.battleController.getBattleState();
  }

  getAvailableUnits(): GameUnit[] {
    return Array.from(this.units.values());
  }

  getCurrentPhase(): BattlePhase {
    return this.battleController.getCurrentPhase();
  }
}

class GameUnit {
  constructor(
    public id: number,
    public name: string,
    public health: number,
    public speed: number,
    public availableMoves: string[]
  ) {
    this.maxHealth = health;
  }

  public maxHealth: number;
}
```

## 📈 Performance

- **Deterministic Execution**: Seed-based RNG ensures reproducible battles
- **Efficient Action Ordering**: O(log n) action insertion and O(1) retrieval
- **Memory Efficient**: Configurable state history and automatic cleanup
- **Fast Phase Transitions**: Minimal overhead for phase management
- **Scalable**: Handles large numbers of actions and complex battle states

## 🔒 Security

- **Input Validation**: All actions and state changes validated before processing
- **Safe Execution**: Protected against invalid battle states and actions
- **Integrity Checking**: Battle state validation prevents corruption
- **Type Safety**: Full TypeScript coverage prevents runtime errors

## 🤝 Contributing

Contributions are welcome! Please see the main MIFF repository for guidelines.

## 📝 License

MIT License - see LICENSE file for details.

## 🔄 Migration from C#

BattleLoopPure is a TypeScript conversion of the original C# implementation. Key differences:

- **Type Safety**: Enhanced with TypeScript interfaces and validation
- **Immutability**: Battle actions and states are immutable for thread safety
- **Event System**: Improved event handling with unsubscribe support
- **CLI Tools**: Added interactive testing interface
- **Documentation**: Comprehensive examples and API documentation
- **Utility Functions**: Enhanced utility functions for common operations

The core battle loop logic and deterministic execution remain identical to ensure compatibility with existing C# implementations.