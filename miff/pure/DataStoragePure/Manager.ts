/**
 * DataStoragePure Manager - Lightweight in-memory storage manager
 */

export type StorageTier = 'standard' | 'infrequent' | 'archive';
export type StorageStatus = 'available' | 'provisioning' | 'error' | 'deleting';

export interface DataStorageManagerConfig {
	provider: 'miff' | 's3' | 'gcs' | 'azure';
	region: string;
	replication: 'single' | 'dual' | 'multi';
	defaultEncryption: boolean;
	monitoringEnabled: boolean;
	maxVolumes: number;
}

export interface StorageVolume {
	id: string;
	name: string;
	tier: StorageTier;
	status: StorageStatus;
	capacityGb: number;
	usedGb: number;
	metadata: Record<string, any>;
	tags: string[];
	createdAt: Date;
	updatedAt: Date;
}

interface StorageStats {
	totalVolumes: number;
	totalCapacityGb: number;
	usedCapacityGb: number;
	availableCapacityGb: number;
	lastUpdated: Date | null;
}

const DEFAULT_CONFIG: DataStorageManagerConfig = {
	provider: 'miff',
	region: 'us-central-1',
	replication: 'single',
	defaultEncryption: true,
	monitoringEnabled: false,
	maxVolumes: 100
};

function createStats(): StorageStats {
	return {
		totalVolumes: 0,
		totalCapacityGb: 0,
		usedCapacityGb: 0,
		availableCapacityGb: 0,
		lastUpdated: null
	};
}

function makeId(prefix: string): string {
	return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function cloneVolume(volume: StorageVolume): StorageVolume {
	return {
		...volume,
		metadata: { ...volume.metadata },
		tags: [...volume.tags],
		createdAt: new Date(volume.createdAt),
		updatedAt: new Date(volume.updatedAt)
	};
}

export class Manager {
	private readonly config: DataStorageManagerConfig;
	private readonly volumes = new Map<string, StorageVolume>();
	private stats: StorageStats = createStats();
	private initialized = false;

	constructor(config: Partial<DataStorageManagerConfig> = {}) {
		this.config = { ...DEFAULT_CONFIG, ...config };
	}

	async initialize(): Promise<void> {
		this.initialized = true;
		this.stats = createStats();
	}

	async destroy(): Promise<void> {
		this.volumes.clear();
		this.stats = createStats();
		this.initialized = false;
	}

	private ensureInitialized(): void {
		if (!this.initialized) {
			throw new Error('DataStorage manager not initialized');
		}
	}

	private updateStats(): void {
		const volumes = Array.from(this.volumes.values());
		const totalCapacity = volumes.reduce((sum, volume) => sum + volume.capacityGb, 0);
		const usedCapacity = volumes.reduce((sum, volume) => sum + volume.usedGb, 0);

		this.stats = {
			totalVolumes: volumes.length,
			totalCapacityGb: totalCapacity,
			usedCapacityGb: usedCapacity,
			availableCapacityGb: totalCapacity - usedCapacity,
			lastUpdated: new Date()
		};
	}

	createVolume(data: Partial<StorageVolume> = {}): StorageVolume {
		this.ensureInitialized();
		if (this.volumes.size >= this.config.maxVolumes) {
			throw new Error('Maximum number of volumes reached');
		}

		const volume: StorageVolume = {
			id: data.id ?? makeId('volume'),
			name: data.name ?? 'Unnamed Volume',
			tier: data.tier ?? 'standard',
			status: data.status ?? 'available',
			capacityGb: data.capacityGb ?? 1024,
			usedGb: Math.min(data.usedGb ?? 0, data.capacityGb ?? 1024),
			metadata: { ...(data.metadata ?? {}) },
			tags: data.tags ? [...data.tags] : [],
			createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
			updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
		};

		this.volumes.set(volume.id, volume);
		this.updateStats();
		return cloneVolume(volume);
	}

	getVolume(id: string): StorageVolume | undefined {
		this.ensureInitialized();
		const volume = this.volumes.get(id);
		return volume ? cloneVolume(volume) : undefined;
	}

	listVolumes(): StorageVolume[] {
		this.ensureInitialized();
		return Array.from(this.volumes.values()).map(cloneVolume);
	}

	updateVolume(id: string, updates: Partial<StorageVolume>): StorageVolume | undefined {
		this.ensureInitialized();
		const volume = this.volumes.get(id);
		if (!volume) {
			return undefined;
		}

		Object.assign(volume, updates);
		if (updates.tags) {
			volume.tags = [...updates.tags];
		}
		if (updates.metadata) {
			volume.metadata = { ...updates.metadata };
		}
		volume.usedGb = Math.min(volume.usedGb, volume.capacityGb);
		volume.updatedAt = new Date();

		this.updateStats();
		return cloneVolume(volume);
	}

	deleteVolume(id: string): boolean {
		this.ensureInitialized();
		const deleted = this.volumes.delete(id);
		if (deleted) {
			this.updateStats();
		}
		return deleted;
	}

	getStats(): StorageStats {
		this.ensureInitialized();
		return {
			...this.stats,
			lastUpdated: this.stats.lastUpdated ? new Date(this.stats.lastUpdated) : null
		};
	}
}

export default Manager;
export const dataStorageManager = new Manager();
