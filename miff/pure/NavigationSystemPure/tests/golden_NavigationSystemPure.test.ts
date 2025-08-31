import * as path from 'path';
import * as fs from 'fs';

/**
 * Golden test for NavigationSystemPure CLI harness
 * Tests deterministic pathfinding with wall avoidance
 * 
 * Remix-safe expectations:
 * - Pathfinding is deterministic and pure
 * - Paths avoid walls when possible
 * - Movement follows manhattan distance rules
 * - No external state or side effects
 */
test('golden navigation system flow', () => {
  const root = path.resolve(__dirname, '..');
  const grid = path.resolve(root, 'fixtures/grid.json');
  
  // Run CLI harness with navigation data
  const out = (global as any).testUtils.runCLI(
    path.resolve(root, 'cliHarness.ts'), 
    [grid]
  );
  
  const got = JSON.parse(out);
  
  // Verify expected structure
  expect(got.op).toBe('nav.path');
  expect(got.status).toBe('ok');
  expect(got.path).toBeDefined();
  expect(got.path).toBeInstanceOf(Array);
  
  // Verify deterministic pathfinding
  const pathResult = got.path;
  
  // Path should start moving from start point (algorithm doesn't include start in path)
  expect(pathResult[0]).toEqual({ x: 1, y: 0 });
  
  // Path should end at goal point
  expect(pathResult[pathResult.length - 1]).toEqual({ x: 9, y: 9 });
  
  // Path should avoid walls at (5,5), (5,6), (6,5), (6,6)
  const wallPositions = ['5,5', '5,6', '6,5', '6,6'];
  for (const pos of pathResult) {
    const posKey = `${pos.x},${pos.y}`;
    expect(wallPositions).not.toContain(posKey);
  }
  
  // Path should be continuous (each step moves by 1 in x or y)
  for (let i = 1; i < pathResult.length; i++) {
    const prev = pathResult[i - 1];
    const curr = pathResult[i];
    const dx = Math.abs(curr.x - prev.x);
    const dy = Math.abs(curr.y - prev.y);
    expect(dx + dy).toBe(1); // Manhattan distance of 1
  }
});