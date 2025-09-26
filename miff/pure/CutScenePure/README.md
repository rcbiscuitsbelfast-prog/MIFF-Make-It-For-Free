# CutScenePure

**CutScenePure** is a comprehensive cinematic storytelling module for the MIFF ecosystem, enabling declarative cut scene definitions that work seamlessly across Unity, Unreal Engine, Godot, and WebBridgePure. This module provides timed sequences of camera transitions, dialogue, animations, and events using existing MIFF modules.

## 🌟 Features

### Core Functionality
- **Declarative Definitions**: Define cut scenes using JSON or TypeScript objects
- **Timed Sequences**: Precise timing control for all cinematic elements
- **Multi-track Support**: Organize camera, dialogue, audio, and effects into parallel tracks
- **Branching Logic**: Conditional triggers and decision points for dynamic storytelling

### Engine Integration
- **Unity Integration**: Timeline-based cut scenes using Unity's Playable system
- **Unreal Integration**: Sequencer-compatible cut scenes with Blueprint/C++ support
- **Godot Integration**: AnimationPlayer and Tween-based cut scene system
- **Web Integration**: Browser-based cut scene player with WebGL rendering

### Advanced Features
- **Camera Control**: Smooth camera movements, rotations, and FOV changes
- **Dialogue System**: Integrated with DialogueSystemPure for NPC conversations
- **Audio Cues**: Background music, sound effects, and voice acting support
- **Visual Effects**: Particle systems, lighting changes, and environmental effects

## 📦 Installation

CutScenePure is part of the MIFF ecosystem. Import it into your project:

```typescript
import {
  CutScenePure,
  CutSceneEngine,
  CutSceneWebBridge,
  CutSceneUnityBridge,
  CutSceneGodotBridge,
  CutSceneUnrealBridge
} from 'miff/pure/CutScenePure';
```

## 🚀 Quick Start

### 1. Create a Cut Scene Definition

```typescript
const cutSceneDefinition = {
  config: {
    id: 'welcome_cutscene',
    name: 'Welcome to RenderWorld',
    description: 'Introduction to the RenderWorld hub',
    duration: 5000, // 5 seconds
    autoStart: true,
    loop: false
  },
  tracks: [
    {
      id: 'camera_intro',
      type: 'camera',
      name: 'Camera Introduction',
      startTime: 0,
      endTime: 3000,
      properties: {
        position: { x: 0, y: 5, z: 10 },
        rotation: { x: -15, y: 0, z: 0 },
        fov: 60
      }
    },
    {
      id: 'dialogue_welcome',
      type: 'dialogue',
      name: 'Welcome Dialogue',
      startTime: 1000,
      endTime: 4000,
      properties: {
        speaker: 'Ancient Spirit',
        text: 'Welcome to RenderWorld, the gateway to MIFF demo worlds.',
        voice: 'wise_elder',
        emotion: 'welcoming'
      }
    }
  ],
  actions: [
    {
      id: 'camera_move_1',
      trackId: 'camera_intro',
      type: 'camera_move',
      timestamp: 0,
      duration: 3000,
      properties: {
        targetPosition: { x: 5, y: 3, z: 8 },
        targetRotation: { x: -10, y: 30, z: 0 },
        easing: 'ease-in-out'
      }
    },
    {
      id: 'show_portals',
      trackId: 'dialogue_welcome',
      type: 'highlight_portals',
      timestamp: 3000,
      properties: {
        portalIds: ['spirit_tamer', 'toppler', 'witcher'],
        highlightColor: '#00ff88',
        duration: 2000
      }
    }
  ]
};
```

### 2. Initialize the Engine

```typescript
import { CutSceneEngine } from 'miff/pure/CutScenePure';

const engine = new CutSceneEngine(cutSceneDefinition);

// Basic playback controls
engine.play();      // Start playback
engine.pause();     // Pause playback
engine.stop();      // Stop and reset
engine.setCurrentTime(2000); // Jump to specific time
```

### 3. Export for Different Engines

```typescript
// Web export
const webBridge = new CutSceneWebBridge();
const webScript = webBridge.generateCutSceneScript(cutSceneDefinition);

// Unity export
const unityBridge = new CutSceneUnityBridge();
const unityScript = unityBridge.generateCutSceneScript(cutSceneDefinition);

// Godot export
const godotBridge = new CutSceneGodotBridge();
const godotScript = godotBridge.generateCutSceneScript(cutSceneDefinition);

// Unreal export
const unrealBridge = new CutSceneUnrealBridge();
const unrealHeader = unrealBridge.generateCutSceneHeader(cutSceneDefinition);
const unrealSource = unrealBridge.generateCutSceneSource(cutSceneDefinition);
```

## 🎬 Track Types

### Camera Track
Controls camera position, rotation, and field of view.

```typescript
{
  id: 'camera_main',
  type: 'camera',
  name: 'Main Camera',
  startTime: 0,
  endTime: 5000,
  properties: {
    position: { x: 0, y: 5, z: 10 },
    rotation: { x: -15, y: 0, z: 0 },
    fov: 60,
    easing: 'linear'
  }
}
```

### Dialogue Track
Manages NPC dialogue and text display.

```typescript
{
  id: 'dialogue_hero',
  type: 'dialogue',
  name: 'Hero Speech',
  startTime: 1000,
  endTime: 3000,
  properties: {
    speaker: 'Hero',
    text: 'I will save the kingdom!',
    voice: 'hero_voice',
    emotion: 'determined',
    position: { x: -2, y: 2, z: 0 }
  }
}
```

### Audio Track
Handles background music and sound effects.

```typescript
{
  id: 'bgm_mystical',
  type: 'audio',
  name: 'Mystical Background Music',
  startTime: 0,
  endTime: 10000,
  properties: {
    audioId: 'mystical_theme',
    volume: 0.5,
    loop: true,
    fadeIn: 2000,
    fadeOut: 3000
  }
}
```

### Effects Track
Controls visual effects and particle systems.

```typescript
{
  id: 'particles_magic',
  type: 'effects',
  name: 'Magic Particles',
  startTime: 2000,
  endTime: 4000,
  properties: {
    effectType: 'sparkle',
    intensity: 0.8,
    color: '#ff6b6b',
    position: { x: 0, y: 3, z: 5 }
  }
}
```

## 🎯 Action Types

### Camera Actions
- `camera_move`: Smooth camera movement
- `camera_rotate`: Camera rotation
- `camera_zoom`: Field of view change
- `camera_shake`: Camera shake effect

### Dialogue Actions
- `show_dialogue`: Display dialogue text
- `hide_dialogue`: Hide dialogue text
- `character_talk`: Trigger character talking animation
- `subtitle_show`: Show subtitle text

### Audio Actions
- `play_sound`: Play sound effect
- `stop_audio`: Stop audio playback
- `fade_audio`: Fade audio volume
- `set_volume`: Set audio volume

### Effects Actions
- `spawn_particles`: Spawn particle effect
- `stop_particles`: Stop particle effect
- `change_lighting`: Modify scene lighting
- `trigger_effect`: Trigger visual effect

## 🔧 CLI Commands

CutScenePure integrates with the MIFF CLI for easy management:

### Preview Cut Scene
```bash
miff-cli cutscene preview --input scene.json --fullscreen --loop
```

### Export Cut Scene
```bash
miff-cli cutscene export --engine unity --input scene.json --output ./export
```

### Validate Cut Scene
```bash
miff-cli cutscene validate --input scene.json --strict
```

### Simulate Cut Scene
```bash
miff-cli cutscene simulate --input scene.json --debug
```

### Create Demo Scenes
```bash
miff-cli cutscene demo --output ./demo-scenes
```

## 🏗️ Architecture

### Core Classes
- **CutScenePure**: Main module class with utility functions
- **CutSceneEngine**: Core engine for playback and management
- **CutSceneTrack**: Represents a single track in a cut scene
- **CutSceneAction**: Represents a single action within a track

### Bridge Classes
- **CutSceneWebBridge**: Web platform integration
- **CutSceneUnityBridge**: Unity engine integration
- **CutSceneGodotBridge**: Godot engine integration
- **CutSceneUnrealBridge**: Unreal Engine integration

### Integration
CutScenePure integrates with:
- **SceneBuilderPure**: For scene composition and world building
- **DialogueSystemPure**: For NPC dialogue management
- **AudioPure**: For audio playback and effects
- **EffectsPure**: For visual effects and particles
- **AnimationPure**: For character and object animations

## 📋 Requirements

- **MIFF Core**: Latest version with EventsPure
- **TypeScript**: 4.5+ for full type support
- **WebGL**: For web-based cut scene rendering
- **Engine SDKs**: Unity 2021.3+, Unreal 5.0+, Godot 4.0+

## 🔄 Workflow

1. **Design**: Plan your cut scene with tracks and actions
2. **Define**: Create JSON or TypeScript definition
3. **Test**: Preview in browser or target engine
4. **Refine**: Adjust timing and effects as needed
5. **Export**: Generate engine-specific implementation
6. **Deploy**: Integrate into your game project

## 🎨 Best Practices

### Performance
- Keep track count reasonable (< 20 tracks per scene)
- Use appropriate easing functions for smooth motion
- Cache frequently used assets and audio files
- Test on target hardware for frame rate

### Design
- Plan camera movements to guide player attention
- Time dialogue to match character animations
- Use audio cues to enhance emotional impact
- Balance visual effects without overwhelming the scene

### Integration
- Test cut scenes in context with game systems
- Ensure compatibility with save/load systems
- Consider accessibility options for dialogue
- Plan for localization of text content

## 🐛 Troubleshooting

### Common Issues
- **Timing Problems**: Check track start/end times and action timestamps
- **Missing Assets**: Ensure all referenced assets are available
- **Performance Issues**: Reduce particle effects and complex animations
- **Integration Errors**: Verify engine-specific export settings

### Debug Mode
Enable debug mode for detailed logging:

```typescript
const engine = new CutSceneEngine(definition, { debug: true });
```

## 📚 Examples

### Sample Cut Scene: RenderWorld Welcome
See the included sample definition for a complete example:
- Camera pans across warehouse hub
- Ancient Spirit NPC delivers welcome message
- Spirit Lens glows and portals highlight
- Smooth transitions and audio cues

### Demo Scenes
Run the demo command to generate example cut scenes:
```bash
miff-cli cutscene demo --output ./my-scenes
```

## 🤝 Contributing

CutScenePure is part of the MIFF ecosystem. Contributions are welcome:
- Report bugs and suggest features
- Improve engine integrations
- Add new track and action types
- Enhance CLI functionality

## 📄 License

CutScenePure is licensed under the MIT License. See LICENSE file for details.

---

**CutScenePure** - Bringing cinematic storytelling to the MIFF ecosystem ✨