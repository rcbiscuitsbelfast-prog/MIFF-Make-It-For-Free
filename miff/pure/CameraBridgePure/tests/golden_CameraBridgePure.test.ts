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
  expect(got.outputs).toBeDefined();
  expect(got.outputs).toBeInstanceOf(Array);
  expect(got.outputs.length).toBeGreaterThan(0);
  
  const result = got.outputs[0!];
  expect(result.op).toBe('camera');
  expect(result.status).toBe('ok');
  expect(result.camera).toBeDefined();
  expect(result.camera.x).toBeDefined();
  expect(result.camera.y).toBeDefined();
  expect(result.camera.zoom).toBeDefined();
  
  // Verify deterministic camera calculation:
  // Start: (0, 0), Target: (100, 50), Alpha: 0.5
  // X: 0 + (100 - 0) * 0.5 = 50
  // Y: 0 + (50 - 0) * 0.5 = 25
  expect(result.camera.x).toBe(50);
  expect(result.camera.y).toBe(25);
  expect(result.camera.zoom).toBe(1.0);
});