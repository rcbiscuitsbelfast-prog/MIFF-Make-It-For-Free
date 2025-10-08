#!/usr/bin/env tsx
/**
 * CLI Harness Wrapper for StatusEffectsPure
 * Handles --mode=action style arguments
 */

import { parseKeyValueArgs, handleSuccess, handleError } from '../shared/cliHarnessUtils';
import { StatusEffectsManager, StatusEffect } from './StatusEffectsManager';

const { mode, params } = parseKeyValueArgs(process.argv);
const manager = new StatusEffectsManager();

try {
  switch (mode) {
    case 'applyStatusEffect': {
      const { targetId, effect, duration, stats } = params;
      
      const statusEffect: any = {
        id: `${effect || 'effect'}_${Date.now()}`,
        name: effect || 'Unknown Effect',
        type: (effect ? 'buff' : 'neutral'),
        category: 'custom',
        magnitude: 1,
        duration: Number(duration || 30),
        stackable: true,
        maxStacks: 10,
        currentStacks: 1,
        source: 'cli',
        appliedAt: Date.now(),
        expiresAt: Date.now() + 1000 * Number(duration || 30)
      } as StatusEffect;

      manager.applyEffect(String(targetId || 'player'), statusEffect);
      
      handleSuccess({
        targetId,
        effect: statusEffect,
        activeEffects: manager.getActiveEffects(targetId || 'player').length
      }, 'applyStatusEffect');
      break;
    }

    case 'removeEffect': {
      const { targetId, effectId } = params;
      manager.removeEffect(targetId || 'player', effectId);
      handleSuccess({
        targetId,
        effectId,
        removed: true
      }, 'removeEffect');
      break;
    }

    case 'update': {
      const { deltaTime } = params;
      manager.simulateAll();
      handleSuccess({
        deltaTime,
        updated: true
      }, 'update');
      break;
    }

    case 'listEffects': {
      const { targetId } = params;
      const effects = manager.getActiveEffects(targetId || 'player');
      handleSuccess({
        targetId,
        effects,
        count: effects.length
      }, 'listEffects');
      break;
    }

    case 'calculateStats': {
      const { targetId } = params;
      const stats = manager.calculateModifiedStats(targetId || 'player', {
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
} catch (error) {
  handleError(error);
}
