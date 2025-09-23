# SyncPure - Spirit Synchronization System

A comprehensive spirit synchronization system for tracking sync levels, handling sync events, and managing rhythm challenges. Supports event-driven sync progression with configurable thresholds and challenges.

## Features

- **Sync Level Tracking**: Comprehensive spirit sync level management with thresholds
- **Event-Driven Progression**: Built-in sync triggers for battles, items, dialogue, and challenges
- **Rhythm Challenges**: Configurable rhythm-based sync challenges with difficulty scaling
- **Real-time Updates**: Event callbacks for sync level changes and progression
- **Statistics Tracking**: Detailed sync statistics and progression analysis
- **Flexible Thresholds**: Configurable sync level thresholds with automatic progression
- **Type-Safe Operations**: Full TypeScript support with comprehensive interfaces

## Installation

```bash
npm install miff-framework
```

## Usage

### Basic Usage

```typescript
import { SyncManager, SyncEvent, SyncTrigger } from 'miff-framework';

// Create sync manager
const syncManager = new SyncManager();

// Process sync events
syncManager.processSyncEvent('ember', SyncEvent.createBattleWin(1));
console.log(`Ember sync level: ${syncManager.getSyncLevel('ember')}`);

// Set sync thresholds
syncManager.setThresholds('ember', [10, 25, 50, 100]);
```

### Advanced Usage

```typescript
import {
  SyncManager,
  SyncEvent,
  SyncChallenge,
  SyncUtils,
  SyncTrigger
} from 'miff-framework';

// Create sync manager with event tracking
const syncManager = new SyncManager({ enableEvents: true });

// Add event listener
syncManager.addSyncLevelChangedCallback((spiritId, newLevel, oldLevel) => {
  console.log(`${spiritId} leveled up from ${oldLevel} to ${newLevel}!`);
});

// Create and evaluate rhythm challenge
const challenge = new SyncChallenge(120, 2, 'boss_theme');
const syncGain = challenge.evaluatePerformance(0.85);
console.log(`Challenge completed! +${syncGain} sync`);

// Process multiple event types
const events = [
  SyncEvent.createBattleWin(2),      // +20 sync
  SyncEvent.createItemUsage('rare_gem', 3),  // +15 sync
  SyncEvent.createRhythmChallenge(0.9, 2)     // +27 sync
];

syncManager.processSyncEvents('ember', events);
```

### CLI Usage

```bash
# Start interactive CLI
node cliHarness.ts

# Example CLI session:
sync> add ember 25
sync> thresholds ember 10 25 50 100
sync> event ember battle_win
sync> challenge 120 2
sync> play 0.85
sync> stats
sync> demo
```

## API Reference

### Classes

#### SyncEvent
Sync event implementation with configurable triggers and magnitude.

**Constructor:**
- `constructor(trigger, magnitude, tag?, loreUnlockID?, evolutionHint?)`

**Static Methods:**
- `createBattleWin(battleDifficulty)` - Create battle victory event
- `createItemUsage(itemId, rarityMultiplier)` - Create item usage event
- `createDialogueChoice(choiceId, emotionalWeight)` - Create dialogue choice event
- `createRhythmChallenge(accuracy, difficulty)` - Create rhythm challenge event

**Methods:**
- `clone(): SyncEvent` - Create a copy
- `validate(): string[]` - Validate event data
- `getSummary(): string` - Get event summary string

#### SyncChallenge
Rhythm challenge implementation with difficulty and BPM configuration.

**Constructor:**
- `constructor(bpm, difficulty, stemID)`

**Properties:**
- `bpm: number` - Beats per minute (60-200)
- `difficulty: number` - Challenge difficulty (1-3)
- `stemID: string` - Music stem identifier

**Methods:**
- `evaluatePerformance(accuracy): number` - Calculate sync gain for accuracy
- `getDifficultyRating(): string` - Get difficulty as string ('Easy', 'Normal', 'Hard')
- `getMaxPotentialSync(): number` - Get sync gain for perfect performance
- `getEstimatedSync(accuracy): number` - Get estimated sync for accuracy
- `clone(): SyncChallenge` - Create a copy
- `validate(): string[]` - Validate challenge configuration

#### SpiritSyncEntry
Individual spirit sync level tracking with thresholds.

**Constructor:**
- `constructor(spiritId, initialLevel, thresholds)`

**Properties:**
- `spiritId: string` - Spirit identifier
- `currentLevel: number` - Current sync level
- `thresholds: number[]` - Sync level thresholds
- `totalEvents: number` - Total sync events processed
- `totalSyncGained: number` - Total sync points gained

**Computed Properties:**
- `canLevelUp: boolean` - Whether spirit can level up
- `nextThreshold: number | null` - Next threshold level
- `syncToNextLevel: number | null` - Sync needed for next level
- `levelProgress: number` - Progress to next level (0-1)

**Methods:**
- `addSync(amount): number` - Add sync points
- `setSyncLevel(level): number` - Set exact sync level
- `resetSync(): number` - Reset sync to 0
- `addThreshold(threshold): boolean` - Add threshold
- `removeThreshold(threshold): boolean` - Remove threshold
- `clone(): SpiritSyncEntry` - Create a copy
- `validate(): string[]` - Validate entry data

#### SyncManager
Main sync management system with event processing and statistics.

**Constructor:**
- `constructor(config?)`

**Configuration Options:**
- `defaultMaxLevel?: number` - Default maximum sync level
- `enableEvents?: boolean` - Enable event callbacks
- `autoSave?: boolean` - Enable automatic saving

**Core Methods:**
- `getSyncLevel(spiritId): number` - Get sync level for spirit
- `getSyncEntry(spiritId): SpiritSyncEntry | null` - Get sync entry for spirit
- `increaseSync(spiritId, amount): number` - Increase sync for spirit
- `processSyncEvent(spiritId, event): number` - Process single sync event
- `processSyncEvents(spiritId, events): number` - Process multiple sync events
- `resetSync(spiritId): number` - Reset spirit sync to 0
- `setThresholds(spiritId, thresholds): boolean` - Set sync thresholds

**Query Methods:**
- `getAllSpirits(): string[]` - Get all spirits with sync data
- `getSpiritsAtLevel(level): string[]` - Get spirits at specific level
- `getSpiritsAboveThreshold(threshold): string[]` - Get spirits above threshold
- `getStatistics(): ISyncStatistics` - Get sync system statistics
- `getEventHistory(limit?): ISyncEventData[]` - Get event history
- `getSpiritsReadyToLevelUp(): string[]` - Get spirits ready to level up
- `getLevelUpCandidates(): Array<{ spiritId: string; syncNeeded: number }>` - Get level up candidates

**Event Methods:**
- `addSyncLevelChangedCallback(callback): void` - Add level change callback
- `removeSyncLevelChangedCallback(callback): void` - Remove level change callback

**Data Management:**
- `clear(): void` - Clear all sync data
- `exportData(): Record<string, ISpiritSyncEntry>` - Export sync data
- `importData(data): void` - Import sync data

### Enums

#### SyncTrigger
Built-in sync event triggers.

```typescript
export enum SyncTrigger {
  BATTLE_WIN = 'battle_win',
  ITEM_USAGE = 'item_usage',
  DIALOGUE_CHOICE = 'dialogue_choice',
  RHYTHM_CHALLENGE_SUCCESS = 'rhythm_challenge_success'
}
```

### Interfaces

#### ISyncEvent
Sync event interface.

**Properties:**
- `trigger: SyncTrigger` - Event trigger type
- `magnitude: number` - Sync gain amount
- `tag?: string` - Optional event tag
- `loreUnlockID?: string` - Optional lore unlock identifier
- `evolutionHint?: string` - Optional evolution hint

#### ISyncChallenge
Sync challenge interface.

**Properties:**
- `bpm: number` - Beats per minute
- `difficulty: number` - Challenge difficulty
- `stemID: string` - Music stem identifier

#### ISpiritSyncEntry
Spirit sync entry interface.

**Properties:**
- `spiritId: string` - Spirit identifier
- `currentLevel: number` - Current sync level
- `thresholds: number[]` - Sync thresholds
- `lastUpdate: number` - Last update timestamp
- `totalEvents: number` - Total events processed
- `totalSyncGained: number` - Total sync gained

#### ISyncStatistics
Sync system statistics interface.

**Properties:**
- `totalSyncEvents: number` - Total sync events processed
- `totalSyncGained: number` - Total sync points gained
- `averageSyncPerEvent: number` - Average sync per event
- `highestSyncLevel: number` - Highest sync level achieved
- `mostActiveSpirit: string` - Most active spirit identifier

#### ISyncEventData
Sync event data interface.

**Properties:**
- `spiritId: string` - Affected spirit identifier
- `event: ISyncEvent` - Sync event
- `timestamp: number` - Event timestamp
- `previousLevel: number` - Previous sync level
- `newLevel: number` - New sync level

## Configuration

### Basic Sync Setup

```typescript
import { SyncManager, SyncUtils } from 'miff-framework';

// Create sync manager
const syncManager = new SyncManager();

// Add spirit with initial sync
syncManager.increaseSync('ember', 25);

// Set standard thresholds (10, 20, 30, ..., 100)
syncManager.setThresholds('ember', SyncUtils.createStandardThresholds(100));
```

### Advanced Sync Configuration

```typescript
import { SyncManager, SyncChallenge, SyncEvent, SyncTrigger } from 'miff-framework';

// Create sync manager with custom configuration
const syncManager = new SyncManager({
  defaultMaxLevel: 150,
  enableEvents: true,
  autoSave: false
});

// Add event listener for level ups
syncManager.addSyncLevelChangedCallback((spiritId, newLevel, oldLevel) => {
  if (newLevel > oldLevel) {
    console.log(`🎉 ${spiritId} reached level ${newLevel}!`);

    // Trigger special events for milestones
    if (newLevel >= 50) {
      console.log(`🏆 ${spiritId} reached milestone level 50!`);
    }
  }
});

// Set exponential thresholds (10, 15, 22, 33, 50, 75, 112, 150)
syncManager.setThresholds('ember', SyncUtils.createExponentialThresholds(10, 150));
```

### Rhythm Challenge Configuration

```typescript
import { SyncChallenge } from 'miff-framework';

// Create rhythm challenge
const challenge = new SyncChallenge(120, 2, 'boss_theme');

// Challenge properties
console.log(`BPM: ${challenge.bpm}`);
console.log(`Difficulty: ${challenge.getDifficultyRating()}`);
console.log(`Max Sync: ${challenge.getMaxPotentialSync()}`);

// Evaluate different accuracy levels
console.log(`Perfect (100%): ${challenge.evaluatePerformance(1.0)} sync`);
console.log(`Good (85%): ${challenge.evaluatePerformance(0.85)} sync`);
console.log(`Average (70%): ${challenge.evaluatePerformance(0.7)} sync`);
```

## Examples

### Example 1: Basic Sync Progression

```typescript
import { SyncManager, SyncEvent, SyncTrigger } from 'miff-framework';

const syncManager = new SyncManager();

// Add spirit and set thresholds
syncManager.increaseSync('ember', 0);
syncManager.setThresholds('ember', [10, 25, 50, 100]);

console.log(`Ember initial level: ${syncManager.getSyncLevel('ember')}`);

// Simulate progression through various activities
const events = [
  SyncEvent.createBattleWin(1),      // +10 sync
  SyncEvent.createItemUsage('health_potion', 1),  // +5 sync
  SyncEvent.createBattleWin(2),      // +20 sync
  SyncEvent.createDialogueChoice('choice_1', 1.5), // +4.5 sync
  SyncEvent.createBattleWin(3)       // +30 sync
];

events.forEach((event, index) => {
  const levelIncrease = syncManager.processSyncEvent('ember', event);
  console.log(`Event ${index + 1}: ${event.getSummary()}`);
  console.log(`  Result: +${event.magnitude} sync (+${levelIncrease} levels)`);
  console.log(`  New level: ${syncManager.getSyncLevel('ember')}`);
});
```

### Example 2: Multi-Spirit Sync Management

```typescript
import { SyncManager, SyncEvent, SyncTrigger, SyncUtils } from 'miff-framework';

const syncManager = new SyncManager({ enableEvents: true });

// Add multiple spirits
const spirits = ['ember', 'ripple', 'sprout', 'crystal'];
spirits.forEach(spiritId => {
  syncManager.increaseSync(spiritId, 0);
  syncManager.setThresholds(spiritId, SyncUtils.createStandardThresholds(100));
});

// Track level ups
syncManager.addSyncLevelChangedCallback((spiritId, newLevel, oldLevel) => {
  console.log(`🎉 ${spiritId} leveled up: ${oldLevel} → ${newLevel}`);
});

// Simulate party activities
const activities = [
  { spirit: 'ember', event: SyncEvent.createBattleWin(1) },
  { spirit: 'ripple', event: SyncEvent.createItemUsage('mana_crystal', 3) },
  { spirit: 'sprout', event: SyncEvent.createRhythmChallenge(0.9, 2) },
  { spirit: 'crystal', event: SyncEvent.createDialogueChoice('choice_2', 2) }
];

activities.forEach((activity, index) => {
  const levelIncrease = syncManager.processSyncEvent(activity.spirit, activity.event);
  console.log(`Activity ${index + 1}: ${activity.spirit} - ${activity.event.getSummary()}`);
});

// Show final statistics
console.log('\n📊 Final Statistics:');
const stats = syncManager.getStatistics();
console.log(`Total Events: ${stats.totalSyncEvents}`);
console.log(`Total Sync Gained: ${stats.totalSyncGained}`);
console.log(`Highest Level: ${stats.highestSyncLevel} (${stats.mostActiveSpirit})`);

spirits.forEach(spiritId => {
  const level = syncManager.getSyncLevel(spiritId);
  console.log(`${spiritId}: Level ${level}`);
});
```

### Example 3: Rhythm Challenge System

```typescript
import { SyncChallenge, SyncEvent, SyncTrigger } from 'miff-framework';

// Create different difficulty challenges
const challenges = [
  new SyncChallenge(100, 1, 'easy_theme'),    // Easy - 100 BPM
  new SyncChallenge(120, 2, 'normal_theme'),  // Normal - 120 BPM
  new SyncChallenge(140, 3, 'hard_theme')     // Hard - 140 BPM
];

challenges.forEach((challenge, index) => {
  console.log(`\nChallenge ${index + 1} - ${challenge.getDifficultyRating()}:`);
  console.log(`  BPM: ${challenge.bpm}`);
  console.log(`  Max Sync: ${challenge.getMaxPotentialSync()}`);

  // Show sync gain for different accuracy levels
  [0.5, 0.7, 0.85, 0.95, 1.0].forEach(accuracy => {
    const syncGain = challenge.evaluatePerformance(accuracy);
    const percentage = Math.round(accuracy * 100);
    console.log(`    ${percentage}% accuracy: ${syncGain} sync`);
  });
});

// Simulate challenge completion
const playerSpirit = 'ember';
const challenge = challenges[1]; // Normal difficulty

console.log(`\n🎵 ${playerSpirit} attempts ${challenge.getDifficultyRating()} challenge...`);

const accuracy = 0.85; // 85% accuracy
const syncGain = challenge.evaluatePerformance(accuracy);
const levelIncrease = syncManager.processSyncEvent(playerSpirit, SyncEvent.createRhythmChallenge(accuracy, challenge.difficulty));

console.log(`✅ Challenge completed!`);
console.log(`   Accuracy: ${(accuracy * 100).toFixed(1)}%`);
console.log(`   Sync Gained: ${syncGain}`);
console.log(`   Level Increase: +${levelIncrease}`);
```

### Example 4: Sync Event Analysis

```typescript
import { SyncManager, SyncEvent, SyncTrigger, SyncUtils } from 'miff-framework';

const syncManager = new SyncManager();
syncManager.increaseSync('test_spirit', 0);
syncManager.setThresholds('test_spirit', [10, 25, 50, 100]);

// Simulate various sync events
const events = [
  SyncEvent.createBattleWin(1),      // +10 sync
  SyncEvent.createBattleWin(2),      // +20 sync
  SyncEvent.createItemUsage('common_potion', 1),  // +5 sync
  SyncEvent.createItemUsage('rare_gem', 3),       // +15 sync
  SyncEvent.createDialogueChoice('choice_1', 1),  // +3 sync
  SyncEvent.createRhythmChallenge(0.9, 2),        // +27 sync
  SyncEvent.createBattleWin(3)       // +30 sync
];

console.log('🎯 Sync Event Analysis:');
events.forEach((event, index) => {
  const levelBefore = syncManager.getSyncLevel('test_spirit');
  const levelIncrease = syncManager.processSyncEvent('test_spirit', event);
  const levelAfter = syncManager.getSyncLevel('test_spirit');

  console.log(`Event ${index + 1}: ${event.getSummary()}`);
  console.log(`  Before: Level ${levelBefore} → After: Level ${levelAfter} (+${levelIncrease} levels)`);
});

// Analyze results
const entry = syncManager.getSyncEntry('test_spirit')!;
const stats = syncManager.getStatistics();

console.log('\n📊 Analysis Results:');
console.log(`Final Level: ${entry.currentLevel}`);
console.log(`Total Events: ${entry.totalEvents}`);
console.log(`Total Sync Gained: ${entry.totalSyncGained}`);
console.log(`Average Sync per Event: ${stats.averageSyncPerEvent.toFixed(1)}`);
console.log(`Current Progress: ${SyncUtils.getSyncProgressString(entry)}`);

const readyToLevel = syncManager.getSpiritsReadyToLevelUp();
if (readyToLevel.length > 0) {
  console.log(`\n🎯 Ready to Level Up: ${readyToLevel.join(', ')}`);
}
```

## Testing

```bash
# Run SyncPure tests
npm test -- --testPathPattern="SyncPure"

# Run CLI harness tests
node cliHarness.ts
```

## Integration

### With Other Modules
- **BattleAIPure**: AI decision making based on sync levels
- **PartyPure**: Party member sync level tracking
- **ProgressionPure**: Player progression through sync milestones
- **ItemsPure**: Item effects on sync progression
- **EventSystemPure**: Event-driven sync triggers

### Engine Bridges
- **Unity**: Sync level UI integration
- **Godot**: Rhythm challenge system integration
- **Web**: HTML5 rhythm game integration

## Performance

- **Time Complexity**: O(1) for sync operations, O(n log n) for threshold sorting
- **Space Complexity**: O(s) where s = number of spirits with sync data
- **Optimization Tips**:
  - Cache frequently accessed sync entries
  - Use event history limits for memory management
  - Batch multiple sync events when possible
  - Consider sync data persistence for long sessions

## Troubleshooting

### Common Issues
1. **Sync not updating**: Check if spirit exists and event validation passes
2. **Level up events not firing**: Ensure event callbacks are properly registered
3. **Threshold validation errors**: Verify thresholds are positive and in ascending order
4. **Performance issues**: Consider reducing event history size for large datasets

### Debug Tips
- Use `validate()` methods to check data integrity
- Monitor event history for unexpected changes
- Test with simple threshold sets before complex configurations
- Check sync statistics for analysis

## Contributing

### Adding Features
1. Follow established sync system patterns
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

- **v1.0.0**: Initial TypeScript implementation with core sync system
- **v1.1.0**: Added rhythm challenges, event system, and statistics tracking