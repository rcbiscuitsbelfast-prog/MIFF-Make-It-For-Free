/**
 * MemoryManager - Advanced memory management and leak prevention
 * 
 * Provides utilities to prevent memory leaks, manage object lifecycles,
 * and optimize memory usage across the framework.
 * 
 * @version 1.0.0
 * @author MIFF Framework Performance Team
 */

export interface MemoryStats {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
}

export interface MemoryLeakDetection {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  isLeak: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendations: string[];
}

export interface ObjectLifecycle {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  type: string;
  created: number;
  lastAccessed: number;
  accessCount: number;
  size: number;
  references: string[];
}

export class MemoryManager {
  private static instances: Map<string, any> = new Map();
  private static lifecycles: Map<string, ObjectLifecycle> = new Map();
  private static memoryHistory: MemoryStats[] = [];
  private static readonly MAX_HISTORY = 100;
  private static readonly LEAK_THRESHOLD = 50 * 1024 * 1024; // 50MB
  private static readonly CLEANUP_INTERVAL = 30000; // 30 seconds
  private static cleanupTimer: NodeJS.Timeout | null = null;

  /**
   * Initialize memory manager
   */
  static initialize(): void {
    this.startCleanupTimer();
    this.recordMemoryStats();
  }

  /**
   * Register an object for lifecycle management
   */
  static registerObject<T extends object>(
    id: string,
    obj: T,
    type: string = 'unknown'
  ): T {
    const lifecycle: ObjectLifecycle = {
      id,
      type,
      created: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 0,
      size: this.estimateObjectSize(obj),
      references: []
    };

    this.lifecycles.set(id, lifecycle);
    this.instances.set(id, obj);

    return obj;
  }

  /**
   * Track object access
   */
  static trackAccess(id: string): void {
    const lifecycle = this.lifecycles.get(id);
    if (lifecycle) {
      lifecycle.lastAccessed = Date.now();
      lifecycle.accessCount++;
    }
  }

  /**
   * Unregister an object and clean up references
   */
  static unregisterObject(id: string): boolean {
    const lifecycle = this.lifecycles.get(id);
    if (!lifecycle) {
      return false;
    }

    // Clean up references
    lifecycle.references.forEach(refId => {
      const refLifecycle = this.lifecycles.get(refId);
      if (refLifecycle) {
        refLifecycle.references = refLifecycle.references.filter(r => r !== id);
      }
    });

    this.lifecycles.delete(id);
    this.instances.delete(id);

    return true;
  }

  /**
   * Add reference between objects
   */
  static addReference(fromId: string, toId: string): void {
    const fromLifecycle = this.lifecycles.get(fromId);
    if (fromLifecycle && !fromLifecycle.references.includes(toId)) {
      fromLifecycle.references.push(toId);
    }
  }

  /**
   * Remove reference between objects
   */
  static removeReference(fromId: string, toId: string): void {
    const fromLifecycle = this.lifecycles.get(fromId);
    if (fromLifecycle) {
      fromLifecycle.references = fromLifecycle.references.filter(r => r !== toId);
    }
  }

  /**
   * Get memory statistics
   */
  static getMemoryStats(): MemoryStats {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return {
        heapUsed: usage.heapUsed,
        heapTotal: usage.heapTotal,
        external: usage.external,
        rss: usage.rss,
        timestamp: Date.now()
      };
    }

    return {
      heapUsed: 0,
      heapTotal: 0,
      external: 0,
      rss: 0,
      timestamp: Date.now()
    };
  }

  /**
   * Record memory statistics
   */
  static recordMemoryStats(): void {
    const stats = this.getMemoryStats();
    this.memoryHistory.push(stats);

    if (this.memoryHistory.length > this.MAX_HISTORY) {
      this.memoryHistory = this.memoryHistory.slice(-this.MAX_HISTORY);
    }
  }

  /**
   * Detect memory leaks
   */
  static detectMemoryLeaks(): MemoryLeakDetection[] {
    const leaks: MemoryLeakDetection[] = [];

    // Check for growing memory usage
    if (this.memoryHistory.length >= 10) {
      const recent = this.memoryHistory.slice(-10);
      const growth = recent[recent.length - 1].heapUsed - recent[0].heapUsed;
      
      if (growth > this.LEAK_THRESHOLD) {
        leaks.push({
          isLeak: true,
          severity: 'high',
          description: `Memory usage increased by ${Math.round(growth / 1024 / 1024)}MB over last 10 measurements`,
          recommendations: [
            'Check for objects not being properly cleaned up',
            'Review object lifecycles and references',
            'Consider implementing object pooling'
          ]
        });
      }
    }

    // Check for objects with high access counts but old last access
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    for (const [id, lifecycle] of this.lifecycles) {
      if (lifecycle.accessCount > 1000 && (now - lifecycle.lastAccessed) > oneHour) {
        leaks.push({
          isLeak: true,
          severity: 'medium',
          description: `Object ${id} has high access count (${lifecycle.accessCount}) but hasn't been accessed recently`,
          recommendations: [
            'Consider if this object is still needed',
            'Check for circular references',
            'Implement proper cleanup for this object type'
          ]
        });
      }
    }

    // Check for circular references
    const circularRefs = this.detectCircularReferences();
    if (circularRefs.length > 0) {
      leaks.push({
        isLeak: true,
        severity: 'critical',
        description: `Found ${circularRefs.length} circular reference chains`,
        recommendations: [
          'Break circular references by using weak references',
          'Implement proper cleanup order',
          'Consider using event emitters instead of direct references'
        ]
      });
    }

    return leaks;
  }

  /**
   * Clean up unused objects
   */
  static cleanupUnusedObjects(maxAge: number = 300000): number { // 5 minutes default
    const now = Date.now();
    let cleanedCount = 0;

    for (const [id, lifecycle] of this.lifecycles) {
      if ((now - lifecycle.lastAccessed) > maxAge) {
        this.unregisterObject(id);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Force garbage collection (if available)
   */
  static forceGarbageCollection(): void {
    if (typeof global !== 'undefined' && (global as any).gc) {
      (global as any).gc();
    }
  }

  /**
   * Get object lifecycle information
   */
  static getObjectLifecycle(id: string): ObjectLifecycle | null {
    return this.lifecycles.get(id) || null;
  }

  /**
   * Get all object lifecycles
   */
  static getAllLifecycles(): ObjectLifecycle[] {
    return Array.from(this.lifecycles.values());
  }

  /**
   * Get memory usage by object type
   */
  static getMemoryUsageByType(): Record<string, { count: number; totalSize: number }> {
    const usage: Record<string, { count: number; totalSize: number }> = {};

    for (const lifecycle of this.lifecycles.values()) {
      if (!usage[lifecycle.type]) {
        usage[lifecycle.type] = { count: 0, totalSize: 0 };
      }
      usage[lifecycle.type].count++;
      usage[lifecycle.type].totalSize += lifecycle.size;
    }

    return usage;
  }

  /**
   * Estimate object size in bytes
   */
  private static estimateObjectSize(obj: any): number {
    if (obj === null || obj === undefined) {
      return 0;
    }

    if (typeof obj === 'string') {
      return obj.length * 2; // 2 bytes per character
    }

    if (typeof obj === 'number') {
      return 8; // 8 bytes for number
    }

    if (typeof obj === 'boolean') {
      return 1; // 1 byte for boolean
    }

    if (Array.isArray(obj)) {
      return obj.reduce((size, item) => size + this.estimateObjectSize(item), 0);
    }

    if (typeof obj === 'object') {
      let size = 0;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          size += key.length * 2; // Key size
          size += this.estimateObjectSize(obj[key]); // Value size
        }
      }
      return size;
    }

    return 0;
  }

  /**
   * Detect circular references
   */
  private static detectCircularReferences(): string[][] {
    const circularRefs: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (id: string, path: string[]): void => {
      if (recursionStack.has(id)) {
        circularRefs.push([...path, id]);
        return;
      }

      if (visited.has(id)) {
        return;
      }

      visited.add(id);
      recursionStack.add(id);

      const lifecycle = this.lifecycles.get(id);
      if (lifecycle) {
        for (const refId of lifecycle.references) {
          dfs(refId, [...path, id]);
        }
      }

      recursionStack.delete(id);
    };

    for (const id of this.lifecycles.keys()) {
      if (!visited.has(id)) {
        dfs(id, []);
      }
    }

    return circularRefs;
  }

  /**
   * Start cleanup timer
   */
  private static startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.recordMemoryStats();
      this.cleanupUnusedObjects();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Destroy memory manager
   */
  static destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    this.instances.clear();
    this.lifecycles.clear();
    this.memoryHistory = [];
  }
}

// Export default instance
// export const memoryManager = new MemoryManager();
export { MemoryManager as default };