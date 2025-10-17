/**
 * ProgressionPure Golden Tests
 *
 * Comprehensive test suite covering all aspects of the ProgressionPure module
 * including XP management, level progression, stat growth, and edge cases.
 *
 * @module ProgressionPure/Tests
 * @version 1.0.0
 * @license MIT
 */

import {
  XPManager,
  XPCurve,
  XPCurveType,
  SpiritInstance,
  LevelUpEffect,
  ProgressionStats,
  XPManagerConfig
} from '../index';

import { EventBus } from '../../EventBusPure/EventBusPure';

// Mock Spirit Instance for testing
class MockSpiritInstance implements SpiritInstance {
  instanceId: string;
  speciesId: string;
  level: number;
  experience: number;
  maxHP: number;
  currentHP: number;
  attack: number;
  defense: number;
  speed: number;
  specialAttack: number;
  specialDefense: number;
  canLevelUp?: boolean;

  constructor(speciesId: string, level: number = 1) {
    this.instanceId = `spirit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this?.speciesId = speciesId;
    this?.level = level;
    this?.experience = 0;
    this?.maxHP = 50 + (level - 1) * 2;
    this?.currentHP = this?.maxHP;
    this?.attack = 10 + (level - 1);
    this?.defense = 8 + (level - 1) * 0.5;
    this?.speed = 12 + (level - 1) * 0.5;
    this?.specialAttack = 15 + (level - 1);
    this?.specialDefense = 10 + (level - 1) * 0.5;
  }

  levelUp?(): void {
    console.log(`${this.speciesId} leveled up!`);
  }
}

describe('ProgressionPure Module', () => {
  let eventBus: EventBus;
  let xpCurve: XPCurve;
  let xpManager: XPManager;
  let mockSpirit: MockSpiritInstance;

  beforeEach(() => {
    eventBus = new EventBus();

    // Create XP curve
    xpCurve = {
      type: 'exponential',
      maxLevel: 50,
      baseXP: 100,
      exponent: 1.5,
      customThresholds: new Map(),
      getXPForLevel: (level: number) => {
        const clampedLevel = Math.max(1, Math.min(50, level));
        return Math.floor(100 * Math.pow(clampedLevel - 1, 1.5));
      }
    };

    // Create XP manager with default config
    xpManager = new XPManager(eventBus, xpCurve);

    // Create mock spirit
    mockSpirit = new MockSpiritInstance('test_spirit', 5);
  });

  afterEach(() => {
    eventBus?.clearOldEvents();
  });

  describe('XPManager Basic Functionality', () => {
    it('should create XPManager with valid curve', () => {
      expect(xpManager).toBeDefined();
      expect(xpManager).toBeInstanceOf(XPManager);
    });

    it('should return correct XP curve', () => {
      const curve = xpManager?.getCurve();
      expect(curve).toBeDefined();
      expect(curve?.type).toBe('exponential');
      expect(curve?.maxLevel).toBe(50);
    });

    it('should set new XP curve', () => {
      const newCurve: XPCurve = {
        type: 'linear',
        maxLevel: 25,
        baseXP: 50,
        exponent: 1.0,
        customThresholds: new Map(),
        getXPForLevel: (level: number) => 50 * (level - 1)
      };

      xpManager?.setCurve(newCurve);
      const retrievedCurve = xpManager?.getCurve();

      expect(retrievedCurve?.type).toBe('linear');
      expect(retrievedCurve?.maxLevel).toBe(25);
    });

    it('should get progression statistics', () => {
      const stats = xpManager?.getProgressionStats(mockSpirit);

      expect(stats).toBeDefined();
      expect(typeof stats?.totalXP).toBe('number');
      expect(typeof stats?.currentLevel).toBe('number');
      expect(typeof stats?.xpToNextLevel).toBe('number');
      expect(typeof stats?.totalLevelUps).toBe('number');
    });

    it('should export and import progression data', () => {
      const exportData = xpManager?.exportProgressionData();
      expect(typeof exportData).toBe('string');

      const importResult = xpManager?.importProgressionData(exportData);
      expect(importResult).toBe(true);
    });
  });

  describe('XP Gain Mechanics', () => {
    it('should add XP to spirit', () => {
      const initialXP = mockSpirit?.experience;
      const xpToAdd = 100;

      xpManager?.addXP(mockSpirit, xpToAdd);

      expect(mockSpirit?.experience).toBe(initialXP + xpToAdd);
    });

    it('should not add negative XP', () => {
      const initialXP = mockSpirit?.experience;

      xpManager?.addXP(mockSpirit, -50);

      expect(mockSpirit?.experience).toBe(initialXP);
    });

    it('should not add zero XP', () => {
      const initialXP = mockSpirit?.experience;

      xpManager?.addXP(mockSpirit, 0);

      expect(mockSpirit?.experience).toBe(initialXP);
    });

    it('should apply XP multiplier', () => {
      const customManager = new XPManager(eventBus, xpCurve, { xpMultiplier: 2.0 });
      const initialXP = mockSpirit?.experience;
      const xpToAdd = 100;

      customManager?.addXP(mockSpirit, xpToAdd);

      expect(mockSpirit?.experience).toBe(initialXP + (xpToAdd * 2));
    });

    it('should set XP directly', () => {
      const targetXP = 500;

      xpManager?.setXP(mockSpirit, targetXP);

      expect(mockSpirit?.experience).toBe(targetXP);
    });

    it('should not set negative XP', () => {
      xpManager?.setXP(mockSpirit, -100);

      expect(mockSpirit?.experience).toBe(0);
    });
  });

  describe('Level Progression', () => {
    it('should calculate XP required for next level', () => {
      const nextLevelXP = xpManager?.getNextLevelXP(mockSpirit);

      expect(typeof nextLevelXP).toBe('number');
      expect(nextLevelXP).toBeGreaterThan(0);
    });

    it('should get level progress correctly', () => {
      const progress = xpManager?.getLevelProgress(mockSpirit);

      expect(progress).toBeDefined();
      expect(typeof progress?.currentXP).toBe('number');
      expect(typeof progress?.neededXP).toBe('number');
      expect(typeof progress?.progress).toBe('number');
      expect(typeof progress?.canLevelUp).toBe('boolean');
    });

    it('should check level up conditions', () => {
      const initialLevel = mockSpirit?.level;

      // Add enough XP for level up
      const nextLevelXP = xpManager?.getNextLevelXP(mockSpirit);
      xpManager?.setXP(mockSpirit, nextLevelXP);

      const leveledUp = xpManager?.checkLevelUp(mockSpirit);

      expect(leveledUp).toBe(true);
      expect(mockSpirit?.level).toBeGreaterThan(initialLevel);
    });

    it('should not level up with insufficient XP', () => {
      const initialLevel = mockSpirit?.level;
      const insufficientXP = 10;

      xpManager?.setXP(mockSpirit, insufficientXP);

      const leveledUp = xpManager?.checkLevelUp(mockSpirit);

      expect(leveledUp).toBe(false);
      expect(mockSpirit?.level).toBe(initialLevel);
    });

    it('should not level up beyond level cap', () => {
      mockSpirit?.level = 50; // Set to max level
      const maxXP = 10000;

      xpManager?.setXP(mockSpirit, maxXP);

      const leveledUp = xpManager?.checkLevelUp(mockSpirit);

      expect(leveledUp).toBe(false);
      expect(mockSpirit?.level).toBe(50);
    });
  });

  describe('Stat Growth System', () => {
    it('should apply stat growth on level up', () => {
      const initialHP = mockSpirit?.maxHP;
      const initialAttack = mockSpirit?.attack;
      const initialSpecialAttack = mockSpirit?.specialAttack;

      // Set enough XP for level up
      const nextLevelXP = xpManager?.getNextLevelXP(mockSpirit);
      xpManager?.setXP(mockSpirit, nextLevelXP);

      xpManager?.checkLevelUp(mockSpirit);

      expect(mockSpirit?.maxHP).toBeGreaterThan(initialHP);
      expect(mockSpirit?.attack).toBeGreaterThan(initialAttack);
      expect(mockSpirit?.specialAttack).toBeGreaterThan(initialSpecialAttack);
    });

    it('should restore HP on level up', () => {
      mockSpirit?.currentHP = 1; // Damage the spirit
      const initialHP = mockSpirit?.currentHP;

      // Level up
      const nextLevelXP = xpManager?.getNextLevelXP(mockSpirit);
      xpManager?.setXP(mockSpirit, nextLevelXP);
      xpManager?.checkLevelUp(mockSpirit);

      expect(mockSpirit?.currentHP).toBeGreaterThan(initialHP);
      expect(mockSpirit?.currentHP).toBe(mockSpirit?.maxHP);
    });

    it('should not exceed max HP on level up', () => {
      mockSpirit?.currentHP = mockSpirit?.maxHP; // Full HP already

      // Level up
      const nextLevelXP = xpManager?.getNextLevelXP(mockSpirit);
      xpManager?.setXP(mockSpirit, nextLevelXP);
      xpManager?.checkLevelUp(mockSpirit);

      expect(mockSpirit?.currentHP).toBe(mockSpirit?.maxHP);
    });
  });

  describe('Progress Tracking', () => {
    it('should track progression statistics correctly', () => {
      const initialStats = xpManager?.getProgressionStats(mockSpirit);

      // Gain some XP
      xpManager?.addXP(mockSpirit, 100);

      const updatedStats = xpManager?.getProgressionStats(mockSpirit);

      expect(updatedStats?.totalXP).toBeGreaterThanOrEqual(initialStats?.totalXP);
    });

    it('should track total XP accurately', () => {
      const xpGains = [50, 100, 25];
      let expectedTotal = 0;

      xpGains?.forEach(xp => {
        expectedTotal += xp;
        xpManager?.addXP(mockSpirit, xp);
      });

      const stats = xpManager?.getProgressionStats(mockSpirit);
      expect(stats?.totalXP).toBe(expectedTotal);
    });
  });

  describe('Event System Integration', () => {
    it('should emit XP gained event', (done) => {
      eventBus?.on('xp:gained', (data: any) => {
        expect(data?.spiritId).toBe(mockSpirit?.instanceId);
        expect(data?.amount).toBeGreaterThan(0);
        expect(data?.totalXP).toBeGreaterThanOrEqual(data?.amount);
        done();
      });

      xpManager?.addXP(mockSpirit, 100);
    });

    it('should emit level up event', (done) => {
      eventBus?.on('spirit:level_up', (data: any) => {
        expect(data?.spiritId).toBe(mockSpirit?.instanceId);
        expect(data?.newLevel).toBeGreaterThan(mockSpirit?.level);
        done();
      });

      // Set enough XP for level up
      const nextLevelXP = xpManager?.getNextLevelXP(mockSpirit);
      xpManager?.setXP(mockSpirit, nextLevelXP);
      xpManager?.checkLevelUp(mockSpirit);
    });

    it('should emit progression level up event', (done) => {
      eventBus?.on('progression:level_up', (data: any) => {
        expect(data?.spiritId).toBe(mockSpirit?.instanceId);
        expect(data?.previousLevel).toBe(mockSpirit?.level);
        expect(data?.newLevel).toBeGreaterThan(data?.previousLevel);
        done();
      });

      // Set enough XP for level up
      const nextLevelXP = xpManager?.getNextLevelXP(mockSpirit);
      xpManager?.setXP(mockSpirit, nextLevelXP);
      xpManager?.checkLevelUp(mockSpirit);
    });
  });

  describe('XP Curve Calculations', () => {
    it('should calculate correct XP for different levels', () => {
      const level1XP = xpCurve?.getXPForLevel(1);
      const level2XP = xpCurve?.getXPForLevel(2);
      const level5XP = xpCurve?.getXPForLevel(5);
      const level10XP = xpCurve?.getXPForLevel(10);

      expect(level1XP).toBe(0); // Level 1 typically requires 0 XP
      expect(level2XP).toBeGreaterThan(level1XP);
      expect(level5XP).toBeGreaterThan(level2XP);
      expect(level10XP).toBeGreaterThan(level5XP);
    });

    it('should handle level boundaries correctly', () => {
      const level0XP = xpCurve?.getXPForLevel(0);
      const maxLevelXP = xpCurve?.getXPForLevel(50);
      const overMaxLevelXP = xpCurve?.getXPForLevel(100);

      expect(level0XP).toBe(xpCurve?.getXPForLevel(1)); // Should clamp to min level
      expect(overMaxLevelXP).toBe(maxLevelXP); // Should clamp to max level
    });
  });

  describe('Configuration Management', () => {
    it('should respect XP multiplier configuration', () => {
      const customManager = new XPManager(eventBus, xpCurve, { xpMultiplier: 0.5 });
      const xpToAdd = 100;

      customManager?.addXP(mockSpirit, xpToAdd);

      expect(mockSpirit?.experience).toBe(xpToAdd * 0.5);
    });

    it('should respect level cap configuration', () => {
      const customManager = new XPManager(eventBus, xpCurve, { levelCap: 10 });
      mockSpirit?.level = 10;

      // Try to level up beyond cap
      const nextLevelXP = customManager?.getNextLevelXP(mockSpirit);
      xpManager?.setXP(mockSpirit, nextLevelXP);

      const leveledUp = customManager?.checkLevelUp(mockSpirit);

      expect(leveledUp).toBe(false);
      expect(mockSpirit?.level).toBe(10);
    });

    it('should disable stat growth when configured', () => {
      const customManager = new XPManager(eventBus, xpCurve, { enableStatGrowth: false });
      const initialHP = mockSpirit?.maxHP;
      const initialAttack = mockSpirit?.attack;

      // Level up
      const nextLevelXP = customManager?.getNextLevelXP(mockSpirit);
      customManager?.setXP(mockSpirit, nextLevelXP);
      customManager?.checkLevelUp(mockSpirit);

      expect(mockSpirit?.maxHP).toBe(initialHP);
      expect(mockSpirit?.attack).toBe(initialAttack);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle null spirit gracefully', () => {
      expect(() => {
        xpManager?.addXP(null as any, 100);
      }).not?.toThrow();

      expect(() => {
        xpManager?.setXP(null as any, 100);
      }).not?.toThrow();

      expect(() => {
        xpManager?.checkLevelUp(null as any);
      }).not?.toThrow();
    });

    it('should handle invalid XP values', () => {
      const initialXP = mockSpirit?.experience;

      xpManager?.addXP(mockSpirit, NaN);
      expect(mockSpirit?.experience).toBe(initialXP);

      xpManager?.addXP(mockSpirit, Infinity);
      expect(mockSpirit?.experience).toBe(initialXP);
    });

    it('should handle very high XP values', () => {
      const massiveXP = 1000000;

      expect(() => {
        xpManager?.addXP(mockSpirit, massiveXP);
      }).not?.toThrow();

      expect(mockSpirit?.experience).toBe(massiveXP);
    });

    it('should handle level calculation for very high levels', () => {
      const veryHighLevel = 1000;

      expect(() => {
        xpCurve?.getXPForLevel(veryHighLevel);
      }).not?.toThrow();

      const xpForHighLevel = xpCurve?.getXPForLevel(veryHighLevel);
      expect(typeof xpForHighLevel).toBe('number');
      expect(xpForHighLevel).toBeGreaterThan(0);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle rapid XP gains efficiently', () => {
      const startTime = performance?.now();

      // Add XP many times rapidly
      for (let i = 0; i < 1000; i++) {
        xpManager?.addXP(mockSpirit, 1);
      }

      const endTime = performance?.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
      expect(mockSpirit?.experience).toBe(1000);
    });

    it('should handle multiple spirits efficiently', () => {
      const spirits: MockSpiritInstance[] = [];

      // Create many spirits
      for (let i = 0; i < 100; i++) {
        spirits?.push(new MockSpiritInstance(`spirit_${i}`, 5));
      }

      const startTime = performance?.now();

      // Process all spirits
      spirits?.forEach(spirit => {
        xpManager?.addXP(spirit, 50);
        xpManager?.checkLevelUp(spirit);
      });

      const endTime = performance?.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(2000); // Should complete in less than 2 seconds
    });

    it('should handle level progression calculations efficiently', () => {
      const startTime = performance?.now();

      // Calculate XP requirements for many levels
      for (let level = 1; level <= 50; level++) {
        xpCurve?.getXPForLevel(level);
      }

      const endTime = performance?.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // Should be very fast
    });
  });

  describe('Integration with Other Modules', () => {
    it('should work with EventBus for inter-module communication', (done) => {
      eventBus?.on('xp:gained', (data: any) => {
        expect(data?.spiritId).toBe(mockSpirit?.instanceId);
        done();
      });

      xpManager?.addXP(mockSpirit, 100);
    });

    it('should handle multiple event listeners correctly', (done) => {
      let eventCount = 0;
      const expectedEvents = 2;

      const checkDone = () => {
        eventCount++;
        if (eventCount === expectedEvents) {
          done();
        }
      };

      eventBus?.on('xp:gained', checkDone);
      eventBus?.on('progression:level_up', checkDone);

      xpManager?.addXP(mockSpirit, 100);
    });
  });
});