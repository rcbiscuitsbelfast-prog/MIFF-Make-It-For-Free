/**
 * SavePure.test.ts
 * 
 * Tests for SavePure using actual SaveSnapshot and SaveManager implementations
 */

import { describe, it, expect } from '@jest/globals';
import { SaveSnapshot, SaveManager, SaveValidator, SaveUtils } from './index';

describe('SavePure', () => {
  describe('SaveSnapshot', () => {
    it('should create save snapshot', () => {
      const snapshot = new SaveSnapshot('player_001', 'test_zone', 'v1');
      
      expect(snapshot).toBeDefined();
      expect(snapshot.playerId).toBe('player_001');
      expect(snapshot.zoneId).toBe('test_zone');
      expect(snapshot.version).toBe('v1');
    });

    it('should use static create method', () => {
      const snapshot = SaveSnapshot.create('player_002', 'zone_2', 'v1');
      
      expect(snapshot).toBeDefined();
      expect(snapshot.playerId).toBe('player_002');
    });

    it('should add party member', () => {
      const snapshot = new SaveSnapshot('player_001', 'test_zone', 'v1');
      
      snapshot.addPartyMember({
        id: 'hero_001',
        name: 'Hero',
        level: 10,
        hp: 100,
        maxHp: 100
      });

      expect(snapshot.partyRoster.length).toBe(1);
      expect(snapshot.partyRoster[0]?.id).toBe('hero_001');
    });

    it('should manage inventory', () => {
      const snapshot = new SaveSnapshot('player_001', 'test_zone', 'v1');
      
      snapshot.addInventoryItem('health_potion', 5);
      snapshot.addInventoryItem('sword', 1);

      expect(snapshot.inventory['health_potion']).toBe(5);
      expect(snapshot.inventory['sword']).toBe(1);
    });

    it('should set quest flags', () => {
      const snapshot = new SaveSnapshot('player_001', 'test_zone', 'v1');
      
      snapshot.setQuestFlag('tutorial_complete', true);

      expect(snapshot.questFlags['tutorial_complete']).toBe(true);
    });

    it('should unlock content', () => {
      const snapshot = new SaveSnapshot('player_001', 'test_zone', 'v1');
      
      snapshot.unlockContent('area_forest');

      expect(snapshot.unlockedContent).toContain('area_forest');
    });

    it('should update statistics', () => {
      const snapshot = new SaveSnapshot('player_001', 'test_zone', 'v1');
      
      snapshot.updateStatistic('enemies_defeated', 42);

      expect(snapshot.statistics['enemies_defeated']).toBe(42);
    });

    it('should export to JSON', () => {
      const snapshot = new SaveSnapshot('player_001', 'test_zone', 'v1');
      const json = snapshot.toJSON();
      
      expect(json).toBeDefined();
      expect(typeof json).toBe('object');
    });

    it('should compute checksum', () => {
      const snapshot = new SaveSnapshot('player_001', 'test_zone', 'v1');
      const checksum = snapshot.computeChecksum();
      
      expect(typeof checksum).toBe('string');
      expect(checksum.length).toBeGreaterThan(0);
    });

    it('should validate snapshot', () => {
      const snapshot = new SaveSnapshot('player_001', 'test_zone', 'v1');
      const result = snapshot.validate();
      
      expect(result.isValid).toBeDefined();
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('SaveManager', () => {
    it('should create save manager', () => {
      const manager = new SaveManager();
      expect(manager).toBeDefined();
    });

    it('should validate snapshot', () => {
      const manager = new SaveManager();
      const snapshot = new SaveSnapshot('test_player', 'test_zone', 'v1');
      
      const result = manager.validateSnapshot(snapshot);
      expect(result).toBeDefined();
      expect(typeof result.isValid).toBe('boolean');
    });

    it('should migrate snapshot', () => {
      const manager = new SaveManager();
      const snapshot = new SaveSnapshot('test_player', 'test_zone', 'v1');
      
      const result = manager.migrateSnapshot(snapshot, 'v2');
      expect(result).toBeDefined();
      expect(result.snapshot).toBeDefined();
    });
  });

  describe('SaveValidator', () => {
    it('should create validator', () => {
      const validator = new SaveValidator();
      expect(validator).toBeDefined();
    });

    it('should validate snapshot', () => {
      const snapshot = new SaveSnapshot('player_001', 'test_zone', 'v1');
      const validator = new SaveValidator();
      
      const result = validator.validate(snapshot);
      expect(result).toBeDefined();
      expect(typeof result.isValid).toBe('boolean');
    });

    it('should validate version', () => {
      const validator = new SaveValidator();
      expect(validator.validateVersion('v1')).toBe(true);
      expect(validator.validateVersion('invalid')).toBe(false);
    });
  });

  describe('SaveUtils', () => {
    it('should generate unique player IDs', () => {
      const id1 = SaveUtils.generatePlayerId();
      const id2 = SaveUtils.generatePlayerId();
      
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
    });

    it('should create comprehensive test snapshot', () => {
      const snapshot = SaveUtils.createComprehensiveSnapshot();
      expect(snapshot).toBeDefined();
      expect(snapshot.playerId).toBeDefined();
      expect(snapshot.partyRoster.length).toBeGreaterThan(0);
    });
  });
});
