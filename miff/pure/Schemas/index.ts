/**
 * Schemas - JSON Schema Validation System
 *
 * A lightweight schema validation system for validating JSON data against
 * simple schema definitions. Supports required field validation and
 * type checking for modular gameplay data structures.
 *
 * @module Schemas
 * @version 1.0.0
 * @license MIT
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Validation result interface
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** List of validation errors */
  errors: string[];
  /** List of warnings */
  warnings: string[];
}

/**
 * Schema definition interface
 */
export interface SchemaDefinition {
  /** Required field names */
  required?: string[];
  /** Field type definitions */
  properties?: Record<string, FieldDefinition>;
  /** Additional schema metadata */
  title?: string;
  description?: string;
}

/**
 * Field type definition
 */
export interface FieldDefinition {
  /** Field type */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  /** Whether field is required */
  required?: boolean;
  /** Field description */
  description?: string;
  /** For arrays: item type */
  items?: FieldDefinition;
  /** For objects: property definitions */
  properties?: Record<string, FieldDefinition>;
  /** Default value */
  default?: any;
}

/**
 * Schema validator class
 */
export class SchemaValidator {
  /**
   * Validate JSON data against a schema file
   */
  static validate(schemaPath: string, jsonPath: string): ValidationResult {
    try {
      if (!fs.existsSync(schemaPath)) {
        return {
          isValid: false,
          errors: [`Schema file not found: ${schemaPath}`],
          warnings: []
        };
      }

      if (!fs.existsSync(jsonPath)) {
        return {
          isValid: false,
          errors: [`JSON file not found: ${jsonPath}`],
          warnings: []
        };
      }

      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      const jsonContent = fs.readFileSync(jsonPath, 'utf8');

      const schema = JSON.parse(schemaContent) as SchemaDefinition;
      const jsonData = JSON.parse(jsonContent);

      return this.validateData(jsonData, schema);
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation error: ${error instanceof Error ? error.message : String(error)}`],
        warnings: []
      };
    }
  }

  /**
   * Validate JSON data against schema definition
   */
  static validateData(data: any, schema: SchemaDefinition): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (schema.required) {
      for (const requiredField of schema.required) {
        if (!(requiredField in data)) {
          errors.push(`missing required field: ${requiredField}`);
        }
      }
    }

    // Validate field types if properties are defined
    if (schema.properties) {
      for (const [fieldName, fieldDef] of Object.entries(schema.properties)) {
        if (fieldName in data) {
          const fieldErrors = this.validateField(data[fieldName], fieldDef, fieldName);
          errors.push(...fieldErrors);
        } else if (fieldDef.required) {
          errors.push(`missing required field: ${fieldName}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate a single field against its definition
   */
  private static validateField(value: any, fieldDef: FieldDefinition, fieldPath: string): string[] {
    const errors: string[] = [];

    // Type validation
    switch (fieldDef.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`field '${fieldPath}' should be string, got ${typeof value}`);
        }
        break;

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push(`field '${fieldPath}' should be number, got ${typeof value}`);
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`field '${fieldPath}' should be boolean, got ${typeof value}`);
        }
        break;

      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          errors.push(`field '${fieldPath}' should be object, got ${typeof value}`);
        } else if (fieldDef.properties) {
          // Validate object properties
          for (const [propName, propDef] of Object.entries(fieldDef.properties)) {
            if (propName in value) {
              const propErrors = this.validateField(value[propName], propDef, `${fieldPath}.${propName}`);
              errors.push(...propErrors);
            } else if (propDef.required) {
              errors.push(`missing required property: ${fieldPath}.${propName}`);
            }
          }
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          errors.push(`field '${fieldPath}' should be array, got ${typeof value}`);
        } else if (fieldDef.items) {
          // Validate array items
          value.forEach((item, index) => {
            const itemErrors = this.validateField(item, fieldDef.items!, `${fieldPath}[${index}]`);
            errors.push(...itemErrors);
          });
        }
        break;

      default:
        errors.push(`unknown field type '${fieldDef.type}' for field '${fieldPath}'`);
    }

    return errors;
  }

  /**
   * Load schema from file
   */
  static loadSchema(schemaPath: string): SchemaDefinition | null {
    try {
      if (!fs.existsSync(schemaPath)) {
        return null;
      }

      const content = fs.readFileSync(schemaPath, 'utf8');
      return JSON.parse(content) as SchemaDefinition;
    } catch (error) {
      return null;
    }
  }

  /**
   * Save schema to file
   */
  static saveSchema(schemaPath: string, schema: SchemaDefinition): boolean {
    try {
      const content = JSON.stringify(schema, null, 2);
      fs.writeFileSync(schemaPath, content, 'utf8');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create a simple schema definition
   */
  static createSchema(requiredFields: string[] = [], properties: Record<string, FieldDefinition> = {}): SchemaDefinition {
    return {
      required: requiredFields,
      properties
    };
  }

  /**
   * Validate multiple JSON files against a schema
   */
  static validateBatch(schemaPath: string, jsonPaths: string[]): ValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    for (const jsonPath of jsonPaths) {
      const result = this.validate(schemaPath, jsonPath);

      if (!result.isValid) {
        allErrors.push(`Validation failed for ${jsonPath}:`);
        allErrors.push(...result.errors.map(error => `  - ${error}`));
      }

      allWarnings.push(...result.warnings.map(warning => `${jsonPath}: ${warning}`));
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }
}

/**
 * Utility functions for common schema operations
 */
export const SchemaUtils = {
  /**
   * Create a string field definition
   */
  stringField(required: boolean = false, description?: string): FieldDefinition {
    return {
      type: 'string',
      required,
      description
    };
  },

  /**
   * Create a number field definition
   */
  numberField(required: boolean = false, description?: string): FieldDefinition {
    return {
      type: 'number',
      required,
      description
    };
  },

  /**
   * Create a boolean field definition
   */
  booleanField(required: boolean = false, description?: string): FieldDefinition {
    return {
      type: 'boolean',
      required,
      description
    };
  },

  /**
   * Create an object field definition
   */
  objectField(properties: Record<string, FieldDefinition>, required: boolean = false, description?: string): FieldDefinition {
    return {
      type: 'object',
      required,
      properties,
      description
    };
  },

  /**
   * Create an array field definition
   */
  arrayField(itemType: FieldDefinition, required: boolean = false, description?: string): FieldDefinition {
    return {
      type: 'array',
      required,
      items: itemType,
      description
    };
  }
};

/**
 * Default export for easy importing
 */
export default SchemaValidator;