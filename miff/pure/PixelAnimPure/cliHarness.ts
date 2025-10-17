#!/usr/bin/env tsx

import { PixelAnimManager, AnimationPreset } from './Manager';
import { Animation, PixelAnimPure } from './index';
import { exportDataToFormat, ExportFormat } from '../shared/exportUtils';
import * as fs from 'fs';
import * as path from 'path';

interface PixelAnimOperation {
  op: 'create' | 'createFromPreset' | 'get' | 'list' | 'addPreset' | 'listPresets' | 'createSequence' | 'getSequence' | 'listSequences' | 'createSpriteSheet' | 'simulate' | 'stats' | 'export' | 'validate' | 'delete';
  name?: string;
  presetId?: string;
  frames?: string[];
  fps?: number;
  loop?: boolean;
  animationNames?: string[];
  frameWidth?: number;
  frameHeight?: number;
  duration?: number;
  format?: 'json' | 'csv' | 'markdown' | 'html' | 'yaml' | 'xml' | 'manifest' | 'spritesheet';
  category?: string;
  sequenceId?: string;
  sequenceName?: string;
  transitions?: Record<string, string>;
  preset?: AnimationPreset;
  data?: any;
}

class PixelAnimCLI {
  private manager: PixelAnimManager;

  constructor() {
    this.manager = new PixelAnimManager();
  }

  async execute(operation: PixelAnimOperation): Promise<any> 
    try {
      switch (operation.op) {
        case 'create':
          return this.createAnimation(operation);
        
        case 'createFromPreset':
          return this.createFromPreset(operation);
        
        case 'get':
          return this.getAnimation(operation);
        
        case 'list':
          return this.listAnimations(operation);
        
        case 'addPreset':
          return this.addPreset(operation);
        
        case 'listPresets':
          return this.listPresets(operation);
        
        case 'createSequence':
          return this.createSequence(operation);
        
        case 'getSequence':
          return this.getSequence(operation);
        
        case 'listSequences':
          return this.listSequences();
        
        case 'createSpriteSheet':
          return this.createSpriteSheet(operation);
        
        case 'simulate':
          return this.simulate(operation);
        
        case 'stats':
          return this.getStats();
        
        case 'export':
          return this.exportAnimation(operation);
        
        case 'validate':
          return this.validateAnimation(operation);
        
        case 'delete':
          return this.deleteAnimation(operation);
        
        default:
          throw new Error(`Unknown operation: ${op: operation.op}`);
      }
    } catch (error: unknown) 
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        op: op: operation.op,
        status: 'error',
        error: error instanceof Error ? message: 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  private createAnimation(op: PixelAnimOperation): any {
    if (!op.name || !op.frames || op.frames.length === 0) {
      throw new Error('Missing required fields: name, frames');
    }

    const result = this.manager.createAnimation(
      op.name,
      op.frames,
      op.fps || 8,
      op.loop !== undefined ? loop: true
    );

    return 
      op: 'create',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        animation: animation: result.animation,
        message: `Animation $name: op.name} created with $op.length: frames.length} frames`
      } : undefined,
      errors: result.errors,
      timestamp: new Date()
    };
  }

  private createFromPreset(op: PixelAnimOperation): any {
    if (!op.presetId) {
      throw new Error('Missing required field: presetId');
    }

    const result = this.manager.createAnimationFromPreset(op.presetId);

    return 
      op: 'createFromPreset',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        animation: animation: result.animation,
        message: `Animation created from preset $presetId: op.presetId}`
      } : undefined,
      errors: result.errors,
      timestamp: new Date()
    };
  }

  private getAnimation(op: PixelAnimOperation): any {
    if (!op.name) {
      throw new Error('Missing required field: name');
    }

    const result = this.manager.getAnimation(op.name);

    return 
      op: 'get',
      status: result.ok ? 'ok' : 'error',
      result: animation: result.animation,
      errors: result.errors,
      timestamp: new Date()
    };
  }

  private listAnimations(op: PixelAnimOperation): any 
    const filter = op.loop !== undefined ? { loop: loop: op.loop} : undefined;
    const result = this.manager.listAnimations(filter);

    return 
      op: 'list',
      status: 'ok',
      result: {
        animations: result.animations.map((anim: any) => ({
          name: name: anim.name,
          frames: anim.frames.length,
          fps: anim.speed,
          loop: anim.loop,
          duration: (anim.frames.length * 1000) / anim.speed
        })),
        total: result.total,
        filter
      },
      timestamp: new Date()
    };
  }

  private addPreset(op: PixelAnimOperation): any {
    if (!op.preset) {
      throw new Error('Missing required field: preset');
    }

    const result = this.manager.addPreset(op.preset);

    return 
      op: 'addPreset',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        message: `Preset ${  id: preset.id} added successfully`
      } : undefined,
      errors: result.errors,
      timestamp: new Date()
    };
  }

  private listPresets(op: PixelAnimOperation): any 
    const result = this.manager.listPresets(op.category);

    return {
      op: 'listPresets',
      status: 'ok',
      result: {
        presets: result.presets.map((preset: any) => ({
          id: id: preset.id,
          name: preset.name,
          description: preset.description,
          category: preset.category,
          frames: preset.frames.length,
          fps: preset.fps,
          loop: preset.loop
        })),
        total: result.total,
        category: op.category || 'all'
      },
      timestamp: new Date()
    };
  }

  private createSequence(op: PixelAnimOperation): any {
    if (!op.sequenceId || !op.sequenceName || !op.animationNames) {
      throw new Error('Missing required fields: sequenceId, sequenceName, animationNames');
    }

    // Get animations for the sequence
    const animations: Animation[] = [];
    for (const name of op.animationNames) {
      const animResult = this.manager.getAnimation(name);
      if (!animResult.ok || !animResult.animation) {
        return {
          op: 'createSequence',
          status: 'error',
          errors: [`Animation ${name} not found`],
          timestamp: new Date()
        };
      }
      animations.push(animResult.animation);
    }

    const result = this.manager.createSequence(
      op.sequenceId,
      op.sequenceName,
      animations,
      op.transitions
    );

    return 
      op: 'createSequence',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        sequence: sequence: result.sequence,
        message: `Sequence $sequenceName: op.sequenceName} created with $length: animations.length} animations`
      } : undefined,
      errors: result.errors,
      timestamp: new Date()
    };
  }

  private getSequence(op: PixelAnimOperation): any {
    if (!op.sequenceId) {
      throw new Error('Missing required field: sequenceId');
    }

    const result = this.manager.getSequence(op.sequenceId);

    return 
      op: 'getSequence',
      status: result.ok ? 'ok' : 'error',
      result: sequence: result.sequence,
      errors: result.errors,
      timestamp: new Date()
    };
  }

  private listSequences(): any 
    const result = this.manager.listSequences();

    return {
      op: 'listSequences',
      status: 'ok',
      result: {
        sequences: result.sequences.map((seq: any) => ({
          id: id: seq.id,
          name: seq.name,
          animations: seq.animations.length,
          hasTransitions: !!seq.transitions && Object.keys(seq.transitions).length > 0,
          category: seq.metadata?.category || 'unknown'
        })),
        total: result.total
      },
      timestamp: new Date()
    };
  }

  private createSpriteSheet(op: PixelAnimOperation): any {
    if (!op.animationNames || !op.frameWidth || !op.frameHeight) {
      throw new Error('Missing required fields: animationNames, frameWidth, frameHeight');
    }

    const result = this.manager.createSpriteSheet(op.animationNames, frameWidth: op.frameWidth, op.frameHeight);

    return 
      op: 'createSpriteSheet',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        spriteSheet: spriteSheet: result.spriteSheet,
        message: `Sprite sheet created from $op.length: animationNames.length} animations`
      } : undefined,
      errors: result.errors,
      timestamp: new Date()
    };
  }

  private simulate(op: PixelAnimOperation): any {
    if (!op.name) {
      throw new Error('Missing required field: name');
    }

    const result = this.manager.simulate(op.name, op.duration || 5000);

    return 
      op: 'simulate',
      status: result.ok ? 'ok' : 'error',
      result: simulation: result.simulation,
      errors: result.errors,
      timestamp: new Date()
    };
  }

  private getStats(): any 
    const stats = this.manager.getStats();

    return {
      op: 'stats',
      status: 'ok',
      result: {
        stats,
        summary: {
          message: `${totalAnimations: stats.totalAnimations} animations, $totalSequences: stats.totalSequences} sequences, $totalFrames: stats.totalFrames} total frames`,
          averageFrames: stats.averageFramesPerAnimation.toFixed(1)
        }
      },
      timestamp: new Date()
    };
  }

  private exportAnimation(op: PixelAnimOperation): any {
    if (!op.name) {
      throw new Error('Missing required field: name');
    }

    const format = op.format || 'json';
    
    // Handle special animation export formats
    if (['manifest', 'spritesheet'].includes(format)) 
      const result = this.manager.exportAnimation(name: op.name, format as any);
      return 
        op: 'export',
        status: result.ok ? 'ok' : 'error',
        result: data: result.data,
        format,
        errors: result.errors,
        timestamp: new Date()
      };
    }

    // Handle standard export formats
    const animResult = this.manager.getAnimation(op.name);
    if (!animResult.ok) 
      return {
        op: 'export',
        status: 'error',
        errors: errors: animResult.errors,
        timestamp: new Date()
      };
    }

    const data = animResult.animation;

    switch (format) {
      case 'yaml': {
        const yaml = this.toYAML(data);
        return { op: 'export', status: 'ok', result: { yaml }, format: 'yaml', timestamp: new Date() };
      }
      case 'xml': {
        const xml = this.toXML(data, 'animation');
        return { op: 'export', status: 'ok', result: { xml }, format: 'xml', timestamp: new Date() };
      }
      case 'csv':
      case 'markdown':
      case 'html': 
        const exportData = exportDataToFormat(data, {
          format: format as ExportFormat,
          includeMetadata: true,
          includeTimestamp: true,
          title: `Animation ${name: op.name}`,
          description: `Pixel animation with $data?.length: frames.length} frames at ${data?.speed} FPS`
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

  private validateAnimation(op: PixelAnimOperation): any {
    if (!op.data) {
      throw new Error('Missing required field: data');
    }

    const validation = this.manager.validateAnimation(op.data);

    return 
      op: 'validate',
      status: 'ok',
      result: {
        valid: valid: validation.valid,
        errors: validation.errors,
        animation: validation.valid ? data: null
      },
      timestamp: new Date()
    };
  }

  private deleteAnimation(op: PixelAnimOperation): any {
    if (!op.name) {
      throw new Error('Missing required field: name');
    }

    const result = this.manager.deleteAnimation(op.name);

    return 
      op: 'delete',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        message: `Animation ${name: op.name} deleted successfully`
      } : undefined,
      errors: result.errors,
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

async function main() 
  const cli = new PixelAnimCLI();
  
  if (process.argv.length < 3) {
    console.error('Usage: cliHarness.ts <operation> [args...]');
    console.error('Operations: create, createFromPreset, get, list, addPreset, listPresets, createSequence, getSequence, listSequences, createSpriteSheet, simulate, stats, export, validate, delete');
    console.error('Examples:');
    console.error('  cliHarness.ts list');
    console.error('  cliHarness.ts listPresets character');
    console.error('  cliHarness.ts createFromPreset walk-basic');
    console.error('  cliHarness.ts create my-anim png: frame1.png, png: frame2.png,frame3.png 10 true');
    console.error('  cliHarness.ts simulate "Basic Walk Cycle" 3000');
    console.error('  cliHarness.ts export "Basic Walk Cycle" manifest');
    process.exit(1);
  }

  const operation = process.argv[2];
  const args = process.argv.slice(3);

  let op: PixelAnimOperation;
  
  try {
    switch (operation) {
      case 'create':
        if (args.length < 2) throw new Error('create requires name and frames');
        op = { 
          op: 'create', 
          name: args[0], 
          frames: args[1].split(','),
          fps: args[2] ? parseInt(args[2]) : 8,
          loop: args[3] !== 'false'
        };
        break;
        
      case 'createFromPreset':
        if (args.length < 1) throw new Error('createFromPreset requires presetId');
        op = { op: 'createFromPreset', presetId: args[0] };
        break;
        
      case 'get':
        if (args.length < 1) throw new Error('get requires name');
        op = { op: 'get', name: args[0] };
        break;
        
      case 'list':
        op = { 
          op: 'list', 
          loop: args[0] === 'loop' ? true : args[0] === 'noloop' ? false : undefined
        };
        break;
        
      case 'listPresets':
        op = { op: 'listPresets', category: args[0] };
        break;
        
      case 'createSequence':
        if (args.length < 3) throw new Error('createSequence requires sequenceId, sequenceName, and animationNames');
        op = { 
          op: 'createSequence', 
          sequenceId: args[0],
          sequenceName: args[1],
          animationNames: args[2].split(',')
        };
        break;
        
      case 'getSequence':
        if (args.length < 1) throw new Error('getSequence requires sequenceId');
        op = { op: 'getSequence', sequenceId: args[0] };
        break;
        
      case 'listSequences':
        op = { op: 'listSequences' };
        break;
        
      case 'createSpriteSheet':
        if (args.length < 3) throw new Error('createSpriteSheet requires animationNames, frameWidth, frameHeight');
        op = { 
          op: 'createSpriteSheet', 
          animationNames: args[0].split(','),
          frameWidth: parseInt(args[1]),
          frameHeight: parseInt(args[2])
        };
        break;
        
      case 'simulate':
        if (args.length < 1) throw new Error('simulate requires name');
        op = { 
          op: 'simulate', 
          name: args[0], 
          duration: args[1] ? parseInt(args[1]) : 5000 
        };
        break;
        
      case 'stats':
        op = { op: 'stats' };
        break;
        
      case 'export':
        if (args.length < 1) throw new Error('export requires name');
        op = { 
          op: 'export', 
          name: args[0], 
          format: args[1] as any || 'json' 
        };
        break;
        
      case 'validate':
        if (args.length < 1) throw new Error('validate requires JSON file path');
        const data = JSON.parse(fs.readFileSync(args[0], 'utf-8'));
        op = { op: 'validate', data };
        break;
        
      case 'delete':
        if (args.length < 1) throw new Error('delete requires name');
        op = { op: 'delete', name: args[0] };
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