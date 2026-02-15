/**
 * Simple CombatPure Tests
 *
 * Basic tests for CombatPure core functionality
 */

import { BattleEngine, ICombatant, IBattleAction, ActionSource } from '../engine';

describe('CombatPure Simple Tests', () => {
  let engine: BattleEngine;
  let player: ICombatant;
  let enemy: ICombatant;

  beforeEach(() => {
    engine = new BattleEngine();

    player = {
      id: 'player1',
      name: 'Player Spirit',
      team: 'player',
      typeTag: 'fire',
      moves: ['fire_blast', 'defend', 'heal'],
      stats: {
        hp: 100,
        maxHp: 100,
        atk: 50,
        def: 30,
        spd: 40,
        specialAtk: 60,
        specialDef: 35
      }
    };

    enemy = {
      id: 'enemy1',
      name: 'Enemy Spirit',
      team: 'enemy',
      typeTag: 'water',
      moves: ['water_blast', 'defend', 'heal'],
      stats: {
        hp: 80,
        maxHp: 80,
        atk: 40,
        def: 35,
        spd: 35,
        specialAtk: 45,
        specialDef: 40
      }
    };
  });

  describe('BattleEngine', () => {
    test('should initialize with empty state', () => {
      const state = engine.getState();
      expect(state.combatants).toEqual({});
      expect(state.order).toEqual([]);
      expect(state.queue).toEqual([]);
      expect(state.over).toBe(false);
      expect(state.phase).toBe('setup');
    });

    test('should add combatants correctly', () => {
      engine.addCombatant(player);
      engine.addCombatant(enemy);

      const state = engine.getState();
      expect(Object.keys(state.combatants)).toHaveLength(2);
      expect(state.combatants['player1']).toBeDefined();
      expect(state.combatants['enemy1']).toBeDefined();
    });

    test('should remove combatants correctly', () => {
      engine.addCombatant(player);
      engine.addCombatant(enemy);

      const removed = engine.removeCombatant('player1');
      expect(removed).toBe(true);

      const state = engine.getState();
      expect(Object.keys(state.combatants)).toHaveLength(1);
      expect(state.combatants['player1']).toBeUndefined();
    });

    test('should process attack actions', () => {
      engine.addCombatant(player);
      engine.addCombatant(enemy);

      const action: IBattleAction = {
        actorId: 'player1',
        targetId: 'enemy1',
        moveId: 'fire_blast',
        source: ActionSource.PLAYER,
        type: 'attack'
      };

      engine.enqueueAction(action);
      const result = engine.processTurn();

      expect(result.completed).toBe(true);
      expect(result.results.length).toBeGreaterThan(0);
    });

    test('should handle defend actions', () => {
      engine.addCombatant(player);
      engine.addCombatant(enemy);

      const action: IBattleAction = {
        actorId: 'player1',
        targetId: 'player1',
        moveId: 'defend',
        source: ActionSource.PLAYER,
        type: 'defend'
      };

      engine.enqueueAction(action);
      const result = engine.processTurn();

      expect(result.completed).toBe(true);
      expect(result.results.length).toBeGreaterThan(0);
    });

    test('should get combatants by team', () => {
      engine.addCombatant(player);
      engine.addCombatant(enemy);

      const playerTeam = engine.getCombatantsByTeam('player');
      const enemyTeam = engine.getCombatantsByTeam('enemy');

      expect(playerTeam).toHaveLength(1);
      expect(playerTeam[0].id).toBe('player1');
      expect(enemyTeam).toHaveLength(1);
      expect(enemyTeam[0].id).toBe('enemy1');
    });
  });
});