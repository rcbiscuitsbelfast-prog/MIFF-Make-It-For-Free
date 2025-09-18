// Export the enhanced manager as the main manager
export { EnhancedStatsManager as StatsManager } from './EnhancedStatsManager';

// Re-export all types and interfaces for compatibility
export type {
  StatConfig,
  Stat,
  StatModifier,
  ModifierCondition,
  StatDependency,
  EntityStats,
  StatProgression,
  StatsAnalytics,
  StatCalculationResult,
  StatsOutput
} from './EnhancedStatsManager';