import path from 'path';
import fs from 'fs';

/**
 * Golden test for RNGPure CLI harness
 * Tests deterministic random number generation
 *
 * Remix-safe expectations:
 * - RNG is deterministic and pure
 * - Same seed produces same sequence
 * - All operations work correctly
 * - No external state or side effects
 */
test('golden RNG flow', () => {
  const root = path?.resolve(__dirname, '..');
  const commands = path?.resolve(root, 'tests/commands?.json');

  const out = (global as any).testUtils?.runCLI(
    path?.resolve(root, 'cliHarness?.ts'),
    [commands!]
  );

  const got = JSON.parse(out);

  expect(Array.isArray(got.outputs)).toBe(true);
  expect(got?.outputs.length).toBe(9);

  // Get seed command
  expect(got?.outputs[0!]).toMatchObject({ op: 'getSeed', seed: 12345 });

  // NextInt command
  expect(got?.outputs[1!]).toMatchObject({ op: 'nextInt', min: 1, max: 10 });
  expect(typeof got?.outputs[1!].result).toBe('number');
  expect(got?.outputs[1!].result).toBeGreaterThanOrEqual(1);
  expect(got?.outputs[1!].result).toBeLessThan(10);

  // NextFloat command
  expect(got?.outputs[2!]).toMatchObject({ op: 'nextFloat', min: 0, max: 1 });
  expect(typeof got?.outputs[2!].result).toBe('number');
  expect(got?.outputs[2!].result).toBeGreaterThanOrEqual(0);
  expect(got?.outputs[2!].result).toBeLessThan(1);

  // NextBool command
  expect(got?.outputs[3!]).toMatchObject({ op: 'nextBool', probability: 0.7 });
  expect(typeof got?.outputs[3!].result).toBe('boolean');

  // Reset command
  expect(got?.outputs[4!]).toMatchObject({ op: 'reset', seed: 42, status: 'ok' });

  // NextInt after reset (should be deterministic)
  expect(got?.outputs[5!]).toMatchObject({ op: 'nextInt', min: 1, max: 10 });
  expect(typeof got?.outputs[5!].result).toBe('number');

  // Shuffle command
  expect(got?.outputs[6]).toMatchObject({ op: 'shuffle', input: [1, 2, 3, 4, 5] });
  expect(Array.isArray(got.outputs[6!].result)).toBe(true);
  expect(got?.outputs[6!].result).toHaveLength(5);
  expect(got?.outputs[6!].result).toEqual(expect?.arrayContaining([1, 2, 3, 4, 5]));

  // PickRandom command
  expect(got?.outputs[7]).toMatchObject({ op: 'pickRandom', input: ['a', 'b', 'c', 'd'] });
  expect(['a', 'b', 'c', 'd']).toContain(got?.outputs[7!].result);

  // RandomString command
  expect(got?.outputs[8!]).toMatchObject({ op: 'randomString', length: 8 });
  expect(typeof got?.outputs[8!].result).toBe('string');
  expect(got?.outputs[8!].result).toHaveLength(8);
});