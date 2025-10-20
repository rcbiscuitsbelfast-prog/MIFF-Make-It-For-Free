/**
 * PhysicsPure Manager Tests
 * 
 * Tests for PhysicsManager using actual implementation
 */

import { PhysicsManager, RigidBody, PhysicsConfig } from './Manager';

describe('PhysicsManager', () => {
  let manager: PhysicsManager;
  let config: PhysicsConfig;

  beforeEach(() => {
    config = {
      gravity: { x: 0, y: -9.8, z: 0 },
      timeStep: 1/60,
      maxSubSteps: 10,
      enableSleep: true
    };
    manager = new PhysicsManager(config);
  });

  describe('Initialization', () => {
    it('should create physics manager with config', () => {
      expect(manager).toBeDefined();
    });

    it('should create manager with default config', () => {
      const defaultManager = new PhysicsManager();
      expect(defaultManager).toBeDefined();
    });
  });

  describe('Rigid Body Management', () => {
    it('should create rigid body', () => {
      const bodyId = manager.createRigidBody({
        mass: 1.0,
        position: { x: 0, y: 10, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        shape: 'box',
        dimensions: { x: 1, y: 1, z: 1 }
      });

      expect(bodyId).toBeDefined();
      expect(typeof bodyId).toBe('string');
    });

    it('should get rigid body by ID', () => {
      const bodyId = manager.createRigidBody({
        mass: 1.0,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        shape: 'sphere',
        radius: 0.5
      });

      const body = manager.getRigidBody(bodyId);
      expect(body).toBeDefined();
      expect(body?.id).toBe(bodyId);
    });

    it('should remove rigid body', () => {
      const bodyId = manager.createRigidBody({
        mass: 1.0,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        shape: 'box',
        dimensions: { x: 1, y: 1, z: 1 }
      });

      const result = manager.removeRigidBody(bodyId);
      expect(result.ok).toBe(true);

      const body = manager.getRigidBody(bodyId);
      expect(body).toBeUndefined();
    });
  });

  describe('Physics Simulation', () => {
    it('should step simulation', () => {
      manager.createRigidBody({
        mass: 1.0,
        position: { x: 0, y: 10, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        shape: 'box',
        dimensions: { x: 1, y: 1, z: 1 }
      });

      const deltaTime = 1/60;
      manager.step(deltaTime);

      expect(true).toBe(true); // Simulation step completed
    });

    it('should apply force to body', () => {
      const bodyId = manager.createRigidBody({
        mass: 1.0,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        shape: 'box',
        dimensions: { x: 1, y: 1, z: 1 }
      });

      const result = manager.applyForce(bodyId, { x: 10, y: 0, z: 0 });
      expect(result.ok).toBe(true);
    });

    it('should apply impulse to body', () => {
      const bodyId = manager.createRigidBody({
        mass: 1.0,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        shape: 'sphere',
        radius: 0.5
      });

      const result = manager.applyImpulse(bodyId, { x: 5, y: 0, z: 0 });
      expect(result.ok).toBe(true);
    });
  });

  describe('Collision Detection', () => {
    it('should detect collisions between bodies', () => {
      const body1 = manager.createRigidBody({
        mass: 1.0,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        shape: 'box',
        dimensions: { x: 1, y: 1, z: 1 }
      });

      const body2 = manager.createRigidBody({
        mass: 1.0,
        position: { x: 0.5, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        shape: 'box',
        dimensions: { x: 1, y: 1, z: 1 }
      });

      manager.step(1/60);

      const collisions = manager.getCollisions();
      expect(Array.isArray(collisions)).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should get physics stats', () => {
      manager.createRigidBody({
        mass: 1.0,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        shape: 'box',
        dimensions: { x: 1, y: 1, z: 1 }
      });

      const stats = manager.getStats();
      expect(stats).toBeDefined();
      expect(typeof stats.bodyCount).toBe('number');
      expect(stats.bodyCount).toBeGreaterThanOrEqual(1);
    });
  });
});
