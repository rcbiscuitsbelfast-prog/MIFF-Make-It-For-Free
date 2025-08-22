---
layout: ../../../layouts/Layout.astro
title: "Inspect Tool Guide"
description: "Learn to use BridgeInspectorPure for bridge validation and compatibility analysis"
---

# 🔍 Inspect Tool Guide

The `BridgeInspectorPure` tool provides comprehensive validation and analysis of bridge `renderData` payloads. It helps you identify compatibility issues, validate schema integrity, and ensure your game data works correctly across all engine bridges.

## 🚀 Quick Start

### **Basic Usage**

```bash
# Inspect a single payload
npx ts-node BridgeInspectorPure/cliHarness.ts inspect payload.json

# Inspect multiple golden tests
npx ts-node BridgeInspectorPure/cliHarness.ts inspect-golden UnityBridgePure/tests/goldenBridge.test.ts WebBridgePure/tests/goldenBridge.test.ts

# Inspect with detailed output
npx ts-node BridgeInspectorPure/cliHarness.ts inspect payload.json --verbose --format html
```

### **Output Format**

The inspect tool produces detailed analysis reports:

```json
{
  "op": "inspect",
  "status": "ok",
  "inspections": [
    {
      "source": "payload.json",
      "bridge": "UnityBridgePure",
      "engine": "unity",
      "schemaValidation": {
        "valid": true,
        "issues": []
      },
      "engineHints": {
        "unity": {"version": "2022.3", "components": ["Transform", "NPCController"]},
        "web": {"version": "phaser3", "sprites": ["npc_sprite"]},
        "godot": {"version": "4.0", "nodes": ["Node2D", "Sprite2D"]}
      },
      "signals": [
        {"name": "npcCreated", "type": "event", "data": {"npcId": "guard_001"}}
      ],
      "metadata": {
        "timestamp": "2024-01-15T10:30:00.000Z",
        "version": "v1",
        "author": "MIFF Framework"
      },
      "compatibility": {
        "unity": "compatible",
        "web": "compatible", 
        "godot": "compatible"
      },
      "warnings": [],
      "issues": []
    }
  ],
  "summary": {
    "totalInspections": 1,
    "passCount": 1,
    "warningCount": 0,
    "errorCount": 0,
    "overallStatus": "pass"
  }
}
```

## 📋 Command Reference

### **Basic Commands**

```bash
# Inspect single payload
inspect <payload-file> [options]

# Inspect multiple golden tests
inspect-golden <test-files...> [options]

# Export inspection results
export <output-file> [options]

# Show help
--help
```

### **Options**

| Option | Description | Default |
|--------|-------------|---------|
| `--verbose` | Enable verbose output | `false` |
| `--format <format>` | Output format (json, markdown, html) | `json` |
| `--include-warnings` | Include warning-level issues | `true` |
| `--max-issues <number>` | Maximum issues to report | `50` |
| `--validate-schema` | Enable schema validation | `true` |
| `--validate-hints` | Enable engine hints validation | `true` |
| `--validate-signals` | Enable signals validation | `true` |
| `--validate-metadata` | Enable metadata validation | `true` |

## 🎯 Inspection Examples

### **1. Single Payload Inspection**

```bash
# Inspect Unity bridge payload
npx ts-node BridgeInspectorPure/cliHarness.ts inspect UnityBridgePure/sample_bridge.json --verbose
```

**Expected Output:**
```json
{
  "op": "inspect",
  "status": "ok",
  "inspections": [
    {
      "source": "UnityBridgePure/sample_bridge.json",
      "bridge": "UnityBridgePure",
      "engine": "unity",
      "schemaValidation": {
        "valid": true,
        "issues": []
      },
      "engineHints": {
        "unity": {
          "version": "2022.3",
          "components": ["Transform", "NPCController", "Rigidbody"],
          "prefabs": ["NPC_Prefab"],
          "scripts": ["NPCController.cs"]
        }
      },
      "signals": [
        {
          "name": "npcCreated",
          "type": "event",
          "data": {"npcId": "guard_001", "position": {"x": 10, "y": 20}}
        }
      ],
      "metadata": {
        "timestamp": "2024-01-15T10:30:00.000Z",
        "version": "v1",
        "module": "NPCsPure"
      },
      "compatibility": {
        "unity": "compatible",
        "web": "compatible",
        "godot": "compatible"
      },
      "warnings": [],
      "issues": []
    }
  ],
  "summary": {
    "totalInspections": 1,
    "passCount": 1,
    "warningCount": 0,
    "errorCount": 0,
    "overallStatus": "pass"
  }
}
```

### **2. Golden Test Inspection**

```bash
# Inspect multiple bridge golden tests
npx ts-node BridgeInspectorPure/cliHarness.ts inspect-golden UnityBridgePure/tests/goldenBridge.test.ts WebBridgePure/tests/goldenBridge.test.ts GodotBridgePure/tests/goldenBridge.test.ts --format html
```

### **3. Detailed Analysis**

```bash
# Inspect with all validations enabled
npx ts-node BridgeInspectorPure/cliHarness.ts inspect payload.json --verbose --validate-schema --validate-hints --validate-signals --validate-metadata --format markdown
```

## 🔧 Advanced Usage

### **Export Inspection Results**

Export detailed inspection reports:

```bash
# Export to JSON
npx ts-node BridgeInspectorPure/cliHarness.ts inspect payload.json --format json --output inspection.json

# Export to Markdown
npx ts-node BridgeInspectorPure/cliHarness.ts inspect payload.json --format markdown --output inspection.md

# Export to HTML
npx ts-node BridgeInspectorPure/cliHarness.ts inspect payload.json --format html --output inspection.html
```

### **Batch Inspection**

Inspect multiple files:

```bash
# Inspect all bridge sample files
for bridge in */sample_bridge.json; do
  npx ts-node BridgeInspectorPure/cliHarness.ts inspect "$bridge" --format json
done

# Inspect all golden tests
find . -name "goldenBridge.test.ts" -exec npx ts-node BridgeInspectorPure/cliHarness.ts inspect-golden {} \;
```

### **Filtered Inspection**

Focus on specific validation areas:

```bash
# Only schema validation
npx ts-node BridgeInspectorPure/cliHarness.ts inspect payload.json --validate-schema --no-validate-hints --no-validate-signals --no-validate-metadata

# Only engine hints validation
npx ts-node BridgeInspectorPure/cliHarness.ts inspect payload.json --no-validate-schema --validate-hints --no-validate-signals --no-validate-metadata

# Only signals validation
npx ts-node BridgeInspectorPure/cliHarness.ts inspect payload.json --no-validate-schema --no-validate-hints --validate-signals --no-validate-metadata
```

## 🧪 Testing and Validation

### **Golden Test Integration**

The inspect tool integrates with MIFF's golden test system:

```bash
# Run golden tests for BridgeInspectorPure
npm test -- --testNamePattern="BridgeInspectorPure"

# Test specific inspection scenarios
npm test -- --testNamePattern="inspect"
```

### **Output Validation**

Validate inspection outputs:

```bash
# Compare inspection outputs
npx ts-node cli/miff-diff.ts inspection1.json inspection2.json

# Validate inspection report structure
npx ts-node BridgeInspectorPure/cliHarness.ts inspect inspection_report.json
```

### **Performance Testing**

Test inspection performance:

```bash
# Benchmark inspection speed
time npx ts-node BridgeInspectorPure/cliHarness.ts inspect large_payload.json

# Test memory usage
npx ts-node BridgeInspectorPure/cliHarness.ts inspect large_payload.json --verbose
```

## 🔍 Validation Types

### **Schema Validation**

Validates `renderData` structure against BridgeSchemaPure:

```bash
# Schema validation only
npx ts-node BridgeInspectorPure/cliHarness.ts inspect payload.json --validate-schema --verbose
```

**Checks for:**
- Required fields presence
- Field type correctness
- Nested structure validity
- Array element consistency

### **Engine Hints Validation**

Validates engine-specific hints:

```bash
# Engine hints validation only
npx ts-node BridgeInspectorPure/cliHarness.ts inspect payload.json --validate-hints --verbose
```

**Checks for:**
- Unity component compatibility
- Web sprite availability
- Godot node structure
- Version compatibility

### **Signals Validation**

Validates signal structure and data:

```bash
# Signals validation only
npx ts-node BridgeInspectorPure/cliHarness.ts inspect payload.json --validate-signals --verbose
```

**Checks for:**
- Signal name consistency
- Signal data structure
- Event type validity
- Cross-engine compatibility

### **Metadata Validation**

Validates metadata completeness:

```bash
# Metadata validation only
npx ts-node BridgeInspectorPure/cliHarness.ts inspect payload.json --validate-metadata --verbose
```

**Checks for:**
- Timestamp presence
- Version information
- Author attribution
- Module identification

## 🎯 Best Practices

### **1. Regular Inspection**

Inspect payloads regularly during development:

```bash
# Inspect after each change
npx ts-node BridgeInspectorPure/cliHarness.ts inspect payload.json --verbose

# Inspect before committing
npx ts-node BridgeInspectorPure/cliHarness.ts inspect-golden */tests/goldenBridge.test.ts
```

### **2. Export Important Reports**

Save important inspection reports:

```bash
# Export baseline inspection
npx ts-node BridgeInspectorPure/cliHarness.ts inspect baseline_payload.json --format html --output baseline_inspection.html

# Export modified inspection
npx ts-node BridgeInspectorPure/cliHarness.ts inspect modified_payload.json --format html --output modified_inspection.html
```

### **3. Use Verbose Mode for Debugging**

Enable verbose output for detailed analysis:

```bash
# Detailed inspection for debugging
npx ts-node BridgeInspectorPure/cliHarness.ts inspect payload.json --verbose --format markdown
```

### **4. Validate Cross-Engine Compatibility**

Always check cross-engine compatibility:

```bash
# Check all engine compatibility
npx ts-node BridgeInspectorPure/cliHarness.ts inspect payload.json --validate-hints --verbose
```

## 🔗 Integration with Other Tools

### **Visual Replay**

Use inspection with replay tool:

```bash
# Inspect payload first
npx ts-node BridgeInspectorPure/cliHarness.ts inspect payload.json --format json --output inspection.json

# Replay with inspection results
npx ts-node RenderReplayPure/cliHarness.ts replay-payload payload.json --engine web --debug
```

### **Debug Overlay**

Use inspection with debug overlay:

```bash
# Inspect payload
npx ts-node BridgeInspectorPure/cliHarness.ts inspect payload.json --format json --output inspection.json

# Add debug overlay
npx ts-node DebugOverlayPure/cliHarness.ts overlay payload.json --color --verbose
```

### **Scenario Simulation**

Use inspection with scenario simulation:

```bash
# Simulate scenario
npx ts-node cli/miff-simulate.ts scenario.json --output simulation.json

# Inspect simulation output
npx ts-node BridgeInspectorPure/cliHarness.ts inspect simulation.json --verbose --format html
```

## 🚨 Common Issues and Solutions

### **Schema Validation Errors**

**Issue**: Invalid `renderData` structure
```json
{
  "error": "Invalid renderData structure",
  "details": "Missing required field 'type'"
}
```

**Solution**: Ensure payload follows BridgeSchemaPure structure:
```json
{
  "renderData": [
    {
      "type": "sprite",
      "position": {"x": 0, "y": 0},
      "asset": "npc_sprite.png",
      "props": {"scale": 1.0}
    }
  ]
}
```

### **Engine Hints Warnings**

**Issue**: Incompatible engine hints
```json
{
  "warning": "Unity component 'CustomComponent' not found",
  "suggestion": "Use standard Unity components or add custom component definition"
}
```

**Solution**: Use standard components or define custom ones:
```json
{
  "engineHints": {
    "unity": {
      "components": ["Transform", "SpriteRenderer", "NPCController"]
    }
  }
}
```

### **Signal Validation Errors**

**Issue**: Invalid signal structure
```json
{
  "error": "Invalid signal data structure",
  "details": "Signal 'npcCreated' missing required field 'npcId'"
}
```

**Solution**: Ensure signals have required data:
```json
{
  "signals": [
    {
      "name": "npcCreated",
      "type": "event",
      "data": {"npcId": "guard_001", "position": {"x": 10, "y": 20}}
    }
  ]
}
```

## 🎉 Next Steps

Now that you understand the inspect tool:

1. **Try the [Architecture Guide](/architecture/modularity)** - Understand how inspection works
2. **Check [Contributor Guide](/contributors/onboarding)** - Start creating your own inspection scenarios
3. **Read [CLI Reference](/api/cli)** - Complete command documentation
4. **Explore [Roadmap](/contributors/roadmap)** - See what's coming next

---

*Ready to validate your bridges? Check out the [Architecture Guide](/architecture/modularity) to understand how inspection works!* 🚀