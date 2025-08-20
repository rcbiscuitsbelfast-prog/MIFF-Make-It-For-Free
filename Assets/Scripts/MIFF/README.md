# MIFF Modular Inventory System

A complete, modular inventory system for the MIFF K-pop spirit battle framework that integrates with both overworld and battle gameplay.

## 🎯 **System Overview**

The modular inventory system provides:
- **Item Management**: Add, remove, and track item counts
- **Context-Aware Usage**: Different behavior for battle vs. overworld
- **Effect System**: Modular item effects via ScriptableObjects
- **UI Integration**: Bag interface for both contexts
- **Persistence**: Save/load inventory state
- **Contributor-Friendly**: Easy to create new items and effects

## 📁 **File Structure**

```
Assets/Scripts/MIFF/
├── Core/
│   ├── InventoryManager.cs      # Main inventory logic
│   ├── PlayerContext.cs         # Player context for item usage
│   ├── TargetContext.cs         # Target context for item effects
│   └── Spirit.cs                # Basic spirit class
├── Items/
│   ├── Item_SO.cs               # Base item ScriptableObject
│   ├── IItemEffect.cs           # Item effect interface
│   ├── ItemDatabase.cs          # Item registry
│   └── ItemEffects/
│       ├── HealHPEffect.cs      # Healing items
│       ├── ReviveEffect.cs      # Revival items
│       ├── BuffStatEffect.cs    # Stat buffing items
│       └── QuestFlagEffect.cs   # Quest progression items
├── UI/
│   ├── BagUIController.cs       # Main bag interface
│   ├── BagItemSlot.cs           # Individual item slots
│   └── InventoryButton.cs       # Button to open inventory
├── Battle/
│   └── BattleController.cs      # Battle integration
└── Editor/
    └── ItemDatabaseEditor.cs    # Database editor tools
```

## 🔧 **Core Components**

### **InventoryManager**
- Singleton that manages all inventory operations
- Provides methods: `AddItem()`, `RemoveItem()`, `GetItemCount()`, `GetAllItems()`
- Raises events for UI updates: `OnInventoryChanged`, `OnItemAdded`, `OnItemRemoved`
- Automatically saves/loads inventory state

### **Item_SO**
- ScriptableObject base class for all items
- Properties: ID, name, description, icon, cost, usability flags
- Links to `IItemEffect` for behavior
- Auto-generates IDs and validates data

### **IItemEffect Interface**
- Contract for implementing item effects
- Methods: `Apply()`, `GetEffectDescription()`, `CanApplyTo()`
- Allows for easy extension of item behaviors

### **ItemDatabase**
- Registry for all items in the game
- Provides lookup by ID and filtering by type
- Includes validation tools for content creators

## 🎮 **Usage Examples**

### **Creating a New Item**
1. Right-click in Project → Create → MIFF → Items → Item
2. Fill in basic properties (name, description, icon)
3. Assign an appropriate effect from the ItemEffects folder
4. Add to ItemDatabase asset

### **Using Items in Code**
```csharp
// Add items to inventory
InventoryManager.Instance.AddItem("potion", 5);

// Check if player has items
if (InventoryManager.Instance.HasItem("revive", 1))
{
    // Player can revive a spirit
}

// Use an item
var item = ItemDatabase.Instance.GetItem("potion");
var playerContext = new PlayerContext(playerObject, false, false);
var targetContext = new TargetContext(spiritObject, spirit);
item.UseItem(playerContext, targetContext);
```

### **Battle Integration**
```csharp
// Start battle with inventory
battleController.StartBattle(soloMode: false);
bagUI.SetBattleContext(true, false);

// Handle item usage
battleController.ReceivePlayerAction(usedItem);
```

## 🎨 **UI Components**

### **BagUIController**
- Main interface for the bag system
- Automatically filters items by context (battle/overworld)
- Handles item usage and inventory updates
- Integrates with battle system for solo mode restrictions

### **BagItemSlot**
- Individual item display with icon, name, and count
- Use and info buttons
- Context-aware button states
- Event-driven communication with parent

### **InventoryButton**
- Simple button component for opening inventory
- Can be placed anywhere in your UI
- Automatically finds BagUIController in scene

## 🔄 **Event System**

The system uses UnityEvents for loose coupling:
- `OnInventoryChanged`: Fired when any item count changes
- `OnItemAdded`: Fired when items are added
- `OnItemRemoved`: Fired when items are removed
- `OnUseItem`: Fired when items are used from UI

## 💾 **Persistence**

Currently uses PlayerPrefs for simple persistence:
- Automatically saves on inventory changes
- Loads on game start
- Can be easily replaced with your GameData system

## 🧪 **Testing**

### **Quick Start**
1. Add `InventoryManager` to a GameObject in your scene
2. Create an `ItemDatabase` asset and assign it
3. Set up `BagUIController` with UI references
4. Use context menu "Add Test Items" to populate inventory
5. Open bag UI to see items

### **Testing Commands**
- **Add Test Items**: Right-click InventoryManager → Add Test Items
- **Clear Inventory**: Right-click InventoryManager → Clear Inventory
- **Validate Items**: Use ItemDatabase editor tools

## 🚀 **Extension Points**

### **New Item Effects**
1. Create new class implementing `IItemEffect`
2. Inherit from `ScriptableObject`
3. Implement required methods
4. Create asset and assign to items

### **Custom Item Types**
1. Extend `Item_SO` or create new ScriptableObject
2. Implement custom logic in `UseItem()` method
3. Add to ItemDatabase for discovery

### **UI Customization**
1. Modify `BagItemSlot` prefab for visual changes
2. Extend `BagUIController` for additional functionality
3. Create custom inventory layouts

## 🔗 **Integration Notes**

- **Battle System**: Integrates with `BattleController` for turn management
- **Quest System**: `QuestFlagEffect` can trigger quest progression
- **Spirit System**: Items can target and affect `Spirit` objects
- **Save System**: Ready to integrate with your `GameData` persistence

## 📋 **Contributor Workflow**

### **For Content Creators**
1. Create `Item_SO` assets with unique IDs
2. Assign appropriate effects from the ItemEffects folder
3. Set usability flags (battle/overworld)
4. Add to ItemDatabase for automatic discovery

### **For Developers**
1. Extend effect system by implementing `IItemEffect`
2. Modify UI components for custom layouts
3. Integrate with existing systems via events
4. Add new item types as needed

### **For Designers**
1. Plan item progression and availability
2. Balance item costs and effects
3. Design UI flow and user experience
4. Create item descriptions and visual assets

## 🐛 **Troubleshooting**

### **Common Issues**
- **Items not appearing**: Check ItemDatabase registration
- **Effects not working**: Verify IItemEffect implementation
- **UI not updating**: Check event connections
- **Persistence issues**: Verify PlayerPrefs permissions

### **Debug Tools**
- Use `Debug.Log` statements in effect implementations
- Check Console for validation warnings
- Use ItemDatabase validation tools
- Test with context menu commands

## 🔮 **Future Enhancements**

- **Stacking System**: Automatic item stacking and splitting
- **Item Categories**: Filtering and sorting by type
- **Crafting System**: Combine items to create new ones
- **Trading System**: Exchange items between players
- **Item History**: Track item usage and acquisition
- **Advanced Effects**: Chain effects and conditional logic

---

**MIFF Framework** - Modular, remix-safe, contributor-friendly game development