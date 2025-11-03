export type EventSystemStatus = 'active' | 'inactive' | 'pending' | 'error';

export interface EventSystemItem {
  id: string;
  name: string;
  type: string;
  status: EventSystemStatus;
  metadata: Record<string, any>;
  properties: Record<string, any>;
  tags: string[];
  priority: number;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventSystemConfig {
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

export interface EventSystemStats {
  totalItems: number;
  activeItems: number;
  inactiveItems: number;
  errorItems: number;
  lastActivity: Date | null;
  averageResponseTime: number;
}

export interface EventSystemAnalytics {
  totalItems: number;
  activeItems: number;
  inactiveItems: number;
  tags: Record<string, number>;
  priorityDistribution: Record<string, number>;
  lastUpdated: Date;
}

interface OperationMetrics {
  operationCount: number;
  totalDuration: number;
}

const DEFAULT_CONFIG: EventSystemConfig = {
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

function cloneItem(item: EventSystemItem | undefined): EventSystemItem | undefined {
  if (!item) {
    return undefined;
  }
  return {
    ...item,
    metadata: { ...item.metadata },
    properties: { ...item.properties },
    tags: [...item.tags],
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt)
  };
}

export class EventSystemPure {
  private readonly config: EventSystemConfig;
  private readonly items: Map<string, EventSystemItem> = new Map();
  private initialized = false;
  private lastActivity: Date | null = null;
  private metrics: OperationMetrics = {
    operationCount: 0,
    totalDuration: 0
  };
  private idCounter = 0;

  constructor(config: Partial<EventSystemConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    this.initialized = true;
    this.lastActivity = new Date();
  }

  async destroy(): Promise<void> {
    this.items.clear();
    this.initialized = false;
    this.metrics = { operationCount: 0, totalDuration: 0 };
  }

  private ensureEnabled(): void {
    if (!this.config.enabled) {
      throw new Error('EventSystemPure is disabled');
    }
    if (!this.initialized) {
      throw new Error('EventSystemPure is not initialized');
    }
  }

  private recordOperation(start: number): void {
    const duration = Date.now() - start;
    this.metrics.operationCount += 1;
    this.metrics.totalDuration += duration;
    this.lastActivity = new Date();
  }

  private createRecord(data: Partial<EventSystemItem>): EventSystemItem {
    const now = new Date();
    return {
      id: data.id ?? this.generateId(),
      name: data.name ?? 'Unnamed Item',
      type: data.type ?? 'generic',
      status: data.status ?? 'active',
      metadata: { ...(data.metadata ?? {}) },
      properties: { ...(data.properties ?? {}) },
      tags: [...(data.tags ?? [])],
      priority: data.priority ?? 0,
      version: data.version ?? '1.0.0',
      createdAt: now,
      updatedAt: now
    };
  }

  async createManager(data: Partial<EventSystemItem> = {}): Promise<EventSystemItem> {
    this.ensureEnabled();
    const start = Date.now();

    if (this.items.size >= this.config.maxInstances) {
      throw new Error('Maximum number of items reached');
    }

    const record = this.createRecord(data);
    this.items.set(record.id, record);
    this.recordOperation(start);
    return cloneItem(record)!;
  }

  getManager(id: string): EventSystemItem | undefined {
    const record = this.items.get(id);
    return cloneItem(record);
  }

  getAllManagers(): EventSystemItem[] {
    return Array.from(this.items.values()).map(item => cloneItem(item)!)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async updateManager(id: string, updates: Partial<EventSystemItem>): Promise<EventSystemItem | undefined> {
    this.ensureEnabled();
    const start = Date.now();

    const existing = this.items.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: EventSystemItem = {
      ...existing,
      ...updates,
      metadata: { ...existing.metadata, ...(updates.metadata ?? {}) },
      properties: { ...existing.properties, ...(updates.properties ?? {}) },
      tags: updates.tags ? [...updates.tags] : existing.tags,
      updatedAt: new Date()
    };

    this.items.set(id, updated);
    this.recordOperation(start);
    return cloneItem(updated);
  }

  async deleteManager(id: string): Promise<boolean> {
    this.ensureEnabled();
    const start = Date.now();
    const deleted = this.items.delete(id);
    this.recordOperation(start);
    return deleted;
  }

  // Generic method aliases used directly in tests
  async createItem(data: Partial<EventSystemItem> = {}): Promise<EventSystemItem> {
    return this.createManager(data);
  }

  getItem(id: string): EventSystemItem | undefined {
    return this.getManager(id);
  }

  getAllItems(): EventSystemItem[] {
    return this.getAllManagers();
  }

  async updateItem(id: string, updates: Partial<EventSystemItem>): Promise<EventSystemItem | undefined> {
    return this.updateManager(id, updates);
  }

  async deleteItem(id: string): Promise<boolean> {
    return this.deleteManager(id);
  }

  getStats(): EventSystemStats {
    const items = Array.from(this.items.values());
    const totalItems = items.length;
    const activeItems = items.filter(item => item.status === 'active').length;
    const inactiveItems = items.filter(item => item.status === 'inactive').length;
    const errorItems = items.filter(item => item.status === 'error').length;
    const averageResponseTime = this.metrics.operationCount === 0
      ? 0
      : this.metrics.totalDuration / this.metrics.operationCount;

    return {
      totalItems,
      activeItems,
      inactiveItems,
      errorItems,
      lastActivity: this.lastActivity,
      averageResponseTime
    };
  }

  getAnalytics(): EventSystemAnalytics {
    const items = Array.from(this.items.values());
    const tagCounts: Record<string, number> = {};
    const priorityDistribution: Record<string, number> = {};

    for (const item of items) {
      for (const tag of item.tags) {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      }
      const priorityKey = String(item.priority);
      priorityDistribution[priorityKey] = (priorityDistribution[priorityKey] ?? 0) + 1;
    }

    const activeItems = items.filter(item => item.status === 'active').length;
    const inactiveItems = items.filter(item => item.status === 'inactive').length;

    return {
      totalItems: items.length,
      activeItems,
      inactiveItems,
      tags: tagCounts,
      priorityDistribution,
      lastUpdated: new Date()
    };
  }

  private generateId(): string {
    this.idCounter += 1;
    return `event-system-${Date.now()}-${this.idCounter}`;
  }
}

export type EventSystemManager = EventSystemPure;

try {
  if (typeof globalThis !== 'undefined' && !(globalThis as any).EventSystemPure) {
    (globalThis as any).EventSystemPure = EventSystemPure;
  }
} catch {
  // ignore environments without globalThis assignment capability
}
