/**
 * SavePure.test.ts
 * 
 * Tests for SavePure module using actual SaveSnapshot and SaveManager classes
 */

import { describe, it, expect } from '@jest/globals';
import { SaveSnapshot, SaveManager, SaveUtils } from './index';

describe('SavePure', () => {
  describe('SaveSnapshot', () => {
    it('should create save snapshot with player ID and zone', () => {
      const playerId = SaveUtils.generatePlayerId();
      const snapshot = SaveSnapshot.create(playerId, 'test_zone', 'v1');
      
      expect(snapshot).toBeDefined();
      expect(snapshot.playerId).toBe(playerId);
      expect(snapshot.zone).toBe('test_zone');
      expect(snapshot.version).toBe('v1');
    });

    it('should add party member to snapshot', () => {
      const snapshot = SaveSnapshot.create('player_001', 'test_zone', 'v1');
      
      snapshot.addPartyMember({
        id: 'hero_001',
        name: 'Hero',
        level: 10,
        hp: 100,
        maxHp: 100,
        stats: { atk: 50, def: 30, spd: 40 },
        statusEffects: []
      });

      expect(snapshot.party.length).toBe(1);
      expect(snapshot.party[0]?.id).toBe('hero_001');
    });

    it('should add inventory items', () => {
      const snapshot = SaveSnapshot.create('player_001', 'test_zone', 'v1');
      
      snapshot.addInventoryItem('health_potion', 5);
      snapshot.addInventoryItem('sword', 1);

      expect(snapshot.inventory.size).toBe(2);
      expect(snapshot.inventory.get('health_potion')).toBe(5);
      expect(snapshot.inventory.get('sword')).toBe(1);
    });

    it('should set and get quest flags', () => {
      const snapshot = SaveSnapshot.create('player_001', 'test_zone', 'v1');
      
      snapshot.setQuestFlag('tutorial_complete', true);
      snapshot.setQuestFlag('boss_defeated', false);

      expect(snapshot.questFlags.get('tutorial_complete')).toBe(true);
      expect(snapshot.questFlags.get('boss_defeated')).toBe(false);
    });

    it('should unlock content', () => {
      const snapshot = SaveSnapshot.create('player_001', 'test_zone', 'v1');
      
      snapshot.unlockContent('area_forest');
      snapshot.unlockContent('dungeon_cave');

      expect(snapshot.unlockedContent.has('area_forest')).toBe(true);
      expect(snapshot.unlockedContent.has('dungeon_cave')).toBe(true);
    });

    it('should track statistics', () => {
      const snapshot = SaveSnapshot.create('player_001', 'test_zone', 'v1');
      
      snapshot.updateStatistic('enemies_defeated', 42);
      snapshot.updateStatistic('gold_collected', 1000);

      expect(snapshot.statistics.get('enemies_defeated')).toBe(42);
      expect(snapshot.statistics.get('gold_collected')).toBe(1000);
    });
  });

  describe('SaveManager', () => {
    it('should create save manager', () => {
      const manager = new SaveManager();
      expect(manager).toBeDefined();
    });

    it('should save snapshot', () => {
      const manager = new SaveManager();
      const snapshot = SaveSnapshot.create('player_001', 'test_zone', 'v1');
      
      const result = manager.save(snapshot);
      expect(result.ok).toBe(true);
    });

    it('should load snapshot', () => {
      const manager = new SaveManager();
      const snapshot = SaveSnapshot.create('player_001', 'test_zone', 'v1');
      
      manager.save(snapshot);
      const loadResult = manager.load(snapshot.playerId);
      
      expect(loadResult.ok).toBe(true);
      expect(loadResult.snapshot?.playerId).toBe('player_001');
    });

    it('should list all saves', () => {
      const manager = new SaveManager();
      
      const snapshot1 = SaveSnapshot.create('player_001', 'zone_1', 'v1');
      const snapshot2 = SaveSnapshot.create('player_002', 'zone_2', 'v1');
      
      manager.save(snapshot1);
      manager.save(snapshot2);
      
      const list = manager.listSaves();
      expect(list.length).toBeGreaterThanOrEqual(2);
    });

    it('should delete save', () => {
      const manager = new SaveManager();
      const snapshot = SaveSnapshot.create('player_999', 'test_zone', 'v1');
      
      manager.save(snapshot);
      const deleteResult = manager.deleteSave('player_999');
      
      expect(deleteResult.ok).toBe(true);
      
      const loadResult = manager.load('player_999');
      expect(loadResult.ok).toBe(false);
    });
  });

  describe('SaveUtils', () => {
    it('should generate unique player IDs', () => {
      const id1 = SaveUtils.generatePlayerId();
      const id2 = SaveUtils.generatePlayerId();
      
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });

    it('should generate checksums', () => {
      const data = { test: 'data' };
      const checksum = SaveUtils.generateChecksum(data);
      
      expect(typeof checksum).toBe('string');
      expect(checksum.length).toBeGreaterThan(0);
    });
  });
});
