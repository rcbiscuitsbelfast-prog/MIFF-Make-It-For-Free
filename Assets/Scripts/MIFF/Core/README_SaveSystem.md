# Save/Load System

A modular, remix-safe save/load system for K-pop spirit battle games. This system provides comprehensive game data persistence, save slot management, and an interactive testing harness for development and validation.

## 🎯 Overview

The Save/Load System provides:
- **SaveManager**: Core serialization and deserialization of GameData
- **SaveSlot**: Save slot metadata and summary information
- **SaveStorage**: Abstracted file I/O operations
- **SaveTestHarness**: Console-based testing and validation
- **GameData Integration**: Seamless persistence of all game state

## 🏗️ Architecture

### Core Components

#### 1. SaveManager.cs
The central manager for save/load operations:
- Handles serialization and deserialization of GameData
- Manages save slots and metadata
- Provides auto-save and quick-save functionality
- Integrates with SaveStorage for file operations

**Key Methods:**
- `SaveGame(string slotID, GameData gameData, string playerName)`
- `LoadGame(string slotID) → GameData`
- `DeleteSave(string slotID)`
- `ListSaveSlots() → List<string>`
- `QuickSave(GameData gameData)`
- `AutoSave(GameData gameData)`

#### 2. SaveSlot.cs
Individual save slot information:
- **Basic Info**: slotID, slotName, playerName, creation/last save dates
- **Game Progress**: player level, experience, battles, spirits captured
- **Game State**: current location, active quests, evolution status
- **Inventory Summary**: total items, currency, rare items
- **Spirit Collection**: party size, storage, legendary/mythical spirits
- **Achievements**: unlocked achievements, completed tutorials
- **Technical Info**: game version, file size, corruption status

#### 3. SaveStorage.cs
Abstracts file I/O operations:
- **File Operations**: WriteToFile, ReadFromFile, DeleteFile
- **Path Management**: GetSaveDirectory, GetSaveFilePath, GetMetadataFilePath
- **Backup System**: Automatic backup creation and rotation
- **File Locking**: Concurrent access protection
- **Integrity Validation**: File corruption detection
- **Compression/Encryption**: Placeholder hooks for custom implementations

#### 4. SaveTestHarness.cs
Console-based testing system:
- **Interactive Mode**: Command-line interface for manual testing
- **Automated Tests**: Basic, performance, and stress testing
- **Data Validation**: Game data integrity checking
- **Performance Metrics**: Timing and throughput analysis
- **Test Results**: Comprehensive reporting and export

#### 5. GameData Integration
Extended GameData.cs includes all necessary fields:
- Player progress and statistics
- Inventory and currency
- Spirit collection and discovery
- Quest progress and flags
- Battle statistics and achievements
- Location and exploration data

## 🚀 Quick Start

### Basic Save/Load Usage

```csharp
// Create save system
var saveStorage = new SaveStorage();
var saveManager = new SaveManager(saveStorage);
var gameData = new GameData();

// Save game
bool saveResult = saveManager.SaveGame("slot1", gameData, "PlayerName");
if (saveResult)
{
    Console.WriteLine("Game saved successfully!");
}

// Load game
GameData loadedData = saveManager.LoadGame("slot1");
if (loadedData != null)
{
    Console.WriteLine("Game loaded successfully!");
    Console.WriteLine($"Player Level: {loadedData.playerLevel}");
}

// List save slots
var slots = saveManager.ListSaveSlots();
foreach (string slotID in slots)
{
    var slot = saveManager.GetSaveSlot(slotID);
    Console.WriteLine(slot.GetSummary());
}
```

### Interactive Testing

```csharp
// Start interactive test harness
var testHarness = new SaveTestHarness(saveManager, saveStorage);
testHarness.StartInteractiveHarness();

// Available commands:
// test basic              - Run basic functionality tests
// test performance        - Run performance tests
// test stress             - Run stress tests
// create <slotID>         - Create new save slot
// save <slotID>           - Save game to slot
// load <slotID>           - Load game from slot
// list                    - List all save slots
// info                    - Show system information
// modify                  - Modify game data for testing
```

### Auto-Save and Quick-Save

```csharp
// Enable auto-save
saveManager.enableAutoSave = true;
saveManager.autoSaveInterval = 300.0f; // 5 minutes

// Enable quick-save
saveManager.enableQuickSave = true;

// Use quick-save
bool quickSaveResult = saveManager.QuickSave(gameData);

// Check if auto-save is due
if (saveManager.IsAutoSaveDue())
{
    bool autoSaveResult = saveManager.AutoSave(gameData);
}
```

## ⚙️ Configuration

### SaveManager Settings

```csharp
var saveManager = new SaveManager();

// Save settings
saveManager.maxSaveSlots = 15;
saveManager.defaultSlotID = "slot1";
saveManager.enableAutoSave = true;
saveManager.autoSaveInterval = 300.0f; // 5 minutes
saveManager.enableQuickSave = true;

// Serialization settings
saveManager.enableSaveValidation = true;
saveManager.enableSaveCompression = false;
saveManager.enableSaveEncryption = false;
saveManager.enableSaveBackups = true;
saveManager.enableSaveMetadata = true;
```

### SaveStorage Settings

```csharp
var saveStorage = new SaveStorage();

// Storage configuration
saveStorage.saveDirectory = "GameSaves";
saveStorage.enableBackups = true;
saveStorage.maxBackupFiles = 5;
saveStorage.enableCompression = false;
saveStorage.enableEncryption = false;
saveStorage.enableFileLocking = true;
saveStorage.validateFileIntegrity = true;
```

### SaveTestHarness Settings

```csharp
var testHarness = new SaveTestHarness();

// Test configuration
testHarness.testIterations = 10;
testHarness.stressTestCount = 200;
testHarness.performanceThreshold = 50.0f; // 50ms
testHarness.enableDataValidation = true;
testHarness.enableFileIntegrityCheck = true;
```

## 🎨 Remix System

### Custom Save Features

```csharp
// Hook into save events
saveManager.OnGameSaved += (manager, slotID) =>
{
    Console.WriteLine($"🎉 Game saved to slot: {slotID}!");
    // Custom save celebration logic
};

saveManager.OnGameLoaded += (manager, slotID) =>
{
    Console.WriteLine($"📂 Game loaded from slot: {slotID}!");
    // Custom load logic
};

saveManager.OnSaveSlotCreated += (manager, slot) =>
{
    Console.WriteLine($"🆕 Save slot created: {slot.slotID}!");
    // Custom slot creation logic
};
```

### Custom Storage Features

```csharp
// Hook into storage events
saveStorage.OnFileWritten += (storage, path) =>
{
    Console.WriteLine($"💾 File written: {path}");
    // Custom file write logic
};

saveStorage.OnBackupCreated += (storage, path) =>
{
    Console.WriteLine($"🔄 Backup created: {path}");
    // Custom backup logic
};

saveStorage.OnFileCorrupted += (storage, path) =>
{
    Console.WriteLine($"❌ File corrupted: {path}");
    // Custom corruption handling
};
```

### Custom Testing Features

```csharp
// Hook into test events
testHarness.OnTestStarted += (harness, command) =>
{
    Console.WriteLine($"🧪 Test started: {command}");
    // Custom test logic
};

testHarness.OnTestResult += (harness, result) =>
{
    Console.WriteLine($"📊 Test result: {result.name} - {result.success}");
    // Custom result handling
};
```

## 📊 Testing & Validation

### Basic Functionality Tests

```csharp
// Run basic tests
testHarness.RunSpecificTest("basic");

// Tests include:
// - Create save slot
// - Save game data
// - Load game data
// - Data validation
// - File integrity
```

### Performance Tests

```csharp
// Run performance tests
testHarness.RunSpecificTest("performance");

// Tests include:
// - Save operation timing
// - Load operation timing
// - Performance thresholds
// - Iteration averaging
```

### Stress Tests

```csharp
// Run stress tests
testHarness.RunSpecificTest("stress");

// Tests include:
// - Multiple save slots
// - Concurrent operations
// - Large data sets
// - System stability
```

### Manual Testing Commands

```csharp
// Create and test save slots
testHarness.ProcessCommand("create test_slot");
testHarness.ProcessCommand("save test_slot");
testHarness.ProcessCommand("load test_slot");
testHarness.ProcessCommand("info test_slot");

// Modify and retest
testHarness.ProcessCommand("modify");
testHarness.ProcessCommand("save test_slot");
testHarness.ProcessCommand("load test_slot");

// Clean up
testHarness.ProcessCommand("delete test_slot");
```

## 🔧 Advanced Features

### Backup Management

```csharp
// Automatic backup creation
saveStorage.enableBackups = true;
saveStorage.maxBackupFiles = 5;

// Manual backup cleanup
saveStorage.CleanupOldBackups();

// Backup rotation
// - New save creates backup_1
// - Existing backups rotate: backup_1 → backup_2 → backup_3
// - Oldest backups are automatically removed
```

### File Integrity Validation

```csharp
// Enable integrity checking
saveStorage.validateFileIntegrity = true;

// Custom validation hooks
saveStorage.enableCustomValidation = true;
// Implement custom validation in CompressData/DecompressData methods
```

### Compression and Encryption

```csharp
// Enable compression
saveStorage.enableCompression = true;
saveStorage.enableCustomCompression = true;

// Enable encryption
saveStorage.enableEncryption = true;
saveStorage.enableCustomEncryption = true;

// Custom implementations
// Override CompressData, DecompressData, EncryptData, DecryptData methods
```

### Concurrent Access Protection

```csharp
// Enable file locking
saveStorage.enableFileLocking = true;

// Thread-safe operations
// Multiple threads can safely access different save files
// File locks prevent corruption from concurrent access
```

## 📝 Contributor Notes

### For Non-Coders

1. **Save Slots**: Use descriptive names for save slots
2. **Auto-Save**: Enable auto-save for automatic progress protection
3. **Quick-Save**: Use quick-save for manual progress protection
4. **Backups**: Keep backup system enabled for data safety
5. **Validation**: Enable validation to catch corrupted saves early

### For Remixers

1. **Event Hooks**: Subscribe to save/load events for custom logic
2. **Custom Storage**: Implement custom compression/encryption
3. **Custom Validation**: Add custom data validation rules
4. **Custom Tests**: Extend test harness with custom test cases
5. **Custom Metrics**: Add custom performance and validation metrics

### For Developers

1. **Extend SaveSlot**: Add new fields for tracking additional data
2. **Enhance SaveManager**: Add new save/load operations
3. **Custom Storage**: Implement custom file formats or cloud storage
4. **Performance Optimization**: Optimize serialization and file I/O
5. **Error Handling**: Add custom error recovery and repair logic

## 🐛 Troubleshooting

### Common Issues

1. **Save Not Working**: Check file permissions and disk space
2. **Load Fails**: Verify save file integrity and format version
3. **Corrupted Saves**: Use backup files or enable validation
4. **Performance Issues**: Check compression settings and file size
5. **Concurrent Access**: Enable file locking for multi-threaded access

### Debug Information

```csharp
// Enable verbose output
Console.WriteLine(saveManager.GetSaveManagerSummary());
Console.WriteLine(saveStorage.GetStorageSummary());

// Check specific save slots
var slot = saveManager.GetSaveSlot("slot1");
if (slot != null)
{
    Console.WriteLine(slot.GetDetailedInfo());
}
```

### Validation and Repair

```csharp
// Validate all saves
testHarness.ProcessCommand("validate");

// Check file integrity
var storage = saveStorage.GetStorageStats();
Console.WriteLine($"Storage Status: {storage}");

// Clean up corrupted files
testHarness.ProcessCommand("cleanup");
```

## 📚 Related Systems

- **GameData**: Central game state and persistence
- **SpiritDex System**: Spirit collection and discovery tracking
- **Battle System**: Combat statistics and progress
- **Quest System**: Objective completion and rewards
- **Inventory System**: Item collection and management
- **Tutorial System**: Progress tracking and guidance
- **Evolution System**: Spirit progression and transformation

## 🌟 Integration Examples

### Game Loop Integration

```csharp
// Auto-save during gameplay
void Update()
{
    if (saveManager.IsAutoSaveDue())
    {
        saveManager.AutoSave(currentGameData);
    }
}

// Save on important events
void OnSpiritCaptured()
{
    saveManager.QuickSave(currentGameData);
}

void OnQuestCompleted()
{
    saveManager.SaveGame("main_save", currentGameData, playerName);
}
```

### Menu System Integration

```csharp
// Save menu
public void ShowSaveMenu()
{
    var slots = saveManager.GetAllSaveSlots();
    foreach (var slot in slots)
    {
        // Display slot information
        Console.WriteLine(slot.GetSummary());
    }
}

// Load menu
public void LoadFromSlot(string slotID)
{
    var loadedData = saveManager.LoadGame(slotID);
    if (loadedData != null)
    {
        // Apply loaded data to game
        ApplyGameData(loadedData);
    }
}
```

### Error Recovery Integration

```csharp
// Handle save corruption
saveManager.OnSaveCorrupted += (manager, slotID) =>
{
    Console.WriteLine($"Save corrupted: {slotID}");
    
    // Try to load backup
    var backupData = LoadFromBackup(slotID);
    if (backupData != null)
    {
        Console.WriteLine("Backup loaded successfully");
        // Continue with backup data
    }
    else
    {
        Console.WriteLine("No backup available, starting new game");
        // Start new game
    }
};
```

---

*This Save/Load system is designed to be modular, extensible, and contributor-friendly. All components can be customized and extended without modifying core functionality. The system provides comprehensive testing tools and validation to ensure data integrity and system reliability.*