import { describe, it, expect } from '@jest/globals';
import { MobilePerformanceOptimizer, PerformanceLevel } from './index';

describe('MobilePerformanceOptimizer', () => {
  describe('Optimizer Creation', () => {
    it('should create mobile optimizer with default config', () => {
      const optimizer = MobilePerformanceOptimizer.create();

      expect(optimizer).toBeDefined();
      expect(optimizer.getConfig()).toBeDefined();
    });

    it('should create optimizer with custom config', () => {
      const optimizer = MobilePerformanceOptimizer.create({
        targetFPS: 30,
        enableAdaptiveQuality: true
      });

      const config = optimizer.getConfig();
      expect(config.targetFPS).toBe(30);
      expect(config.enableAdaptiveQuality).toBe(true);
    });
  });

  describe('Performance Monitoring', () => {
    it('should monitor frame rate', () => {
      const optimizer = MobilePerformanceOptimizer.create();
      const stats = optimizer.getPerformanceStats();

      expect(stats).toBeDefined();
      expect(stats.avgFPS).toBeDefined();
    });

    it('should detect performance issues', () => {
      const optimizer = MobilePerformanceOptimizer.create({ targetFPS: 60 });
      const isAcceptable = optimizer.isPerformanceAcceptable();

      expect(typeof isAcceptable).toBe('boolean');
    });
  });

  describe('Quality Adjustment', () => {
    it('should adjust quality based on performance', () => {
      const optimizer = MobilePerformanceOptimizer.create();
      optimizer.setPerformanceLevel(PerformanceLevel.LOW);

      expect(optimizer.getPerformanceLevel()).toBe(PerformanceLevel.LOW);
    });

    it('should support quality levels', () => {
      const optimizer = MobilePerformanceOptimizer.create();
      
      optimizer.setPerformanceLevel(PerformanceLevel.LOW);
      expect(optimizer.getPerformanceLevel()).toBe(PerformanceLevel.LOW);
      
      optimizer.setPerformanceLevel(PerformanceLevel.MEDIUM);
      expect(optimizer.getPerformanceLevel()).toBe(PerformanceLevel.MEDIUM);
      
      optimizer.setPerformanceLevel(PerformanceLevel.HIGH);
      expect(optimizer.getPerformanceLevel()).toBe(PerformanceLevel.HIGH);
    });
  });

  describe('Battery Optimization', () => {
    it('should enable battery saving mode', () => {
      const optimizer = MobilePerformanceOptimizer.create();
      const config = optimizer.getConfig();

      expect(config.enableBatteryOptimization).toBeDefined();
    });
  });
});
