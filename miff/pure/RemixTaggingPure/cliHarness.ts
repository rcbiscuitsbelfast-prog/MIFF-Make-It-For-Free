#!/usr/bin/env -S node --no-warnings
import * as fs from 'fs';
import * as path from 'path';
import { RemixTaggingManager } from './Manager';
import { addExportSupport } from '../shared/exportUtils';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

type Operation =
  | { op: 'tag'; moduleId: string; moduleName: string; level?: RemixLevel; reason?: string }
  | { op: 'get'; moduleId: string }
  | { op: 'list' }
  | { op: 'stats' }
  | { op: 'config'; file: string }
  | { op: 'batch'; file: string }
  | { op: 'dump' };

function readJSON(file: string): any {
  const p = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
  return SafeJSONParser.parse(fs.readFileSync(p, 'utf-8'));
}

function main(...args: any[]) {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    console.error('Usage: tsx cliHarness.ts <op|json-file> [args] [--format json|csv|markdown|html]');
    process.exit(1);
  }
  try {
    const mgr = new RemixTaggingManager();
    const first = argv[0];
    let op: Operation;

    if (first.endsWith('.json') && fs.existsSync(first)) {
      op = readJSON(first) as Operation;
    } else {
      switch (first) {
        case 'tag': {
          const moduleId = argv[1];
          const moduleName = argv[2] || moduleId;
          const level = argv[3] as RemixLevel | undefined;
          const reason = argv[4];
          if (!moduleId) throw new Error('tag requires moduleId');
          op = { op: 'tag', moduleId, moduleName, level, reason };
          break;
        }
        case 'get': {
          const moduleId = argv[1];
          if (!moduleId) throw new Error('get requires moduleId');
          op = { op: 'get', moduleId };
          break;
        }
        case 'list': {
          op = { op: 'list' };
          break;
        }
        case 'stats': {
          op = { op: 'stats' };
          break;
        }
        case 'config': {
          const file = argv[1];
          if (!file) throw new Error('config requires JSON file');
          op = { op: 'config', file };
          break;
        }
        case 'batch': {
          const file = argv[1];
          if (!file) throw new Error('batch requires commands JSON file');
          op = { op: 'batch', file };
          break;
        }
        case 'dump': {
          op = { op: 'dump' };
          break;
        }
        default:
          throw new Error(`Unknown command: ${first}`);
      }
    }

    let result: any;
    switch (op.op) {
      case 'tag': {
        result = mgr.tagModule(op.moduleId, op.moduleName, op.level, op.reason);
        break;
      }
      case 'get': {
        result = mgr.getModuleTag(op.moduleId);
        break;
      }
      case 'list': {
        result = mgr.getAllTags();
        break;
      }
      case 'stats': {
        result = mgr.getTaggingStats();
        break;
      }
      case 'config': {
        const cfg = readJSON(op.file);
        mgr.setConfig(cfg);
        result = { applied: true, config: cfg };
        break;
      }
      case 'batch': {
        const cmds = readJSON(op.file) as Array<{ op: string; [k: string]: any }>;
        const outputs: any[] = [];
        for (const cmd of cmds) {
          if (cmd.op === 'tag') {
            outputs.push(mgr.tagModule(cmd.moduleId, cmd.moduleName || cmd.moduleId, cmd.level, cmd.reason));
          } else if (cmd.op === 'get') {
            outputs.push(mgr.getModuleTag(cmd.moduleId));
          } else if (cmd.op === 'list') {
            outputs.push(mgr.getAllTags());
          } else if (cmd.op === 'stats') {
            outputs.push(mgr.getTaggingStats());
          }
        }
        result = { outputs, total: outputs.length };
        break;
      }
      case 'dump': {
        result = {
          operations: ['tag', 'get', 'list', 'stats', 'config', 'batch', 'dump'],
          description: 'RemixTaggingPure - compliance tagging and stats'
        };
        break;
      }
    }

    const fmtArg = argv.find(a => a.startsWith('--format='))?.split('=')[1] || argv[argv.indexOf('--format') + 1];
    const valid = ['json', 'csv', 'markdown', 'html'];
    const exportFormat = valid.includes(fmtArg || '') ? fmtArg : undefined;
    const { result: finalResult, exportData } = addExportSupport(
      result,
      exportFormat,
      'RemixTaggingPure Export',
      'Module tagging results'
    );

    console.info(JSON.stringify({
      op: op.op,
      status: 'ok',
      result: finalResult,
      timestamp: Date.now()
    }, null, 2));
    if (exportData) console.error('\n' + exportData);
  } catch (error) {
    console.error(JSON.stringify({
      op: 'error',
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: Date.now()
    }, null, 2));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}