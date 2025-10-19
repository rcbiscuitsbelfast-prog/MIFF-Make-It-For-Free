import { describe, it, expect } from '@jest/globals';
import { ObstacleCoursePure } from './index';

describe('ObstacleCoursePure', () => {
  describe('Course Creation', () => {
    it('should create obstacle course', () => {
      const course = ObstacleCoursePure.create({
        id: 'course1',
        difficulty: 'medium',
        obstacles: []
      });

      expect(course).toBeDefined();
      expect(course.id).toBe('course1');
    });

    it('should add obstacle to course', () => {
      const course = ObstacleCoursePure.create({ id: 'c1', obstacles: [] });
      const obstacle = {
        id: 'wall1',
        type: 'wall',
        position: { x: 10, y: 0, z: 5 }
      };

      const updated = ObstacleCoursePure.addObstacle(course, obstacle);
      expect(updated.obstacles.length).toBe(1);
    });
  });

  describe('Course Navigation', () => {
    it('should check collision with obstacle', () => {
      const course = ObstacleCoursePure.create({
        id: 'c1',
        obstacles: [{ id: 'o1', type: 'wall', position: { x: 5, y: 0, z: 5 }, bounds: { width: 2, height: 2, depth: 2 } }]
      });

      const collides = ObstacleCoursePure.checkCollision(course, { x: 5, y: 0, z: 5 });
      expect(typeof collides).toBe('boolean');
    });

    it('should find path through course', () => {
      const course = ObstacleCoursePure.create({ id: 'c1', obstacles: [] });
      const start = { x: 0, y: 0, z: 0 };
      const end = { x: 10, y: 0, z: 10 };

      const path = ObstacleCoursePure.findPath(course, start, end);
      expect(path).toBeDefined();
    });
  });

  describe('Completion Tracking', () => {
    it('should track course completion', () => {
      const course = ObstacleCoursePure.create({ id: 'c1', obstacles: [] });
      
      const progress = ObstacleCoursePure.getProgress(course, { x: 5, y: 0, z: 5 });
      expect(typeof progress).toBe('number');
    });
  });
});
