# SpiritDex System

A modular, remix-safe SpiritDex viewer system for K-pop spirit battle games. This system provides comprehensive spirit tracking, discovery management, and an interactive console-based viewer for testing and development.

## 🎯 Overview

The SpiritDex System provides:
- **SpiritDexManager**: Core management of discovered and captured spirits
- **SpiritDexEntry**: Individual spirit entries with rich data tracking
- **SpiritDexViewer**: Interactive console-based viewer for testing
- **SpiritDatabase**: Lookup database for SpiritSpecies metadata
- **GameData Integration**: Seamless persistence and data management

## 🏗️ Architecture

### Core Components

#### 1. SpiritDexManager.cs
The central manager for the SpiritDex system:
- Tracks discovered and captured spirits via GameData
- Provides methods for registration and status checking
- Manages statistics and filtering
- Integrates with GameData for persistence

**Key Methods:**
- `RegisterDiscovery(string spiritID, string spiritName, string location)`
- `RegisterCapture(string spiritID, string spiritName, string location)`
- `IsDiscovered(string spiritID) → bool`
- `IsCaptured(string spiritID) → bool`
- `GetDexEntries() → List<SpiritDexEntry>`

#### 2. SpiritDexEntry.cs
Individual spirit entries with comprehensive data:
- **Basic Info**: spiritID, spiritName, speciesID
- **Status Flags**: discovered, captured, loreUnlocked, evolutionUnlocked
- **Location Tracking**: lastSeenLocation, discoveryLocation, captureLocation
- **Progress Data**: syncLevel, encounterCount, battleCount, win/loss records
- **Spirit Stats**: base stats, current level, evolution stage
- **Content Unlocks**: abilities, moves, custom tags

#### 3. SpiritDexViewer.cs
Interactive console-based viewer for testing:
- **Commands**: list, show, filter, search, stats, export
- **View Modes**: All, Discovered, Captured, Unseen
- **Filtering**: By type, rarity, location, encounter count
- **Pagination**: Navigate through large spirit lists
- **Detailed Views**: Show comprehensive spirit information

#### 4. SpiritDatabase.cs
Metadata database for SpiritSpecies:
- **Species Lookup**: Get species by ID, type, rarity, category
- **Sample Data**: Pre-populated with starter and elemental spirits
- **Validation**: Data integrity checking for species entries
- **Statistics**: Type distribution, rarity breakdown, category analysis

#### 5. GameData Integration
Extended GameData.cs includes:
- `HashSet<string> discoveredSpiritIDs`
- `HashSet<string> capturedSpiritIDs`
- `Dictionary<string, SpiritCaptureData> spiritCaptureHistory`
- Player progress tracking and statistics

## 🚀 Quick Start

### Basic SpiritDex Usage

```csharp
// Create SpiritDex system
var gameData = new GameData();
var spiritDex = new SpiritDexManager(gameData);
var spiritDatabase = new SpiritDatabase();
var viewer = new SpiritDexViewer(spiritDex, spiritDatabase);

// Register discoveries and captures
spiritDex.RegisterDiscovery("starter_spirit", "Starter Spirit", "Moonlight Alley");
spiritDex.RegisterCapture("starter_spirit", "Starter Spirit", "Moonlight Alley");

// Check status
bool isDiscovered = spiritDex.IsDiscovered("starter_spirit");
bool isCaptured = spiritDex.IsCaptured("starter_spirit");

// Get entries
var allEntries = spiritDex.GetDexEntries();
var discoveredEntries = spiritDex.GetEntriesByDiscoveryStatus(true);
var capturedEntries = spiritDex.GetEntriesByCaptureStatus(true);
```

### Interactive Viewer

```csharp
// Start interactive viewer
viewer.StartInteractiveViewer();

// Available commands:
// list                    - Show current spirit list
// show <spiritID>         - Show detailed spirit information
// filter <criteria>       - Apply filters to the list
// search <term>           - Search spirits by name or ID
// stats                   - Show SpiritDex statistics
// export                  - Export current data
// mode <mode>             - Set view mode (all/discovered/captured/unseen)
```

### Filtering and Search

```csharp
// Filter examples
var filter = new SpiritDexFilter
{
    discovered = true,
    captured = false,
    type = SpiritType.Fire,
    rarity = SpiritRarity.Uncommon,
    location = "Moonlight Alley"
};

var filteredEntries = spiritDex.FilterSpirits(filter);

// Search examples
var nameResults = spiritDex.SearchByName("Starter");
var idResults = spiritDex.SearchByID("fire");
```

## ⚙️ Configuration

### SpiritDexManager Settings

```csharp
var spiritDex = new SpiritDexManager();

// Enable/disable features
spiritDex.enableAutoDiscovery = true;
spiritDex.enableCaptureTracking = true;
spiritDex.enableLocationTracking = true;
spiritDex.enableProgressTracking = true;
```

### SpiritDexViewer Settings

```csharp
var viewer = new SpiritDexViewer();

// Display configuration
viewer.entriesPerPage = 15;
viewer.showPageNumbers = true;
viewer.showRarityColors = true;
viewer.showTypeIcons = true;

// Feature toggles
viewer.enableSearch = true;
viewer.enableFiltering = true;
viewer.enableExport = true;
```

### SpiritDatabase Settings

```csharp
var database = new SpiritDatabase();

// Database configuration
database.enableAutoPopulation = true;
database.enableValidation = true;
database.enableSearch = true;
database.enableFiltering = true;
```

## 🎨 Remix System

### Custom SpiritDex Features

```csharp
// Hook into discovery events
spiritDex.OnSpiritDiscovered += (manager, spiritID) =>
{
    Console.WriteLine($"🌟 New spirit discovered: {spiritID}!");
    // Custom discovery logic
};

// Hook into capture events
spiritDex.OnSpiritCaptured += (manager, spiritID) =>
{
    Console.WriteLine($"🎉 Spirit captured: {spiritID}!");
    // Custom capture celebration
};

// Hook into entry updates
spiritDex.OnEntryUpdated += (manager, entry) =>
{
    // Custom entry update logic
};
```

### Custom Viewer Commands

```csharp
// Hook into viewer commands
viewer.OnViewerCommand += (viewer, command) =>
{
    Console.WriteLine($"Custom command handler: {command}");
    // Custom command processing
};

// Hook into entry selection
viewer.OnEntrySelected += (viewer, entry) =>
{
    Console.WriteLine($"Entry selected: {entry.spiritName}");
    // Custom selection logic
};
```

### Custom Database Features

```csharp
// Hook into database events
database.OnSpeciesAdded += (db, speciesID) =>
{
    Console.WriteLine($"Species added: {speciesID}");
    // Custom species addition logic
};

// Hook into database updates
database.OnDatabaseUpdated += (db) =>
{
    Console.WriteLine("Database updated");
    // Custom update logic
};
```

## 📊 Statistics & Analytics

### SpiritDex Statistics

```csharp
var stats = spiritDex.GetStatistics();
Console.WriteLine($"Total Seen: {stats.totalSpiritsSeen}");
Console.WriteLine($"Total Discovered: {stats.totalSpiritsDiscovered}");
Console.WriteLine($"Total Captured: {stats.totalSpiritsCaptured}");
Console.WriteLine($"Discovery Rate: {stats.discoveryPercentage:F1}%");
Console.WriteLine($"Capture Rate: {stats.completionPercentage:F1}%");
```

### Database Statistics

```csharp
var dbStats = database.GetDatabaseStats();
Console.WriteLine($"Total Species: {dbStats.totalSpecies}");
Console.WriteLine($"Total Types: {dbStats.totalTypes}");
Console.WriteLine($"Total Rarities: {dbStats.totalRarities}");

// Type distribution
foreach (var kvp in dbStats.typeDistribution)
{
    Console.WriteLine($"{kvp.Key}: {kvp.Value}");
}
```

### Entry Statistics

```csharp
var entry = spiritDex.GetEntry("starter_spirit");
if (entry != null)
{
    Console.WriteLine($"Win Rate: {entry.GetWinRate():F1}%");
    Console.WriteLine($"Completion: {entry.GetCompletionPercentage():F1}%");
    Console.WriteLine($"Days Since Discovery: {entry.DaysSinceDiscovery}");
}
```

## 🔧 Testing

### Console Testing

```csharp
// Test SpiritDex system in console
var gameData = new GameData();
var spiritDex = new SpiritDexManager(gameData);
var database = new SpiritDatabase();
var viewer = new SpiritDexViewer(spiritDex, database);

// Add sample data
spiritDex.RegisterDiscovery("test_spirit", "Test Spirit", "Test Location");
spiritDex.RegisterCapture("test_spirit", "Test Spirit", "Test Location");

// Start interactive viewer
viewer.StartInteractiveViewer();
```

### Unit Testing

```csharp
[Test]
public void TestSpiritDiscovery()
{
    var spiritDex = new SpiritDexManager();
    
    bool result = spiritDex.RegisterDiscovery("test_spirit", "Test Spirit");
    
    Assert.IsTrue(result);
    Assert.IsTrue(spiritDex.IsDiscovered("test_spirit"));
    Assert.IsFalse(spiritDex.IsCaptured("test_spirit"));
}

[Test]
public void TestSpiritCapture()
{
    var spiritDex = new SpiritDexManager();
    
    spiritDex.RegisterDiscovery("test_spirit", "Test Spirit");
    bool result = spiritDex.RegisterCapture("test_spirit", "Test Spirit");
    
    Assert.IsTrue(result);
    Assert.IsTrue(spiritDex.IsCaptured("test_spirit"));
}
```

### Integration Testing

```csharp
[Test]
public void TestGameDataIntegration()
{
    var gameData = new GameData();
    var spiritDex = new SpiritDexManager(gameData);
    
    // Test persistence
    spiritDex.RegisterDiscovery("test_spirit", "Test Spirit");
    spiritDex.RegisterCapture("test_spirit", "Test Spirit");
    
    // Verify GameData is updated
    Assert.IsTrue(gameData.IsSpiritDiscovered("test_spirit"));
    Assert.IsTrue(gameData.IsSpiritCaptured("test_spirit"));
}
```

## 🌟 Advanced Features

### Location Tracking

The system tracks where spirits were discovered and captured:
```csharp
spiritDex.RegisterDiscovery("fire_spirit", "Fire Spirit", "Volcanic Peak");
spiritDex.RegisterCapture("fire_spirit", "Fire Spirit", "Volcanic Peak");

var entry = spiritDex.GetEntry("fire_spirit");
Console.WriteLine($"Discovered at: {entry.discoveryLocation}");
Console.WriteLine($"Captured at: {entry.captureLocation}");
```

### Progress Tracking

Comprehensive tracking of spirit encounters and battles:
```csharp
var entry = spiritDex.GetEntry("starter_spirit");
entry.RecordEncounter("Moonlight Alley");
entry.RecordBattle(true, "Moonlight Alley"); // Won
entry.RecordBattle(false, "Moonlight Alley"); // Lost
entry.UpdateSyncLevel(75.5f);

Console.WriteLine($"Encounters: {entry.encounterCount}");
Console.WriteLine($"Battles: {entry.battleCount}");
Console.WriteLine($"Win Rate: {entry.GetWinRate():F1}%");
Console.WriteLine($"Sync Level: {entry.syncLevel:F1}%");
```

### Content Unlocking

Track progression through spirit content:
```csharp
var entry = spiritDex.GetEntry("legendary_spirit");
entry.UnlockLore();
entry.UnlockEvolution();
entry.AddUnlockedAbility("Legendary Power");
entry.AddUnlockedMove("Cosmic Blast");

Console.WriteLine($"Lore Unlocked: {entry.loreUnlocked}");
Console.WriteLine($"Evolution Unlocked: {entry.evolutionUnlocked}");
Console.WriteLine($"Abilities: {string.Join(", ", entry.unlockedAbilities)}");
```

### Custom Tags and Data

Extensible system for custom data:
```csharp
var entry = spiritDex.GetEntry("starter_spirit");
entry.AddCustomTag("Favorite");
entry.AddCustomTag("Strong Bond");
entry.customData = "Player's first spirit companion";

Console.WriteLine($"Tags: {string.Join(", ", entry.customTags)}");
Console.WriteLine($"Custom Data: {entry.customData}");
```

## 🔗 Integration Examples

### Battle System Integration

```csharp
// After battle, update SpiritDex
public void OnBattleEnded(BattleResult result)
{
    foreach (var enemySpirit in result.enemySpirits)
    {
        // Record encounter
        spiritDex.RegisterSighting(enemySpirit.ID, enemySpirit.Name, result.location);
        
        // Record battle result
        var entry = spiritDex.GetEntry(enemySpirit.ID);
        if (entry != null)
        {
            entry.RecordBattle(result.playerWon, result.location);
        }
    }
}
```

### Quest System Integration

```csharp
// Unlock content based on quest completion
public void OnQuestCompleted(string questID)
{
    if (questID == "discover_fire_spirit")
    {
        var entry = spiritDex.GetEntry("fire_spirit");
        if (entry != null)
        {
            entry.UnlockLore();
            entry.AddUnlockedAbility("Fire Mastery");
        }
    }
}
```

### Tutorial System Integration

```csharp
// First discovery tutorial
spiritDex.OnSpiritDiscovered += (manager, spiritID) =>
{
    var flagManager = OnboardingFlagManager.Instance;
    if (flagManager != null && !flagManager.GetFlag("FirstSpiritDiscovered"))
    {
        flagManager.SetFlag("FirstSpiritDiscovered", true);
        // Show discovery tutorial
    }
};
```

### Evolution System Integration

```csharp
// Track evolution progress
public void OnSpiritEvolved(string spiritID, string newSpeciesID)
{
    var entry = spiritDex.GetEntry(spiritID);
    if (entry != null)
    {
        entry.evolutionStage = "Evolved";
        entry.UnlockEvolution();
        entry.OnEntryUpdated?.Invoke(entry);
    }
}
```

## 📝 Contributor Notes

### For Non-Coders

1. **Spirit Discovery**: Use `RegisterDiscovery()` to mark spirits as seen
2. **Spirit Capture**: Use `RegisterCapture()` to mark spirits as caught
3. **Location Tracking**: Always provide location when registering spirits
4. **Content Unlocking**: Use `UnlockLore()` and `UnlockEvolution()` for progression
5. **Custom Data**: Add custom tags and data for personalization

### For Remixers

1. **Event Hooks**: Subscribe to `OnSpiritDiscovered`, `OnSpiritCaptured`, etc.
2. **Custom Commands**: Extend the viewer with custom commands
3. **Custom Filters**: Add new filtering criteria to `SpiritDexFilter`
4. **Custom Display**: Hook into viewer display events for custom UI
5. **Custom Validation**: Extend species validation in `SpiritDatabase`

### For Developers

1. **Extend SpiritDexEntry**: Add new fields for tracking additional data
2. **Enhance SpiritDexManager**: Add new query methods and statistics
3. **Custom Viewer Commands**: Implement new viewer functionality
4. **Database Extensions**: Add new species metadata and validation
5. **Performance Optimization**: Optimize for large numbers of spirits

## 🐛 Troubleshooting

### Common Issues

1. **Spirits Not Appearing**: Check if `RegisterDiscovery()` was called
2. **Capture Not Working**: Ensure `RegisterCapture()` is called after discovery
3. **Location Not Tracking**: Verify location parameter is provided
4. **GameData Not Persisting**: Check GameData integration and save calls
5. **Viewer Commands Not Working**: Verify viewer initialization and dependencies

### Debug Information

```csharp
// Enable debug output
Console.WriteLine(spiritDex.GetSpiritDexSummary());
Console.WriteLine(database.GetDatabaseSummary());

// Check specific entries
var entry = spiritDex.GetEntry("spirit_id");
if (entry != null)
{
    Console.WriteLine(entry.GetDetailedInfo());
}
else
{
    Console.WriteLine("Entry not found");
}
```

### Validation

```csharp
// Validate species data
var species = new SpiritSpecies { /* ... */ };
var errors = database.ValidateSpecies(species);

if (errors.Count > 0)
{
    foreach (var error in errors)
    {
        Console.WriteLine($"Validation Error: {error}");
    }
}
```

## 📚 Related Systems

- **Battle System**: Spirit encounters and battle tracking
- **Capture System**: Spirit capture mechanics and results
- **Quest System**: Discovery objectives and content unlocking
- **Tutorial System**: First discovery and capture guidance
- **Evolution System**: Evolution stage tracking and requirements
- **Lore System**: Spirit information and story content
- **Inventory System**: Capture items and spirit management

---

*This SpiritDex system is designed to be modular, extensible, and contributor-friendly. All components can be customized and extended without modifying core functionality.*