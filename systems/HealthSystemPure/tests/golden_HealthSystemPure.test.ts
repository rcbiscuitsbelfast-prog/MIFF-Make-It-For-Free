import path from 'path';
import fs from 'fs';

/**
 * Golden test for HealthSystemPure CLI harness
 * Tests deterministic health management with damage and healing
 * 
 * Remix-safe expectations:
 * - Health calculations are deterministic and pure
 * - Damage reduces health, healing increases health
 * - Health clamps between 0 and max health
 * - No external state or side effects
 */
test('golden health system flow', () => {
  const root = path.resolve(__dirname, '..');
  const healthEvents = path.resolve(root, 'fixtures/health_events.json');
  
  // Run CLI harness with health events
  const out = (global as any).testUtils.runCLI(
    path.resolve(root, 'cliHarness.ts'), 
    [healthEvents]
  );
  
  const got = JSON.parse(out);
  
  // Verify expected structure
  expect(got.op).toBe('health');
  expect(got.status).toBe('ok');
  expect(got.result).toBeDefined();
  expect(got.result.hp).toBeDefined();
  expect(got.result.max).toBeDefined();
  
  // Verify deterministic health calculation:
  // Start: 80/100
  // Damage 20: 80 - 20 = 60
  // Heal 15: 60 + 15 = 75
  // Damage 10: 75 - 10 = 65
  expect(got.result.hp).toBe(65);
  expect(got.result.max).toBe(100);
});