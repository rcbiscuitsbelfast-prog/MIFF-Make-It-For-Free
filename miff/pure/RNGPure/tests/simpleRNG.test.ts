/**
 * Simple RNGPure tests to verify TypeScript implementation
 */

import { RNGProvider, createRNGProvider, RNGUtils } from '../index';

describe('RNGPure TypeScript Implementation', () => {
  test('should create RNG provider with seed', () => {
    const rng = new RNGProvider(12345);
    expect(rng).toBeDefined();
    expect(rng.getSeed()).toBe(12345);
  });

  test('should generate deterministic numbers', () => {
    const rng1 = new RNGProvider(42);
    const rng2 = new RNGProvider(42);
    const rng3 = new RNGProvider(43);

    // Same seed should produce same sequence
    expect(rng1.nextInt(1, 100)).toBe(rng2.nextInt(1, 100));

    // Different seed should produce different sequence
    expect(rng1.nextInt(1, 100)).not.toBe(rng3.nextInt(1, 100));
  });

  test('should handle nextInt bounds', () => {
    const rng = new RNGProvider(1);

    // Should respect bounds
    for (let i = 0; i < 100; i++) {
      const result = rng.nextInt(5, 15);
      expect(result).toBeGreaterThanOrEqual(5);
      expect(result).toBeLessThan(15);
    }
  });

  test('should handle nextFloat bounds', () => {
    const rng = new RNGProvider(1);

    // Should respect bounds
    for (let i = 0; i < 100; i++) {
      const result = rng.nextFloat(1.5, 3.7);
      expect(result).toBeGreaterThanOrEqual(1.5);
      expect(result).toBeLessThan(3.7);
    }
  });

  test('should handle nextBool probability', () => {
    const rng = new RNGProvider(1);

    // 0% probability should always be false
    expect(rng.nextBool(0)).toBe(false);

    // 100% probability should always be true
    expect(rng.nextBool(1)).toBe(true);

    // 50% probability should be roughly balanced
    let trueCount = 0;
    for (let i = 0; i < 1000; i++) {
      if (rng.nextBool(0.5)) trueCount++;
    }
    expect(trueCount).toBeGreaterThan(400); // Should be around 500, but allow some variance
    expect(trueCount).toBeLessThan(600);
  });

  test('should support reset functionality', () => {
    const rng = new RNGProvider(1);

    const firstValue = rng.nextInt(1, 100);
    rng.reset(1);
    const resetValue = rng.nextInt(1, 100);

    expect(firstValue).toBe(resetValue);
  });

  test('RNGUtils should work', () => {
    const rng = new RNGProvider(42);

    // Test shuffle
    const array = [1, 2, 3, 4, 5];
    const shuffled = RNGUtils.shuffle(array, rng);
    expect(shuffled).toHaveLength(5);
    expect(shuffled).not.toEqual(array); // Should be different order

    // Test pickRandom
    const randomPick = RNGUtils.pickRandom(array, rng);
    expect(array).toContain(randomPick);

    // Test randomString
    const randomString = RNGUtils.randomString(10, rng);
    expect(randomString).toHaveLength(10);
    expect(typeof randomString).toBe('string');
  });

  test('should generate different sequences with different seeds', () => {
    const rng1 = new RNGProvider(1);
    const rng2 = new RNGProvider(2);

    const sequence1 = Array.from({ length: 10 }, () => rng1.nextInt(1, 100));
    const sequence2 = Array.from({ length: 10 }, () => rng2.nextInt(1, 100));

    expect(sequence1).not.toEqual(sequence2);
  });
});