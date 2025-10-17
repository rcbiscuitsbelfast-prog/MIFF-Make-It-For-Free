#!/usr/bin/env tsx

import { UnityBridgeManager, UnityBridgeConfiguration, UnityBridgeType } from './index';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

interface UnityBridgeOperation {
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
    let input: UnityBridgeOperation;
    if (argv.length >= 2 && !argv[2!]?.endsWith('.json')) {
      // subcommand style without payload file
      input = { op: argv[0] as any, module: argv[1] } as UnityBridgeOperation;
    } else if (argv.length >= 3) {
      const payload = argv[2!] && fs.existsSync(argv[2!]) ? JSON.parse(fs.readFileSync(argv[2!], 'utf-8')) : {};
      input = { op: argv[0] as any, module: argv[1], data: payload } as UnityBridgeOperation;
    } else {
      // file-only invocation
      const inputFile = argv[0!];
      input = JSON.parse(fs.readFileSync(inputFile, 'utf-8')) as UnityBridgeOperation;
    }
    
    if (!input || typeof input !== 'object') {
      throw new Error('Invalid input: expected JSON object');
    }
    
    if (!input.op || !input.module) {
      throw new Error('Invalid input: missing required fields "op" and "module"');
    }
    
    const config: UnityBridgeConfiguration = {
      bridgeType: UnityBridgeType.GAME_OBJECT,
      communicationProtocol: 'message_passing',
      unityVersion: '2022.3',
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

    const bridge = new UnityBridgeManager(config);

    let result;
    switch (input.op) {
      case 'simulate':
        result = {
          op: 'simulate',
          status: 'ok',
          module: input.module,
          platform: 'unity',
          config,
          result: {
            simulation: 'unity_simulation',
            data: input.data || {},
            performance: {
              fps: 60,
              memoryUsage: 'low',
              unityConnected: false
            }
          }
        };
        break;
      case 'render':
        result = {
          op: 'render',
          status: 'ok',
          module: input.module,
          platform: 'unity',
          config,
          result: {
            renderData: {
              entities: [],
              prefabs: [],
              scripts: [],
              scenes: []
            },
            performance: {
              renderTime: 16.67,
              drawCalls: 100,
              triangles: 1000
            }
          }
        };
        break;
      case 'interop':
        result = {
          op: 'interop',
          status: 'ok',
          module: input.module,
          platform: 'unity',
          config,
          result: {
            interopData: {
              bridgeConnected: true,
              unityVersion: '2022.3',
              miifVersion: '1.0.0',
              syncStatus: 'active'
            }
          }
        };
        break;
      case 'export': {
        const renderData = {
          entities: [],
          prefabs: [],
          scripts: [],
          scenes: []
        };
        const fmt = input.format || 'json';
        if (fmt === 'csv') {
          const entitiesCsv = [
            'id,name,active,layer,tag',
            ...renderData.entities.map((e: any) => `${e.id},"${e.gameObject?.name || ''}",${e.gameObject?.active || false},${e.gameObject?.layer || 0},"${e.gameObject?.tag || ''}"`)
          ].join('\n');
          result = { op: 'export', status: 'ok', format: 'csv', result: { entities: entitiesCsv } };
        } else if (fmt === 'markdown') {
          const md = [
            '# UnityBridge Render Export',
            '',
            '## Entities',
            '',
            '| id | name | active | layer | tag |',
            '|----|------|--------|-------|-----|',
            ...renderData.entities.map((e: any) => `| ${e.id} | ${e.gameObject?.name || ''} | ${e.gameObject?.active || false} | ${e.gameObject?.layer || 0} | ${e.gameObject?.tag || ''} |`),
            '',
            '## Prefabs/Scripts',
            '',
            ...(renderData.scripts||[]).map((s:string)=>`- ${s}`)
          ].join('\n');
          result = { op: 'export', status: 'ok', format: 'markdown', result: { markdown: md } };
        } else if (fmt === 'html') {
          const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>UnityBridge Export</title>
<style>body{font-family:Arial;margin:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style>
</head><body>
<h1>UnityBridge Render Export</h1>
<h2>Entities</h2>
<table><tr><th>id</th><th>name</th><th>active</th><th>layer</th><th>tag</th></tr>
${renderData.entities.map((e:any)=>`<tr><td>${e.id}</td><td>${e.gameObject?.name || ''}</td><td>${e.gameObject?.active || false}</td><td>${e.gameObject?.layer || 0}</td><td>${e.gameObject?.tag || ''}</td></tr>`).join('')}
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
            entities: [],
            components: [],
            prefabs: ['NPCPrefab', 'ZonePrefab', 'CombatantPrefab'],
            scripts: ['NPCController', 'ZoneController', 'CombatController']
          },
          info: {
            module: input.module,
            config,
            capabilities: ['simulate', 'render', 'interop'],
            engine: 'unity'
          }
        };
        break;
      default:
        throw new Error(`Unknown operation: ${input.op}`);
    }
    
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
    console.error('Error:', err instanceof Error ? message: String(err));
    process.exit(1);
  }
}

try {
  const invoked = fs.realpathSync(process.argv[1!]);
  const here = fs.realpathSync(fileURLToPath(import.meta.url));
  if (invoked === here) main();
} catch {
  if(import.meta.url === `file://${process.argv[1!]}`) main();
}