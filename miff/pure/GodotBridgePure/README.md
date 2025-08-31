# GodotBridgePure

**Schema Version**: v1  
**Module Type**: Engine Bridge  
**Dependencies**: NPCsPure, QuestsPure, CombatCorePure, StatsSystemPure, CraftingPure, LootTablesPure, EconomyPure

## Overview

GodotBridgePure provides a bridge between MIFF's pure logic modules and the Godot game engine. It wraps existing pure modules (NPCsPure, QuestsPure, CombatCorePure, etc.) and exposes Godot-specific adapters without modifying core modules. The bridge supports both GDScript and C# programming languages, with compatibility for Godot 3.x and 4.x versions.

## Features

- **Pure Logic Integration**: Delegates all logic to existing MIFF modules
- **Godot Node Conversion**: Converts MIFF data to Godot Node2D, Sprite, and Control nodes
- **Dual Language Support**: GDScript and C# script generation
- **Signal System**: Configurable signal connections for event-driven architecture
- **Animation Support**: AnimationPlayer integration with configurable libraries
- **Resource Management**: .tres/.res resource file generation
- **CLI-First Design**: All operations via command line interface
- **Remix-Safe**: Clear hooks for customization and extension

## Schema v1

### Core Types

```typescript
interface GodotNode {
  id: string;
  type: 'Node2D' | 'Sprite' | 'Label' | 'Control' | 'AnimationPlayer' | 'Area2D';
  name: string;
  position: { x: number; y: number };
  scale?: { x: number; y: number };
  rotation?: number;
  properties: Map<string, any>;
  children?: GodotNode[];
  signals?: GodotSignal[];
}

interface GodotSignal {
  name: string;
  parameters: string[];
  connectedTo: string[];
}

interface GodotResource {
  type: string;
  path: string;
  data: any;
}

interface GodotRenderData {
  nodes: GodotNode[];
  resources: GodotResource[];
  scripts: string[];
  scenes: string[];
  animations: string[];
  inputs: string[];
}

interface GodotBridgeConfig {
  language: 'gdscript' | 'csharp';
  targetVersion: string; // Godot version (e.g., "4.0", "3.5")
  projectPath: string; // Path to Godot project
  scriptPath: string; // Path to script files
  scenePath: string; // Path to scene files
  resourcePath: string; // Path to resource files
  useSignals: boolean; // Enable signal system
  useAnimations: boolean; // Enable animation system
}
```

### Supported Modules
- **npcs**: NPC management and behavior simulation
- **combat**: Combat system integration
- **crafting**: Crafting system with Godot UI
- **loot**: Loot table integration
- **economy**: Economy system with Godot UI
- **quests**: Quest system integration
- **stats**: Stats system integration
- **ui**: User interface components

## CLI Usage

### Commands

```bash
# Simulate module with Godot bridge
npx ts-node GodotBridgePure/cliHarness.ts simulate npcs sample_npc_sim.json

# Render module for Godot
npx ts-node GodotBridgePure/cliHarness.ts render npcs sample_npc_render.json godot_config.json

# Interop with Godot data
npx ts-node GodotBridgePure/cliHarness.ts interop npcs godot_npc_data.json

# Dump module bridge info
npx ts-node GodotBridgePure/cliHarness.ts dump npcs
```

### Output Format

All operations return standardized JSON output:

```json
{
  "op": "simulate|render|interop|dump",
  "status": "ok|error",
  "renderData": {
    "nodes": [...],
    "resources": [...],
    "scripts": [...],
    "scenes": [...],
    "animations": [...],
    "inputs": [...]
  },
  "issues": ["error messages if any"]
}
```

## Remix Hooks

### 1. Custom Godot Node Creation
Override node creation for specific modules:

```typescript
// In your remix module
export function createCustomGodotNode(npc: NPC, config: GodotBridgeConfig): GodotNode {
  return {
    id: npc.id,
    type: 'Node2D',
    name: npc.name,
    position: { x: npc.location.x * 64, y: npc.location.y * 64 },
    properties: new Map([
      ['npc_id', npc.id],
      ['custom_behavior', 'custom_logic'],
      ['custom_stats', npc.stats]
    ]),
    children: [
      {
        id: `${npc.id}_custom_sprite`,
        type: 'Sprite',
        name: 'CustomSprite',
        position: { x: 0, y: 0 },
        properties: new Map([
          ['texture', 'res://assets/custom/npc_sprite.png']
        ])
      }
    ]
  };
}
```

### 2. Godot Script Generation Customization
Customize script generation for different Godot versions:

```typescript
// Override script generation
export function getCustomGodotScripts(module: string, config: GodotBridgeConfig): string[] {
  const baseScripts = ['NPCController', 'CombatController'];
  const extension = config.language === 'csharp' ? '.cs' : '.gd';
  
  if (config.targetVersion === '4.0') {
    return [...baseScripts, 'Godot4Extensions'].map(script => `res://miff/scripts/${script}${extension}`);
  }
  
  return baseScripts.map(script => `res://miff/scripts/${script}${extension}`);
}
```

### 3. Signal System Customization
Hook into signal system configuration:

```typescript
// In override.ts
export function getGodotSignals(config: GodotBridgeConfig): GodotSignal[] {
  if (config.useSignals) {
    return [
      {
        name: 'custom_signal',
        parameters: ['param1', 'param2'],
        connectedTo: ['CustomSystem', 'EventManager']
      }
    ];
  }
  return [];
}

export function createCustomSignals(npc: NPC): GodotSignal[] {
  return [
    {
      name: 'npc_custom_interaction',
      parameters: ['player_id', 'interaction_data'],
      connectedTo: ['CustomQuestSystem', 'CustomDialogSystem']
    }
  ];
}
```

### 4. Animation System Customization
Customize animation generation for different Godot versions:

```typescript
// Override animation generation
export function getGodotAnimations(module: string, config: GodotBridgeConfig): string[] {
  const baseAnimations = ['idle', 'walk', 'attack'];
  
  if (config.useAnimations && config.targetVersion === '4.0') {
    return [...baseAnimations, 'custom_animation'];
  }
  
  return baseAnimations;
}

export function createAnimationLibrary(config: GodotBridgeConfig): GodotResource {
  return {
    type: 'AnimationLibrary',
    path: 'res://animations/custom_animations.tres',
    data: {
      animations: ['custom_idle', 'custom_walk', 'custom_attack']
    }
  };
}
```

## Dependencies

### Required
- **NPCsPure**: NPC management and behavior simulation
- **QuestsPure**: Quest system integration
- **CombatCorePure**: Combat system logic
- **StatsSystemPure**: Stats management
- **CraftingPure**: Crafting system
- **LootTablesPure**: Loot generation
- **EconomyPure**: Economy system

### Optional Integration
- **MovementPure**: Movement system integration
- **PathfindingPure**: Pathfinding for Godot Navigation2D
- **StatusEffectsPure**: Status effects for Godot particles

## Godot Integration Examples

### GDScript Integration
```gdscript
# Generated GDScript
extends Node2D

var npc_id: String
var behavior_type: String
var faction: String

func _ready():
    # Initialize from MIFF data
    var npc_data = MIFFBridge.get_npc_data(npc_id)
    position = Vector2(npc_data.location.x * 64, npc_data.location.y * 64)
    setup_behavior(behavior_type)

func _process(delta):
    # Update behavior based on MIFF simulation
    var simulation = MIFFBridge.simulate_npc(npc_id, delta)
    update_behavior(simulation)

func interact_with_player(player_id: String):
    emit_signal("npc_interacted", player_id, "interaction")
```

### C# Integration
```csharp
// Generated C# script
using Godot;

public partial class NPCController : Node2D
{
    [Export] public string NpcId { get; set; }
    [Export] public string BehaviorType { get; set; }
    [Export] public string Faction { get; set; }

    public override void _Ready()
    {
        // Initialize from MIFF data
        var npcData = MIFFBridge.GetNpcData(NpcId);
        Position = new Vector2(npcData.Location.X * 64, npcData.Location.Y * 64);
        SetupBehavior(BehaviorType);
    }

    public override void _Process(double delta)
    {
        // Update behavior based on MIFF simulation
        var simulation = MIFFBridge.SimulateNpc(NpcId, delta);
        UpdateBehavior(simulation);
    }

    public void InteractWithPlayer(string playerId)
    {
        EmitSignal("NpcInteracted", playerId, "interaction");
    }
}
```

### Signal Connections
```gdscript
# Signal connection example
extends Node2D

func _ready():
    # Connect NPC signals to systems
    var npc = $NPC
    npc.npc_interacted.connect(_on_npc_interacted)

func _on_npc_interacted(player_id: String, interaction_type: String):
    match interaction_type:
        "quest":
            QuestSystem.handle_quest_interaction(player_id, npc.npc_id)
        "trade":
            TradeSystem.open_trade_menu(player_id, npc.npc_id)
```

## Configuration

### GDScript Config Example
```json
{
  "language": "gdscript",
  "targetVersion": "4.0",
  "projectPath": "godot_project/",
  "scriptPath": "res://miff/scripts/",
  "scenePath": "res://scenes/",
  "resourcePath": "res://resources/",
  "useSignals": true,
  "useAnimations": true
}
```

### C# Config Example
```json
{
  "language": "csharp",
  "targetVersion": "4.0",
  "projectPath": "godot_project/",
  "scriptPath": "res://miff/scripts/",
  "scenePath": "res://scenes/",
  "resourcePath": "res://resources/",
  "useSignals": true,
  "useAnimations": true
}
```

### Godot 3.x Config Example
```json
{
  "language": "gdscript",
  "targetVersion": "3.5",
  "projectPath": "godot_project/",
  "scriptPath": "res://miff/scripts/",
  "scenePath": "res://scenes/",
  "resourcePath": "res://resources/",
  "useSignals": true,
  "useAnimations": false
}
```

## Testing

Run golden tests to verify deterministic output:

```bash
npm test -- GodotBridgePure/tests/goldenBridge.test.ts
```

Tests cover:
- NPC simulation and rendering
- Combat system integration
- UI rendering
- Godot data interop
- GDScript and C# configuration
- Bridge information dumping

## Engine Notes

### Godot Version Compatibility
- **Godot 4.0+**: Full support with GDScript and C#, signals, animations
- **Godot 3.5**: GDScript support, limited animation features
- **Godot 3.4**: Basic GDScript support, no animation system

### Performance Considerations
- **GDScript**: Easier debugging, good for prototyping
- **C#**: Better performance, stronger typing, better IDE support
- **Signals**: Event-driven architecture, good for loose coupling
- **Animations**: Use sparingly for performance-critical systems

### Asset Management
- **Nodes**: Generated for common entity types
- **Scripts**: Auto-generated with MIFF integration
- **Scenes**: Template scenes for different module types
- **Resources**: .tres/.res files for configurations
- **Animations**: AnimationPlayer libraries for complex behaviors

### Project Structure
```
godot_project/
├── miff/scripts/
│   ├── NPCController.gd
│   ├── CombatController.gd
│   └── UIController.gd
├── scenes/
│   ├── NPCScene.tscn
│   ├── CombatScene.tscn
│   └── InventoryScene.tscn
├── resources/
│   ├── npc_animations.tres
│   └── combat_animations.tres
└── assets/
    ├── npcs/
    ├── combat/
    └── ui/
```

## License Notes

This bridge module is part of the MIFF framework and follows the dual-license model:
- **AGPLv3**: Open source use with attribution
- **Commercial**: Paid license for commercial use without attribution

See `LICENSE.md` for full terms.