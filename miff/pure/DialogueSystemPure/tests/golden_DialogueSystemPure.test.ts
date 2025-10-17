import path from 'path';
import fs from 'fs';

/**
 * Golden test for DialogueSystemPure CLI harness
 * Tests deterministic dialogue navigation and choice resolution
 * 
 * Remix-safe expectations:
 * - Dialogue navigation is deterministic and pure
 * - Choice resolution follows exact indices
 * - Node transitions are predictable and consistent
 * - No external state or side effects
 */
test('golden dialogue system flow', () => {
  const root = path.resolve(__dirname, '..');
  const dialogue = path.resolve(root, 'fixtures/dialogue.json');
  
  // Run CLI harness with dialogue data
  const out = (global as any).testUtils.runCLI(
    path.resolve(root, 'cliHarness.ts'), 
    [dialogue]
  );
  
  const got = JSON.parse(out);
  
  // Verify expected structure
  expect(got.op).toBe('dialogue.next');
  expect(got.status).toBe('ok');
  expect(got.id).toBeDefined();
  
  // Verify deterministic dialogue navigation:
  // Current: "greeting" with choiceIndex: 0
  // Choice 0: "Hello there!" -> "quest_offer"
  expect(got.id).toBe('quest_offer');
  
  // Verify no error occurred
  expect(got.issue).toBeUndefined();
});