# MIFF Main Orchestrator Integration Guide

## 🎮 Overview

The MIFF Main Orchestrator (`mainOrchestrator.ts`) unifies all core systems into a playable game loop with comprehensive input handling, rendering integration, and modular architecture.

## 🚀 Quick Start

### Basic Setup
```typescript
import { mainOrchestrator } from './mainOrchestrator';

// Create canvas element
const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);

// Initialize orchestrator
mainOrchestrator.setCanvas(canvas);
mainOrchestrator.start();
```

### With Visual Tools
```typescript
import { VisualToolsContainer } from './visualToolsIntegration';
import { TileManager } from '../TileMapPure/TileMapPure/tileManager';

const manager = new TileManager(10, 10);
const tools = new VisualToolsContainer({
  manager,
  isMobile: /Mobi|Android/i.test(navigator.userAgent),
  showEditor: true,
  showDebug: true
});
```

## 🎯 Core Features

### ✅ Implemented Systems

1. **Game Loop Management**
   - 60 FPS target with requestAnimationFrame
   - Game state management (PLAYING, PAUSED, DIALOGUE, MENU)
   - Auto-save functionality
   - Frame counting and performance monitoring

2. **Input System**
   - **Keyboard**: Arrow keys, WASD, Space, I, Q, F5, F9, F12, Escape
   - **Mouse**: Click to move, right-click to interact
   - **Touch**: Tap to move, swipe for direction, pinch/zoom support
   - **Multi-touch**: Gesture recognition for mobile devices

3. **Player Movement**
   - Grid-based movement with collision detection
   - Tile walkability validation
   - Movement cost calculation
   - Tile enter/exit events

4. **NPC Interaction**
   - NPC registration and positioning
   - Dialogue system with sequential lines
   - Interaction triggers and callbacks
   - Quest integration

5. **Save/Load System**
   - Complete state serialization
   - LocalStorage persistence
   - Zone, player position, flags, and NPC state
   - Tile grid snapshots

6. **Tile System Integration**
   - All tile types (Grass, Water, Cliff, Sand, Forest)
   - Tile events (enter, exit, interact)
   - Advanced features (fog, loot, crafting, audio)
   - Visual rendering with colors and labels

7. **Event System**
   - Global event bus
   - Tile-specific events
   - Interaction hooks
   - Custom event registration

8. **UI Management**
   - Inventory display
   - Quest tracking
   - Dialogue system
   - Debug overlay
   - Mobile-responsive controls

## 🔧 Integration Points

### Rendering Bridge
```typescript
// Set custom rendering bridge
mainOrchestrator.setRenderBridge({
  emit: (event, data) => console.log(event, data),
  on: (event, handler) => console.log('Subscribed to', event),
  getWorld: () => mainOrchestrator.getRenderBridge()?.getWorld?.()
});
```

### Event Subscription
```typescript
import { on, emit } from './eventBus';

// Subscribe to game events
on('playerMoved', (data) => {
  console.log('Player moved to:', data.x, data.y);
});

on('showMessage', (message) => {
  console.log('Game message:', message);
});
```

### Custom Input Handlers
```typescript
// Register custom input actions
mainOrchestrator.inputHandlers.set('custom_action', (event) => {
  console.log('Custom action triggered');
});
```

## 📱 Mobile Support

### Touch Gestures
- **Tap**: Move player to tapped position
- **Swipe**: Directional movement (up/down/left/right)
- **Pinch**: Zoom in/out (emits zoom events)
- **Multi-touch**: Pan and zoom support

### Mobile UI
- Responsive tile editor with larger touch targets
- Collapsible menus and tool palettes
- Touch-friendly button sizes (48px minimum)
- Gesture-based navigation

### Responsive Design
```typescript
const isMobile = /Mobi|Android/i.test(navigator.userAgent);
mainOrchestrator.updateConfig({ enableTouch: isMobile });
```

## 🎨 Visual Tools Integration

### Tile Editor
- Real-time tile editing
- Visual tile palette
- Grid-based layout
- Mobile-optimized interface

### Zone Editor
- Zone creation and modification
- Save/load zone functionality
- Tool selection and painting
- Integration with orchestrator

### Debug Overlay
- FPS monitoring
- Player position tracking
- Game state display
- Performance metrics

## 🧪 Testing

### Test Harness
```typescript
import { MIFFTestHarness } from './testHarness';

const harness = new MIFFTestHarness();
await harness.runAllTests();
```

### Available Tests
1. Game Loop Test
2. Input System Test
3. Save/Load Test
4. Touch Input Test
5. NPC Interaction Test
6. Tile System Test
7. Event System Test
8. Visual Tools Test

### Demo Mode
```typescript
// Create playable demo
harness.createPlayableDemo();
```

## ⚠️ Known Issues & Limitations

### Critical Issues Fixed
- ✅ **tileConfig import path**: Moved from nested directory
- ✅ **npcTriggers truncation**: Fixed incomplete function
- ✅ **Missing integration**: Created main orchestrator

### Runtime Risks
1. **Canvas Context**: Requires valid 2D context
2. **Touch Events**: May not work in all browsers
3. **LocalStorage**: Save/load depends on browser support
4. **Event Listeners**: Memory leaks if not properly cleaned up

### Missing Glue Code
1. **Rendering Bridge**: No default implementation
2. **Audio System**: Placeholder implementation
3. **Asset Loading**: No asset management system
4. **Network Sync**: No multiplayer support

## 🔗 Integration with Existing MIFF Systems

### Pure Modules
The orchestrator integrates with existing MIFF Pure modules:
- `SaveLoadPure` - Enhanced with orchestrator state
- `DialoguePure` - Integrated with dialogue engine
- `QuestSystemPure` - Connected to quest tracker
- `InventoryPure` - Linked to inventory state

### Bridge Systems
Compatible with MIFF bridge systems:
- `UnityBridgePure` - Can be set as render bridge
- `WebBridgePure` - Native web integration
- `GodotBridgePure` - Can be adapted for Godot

### Scenario Packs
Ready for scenario integration:
- `TopplerDemoPure` - Physics-based gameplay
- `SpiritTamerDemoPure` - Rhythm game mechanics
- `WitcherExplorerDemoPure` - Open-world exploration

## 🎯 Playable Test Zone

### Recommended Test Setup
```typescript
// Create test zone
loadZone('grove');
setPlayerPosition(5, 5);

// Add test NPCs
registerNPC({
  id: 'testSpirit',
  name: 'Test Spirit',
  x: 6,
  y: 6,
  dialogue: ['Hello!', 'This is a test.']
});

// Add test quests
addQuest('test_quest', 'Find the test spirit');

// Start game
mainOrchestrator.start();
```

### Test Scenarios
1. **Movement Test**: Use arrow keys or touch to move around
2. **Interaction Test**: Approach NPC and press Space/E
3. **Save/Load Test**: Press F5 to save, F9 to load
4. **UI Test**: Press I for inventory, Q for quests
5. **Debug Test**: Press F12 for debug overlay

## 🚀 Next Steps

### Immediate Priorities
1. **Rendering Bridge**: Implement default web renderer
2. **Audio Integration**: Connect to existing audio systems
3. **Asset Management**: Add sprite and audio loading
4. **Network Layer**: Add multiplayer support

### Long-term Goals
1. **AI Integration**: Connect to MIFF AI systems
2. **Scenario Engine**: Full scenario pack integration
3. **Modding Support**: Runtime module loading
4. **Performance Optimization**: WebGL rendering

## 📚 Usage Examples

### Basic Game Loop
```typescript
import { mainOrchestrator } from './mainOrchestrator';

// Setup
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
mainOrchestrator.setCanvas(canvas);

// Start game
mainOrchestrator.start();

// Handle game events
mainOrchestrator.getRenderBridge()?.on?.('playerMoved', (data) => {
  console.log('Player moved to:', data.x, data.y);
});
```

### Mobile Game
```typescript
// Detect mobile
const isMobile = /Mobi|Android/i.test(navigator.userAgent);

// Configure for mobile
mainOrchestrator.updateConfig({
  enableTouch: true,
  enableAudio: false, // Save battery
  enableDebug: false
});

// Start with mobile UI
mainOrchestrator.start();
```

### Custom Integration
```typescript
// Custom render bridge
const customBridge = {
  emit: (event, data) => {
    // Send to Unity/Godot/WebGL
  },
  on: (event, handler) => {
    // Subscribe to events
  },
  getWorld: () => {
    // Return world state
  }
};

mainOrchestrator.setRenderBridge(customBridge);
```

## 🎉 Conclusion

The MIFF Main Orchestrator provides a complete, playable game loop with:
- ✅ Unified system integration
- ✅ Comprehensive input handling
- ✅ Mobile and desktop support
- ✅ Save/load functionality
- ✅ Visual tools integration
- ✅ Modular, remix-safe architecture

The system is ready for immediate use and can be extended with additional features as needed.