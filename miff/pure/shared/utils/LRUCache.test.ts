import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { LRUCache, createLRUCache } from './LRUCache';

describe('LRUCache', () => {
  let cache: LRUCache<number>;

  beforeEach(() => {
    cache = new LRUCache({ maxSize: 3 });
  });

  describe('Basic Operations', () => {
    it('should store and retrieve values', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
    });

    it('should return undefined for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should check key existence', () => {
      cache.set('a', 1);
      
      expect(cache.has('a')).toBe(true);
      expect(cache.has('b')).toBe(false);
    });

    it('should delete keys', () => {
      cache.set('a', 1);
      
      expect(cache.delete('a')).toBe(true);
      expect(cache.has('a')).toBe(false);
      expect(cache.delete('a')).toBe(false);
    });

    it('should track size', () => {
      expect(cache.size).toBe(0);
      
      cache.set('a', 1);
      expect(cache.size).toBe(1);
      
      cache.set('b', 2);
      expect(cache.size).toBe(2);
      
      cache.delete('a');
      expect(cache.size).toBe(1);
    });

    it('should clear all entries', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      
      cache.clear();
      
      expect(cache.size).toBe(0);
      expect(cache.has('a')).toBe(false);
      expect(cache.has('b')).toBe(false);
      expect(cache.has('c')).toBe(false);
    });
  });

  describe('LRU Eviction', () => {
    it('should evict least recently used when at capacity', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      
      // Cache is full, adding 'd' should evict 'a' (LRU)
      cache.set('d', 4);
      
      expect(cache.has('a')).toBe(false);
      expect(cache.has('b')).toBe(true);
      expect(cache.has('c')).toBe(true);
      expect(cache.has('d')).toBe(true);
    });

    it('should update access order on get', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      
      // Access 'a' to make it MRU
      cache.get('a');
      
      // Add 'd', should evict 'b' (now LRU)
      cache.set('d', 4);
      
      expect(cache.has('a')).toBe(true);
      expect(cache.has('b')).toBe(false);
      expect(cache.has('c')).toBe(true);
      expect(cache.has('d')).toBe(true);
    });

    it('should update access order on set of existing key', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      
      // Update 'a' to make it MRU
      cache.set('a', 10);
      
      // Add 'd', should evict 'b' (now LRU)
      cache.set('d', 4);
      
      expect(cache.get('a')).toBe(10);
      expect(cache.has('b')).toBe(false);
    });
  });

  describe('TTL (Time To Live)', () => {
    const baseTimestamp = new Date('2024-01-01T00:00:00.000Z').getTime();
    const nowMock = jest.spyOn(Date, 'now');
    let elapsed = 0;

    const advanceTime = async (ms: number) => {
      await jest.advanceTimersByTimeAsync(ms);
      elapsed += ms;
      nowMock.mockImplementation(() => baseTimestamp + elapsed);
    };

    beforeEach(() => {
      cache = new LRUCache({ maxSize: 3, ttl: 100 }); // 100ms TTL
      elapsed = 0;
      nowMock.mockImplementation(() => baseTimestamp);
    });

    afterEach(() => {
      elapsed = 0;
      nowMock.mockImplementation(() => baseTimestamp);
    });

    it('should expire entries after TTL', async () => {
      cache.set('a', 1);
      
      expect(cache.get('a')).toBe(1);
      
      // Wait for expiration using fake timers
      await advanceTime(150);
      
      expect(cache.get('a')).toBeUndefined();
      expect(cache.has('a')).toBe(false);
    });

    it('should clean up expired entries', async () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      
      expect(cache.size).toBe(3);
      
      // Wait for expiration using fake timers
      await advanceTime(150);
      
      const removed = cache.cleanup();
      
      expect(removed).toBe(3);
      expect(cache.size).toBe(0);
    });
  });

  describe('Callbacks', () => {
    it('should call onEvict when evicting', () => {
      const onEvict = jest.fn();
      cache = new LRUCache({ maxSize: 2, onEvict });
      
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3); // Should evict 'a'
      
      expect(onEvict).toHaveBeenCalledWith('a', 1);
    });

    it('should call onEvict when deleting', () => {
      const onEvict = jest.fn();
      cache = new LRUCache({ maxSize: 3, onEvict });
      
      cache.set('a', 1);
      cache.delete('a');
      
      expect(onEvict).toHaveBeenCalledWith('a', 1);
    });

    it('should call onEvict when clearing', () => {
      const onEvict = jest.fn();
      cache = new LRUCache({ maxSize: 3, onEvict });
      
      cache.set('a', 1);
      cache.set('b', 2);
      cache.clear();
      
      expect(onEvict).toHaveBeenCalledTimes(2);
    });
  });

  describe('Statistics', () => {
    it('should provide cache statistics', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      
      const stats = cache.getStats();
      
      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(3);
      expect(stats.utilizationPercent).toBeCloseTo(66.67, 1);
      expect(stats.expired).toBe(0);
      expect(typeof stats.oldestAge).toBe('number');
    });
  });

  describe('Iteration', () => {
    beforeEach(() => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
    });

    it('should return keys in access order', () => {
      const keys = cache.keys();
      expect(keys).toEqual(['a', 'b', 'c']);
    });

    it('should return values in access order', () => {
      const values = cache.values();
      expect(values).toEqual([1, 2, 3]);
    });

    it('should iterate entries', () => {
      const entries = Array.from(cache.entries());
      expect(entries).toEqual([
        ['a', 1],
        ['b', 2],
        ['c', 3]
      ]);
    });
  });

  describe('Factory Function', () => {
    it('should create cache with createLRUCache', () => {
      const newCache = createLRUCache<string>(5);
      
      newCache.set('test', 'value');
      expect(newCache.get('test')).toBe('value');
      expect(newCache.size).toBe(1);
    });

    it('should create cache with TTL', () => {
      const newCache = createLRUCache<number>(5, 1000);
      
      newCache.set('key', 42);
      expect(newCache.get('key')).toBe(42);
    });
  });

  describe('Edge Cases', () => {
    it('should handle maxSize of 1', () => {
      cache = new LRUCache({ maxSize: 1 });
      
      cache.set('a', 1);
      expect(cache.get('a')).toBe(1);
      
      cache.set('b', 2);
      expect(cache.has('a')).toBe(false);
      expect(cache.get('b')).toBe(2);
    });

    it('should handle updating same key multiple times', () => {
      cache.set('a', 1);
      cache.set('a', 2);
      cache.set('a', 3);
      
      expect(cache.get('a')).toBe(3);
      expect(cache.size).toBe(1);
    });

    it('should handle empty cache operations', () => {
      expect(cache.size).toBe(0);
      expect(cache.keys()).toEqual([]);
      expect(cache.values()).toEqual([]);
      expect(Array.from(cache.entries())).toEqual([]);
      
      const stats = cache.getStats();
      expect(stats.size).toBe(0);
      expect(stats.oldestAge).toBe(0);
    });
  });
});
