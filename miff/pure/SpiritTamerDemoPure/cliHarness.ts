#!/usr/bin/env tsx

import { SpiritTamerManager } from './Manager';
import { exportDataToFormat, ExportFormat } from '../shared/exportUtils';
import * as fs from 'fs';
import * as path from 'path';

interface SpiritTamerOperation {
  op: 'demo' | 'scenario' | 'tame' | 'battle' | 'dump' | 'list' | 'player' | 'move' | 'startTaming' | 'rhythm' | 'session' | 'sessions' | 'stats' | 'export' | 'reset';
  spiritId?: string;
  sessionId?: string;
  x?: number;
  y?: number;
  zone?: string;
  time?: number;
  hit?: boolean;
  format?: 'json' | 'csv' | 'markdown' | 'html' | 'yaml' | 'xml' | 'save' | 'scenario' | 'summary';
  location?: string;
  includeWild?: boolean;
  data?: Record<string, unknown>;
}

class SpiritTamerCLI {
  private manager: SpiritTamerManager;

  constructor() {
    this.manager = new SpiritTamerManager();
  }

  async execute(operation: SpiritTamerOperation): Promise<any> {
    try {
      switch (operation.op) {
        case 'demo':
          return this.runDemo();
        
        case 'scenario':
          return this.runScenario();
        
        case 'tame':
          return this.tameSpirit(operation);
        
        case 'battle':
          return this.simulateBattle(operation);
        
        case 'dump':
          return this.dump();
        
        case 'list':
          return this.listSpirits(operation);
        
        case 'player':
          return this.getPlayer();
        
        case 'move':
          return this.movePlayer(operation);
        
        case 'startTaming':
          return this.startTaming(operation);
        
        case 'rhythm':
          return this.processRhythm(operation);
        
        case 'session':
          return this.getSession(operation);
        
        case 'sessions':
          return this.listSessions();
        
        case 'stats':
          return this.getStats();
        
        case 'export':
          return this.exportData(operation);
        
        case 'reset':
          return this.reset();
        
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

  private runDemo(): any {
    const playerResult = this.manager.getPlayer();
    const spiritsResult = this.manager.listSpirits('grove');

    return {
      op: 'demo',
      status: 'ok',
      result: {
        scene: 'grove',
        player: playerResult.player.location,
        spirits: spiritsResult.spirits.map(s => s.id),
        orchestrationReady: true,
        metadata: {
          scenario: 'spirit-tamer-trial-of-grove',
          version: '1.0.0',
          remixSafe: true
        }
      },
      timestamp: Date.now()
    };
  }

  private runScenario(): any {
    const exportResult = this.manager.exportData('scenario');
    
    return {
      op: 'scenario',
      status: exportResult.ok ? 'ok' : 'error',
      result: exportResult.data,
      errors: exportResult.errors,
      timestamp: Date.now()
    };
  }

  private tameSpirit(op: SpiritTamerOperation): any {
    if (!op.spiritId) {
      throw new Error('Missing required field: spiritId');
    }

    // Simple taming without rhythm for backward compatibility
    const battleResult = this.manager.simulateBattle(op.spiritId);
    if (!battleResult.ok) {
      return {
        op: 'tame',
        status: 'error',
        errors: battleResult.errors,
        timestamp: Date.now()
      };
    }

    const success = battleResult.battle?.winner === 'player';
    const statsResult = this.manager.getStats();

    return {
      op: 'tame',
      status: 'ok',
      result: {
        spirit: op.spiritId,
        success,
        battle: battleResult.battle,
        stats: statsResult.stats
      },
      timestamp: Date.now()
    };
  }

  private simulateBattle(op: SpiritTamerOperation): any {
    if (!op.spiritId) {
      throw new Error('Missing required field: spiritId');
    }

    const result = this.manager.simulateBattle(op.spiritId);

    return {
      op: 'battle',
      status: result.ok ? 'ok' : 'error',
      result: result.battle,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  private listSpirits(op: SpiritTamerOperation): any {
    const result = this.manager.listSpirits(op.location, op.includeWild);

    return {
      op: 'list',
      status: 'ok',
      result: {
        spirits: result.spirits.map(spirit => ({
          id: spirit.id,
          name: spirit.name,
          type: spirit.type,
          level: spirit.level,
          rarity: spirit.rarity,
          location: spirit.location,
          isWild: spirit.isWild,
          tamingDifficulty: spirit.stats.tamingDifficulty
        })),
        total: result.total,
        location: op.location || 'all'
      },
      timestamp: Date.now()
    };
  }

  private getPlayer(): any {
    const result = this.manager.getPlayer();

    return {
      op: 'player',
      status: 'ok',
      result: result.player,
      timestamp: Date.now()
    };
  }

  private movePlayer(op: SpiritTamerOperation): any {
    if (op.x === undefined || op.y === undefined) {
      throw new Error('Missing required fields: x, y');
    }

    const result = this.manager.movePlayer(op.x, op.y, op.zone);

    return {
      op: 'move',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        location: result.location,
        message: `Moved to (${op.x}, ${op.y})${op.zone ? ` in ${op.zone}` : ''}`
      } : undefined,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  private startTaming(op: SpiritTamerOperation): any {
    if (!op.spiritId) {
      throw new Error('Missing required field: spiritId');
    }

    const result = this.manager.startTaming(op.spiritId);

    return {
      op: 'startTaming',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        session: result.session,
        message: `Started taming session for ${op.spiritId}`,
        beats: result.session?.beats.length || 0
      } : undefined,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  private processRhythm(op: SpiritTamerOperation): any {
    if (op.time === undefined || op.hit === undefined) {
      throw new Error('Missing required fields: time, hit');
    }

    const result = this.manager.processRhythmInput(op.time, op.hit);

    return {
      op: 'rhythm',
      status: result.ok ? 'ok' : 'error',
      result: result.result,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  private getSession(op: SpiritTamerOperation): any {
    if (!op.sessionId) {
      throw new Error('Missing required field: sessionId');
    }

    const result = this.manager.getTamingSession(op.sessionId);

    return {
      op: 'session',
      status: result.ok ? 'ok' : 'error',
      result: result.session,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  private listSessions(): any {
    const result = this.manager.listTamingSessions();

    return {
      op: 'sessions',
      status: 'ok',
      result: {
        sessions: result.sessions.map(session => ({
          id: session.id,
          spiritId: session.spiritId,
          result: session.result,
          score: session.score,
          accuracy: session.accuracy,
          startTime: session.startTime
        })),
        total: result.total
      },
      timestamp: Date.now()
    };
  }

  private getStats(): any {
    const result = this.manager.getStats();

    return {
      op: 'stats',
      status: 'ok',
      result: {
        stats: result.stats,
        summary: {
          message: `Level ${result.stats.player.level} tamer with ${result.stats.spirits.tamed} spirits tamed`,
          tamingRate: `${result.stats.spirits.tamingRate.toFixed(1)}%`,
          location: `${result.stats.location.zone} (${result.stats.location.x}, ${result.stats.location.y})`
        }
      },
      timestamp: Date.now()
    };
  }

  private exportData(op: SpiritTamerOperation): any {
    const format = op.format || 'save';
    
    // Handle special export formats
    if (['save', 'scenario', 'summary'].includes(format)) {
      const result = this.manager.exportData(format as any);
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
    const saveResult = this.manager.exportData('save');
    if (!saveResult.ok) {
      return {
        op: 'export',
        status: 'error',
        errors: saveResult.errors,
        timestamp: Date.now()
      };
    }

    const data = saveResult.data;

    switch (format) {
      case 'yaml': {
        const yaml = this.toYAML(data);
        return { op: 'export', status: 'ok', result: { yaml }, format: 'yaml', timestamp: Date.now() };
      }
      case 'xml': {
        const xml = this.toXML(data, 'spiritTamerSave');
        return { op: 'export', status: 'ok', result: { xml }, format: 'xml', timestamp: Date.now() };
      }
      case 'csv':
      case 'markdown':
      case 'html': {
        const exportData = exportDataToFormat(data, {
          format: format as ExportFormat,
          includeMetadata: true,
          includeTimestamp: true,
          title: 'Spirit Tamer Save Data',
          description: 'Complete save data for Spirit Tamer game'
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

  private reset(): any {
    const result = this.manager.reset();

    return {
      op: 'reset',
      status: 'ok',
      result: {
        message: result.message
      },
      timestamp: Date.now()
    };
  }

  private dump(): any {
    const playerResult = this.manager.getPlayer();
    const spiritsResult = this.manager.listSpirits();
    const statsResult = this.manager.getStats();
    const sessionsResult = this.manager.listTamingSessions();

    return {
      op: 'dump',
      status: 'ok',
      result: {
        player: playerResult.player,
        spirits: spiritsResult.spirits,
        stats: statsResult.stats,
        sessions: sessionsResult.sessions,
        info: {
          version: '1.0.0',
          capabilities: ['demo', 'scenario', 'tame', 'battle', 'rhythm', 'multiplayer'],
          spiritTypes: ['fire', 'water', 'earth', 'air', 'shadow', 'light'],
          locations: ['grove', 'forest', 'mountain', 'cave']
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
  const cli = new SpiritTamerCLI();
  
  if (process.argv.length < 3) {
    console.error('Usage: cliHarness.ts <operation> [args...]');
    console.error('Operations: demo, scenario, tame, battle, dump, list, player, move, startTaming, rhythm, session, sessions, stats, export, reset');
    console.error('Examples:');
    console.error('  cliHarness.ts demo');
    console.error('  cliHarness.ts list grove');
    console.error('  cliHarness.ts tame emberfox');
    console.error('  cliHarness.ts battle glimmerbat');
    console.error('  cliHarness.ts startTaming whisperwind');
    console.error('  cliHarness.ts stats');
    console.error('  cliHarness.ts export summary');
    process.exit(1);
  }

  const operation = process.argv[2];
  const args = process.argv.slice(3);

  let op: SpiritTamerOperation;
  
  try {
    switch (operation) {
      case 'demo':
        op = { op: 'demo' };
        break;
        
      case 'scenario':
        op = { op: 'scenario' };
        break;
        
      case 'tame':
        op = { op: 'tame', spiritId: args[0] || 'emberfox' };
        break;
        
      case 'battle':
        op = { op: 'battle', spiritId: args[0] || 'emberfox' };
        break;
        
      case 'dump':
        op = { op: 'dump' };
        break;
        
      case 'list':
        op = { 
          op: 'list', 
          location: args[0],
          includeWild: args[1] !== 'false'
        };
        break;
        
      case 'player':
        op = { op: 'player' };
        break;
        
      case 'move':
        if (args.length < 2) throw new Error('move requires x and y coordinates');
        op = { 
          op: 'move', 
          x: parseFloat(args[0]), 
          y: parseFloat(args[1]), 
          zone: args[2] 
        };
        break;
        
      case 'startTaming':
        if (args.length < 1) throw new Error('startTaming requires spiritId');
        op = { op: 'startTaming', spiritId: args[0] };
        break;
        
      case 'rhythm':
        if (args.length < 2) throw new Error('rhythm requires time and hit (true/false)');
        op = { 
          op: 'rhythm', 
          time: parseFloat(args[0]), 
          hit: args[1] === 'true' 
        };
        break;
        
      case 'session':
        if (args.length < 1) throw new Error('session requires sessionId');
        op = { op: 'session', sessionId: args[0] };
        break;
        
      case 'sessions':
        op = { op: 'sessions' };
        break;
        
      case 'stats':
        op = { op: 'stats' };
        break;
        
      case 'export':
        op = { 
          op: 'export', 
          format: args[0] as any || 'save' 
        };
        break;
        
      case 'reset':
        op = { op: 'reset' };
        break;
        
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    const result = await cli.execute(op);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}