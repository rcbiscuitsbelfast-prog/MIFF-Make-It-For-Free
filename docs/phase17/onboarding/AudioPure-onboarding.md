# AudioPure Onboarding Pack

## 🔊 Module Overview
AudioPure provides comprehensive audio system capabilities including spatial audio, dynamic mixing, sound effect management, and music playback. Designed for engine-agnostic integration with deterministic behavior.

## 🚀 CLI Usage

### Basic Commands
```bash
# Validate audio system configuration
npx ts-node cli/commands/audio.ts validate --sample-rate 44100 --channels 2

# Test audio playback
npx ts-node cli/commands/audio.ts test --sound-id test-bgm --volume 0.5

# Load audio assets
npx ts-node cli/commands/audio.ts load --directory ./audio-assets
```

### Orchestration Commands
```bash
# Initialize audio system
npx ts-node cli/commands/audio.ts init --config audio-config.json --headless

# Teardown audio system
npx ts-node cli/commands/audio.ts teardown --fade-out 1000

# Replay audio sequence
npx ts-node cli/commands/audio.ts replay --fixture fixtures/audio-session.json --quiet

# Export audio manifest
npx ts-node cli/commands/audio.ts export --format manifest --output audio-manifest.json
```

## 📁 Sample Fixtures

### Audio System Configuration
```json
{
  "sampleRate": 44100,
  "channels": 2,
  "bufferSize": 2048,
  "spatialAudio": true,
  "maxSimultaneousSounds": 16,
  "masterVolume": 1.0,
  "categories": {
    "music": {"volume": 0.7, "priority": 1},
    "sfx": {"volume": 0.8, "priority": 2},
    "voice": {"volume": 0.9, "priority": 3},
    "ambient": {"volume": 0.5, "priority": 0}
  }
}
```

### Sound Definition Example
```json
{
  "sounds": [
    {
      "id": "grove-ambient",
      "name": "Grove Ambient Music",
      "category": "music",
      "file": "audio/grove-ambient.ogg",
      "volume": 0.7,
      "pitch": 1.0,
      "loop": true,
      "fadeIn": 2000,
      "fadeOut": 1500,
      "spatialSettings": {
        "is3D": false,
        "rolloffFactor": 1.0,
        "maxDistance": 100
      }
    },
    {
      "id": "footstep",
      "name": "Footstep Sound",
      "category": "sfx",
      "file": "audio/footstep.wav",
      "volume": 0.6,
      "pitch": 1.0,
      "loop": false,
      "randomPitch": 0.1,
      "spatialSettings": {
        "is3D": true,
        "rolloffFactor": 2.0,
        "maxDistance": 20
      }
    }
  ]
}
```

### Audio Session Replay
```json
{
  "sessionId": "audio-test-001",
  "duration": 15000,
  "events": [
    {
      "timestamp": 0,
      "type": "play",
      "soundId": "grove-ambient",
      "position": {"x": 0, "y": 0, "z": 0}
    },
    {
      "timestamp": 2000,
      "type": "play",
      "soundId": "footstep", 
      "position": {"x": 150, "y": 200, "z": 0}
    },
    {
      "timestamp": 10000,
      "type": "stop",
      "soundId": "grove-ambient",
      "fadeOut": 1500
    }
  ]
}
```

## 🧪 Golden Test Walkthrough

```bash
# Run AudioPure golden tests
npm test -- --testNamePattern="AudioPure"

# Test audio configuration validation
npx ts-node cli/commands/audio.ts validate --sample-rate 44100 --spatial

# Test sound loading and playback
npx ts-node cli/commands/audio.ts test --sound-id test-sound --headless

# Test spatial audio positioning
npx ts-node cli/commands/audio.ts test-spatial --listener-pos "0,0,0" --source-pos "10,0,0"
```

## 🔄 Replay/Export Examples

### Recording Audio Sessions
```bash
# Record audio session with spatial positioning
npx ts-node cli/commands/audio.ts record \
  --scenario "witcher-grove" \
  --enable-spatial \
  --output audio-session.json

# Record with performance monitoring
npx ts-node cli/commands/audio.ts record \
  --scenario "spirit-tamer" \
  --monitor-performance \
  --output audio-perf-session.json
```

### Replaying Audio Sessions
```bash
# Deterministic audio replay
npx ts-node cli/commands/audio.ts replay \
  --fixture audio-session.json \
  --headless \
  --quiet

# Replay with validation
npx ts-node cli/commands/audio.ts replay \
  --fixture audio-session.json \
  --validate-timing \
  --output-report replay-report.json
```

### Export Audio Data
```bash
# Export audio manifest
npx ts-node cli/commands/audio.ts export \
  --format manifest \
  --output audio-manifest.json

# Export performance metrics
npx ts-node cli/commands/audio.ts export \
  --session audio-perf-session.json \
  --format metrics \
  --output audio-metrics.csv

# Export for Unity
npx ts-node cli/commands/audio.ts export \
  --format unity \
  --output unity-audio-config.json
```

## 🎯 Deterministic Globals

AudioPure ensures deterministic behavior through:
- Fixed sample rates and buffer sizes
- Consistent audio processing order
- Deterministic spatial audio calculations
- Reproducible mixing and volume levels
- Stable random seed for procedural audio effects

## 🔗 Orchestration Patterns

### Audio Lifecycle
1. **Initialization** - Set up audio context and load sound definitions
2. **Loading** - Load audio assets and validate formats
3. **Runtime** - Handle playback, mixing, and spatial positioning
4. **Monitoring** - Track performance and resource usage
5. **Cleanup** - Fade out sounds and release audio resources
6. **Teardown** - Clean shutdown with state preservation

### Integration Points
- Scene audio through VisualReplaySystemPure hooks
- Music synchronization with RhythmSystemPure
- Voice acting integration with DialoguePure
- Ambient audio via WorldEnhancementsPure
- Network audio sync through NetworkBridgePure

## 📋 Quick Validation Checklist
- [ ] Audio configuration is valid for target platforms
- [ ] Sound files are properly formatted and accessible
- [ ] Spatial audio calculations are mathematically correct
- [ ] Volume levels are within safe ranges
- [ ] Audio events synchronize correctly with game state
- [ ] Performance metrics are within acceptable limits