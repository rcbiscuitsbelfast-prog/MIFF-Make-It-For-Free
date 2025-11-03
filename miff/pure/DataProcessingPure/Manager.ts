/**
 * DataProcessingPure Manager - In-memory data processing manager registry
 */

export type ProcessingStatus = 'active' | 'inactive' | 'paused' | 'error';

export interface DataProcessingManagerConfig {
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

export interface DataProcessingRecord {
	id: string;
	name: string;
	type: 'batch' | 'stream' | 'hybrid' | 'experimental';
	status: ProcessingStatus;
	pipelines: number;
	throughput: number;
	latency: number;
	errorRate: number;
	tags: string[];
	priority: number;
	version: string;
	metadata: Record<string, any>;
	properties: Record<string, any>;
	createdAt: Date;
	updatedAt: Date;
}

interface ProcessingStats {
	totalItems: number;
	activeItems: number;
	inactiveItems: number;
	errorItems: number;
	averageLatency: number;
	averageThroughput: number;
	uptime: number;
	lastActivity: Date | null;
	totalOperations: number;
}

interface ProcessingAnalytics {
	totalItems: number;
	activeItems: number;
	inactiveItems: number;
	errorItems: number;
	averageProcessingTime: number;
	totalOperations: number;
	successRate: number;
	lastUpdated: Date | null;
}

const DEFAULT_CONFIG: DataProcessingManagerConfig = {
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

function createEmptyStats(): ProcessingStats {
	return {
		totalItems: 0,
		activeItems: 0,
		inactiveItems: 0,
		errorItems: 0,
		averageLatency: 0,
		averageThroughput: 0,
		uptime: 0,
		lastActivity: null,
		totalOperations: 0
	};
}

function createEmptyAnalytics(): ProcessingAnalytics {
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

function cloneRecord(record: DataProcessingRecord): DataProcessingRecord {
	return {
		...record,
		metadata: { ...record.metadata },
		properties: { ...record.properties },
		tags: [...record.tags],
		createdAt: new Date(record.createdAt),
		updatedAt: new Date(record.updatedAt)
	};
}

export class Manager {
	private readonly config: DataProcessingManagerConfig;
	private initialized = false;
	private readonly items = new Map<string, DataProcessingRecord>();
	private stats: ProcessingStats = createEmptyStats();
	private analytics: ProcessingAnalytics = createEmptyAnalytics();
	private readonly startTime = Date.now();
	private readonly latencySamples: number[] = [];

	constructor(config: Partial<DataProcessingManagerConfig> = {}) {
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
		this.items.clear();
		this.latencySamples.length = 0;
		this.stats = createEmptyStats();
		this.analytics = createEmptyAnalytics();
		this.initialized = false;
	}

	private ensureInitialized(): void {
		if (!this.initialized) {
			throw new Error('DataProcessing manager not initialized');
		}
	}

	private updateStats(): void {
		const records = Array.from(this.items.values());
		const active = records.filter(record => record.status === 'active').length;
		const inactive = records.filter(record => record.status === 'inactive').length;
		const errors = records.filter(record => record.status === 'error').length;
		const totalLatency = records.reduce((sum, record) => sum + record.latency, 0);
		const totalThroughput = records.reduce((sum, record) => sum + record.throughput, 0);

		this.stats.totalItems = records.length;
		this.stats.activeItems = active;
		this.stats.inactiveItems = inactive;
		this.stats.errorItems = errors;
		this.stats.averageLatency = records.length ? totalLatency / records.length : 0;
		this.stats.averageThroughput = records.length ? totalThroughput / records.length : 0;
		this.stats.uptime = Date.now() - this.startTime;

		this.analytics = {
			totalItems: records.length,
			activeItems: active,
			inactiveItems: inactive,
			errorItems: errors,
			averageProcessingTime: this.stats.averageLatency,
			totalOperations: this.stats.totalOperations,
			successRate: records.length === 0 ? 1 : active / records.length,
			lastUpdated: this.stats.lastActivity ?? new Date(this.startTime)
		};
	}

	private recordOperation(latency: number): void {
		this.latencySamples.push(latency);
		this.stats.totalOperations += 1;
		this.stats.lastActivity = new Date();
	}

	createManager(data: Partial<DataProcessingRecord> = {}): DataProcessingRecord {
		this.ensureInitialized();
		const start = Date.now();

		const record: DataProcessingRecord = {
			id: data.id ?? makeId('dataprocessing'),
			name: data.name ?? 'Unnamed Data Pipeline',
			type: data.type ?? 'batch',
			status: data.status ?? 'active',
			pipelines: data.pipelines ?? 0,
			throughput: data.throughput ?? 0,
			latency: data.latency ?? 0,
			errorRate: data.errorRate ?? 0,
			tags: data.tags ? [...data.tags] : [],
			priority: data.priority ?? 0,
			version: data.version ?? '1.0.0',
			metadata: { ...(data.metadata ?? {}) },
			properties: { ...(data.properties ?? {}) },
			createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
			updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
		};

		this.items.set(record.id, record);
		this.recordOperation(Date.now() - start);
		this.updateStats();
		return cloneRecord(record);
	}

	getManager(id: string): DataProcessingRecord | undefined {
		this.ensureInitialized();
		const record = this.items.get(id);
		return record ? cloneRecord(record) : undefined;
	}

	getAllManagers(): DataProcessingRecord[] {
		this.ensureInitialized();
		return Array.from(this.items.values()).map(cloneRecord);
	}

	updateManager(id: string, updates: Partial<DataProcessingRecord>): DataProcessingRecord | undefined {
		this.ensureInitialized();
		const start = Date.now();
		const record = this.items.get(id);
		if (!record) {
			return undefined;
		}

		Object.assign(record, updates);
		record.updatedAt = new Date();
		if (updates.tags) {
			record.tags = [...updates.tags];
		}
		if (updates.metadata) {
			record.metadata = { ...updates.metadata };
		}
		if (updates.properties) {
			record.properties = { ...updates.properties };
		}

		this.recordOperation(Date.now() - start);
		this.updateStats();
		return cloneRecord(record);
	}

	deleteManager(id: string): boolean {
		this.ensureInitialized();
		const start = Date.now();
		const deleted = this.items.delete(id);
		if (deleted) {
			this.recordOperation(Date.now() - start);
			this.updateStats();
		}
		return deleted;
	}

	getStats(): ProcessingStats {
		this.ensureInitialized();
		return {
			...this.stats,
			lastActivity: this.stats.lastActivity ? new Date(this.stats.lastActivity) : null
		};
	}

	getAnalytics(): ProcessingAnalytics {
		this.ensureInitialized();
		return {
			...this.analytics,
			lastUpdated: this.analytics.lastUpdated ? new Date(this.analytics.lastUpdated) : null
		};
	}

	async createItem(data: Partial<DataProcessingRecord>): Promise<DataProcessingRecord> {
		return this.createManager(data);
	}

	getItem(id: string): DataProcessingRecord | undefined {
		return this.getManager(id);
	}

	async updateItem(id: string, updates: Partial<DataProcessingRecord>): Promise<DataProcessingRecord | undefined> {
		return this.updateManager(id, updates);
	}

	async deleteItem(id: string): Promise<boolean> {
		return this.deleteManager(id);
	}

	getAllItems(): DataProcessingRecord[] {
		return this.getAllManagers();
	}
}

export default Manager;
export const dataProcessingManager = new Manager();
