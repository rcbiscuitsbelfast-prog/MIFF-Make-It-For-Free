import { StructuredLogger } from '../logging/StructuredLogger';
import { StandardErrorHandler } from '../error/StandardErrorHandler';
import { HealthCheckSystem, HealthStatus } from '../health/HealthCheckSystem';

/**
 * Production Monitor - Real-time production monitoring and alerting
 * Provides comprehensive monitoring, metrics collection, and alerting
 */

export interface MonitoringConfig {
  enabled: boolean;
  interval: number;
  retention: number;
  alerting: AlertingConfig;
  metrics: MetricsConfig;
  logging: LoggingConfig;
}

export interface AlertingConfig {
  enabled: boolean;
  channels: AlertChannel[];
  thresholds: AlertThresholds;
  cooldown: number;
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'console';
  config: Record<string, any>;
  enabled: boolean;
}

export interface AlertThresholds {
  cpu: number;
  memory: number;
  disk: number;
  responseTime: number;
  errorRate: number;
}

export interface MetricsConfig {
  enabled: boolean;
  collection: string[];
  retention: number;
  aggregation: string[];
}

export interface LoggingConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  retention: number;
  rotation: boolean;
}

export interface MonitoringMetrics {
  timestamp: Date;
  system: SystemMetrics;
  application: ApplicationMetrics;
  performance: PerformanceMetrics;
  errors: ErrorMetrics;
}

export interface SystemMetrics {
  cpu: {
    usage: number;
    load: number[];
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
  };
}

export interface ApplicationMetrics {
  uptime: number;
  version: string;
  requests: {
    total: number;
    successful: number;
    failed: number;
    rate: number;
  };
  responseTime: {
    average: number;
    p50: number;
    p95: number;
    p99: number;
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
}

export interface PerformanceMetrics {
  operations: {
    total: number;
    successful: number;
    failed: number;
    rate: number;
  };
  latency: {
    average: number;
    p50: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    operationsPerSecond: number;
    bytesPerSecond: number;
  };
}

export interface ErrorMetrics {
  total: number;
  rate: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  recent: ErrorEntry[];
}

export interface ErrorEntry {
  timestamp: Date;
  message: string;
  stack: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: Record<string, any>;
}

export class ProductionMonitor {
  private logger: StructuredLogger;
  private errorHandler: StandardErrorHandler;
  private healthCheckSystem: HealthCheckSystem;
  private config: MonitoringConfig;
  private isInitialized: boolean = false;
  private startTime: Date;
  private metrics: MonitoringMetrics[] = [];
  private alerts: Map<string, Date> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<MonitoringConfig>) {
    this.logger = new StructuredLogger({ module: 'ProductionMonitor' });
    this.errorHandler = new StandardErrorHandler();
    this.healthCheckSystem = new HealthCheckSystem();
    this.startTime = new Date();
    
    this.config = {
      enabled: true,
      interval: 30000, // 30 seconds
      retention: 24 * 60 * 60 * 1000, // 24 hours
      alerting: {
        enabled: true,
        channels: [
          {
            type: 'console',
            config: {},
            enabled: true
          }
        ],
        thresholds: {
          cpu: 80,
          memory: 85,
          disk: 90,
          responseTime: 5000,
          errorRate: 5
        },
        cooldown: 300000 // 5 minutes
      },
      metrics: {
        enabled: true,
        collection: ['system', 'application', 'performance', 'errors'],
        retention: 7 * 24 * 60 * 60 * 1000, // 7 days
        aggregation: ['average', 'max', 'min', 'sum']
      },
      logging: {
        enabled: true,
        level: 'info',
        retention: 30 * 24 * 60 * 60 * 1000, // 30 days
        rotation: true
      },
      ...config
    };
  }

  /**
   * Initialize the production monitor
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('Production monitor already initialized');
      return;
    }

    try {
      console.info('Initializing production monitor...');
      
      // Initialize health check system
      await this.healthCheckSystem.initialize();
      
      // Start monitoring
      if (this.config.enabled) {
        this.startMonitoring();
      }
      
      this.isInitialized = true;
      console.info('Production monitor initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize production monitor', { error: error.message });
      throw error;
    }
  }

  /**
   * Start monitoring
   */
  private startMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.collectMetrics();
        await this.checkAlerts();
        await this.cleanupOldMetrics();
      } catch (error) {
        console.error('Monitoring cycle failed', { error: error.message });
      }
    }, this.config.interval);
    
    console.info('Monitoring started', { interval: this.config.interval });
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    console.info('Monitoring stopped');
  }

  /**
   * Collect metrics
   */
  private async collectMetrics(): Promise<void> {
    const timestamp = new Date();
    
    try {
      const systemMetrics = await this.collectSystemMetrics();
      const applicationMetrics = await this.collectApplicationMetrics();
      const performanceMetrics = await this.collectPerformanceMetrics();
      const errorMetrics = await this.collectErrorMetrics();
      
      const metrics: MonitoringMetrics = {
        timestamp,
        system: systemMetrics,
        application: applicationMetrics,
        performance: performanceMetrics,
        errors: errorMetrics
      };
      
      this.metrics.push(metrics);
      
      // Keep only recent metrics
      const cutoff = new Date(timestamp.getTime() - this.config.retention);
      this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
      
    } catch (error) {
      console.error('Failed to collect metrics', { error: error.message });
    }
  }

  /**
   * Collect system metrics
   */
  private async collectSystemMetrics(): Promise<SystemMetrics> {
    const os = require('os');
    const fs = require('fs');
    
    // CPU metrics
    const cpus = os.cpus();
    const cpuUsage = process.cpuUsage();
    const loadAvg = os.loadavg();
    
    // Memory metrics
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    // Disk metrics
    const stats = fs.statSync('/');
    const diskTotal = stats.size || 0;
    const diskFree = 0; // Simplified for now
    const diskUsed = diskTotal - diskFree;
    
    return {
      cpu: {
        usage: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to seconds
        load: loadAvg,
        cores: cpus.length
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        usage: (usedMem / totalMem) * 100
      },
      disk: {
        total: diskTotal,
        used: diskUsed,
        free: diskFree,
        usage: (diskUsed / diskTotal) * 100
      },
      network: {
        bytesIn: 0, // Would need network monitoring
        bytesOut: 0,
        packetsIn: 0,
        packetsOut: 0
      }
    };
  }

  /**
   * Collect application metrics
   */
  private async collectApplicationMetrics(): Promise<ApplicationMetrics> {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime() * 1000; // Convert to milliseconds
    
    return {
      uptime,
      version: '1.0.0',
      requests: {
        total: 0, // Would need request tracking
        successful: 0,
        failed: 0,
        rate: 0
      },
      responseTime: {
        average: 0,
        p50: 0,
        p95: 0,
        p99: 0
      },
      memory: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss
      }
    };
  }

  /**
   * Collect performance metrics
   */
  private async collectPerformanceMetrics(): Promise<PerformanceMetrics> {
    return {
      operations: {
        total: 0,
        successful: 0,
        failed: 0,
        rate: 0
      },
      latency: {
        average: 0,
        p50: 0,
        p95: 0,
        p99: 0
      },
      throughput: {
        requestsPerSecond: 0,
        operationsPerSecond: 0,
        bytesPerSecond: 0
      }
    };
  }

  /**
   * Collect error metrics
   */
  private async collectErrorMetrics(): Promise<ErrorMetrics> {
    return {
      total: 0,
      rate: 0,
      byType: {},
      bySeverity: {},
      recent: []
    };
  }

  /**
   * Check for alerts
   */
  private async checkAlerts(): Promise<void> {
    if (!this.config.alerting.enabled || this.metrics.length === 0) {
      return;
    }
    
    const latestMetrics = this.metrics[this.metrics.length - 1];
    const thresholds = this.config.alerting.thresholds;
    
    // Check CPU usage
    if (latestMetrics.system.cpu.usage > thresholds.cpu) {
      await this.triggerAlert('high_cpu', {
        current: latestMetrics.system.cpu.usage,
        threshold: thresholds.cpu,
        message: `CPU usage is ${latestMetrics.system.cpu.usage.toFixed(2)}%, above threshold of ${thresholds.cpu}%`
      });
    }
    
    // Check memory usage
    if (latestMetrics.system.memory.usage > thresholds.memory) {
      await this.triggerAlert('high_memory', {
        current: latestMetrics.system.memory.usage,
        threshold: thresholds.memory,
        message: `Memory usage is ${latestMetrics.system.memory.usage.toFixed(2)}%, above threshold of ${thresholds.memory}%`
      });
    }
    
    // Check disk usage
    if (latestMetrics.system.disk.usage > thresholds.disk) {
      await this.triggerAlert('high_disk', {
        current: latestMetrics.system.disk.usage,
        threshold: thresholds.disk,
        message: `Disk usage is ${latestMetrics.system.disk.usage.toFixed(2)}%, above threshold of ${thresholds.disk}%`
      });
    }
  }

  /**
   * Trigger an alert
   */
  private async triggerAlert(type: string, data: any): Promise<void> {
    const now = new Date();
    const lastAlert = this.alerts.get(type);
    
    // Check cooldown
    if (lastAlert && (now.getTime() - lastAlert.getTime()) < this.config.alerting.cooldown) {
      return;
    }
    
    this.alerts.set(type, now);
    
    // Send alert to all channels
    for (const channel of this.config.alerting.channels) {
      if (channel.enabled) {
        await this.sendAlert(channel, type, data);
      }
    }
  }

  /**
   * Send alert to a channel
   */
  private async sendAlert(channel: AlertChannel, type: string, data: any): Promise<void> {
    try {
      switch (channel.type) {
        case 'console':
          console.error(`ALERT: ${type}`, data);
          break;
        case 'email':
          // Would implement email sending
          break;
        case 'slack':
          // Would implement Slack notification
          break;
        case 'webhook':
          // Would implement webhook call
          break;
      }
    } catch (error) {
      console.error('Failed to send alert', { channel: channel.type, type, error: error.message });
    }
  }

  /**
   * Clean up old metrics
   */
  private async cleanupOldMetrics(): Promise<void> {
    const cutoff = new Date(Date.now() - this.config.retention);
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
  }

  /**
   * Get current health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    return this.healthCheckSystem.getHealthStatus();
  }

  /**
   * Get monitoring metrics
   */
  getMetrics(): MonitoringMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get latest metrics
   */
  getLatestMetrics(): MonitoringMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(): {
    total: number;
    timeRange: { start: Date; end: Date };
    averages: Partial<MonitoringMetrics>;
  } {
    if (this.metrics.length === 0) {
      return {
        total: 0,
        timeRange: { start: new Date(), end: new Date() },
        averages: {}
      };
    }
    
    const start = this.metrics[0].timestamp;
    const end = this.metrics[this.metrics.length - 1].timestamp;
    
    // Calculate averages
    const averages = {
      system: {
        cpu: {
          usage: this.metrics.reduce((sum, m) => sum + m.system.cpu.usage, 0) / this.metrics.length,
          load: [0, 0, 0], // Simplified
          cores: this.metrics[0].system.cpu.cores
        },
        memory: {
          total: this.metrics[0].system.memory.total,
          used: this.metrics.reduce((sum, m) => sum + m.system.memory.used, 0) / this.metrics.length,
          free: this.metrics.reduce((sum, m) => sum + m.system.memory.free, 0) / this.metrics.length,
          usage: this.metrics.reduce((sum, m) => sum + m.system.memory.usage, 0) / this.metrics.length
        },
        disk: {
          total: this.metrics[0].system.disk.total,
          used: this.metrics.reduce((sum, m) => sum + m.system.disk.used, 0) / this.metrics.length,
          free: this.metrics.reduce((sum, m) => sum + m.system.disk.free, 0) / this.metrics.length,
          usage: this.metrics.reduce((sum, m) => sum + m.system.disk.usage, 0) / this.metrics.length
        },
        network: {
          bytesIn: 0,
          bytesOut: 0,
          packetsIn: 0,
          packetsOut: 0
        }
      }
    };
    
    return {
      total: this.metrics.length,
      timeRange: { start, end },
      averages
    };
  }

  /**
   * Update monitoring configuration
   */
  updateConfig(): void {
    this.config = { ...this.config, ...config };
    
    if (this.isInitialized) {
      this.stopMonitoring();
      if (this.config.enabled) {
        this.startMonitoring();
      }
    }
  }

  /**
   * Destroy the production monitor
   */
  async destroy(): Promise<void> {
    console.info('Destroying production monitor...');
    
    this.stopMonitoring();
    await this.healthCheckSystem.destroy();
    
    this.metrics = [];
    this.alerts.clear();
    this.isInitialized = false;
    
    console.info('Production monitor destroyed');
  }
}

// Export default instance
export const productionMonitor = new ProductionMonitor();
export default productionMonitor;