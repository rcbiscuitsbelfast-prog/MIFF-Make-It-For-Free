import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { AnimationSystemManager } from './Manager';

describe('AnimationSystemManager', () => {
  let manager: AnimationSystemManager;

  beforeEach(async () => {
    manager = new AnimationSystemManager({
      enableAnimationCreation: true,
      enableTimelineControl: true,
      enableKeyframeControl: true,
      enableAnimationBlending: true,
      enableTransitions: true,
      enablePerformanceOptimization: true,
      enableCrossPlatformSupport: true,
      enableMonitoring: true,
      maxAnimations: 100,
      maxKeyframes: 1000,
      enableCloudSync: false,
      enableBackup: false,
      enableVersioning: true
    });
    
    await manager.initialize();
  });

  afterEach(async () => {
    if (manager) {
      await manager.destroy();
    }
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      expect(manager).toBeDefined();
      expect(manager.getAllAnimations).toBeDefined();
      expect(manager.getStatistics).toBeDefined();
    });

    it('should have default configuration', () => {
      const stats = manager.getStatistics();
      expect(stats).toBeDefined();
      expect(typeof stats.totalAnimations).toBe('number');
      expect(typeof stats.activeAnimations).toBe('number');
    });
  });

  describe('Animation Management', () => {
    it('should create animations', async () => {
      const animationData = {
        name: 'Test Animation',
        type: 'position' as const,
        status: 'idle' as const,
        timeline: {
          duration: 1000,
          startTime: 0,
          endTime: 1000,
          loop: false,
          pingPong: false,
          speed: 1.0,
          currentTime: 0
        },
        keyframes: [],
        blending: {
          enabled: false,
          mode: 'additive' as const,
          weight: 1.0,
          duration: 0,
          curve: 'linear' as const
        },
        transitions: {
          enabled: false,
          duration: 0,
          easing: 'linear' as const,
          delay: 0,
          properties: []
        },
        metadata: { test: true },
      };

      const animation = await manager.createAnimation(animationData);
      expect(animation).toBeDefined();
      expect(animation.id).toBeDefined();
      expect(animation.name).toBe('Test Animation');
      expect(animation.type).toBe('position');
      expect(animation.status).toBe('idle');
    });

    it('should retrieve animations by ID', async () => {
      const animationData = {
        name: 'Test Animation',
        type: 'position' as const,
        status: 'idle' as const,
        timeline: {
          duration: 1000,
          startTime: 0,
          endTime: 1000,
          loop: false,
          pingPong: false,
          speed: 1.0,
          currentTime: 0
        },
        keyframes: [],
        blending: {
          enabled: false,
          mode: 'additive' as const,
          weight: 1.0,
          duration: 0,
          curve: 'linear' as const
        },
        transitions: {
          enabled: false,
          duration: 0,
          easing: 'linear' as const,
          delay: 0,
          properties: []
        },
        metadata: {},
      };

      const createdAnimation = await manager.createAnimation(animationData);
      const allAnimations = manager.getAllAnimations();
      const retrievedAnimation = allAnimations.find(anim => anim.id === createdAnimation.id);
      
      expect(retrievedAnimation).toBeDefined();
      expect(retrievedAnimation?.id).toBe(createdAnimation.id);
      expect(retrievedAnimation?.name).toBe('Test Animation');
    });

    it('should get all animations', async () => {
      const animationData = {
        name: 'Test Animation',
        type: 'position' as const,
        status: 'idle' as const,
        timeline: {
          duration: 1000,
          startTime: 0,
          endTime: 1000,
          loop: false,
          pingPong: false,
          speed: 1.0,
          currentTime: 0
        },
        keyframes: [],
        blending: {
          enabled: false,
          mode: 'additive' as const,
          weight: 1.0,
          duration: 0,
          curve: 'linear' as const
        },
        transitions: {
          enabled: false,
          duration: 0,
          easing: 'linear' as const,
          delay: 0,
          properties: []
        },
        metadata: {},
      };

      await manager.createAnimation(animationData);
      const allAnimations = manager.getAllAnimations();
      
      expect(Array.isArray(allAnimations)).toBe(true);
      expect(allAnimations.length).toBeGreaterThan(0);
    });

    it('should update animations', async () => {
      const animationData = {
        name: 'Test Animation',
        type: 'position' as const,
        status: 'idle' as const,
        timeline: {
          duration: 1000,
          startTime: 0,
          endTime: 1000,
          loop: false,
          pingPong: false,
          speed: 1.0,
          currentTime: 0
        },
        keyframes: [],
        blending: {
          enabled: false,
          mode: 'additive' as const,
          weight: 1.0,
          duration: 0,
          curve: 'linear' as const
        },
        transitions: {
          enabled: false,
          duration: 0,
          easing: 'linear' as const,
          delay: 0,
          properties: []
        },
        metadata: {},
      };

      const createdAnimation = await manager.createAnimation(animationData);
      const updatedAnimation = await manager.updateAnimation(createdAnimation.id!, {
        name: 'Updated Animation',
        status: 'playing' as const
      });
      
      expect(updatedAnimation).toBeDefined();
      expect(updatedAnimation?.name).toBe('Updated Animation');
      expect(updatedAnimation?.status).toBe('playing');
    });

    it('should delete animations', async () => {
      const animationData = {
        name: 'Test Animation',
        type: 'position' as const,
        status: 'idle' as const,
        timeline: {
          duration: 1000,
          startTime: 0,
          endTime: 1000,
          loop: false,
          pingPong: false,
          speed: 1.0,
          currentTime: 0
        },
        keyframes: [],
        blending: {
          enabled: false,
          mode: 'additive' as const,
          weight: 1.0,
          duration: 0,
          curve: 'linear' as const
        },
        transitions: {
          enabled: false,
          duration: 0,
          easing: 'linear' as const,
          delay: 0,
          properties: []
        },
        metadata: {},
      };

      const createdAnimation = await manager.createAnimation(animationData);
      const deleted = await manager.deleteAnimation(createdAnimation.id!);
      
      expect(deleted).toBe(true);
      
      const allAnimations = manager.getAllAnimations();
      const retrievedAnimation = allAnimations.find(anim => anim.id === createdAnimation.id);
      expect(retrievedAnimation).toBeUndefined();
    });
  });

  describe('Analytics and Statistics', () => {
    it('should provide statistics', () => {
      const stats = manager.getStatistics();
      expect(stats).toBeDefined();
      expect(typeof stats.totalAnimations).toBe('number');
      expect(typeof stats.activeAnimations).toBe('number');
      expect(typeof stats.animationsByType).toBe('object');
      expect(typeof stats.uptime).toBe('number');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid animation updates gracefully', async () => {
      const result = await manager.updateAnimation('non-existent-id', {
        name: 'Updated Animation'
      });
      
      expect(result).toBeNull();
    });

    it('should handle invalid animation deletions gracefully', async () => {
      const result = await manager.deleteAnimation('non-existent-id');
      
      expect(result).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should handle multiple animation operations efficiently', async () => {
      const startTime = Date.now();
      
      // Create multiple animations
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(manager.createAnimation({
          name: `Test Animation ${i}`,
          type: 'position' as const,
          status: 'idle' as const,
          timeline: {
            duration: 1000,
            startTime: 0,
            endTime: 1000,
            loop: false,
            pingPong: false,
            speed: 1.0,
            currentTime: 0
          },
          keyframes: [],
          blending: {
            enabled: false,
            mode: 'additive' as const,
            weight: 1.0,
            duration: 0,
            curve: 'linear' as const
          },
          transitions: {
            enabled: false,
            duration: 0,
            easing: 'linear' as const,
            delay: 0,
            properties: []
          },
          metadata: {},
        }));
      }
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (5 seconds)
      expect(duration).toBeLessThan(5000);
      
      const allAnimations = manager.getAllAnimations();
      expect(allAnimations.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Cleanup', () => {
    it('should destroy manager without errors', async () => {
      await expect(manager.destroy()).resolves.not.toThrow();
    });
  });
});