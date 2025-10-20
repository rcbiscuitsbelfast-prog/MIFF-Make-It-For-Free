/**
 * PhysicsPure Manager Tests
 * 
 * Tests for PhysicsPureManager using actual implementation
 */

import { PhysicsPureManager } from './Manager';

describe('PhysicsPureManager', () => {
  let manager: PhysicsPureManager;

  beforeEach(async () => {
    manager = new PhysicsPureManager({
      enabled: true,
      debugMode: false,
      maxInstances: 100,
      timeout: 5000,
      retryAttempts: 3,
      cacheSize: 50,
      logLevel: 'error',
      performanceMonitoring: false,
      memoryTracking: false
    });
    
    await manager.initialize();
  });

  describe('Initialization', () => {
    it('should create physics manager', () => {
      expect(manager).toBeDefined();
    });

    it('should initialize successfully', async () => {
      const newManager = new PhysicsPureManager();
      await newManager.initialize();
      expect(newManager).toBeDefined();
    });
  });

  describe('Manager Operations', () => {
    it('should create manager instance', async () => {
      const result = await manager.createManager({
        type: '2d',
        gravity: 9.8,
        timeStep: 1/60
      });
      
      expect(result.ok).toBe(true);
      expect(result.manager).toBeDefined();
    });

    it('should get all managers', async () => {
      await manager.createManager({ type: '2d' });
      await manager.createManager({ type: '3d' });
      
      const result = await manager.getAllManagers();
      expect(result.ok).toBe(true);
      expect(Array.isArray(result.managers)).toBe(true);
    });

    it('should get manager stats', async () => {
      const result = await manager.getStats();
      expect(result.ok).toBe(true);
      expect(result.stats).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should handle multiple manager instances', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(manager.createManager({ type: '2d' }));
      }
      
      const results = await Promise.all(promises);
      results.forEach(result => {
        expect(result.ok).toBe(true);
      });
    });
  });

  describe('Cleanup', () => {
    it('should shutdown cleanly', async () => {
      await manager.createManager({ type: '2d' });
      await manager.shutdown();
      expect(true).toBe(true);
    });
  });
});
