import path from 'path';
import fs from 'fs';

/**
 * Golden test for CameraBridgePure CLI harness
 * Tests deterministic camera following with lerp interpolation
 * 
 * Remix-safe expectations:
 * - Camera calculations are deterministic and pure
 * - Position updates use lerp interpolation with alpha
 * - Results are rounded to 2 decimal places for consistency
 * - No external state or side effects
 */
test('golden camera bridge flow', () => {
  const root = path.resolve(__dirname, '..');
  const camera = path.resolve(root, 'fixtures/camera.json');
  
  // Run CLI harness with camera data
  const out = (global as any).testUtils.runCLI(
    path.resolve(root, 'cliHarness.ts'), 
    [camera]
  );
  
  const got = JSON.parse(out);
  
  // Verify expected structure
  expect(got.op).toBe('camera.follow');
  expect(got.status).toBe('ok');
  expect(got.result).toBeDefined();
  expect(got.result.x).toBeDefined();
  expect(got.result.y).toBeDefined();
  expect(got.result.zoom).toBeDefined();
  
  // Verify deterministic camera calculation:
  // Start: (0, 0), Target: (100, 50), Alpha: 0.5
  // X: 0 + (100 - 0) * 0.5 = 50
  // Y: 0 + (50 - 0) * 0.5 = 25
  expect(got.result.x).toBe(50);
  expect(got.result.y).toBe(25);
  expect(got.result.zoom).toBe(1.0);
});