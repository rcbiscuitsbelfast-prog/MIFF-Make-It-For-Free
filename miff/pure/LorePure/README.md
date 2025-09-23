# LorePure

A comprehensive **lore management system** for tracking story entries, unlock conditions, and narrative progression. Supports quest flags, spirit capture, sync levels, location visits, and manual unlocks with flexible condition combinations.

## ✨ Features

- **Structured Lore Entries**: Organized entries with categories, priorities, and metadata
- **Flexible Unlock Conditions**: Quest flags, spirit capture, sync levels, location visits, manual unlock
- **Reading Progress Tracking**: Mark entries as read with timestamps and progress statistics
- **Advanced Filtering**: Filter by category, unlock state, priority, tags, and search text
- **Export/Import**: JSON serialization for save/load functionality
- **Statistics and Analytics**: Comprehensive progress tracking and completion metrics

## 📦 Installation

```bash
npm install miff-lorepure
```

## 🚀 Quick Start

```typescript
import {
  LoreCodexManager,
  LoreEntry,
  LoreUnlockCondition,
  LoreUtils,
  LoreCategory,
  LoreConditionType,
  LoreUnlockState,
  IPlayerContext
} from 'miff-lorepure';

// Create lore manager
const loreManager = new LoreCodexManager();

// Create unlock condition
const condition = LoreUnlockCondition.spiritCaptured('fire_spirit');

// Create lore entry
const loreEntry = LoreEntry.mainStory(
  'story_001',
  'The Beginning',
  'In the beginning, there was only darkness...',
  condition,
  10, // priority
  ['beginning', 'origins']
);

// Register lore entry
loreManager.registerLore(loreEntry);

// Create player context
const playerContext: IPlayerContext = {
  hasQuestFlag: (flagId) => false,
  hasCapturedSpirit: (spiritId) => spiritId === 'fire_spirit',
  getSpiritSyncLevel: (spiritId) => 0,
  hasVisitedLocation: (locationId) => false,
  getPlayerLevel: () => 1,
  getCompletedQuests: () => [],
  getUnlockedLocations: () => [],
  getCapturedSpirits: () => ['fire_spirit']
};

// Check if entry is unlocked
if (loreEntry.isUnlocked(playerContext)) {
  console.log('Lore unlocked!');
  loreEntry.markAsRead();
}

// Get statistics
const stats = loreManager.getStatistics();
console.log(`Unlocked ${stats.unlockedEntries}/${stats.totalEntries} entries`);
```

## 📚 Core Concepts

### Lore Categories

- **MAIN_STORY**: Primary storyline entries
- **SIDE_STORY**: Secondary story content
- **CHARACTER**: Character-specific lore and backstory
- **WORLD**: World-building and location descriptions
- **SPIRIT**: Spirit-specific information
- **LOCATION**: Location details and history
- **QUEST**: Quest-related lore
- **MYSTERY**: Mysterious or hidden content

### Unlock Conditions

- **ALWAYS_TRUE**: Always available
- **QUEST_FLAG**: Requires specific quest flag
- **SPIRIT_CAPTURED**: Requires capturing specific spirit
- **SYNC_LEVEL_REACHED**: Requires reaching sync level with spirit
- **LOCATION_VISITED**: Requires visiting specific location
- **MANUAL_UNLOCK**: Requires manual unlock action

### Unlock States

- **LOCKED**: Entry is not yet accessible
- **UNLOCKED**: Entry is available but not read
- **READ**: Entry has been read by player

## 🔧 Basic Usage

### Creating Lore Entries

```typescript
// Main story entry
const mainStoryEntry = LoreEntry.mainStory(
  'story_001',
  'The First Spirit',
  'The Fire Spirit emerged from primordial chaos...',
  LoreUnlockCondition.alwaysTrue(),
  10, // High priority
  ['fire', 'creation', 'beginning']
);

// Character lore entry
const characterEntry = LoreEntry.character(
  'char_001',
  'The Fire Spirit\'s Rage',
  'The Fire Spirit is known for its destructive temper...',
  'fire_spirit',
  LoreUnlockCondition.spiritCaptured('fire_spirit'),
  7,
  ['fire_spirit', 'personality', 'temper']
);

// World lore entry
const worldEntry = LoreEntry.world(
  'world_001',
  'The Ancient Forest',
  'Deep within the ancient forest lies secrets...',
  'ancient_forest',
  LoreUnlockCondition.locationVisited('ancient_forest'),
  5,
  ['forest', 'ancient', 'secrets']
);
```

### Managing Unlock Conditions

```typescript
// Quest flag condition
const questCondition = LoreUnlockCondition.questFlag('forest_cleared');

// Spirit capture condition
const spiritCondition = LoreUnlockCondition.spiritCaptured('water_spirit');

// Sync level condition
const syncCondition = LoreUnlockCondition.syncLevel('fire_spirit', 20);

// Location visited condition
const locationCondition = LoreUnlockCondition.locationVisited('mountain_peak');

// Manual unlock condition
const manualCondition = LoreUnlockCondition.manualUnlock();

// Always available condition
const alwaysCondition = LoreUnlockCondition.alwaysTrue();
```

### Working with Lore Manager

```typescript
const loreManager = new LoreCodexManager();

// Register entries
loreManager.registerLore(mainStoryEntry);
loreManager.registerLore(characterEntry);
loreManager.registerLore(worldEntry);

// Unlock entries
loreManager.unlockLore('story_001');

// Mark as read
loreManager.markLoreAsRead('story_001');

// Get filtered entries
const unlockedEntries = loreManager.getFilteredLoreEntries({
  unlockState: LoreUnlockState.UNLOCKED
});

const mainStoryEntries = loreManager.getFilteredLoreEntries({
  category: LoreCategory.MAIN_STORY
});

const fireRelatedEntries = loreManager.getFilteredLoreEntries({
  relatedSpiritId: 'fire_spirit'
});
```

### Player Context Integration

```typescript
// Create player context
const playerContext: IPlayerContext = {
  hasQuestFlag: (flagId: string) => {
    return gameState.completedQuests.includes(flagId);
  },
  hasCapturedSpirit: (spiritId: string) => {
    return gameState.capturedSpirits.includes(spiritId);
  },
  getSpiritSyncLevel: (spiritId: string) => {
    return gameState.spiritSyncLevels[spiritId] || 0;
  },
  hasVisitedLocation: (locationId: string) => {
    return gameState.visitedLocations.includes(locationId);
  },
  getPlayerLevel: () => gameState.playerLevel,
  getCompletedQuests: () => gameState.completedQuests,
  getUnlockedLocations: () => gameState.visitedLocations,
  getCapturedSpirits: () => gameState.capturedSpirits
};

// Check all unlock conditions
loreManager.getAllLoreEntries().forEach(entry => {
  if (entry.isUnlocked(playerContext)) {
    console.log(`New lore unlocked: ${entry.title}`);
  }
});
```

### Lore Statistics and Progress

```typescript
const stats = loreManager.getStatistics();

console.log(`Total Lore Entries: ${stats.totalEntries}`);
console.log(`Unlocked: ${stats.unlockedEntries}`);
console.log(`Read: ${stats.readEntries}`);
console.log(`Total Words: ${stats.totalWords}`);
console.log(`Average Entry Length: ${stats.averageEntryLength.toFixed(0)} words`);

// Category breakdown
console.log('Entries by Category:');
Object.entries(stats.entriesByCategory).forEach(([category, count]) => {
  if (count > 0) {
    console.log(`  ${category}: ${count}`);
  }
});

// Reading progress
const progress = LoreUtils.getCompletionPercentage(
  stats.totalEntries,
  stats.unlockedEntries,
  stats.readEntries
);

console.log(`Overall Progress: ${progress.overall.toFixed(1)}%`);
console.log(`Unlocked Progress: ${progress.unlocked.toFixed(1)}%`);
console.log(`Reading Progress: ${progress.read.toFixed(1)}%`);
```

## ⚡ Advanced Usage

### Custom Lore Categories

```typescript
// Define custom categories
enum CustomLoreCategory {
  TUTORIAL = 'tutorial',
  LORE_REVEAL = 'lore_reveal',
  SECRET = 'secret'
}

// Create entries with custom categories
const tutorialEntry = new LoreEntry(
  'tutorial_001',
  'How to Play',
  'Welcome to the game...',
  LoreUnlockCondition.alwaysTrue(),
  CustomLoreCategory.TUTORIAL,
  10,
  ['tutorial', 'basics']
);
```

### Complex Unlock Conditions

```typescript
// Combine multiple conditions (requires custom implementation)
class ComplexUnlockCondition implements ILoreUnlockCondition {
  conditionType = LoreConditionType.QUEST_FLAG;
  stringValue = 'complex_condition';

  isMet(playerContext: IPlayerContext, loreEntry: ILoreEntry): boolean {
    // Custom logic combining multiple conditions
    return playerContext.hasQuestFlag('quest_a') &&
           playerContext.hasCapturedSpirit('spirit_b') &&
           playerContext.getSpiritSyncLevel('spirit_c') >= 15;
  }

  validate(): string[] {
    return []; // No validation errors
  }

  getDescription(): string {
    return 'Complete quest A, capture spirit B, reach sync level 15 with spirit C';
  }
}
```

### Lore Search and Filtering

```typescript
// Search entries
const searchResults = loreManager.getFilteredLoreEntries({
  searchText: 'fire',
  limit: 10
});

// Filter by multiple criteria
const filteredEntries = LoreUtils.filterEntries(
  loreManager.getAllLoreEntries(),
  {
    categories: [LoreCategory.MAIN_STORY, LoreCategory.CHARACTER],
    unlockStates: [LoreUnlockState.UNLOCKED, LoreUnlockState.READ],
    minPriority: 5,
    maxPriority: 10,
    tags: ['important', 'story']
  }
);

// Sort entries
const sortedEntries = LoreUtils.sortEntries(
  loreManager.getAllLoreEntries(),
  'priority' // or 'title' or 'unlockTime'
);
```

### Save/Load System Integration

```typescript
// Export lore data
const jsonData = loreManager.exportToJSON();
localStorage.setItem('player_lore_data', jsonData);

// Import lore data
const savedData = localStorage.getItem('player_lore_data');
if (savedData) {
  const importedManager = LoreCodexManager.importFromJSON(savedData);

  // Restore unlock states
  importedManager.getAllLoreEntries().forEach(entry => {
    if (entry.unlockState === LoreUnlockState.UNLOCKED) {
      loreManager.unlockLore(entry.loreId);
    }
    if (entry.unlockState === LoreUnlockState.READ) {
      loreManager.markLoreAsRead(entry.loreId);
    }
  });
}
```

## 📊 API Reference

### Classes

#### `LoreEntry`
Represents a single lore entry with content and unlock conditions.

**Properties:**
- `loreId: string` - Unique identifier
- `title: string` - Display title
- `text: string` - Lore content
- `unlockCondition: ILoreUnlockCondition` - Unlock requirements
- `category: LoreCategory` - Content category
- `unlockState: LoreUnlockState` - Current unlock state
- `priority: number` - Display priority (0-10)
- `tags: string[]` - Content tags for filtering

**Static Methods:**
- `create()` - Create entry with parameters
- `mainStory()` - Create main story entry
- `character()` - Create character entry
- `world()` - Create world entry
- `fromJSON()` - Create from JSON data

**Methods:**
- `isUnlocked(playerContext)` - Check if entry is unlocked
- `markAsRead()` - Mark entry as read
- `isRead()` - Check if entry is read
- `getWordCount()` - Get word count
- `getReadingTimeEstimate()` - Estimate reading time
- `validate()` - Validate entry data

#### `LoreUnlockCondition`
Defines conditions for unlocking lore entries.

**Static Methods:**
- `questFlag(flagId)` - Create quest flag condition
- `spiritCaptured(spiritId)` - Create spirit capture condition
- `syncLevel(spiritId, threshold)` - Create sync level condition
- `locationVisited(locationId)` - Create location visited condition
- `manualUnlock()` - Create manual unlock condition
- `alwaysTrue()` - Create always true condition

**Methods:**
- `isMet(playerContext, loreEntry)` - Check if condition is met
- `getDescription()` - Get human-readable description
- `validate()` - Validate condition configuration

#### `LoreCodexManager`
Manages collection of lore entries and unlock states.

**Methods:**
- `registerLore(entry)` - Register new lore entry
- `getLoreEntry(loreId)` - Get entry by ID
- `getAllLoreEntries()` - Get all entries
- `unlockLore(loreId)` - Unlock specific entry
- `markLoreAsRead(loreId)` - Mark entry as read
- `getFilteredLoreEntries(filter)` - Get filtered entries
- `getStatistics()` - Get comprehensive statistics
- `exportToJSON()` - Export to JSON
- `importFromJSON(jsonData)` - Import from JSON

### Enums

#### `LoreCategory`
- `MAIN_STORY` - Primary storyline
- `SIDE_STORY` - Secondary stories
- `CHARACTER` - Character information
- `WORLD` - World building
- `SPIRIT` - Spirit details
- `LOCATION` - Location information
- `QUEST` - Quest-related lore
- `MYSTERY` - Mysterious content

#### `LoreConditionType`
- `ALWAYS_TRUE` - Always available
- `QUEST_FLAG` - Requires quest flag
- `SPIRIT_CAPTURED` - Requires spirit capture
- `SYNC_LEVEL_REACHED` - Requires sync level
- `LOCATION_VISITED` - Requires location visit
- `MANUAL_UNLOCK` - Requires manual unlock

#### `LoreUnlockState`
- `LOCKED` - Not accessible
- `UNLOCKED` - Available but not read
- `READ` - Has been read

### Utility Functions

#### `LoreUtils.createDefaultPlayerContext()`
Creates default player context for testing.

#### `LoreUtils.validateLoreEntry(entry)`
Validates lore entry data.

#### `LoreUtils.calculateReadingProgress(total, read)`
Calculates reading progress percentage.

#### `LoreUtils.getCategoryStatistics(entries)`
Gets statistics by category.

#### `LoreUtils.filterEntries(entries, filters)`
Filters entries by multiple criteria.

#### `LoreUtils.sortEntries(entries, sortBy?)`
Sorts entries by priority, title, or unlock time.

#### `LoreUtils.getCompletionPercentage(total, unlocked, read)`
Calculates completion percentages.

## ⚙️ Configuration

### Entry Configuration

```typescript
const entry = new LoreEntry(
  'custom_lore_001',
  'Custom Lore Entry',
  'This is a custom lore entry with specific configuration.',
  LoreUnlockCondition.questFlag('special_quest_completed'),
  LoreCategory.MYSTERY,
  8, // High priority
  ['custom', 'special', 'unique'],
  'special_spirit',
  'hidden_location',
  'custom_quest',
  25, // Sync threshold
  { author: 'Game Designer', version: '1.0' }
);
```

### Manager Configuration

```typescript
const loreManager = new LoreCodexManager();

// Register multiple entries
const entries = [
  LoreEntry.mainStory('story_001', 'Beginning', '...', condition1),
  LoreEntry.character('char_001', 'Hero', '...', 'hero_spirit', condition2),
  LoreEntry.world('world_001', 'World', '...', 'main_world', condition3)
];

entries.forEach(entry => loreManager.registerLore(entry));
```

## 🧪 Testing

```typescript
import {
  LoreCodexManager,
  LoreEntry,
  LoreUnlockCondition,
  LoreUtils,
  LoreCategory,
  LoreConditionType
} from 'miff-lorepure';

// Create test manager
const loreManager = new LoreCodexManager();

// Create test entries
const entry1 = LoreEntry.mainStory(
  'test_001',
  'Test Entry 1',
  'This is a test entry for unit testing.',
  LoreUnlockCondition.alwaysTrue(),
  5,
  ['test']
);

const entry2 = LoreEntry.character(
  'test_002',
  'Test Character',
  'Character lore for testing.',
  'test_spirit',
  LoreUnlockCondition.spiritCaptured('test_spirit'),
  3,
  ['character', 'test']
);

// Register entries
loreManager.registerLore(entry1);
loreManager.registerLore(entry2);

// Test filtering
const mainStoryEntries = loreManager.getFilteredLoreEntries({
  category: LoreCategory.MAIN_STORY
});

expect(mainStoryEntries).toHaveLength(1);
expect(mainStoryEntries[0].loreId).toBe('test_001');

// Test unlock conditions
const playerContext = LoreUtils.createDefaultPlayerContext();
playerContext.captureSpirit('test_spirit');

expect(entry2.isUnlocked(playerContext)).toBe(true);

// Test statistics
const stats = loreManager.getStatistics();
expect(stats.totalEntries).toBe(2);
expect(stats.unlockedEntries).toBe(1);
```

## 🔍 Integration Examples

### Game Progression System

```typescript
class GameProgressionSystem {
  private loreManager: LoreCodexManager;
  private playerContext: IPlayerContext;

  constructor() {
    this.loreManager = new LoreCodexManager();
    this.playerContext = this.createPlayerContext();
    this.initializeLoreEntries();
  }

  private createPlayerContext(): IPlayerContext {
    return {
      hasQuestFlag: (flagId) => gameState.completedQuests.includes(flagId),
      hasCapturedSpirit: (spiritId) => gameState.capturedSpirits.includes(spiritId),
      getSpiritSyncLevel: (spiritId) => gameState.spiritSyncLevels[spiritId] || 0,
      hasVisitedLocation: (locationId) => gameState.visitedLocations.includes(locationId),
      getPlayerLevel: () => gameState.playerLevel,
      getCompletedQuests: () => gameState.completedQuests,
      getUnlockedLocations: () => gameState.visitedLocations,
      getCapturedSpirits: () => gameState.capturedSpirits
    };
  }

  private initializeLoreEntries(): void {
    // Create and register lore entries based on game content
    const loreEntries = this.createLoreEntries();
    loreEntries.forEach(entry => this.loreManager.registerLore(entry));
  }

  onQuestCompleted(questId: string): void {
    // Mark quest flag
    if (this.playerContext.hasQuestFlag) {
      // Quest flag handling
    }

    // Check for newly unlocked lore
    this.checkForNewLoreUnlocks();
  }

  onSpiritCaptured(spiritId: string): void {
    // Update player context
    if (this.playerContext.captureSpirit) {
      this.playerContext.captureSpirit(spiritId);
    }

    // Check for newly unlocked lore
    this.checkForNewLoreUnlocks();
  }

  onLocationVisited(locationId: string): void {
    // Update player context
    if (this.playerContext.visitLocation) {
      this.playerContext.visitLocation(locationId);
    }

    // Check for newly unlocked lore
    this.checkForNewLoreUnlocks();
  }

  private checkForNewLoreUnlocks(): void {
    const allEntries = this.loreManager.getAllLoreEntries();
    const newlyUnlocked: string[] = [];

    allEntries.forEach(entry => {
      if (entry.unlockState === LoreUnlockState.LOCKED && entry.isUnlocked(this.playerContext)) {
        newlyUnlocked.push(entry.title);
        this.loreManager.unlockLore(entry.loreId);
      }
    });

    if (newlyUnlocked.length > 0) {
      console.log('New lore unlocked:');
      newlyUnlocked.forEach(title => console.log(`  📖 ${title}`));
    }
  }

  getLoreProgress(): { percentage: number; newlyUnlocked: string[] } {
    const stats = this.loreManager.getStatistics();
    const progress = LoreUtils.getCompletionPercentage(
      stats.totalEntries,
      stats.unlockedEntries,
      stats.readEntries
    );

    return {
      percentage: progress.overall,
      newlyUnlocked: [] // Track newly unlocked entries
    };
  }

  getAvailableLore(): LoreEntry[] {
    return this.loreManager.getFilteredLoreEntries({
      unlockState: LoreUnlockState.UNLOCKED
    });
  }

  markLoreAsRead(loreId: string): void {
    this.loreManager.markLoreAsRead(loreId);
  }

  exportLoreData(): string {
    return this.loreManager.exportToJSON();
  }

  importLoreData(jsonData: string): void {
    this.loreManager = LoreCodexManager.importFromJSON(jsonData);
  }
}
```

### UI Integration

```typescript
class LoreUI {
  private loreManager: LoreCodexManager;
  private currentFilter: ILoreFilter = {};

  constructor(loreManager: LoreCodexManager) {
    this.loreManager = loreManager;
  }

  renderLoreList(): void {
    const entries = this.loreManager.getFilteredLoreEntries(this.currentFilter);

    console.log('Lore Entries:');
    entries.forEach((entry, index) => {
      const statusIcon = entry.unlockState === LoreUnlockState.LOCKED ? '🔒' :
                        entry.unlockState === LoreUnlockState.UNLOCKED ? '🔓' : '📖';
      const categoryIcon = this.getCategoryIcon(entry.category);

      console.log(`${index + 1}. ${statusIcon} ${categoryIcon} ${entry.title}`);

      if (entry.unlockState === LoreUnlockState.LOCKED) {
        console.log(`   Locked: ${entry.unlockCondition.getDescription()}`);
      }
    });
  }

  renderLoreDetails(loreId: string): void {
    const entry = this.loreManager.getLoreEntry(loreId);
    if (!entry) {
      console.log('Lore entry not found');
      return;
    }

    console.log(`Title: ${entry.title}`);
    console.log(`Category: ${entry.category}`);
    console.log(`Status: ${entry.unlockState}`);
    console.log(`Words: ${entry.getWordCount()}`);
    console.log('');
    console.log(entry.text);

    if (entry.unlockState === LoreUnlockState.LOCKED) {
      console.log('');
      console.log('Unlock Condition:');
      console.log(entry.unlockCondition.getDescription());
    }
  }

  setFilter(filter: ILoreFilter): void {
    this.currentFilter = filter;
  }

  getFilterOptions(): { categories: LoreCategory[], states: LoreUnlockState[] } {
    return {
      categories: Object.values(LoreCategory),
      states: Object.values(LoreUnlockState)
    };
  }

  private getCategoryIcon(category: LoreCategory): string {
    switch (category) {
      case LoreCategory.MAIN_STORY: return '📜';
      case LoreCategory.CHARACTER: return '👤';
      case LoreCategory.WORLD: return '🌍';
      case LoreCategory.SPIRIT: return '👻';
      case LoreCategory.QUEST: return '⚔️';
      default: return '📄';
    }
  }

  renderStatistics(): void {
    const stats = this.loreManager.getStatistics();
    const progress = LoreUtils.getCompletionPercentage(
      stats.totalEntries,
      stats.unlockedEntries,
      stats.readEntries
    );

    console.log('Lore Statistics:');
    console.log(`Total: ${stats.totalEntries}`);
    console.log(`Unlocked: ${stats.unlockedEntries} (${progress.unlocked.toFixed(1)}%)`);
    console.log(`Read: ${stats.readEntries} (${progress.read.toFixed(1)}%)`);
    console.log(`Overall: ${progress.overall.toFixed(1)}%`);
    console.log(`Total Words: ${stats.totalWords.toLocaleString()}`);
  }
}
```

## 📈 Performance

- **Memory Efficient**: Optimized storage of lore entries and metadata
- **Fast Filtering**: O(n) filtering with early termination optimizations
- **Minimal Overhead**: Lightweight condition checking and state management
- **Scalable**: Handles large numbers of lore entries efficiently
- **JSON Serialization**: Fast export/import with minimal processing

## 🔒 Security

- **Input Validation**: All lore entries and conditions validated before storage
- **Safe Deserialization**: Protected JSON import with type checking
- **Immutable State**: Lore entries are immutable once created
- **Type Safety**: Full TypeScript coverage prevents runtime errors

## 🤝 Contributing

Contributions are welcome! Please see the main MIFF repository for guidelines.

## 📝 License

MIT License - see LICENSE file for details.

## 🔄 Migration from C#

LorePure is a TypeScript conversion of the original C# implementation. Key differences:

- **Type Safety**: Enhanced with TypeScript interfaces and validation
- **Immutability**: Lore entries are immutable for thread safety
- **Advanced Filtering**: Enhanced filtering and search capabilities
- **Progress Tracking**: Comprehensive reading progress and statistics
- **Export Formats**: JSON export/import for save/load functionality
- **Utility Functions**: Enhanced utility functions for common operations

The core lore management functionality remains identical to ensure compatibility with existing C# implementations.