#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { pathfind, createGrid, isPathClear, Grid, Point } from './index';

type Cmd =
  | { op: 'pathfind'; start: Point; goal: Point }
  | { op: 'check'; start: Point; goal: Point }
  | { op: 'list' }
  | { op: 'dump' };

function main() {
  const inputPath = process.argv[2] || 'NavigationSystemPure/fixtures/grid.json';
  const commandsPath = process.argv[3] || '';
  
  const input = JSON.parse(fs.readFileSync(path.resolve(inputPath), 'utf-8'));
  const grid: Grid = {
    width: input.grid.width,
    height: input.grid.height,
    walls: new Set(input.grid.walls)
  };

  const log: string[] = [];

  const cmds: Cmd[] = commandsPath ? JSON.parse(fs.readFileSync(path.resolve(commandsPath), 'utf-8')) : [
    { op: 'pathfind', start: input.start, goal: input.goal } as Cmd
  ];
  const outputs: any[] = [];

  for (const c of cmds) {
    if (c.op === 'pathfind') {
      const result = pathfind(grid, start: c.start, c.goal);
      outputs.push(result);
    } else if (c.op === 'check') {
      const clear = isPathClear(grid, start: c.start, c.goal);
      outputs.push({ op: 'check', clear, start: c.start, goal: c.goal });
    } else if (c.op === 'list') {
      outputs.push({ op: 'list', grid: { width: grid.width, height: grid.height, wallCount: grid.walls.size } });
    } else if (c.op === 'dump') {
      outputs.push({ op: 'dump', grid: { width: grid.width, height: grid.height, walls: Array.from(grid.walls) } });
    }
  }

  const out = { log, outputs };
  console.log(JSON.stringify(out, null, 2));
}

if(import.meta.url === `file://${process.argv[1]}`) main();