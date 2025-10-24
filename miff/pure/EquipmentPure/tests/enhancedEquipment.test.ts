/**
 * Enhanced Equipment Tests
 * 
 * Tests for EquipmentManager using actual implementation
 */

import { EquipmentManager, EquippedItem, StatModifier } from '../EquipmentManager';

describe('EquipmentManager Enhanced Tests', () => {
  let manager: EquipmentManager;
  let catalog: Map<string, Omit<EquippedItem, 'source'>>;

  beforeEach(() => {
    manager = new EquipmentManager();
    catalog = new Map();
    
    // Add test items to catalog
    catalog.set('sword_001', {
      id: 'sword_001',
      name: 'Iron Sword',
      slot: 'weapon',
      rarity: 'common',
      level: 1,
      modifiers: [{ stat: 'atk', value: 10, type: 'additive', source: 'sword_001' }]
    });
    
    catalog.set('sword_002', {
      id: 'sword_002',
      name: 'Steel Sword',
      slot: 'weapon',
      rarity: 'uncommon',
      level: 5,
      modifiers: [{ stat: 'atk', value: 25, type: 'additive', source: 'sword_002' }]
    });
    
    catalog.set('armor_001', {
      id: 'armor_001',
      name: 'Leather Armor',
      slot: 'armor',
      rarity: 'common',
      level: 1,
      modifiers: [{ stat: 'def', value: 5, type: 'additive', source: 'armor_001' }]
    });
    
    catalog.set('helm_001', {
      id: 'helm_001',
      name: 'Iron Helm',
      slot: 'helmet',
      rarity: 'common',
      level: 1,
      modifiers: [{ stat: 'def', value: 10, type: 'additive', source: 'helm_001' }]
    });
  });

  const catalogLookup = (id: string) => catalog.get(id);

  describe('Equipment Management', () => {
    it('should equip item to slot', () => {
      const result = manager.equip('sword_001', 'weapon', catalogLookup);
      expect(result.status).toBe('ok');
    });

    it('should unequip item from slot', () => {
      manager.equip('armor_001', 'armor', catalogLookup);
      const result = manager.unequip('armor');
      expect(result.status).toBe('ok');
    });

    it('should get equipped items', () => {
      manager.equip('sword_001', 'weapon', catalogLookup);
      manager.equip('armor_001', 'armor', catalogLookup);

      const slots = manager.listSlots();
      expect(slots.status).toBe('ok');
      expect(Array.isArray(slots.result)).toBe(true);
    });

    it('should handle item replacement', () => {
      manager.equip('sword_001', 'weapon', catalogLookup);
      manager.equip('sword_002', 'weapon', catalogLookup);

      const equippedResult = manager.getEquipped('weapon');
      expect(equippedResult.status).toBe('ok');
      expect(equippedResult.result?.id).toBe('sword_002');
    });
  });

  describe('Equipment Statistics', () => {
    it('should track equipment statistics', () => {
      manager.equip('helm_001', 'helmet', catalogLookup);

      const stats = manager.getStats();
      expect(stats.result?.totalItems).toBeGreaterThanOrEqual(1);
    });
  });
});
