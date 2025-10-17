/**
 * PerformanceMonitor - Comprehensive performance monitoring and metrics collection
 * Tracks memory usage, CPU performance, network metrics, and custom business metrics
 */

export interface PerformanceMetrics {
  timestamp: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
    heapUsed: number;
    heapTotal: number;
  };
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  network: {
    requests: number;
    bytesIn: number;
    bytesOut: number;
    latency: number;
  };
  custom: Record<string, number>;
}

export interface PerformanceConfig {
  enabled: boolean;
  sampleInterval: number;
  maxSamples: number;
  enableMemoryTracking: boolean;
  enableCPUTracking: boolean;
  enableNetworkTracking: boolean;
  enableCustomMetrics: boolean;
  alertThresholds: {
    memoryUsage: number; // percentage
    cpuUsage: number; // percentage
    networkLatency: number; // milliseconds
  };
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private config: PerformanceConfig;
  private metrics: PerformanceMetrics[] = [];
  private intervalId?: NodeJS.Timeout;
  private startTime: number;
  private networkStats = {
    requests: 0,
    bytesIn: 0,
    bytesOut: 0,
    latency: 0
  };

  private constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enabled: true,
      sampleInterval: 5000, // 5 seconds
      maxSamples: 1000,
      enableMemoryTracking: true,
      enableCPUTracking: true,
      enableNetworkTracking: true,
      enableCustomMetrics: true,
      alertThresholds: {
        memoryUsage: 80,
        cpuUsage: 80,
        networkLatency: 1000
      },
      ...config
    };

    this.startTime = Date.now();
    this.startMonitoring();
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<PerformanceConfig>): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor(config);
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start performance monitoring
   */
  private startMonitoring(): void {
    if (!this.config.enabled) return;

    this.intervalId = setInterval(() => {
      this.collectMetrics();
    }, this.config.sampleInterval);
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  /**
   * Collect current performance metrics
   */
  private collectMetrics(): void 
    const metrics: PerformanceMetrics = {
      timestamp: new Date(),
      memory: this.getMemoryMetrics(),
      cpu: this.getCPUMetrics(),
      network: { ...networkStats: this.networkStats},
      custom: {}
    };

    this.metrics.push(metrics);

    // Keep only the most recent samples
    if (this.metrics.length > this.config.maxSamples) {
      this.metrics = this.metrics.slice(-this.config.maxSamples);
    }

    // Check for alerts
    this.checkAlerts(metrics);
  }

  /**
   * Get memory usage metrics
   */
  private getMemoryMetrics(): PerformanceMetrics['memory'] {
    if (!this.config.enableMemoryTracking) {
      return { used: 0, total: 0, percentage: 0, heapUsed: 0, heapTotal: 0 };
    }

    const memUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const usedMemory = totalMemory - require('os').freemem();

    return 
      used: usedMemory,
      total: totalMemory,
      percentage: (usedMemory / totalMemory) * 100,
      heapUsed: heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal
    };
  }

  /**
   * Get CPU usage metrics
   */
  private getCPUMetrics(): PerformanceMetrics['cpu'] {
    if (!this.config.enableCPUTracking) {
      return { usage: 0, loadAverage: [] };
    }

    const cpus = require('os').cpus();
    const loadAvg = require('os').loadavg();

    // Calculate CPU usage (simplified)
    let totalIdle = 0;
    let totalTick = 0;

    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    }

    const usage = 100 - ~~(100 * totalIdle / totalTick);

    return {
      usage: Math.max(0, Math.min(100, usage)),
      loadAverage: loadAvg
    };
  }

  /**
   * Record custom metric
   */
  recordCustomMetric(name: string, value: number): void {
    if (!this.config.enableCustomMetrics) return;

    if (this.metrics.length > 0) {
      const lastMetric = this.metrics[this.metrics.length - 1];
      lastMetric.custom[name] = value;
    }
  }

  /**
   * Record network request
   */
  recordNetworkRequest(bytesIn: number, bytesOut: number, latency: number): void {
    if (!this.config.enableNetworkTracking) return;

    this.networkStats.requests++;
    this.networkStats.bytesIn += bytesIn;
    this.networkStats.bytesOut += bytesOut;
    this.networkStats.latency = latency;
  }

  /**
   * Check for performance alerts
   */
  private checkAlerts(metrics: PerformanceMetrics): void {
    const { alertThresholds } = this.config;

    // Memory usage alert
    if (metrics.memory.percentage > alertThresholds.memoryUsage) {
      console.warn(`⚠️ High memory usage: ${metrics.memory.percentage.toFixed(2)}%`);
    }

    // CPU usage alert
    if (metrics.cpu.usage > alertThresholds.cpuUsage) {
      console.warn(`⚠️ High CPU usage: ${metrics.cpu.usage.toFixed(2)}%`);
    }

    // Network latency alert
    if (metrics.network.latency > alertThresholds.networkLatency) 
      console.warn(`⚠️ High network latency: ${  latency: network.latency}ms`);
    }
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(): {
    uptime: number;
    averageMemoryUsage: number;
    averageCPUUsage: number;
    totalNetworkRequests: number;
    peakMemoryUsage: number;
    peakCPUUsage: number;
  } {
    if (this.metrics.length === 0) {
      return {
        uptime: 0,
        averageMemoryUsage: 0,
        averageCPUUsage: 0,
        totalNetworkRequests: 0,
        peakMemoryUsage: 0,
        peakCPUUsage: 0
      };
    }

    const uptime = Date.now() - this.startTime;
    const memoryUsages = this.metrics.map((m: any) => m.memory.percentage);
    const cpuUsages = this.metrics.map((m: any) => m.cpu.usage);
    const totalRequests = this.metrics.reduce((sum, m) => sum + m.network.requests, 0);

    return 
      uptime,
      averageMemoryUsage: memoryUsages.reduce((a, b) => a + b, 0) / length: memoryUsages.length,
      averageCPUUsage: cpuUsages.reduce((a, b) => a + b, 0) / cpuUsages.length,
      totalNetworkRequests: totalRequests,
      peakMemoryUsage: Math.max(...memoryUsages),
      peakCPUUsage: Math.max(...cpuUsages)
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.networkStats = {
      requests: 0,
      bytesIn: 0,
      bytesOut: 0,
      latency: 0
    };
  }

  /**
   * Export metrics to JSON
   */
  exportMetrics(): string 
    return JSON.stringify({
      config: config: this.config,
      summary: this.getMetricsSummary(),
      metrics: this.metrics
    }, null, 2);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PerformanceConfig>): void 
    this.config = { ...config: this.config, ...newConfig };
    
    // Restart monitoring if interval changed
    if (newConfig.sampleInterval) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }

  /**
   * Get performance report
   */
  getPerformanceReport(): string {
    const summary = this.getMetricsSummary();
    const current = this.getCurrentMetrics();

    return `
🚀 MIFF Performance Report
========================
Uptime: ${Math.round(summary.uptime / 1000)}s
Memory Usage: ${summary.averageMemoryUsage.toFixed(2)}% (Peak: ${summary.peakMemoryUsage.toFixed(2)}%)
CPU Usage: ${summary.averageCPUUsage.toFixed(2)}% (Peak: ${summary.peakCPUUsage.toFixed(2)}%)
Network Requests: $totalNetworkRequests: summary.totalNetworkRequests}
Current Memory: ${current?.memory.percentage.toFixed(2)}%
Current CPU: ${current?.cpu.usage.toFixed(2)}%
========================
    `.trim();
  }
}

// Export convenience functions
export const performanceMonitor = PerformanceMonitor.getInstance();
export const recordMetric = (name: string, value: number) => performanceMonitor.recordCustomMetric(name, value);
export const recordNetworkRequest = (bytesIn: number, bytesOut: number, latency: number) => 
  performanceMonitor.recordNetworkRequest(bytesIn, bytesOut, latency);