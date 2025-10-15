/**
 * RewardsPure Golden Tests
 *
 * Comprehensive tests for the RewardsPure reward and drop system.
 * Tests cover reward generation, drop tables, weighted selection, and integration scenarios.
 */

import {
  RewardManager,
  DropResolver,
  DropTable,
  RewardStub,
  RewardUtils,
  IRNGProvider
} from '../index';

// Mock RNG provider for testing
class MockRNGProvider implements IRNGProvider {
  private values: number[] = [];
  private floatValues: number[] = [];
  private currentIndex = 0;
  private floatIndex = 0;

  setNextInt(value: number): void {
    this.values.push(value);
  }

  setNextFloat(value: number): void {
    this.floatValues.push(value);
  }

  nextInt(min: number, max: number): number {
    if (this.values.length > this.currentIndex) {
      const value = this.values[this.currentIndex];
      this.currentIndex++;
      return Math.max(min, Math.min(max - 1, value));
    }
    return min; // Default fallback
  }

  nextFloat(min: number, max: number): number {
    if (this.floatValues.length > this.floatIndex) {
      const value = this.floatValues[this.floatIndex];
      this.floatIndex++;
      return Math.max(min, Math.min(max, value));
    }
    return (min + max) / 2; // Default fallback to midpoint
  }

  reset(): void {
    this.currentIndex = 0;
    this.floatIndex = 0;
  }
}

describe('RewardsPure Golden Tests', () => {
  let rewardManager: RewardManager;
  let rng: MockRNGProvider;

  beforeEach(() => {
    rewardManager = new RewardManager();
    rng = new MockRNGProvider();
  });

  describe('RewardStub Basic Functionality', () => {
    test('should create reward with default values', () => {
      const reward = new RewardStub();
      expect(reward.currency).toBe(0);
      expect(reward.xpGain).toBe(0);
      expect(reward.itemId).toBeUndefined();
    });

    test('should create reward with custom values', () => {
      const reward = new RewardStub(100, 50, 'test_item');
      expect(reward.currency).toBe(100);
      expect(reward.xpGain).toBe(50);
      expect(reward.itemId).toBe('test_item');
    });

    test('should enforce non-negative values', () => {
      const reward = new RewardStub(-10, -5, 'test_item');
      expect(reward.currency).toBe(0);
      expect(reward.xpGain).toBe(0);
      expect(reward.itemId).toBe('test_item');
    });

    test('should convert to string correctly', () => {
      const reward1 = new RewardStub(100, 50);
      expect(reward1.toString()).toBe('+100c, +50xp');

      const reward2 = new RewardStub(25, 10, 'health_potion');
      expect(reward2.toString()).toBe('+25c, +10xp, item:health_potion');

      const reward3 = new RewardStub(0, 0);
      expect(reward3.toString()).toBe('+0c, +0xp');
    });

    test('should clone correctly', () => {
      const original = new RewardStub(100, 50, 'test_item');
      const clone = original.clone();

      expect(clone.currency).toBe(original.currency);
      expect(clone.xpGain).toBe(original.xpGain);
      expect(clone.itemId).toBe(original.itemId);
      expect(clone).not.toBe(original); // Should be different object
    });

    test('should add rewards correctly', () => {
      const reward1 = new RewardStub(100, 50, 'item1');
      const reward2 = new RewardStub(25, 10, 'item2');

      reward1.add(reward2);

      expect(reward1.currency).toBe(125);
      expect(reward1.xpGain).toBe(60);
      expect(reward1.itemId).toBe('item1'); // First item should remain
    });

    test('should add item when none exists', () => {
      const reward1 = new RewardStub(100, 50);
      const reward2 = new RewardStub(25, 10, 'item1');

      reward1.add(reward2);

      expect(reward1.currency).toBe(125);
      expect(reward1.xpGain).toBe(60);
      expect(reward1.itemId).toBe('item1');
    });

    test('should multiply rewards correctly', () => {
      const reward = new RewardStub(100, 50, 'test_item');
      reward.multiply(2.5);

      expect(reward.currency).toBe(250);
      expect(reward.xpGain).toBe(125);
      expect(reward.itemId).toBe('test_item');
    });

    test('should validate correctly', () => {
      const validReward = new RewardStub(100, 50, 'test_item');
      expect(validReward.validate()).toHaveLength(0);

      const invalidReward = new RewardStub(-10, -5, '');
      const errors = invalidReward.validate();
      expect(errors).toContain('Currency cannot be negative');
      expect(errors).toContain('XP gain cannot be negative');
      expect(errors).toContain('Item ID cannot be empty string');
    });

    test('should check emptiness correctly', () => {
      const emptyReward = new RewardStub(0, 0);
      const nonEmptyReward = new RewardStub(100, 50);

      expect(emptyReward.isEmpty()).toBe(true);
      expect(nonEmptyReward.isEmpty()).toBe(false);
    });

    test('should calculate total value correctly', () => {
      const reward1 = new RewardStub(100, 50);
      const reward2 = new RewardStub(50, 25, 'item1');

      expect(reward1.getTotalValue()).toBe(150); // 100 + 50
      expect(reward1.getTotalValue(2)).toBe(200); // 100 + 100 (50 * 2)
      expect(reward2.getTotalValue()).toBe(75); // 50 + 25
    });
  });

  describe('DropEntry Basic Functionality', () => {
    test('should create entry with default values', () => {
      const entry = new (require('../index').DropEntry)();
      expect(entry.itemId).toBe('');
      expect(entry.weight).toBe(1);
    });

    test('should create entry with custom values', () => {
      const entry = new (require('../index').DropEntry)('health_potion', 50);
      expect(entry.itemId).toBe('health_potion');
      expect(entry.weight).toBe(50);
    });

    test('should enforce non-negative weight', () => {
      const entry = new (require('../index').DropEntry)('test', -10);
      expect(entry.weight).toBe(0);
    });

    test('should clone correctly', () => {
      const original = new (require('../index').DropEntry)('test_item', 25);
      const clone = original.clone();

      expect(clone.itemId).toBe(original.itemId);
      expect(clone.weight).toBe(original.weight);
      expect(clone).not.toBe(original);
    });

    test('should validate correctly', () => {
      const validEntry = new (require('../index').DropEntry)('test_item', 25);
      expect(validEntry.validate()).toHaveLength(0);

      const invalidEntry = new (require('../index').DropEntry)('', -5);
      const errors = invalidEntry.validate();
      expect(errors).toContain('Item ID cannot be empty');
      expect(errors).toContain('Weight cannot be negative');
    });
  });

  describe('DropTable Basic Functionality', () => {
    test('should create empty table', () => {
      const table = new DropTable();
      expect(table.entries).toHaveLength(0);
      expect(table.getTotalWeight()).toBe(0);
    });

    test('should add entries correctly', () => {
      const table = new DropTable();

      const entry1 = new (require('../index').DropEntry)('potion', 30);
      const entry2 = new (require('../index').DropEntry)('sword', 20);

      expect(table.addEntry(entry1)).toBe(true);
      expect(table.addEntry(entry2)).toBe(true);
      expect(table.entries).toHaveLength(2);
      expect(table.getTotalWeight()).toBe(50);
    });

    test('should reject invalid entries', () => {
      const table = new DropTable();

      const invalidEntry = new (require('../index').DropEntry)('', -10);

      expect(table.addEntry(invalidEntry)).toBe(false);
      expect(table.entries).toHaveLength(0);
    });

    test('should remove entries by item', () => {
      const table = new DropTable();

      table.addEntry(new (require('../index').DropEntry)('potion', 30));
      table.addEntry(new (require('../index').DropEntry)('potion', 20));
      table.addEntry(new (require('../index').DropEntry)('sword', 25));

      expect(table.entries).toHaveLength(3);
      const removed = table.removeEntriesByItem('potion');
      expect(removed).toBe(2);
      expect(table.entries).toHaveLength(1);
      expect(table.entries[0].itemId).toBe('sword');
    });

    test('should sort entries by weight', () => {
      const table = new DropTable();

      table.addEntry(new (require('../index').DropEntry)('common', 10));
      table.addEntry(new (require('../index').DropEntry)('rare', 30));
      table.addEntry(new (require('../index').DropEntry)('legendary', 20));

      const sorted = table.getEntriesByWeight();
      expect(sorted).toHaveLength(3);
      expect(sorted[0].itemId).toBe('rare'); // Highest weight
      expect(sorted[1].itemId).toBe('legendary');
      expect(sorted[2].itemId).toBe('common'); // Lowest weight
    });

    test('should get drop rate for item', () => {
      const table = new DropTable();

      table.addEntry(new (require('../index').DropEntry)('common', 50));
      table.addEntry(new (require('../index').DropEntry)('rare', 10));

      expect(table.getDropRate('common')).toBeCloseTo(0.8333); // 50/60
      expect(table.getDropRate('rare')).toBeCloseTo(0.1667); // 10/60
      expect(table.getDropRate('nonexistent')).toBe(0);
    });

    test('should validate table correctly', () => {
      const validTable = new DropTable();
      validTable.addEntry(new (require('../index').DropEntry)('test', 25));

      expect(validTable.validate()).toHaveLength(0);

      const invalidTable = new DropTable();
      const errors = invalidTable.validate();
      expect(errors).toContain('Drop table must have at least one entry');
    });

    test('should clone correctly', () => {
      const original = new DropTable();
      original.addEntry(new (require('../index').DropEntry)('test', 25));

      const clone = original.clone();
      expect(clone.entries).toHaveLength(1);
      expect(clone.entries[0]).not.toBe(original.entries[0]); // Deep clone
    });
  });

  describe('RewardManager Basic Functionality', () => {
    test('should generate rewards correctly', () => {
      const reward = rewardManager.generateRewards('battle', 10, 12);
      expect(reward.currency).toBe(7); // 5 + (2 * 2)
      expect(reward.xpGain).toBe(16); // 10 + (2 * 3)
      expect(reward.itemId).toBeUndefined();
    });

    test('should handle equal levels', () => {
      const reward = rewardManager.generateRewards('battle', 10, 10);
      expect(reward.currency).toBe(5); // Base currency
      expect(reward.xpGain).toBe(10); // Base XP
    });

    test('should handle player higher level', () => {
      const reward = rewardManager.generateRewards('battle', 15, 10);
      expect(reward.currency).toBe(5); // No bonus for higher player level
      expect(reward.xpGain).toBe(10);
    });

    test('should generate custom rewards', () => {
      const reward = rewardManager.generateRewardsCustom('battle', 10, 12, 2, 1.5);
      expect(reward.currency).toBe(14); // 7 * 2
      expect(reward.xpGain).toBe(24); // 16 * 1.5
    });

    test('should generate bonus rewards', () => {
      const baseReward = new RewardStub(100, 50);
      const rareBonus = rewardManager.generateBonusRewards(baseReward, 'rare');
      const epicBonus = rewardManager.generateBonusRewards(baseReward, 'epic');
      const legendaryBonus = rewardManager.generateBonusRewards(baseReward, 'legendary');

      expect(rareBonus.currency).toBe(150); // 100 * 1.5
      expect(epicBonus.currency).toBe(200); // 100 * 2.0
      expect(legendaryBonus.currency).toBe(300); // 100 * 3.0
    });

    test('should calculate expected value', () => {
      const expectedValue = rewardManager.calculateExpectedValue('battle', 10, 12, 1000);
      expect(expectedValue).toBeGreaterThan(0);
      expect(expectedValue).toBeLessThan(50); // Should be reasonable
    });

    test('should configure scaling correctly', () => {
      rewardManager.configureScaling(10, 5, 20, 8);

      const config = rewardManager.getScalingConfig();
      expect(config.baseCurrency).toBe(10);
      expect(config.levelCurrencyMultiplier).toBe(5);
      expect(config.baseXP).toBe(20);
      expect(config.levelXPMultiplier).toBe(8);
    });

    test('should use new scaling configuration', () => {
      rewardManager.configureScaling(10, 5, 20, 8);

      const reward = rewardManager.generateRewards('battle', 10, 12);
      expect(reward.currency).toBe(20); // 10 + (2 * 5)
      expect(reward.xpGain).toBe(36); // 20 + (2 * 8)
    });
  });

  describe('DropResolver Basic Functionality', () => {
    let dropTable: DropTable;
    let dropResolver: DropResolver;

    beforeEach(() => {
      dropTable = new DropTable();
      dropTable.addEntry(new (require('../index').DropEntry)('common', 50));
      dropTable.addEntry(new (require('../index').DropEntry)('rare', 10));

      dropResolver = new DropResolver(rng);
    });

    test('should create resolver with RNG provider', () => {
      expect(() => new DropResolver(rng)).not.toThrow();
    });

    test('should handle empty table', () => {
      const emptyTable = new DropTable();
      const result = dropResolver.resolve(emptyTable);
      expect(result).toBeNull();
    });

    test('should resolve items from table', () => {
      rng.setNextFloat(25); // Should select 'common' (0-50 range)

      const result = dropResolver.resolve(dropTable);
      expect(result).toBe('common');
    });

    test('should handle edge cases', () => {
      rng.setNextFloat(55); // Beyond normal range, should select last item

      const result = dropResolver.resolve(dropTable);
      expect(['common', 'rare']).toContain(result);
    });

    test('should resolve multiple items', () => {
      rng.setNextFloat(25);
      rng.setNextFloat(55);

      const results = dropResolver.resolveMultiple(dropTable, 2);
      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(['common', 'rare']).toContain(result);
      });
    });

    test('should test drop rates accurately', () => {
      const testResults = dropResolver.testDropRates(dropTable, 100);

      expect(testResults.has('common')).toBe(true);
      expect(testResults.has('rare')).toBe(true);

      const commonRate = testResults.get('common') || 0;
      const rareRate = testResults.get('rare') || 0;

      expect(commonRate).toBeGreaterThan(rareRate);
      expect(commonRate + rareRate).toBeCloseTo(1.0);
    });

    test('should check if item would drop', () => {
      expect(dropResolver.wouldDrop(dropTable, 'common')).toBe(true);
      expect(dropResolver.wouldDrop(dropTable, 'rare')).toBe(true);
      expect(dropResolver.wouldDrop(dropTable, 'nonexistent')).toBe(false);
    });

    test('should get drop rate for item', () => {
      expect(dropResolver.getDropRate(dropTable, 'common')).toBeCloseTo(0.8333);
      expect(dropResolver.getDropRate(dropTable, 'rare')).toBeCloseTo(0.1667);
      expect(dropResolver.getDropRate(dropTable, 'nonexistent')).toBe(0);
    });
  });

  describe('RewardUtils', () => {
    test('should create reward correctly', () => {
      const reward = RewardUtils.createReward(100, 50, 'test_item');
      expect(reward.currency).toBe(100);
      expect(reward.xpGain).toBe(50);
      expect(reward.itemId).toBe('test_item');
    });

    test('should create standard drop table', () => {
      const items = [
        { itemId: 'common', weight: 50 },
        { itemId: 'rare', weight: 10 }
      ];

      const table = RewardUtils.createStandardDropTable(items);
      expect(table.entries).toHaveLength(2);
      expect(table.getTotalWeight()).toBe(60);
    });

    test('should create rare drop table', () => {
      const commonItems = [{ itemId: 'common', weight: 100 }];
      const rareItems = [{ itemId: 'rare', weight: 20 }];

      const table = RewardUtils.createRareDropTable(commonItems, rareItems, 0.1);
      expect(table.entries).toHaveLength(2);
      expect(table.entries.some(e => e.itemId === 'rare')).toBe(true);
    });

    test('should calculate reward scaling', () => {
      const scaling = RewardUtils.calculateRewardScaling(10, 12);
      expect(scaling.currencyMultiplier).toBeCloseTo(1.4); // 1 + (2 * 0.2)
      expect(scaling.xpMultiplier).toBeCloseTo(1.6); // 1 + (2 * 0.3)
    });

    test('should merge rewards correctly', () => {
      const rewards = [
        new RewardStub(100, 50, 'item1'),
        new RewardStub(25, 10, 'item2'),
        new RewardStub(50, 20)
      ];

      const merged = RewardUtils.mergeRewards(rewards);
      expect(merged.currency).toBe(175);
      expect(merged.xpGain).toBe(80);
      expect(merged.itemId).toBe('item1'); // First item wins
    });

    test('should split rewards correctly', () => {
      const reward = new RewardStub(100, 50, 'test_item');
      const split = RewardUtils.splitRewards(reward, 3);

      expect(split).toHaveLength(3);
      expect(split[0].currency).toBe(34); // 100/3 rounded up + remainder
      expect(split[0].itemId).toBe('test_item'); // First gets the item
      expect(split[1].itemId).toBeUndefined();
      expect(split[2].itemId).toBeUndefined();
    });

    test('should calculate total value', () => {
      const rewards = [
        new RewardStub(100, 50),
        new RewardStub(25, 10)
      ];

      expect(RewardUtils.calculateTotalValue(rewards)).toBe(185); // 150 + 35
      expect(RewardUtils.calculateTotalValue(rewards, 2)).toBe(225); // 150 + 75 (50*2 + 10*2)
    });

    test('should validate reward correctly', () => {
      const validReward = new RewardStub(100, 50, 'test');
      const invalidReward = new RewardStub(-10, -5, '');

      expect(RewardUtils.validateReward(validReward)).toHaveLength(0);
      const errors = RewardUtils.validateReward(invalidReward);
      expect(errors).toContain('Currency cannot be negative');
      expect(errors).toContain('XP gain cannot be negative');
      expect(errors).toContain('Item ID cannot be empty string');
    });

    test('should validate drop table correctly', () => {
      const validTable = new DropTable();
      validTable.addEntry(new (require('../index').DropEntry)('test', 25));

      const invalidTable = new DropTable();

      expect(RewardUtils.validateDropTable(validTable)).toHaveLength(0);
      const errors = RewardUtils.validateDropTable(invalidTable);
      expect(errors).toContain('Drop table must have at least one entry');
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete reward workflow', () => {
      // Create drop table
      const dropTable = RewardUtils.createStandardDropTable([
        { itemId: 'health_potion', weight: 50 },
        { itemId: 'mana_potion', weight: 30 },
        { itemId: 'rare_sword', weight: 5 }
      ]);

      // Generate rewards
      const reward = rewardManager.generateRewards('battle', 10, 15);

      // Test drop resolution
      const dropResolver = new DropResolver(rng);
      rng.setNextFloat(25); // Should select health_potion

      const droppedItem = dropResolver.resolve(dropTable);

      expect(reward.currency).toBe(15); // 5 + (5 * 2)
      expect(reward.xpGain).toBe(25); // 10 + (5 * 3)
      expect(droppedItem).toBe('health_potion');
    });

    test('should handle multi-encounter rewards', () => {
      const encounters = [
        { type: 'easy', playerLevel: 5, enemyLevel: 3 },
        { type: 'normal', playerLevel: 8, enemyLevel: 8 },
        { type: 'hard', playerLevel: 10, enemyLevel: 15 }
      ];

      let totalReward = new RewardStub();
      encounters.forEach(encounter => {
        const reward = rewardManager.generateRewards(encounter.type, encounter.playerLevel, encounter.enemyLevel);
        totalReward.add(reward);
      });

      expect(totalReward.currency).toBe(5 + 5 + 15); // 5 + 0 + 10
      expect(totalReward.xpGain).toBe(10 + 10 + 25); // 10 + 0 + 15
    });

    test('should handle bonus reward system', () => {
      const baseReward = rewardManager.generateRewards('boss', 20, 25);
      const bonusRewards = [
        rewardManager.generateBonusRewards(baseReward, 'rare'),
        rewardManager.generateBonusRewards(baseReward, 'epic'),
        rewardManager.generateBonusRewards(baseReward, 'legendary')
      ];

      expect(bonusRewards[0].currency).toBe(baseReward.currency * 1.5);
      expect(bonusRewards[1].currency).toBe(baseReward.currency * 2.0);
      expect(bonusRewards[2].currency).toBe(baseReward.currency * 3.0);
    });

    test('should handle complex drop tables', () => {
      const commonItems = [
        { itemId: 'wood', weight: 100 },
        { itemId: 'stone', weight: 80 }
      ];

      const rareItems = [
        { itemId: 'iron_ore', weight: 30 },
        { itemId: 'gem', weight: 10 }
      ];

      const table = RewardUtils.createRareDropTable(commonItems, rareItems, 0.15);
      const dropResolver = new DropResolver(rng);

      // Test that rare items have reduced drop rates
      const testResults = dropResolver.testDropRates(table, 1000);
      const rareTotal = Array.from(testResults.entries())
        .filter(([item]) => ['iron_ore', 'gem'].includes(item))
        .reduce((sum, [, rate]) => sum + rate, 0);

      expect(rareTotal).toBeLessThan(0.2); // Should be less than 20% total
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid reward operations', () => {
      const reward = new RewardStub(100, 50);

      expect(() => reward.multiply(-1)).not.toThrow();
      expect(reward.currency).toBe(0); // Should be clamped

      const invalidReward = new RewardStub(-100, -50);
      expect(invalidReward.validate()).toHaveLength(2);
    });

    test('should handle invalid drop table operations', () => {
      const table = new DropTable();
      const invalidEntry = new (require('../index').DropEntry)('', -10);

      expect(table.addEntry(invalidEntry)).toBe(false);
      expect(table.entries).toHaveLength(0);

      expect(RewardUtils.validateDropTable(table)).toHaveLength(1);
    });

    test('should handle drop resolver errors', () => {
      const dropResolver = new DropResolver(rng);
      const emptyTable = new DropTable();

      expect(dropResolver.resolve(emptyTable)).toBeNull();
      expect(dropResolver.resolve(null as any)).toBeNull();
      expect(dropResolver.wouldDrop(emptyTable, 'test')).toBe(false);
      expect(dropResolver.getDropRate(emptyTable, 'test')).toBe(0);
    });

    test('should handle reward manager edge cases', () => {
      const reward = rewardManager.generateRewards('test', 1, 1);
      expect(reward.currency).toBe(5);
      expect(reward.xpGain).toBe(10);

      const customReward = rewardManager.generateRewardsCustom('test', 1, 1, 0, 0);
      expect(customReward.currency).toBe(0);
      expect(customReward.xpGain).toBe(0);
    });
  });

  describe('Performance Characteristics', () => {
    test('should handle large reward histories efficiently', () => {
      const rewards: RewardStub[] = [];

      // Generate many rewards
      for (let i = 0; i < 1000; i++) {
        const reward = rewardManager.generateRewards('performance_test', 10, 12);
        rewards.push(reward);
      }

      const startTime = performance.now();
      const totalValue = RewardUtils.calculateTotalValue(rewards);
      const endTime = performance.now();

      expect(totalValue).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(50); // Should be fast
    });

    test('should handle large drop tables efficiently', () => {
      const table = new DropTable();

      // Add many entries
      for (let i = 0; i < 100; i++) {
        table.addEntry(new (require('../index').DropEntry)(`item_${i}`, 10));
      }

      const dropResolver = new DropResolver(rng);

      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        rng.setNextFloat(500); // Middle of range
        dropResolver.resolve(table);
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be reasonably fast
    });

    test('should handle reward scaling changes efficiently', () => {
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        rewardManager.configureScaling(
          5 + i, 2 + i, 10 + i, 3 + i
        );
        rewardManager.generateRewards('scaling_test', 10, 15);
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // Should be fast
    });
  });
});