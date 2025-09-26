# MIFF Sampler Worlds

A comprehensive showcase of 5 different gameplay styles, all orchestrated by MIFF and rendered by Godot. Each world demonstrates different movement mechanics, asset usage, and gameplay patterns while being fully modular and remix-safe.

## 🌍 World Types

### 1. 🏃 2D Side-Scrolling Platformer
- **File**: `2d-side.html`
- **Description**: Medieval platformer with gravity, jumping, and enemy encounters
- **Movement**: Gravity-based physics with arrow keys and space to jump
- **Assets**: Knight hero, wood platforms, cliff tiles, skeleton enemies, treasure chests
- **Physics**: Gravity, collision detection, platform jumping
- **Controls**: Arrow Keys + Space to Jump

### 2. 🗺️ 2D Top-Down Explorer
- **File**: `2d-topdown.html`
- **Description**: Overhead exploration with grid-based movement
- **Movement**: Grid-snapped movement with smooth transitions
- **Assets**: Barbarian hero, oak trees, stone blocks, friendly slime NPC
- **Physics**: Grid-based positioning, no gravity
- **Controls**: Arrow Keys or WASD

### 3. 🏃‍♂️ Auto-Scroll Runner
- **File**: `runner.html`
- **Description**: Endless runner with auto-scroll movement and obstacles
- **Movement**: Auto-scroll left with vertical jumping
- **Assets**: Spirit runner, rock obstacles, power-up chests, wood platforms
- **Physics**: Auto-scroll, gravity, obstacle collision
- **Controls**: Space to Jump, Arrow Keys for Movement

### 4. 🏰 3D Isometric Adventure
- **File**: `3d-topdown.html`
- **Description**: Isometric 3D view with depth and rotation
- **Movement**: 3D movement with camera rotation
- **Assets**: Mage hero, castle buildings, forest trees, rogue enemy, magic items
- **Physics**: 3D positioning, depth sorting, camera rotation
- **Controls**: WASD + Q/E to Rotate Camera

### 5. 🎛️ Static Overlay System
- **File**: `static-overlay.html`
- **Description**: Interactive HUD and overlay system with no movement
- **Movement**: None - pure UI interaction
- **Assets**: Draggable UI panels, HUD elements, minimap, chat system
- **Physics**: None - UI positioning only
- **Controls**: Mouse/Touch Interaction

## 🎨 Asset Integration

Each world uses assets from the comprehensive `sampler-manifest.json`:

- **Characters**: Knight, Barbarian, Spirit, Mage, Rogue, Skeleton
- **Tiles**: Wood platforms, cliff tiles, oak trees, stone blocks, isometric blocks
- **Items**: Treasure chests, weapons, shields, magic items
- **Buildings**: Houses, castles, towers

## 🎮 Gameplay Features

### Physics Systems
- **2D Side-Scrolling**: Gravity, jumping, platform collision
- **2D Top-Down**: Grid-based movement, no gravity
- **Runner**: Auto-scroll, vertical jumping, obstacle avoidance
- **3D Isometric**: 3D positioning, depth sorting, camera rotation
- **Static Overlay**: UI positioning and interaction

### Asset Animation
- **Sprite Sheets**: All character sprites support 4-frame animation
- **Frame Timing**: Configurable frame rates for different animation speeds
- **Movement Animation**: Characters animate only when moving
- **Idle Animation**: Static pose when not moving

### Interactive Elements
- **Collectibles**: Treasure chests in all movement-based worlds
- **Enemies**: Skeleton guards, rogue enemies with AI behavior
- **NPCs**: Friendly slime in top-down world
- **UI Elements**: Draggable overlays in static world

## 🛠️ Technical Implementation

### MIFF Orchestration
- **Scene Data**: All gameplay logic defined in MIFF preset JSON files
- **Asset Loading**: Centralized asset manifest with metadata
- **Physics Rules**: Movement and collision defined per world type
- **Entity Management**: Centralized entity creation and updates

### Godot Integration
- **Rendering**: Godot handles all visual rendering and canvas management
- **Input**: Keyboard and mouse input processed by Godot
- **Communication**: `postMessage` API for MIFF ↔ Godot communication
- **Fallback**: JavaScript fallback for immediate visualization

### Asset Pipeline
- **Manifest**: `sampler-manifest.json` catalogs all available assets
- **Presets**: Individual JSON files for each world's entity layout
- **Loading**: Asynchronous image loading with error handling
- **Animation**: Sprite sheet slicing and frame management

## 🎯 Usage

### Playing the Worlds
1. Open `index.html` to see the world selection menu
2. Click any world card to open it in a new tab
3. Use "Preview" button to see the world in an overlay
4. Each world loads with its preset entities and physics

### Asset Customization
1. Edit `sampler-manifest.json` to add/modify assets
2. Update preset JSON files to change entity layouts
3. Modify Godot placeholder files for different physics
4. Use MIFF Studio Builder for visual scene editing

### Adding New Worlds
1. Create new HTML file following existing patterns
2. Add corresponding Godot placeholder file
3. Create preset JSON with entity definitions
4. Update manifest with new asset categories
5. Add world card to `index.html`

## 🔧 Development

### File Structure
```
sampler/
├── index.html              # Main sampler menu
├── 2d-side.html           # Side-scrolling world
├── 2d-topdown.html        # Top-down world
├── runner.html            # Auto-scroll runner
├── 3d-topdown.html        # 3D isometric world
├── static-overlay.html    # Static overlay world
└── README.md              # This documentation

../godot/sampler/
├── 2d-side.html           # Godot placeholder
├── 2d-topdown.html        # Godot placeholder
├── runner.html            # Godot placeholder
├── 3d-topdown.html        # Godot placeholder
└── static-overlay.html    # Godot placeholder

../studio/presets/
├── sampler-2d-side.json   # Entity preset
├── sampler-2d-topdown.json # Entity preset
├── sampler-runner.json    # Entity preset
├── sampler-3d-isometric.json # Entity preset
└── sampler-static-overlay.json # Entity preset

../assets/
└── sampler-manifest.json  # Asset catalog
```

### Key Technologies
- **HTML5 Canvas**: For fallback rendering
- **JavaScript ES6**: For game logic and asset management
- **CSS3**: For responsive design and animations
- **JSON**: For data-driven entity and asset definitions
- **postMessage API**: For MIFF ↔ Godot communication

## 🎨 Design Principles

### Modularity
- Each world is self-contained and independent
- Assets are shared through centralized manifest
- Physics systems are world-specific but reusable
- UI components are consistent across worlds

### Remix Safety
- All assets are CC0, GPL, or public domain
- No proprietary or copyrighted content
- Clear licensing and attribution
- Easy to fork and modify

### Accessibility
- Mobile-first responsive design
- Touch-friendly controls for mobile devices
- Keyboard navigation support
- Clear visual feedback and instructions

### Performance
- Efficient asset loading and caching
- Optimized rendering loops
- Minimal memory footprint
- Fast startup and loading times

## 🚀 Future Enhancements

### Planned Features
- **Real Godot Exports**: Replace placeholders with actual Godot HTML5 exports
- **Multiplayer Support**: Add multiplayer capabilities to worlds
- **Save System**: Persistent progress and settings
- **Asset Editor**: In-browser asset creation and editing
- **World Builder**: Visual world creation tools

### Integration Opportunities
- **MIFF Studio**: Direct integration with scene builder
- **Asset Pipeline**: Automated asset processing and optimization
- **AI Generation**: Procedural world and asset generation
- **Community**: User-generated content and sharing

## 📚 Resources

- **MIFF Framework**: [Main Documentation](https://rcbiscuitsbelfast-prog.github.io/MIFF-Make-It-For-Free/)
- **Asset Manifest**: [sampler-manifest.json](../assets/sampler-manifest.json)
- **MIFF Studio**: [Scene Builder](../studio/index.html)
- **Contributor Guide**: [How to Contribute](CONTRIBUTOR_GUIDE.md)

---

**Built with MIFF** • **Modular** • **Remix-Safe** • **Contributor-Friendly**