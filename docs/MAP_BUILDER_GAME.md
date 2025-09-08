# Map Builder Game - A Game About Building Games

**Date**: Current  
**Scope**: Playable Map Builder zone within MIFF framework  
**Status**: ✅ COMPLETE

## Overview

The Map Builder is a dedicated playable zone that runs as a game within the MIFF framework. Contributors can explore assets, place tiles, assign sprites, and orchestrate gameplay—all within a live, interactive scene. This is a game about building games.

## Features

### 🎮 Live Canvas Interaction
- **Drag-and-Drop Placement**: Click and drag to place tiles on the grid
- **Real-time Preview**: See tile placement with cursor preview
- **Grid System**: Isometric grid with proper coordinate conversion
- **Camera Movement**: WASD/Arrow keys to pan around the map

### 🧱 Modular Asset Integration
- **Registry-Backed Assets**: All tiles loaded from `tile_manifest.json`
- **Biome Filtering**: Tiles filtered by biome (grove, castle, dungeon, forest)
- **Sprite Assignment**: Choose player/NPC sprites from gallery
- **Asset Preview**: Visual preview of selected tiles in toolbar

### 🎯 Game Type Configuration
- **Narrative**: Story-driven gameplay with dialogue and exploration
- **Puzzle**: Logic-based challenges and problem solving
- **Combat**: Action-oriented gameplay with battles
- **Sandbox**: Open-ended creative gameplay

### 🎨 Dispatcher-Driven UI
- **IntroModal**: "Welcome to the Builder" with instructions
- **LoreModal**: "This zone builds zones" explanation
- **Export Overlay**: "Export your remix" with download links
- **HUD**: Current biome, selected tile, active sprite, input mode

### 📤 Remix & Export Flow
- **JSON Export**: Generates complete map JSON with metadata
- **Asset Bundling**: Includes selected assets and game type
- **Starter Pack Links**: Direct access to remix templates
- **Contributor Integration**: Links to guides and documentation

## Technical Implementation

### Asset Module (`zones/map_builder/assets.js`)
```javascript
const registry = {
  tile: { w: 64, h: 32, originY: 16 },
  sprites: {
    mainCharacter: {
      id: 'mainCharacter',
      frame: { w: 64, h: 64 },
      sequences: { idle: [0], walk: [0, 1, 2, 3] },
      src: '../../../assets/Player_Actions.png'
    }
  },
  tiles: {
    grass_01: { 
      id: 'grass_01', 
      src: '../../../assets/Isometric Blocks/isometric_0075.png', 
      biome: ['grove'], 
      preview: '🌱'
    }
  },
  gameTypes: {
    narrative: {
      name: 'Narrative',
      description: 'Story-driven gameplay',
      features: ['dialogue', 'lore', 'exploration']
    }
  }
};
```

### Builder State Management
```javascript
let builder = {
  selectedTile: 'grass_01',
  selectedSprite: 'mainCharacter',
  gameType: 'narrative',
  biome: 'grove',
  map: new Map(), // gridX,gridY -> { tile, sprite, props }
  gridSize: 8,
  tileW: 64,
  tileH: 32,
  camera: { x: 0, y: 0 },
  inputMode: 'mouse'
};
```

### Coordinate System
- **World Coordinates**: Isometric grid system
- **Screen Coordinates**: Canvas pixel positions
- **Grid Coordinates**: Discrete tile positions
- **Conversion Functions**: `worldToScreen()`, `screenToWorld()`, `worldToGrid()`

### Input Handling
- **Mouse**: Click and drag for tile placement
- **Keyboard**: WASD/Arrow keys for camera movement
- **Touch**: Joystick support for mobile devices
- **Input Mode Detection**: Automatic detection and HUD display

## User Interface

### Toolbar Components
- **Game Type Selector**: Choose narrative, puzzle, combat, or sandbox
- **Biome Filter**: Filter tiles by biome type
- **Tile Selector**: Choose from available tiles for current biome
- **Sprite Selector**: Assign player or NPC sprites
- **Tile Preview**: Visual preview of selected tile
- **Action Buttons**: Clear map and export remix

### Visual Feedback
- **Grid Overlay**: Isometric grid lines for precise placement
- **Cursor Preview**: Semi-transparent tile preview at cursor
- **Cursor Outline**: Blue outline showing placement target
- **Real-time Updates**: Immediate visual feedback for all actions

### Export Interface
- **Map Data**: Complete JSON with layers, orchestration, and metadata
- **Download Links**: Direct download of map JSON file
- **Starter Pack Access**: Links to remix templates and guides
- **Contributor Resources**: Integration with documentation and tools

## Gameplay Flow

### 1. Initialization
1. **Intro Modal**: Welcome message and instructions
2. **Asset Loading**: Preload all tiles and sprites from registry
3. **Toolbar Setup**: Initialize all UI components and event listeners
4. **Game Loop Start**: Begin rendering and input handling

### 2. Building Phase
1. **Select Game Type**: Choose narrative, puzzle, combat, or sandbox
2. **Choose Biome**: Select biome to filter available tiles
3. **Place Tiles**: Drag and drop tiles onto the grid
4. **Assign Sprites**: Add player and NPC sprites to tiles
5. **Camera Movement**: Pan around to build larger areas

### 3. Export Phase
1. **Export Button**: Click to generate map data
2. **Export Overlay**: Review map information and download options
3. **Download JSON**: Get complete map file for remixing
4. **Access Resources**: Links to starter packs and documentation

## Integration with MIFF Framework

### Unified Architecture
- **Dispatcher Integration**: Uses shared overlay system
- **Asset Registry**: Leverages existing tile and sprite registries
- **Input Handling**: Consistent with other zones
- **Styling**: Unified serif typography and tile backgrounds

### Remix Safety
- **Asset Attribution**: All assets properly attributed (KayKit/CC0)
- **Modular Design**: Pure modules without engine dependencies
- **Export Validation**: Generated maps follow MIFF schema
- **Contributor Ready**: Direct integration with remix workflow

### Performance
- **Efficient Rendering**: Only renders visible tiles and sprites
- **Asset Caching**: Preloaded assets for smooth interaction
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Memory Management**: Clean asset loading and disposal

## Verification Results

### Screenshots Captured
- `tests/showcase_map_builder_live_canvas.png` - Live canvas with grid and toolbar
- `tests/showcase_map_builder_sprite_picker.png` - Tile selection and preview
- `tests/showcase_map_builder_export_overlay.png` - Export interface with download links

### Functionality Verified
- ✅ Tiles and sprites load from asset modules
- ✅ Drag-and-drop placement works correctly
- ✅ Overlays route via dispatcher system
- ✅ Export flow generates remix pack
- ✅ Toolbar updates and biome filtering
- ✅ Camera movement and grid rendering
- ✅ Input mode detection and HUD display

## Benefits

### For Contributors
- **Visual Learning**: See how tiles and sprites work together
- **Hands-on Experience**: Build maps through direct interaction
- **Immediate Feedback**: Real-time preview of placement and changes
- **Export Ready**: Generated maps ready for remix workflow

### For Framework
- **Demonstration Tool**: Shows MIFF capabilities in action
- **Asset Showcase**: Displays all available tiles and sprites
- **Integration Example**: Demonstrates proper module usage
- **Contributor Onboarding**: Interactive introduction to framework

### For Community
- **Creative Expression**: Build and share custom maps
- **Learning Resource**: Understand game development concepts
- **Remix Starting Point**: Generate base maps for further development
- **Collaboration Tool**: Share and iterate on map designs

## Future Enhancements

### Potential Features
1. **Multi-layer Editing**: Terrain, props, and NPC layers
2. **Script Integration**: Add custom orchestration triggers
3. **Collaborative Building**: Real-time multiplayer editing
4. **Template Library**: Pre-built map templates
5. **Advanced Tools**: Copy, paste, undo/redo functionality

### Technical Improvements
1. **Performance Optimization**: Virtual rendering for large maps
2. **Save System**: Local storage for work-in-progress
3. **Import/Export**: Support for external map formats
4. **Plugin System**: Extensible tool and asset support
5. **Version Control**: Track changes and collaboration history

## Conclusion

The Map Builder successfully demonstrates the MIFF framework's capabilities by providing an interactive, playable game about building games. It showcases modular asset integration, unified UI systems, and contributor-friendly workflows while maintaining the framework's core principles of remix safety and modularity.

**The Map Builder is ready for contributor showcase and provides an engaging introduction to the MIFF framework's game development capabilities.**

---

**Map Builder Status**: ✅ COMPLETE  
**User Experience**: 🎮 ENGAGING  
**Framework Integration**: 🔗 SEAMLESS  
**Contributor Value**: 📈 HIGH