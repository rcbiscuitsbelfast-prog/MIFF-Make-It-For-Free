/**
 * MIFF Advanced Cache Manager
 *
 * Intelligent caching system for MIFF framework modules and assets
 */

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;
  size: number;
  accessCount: number;
  lastAccessed: number;
  metadata?: Record<string, any>;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  averageAccessTime: number;
  memoryPressure: 'low' | 'medium' | 'high' | 'critical';
  cacheEfficiency: number;
}

export interface CacheConfig {
  maxSize: number;
  maxEntries: number;
  defaultTTL: number;
  cleanupInterval: number;
  enableCompression: boolean;
  enablePersistence: boolean;
  persistencePath?: string;
  compressionThreshold: number;
  memoryThreshold: number;
  adaptiveCleanup: boolean;
}

export class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private accessHistory: string[] = [];
  private config: CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    accessTime: 0
  };
  private cleanupTimer?: NodeJS.Timeout;
  private persistenceTimer?: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 100 * 1024 * 1024, // 100MB
      maxEntries: 10000,
      defaultTTL: 3600000, // 1 hour
      cleanupInterval: 300000, // 5 minutes
      enableCompression: true,
      enablePersistence: false,
      compressionThreshold: 1024, // 1KB
      memoryThreshold: 0.8, // 80% memory usage
      adaptiveCleanup: true,
      ...config
    };

    this.startCleanupTimer();
    if (this.config.enablePersistence) {
      this.startPersistenceTimer();
    }
  }

  /**
   * Set cache entry with intelligent handling
   */
  set<T>(key: string, data: T, options: Partial<CacheEntry> = {}): boolean {
    try {
      const now = Date.now();
      const size = this.estimateSize(data);

      // Check if we need to cleanup before adding
      if (this.wouldExceedLimits(size, 1)) {
        this.performCleanup();
      }

      // Compress if enabled and size threshold met
      let processedData = data;
      if (this.config.enableCompression && size > this.config.compressionThreshold) {
        processedData = this.compressData(data);
      }

      const entry: CacheEntry<T> = {
        key,
        data: processedData as T,
        timestamp: now,
        ttl: options.ttl || this.config.defaultTTL,
        size,
        accessCount: 0,
        lastAccessed: now,
        metadata: options.metadata || {}
      };

      this.cache.set(key, entry);
      this.accessHistory.push(key);
      this.stats.sets++;

      // Limit access history size
      if (this.accessHistory.length > 10000) {
        this.accessHistory = this.accessHistory.slice(-5000);
      }

      this.log(`Cache SET: ${key} (${size} bytes)`);
      return true;
    } catch (error) {
      this.log(`Cache SET failed for ${key}: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Get cache entry with performance tracking
   */
  get<T>(key: string): T | null {
    const startTime = performance.now();
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.log(`Cache MISS: ${key}`, 'debug');
      return null;
    }

    const now = Date.now();

    // Check TTL
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.log(`Cache EXPIRED: ${key}`, 'debug');
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;
    this.accessHistory.push(key);

    const endTime = performance.now();
    this.stats.accessTime += (endTime - startTime);
    this.stats.hits++;

    // Decompress if needed
    let data = entry.data;
    if (this.config.enableCompression && entry.size > this.config.compressionThreshold) {
      data = this.decompressData(entry.data);
    }

    this.log(`Cache HIT: ${key} (access #${entry.accessCount})`, 'debug');
    return data as T;
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    return (now - entry.timestamp) <= entry.ttl;
  }

  /**
   * Delete specific cache entry
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      this.log(`Cache DELETE: ${key}`);
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.accessHistory = [];
    this.log('Cache CLEARED completely');
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const now = Date.now();
    const entries = Array.from(this.cache.values());
    const totalEntries = entries.length;
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);

    const totalAccesses = this.stats.hits + this.stats.misses;
    const hitRate = totalAccesses > 0 ? (this.stats.hits / totalAccesses) * 100 : 0;
    const missRate = totalAccesses > 0 ? (this.stats.misses / totalAccesses) * 100 : 0;

    const avgAccessTime = this.stats.hits > 0 ? this.stats.accessTime / this.stats.hits : 0;

    // Determine memory pressure
    const memoryUsage = process.memoryUsage();
    const memoryRatio = memoryUsage.heapUsed / memoryUsage.heapTotal;
    let memoryPressure: 'low' | 'medium' | 'high' | 'critical' = 'low';

    if (memoryRatio > 0.9) memoryPressure = 'critical';
    else if (memoryRatio > 0.7) memoryPressure = 'high';
    else if (memoryRatio > 0.5) memoryPressure = 'medium';

    // Calculate cache efficiency
    const cacheEfficiency = this.calculateEfficiency(entries, now);

    return {
      totalEntries,
      totalSize,
      hitRate,
      missRate,
      averageAccessTime: avgAccessTime,
      memoryPressure,
      cacheEfficiency
    };
  }

  /**
   * Get cache entries by pattern
   */
  getEntriesByPattern(pattern: string): CacheEntry[] {
    const regex = new RegExp(pattern);
    return Array.from(this.cache.values()).filter(entry => regex.test(entry.key));
  }

  /**
   * Preload critical modules
   */
  async preloadModules(moduleNames: string[]): Promise<void> {
    this.log(`Preloading ${moduleNames.length} critical modules...`);

    for (const moduleName of moduleNames) {
      try {
        // Check if already cached
        if (this.has(`module:${moduleName}`)) {
          this.log(`Module ${moduleName} already cached`);
          continue;
        }

        // Simulate module loading
        await this.simulateModuleLoad(moduleName);

        this.log(`✅ Preloaded module: ${moduleName}`);
      } catch (error) {
        this.log(`❌ Failed to preload module ${moduleName}: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Intelligent cache cleanup based on usage patterns
   */
  private performCleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.values());

    // Sort by priority for cleanup (oldest, least accessed first)
    const sortedEntries = entries.sort((a, b) => {
      const aScore = this.calculateCleanupScore(a, now);
      const bScore = this.calculateCleanupScore(b, now);
      return aScore - bScore;
    });

    let freedSize = 0;
    let freedEntries = 0;

    // Remove entries until we're under limits
    for (const entry of sortedEntries) {
      if (this.wouldExceedLimits(-entry.size, -1)) {
        this.cache.delete(entry.key);
        freedSize += entry.size;
        freedEntries++;
      } else {
        break;
      }
    }

    if (freedEntries > 0) {
      this.log(`Cache cleanup: freed ${freedEntries} entries (${freedSize} bytes)`);
    }
  }

  private calculateCleanupScore(entry: CacheEntry, now: number): number {
    const age = now - entry.timestamp;
    const accessScore = entry.accessCount > 0 ? Math.log(entry.accessCount) : 0;
    const recencyScore = (now - entry.lastAccessed) / 1000; // seconds since last access

    // Lower score = higher priority for cleanup
    return age + recencyScore - accessScore;
  }

  private calculateEfficiency(entries: CacheEntry[], now: number): number {
    if (entries.length === 0) return 100;

    const activeEntries = entries.filter(entry =>
      (now - entry.timestamp) <= entry.ttl && entry.accessCount > 0
    );

    return (activeEntries.length / entries.length) * 100;
  }

  private wouldExceedLimits(additionalSize: number, additionalEntries: number): boolean {
    const currentSize = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0);
    const currentEntries = this.cache.size;

    return (currentSize + additionalSize > this.config.maxSize) ||
           (currentEntries + additionalEntries > this.config.maxEntries);
  }

  private estimateSize(data: any): number {
    if (data === null || data === undefined) return 0;

    if (typeof data === 'string') return data.length * 2; // UTF-16
    if (typeof data === 'number') return 8;
    if (typeof data === 'boolean') return 1;
    if (data instanceof Date) return 8;

    if (Array.isArray(data)) {
      return data.reduce((sum, item) => sum + this.estimateSize(item), 0);
    }

    if (typeof data === 'object') {
      return Object.entries(data).reduce((sum, [key, value]) => {
        return sum + key.length * 2 + this.estimateSize(value);
      }, 0);
    }

    return 1024; // Default estimate for complex objects
  }

  private compressData(data: any): any {
    // Simple compression simulation
    if (typeof data === 'string') {
      return `COMPRESSED:${data}`;
    }
    return data;
  }

  private decompressData(data: any): any {
    // Simple decompression simulation
    if (typeof data === 'string' && data.startsWith('COMPRESSED:')) {
      return data.substring(11);
    }
    return data;
  }

  private async simulateModuleLoad(moduleName: string): Promise<void> {
    // Simulate module loading time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));

    // Cache the module data
    this.set(`module:${moduleName}`, {
      name: moduleName,
      loaded: true,
      dependencies: [],
      exports: ['default'],
      size: 1000 + Math.random() * 5000
    }, {
      ttl: 3600000, // 1 hour
      metadata: { type: 'module', critical: true }
    });
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.performCleanup();

      // Adaptive cleanup based on memory pressure
      if (this.config.adaptiveCleanup) {
        const memoryUsage = process.memoryUsage();
        const memoryRatio = memoryUsage.heapUsed / memoryUsage.heapTotal;

        if (memoryRatio > this.config.memoryThreshold) {
          this.log(`High memory usage (${(memoryRatio * 100).toFixed(1)}%), performing aggressive cleanup`);
          this.performCleanup();
        }
      }
    }, this.config.cleanupInterval);
  }

  private startPersistenceTimer(): void {
    if (!this.config.persistencePath) return;

    this.persistenceTimer = setInterval(() => {
      this.saveToDisk();
    }, 60000); // Every minute
  }

  private saveToDisk(): void {
    try {
      if (!this.config.persistencePath) return;

      const cacheData = {
        timestamp: Date.now(),
        entries: Array.from(this.cache.entries()),
        stats: this.stats
      };

      require('fs').writeFileSync(
        this.config.persistencePath!,
        JSON.stringify(cacheData, null, 2)
      );

      this.log('Cache persisted to disk');
    } catch (error) {
      this.log(`Failed to persist cache: ${error.message}`, 'error');
    }
  }

  private log(message: string, level: 'info' | 'debug' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    console.log(`[CACHE:${level.toUpperCase()}] ${timestamp} - ${message}`);
  }

  /**
   * Shutdown cache manager
   */
  shutdown(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    if (this.persistenceTimer) {
      clearInterval(this.persistenceTimer);
    }

    if (this.config.enablePersistence) {
      this.saveToDisk();
    }

    this.log('Cache manager shutdown complete');
  }
}