# SavePure

A comprehensive **game save/load system** with JSON serialization, checksum validation, version migration, and remix-safe save data structures. Built for AAA game development with robust data integrity and cross-version compatibility.

## ✨ Features

- **JSON Serialization**: Fast, human-readable save files with structured data
- **Checksum Validation**: Built-in integrity checking to detect corruption
- **Version Migration**: Automatic migration between save file versions
- **Remix-Safe**: Engine-agnostic save data that works across different implementations
- **Comprehensive Validation**: Multi-layer validation with detailed error reporting
- **Rich Metadata**: Extensive metadata support for game state tracking
- **Party Management**: Full party roster management with entity states
- **Inventory System**: Complete inventory tracking with quantities
- **Quest Progress**: Quest flag system with boolean state tracking
- **Content Unlocking**: Progressive content unlocking system
- **Statistics Tracking**: Comprehensive game statistics and achievements
- **Game Settings**: Persistent game configuration and preferences
- **Performance Optimized**: Efficient serialization and validation
- **Security Features**: Input validation and safe file operations
- **Cross-Platform**: Works in browser and Node.js environments

## 📦 Installation

```bash
npm install miff-save-pure
```

## 🚀 Quick Start

```typescript
import {
  SaveManager,
  SaveSnapshot,
  SaveUtils,
  SaveOperationResult
} from 'miff-save-pure';

// Create save manager
const saveManager = new SaveManager();

// Create new save snapshot
const snapshot = SaveSnapshot.create(
  SaveUtils.generatePlayerId(),
  'town_square',
  'v1'
);

// Add party members
snapshot.addPartyMember({
  id: 'hero_001',
  name: 'Hero',
  level: 10,
  hp: 100,
  maxHp: 100,
  stats: { atk: 50, def: 30, spd: 40 },
  statusEffects: ['blessed']
});

// Add inventory items
snapshot.addInventoryItem('health_potion', 5);
snapshot.addInventoryItem('sword', 1);

// Set quest progress
snapshot.setQuestFlag('tutorial_complete', true);
snapshot.setQuestFlag('main_quest_active', true);

// Unlock content
snapshot.unlockContent('town_area');
snapshot.unlockContent('forest_path');

// Track statistics
snapshot.updateStatistic('enemies_defeated', 42);
snapshot.updateStatistic('total_play_time', 3600000);

// Save to file
const saveResult = await saveManager.saveGame(snapshot, './my_save.json');
if (saveResult.success) {
  console.log('Game saved successfully!');
}

// Load from file
const loadResult = await saveManager.loadGame('./my_save.json');
if (loadResult.success) {
  const loadedSnapshot = loadResult.snapshot!;
  console.log(`Loaded player: ${loadedSnapshot.playerId}`);
  console.log(`Party size: ${loadedSnapshot.partyRoster.length}`);
}
```

## 📚 Core Concepts

### Save Versions

SavePure supports multiple save file versions with automatic migration:

- **v1**: Basic save structure with party, inventory, and quests
- **v2**: Enhanced statistics and metadata tracking
- **v3**: Advanced validation and integrity features

### Save Data Structure

```typescript
interface SaveSnapshot {
  version: SaveVersion;           // Save file version
  playerId: string;              // Unique player identifier
  zoneId: string;                // Current game zone/location
  timestampUtc: string;          // Last save timestamp
  checksum?: string;             // Integrity checksum
  partyRoster: GameEntity[];     // Current party members
  inventory: Record<string, number>; // Item inventory
  questFlags: Record<string, boolean>; // Quest completion flags
  unlockedContent: string[];     // Unlocked game content
  gameSettings: Record<string, any>;   // Game configuration
  statistics: Record<string, number>;  // Game statistics
  metadata: Record<string, any>; // Additional metadata
}
```

### Validation System

SavePure includes comprehensive validation:

- **Required Fields**: Ensures all essential data is present
- **Data Types**: Validates field types and structures
- **Version Support**: Checks version compatibility
- **Checksum Integrity**: Validates data integrity
- **Custom Validation**: Extensible validation rules

### Migration System

Automatic migration between save versions:

- **Forward Migration**: Upgrade older saves to newer versions
- **Backward Compatibility**: Maintain compatibility with older saves
- **Data Preservation**: Preserve all game data during migration
- **Migration Tracking**: Track migration history in metadata

## 🔧 Basic Usage

### Creating Save Snapshots

```typescript
// Create basic save
const snapshot = SaveSnapshot.create('player_123', 'starting_town', 'v1');

// Create from existing game state
const gameSnapshot = SaveSnapshot.fromGameState(
  'player_123',
  partyMembers,    // Array of party entities
  inventory,       // Inventory object
  questFlags,      // Quest flags object
  gameSettings,    // Game settings object
  'starting_town'  // Current zone
);

// Add party member
snapshot.addPartyMember({
  id: 'hero_001',
  name: 'Hero',
  level: 10,
  hp: 100,
  maxHp: 100,
  stats: { atk: 50, def: 30, spd: 40 },
  statusEffects: ['blessed']
});

// Update party member
snapshot.updatePartyMember('hero_001', {
  hp: 75,
  statusEffects: ['blessed', 'strength_boost']
});

// Remove party member
snapshot.removePartyMember('hero_001');
```

### Managing Inventory

```typescript
// Add items
snapshot.addInventoryItem('health_potion', 5);
snapshot.addInventoryItem('mana_potion', 3);
snapshot.addInventoryItem('iron_sword', 1);

// Remove items
snapshot.removeInventoryItem('health_potion', 2); // Remove 2 potions

// Check inventory
const potionCount = snapshot.inventory['health_potion'] || 0;
console.log(`Health potions: ${potionCount}`);

// Clear inventory
snapshot.inventory = {};
```

### Quest Management

```typescript
// Set quest flags
snapshot.setQuestFlag('tutorial_complete', true);
snapshot.setQuestFlag('main_quest_active', true);
snapshot.setQuestFlag('side_quest_finished', false);

// Check quest progress
if (snapshot.getQuestFlag('tutorial_complete')) {
  // Enable advanced features
  snapshot.unlockContent('advanced_skills');
}

// Get all quest flags
const questProgress = snapshot.questFlags;
console.log('Quest progress:', questProgress);
```

### Content Unlocking

```typescript
// Unlock content
snapshot.unlockContent('new_area');
snapshot.unlockContent('secret_dungeon');
snapshot.unlockContent('special_ability');

// Check if content is unlocked
if (snapshot.isContentUnlocked('secret_dungeon')) {
  // Enable dungeon content
  console.log('Secret dungeon is available!');
}

// Get all unlocked content
const unlocked = snapshot.unlockedContent;
console.log('Unlocked content:', unlocked);
```

### Statistics and Settings

```typescript
// Update statistics
snapshot.updateStatistic('enemies_defeated', 42);
snapshot.updateStatistic('total_play_time', 3600000); // 1 hour in ms
snapshot.updateStatistic('gold_earned', 1500);

// Get statistics
const playTime = snapshot.getStatistic('total_play_time');
const enemiesDefeated = snapshot.getStatistic('enemies_defeated');

// Set game settings
snapshot.setGameSetting('difficulty', 'hard');
snapshot.setGameSetting('sound_volume', 0.8);
snapshot.setGameSetting('auto_save', true);

// Get game settings
const difficulty = snapshot.getGameSetting('difficulty');
const volume = snapshot.getGameSetting('sound_volume');
```

### Metadata Management

```typescript
// Add metadata
snapshot.addMetadata('last_save_location', 'town_square');
snapshot.addMetadata('game_version', '1.2.3');
snapshot.addMetadata('save_count', 42);

// Get metadata
const saveLocation = snapshot.getMetadata('last_save_location');
const saveCount = snapshot.getMetadata('save_count');
```

## 💾 Save and Load Operations

### Saving Games

```typescript
const saveManager = new SaveManager();

// Save with automatic validation
const saveResult = await saveManager.saveGame(snapshot, './savegame.json');

if (saveResult.success) {
  console.log('Game saved successfully!');
  console.log(`Save size: ${SaveUtils.formatFileSize(SaveUtils.calculateSaveSize(snapshot))}`);
  console.log(`Checksum: ${snapshot.checksum}`);
} else {
  console.error('Save failed:', saveResult.message);
}
```

### Loading Games

```typescript
// Load with automatic validation and migration
const loadResult = await saveManager.loadGame('./savegame.json');

if (loadResult.success && loadResult.snapshot) {
  const loadedSnapshot = loadResult.snapshot;
  console.log(`Loaded player: ${loadedSnapshot.playerId}`);
  console.log(`Zone: ${loadedSnapshot.zoneId}`);
  console.log(`Party size: ${loadedSnapshot.partyRoster.length}`);

  // Check if migration occurred
  if (loadResult.migrationResult?.migrated) {
    console.log(`Migrated from ${loadResult.migrationResult.oldVersion} to ${loadResult.migrationResult.newVersion}`);
  }
} else {
  console.error('Load failed:', loadResult.message);
}
```

### Advanced Save Operations

```typescript
// Export snapshot to binary format
const binaryData = await saveManager.exportSnapshot(snapshot, 'binary');

// Import snapshot from binary data
const importResult = await saveManager.importSnapshot(binaryData, 'binary');

// Create backup
const backupResult = await saveManager.createBackup('./savegame.json', './savegame_backup.json');

// List save files
const saveFiles = await saveManager.listSaveFiles('./saves/');
console.log('Save files:', saveFiles);

// Get save information
const saveInfo = await saveManager.getSaveInfo('./savegame.json');
if (saveInfo.success && saveInfo.snapshot) {
  console.log('Save info:', saveInfo.snapshot.getSummary());
}
```

## ✅ Validation and Integrity

### Built-in Validation

```typescript
// Validate snapshot
const validationResult = snapshot.validate();

console.log('Validation result:', validationResult.isValid);
console.log('Version:', validationResult.version);
console.log('Checksum valid:', validationResult.checksumValid);

if (validationResult.errors.length > 0) {
  console.log('Errors:', validationResult.errors);
}

if (validationResult.warnings.length > 0) {
  console.log('Warnings:', validationResult.warnings);
}

// Use save manager validation
const managerValidation = saveManager.validateSnapshot(snapshot);
```

### Custom Validation

```typescript
// Create custom validator
const customValidator = new SaveValidator(['v1', 'v2', 'v3']);

// Add custom validation rules
customValidator.addValidationRule('custom_field', (value) => {
  return typeof value === 'string' && value.length > 0;
});

// Validate with custom rules
const customResult = customValidator.validate(snapshot);
```

## 🔄 Version Migration

### Automatic Migration

```typescript
// Create migrator with custom versions
const migrator = new SaveMigrator(['v1', 'v2', 'v3', 'v4']);

// Migrate to latest version
const migrationResult = migrator.migrate(snapshot, 'v4');

if (migrationResult.migrated) {
  console.log(`Migrated from ${migrationResult.oldVersion} to ${migrationResult.newVersion}`);
  console.log('Warnings:', migrationResult.warnings);
}
```

### Custom Migration Steps

```typescript
// Add custom migration step
migrator.addMigrationStep('v3', 'v4', (snapshot) => {
  // Custom migration logic
  if (snapshot.gameSettings) {
    snapshot.gameSettings['migrated_to_v4'] = true;
  }

  // Add new required fields
  if (!snapshot.metadata) {
    snapshot.metadata = {};
  }

  snapshot.metadata['migration_version'] = '4.0';
  snapshot.version = 'v4';

  return snapshot;
});

// Check migration capability
const canMigrate = migrator.canMigrate('v3', 'v4');
console.log('Can migrate v3 to v4:', canMigrate);
```

## 📊 Advanced Features

### Batch Operations

```typescript
// Batch save multiple snapshots
const snapshots = [
  SaveSnapshot.create('player1', 'zone1'),
  SaveSnapshot.create('player2', 'zone2'),
  SaveSnapshot.create('player3', 'zone3')
];

for (const snapshot of snapshots) {
  await saveManager.saveGame(snapshot, `./save_${snapshot.playerId}.json`);
}

// Batch load with error handling
const loadPromises = saveFiles.map(file =>
  saveManager.loadGame(file).catch(error => ({ error: file }))
);

const results = await Promise.all(loadPromises);
```

### Save File Management

```typescript
// Generate unique save names
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substr(0, 19);
const saveName = SaveUtils.generateSaveFileName('player_123', timestamp);

// Validate file paths
const isValidPath = SaveUtils.validateFilePath('./saves/savegame.json');
const safePath = SaveUtils.sanitizeFilePath(userInputPath);

// Compare save snapshots
const differences = SaveUtils.compareSnapshots(snapshot1, snapshot2);
console.log('Differences:', differences);

// Get file metadata
const fileInfo = SaveUtils.getFileMetadata('./savegame.json');
console.log('File info:', fileInfo);
```

### Performance Optimization

```typescript
// Efficient save operations
class OptimizedSaveManager {
  private saveManager: SaveManager;

  async saveGameState(gameState: GameState): Promise<SaveOperationResult> {
    const snapshot = SaveSnapshot.fromGameState(
      gameState.playerId,
      gameState.party,
      gameState.inventory,
      gameState.quests,
      gameState.settings,
      gameState.currentZone
    );

    // Update only changed fields
    const previousSnapshot = this.loadLastSnapshot();
    if (previousSnapshot) {
      const differences = SaveUtils.compareSnapshots(snapshot, previousSnapshot);
      if (Object.keys(differences).length === 0) {
        return { success: true, message: 'No changes to save' };
      }
    }

    return await this.saveManager.saveGame(snapshot, this.getSavePath());
  }

  private loadLastSnapshot(): SaveSnapshot | null {
    // Load last saved snapshot for comparison
    try {
      const result = await this.saveManager.loadGame(this.getSavePath());
      return result.success ? result.snapshot! : null;
    } catch {
      return null;
    }
  }
}
```

### Error Handling and Recovery

```typescript
// Robust save/load with error recovery
class SafeSaveManager {
  async saveGameWithBackup(snapshot: SaveSnapshot, filePath: string): Promise<SaveOperationResult> {
    try {
      // Create backup first
      const backupResult = await saveManager.createBackup(filePath);
      if (!backupResult.success) {
        return { success: false, message: 'Failed to create backup' };
      }

      // Attempt save
      const saveResult = await saveManager.saveGame(snapshot, filePath);
      if (!saveResult.success) {
        // Restore from backup on failure
        console.log('Save failed, attempting recovery...');
        // Recovery logic would go here
      }

      return saveResult;
    } catch (error) {
      return {
        success: false,
        message: `Save failed: ${error}`,
        error: error as Error
      };
    }
  }

  async loadGameWithFallback(filePath: string): Promise<SaveOperationResult> {
    try {
      const result = await saveManager.loadGame(filePath);

      if (!result.success) {
        // Try loading backup
        const backupPath = `${filePath}.backup`;
        console.log(`Loading backup: ${backupPath}`);
        return await saveManager.loadGame(backupPath);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        message: `Load failed: ${error}`,
        error: error as Error
      };
    }
  }
}
```

## 📈 API Reference

### Classes

#### `SaveSnapshot`
The core save data structure containing all game state.

**Constructor:**
```typescript
new SaveSnapshot(playerId?: string, zoneId?: string, version?: SaveVersion)
```

**Static Methods:**
- `create(playerId, zoneId, version)` - Create new snapshot
- `fromGameState(playerId, party, inventory, quests, settings, zone)` - Create from game state
- `fromJSON(data)` - Create from JSON data

**Methods:**
- `validate()` - Validate snapshot integrity
- `computeChecksum()` - Generate integrity checksum
- `clone()` - Create deep copy
- `toJSON()` - Convert to JSON
- `getEstimatedSize()` - Get approximate size in bytes
- `updateTimestamp()` - Update save timestamp
- `addPartyMember(entity)` - Add entity to party
- `removePartyMember(entityId)` - Remove entity from party
- `updatePartyMember(entityId, updates)` - Update party member
- `addInventoryItem(itemId, quantity)` - Add inventory item
- `removeInventoryItem(itemId, quantity)` - Remove inventory item
- `setQuestFlag(flagId, value)` - Set quest flag
- `unlockContent(contentId)` - Unlock game content
- `isContentUnlocked(contentId)` - Check if content is unlocked
- `updateStatistic(statId, value)` - Update game statistic
- `getStatistic(statId)` - Get game statistic
- `setGameSetting(settingId, value)` - Set game setting
- `getGameSetting(settingId)` - Get game setting
- `addMetadata(key, value)` - Add metadata
- `getMetadata(key)` - Get metadata
- `getSummary()` - Get save summary for display

#### `SaveManager`
Main manager for save/load operations.

**Constructor:**
```typescript
new SaveManager(validator?, migrator?, defaultVersion?)
```

**Static Methods:**
- `create(validator?, migrator?, defaultVersion?)` - Create save manager

**Methods:**
- `saveGame(snapshot, filePath)` - Save snapshot to file
- `loadGame(filePath)` - Load snapshot from file
- `validateSnapshot(snapshot)` - Validate snapshot
- `migrateSnapshot(snapshot, targetVersion)` - Migrate snapshot
- `exportSnapshot(snapshot, format)` - Export to binary format
- `importSnapshot(data, format)` - Import from data
- `createBackup(filePath, backupPath)` - Create file backup
- `listSaveFiles(directory)` - List save files in directory
- `getSaveInfo(filePath)` - Get save file information

#### `SaveValidator`
Handles save data validation.

**Constructor:**
```typescript
new SaveValidator(supportedVersions?)
```

**Methods:**
- `validate(snapshot)` - Validate snapshot
- `validateField(fieldName, value)` - Validate specific field
- `validateVersion(version)` - Validate version string
- `validateChecksum(snapshot)` - Validate checksum
- `getValidationRules()` - Get validation rules
- `addSupportedVersion(version)` - Add supported version
- `removeSupportedVersion(version)` - Remove supported version

#### `SaveMigrator`
Handles save data migration between versions.

**Constructor:**
```typescript
new SaveMigrator(supportedVersions?)
```

**Methods:**
- `migrate(snapshot, targetVersion)` - Migrate snapshot
- `canMigrate(fromVersion, toVersion)` - Check migration capability
- `getMigrationPath(fromVersion, toVersion)` - Get migration path
- `addMigrationStep(fromVersion, toVersion, migrationFn)` - Add migration step
- `getSupportedVersions()` - Get supported versions
- `getLatestVersion()` - Get latest version
- `removeMigrationStep(fromVersion, toVersion)` - Remove migration step

### Interfaces

#### `ISaveSnapshot`
Save snapshot interface.

#### `ISaveManager`
Save manager interface.

#### `ISaveValidator`
Save validator interface.

#### `ISaveMigrator`
Save migrator interface.

#### `SaveValidationResult`
Validation result interface.

#### `SaveMigrationResult`
Migration result interface.

#### `SaveOperationResult`
Operation result interface.

#### `IGameEntity`
Game entity interface.

## ⚙️ Configuration

### Custom Validation Rules

```typescript
const customValidator = new SaveValidator(['v1', 'v2', 'v3']);

// Add custom validation
customValidator.addCustomRule('minimum_party_size', (snapshot) => {
  return snapshot.partyRoster.length >= 1;
});

customValidator.addCustomRule('valid_player_level', (snapshot) => {
  return snapshot.partyRoster.every(member => member.level >= 1 && member.level <= 99);
});
```

### Custom Migration Logic

```typescript
const customMigrator = new SaveMigrator(['v1', 'v2', 'v3', 'v4']);

// Add custom migration from v3 to v4
customMigrator.addMigrationStep('v3', 'v4', (snapshot) => {
  // Add new v4 fields
  if (!snapshot.gameSettings) {
    snapshot.gameSettings = {};
  }

  snapshot.gameSettings['new_feature_enabled'] = true;

  // Update metadata
  snapshot.addMetadata('migrated_to_v4', new Date().toISOString());

  // Update version
  snapshot.version = 'v4';

  return snapshot;
});
```

### Advanced Save Manager Configuration

```typescript
const advancedSaveManager = new SaveManager(
  customValidator,    // Custom validator
  customMigrator,     // Custom migrator
  'v4'                // Default version
);

// Configure additional options
advancedSaveManager.setCompression(true);
advancedSaveManager.setEncryptionKey('my-secret-key');
```

## 🧪 Testing

```typescript
import {
  SaveManager,
  SaveSnapshot,
  SaveUtils,
  SaveValidator
} from 'miff-save-pure';

// Create test snapshot
const testSnapshot = SaveUtils.createComprehensiveSnapshot();

// Validate snapshot
const validator = new SaveValidator();
const validationResult = validator.validate(testSnapshot);

expect(validationResult.isValid).toBe(true);
expect(validationResult.errors).toHaveLength(0);
expect(validationResult.checksumValid).toBe(true);

// Test save/load cycle
const saveManager = new SaveManager();

const saveResult = await saveManager.saveGame(testSnapshot, './test_save.json');
expect(saveResult.success).toBe(true);

const loadResult = await saveManager.loadGame('./test_save.json');
expect(loadResult.success).toBe(true);
expect(loadResult.snapshot?.playerId).toBe(testSnapshot.playerId);

// Test migration
const oldSnapshot = new SaveSnapshot('test', 'test', 'v1');
const migrator = new SaveMigrator();
const migrationResult = migrator.migrate(oldSnapshot, 'v3');
expect(migrationResult.migrated).toBe(true);
expect(migrationResult.snapshot.version).toBe('v3');
```

## 🔍 Integration Examples

### Game State Manager Integration

```typescript
class GameStateManager {
  private saveManager: SaveManager;
  private currentSnapshot: SaveSnapshot;
  private autoSaveInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.saveManager = new SaveManager();
    this.currentSnapshot = SaveSnapshot.create();
    this.initializeGameState();
  }

  private async initializeGameState(): Promise<void> {
    // Try to load existing save
    const loadResult = await this.saveManager.loadGame('./autosave.json');

    if (loadResult.success && loadResult.snapshot) {
      this.currentSnapshot = loadResult.snapshot;
      console.log('Loaded existing game state');
    } else {
      // Create new game state
      this.createNewGame();
    }

    // Start auto-save
    this.startAutoSave();
  }

  private createNewGame(): void {
    this.currentSnapshot = SaveSnapshot.create(
      SaveUtils.generatePlayerId(),
      'starting_village',
      'v1'
    );

    // Initialize with default party
    this.currentSnapshot.addPartyMember({
      id: 'hero_001',
      name: 'Hero',
      level: 1,
      hp: 100,
      maxHp: 100,
      stats: { atk: 20, def: 15, spd: 10 },
      statusEffects: []
    });

    console.log('Created new game state');
  }

  async saveGame(filePath?: string): Promise<void> {
    const path = filePath || './savegame.json';
    const result = await this.saveManager.saveGame(this.currentSnapshot, path);

    if (result.success) {
      console.log('Game saved successfully');
    } else {
      console.error('Save failed:', result.message);
    }
  }

  async loadGame(filePath: string): Promise<void> {
    const result = await this.saveManager.loadGame(filePath);

    if (result.success && result.snapshot) {
      this.currentSnapshot = result.snapshot;
      console.log('Game loaded successfully');

      // Notify other systems of state change
      this.onGameStateLoaded();
    } else {
      console.error('Load failed:', result.message);
    }
  }

  getCurrentSnapshot(): SaveSnapshot {
    return this.currentSnapshot;
  }

  updatePartyMember(memberId: string, updates: any): void {
    this.currentSnapshot.updatePartyMember(memberId, updates);
  }

  addInventoryItem(itemId: string, quantity: number = 1): void {
    this.currentSnapshot.addInventoryItem(itemId, quantity);
  }

  setQuestFlag(flagId: string, value: boolean): void {
    this.currentSnapshot.setQuestFlag(flagId, value);
  }

  unlockContent(contentId: string): void {
    this.currentSnapshot.unlockContent(contentId);
  }

  private startAutoSave(): void {
    this.autoSaveInterval = setInterval(() => {
      this.saveManager.saveGame(this.currentSnapshot, './autosave.json');
    }, 30000); // Auto-save every 30 seconds
  }

  private stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  private onGameStateLoaded(): void {
    // Notify UI, audio, and other systems
    console.log('Game state loaded, updating systems...');

    // Update UI with loaded data
    this.updateUI();

    // Update audio settings
    this.updateAudioSettings();

    // Load appropriate zone
    this.loadZone(this.currentSnapshot.zoneId);
  }

  private updateUI(): void {
    // Update UI elements with loaded game state
    const partyElement = document.getElementById('party');
    if (partyElement) {
      partyElement.innerHTML = '';

      this.currentSnapshot.partyRoster.forEach(member => {
        const memberElement = document.createElement('div');
        memberElement.textContent = `${member.name} (HP: ${member.hp}/${member.maxHp})`;
        partyElement.appendChild(memberElement);
      });
    }
  }

  private updateAudioSettings(): void {
    // Apply loaded audio settings
    const volume = this.currentSnapshot.getGameSetting('master_volume') || 1.0;
    // Audio system integration would go here
  }

  private loadZone(zoneId: string): void {
    // Load appropriate game zone
    console.log(`Loading zone: ${zoneId}`);
    // Zone loading logic would go here
  }

  dispose(): void {
    this.stopAutoSave();
  }
}
```

### UI Integration

```typescript
class SaveLoadUI {
  private saveManager: SaveManager;
  private fileInput: HTMLInputElement;
  private saveList: HTMLSelectElement;
  private statusElement: HTMLDivElement;

  constructor(saveManager: SaveManager) {
    this.saveManager = saveManager;
    this.initializeElements();
    this.setupEventListeners();
    this.refreshSaveList();
  }

  private initializeElements(): void {
    this.fileInput = document.getElementById('saveFileInput') as HTMLInputElement;
    this.saveList = document.getElementById('saveList') as HTMLSelectElement;
    this.statusElement = document.getElementById('saveStatus') as HTMLDivElement;
  }

  private setupEventListeners(): void {
    // Save button
    document.getElementById('saveButton')?.addEventListener('click', () => {
      this.saveGame();
    });

    // Load button
    document.getElementById('loadButton')?.addEventListener('click', () => {
      this.loadGame();
    });

    // Delete button
    document.getElementById('deleteSaveButton')?.addEventListener('click', () => {
      this.deleteSave();
    });

    // New game button
    document.getElementById('newGameButton')?.addEventListener('click', () => {
      this.newGame();
    });

    // File input change
    this.fileInput?.addEventListener('change', (event) => {
      this.handleFileSelection(event);
    });
  }

  private async saveGame(): Promise<void> {
    this.setStatus('Saving...', 'info');

    try {
      const snapshot = await this.gameStateManager.getCurrentSnapshot();
      const fileName = SaveUtils.generateSaveFileName(snapshot.playerId);

      const result = await this.saveManager.saveGame(snapshot, `./saves/${fileName}`);

      if (result.success) {
        this.setStatus('Game saved successfully!', 'success');
        this.refreshSaveList();
      } else {
        this.setStatus(`Save failed: ${result.message}`, 'error');
      }
    } catch (error) {
      this.setStatus(`Save error: ${error}`, 'error');
    }
  }

  private async loadGame(): Promise<void> {
    const selectedFile = this.saveList.value;

    if (!selectedFile) {
      this.setStatus('Please select a save file', 'warning');
      return;
    }

    this.setStatus('Loading...', 'info');

    try {
      const result = await this.saveManager.loadGame(`./saves/${selectedFile}`);

      if (result.success && result.snapshot) {
        await this.gameStateManager.loadSnapshot(result.snapshot);
        this.setStatus('Game loaded successfully!', 'success');
      } else {
        this.setStatus(`Load failed: ${result.message}`, 'error');
      }
    } catch (error) {
      this.setStatus(`Load error: ${error}`, 'error');
    }
  }

  private async deleteSave(): Promise<void> {
    const selectedFile = this.saveList.value;

    if (!selectedFile) {
      this.setStatus('Please select a save file', 'warning');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedFile}?`)) {
      return;
    }

    try {
      // In a real implementation, you would have a delete method
      // await this.saveManager.deleteSave(`./saves/${selectedFile}`);
      this.setStatus(`${selectedFile} deleted`, 'info');
      this.refreshSaveList();
    } catch (error) {
      this.setStatus(`Delete error: ${error}`, 'error');
    }
  }

  private async newGame(): Promise<void> {
    if (!confirm('Are you sure you want to start a new game? Unsaved progress will be lost.')) {
      return;
    }

    try {
      const newSnapshot = SaveSnapshot.create(
        SaveUtils.generatePlayerId(),
        'starting_village',
        'v1'
      );

      await this.gameStateManager.loadSnapshot(newSnapshot);
      this.setStatus('New game started!', 'success');
    } catch (error) {
      this.setStatus(`New game error: ${error}`, 'error');
    }
  }

  private async refreshSaveList(): Promise<void> {
    try {
      const saveFiles = await this.saveManager.listSaveFiles('./saves/');

      // Clear existing options
      this.saveList.innerHTML = '<option value="">Select a save file...</option>';

      // Add save files
      saveFiles.forEach(file => {
        const option = document.createElement('option');
        option.value = file;
        option.textContent = file;
        this.saveList.appendChild(option);
      });
    } catch (error) {
      console.error('Failed to refresh save list:', error);
    }
  }

  private handleFileSelection(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.loadGameFromFile(file);
    }
  }

  private async loadGameFromFile(file: File): Promise<void> {
    this.setStatus('Loading from file...', 'info');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const result = await this.saveManager.importSnapshot(uint8Array, 'json');

      if (result.success && result.snapshot) {
        await this.gameStateManager.loadSnapshot(result.snapshot);
        this.setStatus('Game loaded from file successfully!', 'success');
      } else {
        this.setStatus(`Load from file failed: ${result.message}`, 'error');
      }
    } catch (error) {
      this.setStatus(`Load from file error: ${error}`, 'error');
    }
  }

  private setStatus(message: string, type: 'info' | 'success' | 'warning' | 'error'): void {
    this.statusElement.textContent = message;
    this.statusElement.className = `status-${type}`;

    // Clear status after 5 seconds
    setTimeout(() => {
      this.statusElement.textContent = '';
      this.statusElement.className = '';
    }, 5000);
  }
}
```

## 📈 Performance

- **Fast Serialization**: Optimized JSON handling with minimal overhead
- **Efficient Validation**: Quick validation checks with early termination
- **Memory Optimized**: Streaming operations for large save files
- **Checksum Performance**: Fast integrity checking without full deserialization
- **Migration Speed**: Optimized migration paths with minimal data transformation
- **Batch Operations**: Efficient handling of multiple save files

## 🔒 Security

- **Input Validation**: Comprehensive validation of all save data
- **Path Safety**: Secure file path handling to prevent directory traversal
- **Data Sanitization**: Safe handling of user-provided data
- **Checksum Integrity**: Cryptographic integrity verification
- **Version Control**: Safe migration between supported versions
- **Error Handling**: Secure error handling without information leakage

## 🤝 Contributing

Contributions are welcome! Please see the main MIFF repository for guidelines.

## 📝 License

MIT License - see LICENSE file for details.

## 🔄 Migration from C#

SavePure is a TypeScript conversion of the original C# implementation. Key improvements:

- **Type Safety**: Enhanced with TypeScript interfaces and validation
- **Performance**: Optimized algorithms for serialization and validation
- **Cross-Platform**: Support for both browser and Node.js environments
- **Modern APIs**: Updated to use modern JavaScript/TypeScript features
- **Error Handling**: Improved error handling and recovery mechanisms
- **Extensibility**: More flexible architecture for custom implementations
- **Documentation**: Comprehensive documentation with examples

The core save/load functionality remains compatible with existing C# implementations while providing enhanced features and better performance.