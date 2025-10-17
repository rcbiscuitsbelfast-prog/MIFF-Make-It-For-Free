/**
 * BattleLoopPure Golden Tests
 *
 * Comprehensive tests for the BattleLoopPure battle loop management system.
 * Tests cover battle phases, action ordering, state management, and integration scenarios.
 */

import {
  BattleLoopManager,
  BattlePhaseManager,
  BattleAction,
  BattleState,
  BattleLoopConfig
} from '../index';

// Mock RNG Provider for testing
class MockRNGProvider {
  private seed: number = 0;
  private callHistory: number[] = [];

  setSeed(seed: number): void {
    this.seed = seed;
    this.callHistory.push(seed);
  }

  nextInt(min: number = 0, max: number = 100): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    const result = Math.floor((this.seed / 233280) * (max - min)) + min;
    this.callHistory.push(result);
    return result;
  }

  nextFloat(min: number = 0, max: number = 1): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    const result = ((this.seed / 233280) * (max - min)) + min;
    this.callHistory.push(result);
    return result;
  }

  shuffle<T extends object>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  getCallHistory(): number[] {
    return [...this.callHistory];
  }

  clearHistory(): void {
    this.callHistory = [];
  }
}

// Mock Logger for testing
class MockLogger implements ILogger {
  private logHistory: string[] = [];

  logPhaseChange(phase: BattlePhase): void {
    this.logHistory.push(`phase:${phase}`);
  }

  logAction(action: IBattleAction, result?: any): void {
    const resultStr = result ? ` result:${JSON.stringify(result)}` : '';
    this.logHistory.push(`action:${action.getSummary()}${resultStr}`);
  }

  logSystem(message: string, category?: string, level?: string): void {
    const categoryStr = category ? ` category:${category}` : '';
    const levelStr = level ? ` level:${level}` : '';
    this.logHistory.push(`system:${message}${categoryStr}${levelStr}`);
  }

  getLogHistory(): string[] {
    return [...this.logHistory];
  }

  clearHistory(): void {
    this.logHistory = [];
  }
}

// Mock Event Bus for testing
class MockEventBus implements IEventBus {
  private events: Map<string, any[]> = new Map();
  private subscriptions: Map<string, ((data?: any) => void)[]> = new Map();

  publish(event: string, data?: any): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(data);
  }

  subscribe(event: string, handler: (data?: any) => void): () => void {
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, []);
    }
    this.subscriptions.get(event)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.subscriptions.get(event) || [];
      const index = handlers.indexOf(handler);
      if (index >= 0) {
        handlers.splice(index, 1);
      }
    };
  }

  getEvents(event: string): any[] {
    return this.events.get(event) || [];
  }

  clearHistory(): void {
    this.events.clear();
    this.subscriptions.clear();
  }
}

describe('BattleLoopPure Golden Tests', () => {
  describe('BattleAction Basic Functionality', () => {
    test('should create action with default values', () => {
      const action = new BattleAction();
      expect(action.actorId).toBe(0);
      expect(action.targetId).toBe(0);
      expect(action.moveId).toBe('');
      expect(action.priority).toBe(0);
      expect(action.speed).toBe(0);
      expect(action.source).toBe(ActionSource.UNKNOWN);
      expect(action.timestampUtc).toBeGreaterThan(0);
    });

    test('should create action with custom values', () => 
      const action = new BattleAction(
        1,
        2,
        'fire_blast',
        5,
        75,
        PLAYER: ActionSource.PLAYER,
        'Using fire advantage',
         effectiveness: 0: 2.0}
      );

      expect(action.actorId).toBe(1);
      expect(action.targetId).toBe(2);
      expect(action.moveId).toBe('fire_blast');
      expect(action.priority).toBe(5);
      expect(action.speed).toBe(75);
      expect(action.source).toBe(ActionSource.PLAYER);
      expect(action.debugNotes).toBe('Using fire advantage');
      expect(action.metadata).toEqual( effectiveness: 0: 2.0});
    });

    test('should create player action correctly', () => {
      const action = BattleAction.player(1, 2, 'attack', 3, 60, 'Player move');
      expect(action.source).toBe(ActionSource.PLAYER);
      expect(action.actorId).toBe(1);
      expect(action.moveId).toBe('attack');
      expect(action.priority).toBe(3);
      expect(action.speed).toBe(60);
      expect(action.debugNotes).toBe('Player move');
    });

    test('should create AI action correctly', () => {
      const action = BattleAction.ai(2, 1, 'defend', 2, 50);
      expect(action.source).toBe(ActionSource.AI);
      expect(action.actorId).toBe(2);
      expect(action.moveId).toBe('defend');
      expect(action.priority).toBe(2);
      expect(action.speed).toBe(50);
    });

    test('should generate action summary correctly', () => {
      const action = new BattleAction(1, 2, 'fire_blast', 5, 75, ActionSource.PLAYER);
      expect(action.getSummary()).toBe('Actor=1 Target=2 Move=fire_blast Pri=5 Spd=75 Src=player');
    });

    test('should clone action correctly', () => 
      const original = new BattleAction(
        1,
        2,
        'fire_blast',
        5,
        75,
        PLAYER: ActionSource.PLAYER,
        'Test action',
        { test: true }
      );

      const clone = original.clone();

      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.metadata).toEqual(original.metadata);
      expect(clone.metadata).not.toBe(original.metadata);
    });

    test('should convert to/from JSON correctly', () => 
      const original = new BattleAction(
        1,
        2,
        'fire_blast',
        5,
        75,
        PLAYER: ActionSource.PLAYER,
        'Test action',
        { test: true }
      );

      const jsonData = original.toJSON();
      const reconstructed = BattleAction.fromJSON(jsonData);

      expect(reconstructed).toEqual(original);
      expect(reconstructed.metadata).toEqual(original.metadata);
    });

    test('should calculate action score correctly', () => {
      const action1 = new BattleAction(1, 2, 'attack', 5, 75);
      const action2 = new BattleAction(1, 2, 'attack', 3, 80);
      const action3 = new BattleAction(1, 2, 'attack', 5, 75);
      action3.tieBreakerKey = 0.5;

      const score1 = action1.getActionScore();
      const score2 = action2.getActionScore();
      const score3 = action3.getActionScore();

      expect(score2).toBeGreaterThan(score1); // Higher speed wins
      expect(score3).toBeGreaterThan(score1); // Tie-breaker wins
    });

    test('should compare actions correctly', () => {
      const action1 = new BattleAction(1, 2, 'attack', 5, 75);
      const action2 = new BattleAction(1, 2, 'attack', 3, 80);
      const action3 = new BattleAction(1, 2, 'attack', 5, 75);
      action3.tieBreakerKey = 0.5;

      expect(BattleAction.compareActions(action1, action2)).toBeGreaterThan(0); // action1 < action2
      expect(BattleAction.compareActions(action2, action1)).toBeLessThan(0);    // action2 > action1
      expect(BattleAction.compareActions(action1, action3)).toBeLessThan(0);    // action1 < action3 (tie-breaker)
    });

    test('should validate action correctly', () => {
      const validAction = new BattleAction(1, 2, 'fire_blast', 5, 75);
      expect(validAction.validate({})).toHaveLength(0);

      const invalidAction = new BattleAction(-1, -2, '', 15, -10);
      const errors = invalidAction.validate({});
      expect(errors).toContain('Actor ID cannot be negative');
      expect(errors).toContain('Target ID cannot be negative');
      expect(errors).toContain('Move ID cannot be empty');
      expect(errors).toContain('Priority must be between 0 and 10');
      expect(errors).toContain('Speed cannot be negative');
    });
  });

  describe('BattlePhaseManager Basic Functionality', () => {
    let phaseManager: BattlePhaseManager;

    beforeEach(() => {
      phaseManager = new BattlePhaseManager();
    });

    test('should start with correct initial phase', () => {
      expect(phaseManager.getCurrentPhase()).toBe(BattlePhase.PRE_TURN);
    });

    test('should advance phases correctly', () => {
      expect(phaseManager.advancePhase()).toBe(BattlePhase.SELECT_ACTION);
      expect(phaseManager.advancePhase()).toBe(BattlePhase.RESOLVE_ACTION);
      expect(phaseManager.advancePhase()).toBe(BattlePhase.END_TURN);
      expect(phaseManager.advancePhase()).toBe(BattlePhase.PRE_TURN); // Loop back
    });

    test('should get next phase correctly', () => {
      expect(BattlePhaseManager.getNextPhase(BattlePhase.PRE_TURN)).toBe(BattlePhase.SELECT_ACTION);
      expect(BattlePhaseManager.getNextPhase(BattlePhase.SELECT_ACTION)).toBe(BattlePhase.RESOLVE_ACTION);
      expect(BattlePhaseManager.getNextPhase(BattlePhase.RESOLVE_ACTION)).toBe(BattlePhase.END_TURN);
      expect(BattlePhaseManager.getNextPhase(BattlePhase.END_TURN)).toBe(BattlePhase.PRE_TURN);
    });

    test('should get all phases correctly', () => 
      const allPhases = BattlePhaseManager.getAllPhases();
      expect(allPhases).toEqual([
        PRE_TURN: BattlePhase.PRE_TURN,
        BattlePhase.SELECT_ACTION,
        BattlePhase.RESOLVE_ACTION,
        BattlePhase.END_TURN
      ]);
    });

    test('should validate phases correctly', () => {
      expect(BattlePhaseManager.isValidPhase(BattlePhase.PRE_TURN)).toBe(true);
      expect(BattlePhaseManager.isValidPhase('invalid_phase')).toBe(false);
    });

    test('should get phase description correctly', () => {
      expect(BattlePhaseManager.getPhaseDescription(BattlePhase.PRE_TURN))
        .toContain('Preparation phase');
      expect(BattlePhaseManager.getPhaseDescription(BattlePhase.SELECT_ACTION))
        .toContain('Action selection phase');
      expect(BattlePhaseManager.getPhaseDescription(BattlePhase.RESOLVE_ACTION))
        .toContain('Action resolution phase');
      expect(BattlePhaseManager.getPhaseDescription(BattlePhase.END_TURN))
        .toContain('Turn cleanup phase');
    });

    test('should track phase history correctly', () => 
      const initialHistory = phaseManager.getPhaseHistory();
      expect(initialHistory).toEqual([BattlePhase.PRE_TURN]);

      phaseManager.advancePhase();
      phaseManager.advancePhase();

      const updatedHistory = phaseManager.getPhaseHistory();
      expect(updatedHistory).toEqual([
        PRE_TURN: BattlePhase.PRE_TURN,
        BattlePhase.SELECT_ACTION,
        BattlePhase.RESOLVE_ACTION
      ]);
    });

    test('should get phase count correctly', () => {
      expect(phaseManager.getPhaseCount()).toBe(1);

      phaseManager.advancePhase();
      phaseManager.advancePhase();

      expect(phaseManager.getPhaseCount()).toBe(3);
    });

    test('should reset correctly', () => {
      phaseManager.advancePhase();
      phaseManager.advancePhase();

      expect(phaseManager.getCurrentPhase()).toBe(BattlePhase.RESOLVE_ACTION);
      expect(phaseManager.getPhaseCount()).toBe(3);

      phaseManager.reset();

      expect(phaseManager.getCurrentPhase()).toBe(BattlePhase.PRE_TURN);
      expect(phaseManager.getPhaseCount()).toBe(1);
    });

    test('should handle phase events correctly', () => {
      const phaseChanges: string[] = [];
      const phaseEntries: string[] = [];

      phaseManager.onPhaseChanged = (from, to) => {
        phaseChanges.push(`${from}→${to}`);
      };

      phaseManager.onPhaseEntered = (phase) => {
        phaseEntries.push(phase);
      };

      phaseManager.advancePhase();
      phaseManager.advancePhase();

      expect(phaseChanges).toEqual(['pre_turn→select_action', 'select_action→resolve_action']);
      expect(phaseEntries).toEqual(['select_action', 'resolve_action']);
    });

    test('should force set phase correctly', () => {
      phaseManager.advancePhase();
      expect(phaseManager.getCurrentPhase()).toBe(BattlePhase.SELECT_ACTION);

      phaseManager.forceSetPhase(BattlePhase.END_TURN);
      expect(phaseManager.getCurrentPhase()).toBe(BattlePhase.END_TURN);
    });
  });

  describe('ActionQueue Basic Functionality', () => {
    let actionQueue: ActionQueue;
    let rng: MockRNGProvider;

    beforeEach(() => {
      rng = new MockRNGProvider();
      actionQueue = new ActionQueue(rng);
    });

    test('should create empty queue', () => {
      expect(actionQueue.isEmpty()).toBe(true);
      expect(actionQueue.getLength()).toBe(0);
      expect(actionQueue.peek()).toBeNull();
    });

    test('should enqueue and dequeue actions correctly', () => {
      const action1 = new BattleAction(1, 2, 'attack1', 5, 75);
      const action2 = new BattleAction(2, 1, 'attack2', 3, 60);

      actionQueue.enqueue(action1);
      expect(actionQueue.getLength()).toBe(1);
      expect(actionQueue.isEmpty()).toBe(false);

      actionQueue.enqueue(action2);
      expect(actionQueue.getLength()).toBe(2);

      const dequeued1 = actionQueue.dequeue();
      expect(dequeued1).toBe(action1);
      expect(actionQueue.getLength()).toBe(1);

      const dequeued2 = actionQueue.dequeue();
      expect(dequeued2).toBe(action2);
      expect(actionQueue.getLength()).toBe(0);
      expect(actionQueue.isEmpty()).toBe(true);
    });

    test('should peek without removing', () => {
      const action = new BattleAction(1, 2, 'attack', 5, 75);
      actionQueue.enqueue(action);

      const peeked = actionQueue.peek();
      expect(peeked).toBe(action);
      expect(actionQueue.getLength()).toBe(1); // Should not remove
    });

    test('should order actions by priority and speed', () => {
      // Create actions with different priorities and speeds
      const highPriority = new BattleAction(1, 2, 'high_pri', 8, 50);
      const highSpeed = new BattleAction(2, 1, 'high_speed', 5, 80);
      const lowPriority = new BattleAction(3, 1, 'low_pri', 2, 50);

      actionQueue.enqueue(lowPriority);
      actionQueue.enqueue(highSpeed);
      actionQueue.enqueue(highPriority);

      // Should be ordered: highPriority, highSpeed, lowPriority
      expect(actionQueue.dequeue()).toBe(highPriority);
      expect(actionQueue.dequeue()).toBe(highSpeed);
      expect(actionQueue.dequeue()).toBe(lowPriority);
    });

    test('should handle tie-breaking with RNG', () => {
      const action1 = new BattleAction(1, 2, 'tie1', 5, 75);
      const action2 = new BattleAction(2, 1, 'tie2', 5, 75);

      actionQueue.enqueue(action1);
      actionQueue.enqueue(action2);

      // Both should have tie-breaker keys assigned
      expect(action1.tieBreakerKey).toBeDefined();
      expect(action2.tieBreakerKey).toBeDefined();

      // Should be ordered by tie-breaker
      const first = actionQueue.dequeue();
      const second = actionQueue.dequeue();

      expect(first).toBeDefined();
      expect(second).toBeDefined();
      expect([action1, action2]).toContain(first);
      expect([action1, action2]).toContain(second);
    });

    test('should get actions by actor correctly', () => {
      const action1 = new BattleAction(1, 2, 'attack1', 5, 75);
      const action2 = new BattleAction(1, 3, 'attack2', 3, 60);
      const action3 = new BattleAction(2, 1, 'attack3', 5, 75);

      actionQueue.enqueue(action1);
      actionQueue.enqueue(action2);
      actionQueue.enqueue(action3);

      const actor1Actions = actionQueue.getActionsByActor(1);
      const actor2Actions = actionQueue.getActionsByActor(2);

      expect(actor1Actions).toHaveLength(2);
      expect(actor2Actions).toHaveLength(1);
      expect(actor1Actions).toEqual([action1, action2]);
      expect(actor2Actions).toEqual([action3]);
    });

    test('should get actions by source correctly', () => {
      const playerAction = BattleAction.player(1, 2, 'player_attack', 5, 75);
      const aiAction = BattleAction.ai(2, 1, 'ai_attack', 5, 75);

      actionQueue.enqueue(playerAction);
      actionQueue.enqueue(aiAction);

      const playerActions = actionQueue.getActionsBySource(ActionSource.PLAYER);
      const aiActions = actionQueue.getActionsBySource(ActionSource.AI);

      expect(playerActions).toHaveLength(1);
      expect(aiActions).toHaveLength(1);
      expect(playerActions[0]).toBe(playerAction);
      expect(aiActions[0]).toBe(aiAction);
    });

    test('should remove actions by actor correctly', () => {
      const action1 = new BattleAction(1, 2, 'attack1', 5, 75);
      const action2 = new BattleAction(1, 3, 'attack2', 3, 60);
      const action3 = new BattleAction(2, 1, 'attack3', 5, 75);

      actionQueue.enqueue(action1);
      actionQueue.enqueue(action2);
      actionQueue.enqueue(action3);

      const removed = actionQueue.removeActionsByActor(1);
      expect(removed).toHaveLength(2);
      expect(removed).toEqual([action1, action2]);
      expect(actionQueue.getLength()).toBe(1);

      const remaining = actionQueue.getAllActions();
      expect(remaining).toEqual([action3]);
    });

    test('should clear queue correctly', () => {
      const action1 = new BattleAction(1, 2, 'attack1', 5, 75);
      const action2 = new BattleAction(2, 1, 'attack2', 5, 75);

      actionQueue.enqueue(action1);
      actionQueue.enqueue(action2);

      expect(actionQueue.getLength()).toBe(2);

      actionQueue.clear();

      expect(actionQueue.getLength()).toBe(0);
      expect(actionQueue.isEmpty()).toBe(true);
    });

    test('should validate actions correctly', () => {
      const validAction = new BattleAction(1, 2, 'valid_attack', 5, 75);
      const invalidAction = new BattleAction(-1, 2, '', 15, -10);

      actionQueue.enqueue(validAction);
      actionQueue.enqueue(invalidAction);

      const errors = actionQueue.validateActions();
      expect(errors).toHaveLength(5); // 5 validation errors for invalid action
      expect(errors.some(error => error.includes('Actor ID cannot be negative'))).toBe(true);
      expect(errors.some(error => error.includes('Move ID cannot be empty'))).toBe(true);
      expect(errors.some(error => error.includes('Priority must be between 0 and 10'))).toBe(true);
      expect(errors.some(error => error.includes('Speed cannot be negative'))).toBe(true);
    });
  });

  describe('BattleEndManager Basic Functionality', () => 
    let endManager: BattleEndManager;
    let mockState: IBattleState;

    beforeEach(() => {
      endManager = new BattleEndManager();
      mockState = {
        turnNumber: 1,
        currentPhase: PRE_TURN: BattlePhase.PRE_TURN,
        actionsThisTurn: [],
        pendingActions: [],
        processedActions: [],
        battleResult: BattleResult.ONGOING,
        startTime: new Date()
      };
    });

    test('should create end manager with default conditions', () => {
      expect(endManager).toBeDefined();
    });

    test('should register and remove end conditions', () => 
      const customChecker = (state: IBattleState) => BattleResult.PLAYER_WIN;

      endManager.registerEndCondition(PLAYER_WIN: BattleResult.PLAYER_WIN, customChecker);
      expect(endManager.checkBattleEnd(mockState)).toBe(BattleResult.PLAYER_WIN);

      const removed = endManager.removeEndCondition(BattleResult.PLAYER_WIN);
      expect(removed).toBe(true);

      // Should revert to default behavior
      expect(endManager.checkBattleEnd(mockState)).toBe(BattleResult.ONGOING);
    });

    test('should get battle end reasons correctly', () => {
      expect(endManager.getBattleEndReason(BattleResult.PLAYER_WIN))
        .toContain('Player team wins');
      expect(endManager.getBattleEndReason(BattleResult.OPPONENT_WIN))
        .toContain('Opponent team wins');
      expect(endManager.getBattleEndReason(BattleResult.DRAW))
        .toContain('draw');
      expect(endManager.getBattleEndReason(BattleResult.ONGOING))
        .toContain('ongoing');
    });

    test('should manage battle state correctly', () => {
      expect(endManager.getBattleState()).toBeNull();

      endManager.checkBattleEnd(mockState);
      expect(endManager.getBattleState()).toBe(mockState);

      endManager.reset();
      expect(endManager.getBattleState()).toBeNull();
    });

    test('should force end battle correctly', () => {
      endManager.checkBattleEnd(mockState);
      expect(mockState.battleResult).toBe(BattleResult.ONGOING);

      endManager.forceEndBattle(BattleResult.PLAYER_WIN);
      expect(mockState.battleResult).toBe(BattleResult.PLAYER_WIN);
      expect(mockState.endTime).toBeDefined();
    });
  });

  describe('BattleLoopController Basic Functionality', () => {
    let controller: BattleLoopController;
    let rng: MockRNGProvider;
    let logger: MockLogger;
    let eventBus: MockEventBus;

    beforeEach(() => {
      rng = new MockRNGProvider();
      logger = new MockLogger();
      eventBus = new MockEventBus();
      controller = new BattleLoopController(rng, logger, eventBus);
    });

    test('should create controller with dependencies', () => {
      expect(controller).toBeDefined();
      expect(controller.getCurrentPhase()).toBe(BattlePhase.PRE_TURN);
    });

    test('should get and update battle state correctly', () => {
      const initialState = controller.getBattleState();
      expect(initialState.turnNumber).toBe(1);
      expect(initialState.currentPhase).toBe(BattlePhase.PRE_TURN);
      expect(initialState.battleResult).toBe(BattleResult.ONGOING);
    });

    test('should advance phases correctly', () => {
      expect(controller.getCurrentPhase()).toBe(BattlePhase.PRE_TURN);
      expect(controller.advancePhase()).toBe(BattlePhase.SELECT_ACTION);
      expect(controller.advancePhase()).toBe(BattlePhase.RESOLVE_ACTION);
      expect(controller.advancePhase()).toBe(BattlePhase.END_TURN);
      expect(controller.advancePhase()).toBe(BattlePhase.PRE_TURN);
    });

    test('should execute turn with action selection', () => {
      const actionSelector: ActionSelector = (actorId: number, availableMoves: string[]) => {
        return BattleAction.create(
          actorId,
          actorId === 1 ? 2 : 1,
          availableMoves[0],
          0,
          50,
          actorId === 1 ? PLAYER: ActionSource.AI
        );
      };

      const availableActors = [1, 2];
      const availableMoves = {
        1: ['attack', 'defend'],
        2: ['attack', 'defend']
      };

      const finalState = controller.executeTurn(
        12345,
        actionSelector,
        availableActors,
        availableMoves
      );

      expect(finalState.turnNumber).toBe(2); // Started at 1
      expect(finalState.actionsThisTurn).toHaveLength(2);
      expect(finalState.processedActions).toHaveLength(2);
      expect(finalState.battleResult).toBe(BattleResult.ONGOING);
    });

    test('should handle battle completion', () => {
      const actionSelector: ActionSelector = (actorId: number, availableMoves: string[]) => {
        return BattleAction.create(
          actorId,
          2,
          'defeat',
          10,
          100,
          ActionSource.PLAYER
        );
      };

      const availableActors = [1];
      const availableMoves = {
        1: ['defeat']
      };

      // Mock battle end condition
      controller.setEndCondition(BattleResult.PLAYER_WIN, (state) => {
        return state.actionsThisTurn.some(a => a.moveId === 'defeat')
          ? BattleResult.PLAYER_WIN
          : BattleResult.ONGOING;
      });

      const finalState = controller.executeTurn(
        12345,
        actionSelector,
        availableActors,
        availableMoves
      );

      expect(finalState.battleResult).toBe(BattleResult.PLAYER_WIN);
      expect(finalState.endTime).toBeDefined();
    });

    test('should reset battle state correctly', () => {
      // Execute a turn first
      const actionSelector: ActionSelector = (actorId: number, availableMoves: string[]) => {
        return BattleAction.create(actorId, 2, 'attack', 0, 50, ActionSource.PLAYER);
      };

      controller.executeTurn(12345, actionSelector, [1], { 1: ['attack'] });

      expect(controller.getBattleState().turnNumber).toBe(2);

      controller.reset();

      const resetState = controller.getBattleState();
      expect(resetState.turnNumber).toBe(1);
      expect(resetState.currentPhase).toBe(BattlePhase.PRE_TURN);
      expect(resetState.battleResult).toBe(BattleResult.ONGOING);
      expect(resetState.actionsThisTurn).toHaveLength(0);
    });

    test('should provide battle statistics correctly', () => {
      const actionSelector: ActionSelector = (actorId: number, availableMoves: string[]) => {
        return BattleAction.create(
          actorId,
          2,
          'attack',
          0,
          50,
          ActionSource.PLAYER
        );
      };

      controller.executeTurn(12345, actionSelector, [1], { 1: ['attack'] });
      controller.executeTurn(12346, actionSelector, [1], { 1: ['attack'] });

      const stats = controller.getBattleStatistics();

      expect(stats.totalActions).toBe(2);
      expect(stats.averageActionsPerTurn).toBe(1);
      expect(stats.actionsBySource[ActionSource.PLAYER]).toBe(2);
      expect(stats.phasesExecuted).toBeGreaterThan(0);
    });

    test('should handle event integration correctly', () => {
      const phaseEvents = eventBus.getEvents('battle/phase');
      const phaseEnteredEvents = eventBus.getEvents('battle/phase_entered');

      controller.advancePhase();

      expect(phaseEvents).toHaveLength(1);
      expect(phaseEnteredEvents).toHaveLength(1);
      expect(phaseEvents[0]).toBe(BattlePhase.SELECT_ACTION);
      expect(phaseEnteredEvents[0]).toBe(BattlePhase.SELECT_ACTION);
    });

    test('should handle logging integration correctly', () => {
      const action = BattleAction.create(1, 2, 'test_attack', 0, 50, ActionSource.PLAYER);
      const result = { damage: 25, status: 'none' };

      controller.executeTurn(12345, () => action, [1], { 1: ['test_attack'] });

      const logHistory = logger.getLogHistory();
      expect(logHistory.some(entry => entry.includes('test_attack'))).toBe(true);
      expect(logHistory.some(entry => entry.includes('phase'))).toBe(true);
    });
  });

  describe('BattleLoopUtils Basic Functionality', () => {
    test('should create default RNG provider', () => {
      const rng = BattleLoopUtils.createDefaultRNG();
      expect(rng).toBeDefined();

      rng.setSeed(12345);
      const value1 = rng.nextInt(1, 10);
      const value2 = rng.nextFloat(0, 1);

      expect(value1).toBeGreaterThanOrEqual(1);
      expect(value1).toBeLessThan(10);
      expect(value2).toBeGreaterThanOrEqual(0);
      expect(value2).toBeLessThanOrEqual(1);
    });

    test('should create default event bus', () => {
      const eventBus = BattleLoopUtils.createDefaultEventBus();
      expect(eventBus).toBeDefined();

      let receivedData: any = null;
      eventBus.subscribe('test_event', (data) => {
        receivedData = data;
      });

      eventBus.publish('test_event', 'test_data');
      expect(receivedData).toBe('test_data');
    });

    test('should create default logger', () => {
      const logger = BattleLoopUtils.createDefaultLogger();
      expect(logger).toBeDefined();

      // Test that methods exist and don't throw
      logger.logPhaseChange(BattlePhase.PRE_TURN);
      logger.logAction(new BattleAction(1, 2, 'test'), { damage: 10 });
      logger.logSystem('Test message', 'test', 'info');
    });

    test('should create standard controller', () => {
      const controller = BattleLoopUtils.createStandardController();
      expect(controller).toBeDefined();
      expect(controller.getCurrentPhase()).toBe(BattlePhase.PRE_TURN);
    });

    test('should validate battle state correctly', () => 
      const validState: IBattleState = {
        turnNumber: 1,
        currentPhase: PRE_TURN: BattlePhase.PRE_TURN,
        actionsThisTurn: [],
        pendingActions: [],
        processedActions: [],
        battleResult: BattleResult.ONGOING,
        startTime: new Date()
      };

      const invalidState: IBattleState = 
        turnNumber: 0,
        currentPhase: 'invalid_phase' as any,
        actionsThisTurn: [],
        pendingActions: [],
        processedActions: [],
        battleResult: ONGOING: BattleResult.ONGOING,
        startTime: 0
      };

      const validErrors = BattleLoopUtils.validateBattleState(validState);
      const invalidErrors = BattleLoopUtils.validateBattleState(invalidState);

      expect(validErrors).toHaveLength(0);
      expect(invalidErrors).toHaveLength(3); // Turn number, phase, start time
    });

    test('should compare battle states correctly', () => 
      const state1: IBattleState = {
        turnNumber: 1,
        currentPhase: PRE_TURN: BattlePhase.PRE_TURN,
        actionsThisTurn: [],
        pendingActions: [],
        processedActions: [],
        battleResult: BattleResult.ONGOING,
        startTime: 1000
      };

      const state2: IBattleState = 
        turnNumber: 1,
        currentPhase: PRE_TURN: BattlePhase.PRE_TURN,
        actionsThisTurn: [],
        pendingActions: [],
        processedActions: [],
        battleResult: BattleResult.ONGOING,
        startTime: 1000
      };

      const state3: IBattleState = 
        turnNumber: 2,
        currentPhase: SELECT_ACTION: BattlePhase.SELECT_ACTION,
        actionsThisTurn: [],
        pendingActions: [],
        processedActions: [],
        battleResult: BattleResult.ONGOING,
        startTime: 1000
      };

      expect(BattleLoopUtils.compareBattleStates(state1, state2)).toBe(true);
      expect(BattleLoopUtils.compareBattleStates(state1, state3)).toBe(false);
    });

    test('should calculate action priority correctly', () => {
      expect(BattleLoopUtils.calculateActionPriority(50)).toBe(5);
      expect(BattleLoopUtils.calculateActionPriority(75)).toBe(7);
      expect(BattleLoopUtils.calculateActionPriority(100)).toBe(10);

      expect(BattleLoopUtils.calculateActionPriority(50, { priority: 2 })).toBe(7);
      expect(BattleLoopUtils.calculateActionPriority(50, { priority: -1 })).toBe(4);
      expect(BattleLoopUtils.calculateActionPriority(50, { speed: 10 })).toBe(6);
    });

    test('should get battle result description correctly', () => {
      expect(BattleLoopUtils.getBattleResultDescription(BattleResult.PLAYER_WIN))
        .toContain('Player team wins');
      expect(BattleLoopUtils.getBattleResultDescription(BattleResult.OPPONENT_WIN))
        .toContain('Opponent team wins');
      expect(BattleLoopUtils.getBattleResultDescription(BattleResult.DRAW))
        .toContain('draw');
      expect(BattleLoopUtils.getBattleResultDescription(BattleResult.ONGOING))
        .toContain('ongoing');
    });

    test('should get expected phase sequence correctly', () => 
      const sequence1 = BattleLoopUtils.getExpectedPhaseSequence(1);
      const sequence2 = BattleLoopUtils.getExpectedPhaseSequence(2);

      expect(sequence1).toEqual([
        PRE_TURN: BattlePhase.PRE_TURN,
        BattlePhase.SELECT_ACTION,
        BattlePhase.RESOLVE_ACTION,
        BattlePhase.END_TURN
      ]);

      expect(sequence2).toEqual([
        BattlePhase.PRE_TURN,
        BattlePhase.SELECT_ACTION,
        BattlePhase.RESOLVE_ACTION,
        BattlePhase.END_TURN,
        BattlePhase.PRE_TURN,
        BattlePhase.SELECT_ACTION,
        BattlePhase.RESOLVE_ACTION,
        BattlePhase.END_TURN
      ]);
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete battle simulation', () => {
      const rng = new MockRNGProvider();
      const logger = new MockLogger();
      const eventBus = new MockEventBus();
      const controller = new BattleLoopController(rng, logger, eventBus);

      const actionSelector: ActionSelector = (actorId: number, availableMoves: string[]) => {
        const moveIndex = Math.floor(Math.random() * availableMoves.length);
        return BattleAction.create(
          actorId,
          actorId === 1 ? 2 : 1,
          availableMoves[moveIndex],
          0,
          50,
          actorId === 1 ? PLAYER: ActionSource.AI
        );
      };

      const availableActors = [1, 2];
      const availableMoves = {
        1: ['attack', 'defend', 'heal'],
        2: ['attack', 'defend', 'special']
      };

      // Simulate multiple turns
      for (let turn = 1; turn <= 3; turn++) {
        const seed = 1000 + turn;
        const state = controller.executeTurn(
          seed,
          actionSelector,
          availableActors,
          availableMoves
        );

        expect(state.turnNumber).toBe(turn + 1); // Starts at 1, increments each turn
        expect(state.currentPhase).toBe(BattlePhase.END_TURN);
        expect(state.actionsThisTurn).toHaveLength(2); // One action per actor
        expect(state.battleResult).toBe(BattleResult.ONGOING);
      }

      // Check final statistics
      const stats = controller.getBattleStatistics();
      expect(stats.totalActions).toBe(6); // 2 actions per turn * 3 turns
      expect(stats.averageActionsPerTurn).toBe(2);
      expect(stats.actionsBySource[ActionSource.PLAYER]).toBe(3);
      expect(stats.actionsBySource[ActionSource.AI]).toBe(3);
    });

    test('should handle battle with different action sources', () => {
      const controller = new BattleLoopController(
        new MockRNGProvider(),
        new MockLogger(),
        new MockEventBus()
      );

      const mixedActionSelector: ActionSelector = (actorId: number, availableMoves: string[]) => {
        // Alternate between player and AI actions
        const source = actorId % 2 === 1 ? PLAYER: ActionSource.AI;
        return BattleAction.create(
          actorId,
          2,
          availableMoves[0],
          0,
          50,
          source
        );
      };

      const state = controller.executeTurn(
        12345,
        mixedActionSelector,
        [1, 2],
        { 1: ['attack'], 2: ['defend'] }
      );

      expect(state.actionsThisTurn).toHaveLength(2);

      const playerActions = state.actionsThisTurn.filter(a => a.source === ActionSource.PLAYER);
      const aiActions = state.actionsThisTurn.filter(a => a.source === ActionSource.AI);

      expect(playerActions).toHaveLength(1);
      expect(aiActions).toHaveLength(1);
    });

    test('should handle battle completion scenarios', () => 
      const controller = new BattleLoopController(
        new MockRNGProvider(),
        new MockLogger(),
        new MockEventBus()
      );

      // Set up end condition
      controller.setEndCondition(PLAYER_WIN: BattleResult.PLAYER_WIN, (state) => {
        return state.turnNumber >= 2 ? PLAYER_WIN: BattleResult.ONGOING;
      });

      const actionSelector: ActionSelector = (actorId: number, availableMoves: string[]) => {
        return BattleAction.create(actorId, 2, 'continue', 0, 50, ActionSource.PLAYER);
      };

      // Turn 1 - should continue
      let state = controller.executeTurn(12345, actionSelector, [1], { 1: ['continue'] });
      expect(state.battleResult).toBe(BattleResult.ONGOING);
      expect(state.turnNumber).toBe(2);

      // Turn 2 - should end
      state = controller.executeTurn(12346, actionSelector, [1], { 1: ['continue'] });
      expect(state.battleResult).toBe(BattleResult.PLAYER_WIN);
      expect(state.turnNumber).toBe(3);
      expect(state.endTime).toBeDefined();
    });

    test('should handle phase event integration', () => {
      const eventBus = new MockEventBus();
      const controller = new BattleLoopController(
        new MockRNGProvider(),
        new MockLogger(),
        eventBus
      );

      const phaseChanges: string[] = [];
      const phaseEntries: string[] = [];

      eventBus.subscribe('battle/phase', (phase: BattlePhase) => {
        phaseChanges.push(phase);
      });

      eventBus.subscribe('battle/phase_entered', (phase: BattlePhase) => {
        phaseEntries.push(phase);
      });

      // Advance through phases
      controller.advancePhase(); // PRE_TURN -> SELECT_ACTION
      controller.advancePhase(); // SELECT_ACTION -> RESOLVE_ACTION
      controller.advancePhase(); // RESOLVE_ACTION -> END_TURN

      expect(phaseChanges).toEqual([
        BattlePhase.SELECT_ACTION,
        BattlePhase.RESOLVE_ACTION,
        BattlePhase.END_TURN
      ]);

      expect(phaseEntries).toEqual([
        BattlePhase.SELECT_ACTION,
        BattlePhase.RESOLVE_ACTION,
        BattlePhase.END_TURN
      ]);
    });

    test('should handle logging integration', () => {
      const logger = new MockLogger();
      const controller = new BattleLoopController(
        new MockRNGProvider(),
        logger,
        new MockEventBus()
      );

      const action = BattleAction.create(1, 2, 'test_action', 0, 50, ActionSource.PLAYER);
      const result = { damage: 25 };

      controller.executeTurn(
        12345,
        () => action,
        [1],
        { 1: ['test_action'] }
      );

      const logHistory = logger.getLogHistory();
      expect(logHistory.some(entry => entry.includes('phase'))).toBe(true);
      expect(logHistory.some(entry => entry.includes('test_action'))).toBe(true);
      expect(logHistory.some(entry => entry.includes('result'))).toBe(true);
    });
  });

  describe('Performance Characteristics', () => {
    test('should handle many actions efficiently', () => {
      const rng = new MockRNGProvider();
      const actionQueue = new ActionQueue(rng);
      const startTime = performance.now();

      // Add many actions
      for (let i = 0; i < 1000; i++) {
        const action = new BattleAction(
          i % 100,
          (i + 1) % 100,
          `action_${i % 10}`,
          Math.floor(i / 100),
          50 + (i % 50),
          i % 2 === 0 ? PLAYER: ActionSource.AI
        );
        actionQueue.enqueue(action);
      }

      const endTime = performance.now();

      expect(actionQueue.getLength()).toBe(1000);
      expect(endTime - startTime).toBeLessThan(200); // Should be fast
    });

    test('should handle rapid phase transitions efficiently', () => {
      const phaseManager = new BattlePhaseManager();
      const startTime = performance.now();

      // Rapid phase transitions
      for (let i = 0; i < 1000; i++) {
        phaseManager.advancePhase();
      }

      const endTime = performance.now();

      expect(phaseManager.getPhaseCount()).toBe(1001); // 1 initial + 1000 advances
      expect(endTime - startTime).toBeLessThan(50); // Should be very fast
    });

    test('should handle complex battle scenarios efficiently', () => {
      const controller = new BattleLoopController(
        new MockRNGProvider(),
        new MockLogger(),
        new MockEventBus()
      );

      const actionSelector: ActionSelector = (actorId: number, availableMoves: string[]) => {
        const moveIndex = actorId % availableMoves.length;
        return BattleAction.create(
          actorId,
          actorId === 1 ? 2 : 1,
          availableMoves[moveIndex],
          0,
          50,
          actorId === 1 ? PLAYER: ActionSource.AI
        );
      };

      const startTime = performance.now();

      // Complex multi-turn scenario
      for (let turn = 1; turn <= 100; turn++) {
        const availableActors = Array.from({ length: 10 }, (_, i) => i + 1);
        const availableMoves = Object.fromEntries(
          availableActors.map(actor => [
            actor,
            [`move_${actor % 5}`, 'defend', 'heal']
          ])
        );

        controller.executeTurn(
          1000 + turn,
          actionSelector,
          availableActors,
          availableMoves
        );
      }

      const endTime = performance.now();

      expect(controller.getBattleState().turnNumber).toBe(101);
      expect(endTime - startTime).toBeLessThan(1000); // Should be reasonably fast
    });
  });
});