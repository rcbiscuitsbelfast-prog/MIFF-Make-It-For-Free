/**
 * Production Monitoring - Real-time production monitoring and alerting
 * Provides comprehensive monitoring, metrics collection, and alerting
 */

export * from './ProductionMonitor';

// Re-export main classes
export { ProductionMonitor, productionMonitor } from './ProductionMonitor';

// Export types
export type {
  MonitoringConfig,
  AlertingConfig,
  AlertChannel,
  AlertThresholds,
  MetricsConfig,
  LoggingConfig,
  MonitoringMetrics,
  SystemMetrics,
  ApplicationMetrics,
  PerformanceMetrics,
  ErrorMetrics,
  ErrorEntry
} from './ProductionMonitor';