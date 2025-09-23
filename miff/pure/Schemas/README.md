# Schemas - JSON Schema Validation System

A lightweight, type-safe schema validation system for validating JSON data against simple schema definitions. Supports required field validation, type checking, and complex nested structures for modular gameplay data validation.

## Features

- **Type-Safe Validation**: Full TypeScript support with proper type definitions
- **Required Field Checking**: Automatic validation of required fields
- **Type Validation**: Support for string, number, boolean, object, and array types
- **Nested Validation**: Deep validation of complex object structures
- **File-Based Schemas**: Load and save schemas from/to JSON files
- **Batch Validation**: Validate multiple JSON files against a single schema
- **Error Reporting**: Detailed error messages with field paths
- **Performance Optimized**: Efficient validation algorithms

## Installation

```bash
npm install miff-framework
```

## Usage

### Basic Usage

```typescript
import { SchemaValidator, SchemaDefinition } from 'miff-framework';

// Create a simple schema
const schema: SchemaDefinition = {
  required: ['id', 'name'],
  properties: {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true },
    age: { type: 'number', required: false }
  }
};

// Validate data
const data = { id: 'player1', name: 'Hero', age: 25 };
const result = SchemaValidator.validateData(data, schema);

console.log('Valid:', result.isValid);
if (!result.isValid) {
  console.log('Errors:', result.errors);
}
```

### File-Based Validation

```typescript
import { SchemaValidator } from 'miff-framework';

// Validate JSON files
const result = SchemaValidator.validate('schema.json', 'data.json');
console.log('Validation result:', result.isValid);
if (!result.isValid) {
  result.errors.forEach(error => console.log('Error:', error));
}
```

### Advanced Schema Definition

```typescript
import { SchemaValidator, SchemaUtils } from 'miff-framework';

const complexSchema: SchemaDefinition = {
  title: 'Player Character Schema',
  description: 'Schema for validating player character data',
  required: ['id', 'name', 'level'],
  properties: {
    id: SchemaUtils.stringField(true, 'Unique player identifier'),
    name: SchemaUtils.stringField(true, 'Player display name'),
    level: SchemaUtils.numberField(true, 'Player level (1-100)'),
    health: SchemaUtils.numberField(false, 'Current health points'),
    maxHealth: SchemaUtils.numberField(false, 'Maximum health points'),
    inventory: SchemaUtils.arrayField(
      SchemaUtils.objectField({
        id: SchemaUtils.stringField(true),
        name: SchemaUtils.stringField(true),
        quantity: SchemaUtils.numberField(true)
      }),
      false,
      'Player inventory items'
    ),
    stats: SchemaUtils.objectField({
      strength: SchemaUtils.numberField(false),
      agility: SchemaUtils.numberField(false),
      intelligence: SchemaUtils.numberField(false)
    }, false, 'Player statistics')
  }
};
```

### CLI Usage

```bash
# Start interactive CLI
node cliHarness.ts

# Example CLI session:
schemas> load player_schema.json
schemas> validate player_data.json
schemas> create
schemas> save new_schema.json
schemas> demo
```

## API Reference

### Classes

#### SchemaValidator
Static class providing schema validation functionality.

**Core Methods:**
- `validate(schemaPath: string, jsonPath: string): ValidationResult` - Validate JSON file against schema file
- `validateData(data: any, schema: SchemaDefinition): ValidationResult` - Validate data against schema
- `loadSchema(schemaPath: string): SchemaDefinition | null` - Load schema from file
- `saveSchema(schemaPath: string, schema: SchemaDefinition): boolean` - Save schema to file
- `createSchema(requiredFields?: string[], properties?: Record<string, FieldDefinition>): SchemaDefinition` - Create schema
- `validateBatch(schemaPath: string, jsonPaths: string[]): ValidationResult` - Validate multiple files

### Interfaces

#### SchemaDefinition
Schema definition interface.

**Properties:**
- `required?: string[]` - Array of required field names
- `properties?: Record<string, FieldDefinition>` - Field definitions
- `title?: string` - Schema title
- `description?: string` - Schema description

#### FieldDefinition
Field type definition interface.

**Properties:**
- `type: 'string' | 'number' | 'boolean' | 'object' | 'array'` - Field type
- `required?: boolean` - Whether field is required
- `description?: string` - Field description
- `items?: FieldDefinition` - For arrays: item type definition
- `properties?: Record<string, FieldDefinition>` - For objects: property definitions
- `default?: any` - Default value

#### ValidationResult
Validation result interface.

**Properties:**
- `isValid: boolean` - Whether validation passed
- `errors: string[]` - Array of validation errors
- `warnings: string[]` - Array of validation warnings

### Utility Functions

#### SchemaUtils
Static utility functions for common field definitions.

- `stringField(required, description?)` - Create string field definition
- `numberField(required, description?)` - Create number field definition
- `booleanField(required, description?)` - Create boolean field definition
- `objectField(properties, required, description?)` - Create object field definition
- `arrayField(itemType, required, description?)` - Create array field definition

## Configuration

### Basic Configuration

```typescript
const basicSchema: SchemaDefinition = {
  required: ['id', 'name'],
  properties: {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true }
  }
};
```

### Advanced Configuration

```typescript
const advancedSchema: SchemaDefinition = {
  title: 'Game Configuration Schema',
  description: 'Schema for game configuration files',
  required: ['gameVersion', 'settings'],
  properties: {
    gameVersion: { type: 'string', required: true },
    settings: {
      type: 'object',
      required: true,
      properties: {
        difficulty: { type: 'string', required: true },
        soundVolume: { type: 'number', required: true },
        graphicsQuality: { type: 'string', required: false }
      }
    },
    features: {
      type: 'array',
      required: false,
      items: { type: 'string' }
    }
  }
};
```

## Examples

### Example 1: Player Character Validation

```typescript
import { SchemaValidator } from 'miff-framework';

const playerSchema: SchemaDefinition = {
  required: ['id', 'name', 'level'],
  properties: {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true },
    level: { type: 'number', required: true },
    health: { type: 'number', required: false },
    maxHealth: { type: 'number', required: false },
    inventory: {
      type: 'array',
      required: false,
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', required: true },
          quantity: { type: 'number', required: true }
        }
      }
    }
  }
};

const validPlayer = {
  id: 'player123',
  name: 'Hero',
  level: 25,
  health: 95,
  maxHealth: 100,
  inventory: [
    { id: 'sword', quantity: 1 },
    { id: 'potion', quantity: 5 }
  ]
};

const invalidPlayer = {
  id: 'player456',
  name: 'Villain',
  // Missing required 'level'
  health: 'not_a_number' // Wrong type
};

const validResult = SchemaValidator.validateData(validPlayer, playerSchema);
const invalidResult = SchemaValidator.validateData(invalidPlayer, playerSchema);

console.log('Valid player:', validResult.isValid); // true
console.log('Invalid player:', invalidResult.isValid); // false
console.log('Errors:', invalidResult.errors);
```

### Example 2: Game Configuration Validation

```typescript
const configSchema: SchemaDefinition = {
  required: ['gameVersion', 'graphics'],
  properties: {
    gameVersion: { type: 'string', required: true },
    graphics: {
      type: 'object',
      required: true,
      properties: {
        resolution: { type: 'string', required: true },
        quality: { type: 'string', required: false },
        vsync: { type: 'boolean', required: false }
      }
    },
    audio: {
      type: 'object',
      required: false,
      properties: {
        masterVolume: { type: 'number', required: false },
        musicVolume: { type: 'number', required: false },
        sfxVolume: { type: 'number', required: false }
      }
    }
  }
};

const validConfig = {
  gameVersion: '1.2.3',
  graphics: {
    resolution: '1920x1080',
    quality: 'high',
    vsync: true
  },
  audio: {
    masterVolume: 0.8,
    musicVolume: 0.6,
    sfxVolume: 0.9
  }
};

const result = SchemaValidator.validateData(validConfig, configSchema);
console.log('Config valid:', result.isValid); // true
```

## Testing

```bash
# Run Schemas tests
npm test -- --testPathPattern="Schemas"

# Run CLI harness tests
node cliHarness.ts
```

## Integration

### With Other Modules
- **SaveLoadPure**: Validate save/load data structures
- **QuestSystemPure**: Validate quest definitions and progress
- **AssetValidatorPure**: Combine schema validation with asset validation
- **CIEnforcerPure**: Use schema validation in CI pipelines

### Engine Bridges
- **Unity**: Validate Unity ScriptableObject data
- **Godot**: Validate Godot resource files
- **Web**: Validate web configuration files

## Performance

- **Time Complexity**: O(n) where n = number of fields to validate
- **Space Complexity**: O(d) where d = depth of nested structures
- **Optimization Tips**:
  - Cache schema definitions for repeated validation
  - Use batch validation for multiple files
  - Validate incrementally for large datasets

## Troubleshooting

### Common Issues
1. **Schema not found**: Check file paths and permissions
2. **Type mismatches**: Verify field types match expected values
3. **Nested validation**: Use correct field paths in error messages
4. **Performance issues**: Consider schema caching for repeated validation

### Debug Tips
- Enable detailed error reporting
- Test with simple schemas first
- Use CLI demo to understand validation behavior
- Check field paths in error messages

## Contributing

### Adding Features
1. Follow established validation patterns
2. Add comprehensive tests for new functionality
3. Update this documentation
4. Ensure type safety with TypeScript

### Code Style
- Use TypeScript strict mode
- Follow ESLint configuration
- Maintain consistent naming (camelCase)
- Add JSDoc comments for all public APIs

## License

MIT

## Version History

- **v1.0.0**: Initial TypeScript implementation with core validation functionality
- **v1.1.0**: Added batch validation and utility functions
- **v1.2.0**: Enhanced error reporting and nested validation