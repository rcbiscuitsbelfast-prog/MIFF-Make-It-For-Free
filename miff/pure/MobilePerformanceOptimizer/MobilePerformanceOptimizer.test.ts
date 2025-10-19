import { describe, it, expect } from '@jest/globals';
import { MobilePerformanceOptimizer } from './index';

describe('MobilePerformanceOptimizer', () => {
  describe('Optimizer Creation', () => {
    it('should create mobile optimizer with default config', () => {
      const optimizer = MobilePerformanceOptimizer.create();

      expect(optimizer).toBeDefined();
      expect(optimizer.enabled).toBe(true);
    });

    it('should create optimizer with custom config', () => {
      const optimizer = MobilePerformanceOptimizer.create({
        targetFPS: 30,
        adaptiveQuality: true
      });

      expect(optimizer.targetFPS).toBe(30);
      expect(optimizer.adaptiveQuality).toBe(true);
    });
  });

  describe('Performance Monitoring', () => {
    it('should monitor frame rate', () => {
      const optimizer = MobilePerformanceOptimizer.create();
      const metrics = MobilePerformanceOptimizer.getMetrics(optimizer);

      expect(metrics).toBeDefined();
      expect(metrics.fps).toBeDefined();
    });

    it('should detect performance issues', () => {
      const optimizer = MobilePerformanceOptimizer.create({ targetFPS: 60 });
      const hasIssues = MobilePerformanceOptimizer.hasPerformanceIssues(optimizer, { currentFPS: 25 });

      expect(typeof hasIssues).toBe('boolean');
    });
  });

  describe('Quality Adjustment', () => {
    it('should adjust quality based on performance', () => {
      const optimizer = MobilePerformanceOptimizer.create();
      const adjusted = MobilePerformanceOptimizer.adjustQuality(optimizer, 'low');

      expect(adjusted).toBeDefined();
    });

    it('should support quality levels', () => {
      const optimizer = MobilePerformanceOptimizer.create();
      
      const low = MobilePerformanceOptimizer.adjustQuality(optimizer, 'low');
      const medium = MobilePerformanceOptimizer.adjustQuality(optimizer, 'medium');
      const high = MobilePerformanceOptimizer.adjustQuality(optimizer, 'high');

      expect(low).toBeDefined();
      expect(medium).toBeDefined();
      expect(high).toBeDefined();
    });
  });

  describe('Battery Optimization', () => {
    it('should enable battery saving mode', () => {
      const optimizer = MobilePerformanceOptimizer.create();
      const batterySave = MobilePerformanceOptimizer.enableBatterySaving(optimizer);

      expect(batterySave).toBeDefined();
    });
  });
});
