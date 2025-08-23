import path from 'path';
import fs from 'fs';

/**
 * Golden test for MountSystemPure CLI harness
 * Tests deterministic mount/dismount state management
 * 
 * Remix-safe expectations:
 * - Mount state changes are deterministic and pure
 * - Mount events create rider-mount associations
 * - Dismount events remove rider-mount associations
 * - State updates are immutable and predictable
 */
test('golden mount system flow', () => {
  const root = path.resolve(__dirname, '..');
  const mounts = path.resolve(root, 'fixtures/mounts.json');
  
  // Run CLI harness with mount events
  const out = (global as any).testUtils.runCLI(
    path.resolve(root, 'cliHarness.ts'), 
    [mounts]
  );
  
  const got = JSON.parse(out);
  
  // Verify expected structure
  expect(got.op).toBe('mount');
  expect(got.status).toBe('ok');
  expect(got.state).toBeDefined();
  expect(got.state.mounted).toBeDefined();
  
  // Verify deterministic mount state changes
  const mounted = got.state.mounted;
  
  // player_001 should be dismounted (was on horse_001)
  expect(mounted.player_001).toBeUndefined();
  
  // player_002 should be mounted on horse_002
  expect(mounted.player_002).toBe('horse_002');
  
  // npc_001 should be mounted on cart_001
  expect(mounted.npc_001).toBe('cart_001');
  
  // Verify all expected riders are present
  expect(Object.keys(mounted)).toContain('player_001');
  expect(Object.keys(mounted)).toContain('player_002');
  expect(Object.keys(mounted)).toContain('npc_001');
});