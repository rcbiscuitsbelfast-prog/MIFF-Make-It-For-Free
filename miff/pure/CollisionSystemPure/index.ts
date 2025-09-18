// CollisionSystemPure - Advanced 2D Collision Detection
// Engine-agnostic collision detection with spatial partitioning and advanced features

export * from './Manager';
export { CollisionManager as default } from './Manager';

// Re-export key types for convenience
export type {
  Vec2,
  AABB,
  Circle,
  CollisionShape,
  Collision,
  Trigger,
  SpatialGrid,
  ListOutput,
  CheckOutput,
  ResolveOutput,
  DumpOutput,
  UpsertOutput,
  RemoveOutput,
  AnalyticsOutput,
  ExportOutput,
  ClearOutput
} from './Manager';

// Module metadata
export const MODULE_INFO = {
  name: 'CollisionSystemPure',
  version: '2.0.0',
  description: 'Advanced 2D collision detection with spatial partitioning, layer filtering, and shape support',
  features: [
    'Spatial partitioning for O(1) performance in sparse scenes',
    'AABB and Circle collision shapes',
    'Layer/mask collision filtering',
    'Tag-based filtering system',
    'Trigger vs solid collision detection',
    'Collision normal and depth calculation',
    'Physics-based collision resolution',
    'Broad-phase and narrow-phase optimization',
    'Real-time collision analytics',
    'Multiple export formats'
  ],
  shapeTypes: ['AABB', 'Circle'],
  exports: ['json', 'manifest', 'summary'],
  cliCommands: [
    'list', 'upsert', 'remove', 'clear', 'check', 'resolve', 
    'dump', 'analytics', 'export', 'demo', 'help'
  ],
  performance: {
    broadPhase: 'O(1) with spatial partitioning',
    narrowPhase: 'O(n) where n = shapes per cell',
    memoryUsage: 'Efficient Map-based storage with spatial grid',
    collisionTypes: ['AABB-AABB', 'Circle-Circle', 'AABB-Circle']
  }
};