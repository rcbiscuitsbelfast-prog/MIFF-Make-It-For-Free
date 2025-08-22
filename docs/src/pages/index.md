---
layout: ../layouts/Layout.astro
title: "Welcome to MIFF Framework"
description: "Modular, CLI-first, engine-agnostic game development framework built for contributors"
---

# 🎮 Welcome to MIFF Framework

**MIFF** is a modular, CLI-first, engine-agnostic game development framework designed from the ground up for contributors. Whether you're building for Unity, Web, or Godot, MIFF provides the tools and architecture to create remix-safe, testable game systems.

## 🚀 Why MIFF?

### **CLI-First Design**
Every MIFF module exposes its functionality through command-line interfaces, making automation and testing seamless.

```bash
# Simulate a game scenario
npx ts-node cli/miff-simulate.ts tutorial-scenario.json

# Replay renderData across engines
npx ts-node RenderReplayPure/cliHarness.ts replay-golden UnityBridgePure/tests/goldenBridge.test.ts

# Inspect bridge compatibility
npx ts-node BridgeInspectorPure/cliHarness.ts inspect-golden WebBridgePure/tests/goldenBridge.test.ts
```

### **Engine Agnostic**
Write once, deploy everywhere. MIFF's pure logic modules work across Unity, Web, and Godot through dedicated bridge adapters.

```typescript
// Pure logic - works everywhere
const npcManager = new NPCsManager();
const npc = npcManager.createNPC({ name: "Guard", stats: [...] });

// Engine-specific rendering
const unityBridge = new UnityBridge();
const renderData = unityBridge.render("npcs", npc);
```

### **Remix Safe**
Every module is designed for easy modification and extension, with comprehensive golden tests and schema validation.

```typescript
// Extend NPC behavior safely
export class CustomNPCsManager extends NPCsManager {
  onNPCCreated(npc: NPC) {
    // Your custom logic here
    this.emit('customEvent', npc);
  }
}
```

## 🏗️ Architecture Overview

MIFF is built on three core principles:

### **1. Modularity**
- **Pure Logic Modules**: Core game mechanics (NPCs, Quests, Combat, etc.)
- **Bridge Modules**: Engine-specific adapters (Unity, Web, Godot)
- **Tool Modules**: CLI utilities and debugging tools

### **2. Schema Safety**
- **Versioned Schemas**: Strict schema versioning (v12, v13, v1)
- **Golden Tests**: Deterministic output validation
- **Type Safety**: Full TypeScript support with comprehensive types

### **3. Contributor Experience**
- **CLI Tools**: Easy-to-use command-line interfaces
- **Visual Debugging**: Replay and inspection tools
- **Documentation**: Comprehensive guides and examples

## 🛠️ Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/miff-framework/miff.git
cd miff

# Install dependencies
npm install

# Run golden tests
npm test

# Start development
npm run dev
```

### Your First Scenario

```bash
# Create a new scenario
npx ts-node cli/miff-init.ts my-scenario --template tutorial

# Simulate the scenario
npx ts-node cli/miff-simulate.ts my-scenario/scenario.json

# Compare outputs
npx ts-node cli/miff-diff.ts output1.json output2.json
```

## 📚 What's Inside

### **Phase 1-4: Core Gameplay**
- **StatsSystemPure**: Character statistics and progression
- **CombatCorePure**: Turn-based and real-time combat
- **QuestsPure**: Quest management and progression
- **NPCsPure**: Non-player character systems
- **CraftingPure**: Recipe-based crafting systems
- **LootTablesPure**: Randomized loot generation
- **EconomyPure**: In-game economy and trading

### **Phase 5: CLI Tools**
- **miff-simulate**: Scenario simulation and testing
- **miff-diff**: Output comparison and validation
- **miff-init**: Project scaffolding and templates

### **Phase 6: Engine Bridges**
- **UnityBridgePure**: Unity MonoBehaviour and ECS support
- **WebBridgePure**: Phaser.js and Canvas rendering
- **GodotBridgePure**: GDScript and C# integration
- **BridgeSchemaPure**: Unified renderData schema

### **Phase 7: Visual Tools**
- **RenderReplayPure**: Visual replay and debugging
- **DebugOverlayPure**: Real-time debug information
- **BridgeInspectorPure**: Bridge validation and analysis

## 🎯 For Contributors

### **Getting Started**
1. [Installation Guide](/getting-started/install) - Set up your development environment
2. [Simulate Tool](/getting-started/simulate) - Learn to run and test scenarios
3. [Replay Tool](/getting-started/replay) - Debug and visualize game states
4. [Inspect Tool](/getting-started/inspect) - Validate bridge compatibility

### **Architecture Deep Dive**
1. [Modularity](/architecture/modularity) - Understanding MIFF's modular design
2. [Engine Agnostic](/architecture/engine-agnostic) - How bridges work
3. [Remix Safety](/architecture/remix-safety) - Making safe modifications

### **Contributing**
1. [Onboarding Guide](/contributors/onboarding) - Fork, test, and submit changes
2. [Licensing](/contributors/licensing) - Understanding dual-license model
3. [Roadmap](/contributors/roadmap) - Current status and future plans

## 🔗 Community & Resources

- **GitHub**: [miff-framework](https://github.com/miff-framework)
- **CLI Reference**: [Complete CLI documentation](/api/cli)
- **Schema Reference**: [Type definitions and schemas](/api/schema)
- **Examples**: [Sample configurations and outputs](/assets/examples)

## 🎉 Ready to Get Started?

MIFF is designed to be approachable for contributors of all skill levels. Whether you're:

- **New to game development**: Start with the [tutorial scenarios](/getting-started/simulate)
- **Experienced developer**: Dive into [architecture](/architecture/modularity) and [CLI tools](/api/cli)
- **Engine specialist**: Explore [bridge modules](/architecture/engine-agnostic) and [validation tools](/getting-started/inspect)

**Join the community and start building with MIFF today!** 🚀

---

*MIFF Framework - Built for contributors, designed for remixing, powered by the community.*