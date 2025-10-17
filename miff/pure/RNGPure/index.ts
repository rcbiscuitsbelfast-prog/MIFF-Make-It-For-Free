/**
 * RNGPure - Deterministic, seedable random number generation
 * 
 * This module provides deterministic, seedable random number generation
 * for modular gameplay systems. Pure TypeScript implementation with
 * no external dependencies.
 * 
 * @module RNGPure
 * @version 1.0.0
 * @license MIT
 */

/**
 * Contract for a deterministic, seedable random number provider.
 * Pure TypeScript; engine-independent for headless/CLI testing and DI.
 */
export interface IRNGProvider {
  /**
   * Returns the next integer in [min, max) using deterministic sequence.
   */
  nextInt(minInclusive: number, maxExclusive: number): number;

  /**
   * Returns the next float in [min, max) using deterministic sequence.
   */
  nextFloat(minInclusive: number, maxExclusive: number): number;

  /**
   * Returns true with the given probability (0..1).
   */
  nextBool(probability?: number): boolean;

  /**
   * Returns the current seed used for this provider.
   */
  getSeed(): number;

  /**
   * Resets the sequence with a new seed. Useful for golden test replay.
   */
  reset(seed: number): void;
}

/**
 * Deterministic, seedable RNG provider for modular gameplay systems.
 * - Pure TypeScript (no external dependencies)
 * - Thread-unsafe by design; create one instance per consumer or guard externally
 * - Extension hooks via protected virtual methods for custom distributions
 */
export class RNGProvider implements IRNGProvider {
  private _seed: number;
  private _random: number;

  /**
   * Constructs a new RNG provider with the given seed.
   */
  constructor(seed: number) {
    this._seed = seed;
    this._random = this.seedToFloat(seed);
  }

  nextInt(minInclusive: number, maxExclusive: number): number {
    if (maxExclusive <= minInclusive) {
      throw new Error("maxExclusive must be greater than minInclusive");
    }
    
    this.onBeforeNext();
    const range = maxExclusive - minInclusive;
    const randomValue = this.nextRandom();
    return minInclusive + Math.floor(randomValue * range);
  }

  nextFloat(minInclusive: number, maxExclusive: number): number {
    if (maxExclusive <= minInclusive) {
      throw new Error("maxExclusive must be greater than minInclusive");
    }

    this.onBeforeNext();
    const randomValue = this.nextRandom();
    return minInclusive + randomValue * (maxExclusive - minInclusive);
  }

  nextBool(probability: number = 0.5): boolean {
    if (probability <= 0) return false;
    if (probability >= 1) return true;
    
    this.onBeforeNext();
    const roll = this.nextRandom();
    return roll < probability;
  }

  getSeed(): number {
    return this._seed;
  }

  reset(seed: number): void {
    this._seed = seed;
    this._random = this.seedToFloat(seed);
  }

  /**
   * Hook for custom shuffling that uses the provider.
   * Example usage: derived classes or utilities can call nextInt/nextFloat.
   */
  protected onBeforeNext(): void {
    // Extension point for derived classes
  }

  /**
   * Generate next random value using linear congruential generator
   * This provides deterministic, seedable random numbers
   */
  private nextRandom(): number {
    // Linear Congruential Generator (LCG)
    // Using constants from Numerical Recipes
    this._random = (this._random * 1664525 + 1013904223) % 4294967296;
    return this._random / 4294967296;
  }

  /**
   * Convert seed to initial random state
   */
  private seedToFloat(seed: number): number {
    // Simple hash function to convert seed to initial state
    let hash = seed;
    hash = ((hash >> 16) ^ hash) * 0x45d9f3b;
    hash = ((hash >> 16) ^ hash) * 0x45d9f3b;
    hash = (hash >> 16) ^ hash;
    return Math.abs(hash) / 2147483648;
  }
}

/**
 * Factory function to create a new RNG provider
 */
export function createRNGProvider(seed: number): IRNGProvider {
  return new RNGProvider(seed);
}

/**
 * Default RNG provider instance
 */
export const defaultRNG = new RNGProvider(12345);

/**
 * Utility functions for common RNG operations
 */
export const RNGUtils = {
  /**
   * Shuffle an array using the given RNG provider
   */
  shuffle<T extends object>(array: T[], rng: IRNGProvider): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = rng.nextInt(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  },

  /**
   * Pick a random element from an array
   */
  pickRandom<T extends object>(array: T[], rng: IRNGProvider): T | undefined {
    if (array.length === 0) return undefined;
    const index = rng.nextInt(0, array.length);
    return array[index];
  },

  /**
   * Generate a random string of given length
   */
  randomString(length: number, rng: IRNGProvider, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      const index = rng.nextInt(0, charset.length);
      result += charset[index];
    }
    return result;
  }
};