import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { AudioSystemManager } from './Manager';

describe('AudioSystemManager', () => {
  let manager: AudioSystemManager;

  beforeEach(async () => {
    manager = new AudioSystemManager({
      enableDeviceManagement: true,
      enableContextManagement: true,
      enableProcessingPipeline: true,
      enableCrossPlatformIntegration: true,
      enablePerformanceOptimization: true,
      enableMonitoring: true,
      maxDevices: 10,
      maxContexts: 5,
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
      expect(manager.getAllSystems).toBeDefined();
      expect(manager.getStatistics).toBeDefined();
    });

    it('should have default configuration', () => {
      const stats = manager.getStatistics();
      expect(stats).toBeDefined();
      expect(typeof stats.totalSystems).toBe('number');
      expect(typeof stats.activeSystems).toBe('number');
    });
  });

  describe('Audio System Management', () => {
    it('should create audio systems', async () => {
      const systemData = {
        name: 'Test Audio System',
        type: 'master' as const,
        devices: [],
        contexts: [],
        pipeline: {
          stages: [],
          connections: [],
          enabled: false,
          latency: 0,
          throughput: 0
        },
        performance: {
          cpuUsage: 0,
          memoryUsage: 0,
          latency: 0,
          throughput: 0,
          errorRate: 0,
          droppedFrames: 0
        },
        metadata: { test: true }
      };

      const system = await manager.createSystem(systemData);
      expect(system).toBeDefined();
      expect(system.id).toBeDefined();
      expect(system.name).toBe('Test Audio System');
      expect(system.type).toBe('master');
    });

    it('should retrieve systems by ID', async () => {
      const systemData = {
        name: 'Test Audio System',
        type: 'master' as const,
        devices: [],
        contexts: [],
        pipeline: {
          stages: [],
          connections: [],
          enabled: false,
          latency: 0,
          throughput: 0
        },
        performance: {
          cpuUsage: 0,
          memoryUsage: 0,
          latency: 0,
          throughput: 0,
          errorRate: 0,
          droppedFrames: 0
        },
        metadata: {}
      };

      const createdSystem = await manager.createSystem(systemData);
      const allSystems = manager.getAllSystems();
      const retrievedSystem = allSystems.find(sys => sys.id === createdSystem.id);
      
      expect(retrievedSystem).toBeDefined();
      expect(retrievedSystem?.id).toBe(createdSystem.id);
      expect(retrievedSystem?.name).toBe('Test Audio System');
    });

    it('should get all systems', async () => {
      const systemData = {
        name: 'Test Audio System',
        type: 'master' as const,
        devices: [],
        contexts: [],
        pipeline: {
          stages: [],
          connections: [],
          enabled: false,
          latency: 0,
          throughput: 0
        },
        performance: {
          cpuUsage: 0,
          memoryUsage: 0,
          latency: 0,
          throughput: 0,
          errorRate: 0,
          droppedFrames: 0
        },
        metadata: {}
      };

      await manager.createSystem(systemData);
      const allSystems = manager.getAllSystems();
      
      expect(Array.isArray(allSystems)).toBe(true);
      expect(allSystems.length).toBeGreaterThan(0);
    });

    it('should update systems', async () => {
      const systemData = {
        name: 'Test Audio System',
        type: 'master' as const,
        devices: [],
        contexts: [],
        pipeline: {
          stages: [],
          connections: [],
          enabled: false,
          latency: 0,
          throughput: 0
        },
        performance: {
          cpuUsage: 0,
          memoryUsage: 0,
          latency: 0,
          throughput: 0,
          errorRate: 0,
          droppedFrames: 0
        },
        metadata: {}
      };

      const createdSystem = await manager.createSystem(systemData);
      const updatedSystem = await manager.updateSystem(createdSystem.id!, {
        name: 'Updated Audio System'
      });
      
      expect(updatedSystem).toBeDefined();
      expect(updatedSystem?.name).toBe('Updated Audio System');
    });

    it('should delete systems', async () => {
      const systemData = {
        name: 'Test Audio System',
        type: 'master' as const,
        devices: [],
        contexts: [],
        pipeline: {
          stages: [],
          connections: [],
          enabled: false,
          latency: 0,
          throughput: 0
        },
        performance: {
          cpuUsage: 0,
          memoryUsage: 0,
          latency: 0,
          throughput: 0,
          errorRate: 0,
          droppedFrames: 0
        },
        metadata: {}
      };

      const createdSystem = await manager.createSystem(systemData);
      const deleted = await manager.deleteSystem(createdSystem.id!);
      
      expect(deleted).toBe(true);
      
      const allSystems = manager.getAllSystems();
      const retrievedSystem = allSystems.find(sys => sys.id === createdSystem.id);
      expect(retrievedSystem).toBeUndefined();
    });
  });

  describe('Analytics and Statistics', () => {
    it('should provide statistics', () => {
      const stats = manager.getStatistics();
      expect(stats).toBeDefined();
      expect(typeof stats.totalSystems).toBe('number');
      expect(typeof stats.activeSystems).toBe('number');
      expect(typeof stats.systemsByType).toBe('object');
      expect(typeof stats.uptime).toBe('number');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid system updates gracefully', async () => {
      const result = await manager.updateSystem('non-existent-id', {
        name: 'Updated System'
      });
      
      expect(result).toBeNull();
    });

    it('should handle invalid system deletions gracefully', async () => {
      const result = await manager.deleteSystem('non-existent-id');
      
      expect(result).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should handle multiple system operations efficiently', async () => {
      const startTime = Date.now();
      
      // Create multiple systems
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(manager.createSystem({
          name: `Test Audio System ${i}`,
          type: 'master' as const,
          devices: [],
          contexts: [],
          pipeline: {
            stages: [],
            connections: [],
            enabled: false,
            latency: 0,
            throughput: 0
          },
          performance: {
            cpuUsage: 0,
            memoryUsage: 0,
            latency: 0,
            throughput: 0,
            errorRate: 0,
            droppedFrames: 0
          },
          metadata: {}
        }));
      }
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (5 seconds)
      expect(duration).toBeLessThan(5000);
      
      const allSystems = manager.getAllSystems();
      expect(allSystems.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Cleanup', () => {
    it('should destroy manager without errors', async () => {
      await expect(manager.destroy()).resolves.not.toThrow();
    });
  });
});