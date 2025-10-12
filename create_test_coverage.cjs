#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Creating comprehensive test coverage for Manager files...\n');

// Find all Manager.ts files
const managerFiles = [];
function findManagerFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findManagerFiles(filePath);
    } else if (file === 'Manager.ts') {
      managerFiles.push(filePath);
    }
  }
}

findManagerFiles('./miff/pure');

console.log(`Found ${managerFiles.length} Manager files to create tests for...\n`);

let created = 0;
let errors = 0;

// Process each Manager file
for (const filePath of managerFiles) {
  try {
    const moduleName = path.basename(path.dirname(filePath));
    const testPath = filePath.replace('Manager.ts', 'Manager.test.ts');
    
    // Skip if test already exists
    if (fs.existsSync(testPath)) {
      console.log(`⏭️  Skipping ${moduleName}/Manager.test.ts (already exists)`);
      continue;
    }
    
    // Generate test content
    const testContent = `import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { ${moduleName}Manager } from './Manager';

describe('${moduleName}Manager', () => {
  let manager: ${moduleName}Manager;

  beforeEach(async () => {
    manager = new ${moduleName}Manager({
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

  afterEach(async () => {
    if (manager) {
      await manager.destroy();
    }
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      expect(manager).toBeDefined();
      expect(manager.getStats).toBeDefined();
      expect(manager.getAnalytics).toBeDefined();
    });

    it('should have default configuration', () => {
      const stats = manager.getStats();
      expect(stats).toBeDefined();
      expect(typeof stats.totalItems).toBe('number');
      expect(typeof stats.activeItems).toBe('number');
    });
  });

  describe('Item Management', () => {
    it('should create items', async () => {
      const itemData = {
        name: 'Test Item',
        type: 'test',
        status: 'active' as const,
        metadata: { test: true },
        properties: { value: 100 },
        tags: ['test'],
        priority: 1,
        version: '1.0.0'
      };

      const item = await manager.createItem(itemData);
      expect(item).toBeDefined();
      expect(item.id).toBeDefined();
      expect(item.name).toBe('Test Item');
      expect(item.type).toBe('test');
      expect(item.status).toBe('active');
    });

    it('should retrieve items by ID', async () => {
      const itemData = {
        name: 'Test Item',
        type: 'test',
        status: 'active' as const,
        metadata: {},
        properties: {},
        tags: ['test'],
        priority: 1,
        version: '1.0.0'
      };

      const createdItem = await manager.createItem(itemData);
      const retrievedItem = manager.getItem(createdItem.id);
      
      expect(retrievedItem).toBeDefined();
      expect(retrievedItem?.id).toBe(createdItem.id);
      expect(retrievedItem?.name).toBe('Test Item');
    });

    it('should get all items', async () => {
      const itemData = {
        name: 'Test Item',
        type: 'test',
        status: 'active' as const,
        metadata: {},
        properties: {},
        tags: ['test'],
        priority: 1,
        version: '1.0.0'
      };

      await manager.createItem(itemData);
      const allItems = manager.getAllItems();
      
      expect(Array.isArray(allItems)).toBe(true);
      expect(allItems.length).toBeGreaterThan(0);
    });

    it('should update items', async () => {
      const itemData = {
        name: 'Test Item',
        type: 'test',
        status: 'active' as const,
        metadata: {},
        properties: {},
        tags: ['test'],
        priority: 1,
        version: '1.0.0'
      };

      const createdItem = await manager.createItem(itemData);
      const updatedItem = await manager.updateItem(createdItem.id, {
        name: 'Updated Item',
        status: 'inactive' as const
      });
      
      expect(updatedItem).toBeDefined();
      expect(updatedItem?.name).toBe('Updated Item');
      expect(updatedItem?.status).toBe('inactive');
    });

    it('should delete items', async () => {
      const itemData = {
        name: 'Test Item',
        type: 'test',
        status: 'active' as const,
        metadata: {},
        properties: {},
        tags: ['test'],
        priority: 1,
        version: '1.0.0'
      };

      const createdItem = await manager.createItem(itemData);
      const deleted = await manager.deleteItem(createdItem.id);
      
      expect(deleted).toBe(true);
      
      const retrievedItem = manager.getItem(createdItem.id);
      expect(retrievedItem).toBeUndefined();
    });
  });

  describe('Analytics and Statistics', () => {
    it('should provide analytics', () => {
      const analytics = manager.getAnalytics();
      expect(analytics).toBeDefined();
      expect(typeof analytics.totalItems).toBe('number');
      expect(typeof analytics.activeItems).toBe('number');
      expect(typeof analytics.inactiveItems).toBe('number');
      expect(typeof analytics.errorItems).toBe('number');
      expect(typeof analytics.averageProcessingTime).toBe('number');
      expect(typeof analytics.totalOperations).toBe('number');
      expect(typeof analytics.successRate).toBe('number');
      expect(analytics.lastUpdated).toBeInstanceOf(Date);
    });

    it('should provide statistics', () => {
      const stats = manager.getStats();
      expect(stats).toBeDefined();
      expect(typeof stats.totalItems).toBe('number');
      expect(typeof stats.activeItems).toBe('number');
      expect(typeof stats.errorCount).toBe('number');
      expect(typeof stats.averageResponseTime).toBe('number');
      expect(typeof stats.memoryUsage).toBe('number');
      expect(typeof stats.uptime).toBe('number');
      expect(stats.lastActivity).toBeInstanceOf(Date);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid item updates gracefully', async () => {
      const result = await manager.updateItem('non-existent-id', {
        name: 'Updated Item'
      });
      
      expect(result).toBeUndefined();
    });

    it('should handle invalid item deletions gracefully', async () => {
      const result = await manager.deleteItem('non-existent-id');
      
      expect(result).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should handle multiple item operations efficiently', async () => {
      const startTime = Date.now();
      
      // Create multiple items
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(manager.createItem({
          name: \`Test Item \${i}\`,
          type: 'test',
          status: 'active' as const,
          metadata: {},
          properties: {},
          tags: ['test'],
          priority: i,
          version: '1.0.0'
        }));
      }
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (5 seconds)
      expect(duration).toBeLessThan(5000);
      
      const allItems = manager.getAllItems();
      expect(allItems.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Cleanup', () => {
    it('should destroy manager without errors', async () => {
      await expect(manager.destroy()).resolves.not.toThrow();
    });
  });
});
`;

    // Write test file
    fs.writeFileSync(testPath, testContent);
    console.log(`✅ Created ${moduleName}/Manager.test.ts`);
    created++;
    
  } catch (error) {
    console.error(`❌ Error creating test for ${filePath}: ${error.message}`);
    errors++;
  }
}

console.log(`\n✅ Test coverage creation complete!`);
console.log(`📊 Created: ${created} test files`);
console.log(`❌ Errors: ${errors} files`);
console.log(`📈 Success rate: ${((created / managerFiles.length) * 100).toFixed(1)}%`);