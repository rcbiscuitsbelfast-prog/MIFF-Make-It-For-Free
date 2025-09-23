# BattleAIPure

A comprehensive **battle AI management system** for handling battle-specific AI decisions, decision profiles, and move selection based on spirit stats, type matchups, and status effects. Supports configurable decision styles with weighted preferences for different move types.

## ✨ Features

- **Profile-Based AI**: Configurable behavior with aggression, caution, and efficiency weights
- **Decision Styles**: Aggressive, defensive, balanced, and trickster AI personalities
- **Threat Assessment**: Dynamic threat level evaluation based on opponent stats
- **Type Preferences**: Support for preferred spirit types with advantage bonuses
- **Move Scoring**: Sophisticated move evaluation with multiple factors
- **Battle Simulation**: Complete AI vs AI battle system with decision tracking
- **CLI Interface**: Interactive command-line testing and demonstration

## 📦 Installation

```bash
npm install miff-battleaipure
```

## 🚀 Quick Start

```typescript
import {
  AIControllerManager,
  AIDecisionProfile,
  BattleAIController,
  BattleAIUtils,
  AIDecisionStyle,
  ThreatLevel
} from 'miff-battleaipure';

// Create AI manager
const aiManager = new AIControllerManager();

// Create aggressive AI profile
const aggressiveProfile = AIDecisionProfile.aggressive('boss_fighter');
aiManager.registerProfile(aggressiveProfile);

// Get AI controller
const ai = aiManager.getAIController('boss_fighter');

// Create spirits
const fireSpirit = {
  id: 'fire_spirit',
  name: 'Fire Spirit',
  typeTag: 'fire',
  level: 15,
  maxHP: 100,
  currentHP: 100,
  attack: 60,
  defense: 35,
  specialAttack: 70,
  specialDefense: 40,
  speed: 40,
  knownMoves: ['fire_blast', 'basic_strike'],
  statusEffects: []
};

const waterSpirit = {
  id: 'water_spirit',
  name: 'Water Spirit',
  typeTag: 'water',
  level: 15,
  maxHP: 100,
  currentHP: 100,
  attack: 45,
  defense: 50,
  specialAttack: 65,
  specialDefense: 55,
  speed: 35,
  knownMoves: ['water_burst', 'basic_strike'],
  statusEffects: []
};

// Get AI decision
const selectedMove = ai.selectMove(fireSpirit, waterSpirit);
console.log(`AI chooses: ${selectedMove}`); // "fire_blast" (type advantage!)

const threatLevel = ai.evaluateThreatLevel(waterSpirit);
console.log(`Threat level: ${threatLevel}`); // 0.45 (moderate threat)
```

## 📚 Core Concepts

### AI Decision Profiles

Profiles define AI behavior through configurable weights and preferences:

- **Move Priority Weights**: Weight preferences for different move categories (damage, healing, support, status, utility)
- **Decision Style**: Overall behavior pattern (aggressive, defensive, balanced, trickster)
- **Type Preferences**: Bonus scoring for preferred spirit types
- **Threat Assessment**: Dynamic evaluation of opponent threat level

### Decision Styles

- **Aggressive**: High damage focus, takes risks for advantages
- **Defensive**: Prioritizes healing and protection
- **Balanced**: Moderate approach with balanced risk/reward
- **Trickster**: Focuses on support moves and control effects

### Threat Assessment

AI evaluates opponents based on:
- HP ratio (lower HP = less threat)
- Level difference
- Status effects
- Type advantages/disadvantages

## 🔧 Basic Usage

### Creating Profiles

```typescript
// Create custom profile
const customProfile = new AIDecisionProfile(
  'custom_ai',
  AIDecisionStyle.AGGRESSIVE,
  {
    [MoveCategory.DAMAGE]: 1.4,    // High damage priority
    [MoveCategory.HEALING]: 0.6,   // Lower healing priority
    [MoveCategory.SUPPORT]: 0.8,   // Moderate support priority
    [MoveCategory.STATUS]: 0.5,    // Lower status priority
    [MoveCategory.UTILITY]: 0.7    // Moderate utility priority
  },
  ['fire', 'electric'] // Preferred types
);

// Register profile
aiManager.registerProfile(customProfile);
```

### Using AI Manager

```typescript
// Create manager with standard profiles
const aiManager = new AIControllerManager();

// Get AI controller for specific profile
const aggressiveAI = aiManager.getAIController('aggressive');
const defensiveAI = aiManager.getAIController('defensive');
const balancedAI = aiManager.getAIController('balanced');

// Get profile by ID
const profile = aiManager.getProfile('aggressive');
```

### Making Decisions

```typescript
// Set up battle scenario
const ai = aiManager.getAIController('balanced');
const fireSpirit = {
  id: 'fire_spirit',
  name: 'Fire Spirit',
  typeTag: 'fire',
  level: 15,
  maxHP: 100,
  currentHP: 75, // Wounded
  attack: 60,
  defense: 35,
  specialAttack: 70,
  specialDefense: 40,
  speed: 40,
  knownMoves: ['fire_blast', 'basic_strike', 'heal'],
  statusEffects: ['burned']
};

const waterSpirit = {
  id: 'water_spirit',
  name: 'Water Spirit',
  typeTag: 'water',
  level: 15,
  maxHP: 100,
  currentHP: 100, // Full health
  attack: 45,
  defense: 50,
  specialAttack: 65,
  specialDefense: 55,
  speed: 35,
  knownMoves: ['water_burst', 'basic_strike', 'heal'],
  statusEffects: []
};

// Get AI decision
const selectedMove = ai.selectMove(fireSpirit, waterSpirit);
// AI will consider:
// - Fire vs Water type advantage
// - Fire Spirit's wounded status
// - Burn status effect
// - Move costs and effectiveness

const threatLevel = ai.evaluateThreatLevel(waterSpirit);
// Returns 0.45 (moderate threat due to full HP)
```

## ⚡ Advanced Usage

### Adaptive AI

```typescript
// Create AI that adapts to spirit characteristics
const adaptiveAI = BattleAIUtils.createAdaptiveProfile(spirit);

// High HP + high attack = aggressive
// Low HP = defensive
// High defense = balanced with support focus

aiManager.registerProfile(adaptiveAI);
```

### Boss Battle AI

```typescript
// Create specialized AI for boss battles
const bossAI = BattleAIUtils.createBossProfile(bossLevel, playerLevel);

if (bossLevel > playerLevel + 5) {
  // Much stronger boss: defensive
  bossAI = AIControllerManager.createBossProfile('boss_strong');
} else if (bossLevel > playerLevel) {
  // Slightly stronger boss: balanced
  bossAI = AIControllerManager.createBossProfile('boss_challenging');
} else {
  // Weaker boss: aggressive
  bossAI = AIControllerManager.createBossProfile('boss_weak');
}
```

### Custom Decision Logic

```typescript
// Create custom AI with specialized logic
class CustomBattleAI extends BattleAIController {
  selectMove(self: ISpiritInstance, opponent: ISpiritInstance): string | null {
    // Check for special conditions
    if (self.currentHP < self.maxHP * 0.25) {
      // Very low HP: always heal if possible
      const healingMoves = self.knownMoves?.filter(moveId =>
        moveId.includes('heal') || moveId.includes('recover')
      );

      if (healingMoves && healingMoves.length > 0) {
        return healingMoves[0];
      }
    }

    // Use parent logic for normal cases
    return super.selectMove(self, opponent);
  }
}
```

### Battle Simulation

```typescript
// Simulate AI vs AI battle
function simulateBattle(ai1: IBattleAIController, ai2: IBattleAIController, spirit1: ISpiritInstance, spirit2: ISpiritInstance) {
  let turn = 1;
  const maxTurns = 50;

  console.log(`${spirit1.name} vs ${spirit2.name}`);

  while (!spirit1.isFainted() && !spirit2.isFainted() && turn <= maxTurns) {
    console.log(`\nTurn ${turn}:`);

    // Spirit 1 attacks
    const move1 = ai1.selectMove(spirit1, spirit2);
    console.log(`${spirit1.name} uses ${move1}`);

    // Spirit 2 attacks
    const move2 = ai2.selectMove(spirit2, spirit1);
    console.log(`${spirit2.name} uses ${move2}`);

    // Simulate damage (simplified)
    console.log(`${spirit1.name}: ${spirit1.currentHP} HP`);
    console.log(`${spirit2.name}: ${spirit2.currentHP} HP`);

    turn++;
  }

  if (spirit1.isFainted()) {
    console.log(`${spirit2.name} wins!`);
  } else if (spirit2.isFainted()) {
    console.log(`${spirit1.name} wins!`);
  } else {
    console.log('Battle ended in a draw!');
  }
}
```

## 🛠️ CLI Usage

Run the interactive CLI for testing and demonstration:

```bash
# Run CLI
npx miff-battleaipure-cli

# Or run directly with tsx
npx tsx miff/pure/BattleAIPure/cliHarness.ts
```

### CLI Commands

- `profiles` - Show all AI profiles
- `spirits` - Show all available spirits
- `moves` - Show all available moves
- `decide [spirit] [opponent] [profile]` - Show AI decision making process
- `battle [spirit1] [spirit2] [profile]` - Simulate battle between spirits
- `threat [spirit] [opponent]` - Evaluate threat level of opponent
- `profile [id]` - Show detailed profile information
- `compare [profile1] [profile2]` - Compare two profiles
- `heal [spirit] [amount]` - Heal spirit
- `damage [spirit] [amount]` - Damage spirit
- `status [spirit]` - Show detailed spirit status
- `help` - Show help information

## 📊 API Reference

### Classes

#### `AIDecisionProfile`
Defines AI behavior weights and preferences.

**Properties:**
- `profileID: string` - Unique profile identifier
- `style: AIDecisionStyle` - Overall decision style
- `movePriorityWeights: Record<string, number>` - Category weight preferences
- `preferredTypes: string[]` - Preferred spirit types

**Methods:**
- `validate()` - Validate profile configuration
- `clone()` - Create copy of profile
- `getMoveWeight(category)` - Get weight for move category
- `setMoveWeight(category, weight)` - Set weight for move category
- `addPreferredType(type)` - Add preferred type
- `removePreferredType(type)` - Remove preferred type
- `getSummary()` - Get profile description

#### `AIControllerManager`
Manages AI profiles and creates controllers.

**Methods:**
- `registerProfile(profile)` - Register new profile
- `getAIController(profileID)` - Get AI controller
- `getProfile(profileID)` - Retrieve profile by ID
- `getAllProfiles()` - Get all registered profiles
- `removeProfile(profileID)` - Remove profile
- `updateProfile(profileID, updates)` - Update existing profile

#### `BattleAIController`
Core AI decision-making engine.

**Methods:**
- `selectMove(self, opponent)` - Choose best move
- `evaluateThreatLevel(opponent)` - Assess opponent threat
- `getDecisionProfile()` - Get current profile
- `setDecisionProfile(profile)` - Change AI profile
- `getPreferredMoveTypes()` - Get preferred move categories

### Enums

#### `AIDecisionStyle`
- `AGGRESSIVE` - Focuses on damage and advantages
- `DEFENSIVE` - Prioritizes healing and protection
- `BALANCED` - Moderate risk/reward approach
- `TRICKSTER` - Emphasizes support and control

#### `MoveCategory`
- `DAMAGE` - Direct damage moves
- `HEALING` - HP restoration moves
- `SUPPORT` - Buff and protection moves
- `STATUS` - Status effect moves
- `UTILITY` - Miscellaneous utility moves

#### `ThreatLevel`
- `LOW` - Minimal threat
- `MEDIUM` - Moderate threat
- `HIGH` - Significant threat
- `CRITICAL` - Extreme threat

### Utility Functions

#### `BattleAIUtils.createStandardProfiles()`
Creates set of common AI profiles.

#### `BattleAIUtils.createAdaptiveProfile(spirit)`
Creates profile based on spirit characteristics.

#### `BattleAIUtils.createBossProfile(bossLevel, playerLevel)`
Creates appropriate profile for boss battles.

#### `BattleAIUtils.createScenarioProfile(scenario)`
Creates profile for specific battle scenarios.

#### `BattleAIUtils.compareProfiles(profile1, profile2)`
Compares two profiles and returns differences.

#### `BattleAIUtils.getBehaviorDescription(profile)`
Returns human-readable description of AI behavior.

#### `BattleAIUtils.getThreatLevelDescription(threatLevel)`
Returns description of threat level.

## ⚙️ Configuration

### Profile Configuration

```typescript
// Custom profile with specific weights
const customProfile = new AIDecisionProfile(
  'custom_ai',
  AIDecisionStyle.AGGRESSIVE,
  {
    [MoveCategory.DAMAGE]: 1.4,    // High damage priority
    [MoveCategory.HEALING]: 0.6,   // Lower healing priority
    [MoveCategory.SUPPORT]: 0.8,   // Moderate support priority
    [MoveCategory.STATUS]: 0.5,    // Lower status priority
    [MoveCategory.UTILITY]: 0.7    // Moderate utility priority
  },
  ['fire', 'electric'] // Preferred types
);
```

### Threat Assessment Configuration

```typescript
// Threat assessment considers:
// - Opponent HP ratio (lower = less threat)
// - Level difference (higher level = more threat)
// - Status effects (more effects = more threat)
// - Type advantages (favorable types = less threat)
```

### Decision Factors

```typescript
// AI considers multiple factors:
// - Move category weights from profile
// - Type advantages/disadvantages
// - HP ratios and thresholds
// - Status effects
// - Threat level assessment
// - Preferred types bonus
// - Resource costs
```

## 🧪 Testing

```typescript
import { AIControllerManager, AIDecisionProfile, BattleAIUtils } from 'miff-battleaipure';

// Create test scenario
const aiManager = new AIControllerManager();
const profile = AIDecisionProfile.balanced('test_profile');
aiManager.registerProfile(profile);

const ai = aiManager.getAIController('test_profile');

// Create test spirits
const fireSpirit = {
  id: 'fire_spirit',
  name: 'Fire Spirit',
  typeTag: 'fire',
  level: 15,
  maxHP: 100,
  currentHP: 75,
  attack: 60,
  defense: 35,
  specialAttack: 70,
  specialDefense: 40,
  speed: 40,
  knownMoves: ['fire_blast', 'basic_strike', 'heal'],
  statusEffects: ['burned'],
  isFainted: () => false
};

const waterSpirit = {
  id: 'water_spirit',
  name: 'Water Spirit',
  typeTag: 'water',
  level: 15,
  maxHP: 100,
  currentHP: 100,
  attack: 45,
  defense: 50,
  specialAttack: 65,
  specialDefense: 55,
  speed: 35,
  knownMoves: ['water_burst', 'basic_strike', 'heal'],
  statusEffects: [],
  isFainted: () => false
};

// Test decision making
const selectedMove = ai.selectMove(fireSpirit, waterSpirit);
console.log(`AI chose: ${selectedMove}`); // "fire_blast" (type advantage)

// Test threat assessment
const threatLevel = ai.evaluateThreatLevel(waterSpirit);
console.log(`Threat level: ${threatLevel}`); // 0.45 (moderate threat)

// Test profile comparison
const aggressive = AIDecisionProfile.aggressive('aggressive_test');
const comparison = BattleAIUtils.compareProfiles(profile, aggressive);
console.log(`Total difference: ${comparison.totalDifference}`);
```

## 🔍 Integration Examples

### Battle System Integration

```typescript
// In battle system
class BattleSystem {
  private aiManager: AIControllerManager;

  constructor() {
    this.aiManager = new AIControllerManager();
    this.aiManager.createStandardProfiles();
  }

  executeAITurn(spirit: ISpiritInstance, opponent: ISpiritInstance): string {
    // Use adaptive AI based on spirit characteristics
    const adaptiveProfile = BattleAIUtils.createAdaptiveProfile(spirit);
    this.aiManager.registerProfile(adaptiveProfile);

    const ai = this.aiManager.getAIController(adaptiveProfile.profileID);
    return ai.selectMove(spirit, opponent);
  }

  getThreatAssessment(spirit: ISpiritInstance, opponent: ISpiritInstance): number {
    const ai = this.aiManager.getAIController('balanced');
    return ai.evaluateThreatLevel(opponent);
  }
}
```

### Strategy Game Integration

```typescript
// In strategy game
class StrategyGame {
  private aiManager: AIControllerManager;

  constructor() {
    this.aiManager = new AIControllerManager();

    // Different profiles for different game phases
    this.aiManager.registerProfile(BattleAIUtils.createScenarioProfile('early_game'));
    this.aiManager.registerProfile(BattleAIUtils.createScenarioProfile('mid_game'));
    this.aiManager.registerProfile(BattleAIUtils.createScenarioProfile('late_game'));
  }

  getAIMove(gameState: GameState, playerId: string): string {
    const currentPhase = this.getCurrentGamePhase(gameState);
    const profile = this.aiManager.getProfile(`phase_${currentPhase}`);
    const ai = this.aiManager.getAIController(profile?.profileID || 'balanced');

    return ai.selectMove(gameState.currentSpirit, gameState.opponent);
  }
}
```

### Tournament System Integration

```typescript
// In tournament system
class Tournament {
  private aiManager: AIControllerManager;

  constructor() {
    this.aiManager = new AIControllerManager();
  }

  runTournament(participants: ISpiritInstance[]) {
    // Create adaptive profiles for each participant
    participants.forEach(spirit => {
      const adaptiveProfile = BattleAIUtils.createAdaptiveProfile(spirit);
      this.aiManager.registerProfile(adaptiveProfile);
    });

    // Run matches
    for (let i = 0; i < participants.length; i += 2) {
      const spirit1 = participants[i];
      const spirit2 = participants[i + 1];

      const ai1 = this.aiManager.getAIController(spirit1.id);
      const ai2 = this.aiManager.getAIController(spirit2.id);

      this.runMatch(spirit1, spirit2, ai1, ai2);
    }
  }

  private runMatch(spirit1: ISpiritInstance, spirit2: ISpiritInstance, ai1: IBattleAIController, ai2: IBattleAIController) {
    // Implementation of match logic
  }
}
```

## 📈 Performance

- **Fast Decisions**: O(n) move evaluation with optimized scoring
- **Memory Efficient**: Minimal memory footprint per AI instance
- **Scalable**: Handles multiple AI instances simultaneously
- **Configurable**: Extensive customization options

## 🔒 Security

- **Input Validation**: All inputs validated before processing
- **Safe Execution**: Protected against malicious profile configurations
- **Error Isolation**: AI failures don't crash the battle system
- **Type Safety**: Full TypeScript coverage prevents runtime errors

## 🤝 Contributing

Contributions are welcome! Please see the main MIFF repository for guidelines.

## 📝 License

MIT License - see LICENSE file for details.

## 🔄 Migration from C#

BattleAIPure is a TypeScript conversion of the original C# implementation. Key differences:

- **Type Safety**: Enhanced with TypeScript interfaces and validation
- **Modularity**: Improved separation of concerns with utility functions
- **CLI Tools**: Added interactive testing interface
- **Documentation**: Comprehensive examples and API documentation
- **Profile System**: Enhanced decision profiles with better type safety

The core AI decision-making logic remains identical to ensure compatibility with existing C# implementations.