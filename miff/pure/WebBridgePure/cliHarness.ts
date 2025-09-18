#!/usr/bin/env tsx

import { WebBridge } from './Bridge';
import * as fs from 'fs';
import * as path from 'path';

interface WebBridgeOperation {
  op: 'simulate' | 'render' | 'interop' | 'dump' | 'export';
  module: string;
  data?: Record<string, unknown>;
  config?: Record<string, unknown>;
  format?: 'json' | 'csv' | 'markdown' | 'html';
}

function main() {
  const inputFile = process.argv[2];
  if (!inputFile) {
    console.error('Usage: tsx cliHarness.ts <input-file>');
    process.exit(1);
  }

  try {
    const input = JSON.parse(fs.readFileSync(inputFile, 'utf-8')) as WebBridgeOperation;
    
    if (!input || typeof input !== 'object') {
      throw new Error('Invalid input: expected JSON object');
    }
    
    if (!input.op || !input.module) {
      throw new Error('Invalid input: missing required fields "op" and "module"');
    }
    
    const bridge = new WebBridge();
    const config = input.config || {
      targetVersion: 'ES2020',
      useWebGL: true,
      canvasId: 'gameCanvas',
      assetPath: '/assets'
    };
    
    let result;
    switch (input.op) {
      case 'simulate':
        result = bridge.simulate(input.module, input.data || {}, config);
        break;
      case 'render':
        result = bridge.render(input.module, input.data || {}, config);
        break;
      case 'interop':
        result = bridge.interop(input.module, input.data || {}, config);
        break;
      case 'export': {
        const rendered = bridge.render(input.module, input.data || {}, config);
        const rd = (rendered as any).renderData || { entities: [], components: [], sprites: [], sounds: [], scripts: [], styles: [] };
        const fmt = input.format || 'json';
        if (fmt === 'csv') {
          const entitiesCsv = [
            'id,type,x,y,width,height,properties',
            ...rd.entities.map((e: any) => `${e.id},${e.type},${e.x||0},${e.y||0},${e.width||''},${e.height||''},"${JSON.stringify(e.properties||{}).replace(/"/g,'""')}"`)
          ].join('\n');
          result = { op: 'export', status: 'ok', format: 'csv', result: { entities: entitiesCsv } };
        } else if (fmt === 'markdown') {
          const md = [
            '# WebBridge Render Export',
            '',
            '## Entities',
            '',
            '| id | type | x | y | size |',
            '|----|------|---|---|------|',
            ...rd.entities.map((e: any) => `| ${e.id} | ${e.type} | ${e.x||0} | ${e.y||0} | ${e.width||''}x${e.height||''} |`),
            '',
            '## Sprites',
            '',
            ...(rd.sprites||[]).map((s:string)=>`- ${s}`),
            '',
            '## Scripts',
            '',
            ...(rd.scripts||[]).map((s:string)=>`- ${s}`)
          ].join('\n');
          result = { op: 'export', status: 'ok', format: 'markdown', result: { markdown: md } };
        } else if (fmt === 'html') {
          const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>WebBridge Export</title>
<style>body{font-family:Arial;margin:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style>
</head><body>
<h1>WebBridge Render Export</h1>
<h2>Entities</h2>
<table><tr><th>id</th><th>type</th><th>x</th><th>y</th><th>width</th><th>height</th></tr>
${rd.entities.map((e:any)=>`<tr><td>${e.id}</td><td>${e.type}</td><td>${e.x||0}</td><td>${e.y||0}</td><td>${e.width||''}</td><td>${e.height||''}</td></tr>`).join('')}
</table>
<h2>Sprites</h2>
<ul>${(rd.sprites||[]).map((s:string)=>`<li>${s}</li>`).join('')}</ul>
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
          info: {
            module: input.module,
            config,
            capabilities: ['simulate', 'render', 'interop'],
            platform: 'web'
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

if(import.meta.url === `file://${process.argv[1]}`) main();