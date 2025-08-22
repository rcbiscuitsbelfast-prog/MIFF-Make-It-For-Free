---
layout: ../../../layouts/Layout.astro
title: "Replay Tool Guide"
description: "Learn to use RenderReplayPure for visual replay and debugging"
---

# 🎬 Replay Tool Guide

The `RenderReplayPure` tool allows you to visually replay `renderData` payloads from golden tests, CLI output, or JSON files. It's perfect for debugging, analyzing game states, and understanding how your scenarios execute across different engines.

## 🚀 Quick Start

### **Basic Usage**

```bash
# Replay a golden test with Web engine
npx ts-node RenderReplayPure/cliHarness.ts replay-golden UnityBridgePure/tests/goldenBridge.test.ts --engine web

# Replay CLI output with Unity engine
npx ts-node RenderReplayPure/cliHarness.ts replay-cli output.json --engine unity --verbose

# Replay JSON payload directly
npx ts-node RenderReplayPure/cliHarness.ts replay-payload payload.json --engine godot
```

### **Output Format**

The replay tool produces annotated replay sessions:

```json
{
  "op": "replay",
  "status": "ok",
  "session": {
    "id": "replay_1234567890",
    "engine": "web",
    "steps": [
      {
        "step": 1,
        "timestamp": "2024-01-15T10:30:01.000Z",
        "renderData": [...],
        "annotations": ["NPC created", "Position set to (10, 20)"]
      }
    ],
    "summary": {
      "totalSteps": 5,
      "duration": "2.5s",
      "renderDataCount": 12
    }
  }
}
```

## 📋 Command Reference

### **Basic Commands**

```bash
# Replay from golden test
replay-golden <test-file> [options]

# Replay from CLI output
replay-cli <output-file> [options]

# Replay from JSON payload
replay-payload <payload-file> [options]

# Export replay session
export <session-id> <output-file> [options]

# Show help
--help
```

### **Options**

| Option | Description | Default |
|--------|-------------|---------|
| `--engine <engine>` | Target engine (unity, web, godot) | `web` |
| `--speed <number>` | Replay speed multiplier | `1.0` |
| `--loop` | Loop replay continuously | `false` |
| `--debug` | Show debug information | `false` |
| `--format <format>` | Export format (json, markdown, html) | `json` |
| `--timestamps` | Include timestamps in output | `false` |

## 🎯 Replay Examples

### **1. Golden Test Replay**

```bash
# Replay Unity bridge golden test
npx ts-node RenderReplayPure/cliHarness.ts replay-golden UnityBridgePure/tests/goldenBridge.test.ts --engine unity --verbose
```

**Expected Output:**
```json
{
  "op": "replay",
  "status": "ok",
  "session": {
    "id": "replay_1705312200000",
    "engine": "unity",
    "source": "UnityBridgePure/tests/goldenBridge.test.ts",
    "steps": [
      {
        "step": 1,
        "timestamp": "2024-01-15T10:30:01.000Z",
        "renderData": [
          {
            "type": "GameObject",
            "position": {"x": 0, "y": 0, "z": 0},
            "components": [
              {"type": "Transform", "position": {"x": 0, "y": 0, "z": 0}},
              {"type": "NPCController", "data": {"id": "npc_001", "name": "Guard"}}
            ]
          }
        ],
        "annotations": ["NPC GameObject created", "Transform component added", "NPCController component added"]
      }
    ],
    "summary": {
      "totalSteps": 3,
      "duration": "1.2s",
      "renderDataCount": 5,
      "annotations": ["NPC creation", "Component setup", "Position assignment"]
    }
  }
}
```

### **2. CLI Output Replay**

```bash
# Replay simulation output
npx ts-node RenderReplayPure/cliHarness.ts replay-cli simulation_output.json --engine web --speed 2.0
```

### **3. Direct Payload Replay**

```bash
# Replay specific renderData payload
npx ts-node RenderReplayPure/cliHarness.ts replay-payload render_data.json --engine godot --debug
```

## 🔧 Advanced Usage

### **Export Replay Sessions**

Export replay sessions in different formats:

```bash
# Export to JSON
npx ts-node RenderReplayPure/cliHarness.ts export replay_1234567890 replay.json --format json

# Export to Markdown
npx ts-node RenderReplayPure/cliHarness.ts export replay_1234567890 replay.md --format markdown

# Export to HTML
npx ts-node RenderReplayPure/cliHarness.ts export replay_1234567890 replay.html --format html
```

### **Replay Configuration**

Configure replay behavior:

```bash
# Fast replay with loop
npx ts-node RenderReplayPure/cliHarness.ts replay-golden test.ts --speed 3.0 --loop

# Slow replay with debug info
npx ts-node RenderReplayPure/cliHarness.ts replay-golden test.ts --speed 0.5 --debug --timestamps

# Engine-specific replay
npx ts-node RenderReplayPure/cliHarness.ts replay-golden test.ts --engine unity --verbose
```

### **Batch Replay**

Replay multiple sources:

```bash
# Replay multiple golden tests
for test in */tests/golden*.test.ts; do
  npx ts-node RenderReplayPure/cliHarness.ts replay-golden "$test" --engine web --format json
done
```

## 🧪 Testing and Validation

### **Golden Test Integration**

The replay tool integrates with MIFF's golden test system:

```bash
# Run golden tests for RenderReplayPure
npm test -- --testNamePattern="RenderReplayPure"

# Test specific replay scenarios
npm test -- --testNamePattern="replay-golden"
```

### **Output Validation**

Validate replay outputs:

```bash
# Compare replay outputs
npx ts-node cli/miff-diff.ts replay1.json replay2.json

# Validate replay session structure
npx ts-node BridgeInspectorPure/cliHarness.ts inspect replay_session.json
```

### **Performance Testing**

Test replay performance:

```bash
# Benchmark replay speed
time npx ts-node RenderReplayPure/cliHarness.ts replay-golden large_test.ts --engine web

# Test memory usage
npx ts-node RenderReplayPure/cliHarness.ts replay-golden large_test.ts --engine web --debug
```

## 🔍 Debugging with Replay

### **Step-by-Step Analysis**

Use replay for detailed debugging:

```bash
# Replay with step-by-step analysis
npx ts-node RenderReplayPure/cliHarness.ts replay-golden test.ts --engine web --debug --timestamps
```

**Debug output includes:**
- Step-by-step execution details
- RenderData changes between steps
- Timing information
- Memory usage
- Performance metrics

### **Error Analysis**

Analyze replay errors:

```bash
# Replay with error details
npx ts-node RenderReplayPure/cliHarness.ts replay-golden test.ts --engine web --debug
```

**Error output includes:**
- Error location in replay sequence
- Context information
- Suggested fixes
- Recovery options

### **Performance Profiling**

Profile replay performance:

```bash
# Profile replay execution
npx ts-node RenderReplayPure/cliHarness.ts replay-golden test.ts --engine web --debug
```

**Profile output includes:**
- Execution time per step
- Memory usage per step
- RenderData processing time
- Engine-specific metrics

## 🎯 Best Practices

### **1. Use Appropriate Engine**

Choose the right engine for your replay:

```bash
# For Unity development
npx ts-node RenderReplayPure/cliHarness.ts replay-golden test.ts --engine unity

# For Web development
npx ts-node RenderReplayPure/cliHarness.ts replay-golden test.ts --engine web

# For Godot development
npx ts-node RenderReplayPure/cliHarness.ts replay-golden test.ts --engine godot
```

### **2. Export Important Sessions**

Save important replay sessions:

```bash
# Export baseline replay
npx ts-node RenderReplayPure/cliHarness.ts replay-golden baseline_test.ts --engine web --format html --output baseline_replay.html

# Export modified replay
npx ts-node RenderReplayPure/cliHarness.ts replay-golden modified_test.ts --engine web --format html --output modified_replay.html
```

### **3. Use Debug Mode for Development**

Enable debug mode during development:

```bash
# Development replay with full debug info
npx ts-node RenderReplayPure/cliHarness.ts replay-golden test.ts --engine web --debug --timestamps --verbose
```

### **4. Validate Replay Outputs**

Always validate replay outputs:

```bash
# Validate replay session
npx ts-node BridgeInspectorPure/cliHarness.ts inspect replay_session.json

# Compare with expected output
npx ts-node cli/miff-diff.ts replay_output.json expected_replay.json
```

## 🔗 Integration with Other Tools

### **Visual Debugging**

Use replay with debug overlay:

```bash
# Generate replay session
npx ts-node RenderReplayPure/cliHarness.ts replay-golden test.ts --engine web --output replay.json

# Add debug overlay
npx ts-node DebugOverlayPure/cliHarness.ts overlay replay.json --color --verbose
```

### **Bridge Inspection**

Inspect replay sessions for bridge compatibility:

```bash
# Generate replay session
npx ts-node RenderReplayPure/cliHarness.ts replay-golden test.ts --engine web --output replay.json

# Inspect for bridge issues
npx ts-node BridgeInspectorPure/cliHarness.ts inspect replay.json --format html
```

### **Scenario Simulation**

Use replay with scenario simulation:

```bash
# Simulate scenario
npx ts-node cli/miff-simulate.ts scenario.json --output simulation.json

# Replay simulation
npx ts-node RenderReplayPure/cliHarness.ts replay-cli simulation.json --engine web --format html
```

## 🎉 Next Steps

Now that you understand the replay tool:

1. **Try the [Inspect Tool](/getting-started/inspect)** - Validate bridge compatibility
2. **Explore [Architecture](/architecture/modularity)** - Understand how replay works
3. **Check [Contributor Guide](/contributors/onboarding)** - Start creating your own replay scenarios
4. **Read [CLI Reference](/api/cli)** - Complete command documentation

---

*Ready to debug your scenarios? Check out the [Inspect Tool Guide](/getting-started/inspect) to validate bridge compatibility!* 🚀