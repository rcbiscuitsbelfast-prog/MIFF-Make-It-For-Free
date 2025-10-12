/**
 * PerfMetricsPure Manager - Advanced Performance Metrics System
 *
 * Comprehensive performance metrics with:
 * - Real-time performance monitoring
 * - Historical data analysis
 * - Performance benchmarking
 * - Optimization recommendations
 * - Custom metrics tracking
 * - Performance reporting
 *
 * @version 1.0.0
 * @author MIFF Framework

import { StructuredLogger, LogLevel } from '../shared/logging/StructuredLogger';
import { PerformanceOptimizer } from '../shared/performance/PerformanceOptimizer';
import { MemoryManager } from '../shared/memory/MemoryManager';
 */

export interface PerfMetricsConfig {
  enableRealTimeMonitoring: boolean;
  enableHistoricalData: boolean;
  enableBenchmarking: boolean;
  enableOptimization: boolean;
  enableCustomMetrics: boolean;
  enableReporting: boolean;
  samplingRate: number;
  maxSamples: number;
  retentionDays: number;
  enableAlerts: boolean;
  enableExport: boolean;
  enableVisualization: boolean;
  enableComparison: boolean;
  enableTrends: boolean;
}

export interface PerformanceMetric {
  id: string;
  name: string;
  type: MetricType;
  category: MetricCategory;
  value: number;
  unit: string;
  timestamp: number;
  metadata: Map<string, any>;
  tags: string[];
  source: string;
  version: string;
}

export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary',
  TIMER = 'timer',
  CUSTOM = 'custom'
}

export enum MetricCategory {
  PERFORMANCE = 'performance',
  MEMORY = 'memory',
  CPU = 'cpu',
  GPU = 'gpu',
  NETWORK = 'network',
  DISK = 'disk',
  RENDERING = 'rendering',
  AUDIO = 'audio',
  INPUT = 'input',
  CUSTOM = 'custom'
}

export interface MetricSnapshot {
  timestamp: number;
  metrics: Map<string, PerformanceMetric>;
  summary: MetricSummary;
  metadata: Map<string, any>;
}

export interface MetricSummary {
  totalMetrics: number;
  averageValue: number;
  minValue: number;
  maxValue: number;
  medianValue: number;
  percentile95: number;
  percentile99: number;
  standardDeviation: number;
  variance: number;
  trend: TrendDirection;
  health: HealthStatus;
}

export enum TrendDirection {
  IMPROVING = 'improving',
  DECLINING = 'declining',
  STABLE = 'stable',
  VOLATILE = 'volatile',
  UNKNOWN = 'unknown'
}

export enum HealthStatus {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  WARNING = 'warning',
  CRITICAL = 'critical',
  FAILED = 'failed',
  UNKNOWN = 'unknown'
}

export interface Benchmark {
  id: string;
  name: string;
  description: string;
  category: MetricCategory;
  metrics: string[];
  duration: number;
  iterations: number;
  results: BenchmarkResult[];
  baseline: BenchmarkResult | null;
  comparison: BenchmarkComparison | null;
  metadata: Map<string, any>;
}

export interface BenchmarkResult {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  duration: number;
  iterations: number;
  average: number;
  min: number;
  max: number;
  median: number;
  standardDeviation: number;
  percentile95: number;
  percentile99: number;
  metadata: Map<string, any>;
}

export interface BenchmarkComparison {
  baseline: string;
  current: string;
  improvement: number;
  regression: number;
  significance: number;
  confidence: number;
  recommendation: string;
  metadata: Map<string, any>;
}

export interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  category: MetricCategory;
  priority: Priority;
  impact: Impact;
  effort: Effort;
  metrics: string[];
  suggestions: string[];
  examples: string[];
  resources: string[];
  estimatedImprovement: number;
  confidence: number;
  metadata: Map<string, any>;
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum Impact {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum Effort {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

export interface PerformanceReport {
  id: string;
  name: string;
  type: ReportType;
  startTime: number;
  endTime: number;
  duration: number;
  metrics: Map<string, PerformanceMetric>;
  snapshots: MetricSnapshot[];
  benchmarks: Benchmark[];
  recommendations: OptimizationRecommendation[];
  summary: PerformanceSummary;
  metadata: Map<string, any>;
}

export enum ReportType {
  REAL_TIME = 'real_time',
  HISTORICAL = 'historical',
  BENCHMARK = 'benchmark',
  COMPARATIVE = 'comparative',
  CUSTOM = 'custom'
}

export interface PerformanceSummary {
  overallScore: number;
  performanceScore: number;
  memoryScore: number;
  cpuScore: number;
  gpuScore: number;
  networkScore: number;
  diskScore: number;
  renderingScore: number;
  audioScore: number;
  inputScore: number;
  health: HealthStatus;
  trends: Trend[];
  keyMetrics: string[];
  criticalIssues: string[];
  recommendations: string[];
  metadata: Map<string, any>;
}

export interface Trend {
  metric: string;
  direction: TrendDirection;
  magnitude: number;
  confidence: number;
  description: string;
  period: number;
  dataPoints: number;
  metadata: Map<string, any>;
}

export interface Alert {
  id: string;
  name: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  metric: string;
  threshold: number;
  currentValue: number;
  timestamp: number;
  acknowledged: boolean;
  resolved: boolean;
  metadata: Map<string, any>;
}

export enum AlertType {
  THRESHOLD_EXCEEDED = 'threshold_exceeded',
  ANOMALY_DETECTED = 'anomaly_detected',
  TREND_CHANGE = 'trend_change',
  BENCHMARK_FAILURE = 'benchmark_failure',
  CUSTOM = 'custom'
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface CustomMetric {
  id: string;
  name: string;
  description: string;
  type: MetricType;
  category: MetricCategory;
  unit: string;
  aggregation: AggregationType;
  window: number;
  threshold: number;
  enabled: boolean;
  metadata: Map<string, any>;
}

export enum AggregationType {
  SUM = 'sum',
  AVERAGE = 'average',
  MIN = 'min',
  MAX = 'max',
  COUNT = 'count',
  MEDIAN = 'median',
  PERCENTILE = 'percentile',
  CUSTOM = 'custom'
}

export class PerfMetricsManager {
  private config: PerfMetricsConfig;
  private metrics: Map<string, PerformanceMetric> = new Map();
  private snapshots: Map<number, MetricSnapshot> = new Map();
  private benchmarks: Map<string, Benchmark> = new Map();
  private recommendations: Map<string, OptimizationRecommendation> = new Map();
  private reports: Map<string, PerformanceReport> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private customMetrics: Map<string, CustomMetric> = new Map();
  private monitoringTimer: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;
  private logger: StructuredLogger;
  private memoryId: string;

  constructor(config: Partial<PerfMetricsConfig> = {}) {
    this.config = {
      enableRealTimeMonitoring: true,
      enableHistoricalData: true,
      enableBenchmarking: true,
      enableOptimization: true,
      enableCustomMetrics: true,
      enableReporting: true,
      samplingRate: 1000, // 1 second
      maxSamples: 1000,
      retentionDays: 30,
      enableAlerts: true,
      enableExport: true,
      enableVisualization: true,
      enableComparison: true,
      enableTrends: true,
      ...config
  
    // Initialize structured logging
    this.logger = new StructuredLogger({
      level: LogLevel.INFO,
      enableConsole: true,
      performanceMonitoring: true,
      modules: {
        'PerfMetricsManager': LogLevel.DEBUG
      }
    });

    // Register with memory manager
    this.memoryId = `PerfMetricsManager_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    MemoryManager.registerObject(this.memoryId, this, 'PerfMetricsManager');
  };
  }

  /**
   * Initialize performance metrics manager
   */
  async initialize(): Promise<boolean> {
    try {
      // Initialize metrics manager
      await this.initializeMetricsManager();
      
      // Start monitoring
      if (this.config.enableRealTimeMonitoring) {
        this.startMonitoring();
      }
      
      this.isInitialized = true;
      this.logger.info('PerfMetricsManager', 'Performance metrics manager initialized successfully');
      return true;
    } catch (error) {
      this.logger.error('PerfMetricsManager', 'Failed to initialize performance metrics manager:', error);
      return false;
    }
  }

  /**
   * Start monitoring
   */
  startMonitoring(): void {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
    }

    this.monitoringTimer = setInterval(() => {
      this.collectMetrics();
      this.createSnapshot();
      this.checkAlerts();
      this.generateRecommendations();
    }, this.config.samplingRate);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }
  }

  /**
   * Collect performance metrics
   */
  collectMetrics(): void {
    if (!this.config.enableRealTimeMonitoring) return;

    const now = Date.now();
    
    // Collect frame rate metric
    this.addMetric('frame_rate', 'Frame Rate', MetricType.GAUGE, MetricCategory.PERFORMANCE, this.getFrameRate(), 'fps', now);
    
    // Collect memory usage metric
    this.addMetric('memory_usage', 'Memory Usage', MetricType.GAUGE, MetricCategory.MEMORY, this.getMemoryUsage(), 'MB', now);
    
    // Collect CPU usage metric
    this.addMetric('cpu_usage', 'CPU Usage', MetricType.GAUGE, MetricCategory.CPU, this.getCPUUsage(), '%', now);
    
    // Collect GPU usage metric
    this.addMetric('gpu_usage', 'GPU Usage', MetricType.GAUGE, MetricCategory.GPU, this.getGPUUsage(), '%', now);
    
    // Collect network latency metric
    this.addMetric('network_latency', 'Network Latency', MetricType.GAUGE, MetricCategory.NETWORK, this.getNetworkLatency(), 'ms', now);
    
    // Collect disk usage metric
    this.addMetric('disk_usage', 'Disk Usage', MetricType.GAUGE, MetricCategory.DISK, this.getDiskUsage(), '%', now);
    
    // Collect rendering metrics
    this.addMetric('draw_calls', 'Draw Calls', MetricType.COUNTER, MetricCategory.RENDERING, this.getDrawCalls(), 'calls', now);
    this.addMetric('triangles', 'Triangles', MetricType.COUNTER, MetricCategory.RENDERING, this.getTriangles(), 'triangles', now);
    this.addMetric('vertices', 'Vertices', MetricType.COUNTER, MetricCategory.RENDERING, this.getVertices(), 'vertices', now);
    
    // Collect audio metrics
    this.addMetric('audio_sources', 'Audio Sources', MetricType.COUNTER, MetricCategory.AUDIO, this.getAudioSources(), 'sources', now);
    this.addMetric('audio_latency', 'Audio Latency', MetricType.GAUGE, MetricCategory.AUDIO, this.getAudioLatency(), 'ms', now);
    
    // Collect input metrics
    this.addMetric('input_events', 'Input Events', MetricType.COUNTER, MetricCategory.INPUT, this.getInputEvents(), 'events', now);
    this.addMetric('input_latency', 'Input Latency', MetricType.GAUGE, MetricCategory.INPUT, this.getInputLatency(), 'ms', now);
  }

  /**
   * Add metric
   */
  addMetric(id: string, name: string, type: MetricType, category: MetricCategory, value: number, unit: string, timestamp: number, tags: string[] = [], source: string = 'system'): void {
    const metric: PerformanceMetric = {
      id,
      name,
      type,
      category,
      value,
      unit,
      timestamp,
      metadata: new Map(),
      tags,
      source,
      version: '1.0.0'
    };

    this.metrics.set(id, metric);
  }

  /**
   * Create metric snapshot
   */
  createSnapshot(): void {
    if (!this.config.enableHistoricalData) return;

    const now = Date.now();
    const snapshot: MetricSnapshot = {
      timestamp: now,
      metrics: new Map(this.metrics),
      summary: this.calculateSummary(),
      metadata: new Map()
    };

    this.snapshots.set(now, snapshot);

    // Clean up old snapshots
    this.cleanupOldSnapshots();
  }

  /**
   * Calculate metric summary
   */
  private calculateSummary(): MetricSummary {
    const values = Array.from(this.metrics.values()).map(m => m.value);
    
    if (values.length === 0) {
      return {
        totalMetrics: 0,
        averageValue: 0,
        minValue: 0,
        maxValue: 0,
        medianValue: 0,
        percentile95: 0,
        percentile99: 0,
        standardDeviation: 0,
        variance: 0,
        trend: TrendDirection.UNKNOWN,
        health: HealthStatus.UNKNOWN
      };
    }

    const sortedValues = values.sort((a, b) => a - b);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    return {
      totalMetrics: values.length,
      averageValue: average,
      minValue: Math.min(...values),
      maxValue: Math.max(...values),
      medianValue: this.calculateMedian(sortedValues),
      percentile95: this.calculatePercentile(sortedValues, 95),
      percentile99: this.calculatePercentile(sortedValues, 99),
      standardDeviation,
      variance,
      trend: this.calculateTrend(values),
      health: this.calculateHealth(average, standardDeviation)
    };
  }

  /**
   * Calculate median
   */
  private calculateMedian(sortedValues: number[]): number {
    const mid = Math.floor(sortedValues.length / 2);
    return sortedValues.length % 2 === 0
      ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
      : sortedValues[mid];
  }

  /**
   * Calculate percentile
   */
  private calculatePercentile(sortedValues: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, index)];
  }

  /**
   * Calculate trend
   */
  private calculateTrend(values: number[]): TrendDirection {
    if (values.length < 2) return TrendDirection.UNKNOWN;

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const change = (secondAvg - firstAvg) / firstAvg;
    
    if (Math.abs(change) < 0.05) return TrendDirection.STABLE;
    if (change > 0.1) return TrendDirection.IMPROVING;
    if (change < -0.1) return TrendDirection.DECLINING;
    return TrendDirection.VOLATILE;
  }

  /**
   * Calculate health
   */
  private calculateHealth(average: number, standardDeviation: number): HealthStatus {
    const coefficient = standardDeviation / average;
    
    if (coefficient < 0.1) return HealthStatus.EXCELLENT;
    if (coefficient < 0.2) return HealthStatus.GOOD;
    if (coefficient < 0.3) return HealthStatus.WARNING;
    if (coefficient < 0.5) return HealthStatus.CRITICAL;
    return HealthStatus.FAILED;
  }

  /**
   * Check for alerts
   */
  checkAlerts(): void {
    if (!this.config.enableAlerts) return;

    for (const [id, metric] of this.metrics) {
      const customMetric = this.customMetrics.get(id);
      if (customMetric && customMetric.enabled && customMetric.threshold > 0) {
        if (metric.value > customMetric.threshold) {
          this.createAlert(id, `Threshold exceeded for ${metric.name}`, metric.value, customMetric.threshold, AlertSeverity.WARNING);
        }
      }
    }
  }

  /**
   * Create alert
   */
  private createAlert(metricId: string, message: string, currentValue: number, threshold: number, severity: AlertSeverity): void {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const alert: Alert = {
      id: alertId,
      name: `${metricId}_alert`,
      type: AlertType.THRESHOLD_EXCEEDED,
      severity,
      message,
      metric: metricId,
      threshold,
      currentValue,
      timestamp: Date.now(),
      acknowledged: false,
      resolved: false,
      metadata: new Map()
    };

    this.alerts.set(alertId, alert);
    this.logger.warn('PerfMetricsManager', `Alert: ${message} (${currentValue} > ${threshold})`);
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations(): void {
    if (!this.config.enableOptimization) return;

    // Generate frame rate recommendations
    const frameRate = this.metrics.get('frame_rate');
    if (frameRate && frameRate.value < 30) {
      this.addRecommendation('frame_rate_optimization', 'Optimize frame rate', 'Consider reducing graphics quality or optimizing rendering pipeline', MetricCategory.PERFORMANCE, Priority.HIGH);
    }

    // Generate memory recommendations
    const memoryUsage = this.metrics.get('memory_usage');
    if (memoryUsage && memoryUsage.value > 80) {
      this.addRecommendation('memory_optimization', 'Optimize memory usage', 'Consider reducing texture quality or implementing object pooling', MetricCategory.MEMORY, Priority.HIGH);
    }

    // Generate CPU recommendations
    const cpuUsage = this.metrics.get('cpu_usage');
    if (cpuUsage && cpuUsage.value > 80) {
      this.addRecommendation('cpu_optimization', 'Optimize CPU usage', 'Consider reducing update frequency or optimizing algorithms', MetricCategory.CPU, Priority.MEDIUM);
    }

    // Generate GPU recommendations
    const gpuUsage = this.metrics.get('gpu_usage');
    if (gpuUsage && gpuUsage.value > 80) {
      this.addRecommendation('gpu_optimization', 'Optimize GPU usage', 'Consider reducing shader complexity or implementing LOD system', MetricCategory.GPU, Priority.MEDIUM);
    }
  }

  /**
   * Add recommendation
   */
  private addRecommendation(id: string, title: string, description: string, category: MetricCategory, priority: Priority): void {
    if (this.recommendations.has(id)) return;

    const recommendation: OptimizationRecommendation = {
      id,
      title,
      description,
      category,
      priority,
      impact: Impact.MEDIUM,
      effort: Effort.MEDIUM,
      metrics: [id.replace('_optimization', '')],
      suggestions: [description],
      examples: [],
      resources: [],
      estimatedImprovement: 20,
      confidence: 0.8,
      metadata: new Map()
    };

    this.recommendations.set(id, recommendation);
  }

  /**
   * Create benchmark
   */
  createBenchmark(name: string, description: string, category: MetricCategory, metrics: string[], duration: number = 60000, iterations: number = 1): Benchmark {
    const benchmark: Benchmark = {
      id: `benchmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      category,
      metrics,
      duration,
      iterations,
      results: [],
      baseline: null,
      comparison: null,
      metadata: new Map()
    };

    this.benchmarks.set(benchmark.id, benchmark);
    this.logger.info('PerfMetricsManager', `Created benchmark: ${name}`);
    return benchmark;
  }

  /**
   * Run benchmark
   */
  async runBenchmark(benchmarkId: string): Promise<BenchmarkResult[]> {
    const benchmark = this.benchmarks.get(benchmarkId);
    if (!benchmark) {
      throw new Error(`Benchmark ${benchmarkId} not found`);
    }

    const results: BenchmarkResult[] = [];
    const startTime = Date.now();
    const endTime = startTime + benchmark.duration;

    this.logger.info('PerfMetricsManager', `Running benchmark: ${benchmark.name}`);

    while (Date.now() < endTime) {
      const iterationStart = Date.now();
      
      // Run benchmark iteration
      await this.runBenchmarkIteration(benchmark);
      
      const iterationEnd = Date.now();
      const iterationDuration = iterationEnd - iterationStart;
      
      // Collect metrics for this iteration
      const iterationResults: BenchmarkResult[] = [];
      for (const metricId of benchmark.metrics) {
        const metric = this.metrics.get(metricId);
        if (metric) {
          const result: BenchmarkResult = {
            id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: metric.name,
            value: metric.value,
            unit: metric.unit,
            timestamp: iterationStart,
            duration: iterationDuration,
            iterations: 1,
            average: metric.value,
            min: metric.value,
            max: metric.value,
            median: metric.value,
            standardDeviation: 0,
            percentile95: metric.value,
            percentile99: metric.value,
            metadata: new Map()
          };
          iterationResults.push(result);
        }
      }
      
      results.push(...iterationResults);
    }

    benchmark.results = results;
    this.logger.info('PerfMetricsManager', `Completed benchmark: ${benchmark.name} (${results.length} results)`);
    return results;
  }

  /**
   * Run benchmark iteration
   */
  private async runBenchmarkIteration(benchmark: Benchmark): Promise<void> {
    // This would run the actual benchmark iteration
    // For now, just collect current metrics
    this.collectMetrics();
  }

  /**
   * Generate performance report
   */
  generateReport(name: string, type: ReportType = ReportType.REAL_TIME, startTime?: number, endTime?: number): PerformanceReport {
    const now = Date.now();
    const start = startTime || now - 60000; // Last minute
    const end = endTime || now;

    const report: PerformanceReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      startTime: start,
      endTime: end,
      duration: end - start,
      metrics: new Map(this.metrics),
      snapshots: Array.from(this.snapshots.values()).filter(s => s.timestamp >= start && s.timestamp <= end),
      benchmarks: Array.from(this.benchmarks.values()),
      recommendations: Array.from(this.recommendations.values()),
      summary: this.generatePerformanceSummary(),
      metadata: new Map()
    };

    this.reports.set(report.id, report);
    this.logger.info('PerfMetricsManager', `Generated report: ${name}`);
    return report;
  }

  /**
   * Generate performance summary
   */
  private generatePerformanceSummary(): PerformanceSummary {
    const scores = this.calculateScores();
    const trends = this.analyzeTrends();
    const keyMetrics = this.getKeyMetrics();
    const criticalIssues = this.getCriticalIssues();
    const recommendations = this.getRecommendationSummaries();

    return {
      overallScore: scores.overall,
      performanceScore: scores.performance,
      memoryScore: scores.memory,
      cpuScore: scores.cpu,
      gpuScore: scores.gpu,
      networkScore: scores.network,
      diskScore: scores.disk,
      renderingScore: scores.rendering,
      audioScore: scores.audio,
      inputScore: scores.input,
      health: this.calculateOverallHealth(scores),
      trends,
      keyMetrics,
      criticalIssues,
      recommendations,
      metadata: new Map()
    };
  }

  /**
   * Calculate scores
   */
  private calculateScores(): any {
    const frameRate = this.metrics.get('frame_rate')?.value || 0;
    const memoryUsage = this.metrics.get('memory_usage')?.value || 0;
    const cpuUsage = this.metrics.get('cpu_usage')?.value || 0;
    const gpuUsage = this.metrics.get('gpu_usage')?.value || 0;
    const networkLatency = this.metrics.get('network_latency')?.value || 0;
    const diskUsage = this.metrics.get('disk_usage')?.value || 0;

    return {
      overall: this.calculateOverallScore(),
      performance: Math.min(100, (frameRate / 60) * 100),
      memory: Math.max(0, 100 - memoryUsage),
      cpu: Math.max(0, 100 - cpuUsage),
      gpu: Math.max(0, 100 - gpuUsage),
      network: Math.max(0, 100 - (networkLatency / 100) * 100),
      disk: Math.max(0, 100 - diskUsage),
      rendering: 85, // Placeholder
      audio: 90, // Placeholder
      input: 95 // Placeholder
    };
  }

  /**
   * Calculate overall score
   */
  private calculateOverallScore(): number {
    const scores = this.calculateScores();
    const values = Object.values(scores).filter(v => typeof v === 'number' && v > 0);
    return values.reduce((sum, score) => sum + score, 0) / values.length;
  }

  /**
   * Calculate overall health
   */
  private calculateOverallHealth(scores: any): HealthStatus {
    const overall = scores.overall;
    if (overall >= 90) return HealthStatus.EXCELLENT;
    if (overall >= 80) return HealthStatus.GOOD;
    if (overall >= 60) return HealthStatus.WARNING;
    if (overall >= 40) return HealthStatus.CRITICAL;
    return HealthStatus.FAILED;
  }

  /**
   * Analyze trends
   */
  private analyzeTrends(): Trend[] {
    // This would analyze historical data to identify trends
    return [];
  }

  /**
   * Get key metrics
   */
  private getKeyMetrics(): string[] {
    return ['frame_rate', 'memory_usage', 'cpu_usage', 'gpu_usage', 'network_latency', 'disk_usage'];
  }

  /**
   * Get critical issues
   */
  private getCriticalIssues(): string[] {
    const issues: string[] = [];
    
    const frameRate = this.metrics.get('frame_rate');
    if (frameRate && frameRate.value < 30) {
      issues.push('Low frame rate detected');
    }
    
    const memoryUsage = this.metrics.get('memory_usage');
    if (memoryUsage && memoryUsage.value > 80) {
      issues.push('High memory usage detected');
    }
    
    const cpuUsage = this.metrics.get('cpu_usage');
    if (cpuUsage && cpuUsage.value > 80) {
      issues.push('High CPU usage detected');
    }
    
    return issues;
  }

  /**
   * Get recommendation summaries
   */
  private getRecommendationSummaries(): string[] {
    return Array.from(this.recommendations.values()).map(rec => rec.title);
  }

  /**
   * Clean up old snapshots
   */
  private cleanupOldSnapshots(): void {
    if (!this.config.enableHistoricalData) return;

    const cutoff = Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000);
    const keysToDelete: number[] = [];

    for (const [timestamp, snapshot] of this.snapshots) {
      if (timestamp < cutoff) {
        keysToDelete.push(timestamp);
      }
    }

    for (const key of keysToDelete) {
      this.snapshots.delete(key);
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): Map<string, PerformanceMetric> {
    return new Map(this.metrics);
  }

  /**
   * Get snapshots
   */
  getSnapshots(): Map<number, MetricSnapshot> {
    return new Map(this.snapshots);
  }

  /**
   * Get benchmarks
   */
  getBenchmarks(): Map<string, Benchmark> {
    return new Map(this.benchmarks);
  }

  /**
   * Get recommendations
   */
  getRecommendations(): Map<string, OptimizationRecommendation> {
    return new Map(this.recommendations);
  }

  /**
   * Get reports
   */
  getReports(): Map<string, PerformanceReport> {
    return new Map(this.reports);
  }

  /**
   * Get alerts
   */
  getAlerts(): Map<string, Alert> {
    return new Map(this.alerts);
  }

  /**
   * Initialize metrics manager
   */
  private async initializeMetricsManager(): Promise<void> {
    this.logger.info('PerfMetricsManager', 'Initializing performance metrics manager...');
  }

  /**
   * Get frame rate (placeholder)
   */
  private getFrameRate(): number {
    // This would get actual frame rate from the rendering system
    return 60;
  }

  /**
   * Get memory usage (placeholder)
   */
  private getMemoryUsage(): number {
    // This would get actual memory usage
    return 50;
  }

  /**
   * Get CPU usage (placeholder)
   */
  private getCPUUsage(): number {
    // This would get actual CPU usage
    return 30;
  }

  /**
   * Get GPU usage (placeholder)
   */
  private getGPUUsage(): number {
    // This would get actual GPU usage
    return 40;
  }

  /**
   * Get network latency (placeholder)
   */
  private getNetworkLatency(): number {
    // This would get actual network latency
    return 20;
  }

  /**
   * Get disk usage (placeholder)
   */
  private getDiskUsage(): number {
    // This would get actual disk usage
    return 60;
  }

  /**
   * Get draw calls (placeholder)
   */
  private getDrawCalls(): number {
    // This would get actual draw calls
    return 100;
  }

  /**
   * Get triangles (placeholder)
   */
  private getTriangles(): number {
    // This would get actual triangle count
    return 10000;
  }

  /**
   * Get vertices (placeholder)
   */
  private getVertices(): number {
    // This would get actual vertex count
    return 15000;
  }

  /**
   * Get audio sources (placeholder)
   */
  private getAudioSources(): number {
    // This would get actual audio source count
    return 5;
  }

  /**
   * Get audio latency (placeholder)
   */
  private getAudioLatency(): number {
    // This would get actual audio latency
    return 10;
  }

  /**
   * Get input events (placeholder)
   */
  private getInputEvents(): number {
    // This would get actual input event count
    return 20;
  }

  /**
   * Get input latency (placeholder)
   */
  private getInputLatency(): number {
    // This would get actual input latency
    return 5;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopMonitoring();
    this.metrics.clear();
    this.snapshots.clear();
    this.benchmarks.clear();
    this.recommendations.clear();
    this.reports.clear();
    this.alerts.clear();
    this.customMetrics.clear();
    this.isInitialized = false;
  }
}

// Export default instance
export const defaultPerfMetricsManager = new PerfMetricsManager();
export { PerfMetricsManager as default };