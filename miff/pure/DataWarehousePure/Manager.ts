/**
 * DataWarehousePure Manager - In-memory warehouse registry
 */

export type WarehouseStatus = 'active' | 'paused' | 'error';

export interface DataWarehouseManagerConfig {
	enabled: boolean;
	debugMode: boolean;
	maxInstances: number;
	timeout: number;
	retryAttempts: number;
	cacheSize: number;
	logLevel: 'error' | 'warn' | 'info' | 'debug';
	performanceMonitoring: boolean;
	memoryTracking: boolean;
}

export interface WarehouseRecord {
	id: string;
	name: string;
	type: string;
	warehouseType: 'lakehouse' | 'traditional' | 'real-time' | 'federated';
	status: WarehouseStatus;
	storageGb: number;
	usedGb: number;
	queryThroughputQph: number;
	concurrency: number;
	refreshIntervalMs: number;
	sourceSystems: string[];
	metadata: Record<string, any>;
	properties: Record<string, any>;
	tags: string[];
	priority: number;
	version: string;
	createdAt: Date;
	updatedAt: Date;
}

interface WarehouseStats {
	totalItems: number;
	activeItems: number;
	inactiveItems: number;
	errorItems: number;
	averageRefreshInterval: number;
	averageThroughput: number;
	totalStorageGb: number;
	usedStorageGb: number;
	uptime: number;
	lastActivity: Date | null;
	totalOperations: number;
}

interface WarehouseAnalytics {
	totalItems: number;
	activeItems: number;
	inactiveItems: number;
	errorItems: number;
	averageProcessingTime: number;
	totalOperations: number;
	successRate: number;
	lastUpdated: Date | null;
}

const DEFAULT_CONFIG: DataWarehouseManagerConfig = {
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

function createEmptyStats(): WarehouseStats {
	return {
		totalItems: 0,
		activeItems: 0,
		inactiveItems: 0,
		errorItems: 0,
		averageRefreshInterval: 0,
		averageThroughput: 0,
		totalStorageGb: 0,
		usedStorageGb: 0,
		uptime: 0,
		lastActivity: null,
		totalOperations: 0
	};
}

function createEmptyAnalytics(): WarehouseAnalytics {
	return {
		totalItems: 0,
		activeItems: 0,
		inactiveItems: 0,
		errorItems: 0,
		averageProcessingTime: 0,
		totalOperations: 0,
		successRate: 1,
		lastUpdated: null
	};
}

function makeId(prefix: string): string {
	return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function cloneRecord(record: WarehouseRecord): WarehouseRecord {
	return {
		...record,
		metadata: { ...record.metadata },
		properties: { ...record.properties },
		tags: [...record.tags],
		sourceSystems: [...record.sourceSystems],
		createdAt: new Date(record.createdAt),
		updatedAt: new Date(record.updatedAt)
	};
}

export class DataWarehousePureManager {
	private readonly config: DataWarehouseManagerConfig;
	private initialized = false;
	private readonly records = new Map<string, WarehouseRecord>();
	private stats: WarehouseStats = createEmptyStats();
	private analytics: WarehouseAnalytics = createEmptyAnalytics();
	private readonly startTime = Date.now();

	constructor(config: Partial<DataWarehouseManagerConfig> = {}) {
		this.config = { ...DEFAULT_CONFIG, ...config };
	}

	async initialize(): Promise<void> {
		if (this.initialized) {
			return;
		}
		this.initialized = true;
		this.stats = createEmptyStats();
		this.analytics = createEmptyAnalytics();
	}

	async destroy(): Promise<void> {
		this.records.clear();
		this.stats = createEmptyStats();
		this.analytics = createEmptyAnalytics();
		this.initialized = false;
	}

	private ensureInitialized(): void {
		if (!this.initialized) {
			throw new Error('DataWarehouse manager not initialized');
		}
	}

	private recordOperation(): void {
		this.stats.totalOperations += 1;
		this.stats.lastActivity = new Date();
	}

	private updateMetrics(): void {
		const items = Array.from(this.records.values());
		const active = items.filter(item => item.status === 'active').length;
		const inactive = items.filter(item => item.status === 'paused').length;
		const errors = items.filter(item => item.status === 'error').length;
		const totalRefresh = items.reduce((sum, item) => sum + item.refreshIntervalMs, 0);
		const totalThroughput = items.reduce((sum, item) => sum + item.queryThroughputQph, 0);
		const totalStorage = items.reduce((sum, item) => sum + item.storageGb, 0);
		const usedStorage = items.reduce((sum, item) => sum + item.usedGb, 0);

		this.stats.totalItems = items.length;
		this.stats.activeItems = active;
		this.stats.inactiveItems = inactive;
		this.stats.errorItems = errors;
		this.stats.averageRefreshInterval = items.length ? totalRefresh / items.length : 0;
		this.stats.averageThroughput = items.length ? totalThroughput / items.length : 0;
		this.stats.totalStorageGb = totalStorage;
		this.stats.usedStorageGb = usedStorage;
		this.stats.uptime = Date.now() - this.startTime;

		this.analytics = {
			totalItems: items.length,
			activeItems: active,
			inactiveItems: inactive,
			errorItems: errors,
			averageProcessingTime: this.stats.averageRefreshInterval,
			totalOperations: this.stats.totalOperations,
			successRate: items.length === 0 ? 1 : active / items.length,
			lastUpdated: this.stats.lastActivity ?? new Date(this.startTime)
		};
	}

	createManager(data: Partial<WarehouseRecord> = {}): WarehouseRecord {
		this.ensureInitialized();
		const record: WarehouseRecord = {
			id: data.id ?? makeId('warehouse'),
			name: data.name ?? 'Unified Warehouse',
			type: data.type ?? 'warehouse',
			warehouseType: data.warehouseType ?? 'lakehouse',
			status: data.status ?? 'active',
			storageGb: data.storageGb ?? 512,
			usedGb: Math.min(data.usedGb ?? 0, data.storageGb ?? 512),
			queryThroughputQph: data.queryThroughputQph ?? 5000,
			concurrency: data.concurrency ?? 25,
			refreshIntervalMs: data.refreshIntervalMs ?? 60000,
			sourceSystems: data.sourceSystems ? [...data.sourceSystems] : ['erp', 'crm'],
			metadata: { ...(data.metadata ?? {}) },
			properties: { ...(data.properties ?? {}) },
			tags: data.tags ? [...data.tags] : [],
			priority: data.priority ?? 0,
			version: data.version ?? '1.0.0',
			createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
			updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
		};

		this.records.set(record.id, record);
		this.recordOperation();
		this.updateMetrics();
		return cloneRecord(record);
	}

	getManager(id: string): WarehouseRecord | undefined {
		this.ensureInitialized();
		const record = this.records.get(id);
		return record ? cloneRecord(record) : undefined;
	}

	getAllManagers(): WarehouseRecord[] {
		this.ensureInitialized();
		return Array.from(this.records.values()).map(cloneRecord);
	}

	updateManager(id: string, updates: Partial<WarehouseRecord>): WarehouseRecord | undefined {
		this.ensureInitialized();
		const record = this.records.get(id);
		if (!record) {
			return undefined;
		}

		Object.assign(record, updates);
		if (updates.tags) {
			record.tags = [...updates.tags];
		}
		if (updates.metadata) {
			record.metadata = { ...updates.metadata };
		}
		if (updates.properties) {
			record.properties = { ...updates.properties };
		}
		if (updates.sourceSystems) {
			record.sourceSystems = [...updates.sourceSystems];
		}
		record.usedGb = Math.min(record.usedGb, record.storageGb);
		record.updatedAt = new Date();

		this.recordOperation();
		this.updateMetrics();
		return cloneRecord(record);
	}

	deleteManager(id: string): boolean {
		this.ensureInitialized();
		const deleted = this.records.delete(id);
		if (deleted) {
			this.recordOperation();
			this.updateMetrics();
		}
		return deleted;
	}

	getStats(): WarehouseStats {
		this.ensureInitialized();
		return {
			...this.stats,
			lastActivity: this.stats.lastActivity ? new Date(this.stats.lastActivity) : null
		};
	}

	getAnalytics(): WarehouseAnalytics {
		this.ensureInitialized();
		return {
			...this.analytics,
			lastUpdated: this.analytics.lastUpdated ? new Date(this.analytics.lastUpdated) : null
		};
	}

	async createItem(data: Partial<WarehouseRecord>): Promise<WarehouseRecord> {
		return this.createManager(data);
	}

	getItem(id: string): WarehouseRecord | undefined {
		return this.getManager(id);
	}

	async updateItem(id: string, updates: Partial<WarehouseRecord>): Promise<WarehouseRecord | undefined> {
		return this.updateManager(id, updates);
	}

	async deleteItem(id: string): Promise<boolean> {
		return this.deleteManager(id);
	}

	getAllItems(): WarehouseRecord[] {
		return this.getAllManagers();
	}
}

export default DataWarehousePureManager;
export const dataWarehousePureManager = new DataWarehousePureManager();
