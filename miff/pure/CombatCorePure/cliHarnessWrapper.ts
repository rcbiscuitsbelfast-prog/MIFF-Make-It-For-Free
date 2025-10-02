#!/usr/bin/env tsx
/**
 * CLI Harness Wrapper for CombatCorePure
 * Handles --mode=action style arguments
 */

import { parseKeyValueArgs, handleSuccess, handleError } from '../shared/cliHarnessUtils';
import { CombatCore, CombatState, Combatant } from './index';

const { mode, params } = parseKeyValueArgs(process.argv);
const core = new CombatCore();

try {
  switch (mode) {
    case 'executeCombat': {
      // Accept both --mode=turn_based and remapped --combatMode to avoid duplicate --mode
      const combatMode = (params as any).combatMode || (params as any).mode || 'turn_based';
      const { maxTurns } = params as any;
      
      // Initialize with sample combatants
      const player: Combatant = {
        id: 'player',
        name: 'Hero',
        hp: 100,
        maxHp: 100,
        attack: 20,
        defense: 10,
        speed: 15,
        team: 'player'
      };
      
      const enemy: Combatant = {
        id: 'shadow_dragon',
        name: 'Shadow Dragon',
        hp: 200,
        maxHp: 200,
        attack: 30,
        defense: 15,
        speed: 12,
        team: 'enemy'
      };
      
      core.initCombat([player], [enemy]);
      
      // Execute combat turns
      const turns = maxTurns || 20;
      let currentTurn = 0;
      const log = [];
      
      while (currentTurn < turns && !core.isCombatOver()) {
        const action = core.executeTurn();
        log.push(action);
        currentTurn++;
      }
      
      const result = core.getCombatResult();
      
      handleSuccess({
        mode: combatMode,
        turns: currentTurn,
        maxTurns: turns,
        result,
        winner: result.winner,
        log: log.slice(0, 5) // First 5 actions
      }, 'executeCombat');
      break;
    }

    case 'initCombat': {
      const { playerTeam, enemyTeam } = params;
      
      const players = Array.isArray(playerTeam) ? playerTeam : [playerTeam || 'player'];
      const enemies = Array.isArray(enemyTeam) ? enemyTeam : [enemyTeam || 'enemy'];
      
      handleSuccess({
        playerTeam: players,
        enemyTeam: enemies,
        initialized: true,
        state: 'ready'
      }, 'initCombat');
      break;
    }

    case 'getState': {
      const state = core.getState();
      handleSuccess({ state }, 'getState');
      break;
    }

    default:
      throw new Error(`Unknown operation: ${mode}. Available: executeCombat, initCombat, getState`);
  }
} catch (error) {
  handleError(error);
}
