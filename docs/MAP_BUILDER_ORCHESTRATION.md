# Map Builder Orchestration - Live Triggers, Overlay Wiring & Gameplay Logic

**Date**: Current  
**Scope**: Enhanced Map Builder with full orchestration capabilities  
**Status**: ✅ COMPLETE

## Overview

The Map Builder has been extended into a fully orchestrated experience where contributors can assign triggers, wire overlays, and preview gameplay logic live—building not just maps, but complete playable games inside the game.

## Features

### 🎯 Trigger Assignment System
- **Trigger Panel**: Dedicated sidebar for trigger configuration
- **Trigger Types**: showModal, addToInventory, startDialogue, teleport, pickup
- **Trigger Events**: onStep, onInteract, onClick, onProximity
- **Visual Indicators**: Red dots on tiles with assigned triggers
- **Live Assignment**: Click tiles to assign triggers with real-time feedback

### 🔗 Overlay Wiring
- **Dispatcher Integration**: All overlays route through unified dispatcher
- **Modal Types**: LoreModal, PickupModal, GameOverModal, IntroModal
- **Live Preview**: Test overlays immediately in playtest mode
- **Data Binding**: Trigger data automatically populates overlay content

### 🎮 Gameplay Logic Preview
- **Playtest Mode**: Toggle between build and play modes
- **Live Interaction**: Click to move player and trigger events
- **Inventory System**: Track items added through triggers
- **Trigger Execution**: Real-time overlay display and state changes

### 💾 Enhanced Save & Export
- **Orchestration Metadata**: Complete trigger and overlay configuration
- **JSON Export**: Full map data with triggers and orchestration
- **Remix Integration**: Export includes starter pack links
- **Contributor Ready**: Generated maps ready for remix workflow

## Technical Implementation

### Trigger System Architecture
```javascript
// Trigger data structure
const trigger = {
  type: 'showModal',           // Trigger type
  event: 'onStep',             // Trigger event
  data: {                      // Trigger-specific data
    modalType: 'lore',
    text: 'Welcome to the grove!'
  }
};

// Trigger storage
builder.triggers.set('1,2', trigger);  // Position-based storage
```

### Overlay Integration
```javascript
// Dispatcher integration
function executeTrigger(trigger) {
  switch (trigger.type) {
    case 'showModal':
      const modalType = trigger.data.modalType || 'lore';
      const text = trigger.data.text || 'Trigger activated!';
      
      if (modalType === 'lore') {
        UI.showLore({ title: 'Lore', text: text });
      } else if (modalType === 'pickup') {
        UI.showLore({ title: 'Item Found!', text: text });
      }
      break;
  }
}
```

### Playtest Mode
```javascript
// Playtest state management
let builder = {
  playtestMode: false,
  player: { x: 0, y: 0, inventory: [] },
  triggers: new Map()
};

// Player interaction
function handlePlaytestClick() {
  const world = screenToWorld(mouse.x, mouse.y);
  const grid = worldToGrid(world.x, world.y);
  const tileKey = `${grid.x},${grid.y}`;
  
  // Move player
  builder.player.x = grid.x;
  builder.player.y = grid.y;
  
  // Check for triggers
  if (builder.triggers.has(tileKey)) {
    const trigger = builder.triggers.get(tileKey);
    executeTrigger(trigger);
  }
}
```

## User Interface

### Trigger Panel
- **Position**: Right sidebar, toggleable
- **Controls**: Trigger type, event, modal type, data input
- **Actions**: Assign trigger, clear trigger, toggle playtest
- **Visual Feedback**: Selected tile highlighting, trigger indicators

### Visual Indicators
- **Trigger Dots**: Red circles on tiles with assigned triggers
- **Selected Tile**: Blue outline for tile selected for trigger assignment
- **Player Marker**: Cyan circle showing player position in playtest mode
- **HUD Updates**: Real-time display of trigger count and player state

### Mode Switching
- **Build Mode**: Normal tile placement and trigger assignment
- **Playtest Mode**: Player movement and trigger execution
- **Visual Cues**: Button text changes, HUD updates, cursor behavior

## Orchestration Workflow

### 1. Map Building
1. **Place Tiles**: Drag and drop tiles onto the grid
2. **Assign Sprites**: Add player and NPC sprites to tiles
3. **Configure Game Type**: Select narrative, puzzle, combat, or sandbox

### 2. Trigger Assignment
1. **Open Trigger Panel**: Click "🎯 Triggers" button
2. **Select Tile**: Click on placed tile to select for trigger assignment
3. **Configure Trigger**: Choose type, event, and data
4. **Assign Trigger**: Click "Assign Trigger" to save configuration
5. **Visual Feedback**: Red dot appears on tile with trigger

### 3. Playtest & Preview
1. **Enter Playtest Mode**: Click "🎮 Playtest Mode" button
2. **Move Player**: Click on tiles to move player character
3. **Test Triggers**: Click on triggered tiles to execute events
4. **Preview Overlays**: See overlays display with trigger data
5. **Exit Playtest**: Click "🏗️ Build Mode" to return to building

### 4. Export & Remix
1. **Export Map**: Click "Export Remix" button
2. **Review Data**: Check trigger count and orchestration in export overlay
3. **Download JSON**: Get complete map with triggers and orchestration
4. **Access Resources**: Links to starter packs and contributor guides

## Trigger Types

### Show Modal
- **Purpose**: Display overlay modals with custom content
- **Events**: onStep, onInteract, onClick, onProximity
- **Data**: modalType (lore, pickup, gameover, intro), text content
- **Use Cases**: Lore discovery, item descriptions, game endings

### Add to Inventory
- **Purpose**: Add items to player inventory
- **Events**: onStep, onInteract, onClick
- **Data**: item name, quantity
- **Use Cases**: Collecting resources, finding treasures

### Start Dialogue
- **Purpose**: Begin dialogue sequences with NPCs
- **Events**: onInteract, onClick
- **Data**: dialogueId, npcId
- **Use Cases**: NPC conversations, quest interactions

### Teleport
- **Purpose**: Move player to new location
- **Events**: onStep, onInteract, onClick
- **Data**: x, y coordinates, zone name
- **Use Cases**: Portal mechanics, level transitions

### Pickup Item
- **Purpose**: Pick up and remove items from world
- **Events**: onInteract, onClick
- **Data**: item name, pickup message
- **Use Cases**: Collectible items, consumables

## Export Format

### Enhanced Map Data
```json
{
  "version": "1.0",
  "zone": "map_builder_export",
  "gameType": "narrative",
  "biome": "grove",
  "size": { "width": 8, "height": 8 },
  "layers": {
    "terrain": { "1,1": "grass_01", "2,1": "path_stone" },
    "props": {},
    "npcs": { "1,1": "mainCharacter" }
  },
  "triggers": {
    "2,1": {
      "type": "showModal",
      "event": "onStep",
      "data": {
        "modalType": "lore",
        "text": "Welcome to the grove!"
      }
    }
  },
  "orchestration": {
    "spawn": { "x": 0, "y": 0 },
    "gameType": "narrative",
    "features": ["dialogue", "lore", "exploration"],
    "triggers": [
      {
        "position": { "x": 2, "y": 1 },
        "type": "showModal",
        "event": "onStep",
        "data": { "modalType": "lore", "text": "Welcome to the grove!" }
      }
    ]
  }
}
```

## Benefits

### For Contributors
- **Visual Learning**: See how triggers and overlays work together
- **Live Testing**: Test gameplay logic immediately
- **Complete Workflow**: Build, test, and export in one tool
- **Remix Ready**: Generated maps ready for further development

### For Framework
- **Orchestration Demo**: Shows MIFF's orchestration capabilities
- **Interactive Learning**: Hands-on experience with game mechanics
- **Complete Example**: Full implementation of trigger and overlay systems
- **Contributor Onboarding**: Interactive introduction to orchestration

### For Community
- **Creative Expression**: Build complex interactive experiences
- **Learning Resource**: Understand game development concepts
- **Remix Starting Point**: Generate sophisticated base maps
- **Collaboration Tool**: Share and iterate on interactive designs

## Verification Results

### Screenshots Captured
- `tests/showcase_map_builder_triggers.png` - Trigger panel with assignment controls
- `tests/showcase_map_builder_playtest.png` - Playtest mode with player and triggers
- `tests/showcase_map_builder_overlay_wiring.png` - Export overlay with orchestration data

### Functionality Verified
- ✅ Trigger assignment system works correctly
- ✅ Overlays route via dispatcher with proper data binding
- ✅ Playtest mode executes triggers and displays overlays
- ✅ Export includes complete orchestration metadata
- ✅ Visual indicators show triggers and selected tiles
- ✅ Mode switching between build and playtest works
- ✅ HUD updates with trigger count and player state

## Future Enhancements

### Potential Features
1. **Advanced Triggers**: Conditional logic, timers, state machines
2. **Multi-layer Triggers**: Terrain, props, and NPC-specific triggers
3. **Script Integration**: Custom JavaScript trigger functions
4. **Collaborative Building**: Real-time multiplayer editing
5. **Template Library**: Pre-built trigger configurations

### Technical Improvements
1. **Performance Optimization**: Efficient trigger execution and rendering
2. **Save System**: Local storage for work-in-progress
3. **Import/Export**: Support for external trigger formats
4. **Plugin System**: Extensible trigger types and behaviors
5. **Version Control**: Track trigger changes and collaboration history

## Conclusion

The Map Builder orchestration system successfully transforms the tool from a simple map builder into a complete game development environment. Contributors can now build, test, and export fully interactive experiences with live trigger assignment, overlay wiring, and gameplay logic preview.

**The Map Builder now provides a comprehensive orchestration experience that demonstrates the full power of the MIFF framework's modular architecture and contributor-friendly design.**

---

**Orchestration Status**: ✅ COMPLETE  
**User Experience**: 🎮 INTERACTIVE  
**Framework Integration**: 🔗 SEAMLESS  
**Contributor Value**: 📈 MAXIMUM