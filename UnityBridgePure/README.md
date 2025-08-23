# UnityBridgePure

**Schema Version**: v1  
**Module Type**: Engine Bridge  
**Dependencies**: NPCsPure, QuestsPure, CombatCorePure, StatsSystemPure, CraftingPure, LootTablesPure, EconomyPure

## Overview

UnityBridgePure provides a bridge between MIFF's pure logic modules and Unity game engine. It wraps existing pure modules (NPCsPure, QuestsPure, CombatCorePure, etc.) and exposes Unity-specific adapters without modifying core modules. The bridge supports both MonoBehaviour and ECS architectures.

## Features

- **Pure Logic Integration**: Delegates all logic to existing MIFF modules
- **Unity Entity Conversion**: Converts MIFF data to Unity GameObjects and Components
- **ECS Support**: Configurable for both MonoBehaviour and ECS architectures
- **CLI-First Design**: All operations via command line interface
- **Remix-Safe**: Clear hooks for customization and extension

## Schema v1

### Core Types

```typescript
interface UnityEntity {
  id: string;
  gameObject: any; // Unity GameObject reference
  transform: any; // Unity Transform component
  components: Map<string, any>; // Unity components
}

interface UnityRenderData {
  entities: UnityEntity[];
  components: UnityComponent[];
  prefabs: string[];
  scenes: string[];
  scripts: string[];
}

interface UnityBridgeConfig {
  targetVersion: string; // Unity version (e.g., "2022.3")
  useECS: boolean; // Use ECS or MonoBehaviour
  prefabPath: string; // Path to prefab assets
  scriptPath: string; // Path to script assets
  scenePath: string; // Path to scene assets
}
```

### Supported Modules
- **npcs**: NPC management and behavior simulation
- **combat**: Combat system integration
- **crafting**: Crafting system with Unity UI
- **loot**: Loot table integration
- **economy**: Economy system with Unity UI
- **quests**: Quest system integration
- **stats**: Stats system integration
- **world**: World layout and zone management

## CLI Usage

### Commands

```bash
# Simulate module with Unity bridge
npx ts-node UnityBridgePure/cliHarness.ts simulate npcs sample_npc_sim.json

# Render module for Unity
npx ts-node UnityBridgePure/cliHarness.ts render npcs sample_npc_render.json unity_config.json

# Interop with Unity data
npx ts-node UnityBridgePure/cliHarness.ts interop npcs unity_npc_data.json

# Dump module bridge info
npx ts-node UnityBridgePure/cliHarness.ts dump npcs
```

### Output Format

All operations return standardized JSON output:

```json
{
  "op": "simulate|render|interop|dump",
  "status": "ok|error",
  "renderData": {
    "entities": [...],
    "components": [...],
    "prefabs": [...],
    "scenes": [...],
    "scripts": [...]
  },
  "issues": ["error messages if any"]
}
```

## Remix Hooks

### 1. Custom Unity Component Creation
Override component creation for specific modules:

```typescript
// In your remix module
export function createCustomUnityComponent(npc: NPC, config: UnityBridgeConfig): UnityComponent {
  return {
    type: 'CustomNPCController',
    data: {
      npcId: npc.id,
      customBehavior: 'custom_logic',
      customStats: npc.stats
    },
    enabled: true
  };
}
```

### 2. Unity Prefab Customization
Customize prefab generation for different Unity versions:

```typescript
// Override prefab generation
export function getCustomPrefabs(module: string, config: UnityBridgeConfig): string[] {
  if (config.targetVersion === '2022.3') {
    return ['CustomNPCPrefab2022', 'CustomCombatPrefab2022'];
  }
  return ['LegacyNPCPrefab', 'LegacyCombatPrefab'];
}
```

### 3. ECS vs MonoBehaviour Switching
Hook into architecture switching:

```typescript
// In override.ts
export function getUnityArchitecture(config: UnityBridgeConfig): 'ECS' | 'MonoBehaviour' {
  if (config.useECS) {
    return 'ECS';
  }
  return 'MonoBehaviour';
}

export function createECSComponents(npc: NPC): UnityComponent[] {
  return [
    {
      type: 'NPCComponent',
      data: { npcId: npc.id, behavior: npc.behavior },
      enabled: true
    },
    {
      type: 'TransformComponent',
      data: { position: npc.location },
      enabled: true
    }
  ];
}
```

### 4. Unity Script Generation
Customize script generation for different Unity versions:

```typescript
// Override script generation
export function getUnityScripts(module: string, config: UnityBridgeConfig): string[] {
  const baseScripts = ['NPCController', 'CombatController'];
  
  if (config.targetVersion === '2022.3') {
    return [...baseScripts, 'Unity2022Extensions'];
  }
  
  return baseScripts;
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
- **PathfindingPure**: Pathfinding for Unity NavMesh
- **StatusEffectsPure**: Status effects for Unity particles

## Unity Integration Examples

### MonoBehaviour Integration
```csharp
// Generated Unity script
public class NPCController : MonoBehaviour
{
    public string npcId;
    public NPCBehavior behavior;
    
    void Start()
    {
        // Initialize from MIFF data
        var npcData = MIFFBridge.GetNPCData(npcId);
        transform.position = new Vector3(npcData.location.x, npcData.location.y, npcData.location.z);
    }
    
    void Update()
    {
        // Update behavior based on MIFF simulation
        var simulation = MIFFBridge.SimulateNPC(npcId, Time.deltaTime);
        UpdateBehavior(simulation);
    }
}
```

### ECS Integration
```csharp
// Generated ECS components
public struct NPCComponent : IComponentData
{
    public FixedString64Bytes npcId;
    public NPCBehavior behavior;
}

public struct TransformComponent : IComponentData
{
    public float3 position;
    public quaternion rotation;
}
```

## Configuration

### Unity Config Example
```json
{
  "targetVersion": "2022.3",
  "useECS": false,
  "prefabPath": "Assets/Prefabs/",
  "scriptPath": "Assets/Scripts/",
  "scenePath": "Assets/Scenes/"
}
```

### ECS Config Example
```json
{
  "targetVersion": "2022.3",
  "useECS": true,
  "prefabPath": "Assets/Prefabs/ECS/",
  "scriptPath": "Assets/Scripts/ECS/",
  "scenePath": "Assets/Scenes/ECS/"
}
```

## Testing

Run golden tests to verify deterministic output:

```bash
npm test -- UnityBridgePure/tests/goldenBridge.test.ts
```

Tests cover:
- NPC simulation and rendering
- Combat system integration
- World rendering
- Unity data interop
- Bridge information dumping

## Engine Notes

### Unity Version Compatibility
- **Unity 2022.3+**: Full support with ECS and MonoBehaviour
- **Unity 2021.3**: MonoBehaviour support only
- **Unity 2020.3**: Legacy support with limited features

### Performance Considerations
- **MonoBehaviour**: Higher overhead, easier debugging
- **ECS**: Better performance, more complex setup
- **Hybrid**: Use ECS for performance-critical systems, MonoBehaviour for UI

### Asset Management
- **Prefabs**: Generated for common entity types
- **Scripts**: Auto-generated with MIFF integration
- **Scenes**: Template scenes for different module types

## License Notes

This bridge module is part of the MIFF framework and follows the dual-license model:
- **AGPLv3**: Open source use with attribution
- **Commercial**: Paid license for commercial use without attribution

See `LICENSE.md` for full terms.