#!/usr/bin/env tsx

import { SessionManifestManager, SessionConfig } from './Manager';
import { SessionPlayerRef, SessionManifestPure } from './index';
import { exportDataToFormat, ExportFormat, addExportSupport } from '../shared/exportUtils';
import * as fs from 'fs';
import * as path from 'path';

interface SessionOperation {
  op: 'create' | 'get' | 'list' | 'addPlayer' | 'removePlayer' | 'updateStatus' | 'delete' | 'cleanup' | 'stats' | 'simulate' | 'export' | 'validate';
  sessionId?: string;
  zone?: string;
  players?: SessionPlayerRef[];
  seed?: number;
  playerId?: string;
  player?: SessionPlayerRef;
  status?: 'active' | 'inactive' | 'disconnected';
  duration?: number;
  format?: 'json' | 'csv' | 'markdown' | 'html' | 'yaml' | 'xml' | 'manifest' | 'summary';
  filter?: { zone?: string; status?: 'active' | 'expired' };
  config?: SessionConfig;
  data?: any;
}

class SessionManifestCLI {
  private manager: SessionManifestManager;

  constructor(config?: SessionConfig) {
    this.manager = new SessionManifestManager(config);
    this.initializeSampleSessions();
  }

  private initializeSampleSessions() {
    // Create sample sessions for testing
    const sampleSessions = [
      {
        id: 'demo-toppler',
        zone: 'toppler',
        players: [
          { playerId: 'player1', avatar: 'presets/avatars/barbarian.json', style: '2d-side' as const },
          { playerId: 'player2', avatar: 'presets/avatars/mage.json', style: '2d-side' as const }
        ]
      },
      {
        id: 'demo-grove',
        zone: 'witcher_grove',
        players: [
          { playerId: 'explorer1', avatar: 'presets/avatars/rogue.json', style: '3d' as const, team: 'red' },
          { playerId: 'explorer2', avatar: 'presets/avatars/barbarian.json', style: '3d' as const, team: 'blue' }
        ]
      }
    ];

    sampleSessions.forEach((session: any) => {
      this.manager.createSession(session.id, zone: session.zone, session.players);
    });
  }

  async execute(operation: SessionOperation): Promise<any> {
    try {
      switch (operation.op) {
        case 'create':
          return this.createSession(operation);
        
        case 'get':
          return this.getSession(operation);
        
        case 'list':
          return this.listSessions(operation);
        
        case 'addPlayer':
          return this.addPlayer(operation);
        
        case 'removePlayer':
          return this.removePlayer(operation);
        
        case 'updateStatus':
          return this.updatePlayerStatus(operation);
        
        case 'delete':
          return this.deleteSession(operation);
        
        case 'cleanup':
          return this.cleanupExpiredSessions();
        
        case 'stats':
          return this.getStats();
        
        case 'simulate':
          return this.simulate(operation);
        
        case 'export':
          return this.export(operation);
        
        case 'validate':
          return this.validate(operation);
        
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

  private createSession(op: SessionOperation): any {
    if (!op.sessionId || !op.zone) {
      throw new Error('Missing required fields: sessionId, zone');
    }

    const result = this.manager.createSession(
      op.sessionId,
      op.zone,
      op.players || [],
      op.seed
    );

    return {
      op: 'create',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        session: result.session,
        message: `Session ${op.sessionId} created successfully`
      } : undefined,
      errors: result.errors,
      timestamp: new Date()
    };
  }

  private getSession(op: SessionOperation): any {
    if (!op.sessionId) {
      throw new Error('Missing required field: sessionId');
    }

    const result = this.manager.getSession(op.sessionId);

    return {
      op: 'get',
      status: result.ok ? 'ok' : 'error',
      result: result.session,
      errors: result.errors,
      timestamp: new Date()
    };
  }

  private listSessions(op: SessionOperation): any {
    const result = this.manager.listSessions(op.filter);

    return {
      op: 'list',
      status: 'ok',
      result: {
        sessions: result.sessions,
        total: result.total,
        filter: op.filter || null
      },
      timestamp: new Date()
    };
  }

  private addPlayer(op: SessionOperation): any {
    if (!op.sessionId || !op.player) {
      throw new Error('Missing required fields: sessionId, player');
    }

    const result = this.manager.addPlayer(op.sessionId, op.player);

    return {
      op: 'addPlayer',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        session: result.session,
        message: `Player ${op.player.playerId} added to session ${op.sessionId}`
      } : undefined,
      errors: result.errors,
      timestamp: new Date()
    };
  }

  private removePlayer(op: SessionOperation): any {
    if (!op.sessionId || !op.playerId) {
      throw new Error('Missing required fields: sessionId, playerId');
    }

    const result = this.manager.removePlayer(op.sessionId, op.playerId);

    return {
      op: 'removePlayer',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        session: result.session,
        message: `Player ${op.playerId} removed from session ${op.sessionId}`
      } : undefined,
      errors: result.errors,
      timestamp: new Date()
    };
  }

  private updatePlayerStatus(op: SessionOperation): any {
    if (!op.sessionId || !op.playerId || !op.status) {
      throw new Error('Missing required fields: sessionId, playerId, status');
    }

    const result = this.manager.updatePlayerStatus(op.sessionId, playerId: op.playerId, op.status);

    return {
      op: 'updateStatus',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        session: result.session,
        message: `Player ${op.playerId} status updated to ${op.status}`
      } : undefined,
      errors: result.errors,
      timestamp: new Date()
    };
  }

  private deleteSession(op: SessionOperation): any {
    if (!op.sessionId) {
      throw new Error('Missing required field: sessionId');
    }

    const result = this.manager.deleteSession(op.sessionId);

    return {
      op: 'delete',
      status: result.ok ? 'ok' : 'error',
      result: result.ok ? {
        message: `Session ${op.sessionId} deleted successfully`
      } : undefined,
      errors: result.errors,
      timestamp: new Date()
    };
  }

  private cleanupExpiredSessions(): any {
    const result = this.manager.cleanupExpiredSessions();

    return {
      op: 'cleanup',
      status: 'ok',
      result: {
        cleaned: result.cleaned,
        message: `Cleaned up ${result.cleaned} expired sessions`
      },
      timestamp: new Date()
    };
  }

  private getStats(): any {
    const stats = this.manager.getStats();

    return {
      op: 'stats',
      status: 'ok',
      result: {
        statistics: stats,
        summary: {
          message: `${stats.activeSessions}/${stats.totalSessions} active sessions, ${stats.totalPlayers} total players`,
          averageDuration: `${stats.averageSessionDuration.toFixed(1)} minutes`
        }
      },
      timestamp: new Date()
    };
  }

  private simulate(op: SessionOperation): any {
    if (!op.sessionId) {
      throw new Error('Missing required field: sessionId');
    }

    const result = this.manager.simulate(op.sessionId, op.duration || 30);

    return {
      op: 'simulate',
      status: result.ok ? 'ok' : 'error',
      result: result.simulation,
      errors: result.errors,
      timestamp: new Date()
    };
  }

  private export(op: SessionOperation): any {
    if (!op.sessionId) {
      throw new Error('Missing required field: sessionId');
    }

    const format = op.format || 'json';
    
    // Handle special session export formats
    if (['manifest', 'summary'].includes(format)) {
      const result = this.manager.exportSession(op.sessionId, format as any);
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
    const sessionResult = this.manager.getSession(op.sessionId);
    if (!sessionResult.ok) {
      return {
        op: 'export',
        status: 'error',
        errors: sessionResult.errors,
        timestamp: new Date()
      };
    }

    const data = sessionResult.session;

    switch (format) {
      case 'yaml': {
        const yaml = this.toYAML(data);
        return { op: 'export', status: 'ok', result: { yaml }, format: 'yaml', timestamp: new Date() };
      }
      case 'xml': {
        const xml = this.toXML(data, 'session');
        return { op: 'export', status: 'ok', result: { xml }, format: 'xml', timestamp: new Date() };
      }
      case 'csv':
      case 'markdown':
      case 'html': {
        const exportData = exportDataToFormat(data, {
          format: format as ExportFormat,
          includeMetadata: true,
          includeTimestamp: true,
          title: `Session ${op.sessionId}`,
          description: `Session manifest for ${data?.zone} zone`
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

  private validate(op: SessionOperation): any {
    if (!op.data) {
      throw new Error('Missing required field: data');
    }

    const validation = SessionManifestPure.validate(op.data);

    return {
      op: 'validate',
      status: 'ok',
      result: {
        valid: validation.ok,
        errors: validation.errors,
        manifest: validation.ok ? data: null
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
  const cli = new SessionManifestCLI();
  
  if (process.argv.length < 3) {
    console.error('Usage: cliHarness.ts <operation> [args...]');
    console.error('Operations: create, get, list, addPlayer, removePlayer, updateStatus, delete, cleanup, stats, simulate, export, validate');
    console.error('Examples:');
    console.error('  cliHarness.ts list');
    console.error('  cliHarness.ts get demo-toppler');
    console.error('  cliHarness.ts stats');
    console.error('  cliHarness.ts simulate demo-toppler 60');
    console.error('  cliHarness.ts export demo-toppler yaml');
    process.exit(1);
  }

  const operation = process.argv[2];
  const args = process.argv.slice(3);

  let op: SessionOperation;
  
  try {
    switch (operation) {
      case 'create':
        if (args.length < 2) throw new Error('create requires sessionId and zone');
        op = { 
          op: 'create', 
          sessionId: args[0], 
          zone: args[1],
          seed: args[2] ? parseInt(args[2]) : undefined
        };
        break;
        
      case 'get':
        if (args.length < 1) throw new Error('get requires sessionId');
        op = { op: 'get', sessionId: args[0] };
        break;
        
      case 'list':
        const filter: any = {};
        if (args[0]) filter.zone = args[0];
        if (args[1]) filter.status = args[1];
        op = { op: 'list', filter: Object.keys(filter).length > 0 ? filter : undefined };
        break;
        
      case 'addPlayer':
        if (args.length < 4) throw new Error('addPlayer requires sessionId, playerId, avatar, style');
        op = { 
          op: 'addPlayer', 
          sessionId: args[0],
          player: {
            playerId: args[1],
            avatar: args[2],
            style: args[3] as any,
            team: args[4]
          }
        };
        break;
        
      case 'removePlayer':
        if (args.length < 2) throw new Error('removePlayer requires sessionId and playerId');
        op = { op: 'removePlayer', sessionId: args[0], playerId: args[1] };
        break;
        
      case 'updateStatus':
        if (args.length < 3) throw new Error('updateStatus requires sessionId, playerId, and status');
        op = { 
          op: 'updateStatus', 
          sessionId: args[0], 
          playerId: args[1], 
          status: args[2] as any 
        };
        break;
        
      case 'delete':
        if (args.length < 1) throw new Error('delete requires sessionId');
        op = { op: 'delete', sessionId: args[0] };
        break;
        
      case 'cleanup':
        op = { op: 'cleanup' };
        break;
        
      case 'stats':
        op = { op: 'stats' };
        break;
        
      case 'simulate':
        if (args.length < 1) throw new Error('simulate requires sessionId');
        op = { 
          op: 'simulate', 
          sessionId: args[0], 
          duration: args[1] ? parseInt(args[1]) : 30 
        };
        break;
        
      case 'export':
        if (args.length < 1) throw new Error('export requires sessionId');
        op = { 
          op: 'export', 
          sessionId: args[0], 
          format: args[1] as any || 'json' 
        };
        break;
        
      case 'validate':
        if (args.length < 1) throw new Error('validate requires JSON file path');
        const data = JSON.parse(fs.readFileSync(args[0], 'utf-8'));
        op = { op: 'validate', data };
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