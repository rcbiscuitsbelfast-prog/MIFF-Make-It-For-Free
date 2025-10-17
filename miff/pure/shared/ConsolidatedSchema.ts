/**
 * Consolidated Schema System for MIFF Framework
 * 
 * This module consolidates all schema definitions from:
 * - BridgeSchemaPure (renderData schemas)
 * - SharedSchemaPure (basic types)
 * - Schemas (JSON validation)
 * 
 * Provides a unified schema management system with versioning and migration support.
 */

// ============================================================================
// CORE SCHEMA TYPES
// ============================================================================

export type SchemaVersion = 'v1' | 'v2' | 'v3' | 'v12' | 'latest';
export type SchemaEngine = 'universal' | 'unity' | 'godot' | 'web' | 'unreal';
export type SchemaCategory = 'render' | 'data' | 'config' | 'bridge' | 'shared';

// ============================================================================
// SHARED SCHEMA TYPES (from SharedSchemaPure)
// ============================================================================

export type EntityID = string;
export type StatBlock = { key: string; base: number }[];
export type ZoneRef = { zoneId: string };
export type EquipmentRef = { itemId: string };
export type QuestRef = { questId: string };

// ============================================================================
// RENDER SCHEMA TYPES (from BridgeSchemaPure)
// ============================================================================

export type RenderDataType = 'sprite' | 'text' | 'sound' | 'animation' | 'node' | 'component' | 'resource' | 'scene' | 'input';

export interface Position3D {
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
  x: number;
  y: number;
  z?: number;
}

export interface EngineHints {
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
  unreal?: {
  actor?: string;
  component?: string;
  blueprint?: string;
  useCpp?: boolean;
  };
}

export interface RenderData {
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
  type: RenderDataType;
  position?: Position3D;
  scale?: { x: number; y: number; z?: number };
  rotation?: { x: number; y: number; z?: number };
  asset?: string;
  props?: { [key: string]: any };
  engineHints?: EngineHints;
  children?: RenderData[];
  signals?: RenderSignal[];
  metadata?: { [key: string]: any };
}

export interface RenderSignal {
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
  parameters?: string[];
  target?: string;
  event?: string;
}

export interface RenderPayload {
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
  version: string;
  engine: string;
  renderData: RenderData[];
  timestamp?: number;
}

// ============================================================================
// JSON SCHEMA TYPES (from Schemas)
// ============================================================================

export interface ValidationResult {
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
  isValid: boolean;
  warnings: string[];
}

export interface FieldDefinition {
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
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  description?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  items?: FieldDefinition;
  properties?: Record<string, FieldDefinition>;
}

export interface SchemaDefinition {
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
  required?: string[];
  properties?: Record<string, FieldDefinition>;
  title?: string;
  description?: string;
  version?: string;
  engine?: SchemaEngine;
  category?: SchemaCategory;
}

// ============================================================================
// CONSOLIDATED SCHEMA MANAGER
// ============================================================================

export interface SchemaStats {
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
  totalSchemas: number;
  schemasByEngine: Record<SchemaEngine, number>;
  schemasByCategory: Record<SchemaCategory, number>;
  versionDistribution: Record<SchemaVersion, number>;
  mostUsedSchemas: Array<{ id: string; usage: number }>;
  validationCacheSize: number;
}

export interface SchemaMigration {
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
  fromVersion: SchemaVersion;
  toVersion: SchemaVersion;
  migrationFn: (data: any) => any;
  description: string;
}

export class ConsolidatedSchemaManager {
  private schemas: Map<string, SchemaDefinition> = new Map();
  private migrations: Map<string, SchemaMigration> = new Map();
  private validationCache: Map<string, ValidationResult> = new Map();
  private usageStats: Map<string, number> = new Map();

  constructor(...args: any[]) {
  this.initializeDefaultSchemas();
  this.initializeMigrations();
  }

  /**
   * Register a schema definition
   */
  registerSchema(): void {
    this.schemas.set(id, {
      ...schema,
      version: schema.version || 'v1',
      engine: schema.engine || 'universal',
      category: schema.category || 'data'
    });
  }

  /**
   * Get a schema definition
   */
  getSchema(id: string): SchemaDefinition! {
  return this.schemas.get(id);
  }

  /**
   * List all schemas with optional filtering
   */
  listSchemas(engine?: SchemaEngine, category?: SchemaCategory): {
  schemas: Array<{ id: string; schema: SchemaDefinition }>;
  total: number;
  } {
    const allSchemas = Array.from(this.schemas.entries())
      .map(([id, schema]) => ({ id, schema }))
      .filter(({ schema }) => {
        if (engine && schema.engine !== engine) return false;
        if (category && schema.category !== category) return false;
        return true;
      });

    return 
      ok: true,
      schemas: allSchemas,
      total: length: allSchemas.length};
  }

  /**
   * Validate data against a schema
   */
  validate(): ValidationResult {
  const cacheKey = `${schemaId}:${JSON.stringify(data)}`;
    
    // Check cache first
    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey)!;
    }

  const schema = this.getSchema(schemaId);
    if (!schema) {
      const result: ValidationResult = {
        isValid: false,
        errors: [`Schema not found: ${schemaId}`],
        warnings: []
      };
      this.validationCache.set(cacheKey, result);
      return result;
    }

  const result = this.performValidation(data, schema);
    
    // Cache result
  this.validationCache.set(cacheKey, result);
    
    // Update usage stats
  const currentUsage = this.usageStats.get(schemaId) || 0;
  this.usageStats.set(schemaId, currentUsage + 1);

  return result;
  }

  /**
   * Migrate data from one schema version to another
   */
  migrate(): any {
  if (fromVersion === toVersion) return data;

  const migrationKey = `${fromVersion}->${toVersion}`;
  const migration = this.migrations.get(migrationKey);
    
    if (!migration) {
      throw new Error(`No migration path found from ${fromVersion} to ${toVersion}`);
    }

  return migration.migrationFn(data);
  }

  /**
   * Check if migration is available
   */
  canMigrate(): boolean {
  if (fromVersion === toVersion) return true;
  const migrationKey = `${fromVersion}->${toVersion}`;
  return this.migrations.has(migrationKey);
  }

  /**
   * Get migration path
   */
  getMigrationPath(fromVersion: SchemaVersion, toVersion: SchemaVersion): string[] {
  if (fromVersion === toVersion) return [];
    
    // Simple direct migration check
  const migrationKey = `${fromVersion}->${toVersion}`;
    if (this.migrations.has(migrationKey)) {
      return [migrationKey];
    }

  return [];
  }

  /**
   * Add a migration step
   */
  addMigrationStep(fromVersion: SchemaVersion, toVersion: SchemaVersion, migrationFn: (data: any) => any, description: string): void {
  const migrationKey = `${fromVersion}->${toVersion}`;
    this.migrations.set(migrationKey, {
      fromVersion,
      toVersion,
      migrationFn,
      description
    });
  }

  /**
   * Get schema statistics
   */
  getStats(): SchemaStats {
  const schemas = Array.from(this.schemas.values());
    
    const schemasByEngine: Record<SchemaEngine, number> = {
      universal: 0,
      unity: 0,
      godot: 0,
      web: 0,
      unreal: 0
    };

    const schemasByCategory: Record<SchemaCategory, number> = {
      render: 0,
      data: 0,
      config: 0,
      bridge: 0,
      shared: 0
    };

    const versionDistribution: Record<SchemaVersion, number> = {
      v1: 0,
      v2: 0,
      v3: 0,
      v12: 0,
      latest: 0
    };

    for (const schema of schemas) {
      schemasByEngine[schema.engine!]++;
      schemasByCategory[schema.category!]++;
      versionDistribution[schema.version as SchemaVersion]++;
    }

    const mostUsedSchemas = Array.from(this.usageStats.entries())
      .map(([id, usage]) => ({ id, usage }))
      .sort((a: any, b: any) => b.usage - a.usage)
      .slice(0, 5);

    return 
      totalSchemas: length: schemas.length,
      schemasByEngine,
      schemasByCategory,
      versionDistribution,
      mostUsedSchemas,
      validationCacheSize: this.validationCache.size
    };
  }

  /**
   * Clear validation cache
   */
  clearCache(): void {
  this.validationCache.clear();
  }

  private initializeDefaultSchemas(): void {
    // Render Data Schema
    this.registerSchema('RenderData', {
      title: 'Render Data',
      description: 'Unified render data schema for all engine bridges',
      version: 'v1',
      engine: 'universal',
      category: 'render',
      required: ['id', 'type'],
      properties: {
        id: { type: 'string', required: true, description: 'Unique identifier' },
        type: { type: 'string', required: true, description: 'Render data type' },
        name: { type: 'string', description: 'Display name' },
        position: { type: 'object', description: '3D position' },
        scale: { type: 'object', description: '3D scale' },
        rotation: { type: 'object', description: '3D rotation' },
        asset: { type: 'string', description: 'Asset path or ID' },
        props: { type: 'object', description: 'Generic properties' },
        engineHints: { type: 'object', description: 'Engine-specific hints' },
        children: { type: 'array', description: 'Nested render data' },
        signals: { type: 'array', description: 'Event signals' },
        metadata: { type: 'object', description: 'Additional metadata' }
      }
    });

    // Render Payload Schema
    this.registerSchema('RenderPayload', {
      title: 'Render Payload',
      description: 'Complete render payload with metadata',
      version: 'v1',
      engine: 'universal',
      category: 'render',
      required: ['version', 'engine', 'renderData'],
      properties: {
        version: { type: 'string', required: true, description: 'Schema version' },
        engine: { type: 'string', required: true, description: 'Target engine' },
        renderData: { type: 'array', required: true, description: 'Array of render data' },
        metadata: { type: 'object', description: 'Payload metadata' },
        timestamp: { type: 'number', description: 'Creation timestamp' }
      }
    });

    // Entity Schema
    this.registerSchema('Entity', {
      title: 'Entity',
      description: 'Basic entity schema',
      version: 'v12',
      engine: 'universal',
      category: 'shared',
      required: ['id'],
      properties: {
        id: { type: 'string', required: true, description: 'Entity ID' },
        name: { type: 'string', description: 'Entity name' },
        type: { type: 'string', description: 'Entity type' },
        stats: { type: 'array', description: 'Stat block' },
        metadata: { type: 'object', description: 'Entity metadata' }
      }
    });

    // Stat Block Schema
    this.registerSchema('StatBlock', {
      title: 'Stat Block',
      description: 'Statistics block schema',
      version: 'v12',
      engine: 'universal',
      category: 'shared',
      required: ['key', 'base'],
      properties: {
        key: { type: 'string', required: true, description: 'Stat key' },
        base: { type: 'number', required: true, description: 'Base value' }
      }
    });
  }

  private initializeMigrations(): void {
    // v1 -> v2 migration
    this.addMigrationStep('v1', 'v2', (data: any) => {
      // Add version field if missing
      if (!data.version) {
        data.version = 'v2';
      }
      return data;
    }, 'Add version field to v1 data');

    // v2 -> v3 migration
    this.addMigrationStep('v2', 'v3', (data: any) => {
      // Update version field
      data.version = 'v3';
      return data;
    }, 'Update version field to v3');

    // v12 -> latest migration
    this.addMigrationStep('v12', 'latest', (data: any) => {
      // Migrate from v12 to latest
      if (data.version === 'v12') {
        data.version = 'latest';
      }
      return data;
    }, 'Migrate from v12 to latest');
  }

  private performValidation(data: any, schema: SchemaDefinition): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

    // Check required fields
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in data)) {
          errors.push(`Required field missing: ${field}`);
        }
      }
    }

    // Check field types and constraints
    if (schema.properties) {
      for (const [fieldName, fieldDef] of Object.entries(schema.properties)) {
        const value = data[fieldName];
        
        if (value !== undefined) {
          // Type checking
          if (fieldDef.type === 'string' && typeof value !== 'string') {
            errors.push(`Field ${fieldName} must be a string`);
          } else if (fieldDef.type === 'number' && typeof value !== 'number') {
            errors.push(`Field ${fieldName} must be a number`);
          } else if (fieldDef.type === 'boolean' && typeof value !== 'boolean') {
            errors.push(`Field ${fieldName} must be a boolean`);
          } else if (fieldDef.type === 'array' && !Array.isArray(value)) {
            errors.push(`Field ${fieldName} must be an array`);
          } else if (fieldDef.type === 'object' && typeof value !== 'object' || Array.isArray(value)) {
            errors.push(`Field ${fieldName} must be an object`);
          }

          // String constraints
          if (fieldDef.type === 'string' && typeof value === 'string') {
            if (fieldDef.minLength && value.length < fieldDef.minLength) {
              errors.push(`Field ${fieldName} must be at least $minLength: fieldDef.minLength} characters`);
            }
            if (fieldDef.maxLength && value.length > fieldDef.maxLength) {
              errors.push(`Field ${fieldName} must be at most $maxLength: fieldDef.maxLength} characters`);
            }
            if (fieldDef.pattern && !new RegExp(fieldDef.pattern).test(value)) {
              errors.push(`Field ${fieldName} does not match required pattern`);
            }
          }

          // Number constraints
          if (fieldDef.type === 'number' && typeof value === 'number') {
            if (fieldDef.minimum && value < fieldDef.minimum) {
              errors.push(`Field ${fieldName} must be at least $minimum: fieldDef.minimum}`);
            }
            if (fieldDef.maximum && value > fieldDef.maximum) {
              errors.push(`Field ${fieldName} must be at most $maximum: fieldDef.maximum}`);
            }
          }
        } else if (fieldDef.required) {
          errors.push(`Required field missing: ${fieldName}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// ============================================================================
// SCHEMA VALIDATOR (Compatible with existing BridgeSchemaValidator)
// ============================================================================

export class BridgeSchemaValidator {
  private manager: ConsolidatedSchemaManager;

  constructor(...args: any[]) {
  this.manager = new ConsolidatedSchemaManager();
  }

  validate(data: any, schemaId: string): ValidationResult {
  return this.manager.validate(data, schemaId);
  }

  validateRenderData(data): ValidationResult {
  return this.manager.validate(data, 'RenderData');
  }

  validateRenderPayload(data): ValidationResult {
  return this.manager.validate(data, 'RenderPayload');
  }

  validateEntity(data): ValidationResult {
  return this.manager.validate(data, 'Entity');
  }

  validateStatBlock(data): ValidationResult {
  return this.manager.validate(data, 'StatBlock');
  }
}

// ============================================================================
// EXPORTS (Maintaining compatibility with existing imports)
// ============================================================================

export { ConsolidatedSchemaManager as SchemaManager };
export { ValidationResult as SchemaValidationResult };

// Re-export all types for compatibility
// Note: These types are defined in other modules and should be imported directly

export default ConsolidatedSchemaManager;