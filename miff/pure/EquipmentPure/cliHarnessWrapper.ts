#!/usr/bin/env tsx
/**
 * CLI Harness Wrapper for EquipmentPure
 * Handles --mode=action style arguments
 */

import { parseKeyValueArgs, handleSuccess, handleError } from '../shared/cliHarnessUtils';
import { EquipmentManager, EquipmentSlot } from './Manager';

const { mode, params } = parseKeyValueArgs(process?.argv);
const manager = new EquipmentManager();

try {
  switch (mode) {
    case 'equipItem': {
      const { playerId, itemId, slot } = params;
      
      const equipment = {
        id: itemId || 'item_001',
        name: `Item ${itemId}`,
        slot: (slot || 'main_hand') as EquipmentSlot,
        stats: { attack: 10, defense: 5 },
        equipped: true
      };
      
      manager?.equip(playerId || 'player', equipment);
      
      handleSuccess({
        playerId,
        itemId,
        slot,
        equipped: true,
        currentEquipment: manager?.getEquipped(playerId || 'player')
      }, 'equipItem');
      break;
    }

    case 'unequip': {
      const { playerId, slot } = params;
      manager?.unequip(playerId || 'player', (slot || 'main_hand') as EquipmentSlot);
      handleSuccess({
        playerId,
        slot,
        unequipped: true
      }, 'unequip');
      break;
    }

    case 'list': {
      const { playerId } = params;
      const equipment = manager?.getEquipped(playerId || 'player');
      handleSuccess({ playerId, equipment }, 'list');
      break;
    }

    case 'getStats': {
      const { playerId } = params;
      const stats = manager?.calculateStats(playerId || 'player');
      handleSuccess({ playerId, stats }, 'getStats');
      break;
    }

    default:
      throw new Error(`Unknown operation: ${mode}. Available: equipItem, unequip, list, getStats`);
  }
} catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
  handleError(error);
}
