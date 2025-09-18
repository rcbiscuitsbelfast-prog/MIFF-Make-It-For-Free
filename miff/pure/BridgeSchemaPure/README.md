# BridgeSchemaPure

A comprehensive bridge schema system for MIFF cross-engine compatibility. Manages schema validation, conversion between game engines, and maintains a registry of bridge schemas with full CLI support.

## Features

- **Schema Registry**: Manage schemas for Unity, Godot, Web, and custom engines
- **Cross-Engine Validation**: Validate data against engine-specific schemas
- **Data Conversion**: Convert data between different engine formats
- **Schema Generation**: Auto-generate schemas from sample data
- **Conversion Rules**: Define and manage conversion mappings between engines
- **Validation Caching**: Performance optimization with validation result caching
- **Multi-Format Export**: Export schemas in JSON, CSV, Markdown, HTML, YAML, XML formats
- **Comprehensive Statistics**: Track schema usage and performance metrics

## Usage

### Basic API

```typescript
import { BridgeSchemaManager, SchemaDefinition } from './Manager';
import { BridgeSchema } from './index';

const manager = new BridgeSchemaManager({
  version: '1.0.0',
  strict: true,
  validateReferences: true
});

// Validate Unity data
const unityData = {
  gameObject: {
    name: 'Player',
    transform: {
      position: [0, 1, 0],
      rotation: [0, 0, 0, 1],
      scale: [1, 1, 1]
    }
  }
};

const validation = manager.validateAgainstSchema('unity-bridge-v1', unityData);

// Convert Unity data to Web format
const converted = manager.convert(unityData, 'unity', 'web');

// Generate schema from data
const schema = manager.generateSchema(unityData, 'my-schema', 'My Schema', 'unity');
```

### CLI Usage

```bash
# List all schemas
npx tsx cliHarness.ts listSchemas

# List schemas by engine
npx tsx cliHarness.ts listSchemas unity

# Get specific schema
npx tsx cliHarness.ts getSchema unity-bridge-v1

# Validate data against schema
npx tsx cliHarness.ts validate unity-bridge-v1 fixtures/unity_data.json

# Convert data between engines
npx tsx cliHarness.ts convert fixtures/unity_data.json unity web

# Generate schema from data
npx tsx cliHarness.ts generate fixtures/unity_data.json my-schema "My Schema" unity

# Add custom schema
npx tsx cliHarness.ts addSchema fixtures/custom_schema.json

# Add conversion rule
npx tsx cliHarness.ts addConversion fixtures/conversion_rule.json

# Get statistics
npx tsx cliHarness.ts stats

# Export registry
npx tsx cliHarness.ts export yaml
npx tsx cliHarness.ts export schemas-only

# Clear validation cache
npx tsx cliHarness.ts clearCache
```

## Data Structures

### SchemaDefinition
```typescript
interface SchemaDefinition {
  id: string;                    // Unique schema identifier
  name: string;                  // Human-readable name
  version: string;               // Schema version
  engine: 'unity' | 'godot' | 'web' | 'universal';
  schema: Record<string, any>;   // JSON Schema definition
  metadata?: {
    description?: string;        // Schema description
    author?: string;             // Schema author
    created?: string;            // Creation timestamp
    tags?: string[];             // Schema tags
    compatibility?: string[];    // Compatible engine versions
  };
}
```

### ConversionRule
```typescript
interface ConversionRule {
  id: string;                    // Unique rule identifier
  name: string;                  // Human-readable name
  fromEngine: string;            // Source engine
  toEngine: string;              // Target engine
  mappings: Record<string, string>; // Field mappings (from -> to)
  transformations?: Record<string, (value: any) => any>; // Value transformations
}
```

### BridgeSchemaConfig
```typescript
interface BridgeSchemaConfig {
  version: string;               // Schema version
  strict: boolean;               // Strict validation mode
  validateReferences: boolean;   // Validate schema references
}
```

## Built-in Schemas

### Unity Bridge Schema (`unity-bridge-v1`)
Validates Unity GameObject structure:
```json
{
  "gameObject": {
    "name": "string",
    "transform": {
      "position": [x, y, z],
      "rotation": [x, y, z, w],
      "scale": [x, y, z]
    },
    "components": [
      {
        "type": "string",
        "properties": {}
      }
    ]
  }
}
```

### Web Bridge Schema (`web-bridge-v1`)
Validates HTML/DOM element structure:
```json
{
  "element": {
    "tag": "string",
    "id": "string",
    "className": "string",
    "style": {
      "position": "absolute|relative|fixed",
      "left": "string",
      "top": "string",
      "transform": "string"
    },
    "attributes": {},
    "children": []
  }
}
```

### Godot Bridge Schema (`godot-bridge-v1`)
Validates Godot Node structure:
```json
{
  "node": {
    "name": "string",
    "type": "string",
    "position": [x, y] | [x, y, z],
    "rotation": "number",
    "scale": [x, y] | [x, y, z],
    "properties": {},
    "children": []
  }
}
```

## Built-in Conversions

### Unity to Web
- `gameObject.name` → `element.id`
- `gameObject.transform.position` → `element.style.transform` (with CSS transform)
- `gameObject.components` → `element.attributes`

### Web to Godot
- `element.id` → `node.name`
- `element.tag` → `node.type`
- `element.style.left/top` → `node.position`

## Schema Validation

The system supports comprehensive JSON Schema validation:

- **Type checking**: Validates data types (object, array, string, number, boolean)
- **Required properties**: Ensures required fields are present
- **Property validation**: Recursive validation of nested properties
- **Reference resolution**: Handles `$ref` references within schemas
- **Custom constraints**: Supports enums, min/max values, patterns

## Export Formats

### Standard Formats
- **JSON**: Complete schema definitions with metadata
- **CSV**: Tabular format for schema listings
- **Markdown**: Human-readable documentation format
- **HTML**: Web-ready presentation format
- **YAML**: Configuration-friendly format
- **XML**: Structured markup format

### Schema-Specific Formats
- **full**: Complete registry export with schemas and conversions
- **schemas-only**: Schema definitions only
- **conversions-only**: Conversion rules only

## CLI Operations

| Operation | Description | Arguments |
|-----------|-------------|-----------|
| `addSchema` | Add schema definition | jsonFile |
| `getSchema` | Get schema by ID | schemaId |
| `listSchemas` | List all schemas | [engine] |
| `validate` | Validate data against schema | schemaId, dataFile |
| `convert` | Convert data between engines | dataFile, fromEngine, toEngine |
| `generate` | Generate schema from data | dataFile, id, name, engine |
| `addConversion` | Add conversion rule | jsonFile |
| `stats` | Get registry statistics | - |
| `export` | Export registry | [format] |
| `clearCache` | Clear validation cache | - |

## Performance Features

### Validation Caching
- Caches validation results for improved performance
- Cache keys based on schema ID and data hash
- Configurable cache clearing

### Efficient Schema Storage
- Map-based storage for O(1) lookups
- Lazy loading of schema definitions
- Memory-efficient reference handling

## Testing

```bash
# Run unit tests
npm test

# Run golden tests
npm run test:golden

# Test CLI harness
npx tsx cliHarness.ts listSchemas
npx tsx cliHarness.ts stats
```

## Fixtures

- `fixtures/unity_data.json`: Valid Unity GameObject data
- `fixtures/web_data.json`: Valid Web/DOM element data
- `fixtures/custom_schema.json`: Custom schema definition example
- `fixtures/conversion_rule.json`: Custom conversion rule example

## Integration

BridgeSchemaPure integrates seamlessly with other MIFF systems:

- **UnityBridgePure**: Validates Unity bridge data
- **WebBridgePure**: Validates Web bridge data
- **GodotBridgePure**: Validates Godot bridge data
- **ConvertToUnityPure**: Uses schemas for Unity conversion
- **ConvertToWebPure**: Uses schemas for Web conversion
- **ConvertToGodotPure**: Uses schemas for Godot conversion

## Advanced Features

### Schema Generation
Automatically infer schemas from sample data:
```typescript
const data = { player: { name: 'Hero', level: 5 } };
const schema = manager.generateSchema(data, 'player-schema', 'Player Schema', 'universal');
```

### Custom Transformations
Define custom data transformations in conversion rules:
```typescript
const rule: ConversionRule = {
  id: 'custom-transform',
  fromEngine: 'unity',
  toEngine: 'web',
  mappings: { 'transform.position': 'style.transform' },
  transformations: {
    position: (pos: number[]) => `translate3d(${pos[0]}px, ${pos[1]}px, ${pos[2]}px)`
  }
};
```

### Reference Validation
Handle complex schema references:
```json
{
  "properties": {
    "player": { "$ref": "#/definitions/player" }
  },
  "definitions": {
    "player": { "type": "object" }
  }
}
```

## Error Handling

Comprehensive error handling with detailed messages:

- Schema not found errors
- Validation failure details
- Conversion rule missing errors
- Invalid schema definition errors
- Reference resolution failures

All operations return structured responses with `ok` status and detailed error arrays when applicable.

## Examples

### Cross-Engine Data Pipeline
```typescript
// 1. Validate Unity data
const unityData = loadUnityData();
const validation = manager.validateAgainstSchema('unity-bridge-v1', unityData);

// 2. Convert to Web format
if (validation.result?.valid) {
  const webData = manager.convert(unityData, 'unity', 'web');
  
  // 3. Validate converted data
  const webValidation = manager.validateAgainstSchema('web-bridge-v1', webData.result);
  
  if (webValidation.result?.valid) {
    console.log('Cross-engine conversion successful!');
  }
}
```

### Custom Schema Creation
```typescript
// Generate schema from sample data
const sampleData = { entity: { id: 'test', type: 'player', position: { x: 0, y: 0 } } };
const generated = manager.generateSchema(sampleData, 'entity-schema', 'Entity Schema', 'universal');

// Add to registry
manager.addSchema(generated.schema!);

// Validate new data against generated schema
const newData = { entity: { id: 'player1', type: 'npc', position: { x: 10, y: 20 } } };
const validation = manager.validateAgainstSchema('entity-schema', newData);
```

## Remix Hooks

This module supports the following remix hooks for customization:

- `schema.validate`: Called during schema validation
- `schema.convert`: Called during data conversion
- `schema.generate`: Called during schema generation
- `schema.add`: Called when adding new schemas
- `conversion.apply`: Called when applying conversion rules

## License

MIT License - Part of the MIFF (Make It For Free) framework.