#!/usr/bin/env node

/**
 * inventory.ts - CLI commands for InventoryPure module
 * 
 * Provides commands for managing, testing, and validating inventory systems.
 */

import { Command } from 'commander';
import { createInventoryManager, ItemDefinition } from '../miff/pure/InventoryPure/InventoryPure';

const program = new Command();

program
  .name('inventory')
  .description('Inventory and resource management commands for MIFF games')
  .version('1.0.0');

program
  .command('add')
  .description('Add item to inventory')
  .argument('<entity>', 'Entity ID')
  .argument('<item>', 'Item ID')
  .option('-q, --quantity <number>', 'Quantity to add', '1')
  .option('-s, --slot <slot>', 'Specific slot to use')
  .action(async (entity, item, options) => {
    console.log('📦 Adding item to inventory...');

    const manager = createInventoryManager();
    setupSampleItems(manager);

    // Create inventory if it doesn't exist
    if (!manager.getInventory(entity)) {
      manager.createInventory(entity, 100, 20);
      console.log(`Created inventory for ${entity}`);
    }

    const quantity = parseInt(options.quantity);
    const success = manager.addItem(entity, item, quantity, options.slot);

    if (success) {
      console.log(`✅ Added ${quantity}x ${item} to ${entity}'s inventory`);
      
      const inventory = manager.getInventory(entity);
      const itemDef = manager.getItemDefinition(item);
      if (inventory && itemDef) {
        console.log(`Current weight: ${manager.calculateInventoryWeight(inventory)}/${inventory.maxWeight}`);
        console.log(`Current space: ${manager.getInventorySpace(inventory).used}/${manager.getInventorySpace(inventory).total}`);
      }
    } else {
      console.log(`❌ Failed to add ${item} to ${entity}'s inventory`);
      console.log('Possible reasons:');
      console.log('- Item not found');
      console.log('- Inventory full');
      console.log('- Weight limit exceeded');
      console.log('- Slot occupied');
    }
  });

program
  .command('remove')
  .description('Remove item from inventory')
  .argument('<entity>', 'Entity ID')
  .argument('<slot>', 'Slot to remove from')
  .option('-q, --quantity <number>', 'Quantity to remove (default: all)')
  .action(async (entity, slot, options) => {
    console.log('🗑️ Removing item from inventory...');

    const manager = createInventoryManager();
    setupSampleItems(manager);

    const inventory = manager.getInventory(entity);
    if (!inventory) {
      console.log(`❌ No inventory found for ${entity}`);
      return;
    }

    const item = inventory.items.get(slot);
    if (!item) {
      console.log(`❌ No item found in slot ${slot}`);
      return;
    }

    const quantity = options.quantity ? parseInt(options.quantity) : undefined;
    const success = manager.removeItem(entity, slot, quantity);

    if (success) {
      const itemDef = manager.getItemDefinition(item.definitionId);
      console.log(`✅ Removed ${quantity || item.quantity}x ${itemDef?.name || item.definitionId} from ${slot}`);
    } else {
      console.log(`❌ Failed to remove item from ${slot}`);
    }
  });

program
  .command('list')
  .description('List inventory contents')
  .argument('<entity>', 'Entity ID')
  .option('-v, --verbose', 'Show detailed information')
  .action(async (entity, options) => {
    console.log(`📋 Inventory for ${entity}:`);

    const manager = createInventoryManager();
    setupSampleItems(manager);

    const inventory = manager.getInventory(entity);
    if (!inventory) {
      console.log(`❌ No inventory found for ${entity}`);
      return;
    }

    console.log(`\n📊 Inventory Stats:`);
    console.log(`Weight: ${manager.calculateInventoryWeight(inventory)}/${inventory.maxWeight}`);
    const space = manager.getInventorySpace(inventory);
    console.log(`Slots: ${space.used}/${space.total} (${space.available} available)`);
    console.log(`Last Updated: ${new Date(inventory.lastUpdated).toLocaleString()}`);

    if (inventory.items.size === 0) {
      console.log('\n📭 Inventory is empty');
    } else {
      console.log('\n📦 Items:');
      for (const [slot, item] of inventory.items) {
        const itemDef = manager.getItemDefinition(item.definitionId);
        console.log(`  ${slot}: ${itemDef?.name || item.definitionId} (${item.quantity})`);
        
        if (options.verbose) {
          console.log(`    Type: ${itemDef?.type}`);
          console.log(`    Rarity: ${itemDef?.rarity}`);
          console.log(`    Value: ${itemDef?.value}`);
          console.log(`    Weight: ${itemDef?.weight}`);
          if (item.durability !== undefined) {
            console.log(`    Durability: ${item.durability}/${item.maxDurability}`);
          }
          if (item.lastUsed) {
            console.log(`    Last Used: ${new Date(item.lastUsed).toLocaleString()}`);
          }
        }
      }
    }

    if (inventory.equipped.size > 0) {
      console.log('\n⚔️ Equipped:');
      for (const [equipSlot, itemId] of inventory.equipped) {
        console.log(`  ${equipSlot}: ${itemId}`);
      }
    }

    if (inventory.currency.size > 0) {
      console.log('\n💰 Currency:');
      for (const [currencyType, amount] of inventory.currency) {
        console.log(`  ${currencyType}: ${amount}`);
      }
    }
  });

program
  .command('equip')
  .description('Equip item from inventory')
  .argument('<entity>', 'Entity ID')
  .argument('<slot>', 'Inventory slot')
  .argument('<equipSlot>', 'Equipment slot')
  .action(async (entity, slot, equipSlot) => {
    console.log('⚔️ Equipping item...');

    const manager = createInventoryManager();
    setupSampleItems(manager);

    const success = manager.equipItem(entity, slot, equipSlot);

    if (success) {
      const inventory = manager.getInventory(entity);
      const item = inventory?.items.get(slot);
      const itemDef = item ? manager.getItemDefinition(item.definitionId) : undefined;
      console.log(`✅ Equipped ${itemDef?.name || 'item'} from ${slot} to ${equipSlot}`);
    } else {
      console.log(`❌ Failed to equip item from ${slot} to ${equipSlot}`);
      console.log('Possible reasons:');
      console.log('- Item not found in slot');
      console.log('- Item is not equippable (weapon/armor)');
      console.log('- No inventory found for entity');
    }
  });

program
  .command('use')
  .description('Use consumable item')
  .argument('<entity>', 'Entity ID')
  .argument('<slot>', 'Inventory slot')
  .action(async (entity, slot) => {
    console.log('🔧 Using item...');

    const manager = createInventoryManager();
    setupSampleItems(manager);

    const success = manager.useItem(entity, slot);

    if (success) {
      const inventory = manager.getInventory(entity);
      const item = inventory?.items.get(slot);
      const itemDef = item ? manager.getItemDefinition(item.definitionId) : undefined;
      console.log(`✅ Used ${itemDef?.name || 'item'} from ${slot}`);
      
      if (item && item.quantity <= 0) {
        console.log('Item was consumed and removed from inventory');
      }
    } else {
      console.log(`❌ Failed to use item from ${slot}`);
      console.log('Possible reasons:');
      console.log('- Item not found in slot');
      console.log('- Item is not consumable');
      console.log('- No inventory found for entity');
    }
  });

program
  .command('query')
  .description('Query items across all inventories')
  .option('-t, --type <type>', 'Filter by item type')
  .option('-r, --rarity <rarity>', 'Filter by rarity')
  .option('-e, --entity <entity>', 'Filter by entity')
  .option('-v, --min-value <value>', 'Minimum value')
  .option('-V, --max-value <value>', 'Maximum value')
  .action(async (options) => {
    console.log('🔍 Querying inventories...');

    const manager = createInventoryManager();
    setupSampleItems(manager);

    // Create some sample inventories with items
    setupSampleInventories(manager);

    const query: any = {};
    if (options.type) query.itemType = options.type;
    if (options.rarity) query.rarity = options.rarity;
    if (options.entity) query.entityId = options.entity;
    if (options.minValue) query.minValue = parseInt(options.minValue);
    if (options.maxValue) query.maxValue = parseInt(options.maxValue);

    const results = manager.queryInventory(query);

    console.log(`\n📊 Query Results (${results.length} items found):`);
    
    if (results.length === 0) {
      console.log('No items match the query criteria');
    } else {
      for (const item of results) {
        const itemDef = manager.getItemDefinition(item.definitionId);
        const [entityId, slot] = item.id.split(':');
        console.log(`  ${entityId}:${slot} - ${itemDef?.name || item.definitionId} (${item.quantity})`);
        console.log(`    Type: ${itemDef?.type}, Rarity: ${itemDef?.rarity}, Value: ${itemDef?.value}`);
      }
    }
  });

program
  .command('test')
  .description('Run comprehensive inventory tests')
  .action(async () => {
    console.log('🧪 Running InventoryPure tests...');

    const manager = createInventoryManager();
    setupSampleItems(manager);

    // Test 1: Basic inventory operations
    console.log('\nTest 1: Basic inventory operations...');
    manager.createInventory('player1', 100, 20);
    
    const addSuccess = manager.addItem('player1', 'sword');
    console.log(`✅ Add item: ${addSuccess ? 'PASS' : 'FAIL'}`);
    
    const removeSuccess = manager.removeItem('player1', 'slot_0');
    console.log(`✅ Remove item: ${removeSuccess ? 'PASS' : 'FAIL'}`);

    // Test 2: Stacking
    console.log('\nTest 2: Item stacking...');
    manager.addItem('player1', 'health_potion', 5);
    manager.addItem('player1', 'health_potion', 3);
    
    const inventory = manager.getInventory('player1');
    const potionItem = Array.from(inventory!.items.values())[0];
    console.log(`✅ Stacking: ${potionItem.quantity === 8 ? 'PASS' : 'FAIL'} (${potionItem.quantity}/8)`);

    // Test 3: Equipment
    console.log('\nTest 3: Equipment system...');
    manager.addItem('player1', 'sword');
    const equipSuccess = manager.equipItem('player1', 'slot_0', 'weapon_slot');
    console.log(`✅ Equipment: ${equipSuccess ? 'PASS' : 'FAIL'}`);

    // Test 4: Currency
    console.log('\nTest 4: Currency management...');
    const currencySuccess = manager.addCurrency('player1', 'gold', 100);
    console.log(`✅ Currency: ${currencySuccess ? 'PASS' : 'FAIL'}`);

    // Test 5: Weight limits
    console.log('\nTest 5: Weight limits...');
    manager.createInventory('player2', 1, 20); // Very low weight limit
    const weightLimitSuccess = !manager.addItem('player2', 'sword'); // Should fail
    console.log(`✅ Weight limits: ${weightLimitSuccess ? 'PASS' : 'FAIL'}`);

    // Test 6: Query system
    console.log('\nTest 6: Query system...');
    const queryResults = manager.queryInventory({ itemType: 'weapon' });
    console.log(`✅ Query: ${queryResults.length > 0 ? 'PASS' : 'FAIL'} (${queryResults.length} weapons found)`);

    console.log('\n✅ All tests completed');
  });

program
  .command('simulate')
  .description('Simulate complex inventory scenario')
  .action(async () => {
    console.log('🎮 Simulating complex inventory scenario...');

    const manager = createInventoryManager();
    setupSampleItems(manager);

    // Create multiple players
    manager.createInventory('player1', 100, 20);
    manager.createInventory('player2', 50, 10);

    console.log('\n📦 Setting up player inventories...');

    // Player 1 gets items
    manager.addItem('player1', 'sword');
    manager.addItem('player1', 'health_potion', 10);
    manager.addItem('player1', 'leather_armor');
    manager.addCurrency('player1', 'gold', 500);

    // Player 2 gets items
    manager.addItem('player2', 'sword');
    manager.addItem('player2', 'health_potion', 3);
    manager.addCurrency('player2', 'silver', 200);

    console.log('✅ Items distributed');

    // Equip items
    console.log('\n⚔️ Equipping items...');
    manager.equipItem('player1', 'slot_0', 'weapon_slot');
    manager.equipItem('player1', 'slot_2', 'chest_slot');
    console.log('✅ Items equipped');

    // Use items
    console.log('\n🔧 Using items...');
    manager.useItem('player1', 'slot_1'); // Use health potion
    console.log('✅ Items used');

    // Move items
    console.log('\n🔄 Moving items...');
    manager.moveItem('player1', 'slot_1', 'slot_5');
    console.log('✅ Items moved');

    // Show final state
    console.log('\n📊 Final Inventory State:');
    
    const player1Inv = manager.getInventory('player1')!;
    const player2Inv = manager.getInventory('player2')!;

    console.log(`\nPlayer 1:`);
    console.log(`  Items: ${player1Inv.items.size}`);
    console.log(`  Equipped: ${player1Inv.equipped.size}`);
    console.log(`  Gold: ${player1Inv.currency.get('gold')}`);
    console.log(`  Weight: ${manager.calculateInventoryWeight(player1Inv)}/${player1Inv.maxWeight}`);

    console.log(`\nPlayer 2:`);
    console.log(`  Items: ${player2Inv.items.size}`);
    console.log(`  Silver: ${player2Inv.currency.get('silver')}`);
    console.log(`  Weight: ${manager.calculateInventoryWeight(player2Inv)}/${player2Inv.maxWeight}`);

    // Query across all inventories
    console.log('\n🔍 Cross-inventory queries:');
    const allWeapons = manager.queryInventory({ itemType: 'weapon' });
    console.log(`  Weapons: ${allWeapons.length}`);

    const allPotions = manager.queryInventory({ itemType: 'consumable' });
    console.log(`  Consumables: ${allPotions.length}`);

    const rareItems = manager.queryInventory({ rarity: 'uncommon' });
    console.log(`  Uncommon items: ${rareItems.length}`);

    console.log('\n✅ Simulation completed');
  });

function setupSampleItems(manager: any): void {
  const sampleItems: ItemDefinition[] = [
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

  sampleItems.forEach(item => manager.registerItem(item));
}

function setupSampleInventories(manager: any): void {
  // Create some sample inventories with items
  manager.createInventory('player1', 100, 20);
  manager.createInventory('player2', 50, 10);
  manager.createInventory('npc_merchant', 200, 30);

  // Add items to player1
  manager.addItem('player1', 'sword');
  manager.addItem('player1', 'health_potion', 5);
  manager.addItem('player1', 'leather_armor');

  // Add items to player2
  manager.addItem('player2', 'sword');
  manager.addItem('player2', 'health_potion', 2);

  // Add items to merchant
  manager.addItem('npc_merchant', 'sword', 3);
  manager.addItem('npc_merchant', 'health_potion', 20);
  manager.addItem('npc_merchant', 'leather_armor', 2);
}

export default program;