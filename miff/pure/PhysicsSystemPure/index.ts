// PhysicsSystemPure - Advanced 2D Physics Simulation
// Engine-agnostic physics with forces, constraints, and collision integration

export * from './Manager';
export { PhysicsManager as default } from './Manager';

// Re-export key types for convenience
export type {
  Vector2,
  Body,
  Force,
  Constraint,
  PhysicsWorld,
  ListOutput,
  StepOutput,
  DumpOutput,
  CreateOutput,
  AddForceOutput,
  AddConstraintOutput,
  RemoveForceOutput,
  RemoveConstraintOutput,
  AnalyticsOutput,
  ExportOutput
} from './Manager';

// Module metadata
/* export const MODULE_INFO = {
  name: 'PhysicsSystemPure',
  version: '2.0.0',
  description: 'Advanced 2D physics simulation with forces, constraints, and collision integration',
  features: [
    'Rigid body dynamics',
    'Force application (global and per-body)',
    'Constraint system (springs, distance, pins)',
    'Energy and velocity analytics',
    'Multiple export formats',
    'Static and dynamic bodies',
    'Collision shapes (circle, box)',
    'Friction and restitution',
    'Velocity clamping for stability'
  ],
  exports: ['json', 'manifest', 'summary'],
  cliCommands: [
    'list', 'create', 'step', 'dump', 'addForce', 'addConstraint', 
    'removeForce', 'removeConstraint', 'analytics', 'export', 'demo', 'help'
  ]
};*/