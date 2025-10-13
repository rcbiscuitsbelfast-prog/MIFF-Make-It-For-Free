#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { pathfind, createGrid, isPathClear, Grid, Point } from './index';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

type Cmd =
  | { op: 'pathfind'; start: Point; goal: Point }
  | { op: 'check'; start: Point; goal: Point }
  | { op: 'list' }
  | { op: 'dump' };

function main() {
  const inputPath = process.argv[2] || 'NavigationSystemPure/fixtures/grid.json';
  const commandsPath = process.argv[3] || '';
  
  // Use safe path resolution and JSON parsing
  const { SafePathUtils } = require('../shared/security/SafePathUtils');
  const { SafeJSONParser } = require('../shared/security/SafeJSONParser');
  
  const pathResult = SafePathUtils.safeReadFile(inputPath, process.cwd());
  if (!pathResult.success) {
    console.error('Error reading input file:', pathResult.error);
    process.exit(1);
  }
  
  const jsonResult = SafeJSONParser.parse(pathResult.data!);
  if (!jsonResult.success) {
    console.error('Error parsing JSON:', jsonResult.error);
    process.exit(1);
  }
  
  const input = jsonResult.data;
  const grid: Grid = {
    width: input.grid.width,
    height: input.grid.height,
    walls: new Set(input.grid.walls)
  };

  const log: string[] = [];

  const cmds: Cmd[] = commandsPath ? SafeJSONParser.parse(fs.readFileSync(path.resolve(commandsPath), 'utf-8')) : [
    { op: 'pathfind', start: input.start, goal: input.goal } as Cmd
  ];
  const outputs: any[] = [];

  for (const c of cmds) {
    if (c.op === 'pathfind') {
      const result = pathfind(grid, c.start, c.goal);
      outputs.push(result);
    } else if (c.op === 'check') {
      const clear = isPathClear(grid, c.start, c.goal);
      outputs.push({ op: 'check', clear, start: c.start, goal: c.goal });
    } else if (c.op === 'list') {
      outputs.push({ op: 'list', grid: { width: grid.width, height: grid.height, wallCount: grid.walls.size } });
    } else if (c.op === 'dump') {
      outputs.push({ op: 'dump', grid: { width: grid.width, height: grid.height, walls: Array.from(grid.walls) } });
    }
  }

  const out = { log, outputs };
  console.info(JSON.stringify(out, null, 2));
}

if(import.meta.url === `file://${process.argv[1]}`) main();