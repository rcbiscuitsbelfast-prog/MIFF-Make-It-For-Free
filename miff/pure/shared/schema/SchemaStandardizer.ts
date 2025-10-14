import { StructuredLogger } from '../logging/StructuredLogger';
import { SafeJSONParser } from '../security/SafeJSONParser';

/**
 * Schema Standardizer - Ensures consistent schemas across all MIFF modules
 * Addresses schema drift and provides validation and migration capabilities
 */

export interface SchemaDefinition {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  id: string;
  name: string;
  version: string;
  module: string;
  fields: SchemaField[];
  required: string[];
  validation: SchemaValidation;
  migration?: SchemaMigration;
}

export interface SchemaField {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date';
  required: boolean;
  defaultValue?: any;
  validation?: FieldValidation;
  description?: string;
}

export interface FieldValidation {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: any[];
  custom?: (value: any) => boolean;
}

export interface SchemaValidation {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  strict: boolean;
  allowAdditional: boolean;
  customValidators: Array<(data: any) => boolean>;
}

export interface SchemaMigration {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  fromVersion: string;
  toVersion: string;
  steps: MigrationStep[];
}

export interface MigrationStep {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  type: 'add' | 'remove' | 'rename' | 'transform';
  field: string;
  value?: any;
  transform?: (value: any) => any;
}

export interface SchemaValidationResult {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export class SchemaStandardizer {
  
  private schemas: Map<string, SchemaDefinition> = new Map();
  private isInitialized: boolean = false;

  constructor(...args: any[]) {
    
  }

  /**
   * Initialize the schema standardizer
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('Schema standardizer already initialized');
      return;
    }

    try {
      console.info('Initializing schema standardizer...');
      
      // Load standard schemas
      await this.loadStandardSchemas();
      
      // Validate existing schemas
      await this.validateExistingSchemas();
      
      this.isInitialized = true;
      console.info('Schema standardizer initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize schema standardizer', { error: error.message });
      throw error;
    }
  }

  /**
   * Register a schema definition
   */
  registerSchema(): void {
    this.schemas.set(schema.id, schema);
    console.info('Schema registered', { schemaId: schema.id, module: schema.module });
  }

  /**
   * Validate data against a schema
   */
  validateData(): SchemaValidationResult {
    const schema = this.schemas.get(schemaId);
    if (!schema) {
      return {
        valid: false,
        errors: [`Schema ${schemaId} not found`],
        warnings: [],
        suggestions: []
      };
    }

    const result: SchemaValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Validate required fields
    for (const fieldName of schema.required) {
      if (!(fieldName in data)) {
        result.valid = false;
        result.errors.push(`Required field '${fieldName}' is missing`);
      }
    }

    // Validate field types and constraints
    for (const field of schema.fields) {
      if (field.name in data) {
        const fieldResult = this.validateField(data[field.name], field);
        if (!fieldResult.valid) {
          result.valid = false;
          result.errors.push(...fieldResult.errors);
        }
        result.warnings.push(...fieldResult.warnings);
      }
    }

    // Run custom validators
    for (const validator of schema.validation.customValidators) {
      try {
        if (!validator(data)) {
          result.valid = false;
          result.errors.push('Custom validation failed');
        }
      } catch (error) {
        result.valid = false;
        result.errors.push(`Custom validation error: ${error.message}`);
      }
    }

    // Check for additional fields if strict mode
    if (schema.validation.strict && !schema.validation.allowAdditional) {
      const allowedFields = new Set(schema.fields.map(f => f.name));
      for (const key in data) {
        if (!allowedFields.has(key)) {
          result.warnings.push(`Unexpected field '${key}' found`);
        }
      }
    }

    return result;
  }

  /**
   * Migrate data to a new schema version
   */
  async migrateData(data: any, fromSchemaId: string, toSchemaId: string): Promise<any> {
    const fromSchema = this.schemas.get(fromSchemaId);
    const toSchema = this.schemas.get(toSchemaId);

    if (!fromSchema || !toSchema) {
      throw new Error(`Schema not found: ${fromSchemaId} or ${toSchemaId}`);
    }

    if (!toSchema.migration) {
      console.warn('No migration defined', { fromSchemaId, toSchemaId });
      return data;
    }

    let migratedData = { ...data };

    for (const step of toSchema.migration.steps) {
      migratedData = this.applyMigrationStep(migratedData, step);
    }

    console.info('Data migrated successfully', { fromSchemaId, toSchemaId });
    return migratedData;
  }

  /**
   * Standardize data across modules
   */
  standardizeData(): any {
    const moduleSchemas = Array.from(this.schemas.values())
      .filter(schema => schema.module === module);

    if (moduleSchemas.length === 0) {
      console.warn('No schemas found for module', { module });
      return data;
    }

    // Use the latest schema for standardization
    const latestSchema = moduleSchemas.sort((a, b) => 
      b.version.localeCompare(a.version)
    )[0];

    return this.applySchemaDefaults(data, latestSchema);
  }

  /**
   * Get schema drift report
   */
  getSchemaDriftReport(): {
    modules: string[];
    driftIssues: Array<{
      module: string;
      issue: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      suggestion: string;
    }>;
  } {
    const modules = new Set<string>();
    const driftIssues: Array<{
      module: string;
      issue: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      suggestion: string;
    }> = [];

    // Collect all modules
    for (const schema of this.schemas.values()) {
      modules.add(schema.module);
    }

    // Check for schema inconsistencies
    for (const module of modules) {
      const moduleSchemas = Array.from(this.schemas.values())
        .filter(schema => schema.module === module);

      if (moduleSchemas.length > 1) {
        // Check for version inconsistencies
        const versions = moduleSchemas.map(s => s.version);
        const uniqueVersions = new Set(versions);
        
        if (uniqueVersions.size > 1) {
          driftIssues.push({
            module,
            issue: `Multiple schema versions found: ${Array.from(uniqueVersions).join(', ')}`,
            severity: 'high',
            suggestion: 'Consolidate to single schema version'
          });
        }

        // Check for field inconsistencies
        const fieldSets = moduleSchemas.map(s => new Set(s.fields.map(f => f.name)));
        const commonFields = fieldSets.reduce((acc, fields) => 
          new Set([...acc].filter(f => fields.has(f)))
        );

        if (commonFields.size === 0) {
          driftIssues.push({
            module,
            issue: 'No common fields found across schema versions',
            severity: 'critical',
            suggestion: 'Review and align schema definitions'
          });
        }
      }
    }

    return {
      modules: Array.from(modules),
      driftIssues
    };
  }

  /**
   * Validate a single field
   */
  private validateField(value: any, field: SchemaField): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const result = {
      valid: true,
      errors: [] as string[],
      warnings: [] as string[]
    };

    // Type validation
    if (!this.isValidType(value, field.type)) {
      result.valid = false;
      result.errors.push(`Field '${field.name}' must be of type ${field.type}`);
      return result;
    }

    // Custom validation
    if (field.validation) {
      const fieldResult = this.validateFieldConstraints(value, field.validation);
      if (!fieldResult.valid) {
        result.valid = false;
        result.errors.push(...fieldResult.errors);
      }
      result.warnings.push(...fieldResult.warnings);
    }

    return result;
  }

  /**
   * Check if value matches expected type
   */
  private isValidType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      case 'date':
        return value instanceof Date || !isNaN(Date.parse(value));
      default:
        return false;
    }
  }

  /**
   * Validate field constraints
   */
  private validateFieldConstraints(value: any, validation: FieldValidation): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const result = {
      valid: true,
      errors: [] as string[],
      warnings: [] as string[]
    };

    if (validation.minLength && typeof value === 'string' && value.length < validation.minLength) {
      result.valid = false;
      result.errors.push(`String too short (minimum ${validation.minLength} characters)`);
    }

    if (validation.maxLength && typeof value === 'string' && value.length > validation.maxLength) {
      result.valid = false;
      result.errors.push(`String too long (maximum ${validation.maxLength} characters)`);
    }

    if (validation.min !== undefined && typeof value === 'number' && value < validation.min) {
      result.valid = false;
      result.errors.push(`Value too small (minimum ${validation.min})`);
    }

    if (validation.max !== undefined && typeof value === 'number' && value > validation.max) {
      result.valid = false;
      result.errors.push(`Value too large (maximum ${validation.max})`);
    }

    if (validation.pattern && typeof value === 'string' && !new RegExp(validation.pattern).test(value)) {
      result.valid = false;
      result.errors.push(`Value does not match required pattern`);
    }

    if (validation.enum && !validation.enum.includes(value)) {
      result.valid = false;
      result.errors.push(`Value must be one of: ${validation.enum.join(', ')}`);
    }

    if (validation.custom) {
      try {
        if (!validation.custom(value)) {
          result.valid = false;
          result.errors.push('Custom validation failed');
        }
      } catch (error) {
        result.valid = false;
        result.errors.push(`Custom validation error: ${error.message}`);
      }
    }

    return result;
  }

  /**
   * Apply migration step
   */
  private applyMigrationStep(data: any, step: MigrationStep): any {
    switch (step.type) {
      case 'add':
        if (step.value !== undefined) {
          data[step.field] = step.value;
        }
        break;
      case 'remove':
        delete data[step.field];
        break;
      case 'rename':
        if (step.field in data) {
          data[step.value] = data[step.field];
          delete data[step.field];
        }
        break;
      case 'transform':
        if (step.field in data && step.transform) {
          data[step.field] = step.transform(data[step.field]);
        }
        break;
    }
    return data;
  }

  /**
   * Apply schema defaults
   */
  private applySchemaDefaults(data: any, schema: SchemaDefinition): any {
    const result = { ...data };

    for (const field of schema.fields) {
      if (!(field.name in result) && field.defaultValue !== undefined) {
        result[field.name] = field.defaultValue;
      }
    }

    return result;
  }

  /**
   * Load standard schemas
   */
  private async loadStandardSchemas(): Promise<void> {
    // Define standard schemas for common modules
    const standardSchemas: SchemaDefinition[] = [
      {
        id: 'bridge-schema-v1',
        name: 'Bridge Schema',
        version: '1.0.0',
        module: 'BridgeSchemaPure',
        fields: [
          { name: 'id', type: 'string', required: true },
          { name: 'name', type: 'string', required: true },
          { name: 'version', type: 'string', required: true },
          { name: 'enabled', type: 'boolean', required: true, defaultValue: true },
          { name: 'config', type: 'object', required: false, defaultValue: {} }
        ],
        required: ['id', 'name', 'version', 'enabled'],
        validation: {
          strict: true,
          allowAdditional: false,
          customValidators: []
        }
      },
      {
        id: 'shared-schema-v1',
        name: 'Shared Schema',
        version: '1.0.0',
        module: 'SharedSchemaPure',
        fields: [
          { name: 'id', type: 'string', required: true },
          { name: 'type', type: 'string', required: true },
          { name: 'data', type: 'object', required: true },
          { name: 'metadata', type: 'object', required: false, defaultValue: {} }
        ],
        required: ['id', 'type', 'data'],
        validation: {
          strict: true,
          allowAdditional: false,
          customValidators: []
        }
      },
      {
        id: 'avatar-schema-v1',
        name: 'Avatar Schema',
        version: '1.0.0',
        module: 'AvatarSystemPure',
        fields: [
          { name: 'id', type: 'string', required: true },
          { name: 'name', type: 'string', required: true },
          { name: 'appearance', type: 'object', required: true },
          { name: 'stats', type: 'object', required: false, defaultValue: {} }
        ],
        required: ['id', 'name', 'appearance'],
        validation: {
          strict: true,
          allowAdditional: false,
          customValidators: []
        }
      }
    ];

    for (const schema of standardSchemas) {
      this.registerSchema(schema);
    }
  }

  /**
   * Validate existing schemas
   */
  private async validateExistingSchemas(): Promise<void> {
    const driftReport = this.getSchemaDriftReport();
    
    if (driftReport.driftIssues.length > 0) {
      console.warn('Schema drift detected', { 
        issueCount: driftReport.driftIssues.length,
        issues: driftReport.driftIssues
      });
    }
  }

  /**
   * Destroy the schema standardizer
   */
  async destroy(): Promise<void> {
    console.info('Destroying schema standardizer...');
    
    this.schemas.clear();
    this.isInitialized = false;
    
    console.info('Schema standardizer destroyed');
  }
}

// Export default instance
export const schemaStandardizer = new SchemaStandardizer();
export default schemaStandardizer;