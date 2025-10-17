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
  
  // player_002 should be mounted on horse_002
  expect(mounted.player_002).toBe('horse_002');
  
  // npc_001 should be mounted on cart_001
  expect(mounted.npc_001).toBe('cart_001');
  
  // Verify only affected riders are present in output
  // Note: The system only returns riders that were affected by events
  expect(Object.keys(mounted)).toContain('player_002');
  expect(Object.keys(mounted)).toContain('npc_001');
  
  // player_001 was dismounted, so they won't appear in the output
  // This is correct behavior - only modified riders are returned
  expect(Object.keys(mounted)).not.toContain('player_001');
});