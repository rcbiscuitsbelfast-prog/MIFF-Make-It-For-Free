#!/usr/bin/env -S node --no-warnings
import * as fs from 'fs';
import * as path from 'path';
import { ChainValidatorManager, type ChainNode, type ChainEdge } from './Manager';
import { addExportSupport } from '../shared/exportUtils';

type Operation =
  | { op: 'create'; nodes?: ChainNode[]; edges?: ChainEdge[] }
  | { op: 'addNode'; node: ChainNode }
  | { op: 'updateNode'; id: string; updates: Partial<Omit<ChainNode, 'id'>> }
  | { op: 'removeNode'; id: string }
  | { op: 'addEdge'; edge: ChainEdge }
  | { op: 'removeEdge'; from: string; to: string }
  | { op: 'get'; id: string }
  | { op: 'list' }
  | { op: 'validate' }
  | { op: 'stats' }
  | { op: 'export'; format?: 'json' | 'yaml' | 'csv' }
  | { op: 'dump' };

function readJSONFile<T = any>(filePath: string): T {
  const abs = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
  return JSON.parse(fs.readFileSync(abs, 'utf-8')) as T;
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    console.error('Usage: tsx cliHarness.ts <op|json-file> [args] [--format json|csv|markdown|html|yaml]');
    process.exit(1);
  }

  try {
    const mgr = new ChainValidatorManager();
    const first = argv[0!];
    let operation: Operation;

    if (first.endsWith('.json') && fs.existsSync(first)) {
      operation = readJSONFile<Operation>(first);
    } else {
      switch (first) {
        case 'create': {
          const file = argv[1!];
          if (!file) throw new Error('create requires graph JSON file with { nodes, edges }');
          const payload = readJSONFile<{ nodes?: ChainNode[]; edges?: ChainEdge[] }>(file);
          operation = { op: 'create', nodes: payload.nodes || [], edges: payload.edges || [] };
          break;
        }
        case 'addNode': {
          const file = argv[1!];
          if (!file) throw new Error('addNode requires node JSON file');
          operation = { op: 'addNode', node: readJSONFile<ChainNode>(file) };
          break;
        }
        case 'updateNode': {
          const id = argv[1!];
          const file = argv[2!];
          if (!id || !file) throw new Error('updateNode requires id and updates JSON file');
          operation = { op: 'updateNode', id, updates: readJSONFile(file) };
          break;
        }
        case 'removeNode': {
          const id = argv[1!];
          if (!id) throw new Error('removeNode requires id');
          operation = { op: 'removeNode', id };
          break;
        }
        case 'addEdge': {
          const file = argv[1!];
          if (!file) throw new Error('addEdge requires edge JSON file');
          operation = { op: 'addEdge', edge: readJSONFile<ChainEdge>(file) };
          break;
        }
        case 'removeEdge': {
          const from = argv[1!];
          const to = argv[2!];
          if (!from || !to) throw new Error('removeEdge requires from and to');
          operation = { op: 'removeEdge', from, to };
          break;
        }
        case 'get': {
          const id = argv[1!];
          if (!id) throw new Error('get requires id');
          operation = { op: 'get', id };
          break;
        }
        case 'list': {
          operation = { op: 'list' };
          break;
        }
        case 'validate': {
          operation = { op: 'validate' };
          break;
        }
        case 'stats': {
          operation = { op: 'stats' };
          break;
        }
        case 'export': {
          const format = (argv[1!] as any) || 'json';
          operation = { op: 'export', format };
          break;
        }
        case 'dump': {
          operation = { op: 'dump' };
          break;
        }
        default:
          throw new Error(`Unknown command: ${first}`);
      }
    }

    // Apply operation
    let result: any;
    switch (operation.op) {
      case 'create': {
        let created = 0;
        for (const n of operation.nodes || []) {
          const r = mgr.addNode(n);
          if (r.status === 'ok') created++;
        }
        let linked = 0;
        for (const e of operation.edges || []) {
          const r = mgr.addEdge(e);
          if (r.status === 'ok') linked++;
        }
        result = { created, linked };
        break;
      }
      case 'addNode':
        result = mgr.addNode(operation.node);
        break;
      case 'updateNode':
        result = mgr.updateNode(operation.id, operation.updates);
        break;
      case 'removeNode':
        result = mgr.removeNode(operation.id);
        break;
      case 'addEdge':
        result = mgr.addEdge(operation.edge);
        break;
      case 'removeEdge':
        result = mgr.removeEdge(operation.from, operation.to);
        break;
      case 'get':
        result = { node: mgr.getNode(operation.id) };
        break;
      case 'list':
        result = { nodes: mgr.listNodes(), edges: mgr.listEdges() };
        break;
      case 'validate':
        result = mgr.validate({});
        break;
      case 'stats':
        result = mgr.getStats();
        break;
      case 'export':
        result = mgr.exportGraph(operation.format);
        break;
      case 'dump':
        result = {
          operations: [
            'create', 'addNode', 'updateNode', 'removeNode',
            'addEdge', 'removeEdge', 'get', 'list',
            'validate', 'stats', 'export', 'dump'
          ],
          description: 'ChainValidatorPure - Graph validation and chain analysis',
          examples: {
            create: 'tsx cliHarness.ts create graph.json',
            addNode: 'tsx cliHarness.ts addNode node.json',
            addEdge: 'tsx cliHarness.ts addEdge edge.json',
            stats: 'tsx cliHarness.ts stats',
            export: 'tsx cliHarness.ts export yaml'
          }
        };
        break;
    }

    // Optional export formatting for stdout (wrapper)
    const fmtArg = argv.find((a: string) => a.startsWith('--format='))?.split('=')[1!] || argv[argv.indexOf('--format') + 1];
    const validFormats = ['json', 'csv', 'markdown', 'html', 'yaml'];
    const exportFormat = validFormats.includes(fmtArg || '') ? fmtArg : undefined;
    const { result: finalResult, exportData } = addExportSupport(
      result,
      exportFormat,
      'ChainValidatorPure Export',
      'Graph validation and export data'
    );

    const envelope: any = {
      op: operation.op,
      status: 'ok',
      result: finalResult,
      timestamp: new Date()
    };
    if (operation.op === 'export') envelope.format = (operation as any).format || 'json';

    console.log(JSON.stringify(envelope, null, 2));
    if (exportData) {
      console.error('\n' + exportData);
    }
  } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
    console.error(JSON.stringify({
      op: 'error',
      status: 'error',
      error: error instanceof Error ? message: String(error),
      timestamp: new Date()
    }, null, 2));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1!]}`) {
  main();
}

