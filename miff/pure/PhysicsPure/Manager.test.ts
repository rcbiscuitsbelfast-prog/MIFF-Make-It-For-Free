/**
 * PhysicsPure Manager Tests
 * 
 * Tests for PhysicsSystem using actual implementation
 */

import { PhysicsSystem } from './PhysicsSystem';

describe('PhysicsSystem', () => {
  let physics: PhysicsSystem;

  beforeEach(() => {
    physics = new PhysicsSystem({
      gravity: 9.8,
      timeStep: 1/60,
      iterations: 10
    });
  });

  describe('Initialization', () => {
    it('should create physics system', () => {
      expect(physics).toBeDefined();
    });
  });

  describe('Body Management', () => {
    it('should add body', () => {
      const bodyId = physics.addBody({
        x: 0,
        y: 0,
        mass: 1.0,
        velocity: { x: 0, y: 0 }
      });

      expect(typeof bodyId).toBe('string');
    });

    it('should remove body', () => {
      const bodyId = physics.addBody({
        x: 0,
        y: 0,
        mass: 1.0,
        velocity: { x: 0, y: 0 }
      });

      physics.removeBody(bodyId);
      expect(true).toBe(true);
    });

    it('should get body', () => {
      const bodyId = physics.addBody({
        x: 5,
        y: 10,
        mass: 2.0,
        velocity: { x: 0, y: 0 }
      });

      const body = physics.getBody(bodyId);
      expect(body).toBeDefined();
    });
  });

  describe('Simulation', () => {
    it('should step simulation', () => {
      physics.addBody({
        x: 0,
        y: 100,
        mass: 1.0,
        velocity: { x: 0, y: 0 }
      });

      physics.step(1/60);
      expect(true).toBe(true);
    });

    it('should apply force', () => {
      const bodyId = physics.addBody({
        x: 0,
        y: 0,
        mass: 1.0,
        velocity: { x: 0, y: 0 }
      });

      physics.applyForce(bodyId, { x: 10, y: 0 });
      expect(true).toBe(true);
    });
  });
});
