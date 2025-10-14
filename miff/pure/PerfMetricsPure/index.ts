export interface PerfSample {
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
  dtMs: number;
  tickStartMs: number;
  tickEndMs: number;
  playersSimulated: number;
  category?: string;
  metadata?: Record<string, any>;
}

export interface PerfSnapshot {
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
  avgDtMs: number;
  avgTickMs: number;
  maxTickMs: number;
  minTickMs: number;
  ticks: number;
  playersSimulatedLast: number;
  fps: number;
  frameTime: number;
  performance: 'excellent' | 'good' | 'fair' | 'poor';
  recommendations: string[];
}

export interface PerfMetrics {
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
  samples: PerfSample[];
  snapshot: PerfSnapshot;
  history: PerfSnapshot[];
  alerts: PerfAlert[];
  trends: PerfTrend[];
}

export interface PerfAlert {
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
  type: 'performance' | 'memory' | 'fps' | 'latency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold: number;
  actual: number;
  recommendations: string[];
}

export interface PerfTrend {
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
  metric: string;
  direction: 'improving' | 'stable' | 'declining';
  change: number;
  confidence: number;
  period: number;
}

export interface PerfConfig {
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
  maxSamples: number;
  alertThresholds: {
    fps: { warning: number; critical: number };
    frameTime: { warning: number; critical: number };
    memory: { warning: number; critical: number };
  };
  categories: string[];
  enableAlerts: boolean;
  enableTrends: boolean;
  historySize: number;
}

export interface PerfStats {
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
  totalSamples: number;
  totalTicks: number;
  averageFPS: number;
  averageFrameTime: number;
  peakFPS: number;
  lowestFPS: number;
  alertsGenerated: number;
  trendsDetected: number;
  uptime: number;
  performanceScore: number;
}

export class PerfMetricsPure {
  private samples: PerfSample[] = [];
  private history: PerfSnapshot[] = [];
  private alerts: PerfAlert[] = [];
  private trends: PerfTrend[] = [];
  private config: PerfConfig;
  private startTime: number;
  private lastSnapshotTime: number;

  constructor(config: Partial<PerfConfig> = {}) {
    this.config = {
      maxSamples: 120,
      alertThresholds: {
        fps: { warning: 45, critical: 30 },
        frameTime: { warning: 22, critical: 33 },
        memory: { warning: 100, critical: 200 }
      },
      categories: ['default'],
      enableAlerts: true,
      enableTrends: true,
      historySize: 100,
      ...config
    };
    this.startTime = Date.now();
    this.lastSnapshotTime = this.startTime;
  }

  public record(dtMs: number, tickStartMs: number, tickEndMs: number, playersSimulated: number, category: string = 'default', metadata?: Record<string, any>): void {
    const sample: PerfSample = { 
      dtMs, 
      tickStartMs, 
      tickEndMs, 
      playersSimulated,
      timestamp: Date.now(),
      category,
      metadata
    };
    
    this.samples.push(sample);
    if (this.samples.length > this.config.maxSamples) {
      this.samples.shift();
    }

    // Check for alerts
    if (this.config.enableAlerts) {
      this.checkAlerts(sample);
    }

    // Update trends
    if (this.config.enableTrends) {
      this.updateTrends();
    }
  }

  public snapshot(): PerfSnapshot {
    if (this.samples.length === 0) {
      return { 
        avgDtMs: 0, 
        avgTickMs: 0, 
        maxTickMs: 0, 
        minTickMs: 0, 
        ticks: 0, 
        playersSimulatedLast: 0,
        fps: 0,
        frameTime: 0,
        performance: 'excellent',
        recommendations: []
      };
    }

    let sumDt = 0, sumTick = 0, maxTick = -Infinity, minTick = Infinity;
    let lastPlayers = this.samples[this.samples.length - 1].playersSimulated;
    
    for (const s of this.samples) {
      const tickMs = s.tickEndMs - s.tickStartMs;
      sumDt += s.dtMs;
      sumTick += tickMs;
      if (tickMs > maxTick) maxTick = tickMs;
      if (tickMs < minTick) minTick = tickMs;
    }

    const avgDtMs = sumDt / this.samples.length;
    const avgTickMs = sumTick / this.samples.length;
    const fps = 1000 / avgDtMs;
    const frameTime = avgDtMs;

    // Determine performance level
    let performance: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
    const recommendations: string[] = [];

    if (fps < 30) {
      performance = 'poor';
      recommendations.push('Critical: FPS below 30. Consider major optimizations.');
    } else if (fps < 45) {
      performance = 'fair';
      recommendations.push('Warning: FPS below 45. Consider optimizations.');
    } else if (fps < 60) {
      performance = 'good';
      recommendations.push('Good performance, but could be optimized for 60 FPS.');
    } else {
      performance = 'excellent';
    }

    if (frameTime > 33.33) {
      recommendations.push('Frame time exceeds 33ms. Consider reducing complexity.');
    }

    if (maxTick > 50) {
      recommendations.push('Frame spikes detected. Investigate performance bottlenecks.');
    }

    const snapshot: PerfSnapshot = {
      avgDtMs,
      avgTickMs,
      maxTickMs: maxTick === -Infinity ? 0 : maxTick,
      minTickMs: minTick === Infinity ? 0 : minTick,
      ticks: this.samples.length,
      playersSimulatedLast: lastPlayers,
      fps,
      frameTime,
      performance,
      recommendations
    };

    // Add to history
    this.history.push(snapshot);
    if (this.history.length > this.config.historySize) {
      this.history.shift();
    }

    this.lastSnapshotTime = Date.now();
    return snapshot;
  }

  private checkAlerts(sample: PerfSample): void {
    const fps = 1000 / sample.dtMs;
    const frameTime = sample.dtMs;

    // FPS alerts
    if (fps < this.config.alertThresholds.fps.critical) {
      this.addAlert({
        id: `fps_critical_${Date.now()}`,
        type: 'fps',
        severity: 'critical',
        message: `Critical FPS drop: ${fps.toFixed(1)} FPS`,
        timestamp: Date.now(),
        threshold: this.config.alertThresholds.fps.critical,
        actual: fps,
        recommendations: ['Reduce visual complexity', 'Optimize rendering pipeline', 'Check for memory leaks']
      });
    } else if (fps < this.config.alertThresholds.fps.warning) {
      this.addAlert({
        id: `fps_warning_${Date.now()}`,
        type: 'fps',
        severity: 'medium',
        message: `FPS warning: ${fps.toFixed(1)} FPS`,
        timestamp: Date.now(),
        threshold: this.config.alertThresholds.fps.warning,
        actual: fps,
        recommendations: ['Monitor performance trends', 'Consider optimizations']
      });
    }

    // Frame time alerts
    if (frameTime > this.config.alertThresholds.frameTime.critical) {
      this.addAlert({
        id: `frame_critical_${Date.now()}`,
        type: 'latency',
        severity: 'critical',
        message: `Critical frame time: ${frameTime.toFixed(1)}ms`,
        timestamp: Date.now(),
        threshold: this.config.alertThresholds.frameTime.critical,
        actual: frameTime,
        recommendations: ['Reduce frame complexity', 'Optimize update loops', 'Check for blocking operations']
      });
    } else if (frameTime > this.config.alertThresholds.frameTime.warning) {
      this.addAlert({
        id: `frame_warning_${Date.now()}`,
        type: 'latency',
        severity: 'medium',
        message: `Frame time warning: ${frameTime.toFixed(1)}ms`,
        timestamp: Date.now(),
        threshold: this.config.alertThresholds.frameTime.warning,
        actual: frameTime,
        recommendations: ['Monitor frame time trends', 'Consider optimizations']
      });
    }
  }

  private addAlert(alert: PerfAlert): void {
    // Avoid duplicate alerts
    const recentAlert = this.alerts.find(a => 
      a.type === alert.type && 
      Date.now() - a.timestamp < 5000
    );
    
    if (!recentAlert) {
      this.alerts.push(alert);
      
      // Keep only recent alerts
      if (this.alerts.length > 50) {
        this.alerts.shift();
      }
    }
  }

  private updateTrends(): void {
    if (this.history.length < 10) return;

    const recent = this.history.slice(-10);
    const older = this.history.slice(-20, -10);
    
    if (older.length === 0) return;

    // FPS trend
    const recentFPS = recent.reduce((sum, s) => sum + s.fps, 0) / recent.length;
    const olderFPS = older.reduce((sum, s) => sum + s.fps, 0) / older.length;
    const fpsChange = ((recentFPS - olderFPS) / olderFPS) * 100;

    if (Math.abs(fpsChange) > 5) {
      this.trends.push({
        metric: 'fps',
        direction: fpsChange > 0 ? 'improving' : 'declining',
        change: fpsChange,
        confidence: Math.min(Math.abs(fpsChange) / 10, 1),
        period: 10
      });
    }

    // Frame time trend
    const recentFrameTime = recent.reduce((sum, s) => sum + s.frameTime, 0) / recent.length;
    const olderFrameTime = older.reduce((sum, s) => sum + s.frameTime, 0) / older.length;
    const frameTimeChange = ((recentFrameTime - olderFrameTime) / olderFrameTime) * 100;

    if (Math.abs(frameTimeChange) > 5) {
      this.trends.push({
        metric: 'frameTime',
        direction: frameTimeChange < 0 ? 'improving' : 'declining',
        change: frameTimeChange,
        confidence: Math.min(Math.abs(frameTimeChange) / 10, 1),
        period: 10
      });
    }

    // Keep only recent trends
    if (this.trends.length > 20) {
      this.trends.shift();
    }
  }

  public getMetrics(): PerfMetrics {
    const snapshot = this.snapshot();
    return {
      samples: [...this.samples],
      snapshot,
      history: [...this.history],
      alerts: [...this.alerts],
      trends: [...this.trends]
    };
  }

  public getStats(): PerfStats {
    const snapshot = this.snapshot();
    const uptime = Date.now() - this.startTime;
    
    return {
      totalSamples: this.samples.length,
      totalTicks: this.samples.length,
      averageFPS: snapshot.fps,
      averageFrameTime: snapshot.frameTime,
      peakFPS: Math.max(...this.history.map(h => h.fps)),
      lowestFPS: Math.min(...this.history.map(h => h.fps)),
      alertsGenerated: this.alerts.length,
      trendsDetected: this.trends.length,
      uptime,
      performanceScore: this.calculatePerformanceScore()
    };
  }

  private calculatePerformanceScore(): number {
    if (this.history.length === 0) return 100;
    
    const recent = this.history.slice(-10);
    const avgFPS = recent.reduce((sum, h) => sum + h.fps, 0) / recent.length;
    const avgFrameTime = recent.reduce((sum, h) => sum + h.frameTime, 0) / recent.length;
    
    let score = 100;
    
    // FPS scoring
    if (avgFPS < 30) score -= 50;
    else if (avgFPS < 45) score -= 30;
    else if (avgFPS < 60) score -= 10;
    
    // Frame time scoring
    if (avgFrameTime > 33.33) score -= 30;
    else if (avgFrameTime > 22.22) score -= 15;
    else if (avgFrameTime > 16.67) score -= 5;
    
    // Alert penalty
    score -= this.alerts.length * 2;
    
    return Math.max(0, Math.min(100, score));
  }

  public exportMetrics(format: 'json' | 'csv' | 'markdown' = 'json'): string {
    const metrics = this.getMetrics();
    
    switch (format) {
      case 'json':
        return JSON.stringify(metrics, null, 2);
      
      case 'csv':
        let csv = 'Timestamp,FPS,FrameTime,Players,Category\n';
        this.samples.forEach(sample => {
          const fps = 1000 / sample.dtMs;
          csv += `${sample.timestamp},${fps.toFixed(2)},${sample.dtMs.toFixed(2)},${sample.playersSimulated},${sample.category || 'default'}\n`;
        });
        return csv;
      
      case 'markdown':
        let md = '# Performance Metrics Report\n\n';
        md += `## Summary\n`;
        md += `- Average FPS: ${metrics.snapshot.fps.toFixed(1)}\n`;
        md += `- Average Frame Time: ${metrics.snapshot.frameTime.toFixed(1)}ms\n`;
        md += `- Performance: ${metrics.snapshot.performance}\n`;
        md += `- Total Samples: ${metrics.samples.length}\n\n`;
        
        if (metrics.alerts.length > 0) {
          md += `## Alerts (${metrics.alerts.length})\n\n`;
          metrics.alerts.forEach(alert => {
            md += `- **${alert.severity.toUpperCase()}**: ${alert.message}\n`;
          });
          md += '\n';
        }
        
        if (metrics.trends.length > 0) {
          md += `## Trends (${metrics.trends.length})\n\n`;
          metrics.trends.forEach(trend => {
            md += `- **${trend.metric}**: ${trend.direction} (${trend.change.toFixed(1)}%)\n`;
          });
          md += '\n';
        }
        
        return md;
      
      default:
        return JSON.stringify(metrics, null, 2);
    }
  }

  public reset(): void {
    this.samples = [];
    this.history = [];
    this.alerts = [];
    this.trends = [];
    this.startTime = Date.now();
    this.lastSnapshotTime = this.startTime;
  }

  public updateConfig(newConfig: Partial<PerfConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

