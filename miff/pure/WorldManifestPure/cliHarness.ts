#!/usr/bin/env tsx

import { WorldManifestManager, WorldGenerationConfig } from './Manager';
import { exportDataToFormat, ExportFormat } from '../shared/exportUtils';
import * as fs from 'fs';
import * as path from 'path';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

interface WorldOperation {
  op: 'create' | 'get' | 'list' | 'addZone' | 'removeZone' | 'placeAsset' | 'removeAsset' | 'findAssets' | 'generate' | 'validate' | 'stats' | 'export' | 'delete' | 'globalStats';
  worldId?: string;
  zoneId?: string;
  name?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  endX?: number;
  endY?: number;
  assetId?: string;
  layer?: number;
  metadata?: any;
  config?: WorldGenerationConfig;
  format?: 'json' | 'csv' | 'markdown' | 'html' | 'yaml' | 'xml' | 'manifest' | 'summary' | 'tiles';
  data?: any;
}

class WorldManifestCLI {
  private logger: StructuredLogger;
  private manager: WorldManifestManager;

  constructor() {
    this.logger = new StructuredLogger({ module: 'WorldManifestCLI' });
    this.manager = new WorldManifestManager();
  }

  async execute(operation: WorldOperation): Promise<any> {
    try {
      switch (operation.op) {
        case 'create':
          return this.createWorld(operation);
        
        case 'get':
          return this.getWorld(operation);
        
        case 'list':
          return this.listWorlds();
        
        case 'addZone':
          return this.addZone(operation);
        
        case 'removeZone':
          return this.removeZone(operation);
        
        case 'placeAsset':
          return this.placeAsset(operation);
        
        case 'removeAsset':
          return this.removeAsset(operation);
        
        case 'findAssets':
          return this.findAssets(operation);
        
        case 'generate':
          return this.generateWorld(operation);
        
        case 'validate':
          return this.validateWorld(operation);
        
        case 'stats':
          return this.getWorldStats(operation);
        
        case 'export':
          return this.exportWorld(operation);
        
        case 'delete':
          return this.deleteWorld(operation);
        
        case 'globalStats':
          return this.getGlobalStats();
        
        default:
          throw new Error(`Unknown operation: ${operation.op}`);
      }
    } catch (error) {
      return {
        op: operation.op,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }

  private createWorld(op: WorldOperation): any {
    if (!op.worldId || !op.name || !op.width || !op.height) {
      throw new Error('Missing required fields: worldId, name, width, height');
    }

    const result = this.manager.createWorld(op.worldId, op.name, op.width, op.height);

    return {
      op: 'create',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        world: result.world,
        message: `World ${op.worldId} created successfully (${op.width}x${op.height})`
      } : undefined,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  private getWorld(op: WorldOperation): any {
    if (!op.worldId) {
      throw new Error('Missing required field: worldId');
    }

    const result = this.manager.getWorld(op.worldId);

    return {
      op: 'get',
      status: result.ok ? 'ok' : 'error',
      result: result.world,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  private listWorlds(): any {
    const result = this.manager.listWorlds();

    return {
      op: 'list',
      status: 'ok',
      result: {
        worlds: result.worlds.map(world => ({
          id: world.zones[0]?.id || 'unknown',
          name: world.metadata?.title || 'Unnamed World',
          zones: world.zones.length,
          totalTiles: world.zones.reduce((sum, zone) => sum + zone.tiles.length, 0),
          schema: world.schema,
          version: world.version,
          created: world.metadata?.created
        })),
        total: result.total
      },
      timestamp: Date.now()
    };
  }

  private addZone(op: WorldOperation): any {
    if (!op.worldId || !op.zoneId || !op.name || !op.width || !op.height) {
      throw new Error('Missing required fields: worldId, zoneId, name, width, height');
    }

    const result = this.manager.addZone(op.worldId, op.zoneId, op.name, op.width, op.height);

    return {
      op: 'addZone',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        zone: result.zone,
        message: `Zone ${op.zoneId} added to world ${op.worldId}`
      } : undefined,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  private removeZone(op: WorldOperation): any {
    if (!op.worldId || !op.zoneId) {
      throw new Error('Missing required fields: worldId, zoneId');
    }

    const result = this.manager.removeZone(op.worldId, op.zoneId);

    return {
      op: 'removeZone',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        message: `Zone ${op.zoneId} removed from world ${op.worldId}`
      } : undefined,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  private placeAsset(op: WorldOperation): any {
    if (!op.worldId || !op.zoneId || op.x === undefined || op.y === undefined || !op.assetId) {
      throw new Error('Missing required fields: worldId, zoneId, x, y, assetId');
    }

    const result = this.manager.placeAsset(
      op.worldId,
      op.zoneId,
      op.x,
      op.y,
      op.assetId,
      op.layer || 1,
      op.metadata
    );

    return {
      op: 'placeAsset',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        anchor: result.anchor,
        message: `Asset ${op.assetId} placed at (${op.x}, ${op.y}) in zone ${op.zoneId}`
      } : undefined,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  private removeAsset(op: WorldOperation): any {
    if (!op.worldId || !op.zoneId || op.x === undefined || op.y === undefined) {
      throw new Error('Missing required fields: worldId, zoneId, x, y');
    }

    const result = this.manager.removeAsset(op.worldId, op.zoneId, op.x, op.y, op.layer);

    return {
      op: 'removeAsset',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        removed: result.removed,
        count: result.removed?.length || 0,
        message: `Removed ${result.removed?.length || 0} assets from (${op.x}, ${op.y})`
      } : undefined,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  private findAssets(op: WorldOperation): any {
    if (!op.worldId || !op.zoneId || op.x === undefined || op.y === undefined || op.endX === undefined || op.endY === undefined) {
      throw new Error('Missing required fields: worldId, zoneId, x, y, endX, endY');
    }

    const result = this.manager.findAssetsInArea(op.worldId, op.zoneId, op.x, op.y, op.endX, op.endY);

    return {
      op: 'findAssets',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        tiles: result.tiles,
        count: result.tiles?.length || 0,
        area: {
          startX: op.x,
          startY: op.y,
          endX: op.endX,
          endY: op.endY,
          width: Math.abs(op.endX - op.x) + 1,
          height: Math.abs(op.endY - op.y) + 1
        }
      } : undefined,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  private generateWorld(op: WorldOperation): any {
    if (!op.worldId || !op.zoneId) {
      throw new Error('Missing required fields: worldId, zoneId');
    }

    const worldResult = this.manager.getWorld(op.worldId);
    if (!worldResult.ok) {
      return {
        op: 'generate',
        status: 'error',
        errors: worldResult.errors,
        timestamp: Date.now()
      };
    }

    const result = this.manager.generateWorld(worldResult.world!, op.zoneId, op.config || {});

    return {
      op: 'generate',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        generated: result.generated,
        config: op.config,
        message: `Generated ${result.generated} tiles in zone ${op.zoneId}`
      } : undefined,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  private validateWorld(op: WorldOperation): any {
    if (!op.worldId) {
      throw new Error('Missing required field: worldId');
    }

    const result = this.manager.validateWorld(op.worldId);

    return {
      op: 'validate',
      status: result.ok ? 'ok' : 'error',
      result: result.validation,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  private getWorldStats(op: WorldOperation): any {
    if (!op.worldId) {
      throw new Error('Missing required field: worldId');
    }

    const result = this.manager.getWorldStats(op.worldId);

    return {
      op: 'stats',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        stats: result.stats,
        summary: {
          message: `${result.stats?.totalZones} zones, ${result.stats?.totalTiles} tiles, ${result.stats?.totalAssets} unique assets`,
          averageTiles: result.stats?.averageTilesPerZone.toFixed(1)
        }
      } : undefined,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  private exportWorld(op: WorldOperation): any {
    if (!op.worldId) {
      throw new Error('Missing required field: worldId');
    }

    const format = op.format || 'json';
    
    // Handle special world export formats
    if (['manifest', 'summary', 'tiles'].includes(format)) {
      const result = this.manager.exportWorld(op.worldId, format as any);
      return {
        op: 'export',
        status: result.ok ? 'ok' : 'error',
        result: result.data,
        format,
        errors: result.errors,
        timestamp: Date.now()
      };
    }

    // Handle standard export formats
    const worldResult = this.manager.getWorld(op.worldId);
    if (!worldResult.ok) {
      return {
        op: 'export',
        status: 'error',
        errors: worldResult.errors,
        timestamp: Date.now()
      };
    }

    const data = worldResult.world;

    switch (format) {
      case 'yaml': {
        const yaml = this.toYAML(data);
        return { op: 'export', status: 'ok', result: { yaml }, format: 'yaml', timestamp: Date.now() };
      }
      case 'xml': {
        const xml = this.toXML(data, 'world');
        return { op: 'export', status: 'ok', result: { xml }, format: 'xml', timestamp: Date.now() };
      }
      case 'csv':
      case 'markdown':
      case 'html': {
        const exportData = exportDataToFormat(data, {
          format: format as ExportFormat,
          includeMetadata: true,
          includeTimestamp: true,
          title: `World ${op.worldId}`,
          description: `World manifest for ${data?.metadata?.title || 'Unnamed World'}`
        });
        return { 
          op: 'export', 
          status: 'ok', 
          result: { [format]: exportData }, 
          format, 
          timestamp: Date.now() 
        };
      }
      default:
        return {
          op: 'export',
          status: 'ok',
          result: data,
          format: 'json',
          timestamp: Date.now()
        };
    }
  }

  private deleteWorld(op: WorldOperation): any {
    if (!op.worldId) {
      throw new Error('Missing required field: worldId');
    }

    const result = this.manager.deleteWorld(op.worldId);

    return {
      op: 'delete',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        message: `World ${op.worldId} deleted successfully`
      } : undefined,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  private getGlobalStats(): any {
    const stats = this.manager.getGlobalStats();

    return {
      op: 'globalStats',
      status: 'ok',
      result: {
        stats,
        summary: {
          message: `${stats.totalWorlds} worlds, ${stats.totalZones} zones, ${stats.totalTiles} tiles, ${stats.totalAssets} assets`,
          averageZonesPerWorld: stats.totalWorlds > 0 ? (stats.totalZones / stats.totalWorlds).toFixed(1) : '0',
          averageTilesPerZone: stats.totalZones > 0 ? (stats.totalTiles / stats.totalZones).toFixed(1) : '0'
        }
      },
      timestamp: Date.now()
    };
  }

  private toYAML(obj: any, indent = 0): string {
    const pad = '  '.repeat(indent);
    if (obj === null || obj === undefined) return 'null';
    if (typeof obj !== 'object') return String(obj);
    if (Array.isArray(obj)) {
      return obj.map(v => `${pad}- ${this.toYAML(v, indent + 1).replace(/^\s+/, '')}`).join('\n');
    }
    return Object.entries(obj).map(([k, v]) => {
      const val = typeof v === 'object' && v !== null ? `\n${this.toYAML(v, indent + 1)}` : `${this.toYAML(v, 0)}`;
      return `${pad}${k}: ${typeof v === 'object' && v !== null ? '' : ''}${val}`;
    }).join('\n');
  }

  private toXML(obj: any, tag = 'root'): string {
    if (obj === null || obj === undefined) return `<${tag}/>`;
    if (typeof obj !== 'object') return `<${tag}>${String(obj)}</${tag}>`;
    if (Array.isArray(obj)) return `<${tag}>${obj.map(v => this.toXML(v, 'item')).join('')}</${tag}>`;
    const children = Object.entries(obj).map(([k, v]) => this.toXML(v as any, k)).join('');
    return `<${tag}>${children}</${tag}>`;
  }
}

async function main() {
  const cli = new WorldManifestCLI();
  
  if (process.argv.length < 3) {
    console.error('Usage: cliHarness.ts <operation> [args...]');
    console.error('Operations: create, get, list, addZone, removeZone, placeAsset, removeAsset, findAssets, generate, validate, stats, export, delete, globalStats');
    console.error('Examples:');
    console.error('  cliHarness.ts list');
    console.error('  cliHarness.ts create my-world "My World" 50 40');
    console.error('  cliHarness.ts addZone my-world zone1 "Zone One" 20 15');
    console.error('  cliHarness.ts placeAsset my-world zone1 5 5 tree-oak 1');
    console.error('  cliHarness.ts generate my-world zone1 --seed 12345 --density 0.6 --style forest');
    console.error('  cliHarness.ts stats my-world');
    console.error('  cliHarness.ts export my-world yaml');
    process.exit(1);
  }

  const operation = process.argv[2];
  const args = process.argv.slice(3);

  let op: WorldOperation;
  
  try {
    switch (operation) {
      case 'create':
        if (args.length < 4) throw new Error('create requires worldId, name, width, height');
        op = { 
          op: 'create', 
          worldId: args[0], 
          name: args[1],
          width: parseInt(args[2]),
          height: parseInt(args[3])
        };
        break;
        
      case 'get':
        if (args.length < 1) throw new Error('get requires worldId');
        op = { op: 'get', worldId: args[0] };
        break;
        
      case 'list':
        op = { op: 'list' };
        break;
        
      case 'addZone':
        if (args.length < 5) throw new Error('addZone requires worldId, zoneId, name, width, height');
        op = { 
          op: 'addZone', 
          worldId: args[0],
          zoneId: args[1],
          name: args[2],
          width: parseInt(args[3]),
          height: parseInt(args[4])
        };
        break;
        
      case 'removeZone':
        if (args.length < 2) throw new Error('removeZone requires worldId and zoneId');
        op = { op: 'removeZone', worldId: args[0], zoneId: args[1] };
        break;
        
      case 'placeAsset':
        if (args.length < 5) throw new Error('placeAsset requires worldId, zoneId, x, y, assetId');
        op = { 
          op: 'placeAsset', 
          worldId: args[0],
          zoneId: args[1],
          x: parseInt(args[2]),
          y: parseInt(args[3]),
          assetId: args[4],
          layer: args[5] ? parseInt(args[5]) : 1
        };
        break;
        
      case 'removeAsset':
        if (args.length < 4) throw new Error('removeAsset requires worldId, zoneId, x, y');
        op = { 
          op: 'removeAsset', 
          worldId: args[0],
          zoneId: args[1],
          x: parseInt(args[2]),
          y: parseInt(args[3]),
          layer: args[4] ? parseInt(args[4]) : undefined
        };
        break;
        
      case 'findAssets':
        if (args.length < 6) throw new Error('findAssets requires worldId, zoneId, x, y, endX, endY');
        op = { 
          op: 'findAssets', 
          worldId: args[0],
          zoneId: args[1],
          x: parseInt(args[2]),
          y: parseInt(args[3]),
          endX: parseInt(args[4]),
          endY: parseInt(args[5])
        };
        break;
        
      case 'generate':
        if (args.length < 2) throw new Error('generate requires worldId and zoneId');
        const config: WorldGenerationConfig = {};
        
        // Parse optional config from remaining args
        for (let i = 2; i < args.length; i += 2) {
          const key = args[i]?.replace('--', '');
          const value = args[i + 1];
          if (key && value) {
            switch (key) {
              case 'seed':
                config.seed = parseInt(value);
                break;
              case 'density':
                config.density = parseFloat(value);
                break;
              case 'style':
                config.style = value as any;
                break;
              case 'layering':
                config.layering = value as any;
                break;
            }
          }
        }
        
        op = { 
          op: 'generate', 
          worldId: args[0],
          zoneId: args[1],
          config
        };
        break;
        
      case 'validate':
        if (args.length < 1) throw new Error('validate requires worldId');
        op = { op: 'validate', worldId: args[0] };
        break;
        
      case 'stats':
        if (args.length < 1) throw new Error('stats requires worldId');
        op = { op: 'stats', worldId: args[0] };
        break;
        
      case 'export':
        if (args.length < 1) throw new Error('export requires worldId');
        op = { 
          op: 'export', 
          worldId: args[0], 
          format: args[1] as any || 'json' 
        };
        break;
        
      case 'delete':
        if (args.length < 1) throw new Error('delete requires worldId');
        op = { op: 'delete', worldId: args[0] };
        break;
        
      case 'globalStats':
        op = { op: 'globalStats' };
        break;
        
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    const result = await cli.execute(op);
    console.info(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}