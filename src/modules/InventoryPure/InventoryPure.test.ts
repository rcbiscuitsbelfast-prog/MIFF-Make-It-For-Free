/**
 * InventoryPure.test.ts
 * 
 * Tests for InventoryPure module covering ECS components, item management, and Torque persistence.
 */

import { 
  InventoryManager, 
  ItemDefinition, 
  ItemInstance, 
  InventoryComponent,
  InventoryTransaction,
  InventoryObserver 
} from '../../../miff/pure/InventoryPure/InventoryPure';

describe('InventoryPure', () => {
  let manager: InventoryManager;
  let sampleItems: ItemDefinition[];

  beforeEach(() => {
    manager = new InventoryManager();
    
    // Create sample items
    sampleItems = [
      {
        id: 'sword',
        name: 'Iron Sword',
        description: 'A basic iron sword',
        type: 'weapon',
        rarity: 'common',
        weight: 3.0,
        value: 50,
        stackable: false,
        maxStack: 1,
        properties: { damage: 10, durability: 100 }
      },
      {
        id: 'health_potion',
        name: 'Health Potion',
        description: 'Restores health',
        type: 'consumable',
        rarity: 'common',
        weight: 0.5,
        value: 25,
        stackable: true,
        maxStack: 10,
        properties: { healAmount: 50 }
      },
      {
        id: 'leather_armor',
        name: 'Leather Armor',
        description: 'Light leather armor',
        type: 'armor',
        rarity: 'uncommon',
        weight: 5.0,
        value: 75,
        stackable: false,
        maxStack: 1,
        properties: { defense: 5, durability: 80 }
      },
      {
        id: 'gold_coin',
        name: 'Gold Coin',
        description: 'Currency',
        type: 'currency',
        rarity: 'common',
        weight: 0.01,
        value: 1,
        stackable: true,
        maxStack: 999,
        properties: {}
      }
    ];

    // Register items
    sampleItems.forEach(item => manager.registerItem(item));
  });

  describe('Item Definition Management', () => {
    it('should register and retrieve item definitions', () => {
      const sword = manager.getItemDefinition('sword');
      expect(sword).toBeDefined();
      expect(sword?.name).toBe('Iron Sword');
      expect(sword?.type).toBe('weapon');
    });

    it('should return undefined for non-existent items', () => {
      const nonExistent = manager.getItemDefinition('non_existent');
      expect(nonExistent).toBeUndefined();
    });

    it('should return all item definitions', () => {
      const allItems = manager.getAllItemDefinitions();
      expect(allItems).toHaveLength(4);
      expect(allItems.map(item => item.id)).toContain('sword');
      expect(allItems.map(item => item.id)).toContain('health_potion');
    });
  });

  describe('Inventory Management', () => {
    it('should create inventory for entity', () => {
      const inventory = manager.createInventory('player1', 50, 10);
      
      expect(inventory.entityId).toBe('player1');
      expect(inventory.maxWeight).toBe(50);
      expect(inventory.maxSlots).toBe(10);
      expect(inventory.items.size).toBe(0);
      expect(inventory.equipped.size).toBe(0);
      expect(inventory.currency.size).toBe(0);
    });

    it('should retrieve created inventory', () => {
      manager.createInventory('player1');
      const inventory = manager.getInventory('player1');
      
      expect(inventory).toBeDefined();
      expect(inventory?.entityId).toBe('player1');
    });

    it('should return undefined for non-existent inventory', () => {
      const inventory = manager.getInventory('non_existent');
      expect(inventory).toBeUndefined();
    });
  });

  describe('Item Operations', () => {
    beforeEach(() => {
      manager.createInventory('player1', 100, 20);
    });

    it('should add item to inventory', () => {
      const success = manager.addItem('player1', 'sword');
      expect(success).toBe(true);
      
      const inventory = manager.getInventory('player1');
      expect(inventory?.items.size).toBe(1);
    });

    it('should not add item to non-existent inventory', () => {
      const success = manager.addItem('non_existent', 'sword');
      expect(success).toBe(false);
    });

    it('should not add non-existent item', () => {
      const success = manager.addItem('player1', 'non_existent');
      expect(success).toBe(false);
    });

    it('should respect weight limits', () => {
      // Create inventory with very low weight limit
      manager.createInventory('player2', 1, 20);
      
      const success = manager.addItem('player2', 'sword'); // Weight: 3.0
      expect(success).toBe(false);
    });

    it('should stack stackable items', () => {
      manager.addItem('player1', 'health_potion', 5);
      manager.addItem('player1', 'health_potion', 3);
      
      const inventory = manager.getInventory('player1');
      expect(inventory?.items.size).toBe(1); // Should be stacked
      
      const item = Array.from(inventory!.items.values())[0];
      expect(item.quantity).toBe(8);
    });

    it('should not exceed max stack size', () => {
      manager.addItem('player1', 'health_potion', 10); // Max stack
      const success = manager.addItem('player1', 'health_potion', 1);
      expect(success).toBe(false);
    });

    it('should remove items from inventory', () => {
      manager.addItem('player1', 'sword');
      const success = manager.removeItem('player1', 'slot_0');
      expect(success).toBe(true);
      
      const inventory = manager.getInventory('player1');
      expect(inventory?.items.size).toBe(0);
    });

    it('should remove partial quantities', () => {
      manager.addItem('player1', 'health_potion', 5);
      const success = manager.removeItem('player1', 'slot_0', 2);
      expect(success).toBe(true);
      
      const inventory = manager.getInventory('player1');
      const item = Array.from(inventory!.items.values())[0];
      expect(item.quantity).toBe(3);
    });

    it('should move items between slots', () => {
      manager.addItem('player1', 'sword', 1, 'slot_0');
      const success = manager.moveItem('player1', 'slot_0', 'slot_5');
      expect(success).toBe(true);
      
      const inventory = manager.getInventory('player1');
      expect(inventory?.items.has('slot_0')).toBe(false);
      expect(inventory?.items.has('slot_5')).toBe(true);
    });

    it('should not move to occupied slot', () => {
      manager.addItem('player1', 'sword', 1, 'slot_0');
      manager.addItem('player1', 'health_potion', 1, 'slot_5');
      
      const success = manager.moveItem('player1', 'slot_0', 'slot_5');
      expect(success).toBe(false);
    });
  });

  describe('Equipment System', () => {
    beforeEach(() => {
      manager.createInventory('player1');
      manager.addItem('player1', 'sword', 1, 'slot_0');
      manager.addItem('player1', 'leather_armor', 1, 'slot_1');
    });

    it('should equip weapon', () => {
      const success = manager.equipItem('player1', 'slot_0', 'weapon_slot');
      expect(success).toBe(true);
      
      const inventory = manager.getInventory('player1');
      expect(inventory?.equipped.get('weapon_slot')).toBeDefined();
    });

    it('should equip armor', () => {
      const success = manager.equipItem('player1', 'slot_1', 'chest_slot');
      expect(success).toBe(true);
      
      const inventory = manager.getInventory('player1');
      expect(inventory?.equipped.get('chest_slot')).toBeDefined();
    });

    it('should not equip non-equippable items', () => {
      manager.addItem('player1', 'health_potion', 1, 'slot_2');
      const success = manager.equipItem('player1', 'slot_2', 'weapon_slot');
      expect(success).toBe(false);
    });

    it('should unequip items', () => {
      manager.equipItem('player1', 'slot_0', 'weapon_slot');
      const success = manager.unequipItem('player1', 'weapon_slot');
      expect(success).toBe(true);
      
      const inventory = manager.getInventory('player1');
      expect(inventory?.equipped.has('weapon_slot')).toBe(false);
    });

    it('should replace equipped items', () => {
      manager.equipItem('player1', 'slot_0', 'weapon_slot');
      manager.addItem('player1', 'sword', 1, 'slot_3'); // Another sword
      manager.equipItem('player1', 'slot_3', 'weapon_slot');
      
      const inventory = manager.getInventory('player1');
      expect(inventory?.equipped.get('weapon_slot')).toBeDefined();
    });
  });

  describe('Item Usage', () => {
    beforeEach(() => {
      manager.createInventory('player1');
      manager.addItem('player1', 'health_potion', 3);
    });

    it('should use consumable items', () => {
      const success = manager.useItem('player1', 'slot_0');
      expect(success).toBe(true);
      
      const inventory = manager.getInventory('player1');
      const item = Array.from(inventory!.items.values())[0];
      expect(item.quantity).toBe(2);
    });

    it('should remove item when quantity reaches zero', () => {
      manager.useItem('player1', 'slot_0'); // 3 -> 2
      manager.useItem('player1', 'slot_0'); // 2 -> 1
      manager.useItem('player1', 'slot_0'); // 1 -> 0, should remove
      
      const inventory = manager.getInventory('player1');
      expect(inventory?.items.size).toBe(0);
    });

    it('should not use non-consumable items', () => {
      manager.addItem('player1', 'sword', 1, 'slot_1');
      const success = manager.useItem('player1', 'slot_1');
      expect(success).toBe(false);
    });

    it('should track last used timestamp', () => {
      const beforeUse = Date.now();
      manager.useItem('player1', 'slot_0');
      const afterUse = Date.now();
      
      const inventory = manager.getInventory('player1');
      const item = Array.from(inventory!.items.values())[0];
      expect(item.lastUsed).toBeGreaterThanOrEqual(beforeUse);
      expect(item.lastUsed).toBeLessThanOrEqual(afterUse);
    });
  });

  describe('Currency Management', () => {
    beforeEach(() => {
      manager.createInventory('player1');
    });

    it('should add currency', () => {
      const success = manager.addCurrency('player1', 'gold', 100);
      expect(success).toBe(true);
      
      const inventory = manager.getInventory('player1');
      expect(inventory?.currency.get('gold')).toBe(100);
    });

    it('should remove currency', () => {
      manager.addCurrency('player1', 'gold', 100);
      const success = manager.removeCurrency('player1', 'gold', 30);
      expect(success).toBe(true);
      
      const inventory = manager.getInventory('player1');
      expect(inventory?.currency.get('gold')).toBe(70);
    });

    it('should not remove more currency than available', () => {
      manager.addCurrency('player1', 'gold', 50);
      const success = manager.removeCurrency('player1', 'gold', 100);
      expect(success).toBe(false);
      
      const inventory = manager.getInventory('player1');
      expect(inventory?.currency.get('gold')).toBe(50); // Unchanged
    });
  });

  describe('Query and Search', () => {
    beforeEach(() => {
      manager.createInventory('player1');
      manager.createInventory('player2');
      
      // Add various items to player1
      manager.addItem('player1', 'sword');
      manager.addItem('player1', 'health_potion', 5);
      manager.addItem('player1', 'leather_armor');
      
      // Add items to player2
      manager.addItem('player2', 'sword');
      manager.addItem('player2', 'health_potion', 2);
    });

    it('should query by entity', () => {
      const results = manager.queryInventory({ entityId: 'player1' });
      expect(results.length).toBe(3);
    });

    it('should query by item type', () => {
      const results = manager.queryInventory({ itemType: 'weapon' });
      expect(results.length).toBe(2); // Two swords (player1 and player2)
    });

    it('should query by rarity', () => {
      const results = manager.queryInventory({ rarity: 'uncommon' });
      expect(results.length).toBe(1); // One leather armor
    });

    it('should query by value range', () => {
      const results = manager.queryInventory({ minValue: 50, maxValue: 100 });
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('should combine multiple query filters', () => {
      const results = manager.queryInventory({ 
        entityId: 'player1',
        itemType: 'consumable'
      });
      expect(results.length).toBe(1); // One health potion stack
    });
  });

  describe('Observer System', () => {
    let observer: InventoryObserver;
    let receivedTransactions: InventoryTransaction[];

    beforeEach(() => {
      manager.createInventory('player1');
      receivedTransactions = [];
      
      observer = {
        id: 'test_observer',
        onItemAdded: (transaction) => receivedTransactions.push(transaction),
        onItemRemoved: (transaction) => receivedTransactions.push(transaction),
        onItemUsed: (transaction) => receivedTransactions.push(transaction)
      };
      
      manager.addObserver(observer);
    });

    it('should notify observers when items are added', () => {
      manager.addItem('player1', 'sword');
      expect(receivedTransactions.length).toBe(1);
      expect(receivedTransactions[0].type).toBe('add');
    });

    it('should notify observers when items are removed', () => {
      manager.addItem('player1', 'sword');
      manager.removeItem('player1', 'slot_0');
      expect(receivedTransactions.length).toBe(2);
      expect(receivedTransactions[1].type).toBe('remove');
    });

    it('should notify observers when items are used', () => {
      manager.addItem('player1', 'health_potion');
      manager.useItem('player1', 'slot_0');
      expect(receivedTransactions.length).toBe(2); // add + use
      expect(receivedTransactions[1].type).toBe('use');
    });

    it('should remove observers', () => {
      manager.removeObserver('test_observer');
      manager.addItem('player1', 'sword');
      expect(receivedTransactions.length).toBe(0); // No notifications
    });
  });

  describe('Persistence (Torque-inspired)', () => {
    beforeEach(() => {
      manager.createInventory('player1');
      manager.addItem('player1', 'sword');
      manager.addItem('player1', 'health_potion', 5);
      manager.addCurrency('player1', 'gold', 100);
      manager.equipItem('player1', 'slot_0', 'weapon_slot');
    });

    it('should serialize and deserialize inventory state', () => {
      const serialized = manager.serialize();
      const newManager = new InventoryManager();
      newManager.deserialize(serialized);
      
      // Verify items are restored
      const inventory = newManager.getInventory('player1');
      expect(inventory).toBeDefined();
      expect(inventory?.items.size).toBe(2);
      expect(inventory?.currency.get('gold')).toBe(100);
      expect(inventory?.equipped.get('weapon_slot')).toBeDefined();
    });

    it('should preserve item definitions during serialization', () => {
      const serialized = manager.serialize();
      const newManager = new InventoryManager();
      newManager.deserialize(serialized);
      
      const sword = newManager.getItemDefinition('sword');
      expect(sword).toBeDefined();
      expect(sword?.name).toBe('Iron Sword');
    });

    it('should preserve transaction history', () => {
      const serialized = manager.serialize();
      const newManager = new InventoryManager();
      newManager.deserialize(serialized);
      
      const stats = newManager.getStats();
      expect(stats.totalTransactions).toBeGreaterThan(0);
    });
  });

  describe('Utility Methods', () => {
    beforeEach(() => {
      manager.createInventory('player1', 50, 10);
    });

    it('should calculate inventory weight', () => {
      manager.addItem('player1', 'sword'); // Weight: 3.0
      manager.addItem('player1', 'health_potion', 2); // Weight: 0.5 * 2 = 1.0
      
      const inventory = manager.getInventory('player1')!;
      const weight = manager.calculateInventoryWeight(inventory);
      expect(weight).toBe(4.0);
    });

    it('should calculate inventory space', () => {
      manager.addItem('player1', 'sword');
      manager.addItem('player1', 'health_potion');
      
      const inventory = manager.getInventory('player1')!;
      const space = manager.getInventorySpace(inventory);
      
      expect(space.used).toBe(2);
      expect(space.total).toBe(10);
      expect(space.available).toBe(8);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complex inventory scenario', () => {
      // Create multiple players
      manager.createInventory('player1', 100, 20);
      manager.createInventory('player2', 50, 10);
      
      // Player 1 gets items
      manager.addItem('player1', 'sword');
      manager.addItem('player1', 'health_potion', 10);
      manager.addItem('player1', 'leather_armor');
      manager.addCurrency('player1', 'gold', 500);
      
      // Player 2 gets items
      manager.addItem('player2', 'sword');
      manager.addItem('player2', 'health_potion', 3);
      manager.addCurrency('player2', 'silver', 200);
      
      // Equip items
      manager.equipItem('player1', 'slot_0', 'weapon_slot');
      manager.equipItem('player1', 'slot_2', 'chest_slot');
      
      // Use items
      manager.useItem('player1', 'slot_1'); // Use health potion
      
      // Move items
      manager.moveItem('player1', 'slot_1', 'slot_5');
      
      // Verify final state
      const player1Inv = manager.getInventory('player1')!;
      const player2Inv = manager.getInventory('player2')!;
      
      expect(player1Inv.items.size).toBeGreaterThanOrEqual(2);
      expect(player1Inv.equipped.size).toBe(2); // weapon and armor
      expect(player1Inv.currency.get('gold')).toBe(500);
      
      expect(player2Inv.items.size).toBe(2);
      expect(player2Inv.currency.get('silver')).toBe(200);
      
      // Query across all inventories
      const allWeapons = manager.queryInventory({ itemType: 'weapon' });
      expect(allWeapons.length).toBe(2);
      
      const allPotions = manager.queryInventory({ itemType: 'consumable' });
      expect(allPotions.length).toBe(2); // Two stacks of health potions
    });
  });
});