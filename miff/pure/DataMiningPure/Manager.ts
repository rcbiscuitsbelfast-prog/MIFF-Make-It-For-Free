/**
 * DataMiningPure Manager - Advanced Data Mining Management System
 *
 * Comprehensive data mining system with:
 * - Data preprocessing and cleaning
 * - Pattern discovery and recognition
 * - Association rule mining
 * - Clustering and classification
 * - Anomaly detection and outlier analysis
 * - Feature selection and engineering
 * - Model evaluation and validation
 * - Performance optimization
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { StructuredLogger, LogLevel } from '../shared/logging/StructuredLogger';
import { PerformanceOptimizer } from '../shared/performance/PerformanceOptimizer';
import { MemoryManager } from '../shared/memory/MemoryManager';

export interface DataMiningConfig {
  enableDataPreprocessing: boolean;
  enableDataCleaning: boolean;
  enablePatternDiscovery: boolean;
  enablePatternRecognition: boolean;
  enableAssociationRuleMining: boolean;
  enableClustering: boolean;
  enableClassification: boolean;
  enableAnomalyDetection: boolean;
  enableOutlierAnalysis: boolean;
  enableFeatureSelection: boolean;
  enableFeatureEngineering: boolean;
  enableModelEvaluation: boolean;
  enableValidation: boolean;
  enablePerformanceOptimization: boolean;
  maxDatasets: number;
  maxModels: number;
  enableCloudSync: boolean;
  enableBackup: boolean;
  enableVersioning: boolean;
}

export interface DataMining {
  id: string;
  name: string;
  type: MiningType;
  status: MiningStatus;
  datasets: MiningDataset[];
  models: MiningModel[];
  patterns: Pattern[];
  rules: AssociationRule[];
  clusters: Cluster[];
  anomalies: Anomaly[];
  analytics: MiningAnalytics;
  metadata: MiningMetadata;
  version: string;
  created: number;
  modified: number;
}

export enum MiningType {
  PATTERN_DISCOVERY = 'pattern_discovery',
  ASSOCIATION_RULE = 'association_rule',
  CLUSTERING = 'clustering',
  CLASSIFICATION = 'classification',
  ANOMALY_DETECTION = 'anomaly_detection',
  CUSTOM = 'custom'
}

export enum MiningStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PROCESSING = 'processing',
  ERROR = 'error',
  CUSTOM = 'custom'
}

export interface MiningDataset {
  id: string;
  name: string;
  type: DatasetType;
  status: DatasetStatus;
  data: DatasetData;
  preprocessing: PreprocessingConfig;
  features: FeatureInfo[];
  metadata: Map<string, any>;
}

export enum DatasetType {
  STRUCTURED = 'structured',
  UNSTRUCTURED = 'unstructured',
  SEMI_STRUCTURED = 'semi_structured',
  TIME_SERIES = 'time_series',
  CUSTOM = 'custom'
}

export enum DatasetStatus {
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  ERROR = 'error',
  CUSTOM = 'custom'
}

export interface DatasetData {
  rows: number;
  columns: number;
  size: number;
  format: string;
  quality: DataQuality;
  metadata: Map<string, any>;
}

export interface DataQuality {
  completeness: number;
  accuracy: number;
  consistency: number;
  validity: number;
  metadata: Map<string, any>;
}

export interface PreprocessingConfig {
  missingValues: MissingValueConfig;
  outliers: OutlierConfig;
  normalization: NormalizationConfig;
  encoding: EncodingConfig;
  featureScaling: FeatureScalingConfig;
  metadata: Map<string, any>;
}

export interface MissingValueConfig {
  method: MissingValueMethod;
  threshold: number;
  parameters: Map<string, any>;
  metadata: Map<string, any>;
}

export enum MissingValueMethod {
  DROP = 'drop',
  MEAN = 'mean',
  MEDIAN = 'median',
  MODE = 'mode',
  INTERPOLATION = 'interpolation',
  CUSTOM = 'custom'
}

export interface OutlierConfig {
  method: OutlierMethod;
  threshold: number;
  parameters: Map<string, any>;
  metadata: Map<string, any>;
}

export enum OutlierMethod {
  Z_SCORE = 'z_score',
  IQR = 'iqr',
  ISOLATION_FOREST = 'isolation_forest',
  LOCAL_OUTLIER_FACTOR = 'local_outlier_factor',
  CUSTOM = 'custom'
}

export interface NormalizationConfig {
  method: NormalizationMethod;
  parameters: Map<string, any>;
  metadata: Map<string, any>;
}

export enum NormalizationMethod {
  MIN_MAX = 'min_max',
  Z_SCORE = 'z_score',
  ROBUST = 'robust',
  UNIT_VECTOR = 'unit_vector',
  CUSTOM = 'custom'
}

export interface EncodingConfig {
  categorical: CategoricalEncodingConfig;
  numerical: NumericalEncodingConfig;
  text: TextEncodingConfig;
  metadata: Map<string, any>;
}

export interface CategoricalEncodingConfig {
  method: CategoricalEncodingMethod;
  parameters: Map<string, any>;
  metadata: Map<string, any>;
}

export enum CategoricalEncodingMethod {
  ONE_HOT = 'one_hot',
  LABEL = 'label',
  TARGET = 'target',
  CUSTOM = 'custom'
}

export interface NumericalEncodingConfig {
  method: NumericalEncodingMethod;
  parameters: Map<string, any>;
  metadata: Map<string, any>;
}

export enum NumericalEncodingMethod {
  BINNING = 'binning',
  LOGARITHMIC = 'logarithmic',
  POLYNOMIAL = 'polynomial',
  CUSTOM = 'custom'
}

export interface TextEncodingConfig {
  method: TextEncodingMethod;
  parameters: Map<string, any>;
  metadata: Map<string, any>;
}

export enum TextEncodingMethod {
  TF_IDF = 'tf_idf',
  WORD2VEC = 'word2vec',
  BOW = 'bow',
  CUSTOM = 'custom'
}

export interface FeatureScalingConfig {
  method: FeatureScalingMethod;
  parameters: Map<string, any>;
  metadata: Map<string, any>;
}

export enum FeatureScalingMethod {
  STANDARD = 'standard',
  MIN_MAX = 'min_max',
  MAX_ABS = 'max_abs',
  ROBUST = 'robust',
  CUSTOM = 'custom'
}

export interface FeatureInfo {
  name: string;
  type: FeatureType;
  importance: number;
  correlation: number;
  statistics: FeatureStatistics;
  metadata: Map<string, any>;
}

export enum FeatureType {
  NUMERICAL = 'numerical',
  CATEGORICAL = 'categorical',
  TEXT = 'text',
  DATE = 'date',
  CUSTOM = 'custom'
}

export interface FeatureStatistics {
  mean: number;
  median: number;
  mode: any;
  std: number;
  min: number;
  max: number;
  metadata: Map<string, any>;
}

export interface MiningModel {
  id: string;
  name: string;
  type: ModelType;
  status: ModelStatus;
  algorithm: AlgorithmInfo;
  configuration: ModelConfiguration;
  training: ModelTraining;
  performance: ModelPerformance;
  metadata: Map<string, any>;
}

export enum ModelType {
  CLASSIFICATION = 'classification',
  REGRESSION = 'regression',
  CLUSTERING = 'clustering',
  ASSOCIATION_RULE = 'association_rule',
  ANOMALY_DETECTION = 'anomaly_detection',
  CUSTOM = 'custom'
}

export enum ModelStatus {
  TRAINING = 'training',
  TRAINED = 'trained',
  DEPLOYED = 'deployed',
  ERROR = 'error',
  CUSTOM = 'custom'
}

export interface AlgorithmInfo {
  name: string;
  type: AlgorithmType;
  parameters: Map<string, any>;
  metadata: Map<string, any>;
}

export enum AlgorithmType {
  DECISION_TREE = 'decision_tree',
  RANDOM_FOREST = 'random_forest',
  SVM = 'svm',
  K_MEANS = 'k_means',
  DBSCAN = 'dbscan',
  APRIORI = 'apriori',
  CUSTOM = 'custom'
}

export interface ModelConfiguration {
  parameters: Map<string, any>;
  hyperparameters: Map<string, any>;
  constraints: ModelConstraint[];
  metadata: Map<string, any>;
}

export interface ModelConstraint {
  type: ConstraintType;
  value: any;
  metadata: Map<string, any>;
}

export enum ConstraintType {
  MAX_DEPTH = 'max_depth',
  MIN_SAMPLES = 'min_samples',
  MAX_FEATURES = 'max_features',
  CUSTOM = 'custom'
}

export interface ModelTraining {
  dataset: string;
  features: string[];
  target: string;
  split: TrainTestSplit;
  crossValidation: CrossValidationConfig;
  metadata: Map<string, any>;
}

export interface TrainTestSplit {
  trainRatio: number;
  testRatio: number;
  validationRatio: number;
  randomState: number;
  metadata: Map<string, any>;
}

export interface CrossValidationConfig {
  enabled: boolean;
  folds: number;
  method: CrossValidationMethod;
  metadata: Map<string, any>;
}

export enum CrossValidationMethod {
  K_FOLD = 'k_fold',
  STRATIFIED = 'stratified',
  TIME_SERIES = 'time_series',
  CUSTOM = 'custom'
}

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  rmse: number;
  mae: number;
  metadata: Map<string, any>;
}

export interface Pattern {
  id: string;
  name: string;
  type: PatternType;
  support: number;
  confidence: number;
  lift: number;
  items: PatternItem[];
  metadata: Map<string, any>;
}

export enum PatternType {
  FREQUENT = 'frequent',
  ASSOCIATION = 'association',
  SEQUENTIAL = 'sequential',
  CUSTOM = 'custom'
}

export interface PatternItem {
  name: string;
  value: any;
  metadata: Map<string, any>;
}

export interface AssociationRule {
  id: string;
  antecedent: string[];
  consequent: string[];
  support: number;
  confidence: number;
  lift: number;
  conviction: number;
  metadata: Map<string, any>;
}

export interface Cluster {
  id: string;
  name: string;
  type: ClusterType;
  centroid: number[];
  points: number[][];
  size: number;
  silhouette: number;
  metadata: Map<string, any>;
}

export enum ClusterType {
  K_MEANS = 'k_means',
  DBSCAN = 'dbscan',
  HIERARCHICAL = 'hierarchical',
  GAUSSIAN_MIXTURE = 'gaussian_mixture',
  CUSTOM = 'custom'
}

export interface Anomaly {
  id: string;
  type: AnomalyType;
  score: number;
  severity: AnomalySeverity;
  data: AnomalyData;
  context: AnomalyContext;
  metadata: Map<string, any>;
}

export enum AnomalyType {
  POINT = 'point',
  COLLECTIVE = 'collective',
  CONTEXTUAL = 'contextual',
  CUSTOM = 'custom'
}

export enum AnomalySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  CUSTOM = 'custom'
}

export interface AnomalyData {
  values: number[];
  timestamp: number;
  features: string[];
  metadata: Map<string, any>;
}

export interface AnomalyContext {
  description: string;
  cause: string;
  impact: string;
  recommendations: string[];
  metadata: Map<string, any>;
}

export interface MiningAnalytics {
  totalDatasets: number;
  totalModels: number;
  totalPatterns: number;
  totalRules: number;
  totalClusters: number;
  totalAnomalies: number;
  averageAccuracy: number;
  averagePerformance: number;
  performance: PerformanceMetrics;
  lastUpdate: number;
  metadata: Map<string, any>;
}

export interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  gpuUsage: number;
  networkUsage: number;
  metadata: Map<string, any>;
}

export interface MiningMetadata {
  author: string;
  version: string;
  tags: string[];
  description: string;
  customMetadata: Map<string, any>;
}

export interface MiningStats {
  totalDatasets: number;
  totalModels: number;
  totalPatterns: number;
  totalRules: number;
  totalClusters: number;
  totalAnomalies: number;
  averageAccuracy: number;
  averagePerformance: number;
  lastUpdate: number;
}

export class DataMiningManager {
  private config: DataMiningConfig;
  private minings: Map<string, DataMining> = new Map();
  private stats: MiningStats = this.initializeStats();
  private isInitialized: boolean = false;
  private logger: StructuredLogger;
  private memoryId: string;

  constructor(config: Partial<DataMiningConfig> = {}) {
    this.config = {
      enableDataPreprocessing: true,
      enableDataCleaning: true,
      enablePatternDiscovery: true,
      enablePatternRecognition: true,
      enableAssociationRuleMining: true,
      enableClustering: true,
      enableClassification: true,
      enableAnomalyDetection: true,
      enableOutlierAnalysis: true,
      enableFeatureSelection: true,
      enableFeatureEngineering: true,
      enableModelEvaluation: true,
      enableValidation: true,
      enablePerformanceOptimization: true,
      maxDatasets: 10000,
      maxModels: 1000,
      enableCloudSync: true,
      enableBackup: true,
      enableVersioning: true,
      ...config
  
    // Initialize structured logging
    this.logger = new StructuredLogger({
      level: LogLevel.INFO,
      enableConsole: true,
      performanceMonitoring: true,
      modules: {
        'DataMiningManager': LogLevel.DEBUG
      }
    });

    // Register with memory manager
    this.memoryId = `DataMiningManager_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    MemoryManager.registerObject(this.memoryId, this, 'DataMiningManager');
  };
  }

  /**
   * Initialize data mining manager
   */
  async initialize(): Promise<boolean> {
    try {
      // Initialize data mining manager
      await this.initializeDataMiningManager();
      
      // Load default data minings
      await this.loadDefaultDataMinings();
      
      this.isInitialized = true;
      this.logger.info('DataMiningManager', 'Data mining manager initialized successfully');
      return true;
    } catch (error) {
      this.logger.error('DataMiningManager', 'Failed to initialize data mining manager:', error);
      return false;
    }
  }

  /**
   * Create new data mining
   */
  createDataMining(mining: Partial<DataMining>): DataMining | null {
    const newMining: DataMining = {
      id: `mining_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: mining.name || 'New Data Mining',
      type: mining.type || MiningType.PATTERN_DISCOVERY,
      status: MiningStatus.ACTIVE,
      datasets: mining.datasets || [],
      models: mining.models || [],
      patterns: mining.patterns || [],
      rules: mining.rules || [],
      clusters: mining.clusters || [],
      anomalies: mining.anomalies || [],
      analytics: mining.analytics || this.createDefaultAnalytics(),
      metadata: mining.metadata || this.createDefaultMetadata(),
      version: '1.0.0',
      created: Date.now(),
      modified: Date.now()
    };

    this.minings.set(newMining.id, newMining);
    this.updateStats('create_mining', newMining);

    this.logger.info('DataMiningManager', `Created data mining: ${newMining.name}`);
    return newMining;
  }

  /**
   * Create mining dataset
   */
  createMiningDataset(miningId: string, dataset: Partial<MiningDataset>): MiningDataset | null {
    const mining = this.minings.get(miningId);
    if (!mining) {
      this.logger.warn('DataMiningManager', `Data mining ${miningId} not found`);
      return null;
    }

    if (mining.datasets.length >= this.config.maxDatasets) {
      this.logger.warn('DataMiningManager', 'Maximum number of datasets reached');
      return null;
    }

    try {
      const newDataset: MiningDataset = {
        id: `dataset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: dataset.name || 'New Dataset',
        type: dataset.type || DatasetType.STRUCTURED,
        status: DatasetStatus.UPLOADED,
        data: dataset.data || this.createDefaultDatasetData(),
        preprocessing: dataset.preprocessing || this.createDefaultPreprocessingConfig(),
        features: dataset.features || [],
        metadata: dataset.metadata || new Map()
      };

      mining.datasets.push(newDataset);
      mining.modified = Date.now();

      this.updateStats('create_dataset', mining);
      this.logger.info('DataMiningManager', `Created mining dataset: ${newDataset.name}`);
      return newDataset;
    } catch (error) {
      this.logger.error('DataMiningManager', `Failed to create mining dataset in data mining ${miningId}:`, error);
      return null;
    }
  }

  /**
   * Create mining model
   */
  createMiningModel(miningId: string, model: Partial<MiningModel>): MiningModel | null {
    const mining = this.minings.get(miningId);
    if (!mining) {
      this.logger.warn('DataMiningManager', `Data mining ${miningId} not found`);
      return null;
    }

    if (mining.models.length >= this.config.maxModels) {
      this.logger.warn('DataMiningManager', 'Maximum number of models reached');
      return null;
    }

    try {
      const newModel: MiningModel = {
        id: `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: model.name || 'New Model',
        type: model.type || ModelType.CLASSIFICATION,
        status: ModelStatus.TRAINING,
        algorithm: model.algorithm || this.createDefaultAlgorithmInfo(),
        configuration: model.configuration || this.createDefaultModelConfiguration(),
        training: model.training || this.createDefaultModelTraining(),
        performance: model.performance || this.createDefaultModelPerformance(),
        metadata: model.metadata || new Map()
      };

      mining.models.push(newModel);
      mining.modified = Date.now();

      this.updateStats('create_model', mining);
      this.logger.info('DataMiningManager', `Created mining model: ${newModel.name}`);
      return newModel;
    } catch (error) {
      this.logger.error('DataMiningManager', `Failed to create mining model in data mining ${miningId}:`, error);
      return null;
    }
  }

  /**
   * Get data mining
   */
  getDataMining(miningId: string): DataMining | null {
    return this.minings.get(miningId) || null;
  }

  /**
   * Get all data minings
   */
  getDataMinings(): DataMining[] {
    return Array.from(this.minings.values());
  }

  /**
   * Get data minings by type
   */
  getDataMiningsByType(type: MiningType): DataMining[] {
    return Array.from(this.minings.values())
      .filter(mining => mining.type === type);
  }

  /**
   * Get manager statistics
   */
  getManagerStats(): MiningStats {
    return { ...this.stats };
  }

  /**
   * Initialize data mining manager
   */
  private async initializeDataMiningManager(): Promise<void> {
    this.logger.info('DataMiningManager', 'Initializing data mining manager...');
  }

  /**
   * Load default data minings
   */
  private async loadDefaultDataMinings(): Promise<void> {
    // Load default data minings
    const defaultMinings = [
      this.createDefaultPatternDiscovery(),
      this.createDefaultAssociationRule(),
      this.createDefaultClustering()
    ];

    for (const mining of defaultMinings) {
      if (mining) {
        this.minings.set(mining.id, mining);
      }
    }

    this.logger.info('DataMiningManager', `Loaded ${defaultMinings.length} default data minings`);
  }

  /**
   * Create default dataset data
   */
  private createDefaultDatasetData(): DatasetData {
    return {
      rows: 0,
      columns: 0,
      size: 0,
      format: 'unknown',
      quality: {

        completeness: 0,
        accuracy: 0,
        consistency: 0,
        validity: 0,
        metadata: new Map()

      }
      },
      metadata: new Map()
    };
  }

  /**
   * Create default preprocessing config
   */
  private createDefaultPreprocessingConfig(): PreprocessingConfig {
    return {
      missingValues: {
        method: MissingValueMethod.MEAN,
        threshold: 0.1,
        parameters: new Map(),
        metadata: new Map()

      
      
      }
      },
      outliers: {
        method: OutlierMethod.Z_SCORE,
        threshold: 3,
        parameters: new Map(),
        metadata: new Map()

      
      
      }
      },
      normalization: {

        method: NormalizationMethod.Z_SCORE,
        parameters: new Map(),
        metadata: new Map()

      }
      },
      encoding: {

        categorical: {
          method: CategoricalEncodingMethod.ONE_HOT,
          parameters: new Map(),
          metadata: new Map()

      }
        },
        numerical: {

          method: NumericalEncodingMethod.BINNING,
          parameters: new Map(),
          metadata: new Map()

        }
        },
        text: {

          method: TextEncodingMethod.TF_IDF,
          parameters: new Map(),
          metadata: new Map()

        }
        },
        metadata: new Map()
      },
      featureScaling: {

        method: FeatureScalingMethod.STANDARD,
        parameters: new Map(),
        metadata: new Map()

      }
      },
      metadata: new Map()
    };
  }

  /**
   * Create default algorithm info
   */
  private createDefaultAlgorithmInfo(): AlgorithmInfo {
    return {
      name: 'Decision Tree',
      type: AlgorithmType.DECISION_TREE,
      parameters: new Map(),
      metadata: new Map()
    };
  }

  /**
   * Create default model configuration
   */
  private createDefaultModelConfiguration(): ModelConfiguration {
    return {
      parameters: new Map(),
      hyperparameters: new Map(),
      constraints: [],
      metadata: new Map()
    };
  }

  /**
   * Create default model training
   */
  private createDefaultModelTraining(): ModelTraining {
    return {
      dataset: '',
      features: [],
      target: '',
      split: {

        trainRatio: 0.7,
        testRatio: 0.2,
        validationRatio: 0.1,
        randomState: 42,
        metadata: new Map()

      }
      },
      crossValidation: {
        enabled: true,
        folds: 5,
        method: CrossValidationMethod.K_FOLD,
        metadata: new Map()

      
      
      }
      },
      metadata: new Map()
    };
  }

  /**
   * Create default model performance
   */
  private createDefaultModelPerformance(): ModelPerformance {
    return {
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      auc: 0,
      rmse: 0,
      mae: 0,
      metadata: new Map()
    };
  }

  /**
   * Create default analytics
   */
  private createDefaultAnalytics(): MiningAnalytics {
    return {
      totalDatasets: 0,
      totalModels: 0,
      totalPatterns: 0,
      totalRules: 0,
      totalClusters: 0,
      totalAnomalies: 0,
      averageAccuracy: 0,
      averagePerformance: 0,
      performance: {

        cpuUsage: 0,
        memoryUsage: 0,
        gpuUsage: 0,
        networkUsage: 0,
        metadata: new Map()

      }
      },
      lastUpdate: Date.now(),
      metadata: new Map()
    };
  }

  /**
   * Create default metadata
   */
  private createDefaultMetadata(): MiningMetadata {
    return {
      author: 'System',
      version: '1.0.0',
      tags: [],
      description: '',
      customMetadata: new Map()
    };
  }

  /**
   * Create default pattern discovery
   */
  private createDefaultPatternDiscovery(): DataMining {
    return this.createDataMining({
      name: 'Pattern Discovery',
      type: MiningType.PATTERN_DISCOVERY,
      description: 'Pattern discovery data mining platform'
    });
  }

  /**
   * Create default association rule
   */
  private createDefaultAssociationRule(): DataMining {
    return this.createDataMining({
      name: 'Association Rule Mining',
      type: MiningType.ASSOCIATION_RULE,
      description: 'Association rule mining platform'
    });
  }

  /**
   * Create default clustering
   */
  private createDefaultClustering(): DataMining {
    return this.createDataMining({
      name: 'Clustering',
      type: MiningType.CLUSTERING,
      description: 'Clustering data mining platform'
    });
  }

  /**
   * Update statistics
   */
  private updateStats(action: string, mining: DataMining): void {
    switch (action) {
      case 'create_mining':
        this.stats.totalDatasets += mining.datasets.length;
        this.stats.totalModels += mining.models.length;
        this.stats.totalPatterns += mining.patterns.length;
        this.stats.totalRules += mining.rules.length;
        this.stats.totalClusters += mining.clusters.length;
        this.stats.totalAnomalies += mining.anomalies.length;
        break;
      case 'create_dataset':
        this.stats.totalDatasets++;
        break;
      case 'create_model':
        this.stats.totalModels++;
        break;
    }

    this.stats.lastUpdate = Date.now();
  }

  /**
   * Initialize statistics
   */
  private initializeStats(): MiningStats {
    return {
      totalDatasets: 0,
      totalModels: 0,
      totalPatterns: 0,
      totalRules: 0,
      totalClusters: 0,
      totalAnomalies: 0,
      averageAccuracy: 0,
      averagePerformance: 0,
      lastUpdate: Date.now()
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.minings.clear();
    this.stats = this.initializeStats();
    this.isInitialized = false;
  }
}

// Export default instance
export const defaultDataMiningManager = new DataMiningManager();
export { DataMiningManager as default };