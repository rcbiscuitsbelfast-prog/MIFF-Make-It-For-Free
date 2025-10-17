#!/usr/bin/env tsx
/**
 * CLI Harness Wrapper for CombatCorePure
 * Handles --mode=action style arguments
 */

import { parseKeyValueArgs, handleSuccess, handleError } from '../shared/cliHarnessUtils';
import { CombatCore, CombatState, CombatEntity } from './index';

const { mode, params } = parseKeyValueArgs(process.argv);
const core = new CombatCore();

try {
  switch (mode) {
    case 'executeCombat': {
      // Accept both --mode=turn_based and remapped --combatMode to avoid duplicate --mode
      const combatMode = (params as any).combatMode || (params as any).mode || 'turn_based';
      const { maxTurns } = params as any;
      
      // Initialize with sample combatants
      const player: CombatEntity = {
        id: 'player',
        name: 'Hero',
        level: 1,
        health: 100,
        maxHealth: 100,
        mana: 50,
        maxMana: 50,
        stamina: 100,
        maxStamina: 100,
        stats: {
          strength: 20,
          dexterity: 15,
          constitution: 10,
          intelligence: 8,
          wisdom: 6,
          charisma: 12,
          luck: 5,
          speed: 15,
          accuracy: 0.8,
          dodge: 0.2
        },
        resistances: {
          physical: 0,
          magical: 0,
          fire: 0,
          ice: 0,
          lightning: 0,
          poison: 0,
          holy: 0,
          dark: 0,
          bleed: 0,
          true: 0
        },
        statusEffects: [],
        abilities: [],
        equipment: {},
        position: { x: 0, y: 0, z: 0 },
        facing: 0,
        team: 'player',
        isAlive: true,
        isStunned: false,
        isBlocking: false,
        lastAbilityUse: new Map(),
        shield: 0
      };
      
      const enemy: CombatEntity = {
        id: 'shadow_dragon',
        name: 'Shadow Dragon',
        level: 5,
        health: 200,
        maxHealth: 200,
        mana: 100,
        maxMana: 100,
        stamina: 80,
        maxStamina: 80,
        stats: {
          strength: 30,
          dexterity: 12,
          constitution: 15,
          intelligence: 10,
          wisdom: 8,
          charisma: 6,
          luck: 3,
          speed: 12,
          accuracy: 0.7,
          dodge: 0.1
        },
        resistances: {
          physical: 0.1,
          magical: 0.2,
          fire: 0.5,
          ice: 0,
          lightning: 0,
          poison: 0.3,
          holy: 0,
          dark: 0.2,
          bleed: 0,
          true: 0
        },
        statusEffects: [],
        abilities: [],
        equipment: {},
        position: { x: 10, y: 0, z: 0 },
        facing: 180,
        team: 'enemy',
        isAlive: true,
        isStunned: false,
        isBlocking: false,
        lastAbilityUse: new Map(),
        shield: 0
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
} catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
  handleError(error);
}
