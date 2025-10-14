#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { PathfindingManager } from './PathfindingManager';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

type Cmd = 
  | { op: 'list' }
  | { op: 'simulate'; start: { x: number; y: number }; goal: { x: number; y: number } }
  | { op: 'dump' };

function main(...args: any[]) {
  const gridPath = process.argv[2] || '';
  const commandsPath = process.argv[3] || '';
  const manager = new PathfindingManager();

  // Load grid if provided
  let gridData: any = null;
  if (gridPath && fs.existsSync(gridPath)) {
    gridData = SafeJSONParser.parse(fs.readFileSync(path.resolve(gridPath), 'utf-8'));
    if (gridData.grid) {
      manager.loadGrid(gridData.grid);
    }
  }

  const log: string[] = [];
  const cmds: Cmd[] = commandsPath ? SafeJSONParser.parse(fs.readFileSync(path.resolve(commandsPath), 'utf-8')) : [
    { op: 'list' } as Cmd
  ];
  const outputs: any[] = [];

  for (const c of cmds) {
    if (c.op === 'list') {
      const result = manager.getGrid();
      outputs.push({ op: 'list', grid: result.result?.grid || [] });
    } else if (c.op === 'simulate') {
      const result = manager.findPath(c.start, c.goal);
      outputs.push({ op: 'simulate', path: result.result?.path || [] });
    } else if (c.op === 'dump') {
      const result = manager.getGrid();
      outputs.push({ op: 'dump', grid: result.result?.grid || { width: 0, height: 0 } });
    }
  }

  const out = { log, outputs };
  console.info(JSON.stringify(out, null, 2));
}

if(import.meta.url === `file://${process.argv[1]}`) main();