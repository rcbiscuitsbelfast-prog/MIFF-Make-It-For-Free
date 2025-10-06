// Re-export from Manager
export * from './Manager';

// Additional named exports for compatibility
export type {
  DrivingSystemPure,
  VehicleDefinition,
  VehicleInstance,
  VehicleAbility,
  VehicleEffect,
  Upgrade,
  DrivingSession,
  DrivingPenalty,
  TrackDefinition,
  Checkpoint,
  Obstacle,
  PowerUp,
  WeatherZone,
  MovementPattern,
  DrivingConfig,
  DrivingStats,
  Vector3
} from './Manager';

export { DrivingSystemManager as default } from './Manager';
