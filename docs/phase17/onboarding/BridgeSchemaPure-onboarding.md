# BridgeSchemaPure Onboarding Pack

## 🔗 Module Overview
BridgeSchemaPure provides unified cross-engine schema validation and payload conversion for Unity, Web, and Godot platforms. Ensures consistent data structures and seamless engine integration.

## 🚀 CLI Usage

### Basic Commands
```bash
# Validate schema against payload
npx ts-node miff/pure/BridgeSchemaPure/cliHarness.ts validate

# Build sample payload for testing
npx ts-node miff/pure/BridgeSchemaPure/cliHarness.ts build-sample

# Test Witcher Explorer demo payload
npx ts-node miff/pure/BridgeSchemaPure/cliHarness.ts witcher

# Test Spirit Tamer demo payload  
npx ts-node miff/pure/BridgeSchemaPure/cliHarness.ts spirit
```

### Orchestration Commands
```bash
# Initialize bridge schema system
npx ts-node miff/pure/BridgeSchemaPure/cliHarness.ts init --config bridge-config.json

# Teardown schema validation
npx ts-node miff/pure/BridgeSchemaPure/cliHarness.ts teardown --export-schemas

# Replay schema validation sequence
npx ts-node miff/pure/BridgeSchemaPure/cliHarness.ts replay --fixture fixtures/schema-validation.json

# Export validated schemas
npx ts-node miff/pure/BridgeSchemaPure/cliHarness.ts export --format typescript --output schemas/
```

## 📁 Sample Fixtures

### Bridge Schema Configuration
```json
{
  "engines": ["unity", "web", "godot"],
  "strictValidation": true,
  "allowPartialSchemas": false,
  "versionCompatibility": "exact",
  "exportFormats": ["typescript", "json", "xml"]
}
```

### Sample Game Payload
```json
{
  "version": "1.0.0",
  "timestamp": 1640995200000,
  "gameState": {
    "scene": "witcher_grove",
    "entities": [
      {
        "id": "player",
        "type": "character",
        "position": {"x": 150, "y": 200, "z": 0},
        "rotation": 0,
        "scale": {"x": 1, "y": 1, "z": 1},
        "components": {
          "health": {"current": 100, "max": 100},
          "inventory": {"items": [], "capacity": 20},
          "stats": {"level": 1, "xp": 0}
        }
      }
    ],
    "systems": {
      "physics": {"gravity": -9.81, "timeScale": 1.0},
      "audio": {"masterVolume": 1.0, "spatialAudio": true},
      "input": {"scheme": "default", "deadzone": 0.1}
    }
  },
  "metadata": {
    "sessionId": "test-session-001",
    "seed": 12345,
    "duration": 0
  }
}
```

### Schema Validation Rules
```json
{
  "required_fields": [
    "version",
    "timestamp", 
    "gameState",
    "metadata"
  ],
  "entity_schema": {
    "required": ["id", "type", "position"],
    "optional": ["rotation", "scale", "components"]
  },
  "position_schema": {
    "required": ["x", "y"],
    "optional": ["z"]
  },
  "validation_rules": {
    "position_bounds": {"min": -10000, "max": 10000},
    "entity_id_format": "^[a-zA-Z0-9_-]+$",
    "component_nesting_depth": 3
  }
}
```

## 🧪 Golden Test Walkthrough

```bash
# Run BridgeSchemaPure golden tests
npm test -- --testNamePattern="BridgeSchemaPure"

# Test schema validation
npx ts-node miff/pure/BridgeSchemaPure/cliHarness.ts validate

# Test Unity payload conversion
npx ts-node miff/pure/BridgeSchemaPure/cliHarness.ts convert --target unity --input sample.json

# Test Web payload conversion
npx ts-node miff/pure/BridgeSchemaPure/cliHarness.ts convert --target web --input sample.json

# Test Godot payload conversion
npx ts-node miff/pure/BridgeSchemaPure/cliHarness.ts convert --target godot --input sample.json
```

## 🔄 Replay/Export Examples

### Schema Validation Replay
```bash
# Record validation session
npx ts-node miff/pure/BridgeSchemaPure/cliHarness.ts replay \
  --record \
  --input sample-payload.json \
  --output validation-session.json

# Replay validation deterministically
npx ts-node miff/pure/BridgeSchemaPure/cliHarness.ts replay \
  --fixture validation-session.json \
  --quiet \
  --deterministic
```

### Export Schema Definitions
```bash
# Export TypeScript definitions
npx ts-node miff/pure/BridgeSchemaPure/cliHarness.ts export \
  --format typescript \
  --output schemas/bridge-types.ts

# Export JSON schema
npx ts-node miff/pure/BridgeSchemaPure/cliHarness.ts export \
  --format json-schema \
  --output schemas/bridge-schema.json

# Export Unity C# classes
npx ts-node miff/pure/BridgeSchemaPure/cliHarness.ts export \
  --format csharp \
  --output schemas/BridgeSchema.cs
```

## 🎯 Deterministic Globals

BridgeSchemaPure ensures deterministic behavior through:
- Consistent schema validation ordering
- Fixed serialization format across engines
- Deterministic type conversion rules
- Reproducible validation error messages
- Stable hash generation for payload integrity

## 🔗 Orchestration Patterns

### Schema Validation Lifecycle
1. **Initialization** - Load schema definitions and validation rules
2. **Validation** - Check payload against engine-specific schemas
3. **Conversion** - Transform payload for target engine format
4. **Verification** - Ensure converted payload maintains integrity
5. **Export** - Output validated payload in target format
6. **Teardown** - Clean up validation resources

### Integration Points
- Payload generation with RenderPayloadPure
- Engine conversion with Convert modules (Unity, Web, Godot)
- Asset validation through AssetValidatorPure
- Network synchronization via NetworkBridgePure
- Replay integration with VisualReplaySystemPure

## 📋 Quick Validation Checklist
- [ ] Schema definitions are complete for all engines
- [ ] Payload validation passes for Unity, Web, and Godot
- [ ] Type conversions maintain data integrity
- [ ] Required fields are present in all payloads
- [ ] Optional fields have proper default values
- [ ] Cross-engine compatibility is maintained