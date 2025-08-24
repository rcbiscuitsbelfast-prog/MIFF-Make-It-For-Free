# 🌉 OverlinkPure - Meta-Zone Hub

**Purpose**: Connects other MIFF modules (Toppler, Spirit Tamer) as a hub for transitions, overlays, and remix previews.

**Status**: ✅ Complete - Ready for MIFF Sampler integration

## 🎯 Core Features

### Modular Draw Reducers
- **Sprite Renderer**: High-performance sprite batching with texture atlases
- **UI Renderer**: Theme-aware UI rendering with scaling support
- **Effect Renderer**: Particle effects with blend mode controls
- **Debug Renderer**: FPS counter, bounds visualization, and debug overlays

### Toggleable Debug Layers
- **Debug Overlay**: Performance metrics and debug information
- **Preview Mode**: Remix preview with asset validation
- **Transition Effects**: Smooth zone transitions with configurable effects
- **Navigation UI**: Zone navigation with breadcrumb trails

### Visual Theme System
- **Theme Overlays**: neonGrid, forestGlade, cosmicVoid with custom assets
- **Priority-based Rendering**: Optimized draw reducers for each theme
- **Layer Management**: Toggleable background, foreground, UI, effects, and audio layers
- **Asset Integration**: Remix-safe textures, shaders, and audio with fallbacks

### Remix-Safe Asset Bindings
- **Texture Assets**: Remix-safe texture atlases with fallback support
- **Audio Assets**: Conditional audio binding based on remix mode
- **Shader Assets**: Remix-safe shader compilation and validation
- **Data Assets**: JSON configuration with remix validation

### Remix Lineage Tracking
- **Origin Tracking**: Complete remix origin and contributor history
- **Asset Lineage**: Full asset dependency and modification tracking
- **Validation Hooks**: Customizable asset validation with audit logging
- **Metadata Export**: JSON metadata for remix compliance and attribution

## 🏗️ Architecture

### Zone Management
```typescript
const overlink = new OverlinkZone();

// Register zones
overlink.registerZone('hub', 'Central Hub', ['meta', 'transition']);
overlink.registerZone('toppler', 'Toppler Demo', ['physics', 'puzzle']);
overlink.registerZone('spirit_tamer', 'Spirit Tamer', ['rpg', 'combat']);

// Navigate between zones
overlink.enterZone('toppler');
```

### Module Connections
```typescript
// Register modules with dependencies
overlink.registerModule('toppler_demo', 'toppler', []);
overlink.registerModule('spirit_tamer_demo', 'spirit_tamer', []);
overlink.registerModule('remix_preview', 'preview', ['toppler_demo', 'spirit_tamer_demo']);

// Activate modules
overlink.activateModule('toppler_demo');
```

### Draw Reducer Management
```typescript
// Add draw reducers with priority
overlink.addDrawReducer({
  id: 'sprite_renderer',
  type: 'sprite',
  priority: 1,
  enabled: true,
  data: { batchSize: 100, textureAtlas: 'main' }
});

// Toggle reducers
overlink.toggleDrawReducer('debug_renderer');
```

### Asset Binding
```typescript
// Bind remix-safe assets
overlink.bindAsset({
  id: 'main_textures',
  type: 'texture',
  path: 'assets/textures/main.atlas',
  remixSafe: true,
  fallback: 'assets/textures/fallback.atlas'
});
```

## 🧪 Testing & Validation

### CLI Harness
```bash
# Run basic scenario
npx ts-node OverlinkPure/cliHarness.ts OverlinkPure/sample_config.json

# Run with debug mode
npx ts-node OverlinkPure/cliHarness.ts OverlinkPure/sample_config_debug.json

# Run with remix mode
npx ts-node OverlinkPure/cliHarness.ts OverlinkPure/sample_config_remix.json

# Run with themes and lineage tracking
npx ts-node OverlinkPure/cliHarness.ts OverlinkPure/sample_config_remix.json
```

### Golden Fixtures
- **Basic Scenario**: 8-step zone navigation with module activation
- **Debug Mode**: Debug overlay and renderer toggling
- **Remix Mode**: Remix preview with dependency validation

### Test Commands
```json
[
  { "op": "runScenario", "config": "sample_config.json" },
  { "op": "runScenario", "config": "sample_config_debug.json" },
  { "op": "runScenario", "config": "sample_config_remix.json" }
]
```

## 🎮 MIFF Sampler Integration

### Zone Entry Point
```javascript
// Load Overlink zone in sampler
const overlink = require('./zones/overlink');
const zone = overlink.startZone();

// Navigate to connected zones
zone.onTap('btn_toppler');     // → Toppler Demo
zone.onTap('btn_spirit_tamer'); // → Spirit Tamer
zone.onTap('btn_preview');     // → Remix Preview
```

### Navigation Flow
1. **Central Hub** → Zone overview and navigation
2. **Toppler Demo** → Physics puzzle gameplay
3. **Spirit Tamer** → RPG combat system
4. **Remix Preview** → Asset validation and remix mode
5. **Debug Mode** → Performance monitoring and debug tools

## 🔧 Configuration

### Sample Configurations
- **Basic**: Standard zone navigation without debug features
- **Debug**: Debug mode enabled with overlay controls
- **Remix**: Remix preview mode with dependency validation
- **Themes**: Visual theme system with neonGrid, forestGlade, cosmicVoid
- **Lineage**: Complete remix origin and asset lineage tracking

### Overlay Layer Controls
- **UI Layer**: Always enabled for navigation
- **Transition Layer**: Smooth zone transitions
- **Preview Layer**: Remix preview mode
- **Debug Layer**: Performance and debug information
- **Navigation Layer**: Zone navigation controls

## 📊 Performance Features

### Draw Reducer Optimization
- **Priority-based rendering**: Critical UI elements render first
- **Batch processing**: Sprite batching for performance
- **Conditional rendering**: Debug elements only when needed
- **Dynamic toggling**: Enable/disable renderers at runtime

### Asset Management
- **Lazy loading**: Assets loaded on demand
- **Fallback support**: Graceful degradation for missing assets
- **Remix validation**: Asset compatibility checking
- **Memory management**: Efficient asset binding and cleanup

## 🚀 Future Enhancements

### Planned Features
- **Advanced Transitions**: Custom transition effects and animations
- **Asset Streaming**: Progressive asset loading for large modules
- **Performance Profiling**: Detailed performance metrics and optimization
- **Plugin System**: Extensible draw reducer and overlay systems

### Integration Opportunities
- **Unity Bridge**: Unity-specific rendering optimizations
- **Godot Bridge**: Godot engine integration
- **Web Bridge**: WebGL and Canvas rendering support
- **Mobile Bridge**: Touch-optimized navigation and controls

## 📚 API Reference

### Core Classes
- `OverlinkZone`: Main zone management class
- `OverlinkThemes`: Visual theme system with asset management
- `RemixLineageTracker`: Remix origin and asset lineage tracking
- `DrawReducer`: Renderer configuration and management
- `AssetBinding`: Asset binding and validation
- `ModuleConnection`: Module dependency management

### Key Methods
- `registerZone()`: Register new zones
- `activateModule()`: Activate module with dependency checking
- `addDrawReducer()`: Add renderer with priority
- `bindAsset()`: Bind remix-safe assets
- `toggleOverlayLayer()`: Control overlay visibility
- `activateTheme()`: Activate visual theme with assets
- `toggleThemeLayer()`: Control theme layer visibility
- `enableLineageTracking()`: Enable remix origin tracking
- `registerRemixOrigin()`: Register remix project origin
- `registerAssetLineage()`: Track asset modifications and dependencies
- `validateAllAssets()`: Run asset validation with hooks
- `exportState()`: Serialize zone state for testing

## 🤝 Contributing

### Development Guidelines
- **Pure Functions**: All operations must be deterministic
- **Remix Safety**: Asset bindings must support remix mode
- **Performance**: Draw reducers must be optimized for real-time rendering
- **Testing**: All features must have golden fixtures

### Testing Requirements
- **Golden Fixtures**: Deterministic output validation
- **CLI Harness**: Command-line testing interface
- **Scenario Packs**: Comprehensive feature demonstration
- **Integration Tests**: MIFF Sampler compatibility

---

**OverlinkPure** is designed to be the central hub for MIFF modules, providing seamless navigation, efficient rendering, and robust asset management. It serves as the foundation for complex multi-module experiences while maintaining the framework's commitment to engine-agnostic, contributor-friendly development.