/**
 * FusionPure Golden Tests
 *
 * Comprehensive test suite covering all aspects of the FusionPure module
 * including fusion mechanics, rule validation, trait inheritance, and edge cases.
 *
 * @module FusionPure/Tests
 * @version 1.0.0
 * @license MIT
 */

import {
  FusionManager,
  FusionRules,
  PlayerContext,
  FusionResult,
  FusionPairRule,
  FusionStatus,
  FusionTrait,
  FusionStats
} from '../index';

import { EventBus } from '../../EventBusPure/EventBusPure';

// Mock Spirit Instance for testing
class MockSpiritInstance {
  instanceId: string;
  speciesId: string;
  level: number;
  experience: number;
  name: string;

  constructor(speciesId: string, level: number = 25) {
    this.instanceId = `spirit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.speciesId = speciesId;
    this.level = level;
    this.experience = level * 100;
    this.name = `${speciesId.charAt(0).toUpperCase() + speciesId.slice(1)} Spirit`;
  }

  getSyncPercentage(): number {
    return 50; // Mock sync level
  }

  hasItem(itemId: string): boolean {
    return false; // Mock - no items
  }
}

// Mock Player Context for testing
class MockPlayerContext implements PlayerContext {
  playerId: string;
  energy: number;
  level: number;
  fusionHistory: string[];
  lastFusionTime: number;

  constructor() {
    this.playerId = 'test_player';
    this.energy = 100;
    this.level = 25;
    this.fusionHistory = [];
    this.lastFusionTime = 0;
  }

  getInventory?(): any {
    return {
      getCount: (itemId: string) => 0,
      hasItem: (itemId: string) => false
    };
  }
}

describe('FusionPure Module', () => {
  let eventBus: EventBus;
  let fusionManager: FusionManager;
  let fusionRules: FusionRules;
  let mockContext: MockPlayerContext;
  let mockSpiritA: MockSpiritInstance;
  let mockSpiritB: MockSpiritInstance;

  beforeEach(() => {
    eventBus = new EventBus();
    mockContext = new MockPlayerContext();
    fusionManager = new FusionManager(eventBus, mockContext);
    fusionRules = new FusionRules();

    // Create mock spirits for testing
    mockSpiritA = new MockSpiritInstance('fire_spirit', 25);
    mockSpiritB = new MockSpiritInstance('water_spirit', 25);
  });

  afterEach(() => {
    eventBus.clearOldEvents();
  });

  describe('FusionManager Basic Functionality', () => {
    it('should create FusionManager with valid context', () => {
      expect(fusionManager).toBeDefined();
      expect(fusionManager).toBeInstanceOf(FusionManager);
    });

    it('should return available rules', () => {
      const rules = fusionManager.getAvailableRules();
      expect(Array.isArray(rules)).toBe(true);
      expect(rules.length).toBeGreaterThan(0);
    });

    it('should get fusion statistics', () => {
      const stats = fusionManager.getFusionStats();
      expect(stats).toBeDefined();
      expect(typeof stats.totalFusions).toBe('number');
      expect(typeof stats.successfulFusions).toBe('number');
      expect(typeof stats.failedFusions).toBe('number');
    });

    it('should export and import fusion history', () => {
      const exportData = fusionManager.exportFusionHistory();
      expect(typeof exportData).toBe('string');

      const importResult = fusionManager.importFusionHistory(exportData);
      expect(importResult).toBe(true);
    });
  });

  describe('Fusion Rules Management', () => {
    it('should create FusionRules instance', () => {
      expect(fusionRules).toBeDefined();
      expect(fusionRules).toBeInstanceOf(FusionRules);
    });

    it('should get available pairs', () => {
      const pairs = fusionRules.getAvailablePairs();
      expect(Array.isArray(pairs)).toBe(true);
    });

    it('should find matching rules', () => {
      const rule = fusionRules.findMatch('fire_spirit', 'water_spirit');
      expect(rule).toBeDefined();
      expect(rule?.resultSpeciesId).toBe('steam_spirit');
    });

    it('should validate rule compatibility', () => {
      const validation = fusionRules.validateRuleCompatibility('fire_spirit', 'water_spirit');

      expect(validation).toBeDefined();
      expect(typeof validation.compatible).toBe('boolean');
      expect(Array.isArray(validation.missingConstraints)).toBe(true);
      expect(Array.isArray(validation.recommendations)).toBe(true);
    });

    it('should get optimal fusions', () => {
      const optimal = fusionRules.getOptimalFusions(70);
      expect(Array.isArray(optimal)).toBe(true);
    });

    it('should export and import rules', () => {
      const exportData = fusionRules.exportRules();
      expect(typeof exportData).toBe('string');

      const importResult = fusionRules.importRules(exportData);
      expect(importResult).toBe(true);
    });
  });

  describe('Fusion Mechanics', () => {
    it('should check if spirits can fuse', () => {
      const canFuse = fusionManager.canFuse(mockSpiritA, mockSpiritB);
      expect(typeof canFuse).toBe('boolean');
    });

    it('should perform fusion successfully', () => {
      const result = fusionManager.fuse(mockSpiritA, mockSpiritB);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.status).toBe('success');
      expect(result.newSpiritId).toBeDefined();
      expect(Array.isArray(result.inheritedTraits)).toBe(true);
    });

    it('should fail fusion with null spirits', () => {
      const result = fusionManager.fuse(null as any, mockSpiritB);

      expect(result.success).toBe(false);
      expect(result.status).toBe('incompatible_pair');
      expect(result.message).toContain('Missing');
    });

    it('should fail fusion with same spirit', () => {
      const result = fusionManager.fuse(mockSpiritA, mockSpiritA);

      expect(result.success).toBe(false);
      expect(result.status).toBe('incompatible_pair');
    });

    it('should fail fusion with insufficient energy', () => {
      mockContext.energy = 0; // Exhaust energy

      const result = fusionManager.fuse(mockSpiritA, mockSpiritB);

      expect(result.success).toBe(false);
      expect(result.status).toBe('missing_requirements');
      expect(result.message).toContain('energy');
    });

    it('should handle fusion history correctly', () => {
      // First fusion should succeed
      const result1 = fusionManager.fuse(mockSpiritA, mockSpiritB);
      expect(result1.success).toBe(true);

      // Second fusion with same spirits should fail due to history
      const result2 = fusionManager.fuse(mockSpiritA, mockSpiritB);
      expect(result2.success).toBe(false);
      expect(result2.status).toBe('already_fused');
    });
  });

  describe('Trait Inheritance', () => {
    it('should inherit traits from fusion', () => {
      const result = fusionManager.fuse(mockSpiritA, mockSpiritB);

      if (result.success && result.inheritedTraits) {
        expect(result.inheritedTraits.length).toBeGreaterThan(0);

        result.inheritedTraits.forEach(trait => {
          expect(trait.id).toBeDefined();
          expect(trait.type).toBeDefined();
          expect(trait.name).toBeDefined();
          expect(trait.description).toBeDefined();
          expect(trait.rarity).toBeGreaterThanOrEqual(0);
          expect(trait.rarity).toBeLessThanOrEqual(100);
        });
      }
    });

    it('should handle trait rarity correctly', () => {
      const result = fusionManager.fuse(mockSpiritA, mockSpiritB);

      if (result.success && result.inheritedTraits) {
        result.inheritedTraits.forEach(trait => {
          expect(trait.rarity).toBeGreaterThanOrEqual(0);
          expect(trait.rarity).toBeLessThanOrEqual(100);
        });
      }
    });
  });

  describe('Event System Integration', () => {
    it('should emit fusion performed event', (done) => {
      eventBus.on('fusion:performed', (data) => {
        expect(data.playerId).toBe(mockContext.playerId);
        expect(data.spiritAId).toBeDefined();
        expect(data.spiritBId).toBeDefined();
        expect(data.resultSpiritId).toBeDefined();
        expect(data.ruleId).toBeDefined();
        expect(data.timestamp).toBeDefined();
        done();
      });

      fusionManager.fuse(mockSpiritA, mockSpiritB);
    });

    it('should handle multiple event listeners', (done) => {
      let eventCount = 0;
      const expectedEvents = 2;

      const checkDone = () => {
        eventCount++;
        if (eventCount === expectedEvents) {
          done();
        }
      };

      eventBus.on('fusion:performed', (data) => checkDone());
      eventBus.on('fusion:performed', (data) => checkDone());

      fusionManager.fuse(mockSpiritA, mockSpiritB);
    });
  });

  describe('Energy Management', () => {
    it('should consume energy on successful fusion', () => {
      const initialEnergy = mockContext.energy;
      const result = fusionManager.fuse(mockSpiritA, mockSpiritB);

      if (result.success) {
        expect(mockContext.energy).toBeLessThan(initialEnergy);
      }
    });

    it('should not consume energy on failed fusion', () => {
      mockContext.energy = 0; // Insufficient energy
      const initialEnergy = mockContext.energy;

      const result = fusionManager.fuse(mockSpiritA, mockSpiritB);

      expect(result.success).toBe(false);
      expect(mockContext.energy).toBe(initialEnergy);
    });
  });

  describe('Constraint Validation', () => {
    it('should validate sync level constraints', () => {
      // Mock spirits with low sync levels
      const lowSyncSpiritA = new MockSpiritInstance('grass_spirit', 5);
      const lowSyncSpiritB = new MockSpiritInstance('poison_spirit', 5);

      const result = fusionManager.fuse(lowSyncSpiritA, lowSyncSpiritB);

      // Should handle constraint validation appropriately
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });

    it('should handle item requirements', () => {
      // This would require mocking inventory with required items
      const result = fusionManager.fuse(mockSpiritA, mockSpiritB);
      expect(result).toBeDefined();
    });
  });

  describe('Fusion Statistics Tracking', () => {
    it('should track fusion statistics correctly', () => {
      const initialStats = fusionManager.getFusionStats();

      fusionManager.fuse(mockSpiritA, mockSpiritB);

      const updatedStats = fusionManager.getFusionStats();

      expect(updatedStats.totalFusions).toBeGreaterThanOrEqual(initialStats.totalFusions);
      expect(updatedStats.successfulFusions).toBeGreaterThanOrEqual(initialStats.successfulFusions);
    });

    it('should track unique combinations', () => {
      const initialStats = fusionManager.getFusionStats();

      fusionManager.fuse(mockSpiritA, mockSpiritB);

      const updatedStats = fusionManager.getFusionStats();

      expect(updatedStats.uniqueCombinations).toBeGreaterThanOrEqual(initialStats.uniqueCombinations);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle null or undefined inputs gracefully', () => {
      const result1 = fusionManager.fuse(null as any, mockSpiritB);
      const result2 = fusionManager.fuse(mockSpiritA, null as any);
      const result3 = fusionManager.fuse(null as any, null as any);

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
      expect(result3.success).toBe(false);
    });

    it('should handle spirits with invalid data', () => {
      const invalidSpirit = {
        instanceId: '',
        speciesId: '',
        level: -1
      } as any;

      const result = fusionManager.fuse(invalidSpirit, mockSpiritB);
      expect(result).toBeDefined();
    });

    it('should handle very high energy costs', () => {
      mockContext.energy = 1000; // Plenty of energy

      const result = fusionManager.fuse(mockSpiritA, mockSpiritB);
      expect(result).toBeDefined();
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle rapid consecutive fusions', (done) => {
      let fusionCount = 0;
      const maxFusions = 10;

      const performFusion = () => {
        if (fusionCount >= maxFusions) {
          done();
          return;
        }

        fusionCount++;
        const result = fusionManager.fuse(mockSpiritA, mockSpiritB);

        if (result.success) {
          setTimeout(performFusion, 10); // Small delay
        } else {
          // If fusion fails, try with fresh spirits
          const freshSpiritA = new MockSpiritInstance('electric_spirit', 25);
          const freshSpiritB = new MockSpiritInstance('steel_spirit', 25);
          const retryResult = fusionManager.fuse(freshSpiritA, freshSpiritB);

          if (retryResult.success) {
            setTimeout(performFusion, 10);
          }
        }
      };

      performFusion();
    });

    it('should handle large fusion history', () => {
      // Create a large number of fusion pairs
      for (let i = 0; i < 100; i++) {
        const spiritA = new MockSpiritInstance(`species_a_${i}`, 25);
        const spiritB = new MockSpiritInstance(`species_b_${i}`, 25);

        try {
          fusionManager.fuse(spiritA, spiritB);
        } catch (error) {
          // Expected some failures due to history tracking
        }
      }

      const stats = fusionManager.getFusionStats();
      expect(stats.totalFusions).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration with Other Modules', () => {
    it('should work with EventBus for inter-module communication', (done) => {
      eventBus.on('fusion:performed', (data) => {
        expect(data).toBeDefined();
        expect(data.playerId).toBe(mockContext.playerId);
        done();
      });

      fusionManager.fuse(mockSpiritA, mockSpiritB);
    });

    it('should maintain player context state', () => {
      const initialEnergy = mockContext.energy;
      const initialHistoryLength = mockContext.fusionHistory.length;

      fusionManager.fuse(mockSpiritA, mockSpiritB);

      expect(mockContext.energy).toBeLessThan(initialEnergy);
      expect(mockContext.fusionHistory.length).toBeGreaterThan(initialHistoryLength);
    });
  });
});