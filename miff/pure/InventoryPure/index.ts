/**
 * InventoryPure - Inventory and Resource Management System
 * 
 * Pure, remix-safe inventory and resource management for MIFF games.
 * Provides item definitions, instances, inventory management, and persistence.
 */

export * from './InventoryPure';
export { InventoryManager as default } from './InventoryPure';

// Module metadata
export const MODULE_INFO = {
  name: 'InventoryPure',
  version: '1.0.0',
  description: 'Inventory and resource management system',
  features: [
    'Item definitions and instances',
    'Inventory management',
    'Item stacking and durability',
    'Enchantments and properties',
    'Weight and slot management',
    'Persistence and serialization'
  ],
  exports: ['json', 'inventory'],
  cliCommands: [
    'add', 'remove', 'list', 'get', 'use', 'enchant', 'repair', 'help'
  ]
};