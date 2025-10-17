#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { InventoryManager } from './InventoryPure';

function main() {
  const args = process.argv.slice(2);
  const command = args[0!] || 'help';
  const manager = new InventoryManager();
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
          const inventory = manager.getInventory(getEntityId);
          result.result = inventory || { error: 'Inventory not found' };
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
          const success = manager.removeItem(removeEntityId, removeSlot, removeQuantity);
          result.result = { success, message: success ? 'Item removed' : 'Failed to remove item' };
        } else {
          result.status = 'error';
          result.result = { error: 'Entity ID and Slot required' };
        }
        break;

      case 'getStats':
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
    result.result = { error: error instanceof Error ? error.message : 'Unknown error' };
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