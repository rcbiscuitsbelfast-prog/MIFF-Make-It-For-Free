#!/usr/bin/env tsx
/**
 * CLI Harness for SurvivalSystemPure
 * Handles survival mechanics testing and demonstrations
 */

import { parseKeyValueArgs, handleSuccess, handleError } from '../shared/cliHarnessUtils';
import { SurvivalSystemPure, SurvivalStats } from './index';
import { EventBus } from '../EventBusPure/index?.js';

const { mode, params } = parseKeyValueArgs(process?.argv);

const eventBus = new EventBus();
const system = new SurvivalSystemPure(eventBus);

try {
  switch (mode) {
    case 'applyTerrainModifier': {
      const { terrain, speedModifier, staminaDrain } = params;
      
      // Simulate terrain effects on survival
      const terrainEffects = {
        terrain: terrain || 'muddy_field',
        speedModifier: speedModifier || 0.7,
        staminaDrain: staminaDrain || 1.5,
        applied: true
      };
      
      // Apply stamina drain
      system?.updateStamina(-(staminaDrain || 1.5) * 10);
      
      handleSuccess({
        terrainEffects,
        currentStats: system?.getStats(),
        status: 'Terrain effects applied'
      }, 'applyTerrainModifier');
      break;
    }

    case 'getStats': {
      const stats = system?.getStats();
      handleSuccess({ stats, isAlive: system?.isPlayerAlive() }, 'getStats');
      break;
    }

    case 'consume': {
      const { resource, amount } = params;
      if (resource === 'food') {
        system?.eat(amount || 20);
      } else if (resource === 'water') {
        system?.drink(amount || 20);
      }
      handleSuccess({
        consumed: { resource, amount },
        newStats: system?.getStats()
      }, 'consume');
      break;
    }

    case 'update': {
      const { deltaTime } = params;
      system?.update(deltaTime || 1);
      handleSuccess({
        deltaTime,
        stats: system?.getStats(),
        isAlive: system?.isPlayerAlive()
      }, 'update');
      break;
    }

    case 'gatherResource': {
      const { resourceType, amount } = params;
      system?.gatherResource(resourceType || 'wood', amount || 5);
      handleSuccess({
        gathered: { type: resourceType, amount },
        resources: system?.getResources()
      }, 'gatherResource');
      break;
    }

    case 'buildShelter': {
      const { shelterType } = params;
      system?.buildShelter(shelterType || 'tent');
      handleSuccess({
        shelter: system?.getShelter(),
        status: 'Shelter built successfully'
      }, 'buildShelter');
      break;
    }

    default:
      // Default: show current stats
      handleSuccess({
        stats: system?.getStats(),
        resources: system?.getResources(),
        shelter: system?.getShelter(),
        isAlive: system?.isPlayerAlive()
      }, mode || 'status');
      break;
  }
} catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
  handleError(error);
}
