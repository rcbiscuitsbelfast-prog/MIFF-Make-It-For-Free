# VisualReplaySystemPure

A deterministic visual replay system for MIFF (Modular Interactive Framework) that supports scenario test replay with visual hooks, performance analysis, and contributor dashboard integration.

## Overview

VisualReplaySystemPure captures and replays scenario tests with comprehensive visual hooks, input tracking, and performance monitoring. It provides deterministic replay functionality that's engine-agnostic and ready for integration with Unity, Kaboom.js, and Godot adapters.

## Core Concepts

### Visual Replay
- **Frame Capture**: Deterministic frame-by-frame recording
- **Visual Hooks**: Sprite, animation, particle, sound, UI, camera, and light events
- **Input Tracking**: Keyboard, mouse, gamepad, and touch input recording
- **Performance Monitoring**: CPU, memory, and render time metrics

### MIFF Integration
- **Engine Agnostic**: No engine bindings or visual dependencies
- **Adapter Ready**: Hooks for Unity, Kaboom.js, and Godot integration
- **Scenario Support**: Works with any MIFF scenario pack
- **Deterministic**: Same inputs always produce identical replays

### Contributor Dashboards
- **Replay Metadata**: Frame count, input streams, outcomes
- **Performance Analytics**: Bottleneck detection and optimization insights
- **Visual Analysis**: Hook patterns and sequence identification
- **Export Formats**: JSON, CSV, and human-readable summaries

## Schema

### ReplayFrame
```typescript
interface ReplayFrame {
  frameNumber: number;           // Sequential frame identifier
  timestamp: number;             // Frame timestamp
  gameState: any;                // Game state snapshot
  inputState: InputState;        // Current input state
  visualHooks: VisualHook[];     // Visual events for this frame
  metadata: FrameMetadata;       // Performance and debug data
}
```

### VisualHook
```typescript
interface VisualHook {
  id: string;                    // Unique hook identifier
  type: 'sprite' | 'animation' | 'particle' | 'sound' | 'ui' | 'camera' | 'light';
  target: string;                // Target entity or system
  action: 'show' | 'hide' | 'play' | 'stop' | 'update' | 'trigger';
  data: any;                     // Hook-specific data
  position?: { x: number; y: number; z?: number };  // Spatial position
  scale?: { x: number; y: number; z?: number };     // Scale factors
  rotation?: number;             // Rotation angle
  duration?: number;             // Animation duration
  easing?: string;               // Easing function
}
```

### InputState
```typescript
interface InputState {
  keys: Record<string, boolean>; // Keyboard state
  mouse: {                       // Mouse state
    x: number;                   // X coordinate
    y: number;                   // Y coordinate
    buttons: Record<string, boolean>;  // Button states
  };
  gamepad: {                     // Gamepad state
    connected: boolean;           // Connection status
    axes: number[];              // Analog axes
    buttons: Record<string, boolean>;  // Button states
  };
  touch: {                       // Touch state
    active: boolean;              // Touch active
    points: Array<{              // Touch points
      id: number;                // Point identifier
      x: number;                 // X coordinate
      y: number;                 // Y coordinate
      pressure: number;          // Pressure value
    }>;
  };
}
```

### ReplaySession
```typescript
interface ReplaySession {
  id: string;                    // Unique session identifier
  scenarioId: string;            // Scenario identifier
  version: string;               // Replay format version
  timestamp: number;             // Session start time
  duration: number;              // Total duration
  frameCount: number;            // Total frame count
  inputStream: InputEvent[];     // Recorded input events
  outcome: ReplayOutcome;        // Session outcome
  metadata: ReplayMetadata;      // Session metadata
}
```

### ReplayResult
```typescript
interface ReplayResult {
  op: 'replay';                  // Operation type
  session: ReplaySession;        // Session information
  frames: ReplayFrame[];         // All recorded frames
  statistics: ReplayStatistics;  // Calculated statistics
  analysis: ReplayAnalysis;      // Analysis results
  exportable: boolean;           // Export capability
}
```

## Usage

### Basic Replay Session Creation

```typescript
import { createReplaySession, recordFrame, generateReplayResult } from './index';

// Create a new replay session
const config = {
  frameRate: 60,
  quality: 'high',
  captureInput: true,
  captureVisual: true,
  capturePerformance: true,
  compression: false,
  maxFrames: 300
};

const session = createReplaySession('physics_demo', config, {
  engine: 'pure',
  platform: 'web',
  tags: ['physics', 'demo']
});

// Record frames during gameplay
const frame = recordFrame(
  session,
  frameNumber,
  gameState,
  inputState,
  visualHooks,
  metadata
);

// Generate final replay result
const result = generateReplayResult(session, allFrames);
```

### Visual Hook Recording

```typescript
import { VisualHook } from './index';

// Record sprite updates
const spriteHook: VisualHook = {
  id: 'player_sprite',
  type: 'sprite',
  target: 'player',
  action: 'update',
  data: { texture: 'player_run.png' },
  position: { x: 100, y: 200 },
  scale: { x: 1, y: 1 }
};

// Record sound effects
const soundHook: VisualHook = {
  id: 'jump_sound',
  type: 'sound',
  target: 'audio',
  action: 'play',
  data: { sound: 'jump.wav', volume: 0.8 }
};

// Record particle effects
const particleHook: VisualHook = {
  id: 'dust_trail',
  type: 'particle',
  target: 'player',
  action: 'trigger',
  data: { effect: 'dust_particles', count: 10 },
  position: { x: 100, y: 200 }
};
```

### Input Event Recording

```typescript
import { recordInputEvent } from './index';

// Record keyboard events
recordInputEvent(session, frameNumber, 'keydown', {
  key: 'Space',
  code: 'Space',
  repeat: false
});

// Record mouse events
recordInputEvent(session, frameNumber, 'mousedown', {
  button: 0,
  x: 640,
  y: 360
});

// Record gamepad events
recordInputEvent(session, frameNumber, 'gamepad', {
  axes: [0.5, -0.3],
  buttons: { A: true, B: false }
});
```

### Performance Monitoring

```typescript
import { FrameMetadata } from './index';

const metadata: FrameMetadata = {
  frameRate: 60,
  deltaTime: 16.67,
  performance: {
    cpuUsage: 25.5,        // CPU usage percentage
    memoryUsage: 128.7,    // Memory usage in MB
    renderTime: 12.3       // Render time in ms
  },
  debug: {
    entities: 45,           // Active entity count
    systems: 8,             // Active system count
    events: 12              // Event count
  }
};
```

## CLI Harness

The CLI harness processes replay data from JSON input files:

```bash
npx ts-node cliHarness.ts fixtures/visual_replay.json
```

### Input Format
```json
{
  "scenarioId": "physics_demo",
  "config": {
    "frameRate": 60,
    "quality": "high",
    "captureInput": true,
    "captureVisual": true,
    "capturePerformance": true
  },
  "metadata": {
    "engine": "pure",
    "platform": "web"
  },
  "frames": [/* frame data */],
  "inputEvents": [/* input events */],
  "outcome": {/* outcome data */},
  "checkpoints": [/* checkpoint data */],
  "exportFormat": "summary"
}
```

### Output Format
```json
{
  "op": "replay",
  "session": {/* session data */},
  "frames": [/* recorded frames */],
  "statistics": {/* calculated statistics */},
  "analysis": {/* analysis results */},
  "exportable": true
}
```

## Export Formats

### JSON Export
Complete replay data in structured JSON format for programmatic access.

### CSV Export
Frame-by-frame data in CSV format for spreadsheet analysis:
```csv
Frame,Timestamp,InputEvents,VisualHooks,CPU,Memory,RenderTime
1,1640995200000,0,2,15.2,45.8,8.3
2,1640995216000,0,1,14.8,46.1,7.9
3,1640995232000,1,3,18.5,46.3,9.2
```

### Summary Export
Human-readable summary for contributor dashboards:
```
Visual Replay Summary
===================

Session: replay_abc123
Scenario: physics_demo
Duration: 3.00s
Frames: 300
Average FPS: 60.00

Input Events: 45
Visual Hooks: 1,247

Performance:
  CPU: 22.3% avg
  Memory: 156.7 MB avg
  Render: 11.2ms avg

Critical Moments: 3
Performance Bottlenecks: 1

Recommendations:
  - Consider reducing visual effects for better frame rate
  - High input event count - consider input buffering
```

## MIFF Integration

### Engine Adapter Hooks

The system is designed for easy integration with various engines:

#### Unity Integration
```typescript
// Unity adapter would implement these hooks
class UnityVisualHookAdapter {
  onSpriteUpdate(hook: VisualHook) {
    // Update Unity sprite renderer
  }
  
  onSoundPlay(hook: VisualHook) {
    // Play Unity audio source
  }
  
  onParticleTrigger(hook: VisualHook) {
    // Trigger Unity particle system
  }
}
```

#### Kaboom.js Integration
```typescript
// Kaboom.js adapter implementation
class KaboomVisualHookAdapter {
  onSpriteUpdate(hook: VisualHook) {
    // Update Kaboom sprite
  }
  
  onSoundPlay(hook: VisualHook) {
    // Play Kaboom sound
  }
  
  onParticleTrigger(hook: VisualHook) {
    // Trigger Kaboom particle effect
  }
}
```

#### Godot Integration
```typescript
// Godot adapter implementation
class GodotVisualHookAdapter {
  onSpriteUpdate(hook: VisualHook) {
    // Update Godot sprite node
  }
  
  onSoundPlay(hook: VisualHook) {
    // Play Godot audio stream
  }
  
  onParticleTrigger(hook: VisualHook) {
    // Trigger Godot particle system
  }
}
```

### Scenario Pack Integration

Works seamlessly with MIFF scenario packs:

```typescript
import { TopplerDemoPure } from '../scenarios/TopplerDemoPure';
import { createReplaySession, recordFrame } from './index';

// Create replay session for scenario
const session = createReplaySession('toppler_demo', config);

// During scenario execution
const gameState = TopplerDemoPure.generateFrame(time);
const visualHooks = TopplerDemoPure.getVisualHooks(gameState);
const inputState = getCurrentInputState();

// Record frame
recordFrame(session, frameNumber, gameState, inputState, visualHooks, metadata);
```

## Performance Analysis

### Bottleneck Detection

Automatically identifies performance issues:

- **CPU Bottlenecks**: Usage above 80% threshold
- **Memory Bottlenecks**: Usage above 1GB threshold
- **Render Bottlenecks**: Frame time above 16.67ms (60 FPS)

### Critical Moment Identification

Detects significant events:

- **Input Spikes**: High input event frequency
- **Visual Intensity Changes**: Sudden visual hook changes
- **Performance Drops**: Significant performance degradation

### Recommendations

Generates actionable optimization suggestions:

- Frame rate optimization
- Input buffering strategies
- Visual effect batching
- Memory management improvements

## Contributor Dashboard Features

### Replay Metadata
- **Session Information**: ID, scenario, duration, frame count
- **Input Streams**: Complete input event history
- **Outcomes**: Success status, scores, achievements
- **Checkpoints**: Pass/fail status with metrics

### Performance Analytics
- **Real-time Metrics**: CPU, memory, render time
- **Trend Analysis**: Performance over time
- **Bottleneck Reports**: Identified issues and severity
- **Optimization Suggestions**: Actionable recommendations

### Visual Analysis
- **Hook Patterns**: Frequency and timing analysis
- **Sequence Identification**: Visual event sequences
- **Intensity Mapping**: Visual complexity over time
- **Effect Tracking**: Particle, sound, and animation usage

## Remix-Safe Features

### Deterministic Replay
- **Pure Functions**: No side effects or external dependencies
- **Consistent Results**: Same inputs always produce identical outputs
- **Engine Agnostic**: No engine-specific bindings
- **Platform Independent**: Works across different platforms

### Modular Design
- **Hook System**: Pluggable visual hook architecture
- **Adapter Pattern**: Easy integration with different engines
- **Configurable Capture**: Selective data recording
- **Extensible Analysis**: Custom analysis algorithms

### Performance Monitoring
- **Real-time Metrics**: Live performance tracking
- **Historical Analysis**: Performance trend analysis
- **Bottleneck Detection**: Automatic issue identification
- **Optimization Guidance**: Performance improvement suggestions

## Testing

Run the golden tests to verify deterministic behavior:

```bash
npm test -- systems/VisualReplaySystemPure/tests/golden_VisualReplaySystemPure.test.ts
```

### Test Coverage
- **Replay Flow**: Complete replay pipeline
- **Statistics Calculation**: Accuracy verification
- **Analysis Generation**: Pattern detection
- **Export Functionality**: Format validation
- **Visual Hooks**: Hook capture and analysis
- **Performance Analysis**: Metrics and bottlenecks
- **Input Analysis**: Event tracking and patterns

## Integration Examples

### Unity Integration
```typescript
// Unity MonoBehaviour for replay integration
public class ReplayManager : MonoBehaviour {
  private ReplaySession session;
  
  void Start() {
    session = createReplaySession("unity_demo", config);
  }
  
  void Update() {
    // Capture frame data
    var frame = recordFrame(session, Time.frameCount, gameState, inputState, visualHooks, metadata);
  }
}
```

### Kaboom.js Integration
```typescript
// Kaboom.js scene for replay integration
scene("replay", () => {
  const session = createReplaySession("kaboom_demo", config);
  
  onUpdate(() => {
    // Capture frame data
    const frame = recordFrame(session, frameCount, gameState, inputState, visualHooks, metadata);
  });
});
```

### Godot Integration
```typescript
// Godot Node for replay integration
extends Node
class_name ReplayManager

var session: ReplaySession

func _ready():
  session = createReplaySession("godot_demo", config)

func _process(delta):
  # Capture frame data
  var frame = recordFrame(session, Engine.get_process_frames(), gameState, inputState, visualHooks, metadata)
```

## Performance Considerations

### Memory Management
- **Frame Caching**: Efficient frame storage
- **Compression**: Optional data compression
- **Cleanup**: Automatic memory cleanup
- **Streaming**: Large replay streaming support

### Processing Efficiency
- **Lazy Analysis**: On-demand analysis generation
- **Caching**: Result caching for repeated analysis
- **Parallel Processing**: Multi-threaded analysis
- **Incremental Updates**: Incremental statistics updates

### Export Optimization
- **Streaming Export**: Large dataset streaming
- **Format Optimization**: Efficient export formats
- **Compression**: Export data compression
- **Chunking**: Large export chunking

## License

This module follows the same licensing as the parent project, ensuring remix-safe usage and distribution. The visual replay system is designed to promote deterministic testing and performance analysis across different game engines and platforms.