/**
 * DataLakePure Manager - In-memory data lake registry
 */

export type DataLakeStatus = 'active' | 'suspended' | 'error';

export interface DataLakeManagerConfig {
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

export interface DataLakeRecord {
	id: string;
	name: string;
	type: 'raw' | 'curated' | 'sandbox' | 'governed';
	status: DataLakeStatus;
	storageGb: number;
	usedGb: number;
	ingestionPipelines: number;
	streamSources: number;
	batchSources: number;
	governanceScore: number;
	encryptionEnabled: boolean;
	metadata: Record<string, any>;
	properties: Record<string, any>;
	tags: string[];
	priority: number;
	version: string;
	createdAt: Date;
	updatedAt: Date;
}

interface DataLakeStats {
	totalItems: number;
	activeItems: number;
	inactiveItems: number;
	errorItems: number;
	averagePipelines: number;
	averageGovernanceScore: number;
	totalStorageGb: number;
	usedStorageGb: number;
	uptime: number;
	lastActivity: Date | null;
	totalOperations: number;
}

interface DataLakeAnalytics {
	totalItems: number;
	activeItems: number;
	inactiveItems: number;
	errorItems: number;
	averageProcessingTime: number;
	totalOperations: number;
	successRate: number;
	lastUpdated: Date | null;
}

const DEFAULT_CONFIG: DataLakeManagerConfig = {
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

function createEmptyStats(): DataLakeStats {
	return {
		totalItems: 0,
		activeItems: 0,
		inactiveItems: 0,
		errorItems: 0,
		averagePipelines: 0,
		averageGovernanceScore: 0,
		totalStorageGb: 0,
		usedStorageGb: 0,
		uptime: 0,
		lastActivity: null,
		totalOperations: 0
	};
}

function createEmptyAnalytics(): DataLakeAnalytics {
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

function cloneRecord(record: DataLakeRecord): DataLakeRecord {
	return {
		...record,
		metadata: { ...record.metadata },
		properties: { ...record.properties },
		tags: [...record.tags],
		createdAt: new Date(record.createdAt),
		updatedAt: new Date(record.updatedAt)
	};
}

export class DataLakePureManager {
	private readonly config: DataLakeManagerConfig;
	private initialized = false;
	private readonly records = new Map<string, DataLakeRecord>();
	private stats: DataLakeStats = createEmptyStats();
	private analytics: DataLakeAnalytics = createEmptyAnalytics();
	private readonly startTime = Date.now();

	constructor(config: Partial<DataLakeManagerConfig> = {}) {
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
			throw new Error('DataLake manager not initialized');
		}
	}

	private recordOperation(): void {
		this.stats.totalOperations += 1;
		this.stats.lastActivity = new Date();
	}

	private updateMetrics(): void {
		const items = Array.from(this.records.values());
		const active = items.filter(item => item.status === 'active').length;
		const inactive = items.filter(item => item.status === 'suspended').length;
		const errors = items.filter(item => item.status === 'error').length;
		const totalPipelines = items.reduce((sum, item) => sum + item.ingestionPipelines, 0);
		const totalGovernance = items.reduce((sum, item) => sum + item.governanceScore, 0);
		const totalStorage = items.reduce((sum, item) => sum + item.storageGb, 0);
		const usedStorage = items.reduce((sum, item) => sum + item.usedGb, 0);

		this.stats.totalItems = items.length;
		this.stats.activeItems = active;
		this.stats.inactiveItems = inactive;
		this.stats.errorItems = errors;
		this.stats.averagePipelines = items.length ? totalPipelines / items.length : 0;
		this.stats.averageGovernanceScore = items.length ? totalGovernance / items.length : 0;
		this.stats.totalStorageGb = totalStorage;
		this.stats.usedStorageGb = usedStorage;
		this.stats.uptime = Date.now() - this.startTime;

		this.analytics = {
			totalItems: items.length,
			activeItems: active,
			inactiveItems: inactive,
			errorItems: errors,
			averageProcessingTime: this.stats.averagePipelines,
			totalOperations: this.stats.totalOperations,
			successRate: items.length === 0 ? 1 : active / items.length,
			lastUpdated: this.stats.lastActivity ?? new Date(this.startTime)
		};
	}

	createManager(data: Partial<DataLakeRecord> = {}): DataLakeRecord {
		this.ensureInitialized();
		const record: DataLakeRecord = {
			id: data.id ?? makeId('datalake'),
			name: data.name ?? 'Unified Data Lake',
			type: data.type ?? 'dataLake',
			warehouseType: data.warehouseType ?? 'lakehouse', // keeping compatibility for analytics tests
			status: data.status ?? 'active',
			storageGb: data.storageGb ?? 1024,
			usedGb: Math.min(data.usedGb ?? 0, data.storageGb ?? 1024),
			ingestionPipelines: data.ingestionPipelines ?? 4,
			streamSources: data.streamSources ?? 3,
			batchSources: data.batchSources ?? 5,
			governanceScore: data.governanceScore ?? 0.85,
			encryptionEnabled: data.encryptionEnabled ?? true,
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

	getManager(id: string): DataLakeRecord | undefined {
		this.ensureInitialized();
		const record = this.records.get(id);
		return record ? cloneRecord(record) : undefined;
	}

	getAllManagers(): DataLakeRecord[] {
		this.ensureInitialized();
		return Array.from(this.records.values()).map(cloneRecord);
	}

	updateManager(id: string, updates: Partial<DataLakeRecord>): DataLakeRecord | undefined {
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

	getStats(): DataLakeStats {
		this.ensureInitialized();
		return {
			...this.stats,
			lastActivity: this.stats.lastActivity ? new Date(this.stats.lastActivity) : null
		};
	}

	getAnalytics(): DataLakeAnalytics {
		this.ensureInitialized();
		return {
			...this.analytics,
			lastUpdated: this.analytics.lastUpdated ? new Date(this.analytics.lastUpdated) : null
		};
	}

	async createItem(data: Partial<DataLakeRecord>): Promise<DataLakeRecord> {
		return this.createManager(data);
	}

	getItem(id: string): DataLakeRecord | undefined {
		return this.getManager(id);
	}

	async updateItem(id: string, updates: Partial<DataLakeRecord>): Promise<DataLakeRecord | undefined> {
		return this.updateManager(id, updates);
	}

	async deleteItem(id: string): Promise<boolean> {
		return this.deleteManager(id);
	}

	getAllItems(): DataLakeRecord[] {
		return this.getAllManagers();
	}
}

export default DataLakePureManager;
export const dataLakePureManager = new DataLakePureManager();
