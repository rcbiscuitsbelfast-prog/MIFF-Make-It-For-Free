# AIPure

A comprehensive **AI management system** for handling battle decisions, policy-based behavior, and deterministic move selection. Supports configurable policies with aggression, caution, and efficiency weights, plus override rules for complex scenarios.

## ✨ Features

- **Policy-Based AI**: Configurable behavior weights (aggression, caution, efficiency)
- **Deterministic Decisions**: Test-friendly AI with controlled randomness
- **Type Effectiveness**: Integrated type chart system for strategic decisions
- **Override Rules**: Scriptable behavior modifications for special scenarios
- **Multiple Policy Types**: Balanced, aggressive, cautious, efficient, defensive, and adaptive
- **Battle Simulation**: Complete AI vs AI battle system with damage calculation
- **CLI Interface**: Interactive command-line testing and demonstration

## 📦 Installation

```bash
npm install miff-aipure
```

## 🚀 Quick Start

```typescript
import {
  AIManager,
  AIPolicy,
  BattleAI,
  AIUtils,
  ActionSource,
  TypeEffectiveness,
  MoveData,
  MoveCategory,
  SpiritInstance,
  DamageCalculator
} from 'miff-aipure';

// Create AI manager
const aiManager = new AIManager();

// Create balanced policy
const policy = AIPolicy.balanced('my_ai');
aiManager.registerPolicy(policy);

// Get AI instance
const ai = aiManager.getAI('my_ai');

// Create spirits and moves
const spirit = new SpiritInstance('1', 'Fire Spirit', 'fire', 15, 100, 50, 40, 60, 45, 20);
const opponent = new SpiritInstance('2', 'Water Spirit', 'water', 15, 100, 40, 45, 55, 50, 20);

const moves = [
  new MoveData('fire_blast', 'Fire Blast', MoveCategory.SPECIAL, 60, 0.9, 8, 'fire'),
  new MoveData('basic_strike', 'Basic Strike', MoveCategory.PHYSICAL, 40, 1.0, 0, 'neutral')
];

// Mock RNG provider
const mockRNG = {
  nextFloat: (min: number, max: number) => (min + max) / 2,
  nextBool: (probability: number) => Math.random() < probability
};

// Get AI decision
const action = ai.selectAction(spirit, opponent, moves, mockRNG);
console.log(`AI chooses: ${action.moveId}`); // "fire_blast" (type advantage!)
```

## 📚 Core Concepts

### AI Policies

Policies define AI behavior through three main weights:

- **Aggression**: Prioritizes damage and type advantages
- **Caution**: Prefers high-accuracy moves, avoids risks
- **Efficiency**: Minimizes resource usage and costs

### Policy Types

- **Balanced**: Equal weights (1.0, 1.0, 1.0)
- **Aggressive**: High damage focus (1.8, 0.5, 0.8)
- **Cautious**: Safety first (0.5, 1.8, 1.2)
- **Efficient**: Resource optimization (1.0, 1.0, 1.8)
- **Defensive**: Conservative play (0.3, 2.0, 1.5)
- **Adaptive**: Dynamic based on spirit stats

### Override Rules

Scriptable modifications for special scenarios:

```
force_move_if_hp_below:heal:0.3
prefer_move_if_type_advantage:fire_blast
avoid_move_if_low_accuracy:5
```

## 🔧 Basic Usage

### Creating Policies

```typescript
// Create custom policy
const customPolicy = new AIPolicy(
  'boss_fighter',
  1.5,  // High aggression
  1.2,  // Moderate caution
  0.8   // Lower efficiency
);

// Add override rules
customPolicy.addOverrideRule('force_move_if_hp_below', 'heal:0.3');
customPolicy.addOverrideRule('prefer_move_if_type_advantage', 'fire_blast');

// Register policy
aiManager.registerPolicy(customPolicy);
```

### Using AI Manager

```typescript
// Create manager with type effectiveness
const typeChart = new TypeEffectiveness();
const aiManager = new AIManager(typeChart);

// Register multiple policies
aiManager.createStandardPolicies(); // Adds balanced, aggressive, cautious, etc.

// Get AI for specific policy
const aggressiveAI = aiManager.getAI('aggressive');
const cautiousAI = aiManager.getAI('cautious');

// Get policy by ID
const policy = aiManager.getPolicy('aggressive');
```

### Making Decisions

```typescript
// Set up battle scenario
const ai = aiManager.getAI('balanced');
const availableMoves = [
  new MoveData('fire_blast', 'Fire Blast', MoveCategory.SPECIAL, 60, 0.9, 8, 'fire'),
  new MoveData('water_burst', 'Water Burst', MoveCategory.SPECIAL, 55, 0.95, 6, 'water'),
  new MoveData('basic_strike', 'Basic Strike', MoveCategory.PHYSICAL, 40, 1.0, 0, 'neutral')
];

// Mock RNG provider (deterministic for testing)
const mockRNG = {
  nextFloat: (min: number, max: number) => (min + max) / 2,
  nextBool: (probability: number) => Math.random() < probability
};

// Get AI decision
const action = ai.selectAction(fireSpirit, waterSpirit, availableMoves, mockRNG);
// AI will choose fire_blast due to type advantage (fire > water)
```

## ⚡ Advanced Usage

### Adaptive Policies

```typescript
// Create policy that adapts to spirit stats
const adaptivePolicy = AIUtils.createAdaptivePolicy(spirit);

// High HP + high attack = aggressive
// Low HP = cautious
// High defense = defensive
// Balanced = efficient

aiManager.registerPolicy(adaptivePolicy);
```

### Scenario-Based Policies

```typescript
// Different policies for different scenarios
const earlyGamePolicy = AIUtils.createScenarioPolicy('early_game');     // Aggressive start
const midGamePolicy = AIUtils.createScenarioPolicy('mid_game');         // Balanced
const lateGamePolicy = AIUtils.createScenarioPolicy('late_game');       // Efficient
const bossPolicy = AIUtils.createScenarioPolicy('boss');                // Cautious
const pvpPolicy = AIUtils.createScenarioPolicy('pvp');                  // Aggressive

// Boss-specific policy based on level difference
const bossPolicy = AIUtils.createBossPolicy(bossLevel, playerLevel);
```

### Custom Decision Logic

```typescript
// Create custom AI with specialized logic
class CustomBattleAI extends BattleAI {
  selectAction(self: ISpiritInstance, opponent: ISpiritInstance, availableMoves: IMoveData[], rng: IRNGProvider): IBattleAction {
    // Check for special conditions
    if (self.currentHP < self.maxHP * 0.3) {
      // Low HP: prioritize healing moves
      const healingMoves = availableMoves.filter(m =>
        m.category === MoveCategory.STATUS && m.power === 0
      );

      if (healingMoves.length > 0) {
        const healMove = healingMoves[0];
        return this.createAction(self, opponent, healMove, rng);
      }
    }

    // Use parent logic for normal cases
    return super.selectAction(self, opponent, availableMoves, rng);
  }
}
```

### Battle Simulation

```typescript
// Simulate AI vs AI battle
function simulateBattle(ai1: IBattleAI, ai2: IBattleAI, spirit1: ISpiritInstance, spirit2: ISpiritInstance, moves: IMoveData[]) {
  let turn = 1;
  const maxTurns = 50;

  while (spirit1.currentHP > 0 && spirit2.currentHP > 0 && turn <= maxTurns) {
    console.log(`Turn ${turn}: ${spirit1.name} (${spirit1.currentHP}) vs ${spirit2.name} (${spirit2.currentHP})`);

    // Spirit 1 attacks
    const action1 = ai1.selectAction(spirit1, spirit2, moves, mockRNG);
    const move1 = moves.find(m => m.moveId === action1.moveId);
    if (move1) {
      const damage = damageCalculator.calculateDamage(spirit1, spirit2, move1, mockRNG);
      spirit2.takeDamage(damage);
      console.log(`${spirit1.name} uses ${move1.name} for ${damage} damage!`);
    }

    if (spirit2.currentHP <= 0) {
      console.log(`${spirit1.name} wins!`);
      break;
    }

    // Spirit 2 attacks
    const action2 = ai2.selectAction(spirit2, spirit1, moves, mockRNG);
    const move2 = moves.find(m => m.moveId === action2.moveId);
    if (move2) {
      const damage = damageCalculator.calculateDamage(spirit2, spirit1, move2, mockRNG);
      spirit1.takeDamage(damage);
      console.log(`${spirit2.name} uses ${move2.name} for ${damage} damage!`);
    }

    if (spirit1.currentHP <= 0) {
      console.log(`${spirit2.name} wins!`);
      break;
    }

    turn++;
  }

  if (turn > maxTurns) {
    console.log('Battle ended in a draw!');
  }
}
```

## 🛠️ CLI Usage

Run the interactive CLI for testing and demonstration:

```bash
# Run CLI
npx miff-aipure-cli

# Or run directly with tsx
npx tsx miff/pure/AIPure/cliHarness.ts
```

### CLI Commands

- `policies` - Show all AI policies
- `spirits` - Show all available spirits
- `moves` - Show all available moves
- `battle [spirit1] [spirit2] [policy]` - Simulate battle between spirits
- `decide [spirit] [opponent] [policy]` - Show AI decision making process
- `policy [id]` - Show detailed policy information
- `compare [policy1] [policy2]` - Compare two policies
- `damage [attacker] [defender] [move]` - Calculate damage from specific move
- `heal [spirit] [amount]` - Heal spirit
- `hurt [spirit] [amount]` - Damage spirit
- `status` - Show system statistics
- `help` - Show help information

## 📊 API Reference

### Classes

#### `AIPolicy`
Defines AI behavior weights and override rules.

**Properties:**
- `policyId: string` - Unique policy identifier
- `aggression: number` - Damage and advantage priority (0-2)
- `caution: number` - Safety and accuracy priority (0-2)
- `efficiency: number` - Resource optimization priority (0-2)
- `overrideRules: string[]` - Scriptable behavior modifications

**Methods:**
- `clone()` - Create copy of policy
- `validate()` - Validate configuration
- `getSummary()` - Get policy description
- `addOverrideRule(ruleKey, value)` - Add behavior override
- `removeOverrideRule(ruleKey)` - Remove override rule
- `hasOverrideRule(ruleKey)` - Check for override
- `getOverrideRule(ruleKey)` - Get override value

#### `AIManager`
Manages AI policies and creates BattleAI instances.

**Methods:**
- `registerPolicy(policy)` - Register new policy
- `getAI(spiritIdOrPolicyId)` - Get AI instance
- `getPolicy(policyId)` - Retrieve policy by ID
- `getAllPolicies()` - Get all registered policies
- `removePolicy(policyId)` - Remove policy
- `updatePolicy(policyId, updates)` - Update existing policy
- `createStandardPolicies()` - Register default policy set

#### `BattleAI`
Core AI decision-making engine.

**Methods:**
- `selectAction(self, opponent, moves, rng)` - Choose best move
- `getPolicy()` - Get current policy
- `setPolicy(policy)` - Change AI policy
- `getPolicySummary()` - Get policy description

### Utility Functions

#### `AIUtils.createStandardPolicies()`
Creates set of common AI policies.

#### `AIUtils.createAdaptivePolicy(spirit)`
Creates policy based on spirit statistics.

#### `AIUtils.createBossPolicy(bossLevel, playerLevel)`
Creates appropriate policy for boss battles.

#### `AIUtils.createScenarioPolicy(scenario)`
Creates policy for specific game scenarios.

#### `AIUtils.comparePolicies(policy1, policy2)`
Compares two policies and returns differences.

#### `AIUtils.getBehaviorDescription(policy)`
Returns human-readable description of AI behavior.

#### `AIUtils.validateAIManager(manager)`
Validates AI manager configuration.

## ⚙️ Configuration

### Policy Configuration

```typescript
// Custom policy with specific weights
const customPolicy = new AIPolicy(
  'custom_ai',
  1.5,  // High aggression
  1.2,  // Moderate caution
  0.8   // Low efficiency
);

// Add override rules
customPolicy.addOverrideRule('force_move_if_hp_below', 'heal:0.3');
customPolicy.addOverrideRule('prefer_move_if_type_advantage', 'fire_blast');
```

### Manager Configuration

```typescript
// Create manager with custom type effectiveness
const customTypes = new TypeEffectiveness();
customTypes.setMultiplier('fire', 'water', 2.0);
customTypes.setMultiplier('water', 'fire', 0.5);

const aiManager = new AIManager(customTypes);
```

### Decision Parameters

```typescript
// AI considers multiple factors:
// - Type effectiveness (from TypeEffectiveness system)
// - Move power and accuracy
// - Resource costs
// - HP ratios and thresholds
// - Sync level differences
// - Override rules
// - Policy weights (aggression, caution, efficiency)
```

## 🧪 Testing

```typescript
import { AIManager, AIPolicy, AIUtils } from 'miff-aipure';

// Create test scenario
const aiManager = new AIManager();
const policy = AIPolicy.balanced('test_policy');
aiManager.registerPolicy(policy);

const ai = aiManager.getAI('test_policy');

// Mock RNG for deterministic testing
const mockRNG = {
  nextFloat: (min: number, max: number) => 0.95, // Consistent variance
  nextBool: (probability: number) => false      // No critical hits
};

// Test decision making
const action = ai.selectAction(spirit, opponent, moves, mockRNG);
console.log(`AI chose: ${action.moveId}`);

// Test policy comparison
const aggressive = AIPolicy.aggressive('aggressive_test');
const cautious = AIPolicy.cautious('cautious_test');

const comparison = AIUtils.comparePolicies(aggressive, cautious);
console.log(`Total difference: ${comparison.totalDifference}`);
```

## 🔍 Integration Examples

### Battle System Integration

```typescript
// In battle system
class BattleSystem {
  private aiManager: AIManager;

  constructor() {
    this.aiManager = new AIManager();
    this.aiManager.createStandardPolicies();
  }

  executeTurn(spirit: ISpiritInstance, opponent: ISpiritInstance, availableMoves: IMoveData[]) {
    const ai = this.aiManager.getAI(spirit.id); // Uses adaptive policy
    const action = ai.selectAction(spirit, opponent, availableMoves, rngProvider);

    // Execute the chosen action
    this.processAction(action);
  }
}
```

### Strategy Game Integration

```typescript
// In strategy game
class StrategyGame {
  private aiManager: AIManager;

  constructor() {
    this.aiManager = new AIManager();

    // Different policies for different game phases
    this.aiManager.registerPolicy(AIUtils.createScenarioPolicy('early_game'));
    this.aiManager.registerPolicy(AIUtils.createScenarioPolicy('mid_game'));
    this.aiManager.registerPolicy(AIUtils.createScenarioPolicy('late_game'));
  }

  getAIMove(gameState: GameState, playerId: string): Action {
    const policy = this.getCurrentPhasePolicy(gameState);
    const ai = this.aiManager.getAI(policy.policyId);
    return ai.selectAction(gameState.currentSpirit, gameState.opponent, gameState.availableMoves, rng);
  }
}
```

### Tournament System Integration

```typescript
// In tournament system
class Tournament {
  private aiManager: AIManager;

  constructor() {
    this.aiManager = new AIManager();
  }

  runTournament(participants: SpiritInstance[]) {
    // Create adaptive policies for each participant
    participants.forEach(spirit => {
      const adaptivePolicy = AIUtils.createAdaptivePolicy(spirit);
      this.aiManager.registerPolicy(adaptivePolicy);
    });

    // Run matches
    for (let i = 0; i < participants.length; i += 2) {
      const spirit1 = participants[i];
      const spirit2 = participants[i + 1];

      const ai1 = this.aiManager.getAI(spirit1.id);
      const ai2 = this.aiManager.getAI(spirit2.id);

      this.runMatch(spirit1, spirit2, ai1, ai2);
    }
  }
}
```

## 📈 Performance

- **Fast Decisions**: O(n) move evaluation with early termination
- **Memory Efficient**: Minimal memory footprint per AI instance
- **Deterministic**: Consistent results with same inputs and RNG state
- **Scalable**: Handles multiple AI instances simultaneously

## 🔒 Security

- **Input Validation**: All inputs validated before processing
- **Safe Execution**: Protected against malicious policy configurations
- **Error Isolation**: AI failures don't crash the battle system
- **Type Safety**: Full TypeScript coverage prevents runtime errors

## 🤝 Contributing

Contributions are welcome! Please see the main MIFF repository for guidelines.

## 📝 License

MIT License - see LICENSE file for details.

## 🔄 Migration from C#

AIPure is a TypeScript conversion of the original C# implementation. Key differences:

- **Type Safety**: Enhanced with TypeScript interfaces and validation
- **Modularity**: Improved separation of concerns with utility functions
- **CLI Tools**: Added interactive testing interface
- **Documentation**: Comprehensive examples and API documentation
- **Policy System**: Enhanced override rules and adaptive policies

The core AI decision-making logic remains identical to ensure compatibility with existing C# implementations.