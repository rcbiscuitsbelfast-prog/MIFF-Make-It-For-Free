import { describe, it, expect } from '@jest/globals';
import { MobilePerformanceOptimizer, PerformanceLevel } from './index';

// Mock browser APIs for Node.js environment
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    deviceMemory: 4,
    hardwareConcurrency: 6
  },
  writable: true
});

Object.defineProperty(global, 'document', {
  value: {
    createElement: () => ({
      getContext: () => null
    })
  },
  writable: true
});

Object.defineProperty(global, 'window', {
  value: {},
  writable: true
});

describe('MobilePerformanceOptimizer Simple Tests', () => {
  describe('Basic Functionality', () => {
    it('should create instance with static create method', () => {
      const optimizer = MobilePerformanceOptimizer.create();
      expect(optimizer).toBeDefined();
    });

    it('should get configuration', () => {
      const optimizer = MobilePerformanceOptimizer.create();
      const config = optimizer.getConfig();
      expect(config).toBeDefined();
      expect(config.targetFPS).toBeDefined();
    });

    it('should get device capabilities', () => {
      const optimizer = MobilePerformanceOptimizer.create();
      const capabilities = optimizer.getDeviceCapabilities();
      expect(capabilities).toBeDefined();
    });

    it('should get performance level', () => {
      const optimizer = MobilePerformanceOptimizer.create();
      const level = optimizer.getPerformanceLevel();
      expect(level).toBeDefined();
    });

    it('should set performance level', () => {
      const optimizer = MobilePerformanceOptimizer.create();
      optimizer.setPerformanceLevel(PerformanceLevel.LOW);
      expect(optimizer.getPerformanceLevel()).toBe(PerformanceLevel.LOW);
    });

    it('should get performance stats', () => {
      const optimizer = MobilePerformanceOptimizer.create();
      const stats = optimizer.getPerformanceStats();
      expect(stats).toBeDefined();
      expect(typeof stats.avgFPS).toBe('number');
    });

    it('should check performance acceptability', () => {
      const optimizer = MobilePerformanceOptimizer.create();
      const isAcceptable = optimizer.isPerformanceAcceptable();
      expect(typeof isAcceptable).toBe('boolean');
    });

    it('should get optimization recommendations', () => {
      const optimizer = MobilePerformanceOptimizer.create();
      const recommendations = optimizer.getOptimizationRecommendations();
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should reset performance data', () => {
      const optimizer = MobilePerformanceOptimizer.create();
      expect(() => optimizer.reset()).not.toThrow();
    });
  });
});