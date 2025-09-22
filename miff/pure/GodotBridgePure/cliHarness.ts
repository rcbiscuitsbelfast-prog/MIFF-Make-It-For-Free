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
    
    const bridge = new GodotBridge();
    const config = {
      targetVersion: '4.0',
      useGDScript: true,
      scenePath: '/scenes',
      scriptPath: '/scripts',
      resourcePath: '/resources',
      language: 'gdscript'
    } as any;
    if (input.config && typeof input.config === 'object') {
      Object.assign(config, input.config);
      if (input.config.language) config.language = input.config.language;
    }
    
    let result;
    switch (input.op) {
      case 'simulate':
        result = bridge.simulate(input.module, input.data || {}, config);
        break;
      case 'render':
        result = bridge.render(input.module, input.data || {}, config);
        // Normalize scripts extension based on config.language if provided
        const lang = (input.config as any)?.language || (config as any)?.language;
        if (Array.isArray(result?.renderData?.scripts) && lang === 'csharp') {
          result.renderData.scripts = result.renderData.scripts.map((s: string) => s.endsWith('.gd') ? s.replace(/\.gd$/, '.cs') : s);
        }
        break;
      case 'interop':
        result = bridge.interop(input.module, input.data || {}, config);
        break;
      case 'export': {
        const rendered: any = bridge.render(input.module, input.data || {}, config);
        const rd = rendered?.renderData || { entities: [], components: [], sprites: [], sounds: [], scripts: [], styles: [] };
        const fmt = input.format || 'json';
        if (fmt === 'csv') {
          const entitiesCsv = [
            'id,type,x,y,width,height,properties',
            ...rd.entities.map((e: any) => `${e.id},${e.type},${e.x||0},${e.y||0},${e.width||''},${e.height||''},"${JSON.stringify(e.properties||{}).replace(/"/g,'""')}"`)
          ].join('\n');
          result = { op: 'export', status: 'ok', format: 'csv', result: { entities: entitiesCsv } };
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
          result = { op: 'export', status: 'ok', format: 'markdown', result: { markdown: md } };
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
          result = { op: 'export', status: 'ok', format: 'html', result: { html } };
        } else {
          result = { op: 'export', status: 'ok', format: 'json', result: rd };
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
          info: {
            module: input.module,
            config,
            capabilities: ['simulate', 'render', 'interop'],
            engine: 'godot'
          }
        };
        break;
      default:
        throw new Error(`Unknown operation: ${input.op}`);
    }
    
    console.log(JSON.stringify(result, null, 2));
    
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