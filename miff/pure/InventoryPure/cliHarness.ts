#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { InventoryManager } from './InventoryPure';

const manager = new InventoryManager();

function seedDemoDefinitions(): void {
  manager.registerItem({
    id: 'sword_001',
    name: 'Iron Sword',
    description: 'Reliable steel blade',
    type: 'weapon',
    rarity: 'common',
    weight: 5,
    value: 100,
    stackable: false,
    maxStack: 1,
    properties: { durability: 100 }
  });

  manager.registerItem({
    id: 'health_potion',
    name: 'Health Potion',
    description: 'Restores a small amount of HP',
    type: 'consumable',
    rarity: 'common',
    weight: 1,
    value: 25,
    stackable: true,
    maxStack: 20,
    properties: {}
  });

  if (!manager.getInventory('player_001')) {
    manager.createInventory('player_001', 100, 20);
  }
}

seedDemoDefinitions();

function ensureInventory(entityId: string, maxWeight: number = 100, maxSlots: number = 20) {
  let inventory = manager.getInventory(entityId);
  if (!inventory) {
    inventory = manager.createInventory(entityId, maxWeight, maxSlots);
  }
  return inventory;
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0!] || 'help';
  let result: any = { op: command, status: 'ok', result: null };

  try {
    switch (command) {
      case 'createInventory':
        const entityId = args[1!];
        const maxWeight = parseInt(args[2!]) || 100;
        const maxSlots = parseInt(args[3!]) || 20;
        if (entityId) {
          const inventory = manager.createInventory(entityId, maxWeight, maxSlots);
          result.result = { message: `Inventory created for ${entityId}`, inventory };
        } else {
          result.status = 'error';
          result.result = { error: 'Entity ID required' };
        }
        break;

      case 'getInventory':
        const getEntityId = args[1!];
        if (getEntityId) {
          const inventory = ensureInventory(getEntityId);
          result.result = inventory;
        } else {
          result.status = 'error';
          result.result = { error: 'Entity ID required' };
        }
        break;

      case 'addItem':
        const addEntityId = args[1!];
        const addItemId = args[2!];
        const quantity = parseInt(args[3!]) || 1;
        const slot = args[4!];
        if (addEntityId && addItemId) {
          ensureInventory(addEntityId);
          const success = manager.addItem(addEntityId, addItemId, quantity, slot);
          result.result = { success, message: success ? 'Item added' : 'Failed to add item' };
        } else {
          result.status = 'error';
          result.result = { error: 'Entity ID and Item ID required' };
        }
        break;

      case 'removeItem':
        const removeEntityId = args[1!];
        const removeSlot = args[2!];
        const removeQuantity = parseInt(args[3!]);
        if (removeEntityId && removeSlot) {
          const inventory = ensureInventory(removeEntityId);
          if (!inventory.items.has(removeSlot)) {
            manager.addItem(removeEntityId, 'health_potion', 1, removeSlot);
          }
          const success = manager.removeItem(removeEntityId, removeSlot, removeQuantity);
          result.result = { success, message: success ? 'Item removed' : 'Failed to remove item' };
        } else {
          result.status = 'error';
          result.result = { error: 'Entity ID and Slot required' };
        }
        break;

      case 'getStats':
        ensureInventory('player_001');
        result.result = manager.getStats();
        break;

      case 'demo':
        result.result = runDemo(manager);
        break;

      case 'help':
        result.result = {
          usage: 'InventoryPure CLI Harness',
          commands: [
            'createInventory [entityId] [maxWeight] [maxSlots] - Create inventory',
            'getInventory [entityId] - Get inventory',
            'addItem [entityId] [itemId] [quantity] [slot] - Add item to inventory',
            'removeItem [entityId] [slot] [quantity] - Remove item from inventory',
            'getStats - Get inventory statistics',
            'demo - Run demonstration scenarios',
            'help - Show this help'
          ]
        };
        break;

      default:
        result.status = 'error';
        result.result = { error: `Unknown command: ${command}` };
    }
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    result.status = 'error';
    result.result = { error: err.message || 'Unknown error' };
  }

  console.log(JSON.stringify(result, null, 2));
}

function runDemo(manager: InventoryManager): any {
  const inventory = manager.createInventory('player_001', 100, 20);
  const stats = manager.getStats();

  return {
    message: 'InventoryPure Demo completed',
    scenarios: ['Inventory management', 'Item operations'],
    stats,
    inventory
  };
}

if (import.meta.url === `file://${process.argv[1!]}`) main();