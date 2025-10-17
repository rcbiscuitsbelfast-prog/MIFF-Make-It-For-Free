/**
 * InterfaceValidator - Advanced Interface Validation and Type Safety
 *
 * Provides comprehensive interface validation, schema checking, and runtime type safety
 * for complex data structures in the MIFF framework.
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { StructuredLogger } from '../logging/StructuredLogger';
import { TypeGuards } from './TypeGuards';

export interface ValidationRule {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | 'custom';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  customValidator?: (value: any) => boolean;
  errorMessage?: string;
  allowNull?: boolean;
  allowUndefined?: boolean;
}

export interface InterfaceSchema {
  [key: string]: ValidationRule | InterfaceSchema;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  data?: any;
}

export interface ValidationError {
  path: string;
  message: string;
  value: any;
  expected: string;
  actual: string;
}

export interface ValidationWarning {
  path: string;
  message: string;
  value: any;
  suggestion?: string;
}

export class InterfaceValidator {
  private static instance: InterfaceValidator;
  private logger: StructuredLogger;
  private schemas: Map<string, InterfaceSchema> = new Map();

  constructor() {
    this.logger = StructuredLogger.getInstance('InterfaceValidator');
  }

  static getInstance(): InterfaceValidator {
    if (!InterfaceValidator.instance) {
      InterfaceValidator.instance = new InterfaceValidator();
    }
    return InterfaceValidator.instance;
  }

  /**
   * Register a schema for validation
   */
  registerSchema(name: string, schema: InterfaceSchema): void {
    this.schemas.set(name, schema);
    StructuredLogger.debug('Schema registered', { context: { name, keys: Object.keys(schema }) });
  }

  /**
   * Validate data against a registered schema
   */
  validate(schemaName: string, data: any): ValidationResult {
    const schema = this.schemas.get(schemaName);
    if (!schema) {
      return {
        isValid: false,
        errors: [{
          path: 'root',
          message: `Schema '${schemaName}' not found`,
          value: data,
          expected: 'registered schema',
          actual: 'undefined'
        }],
        warnings: []
      };
    }

    return this.validateAgainstSchema(data, schema, 'root');
  }

  /**
   * Validate data against a schema object
   */
  validateAgainstSchema(data: any, schema: InterfaceSchema, path: string = 'root'): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check if data is an object
    if (!TypeGuards.isObject(data: any)) {
      errors.push({
        path,
        message: 'Expected object',
        value: data,
        expected: 'object',
        actual: typeof data
      });
      return { isValid: false, errors, warnings };
    }

    // Validate each property in the schema
    for (const [key, rule] of Object.entries(schema)) {
      const currentPath = path === 'root' ? key : `${path}.${key}`;
      const value = data[key];

      if (TypeGuards.isObject(rule) && !('type' in rule)) {
        // Nested schema
        if (TypeGuards.isObject(value: any)) {
          const nestedResult = this.validateAgainstSchema(value, rule as InterfaceSchema, currentPath);
          errors.push(...(nestedResult.errors ?? []));
          warnings.push(...nestedResult.warnings);
        } else {
          errors.push({
            path: currentPath,
            message: 'Expected object for nested schema',
            value,
            expected: 'object',
            actual: typeof value
          });
        }
      } else {
        // Validation rule
        const validationRule = rule as ValidationRule;
        const result = this.validateProperty(value, validationRule, currentPath);
        if (!result.isValid) {
          errors.push(...(result.errors ?? []));
        }
        if (result.warnings.length > 0) {
          warnings.push(...result.warnings);
        }
      }
    }

    // Check for extra properties not in schema
    const schemaKeys = Object.keys(schema);
    const dataKeys = Object.keys(data: any);
    const extraKeys = dataKeys.filter((key: any) => !schemaKeys.includes(key));
    
    if (extraKeys.length > 0) {
      warnings.push({
        path,
        message: `Extra properties found: ${extraKeys.join(', ')}`,
        value: extraKeys,
        suggestion: 'Consider adding these properties to the schema or removing them from the data'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      data: errors.length === 0 ? data : undefined
    };
  }

  /**
   * Validate a single property against a rule
   */
  private validateProperty(value: any, rule: ValidationRule, path: string): { isValid: boolean; errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check for null/undefined
    if (value === null) {
      if (rule.allowNull) {
        return { isValid: true, errors, warnings };
      } else {
        errors.push({
          path,
          message: 'Value cannot be null',
          value,
          expected: rule.type,
          actual: 'null'
        });
        return { isValid: false, errors, warnings };
      }
    }

    if (value === undefined) {
      if (rule.allowUndefined) {
        return { isValid: true, errors, warnings };
      } else if (rule.required) {
        errors.push({
          path,
          message: 'Required property is undefined',
          value,
          expected: rule.type,
          actual: 'undefined'
        });
        return { isValid: false, errors, warnings };
      } else {
        return { isValid: true, errors, warnings };
      }
    }

    // Type validation
    switch (rule.type) {
      case 'string':
        if (!TypeGuards.isString(value: any)) {
          errors.push({
            path,
            message: rule.errorMessage || 'Expected string',
            value,
            expected: 'string',
            actual: typeof value
          });
          return { isValid: false, errors, warnings };
        }

        // String-specific validations
        if (rule.minLength !== undefined && value.length < rule.minLength) {
          errors.push({
            path,
            message: `String length must be at least ${rule.minLength}`,
            value,
            expected: `string with length >= ${rule.minLength}`,
            actual: `string with length ${value.length}`
          });
        }

        if (rule.maxLength !== undefined && value.length > rule.maxLength) {
          errors.push({
            path,
            message: `String length must be at most ${rule.maxLength}`,
            value,
            expected: `string with length <= ${rule.maxLength}`,
            actual: `string with length ${value.length}`
          });
        }

        if (rule.pattern && !rule.pattern.test(value: any)) {
          errors.push({
            path,
            message: `String does not match required pattern`,
            value,
            expected: `string matching ${rule.pattern}`,
            actual: value
          });
        }

        if (rule.enum && !rule.enum.includes(value: any)) {
          errors.push({
            path,
            message: `String must be one of: ${rule.enum.join(', ')}`,
            value,
            expected: `one of ${rule.enum.join(', ')}`,
            actual: value
          });
        }
        break;

      case 'number':
        if (!TypeGuards.isNumber(value: any)) {
          errors.push({
            path,
            message: rule.errorMessage || 'Expected number',
            value,
            expected: 'number',
            actual: typeof value
          });
          return { isValid: false, errors, warnings };
        }

        // Number-specific validations
        if (rule.min !== undefined && value < rule.min) {
          errors.push({
            path,
            message: `Number must be at least ${rule.min}`,
            value,
            expected: `number >= ${rule.min}`,
            actual: value
          });
        }

        if (rule.max !== undefined && value > rule.max) {
          errors.push({
            path,
            message: `Number must be at most ${rule.max}`,
            value,
            expected: `number <= ${rule.max}`,
            actual: value
          });
        }

        if (rule.enum && !rule.enum.includes(value: any)) {
          errors.push({
            path,
            message: `Number must be one of: ${rule.enum.join(', ')}`,
            value,
            expected: `one of ${rule.enum.join(', ')}`,
            actual: value
          });
        }
        break;

      case 'boolean':
        if (!TypeGuards.isBoolean(value: any)) {
          errors.push({
            path,
            message: rule.errorMessage || 'Expected boolean',
            value,
            expected: 'boolean',
            actual: typeof value
          });
          return { isValid: false, errors, warnings };
        }
        break;

      case 'array':
        if (!TypeGuards.isArray(value: any)) {
          errors.push({
            path,
            message: rule.errorMessage || 'Expected array',
            value,
            expected: 'array',
            actual: typeof value
          });
          return { isValid: false, errors, warnings };
        }

        // Array-specific validations
        if (rule.minLength !== undefined && value.length < rule.minLength) {
          errors.push({
            path,
            message: `Array length must be at least ${rule.minLength}`,
            value,
            expected: `array with length >= ${rule.minLength}`,
            actual: `array with length ${value.length}`
          });
        }

        if (rule.maxLength !== undefined && value.length > rule.maxLength) {
          errors.push({
            path,
            message: `Array length must be at most ${rule.maxLength}`,
            value,
            expected: `array with length <= ${rule.maxLength}`,
            actual: `array with length ${value.length}`
          });
        }
        break;

      case 'object':
        if (!TypeGuards.isObject(value: any)) {
          errors.push({
            path,
            message: rule.errorMessage || 'Expected object',
            value,
            expected: 'object',
            actual: typeof value
          });
          return { isValid: false, errors, warnings };
        }
        break;

      case 'date':
        if (!TypeGuards.isDate(value: any)) {
          errors.push({
            path,
            message: rule.errorMessage || 'Expected date',
            value,
            expected: 'date',
            actual: typeof value
          });
          return { isValid: false, errors, warnings };
        }
        break;

      case 'custom':
        if (rule.customValidator && !rule.customValidator(value: any)) {
          errors.push({
            path,
            message: rule.errorMessage || 'Custom validation failed',
            value,
            expected: 'custom validation',
            actual: value
          });
          return { isValid: false, errors, warnings };
        }
        break;
    }

    // Custom validator
    if (rule.customValidator && !rule.customValidator(value: any)) {
      errors.push({
        path,
        message: rule.errorMessage || 'Custom validation failed',
        value,
        expected: 'custom validation',
        actual: value
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Create a type-safe validator function
   */
  createValidator<T extends object>(schemaName: string): (data: any) => data is T {
    return (data: any): data is T => {
      const result = this.validate(schemaName, data);
      return result.isValid;
    };
  }

  /**
   * Get all registered schemas
   */
  getSchemas(): string[] {
    return Array.from(this.schemas.keys());
  }

  /**
   * Get a specific schema
   */
  getSchema(name: string): InterfaceSchema | undefined {
    return this.schemas.get(name);
  }

  /**
   * Clear all schemas
   */
  clearSchemas(): void {
    this.schemas.clear();
    StructuredLogger.debug('All schemas cleared');
  }
}

// Export singleton instance
export const interfaceValidator = InterfaceValidator.getInstance();
export default interfaceValidator;