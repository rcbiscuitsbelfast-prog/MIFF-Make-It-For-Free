# SpiritDex Entry System

A comprehensive, modular system for managing detailed SpiritDex entries in the K-pop spirit battle game. This system provides extensive data tracking, search capabilities, and remix hooks for contributors.

## Overview

The SpiritDex Entry System consists of three core components:

1. **SpiritDexEntry** - Comprehensive data structure for individual spirit entries
2. **SpiritDexManager** - Central manager for entry operations and queries
3. **SpiritDatabase** - Metadata database for SpiritSpecies lookup

## Core Components

### SpiritDexEntry

Represents a comprehensive SpiritDex entry with extensive fields for detailed spirit information.

**Key Features:**
- **Identity**: Unique ID, name, species, display name
- **Classification**: Primary/secondary types, rarity, category
- **Physical**: Height, weight, description, appearance
- **Personality**: Traits, origin story, relationships
- **Lore**: Background, cultural significance, fandom traits
- **Evolution**: Path, stages, requirements
- **Battle**: Stats, abilities, moves, training
- **Status**: Capture, discovery, completion tracking
- **Custom**: Extensible fields and tags for remixers

**Enums:**
- `EntryStatus`: Unknown, Seen, Discovered, Complete
- `CaptureStatus`: Unknown, NotCaptured, Captured, Failed, Escaped
- `DiscoveryStatus`: Unknown, NotSeen, Seen, Discovered
- `SpiritType`: Comprehensive type system including musical genres
- `SpiritRarity`: Common, Uncommon, Rare, Epic, Legendary, Mythical
- `SpiritCategory`: Normal, Starter, Evolution, Regional, Event, Seasonal, Special, Mythical, Custom

### SpiritDexManager

Central manager for all SpiritDex operations with advanced search, filtering, and data management capabilities.

**Key Features:**
- **Entry Management**: Add, update, remove, and query entries
- **Search & Filter**: Text search, type/rarity/category filtering
- **Sorting**: Multiple sort criteria with ascending/descending options
- **Indexing**: Efficient lookup via search indices
- **Statistics**: Comprehensive database analytics
- **Data Export/Import**: JSON format for external tools
- **Validation**: Entry integrity checking and corruption detection
- **Remix Hooks**: Extensive event system for custom extensions

**Configuration Options:**
- Auto-save, validation, search indexing
- Statistics tracking, remix hooks
- Fuzzy search, result limits
- Data format, backup directory

### SpiritDatabase

Metadata database for SpiritSpecies lookup and management.

**Key Features:**
- **Species Management**: Add, update, remove species
- **Indexed Lookup**: Fast queries by type, rarity, category
- **Search**: Text-based species search
- **Statistics**: Database analytics and distribution data
- **Sample Data**: Pre-populated with starter, evolved, and legendary spirits
- **Validation**: Data integrity checking
- **Remix Hooks**: Event system for custom extensions

## Usage Examples

### Creating a New SpiritDex Entry

```csharp
var entry = new SpiritDexEntry("spirit_001", "Lumino", SpiritType.Pop)
{
    displayName = "Lumino the Starter",
    description = "A bright and energetic starter spirit",
    primaryType = SpiritType.Pop,
    secondaryType = SpiritType.Light,
    rarity = SpiritRarity.Common,
    category = SpiritCategory.Starter,
    // ... set other fields
};

SpiritDexManager.Instance.AddSpiritEntry(entry);
```

### Searching and Filtering

```csharp
// Text search
var results = SpiritDexManager.Instance.SearchSpirits("Lumino", maxResults: 10);

// Filter by type
var filter = new SpiritDexFilter
{
    primaryType = SpiritType.Pop,
    rarity = SpiritRarity.Common
};
var filtered = SpiritDexManager.Instance.FilterSpirits(filter);

// Sort by completion
var sorted = SpiritDexManager.Instance.SortSpirits(
    filtered, 
    SpiritDexSortCriteria.Completion, 
    ascending: false
);
```

### Adding Custom Fields

```csharp
entry.SetCustomField("fandomSize", "1.2M");
entry.SetCustomField("debutDate", "2024-01-15");
entry.AddCustomTag("trending");
entry.AddCustomTag("viral");
```

## Remix Safety Features

### Event System

All major operations emit events for remixers to hook into:

```csharp
// Listen for entry updates
SpiritDexManager.Instance.OnEntryUpdated += (manager, entry) =>
{
    Console.WriteLine($"Entry updated: {entry.spiritName}");
    // Custom logic here
};

// Listen for validation
SpiritDexManager.Instance.OnEntryValidated += (manager, entry) =>
{
    // Custom validation logic
};
```

### Extensible Fields

The system supports unlimited custom fields and tags:

```csharp
// Add custom metadata
entry.SetCustomField("socialMedia", "instagram:lumino_official");
entry.SetCustomField("fanClub", "Luminators");

// Add custom tags
entry.AddCustomTag("fan-favorite");
entry.AddCustomTag("award-winning");
```

### Custom Validation

Remixers can implement custom validation logic:

```csharp
// Custom validation hook
entry.OnEntryValidated += (entry) =>
{
    // Check custom business rules
    if (entry.GetCustomField("fandomSize") == null)
    {
        entry.MarkAsCorrupted("Missing fandom size");
        return false;
    }
    return true;
};
```

## Contributor Workflow

### For Non-Coders

1. **Create New Entries**: Use the `SpiritDexEntry` constructor with required fields
2. **Add Custom Data**: Use `SetCustomField()` and `AddCustomTag()` for additional information
3. **Update Entries**: Modify fields and call `UpdateEntry()` to save changes
4. **Search & Filter**: Use the manager's search and filter methods to find specific entries

### For Remixers

1. **Extend Fields**: Add new enums, properties, or custom fields
2. **Hook Events**: Listen to system events for custom logic
3. **Custom Validation**: Implement validation rules via event hooks
4. **Data Export**: Use JSON export/import for external tool integration

### For Developers

1. **Add New Types**: Extend enums for new spirit types or categories
2. **Implement Managers**: Create specialized managers for specific domains
3. **Database Integration**: Connect to external databases or APIs
4. **Performance Optimization**: Implement caching or indexing strategies

## Testing

### Console Testing

The system is designed for console/headless testing:

```csharp
// Test entry creation
var entry = new SpiritDexEntry("test_001", "TestSpirit", SpiritType.Normal);
Console.WriteLine($"Created entry: {entry.GetSummary()}");

// Test manager operations
SpiritDexManager.Instance.AddSpiritEntry(entry);
var retrieved = SpiritDexManager.Instance.GetEntryByID("test_001");
Console.WriteLine($"Retrieved: {retrieved.GetSummary()}");

// Test search
var results = SpiritDexManager.Instance.SearchSpirits("Test");
Console.WriteLine($"Search results: {results.Count}");
```

### Validation Testing

```csharp
// Test entry validation
var isValid = entry.ValidateEntry();
Console.WriteLine($"Entry valid: {isValid}");

// Test corruption detection
entry.MarkAsCorrupted("Test corruption");
var status = entry.GetStatus();
Console.WriteLine($"Entry status: {status}");
```

## Performance Considerations

### Indexing

The system maintains multiple indices for efficient querying:
- **Search Index**: Text-based search across all fields
- **Type Index**: Fast lookup by spirit type
- **Rarity Index**: Quick filtering by rarity
- **Category Index**: Efficient category-based queries

### Memory Management

- Entries are stored in memory for fast access
- Large datasets can be paginated via `maxResults` parameters
- Custom fields use dictionaries for efficient storage

### Scalability

- The system can handle thousands of entries efficiently
- Search operations are optimized with result limits
- Bulk operations support for large datasets

## Integration Points

### GameData Integration

The system integrates with the central `GameData` class:
- `discoveredSpiritIDs`: Tracks discovered spirits
- `capturedSpiritIDs`: Tracks captured spirits
- Automatic persistence and loading

### Battle System Integration

- Battle results can update entry statistics
- Capture attempts update entry status
- Evolution triggers update entry evolution stage

### Quest System Integration

- Quest completion can unlock new entries
- Special conditions can mark entries as discovered
- Quest rewards can provide entry metadata

## Future Enhancements

### Planned Features

1. **Image Support**: Sprite and illustration management
2. **Audio Integration**: Theme music and sound effects
3. **Localization**: Multi-language support for entry text
4. **Cloud Sync**: Cross-device entry synchronization
5. **Analytics**: Player behavior and entry interaction tracking

### Extension Points

1. **Custom Field Types**: Support for complex data structures
2. **Plugin System**: Modular extensions for specialized functionality
3. **API Integration**: External data sources and services
4. **Machine Learning**: Intelligent entry suggestions and completion

## Troubleshooting

### Common Issues

1. **Entry Not Found**: Check ID spelling and case sensitivity
2. **Validation Failures**: Ensure required fields are populated
3. **Performance Issues**: Use result limits and specific filters
4. **Memory Issues**: Consider pagination for large datasets

### Debug Tools

```csharp
// Enable debug logging
SpiritDexManager.Instance.enableDebugLogging = true;

// Get detailed statistics
var stats = SpiritDexManager.Instance.GetStatistics();
Console.WriteLine(stats.ToString());

// Validate all entries
SpiritDexManager.Instance.ValidateAllEntries();
```

## License and Attribution

This system is part of the MIFF (Modular, Remix-Safe, Contributor-Friendly) framework. It is designed to be freely remixed and extended by contributors while maintaining system integrity and performance.

---

**Note**: This system is designed to be Unity-independent and can be used in any C# environment. For Unity integration, additional ScriptableObject wrappers can be created to provide editor-friendly data management.