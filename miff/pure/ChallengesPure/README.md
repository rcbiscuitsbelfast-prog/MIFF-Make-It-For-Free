# ChallengesPure

A comprehensive **challenge management system** for tracking battle challenges, completion status, and reward distribution. Supports various challenge types with configurable rules, unlock conditions, and completion tracking.

## ✨ Features

- **Structured Challenge System**: Organized challenges with categories, difficulties, and priorities
- **Flexible Rules Engine**: Configurable rules for spirit restrictions, turn limits, item bans
- **Completion Tracking**: Detailed completion status with timestamps and statistics
- **Reward Distribution**: Automatic reward calculation and distribution upon completion
- **Availability Conditions**: Quest flags, lore flags, location requirements, and level checks
- **Advanced Filtering**: Filter by category, difficulty, status, tags, and search text
- **Statistics and Analytics**: Comprehensive progress tracking and completion metrics
- **Export/Import**: JSON serialization for save/load functionality

## 📦 Installation

```bash
npm install miff-challenges-pure
```

## 🚀 Quick Start

```typescript
import {
  ChallengeManager,
  BattleChallenge,
  ChallengeResult,
  ChallengeRuleset,
  ChallengeUtils,
  ChallengeCategory,
  ChallengeDifficulty,
  ChallengeStatus,
  ChallengeOutcome,
  IPlayerContext
} from 'miff-challenges-pure';

// Create challenge manager
const challengeManager = new ChallengeManager();

// Create challenge ruleset
const ruleset = ChallengeRuleset.itemBan(['healing_potion']);

// Create battle challenge
const challenge = BattleChallenge.mainStory(
  'story_001',
  'The Fire Guardian',
  'Defeat the guardian of the ancient flames',
  ['fire_guardian'],
  ['tutorial_complete']
);

// Set rewards
challenge.rewards = { experience: 500, gold: 100 };

// Register challenge
challengeManager.registerChallenge(challenge);

// Create player context
const playerContext: IPlayerContext = {
  hasQuestFlag: (flagId) => gameState.completedQuests.includes(flagId),
  hasLoreFlag: (flagId) => gameState.loreFlags.includes(flagId),
  getCurrentLocationId: () => gameState.currentLocation,
  getPlayerLevel: () => gameState.playerLevel,
  getCompletedChallenges: () => gameState.completedChallenges,
  getUnlockedLocations: () => gameState.unlockedLocations,
  getCapturedSpirits: () => gameState.capturedSpirits
};

// Check if challenge is available
if (challenge.isAvailable(playerContext)) {
  console.log('Challenge is available!');

  // Start challenge
  challengeManager.startChallenge('story_001');

  // Complete challenge
  const result = ChallengeResult.victory(challenge.rewards, challenge.loreFlagsToSet, challenge.syncBoosts);
  challengeManager.completeChallenge('story_001', result);
}

// Get statistics
const stats = challengeManager.getStatistics();
console.log(`Completed ${stats.completedChallenges}/${stats.totalChallenges} challenges`);
```

## 📚 Core Concepts

### Challenge Categories

- **TUTORIAL**: Beginner challenges to learn game mechanics
- **MAIN_STORY**: Primary storyline challenges
- **SIDE_QUEST**: Optional side challenges
- **DAILY**: Daily recurring challenges
- **WEEKLY**: Weekly recurring challenges
- **SPECIAL**: Special event challenges
- **ACHIEVEMENT**: Achievement-based challenges

### Challenge Difficulties

- **EASY**: Beginner-friendly challenges
- **MEDIUM**: Standard difficulty challenges
- **HARD**: Challenging encounters
- **EXPERT**: Advanced difficulty challenges
- **LEGENDARY**: Extremely difficult challenges

### Challenge Status

- **LOCKED**: Not yet accessible due to unmet requirements
- **AVAILABLE**: Ready to be started
- **IN_PROGRESS**: Currently being attempted
- **COMPLETED**: Successfully finished

### Challenge Outcomes

- **VICTORY**: Successfully completed
- **DEFEAT**: Failed to complete
- **TIMEOUT**: Ran out of time
- **FORFEIT**: Voluntarily surrendered

## 🔧 Basic Usage

### Creating Challenges

```typescript
// Tutorial challenge
const tutorialChallenge = BattleChallenge.tutorial(
  'tutorial_001',
  'First Steps',
  'Learn the basics of spirit combat',
  ['training_dummy'],
  10 // max turns
);

// Main story challenge
const storyChallenge = BattleChallenge.mainStory(
  'story_001',
  'The Fire Guardian',
  'Defeat the guardian of the ancient flames',
  ['fire_guardian'],
  ['tutorial_complete'] // required flags
);

// Boss challenge
const bossChallenge = BattleChallenge.boss(
  'boss_001',
  'The Elder Dragon',
  'Face the legendary elder dragon in combat',
  ['elder_dragon'],
  ['story_002_completed', 'player_level_10']
);

// Daily challenge
const dailyChallenge = BattleChallenge.daily(
  'daily_001',
  'Daily Sparring',
  'Test your skills against random opponents',
  ['random_spirit_1', 'random_spirit_2']
);

// Achievement challenge
const achievementChallenge = BattleChallenge.achievement(
  'achievement_001',
  'Spirit Master',
  'Defeat 100 different spirits',
  ['spirit_master_100_defeated']
);
```

### Challenge Rulesets

```typescript
// Spirit type restriction
const spiritRules = ChallengeRuleset.spiritRestriction(['fire', 'water']);

// Turn limit
const turnRules = ChallengeRuleset.turnLimit(20);

// Item ban
const itemRules = ChallengeRuleset.itemBan(['healing_potion', 'attack_boost']);

// Environmental effect
const envRules = ChallengeRuleset.environmental('rain');

// Complex ruleset
const complexRules = ChallengeRuleset.create(
  ['fire', 'water'], // allowed spirit types
  25,                // turn limit
  ['revive_item'],   // banned items
  'night'           // environment
);
```

### Working with Challenge Manager

```typescript
const challengeManager = new ChallengeManager();

// Register challenges
challengeManager.registerChallenge(tutorialChallenge);
challengeManager.registerChallenge(storyChallenge);
challengeManager.registerChallenge(bossChallenge);

// Check availability
const availableChallenges = challengeManager.getFilteredChallenges({
  status: ChallengeStatus.AVAILABLE
});

// Start challenge
if (challengeManager.startChallenge('story_001')) {
  console.log('Challenge started!');
}

// Complete challenge
const result = ChallengeResult.victory(
  { experience: 500, gold: 100 },
  ['fire_guardian_defeated'],
  { fire_spirit: 10 }
);

if (challengeManager.completeChallenge('story_001', result)) {
  console.log('Challenge completed!');
}
```

### Player Context Integration

```typescript
// Create player context
const playerContext: IPlayerContext = {
  hasQuestFlag: (flagId: string) => {
    return gameState.completedQuests.includes(flagId);
  },
  hasLoreFlag: (flagId: string) => {
    return gameState.loreFlags.includes(flagId);
  },
  getCurrentLocationId: () => {
    return gameState.currentLocation;
  },
  getPlayerLevel: () => {
    return gameState.playerLevel;
  },
  getCompletedChallenges: () => {
    return gameState.completedChallenges;
  },
  getUnlockedLocations: () => {
    return gameState.unlockedLocations;
  },
  getCapturedSpirits: () => {
    return gameState.capturedSpirits;
  }
};

// Check all challenge availability
challengeManager.getAllChallenges().forEach(challenge => {
  if (challenge.isAvailable(playerContext)) {
    console.log(`Challenge available: ${challenge.name}`);
  }
});
```

### Challenge Statistics and Progress

```typescript
const stats = challengeManager.getStatistics();

console.log(`Total Challenges: ${stats.totalChallenges}`);
console.log(`Completed: ${stats.completedChallenges} (${stats.completionRate.toFixed(1)}%)`);
console.log(`Available: ${stats.availableChallenges}`);
console.log(`In Progress: ${stats.inProgressChallenges}`);

// Category breakdown
console.log('Challenges by Category:');
Object.entries(stats.challengesByCategory).forEach(([category, count]) => {
  if (count > 0) {
    console.log(`  ${category}: ${count}`);
  }
});

// Difficulty breakdown
console.log('Challenges by Difficulty:');
Object.entries(stats.challengesByDifficulty).forEach(([difficulty, count]) => {
  if (count > 0) {
    console.log(`  ${difficulty}: ${count}`);
  }
});

// Total rewards earned
console.log('Total Rewards Earned:');
Object.entries(stats.totalRewardsEarned).forEach(([item, amount]) => {
  console.log(`  ${item}: ${amount}`);
});

// Completion progress
const progress = ChallengeUtils.getCompletionPercentage(
  stats.totalChallenges,
  stats.completedChallenges
);

console.log(`Overall Progress: ${progress.percentage.toFixed(1)}%`);
```

## ⚡ Advanced Usage

### Custom Challenge Types

```typescript
// Create custom challenge with specific requirements
const customChallenge = BattleChallenge.create(
  'custom_001',
  'No Items Master',
  'Complete the challenge without using any items',
  ['challenge_master'],
  ChallengeRuleset.itemBan(['healing_potion', 'attack_boost', 'defense_boost']),
  { experience: 1000, gold: 500, rare_item: 1 },
  ChallengeCategory.SPECIAL,
  ChallengeDifficulty.LEGENDARY,
  30, // max turns
  10, // high priority
  ['no_items', 'master_challenge', 'special'],
  ['no_items_master_unlocked'],
  'challenge_arena'
);

// Add sync boosts for spirit progression
customChallenge.syncBoosts = {
  fire_spirit: 25,
  water_spirit: 25,
  earth_spirit: 25
};

// Add lore flags to unlock new content
customChallenge.loreFlagsToSet = [
  'challenge_master_defeated',
  'no_items_master_achieved'
];
```

### Complex Availability Conditions

```typescript
// Challenge requiring multiple conditions
const complexChallenge = BattleChallenge.create(
  'complex_001',
  'Elemental Master',
  'Master all elements in a single challenge',
  ['fire_spirit', 'water_spirit', 'earth_spirit', 'wind_spirit'],
  ChallengeRuleset.spiritRestriction(['fire', 'water', 'earth', 'wind']),
  { experience: 2000, gold: 1000 },
  ChallengeCategory.ACHIEVEMENT,
  ChallengeDifficulty.EXPERT,
  50,
  9,
  ['elemental', 'master'],
  [
    'fire_mastery_achieved',
    'water_mastery_achieved',
    'earth_mastery_achieved',
    'wind_mastery_achieved',
    'player_level_20'
  ],
  'elemental_shrine'
);
```

### Challenge Filtering and Search

```typescript
// Filter challenges
const availableChallenges = challengeManager.getFilteredChallenges({
  status: ChallengeStatus.AVAILABLE,
  category: ChallengeCategory.MAIN_STORY,
  minDifficulty: ChallengeDifficulty.MEDIUM
});

// Search challenges
const searchResults = challengeManager.getFilteredChallenges({
  searchText: 'fire'
});

// Filter by tags
const taggedChallenges = challengeManager.getFilteredChallenges({
  tags: ['boss', 'legendary']
});

// Filter by priority
const highPriorityChallenges = challengeManager.getFilteredChallenges({
  minPriority: 7
});
```

### Event Handling

```typescript
// Set up event handlers
challengeManager.onChallengeStarted = (challenge) => {
  console.log(`Challenge started: ${challenge.name}`);
  // Trigger UI updates, music changes, etc.
  gameUI.showChallengeHUD(challenge);
  audioManager.playChallengeMusic(challenge.difficulty);
};

challengeManager.onChallengeCompleted = (challenge, result) => {
  console.log(`Challenge completed: ${challenge.name} (${result.outcome})`);

  // Process rewards
  if (result.outcome === ChallengeOutcome.VICTORY) {
    playerState.addExperience(result.itemRewards.experience || 0);
    playerState.addGold(result.itemRewards.gold || 0);

    // Process lore flags
    result.loreFlags.forEach(flag => {
      loreManager.setFlag(flag);
    });

    // Process sync boosts
    Object.entries(result.syncChanges).forEach(([spiritId, boost]) => {
      spiritManager.boostSync(spiritId, boost);
    });
  }

  // Show completion screen
  gameUI.showChallengeCompleteScreen(challenge, result);
};
```

### Save/Load System Integration

```typescript
// Export challenge data
const jsonData = JSON.stringify({
  challenges: challengeManager.getAllChallenges().map(c => c.toJSON()),
  completed: challengeManager.getAllChallenges()
    .filter(c => challengeManager.isChallengeCompleted(c.challengeId))
    .map(c => c.challengeId)
});

// Save to localStorage or file
localStorage.setItem('player_challenges', jsonData);

// Import challenge data
const savedData = localStorage.getItem('player_challenges');
if (savedData) {
  const data = JSON.parse(savedData);

  // Recreate challenge manager
  const importedManager = new ChallengeManager();

  // Import challenges
  data.challenges.forEach((challengeData: any) => {
    const challenge = BattleChallenge.fromJSON(challengeData);
    importedManager.registerChallenge(challenge);
  });

  // Restore completion status
  data.completed.forEach((challengeId: string) => {
    const challenge = importedManager.getChallenge(challengeId);
    if (challenge) {
      challenge.status = ChallengeStatus.COMPLETED;
    }
  });
}
```

## 📊 API Reference

### Classes

#### `BattleChallenge`
Represents a single challenge with rules, rewards, and availability conditions.

**Properties:**
- `challengeId: string` - Unique identifier
- `name: string` - Display name
- `description: string` - Challenge description
- `opponentTeam: string[]` - Array of opponent spirit IDs
- `ruleset: IChallengeRuleset` - Challenge rules and restrictions
- `rewards: Record<string, number>` - Rewards for completion
- `category: ChallengeCategory` - Challenge category
- `difficulty: ChallengeDifficulty` - Challenge difficulty
- `status: ChallengeStatus` - Current status
- `priority: number` - Display priority (0-10)

**Static Methods:**
- `create()` - Create challenge with parameters
- `tutorial()` - Create tutorial challenge
- `mainStory()` - Create main story challenge
- `boss()` - Create boss challenge
- `daily()` - Create daily challenge
- `achievement()` - Create achievement challenge
- `fromJSON()` - Create from JSON data

**Methods:**
- `isAvailable(playerContext)` - Check availability
- `getEstimatedDuration()` - Get estimated duration
- `getCompletionPercentage()` - Get completion percentage
- `validate()` - Validate challenge data

#### `ChallengeRuleset`
Defines rules and restrictions for challenges.

**Static Methods:**
- `create()` - Create ruleset with parameters
- `spiritRestriction(types)` - Create spirit type restriction
- `turnLimit(maxTurns)` - Create turn limit
- `itemBan(items)` - Create item ban
- `environmental(tag)` - Create environmental ruleset

**Methods:**
- `isCompliant(partyTypes, items)` - Check compliance
- `getDescription()` - Get human-readable description
- `validate()` - Validate ruleset

#### `ChallengeResult`
Represents the result of a completed challenge.

**Static Methods:**
- `victory()` - Create victory result
- `defeat()` - Create defeat result
- `timeout()` - Create timeout result
- `forfeit()` - Create forfeit result
- `fromJSON()` - Create from JSON data

**Methods:**
- `getTotalRewardValue()` - Get total reward value
- `getDescription()` - Get result description
- `toString()` - Get string representation

#### `ChallengeManager`
Manages collection of challenges and completion status.

**Methods:**
- `registerChallenge(challenge)` - Register new challenge
- `getChallenge(challengeId)` - Get challenge by ID
- `getAllChallenges()` - Get all challenges
- `getFilteredChallenges(filter)` - Get filtered challenges
- `startChallenge(challengeId)` - Start challenge
- `completeChallenge(challengeId, result)` - Complete challenge
- `isChallengeCompleted(challengeId)` - Check completion
- `getChallengeStatus(challengeId)` - Get challenge status
- `getStatistics()` - Get comprehensive statistics

### Enums

#### `ChallengeCategory`
- `TUTORIAL` - Tutorial challenges
- `MAIN_STORY` - Main storyline
- `SIDE_QUEST` - Side quests
- `DAILY` - Daily challenges
- `WEEKLY` - Weekly challenges
- `SPECIAL` - Special events
- `ACHIEVEMENT` - Achievements

#### `ChallengeDifficulty`
- `EASY` - Easy difficulty
- `MEDIUM` - Medium difficulty
- `HARD` - Hard difficulty
- `EXPERT` - Expert difficulty
- `LEGENDARY` - Legendary difficulty

#### `ChallengeStatus`
- `LOCKED` - Not accessible
- `AVAILABLE` - Ready to start
- `IN_PROGRESS` - Currently active
- `COMPLETED` - Finished

#### `ChallengeOutcome`
- `VICTORY` - Successfully completed
- `DEFEAT` - Failed
- `TIMEOUT` - Timed out
- `FORFEIT` - Surrendered

### Utility Functions

#### `ChallengeUtils.createDefaultPlayerContext()`
Creates default player context for testing.

#### `ChallengeUtils.validateChallenge(challenge)`
Validates challenge data.

#### `ChallengeUtils.getCompletionPercentage(total, completed)`
Calculates completion percentage.

#### `ChallengeUtils.filterChallenges(challenges, filters)`
Filters challenges by criteria.

#### `ChallengeUtils.sortChallenges(challenges, sortBy?)`
Sorts challenges by priority, name, or difficulty.

#### `ChallengeUtils.createFilter`
Creates standard filter objects.

## ⚙️ Configuration

### Challenge Configuration

```typescript
const challenge = BattleChallenge.create(
  'boss_challenge_001',
  'Ultimate Boss',
  'The most difficult challenge in the game',
  ['legendary_dragon', 'dragon_minions'],
  ChallengeRuleset.turnLimit(50),
  { experience: 5000, gold: 2500, legendary_item: 1 },
  ChallengeCategory.MAIN_STORY,
  ChallengeDifficulty.LEGENDARY,
  50,
  10,
  ['boss', 'legendary', 'final'],
  ['all_quests_completed', 'player_level_50'],
  'dragon_lair',
  ['dragon_slayer', 'legend_defeated'],
  { fire_spirit: 50, dragon_spirit: 100 }
);
```

### Manager Configuration

```typescript
const challengeManager = new ChallengeManager();

// Register multiple challenges
const challenges = [
  BattleChallenge.tutorial('tut_001', 'First Steps', 'Learn basics', ['dummy']),
  BattleChallenge.mainStory('story_001', 'Fire Guardian', 'Defeat guardian', ['guardian']),
  BattleChallenge.boss('boss_001', 'Elder Dragon', 'Final challenge', ['dragon'])
];

challenges.forEach(challenge => challengeManager.registerChallenge(challenge));
```

## 🧪 Testing

```typescript
import {
  ChallengeManager,
  BattleChallenge,
  ChallengeResult,
  ChallengeRuleset,
  ChallengeUtils,
  ChallengeCategory,
  ChallengeDifficulty,
  ChallengeStatus
} from 'miff-challenges-pure';

// Create test manager
const challengeManager = new ChallengeManager();

// Create test challenges
const challenge1 = BattleChallenge.tutorial(
  'test_001',
  'Test Challenge 1',
  'A test challenge for unit testing',
  ['test_opponent']
);

const challenge2 = BattleChallenge.mainStory(
  'test_002',
  'Test Story Challenge',
  'A test story challenge',
  ['story_opponent'],
  ['test_001_completed']
);

// Register challenges
challengeManager.registerChallenge(challenge1);
challengeManager.registerChallenge(challenge2);

// Test filtering
const availableChallenges = challengeManager.getFilteredChallenges({
  status: ChallengeStatus.AVAILABLE
});

expect(availableChallenges).toHaveLength(1);
expect(availableChallenges[0].challengeId).toBe('test_001');

// Test challenge rules
const ruleset = ChallengeRuleset.itemBan(['test_item']);
const isCompliant = ruleset.isCompliant(['fire'], ['allowed_item']);
expect(isCompliant).toBe(true);

// Test challenge completion
challengeManager.startChallenge('test_001');
const result = ChallengeResult.victory({ experience: 100 });
challengeManager.completeChallenge('test_001', result);

expect(challengeManager.isChallengeCompleted('test_001')).toBe(true);

// Test statistics
const stats = challengeManager.getStatistics();
expect(stats.totalChallenges).toBe(2);
expect(stats.completedChallenges).toBe(1);
```

## 🔍 Integration Examples

### Game Challenge System

```typescript
class GameChallengeSystem {
  private challengeManager: ChallengeManager;
  private playerContext: IPlayerContext;

  constructor() {
    this.challengeManager = new ChallengeManager();
    this.playerContext = this.createPlayerContext();
    this.initializeChallenges();
    this.setupEventHandlers();
  }

  private createPlayerContext(): IPlayerContext {
    return {
      hasQuestFlag: (flagId) => gameState.completedQuests.includes(flagId),
      hasLoreFlag: (flagId) => gameState.loreFlags.includes(flagId),
      getCurrentLocationId: () => gameState.currentLocation,
      getPlayerLevel: () => gameState.playerLevel,
      getCompletedChallenges: () => gameState.completedChallenges,
      getUnlockedLocations: () => gameState.unlockedLocations,
      getCapturedSpirits: () => gameState.capturedSpirits
    };
  }

  private initializeChallenges(): void {
    // Create and register challenges based on game content
    const challenges = this.createChallenges();
    challenges.forEach(challenge => this.challengeManager.registerChallenge(challenge));
  }

  private setupEventHandlers(): void {
    this.challengeManager.onChallengeStarted = (challenge) => {
      gameUI.showChallengeStart(challenge);
      audioManager.playChallengeMusic(challenge.difficulty);
    };

    this.challengeManager.onChallengeCompleted = (challenge, result) => {
      this.processChallengeRewards(result);
      gameUI.showChallengeComplete(challenge, result);
      achievementSystem.checkChallengeAchievements(challenge, result);
    };
  }

  onQuestCompleted(questId: string): void {
    // Mark quest flag
    gameState.completedQuests.push(questId);

    // Check for newly available challenges
    this.checkNewChallenges();
  }

  onSpiritCaptured(spiritId: string): void {
    gameState.capturedSpirits.push(spiritId);
    this.checkNewChallenges();
  }

  onLocationVisited(locationId: string): void {
    gameState.currentLocation = locationId;
    this.checkNewChallenges();
  }

  private checkNewChallenges(): void {
    const allChallenges = this.challengeManager.getAllChallenges();
    const newlyAvailable: string[] = [];

    allChallenges.forEach(challenge => {
      if (challenge.status === ChallengeStatus.LOCKED && challenge.isAvailable(this.playerContext)) {
        challenge.status = ChallengeStatus.AVAILABLE;
        newlyAvailable.push(challenge.name);
      }
    });

    if (newlyAvailable.length > 0) {
      console.log('New challenges available:');
      newlyAvailable.forEach(name => console.log(`  ⚔️ ${name}`));
    }
  }

  private processChallengeRewards(result: ChallengeResult): void {
    if (result.outcome === ChallengeOutcome.VICTORY) {
      // Process rewards
      playerState.addExperience(result.itemRewards.experience || 0);
      playerState.addGold(result.itemRewards.gold || 0);

      // Process lore flags
      result.loreFlags.forEach(flag => {
        loreManager.setFlag(flag);
      });

      // Process sync boosts
      Object.entries(result.syncChanges).forEach(([spiritId, boost]) => {
        spiritManager.boostSync(spiritId, boost);
      });
    }
  }

  getAvailableChallenges(): BattleChallenge[] {
    return this.challengeManager.getFilteredChallenges({
      status: ChallengeStatus.AVAILABLE
    });
  }

  getChallengeProgress(): { percentage: number; completed: number; total: number } {
    const stats = this.challengeManager.getStatistics();
    const progress = ChallengeUtils.getCompletionPercentage(
      stats.totalChallenges,
      stats.completedChallenges
    );

    return {
      percentage: progress.percentage,
      completed: stats.completedChallenges,
      total: stats.totalChallenges
    };
  }

  exportChallengeData(): string {
    const challenges = this.challengeManager.getAllChallenges();
    const completed = challenges
      .filter(c => this.challengeManager.isChallengeCompleted(c.challengeId))
      .map(c => c.challengeId);

    return JSON.stringify({ challenges, completed });
  }

  importChallengeData(jsonData: string): void {
    const data = JSON.parse(jsonData);
    // Implementation for importing challenge data
  }
}
```

### UI Integration

```typescript
class ChallengeUI {
  private challengeManager: ChallengeManager;
  private currentFilter: IChallengeFilter = {};

  constructor(challengeManager: ChallengeManager) {
    this.challengeManager = challengeManager;
  }

  renderChallengeList(): void {
    const challenges = this.challengeManager.getFilteredChallenges(this.currentFilter);

    console.log('Challenge List:');
    challenges.forEach((challenge, index) => {
      const statusIcon = this.getStatusIcon(challenge.status);
      const difficultyIcon = this.getDifficultyIcon(challenge.difficulty);
      const categoryIcon = this.getCategoryIcon(challenge.category);
      const availability = challenge.isAvailable(this.playerContext) ? '✓' : '✗';

      console.log(`${index + 1}. ${statusIcon} ${difficultyIcon} ${categoryIcon} ${challenge.name}`);
      console.log(`   Status: ${challenge.status} | Available: ${availability}`);
      console.log(`   Opponents: ${challenge.opponentTeam.length} | Turns: ${challenge.maxTurns || '∞'}`);
      console.log(`   Rewards: ${challenge.getRewardDescription()}`);

      if (challenge.status === ChallengeStatus.LOCKED) {
        console.log(`   🔒 Requirements: ${this.getAvailabilityText(challenge)}`);
      }
    });
  }

  renderChallengeDetails(challengeId: string): void {
    const challenge = this.challengeManager.getChallenge(challengeId);
    if (!challenge) {
      console.log('Challenge not found');
      return;
    }

    console.log(`Challenge: ${challenge.name}`);
    console.log(`Description: ${challenge.description}`);
    console.log(`Category: ${challenge.category}`);
    console.log(`Difficulty: ${challenge.difficulty}`);
    console.log(`Status: ${challenge.status}`);
    console.log(`Available: ${challenge.isAvailable(this.playerContext) ? 'Yes' : 'No'}`);
    console.log(`Opponents: ${challenge.opponentTeam.join(', ')}`);
    console.log(`Max Turns: ${challenge.maxTurns || 'No limit'}`);
    console.log(`Estimated Duration: ${challenge.getEstimatedDuration()} minutes`);
    console.log(`Rewards: ${challenge.getRewardDescription()}`);

    if (challenge.requiredFlags.length > 0) {
      console.log(`Required Flags: ${challenge.requiredFlags.join(', ')}`);
    }

    if (challenge.requiredLocationId) {
      console.log(`Required Location: ${challenge.requiredLocationId}`);
    }

    console.log(`Rules: ${challenge.ruleset.getDescription()}`);
  }

  setFilter(filter: IChallengeFilter): void {
    this.currentFilter = filter;
  }

  getFilterOptions(): { categories: ChallengeCategory[], difficulties: ChallengeDifficulty[], statuses: ChallengeStatus[] } {
    return {
      categories: Object.values(ChallengeCategory),
      difficulties: Object.values(ChallengeDifficulty),
      statuses: Object.values(ChallengeStatus)
    };
  }

  private getStatusIcon(status: ChallengeStatus): string {
    switch (status) {
      case ChallengeStatus.LOCKED: return '🔒';
      case ChallengeStatus.AVAILABLE: return '⚔️';
      case ChallengeStatus.IN_PROGRESS: return '⚡';
      case ChallengeStatus.COMPLETED: return '🏆';
      default: return '❓';
    }
  }

  private getDifficultyIcon(difficulty: ChallengeDifficulty): string {
    switch (difficulty) {
      case ChallengeDifficulty.EASY: return '🟢';
      case ChallengeDifficulty.MEDIUM: return '🟡';
      case ChallengeDifficulty.HARD: return '🟠';
      case ChallengeDifficulty.EXPERT: return '🔴';
      case ChallengeDifficulty.LEGENDARY: return '🟣';
      default: return '⚪';
    }
  }

  private getCategoryIcon(category: ChallengeCategory): string {
    switch (category) {
      case ChallengeCategory.TUTORIAL: return '📚';
      case ChallengeCategory.MAIN_STORY: return '📜';
      case ChallengeCategory.SIDE_QUEST: return '📖';
      case ChallengeCategory.DAILY: return '🌅';
      case ChallengeCategory.WEEKLY: return '📅';
      case ChallengeCategory.SPECIAL: return '✨';
      case ChallengeCategory.ACHIEVEMENT: return '🏅';
      default: return '📄';
    }
  }

  private getAvailabilityText(challenge: BattleChallenge): string {
    const reasons: string[] = [];

    if (challenge.requiredFlags.length > 0) {
      reasons.push(`Flags: ${challenge.requiredFlags.join(', ')}`);
    }

    if (challenge.requiredLocationId) {
      reasons.push(`Location: ${challenge.requiredLocationId}`);
    }

    return reasons.join(', ') || 'Unknown requirements';
  }

  renderStatistics(): void {
    const stats = this.challengeManager.getStatistics();
    const progress = ChallengeUtils.getCompletionPercentage(stats.totalChallenges, stats.completedChallenges);

    console.log('Challenge Statistics:');
    console.log(`Total: ${stats.totalChallenges}`);
    console.log(`Completed: ${stats.completedChallenges} (${progress.percentage.toFixed(1)}%)`);
    console.log(`Available: ${stats.availableChallenges}`);
    console.log(`Locked: ${stats.lockedChallenges}`);
    console.log(`In Progress: ${stats.inProgressChallenges}`);

    console.log('By Category:');
    Object.entries(stats.challengesByCategory).forEach(([category, count]) => {
      if (count > 0) {
        console.log(`  ${category}: ${count}`);
      }
    });

    console.log('By Difficulty:');
    Object.entries(stats.challengesByDifficulty).forEach(([difficulty, count]) => {
      if (count > 0) {
        console.log(`  ${difficulty}: ${count}`);
      }
    });
  }
}
```

## 📈 Performance

- **Memory Efficient**: Optimized storage of challenge data and completion status
- **Fast Filtering**: O(n) filtering with early termination optimizations
- **Minimal Overhead**: Lightweight availability checking and status updates
- **Scalable**: Handles large numbers of challenges efficiently
- **JSON Serialization**: Fast export/import with minimal processing

## 🔒 Security

- **Input Validation**: All challenges and results validated before storage
- **Safe Deserialization**: Protected JSON import with type checking
- **Immutable Operations**: Challenge data is immutable for thread safety
- **Type Safety**: Full TypeScript coverage prevents runtime errors

## 🤝 Contributing

Contributions are welcome! Please see the main MIFF repository for guidelines.

## 📝 License

MIT License - see LICENSE file for details.

## 🔄 Migration from C#

ChallengesPure is a TypeScript conversion of the original C# implementation. Key differences:

- **Type Safety**: Enhanced with TypeScript interfaces and validation
- **Event System**: Built-in event handling for challenge lifecycle
- **Advanced Filtering**: Enhanced filtering and search capabilities
- **Progress Tracking**: Comprehensive statistics and completion metrics
- **Export Formats**: JSON export/import for save/load functionality
- **Utility Functions**: Enhanced utility functions for common operations

The core challenge management functionality remains identical to ensure compatibility with existing C# implementations.