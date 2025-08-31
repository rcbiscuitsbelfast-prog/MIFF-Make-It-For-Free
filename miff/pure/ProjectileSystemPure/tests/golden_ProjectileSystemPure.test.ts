import path from 'path';
import fs from 'fs';

/**
 * Golden test for ProjectileSystemPure CLI harness
 * Tests deterministic projectile updates with position, velocity, and TTL
 * 
 * Remix-safe expectations:
 * - All calculations are deterministic and rounded to 2 decimal places
 * - Projectile positions update based on velocity * dt
 * - TTL decreases by dt and clamps to 0
 * - No engine coupling, pure data transformations only
 */
test('golden projectile system flow', () => {
  const root = path.resolve(__dirname, '..');
  const projectiles = path.resolve(root, 'fixtures/projectiles.json');
  
  // Run CLI harness with projectile data
  const out = (global as any).testUtils.runCLI(
    path.resolve(root, 'cliHarness.ts'), 
    [projectiles]
  );
  
  const got = JSON.parse(out);
  
  // Verify expected structure and deterministic behavior
  expect(got.op).toBe('projectiles.step');
  expect(got.status).toBe('ok');
  expect(got.updated).toBeDefined();
  expect(got.updated).toHaveLength(2);
  
  // Check first projectile (arrow_001) - should move from (0,0) to (1,0.5) with dt=0.1
  const arrow = got.updated.find((p: any) => p.id === 'arrow_001');
  expect(arrow.pos.x).toBe(1); // 0 + 10 * 0.1 = 1
  expect(arrow.pos.y).toBe(0.5); // 0 + 5 * 0.1 = 0.5
  expect(arrow.ttl).toBe(1.9); // 2.0 - 0.1 = 1.9
  
  // Check second projectile (bolt_001) - should move from (5,10) to (4.5,10.8) with dt=0.1
  const bolt = got.updated.find((p: any) => p.id === 'bolt_001');
  expect(bolt.pos.x).toBe(4.5); // 5 + (-5) * 0.1 = 4.5
  expect(bolt.pos.y).toBe(10.8); // 10 + 8 * 0.1 = 10.8
  expect(bolt.ttl).toBe(1.4); // 1.5 - 0.1 = 1.4
});