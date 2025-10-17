/**
 * BridgeSchemaPure - Bridge Schema System
 * 
 * This module provides functionality for validating, generating, and converting
 * bridge schemas for different game engines and platforms.
 * 
 * @module BridgeSchemaPure
 * @version 1.0.0
 * @license MIT
 */

export interface BridgeSchemaConfig {
  version: string;
  strict: boolean;
  validateReferences: boolean;
}

export interface SchemaValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class BridgeSchema {
  private config: BridgeSchemaConfig;

  constructor(config?: Partial<BridgeSchemaConfig>) {
    this.config = {
      version: '1.0.0',
      strict: true,
      validateReferences: true,
      ...config
    };
  }

  validate(schema: Record<string, unknown>, config: BridgeSchemaConfig) {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic schema validation
    if (!schema || typeof schema !== 'object') {
      errors.push('Schema must be an object');
    }

    if (config.strict && !schema.version) {
      errors.push('Schema version is required in strict mode');
    }

    if (config.validateReferences) {
      // Check for broken references
      const refs = this.findReferences(schema);
      for (const ref of refs) {
        if (!this.validateReference(ref, schema)) {
          errors.push(`Invalid reference: ${ref}`);
        }
      }
    }

    return {
      op: 'validate',
      status: errors.length === 0 ? 'ok' : 'error',
      result: {
        valid: errors.length === 0,
        errors,
        warnings,
        schema
      }
    };
  }

  generate(data: Record<string, unknown>, config: BridgeSchemaConfig) {
    return {
      op: 'generate',
      status: 'ok',
      result: {
        schema: {
          version: config.version,
          type: 'bridge_schema',
          data: data,
          generated: Date.now()
        }
      }
    };
  }

  convert(data: Record<string, unknown>, config: BridgeSchemaConfig) {
    return {
      op: 'convert',
      status: 'ok',
      result: {
        converted: {
          from: 'input_data',
          to: 'bridge_schema',
          data: data,
          version: config.version
        }
      }
    };
  }

  private findReferences(obj): string[] {
    const refs: string[] = [];
    
    if (typeof obj === 'string' && obj.startsWith('ref:')) {
      refs.push(obj);
    } else if (typeof obj === 'object' && obj !== null) {
      for (const value of Object.values(obj)) {
        refs.push(...this.findReferences(value));
      }
    }
    
    return refs;
  }

  private validateReference(ref: string, schema: Record<string, unknown>): boolean {
    // Simple reference validation - in a real implementation,
    // this would check against the actual schema structure
    return ref.startsWith('ref:') && ref.length > 4;
  }
}