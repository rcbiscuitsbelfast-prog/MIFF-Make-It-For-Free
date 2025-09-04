# VisualReplaySystemPure Onboarding Pack

## 🎬 Module Overview
VisualReplaySystemPure captures and replays game scenarios with comprehensive visual hooks, input tracking, and performance monitoring. Provides deterministic replay functionality for testing and debugging.

## 🚀 CLI Usage

### Basic Commands
```bash
# Record a new replay session
npx ts-node miff/pure/VisualReplaySystemPure/cliHarness.ts record --scenario witcher-grove

# Replay existing session
npx ts-node miff/pure/VisualReplaySystemPure/cliHarness.ts replay --file session.json

# Analyze replay performance
npx ts-node miff/pure/VisualReplaySystemPure/cliHarness.ts analyze --session session.json
```

### Orchestration Commands
```bash
# Initialize replay system
npx ts-node miff/pure/VisualReplaySystemPure/cliHarness.ts init --config replay-config.json

# Teardown replay session
npx ts-node miff/pure/VisualReplaySystemPure/cliHarness.ts teardown --export-metrics

# Replay with deterministic output
npx ts-node miff/pure/VisualReplaySystemPure/cliHarness.ts replay --fixture fixtures/sample-session.json --quiet

# Export replay data
npx ts-node miff/pure/VisualReplaySystemPure/cliHarness.ts export --format video-frames --output replay-frames/
```

## 📁 Sample Fixtures

### Replay Session Configuration
```json
{
  "sessionConfig": {
    "captureRate": 60,
    "enableVisualHooks": true,
    "enableInputTracking": true,
    "enablePerformanceMonitoring": true,
    "maxFrames": 3600,
    "compressionLevel": 5
  },
  "scenarioId": "witcher-grove-exploration",
  "seed": 12345,
  "expectedDuration": 60000
}
```

### Visual Hook Example
```json
{
  "frame": 120,
  "hooks": [
    {
      "id": "player-move",
      "type": "sprite",
      "target": "player",
      "action": "update",
      "data": {
        "position": {"x": 150, "y": 200},
        "animation": "walk-right",
        "frame": 2
      }
    },
    {
      "id": "bgm-start",
      "type": "sound",
      "target": "background-music",
      "action": "play",
      "data": {
        "track": "grove-ambient",
        "volume": 0.7,
        "loop": true
      }
    }
  ]
}
```

### Input Tracking Sample
```json
{
  "frame": 120,
  "inputState": {
    "keys": {
      "ArrowRight": true,
      "Space": false
    },
    "mouse": {
      "x": 320,
      "y": 240,
      "buttons": {"left": false, "right": false}
    },
    "gamepad": {
      "connected": false,
      "axes": [],
      "buttons": {}
    },
    "touch": {
      "active": false,
      "points": []
    }
  }
}
```

## 🧪 Golden Test Walkthrough

```bash
# Run VisualReplaySystemPure golden tests
npm test -- --testNamePattern="VisualReplaySystemPure"

# Test replay capture
npx ts-node miff/pure/VisualReplaySystemPure/cliHarness.ts record --scenario test-scenario --duration 5000

# Test replay playback
npx ts-node miff/pure/VisualReplaySystemPure/cliHarness.ts replay --file test-session.json --validate

# Test performance analysis
npx ts-node miff/pure/VisualReplaySystemPure/cliHarness.ts analyze --session test-session.json --metrics cpu,memory,render
```

## 🔄 Replay/Export Examples

### Recording a Session
```bash
# Start recording with specific scenario
npx ts-node miff/pure/VisualReplaySystemPure/cliHarness.ts record \
  --scenario "spirit-tamer-trial" \
  --seed 42 \
  --duration 30000 \
  --output recorded-session.json

# Record with visual hooks enabled
npx ts-node miff/pure/VisualReplaySystemPure/cliHarness.ts record \
  --scenario "witcher-grove" \
  --enable-hooks \
  --capture-rate 60 \
  --output grove-session.json
```

### Replaying Sessions
```bash
# Deterministic replay
npx ts-node miff/pure/VisualReplaySystemPure/cliHarness.ts replay \
  --fixture recorded-session.json \
  --deterministic \
  --quiet

# Replay with performance monitoring
npx ts-node miff/pure/VisualReplaySystemPure/cliHarness.ts replay \
  --fixture grove-session.json \
  --monitor-performance \
  --output-metrics metrics.json
```

### Export Options
```bash
# Export as video frames
npx ts-node miff/pure/VisualReplaySystemPure/cliHarness.ts export \
  --session recorded-session.json \
  --format frames \
  --output frames/

# Export performance report
npx ts-node miff/pure/VisualReplaySystemPure/cliHarness.ts export \
  --session grove-session.json \
  --format performance-report \
  --output performance.html

# Export input sequence
npx ts-node miff/pure/VisualReplaySystemPure/cliHarness.ts export \
  --session recorded-session.json \
  --format input-sequence \
  --output inputs.json
```

## 🎯 Deterministic Globals

VisualReplaySystemPure ensures deterministic behavior through:
- Fixed frame timing and capture rates
- Consistent input event ordering
- Deterministic visual hook execution
- Reproducible performance metric collection
- Stable random seed handling for scenario replay

## 🔗 Orchestration Patterns

### Replay Lifecycle
1. **Initialization** - Set up capture/replay environment
2. **Recording** - Capture frames, inputs, and visual events
3. **Processing** - Apply compression and validation
4. **Storage** - Save session data with metadata
5. **Replay** - Reconstruct session deterministically
6. **Analysis** - Generate performance and visual reports
7. **Export** - Output in various formats for different uses

### Integration Points
- Scenario orchestration with ScenarioPure modules
- Visual rendering through RenderPayloadPure
- Input handling via InputSystemPure
- Audio synchronization with AudioPure
- Performance monitoring with ProfilerPure

## 📋 Quick Validation Checklist
- [ ] Replay captures all visual hooks correctly
- [ ] Input tracking is complete and accurate
- [ ] Performance metrics are within expected ranges
- [ ] Session files are valid and can be replayed
- [ ] Export formats work with target platforms
- [ ] Deterministic replay produces identical results