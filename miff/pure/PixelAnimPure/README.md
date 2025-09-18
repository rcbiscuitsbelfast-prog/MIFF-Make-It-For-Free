# PixelAnimPure

A comprehensive pixel animation system for MIFF games. Manages animations, sprite sheets, animation sequences, and presets with full CLI support and export capabilities.

## Features

- **Animation Management**: Create, manage, and organize pixel animations
- **Preset System**: Pre-built animation templates for common use cases
- **Animation Sequences**: Chain animations with transition logic
- **Sprite Sheet Generation**: Combine animations into optimized sprite sheets
- **Playback Simulation**: Simulate animation playback for testing
- **Multi-Format Export**: Export animations in JSON, CSV, Markdown, HTML, YAML, XML formats
- **Validation**: Comprehensive animation validation with error reporting
- **Statistics**: Track animation usage and performance metrics

## Usage

### Basic API

```typescript
import { PixelAnimManager, AnimationPreset } from './Manager';
import { PixelAnimPure } from './index';

const manager = new PixelAnimManager();

// Create animation from preset
const walkResult = manager.createAnimationFromPreset('walk-basic');

// Create custom animation
const customResult = manager.createAnimation('My Animation', [
  'frame1.png', 'frame2.png', 'frame3.png'
], 12, true);

// Create animation sequence
const walkAnim = manager.getAnimation('Basic Walk Cycle');
const idleAnim = manager.getAnimation('Basic Idle');
manager.createSequence('character-movement', 'Character Movement', 
  [walkAnim.animation!, idleAnim.animation!], 
  { 'Basic Idle': 'Basic Walk Cycle', 'Basic Walk Cycle': 'Basic Idle' }
);

// Generate sprite sheet
const spriteResult = manager.createSpriteSheet(
  ['Basic Walk Cycle', 'Basic Idle'], 32, 32
);
```

### CLI Usage

```bash
# List all animations
npx tsx cliHarness.ts list

# List presets by category
npx tsx cliHarness.ts listPresets character

# Create animation from preset
npx tsx cliHarness.ts createFromPreset walk-basic

# Create custom animation
npx tsx cliHarness.ts create "My Walk" "walk1.png,walk2.png,walk3.png,walk4.png" 8 true

# Get animation details
npx tsx cliHarness.ts get "Basic Walk Cycle"

# Create animation sequence
npx tsx cliHarness.ts createSequence movement-seq "Movement Sequence" "Basic Walk Cycle,Basic Idle"

# Create sprite sheet
npx tsx cliHarness.ts createSpriteSheet "Basic Walk Cycle,Basic Idle" 32 32

# Simulate animation playback
npx tsx cliHarness.ts simulate "Basic Walk Cycle" 3000

# Get animation statistics
npx tsx cliHarness.ts stats

# Export animation
npx tsx cliHarness.ts export "Basic Walk Cycle" manifest
npx tsx cliHarness.ts export "Basic Walk Cycle" yaml

# Validate animation
npx tsx cliHarness.ts validate fixtures/sample_animation.json

# Delete animation
npx tsx cliHarness.ts delete "My Walk"
```

## Data Structures

### Animation
```typescript
interface Animation {
  name: string;                  // Animation name
  frames: AnimationFrame[];      // Array of animation frames
  loop: boolean;                 // Whether animation loops
  speed: number;                 // Frames per second
}
```

### AnimationFrame
```typescript
interface AnimationFrame {
  frame: number;                 // Frame index
  duration: number;              // Frame duration in milliseconds
  layer: string;                 // Frame image filename or data URL
}
```

### AnimationSequence
```typescript
interface AnimationSequence {
  id: string;                    // Unique sequence identifier
  name: string;                  // Human-readable name
  animations: Animation[];       // Animations in the sequence
  transitions?: Record<string, string>; // Animation transition mappings
  metadata?: {
    category?: string;           // Sequence category
    tags?: string[];             // Sequence tags
    author?: string;             // Sequence author
    created?: string;            // Creation timestamp
  };
}
```

### AnimationPreset
```typescript
interface AnimationPreset {
  id: string;                    // Unique preset identifier
  name: string;                  // Preset name
  description: string;           // Preset description
  category: 'character' | 'environment' | 'effect' | 'ui' | 'custom';
  frames: string[];              // Frame filenames
  fps: number;                   // Frames per second
  loop: boolean;                 // Whether animation loops
  metadata?: {
    frameWidth?: number;         // Frame width in pixels
    frameHeight?: number;        // Frame height in pixels
    style?: string;              // Art style
    tags?: string[];             // Preset tags
  };
}
```

### SpriteSheet
```typescript
interface SpriteSheet {
  width: number;                 // Total sprite sheet width
  height: number;                // Total sprite sheet height
  frameWidth: number;            // Individual frame width
  frameHeight: number;           // Individual frame height
  layers: string[];              // Array of frame filenames/URLs
}
```

## Built-in Presets

### Character Animations
- **walk-basic**: 4-frame walk cycle (8 FPS, looping)
- **idle-basic**: 2-frame idle animation (4 FPS, looping)  
- **attack-sword**: 3-frame sword attack (12 FPS, non-looping)

### Effect Animations
- **flame-flicker**: 4-frame flame animation (10 FPS, looping)

### Environment Animations
- **water-flow**: 4-frame water flow (6 FPS, looping)

## Export Formats

### Standard Formats
- **JSON**: Complete animation data with frame details
- **CSV**: Tabular format for frame data
- **Markdown**: Human-readable documentation format
- **HTML**: Web-ready presentation format
- **YAML**: Configuration-friendly format
- **XML**: Structured markup format

### Animation-Specific Formats
- **manifest**: Full animation manifest with schema and metadata
- **spritesheet**: Combined sprite sheet and animation data

## CLI Operations

| Operation | Description | Arguments |
|-----------|-------------|-----------|
| `create` | Create custom animation | name, frames, [fps], [loop] |
| `createFromPreset` | Create from preset | presetId |
| `get` | Get animation details | name |
| `list` | List animations | [loop filter] |
| `addPreset` | Add custom preset | (via JSON file) |
| `listPresets` | List presets | [category] |
| `createSequence` | Create animation sequence | sequenceId, name, animationNames |
| `getSequence` | Get sequence details | sequenceId |
| `listSequences` | List all sequences | - |
| `createSpriteSheet` | Generate sprite sheet | animationNames, frameWidth, frameHeight |
| `simulate` | Simulate playback | name, [duration] |
| `stats` | Get statistics | - |
| `export` | Export animation | name, [format] |
| `validate` | Validate animation | jsonFile |
| `delete` | Delete animation | name |

## Animation Simulation

The simulation feature allows you to test animation playback:

```typescript
const simulation = manager.simulate('Basic Walk Cycle', 5000);
// Returns:
// - Total cycles completed
// - Frame events with timestamps
// - Animation duration and timing
// - Performance metrics
```

## Validation

Comprehensive validation ensures animation integrity:

- **Name validation**: Non-empty animation names
- **Frame validation**: At least one frame required
- **Speed validation**: FPS between 1-60
- **Frame structure**: Valid frame data with layers and durations
- **Dependency checking**: Prevents deletion of animations used in sequences

## Testing

```bash
# Run unit tests
npm test

# Run golden tests
npm run test:golden

# Test CLI harness
npx tsx cliHarness.ts listPresets
npx tsx cliHarness.ts stats
```

## Fixtures

- `fixtures/sample_animation.json`: Valid animation for testing
- `fixtures/custom_preset.json`: Custom preset example

## Integration

PixelAnimPure integrates seamlessly with other MIFF systems:

- **PixelGenPure**: Provides animations for pixel art generation
- **PixelDrawPure**: Supplies frame data for drawing operations
- **AssetManifestPure**: References animation assets
- **WorldManifestPure**: Animates world elements and effects

## Performance

- **Efficient Storage**: Animations stored as lightweight frame references
- **Memory Management**: Automatic cleanup of unused animations
- **Batch Operations**: Efficient sprite sheet generation
- **Deterministic Playback**: Consistent frame timing and progression

## Examples

### Creating a Character Animation Set
```typescript
// Create walk cycle
const walkResult = manager.createAnimation('Character Walk', [
  'char_walk_1.png', 'char_walk_2.png', 'char_walk_3.png', 'char_walk_4.png'
], 8, true);

// Create idle animation
const idleResult = manager.createAnimation('Character Idle', [
  'char_idle_1.png', 'char_idle_2.png'
], 4, true);

// Create attack animation
const attackResult = manager.createAnimation('Character Attack', [
  'char_attack_1.png', 'char_attack_2.png', 'char_attack_3.png'
], 15, false);

// Combine into sequence
manager.createSequence('character-full', 'Full Character Set', [
  walkResult.animation!, idleResult.animation!, attackResult.animation!
], {
  'Character Idle': 'Character Walk',
  'Character Walk': 'Character Attack',
  'Character Attack': 'Character Idle'
});
```

### Effect Animation System
```typescript
// Create flame effect
const flameResult = manager.createAnimationFromPreset('flame-flicker');

// Create water effect
const waterResult = manager.createAnimationFromPreset('water-flow');

// Generate combined sprite sheet
const effectSheet = manager.createSpriteSheet([
  'Flame Flicker', 'Water Flow'
], 32, 32);
```

## Error Handling

Comprehensive error handling with detailed messages:

- Animation not found errors
- Duplicate animation/preset errors
- Invalid FPS range errors
- Empty frame array errors
- Sequence dependency errors
- Validation failure details

All operations return structured responses with `ok` status and detailed error arrays when applicable.

## Remix Hooks

This module supports the following remix hooks for customization:

- `animation.create`: Called when a new animation is created
- `animation.preset.add`: Called when a preset is added
- `animation.sequence.create`: Called when a sequence is created
- `animation.simulate`: Called during animation simulation
- `animation.export`: Called during animation export

## License

MIT License - Part of the MIFF (Make It For Free) framework.