import path from 'path';
import fs from 'fs';

/**
 * Golden test for InputSystemPure CLI harness
 * Tests deterministic input mapping from raw events to actions
 * 
 * Remix-safe expectations:
 * - Input mapping is deterministic and pure
 * - Events are matched to bindings by type and code
 * - Output actions preserve timing information
 * - No external state or side effects
 */
test('golden input system flow', () => {
  const root = path.resolve(__dirname, '..');
  const inputs = path.resolve(root, 'fixtures/inputs.json');
  
  // Run CLI harness with input events and bindings
  const out = (global as any).testUtils.runCLI(
    path.resolve(root, 'cliHarness.ts'), 
    [inputs]
  );
  
  const got = JSON.parse(out);
  
  // Verify expected structure
  expect(got.op).toBe('input.map');
  expect(got.status).toBe('ok');
  expect(got.actions).toBeDefined();
  expect(got.actions).toHaveLength(4);
  
  // Verify deterministic input mapping
  const actions = got.actions;
  
  // Space key should map to jump
  const jumpAction = actions.find((a: any) => a.action === 'jump');
  expect(jumpAction).toBeDefined();
  expect(jumpAction.t).toBe(0.1);
  
  // Left tap should map to attack
  const attackAction = actions.find((a: any) => a.action === 'attack');
  expect(attackAction).toBeDefined();
  expect(attackAction.t).toBe(0.2);
  
  // E key should map to interact
  const interactAction = actions.find((a: any) => a.action === 'interact');
  expect(interactAction).toBeDefined();
  expect(interactAction.t).toBe(0.3);
  
  // Escape key should map to pause
  const pauseAction = actions.find((a: any) => a.action === 'pause');
  expect(pauseAction).toBeDefined();
  expect(pauseAction.t).toBe(0.4);
});