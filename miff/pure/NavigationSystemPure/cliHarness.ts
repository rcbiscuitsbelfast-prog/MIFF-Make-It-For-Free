#!/usr/bin/env ts-node

import { pathfind, Grid, Point } from './index';
import fs from 'fs';

const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Usage: ts-node cliHarness.ts <input-file>');
  process.exit(1);
}

try {
  const input = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  const grid: Grid = input.grid;
  const start: Point = input.start;
  const goal: Point = input.goal;
  
  // Convert walls array to Set for the API
  grid.walls = new Set(grid.walls);
  
  const result = pathfind(grid, start, goal);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}