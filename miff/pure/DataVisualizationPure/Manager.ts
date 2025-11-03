/**
 * DataVisualizationPure Manager - In-memory visualization manager registry
 */

export type VisualizationStatus = 'active' | 'inactive' | 'error';

export interface DataVisualizationManagerConfig {
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

export interface VisualizationRecord {
	id: string;
	name: string;
	type: 'line' | 'bar' | 'pie' | 'heatmap' | 'scatter' | 'custom';
	status: VisualizationStatus;
	datasets: number;
	refreshRateMs: number;
	lastRendered: Date | null;
	accuracy: number;
	theme: 'light' | 'dark' | 'auto';
	metadata: Record<string, any>;
	properties: Record<string, any>;
	tags: string[];
	priority: number;
	version: string;
	createdAt: Date;
	updatedAt: Date;
}

interface VisualizationStats {
	totalItems: number;
	activeItems: number;
	inactiveItems: number;
	errorCount: number;
	averageRefreshRate: number;
	averageAccuracy: number;
	memoryUsage: number;
	uptime: number;
	lastActivity: Date | null;
	totalOperations: number;
}

interface VisualizationAnalytics {
	totalItems: number;
	activeItems: number;
	inactiveItems: number;
	errorItems: number;
	averageProcessingTime: number;
	totalOperations: number;
	successRate: number;
	lastUpdated: Date | null;
}

const DEFAULT_CONFIG: DataVisualizationManagerConfig = {
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

function createEmptyStats(): VisualizationStats {
	return {
		totalItems: 0,
		activeItems: 0,
		inactiveItems: 0,
		errorCount: 0,
		averageRefreshRate: 0,
		averageAccuracy: 0,
		memoryUsage: 0,
		uptime: 0,
		lastActivity: null,
		totalOperations: 0
	};
}

function createEmptyAnalytics(): VisualizationAnalytics {
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

function cloneRecord(record: VisualizationRecord): VisualizationRecord {
	return {
		...record,
		metadata: { ...record.metadata },
		properties: { ...record.properties },
		tags: [...record.tags],
		createdAt: new Date(record.createdAt),
		updatedAt: new Date(record.updatedAt),
		lastRendered: record.lastRendered ? new Date(record.lastRendered) : null
	};
}

export class DataVisualizationPureManager {
	private readonly config: DataVisualizationManagerConfig;
	private initialized = false;
	private readonly records = new Map<string, VisualizationRecord>();
	private stats: VisualizationStats = createEmptyStats();
	private analytics: VisualizationAnalytics = createEmptyAnalytics();
	private readonly startTime = Date.now();

	constructor(config: Partial<DataVisualizationManagerConfig> = {}) {
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
			throw new Error('DataVisualization manager not initialized');
		}
	}

	private updateMetrics(): void {
		const items = Array.from(this.records.values());
		const active = items.filter(item => item.status === 'active').length;
		const inactive = items.filter(item => item.status === 'inactive').length;
		const errors = items.filter(item => item.status === 'error').length;
		const totalRefresh = items.reduce((sum, item) => sum + item.refreshRateMs, 0);
		const totalAccuracy = items.reduce((sum, item) => sum + item.accuracy, 0);

		this.stats.totalItems = items.length;
		this.stats.activeItems = active;
		this.stats.inactiveItems = inactive;
		this.stats.errorCount = errors;
		this.stats.averageRefreshRate = items.length ? totalRefresh / items.length : 0;
		this.stats.averageAccuracy = items.length ? totalAccuracy / items.length : 0;
		this.stats.memoryUsage = Math.round(items.length * 0.04 * 100) / 100;
		this.stats.uptime = Date.now() - this.startTime;
		this.stats.lastActivity = new Date();

		this.analytics = {
			totalItems: items.length,
			activeItems: active,
			inactiveItems: inactive,
			errorItems: errors,
			averageProcessingTime: this.stats.averageRefreshRate,
			totalOperations: this.stats.totalOperations,
			successRate: items.length === 0 ? 1 : active / items.length,
			lastUpdated: this.stats.lastActivity
		};
	}

	private recordOperation(): void {
		this.stats.totalOperations += 1;
		this.stats.lastActivity = new Date();
	}

	createManager(data: Partial<VisualizationRecord> = {}): VisualizationRecord {
		this.ensureInitialized();
		const record: VisualizationRecord = {
			id: data.id ?? makeId('visualization'),
			name: data.name ?? 'Untitled Visualization',
			type: data.type ?? 'line',
			status: data.status ?? 'active',
			datasets: data.datasets ?? 1,
			refreshRateMs: data.refreshRateMs ?? 1000,
			lastRendered: data.lastRendered ? new Date(data.lastRendered) : null,
			accuracy: data.accuracy ?? 0.95,
			theme: data.theme ?? 'auto',
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

	getManager(id: string): VisualizationRecord | undefined {
		this.ensureInitialized();
		const record = this.records.get(id);
		return record ? cloneRecord(record) : undefined;
	}

	getAllManagers(): VisualizationRecord[] {
		this.ensureInitialized();
		return Array.from(this.records.values()).map(cloneRecord);
	}

	updateManager(id: string, updates: Partial<VisualizationRecord>): VisualizationRecord | undefined {
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
		if (updates.lastRendered) {
			record.lastRendered = new Date(updates.lastRendered);
		}
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

	getStats(): VisualizationStats {
		this.ensureInitialized();
		return {
			...this.stats,
			lastActivity: this.stats.lastActivity ? new Date(this.stats.lastActivity) : null
		};
	}

	getAnalytics(): VisualizationAnalytics {
		this.ensureInitialized();
		return {
			...this.analytics,
			lastUpdated: this.analytics.lastUpdated ? new Date(this.analytics.lastUpdated) : null
		};
	}

	async createItem(data: Partial<VisualizationRecord>): Promise<VisualizationRecord> {
		return this.createManager(data);
	}

	getItem(id: string): VisualizationRecord | undefined {
		return this.getManager(id);
	}

	async updateItem(id: string, updates: Partial<VisualizationRecord>): Promise<VisualizationRecord | undefined> {
		return this.updateManager(id, updates);
	}

	async deleteItem(id: string): Promise<boolean> {
		return this.deleteManager(id);
	}

	getAllItems(): VisualizationRecord[] {
		return this.getAllManagers();
	}
}

export default DataVisualizationPureManager;
export const dataVisualizationPureManager = new DataVisualizationPureManager();
