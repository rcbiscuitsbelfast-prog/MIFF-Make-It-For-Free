# CameraSystemPure Module

## Overview

**CameraSystemPure** is a sophisticated, engine-agnostic camera system that provides comprehensive camera management for game development. It supports multiple camera modes, cinematic sequences, dynamic effects, and seamless integration with input systems and events.

## Core Features

### 🎥 Camera Modes
- **Chase Camera**: Follows targets with configurable distance and smoothing
- **First-Person Camera**: Immersive view directly from character perspective
- **Orbit Camera**: Rotates around targets with customizable orbit parameters
- **Debug Camera**: Development tool for scene inspection and testing

### 🎬 Cinematic System
- **Camera Paths**: Predefined sequences with waypoints and transitions
- **Dynamic Transitions**: Smooth mode switching with customizable timing
- **Effect Integration**: Camera shake, focus, and visual effects
- **Timeline Control**: Precise timing for cinematic sequences

### ⚙️ Advanced Configuration
- **Performance Optimization**: Configurable update rates and quality settings
- **Constraint System**: Collision avoidance and boundary management
- **Visual Customization**: Filters, HUD integration, and style options
- **Multi-Camera Support**: Up to 8 simultaneous cameras with priority system

## Architecture

### Core Components

```
CameraSystemPure/
├── Manager.ts              # Main camera system management
├── CameraDefinition.ts     # Camera type definitions
├── CameraInstance.ts       # Runtime camera instances
├── CameraMode.ts          # Mode-specific behavior
├── CameraPath.ts          # Cinematic path definitions
├── CameraEffect.ts        # Visual and motion effects
├── CameraConfig.ts        # Configuration management
└── CameraStats.ts         # Performance and usage statistics
```

### Dependencies

- **EventsPure**: Event system integration for camera events
- **InputPure**: Input handling for camera controls
- **RNGPure**: Random number generation for camera effects

## Quick Start

### Basic Camera Creation

```typescript
import { CameraSystemPure } from './CameraSystemPure';

// Initialize system
const cameraSystem = new CameraSystemPure(eventBus, inputSystem, rng);

// Create chase camera
const chaseCamera = cameraSystem.createCamera('chase-camera', 'player-entity');
if (chaseCamera) {
  console.log(`Camera created: ${chaseCamera.id}`);
}
```

### Mode Switching

```typescript
// Switch to first-person mode
const success = cameraSystem.switchCameraMode('camera-123', 'first-person');
if (success) {
  console.log('Successfully switched to first-person mode');
}
```

### Cinematic Sequences

```typescript
// Load predefined path
const introPath = cameraSystem.getCameraPath('demo-intro-path');
if (introPath) {
  // Apply cinematic path to camera
  cameraSystem.applyCameraPath('camera-123', introPath);
}
```

## Configuration

### Default Configuration

```typescript
const defaultConfig = {
  defaultMode: 'chase',
  enableDebugCamera: true,
  enableCinematicMode: true,
  maxActiveCameras: 8,
  updateRate: 60,
  renderQuality: 'high',
  enablePostProcessing: true,
  // ... additional options
};
```

### Custom Configuration

```typescript
const customConfig = {
  ...defaultConfig,
  defaultMode: 'first-person',
  updateRate: 120,
  renderQuality: 'low',
  maxActiveCameras: 4
};

cameraSystem.updateConfig(customConfig);
```

## Camera Modes

### Chase Camera

**Best for**: Third-person action games, character following

```typescript
const chaseSettings = {
  fov: 75,
  distance: 10,
  height: 2,
  smoothingFactor: 0.8,
  followSpeed: 5.0
};
```

### First-Person Camera

**Best for**: FPS games, immersive experiences

```typescript
const firstPersonSettings = {
  fov: 90,
  distance: 0,
  height: 0,
  smoothingFactor: 1.0,
  mouseSensitivity: 0.002
};
```

### Orbit Camera

**Best for**: Strategy games, object inspection

```typescript
const orbitSettings = {
  fov: 60,
  distance: 15,
  height: 5,
  orbitSpeed: 2.0,
  zoomSpeed: 10.0
};
```

## Camera Effects

### Shake Effect

```typescript
const shakeEffect = {
  id: 'earthquake-shake',
  name: 'Earthquake Shake',
  type: 'shake',
  parameters: new Map([
    ['intensity', 0.8],
    ['frequency', 10.0]
  ]),
  duration: 2000,
  intensity: 0.8,
  falloff: 'exponential'
};
```

### Focus Effect

```typescript
const focusEffect = {
  id: 'dramatic-focus',
  name: 'Dramatic Focus',
  type: 'focus',
  parameters: new Map([
    ['blur', 5.0],
    ['vignette', 0.6]
  ]),
  duration: 1000,
  intensity: 0.9,
  falloff: 'linear'
};
```

## Performance Optimization

### Update Rate Management

```typescript
// Reduce update rate for better performance
cameraSystem.updateConfig({
  updateRate: 30,  // 30 FPS instead of 60
  targetFPS: 30
});

// Enable performance monitoring
const stats = cameraSystem.getStats();
console.log(`Average FPS: ${stats.averageFPS}`);
```

### Memory Management

```typescript
// Clean up unused cameras
cameraSystem.removeCamera('unused-camera-id');

// Optimize camera count
const config = cameraSystem.getConfig();
config.maxActiveCameras = 4;
cameraSystem.updateConfig(config);
```

### Quality Settings

```typescript
const performanceConfig = {
  renderQuality: 'medium',  // low, medium, high
  enablePostProcessing: false,
  enableShadows: false,
  enableReflections: false
};

cameraSystem.updateConfig(performanceConfig);
```

## Integration Examples

### With Input System

```typescript
// Camera responds to input controls
inputSystem.registerAction('camera_zoom_in', 'scroll_up', () => {
  const mainCamera = cameraSystem.getMainCamera();
  if (mainCamera) {
    cameraSystem.adjustZoom(mainCamera.id, -1.0);
  }
});
```

### With Event System

```typescript
// React to game events
eventBus.on('player:damaged', (event) => {
  const mainCamera = cameraSystem.getMainCamera();
  if (mainCamera && event.damage > 50) {
    cameraSystem.applyShake(mainCamera.id, 0.5, 500);
  }
});
```

### Cinematic Event Integration

```typescript
// Trigger cinematic on quest completion
eventBus.on('quest:completed', (questId) => {
  const cinematicPath = cameraSystem.getCameraPath('quest-complete-cinematic');
  if (cinematicPath) {
    const mainCamera = cameraSystem.getMainCamera();
    if (mainCamera) {
      cameraSystem.applyCameraPath(mainCamera.id, cinematicPath);
    }
  }
});
```

## Testing

### Running Tests

```bash
# Run all camera system tests
npm run test:camera

# Run specific test suites
npm run test:camera:unit
npm run test:camera:integration
npm run test:camera:performance
```

### Test Coverage

```typescript
// Example test structure
describe('CameraSystemPure', () => {
  test('should create cameras', () => {
    const camera = cameraSystem.createCamera('chase', 'player');
    expect(camera).toBeDefined();
    expect(camera?.mode).toBe('chase');
  });

  test('should switch modes', () => {
    const camera = cameraSystem.createCamera('chase', 'player');
    const success = cameraSystem.switchCameraMode(camera.id, 'first-person');
    expect(success).toBe(true);
  });
});
```

## Performance Benchmarks

### Expected Performance

- **Creation Time**: ~1ms per camera
- **Update Time**: ~0.1ms per camera at 60 FPS
- **Memory Usage**: ~50KB per camera instance
- **Frame Rate**: Maintains 60+ FPS with 8+ cameras

### Optimization Tips

1. **Reduce Update Rate**: Lower from 60 to 30 FPS if needed
2. **Limit Camera Count**: Use only necessary cameras
3. **Disable Effects**: Turn off post-processing for better performance
4. **Use Quality Settings**: Lower render quality when possible

## Best Practices

### Camera Management

1. **Reuse Cameras**: Create cameras once and reuse them
2. **Clean Up**: Remove unused cameras to free memory
3. **Main Camera**: Always have one designated main camera
4. **Mode Consistency**: Use consistent camera modes per scene

### Performance

1. **Batch Updates**: Update all cameras in single system tick
2. **Effect Management**: Limit active effects per camera
3. **Path Optimization**: Use efficient path interpolation
4. **Memory Pooling**: Reuse camera instances when possible

### Integration

1. **Event Driven**: Use events for camera state changes
2. **Input Binding**: Bind camera controls to input system
3. **State Management**: Coordinate with game state systems
4. **Error Handling**: Implement graceful failure handling

## Troubleshooting

### Common Issues

**Camera not following target:**
- Check target entity exists
- Verify camera mode supports following
- Ensure update rate is sufficient

**Performance issues:**
- Reduce update rate
- Limit camera count
- Disable post-processing
- Check for memory leaks

**Effects not working:**
- Verify effect parameters
- Check duration and timing
- Ensure camera supports effect type

### Debug Tools

```typescript
// Enable debug mode
cameraSystem.updateConfig({ enableDebugCamera: true });

// Get detailed statistics
const stats = cameraSystem.getStats();
console.log('Camera Statistics:', stats);

// List all cameras
const cameras = cameraSystem.getAllCameras();
console.log('Active Cameras:', cameras.length);
```

## Version History

- **v1.0.0**: Initial implementation with basic camera modes
- **v1.1.0**: Added cinematic system and effects
- **v1.2.0**: Performance optimizations and memory management
- **v1.3.0**: Advanced configuration and debug features

## License

This module is part of the MIFF framework and follows the same licensing terms.

## Contributing

Contributions to CameraSystemPure are welcome! Please ensure:

1. All tests pass
2. Performance impact is minimal
3. Documentation is updated
4. Integration with other modules is considered

For detailed contribution guidelines, see the main MIFF repository documentation.