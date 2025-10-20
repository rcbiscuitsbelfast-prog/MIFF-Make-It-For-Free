/**
 * SavePure.test.ts
 * 
 * Tests for SavePure using actual SaveSnapshot implementation
 */

import { describe, it, expect } from '@jest/globals';
import { SaveSnapshot, SaveValidator } from './index';

describe('SavePure', () => {
  describe('SaveSnapshot', () => {
    it('should create save snapshot', () => {
      const snapshot = new SaveSnapshot('player_001', 'test_zone', 'v1');
      
      expect(snapshot).toBeDefined();
      expect(snapshot.playerId).toBe('player_001');
      expect(snapshot.zoneId).toBe('test_zone');
      expect(snapshot.version).toBe('v1');
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
      snapshot.setQuestFlag('boss_defeated', false);

      expect(snapshot.questFlags['tutorial_complete']).toBe(true);
      expect(snapshot.questFlags['boss_defeated']).toBe(false);
    });

    it('should track unlocked content', () => {
      const snapshot = new SaveSnapshot('player_001', 'test_zone', 'v1');
      
      snapshot.unlockContent('area_forest');
      snapshot.unlockContent('dungeon_cave');

      expect(snapshot.unlockedContent).toContain('area_forest');
      expect(snapshot.unlockedContent).toContain('dungeon_cave');
    });

    it('should update statistics', () => {
      const snapshot = new SaveSnapshot('player_001', 'test_zone', 'v1');
      
      snapshot.updateStatistic('enemies_defeated', 42);
      snapshot.updateStatistic('gold_collected', 1000);

      expect(snapshot.statistics['enemies_defeated']).toBe(42);
      expect(snapshot.statistics['gold_collected']).toBe(1000);
    });

    it('should export to JSON', () => {
      const snapshot = new SaveSnapshot('player_001', 'test_zone', 'v1');
      const json = snapshot.toJSON();
      
      expect(json).toBeDefined();
      expect(typeof json).toBe('object');
      expect(json.playerId).toBe('player_001');
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
  });
});
