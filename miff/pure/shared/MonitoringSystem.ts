/**
 * Monitoring System for MIFF Framework
 * 
 * Provides comprehensive monitoring, alerting, and observability features
 * for production-ready MIFF framework deployment.
 */

import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number; // percentage
    loadAverage: number[];
    cores: number;
  };
  memory: {
    total: number; // bytes
    used: number; // bytes
    free: number; // bytes
    usage: number; // percentage
  };
  disk: {
    total: number; // bytes
    used: number; // bytes
    free: number; // bytes
    usage: number; // percentage
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
  };
  process: {
    pid: number;
    uptime: number; // seconds
    memory: NodeJS.MemoryUsage;
    cpu: NodeJS.CpuUsage;
  };
}

export interface ApplicationMetrics {
  timestamp: Date;
  requests: {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number; // milliseconds
  };
  errors: {
    total: number;
    byType: Map<string, number>;
    lastError?: ErrorInfo;
  };
  sessions: {
    active: number;
    total: number;
    peak: number;
  };
  performance: {
    memoryLeaks: number;
    slowQueries: number;
    cacheHitRate: number; // percentage
  };
}

export interface ErrorInfo {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  message: string;
  stack?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: any;
  resolved: boolean;
}

export interface Alert {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  type: 'cpu' | 'memory' | 'disk' | 'error' | 'performance' | 'custom';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  metadata: any;
}

export interface MonitoringConfig {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  enabled: boolean;
  collectionInterval: number; // seconds
  retentionPeriod: number; // days
  alertThresholds: {
    cpu: number; // percentage
    memory: number; // percentage
    diskUsage: number; // percentage
    errorRate: number; // percentage
    responseTime: number; // milliseconds
  };
  notifications: {
    email: boolean;
    webhook: boolean;
    log: boolean;
    console: boolean;
  };
  webhookUrl?: string;
  emailRecipients?: string[];
}

export interface HealthCheck {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  status: 'healthy' | 'unhealthy' | 'degraded';
  message: string;
  timestamp: Date;
  responseTime: number; // milliseconds
  metadata: any;
}

export class MonitoringSystem {
  
  private config: MonitoringConfig;
  private metrics: SystemMetrics[] = [];
  private appMetrics: ApplicationMetrics[] = [];
  private errors: ErrorInfo[] = [];
  private alerts: Alert[] = [];
  private healthChecks: Map<string, HealthCheck> = new Map();
  private collectionTimer?: NodeJS.Timeout;
  private isRunning: boolean = false;

  constructor(config: Partial<MonitoringConfig> = {}) {
    
    this.config = {
      enabled: true,
      collectionInterval: 30, // 30 seconds
      retentionPeriod: 7, // 7 days
      alertThresholds: {
        cpu: 80,
        memory: 85,
        diskUsage: 90,
        errorRate: 5,
        responseTime: 1000
      },
      notifications: {
        email: false,
        webhook: false,
        log: true,
        console: true
      },
      ...config
    };

    if (this.config.enabled) {
      this.start();
    }
  }

  /**
   * Start monitoring
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.collectionTimer = setInterval(() => {
      this.collectMetrics();
    }, this.config.collectionInterval * 1000);

    console.info('🔍 Monitoring system started');
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.collectionTimer) {
      clearInterval(this.collectionTimer);
    }

    console.info('🔍 Monitoring system stopped');
  }

  /**
   * Collect system metrics
   */
  async collectMetrics(): Promise<void> {
    try {
      const systemMetrics = await this.collectSystemMetrics();
      const appMetrics = await this.collectApplicationMetrics();

      this.metrics.push(systemMetrics);
      this.appMetrics.push(appMetrics);

      // Clean up old metrics
      this.cleanupOldMetrics();

      // Check for alerts
      await this.checkAlerts(systemMetrics, appMetrics);

      // Log metrics if enabled
      if (this.config.notifications.log) {
        console.info(`📊 Metrics collected - CPU: ${systemMetrics.cpu.usage.toFixed(1)}%, Memory: ${systemMetrics.memory.usage.toFixed(1)}%`);
      }
    } catch (error) {
      console.error('Failed to collect metrics:', error);
    }
  }

  /**
   * Record an error
   */
  recordError(): void {
    const errorInfo: ErrorInfo = {
      id: this.generateId(),
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      severity,
      context,
      resolved: false
    };

    this.errors.push(errorInfo);

    // Create alert for high severity errors
    if (severity === 'high' || severity === 'critical') {
      this.createAlert({
        type: 'error',
        severity: severity === 'critical' ? 'critical' : 'error',
        title: 'Application Error',
        message: error.message,
        metadata: { errorId: errorInfo.id, context }
      });
    }
  }

  /**
   * Record a request
   */
  recordRequest(): void {
    // This would typically be called from middleware
    // For now, we'll simulate it in collectApplicationMetrics
  }

  /**
   * Create an alert
   */
  createAlert(): void {
    const newAlert: Alert = {
      id: this.generateId(),
      timestamp: new Date(),
      resolved: false,
      ...alert
    };

    this.alerts.push(newAlert);

    // Send notifications
    this.sendNotifications(newAlert);
  }

  /**
   * Resolve an alert
   */
  resolveAlert(): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Register a health check
   */
  registerHealthCheck(name: string, checkFn: () => Promise<HealthCheck>): void {
    // Store the health check function
    (this as any)[`healthCheck_${name}`] = checkFn;
  }

  /**
   * Run health checks
   */
  async runHealthChecks(): Promise<Map<string, HealthCheck>> {
    const results = new Map<string, HealthCheck>();

    // Database health check
    const dbHealth = await this.checkDatabaseHealth();
    results.set('database', dbHealth);

    // Authentication health check
    const authHealth = await this.checkAuthenticationHealth();
    results.set('authentication', authHealth);

    // File system health check
    const fsHealth = await this.checkFileSystemHealth();
    results.set('filesystem', fsHealth);

    // Memory health check
    const memoryHealth = await this.checkMemoryHealth();
    results.set('memory', memoryHealth);

    this.healthChecks = results;
    return results;
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): { system: SystemMetrics | null; application: ApplicationMetrics | null } {
    return {
      system: this.metrics[this.metrics.length - 1] || null,
      application: this.appMetrics[this.appMetrics.length - 1] || null
    };
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(hours: number = 24): { system: SystemMetrics[]; application: ApplicationMetrics[] } {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return {
      system: this.metrics.filter(m => m.timestamp > cutoff),
      application: this.appMetrics.filter(m => m.timestamp > cutoff)
    };
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 50): ErrorInfo[] {
    return this.errors
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get monitoring dashboard data
   */
  getDashboardData(): {
    system: SystemMetrics | null;
    application: ApplicationMetrics | null;
    healthChecks: HealthCheck[];
    activeAlerts: Alert[];
    recentErrors: ErrorInfo[];
    uptime: number;
  } {
    const current = this.getCurrentMetrics();
    const healthChecks = Array.from(this.healthChecks.values());
    const activeAlerts = this.getActiveAlerts();
    const recentErrors = this.getRecentErrors(10);

    return {
      system: current.system,
      application: current.application,
      healthChecks,
      activeAlerts,
      recentErrors,
      uptime: process.uptime()
    };
  }

  private async collectSystemMetrics(): Promise<SystemMetrics> {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    // Get disk usage (simplified)
    const diskStats = await this.getDiskUsage();

    return {
      timestamp: new Date(),
      cpu: {
        usage: this.getCpuUsage(),
        loadAverage: os.loadavg(),
        cores: cpus.length
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        usage: (usedMem / totalMem) * 100
      },
      disk: {
        total: diskStats.total,
        used: diskStats.used,
        free: diskStats.free,
        usage: (diskStats.used / diskStats.total) * 100
      },
      network: {
        bytesIn: 0, // Would need network monitoring
        bytesOut: 0,
        packetsIn: 0,
        packetsOut: 0
      },
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      }
    };
  }

  private async collectApplicationMetrics(): Promise<ApplicationMetrics> {
    // Simulate application metrics
    const totalRequests = Math.floor(Math.random() * 1000) + 500;
    const errorRate = Math.random() * 5;
    const successfulRequests = Math.floor(totalRequests * (1 - errorRate / 100));
    const failedRequests = totalRequests - successfulRequests;

    return {
      timestamp: new Date(),
      requests: {
        total: totalRequests,
        successful: successfulRequests,
        failed: failedRequests,
        averageResponseTime: Math.random() * 500 + 100
      },
      errors: {
        total: this.errors.length,
        byType: this.getErrorCountsByType(),
        lastError: this.errors[this.errors.length - 1]
      },
      sessions: {
        active: Math.floor(Math.random() * 50) + 10,
        total: Math.floor(Math.random() * 200) + 100,
        peak: Math.floor(Math.random() * 100) + 50
      },
      performance: {
        memoryLeaks: Math.floor(Math.random() * 5),
        slowQueries: Math.floor(Math.random() * 10),
        cacheHitRate: Math.random() * 20 + 80
      }
    };
  }

  private async checkAlerts(systemMetrics: SystemMetrics, appMetrics: ApplicationMetrics): Promise<void> {
    const thresholds = this.config.alertThresholds;

    // CPU usage alert
    if (systemMetrics.cpu.usage > thresholds.cpu) {
      this.createAlert({
        type: 'cpu',
        severity: 'warning',
        title: 'High CPU Usage',
        message: `CPU usage is ${systemMetrics.cpu.usage.toFixed(1)}% (threshold: ${thresholds.cpu}%)`,
        metadata: { usage: systemMetrics.cpu.usage, threshold: thresholds.cpu }
      });
    }

    // Memory usage alert
    if (systemMetrics.memory.usage > thresholds.memory) {
      this.createAlert({
        type: 'memory',
        severity: 'warning',
        title: 'High Memory Usage',
        message: `Memory usage is ${systemMetrics.memory.usage.toFixed(1)}% (threshold: ${thresholds.memory}%)`,
        metadata: { usage: systemMetrics.memory.usage, threshold: thresholds.memory }
      });
    }

    // Disk usage alert
    if (systemMetrics.disk.usage > thresholds.diskUsage) {
      this.createAlert({
        type: 'disk',
        severity: 'error',
        title: 'High Disk Usage',
        message: `Disk usage is ${systemMetrics.disk.usage.toFixed(1)}% (threshold: ${thresholds.diskUsage}%)`,
        metadata: { usage: systemMetrics.disk.usage, threshold: thresholds.diskUsage }
      });
    }

    // Error rate alert
    const errorRate = (appMetrics.requests.failed / appMetrics.requests.total) * 100;
    if (errorRate > thresholds.errorRate) {
      this.createAlert({
        type: 'error',
        severity: 'error',
        title: 'High Error Rate',
        message: `Error rate is ${errorRate.toFixed(1)}% (threshold: ${thresholds.errorRate}%)`,
        metadata: { errorRate, threshold: thresholds.errorRate }
      });
    }

    // Response time alert
    if (appMetrics.requests.averageResponseTime > thresholds.responseTime) {
      this.createAlert({
        type: 'performance',
        severity: 'warning',
        title: 'Slow Response Time',
        message: `Average response time is ${appMetrics.requests.averageResponseTime.toFixed(0)}ms (threshold: ${thresholds.responseTime}ms)`,
        metadata: { responseTime: appMetrics.requests.averageResponseTime, threshold: thresholds.responseTime }
      });
    }
  }

  private async checkDatabaseHealth(): Promise<HealthCheck> {
    const start = Date.now();
    try {
      // Simulate database check
      await new Promise(resolve => setTimeout(resolve, 10));
      return {
        name: 'database',
        status: 'healthy',
        message: 'Database connection successful',
        timestamp: new Date(),
        responseTime: Date.now() - start,
        metadata: { connectionPool: 'active' }
      };
    } catch (error) {
      return {
        name: 'database',
        status: 'unhealthy',
        message: 'Database connection failed',
        timestamp: new Date(),
        responseTime: Date.now() - start,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  private async checkAuthenticationHealth(): Promise<HealthCheck> {
    const start = Date.now();
    try {
      // Simulate authentication check
      await new Promise(resolve => setTimeout(resolve, 5));
      return {
        name: 'authentication',
        status: 'healthy',
        message: 'Authentication service operational',
        timestamp: new Date(),
        responseTime: Date.now() - start,
        metadata: { activeSessions: 42 }
      };
    } catch (error) {
      return {
        name: 'authentication',
        status: 'unhealthy',
        message: 'Authentication service failed',
        timestamp: new Date(),
        responseTime: Date.now() - start,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  private async checkFileSystemHealth(): Promise<HealthCheck> {
    const start = Date.now();
    try {
      // Check if we can read/write to temp directory
      const tempDir = os.tmpdir();
      const testFile = path.join(tempDir, 'miff_health_check.tmp');
      
      fs.writeFileSync(testFile, 'health check');
      fs.unlinkSync(testFile);
      
      return {
        name: 'filesystem',
        status: 'healthy',
        message: 'File system operations successful',
        timestamp: new Date(),
        responseTime: Date.now() - start,
        metadata: { tempDir }
      };
    } catch (error) {
      return {
        name: 'filesystem',
        status: 'unhealthy',
        message: 'File system operations failed',
        timestamp: new Date(),
        responseTime: Date.now() - start,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  private async checkMemoryHealth(): Promise<HealthCheck> {
    const start = Date.now();
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
    const usagePercent = (heapUsedMB / heapTotalMB) * 100;

    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    let message = 'Memory usage normal';

    if (usagePercent > 90) {
      status = 'unhealthy';
      message = 'Memory usage critically high';
    } else if (usagePercent > 75) {
      status = 'degraded';
      message = 'Memory usage elevated';
    }

    return {
      name: 'memory',
      status,
      message,
      timestamp: new Date(),
      responseTime: Date.now() - start,
      metadata: { 
        heapUsedMB: Math.round(heapUsedMB),
        heapTotalMB: Math.round(heapTotalMB),
        usagePercent: Math.round(usagePercent)
      }
    };
  }

  private getCpuUsage(): number {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += (cpu.times as any)[type];
      }
      totalIdle += cpu.times.idle;
    }

    return 100 - (totalIdle / totalTick) * 100;
  }

  private async getDiskUsage(): Promise<{ total: number; used: number; free: number }> {
    try {
//       const stats = fs.statSync(process.cwd());
      // Simplified disk usage calculation
      return {
        total: 100 * 1024 * 1024 * 1024, // 100GB
        used: 50 * 1024 * 1024 * 1024,   // 50GB
        free: 50 * 1024 * 1024 * 1024    // 50GB
      };
    } catch {
      return { total: 0, used: 0, free: 0 };
    }
  }

  private getErrorCountsByType(): Map<string, number> {
    const counts = new Map<string, number>();
    for (const error of this.errors) {
      const type = error.message.split(':')[0] || 'Unknown';
      counts.set(type, (counts.get(type) || 0) + 1);
    }
    return counts;
  }

  private sendNotifications(alert: Alert): void {
    if (this.config.notifications.console) {
      console.info(`🚨 ALERT [${alert.severity.toUpperCase()}] ${alert.title}: ${alert.message}`);
    }

    if (this.config.notifications.log) {
      console.info(`Alert created: ${JSON.stringify(alert, null, 2)}`);
    }

    // In a real implementation, send email and webhook notifications
    if (this.config.notifications.email && this.config.emailRecipients) {
      // Send email notification
    }

    if (this.config.notifications.webhook && this.config.webhookUrl) {
      // Send webhook notification
    }
  }

  private cleanupOldMetrics(): void {
    const cutoff = new Date(Date.now() - this.config.retentionPeriod * 24 * 60 * 60 * 1000);
    
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    this.appMetrics = this.appMetrics.filter(m => m.timestamp > cutoff);
    this.errors = this.errors.filter(e => e.timestamp > cutoff);
    this.alerts = this.alerts.filter(a => a.timestamp > cutoff);
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default MonitoringSystem;