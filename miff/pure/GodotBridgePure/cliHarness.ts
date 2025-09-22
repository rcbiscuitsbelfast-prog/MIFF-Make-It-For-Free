#!/usr/bin/env tsx

import { GodotBridge } from './Bridge';
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

function printHelp(): void {
  console.log('GodotBridgePure CLI - Godot engine bridge for MIFF modules');
  console.log('');
  console.log('Usage:');
  console.log('  tsx cliHarness.ts <commands.json> [--flags]');
  console.log('');
  console.log('Examples:');
  console.log('  tsx cliHarness.ts commands.json');
}

function main() {
  const [commandsPath, ...rest] = process.argv.slice(2);
  
  if (!commandsPath || commandsPath === 'help' || commandsPath === '--help' || commandsPath === '-h') {
    printHelp();
    return;
  }

  try {
    if (!fs.existsSync(commandsPath)) {
      console.log(`Error: Commands file not found: ${commandsPath}`);
      process.exitCode = 1;
      return;
    }

    const cmds: GodotBridgeOperation[] = JSON.parse(fs.readFileSync(path.resolve(commandsPath), 'utf-8'));
    const bridge = new GodotBridge();
    const results: { op: string; status: string; result?: any }[] = [];

    for (const cmd of cmds) {
      try {
        if (!cmd.op || !cmd.module) {
          throw new Error('Missing required fields "op" and "module"');
        }

        const config = cmd.config || {
          targetVersion: '4.0',
          useGDScript: true,
          scenePath: '/scenes',
          scriptPath: '/scripts',
          resourcePath: '/resources'
        };
        
        let result: any;
        
        switch (cmd.op) {
          case 'simulate':
            result = bridge.simulate(cmd.module, cmd.data || {}, config);
            break;
          case 'render':
            result = bridge.render(cmd.module, cmd.data || {}, config);
            break;
          case 'interop':
            result = bridge.interop(cmd.module, cmd.data || {}, config);
            break;
          case 'export': {
            const rendered: any = bridge.render(cmd.module, cmd.data || {}, config);
            const rd = rendered?.renderData || { entities: [], components: [], sprites: [], sounds: [], scripts: [], styles: [] };
            const fmt = cmd.format || 'json';
            if (fmt === 'csv') {
              const entitiesCsv = [
                'id,type,x,y,width,height,properties',
                ...rd.entities.map((e: any) => `${e.id},${e.type},${e.x||0},${e.y||0},${e.width||''},${e.height||''},"${JSON.stringify(e.properties||{}).replace(/"/g,'""')}"`)
              ].join('\n');
              result = { format: 'csv', entities: entitiesCsv };
            } else if (fmt === 'markdown') {
              const md = [
                '# GodotBridge Render Export',
                '',
                '## Entities',
                '',
                '| id | type | x | y | size |',
                '|----|------|---|---|------|',
                ...rd.entities.map((e: any) => `| ${e.id} | ${e.type} | ${e.x||0} | ${e.y||0} | ${e.width||''}x${e.height||''} |`),
                '',
                '## Scripts',
                '',
                ...(rd.scripts||[]).map((s:string)=>`- ${s}`)
              ].join('\n');
              result = { format: 'markdown', markdown: md };
            } else if (fmt === 'html') {
              const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>GodotBridge Export</title>
<style>body{font-family:Arial;margin:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style>
</head><body>
<h1>GodotBridge Render Export</h1>
<h2>Entities</h2>
<table><tr><th>id</th><th>type</th><th>x</th><th>y</th><th>width</th><th>height</th></tr>
${rd.entities.map((e:any)=>`<tr><td>${e.id}</td><td>${e.type}</td><td>${e.x||0}</td><td>${e.y||0}</td><td>${e.width||''}</td><td>${e.height||''}</td></tr>`).join('')}
</table>
<h2>Scripts</h2>
<ul>${(rd.scripts||[]).map((s:string)=>`<li>${s}</li>`).join('')}</ul>
</body></html>`;
              result = { format: 'html', html };
            } else {
              result = rd;
            }
            break;
          }
          case 'dump':
            result = {
              module: cmd.module,
              config,
              capabilities: ['simulate', 'render', 'interop'],
              engine: 'godot'
            };
            break;
          default:
            throw new Error(`Unknown operation: ${cmd.op}`);
        }
        
        results.push({ op: cmd.op, status: 'ok', result });
      } catch (error) {
        results.push({ op: cmd.op, status: 'error', result: { error: error.message } });
      }
    }

    console.log(JSON.stringify(results, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
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