export type CacheItemStatus = 'active' | 'inactive' | 'error';

export interface CacheItem {
  id: string;
  name: string;
  type: string;
  status: CacheItemStatus;
  metadata: Record<string, any>;
  properties: Record<string, any>;
  tags: string[];
  priority: number;
  version: string;
  size: number;
  ttl: number;
  createdAt: Date;
  updatedAt: Date;
  accessCount: number;
  lastAccessed: Date;
}

export interface CacheManagerStats {
  totalItems: number;
  activeItems: number;
  inactiveItems: number;
  errorItems: number;
  averageItemSize: number;
  averageAccessCount: number;
  lastActivity: Date | null;
}

export interface CacheManagerAnalytics {
  totalItems: number;
  activeItems: number;
  inactiveItems: number;
  tags: Record<string, number>;
  types: Record<string, number>;
  priorityDistribution: Record<string, number>;
  lastUpdated: Date;
}

export interface CacheManagerConfig {
  enabled: boolean;
  debugMode: boolean;
  maxInstances: number;
  timeout: number;
  retryAttempts: number;
  cacheSize: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  performanceMonitoring: boolean;
  memoryTracking: boolean;
}

const DEFAULT_CONFIG: CacheManagerConfig = {
  enabled: true,
  debugMode: false,
  maxInstances: 100,
  timeout: 5000,
  retryAttempts: 3,
  cacheSize: 50,
  logLevel: 'error',
  performanceMonitoring: false,
  memoryTracking: false
};

function cloneItem(item: CacheItem | undefined): CacheItem | undefined {
  if (!item) {
    return undefined;
  }
  return {
    ...item,
    metadata: { ...item.metadata },
    properties: { ...item.properties },
    tags: [...item.tags],
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
    lastAccessed: new Date(item.lastAccessed)
  };
}

export class CacheManagerPureManager {
  private readonly config: CacheManagerConfig;
  private readonly items = new Map<string, CacheItem>();
  private initialized = false;
  private lastActivity: Date | null = null;
  private opCount = 0;
  private totalDuration = 0;
  private idCounter = 0;

  constructor(config: Partial<CacheManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    this.lastActivity = new Date();
  }

  async destroy(): Promise<void> {
    this.items.clear();
    this.initialized = false;
    this.opCount = 0;
    this.totalDuration = 0;
    this.lastActivity = new Date();
  }

  private ensureReady(): void {
    if (!this.config.enabled) {
      throw new Error('Cache manager is disabled');
    }
    if (!this.initialized) {
      throw new Error('Cache manager is not initialized');
    }
  }

  private recordOperation(start: number): void {
    const duration = Date.now() - start;
    this.opCount += 1;
    this.totalDuration += duration;
    this.lastActivity = new Date();
  }

  private generateId(): string {
    this.idCounter += 1;
    return `cache-item-${Date.now()}-${this.idCounter}`;
  }

  private buildItem(data: Partial<CacheItem>): CacheItem {
    const now = new Date();
    return {
      id: data.id ?? this.generateId(),
      name: data.name ?? 'Unnamed Cache Item',
      type: data.type ?? 'generic',
      status: data.status ?? 'active',
      metadata: { ...(data.metadata ?? {}) },
      properties: { ...(data.properties ?? {}) },
      tags: [...(data.tags ?? [])],
      priority: data.priority ?? 0,
      version: data.version ?? '1.0.0',
      size: data.size ?? 0,
      ttl: data.ttl ?? 0,
      createdAt: data.createdAt ? new Date(data.createdAt) : now,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : now,
      accessCount: data.accessCount ?? 0,
      lastAccessed: data.lastAccessed ? new Date(data.lastAccessed) : now
    };
  }

  async createManager(data: Partial<CacheItem> = {}): Promise<CacheItem> {
    this.ensureReady();
    const start = Date.now();

    if (this.items.size >= this.config.maxInstances) {
      throw new Error('Maximum number of cache items reached');
    }

    const record = this.buildItem(data);
    this.items.set(record.id, record);
    this.recordOperation(start);
    return cloneItem(record)!;
  }

  async createItem(data: Partial<CacheItem> = {}): Promise<CacheItem> {
    return this.createManager(data);
  }

  findIndex(id: string): CacheItem | undefined {
    const item = this.items.get(id);
    if (item) {
      item.accessCount += 1;
      item.lastAccessed = new Date();
    }
    return cloneItem(item);
  }

  getManager(id: string): CacheItem | undefined {
    return this.findIndex(id);
  }

  getItem(id: string): CacheItem | undefined {
    return this.findIndex(id);
  }

  getAllManagers(): CacheItem[] {
    return Array.from(this.items.values())
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(item => cloneItem(item)!)
      .filter(Boolean);
  }

  getAllItems(): CacheItem[] {
    return this.getAllManagers();
  }

  async updateManager(id: string, updates: Partial<CacheItem>): Promise<CacheItem | undefined> {
    this.ensureReady();
    const start = Date.now();

    const existing = this.items.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: CacheItem = {
      ...existing,
      ...updates,
      metadata: { ...existing.metadata, ...(updates.metadata ?? {}) },
      properties: { ...existing.properties, ...(updates.properties ?? {}) },
      tags: updates.tags ? [...updates.tags] : existing.tags,
      size: updates.size ?? existing.size,
      ttl: updates.ttl ?? existing.ttl,
      updatedAt: new Date()
    };

    this.items.set(id, updated);
    this.recordOperation(start);
    return cloneItem(updated);
  }

  async updateItem(id: string, updates: Partial<CacheItem>): Promise<CacheItem | undefined> {
    return this.updateManager(id, updates);
  }

  async deleteManager(id: string): Promise<boolean> {
    this.ensureReady();
    const start = Date.now();
    const deleted = this.items.delete(id);
    this.recordOperation(start);
    return deleted;
  }

  async deleteItem(id: string): Promise<boolean> {
    return this.deleteManager(id);
  }

  getStats(): CacheManagerStats {
    const items = Array.from(this.items.values());
    const totalItems = items.length;
    const activeItems = items.filter(item => item.status === 'active').length;
    const inactiveItems = items.filter(item => item.status === 'inactive').length;
    const errorItems = items.filter(item => item.status === 'error').length;
    const averageItemSize = totalItems === 0 ? 0 : items.reduce((sum, item) => sum + item.size, 0) / totalItems;
    const averageAccessCount = totalItems === 0 ? 0 : items.reduce((sum, item) => sum + item.accessCount, 0) / totalItems;

    return {
      totalItems,
      activeItems,
      inactiveItems,
      errorItems,
      averageItemSize,
      averageAccessCount,
      lastActivity: this.lastActivity
    };
  }

  getAnalytics(): CacheManagerAnalytics {
    const items = Array.from(this.items.values());
    const tags: Record<string, number> = {};
    const types: Record<string, number> = {};
    const priorityDistribution: Record<string, number> = {};

    items.forEach(item => {
      types[item.type] = (types[item.type] ?? 0) + 1;
      priorityDistribution[String(item.priority)] = (priorityDistribution[String(item.priority)] ?? 0) + 1;
      item.tags.forEach(tag => {
        tags[tag] = (tags[tag] ?? 0) + 1;
      });
    });

    const activeItems = items.filter(item => item.status === 'active').length;
    const inactiveItems = items.filter(item => item.status === 'inactive').length;

    return {
      totalItems: items.length,
      activeItems,
      inactiveItems,
      tags,
      types,
      priorityDistribution,
      lastUpdated: new Date()
    };
  }
}

export default CacheManagerPureManager;
