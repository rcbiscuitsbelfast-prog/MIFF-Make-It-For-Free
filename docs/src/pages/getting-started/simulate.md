---
layout: ../../layouts/Layout.astro
title: "Simulate Tool Guide"
description: "Learn to use miff-simulate for scenario testing and validation"
---

# 🎮 Simulate Tool Guide

The `miff-simulate` tool is your gateway to running and testing MIFF scenarios. It's the primary CLI tool for executing game scenarios, validating outputs, and testing your modifications.

## 🚀 Quick Start

### **Basic Usage**

```bash
# Run a scenario file
npx ts-node cli/miff-simulate.ts scenario.json

# Run with verbose output
npx ts-node cli/miff-simulate.ts scenario.json --verbose

# Run with specific seed for deterministic results
npx ts-node cli/miff-simulate.ts scenario.json --seed 42
```

### **Output Format**

The simulate tool produces standardized JSON output:

```json
{
  "op": "simulate",
  "status": "ok",
  "events": [
    {
      "type": "npc_created",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "data": { "npcId": "guard_001", "name": "Guard Captain" }
    }
  ],
  "finalState": {
    "npcs": [...],
    "quests": [...],
    "inventory": [...]
  }
}
```

## 📋 Command Reference

### **Basic Commands**

```bash
# Simulate a scenario
miff-simulate <scenario-file> [options]

# Show help
miff-simulate --help

# Show version
miff-simulate --version
```

### **Options**

| Option | Description | Default |
|--------|-------------|---------|
| `--verbose` | Enable verbose output | `false` |
| `--seed <number>` | Set random seed for deterministic results | `random` |
| `--output <file>` | Save output to file | `stdout` |
| `--format <format>` | Output format (json, pretty) | `json` |
| `--timeout <ms>` | Simulation timeout in milliseconds | `30000` |
| `--dump-state` | Dump intermediate states | `false` |

## 🎯 Scenario Examples

### **1. Tutorial Scenario**

```bash
# Run the built-in tutorial scenario
npx ts-node cli/miff-simulate.ts TutorialScenarioPure/scenario.json --verbose
```

**Expected Output:**
```json
{
  "op": "simulate",
  "status": "ok",
  "events": [
    {
      "type": "scenario_started",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "data": { "scenarioId": "tutorial_intro" }
    },
    {
      "type": "npc_created",
      "timestamp": "2024-01-15T10:30:01.000Z",
      "data": { "npcId": "mentor_001", "name": "Tutorial Mentor" }
    },
    {
      "type": "quest_created",
      "timestamp": "2024-01-15T10:30:02.000Z",
      "data": { "questId": "tutorial_quest_001", "title": "Welcome to MIFF" }
    }
  ],
  "finalState": {
    "npcs": [
      {
        "id": "mentor_001",
        "name": "Tutorial Mentor",
        "stats": [{"key": "health", "base": 100}],
        "quests": ["tutorial_quest_001"]
      }
    ],
    "quests": [
      {
        "id": "tutorial_quest_001",
        "title": "Welcome to MIFF",
        "status": "active",
        "objectives": ["talk_to_mentor"]
      }
    ]
  }
}
```

### **2. Combat Scenario**

```bash
# Run a combat scenario
npx ts-node cli/miff-simulate.ts CombatScenarioPure/scenario.json --seed 123 --verbose
```

**Expected Output:**
```json
{
  "op": "simulate",
  "status": "ok",
  "events": [
    {
      "type": "combat_started",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "data": { "combatId": "arena_battle_001" }
    },
    {
      "type": "turn_started",
      "timestamp": "2024-01-15T10:30:01.000Z",
      "data": { "turn": 1, "actor": "player_001" }
    },
    {
      "type": "attack_made",
      "timestamp": "2024-01-15T10:30:02.000Z",
      "data": { "attacker": "player_001", "target": "enemy_001", "damage": 25 }
    },
    {
      "type": "combat_ended",
      "timestamp": "2024-01-15T10:30:10.000Z",
      "data": { "winner": "player_001", "loot": ["sword_001", "gold_100"] }
    }
  ],
  "finalState": {
    "combat": { "status": "completed", "winner": "player_001" },
    "inventory": ["sword_001", "gold_100"],
    "stats": { "player_001": { "health": 75, "experience": 150 } }
  }
}
```

### **3. Quest Scenario**

```bash
# Run a quest scenario with state dumping
npx ts-node cli/miff-simulate.ts QuestScenarioPure/scenario.json --dump-state --output quest_result.json
```

## 🔧 Advanced Usage

### **Deterministic Testing**

Use the `--seed` option for reproducible results:

```bash
# Run with fixed seed
npx ts-node cli/miff-simulate.ts scenario.json --seed 42

# Run multiple times to verify consistency
npx ts-node cli/miff-simulate.ts scenario.json --seed 42 > output1.json
npx ts-node cli/miff-simulate.ts scenario.json --seed 42 > output2.json
diff output1.json output2.json  # Should be identical
```

### **State Dumping**

Use `--dump-state` to see intermediate states:

```bash
npx ts-node cli/miff-simulate.ts scenario.json --dump-state --verbose
```

**Output includes intermediate states:**
```json
{
  "op": "simulate",
  "status": "ok",
  "events": [...],
  "states": [
    {
      "step": 1,
      "timestamp": "2024-01-15T10:30:01.000Z",
      "npcs": [...],
      "quests": [...]
    },
    {
      "step": 2,
      "timestamp": "2024-01-15T10:30:02.000Z",
      "npcs": [...],
      "quests": [...]
    }
  ],
  "finalState": {...}
}
```

### **Output to File**

Save simulation results to a file:

```bash
# Save to JSON file
npx ts-node cli/miff-simulate.ts scenario.json --output results.json

# Save with pretty formatting
npx ts-node cli/miff-simulate.ts scenario.json --format pretty --output results.json
```

### **Timeout Configuration**

Set simulation timeout for long-running scenarios:

```bash
# Set 60-second timeout
npx ts-node cli/miff-simulate.ts large_scenario.json --timeout 60000
```

## 🧪 Testing and Validation

### **Golden Test Integration**

The simulate tool integrates with MIFF's golden test system:

```bash
# Run golden tests for a specific module
npm test -- --testNamePattern="TutorialScenarioPure"

# Run all golden tests
npm test
```

### **Output Validation**

Validate simulation outputs using the diff tool:

```bash
# Compare two simulation outputs
npx ts-node cli/miff-diff.ts output1.json output2.json

# Compare with golden test output
npx ts-node cli/miff-diff.ts my_output.json TutorialScenarioPure/expected_output.json
```

### **Regression Testing**

Create regression tests for your modifications:

```bash
# Create baseline output
npx ts-node cli/miff-simulate.ts scenario.json --seed 42 > baseline.json

# After making changes, compare
npx ts-node cli/miff-simulate.ts scenario.json --seed 42 > modified.json
npx ts-node cli/miff-diff.ts baseline.json modified.json
```

## 🔍 Debugging

### **Verbose Output**

Enable verbose output for detailed debugging:

```bash
npx ts-node cli/miff-simulate.ts scenario.json --verbose
```

**Verbose output includes:**
- Step-by-step execution details
- Module initialization logs
- Event processing information
- Performance metrics

### **Error Handling**

The simulate tool provides detailed error information:

```bash
# Example error output
{
  "op": "simulate",
  "status": "error",
  "error": "NPC with ID 'guard_001' not found",
  "context": {
    "scenario": "tutorial_scenario",
    "step": 5,
    "module": "NPCsPure"
  }
}
```

### **Performance Monitoring**

Monitor simulation performance:

```bash
# Run with performance metrics
npx ts-node cli/miff-simulate.ts scenario.json --verbose
```

**Performance output includes:**
- Execution time per step
- Memory usage
- Module load times
- Event processing times

## 🎯 Best Practices

### **1. Use Deterministic Seeds**

Always use `--seed` for testing to ensure reproducible results:

```bash
# Good: Deterministic testing
npx ts-node cli/miff-simulate.ts scenario.json --seed 42

# Avoid: Random results
npx ts-node cli/miff-simulate.ts scenario.json
```

### **2. Save Important Outputs**

Save simulation results for later analysis:

```bash
# Save baseline outputs
npx ts-node cli/miff-simulate.ts scenario.json --seed 42 --output baseline.json

# Save modified outputs
npx ts-node cli/miff-simulate.ts scenario.json --seed 42 --output modified.json
```

### **3. Use Golden Tests**

Create golden tests for your scenarios:

```bash
# Create golden test
npx ts-node cli/miff-simulate.ts scenario.json --seed 42 > expected_output.json

# Run golden test
npm test -- --testNamePattern="MyScenario"
```

### **4. Monitor Performance**

Use verbose output to monitor performance:

```bash
# Monitor performance
npx ts-node cli/miff-simulate.ts scenario.json --verbose --timeout 60000
```

## 🔗 Integration with Other Tools

### **Visual Replay**

Use simulation outputs with the replay tool:

```bash
# Generate simulation output
npx ts-node cli/miff-simulate.ts scenario.json --output simulation.json

# Replay the simulation
npx ts-node RenderReplayPure/cliHarness.ts replay-payload simulation.json --engine web
```

### **Bridge Inspection**

Inspect simulation outputs for bridge compatibility:

```bash
# Generate simulation output
npx ts-node cli/miff-simulate.ts scenario.json --output simulation.json

# Inspect for bridge compatibility
npx ts-node BridgeInspectorPure/cliHarness.ts inspect simulation.json
```

### **Debug Overlay**

Add debug overlay to simulation outputs:

```bash
# Generate simulation output
npx ts-node cli/miff-simulate.ts scenario.json --output simulation.json

# Create debug overlay
npx ts-node DebugOverlayPure/cliHarness.ts overlay simulation.json --color
```

## 🎉 Next Steps

Now that you understand the simulate tool:

1. **Try the [Replay Tool](/getting-started/replay)** - Visualize your simulations
2. **Explore [Architecture](/architecture/modularity)** - Understand how scenarios work
3. **Check [Contributor Guide](/contributors/onboarding)** - Start creating your own scenarios
4. **Read [CLI Reference](/api/cli)** - Complete command documentation

---

*Ready to create your own scenarios? Check out the [Replay Tool Guide](/getting-started/replay) to visualize your simulations!* 🚀