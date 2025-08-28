/**
 * ProfilerPure.ts
 * 
 * Inspired by Delta Engine hot-reload and O3DE profiling gems.
 * Provides pure, remix-safe performance profiling and debugging for MIFF games.
 * 
 * Attribution: Delta Engine (MIT License) - hot-reload and performance monitoring patterns
 * Attribution: O3DE (Apache 2.0) - profiling gem concepts and metrics collection
 */

export interface ProfilerMetric {
  id: string;
  name: string;
  category: string;
  value: number;
  unit: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ProfilerSample {
  id: string;
  name: string;
  category: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  parentId?: string;
  children: string[];
  metadata?: Record<string, any>;
}

export interface ProfilerFrame {
  frameNumber: number;
  timestamp: number;
  samples: Map<string, ProfilerSample>;
  metrics: Map<string, ProfilerMetric>;
  duration: number;
  metadata?: Record<string, any>;
}

export interface ProfilerConfig {
  enabled: boolean;
  maxFrames: number;
  sampleRate: number; // Hz
  categories: string[];
  autoStart: boolean;
  outputFormat: 'json' | 'csv' | 'console';
}

export interface ProfilerReport {
  summary: {
    totalFrames: number;
    averageFrameTime: number;
    minFrameTime: number;
    maxFrameTime: number;
    totalDuration: number;
  };
  categories: Map<string, {
    totalSamples: number;
    totalTime: number;
    averageTime: number;
    percentage: number;
  }>;
  samples: ProfilerSample[];
  metrics: ProfilerMetric[];
  recommendations: string[];
}

export interface HotReloadConfig {
  enabled: boolean;
  watchPaths: string[];
  reloadDelay: number;
  validateBeforeReload: boolean;
  backupBeforeReload: boolean;
}

export class Profiler {
  private config: ProfilerConfig;
  private frames: ProfilerFrame[];
  private currentFrame?: ProfilerFrame;
  private activeSamples: Map<string, ProfilerSample>;
  private metrics: Map<string, ProfilerMetric>;
  private observers: ProfilerObserver[];
  private isRunning: boolean;

  constructor(config: ProfilerConfig) {
    this.config = config;
    this.frames = [];
    this.activeSamples = new Map();
    this.metrics = new Map();
    this.observers = [];
    this.isRunning = false;

    if (config.autoStart) {
      this.start();
    }
  }

  // Frame Management
  startFrame(frameNumber: number): void {
    if (!this.config.enabled || !this.isRunning) return;

    this.currentFrame = {
      frameNumber,
      timestamp: performance.now(),
      samples: new Map(),
      metrics: new Map(),
      duration: 0
    };

    this.activeSamples.clear();
  }

  endFrame(): void {
    if (!this.currentFrame) return;

    this.currentFrame.duration = performance.now() - this.currentFrame.timestamp;
    
    // Close any remaining active samples
    for (const [sampleId, sample] of this.activeSamples) {
      sample.endTime = performance.now();
      sample.duration = sample.endTime - sample.startTime;
      this.currentFrame.samples.set(sampleId, sample);
    }

    this.frames.push(this.currentFrame);

    // Maintain frame limit
    if (this.frames.length > this.config.maxFrames) {
      this.frames.shift();
    }

    this.notifyObservers('frameEnd', this.currentFrame);
    this.currentFrame = undefined;
  }

  // Sample Management
  beginSample(name: string, category: string = 'default', metadata?: Record<string, any>): string {
    if (!this.config.enabled || !this.isRunning || !this.currentFrame) return '';

    const sampleId = this.generateSampleId();
    const sample: ProfilerSample = {
      id: sampleId,
      name,
      category,
      startTime: performance.now(),
      children: [],
      metadata
    };

    // Handle parent-child relationships
    const activeSampleIds = Array.from(this.activeSamples.keys());
    if (activeSampleIds.length > 0) {
      const parentId = activeSampleIds[activeSampleIds.length - 1];
      sample.parentId = parentId;
      const parent = this.activeSamples.get(parentId);
      if (parent) {
        parent.children.push(sampleId);
      }
    }

    this.activeSamples.set(sampleId, sample);
    this.currentFrame.samples.set(sampleId, sample);

    this.notifyObservers('sampleBegin', sample);
    return sampleId;
  }

  endSample(sampleId: string): void {
    if (!this.config.enabled || !this.isRunning || !this.currentFrame) return;

    const sample = this.activeSamples.get(sampleId);
    if (!sample) return;

    sample.endTime = performance.now();
    sample.duration = sample.endTime - sample.startTime;

    this.activeSamples.delete(sampleId);
    this.currentFrame.samples.set(sampleId, sample);

    this.notifyObservers('sampleEnd', sample);
  }

  // Metric Management
  recordMetric(name: string, value: number, unit: string = '', category: string = 'default', metadata?: Record<string, any>): void {
    if (!this.config.enabled || !this.isRunning || !this.currentFrame) return;

    const metricId = this.generateMetricId();
    const metric: ProfilerMetric = {
      id: metricId,
      name,
      category,
      value,
      unit,
      timestamp: performance.now(),
      metadata
    };

    this.metrics.set(metricId, metric);
    this.currentFrame.metrics.set(metricId, metric);

    this.notifyObservers('metricRecorded', metric);
  }

  // Utility Methods
  getCurrentFrame(): ProfilerFrame | undefined {
    return this.currentFrame;
  }

  getFrames(): ProfilerFrame[] {
    return [...this.frames];
  }

  getActiveSamples(): ProfilerSample[] {
    return Array.from(this.activeSamples.values());
  }

  getMetrics(): ProfilerMetric[] {
    return Array.from(this.metrics.values());
  }

  // Control Methods
  start(): void {
    this.isRunning = true;
    this.notifyObservers('profilerStarted', null);
  }

  stop(): void {
    this.isRunning = false;
    this.endFrame(); // End current frame if active
    this.notifyObservers('profilerStopped', null);
  }

  reset(): void {
    this.frames = [];
    this.activeSamples.clear();
    this.metrics.clear();
    this.currentFrame = undefined;
    this.notifyObservers('profilerReset', null);
  }

  // Observer Management
  addObserver(observer: ProfilerObserver): void {
    this.observers.push(observer);
  }

  removeObserver(observerId: string): void {
    const index = this.observers.findIndex(o => o.id === observerId);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  private notifyObservers(event: string, data: any): void {
    this.observers.forEach(observer => {
      try {
        switch (event) {
          case 'frameEnd':
            observer.onFrameEnd?.(data);
            break;
          case 'sampleBegin':
            observer.onSampleBegin?.(data);
            break;
          case 'sampleEnd':
            observer.onSampleEnd?.(data);
            break;
          case 'metricRecorded':
            observer.onMetricRecorded?.(data);
            break;
          case 'profilerStarted':
            observer.onProfilerStarted?.();
            break;
          case 'profilerStopped':
            observer.onProfilerStopped?.();
            break;
          case 'profilerReset':
            observer.onProfilerReset?.();
            break;
        }
      } catch (error) {
        console.error('[ProfilerPure] Observer error:', error);
      }
    });
  }

  // Report Generation
  generateReport(): ProfilerReport {
    if (this.frames.length === 0) {
      return {
        summary: {
          totalFrames: 0,
          averageFrameTime: 0,
          minFrameTime: 0,
          maxFrameTime: 0,
          totalDuration: 0
        },
        categories: new Map(),
        samples: [],
        metrics: [],
        recommendations: ['No profiling data available']
      };
    }

    // Calculate summary
    const frameTimes = this.frames.map(f => f.duration);
    const totalDuration = this.frames[this.frames.length - 1].timestamp - this.frames[0].timestamp;
    
    const summary = {
      totalFrames: this.frames.length,
      averageFrameTime: frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length,
      minFrameTime: Math.min(...frameTimes),
      maxFrameTime: Math.max(...frameTimes),
      totalDuration
    };

    // Calculate category statistics
    const categories = new Map<string, { totalSamples: number; totalTime: number; averageTime: number; percentage: number }>();
    const allSamples: ProfilerSample[] = [];

    for (const frame of this.frames) {
      for (const sample of frame.samples.values()) {
        allSamples.push(sample);
        
        const category = categories.get(sample.category) || { totalSamples: 0, totalTime: 0, averageTime: 0, percentage: 0 };
        category.totalSamples++;
        category.totalTime += sample.duration || 0;
        categories.set(sample.category, category);
      }
    }

    // Calculate percentages
    const totalTime = allSamples.reduce((sum, sample) => sum + (sample.duration || 0), 0);
    for (const category of categories.values()) {
      category.averageTime = category.totalTime / category.totalSamples;
      category.percentage = (category.totalTime / totalTime) * 100;
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (summary.averageFrameTime > 16.67) { // 60 FPS threshold
      recommendations.push('Frame time exceeds 60 FPS target. Consider optimization.');
    }
    if (summary.maxFrameTime > 33.33) { // 30 FPS threshold
      recommendations.push('Frame time spikes detected. Investigate performance bottlenecks.');
    }

    const slowestCategory = Array.from(categories.entries())
      .sort((a, b) => b[1].totalTime - a[1].totalTime)[0];
    if (slowestCategory && slowestCategory[1].percentage > 50) {
      recommendations.push(`${slowestCategory[0]} category consumes ${slowestCategory[1].percentage.toFixed(1)}% of total time.`);
    }

    return {
      summary,
      categories,
      samples: allSamples,
      metrics: Array.from(this.metrics.values()),
      recommendations
    };
  }

  // Export Methods
  exportReport(format: 'json' | 'csv' | 'console' = 'json'): string {
    const report = this.generateReport();

    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2);
      
      case 'csv':
        return this.exportToCSV(report);
      
      case 'console':
        return this.exportToConsole(report);
      
      default:
        return JSON.stringify(report, null, 2);
    }
  }

  private exportToCSV(report: ProfilerReport): string {
    let csv = 'Category,Total Samples,Total Time (ms),Average Time (ms),Percentage\n';
    
    for (const [category, stats] of report.categories) {
      csv += `${category},${stats.totalSamples},${stats.totalTime.toFixed(2)},${stats.averageTime.toFixed(2)},${stats.percentage.toFixed(2)}%\n`;
    }
    
    return csv;
  }

  private exportToConsole(report: ProfilerReport): string {
    let output = '=== Profiler Report ===\n\n';
    
    output += `Summary:\n`;
    output += `  Total Frames: ${report.summary.totalFrames}\n`;
    output += `  Average Frame Time: ${report.summary.averageFrameTime.toFixed(2)}ms\n`;
    output += `  Min Frame Time: ${report.summary.minFrameTime.toFixed(2)}ms\n`;
    output += `  Max Frame Time: ${report.summary.maxFrameTime.toFixed(2)}ms\n`;
    output += `  Total Duration: ${report.summary.totalDuration.toFixed(2)}ms\n\n`;
    
    output += `Categories:\n`;
    for (const [category, stats] of report.categories) {
      output += `  ${category}: ${stats.totalSamples} samples, ${stats.totalTime.toFixed(2)}ms total, ${stats.percentage.toFixed(1)}%\n`;
    }
    
    if (report.recommendations.length > 0) {
      output += `\nRecommendations:\n`;
      report.recommendations.forEach(rec => {
        output += `  - ${rec}\n`;
      });
    }
    
    return output;
  }

  // Helper Methods
  private generateSampleId(): string {
    return `sample_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMetricId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export interface ProfilerObserver {
  id: string;
  onFrameEnd?: (frame: ProfilerFrame) => void;
  onSampleBegin?: (sample: ProfilerSample) => void;
  onSampleEnd?: (sample: ProfilerSample) => void;
  onMetricRecorded?: (metric: ProfilerMetric) => void;
  onProfilerStarted?: () => void;
  onProfilerStopped?: () => void;
  onProfilerReset?: () => void;
}

// Convenience decorators for automatic profiling
export function profile(category: string = 'default') {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const profiler = (globalThis as any).__miffProfiler;
      if (!profiler) return method.apply(this, args);
      
      const sampleId = profiler.beginSample(propertyName, category);
      try {
        return method.apply(this, args);
      } finally {
        profiler.endSample(sampleId);
      }
    };
  };
}

// CLI interface
export function createProfiler(config: ProfilerConfig): Profiler {
  return new Profiler(config);
}

// Export for CLI usage
export default Profiler;