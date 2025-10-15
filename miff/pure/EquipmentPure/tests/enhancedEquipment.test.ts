/**
 * EquipmentPure Enhanced Tests
 *
 * Comprehensive test suite for advanced EquipmentPure functionality
 * including equipment modification, set bonuses, comparisons, and previews.
 *
 * @module EquipmentPure/EnhancedTests
 * @version 1.0.0
 * @license MIT
 */

  EquipmentManager,
  StatModifier,
  Enchantment,
  EquipmentSet,
  SetBonus,
  ItemRarity,
  EquipmentOutput
} from '../index';

/**
 * Mock inventory for testing
 */
class MockInventory {
  private items = new Map<string, number>();

  getQuantity(itemId: string): number {
    return this.items.get(itemId) || 0;
  }

  addItem(itemId: string, quantity: number): void {
    this.items.set(itemId, this.getQuantity(itemId) + quantity);
  }

  removeItem(itemId: string, quantity: number): boolean {
    const current = this.getQuantity(itemId);
    if (current >= quantity) {
      this.items.set(itemId, current - quantity);
      return true;
    }
    return false;
  }
}

/**
 * Mock catalog lookup for testing
 */
const mockCatalog = (itemId: string) => {
  const catalog = {
    'sword_1': {
      id: 'sword_1',
      name: 'Basic Sword',
      slot: 'weapon',
      modifiers: [{ stat: 'atk', value: 10, type: 'additive' as const, source: 'catalog' }],
      rarity: 'common' as ItemRarity,
      level: 1
    },
    'armor_1': {
      id: 'armor_1',
      name: 'Basic Armor',
      slot: 'armor',
      modifiers: [{ stat: 'def', value: 5, type: 'additive' as const, source: 'catalog' }],
      rarity: 'common' as ItemRarity,
      level: 1
    },
    'sword_2': {
      id: 'sword_2',
      name: 'Enhanced Sword',
      slot: 'weapon',
      modifiers: [{ stat: 'atk', value: 15, type: 'additive' as const, source: 'catalog' }],
      rarity: 'rare' as ItemRarity,
      level: 3
    },
    'set_weapon': {
      id: 'set_weapon',
      name: 'Dragon Sword',
      slot: 'weapon',
      modifiers: [{ stat: 'atk', value: 20, type: 'additive' as const, source: 'catalog' }],
      set: 'dragon_set',
      rarity: 'legendary' as ItemRarity,
      level: 5
    },
    'set_armor': {
      id: 'set_armor',
      name: 'Dragon Armor',
      slot: 'armor',
      modifiers: [{ stat: 'def', value: 15, type: 'additive' as const, source: 'catalog' }],
      set: 'dragon_set',
      rarity: 'legendary' as ItemRarity,
      level: 5
    }
  };

  return catalog[itemId as keyof typeof catalog];
};

describe('EquipmentPure Enhanced Functionality', () => {
  let manager: EquipmentManager;
  let inventory: MockInventory;

  beforeEach(() => {
    inventory = new MockInventory();
    manager = new EquipmentManager({}, inventory);

    // Add items to inventory
    inventory.addItem('sword_1', 1);
    inventory.addItem('armor_1', 1);
    inventory.addItem('sword_2', 1);
    inventory.addItem('set_weapon', 1);
    inventory.addItem('set_armor', 1);
  });

  describe('Equipment Modification', () => {
    test('should modify equipment stats', () => {
      // Equip basic sword
      const equipResult = manager.equip('sword_1', 'weapon', mockCatalog);
      expect(equipResult.status).toBe('ok');

      // Modify the equipment
      const modifyResult = manager.modifyEquipment('weapon', {
        name: 'Modified Sword',
        level: 5,
        rarity: 'rare',
        durability: 75
      });

      expect(modifyResult.status).toBe('ok');
      const modifiedItem = modifyResult.result as any;
      expect(modifiedItem.name).toBe('Modified Sword');
      expect(modifiedItem.level).toBe(5);
      expect(modifiedItem.rarity).toBe('rare');
      expect(modifiedItem.durability).toBe(75);
    });

    test('should modify equipment modifiers', () => {
      // Equip basic sword
      manager.equip('sword_1', 'weapon', mockCatalog);

      // Modify modifiers
      const newModifiers: StatModifier[] = [
        { stat: 'atk', value: 25, type: 'additive', source: 'modification' },
        { stat: 'spd', value: 5, type: 'additive', source: 'modification' }
      ];

      const modifyResult = manager.modifyEquipment('weapon', {
        modifiers: newModifiers
      });

      expect(modifyResult.status).toBe('ok');
      const modifiedItem = modifyResult.result as any;
      expect(modifiedItem.modifiers).toHaveLength(2);
      expect(modifiedItem.modifiers[0].stat).toBe('atk');
      expect(modifiedItem.modifiers[0].value).toBe(25);
    });

    test('should modify enchantments', () => {
      // Equip basic sword
      manager.equip('sword_1', 'weapon', mockCatalog);

      // Add enchantment
      const enchantment: Enchantment = {
        id: 'fire_enchant',
        name: 'Fire Enchantment',
        level: 3,
        effects: [{ stat: 'atk', value: 10, type: 'additive', source: 'enchantment' }]
      };

      const addResult = manager.addEnchantment('weapon', enchantment);
      expect(addResult.status).toBe('ok');

      // Modify enchantments
      const newEnchantments: Enchantment[] = [
        {
          id: 'ice_enchant',
          name: 'Ice Enchantment',
          level: 4,
          effects: [{ stat: 'def', value: 8, type: 'additive', source: 'enchantment' }]
        }
      ];

      const modifyResult = manager.modifyEquipment('weapon', {
        enchantments: newEnchantments
      });

      expect(modifyResult.status).toBe('ok');
      const modifiedItem = modifyResult.result as any;
      expect(modifiedItem.enchantments).toHaveLength(1);
      expect(modifiedItem.enchantments[0].name).toBe('Ice Enchantment');
    });
  });

  describe('Equipment Sets', () => {
    test('should add and retrieve equipment sets', () => {
      const dragonSet: EquipmentSet = {
        id: 'dragon_set',
        name: 'Dragon Set',
        pieces: ['weapon', 'armor', 'helmet', 'boots'],
        bonuses: [
          {
            piecesRequired: 2,
            bonuses: [{ stat: 'atk', value: 5, type: 'additive', source: 'set' }],
            description: '2-piece bonus: +5 ATK'
          },
          {
            piecesRequired: 4,
            bonuses: [
              { stat: 'atk', value: 15, type: 'additive', source: 'set' },
              { stat: 'def', value: 10, type: 'additive', source: 'set' }
            ],
            description: '4-piece bonus: +15 ATK, +10 DEF'
          }
        ]
      };

      const addResult = manager.addEquipmentSet(dragonSet);
      expect(addResult.status).toBe('ok');

      const activeSets = manager.getActiveSets();
      expect(activeSets.status).toBe('ok');
      const sets = activeSets.result as any[];
      expect(sets).toHaveLength(1);
      expect(sets[0].set.id).toBe('dragon_set');
    });

    test('should activate set bonuses when enough pieces are equipped', () => {
      // Add dragon set
      const dragonSet: EquipmentSet = {
        id: 'dragon_set',
        name: 'Dragon Set',
        pieces: ['weapon', 'armor'],
        bonuses: [
          {
            piecesRequired: 2,
            bonuses: [
              { stat: 'atk', value: 10, type: 'additive', source: 'set' },
              { stat: 'def', value: 8, type: 'additive', source: 'set' }
            ],
            description: '2-piece bonus: +10 ATK, +8 DEF'
          }
        ]
      };

      manager.addEquipmentSet(dragonSet);

      // Equip set pieces
      manager.equip('set_weapon', 'weapon', mockCatalog);
      manager.equip('set_armor', 'armor', mockCatalog);

      const activeSets = manager.getActiveSets();
      const sets = activeSets.result as any[];
      expect(sets[0].activePieces).toBe(2);
      expect(sets[0].bonuses).toHaveLength(1);
      expect(sets[0].bonuses[0].bonuses).toHaveLength(2);
    });

    test('should get all modifiers including set bonuses', () => {
      // Add dragon set
      const dragonSet: EquipmentSet = {
        id: 'dragon_set',
        name: 'Dragon Set',
        pieces: ['weapon', 'armor'],
        bonuses: [
          {
            piecesRequired: 2,
            bonuses: [
              { stat: 'atk', value: 10, type: 'additive', source: 'set' },
              { stat: 'def', value: 8, type: 'additive', source: 'set' }
            ],
            description: '2-piece bonus: +10 ATK, +8 DEF'
          }
        ]
      };

      manager.addEquipmentSet(dragonSet);

      // Equip regular items first
      manager.equip('sword_1', 'weapon', mockCatalog);
      manager.equip('armor_1', 'armor', mockCatalog);

      const basicModifiers = manager.getModifiers();
      expect(basicModifiers.result).toHaveLength(2); // 1 ATK + 1 DEF modifier

      // Replace with set items
      manager.unequip('weapon');
      manager.unequip('armor');
      manager.equip('set_weapon', 'weapon', mockCatalog);
      manager.equip('set_armor', 'armor', mockCatalog);

      const allModifiers = manager.getAllModifiers();
      const modifiers = allModifiers.result as StatModifier[];
      expect(modifiers).toHaveLength(4); // 2 base modifiers + 2 set bonuses
    });
  });

  describe('Equipment Comparison', () => {
    test('should compare equipment with upgrade recommendation', () => {
      // Equip basic sword
      manager.equip('sword_1', 'weapon', mockCatalog);

      // Compare with enhanced sword
      const comparison = manager.compareEquipment('weapon', 'sword_2', mockCatalog);
      expect(comparison.status).toBe('ok');
      const result = comparison.result as any;

      expect(result.recommendation).toBe('upgrade');
      expect(result.differences.atk.change).toBe('upgrade');
      expect(result.differences.level.change).toBe('upgrade');
      expect(result.differences.rarity.change).toBe('upgrade');
    });

    test('should compare equipment with downgrade recommendation', () => {
      // Equip enhanced sword first
      manager.equip('sword_2', 'weapon', mockCatalog);

      // Compare with basic sword
      const comparison = manager.compareEquipment('weapon', 'sword_1', mockCatalog);
      expect(comparison.status).toBe('ok');
      const result = comparison.result as any;

      expect(result.recommendation).toBe('downgrade');
      expect(result.differences.atk.change).toBe('downgrade');
    });

    test('should compare equipment with neutral recommendation', () => {
      // Compare sword with itself
      manager.equip('sword_1', 'weapon', mockCatalog);

      const comparison = manager.compareEquipment('weapon', 'sword_1', mockCatalog);
      expect(comparison.status).toBe('ok');
      const result = comparison.result as any;

      expect(result.recommendation).toBe('neutral');
      expect(Object.keys(result.differences)).toHaveLength(0);
    });
  });

  describe('Equipment Preview', () => {
    test('should preview equipment changes', () => {
      // Equip basic sword
      manager.equip('sword_1', 'weapon', mockCatalog);

      // Preview enhanced sword
      const preview = manager.previewEquipment('sword_2', mockCatalog);
      expect(preview.status).toBe('ok');
      const result = preview.result as any;

      expect(result.changes.totalItems).toBe(1);
      expect(result.changes.averageLevel).toBeGreaterThan(0);
      // The preview calculation shows the total modifiers including both items temporarily
      expect(result.changes.totalModifiers).toBe(1);
    });

    test('should preview equipment for empty slot', () => {
      // Don't equip anything in weapon slot

      // Preview sword
      const preview = manager.previewEquipment('sword_1', mockCatalog);
      expect(preview.status).toBe('ok');
      const result = preview.result as any;

      expect(result.changes.totalItems).toBe(1);
      expect(result.changes.averageLevel).toBeGreaterThan(0);
      expect(result.changes.totalModifiers).toBe(1); // Adding one modifier
    });
  });

  describe('Equipment Enhancement', () => {
    test('should enhance equipment durability', () => {
      // Equip sword
      manager.equip('sword_1', 'weapon', mockCatalog);

      // Update durability
      const durabilityResult = manager.updateDurability('weapon', 50);
      expect(durabilityResult.status).toBe('ok');
      const item = durabilityResult.result as any;
      expect(item.durability).toBe(50);
    });

    test('should repair equipment durability', () => {
      // Equip sword
      manager.equip('sword_1', 'weapon', mockCatalog);

      // Set low durability
      manager.updateDurability('weapon', 10);

      // Repair fully
      const repairResult = manager.repairItem('weapon');
      expect(repairResult.status).toBe('ok');
      const item = repairResult.result as any;
      expect(item.durability).toBe(100); // Max durability
    });

    test('should repair equipment durability partially', () => {
      // Equip sword
      manager.equip('sword_1', 'weapon', mockCatalog);

      // Set low durability
      manager.updateDurability('weapon', 10);

      // Repair partially
      const repairResult = manager.repairItem('weapon', 20);
      expect(repairResult.status).toBe('ok');
      const item = repairResult.result as any;
      expect(item.durability).toBe(20); // Specified repair amount
    });
  });

  describe('Equipment Management', () => {
    test('should remove equipment sets', () => {
      // Add dragon set
      const dragonSet: EquipmentSet = {
        id: 'dragon_set',
        name: 'Dragon Set',
        pieces: ['weapon', 'armor'],
        bonuses: []
      };

      manager.addEquipmentSet(dragonSet);
      expect(manager.getActiveSets().result).toHaveLength(1);

      // Remove set
      const removeResult = manager.removeEquipmentSet('dragon_set');
      expect(removeResult.status).toBe('ok');
      expect(manager.getActiveSets().result).toHaveLength(0);
    });

    test('should handle equipment set removal errors', () => {
      const removeResult = manager.removeEquipmentSet('nonexistent_set');
      expect(removeResult.status).toBe('error');
      expect(removeResult.issues).toContain('Equipment set nonexistent_set does not exist');
    });
  });
});