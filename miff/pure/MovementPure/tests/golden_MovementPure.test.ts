/**
 * Golden Tests for MovementPure
 * 
 * Tests movement management, pattern assignment, simulation,
 * and export functionality with comprehensive scenarios.
 * 
 * @module MovementPure/tests/golden_MovementPure.test
 * @version 1.0.0
 * @license MIT
 */

import { MovementManager, MovementPattern, Vector2 } from '../Manager';

describe('MovementPure Golden Tests', () => {
  let manager: MovementManager;

  beforeEach(() => {
    manager = new MovementManager();
  });

  describe('Entity Management', () => {
    test('should create and manage movement entities', () => {
      const position: Vector2 = { x: 0, y: 0 };
      const pattern: MovementPattern = {
        id: 'test_pattern',
        type: 'idle',
        speed: 1.0,
        acceleration: 1.0,
        maxSpeed: 2.0,
        behavior: {
          aggression: 50,
          curiosity: 50,
          fear: 50,
          loyalty: 50,
          reactionTime: 100,
          memory: 50
        }
      };

      const createResult = manager.createEntity('test_entity', position, pattern);
      expect(createResult.status).toBe('ok');
      expect(createResult.result?.id).toBe('test_entity');
      expect(createResult.result?.position).toEqual(position);

      const getResult = manager.getEntity('test_entity');
      expect(getResult.status).toBe('ok');
      expect(getResult.result?.pattern.type).toBe('idle');
    });

    test('should handle pattern updates', () => {
      const position: Vector2 = { x: 0, y: 0 };
      const pattern: MovementPattern = {
        id: 'idle_pattern',
        type: 'idle',
        speed: 1.0,
        acceleration: 1.0,
        maxSpeed: 2.0,
        behavior: {
          aggression: 50,
          curiosity: 50,
          fear: 50,
          loyalty: 50,
          reactionTime: 100,
          memory: 50
        }
      };

      manager.createEntity('test_entity', position, pattern);
      
      const updateResult = manager.updatePattern('test_entity', { 
        type: 'patrol',
        speed: 2.0,
        waypoints: [{ x: 0, y: 0 }, { x: 100, y: 0 }]
      });
      expect(updateResult.status).toBe('ok');
      expect(updateResult.result?.pattern.type).toBe('patrol');
      expect(updateResult.result?.pattern.speed).toBe(2.0);
    });

    test('should handle follow target assignment', () => {
      const position: Vector2 = { x: 0, y: 0 };
      const pattern: MovementPattern = {
        id: 'idle_pattern',
        type: 'idle',
        speed: 1.0,
        acceleration: 1.0,
        maxSpeed: 2.0,
        behavior: {
          aggression: 50,
          curiosity: 50,
          fear: 50,
          loyalty: 50,
          reactionTime: 100,
          memory: 50
        }
      };

      manager.createEntity('follower', position, pattern);
      manager.createEntity('target', { x: 100, y: 100 }, pattern);

      const followResult = manager.setFollowTarget('follower', 'target');
      expect(followResult.status).toBe('ok');
      expect(followResult.result?.pattern.type).toBe('follow');
      expect(followResult.result?.pattern.targetId).toBe('target');
    });

    test('should handle waypoint assignment', () => {
      const position: Vector2 = { x: 0, y: 0 };
      const pattern: MovementPattern = {
        id: 'idle_pattern',
        type: 'idle',
        speed: 1.0,
        acceleration: 1.0,
        maxSpeed: 2.0,
        behavior: {
          aggression: 50,
          curiosity: 50,
          fear: 50,
          loyalty: 50,
          reactionTime: 100,
          memory: 50
        }
      };

      manager.createEntity('patrol_entity', position, pattern);
      
      const waypoints: Vector2[] = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 }
      ];

      const waypointResult = manager.setWaypoints('patrol_entity', waypoints);
      expect(waypointResult.status).toBe('ok');
      expect(waypointResult.result?.pattern.type).toBe('patrol');
      expect(waypointResult.result?.pattern.waypoints).toEqual(waypoints);
    });
  });

  describe('Movement Simulation', () => {
    test('should simulate movement for all entities', () => {
      const position: Vector2 = { x: 0, y: 0 };
      const pattern: MovementPattern = {
        id: 'moving_pattern',
        type: 'wander',
        speed: 2.0,
        acceleration: 1.0,
        maxSpeed: 4.0,
        behavior: {
          aggression: 30,
          curiosity: 70,
          fear: 20,
          loyalty: 40,
          reactionTime: 150,
          memory: 60
        }
      };

      manager.createEntity('wanderer', position, pattern);
      
      const simulateResult = manager.simulateTick(0.016); // 60fps
      expect(simulateResult.status).toBe('ok');
      expect(Array.isArray(simulateResult.result)).toBe(true);
      expect(simulateResult.result?.length).toBe(1);
    });

    test('should handle different movement patterns', () => {
      const entities = [
        {
          id: 'idle_entity',
          position: { x: 0, y: 0 },
          pattern: {
            id: 'idle_pattern',
            type: 'idle' as any,
            speed: 0,
            acceleration: 1.0,
            maxSpeed: 1.0,
            behavior: {
              aggression: 10,
              curiosity: 20,
              fear: 30,
              loyalty: 80,
              reactionTime: 200,
              memory: 40
            }
          }
        },
        {
          id: 'patrol_entity',
          position: { x: 0, y: 0 },
          pattern: {
            id: 'patrol_pattern',
            type: 'patrol' as any,
            speed: 1.5,
            acceleration: 1.0,
            maxSpeed: 3.0,
            waypoints: [
              { x: 0, y: 0 },
              { x: 50, y: 0 },
              { x: 50, y: 50 }
            ],
            behavior: {
              aggression: 40,
              curiosity: 30,
              fear: 20,
              loyalty: 90,
              reactionTime: 180,
              memory: 70
            }
          }
        }
      ];

      entities.forEach(entity => {
        manager.createEntity(entity.id, entity.position, entity.pattern);
      });

      const simulateResult = manager.simulateTick(0.016);
      expect(simulateResult.status).toBe('ok');
      expect(simulateResult.result?.length).toBe(2);
    });
  });

  describe('Entity Filtering and Queries', () => {
    test('should filter entities by pattern type', () => {
      const entities = [
        {
          id: 'idle_entity',
          position: { x: 0, y: 0 },
          pattern: {
            id: 'idle_pattern',
            type: 'idle' as any,
            speed: 0,
            acceleration: 1.0,
            maxSpeed: 1.0,
            behavior: {
              aggression: 10,
              curiosity: 20,
              fear: 30,
              loyalty: 80,
              reactionTime: 200,
              memory: 40
            }
          }
        },
        {
          id: 'patrol_entity',
          position: { x: 0, y: 0 },
          pattern: {
            id: 'patrol_pattern',
            type: 'patrol' as any,
            speed: 1.5,
            acceleration: 1.0,
            maxSpeed: 3.0,
            behavior: {
              aggression: 40,
              curiosity: 30,
              fear: 20,
              loyalty: 90,
              reactionTime: 180,
              memory: 70
            }
          }
        }
      ];

      entities.forEach(entity => {
        manager.createEntity(entity.id, entity.position, entity.pattern);
      });

      const filterResult = manager.listEntities({ patternType: 'idle' });
      expect(filterResult.status).toBe('ok');
      expect(filterResult.result?.length).toBe(1);
      expect(filterResult.result?.[0!].id).toBe('idle_entity');
    });

    test('should filter entities by speed range', () => {
      const entities = [
        {
          id: 'slow_entity',
          position: { x: 0, y: 0 },
          pattern: {
            id: 'slow_pattern',
            type: 'wander' as any,
            speed: 0.5,
            acceleration: 1.0,
            maxSpeed: 1.0,
            behavior: {
              aggression: 20,
              curiosity: 60,
              fear: 40,
              loyalty: 50,
              reactionTime: 300,
              memory: 50
            }
          }
        },
        {
          id: 'fast_entity',
          position: { x: 0, y: 0 },
          pattern: {
            id: 'fast_pattern',
            type: 'wander' as any,
            speed: 3.0,
            acceleration: 2.0,
            maxSpeed: 5.0,
            behavior: {
              aggression: 60,
              curiosity: 40,
              fear: 20,
              loyalty: 30,
              reactionTime: 100,
              memory: 80
            }
          }
        }
      ];

      entities.forEach(entity => {
        manager.createEntity(entity.id, entity.position, entity.pattern);
      });

      // Simulate movement to get entities moving (need multiple ticks to reach target speed)
      for (let i = 0; i < 20; i++) {
        manager.simulateTick(0.016);
      }

      const filterResult = manager.listEntities({ minSpeed: 1.0, maxSpeed: 4.0 });
      expect(filterResult.status).toBe('ok');
      expect(filterResult.result?.length).toBe(1);
      expect(filterResult.result?.[0!].id).toBe('fast_entity');
    });
  });

  describe('Movement Statistics', () => {
    test('should provide movement statistics', () => {
      const entities = [
        {
          id: 'entity_1',
          position: { x: 0, y: 0 },
          pattern: {
            id: 'pattern_1',
            type: 'idle' as any,
            speed: 0,
            acceleration: 1.0,
            maxSpeed: 1.0,
            behavior: {
              aggression: 10,
              curiosity: 20,
              fear: 30,
              loyalty: 80,
              reactionTime: 200,
              memory: 40
            }
          }
        },
        {
          id: 'entity_2',
          position: { x: 0, y: 0 },
          pattern: {
            id: 'pattern_2',
            type: 'wander' as any,
            speed: 2.0,
            acceleration: 1.0,
            maxSpeed: 3.0,
            behavior: {
              aggression: 30,
              curiosity: 70,
              fear: 20,
              loyalty: 40,
              reactionTime: 150,
              memory: 60
            }
          }
        }
      ];

      entities.forEach(entity => {
        manager.createEntity(entity.id, entity.position, entity.pattern);
      });

      const statsResult = manager.getMovementStats();
      expect(statsResult.status).toBe('ok');
      expect(statsResult.result?.totalEntities).toBe(2);
      expect(statsResult.result?.patternDistribution).toBeDefined();
    });
  });

  describe('Obstacle Management', () => {
    test('should add obstacles', () => {
      const obstacleResult = manager.addObstacle({ x: 50, y: 50 });
      expect(obstacleResult.status).toBe('ok');
      expect(obstacleResult.result?.position).toEqual({ x: 50, y: 50 });
    });
  });

  describe('Export Functionality', () => {
    test('should export movement data in different formats', () => {
      const position: Vector2 = { x: 0, y: 0 };
      const pattern: MovementPattern = {
        id: 'export_pattern',
        type: 'wander',
        speed: 1.0,
        acceleration: 1.0,
        maxSpeed: 2.0,
        behavior: {
          aggression: 50,
          curiosity: 50,
          fear: 50,
          loyalty: 50,
          reactionTime: 100,
          memory: 50
        }
      };

      manager.createEntity('export_entity', position, pattern);

      // JSON export
      const jsonResult = manager.exportMovement('json');
      expect(jsonResult.status).toBe('ok');
      expect(jsonResult.result?.total).toBe(1);

      // Manifest export
      const manifestResult = manager.exportMovement('manifest');
      expect(manifestResult.status).toBe('ok');
      expect(manifestResult.result?.schema).toBe('miff.movement.export.v1');

      // Summary export
      const summaryResult = manager.exportMovement('summary');
      expect(summaryResult.status).toBe('ok');
      expect(summaryResult.result?.summary).toBeDefined();

      // Events export
      const eventsResult = manager.exportMovement('events');
      expect(eventsResult.status).toBe('ok');
      expect(eventsResult.result?.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid entity operations', () => {
      const getResult = manager.getEntity('nonexistent');
      expect(getResult.status).toBe('error');
      expect(getResult.issues).toContain('Entity nonexistent not found');

      const updateResult = manager.updatePattern('nonexistent', { type: 'idle' });
      expect(updateResult.status).toBe('error');
      expect(updateResult.issues).toContain('Entity nonexistent not found');
    });

    test('should handle duplicate entity creation', () => {
      const position: Vector2 = { x: 0, y: 0 };
      const pattern: MovementPattern = {
        id: 'test_pattern',
        type: 'idle',
        speed: 1.0,
        acceleration: 1.0,
        maxSpeed: 2.0,
        behavior: {
          aggression: 50,
          curiosity: 50,
          fear: 50,
          loyalty: 50,
          reactionTime: 100,
          memory: 50
        }
      };

      manager.createEntity('duplicate_test', position, pattern);
      const duplicateResult = manager.createEntity('duplicate_test', position, pattern);
      expect(duplicateResult.status).toBe('error');
      expect(duplicateResult.issues).toContain('Entity duplicate_test already exists');
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete movement workflow', () => {
      // Create entities
      const entities = [
        {
          id: 'patrol_guard',
          position: { x: 0, y: 0 },
          pattern: {
            id: 'patrol_pattern',
            type: 'patrol' as any,
            speed: 2.0,
            acceleration: 1.0,
            maxSpeed: 4.0,
            waypoints: [
              { x: 0, y: 0 },
              { x: 100, y: 0 },
              { x: 100, y: 100 },
              { x: 0, y: 100 }
            ],
            behavior: {
              aggression: 70,
              curiosity: 30,
              fear: 20,
              loyalty: 80,
              reactionTime: 200,
              memory: 60
            }
          }
        },
        {
          id: 'follower',
          position: { x: 50, y: 50 },
          pattern: {
            id: 'follow_pattern',
            type: 'follow' as any,
            speed: 1.5,
            acceleration: 1.0,
            maxSpeed: 3.0,
            targetId: 'patrol_guard',
            range: 50,
            behavior: {
              aggression: 20,
              curiosity: 80,
              fear: 10,
              loyalty: 90,
              reactionTime: 150,
              memory: 70
            }
          }
        }
      ];

      entities.forEach(entity => {
        const createResult = manager.createEntity(entity.id, entity.position, entity.pattern);
        expect(createResult.status).toBe('ok');
      });

      // Simulate movement
      const simulateResult = manager.simulateTick(1.0);
      expect(simulateResult.status).toBe('ok');

      // Get statistics
      const statsResult = manager.getMovementStats();
      expect(statsResult.status).toBe('ok');

      // Export data
      const exportResult = manager.exportMovement('manifest');
      expect(exportResult.status).toBe('ok');

      // List entities
      const listResult = manager.listEntities();
      expect(listResult.status).toBe('ok');
      expect(listResult.result?.length).toBe(2);
    });
  });
});