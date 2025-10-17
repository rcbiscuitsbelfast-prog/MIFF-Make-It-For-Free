#!/usr/bin/env tsx

import { BridgeSchemaManager, SchemaDefinition, ConversionRule } from './Manager';
import { BridgeSchemaConfig } from './index';
import { exportDataToFormat, ExportFormat } from '../shared/exportUtils';
import * as fs from 'fs';
import * as path from 'path';

interface BridgeSchemaOperation {
  op: 'addSchema' | 'getSchema' | 'listSchemas' | 'validate' | 'convert' | 'generate' | 'addConversion' | 'stats' | 'export' | 'clearCache';
  schemaId?: string;
  engine?: string;
  data?: any;
  fromEngine?: string;
  toEngine?: string;
  id?: string;
  name?: string;
  format?: 'json' | 'csv' | 'markdown' | 'html' | 'yaml' | 'xml' | 'full' | 'schemas-only' | 'conversions-only';
  schema?: SchemaDefinition;
  rule?: ConversionRule;
  config?: BridgeSchemaConfig;
}

class BridgeSchemaCLI {
  private manager: BridgeSchemaManager;

  constructor() {
    this.manager = new BridgeSchemaManager({
      version: '1.0.0',
      strict: true,
      validateReferences: true
    });
  }

  async execute(operation: BridgeSchemaOperation): Promise<any> {
    try {
      switch (operation.op) {
        case 'addSchema':
          return this.addSchema(operation);
        
        case 'getSchema':
          return this.getSchema(operation);
        
        case 'listSchemas':
          return this.listSchemas(operation);
        
        case 'validate':
          return this.validateData(operation);
        
        case 'convert':
          return this.convertData(operation);
        
        case 'generate':
          return this.generateSchema(operation);
        
        case 'addConversion':
          return this.addConversion(operation);
        
        case 'stats':
          return this.getStats();
        
        case 'export':
          return this.exportRegistry(operation);
        
        case 'clearCache':
          return this.clearCache();
        
        default:
          throw new Error(`Unknown operation: ${operation.op}`);
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        op: operation.op,
        status: 'error',
        error: error instanceof Error ? message: 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  private addSchema(op: BridgeSchemaOperation): any {
    if (!op.schema) {
      throw new Error('Missing required field: schema');
    }

    const result = this.manager.addSchema(op.schema);

    return {
      op: 'addSchema',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        message: `Schema ${op.schema.id} added successfully`,
        engine: op.schema.engine,
        version: op.schema.version
      } : undefined,
      errors: result.errors,
      timestamp: new Date()
    };
  }

  private getSchema(op: BridgeSchemaOperation): any {
    if (!op.schemaId) {
      throw new Error('Missing required field: schemaId');
    }

    const result = this.manager.getSchema(op.schemaId);

    return {
      op: 'getSchema',
      status: result.ok ? 'ok' : 'error',
      result: result.schema,
      errors: result.errors,
      timestamp: new Date()
    };
  }

  private listSchemas(op: BridgeSchemaOperation): any {
    const result = this.manager.listSchemas(op.engine);

    return {
      op: 'listSchemas',
      status: 'ok',
      result: {
        schemas: result.schemas.map((schema: any) => ({
          id: schema.id,
          name: schema.name,
          version: schema.version,
          engine: schema.engine,
          description: schema.metadata?.description || 'No description',
          tags: schema.metadata?.tags || [],
          compatibility: schema.metadata?.compatibility || []
        })),
        total: result.total,
        engine: op.engine || 'all'
      },
      timestamp: new Date()
    };
  }

  private validateData(op: BridgeSchemaOperation): any {
    if (!op.schemaId || !op.data) {
      throw new Error('Missing required fields: schemaId, data');
    }

    const result = this.manager.validateAgainstSchema(op.schemaId, op.data);

    return {
      op: 'validate',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        validation: result.result,
        schemaId: op.schemaId,
        dataValid: result.result?.valid || false,
        errorCount: result.result?.errors.length || 0,
        warningCount: result.result?.warnings.length || 0
      } : undefined,
      errors: result.errors,
      timestamp: new Date()
    };
  }

  private convertData(op: BridgeSchemaOperation): any {
    if (!op.data || !op.fromEngine || !op.toEngine) {
      throw new Error('Missing required fields: data, fromEngine, toEngine');
    }

    const result = this.manager.convert(op.data, fromEngine: op.fromEngine, op.toEngine);

    return {
      op: 'convert',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        converted: result.result,
        conversion: {
          from: op.fromEngine,
          to: op.toEngine,
          timestamp: new Date()
        }
      } : undefined,
      errors: result.errors,
      timestamp: new Date()
    };
  }

  private generateSchema(op: BridgeSchemaOperation): any {
    if (!op.data || !op.id || !op.name || !op.engine) {
      throw new Error('Missing required fields: data, id, name, engine');
    }

    const result = this.manager.generateSchema(op.data, id: op.id, op.name, op.engine);

    return {
      op: 'generate',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        schema: result.schema,
        message: `Schema ${op.id} generated from data`,
        inferredProperties: Object.keys(result.schema?.schema.properties || {}).length
      } : undefined,
      errors: result.errors,
      timestamp: new Date()
    };
  }

  private addConversion(op: BridgeSchemaOperation): any {
    if (!op.rule) {
      throw new Error('Missing required field: rule');
    }

    const result = this.manager.addConversionRule(op.rule);

    return {
      op: 'addConversion',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        message: `Conversion rule ${op.rule.id} added successfully`,
        conversion: `${op.rule.fromEngine} → ${op.rule.toEngine}`,
        mappings: Object.keys(op.rule.mappings).length
      } : undefined,
      errors: result.errors,
      timestamp: new Date()
    };
  }

  private getStats(): any {
    const stats = this.manager.getStats();

    return {
      op: 'stats',
      status: 'ok',
      result: {
        stats,
        summary: {
          message: `${stats.totalSchemas} schemas, ${stats.totalConversions} conversions, ${stats.validationCacheSize} cached validations`,
          engines: Object.keys(stats.schemasByEngine).join(', '),
          topSchema: stats.mostUsedSchemas[0]?.id || 'none'
        }
      },
      timestamp: new Date()
    };
  }

  private exportRegistry(op: BridgeSchemaOperation): any {
    const format = op.format || 'full';
    
    // Handle special export formats
    if (['full', 'schemas-only', 'conversions-only'].includes(format)) {
      const result = this.manager.exportRegistry(format as any);
      return {
        op: 'export',
        status: result.ok ? 'ok' : 'error',
        result: result.data,
        format,
        errors: result.errors,
        timestamp: new Date()
      };
    }

    // Handle standard export formats
    const registryResult = this.manager.exportRegistry('full');
    if (!registryResult.ok) {
      return {
        op: 'export',
        status: 'error',
        errors: registryResult.errors,
        timestamp: new Date()
      };
    }

    const data = registryResult.data;

    switch (format) {
      case 'yaml': {
        const yaml = this.toYAML(data);
        return { op: 'export', status: 'ok', result: { yaml }, format: 'yaml', timestamp: new Date() };
      }
      case 'xml': {
        const xml = this.toXML(data, 'bridgeSchemaRegistry');
        return { op: 'export', status: 'ok', result: { xml }, format: 'xml', timestamp: new Date() };
      }
      case 'csv':
      case 'markdown':
      case 'html': {
        const exportData = exportDataToFormat(data, {
          format: format as ExportFormat,
          includeMetadata: true,
          includeTimestamp: true,
          title: 'Bridge Schema Registry',
          description: 'MIFF Bridge Schema Registry Export'
        });
        return { 
          op: 'export', 
          status: 'ok', 
          result: { [format]: exportData }, 
          format, 
          timestamp: new Date() 
        };
      }
      default:
        return {
          op: 'export',
          status: 'ok',
          result: data,
          format: 'json',
          timestamp: new Date()
        };
    }
  }

  private clearCache(): any {
    const result = this.manager.clearCache();

    return {
      op: 'clearCache',
      status: 'ok',
      result: {
        cleared: result.cleared,
        message: `Cleared ${result.cleared} cached validation results`
      },
      timestamp: new Date()
    };
  }

  private toYAML(obj: any, indent = 0): string {
    const pad = '  '.repeat(indent);
    if (obj === null || obj === undefined) return 'null';
    if (typeof obj !== 'object') return String(obj);
    if (Array.isArray(obj)) {
      return obj.map((v: any) => `${pad}- ${this.toYAML(v, indent + 1).replace(/^\s+/, '')}`).join('\n');
    }
    return Object.entries(obj).map(([k, v]) => {
      const val = typeof v === 'object' && v !== null ? `\n${this.toYAML(v, indent + 1)}` : `${this.toYAML(v, 0)}`;
      return `${pad}${k}: ${typeof v === 'object' && v !== null ? '' : ''}${val}`;
    }).join('\n');
  }

  private toXML(obj: any, tag = 'root'): string {
    if (obj === null || obj === undefined) return `<${tag}/>`;
    if (typeof obj !== 'object') return `<${tag}>${String(obj)}</${tag}>`;
    if (Array.isArray(obj)) return `<${tag}>${obj.map((v: any) => this.toXML(v, 'item')).join('')}</${tag}>`;
    const children = Object.entries(obj).map(([k, v]) => this.toXML(v as any, k)).join('');
    return `<${tag}>${children}</${tag}>`;
  }
}

async function main() {
  const cli = new BridgeSchemaCLI();
  
  if (process.argv.length < 3) {
    console.error('Usage: cliHarness.ts <operation> [args...]');
    console.error('Operations: addSchema, getSchema, listSchemas, validate, convert, generate, addConversion, stats, export, clearCache');
    console.error('Examples:');
    console.error('  cliHarness.ts listSchemas');
    console.error('  cliHarness.ts listSchemas unity');
    console.error('  cliHarness.ts getSchema unity-bridge-v1');
    console.error('  cliHarness.ts validate unity-bridge-v1 data.json');
    console.error('  cliHarness.ts convert data.json unity web');
    console.error('  cliHarness.ts generate data.json my-schema "My Schema" web');
    console.error('  cliHarness.ts stats');
    console.error('  cliHarness.ts export yaml');
    process.exit(1);
  }

  const operation = process.argv[2];
  const args = process.argv.slice(3);

  let op: BridgeSchemaOperation;
  
  try {
    switch (operation) {
      case 'addSchema':
        if (args.length < 1) throw new Error('addSchema requires JSON file path');
        const schemaData = JSON.parse(fs.readFileSync(args[0], 'utf-8'));
        op = { op: 'addSchema', schema: schemaData };
        break;
        
      case 'getSchema':
        if (args.length < 1) throw new Error('getSchema requires schemaId');
        op = { op: 'getSchema', schemaId: args[0] };
        break;
        
      case 'listSchemas':
        op = { op: 'listSchemas', engine: args[0] };
        break;
        
      case 'validate':
        if (args.length < 2) throw new Error('validate requires schemaId and data file');
        const validateData = JSON.parse(fs.readFileSync(args[1], 'utf-8'));
        op = { op: 'validate', schemaId: args[0], data: validateData };
        break;
        
      case 'convert':
        if (args.length < 3) throw new Error('convert requires data file, fromEngine, toEngine');
        const convertData = JSON.parse(fs.readFileSync(args[0], 'utf-8'));
        op = { 
          op: 'convert', 
          data: convertData, 
          fromEngine: args[1], 
          toEngine: args[2] 
        };
        break;
        
      case 'generate':
        if (args.length < 4) throw new Error('generate requires data file, id, name, engine');
        const genData = JSON.parse(fs.readFileSync(args[0], 'utf-8'));
        op = { 
          op: 'generate', 
          data: genData, 
          id: args[1], 
          name: args[2], 
          engine: args[3] 
        };
        break;
        
      case 'addConversion':
        if (args.length < 1) throw new Error('addConversion requires JSON file path');
        const ruleData = JSON.parse(fs.readFileSync(args[0], 'utf-8'));
        op = { op: 'addConversion', rule: ruleData };
        break;
        
      case 'stats':
        op = { op: 'stats' };
        break;
        
      case 'export':
        op = { 
          op: 'export', 
          format: args[0] as any || 'full' 
        };
        break;
        
      case 'clearCache':
        op = { op: 'clearCache' };
        break;
        
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    const result = await cli.execute(op);
    console.log(JSON.stringify(result, null, 2));
  } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
    console.error('Error:', error instanceof Error ? message: error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}