/**
 * DataPipelinePure Manager - In-memory data pipeline registry
 */

export type PipelineStatus = 'active' | 'paused' | 'failed' | 'draft';

export interface DataPipelineManagerConfig {
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

export interface PipelineRecord {
	id: string;
	name: string;
	type: string;
	status: PipelineStatus;
	steps: number;
	sources: string[];
	destinations: string[];
	latencyMs: number;
	throughputRecordsPerSec: number;
	lastRun?: Date | null;
	metadata: Record<string, any>;
	properties: Record<string, any>;
	tags: string[];
	priority: number;
	version: string;
	createdAt: Date;
	updatedAt: Date;
}

interface PipelineStats {
	totalItems: number;
	activeItems: number;
	inactiveItems: number;
	errorItems: number;
	averageSteps: number;
	averageLatency: number;
	averageThroughput: number;
	uptime: number;
	lastActivity: Date | null;
	totalOperations: number;
}

interface PipelineAnalytics {
	totalItems: number;
	activeItems: number;
	inactiveItems: number;
	errorItems: number;
	averageProcessingTime: number;
	totalOperations: number;
	successRate: number;
	lastUpdated: Date | null;
}

const DEFAULT_CONFIG: DataPipelineManagerConfig = {
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

function createEmptyStats(): PipelineStats {
	return {
		totalItems: 0,
		activeItems: 0,
		inactiveItems: 0,
		errorItems: 0,
		averageSteps: 0,
		averageLatency: 0,
		averageThroughput: 0,
		uptime: 0,
		lastActivity: null,
		totalOperations: 0
	};
}

function createEmptyAnalytics(): PipelineAnalytics {
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

function cloneRecord(record: PipelineRecord): PipelineRecord {
	return {
		...record,
		sources: [...record.sources],
		destinations: [...record.destinations],
		metadata: { ...record.metadata },
		properties: { ...record.properties },
		tags: [...record.tags],
		createdAt: new Date(record.createdAt),
		updatedAt: new Date(record.updatedAt),
		lastRun: record.lastRun ? new Date(record.lastRun) : null
	};
}

export class DataPipelinePureManager {
	private readonly config: DataPipelineManagerConfig;
	private initialized = false;
	private readonly records = new Map<string, PipelineRecord>();
	private stats: PipelineStats = createEmptyStats();
	private analytics: PipelineAnalytics = createEmptyAnalytics();
	private readonly startTime = Date.now();

	constructor(config: Partial<DataPipelineManagerConfig> = {}) {
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
			throw new Error('DataPipeline manager not initialized');
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
		const errors = items.filter(item => item.status === 'failed').length;
		const totalSteps = items.reduce((sum, item) => sum + item.steps, 0);
		const totalLatency = items.reduce((sum, item) => sum + item.latencyMs, 0);
		const totalThroughput = items.reduce((sum, item) => sum + item.throughputRecordsPerSec, 0);

		this.stats.totalItems = items.length;
		this.stats.activeItems = active;
		this.stats.inactiveItems = inactive;
		this.stats.errorItems = errors;
		this.stats.averageSteps = items.length ? totalSteps / items.length : 0;
		this.stats.averageLatency = items.length ? totalLatency / items.length : 0;
		this.stats.averageThroughput = items.length ? totalThroughput / items.length : 0;
		this.stats.uptime = Date.now() - this.startTime;

		this.analytics = {
			totalItems: items.length,
			activeItems: active,
			inactiveItems: inactive,
			errorItems: errors,
			averageProcessingTime: this.stats.averageLatency,
			totalOperations: this.stats.totalOperations,
			successRate: items.length === 0 ? 1 : active / items.length,
			lastUpdated: this.stats.lastActivity ?? new Date(this.startTime)
		};
	}

	createManager(data: Partial<PipelineRecord> = {}): PipelineRecord {
		this.ensureInitialized();
		const record: PipelineRecord = {
			id: data.id ?? makeId('pipeline'),
			name: data.name ?? 'Pipeline',
			type: data.type ?? 'etl',
			status: data.status ?? 'active',
			steps: data.steps ?? 5,
			sources: data.sources ? [...data.sources] : ['source-system'],
			destinations: data.destinations ? [...data.destinations] : ['warehouse'],
			latencyMs: data.latencyMs ?? 200,
			throughputRecordsPerSec: data.throughputRecordsPerSec ?? 1000,
			lastRun: data.lastRun ? new Date(data.lastRun) : null,
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

	getManager(id: string): PipelineRecord | undefined {
		this.ensureInitialized();
		const record = this.records.get(id);
		return record ? cloneRecord(record) : undefined;
	}

	getAllManagers(): PipelineRecord[] {
		this.ensureInitialized();
		return Array.from(this.records.values()).map(cloneRecord);
	}

	updateManager(id: string, updates: Partial<PipelineRecord>): PipelineRecord | undefined {
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
		if (updates.sources) {
			record.sources = [...updates.sources];
		}
		if (updates.destinations) {
			record.destinations = [...updates.destinations];
		}
		record.updatedAt = new Date();
		if (updates.lastRun) {
			record.lastRun = new Date(updates.lastRun);
		}

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

	getStats(): PipelineStats {
		this.ensureInitialized();
		return {
			...this.stats,
			lastActivity: this.stats.lastActivity ? new Date(this.stats.lastActivity) : null
		};
	}

	getAnalytics(): PipelineAnalytics {
		this.ensureInitialized();
		return {
			...this.analytics,
			lastUpdated: this.analytics.lastUpdated ? new Date(this.analytics.lastUpdated) : null
		};
	}

	async createItem(data: Partial<PipelineRecord>): Promise<PipelineRecord> {
		return this.createManager(data);
	}

	getItem(id: string): PipelineRecord | undefined {
		return this.getManager(id);
	}

	async updateItem(id: string, updates: Partial<PipelineRecord>): Promise<PipelineRecord | undefined> {
		return this.updateManager(id, updates);
	}

	async deleteItem(id: string): Promise<boolean> {
		return this.deleteManager(id);
	}

	getAllItems(): PipelineRecord[] {
		return this.getAllManagers();
	}
}

export default DataPipelinePureManager;
export const dataPipelinePureManager = new DataPipelinePureManager();
