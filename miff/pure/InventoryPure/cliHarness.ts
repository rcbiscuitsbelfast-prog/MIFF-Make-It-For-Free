#!/usr/bin/env tsx

import { InventoryManager, ItemDefinition } from './InventoryPure';
import * as fs from 'fs';
import * as path from 'path';

interface InventoryOperation {
  op: 'add' | 'remove' | 'move' | 'equip' | 'unequip' | 'use' | 'query' | 'dump' | 'create-inventory' | 'register-item';
  entityId?: string;
  itemId?: string;
  quantity?: number;
  slot?: string;
  fromSlot?: string;
  toSlot?: string;
  equipSlot?: string;
  itemDef?: ItemDefinition;
  query?: any;
}

class InventoryCLI {
  private manager: InventoryManager;

  constructor() {
    this.manager = new InventoryManager();
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Register sample items
    const sampleItems: ItemDefinition[] = [
      {
        id: 'sword_iron',
        name: 'Iron Sword',
        description: 'A sturdy iron sword',
        type: 'weapon',
        rarity: 'common',
        weight: 3.5,
        value: 50,
        stackable: false,
        maxStack: 1,
        properties: { damage: 10, durability: 100 }
      },
      {
        id: 'potion_health',
        name: 'Health Potion',
        description: 'Restores 50 HP',
        type: 'consumable',
        rarity: 'common',
        weight: 0.5,
        value: 25,
        stackable: true,
        maxStack: 10,
        properties: { healAmount: 50 }
      },
      {
        id: 'armor_leather',
        name: 'Leather Armor',
        description: 'Basic leather protection',
        type: 'armor',
        rarity: 'common',
        weight: 5,
        value: 75,
        stackable: false,
        maxStack: 1,
        properties: { defense: 5, durability: 80 }
      },
      {
        id: 'gold_coin',
        name: 'Gold Coin',
        description: 'Standard currency',
        type: 'currency',
        rarity: 'common',
        weight: 0.01,
        value: 1,
        stackable: true,
        maxStack: 1000,
        properties: {}
      }
    ];

    sampleItems.forEach(item => this.manager.registerItem(item));

    // Create sample inventory
    this.manager.createInventory('player1', 100, 20);
    this.manager.addItem('player1', 'sword_iron', 1);
    this.manager.addItem('player1', 'potion_health', 3);
    this.manager.addItem('player1', 'gold_coin', 150);
  }

  processOperation(operation: InventoryOperation): any {
    switch (operation.op) {
      case 'create-inventory':
        if (!operation.entityId) throw new Error('create-inventory requires entityId');
        const inventory = this.manager.createInventory(operation.entityId, 100, 20);
        return {
          op: 'create-inventory',
          status: 'ok',
          result: {
            entityId: inventory.entityId,
            maxWeight: inventory.maxWeight,
            maxSlots: inventory.maxSlots,
            created: true
          }
        };

      case 'register-item':
        if (!operation.itemDef) throw new Error('register-item requires itemDef');
        this.manager.registerItem(operation.itemDef);
        return {
          op: 'register-item',
          status: 'ok',
          result: {
            itemId: operation.itemDef.id,
            registered: true
          }
        };

      case 'add':
        if (!operation.entityId || !operation.itemId) {
          throw new Error('add requires entityId and itemId');
        }
        const added = this.manager.addItem(
          operation.entityId, 
          operation.itemId, 
          operation.quantity || 1,
          operation.slot
        );
        return {
          op: 'add',
          status: added ? 'ok' : 'error',
          result: {
            entityId: operation.entityId,
            itemId: operation.itemId,
            quantity: operation.quantity || 1,
            success: added
          }
        };

      case 'remove':
        if (!operation.entityId || !operation.slot) {
          throw new Error('remove requires entityId and slot');
        }
        const removed = this.manager.removeItem(
          operation.entityId,
          operation.slot,
          operation.quantity
        );
        return {
          op: 'remove',
          status: removed ? 'ok' : 'error',
          result: {
            entityId: operation.entityId,
            slot: operation.slot,
            quantity: operation.quantity,
            success: removed
          }
        };

      case 'move':
        if (!operation.entityId || !operation.fromSlot || !operation.toSlot) {
          throw new Error('move requires entityId, fromSlot, and toSlot');
        }
        const moved = this.manager.moveItem(
          operation.entityId,
          operation.fromSlot,
          operation.toSlot
        );
        return {
          op: 'move',
          status: moved ? 'ok' : 'error',
          result: {
            entityId: operation.entityId,
            fromSlot: operation.fromSlot,
            toSlot: operation.toSlot,
            success: moved
          }
        };

      case 'equip':
        if (!operation.entityId || !operation.slot || !operation.equipSlot) {
          throw new Error('equip requires entityId, slot, and equipSlot');
        }
        const equipped = this.manager.equipItem(
          operation.entityId,
          operation.slot,
          operation.equipSlot
        );
        return {
          op: 'equip',
          status: equipped ? 'ok' : 'error',
          result: {
            entityId: operation.entityId,
            slot: operation.slot,
            equipSlot: operation.equipSlot,
            success: equipped
          }
        };

      case 'unequip':
        if (!operation.entityId || !operation.equipSlot) {
          throw new Error('unequip requires entityId and equipSlot');
        }
        const unequipped = this.manager.unequipItem(
          operation.entityId,
          operation.equipSlot
        );
        return {
          op: 'unequip',
          status: unequipped ? 'ok' : 'error',
          result: {
            entityId: operation.entityId,
            equipSlot: operation.equipSlot,
            success: unequipped
          }
        };

      case 'use':
        if (!operation.entityId || !operation.slot) {
          throw new Error('use requires entityId and slot');
        }
        const used = this.manager.useItem(operation.entityId, operation.slot);
        return {
          op: 'use',
          status: used ? 'ok' : 'error',
          result: {
            entityId: operation.entityId,
            slot: operation.slot,
            success: used
          }
        };

      case 'query':
        const queryResults = this.manager.queryInventory(operation.query || {});
        return {
          op: 'query',
          status: 'ok',
          result: {
            items: queryResults,
            count: queryResults.length
          }
        };

      case 'dump':
        const entityId = operation.entityId || 'player1';
        const inventoryData = this.manager.getInventory(entityId);
        if (!inventoryData) {
          throw new Error(`Inventory not found for entity: ${entityId}`);
        }

        const inventoryItems = Array.from(inventoryData.items.entries()).map(([slot, item]) => ({
          slot,
          item: {
            ...item,
            definition: this.manager.getItemDefinition(item.definitionId)
          }
        }));

        const equippedItems = Array.from(inventoryData.equipped.entries()).map(([slot, itemId]) => ({
          equipSlot: slot,
          itemId
        }));

        const currencyData = Array.from(inventoryData.currency.entries()).map(([type, amount]) => ({
          type,
          amount
        }));

        return {
          op: 'dump',
          status: 'ok',
          result: {
            entityId,
            inventory: {
              maxWeight: inventoryData.maxWeight,
              maxSlots: inventoryData.maxSlots,
              currentWeight: this.manager.calculateInventoryWeight(inventoryData),
              space: this.manager.getInventorySpace(inventoryData),
              items: inventoryItems,
              equipped: equippedItems,
              currency: currencyData,
              lastUpdated: inventoryData.lastUpdated
            },
            stats: this.manager.getStats()
          }
        };

      default:
        throw new Error(`Unknown operation: ${(operation as any).op}`);
    }
  }
}

function main() {
  const argv = process.argv.slice(2);
  const cli = new InventoryCLI();

  try {
    let operations: InventoryOperation[];

    if (argv.length === 0) {
      // Default to dump operation
      operations = [{ op: 'dump', entityId: 'player1' }];
    } else if (argv[0].endsWith('.json') && fs.existsSync(argv[0])) {
      const content = JSON.parse(fs.readFileSync(argv[0], 'utf-8'));
      operations = Array.isArray(content) ? content : [content];
    } else {
      // Parse subcommand
      const command = argv[0];
      switch (command) {
        case 'add':
          operations = [{
            op: 'add',
            entityId: argv[1] || 'player1',
            itemId: argv[2] || 'potion_health',
            quantity: parseInt(argv[3]) || 1
          }];
          break;
        case 'remove':
          operations = [{
            op: 'remove',
            entityId: argv[1] || 'player1',
            slot: argv[2] || 'slot_0',
            quantity: parseInt(argv[3]) || undefined
          }];
          break;
        case 'dump':
          operations = [{ op: 'dump', entityId: argv[1] || 'player1' }];
          break;
        case 'query':
          operations = [{ op: 'query', query: { entityId: argv[1] || 'player1' } }];
          break;
        default:
          throw new Error(`Unknown command: ${command}`);
      }
    }

    const results = operations.map(op => cli.processOperation(op));
    
    if (results.length === 1) {
      console.log(JSON.stringify(results[0], null, 2));
    } else {
      console.log(JSON.stringify({ operations: results }, null, 2));
    }

  } catch (error) {
    const errorResult = {
      op: 'error',
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: Date.now()
    };
    console.error(JSON.stringify(errorResult, null, 2));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();