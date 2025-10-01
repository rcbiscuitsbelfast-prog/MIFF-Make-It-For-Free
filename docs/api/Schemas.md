# Schemas

**Version:** 1.0.0  
**Description:** Schemas - JSON Schema Validation System A lightweight schema validation system for validating JSON data against simple schema definitions. Supports required field validation and type checking for modular gameplay data structures. /

## Exports

- `ValidationResult`
- `SchemaDefinition`
- `FieldDefinition`
- `SchemaValidator`
- `SchemaUtils`

## Classes

### SchemaValidator

Validate JSON data against a schema file

**Methods:**
- `validate()` - validate method

**Properties:**
- `schemaPath: string` - 
- `jsonPath: string` - 
- `isValid: false` - 


## Interfaces

### ValidationResult

Whether validation passed

**Properties:**


### SchemaDefinition

Required field names

**Properties:**


### FieldDefinition

Field type

**Properties:**



## Enums



## Functions



## CLI Commands

- `help`
- `h`
- `load`
- `validate`
- `check`
- `create`
- `save`
- `list`
- `history`
- `demo`
- `quit`
- `exit`
- `q`

## Dependencies

- `fs`
- `path`

## Usage Example

```typescript
import { ValidationResult } from './miff/pure/Schemas';

// Example usage
const instance = new ValidationResult();
```
