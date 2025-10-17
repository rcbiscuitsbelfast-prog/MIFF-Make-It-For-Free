#!/usr/bin/env tsx
/**
 * CLI Harness Wrapper for StatusEffectsPure
 * Handles --mode=action style arguments
 */

import { parseKeyValueArgs, handleSuccess, handleError } from '../shared/cliHarnessUtils';
import { StatusEffectsManager, StatusEffect, StatusEffectType } from './StatusEffectsManager';

const { mode, params } = parseKeyValueArgs(process?.argv);
const manager = new StatusEffectsManager();

try {
  switch (mode) {
    case 'applyStatusEffect': {
      const { targetId, effect, duration, stats } = params;
      
      const statusEffect: StatusEffect = {
        id: `${effect}_${Date.now()}`,
        type: (effect || 'buff') as StatusEffectType,
        name: effect || 'Unknown Effect',
        duration: duration || 30,
        stackCount: 1,
        stats: typeof stats === 'string' ? JSON.parse(stats) : (stats || { attackBoost: 1.5 }),
        appliedAt: new Date()
      };
      
      manager?.applyEffect(targetId || 'player', statusEffect);
      
      handleSuccess({
        targetId,
        effect: statusEffect,
        activeEffects: manager?.getActiveEffects(targetId || 'player').length
      }, 'applyStatusEffect');
      break;
    }

    case 'removeEffect': {
      const { targetId, effectId } = params;
      manager?.removeEffect(targetId || 'player', effectId);
      handleSuccess({
        targetId,
        effectId,
        removed: true
      }, 'removeEffect');
      break;
    }

    case 'update': {
      const { deltaTime } = params;
      manager?.update(deltaTime || 1);
      handleSuccess({
        deltaTime,
        updated: true
      }, 'update');
      break;
    }

    case 'listEffects': {
      const { targetId } = params;
      const effects = manager?.getActiveEffects(targetId || 'player');
      handleSuccess({
        targetId,
        effects,
        count: effects?.length
      }, 'listEffects');
      break;
    }

    case 'calculateStats': {
      const { targetId } = params;
      const stats = manager?.calculateModifiedStats(targetId || 'player', {
        attack: 10,
        defense: 10,
        speed: 10
      });
      handleSuccess({ targetId, stats }, 'calculateStats');
      break;
    }

    default:
      throw new Error(`Unknown operation: ${mode}. Available: applyStatusEffect, removeEffect, update, listEffects, calculateStats`);
  }
} catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
  handleError(error);
}
