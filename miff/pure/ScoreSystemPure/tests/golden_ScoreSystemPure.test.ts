import path from 'path';
import fs from 'fs';

/**
 * Golden test for ScoreSystemPure CLI harness
 * Tests deterministic score accumulation with add and multiply operations
 * 
 * Remix-safe expectations:
 * - Score calculations are deterministic and pure
 * - Add operations increase score by exact values
 * - Multiply operations round results for consistency
 * - No external state or side effects
 */
test('golden score system flow', () => {
  const root = path.resolve(__dirname, '..');
  const scoreEvents = path.resolve(root, 'fixtures/score_events.json');
  
  // Run CLI harness with score events
  const out = (global as any).testUtils.runCLI(
    path.resolve(root, 'cliHarness.ts'), 
    [scoreEvents]
  );
  
  const got = JSON.parse(out);
  
  // Verify expected structure
  expect(got.op).toBe('score');
  expect(got.status).toBe('ok');
  expect(got.result).toBeDefined();
  expect(got.result.score).toBeDefined();
  
  // Verify deterministic score calculation:
  // Start: 100
  // Add 50: 100 + 50 = 150
  // Multiply by 2: 150 * 2 = 300
  // Add 25: 300 + 25 = 325
  expect(got.result.score).toBe(325);
});