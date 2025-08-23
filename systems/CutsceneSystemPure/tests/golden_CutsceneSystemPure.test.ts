import path from 'path';
import fs from 'fs';

/**
 * Golden test for CutsceneSystemPure CLI harness
 * Tests deterministic cutscene timeline generation
 * 
 * Remix-safe expectations:
 * - Timeline generation is deterministic and pure
 * - Events are sorted by timing (at field)
 * - Output preserves all event data
 * - No external state or side effects
 */
test('golden cutscene system flow', () => {
  const root = path.resolve(__dirname, '..');
  const cutscene = path.resolve(root, 'fixtures/cutscene.json');
  
  // Run CLI harness with cutscene data
  const out = (global as any).testUtils.runCLI(
    path.resolve(root, 'cliHarness.ts'), 
    [cutscene]
  );
  
  const got = JSON.parse(out);
  
  // Verify expected structure
  expect(got.op).toBe('cutscene');
  expect(got.status).toBe('ok');
  expect(got.timeline).toBeDefined();
  expect(got.timeline).toHaveLength(4);
  
  // Verify deterministic timeline generation
  const timeline = got.timeline;
  
  // Events should be sorted by timing
  expect(timeline[0].at).toBe(0.0);
  expect(timeline[1].at).toBe(2.0);
  expect(timeline[2].at).toBe(5.0);
  expect(timeline[3].at).toBe(8.0);
  
  // Verify event commands
  expect(timeline[0].cmd).toBe('fadeIn');
  expect(timeline[1].cmd).toBe('showText');
  expect(timeline[2].cmd).toBe('playMusic');
  expect(timeline[3].cmd).toBe('fadeOut');
  
  // Verify event arguments
  expect(timeline[0].args.duration).toBe(2.0);
  expect(timeline[1].args.text).toBe('Welcome to the adventure!');
  expect(timeline[2].args.track).toBe('intro_theme');
  expect(timeline[3].args.duration).toBe(2.0);
});