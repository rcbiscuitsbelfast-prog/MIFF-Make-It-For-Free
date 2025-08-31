import path from 'path';
import fs from 'fs';

/**
 * Golden test for RhythmSystemPure CLI harness
 * Tests deterministic beat generation and timing judgment
 * 
 * Remix-safe expectations:
 * - Beat calculations are deterministic and pure
 * - Beat intervals are calculated as 60/BPM
 * - Timing judgment uses configurable windows
 * - Results are rounded to 2 decimal places for consistency
 */
test('golden rhythm system flow', () => {
  const root = path.resolve(__dirname, '..');
  const beatmap = path.resolve(root, 'fixtures/beatmap.json');
  
  // Run CLI harness with rhythm data
  const out = (global as any).testUtils.runCLI(
    path.resolve(root, 'cliHarness.ts'), 
    [beatmap]
  );
  
  const got = JSON.parse(out);
  
  // Verify expected structure
  expect(got.op).toBe('rhythm.beats');
  expect(got.status).toBe('ok');
  expect(got.bpm).toBe(120);
  expect(got.count).toBe(4);
  expect(got.beatTimes).toBeDefined();
  expect(got.beatTimes).toHaveLength(4);
  
  // Verify deterministic beat calculation:
  // BPM: 120, Interval: 60/120 = 0.5 seconds
  // Beat 1: 1 * 0.5 = 0.5
  // Beat 2: 2 * 0.5 = 1.0
  // Beat 3: 3 * 0.5 = 1.5
  // Beat 4: 4 * 0.5 = 2.0
  expect(got.beatTimes[0]).toBe(0.5);
  expect(got.beatTimes[1]).toBe(1.0);
  expect(got.beatTimes[2]).toBe(1.5);
  expect(got.beatTimes[3]).toBe(2.0);
});