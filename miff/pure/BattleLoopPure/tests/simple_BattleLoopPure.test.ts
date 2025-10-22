/**
 * Simple BattleLoopPure Tests
 * 
 * Basic tests for BattleLoopPure core functionality
 */

import {
  BattleLoopManager,
  BattlePhaseManager,
  BattleAction,
  BattleState,
  BattleLoopConfig
} from '../index';

describe('BattleLoopPure Simple Tests', () => {
  describe('BattleAction', () => {
    test('should create action with default values', () => {
      const action = new BattleAction();
      expect(action.actorId).toBe(0);
      expect(action.targetId).toBe(0);
      expect(action.moveId).toBe('');
      expect(action.priority).toBe(0);
      expect(action.type).toBe('player');
    });

    test('should create action with custom values', () => {
      const action = new BattleAction({
        actorId: 1,
        targetId: 2,
        moveId: 'fire_blast',
        priority: 5,
        type: 'player'
      });

      expect(action.actorId).toBe(1);
      expect(action.targetId).toBe(2);
      expect(action.moveId).toBe('fire_blast');
      expect(action.priority).toBe(5);
      expect(action.type).toBe('player');
    });

    test('should create player action correctly', () => {
      const action = BattleAction.player(1, 2, 'attack', 3);
      expect(action.type).toBe('player');
      expect(action.actorId).toBe(1);
      expect(action.moveId).toBe('attack');
      expect(action.priority).toBe(3);
    });

    test('should create AI action correctly', () => {
      const action = BattleAction.ai(2, 1, 'defend', 2);
      expect(action.type).toBe('ai');
      expect(action.actorId).toBe(2);
      expect(action.moveId).toBe('defend');
      expect(action.priority).toBe(2);
    });
  });

  describe('BattlePhaseManager', () => {
    let phaseManager: BattlePhaseManager;

    beforeEach(() => {
      phaseManager = new BattlePhaseManager();
    });

    test('should initialize with default phases', () => {
      const currentPhase = phaseManager.getCurrentPhase();
      expect(currentPhase.name).toBe('pre_turn');
    });

    test('should advance phases correctly', () => {
      expect(phaseManager.getCurrentPhase().name).toBe('pre_turn');
      
      const nextPhase = phaseManager.advancePhase();
      expect(nextPhase?.name).toBe('select_action');
      
      const thirdPhase = phaseManager.advancePhase();
      expect(thirdPhase?.name).toBe('resolve_action');
    });

    test('should get all phases correctly', () => {
      const allPhases = phaseManager.getAllPhases();
      expect(allPhases).toHaveLength(4);
      expect(allPhases.map(p => p.name)).toEqual([
        'pre_turn',
        'select_action',
        'resolve_action',
        'end_turn'
      ]);
    });
  });

  describe('BattleLoopManager', () => {
    let battleManager: BattleLoopManager;

    beforeEach(() => {
      battleManager = new BattleLoopManager();
    });

    test('should initialize with default state', () => {
      const state = battleManager.getState();
      expect(state.currentTurn).toBe(0);
      expect(state.isActive).toBe(false);
      expect(state.isPaused).toBe(false);
    });

    test('should start battle correctly', () => {
      battleManager.start();
      const state = battleManager.getState();
      expect(state.isActive).toBe(true);
    });

    test('should pause and resume battle correctly', () => {
      battleManager.start();
      battleManager.pause();
      expect(battleManager.getState().isPaused).toBe(true);
      
      battleManager.resume();
      expect(battleManager.getState().isPaused).toBe(false);
    });

    test('should end battle correctly', () => {
      battleManager.start();
      battleManager.stop('victory', 'victory');
      
      const state = battleManager.getState();
      expect(state.isActive).toBe(false);
      expect(state.winner).toBe('victory');
      expect(state.reason).toBe('victory');
    });
  });
});
