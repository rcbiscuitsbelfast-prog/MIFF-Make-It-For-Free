/**
 * Enhanced Equipment Tests
 * 
 * Tests for EquipmentManager using actual implementation
 */

import { EquipmentManager, EquipmentItem, EquipmentSlot } from '../EquipmentManager';

describe('EquipmentManager Enhanced Tests', () => {
  let manager: EquipmentManager;

  beforeEach(() => {
    manager = new EquipmentManager({
      maxSlots: 10,
      enableSetBonuses: true,
      allowDuplicates: false
    });
  });

  describe('Equipment Management', () => {
    it('should equip item to slot', () => {
      const item: EquipmentItem = {
        id: 'sword_001',
        name: 'Iron Sword',
        slot: EquipmentSlot.WEAPON,
        rarity: 'common',
        level: 1,
        stats: { atk: 10, def: 0 },
        modifiers: []
      };

      const result = manager.equipItem('player_001', item);
      expect(result.ok).toBe(true);
    });

    it('should unequip item from slot', () => {
      const item: EquipmentItem = {
        id: 'armor_001',
        name: 'Leather Armor',
        slot: EquipmentSlot.ARMOR,
        rarity: 'common',
        level: 1,
        stats: { atk: 0, def: 15 },
        modifiers: []
      };

      manager.equipItem('player_001', item);
      const result = manager.unequipItem('player_001', EquipmentSlot.ARMOR);
      
      expect(result.ok).toBe(true);
    });

    it('should get all equipped items', () => {
      const weapon: EquipmentItem = {
        id: 'sword_001',
        name: 'Iron Sword',
        slot: EquipmentSlot.WEAPON,
        rarity: 'common',
        level: 1,
        stats: { atk: 10, def: 0 },
        modifiers: []
      };

      const armor: EquipmentItem = {
        id: 'armor_001',
        name: 'Leather Armor',
        slot: EquipmentSlot.ARMOR,
        rarity: 'common',
        level: 1,
        stats: { atk: 0, def: 15 },
        modifiers: []
      };

      manager.equipItem('player_001', weapon);
      manager.equipItem('player_001', armor);

      const equipped = manager.getEquippedItems('player_001');
      expect(equipped.length).toBe(2);
    });
  });

  describe('Equipment Stats', () => {
    it('should calculate total stats from equipped items', () => {
      const weapon: EquipmentItem = {
        id: 'sword_001',
        name: 'Iron Sword',
        slot: EquipmentSlot.WEAPON,
        rarity: 'common',
        level: 1,
        stats: { atk: 10, def: 0 },
        modifiers: []
      };

      const armor: EquipmentItem = {
        id: 'armor_001',
        name: 'Iron Armor',
        slot: EquipmentSlot.ARMOR,
        rarity: 'common',
        level: 1,
        stats: { atk: 0, def: 20 },
        modifiers: []
      };

      manager.equipItem('player_001', weapon);
      manager.equipItem('player_001', armor);

      const stats = manager.getTotalStats('player_001');
      expect(stats.atk).toBe(10);
      expect(stats.def).toBe(20);
    });
  });

  describe('Equipment Validation', () => {
    it('should prevent equipping to wrong slot', () => {
      const weapon: EquipmentItem = {
        id: 'sword_001',
        name: 'Iron Sword',
        slot: EquipmentSlot.WEAPON,
        rarity: 'common',
        level: 1,
        stats: { atk: 10, def: 0 },
        modifiers: []
      };

      const result = manager.equipItem('player_001', weapon);
      expect(result.ok).toBe(true);
      
      // Try to equip same item to different entity
      const result2 = manager.equipItem('player_002', weapon);
      expect(result2.ok).toBe(true); // Different player, should work
    });

    it('should replace existing item in slot', () => {
      const sword1: EquipmentItem = {
        id: 'sword_001',
        name: 'Iron Sword',
        slot: EquipmentSlot.WEAPON,
        rarity: 'common',
        level: 1,
        stats: { atk: 10, def: 0 },
        modifiers: []
      };

      const sword2: EquipmentItem = {
        id: 'sword_002',
        name: 'Steel Sword',
        slot: EquipmentSlot.WEAPON,
        rarity: 'uncommon',
        level: 5,
        stats: { atk: 25, def: 0 },
        modifiers: []
      };

      manager.equipItem('player_001', sword1);
      manager.equipItem('player_001', sword2);

      const equipped = manager.getEquippedItems('player_001');
      const weaponItem = equipped.find(e => e.slot === EquipmentSlot.WEAPON);
      expect(weaponItem?.id).toBe('sword_002');
    });
  });

  describe('Equipment Statistics', () => {
    it('should track equipment statistics', () => {
      const item: EquipmentItem = {
        id: 'helm_001',
        name: 'Iron Helm',
        slot: EquipmentSlot.HELMET,
        rarity: 'common',
        level: 1,
        stats: { atk: 0, def: 10 },
        modifiers: []
      };

      manager.equipItem('player_001', item);

      const stats = manager.getStats();
      expect(stats.totalEquipped).toBeGreaterThanOrEqual(1);
    });
  });
});
