/**
 * LRU (Least Recently Used) Cache
 * 
 * High-performance caching implementation with automatic eviction
 * of least recently used items when capacity is reached.
 * 
 * @module LRUCache
 * @version 1.0.0
 */

export interface LRUCacheOptions {
  maxSize: number;
  ttl?: number; // Time to live in milliseconds
  onEvict?: (key: string, value: any) => void;
}

interface CacheEntry<V> {
  value: V;
  timestamp: number;
}

export class LRUCache<V = any> {
  private cache = new Map<string, CacheEntry<V>>();
  private accessOrder: string[] = [];
  private readonly maxSize: number;
  private readonly ttl?: number;
  private readonly onEvict?: (key: string, value: V) => void;

  constructor(options: LRUCacheOptions) {
    this.maxSize = options.maxSize;
    this.ttl = options.ttl;
    this.onEvict = options.onEvict;
  }

  /**
   * Get value from cache
   * Returns undefined if not found or expired
   */
  get(key: string): V | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }
    
    // Check TTL if set
    if (this.ttl && Date.now() - entry.timestamp > this.ttl) {
      this.delete(key);
      return undefined;
    }
    
    // Move to end (most recently used)
    this.updateAccessOrder(key);
    
    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: V): void {
    // If key exists, update it
    if (this.cache.has(key)) {
      this.cache.set(key, {
        value,
        timestamp: Date.now()
      });
      this.updateAccessOrder(key);
      return;
    }
    
    // If at capacity, evict LRU
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    
    // Add new entry
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
    this.accessOrder.push(key);
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key) && this.get(key) !== undefined;
  }

  /**
   * Delete key from cache
   */
  delete(key: string): boolean {
    const had = this.cache.has(key);
    if (had) {
      const entry = this.cache.get(key);
      this.cache.delete(key);
      this.accessOrder = this.accessOrder.filter(k => k !== key);
      
      if (this.onEvict && entry) {
        this.onEvict(key, entry.value);
      }
    }
    return had;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    if (this.onEvict) {
      for (const [key, entry] of this.cache.entries()) {
        this.onEvict(key, entry.value);
      }
    }
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Get current cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let expired = 0;
    
    if (this.ttl) {
      for (const entry of this.cache.values()) {
        if (now - entry.timestamp > this.ttl) {
          expired++;
        }
      }
    }
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      utilizationPercent: (this.cache.size / this.maxSize) * 100,
      expired,
      oldestAge: this.getOldestAge()
    };
  }

  /**
   * Get age of oldest entry in milliseconds
   */
  private getOldestAge(): number {
    if (this.cache.size === 0) return 0;
    
    const now = Date.now();
    let oldest = Infinity;
    
    for (const entry of this.cache.values()) {
      const age = now - entry.timestamp;
      if (age < oldest) {
        oldest = age;
      }
    }
    
    return oldest === Infinity ? 0 : oldest;
  }

  /**
   * Update access order for a key (move to end)
   */
  private updateAccessOrder(key: string): void {
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    this.accessOrder.push(key);
  }

  /**
   * Evict least recently used item
   */
  private evictLRU(): void {
    const lruKey = this.accessOrder.shift();
    if (lruKey) {
      const entry = this.cache.get(lruKey);
      this.cache.delete(lruKey);
      
      if (this.onEvict && entry) {
        this.onEvict(lruKey, entry.value);
      }
    }
  }

  /**
   * Get all keys in access order (LRU to MRU)
   */
  keys(): string[] {
    return [...this.accessOrder];
  }

  /**
   * Get all values in access order (LRU to MRU)
   */
  values(): V[] {
    return this.accessOrder.map(key => {
      const entry = this.cache.get(key);
      return entry!.value;
    });
  }

  /**
   * Iterate over entries
   */
  *entries(): IterableIterator<[string, V]> {
    for (const key of this.accessOrder) {
      const entry = this.cache.get(key);
      if (entry) {
        yield [key, entry.value];
      }
    }
  }

  /**
   * Clean up expired entries
   * Returns number of entries removed
   */
  cleanup(): number {
    if (!this.ttl) return 0;
    
    const now = Date.now();
    let removed = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.delete(key);
        removed++;
      }
    }
    
    return removed;
  }
}

/**
 * Create LRU cache with simple options
 */
export function createLRUCache<V = any>(maxSize: number, ttl?: number): LRUCache<V> {
  return new LRUCache<V>({ maxSize, ttl });
}
