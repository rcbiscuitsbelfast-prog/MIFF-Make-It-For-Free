export interface DataAnalysisPureManagerConfig {
	analyzers?: string[];
	defaultDataset?: string;
	precision?: number;
}

const DEFAULT_CONFIG: DataAnalysisPureManagerConfig = {
	analyzers: ['descriptive', 'predictive'],
	defaultDataset: 'default',
	precision: 3
};

export class DataAnalysisPureManager {
	private readonly config: DataAnalysisPureManagerConfig;

	constructor(config: DataAnalysisPureManagerConfig = {}) {
		this.config = { ...DEFAULT_CONFIG, ...config };
	}

	getConfig(): DataAnalysisPureManagerConfig {
		return { ...this.config, analyzers: [...(this.config.analyzers ?? [])] };
	}
}

export default DataAnalysisPureManager;
