# Spirit Capture System

A modular, remix-safe spirit capture system for K-pop battle games. This system handles capture attempts after battle, tracks discovered and captured spirits, and integrates seamlessly with the battle system.

## 🎯 Overview

The Spirit Capture System provides:
- **CaptureManager**: Handles capture logic and chance calculations
- **SpiritDexManager**: Tracks discovered and captured spirits
- **CaptureResult**: Detailed results of capture attempts
- **BattleController Integration**: Seamless integration with the battle system
- **GameData Persistence**: Saves capture progress and statistics

## 🏗️ Architecture

### Core Components

#### 1. CaptureManager.cs
The main controller for capture logic:
- Calculates capture chances based on multiple factors
- Handles critical captures
- Integrates with SpiritDexManager
- Provides extensive remix hooks

**Key Features:**
- Base capture chance (configurable)
- HP-based modifiers (lower HP = higher chance)
- Rarity scaling (rarer spirits = harder to capture)
- Level scaling (higher level = harder to capture)
- Status effect bonuses
- Player bonuses (level, items, skill, luck)

#### 2. SpiritDexManager.cs
Manages the SpiritDex database:
- Tracks discovered and captured spirits
- Provides statistics and filtering
- Supports search and categorization
- Maintains encounter history

**Key Methods:**
- `RegisterDiscovery(string spiritID)`
- `RegisterCapture(string spiritID)`
- `RegisterSighting(string spiritID)`
- `GetCompletionPercentage()`
- `FilterSpirits(SpiritDexFilter)`

#### 3. CaptureResult.cs
Detailed results of capture attempts:
- Success/Fail/AlreadyCaptured status
- Capture chance and timing information
- Critical capture detection
- Debug information for remixers

#### 4. SpiritDexEntry.cs
Individual spirit entries with rich data:
- Discovery and capture dates
- Encounter tracking (sightings, battles)
- Spirit information (abilities, moves, types)
- Capture history and statistics

### Integration Points

#### BattleController Integration
The capture system integrates with the battle system:
- Automatic capture attempts after wild battles
- Manual capture attempts during battle
- Capture chance calculations
- Event-driven capture results

#### GameData Extension
Extended GameData.cs includes:
- `capturedSpiritIDs`: HashSet of captured spirit IDs
- `discoveredSpiritIDs`: HashSet of discovered spirit IDs
- `spiritCaptureHistory`: Detailed capture data
- Player progress tracking

## 🚀 Quick Start

### Basic Capture Usage

```csharp
// Create capture manager
var captureManager = new CaptureManager();

// Create player context
var playerContext = new PlayerContext
{
    PlayerLevel = 5,
    HasCaptureItem = true,
    CaptureSkill = 10,
    Luck = 15
};

// Attempt capture
var result = captureManager.TryCapture(spiritInstance, playerContext);

if (result.IsSuccess)
{
    Console.WriteLine($"Captured {result.spiritName}!");
}
else
{
    Console.WriteLine($"Capture failed: {result.message}");
}
```

### BattleController Integration

```csharp
// Battle controller automatically handles capture
var battleController = new BattleController();

// After battle ends, auto-attempt capture
battleController.AutoAttemptCaptureAfterBattle(playerContext);

// Or manually attempt capture
var result = battleController.AttemptCapture(enemySpirit, playerContext);
```

### SpiritDex Management

```csharp
var spiritDex = new SpiritDexManager();

// Register discoveries and captures
spiritDex.RegisterDiscovery("starter_spirit");
spiritDex.RegisterCapture("starter_spirit");

// Get statistics
var stats = spiritDex.GetStatistics();
Console.WriteLine($"Completion: {stats.completionPercentage:F1}%");
```

## ⚙️ Configuration

### CaptureManager Settings

```csharp
var captureManager = new CaptureManager();

// Adjust base capture chance
captureManager.baseCaptureChance = 0.4f; // 40% base chance

// Modify rarity scaling
captureManager.rarityModifier = 0.2f; // Less aggressive rarity penalty

// Enable/disable features
captureManager.enableCriticalCaptures = true;
captureManager.enableRarityScaling = true;
captureManager.enableLevelScaling = true;
```

### BattleController Capture Settings

```csharp
var battleController = new BattleController();

// Configure capture behavior
battleController.autoAttemptCapture = true;
battleController.captureOnlyWildSpirits = true;
battleController.captureAttemptDelay = 2.0f;
```

## 🎨 Remix System

### Custom Capture Rules

```csharp
// Add custom modifiers
captureManager.AddCustomModifier("SeasonalBonus", 0.1f);

// Set custom capture chances
captureManager.SetCustomCaptureChance(0.5f);

// Hook into capture events
captureManager.OnCaptureSucceeded += (manager, result) =>
{
    // Custom celebration logic
    Console.WriteLine($"🎉 Special capture: {result.spiritName}!");
};
```

### Custom SpiritDex Features

```csharp
var spiritDex = new SpiritDexManager();

// Enable custom features
spiritDex.enableCustomEntries = true;
spiritDex.enableCustomCategories = true;
spiritDex.enableCustomFilters = true;

// Hook into discovery events
spiritDex.OnSpiritDiscovered += (manager, spiritID) =>
{
    // Custom discovery logic
    Console.WriteLine($"🌟 New spirit discovered: {spiritID}!");
};
```

## 📊 Statistics & Analytics

### Capture Statistics

```csharp
var stats = captureManager.GetCaptureStats(spiritInstance);
Console.WriteLine($"Success Rate: {stats.SuccessRate:P1}");
Console.WriteLine($"Total Attempts: {stats.totalAttempts}");
Console.WriteLine($"Average Chance: {stats.averageChance:P1}");
```

### SpiritDex Statistics

```csharp
var dexStats = spiritDex.GetStatistics();
Console.WriteLine($"Completion: {dexStats.completionPercentage:F1}%");
Console.WriteLine($"Discovery: {dexStats.discoveryPercentage:F1}%");
Console.WriteLine($"Total Captured: {dexStats.totalSpiritsCaptured}");
```

## 🔧 Testing

### Console Testing

```csharp
// Test capture system in console
var captureManager = new CaptureManager();
var spiritDex = new SpiritDexManager();

// Create test spirit
var testSpirit = new SpiritInstance
{
    SpiritID = "test_spirit",
    Nickname = "Test Spirit",
    Level = 5,
    CurrentHP = 25,
    MaxHP = 100,
    Rarity = SpiritRarity.Common
};

// Test capture
var result = captureManager.TryCapture(testSpirit, new PlayerContext());
Console.WriteLine(result.GetSummary());
```

### Unit Testing

```csharp
[Test]
public void TestCaptureSuccess()
{
    var captureManager = new CaptureManager();
    var spirit = CreateTestSpirit();
    var player = CreateTestPlayer();
    
    var result = captureManager.TryCapture(spirit, player);
    
    Assert.IsTrue(result.IsSuccess);
    Assert.AreEqual("test_spirit", result.spiritID);
}
```

## 🌟 Advanced Features

### Critical Captures

The system supports critical captures with increased success rates:
- 15% chance of critical capture (configurable)
- 1.5x capture chance multiplier
- Special event triggers for critical captures

### Status Effect Bonuses

Various status effects provide capture bonuses:
- **Sleep**: +20% capture chance
- **Freeze**: +15% capture chance
- **Paralysis**: +10% capture chance
- **Poison**: +5% capture chance
- **Confusion**: +10% capture chance

### Rarity Scaling

Different rarity levels affect capture difficulty:
- **Common**: No penalty
- **Uncommon**: -10% capture chance
- **Rare**: -20% capture chance
- **Epic**: -30% capture chance
- **Legendary**: -40% capture chance
- **Mythical**: -50% capture chance

## 🔗 Integration Examples

### Quest System Integration

```csharp
// Capture system can trigger quest progress
captureManager.OnCaptureSucceeded += (manager, result) =>
{
    var questManager = QuestManager.Instance;
    if (questManager != null)
    {
        questManager.UpdateObjective("CaptureSpirits", 1);
    }
};
```

### Tutorial System Integration

```csharp
// First capture tutorial
captureManager.OnCaptureSucceeded += (manager, result) =>
{
    var flagManager = OnboardingFlagManager.Instance;
    if (flagManager != null && !flagManager.GetFlag("FirstCaptureSeen"))
    {
        flagManager.SetFlag("FirstCaptureSeen", true);
        // Show capture tutorial
    }
};
```

### Lore System Integration

```csharp
// Unlock lore entries on capture
captureManager.OnCaptureSucceeded += (manager, result) =>
{
    var loreDatabase = LoreDatabase.Instance;
    if (loreDatabase != null)
    {
        var loreEntry = loreDatabase.GetByID($"spirit_{result.spiritID}_capture");
        if (loreEntry != null)
        {
            // Unlock capture lore
        }
    }
};
```

## 📝 Contributor Notes

### For Non-Coders

1. **Capture Chances**: Adjust `baseCaptureChance` in CaptureManager for easier/harder captures
2. **Rarity Effects**: Modify `rarityModifier` to change how rarity affects capture difficulty
3. **Auto-Capture**: Set `autoAttemptCapture = true` in BattleController for automatic captures
4. **Capture Items**: Enable `HasCaptureItem = true` in PlayerContext for bonus capture chances

### For Remixers

1. **Custom Events**: Hook into `OnCaptureSucceeded`, `OnCaptureFailed`, etc.
2. **Custom Modifiers**: Use `AddCustomModifier()` for special capture bonuses
3. **Custom Rules**: Override capture logic by extending CaptureManager
4. **Custom UI**: Use capture events to trigger custom UI elements

### For Developers

1. **Extend CaptureManager**: Add new capture mechanics and modifiers
2. **Enhance SpiritDex**: Add new tracking fields and statistics
3. **Integrate Systems**: Connect capture system with other game systems
4. **Performance**: Optimize for large numbers of spirits and captures

## 🐛 Troubleshooting

### Common Issues

1. **Capture Not Working**: Check if `enableCaptureSystem = true`
2. **No Wild Spirits**: Ensure `captureOnlyWildSpirits = false` or spirits have correct trainer IDs
3. **Low Capture Rates**: Adjust `baseCaptureChance` and modifier values
4. **Missing Events**: Verify event subscriptions in InitializeCaptureSystem()

### Debug Information

```csharp
// Enable debug output
var result = captureManager.TryCapture(spirit, player);
Console.WriteLine(result.GetDetailedInfo());

// Check capture manager status
Console.WriteLine(captureManager.GetCaptureManagerSummary());

// Verify SpiritDex status
Console.WriteLine(spiritDex.GetSpiritDexSummary());
```

## 📚 Related Systems

- **Battle System**: Core battle mechanics and turn management
- **Inventory System**: Item management and capture item integration
- **Quest System**: Capture-based objectives and rewards
- **Tutorial System**: First capture guidance and onboarding
- **Lore System**: Spirit information and capture stories
- **Evolution System**: Post-capture evolution triggers

---

*This capture system is designed to be modular, extensible, and contributor-friendly. All components can be customized and extended without modifying core functionality.*