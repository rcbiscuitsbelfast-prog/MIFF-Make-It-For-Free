# RenderPayloadPure

Unified render payload management for cross-engine compatibility. Provides frame building, asset management, animation sequences, and export adapters for Unity, Web, and Godot engines.

## Features

- **Frame Management**: Create, update, and manage render frames
- **Asset Management**: Track and reference assets across engines
- **Animation Sequences**: Define and manage animation keyframes
- **Export Adapters**: Export to JSON, manifest, summary, and asset formats
- **Performance Metrics**: Track build time, complexity, and data size
- **Multi-Engine Support**: Unity, Web, Godot, and universal formats

## CLI Usage

### Basic Commands

```bash
# Create a new frame
node cliHarness.ts create-frame --frame-id=my-frame --engine=unity

# Build a frame with quality settings
node cliHarness.ts build-frame --engine=web --quality=high --optimize

# Get frame details
node cliHarness.ts get-frame --frame-id=my-frame

# List all frames
node cliHarness.ts list-frames

# Validate frame
node cliHarness.ts validate-frame --frame-id=my-frame

# Export frame
node cliHarness.ts export-frame --frame-id=my-frame --format=manifest

# Get statistics
node cliHarness.ts stats

# Create sample frame
node cliHarness.ts sample --engine=godot --quality=ultra
```

### Export Formats

- **JSON**: Raw frame data
- **Manifest**: Complete export with assets and animations
- **Summary**: Frame metadata and statistics
- **Assets**: Asset references and usage

### Quality Settings

- **Low**: Basic rendering, minimal effects
- **Medium**: Standard quality with moderate effects
- **High**: Enhanced quality with particle systems
- **Ultra**: Maximum quality with all effects

## API Usage

```typescript
import { RenderPayloadManager, FrameBuildOptions } from './Manager';

const manager = new RenderPayloadManager();

// Create frame
const frame = manager.createFrame('my-frame', 'My Frame', 'unity');

// Build frame with options
const buildOptions: FrameBuildOptions = {
  engine: 'web',
  quality: 'high',
  optimization: true
};
const result = manager.buildFrame(buildOptions);

// Export frame
const exportData = manager.exportFrame('my-frame', 'manifest');

// Get statistics
const stats = manager.getStats();
```

## Frame Structure

```typescript
interface RenderPayload {
  op: 'render';
  status: 'ok' | 'error';
  renderData: RenderData[];
  metadata: {
    schemaVersion: string;
    engine: string;
    timestamp: string;
    module: string;
    frameId?: string;
    frameName?: string;
  };
}
```

## Performance Metrics

- **Render Time**: Time to build the frame
- **Data Size**: Size of the payload in bytes
- **Complexity**: Calculated complexity score based on elements

## Integration

RenderPayloadPure integrates with:
- **BridgeSchemaPure**: Schema validation and conversion
- **Asset Management**: Asset reference tracking
- **Animation Systems**: Keyframe and sequence management
- **Export Systems**: Multi-format export capabilities

## Examples

### Creating a Game Scene

```typescript
// Create frame for game scene
manager.createFrame('game-scene', 'Main Game Scene', 'unity');

// Add player character
manager.addRenderData('game-scene', {
  id: 'player',
  type: 'sprite',
  position: { x: 100, y: 100 },
  asset: 'player_sprite',
  props: { texture: 'player.png' }
});

// Add UI elements
manager.addRenderData('game-scene', {
  id: 'health_bar',
  type: 'text',
  position: { x: 10, y: 10 },
  props: { text: 'Health: 100', color: '#ffffff' }
});
```

### Exporting for Different Engines

```typescript
// Export for Unity
const unityExport = manager.exportFrame('game-scene', 'manifest');

// Export for Web
const webExport = manager.exportFrame('game-scene', 'json');

// Export asset list
const assetsExport = manager.exportFrame('game-scene', 'assets');
```

## Testing

Run the golden tests to verify functionality:

```bash
npm test -- --testPathPattern=RenderPayloadPure
```

## License

MIT License - see LICENSE file for details.