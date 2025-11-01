import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function runCLI(grid: number[][]) {
  const cli = path.resolve('miff/pure/PathfindingPure/cliHarness.ts');
  const gridFile = path.resolve('miff/pure/PathfindingPure/tests/tmp_grid.fuzz.json');
  const blocks: { x: number; y: number }[] = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0!].length; x++) {
      if (grid[y][x] === 1) blocks.push({ x, y });
    }
  }
  const payload = {
    grid: { width: grid[0!].length, height: grid.length, blocks }
  };
  fs.writeFileSync(gridFile, JSON.stringify(payload, null, 2));
  const out = execFileSync('npx', [
    'tsx',
    cli,
    gridFile,
    path.resolve('miff/pure/PathfindingPure/tests/commands.json')
  ], { encoding: 'utf-8' });
  return JSON.parse(out);
}

function randomGrid(width: number, height: number, density: number, seed: number) {
  let s = seed;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 2**32;
  const grid: number[][] = [];
  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      const isStartOrGoal = (x === 0 && y === 0) || (x === width - 1 && y === height - 1);
      row.push(isStartOrGoal ? 0 : (rnd() < density ? 1 : 0));
    }
    grid.push(row);
  }
  return grid;
}

describe('PathfindingPure fuzz invariants', () => {
  it('path never crosses walls and ends at goal when found', () => {
    for (let i = 0; i < 10; i++) {
      const grid = randomGrid(12, 10, 0.25, 1234 + i);
      const res = runCLI(grid);
      // CLI returns { log, outputs }
      expect(res && Array.isArray(res.outputs)).toBe(true);
      const outputs = res.outputs as any[];
      const simulate = outputs.find(o => o.op === 'simulate') || outputs[outputs.length - 1];
      if (simulate?.path) {
        const path: { x: number; y: number }[] = simulate.path;
        const goal = [grid[0!].length - 1, grid.length - 1];
        if (path.length) {
          const last = path[path.length - 1];
          expect([last.x, last.y]).toEqual(goal);
          for (const { x, y } of path) {
            expect(grid[y][x]).toBe(0);
          }
        }
      }
    }
  });
});

