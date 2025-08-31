# BridgeSchemaPure

**Schema Version**: v1  
**Module Type**: Schema & Validation  
**Dependencies**: None (Pure schema module)

## Overview

BridgeSchemaPure provides a unified schema for renderData formats across all engine bridges (Unity, Web, Godot). It defines standardized types, validation rules, and conversion utilities that ensure consistent data exchange between MIFF's pure logic modules and engine-specific bridges.

## Features

- **Unified RenderData Schema**: Common format for all engine bridges
- **Engine-Specific Hints**: Optional engine-specific metadata
- **Bidirectional Conversion**: Convert between engine formats and unified schema
- **Comprehensive Validation**: Type checking and data integrity validation
- **Signal System**: Cross-engine event/signal management
- **Nested Structure**: Support for hierarchical render data
- **Extensible Design**: Easy to add new engine support

## Schema v1

### Core Types

```typescript
type RenderDataType = 'sprite' | 'text' | 'sound' | 'animation' | 'node' | 'component' | 'resource' | 'scene' | 'input';

interface Position3D {
  x: number;
  y: number;
  z?: number;
}

interface EngineHints {
  unity?: {
    gameObject?: string;
    component?: string;
    prefab?: string;
    useECS?: boolean;
  };
  web?: {
    element?: string;
    canvas?: string;
    dom?: string;
    useWebGL?: boolean;
  };
  godot?: {
    node?: string;
    script?: string;
    scene?: string;
    language?: 'gdscript' | 'csharp';
  };
}

interface RenderData {
  id: string;
  type: RenderDataType;
  name?: string;
  position?: Position3D;
  scale?: { x: number; y: number; z?: number };
  rotation?: { x: number; y: number; z?: number };
  asset?: string; // Path or ID to the asset
  props?: { [key: string]: any }; // Generic properties
  engineHints?: EngineHints; // Engine-specific hints
  children?: RenderData[]; // Nested render data
  signals?: RenderSignal[]; // Event signals/connections
  metadata?: { [key: string]: any }; // Additional metadata
}

interface RenderSignal {
  name: string;
  parameters?: string[];
  connectedTo?: string[];
  engine?: 'unity' | 'web' | 'godot';
}

interface RenderPayload {
  op: string;
  status: 'ok' | 'error';
  renderData: RenderData[];
  issues?: string[];
  metadata?: {
    schemaVersion: string;
    engine: string;
    timestamp: string;
    module: string;
  };
}
```

### Render Types

| Type | Description | Unity | Web | Godot |
|------|-------------|-------|-----|-------|
| `sprite` | Image/Texture rendering | SpriteRenderer | sprite | Sprite |
| `text` | Text display | TextMesh | text | Label |
| `sound` | Audio playback | AudioSource | audio | AudioStreamPlayer |
| `animation` | Animation system | Animator | animation | AnimationPlayer |
| `node` | Container/Transform | Transform | container | Node2D/Control |
| `component` | Custom component | MonoBehaviour | element | Node |
| `resource` | Asset/Resource | ScriptableObject | resource | Resource |
| `scene` | Scene/Level | Scene | scene | Scene |
| `input` | Input handling | Input | input | InputEvent |

## Usage Examples

### Basic RenderData Creation

```typescript
import { RenderData, RenderPayload } from './schema';

// Create a simple sprite
const spriteData: RenderData = {
  id: 'player_sprite',
  type: 'sprite',
  position: { x: 100, y: 200 },
  asset: 'player.png',
  props: {
    texture: 'player.png',
    visible: true
  }
};

// Create a payload
const payload: RenderPayload = {
  op: 'render',
  status: 'ok',
  renderData: [spriteData],
  metadata: {
    schemaVersion: 'v1',
    engine: 'unified',
    timestamp: new Date().toISOString(),
    module: 'npcs'
  }
};
```

### Engine-Specific Hints

```typescript
// Unity-specific hints
const unitySprite: RenderData = {
  id: 'npc_001',
  type: 'sprite',
  position: { x: 640, y: 960, z: 0 },
  engineHints: {
    unity: {
      gameObject: 'GameObject_npc_001',
      component: 'NPCController',
      prefab: 'NPCPrefab',
      useECS: false
    }
  }
};

// Web-specific hints
const webSprite: RenderData = {
  id: 'npc_001',
  type: 'sprite',
  position: { x: 640, y: 960 },
  engineHints: {
    web: {
      element: 'sprite',
      canvas: 'gameCanvas',
      useWebGL: true
    }
  }
};

// Godot-specific hints
const godotSprite: RenderData = {
  id: 'npc_001',
  type: 'sprite',
  position: { x: 640, y: 960 },
  engineHints: {
    godot: {
      node: 'Sprite',
      script: 'NPCController.gd',
      language: 'gdscript'
    }
  }
};
```

### Nested Structure

```typescript
const npcNode: RenderData = {
  id: 'npc_001',
  type: 'node',
  name: 'Guard Captain Marcus',
  position: { x: 640, y: 960 },
  children: [
    {
      id: 'npc_001_sprite',
      type: 'sprite',
      position: { x: 0, y: 0 },
      asset: 'npc_sprite.png'
    },
    {
      id: 'npc_001_quest_indicator',
      type: 'sprite',
      position: { x: 24, y: -24 },
      asset: 'quest_icon.png',
      props: { modulate: '#ffff00' }
    }
  ]
};
```

### Signal System

```typescript
const interactiveSprite: RenderData = {
  id: 'npc_001',
  type: 'sprite',
  signals: [
    {
      name: 'npc_interacted',
      parameters: ['player_id', 'interaction_type'],
      connectedTo: ['QuestSystem', 'DialogSystem'],
      engine: 'unity' // Engine-specific signal
    },
    {
      name: 'npc_interacted',
      parameters: ['player_id', 'interaction_type'],
      connectedTo: ['QuestSystem', 'DialogSystem'],
      engine: 'web'
    },
    {
      name: 'npc_interacted',
      parameters: ['player_id', 'interaction_type'],
      connectedTo: ['QuestSystem', 'DialogSystem'],
      engine: 'godot'
    }
  ]
};
```

## Validation

### Schema Validation

```typescript
import { BridgeSchemaValidator } from './schema';

// Validate RenderData
const renderData: RenderData = {
  id: 'test_sprite',
  type: 'sprite',
  position: { x: 100, y: 200 }
};

const issues = BridgeSchemaValidator.validateRenderData(renderData);
if (issues.length > 0) {
  console.error('Validation issues:', issues);
}

// Validate RenderPayload
const payload: RenderPayload = {
  op: 'render',
  status: 'ok',
  renderData: [renderData]
};

const payloadIssues = BridgeSchemaValidator.validateRenderPayload(payload);
if (payloadIssues.length > 0) {
  console.error('Payload validation issues:', payloadIssues);
}
```

### Common Validation Issues

| Issue | Description | Fix |
|-------|-------------|-----|
| `RenderData must have an id` | Missing required `id` field | Add unique identifier |
| `RenderData must have a type` | Missing required `type` field | Specify render type |
| `Invalid render type: invalid_type` | Unknown render type | Use valid type from schema |
| `Position x must be a number` | Invalid position data | Ensure numeric values |
| `Children must be an array` | Invalid children structure | Use array of RenderData |
| `Signals must be an array` | Invalid signals structure | Use array of RenderSignal |

## Engine Conversions

### Converting from Engine Formats

```typescript
// Convert Unity data
const unityData = {
  id: 'npc_001',
  gameObject: 'GameObject_npc_001',
  transform: { position: { x: 640, y: 960, z: 0 } },
  componentType: 'NPCController'
};

const renderData = BridgeSchemaValidator.convertFromUnity(unityData);

// Convert Web data
const webData = {
  id: 'npc_001',
  type: 'sprite',
  x: 640,
  y: 960,
  texture: 'npc_sprite.png'
};

const renderData = BridgeSchemaValidator.convertFromWeb(webData);

// Convert Godot data
const godotData = {
  id: 'npc_001',
  type: 'Node2D',
  position: { x: 640, y: 960 },
  texture: 'npc_sprite.png'
};

const renderData = BridgeSchemaValidator.convertFromGodot(godotData);
```

### Converting to Engine Formats

```typescript
const renderData: RenderData = {
  id: 'npc_001',
  type: 'sprite',
  position: { x: 640, y: 960 },
  asset: 'npc_sprite.png'
};

// Convert to Unity format
const unityData = BridgeSchemaValidator.convertToUnity(renderData);

// Convert to Web format
const webData = BridgeSchemaValidator.convertToWeb(renderData);

// Convert to Godot format
const godotData = BridgeSchemaValidator.convertToGodot(renderData);
```

## Remix Hooks

### 1. Custom Render Type Extension

```typescript
// In your remix module
export function extendRenderTypes(): RenderDataType[] {
  return [
    'sprite',
    'text',
    'sound',
    'animation',
    'node',
    'component',
    'resource',
    'scene',
    'input',
    'particle', // Custom type
    'light',    // Custom type
    'camera'    // Custom type
  ];
}

export function validateCustomRenderType(type: string): boolean {
  const validTypes = extendRenderTypes();
  return validTypes.includes(type as RenderDataType);
}
```

### 2. Custom Engine Hints

```typescript
// Extend engine hints for custom engines
export interface CustomEngineHints {
  custom?: {
    engine?: string;
    version?: string;
    features?: string[];
  };
}

export function createCustomEngineHints(engine: string, version: string): CustomEngineHints {
  return {
    custom: {
      engine,
      version,
      features: ['custom_rendering', 'custom_physics']
    }
  };
}
```

### 3. Custom Validation Rules

```typescript
// Add custom validation rules
export function validateCustomRenderData(data: RenderData): string[] {
  const issues: string[] = [];
  
  // Custom validation logic
  if (data.type === 'particle' && !data.props?.particleSystem) {
    issues.push('Particle render data must have particleSystem property');
  }
  
  if (data.type === 'light' && !data.props?.intensity) {
    issues.push('Light render data must have intensity property');
  }
  
  return issues;
}

// Extend the validator
export class ExtendedBridgeSchemaValidator extends BridgeSchemaValidator {
  static validateRenderData(data: RenderData): string[] {
    const baseIssues = super.validateRenderData(data);
    const customIssues = validateCustomRenderData(data);
    return [...baseIssues, ...customIssues];
  }
}
```

### 4. Custom Conversion Logic

```typescript
// Add custom engine conversion
export function convertFromCustomEngine(customData: any): RenderData {
  return {
    id: customData.id,
    type: mapCustomType(customData.type),
    position: customData.position,
    asset: customData.asset,
    props: customData.properties,
    engineHints: {
      custom: {
        engine: 'custom_engine',
        version: customData.version
      }
    }
  };
}

export function convertToCustomEngine(renderData: RenderData): any {
  return {
    id: renderData.id,
    type: mapToCustomType(renderData.type),
    position: renderData.position,
    asset: renderData.asset,
    properties: renderData.props
  };
}

function mapCustomType(customType: string): RenderDataType {
  const typeMap: { [key: string]: RenderDataType } = {
    'custom_sprite': 'sprite',
    'custom_text': 'text',
    'custom_audio': 'sound'
  };
  return typeMap[customType] || 'component';
}

function mapToCustomType(renderType: RenderDataType): string {
  const reverseMap: { [key: string]: string } = {
    'sprite': 'custom_sprite',
    'text': 'custom_text',
    'sound': 'custom_audio'
  };
  return reverseMap[renderType] || 'custom_component';
}
```

## Integration with Bridge Modules

### UnityBridgePure Integration

```typescript
// In UnityBridgePure/Bridge.ts
import { BridgeSchemaValidator, RenderData, RenderPayload } from '../BridgeSchemaPure/schema';

export class UnityBridge {
  // ... existing code ...

  private convertToUnityRenderData(result: any, config: UnityBridgeConfig): UnityRenderData {
    // Convert MIFF result to unified RenderData
    const renderData: RenderData = {
      id: result.id,
      type: 'component',
      // ... other properties
    };
    
    // Convert to Unity format
    const unityData = BridgeSchemaValidator.convertToUnity(renderData);
    
    // Return Unity-specific format
    return {
      entities: [unityData],
      components: [],
      prefabs: [],
      scenes: [],
      scripts: []
    };
  }
}
```

### WebBridgePure Integration

```typescript
// In WebBridgePure/Bridge.ts
import { BridgeSchemaValidator, RenderData, RenderPayload } from '../BridgeSchemaPure/schema';

export class WebBridge {
  // ... existing code ...

  private convertToWebRenderData(result: any, config: WebBridgeConfig): WebRenderData {
    // Convert MIFF result to unified RenderData
    const renderData: RenderData = {
      id: result.id,
      type: 'sprite',
      // ... other properties
    };
    
    // Convert to Web format
    const webData = BridgeSchemaValidator.convertToWeb(renderData);
    
    // Return Web-specific format
    return {
      entities: [webData],
      components: [],
      sprites: [],
      sounds: [],
      scripts: [],
      styles: []
    };
  }
}
```

### GodotBridgePure Integration

```typescript
// In GodotBridgePure/Bridge.ts
import { BridgeSchemaValidator, RenderData, RenderPayload } from '../BridgeSchemaPure/schema';

export class GodotBridge {
  // ... existing code ...

  private convertToGodotRenderData(result: any, config: GodotBridgeConfig): GodotRenderData {
    // Convert MIFF result to unified RenderData
    const renderData: RenderData = {
      id: result.id,
      type: 'node',
      // ... other properties
    };
    
    // Convert to Godot format
    const godotData = BridgeSchemaValidator.convertToGodot(renderData);
    
    // Return Godot-specific format
    return {
      nodes: [godotData],
      resources: [],
      scripts: [],
      scenes: [],
      animations: [],
      inputs: []
    };
  }
}
```

## Testing

Run golden tests to verify schema integrity and compatibility:

```bash
npm test -- BridgeSchemaPure/tests/goldenSchema.test.ts
```

Tests cover:
- Schema validation for all data types
- Engine conversion accuracy
- Sample data validation
- Type mapping correctness
- Signal filtering functionality

## Best Practices

### 1. Always Validate Data
```typescript
// Validate before processing
const issues = BridgeSchemaValidator.validateRenderData(renderData);
if (issues.length > 0) {
  throw new Error(`Invalid render data: ${issues.join(', ')}`);
}
```

### 2. Use Engine Hints Sparingly
```typescript
// Only include engine hints when necessary
const renderData: RenderData = {
  id: 'sprite_001',
  type: 'sprite',
  position: { x: 100, y: 200 },
  // Only add engine hints for engine-specific features
  engineHints: {
    unity: { useECS: true }, // Only if ECS is required
    godot: { language: 'csharp' } // Only if C# is required
  }
};
```

### 3. Leverage the Signal System
```typescript
// Use engine-specific signals for cross-engine compatibility
const renderData: RenderData = {
  id: 'interactive_sprite',
  type: 'sprite',
  signals: [
    {
      name: 'click',
      parameters: ['event'],
      connectedTo: ['ClickHandler'],
      engine: 'web' // Web-specific click event
    },
    {
      name: 'OnMouseDown',
      parameters: ['event'],
      connectedTo: ['ClickHandler'],
      engine: 'unity' // Unity-specific mouse event
    }
  ]
};
```

### 4. Maintain Backward Compatibility
```typescript
// Always include schema version in metadata
const payload: RenderPayload = {
  op: 'render',
  status: 'ok',
  renderData: [],
  metadata: {
    schemaVersion: 'v1',
    engine: 'unified',
    timestamp: new Date().toISOString(),
    module: 'npcs'
  }
};
```

## License Notes

This schema module is part of the MIFF framework and follows the dual-license model:
- **AGPLv3**: Open source use with attribution
- **Commercial**: Paid license for commercial use without attribution

See `LICENSE.md` for full terms.