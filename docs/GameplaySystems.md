# 🎮 MIFF Gameplay Systems Documentation

## Overview

The MIFF framework includes a comprehensive set of gameplay systems designed for mobile-first, cross-platform game development. These systems are fully integrated into RenderWorld and provide a complete foundation for interactive 3D experiences.

## 🧿 Overlay & Visual Effects

### OverlayFXPure
**Location**: `miff/pure/OverlayFXPure/`

Stateless visual effects system for overlays and post-processing effects.

**Features**:
- Blur effects (gaussian, motion, radial)
- Color manipulation (vignette, color shift, saturation)
- Scan line effects and chromatic aberration
- Distortion effects and noise
- Layer-based management with opacity control

**Usage**:
```typescript
import { overlayFXManager } from '../OverlayFXPure';

// Create a scan effect layer
overlayFXManager.createLayer('scan_effects', { opacity: 0.8 });
overlayFXManager.addEffect('scan_effects', {
  type: 'scan_lines',
  intensity: 0.6,
  speed: 2.0,
  color: '#00ff00'
});
```

### PerceptionFilterLayer
**Location**: `miff/pure/PerceptionFilterLayer/`

Contextual overlays based on perception modes and game state.

**Features**:
- Scan mode overlays (highlighting interactables)
- Danger zone visualization
- NPC aura effects
- Quest objective highlighting
- Stealth mode indicators

**Perception Modes**:
- `NORMAL` - Standard view
- `SCAN` - Highlight interactables and secrets
- `DANGER` - Show threats and hazards
- `INTERACT` - Focus on interactive objects
- `QUEST` - Highlight quest objectives
- `STEALTH` - Low-visibility mode

### ScanFeedbackLayer
**Location**: `miff/pure/ScanFeedbackLayer/`

Visual feedback system for scanning and interaction.

**Features**:
- Wireframe overlays for scan targets
- Pulse animations and cooldown indicators
- Progress tracking for long scans
- Proximity-based intensity scaling
- Multiple scan target types

**Scan Target Types**:
- `ITEM` - Collectible objects
- `NPC` - Non-player characters
- `INTERACTABLE` - Interactive objects
- `PORTAL` - Teleportation points
- `SECRET` - Hidden areas

## 🔄 Lens Mode System

### LensModeSwitcher
**Location**: `miff/pure/LensModeSwitcher/`

Seamless switching between different view modes with smooth transitions.

**Lens Modes**:
- `NORMAL` - Standard gameplay view
- `SCAN` - Enhanced scanning mode
- `COMBAT` - Combat-optimized view
- `STEALTH` - Stealth mode
- `QUEST` - Quest-focused view
- `INTERACT` - Interaction mode
- `DEBUG` - Developer debug view
- `CINEMATIC` - Cinematic mode

**Features**:
- Smooth transitions between modes
- Keyboard shortcuts (1-8 keys)
- Mode history tracking
- Automatic mode switching based on context
- Performance-optimized rendering

## 🎨 UI & Styling

### ButtonStylePure
**Location**: `miff/pure/ButtonStylePure/`

Stateless button styling system with theme support.

**Button Variants**:
- `PRIMARY` - Main action buttons
- `SECONDARY` - Secondary actions
- `SUCCESS` - Positive actions
- `WARNING` - Caution actions
- `DANGER` - Destructive actions
- `INFO` - Informational actions
- `GHOST` - Transparent buttons
- `OUTLINE` - Outlined buttons
- `LINK` - Text link buttons

**Button Sizes**:
- `SMALL` - Compact buttons
- `MEDIUM` - Standard buttons
- `LARGE` - Prominent buttons
- `EXTRA_LARGE` - Hero buttons

**Themes**:
- `default` - Light theme
- `dark` - Dark theme
- `neon` - Cyberpunk theme
- `minimal` - Clean theme

## 🎒 Inventory & Interaction

### InteractableRegistryPure
**Location**: `miff/pure/InteractableRegistryPure/`

Central registry for all interactive objects in the game world.

**Interaction Behaviors**:
- `PICKUP` - Collect items
- `TALK` - Start dialogue
- `SCAN` - Analyze objects
- `USE` - Activate objects
- `OPEN` - Open containers
- `ACTIVATE` - Trigger mechanisms
- `EXAMINE` - Inspect details
- `REPAIR` - Fix broken objects

**Features**:
- Proximity-based interaction detection
- Requirement checking (items, skills, quests)
- State management for interactive objects
- Context-sensitive interaction options
- Performance-optimized spatial queries

## 📱 Mobile Performance

### MobilePerformanceOptimizer
**Location**: `miff/pure/MobilePerformanceOptimizer/`

Mobile-first performance optimization with adaptive quality adjustment.

**Performance Levels**:
- `LOW` - 30fps, reduced effects (low-end devices)
- `MEDIUM` - 45fps, balanced effects (mid-range devices)
- `HIGH` - 60fps, full effects (high-end devices)
- `ULTRA` - 60fps+, maximum effects (premium devices)

**Device Detection**:
- Memory capacity detection
- CPU core count analysis
- GPU tier assessment
- WebGL2 support detection
- Battery level monitoring
- Thermal state tracking

**Adaptive Features**:
- Automatic quality adjustment based on performance
- Frame rate monitoring and optimization
- Memory usage tracking and management
- Battery optimization modes
- Thermal throttling support

## 🎯 Integration with RenderWorld

All gameplay systems are fully integrated into the RenderWorld demo zone:

### Initialization
```typescript
// Systems are automatically initialized in RenderWorldPure constructor
const renderWorld = new RenderWorldPure();

// Access individual systems
const overlayManager = renderWorld.getEngines().overlayFX;
const perceptionManager = renderWorld.getEngines().perception;
const scanManager = renderWorld.getEngines().scanFeedback;
const lensSwitcher = renderWorld.getEngines().lensMode;
const buttonManager = renderWorld.getEngines().buttonStyle;
const interactableRegistry = renderWorld.getEngines().interactables;
const performanceOptimizer = renderWorld.getEngines().mobilePerformance;
```

### Game State Integration
The gameplay systems are integrated into the RenderWorld game state:

```typescript
interface RenderWorldGameState {
  player: {
    // ... existing player properties
    inventory: Record<string, number>;
    level: number;
    quests: string[];
    skills: Record<string, number>;
  };
  world: {
    // ... existing world properties
    gameplay: {
      lensMode: LensMode;
      perceptionMode: PerceptionMode;
      overlayEffects: OverlayEffectConfig[];
      scanTargets: ScanTarget[];
      interactables: InteractableObject[];
      npcs: NPCInfo[];
      ui: {
        buttons: ButtonConfig[];
        menus: MenuConfig[];
        notifications: NotificationConfig[];
      };
    };
  };
}
```

## 🚀 Performance Optimization

### Mobile-First Design
- Adaptive quality based on device capabilities
- Frame rate monitoring and automatic adjustment
- Memory usage tracking and optimization
- Battery level awareness and power saving modes

### Cross-Platform Compatibility
- Unity export support with native performance
- Godot integration with GDScript compatibility
- Unreal Engine Blueprint integration
- Android native performance optimization
- Web platform with progressive enhancement

### Real-Time Monitoring
```typescript
// Get performance statistics
const stats = renderWorld.getMobilePerformanceStats();
console.log(`FPS: ${stats.fps}, Memory: ${stats.memoryUsage}MB`);

// Get optimization recommendations
const recommendations = stats.recommendations;
recommendations.forEach(rec => console.log(rec));

// Set performance level manually
renderWorld.setMobilePerformanceLevel(PerformanceLevel.HIGH);
```

## 🧪 Testing

### Integration Tests
Comprehensive test suite covering all gameplay systems:

```typescript
// Run integration tests
npm test -- --testPathPattern="GameplaySystemsIntegration"

// Test coverage includes:
// - Lens mode switching
// - Object interactions
// - Overlay effects
// - Scan feedback
// - Mobile performance
// - Cross-platform compatibility
```

### Performance Testing
- Memory leak detection
- Frame rate stability testing
- Cross-platform compatibility validation
- Mobile device performance profiling

## 📖 API Reference

### Core Classes
- `OverlayFXManager` - Visual effects management
- `PerceptionFilterManager` - Contextual overlay control
- `ScanFeedbackManager` - Scan target feedback
- `LensModeSwitcher` - View mode management
- `ButtonStyleManager` - UI styling system
- `InteractableRegistry` - Object interaction management
- `MobilePerformanceOptimizer` - Performance optimization

### Key Methods
- `switchLensMode(mode: LensMode)` - Change view mode
- `interactWithObject(id: string, behavior: InteractionBehavior)` - Interact with objects
- `getMobilePerformanceStats()` - Get performance metrics
- `setMobilePerformanceLevel(level: PerformanceLevel)` - Set performance level

## 🎮 Usage Examples

### Basic Gameplay Loop
```typescript
// Initialize RenderWorld
const game = new RenderWorldPure();

// Switch to scan mode
game.switchLensMode(LensMode.SCAN);

// Interact with objects
const result = game.interactWithObject('spirit_lens', InteractionBehavior.PICKUP);
if (result.success) {
  console.log('Item picked up!');
}

// Update game loop
function gameLoop(deltaTime: number) {
  game.updateGameplaySystems(deltaTime);
  game.render();
}

// Start game loop
setInterval(() => gameLoop(16.67), 16.67); // 60fps
```

### Performance Monitoring
```typescript
// Monitor performance
const stats = game.getMobilePerformanceStats();
if (stats.fps < 30) {
  game.setMobilePerformanceLevel(PerformanceLevel.LOW);
}

// Get optimization recommendations
const recommendations = stats.recommendations;
if (recommendations.length > 0) {
  console.warn('Performance issues detected:', recommendations);
}
```

## 🔧 Configuration

### Performance Settings
```typescript
// Configure performance optimization
const config = {
  targetFPS: 60,
  maxMemoryUsage: 1024, // MB
  enableAdaptiveQuality: true,
  enableBatteryOptimization: true,
  textureQuality: 'high',
  shaderQuality: 'high',
  postProcessingQuality: 'high'
};
```

### Theme Customization
```typescript
// Add custom button theme
buttonStyleManager.addTheme({
  name: 'cyberpunk',
  description: 'Cyberpunk theme with neon colors',
  baseStyles: {
    [ButtonVariant.PRIMARY]: {
      backgroundColor: '#ff00ff',
      textColor: '#000000',
      borderColor: '#00ffff',
      // ... other properties
    }
  }
});
```

This documentation provides a complete reference for all gameplay systems in the MIFF framework, enabling developers to create rich, interactive 3D experiences with mobile-first performance optimization.