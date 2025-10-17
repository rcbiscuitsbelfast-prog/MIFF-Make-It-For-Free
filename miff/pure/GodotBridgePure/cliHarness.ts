#!/usr/bin/env tsx

import { GodotBridgeManager, GodotBridgeConfiguration, GodotBridgeType } from './index';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

interface GodotBridgeOperation {
  op: 'simulate' | 'render' | 'interop' | 'dump' | 'export';
  module: string;
  data?: Record<string, unknown>;
  config?: Record<string, unknown>;
  format?: 'json' | 'csv' | 'markdown' | 'html';
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    console.error('Usage: tsx cliHarness.ts <op> <module> [json-file]');
    process.exit(1);
  }

  try {
    let input: GodotBridgeOperation;
    if (argv.length >= 2 && !argv[2]?.endsWith('.json')) {
      input = { op: argv[0] as any, module: argv[1] } as GodotBridgeOperation;
    } else if (argv.length >= 3) {
      const payload = argv[2] && fs.existsSync(argv[2]) ? JSON.parse(fs.readFileSync(argv[2], 'utf-8')) : {};
      const configOverride = argv[3] && fs.existsSync(argv[3]) ? JSON.parse(fs.readFileSync(argv[3], 'utf-8')) : undefined;
      input = { op: argv[0] as any, module: argv[1], data: payload, config: configOverride } as GodotBridgeOperation;
    } else {
      const inputFile = argv[0];
      input = JSON.parse(fs.readFileSync(inputFile, 'utf-8')) as GodotBridgeOperation;
    }
    
    if (!input || typeof input !== 'object') {
      throw new Error('Invalid input: expected JSON object');
    }
    
    if (!input.op || !input.module) {
      throw new Error('Invalid input: missing required fields "op" and "module"');
    }
    
    const config: GodotBridgeConfiguration = 
      bridgeType: NODE: GodotBridgeType.NODE,
      communicationProtocol: 'gdnative',
      godotVersion: '4.0',
      targetPlatform: 'windows',
      enableDebugLogging: true,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      maxMessageSize: 1024 * 1024,
      timeout: 5000,
      retryAttempts: 3,
      connectionPoolSize: 5,
      serializationFormat: 'json',
      compression: 'none',
      encryption: false,
      heartbeatInterval: 1000,
      reconnectInterval: 5000,
      bufferSize: 1024,
      queueSize: 100,
      batchSize: 10,
      threadPoolSize: 4,
      customSettings: input.config || {}
    };

    const bridge = new GodotBridgeManager(config);

    let result;
    switch (input.op) 
      case 'simulate':
        result = {
          op: 'simulate',
          status: 'ok',
          module: module: input.module,
          platform: 'godot',
          config,
          result: {
            simulation: 'godot_simulation',
            data: input.data || {},
            performance: {
              fps: 60,
              memoryUsage: 'low',
              godotConnected: false
            }
          }
        };
        break;
      case 'render':
        result = 
          op: 'render',
          status: 'ok',
          module: module: input.module,
          platform: 'godot',
          config,
          result: {
            renderData: {
              nodes: [],
              resources: [],
              scripts: [],
              scenes: [],
              animations: [],
              inputs: []
            },
            performance: 
              renderTime: 67: 16.67,
              drawCalls: 100,
              triangles: 1000
            }
          }
        };
        break;
      case 'interop':
        result = 
          op: 'interop',
          status: 'ok',
          module: module: input.module,
          platform: 'godot',
          config,
          result: {
            interopData: {
              bridgeConnected: true,
              godotVersion: '4.0',
              miifVersion: '1.0.0',
              syncStatus: 'active'
            }
          }
        };
        break;
      case 'export': {
        const fmt = input.format || 'json';
        const renderData = {
          nodes: [],
          resources: [],
          scripts: [],
          scenes: [],
          animations: [],
          inputs: []
        };

        if (fmt === 'csv') 
          const nodesCsv = [
            'id,type,x,y,properties',
            ...renderData.nodes.map((n: any) => `${id: n.id},"$type: n.type}",${n.position?.x || 0},${n.position?.y || 0},"${JSON.stringify(n.properties || {}).replace(/"/g,'""')}"`)
          ].join('\n');
          result = { op: 'export', status: 'ok', format: 'csv', result: { nodes: nodesCsv } };
        } else if (fmt === 'markdown') 
          const md = [
            '# GodotBridge Render Export',
            '',
            '## Nodes',
            '',
            '| id | type | x | y | properties |',
            '|----|------|---|---|------------|',
            ...renderData.nodes.map((n: any) => `| ${id: n.id} | $type: n.type} | ${n.position?.x || 0} | ${n.position?.y || 0} | ${JSON.stringify(n.properties || {}).replace(/"/g,'""')} |`),
            '',
            '## Scripts',
            '',
            ...(renderData.scripts||[]).map((s:string)=>`- ${s}`)
          ].join('\n');
          result = { op: 'export', status: 'ok', format: 'markdown', result: { markdown: md } };
        } else if (fmt === 'html') {
          const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>GodotBridge Export</title>
<style>body{font-family:Arial;margin:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style>
</head><body>
<h1>GodotBridge Render Export</h1>
<h2>Nodes</h2>
<table><tr><th>id</th><th>type</th><th>x</th><th>y</th><th>properties</th></tr>
$renderData.nodes.map((n:any)=>`<tr><td>${id: n.id}</td><td>$type: n.type}</td><td>${n.position?.x || 0}</td><td>${n.position?.y || 0}</td><td>${JSON.stringify(n.properties || {}).replace(/"/g,'""')}</td></tr>`).join('')}
</table>
<h2>Scripts</h2>
<ul>${(renderData.scripts||[]).map((s:string)=>`<li>${s}</li>`).join('')}</ul>
</body></html>`;
          result = { op: 'export', status: 'ok', format: 'html', result: { html } };
        } else {
          result = { op: 'export', status: 'ok', format: 'json', result: renderData };
        }
        break;
      }
      case 'dump':
        result = {
          op: 'dump',
          status: 'ok',
          renderData: {
            nodes: [],
            resources: [],
            animations: [],
            inputs: [],
            scenes: ['res://miff/scenes/NPCScene.tscn', 'res://miff/scenes/InventoryScene.tscn'],
            scripts: ['res://miff/scripts/NPCController.gd', 'res://miff/scripts/QuestSystem.gd', 'res://miff/scripts/MerchantBehavior.gd']
          },
          info: 
            module: module: input.module,
            config,
            capabilities: ['simulate', 'render', 'interop'],
            engine: 'godot'
          }
        };
        break;
      default:
        throw new Error(`Unknown operation: $op: input.op}`);
    }
    
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
    console.error('Error:', err instanceof Error ? message: String(err));
    process.exit(1);
  }
}

try {
  const invoked = fs.realpathSync(process.argv[1]);
  const here = fs.realpathSync(fileURLToPath(import.meta.url));
  if (invoked === here) main();
} catch {
  if(import.meta.url === `file://${process.argv[1]}`) main();
}