/**
 * BridgeSchemaPure Manager
 * 
 * Manages bridge schemas for cross-engine compatibility, validation,
 * and conversion between different game engine formats.
 */

import { BridgeSchema, BridgeSchemaConfig, SchemaValidationResult } from './index';

export interface SchemaDefinition {
  id: string;
  name: string;
  version: string;
  engine: 'unity' | 'godot' | 'web' | 'universal';
  schema: Record<string, any>;
  metadata?: {
    description?: string;
    author?: string;
    created?: string;
    tags?: string[];
    compatibility?: string[];
  };
}

export interface ConversionRule {
  id: string;
  name: string;
  fromEngine: string;
  toEngine: string;
  mappings: Record<string, string>;
  transformations?: Record<string, (value: any) => any>;
}

export interface SchemaRegistry {
  schemas: Map<string, SchemaDefinition>;
  conversions: Map<string, ConversionRule>;
  validationCache: Map<string, SchemaValidationResult>;
}

export interface SchemaStats {
  totalSchemas: number;
  schemasByEngine: Record<string, number>;
  totalConversions: number;
  validationCacheSize: number;
  mostUsedSchemas: Array<{ id: string; usage: number }>;
}

export class BridgeSchemaManager {
  private registry: SchemaRegistry;
  private bridge: BridgeSchema;
  private config: BridgeSchemaConfig;

  constructor(config?: Partial<BridgeSchemaConfig>) {
    this.config = {
      version: '1.0.0',
      strict: true,
      validateReferences: true,
      ...config
    };
    
    this.bridge = new BridgeSchema(this.config);
    this.registry = {
      schemas: new Map(),
      conversions: new Map(),
      validationCache: new Map()
    };

    this.initializeDefaultSchemas();
  }

  private initializeDefaultSchemas() {
    // Unity Bridge Schema
    const unitySchema: SchemaDefinition = {
      id: 'unity-bridge-v1',
      name: 'Unity Bridge Schema',
      version: '1.0.0',
      engine: 'unity',
      schema: {
        $schema: 'miff.bridge.unity.v1',
        type: 'object',
        properties: {
          gameObject: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              transform: {
                type: 'object',
                properties: {
                  position: { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 3 },
                  rotation: { type: 'array', items: { type: 'number' }, minItems: 4, maxItems: 4 },
                  scale: { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 3 }
                },
                required: ['position', 'rotation', 'scale']
              },
              components: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string' },
                    properties: { type: 'object' }
                  }
                }
              }
            },
            required: ['name', 'transform']
          }
        },
        required: ['gameObject']
      },
      metadata: {
        description: 'Standard Unity bridge schema for game objects',
        author: 'MIFF Framework',
        created: new Date().toISOString(),
        tags: ['unity', 'bridge', 'gameobject'],
        compatibility: ['unity-2021.3', 'unity-2022.3', 'unity-2023.3']
      }
    };

    // Web Bridge Schema
    const webSchema: SchemaDefinition = {
      id: 'web-bridge-v1',
      name: 'Web Bridge Schema',
      version: '1.0.0',
      engine: 'web',
      schema: {
        $schema: 'miff.bridge.web.v1',
        type: 'object',
        properties: {
          element: {
            type: 'object',
            properties: {
              tag: { type: 'string' },
              id: { type: 'string' },
              className: { type: 'string' },
              style: {
                type: 'object',
                properties: {
                  position: { type: 'string', enum: ['absolute', 'relative', 'fixed'] },
                  left: { type: 'string' },
                  top: { type: 'string' },
                  width: { type: 'string' },
                  height: { type: 'string' },
                  transform: { type: 'string' }
                }
              },
              attributes: { type: 'object' },
              children: {
                type: 'array',
                items: { $ref: '#/properties/element' }
              }
            },
            required: ['tag']
          }
        },
        required: ['element']
      },
      metadata: {
        description: 'Standard Web/HTML bridge schema for DOM elements',
        author: 'MIFF Framework',
        created: new Date().toISOString(),
        tags: ['web', 'bridge', 'dom', 'html'],
        compatibility: ['chrome', 'firefox', 'safari', 'edge']
      }
    };

    // Godot Bridge Schema
    const godotSchema: SchemaDefinition = {
      id: 'godot-bridge-v1',
      name: 'Godot Bridge Schema',
      version: '1.0.0',
      engine: 'godot',
      schema: {
        $schema: 'miff.bridge.godot.v1',
        type: 'object',
        properties: {
          node: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              type: { type: 'string' },
              position: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 3 },
              rotation: { type: 'number' },
              scale: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 3 },
              properties: { type: 'object' },
              children: {
                type: 'array',
                items: { $ref: '#/properties/node' }
              }
            },
            required: ['name', 'type']
          }
        },
        required: ['node']
      },
      metadata: {
        description: 'Standard Godot bridge schema for nodes',
        author: 'MIFF Framework',
        created: new Date().toISOString(),
        tags: ['godot', 'bridge', 'node'],
        compatibility: ['godot-4.0', 'godot-4.1', 'godot-4.2']
      }
    };

    // Add schemas to registry
    this.registry.schemas.set(unitySchema.id, unitySchema);
    this.registry.schemas.set(webSchema.id, webSchema);
    this.registry.schemas.set(godotSchema.id, godotSchema);

    // Add conversion rules
    this.addConversionRule({
      id: 'unity-to-web',
      name: 'Unity to Web Conversion',
      fromEngine: 'unity',
      toEngine: 'web',
      mappings: {
        'gameObject.name': 'element.id',
        'gameObject.transform.position': 'element.style.transform',
        'gameObject.components': 'element.attributes'
      },
      transformations: {
        position: (pos: number[]) => `translate3d(${pos[0]}px, ${pos[1]}px, ${pos[2]}px)`,
        rotation: (rot: number[]) => `rotate(${rot[1]}rad)` // Simplified rotation
      }
    });

    this.addConversionRule({
      id: 'web-to-godot',
      name: 'Web to Godot Conversion',
      fromEngine: 'web',
      toEngine: 'godot',
      mappings: {
        'element.id': 'node.name',
        'element.tag': 'node.type',
        'element.style.left': 'node.position[0]',
        'element.style.top': 'node.position[1]'
      },
      transformations: {
        position: (styleValue: string) => parseFloat(styleValue.replace('px', '')) || 0
      }
    });
  }

  /**
   * Add schema definition to registry
   */
  addSchema(schema: SchemaDefinition): { ok: boolean; errors?: string[] } {
    try {
      if (this.registry.schemas.has(schema.id)) {
        return { ok: false, errors: [`Schema ${schema.id} already exists`] };
      }

      // Validate schema structure
      const validation = this.validateSchemaDefinition(schema);
      if (!validation.valid) {
        return { ok: false, errors: validation.errors };
      }

      this.registry.schemas.set(schema.id, schema);
      return { ok: true };
    } catch (error) {
      return { ok: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  /**
   * Get schema by ID
   */
  getSchema(id: string): { ok: boolean; schema?: SchemaDefinition; errors?: string[] } {
    const schema = this.registry.schemas.get(id);
    if (!schema) {
      return { ok: false, errors: [`Schema ${id} not found`] };
    }
    return { ok: true, schema };
  }

  /**
   * List all schemas
   */
  listSchemas(engine?: string): { ok: boolean; schemas: SchemaDefinition[]; total: number } {
    let schemas = Array.from(this.registry.schemas.values());
    
    if (engine) {
      schemas = schemas.filter(s => s.engine === engine);
    }

    return { ok: true, schemas, total: schemas.length };
  }

  /**
   * Validate data against schema
   */
  validateAgainstSchema(schemaId: string, data: any): { ok: boolean; result?: SchemaValidationResult; errors?: string[] } {
    const schemaResult = this.getSchema(schemaId);
    if (!schemaResult.ok || !schemaResult.schema) {
      return { ok: false, errors: schemaResult.errors };
    }

    const cacheKey = `${schemaId}:${JSON.stringify(data).substring(0, 100)}`;
    const cached = this.registry.validationCache.get(cacheKey);
    if (cached) {
      return { ok: true, result: cached };
    }

    try {
      const validation = this.validateAgainstJSONSchema(data, schemaResult.schema.schema);
      this.registry.validationCache.set(cacheKey, validation);
      return { ok: true, result: validation };
    } catch (error) {
      return { ok: false, errors: [error instanceof Error ? error.message : 'Validation error'] };
    }
  }

  /**
   * Add conversion rule
   */
  addConversionRule(rule: ConversionRule): { ok: boolean; errors?: string[] } {
    try {
      if (this.registry.conversions.has(rule.id)) {
        return { ok: false, errors: [`Conversion rule ${rule.id} already exists`] };
      }

      this.registry.conversions.set(rule.id, rule);
      return { ok: true };
    } catch (error) {
      return { ok: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  /**
   * Convert data between engines
   */
  convert(data: any, fromEngine: string, toEngine: string): { ok: boolean; result?: any; errors?: string[] } {
    try {
      // Find conversion rule
      const rule = Array.from(this.registry.conversions.values())
        .find(r => r.fromEngine === fromEngine && r.toEngine === toEngine);

      if (!rule) {
        return { ok: false, errors: [`No conversion rule found from ${fromEngine} to ${toEngine}`] };
      }

      const converted = this.applyConversionRule(data, rule);
      return { ok: true, result: converted };
    } catch (error) {
      return { ok: false, errors: [error instanceof Error ? error.message : 'Conversion error'] };
    }
  }

  /**
   * Generate schema from data
   */
  generateSchema(data: any, id: string, name: string, engine: string): { ok: boolean; schema?: SchemaDefinition; errors?: string[] } {
    try {
      const generatedSchema = this.inferSchemaFromData(data);
      
      const schemaDefinition: SchemaDefinition = {
        id,
        name,
        version: '1.0.0',
        engine: engine as any,
        schema: generatedSchema,
        metadata: {
          description: `Generated schema for ${name}`,
          author: 'MIFF Bridge Schema Generator',
          created: new Date().toISOString(),
          tags: ['generated', engine]
        }
      };

      return { ok: true, schema: schemaDefinition };
    } catch (error) {
      return { ok: false, errors: [error instanceof Error ? error.message : 'Schema generation error'] };
    }
  }

  /**
   * Get registry statistics
   */
  getStats(): SchemaStats {
    const schemas = Array.from(this.registry.schemas.values());
    const schemasByEngine: Record<string, number> = {};
    
    schemas.forEach(schema => {
      schemasByEngine[schema.engine] = (schemasByEngine[schema.engine] || 0) + 1;
    });

    // Mock usage data - in real implementation, this would be tracked
    const mostUsedSchemas = schemas.slice(0, 3).map(schema => ({
      id: schema.id,
      usage: Math.floor(Math.random() * 100) + 10
    }));

    return {
      totalSchemas: schemas.length,
      schemasByEngine,
      totalConversions: this.registry.conversions.size,
      validationCacheSize: this.registry.validationCache.size,
      mostUsedSchemas
    };
  }

  /**
   * Clear validation cache
   */
  clearCache(): { ok: boolean; cleared: number } {
    const cleared = this.registry.validationCache.size;
    this.registry.validationCache.clear();
    return { ok: true, cleared };
  }

  /**
   * Export schema registry
   */
  exportRegistry(format: 'full' | 'schemas-only' | 'conversions-only' = 'full'): { ok: boolean; data?: any; errors?: string[] } {
    try {
      const schemas = Array.from(this.registry.schemas.entries()).map(([id, schema]) => ({ id, ...schema }));
      const conversions = Array.from(this.registry.conversions.entries()).map(([id, rule]) => ({ id, ...rule }));

      switch (format) {
        case 'schemas-only':
          return { ok: true, data: { schemas } };
        case 'conversions-only':
          return { ok: true, data: { conversions } };
        default:
          return {
            ok: true,
            data: {
              version: this.config.version,
              schemas,
              conversions,
              exportedAt: new Date().toISOString()
            }
          };
      }
    } catch (error) {
      return { ok: false, errors: [error instanceof Error ? error.message : 'Export error'] };
    }
  }

  /**
   * Private helper methods
   */
  private validateSchemaDefinition(schema: SchemaDefinition): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!schema.id || typeof schema.id !== 'string') {
      errors.push('Schema ID is required and must be a string');
    }

    if (!schema.name || typeof schema.name !== 'string') {
      errors.push('Schema name is required and must be a string');
    }

    if (!schema.version || typeof schema.version !== 'string') {
      errors.push('Schema version is required and must be a string');
    }

    if (!['unity', 'godot', 'web', 'universal'].includes(schema.engine)) {
      errors.push('Schema engine must be one of: unity, godot, web, universal');
    }

    if (!schema.schema || typeof schema.schema !== 'object') {
      errors.push('Schema definition is required and must be an object');
    }

    return { valid: errors.length === 0, errors };
  }

  private validateAgainstJSONSchema(data: any, schema: any): SchemaValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic JSON Schema validation (simplified)
    if (schema.type === 'object' && typeof data !== 'object') {
      errors.push(`Expected object, got ${typeof data}`);
    }

    if (schema.type === 'array' && !Array.isArray(data)) {
      errors.push(`Expected array, got ${typeof data}`);
    }

    if (schema.required && Array.isArray(schema.required)) {
      schema.required.forEach((prop: string) => {
        if (!(prop in data)) {
          errors.push(`Required property '${prop}' is missing`);
        }
      });
    }

    if (schema.properties && typeof data === 'object') {
      Object.keys(schema.properties).forEach(prop => {
        if (data[prop] !== undefined) {
          const propSchema = schema.properties[prop];
          const propResult = this.validateAgainstJSONSchema(data[prop], propSchema);
          errors.push(...propResult.errors.map(e => `${prop}.${e}`));
          warnings.push(...propResult.warnings.map(w => `${prop}.${w}`));
        }
      });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private applyConversionRule(data: any, rule: ConversionRule): any {
    const result: any = {};

    Object.entries(rule.mappings).forEach(([fromPath, toPath]) => {
      const value = this.getValueByPath(data, fromPath);
      if (value !== undefined) {
        // Apply transformation if available
        const transformKey = fromPath.split('.').pop();
        const transformation = rule.transformations?.[transformKey!];
        const transformedValue = transformation ? transformation(value) : value;
        
        this.setValueByPath(result, toPath, transformedValue);
      }
    });

    return result;
  }

  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setValueByPath(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!(key in current)) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  private inferSchemaFromData(data: any): any {
    if (data === null || data === undefined) {
      return { type: 'null' };
    }

    if (Array.isArray(data)) {
      const itemSchema = data.length > 0 ? this.inferSchemaFromData(data[0]) : { type: 'any' };
      return {
        type: 'array',
        items: itemSchema
      };
    }

    if (typeof data === 'object') {
      const properties: any = {};
      const required: string[] = [];

      Object.keys(data).forEach(key => {
        properties[key] = this.inferSchemaFromData(data[key]);
        if (data[key] !== null && data[key] !== undefined) {
          required.push(key);
        }
      });

      return {
        type: 'object',
        properties,
        required: required.length > 0 ? required : undefined
      };
    }

    return { type: typeof data };
  }
}