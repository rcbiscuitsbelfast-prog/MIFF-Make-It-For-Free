#!/usr/bin/env tsx
/**
 * CLI Harness Wrapper for CombatPure
 * Adds missing operation: initCombat
 */

import { parseKeyValueArgs, handleSuccess, handleError } from '../shared/cliHarnessUtils';
import { CombatEngine, Combatant } from './engine';

const { mode, params } = parseKeyValueArgs(process?.argv);
const engine = new CombatEngine();

try {
  switch (mode) {
    case 'initCombat': {
      const { combatId, playerTeam, enemyTeam, environment } = params;
      
      const players = typeof playerTeam === 'string' ? JSON.parse(playerTeam) :
                     Array.isArray(playerTeam) ? playerTeam : ['player'];
      const enemies = typeof enemyTeam === 'string' ? JSON.parse(enemyTeam) :
                     Array.isArray(enemyTeam) ? enemyTeam : ['shadow_dragon'];
      
      // Create combatants
      const playerCombatants: Combatant[] = players?.map((id: string, i: number) => ({
        id,
        name: id?.charAt(0).toUpperCase() + id?.slice(1),
        team: 'player',
        stats: {
          hp: 100,
          maxHp: 100,
          atk: 15 + i * 2,
          def: 10 + i,
          spd: 12
        },
        moves: ['attack', 'defend', 'special']
      }));
      
      const enemyCombatants: Combatant[] = enemies?.map((id: string, i: number) => ({
        id,
        name: id?.charAt(0).toUpperCase() + id?.slice(1),
        team: 'enemy',
        stats: {
          hp: 150 + i * 50,
          maxHp: 150 + i * 50,
          atk: 20 + i * 3,
          def: 15 + i * 2,
          spd: 10
        },
        moves: ['attack', 'special', 'rage']
      }));
      
      // Add combatants to engine
      playerCombatants?.forEach((c: any) => engine?.addCombatant(c));
      enemyCombatants?.forEach((c: any) => engine?.addCombatant(c));
      
      handleSuccess({
        combatId: combatId || 'combat_001',
        playerTeam: playerCombatants,
        enemyTeam: enemyCombatants,
        environment: environment || 'default',
        initialized: true,
        status: 'ready'
      }, 'initCombat');
      break;
    }

    case 'addCombatant': {
      const { id, name, team, hp, atk, def, spd } = params;
      const combatant: Combatant = {
        id: id || 'combatant_001',
        name: name || 'Combatant',
        team: team || 'player',
        stats: {
          hp: hp || 100,
          maxHp: hp || 100,
          atk: atk || 15,
          def: def || 10,
          spd: spd || 12
        },
        moves: ['attack', 'defend']
      };
      engine?.addCombatant(combatant);
      handleSuccess({ combatant, added: true }, 'addCombatant');
      break;
    }

    case 'stepTurn': {
      const result = engine?.stepTurn();
      handleSuccess({ result, turnCompleted: true }, 'stepTurn');
      break;
    }

    case 'stepBattle': {
      const result = engine?.stepBattle();
      handleSuccess({ result, battleStep: true }, 'stepBattle');
      break;
    }

    case 'dump': {
      const state = engine?.dumpState();
      handleSuccess({ state }, 'dump');
      break;
    }

    default:
      throw new Error(`Unknown operation: ${mode}. Available: initCombat, addCombatant, stepTurn, stepBattle, dump`);
  }
} catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
  handleError(error);
}
