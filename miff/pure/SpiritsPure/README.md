# SpiritsPure

A comprehensive **spirit collection management system** with advanced filtering, sorting, and spirit (creature) management capabilities. Features SpiritDex functionality for managing creature collections with type effectiveness, evolution tracking, sync levels, and comprehensive metadata.

## ✨ Features

- **Advanced Spirit Management**: Complete spirit lifecycle management with capture, release, and evolution
- **Flexible Filtering**: Multi-criteria filtering by type, sync level, evolution status, rarity, and more
- **Comprehensive Sorting**: Multiple sort options including alphabetical, sync level, rarity, level, and capture date
- **Type Effectiveness System**: Built-in type effectiveness calculations for battle mechanics
- **Evolution Tracking**: Complete evolution system with requirements and stage management
- **Sync Level System**: Bond tracking between spirits and trainers (0-100%)
- **Lore System**: Comprehensive lore entries with unlockable content
- **Statistics Tracking**: Detailed collection statistics and completion tracking
- **Collection Analytics**: Completion percentages by type, rarity, region, and generation
- **Search Functionality**: Full-text search across spirit names and descriptions
- **Favorites System**: Mark and filter favorite spirits
- **Performance Optimized**: Efficient filtering and sorting for large collections
- **Data Integrity**: Comprehensive validation and error checking
- **Export/Import**: Full collection serialization and deserialization

## 📦 Installation

```bash
npm install miff-spirits-pure
```

## 🚀 Quick Start

```typescript
import {
  Spirit,
  SpiritCollection,
  SpiritFilter,
  SpiritSorter,
  SpiritUtils,
  SpiritType,
  SpiritRarity,
  SortOption
} from 'miff-spirits-pure';

// Create spirit collection
const collection = new SpiritCollection();

// Create spirit
const fireSpirit = Spirit.create(
  'fire_dragon_001',
  'Fire Dragon',
  'A majestic fire-breathing dragon',
  SpiritType.FIRE,
  SpiritType.DRAGON,
  SpiritRarity.LEGENDARY
);

// Configure spirit
fireSpirit.level = 50;
fireSpirit.syncLevel = 85;
fireSpirit.stats = {
  hp: 150,
  attack: 120,
  defense: 90,
  specialAttack: 140,
  specialDefense: 100,
  speed: 110
};

// Add to collection
collection.addSpirit(fireSpirit);

// Create filter for high-sync fire spirits
const filter = SpiritFilter.byType(SpiritType.FIRE);
filter.minSync = 50;

// Apply filter
const fireSpirits = collection.filterSpirits(filter);

// Sort by sync level
const sorter = new SpiritSorter();
const sortedSpirits = sorter.sort(fireSpirits, SortOption.SYNC_DESC);

console.log(`Found ${fireSpirits.length} high-sync fire spirits`);
console.log(`Top spirit: ${sortedSpirits[0]?.spiritName} (${sortedSpirits[0]?.syncLevel}% sync)`);

// Get collection statistics
const stats = collection.getStatistics();
console.log(`Collection: ${stats.captured}/${stats.total} spirits captured (${stats.completionPercentage.toFixed(1)}%)`);
```

## 📚 Core Concepts

### Spirit Types

SpiritsPure supports 28 different spirit types:

- **Basic Types**: Fire, Water, Grass, Electric, Psychic, Ice, Dragon, Dark, Fairy
- **Physical Types**: Normal, Fighting, Poison, Ground, Flying, Bug, Rock, Ghost, Steel
- **Special Types**: Light, Shadow, Time, Space, Sound, Chaos, Order, Life, Death, Balance

### Rarity System

- **Common** (⚪): Basic spirits found everywhere
- **Uncommon** (🟢): Slightly rarer spirits
- **Rare** (🔵): Hard-to-find spirits
- **Epic** (🟣): Very rare and powerful spirits
- **Legendary** (🟡): Extremely rare spirits with unique abilities
- **Mythical** (🟠): Ultra-rare spirits with legendary status
- **Unique** (🔴): One-of-a-kind spirits

### Sync Level System

Sync levels represent the bond between spirit and trainer:

- **0-10**: Just Met - New friendship
- **10-30**: Growing Bond - Developing relationship
- **30-50**: Good Connection - Solid partnership
- **50-70**: Strong Bond - Trusted companions
- **70-90**: Excellent Harmony - Deep connection
- **90-100**: Perfect Harmony - Soul-bound partners

### Evolution Stages

- **Stage 1**: Base form (unevolved)
- **Stage 2**: First evolution
- **Stage 3**: Second evolution
- **Stage 4+**: Mega evolutions, special forms

## 🔧 Basic Usage

### Creating Spirits

```typescript
// Create basic spirit
const spirit = Spirit.create(
  'water_spirit_001',
  'Aqua Sprite',
  'A playful water spirit that loves to swim',
  SpiritType.WATER,
  undefined,
  SpiritRarity.UNCOMMON
);

// Configure spirit properties
spirit.level = 25;
spirit.experience = 5000;
spirit.maxExperience = 6000;
spirit.syncLevel = 65;

// Set stats
spirit.stats = {
  hp: 120,
  attack: 60,
  defense: 70,
  specialAttack: 90,
  specialDefense: 80,
  speed: 85
};

// Add abilities
spirit.abilities = ['Water Absorb', 'Swift Swim'];
spirit.hiddenAbilities = ['Hydration'];

// Set physical characteristics
spirit.height = 1.2; // meters
spirit.weight = 25.0; // kilograms
spirit.habitat = ['ocean', 'lake', 'river'];
spirit.region = 'johto';
spirit.generation = 2;

// Set evolution data
spirit.evolutionStage = 1;
spirit.evolutions = [{
  id: 'aqua_sprite_evolution',
  name: 'Aqua Nymph',
  level: 30,
  evolvesTo: 'aqua_nymph_001'
}];

// Add moves
spirit.moves = [
  {
    id: 'water_gun',
    name: 'Water Gun',
    description: 'Squirts water to attack',
    type: SpiritType.WATER,
    category: 'special',
    power: 40,
    accuracy: 100,
    pp: 25,
    priority: 0,
    effects: ['none'],
    target: 'single',
    contact: false,
    soundBased: false,
    punchBased: false,
    snatchable: false,
    gravityAffected: true,
    defrostsTarget: false,
    bites: false,
    pulses: false,
    ballistic: false,
    dance: false,
    wind: false
  }
];
```

### Managing Collections

```typescript
const collection = new SpiritCollection();

// Add spirits
collection.addSpirit(fireSpirit);
collection.addSpirit(waterSpirit);
collection.addSpirit(grassSpirit);

// Update spirit
collection.updateSpirit('fire_spirit_001', {
  level: 45,
  syncLevel: 78,
  isFavorite: true
});

// Remove spirit
collection.removeSpirit('water_spirit_001');

// Check if spirit exists
if (collection.hasSpirit('grass_spirit_001')) {
  console.log('Grass spirit is in collection');
}
```

### Filtering Spirits

```typescript
// Create filter
const filter = SpiritFilter.create();

// Filter by type
filter.type = SpiritType.FIRE;

// Filter by sync level
filter.minSync = 50;
filter.maxSync = 100;

// Filter by capture status
filter.captured = true;

// Filter by evolution status
filter.hasEvolved = false; // Only unevolved spirits

// Filter by level range
filter.minLevel = 20;
filter.maxLevel = 50;

// Filter by rarity
filter.rarity = SpiritRarity.LEGENDARY;

// Filter by name
filter.nameContains = 'dragon';

// Apply filter
const filteredSpirits = collection.filterSpirits(filter);
console.log(`Found ${filteredSpirits.length} matching spirits`);
```

### Sorting Spirits

```typescript
const sorter = new SpiritSorter();

// Sort by name
const byName = sorter.sort(collection.spirits, SortOption.ALPHABETICAL_ASC);

// Sort by sync level (descending)
const bySync = sorter.sort(collection.spirits, SortOption.SYNC_DESC);

// Sort by rarity (descending)
const byRarity = sorter.sort(collection.spirits, SortOption.RARITY_DESC);

// Sort by level (ascending)
const byLevel = sorter.sort(collection.spirits, SortOption.LEVEL_ASC);

// Multiple criteria sorting
const byMultipleCriteria = sorter.sortByCriteria(collection.spirits, {
  primarySort: SortOption.RARITY_DESC,
  secondarySort: SortOption.SYNC_DESC,
  tertiarySort: SortOption.LEVEL_DESC,
  ascending: false
});
```

### Searching Spirits

```typescript
// Search by name or description
const searchResults = collection.searchSpirits('fire dragon');
console.log(`Found ${searchResults.length} spirits matching "fire dragon"`);

// Search is case-insensitive and searches multiple fields
const moreResults = collection.searchSpirits('legendary');
console.log(`Found ${moreResults.length} legendary spirits`);
```

### Capture and Release

```typescript
// Capture spirit
const spirit = collection.getSpirit('wild_spirit_001');
if (spirit && !spirit.isCaptured) {
  spirit.isCaptured = true;
  spirit.captureDate = new Date();
  spirit.captureLevel = spirit.level;
  spirit.captureLocation = 'mystic_forest';
  spirit.syncLevel = Math.floor(Math.random() * 100); // Random sync level

  console.log(`Captured ${spirit.spiritName}! Sync level: ${spirit.syncLevel}%`);
}

// Release spirit
if (spirit && spirit.isCaptured) {
  spirit.isCaptured = false;
  spirit.captureDate = undefined;
  spirit.captureLocation = undefined;
  spirit.captureLevel = undefined;

  console.log(`Released ${spirit.spiritName} back into the wild`);
}
```

## 📊 Advanced Usage

### Collection Statistics

```typescript
const stats = collection.getStatistics();

console.log('Collection Overview:');
console.log(`- Total Spirits: ${stats.total}`);
console.log(`- Captured: ${stats.captured} (${stats.completionPercentage.toFixed(1)}%)`);
console.log(`- Uncaptured: ${stats.uncaptured}`);
console.log(`- Favorites: ${stats.favorites}`);
console.log(`- Average Level: ${stats.averageLevel.toFixed(1)}`);
console.log(`- Average Sync: ${stats.averageSync.toFixed(1)}%`);
console.log(`- Highest Level: ${stats.highestLevel}`);
console.log(`- Highest Sync: ${stats.highestSync}%`);
console.log(`- Unique Types: ${stats.totalTypes}`);
console.log(`- Unique Rarities: ${stats.uniqueRarities}`);
console.log(`- Unique Regions: ${stats.uniqueRegions}`);
console.log(`- Unique Generations: ${stats.uniqueGenerations}`);
console.log(`- Evolved Spirits: ${stats.evolvedCount}`);
console.log(`- Unevolved Spirits: ${stats.unevolvedCount}`);
```

### Completion Tracking

```typescript
// Get completion by type
const typeCompletion = collection.getCompletionByType();
console.log('Completion by Type:');
Object.entries(typeCompletion).forEach(([type, stats]) => {
  if (stats.total > 0) {
    console.log(`${type}: ${stats.captured}/${stats.total} (${stats.percentage.toFixed(1)}%)`);
  }
});

// Get completion by rarity
const rarityCompletion = collection.getCompletionByRarity();
console.log('Completion by Rarity:');
Object.entries(rarityCompletion).forEach(([rarity, stats]) => {
  if (stats.total > 0) {
    console.log(`${rarity}: ${stats.captured}/${stats.total} (${stats.percentage.toFixed(1)}%)`);
  }
});
```

### Type Effectiveness System

```typescript
// Calculate type effectiveness
const effectiveness = SpiritUtils.calculateTypeEffectiveness(
  SpiritType.FIRE,  // Attacking type
  SpiritType.GRASS  // Defending type
);

console.log(`Fire vs Grass: ${effectiveness}x effectiveness`);
// Output: Fire vs Grass: 2x effectiveness (super effective)

// Check spirit's effectiveness against types
const fireSpirit = collection.getSpirit('fire_dragon_001');
if (fireSpirit) {
  const vsWater = fireSpirit.getTypeEffectiveness(SpiritType.WATER);
  const vsGrass = fireSpirit.getTypeEffectiveness(SpiritType.GRASS);
  const vsFire = fireSpirit.getTypeEffectiveness(SpiritType.FIRE);

  console.log(`${fireSpirit.spiritName} effectiveness:`);
  console.log(`  vs Water: ${vsWater}x`);
  console.log(`  vs Grass: ${vsGrass}x`);
  console.log(`  vs Fire: ${vsFire}x`);
}
```

### Evolution System

```typescript
const spirit = collection.getSpirit('baby_dragon_001');

if (spirit) {
  console.log(`Current stage: ${spirit.evolutionStage}`);

  if (spirit.canEvolve()) {
    const nextEvolution = spirit.getNextEvolution();
    if (nextEvolution) {
      console.log(`Can evolve to: ${nextEvolution.name}`);
      console.log(`Requirements:`);
      console.log(`  - Level: ${nextEvolution.level}`);
      if (nextEvolution.item) {
        console.log(`  - Item: ${nextEvolution.item}`);
      }
      if (nextEvolution.location) {
        console.log(`  - Location: ${nextEvolution.location}`);
      }
      if (nextEvolution.timeOfDay) {
        console.log(`  - Time: ${nextEvolution.timeOfDay}`);
      }
    }
  } else {
    console.log('Spirit cannot evolve further');
  }
}
```

### Lore System

```typescript
const spirit = collection.getSpirit('ancient_spirit_001');

if (spirit) {
  // Get all lore IDs
  const loreIds = spirit.getAllLoreIds();
  console.log(`Spirit has ${loreIds.length} lore entries`);

  // Check specific lore
  const loreId = loreIds[0];
  if (spirit.isLoreUnlocked(loreId)) {
    const lore = spirit.getLoreEntry(loreId);
    if (lore) {
      console.log(`Lore: ${lore.title}`);
      console.log(`Category: ${lore.category}`);
      console.log(`Author: ${lore.author}`);
      console.log(`Rating: ${lore.rating}/5 stars`);
    }
  } else {
    console.log('Lore is locked');
    // Try to unlock
    if (spirit.unlockLore(loreId)) {
      console.log('Lore unlocked!');
    }
  }
}
```

## ⚡ CLI Usage

SpiritsPure includes a comprehensive CLI for interactive testing:

```bash
# Start the CLI
npx spirits-pure-cli

# CLI Commands:
list [filter]        # List spirits with optional filter
add [name]          # Add new spirit
remove [id]         # Remove spirit by ID
search [query]      # Search spirits by name/description
filter [type]       # Apply filter (captured, fire, legendary, etc.)
sort [option]       # Sort spirits (alpha, sync, rarity, level)
capture [id]        # Mark spirit as captured
release [id]        # Mark spirit as uncaptured
favorite [id]       # Toggle favorite status
stats               # Show collection statistics
completion          # Show completion statistics
info [id]           # Show detailed spirit info
demo                # Reset to demo data
```

## 📈 API Reference

### Classes

#### `Spirit`
Represents a single spirit with all its properties and behaviors.

**Constructor:**
```typescript
new Spirit(spiritId, spiritName, description, primaryType, secondaryType?, rarity?)
```

**Static Methods:**
- `create(spiritId, spiritName, description, primaryType, secondaryType?, rarity?)` - Create spirit
- `fromJSON(data)` - Create from JSON data

**Methods:**
- `validate()` - Validate spirit data
- `computeExperienceForLevel(level)` - Calculate experience for level
- `canEvolve()` - Check if spirit can evolve
- `getNextEvolution()` - Get next evolution
- `getEffectiveStats()` - Get stats with level scaling
- `getTypeEffectiveness(attackingType)` - Get type effectiveness
- `hasMove(moveId)` - Check if spirit knows move
- `learnMove(move)` - Learn new move
- `forgetMove(moveId)` - Forget move
- `getMoveById(moveId)` - Get move by ID
- `getLoreEntry(loreId)` - Get lore entry
- `unlockLore(loreId)` - Unlock lore
- `isLoreUnlocked(loreId)` - Check if lore is unlocked
- `getAllLoreIds()` - Get all lore IDs
- `getUnlockedLoreIds()` - Get unlocked lore IDs
- `clone()` - Create deep copy
- `toJSON()` - Convert to JSON

#### `SpiritCollection`
Manages collections of spirits with filtering, sorting, and analytics.

**Constructor:**
```typescript
new SpiritCollection(spirits?)
```

**Static Methods:**
- `create(spirits?)` - Create collection

**Methods:**
- `addSpirit(spirit)` - Add spirit to collection
- `removeSpirit(spiritId)` - Remove spirit from collection
- `getSpirit(spiritId)` - Get spirit by ID
- `hasSpirit(spiritId)` - Check if spirit exists
- `updateSpirit(spiritId, updates)` - Update spirit
- `getSpiritsByType(type)` - Get spirits by type
- `getSpiritsByRarity(rarity)` - Get spirits by rarity
- `getSpiritsByRegion(region)` - Get spirits by region
- `getSpiritsByGeneration(generation)` - Get spirits by generation
- `getSpiritsBySyncLevel(min, max)` - Get spirits by sync range
- `getSpiritsByLevel(min, max)` - Get spirits by level range
- `getEvolvedSpirits()` - Get evolved spirits
- `getUnevolvedSpirits()` - Get unevolved spirits
- `searchSpirits(query)` - Search spirits
- `sortSpirits(sortOption, ascending?)` - Sort spirits
- `filterSpirits(filter)` - Filter spirits
- `getStatistics()` - Get collection statistics
- `getCompletionByType()` - Get completion by type
- `getCompletionByRarity()` - Get completion by rarity
- `exportCollection()` - Export collection data
- `importCollection(data)` - Import collection data
- `validateCollection()` - Validate entire collection

#### `SpiritFilter`
Handles filtering of spirit collections.

**Constructor:**
```typescript
new SpiritFilter(type?, captured?, minSync?, maxSync?, loreUnlocked?, hasEvolved?, minLevel?, maxLevel?, rarity?, nameContains?, hasMoves?, isFavorite?, region?, generation?)
```

**Static Methods:**
- `create(...)` - Create filter with parameters
- `capturedOnly()` - Filter for captured spirits only
- `uncapturedOnly()` - Filter for uncaptured spirits only
- `byType(type)` - Filter by spirit type
- `bySyncLevel(min, max)` - Filter by sync level range
- `byLevel(min, max)` - Filter by level range
- `byRarity(rarity)` - Filter by rarity
- `byRegion(region)` - Filter by region
- `byGeneration(generation)` - Filter by generation
- `favoritesOnly()` - Filter for favorites only
- `evolvedOnly()` - Filter for evolved spirits only
- `unevolvedOnly()` - Filter for unevolved spirits only

**Methods:**
- `apply(spirits, spiritIdToSync?, unlockedLoreIds?)` - Apply filter
- `getDescription()` - Get filter description
- `clone()` - Clone filter
- `isEmpty()` - Check if filter is empty
- `reset()` - Reset filter to empty
- `toJSON()` - Convert to JSON
- `fromJSON(data)` - Create from JSON

#### `SpiritSorter`
Handles sorting of spirit collections.

**Methods:**
- `sort(spirits, sortOption, ascending?, spiritIdToSync?, spiritIdToCaptureDate?)` - Sort spirits
- `sortByCriteria(spirits, criteria, spiritIdToSync?, spiritIdToCaptureDate?)` - Sort by multiple criteria
- `getSortDescription(sortOption)` - Get sort description

### Interfaces

#### `ISpirit`
Spirit interface with all properties and methods.

#### `ISpiritCollection`
Spirit collection interface.

#### `ISpiritFilter`
Spirit filter interface.

#### `ISpiritStats`
Spirit statistics interface.

#### `ISpiritMove`
Spirit move interface.

#### `ISpiritEvolution`
Spirit evolution interface.

#### `ISpiritLore`
Spirit lore interface.

### Enums

#### `SpiritType`
All available spirit types (28 types).

#### `SpiritRarity`
Spirit rarity levels (7 levels).

#### `SortOption`
Available sort options (10 options).

## ⚙️ Configuration

### Custom Spirit Types

```typescript
// Add custom spirit types
const customTypes = {
  [SpiritType.CRYSTAL]: '💎',
  [SpiritType.METAL]: '⚙️',
  [SpiritType.WOOD]: '🌳'
};

// Use in type effectiveness calculations
const effectiveness = SpiritUtils.calculateTypeEffectiveness(
  SpiritType.CRYSTAL,
  SpiritType.METAL
);
```

### Custom Rarity System

```typescript
// Create custom rarity levels
const customRarities = {
  [SpiritRarity.BASIC]: '⚪',
  [SpiritRarity.ADVANCED]: '🟢',
  [SpiritRarity.EXPERT]: '🔵',
  [SpiritRarity.MASTER]: '🟣'
};

// Use in filtering
const filter = SpiritFilter.byRarity(SpiritRarity.MASTER);
```

## 🧪 Testing

```typescript
import {
  Spirit,
  SpiritCollection,
  SpiritFilter,
  SpiritSorter,
  SpiritUtils,
  SpiritType,
  SpiritRarity
} from 'miff-spirits-pure';

// Create test collection
const collection = SpiritUtils.createDemoCollection();

// Validate collection
const errors = collection.validateCollection();
expect(errors).toHaveLength(0);

// Test filtering
const fireFilter = SpiritFilter.byType(SpiritType.FIRE);
const fireSpirits = collection.filterSpirits(fireFilter);
expect(fireSpirits.length).toBeGreaterThan(0);

// Test sorting
const sorter = new SpiritSorter();
const sortedByRarity = sorter.sort(collection.spirits, SortOption.RARITY_DESC);
const sortedBySync = sorter.sort(collection.spirits, SortOption.SYNC_DESC);

// Test statistics
const stats = collection.getStatistics();
expect(stats.total).toBeGreaterThan(0);
expect(stats.completionPercentage).toBeGreaterThanOrEqual(0);
expect(stats.completionPercentage).toBeLessThanOrEqual(100);

// Test type effectiveness
const effectiveness = SpiritUtils.calculateTypeEffectiveness(
  SpiritType.FIRE,
  SpiritType.GRASS
);
expect(effectiveness).toBe(2); // Fire is super effective against Grass
```

## 🔍 Integration Examples

### Game Integration

```typescript
class SpiritGame {
  private collection: SpiritCollection;
  private saveManager: any; // Your save manager

  constructor() {
    this.collection = new SpiritCollection();
    this.loadGameData();
  }

  private async loadGameData(): Promise<void> {
    try {
      // Load from save file
      const saveData = await this.saveManager.loadGame('./spirits_save.json');

      if (saveData.success && saveData.collection) {
        this.collection = saveData.collection;
      } else {
        // Create new collection with starter spirits
        this.initializeStarterSpirits();
      }
    } catch (error) {
      console.error('Failed to load game data:', error);
      this.initializeStarterSpirits();
    }
  }

  private initializeStarterSpirits(): void {
    // Add starter spirits
    const fireStarter = Spirit.create(
      'fire_starter',
      'Ember',
      'A small fire spirit that grows with experience',
      SpiritType.FIRE,
      undefined,
      SpiritRarity.COMMON
    );

    const waterStarter = Spirit.create(
      'water_starter',
      'Aqua',
      'A gentle water spirit with healing abilities',
      SpiritType.WATER,
      undefined,
      SpiritRarity.COMMON
    );

    this.collection.addSpirit(fireStarter);
    this.collection.addSpirit(waterStarter);
  }

  async captureSpirit(spiritId: string): Promise<void> {
    const spirit = this.collection.getSpirit(spiritId);

    if (spirit && !spirit.isCaptured) {
      spirit.isCaptured = true;
      spirit.captureDate = new Date();
      spirit.syncLevel = this.calculateSyncLevel(spirit);

      console.log(`Captured ${spirit.spiritName}!`);
      await this.saveGame();
    }
  }

  private calculateSyncLevel(spirit: ISpirit): number {
    // Complex sync level calculation based on spirit properties
    const baseSync = 50;
    const typeBonus = spirit.primaryType === SpiritType.FIRE ? 10 : 0;
    const rarityBonus = (spirit.rarity - 1) * 5;

    return Math.min(100, baseSync + typeBonus + rarityBonus + Math.floor(Math.random() * 20));
  }

  async saveGame(): Promise<void> {
    try {
      await this.saveManager.saveGame(this.collection, './spirits_save.json');
      console.log('Game saved successfully');
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }

  getSpiritsForBattle(): ISpirit[] {
    return this.collection.capturedSpirits.slice(0, 6); // Max 6 spirits per battle
  }

  getCompletionPercentage(): number {
    return this.collection.completionPercentage;
  }

  searchSpirits(query: string): ISpirit[] {
    return this.collection.searchSpirits(query);
  }

  filterSpirits(filter: ISpiritFilter): ISpirit[] {
    return this.collection.filterSpirits(filter);
  }
}
```

### UI Integration

```typescript
class SpiritsUI {
  private collection: SpiritCollection;
  private container: HTMLElement;

  constructor(collection: SpiritCollection, containerId: string) {
    this.collection = collection;
    this.container = document.getElementById(containerId)!;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = '';

    // Render statistics
    this.renderStatistics();

    // Render filters
    this.renderFilters();

    // Render spirit list
    this.renderSpiritList();
  }

  private renderStatistics(): void {
    const stats = this.collection.getStatistics();
    const statsDiv = document.createElement('div');
    statsDiv.className = 'spirit-stats';
    statsDiv.innerHTML = `
      <h3>Collection Statistics</h3>
      <p>Total: ${stats.total} | Captured: ${stats.captured} (${stats.completionPercentage.toFixed(1)}%)</p>
      <p>Average Level: ${stats.averageLevel.toFixed(1)} | Average Sync: ${stats.averageSync.toFixed(1)}%</p>
    `;
    this.container.appendChild(statsDiv);
  }

  private renderFilters(): void {
    const filtersDiv = document.createElement('div');
    filtersDiv.className = 'spirit-filters';

    const filterButtons = [
      { label: 'All', filter: SpiritFilter.create() },
      { label: 'Captured', filter: SpiritFilter.capturedOnly() },
      { label: 'Fire', filter: SpiritFilter.byType(SpiritType.FIRE) },
      { label: 'Legendary', filter: SpiritFilter.byRarity(SpiritRarity.LEGENDARY) },
      { label: 'High Sync', filter: SpiritFilter.bySyncLevel(70, 100) }
    ];

    filterButtons.forEach(({ label, filter }) => {
      const button = document.createElement('button');
      button.textContent = label;
      button.onclick = () => this.applyFilter(filter);
      filtersDiv.appendChild(button);
    });

    this.container.appendChild(filtersDiv);
  }

  private renderSpiritList(): void {
    const listDiv = document.createElement('div');
    listDiv.className = 'spirit-list';

    const spirits = this.collection.sortSpirits(SortOption.ALPHABETICAL_ASC);

    spirits.forEach(spirit => {
      const spiritDiv = document.createElement('div');
      spiritDiv.className = `spirit-item ${spirit.isCaptured ? 'captured' : 'uncaptured'}`;
      spiritDiv.innerHTML = `
        <div class="spirit-icon">${this.getTypeIcon(spirit.primaryType)}</div>
        <div class="spirit-info">
          <h4>${spirit.spiritName}</h4>
          <p>${spirit.getTypeDescription()} | ${spirit.getRarityDescription()}</p>
          <p>Level ${spirit.level} | Sync ${spirit.syncLevel}%</p>
          ${spirit.isCaptured ? '<span class="captured-badge">Captured</span>' : '<span class="uncaptured-badge">Wild</span>'}
        </div>
      `;

      if (!spirit.isCaptured) {
        spiritDiv.onclick = () => this.attemptCapture(spirit);
      }

      listDiv.appendChild(spiritDiv);
    });

    this.container.appendChild(listDiv);
  }

  private applyFilter(filter: ISpiritFilter): void {
    const filtered = this.collection.filterSpirits(filter);
    // Update UI to show filtered results
    console.log(`Filtered to ${filtered.length} spirits`);
  }

  private attemptCapture(spirit: ISpirit): void {
    // Capture logic would go here
    console.log(`Attempting to capture ${spirit.spiritName}...`);
  }

  private getTypeIcon(type: SpiritType): string {
    const icons: Record<SpiritType, string> = {
      [SpiritType.FIRE]: '🔥',
      [SpiritType.WATER]: '💧',
      [SpiritType.GRASS]: '🌱',
      [SpiritType.ELECTRIC]: '⚡',
      [SpiritType.ICE]: '❄️',
      [SpiritType.DRAGON]: '🐉',
      [SpiritType.DARK]: '🌑',
      [SpiritType.FAIRY]: '🧚',
      [SpiritType.NORMAL]: '⚪',
      [SpiritType.FIGHTING]: '🥊',
      [SpiritType.POISON]: '☠️',
      [SpiritType.GROUND]: '🌍',
      [SpiritType.FLYING]: '🕊️',
      [SpiritType.BUG]: '🐛',
      [SpiritType.ROCK]: '🪨',
      [SpiritType.GHOST]: '👻',
      [SpiritType.STEEL]: '⚙️',
      [SpiritType.LIGHT]: '✨',
      [SpiritType.SHADOW]: '🌑',
      [SpiritType.TIME]: '⏰',
      [SpiritType.SPACE]: '🌌',
      [SpiritType.SOUND]: '🔊',
      [SpiritType.CHAOS]: '🌪️',
      [SpiritType.ORDER]: '⚖️',
      [SpiritType.LIFE]: '🌿',
      [SpiritType.DEATH]: '💀',
      [SpiritType.BALANCE]: '☯️',
      [SpiritType.NONE]: '❓',
      [SpiritType.PSYCHIC]: '🧠'
    };
    return icons[type] || '❓';
  }
}
```

## 📈 Performance

- **Efficient Filtering**: O(n) filtering with early termination
- **Fast Sorting**: Optimized sort algorithms for large collections
- **Memory Efficient**: Minimal memory overhead for spirit storage
- **Quick Search**: Fast full-text search across spirit properties
- **Scalable Statistics**: Constant-time statistics calculation
- **Optimized Rendering**: Efficient UI updates for large collections

## 🔒 Security

- **Input Validation**: Comprehensive validation of all spirit data
- **Safe Serialization**: Secure JSON serialization/deserialization
- **Data Sanitization**: Safe handling of user-provided spirit names and descriptions
- **Type Safety**: Full TypeScript coverage prevents runtime errors
- **Immutable Operations**: Safe modification patterns
- **Error Boundaries**: Protected operations with proper error handling

## 🤝 Contributing

Contributions are welcome! Please see the main MIFF repository for guidelines.

## 📝 License

MIT License - see LICENSE file for details.

## 🔄 Migration from C#

SpiritsPure is a TypeScript conversion of the original C# implementation. Key improvements:

- **Type Safety**: Enhanced with comprehensive TypeScript interfaces
- **Performance**: Optimized algorithms for large spirit collections
- **Flexibility**: More configurable filtering and sorting options
- **Modern APIs**: Updated to use modern JavaScript/TypeScript patterns
- **Cross-Platform**: Support for both browser and Node.js environments
- **Enhanced Features**: Additional features like favorites, advanced search, and detailed analytics
- **Better Documentation**: Comprehensive documentation with examples and integration guides
- **CLI Tools**: Interactive command-line interface for testing and demonstration

The core spirit management functionality remains compatible with existing C# implementations while providing enhanced features and better performance.