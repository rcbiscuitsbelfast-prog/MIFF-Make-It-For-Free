/**
 * BattleLoopPure - Battle Loop Management System
 *
 * A comprehensive battle loop management system for orchestrating turn-based battles,
 * phase progression, action ordering, and battle completion. Supports deterministic
 * execution with configurable RNG providers and event integration.
 *
 * @module BattleLoopPure
 * @version 1.0.0
 * @license MIT
 */

/**
 * Battle phase enumeration
 */
export enum BattlePhase {
  PRE_TURN = 'pre_turn',
  SELECT_ACTION = 'select_action',
  RESOLVE_ACTION = 'resolve_action',
  END_TURN = 'end_turn'
}

/**
 * Action source enumeration
 */
export enum ActionSource {
  UNKNOWN = 'unknown',
  PLAYER = 'player',
  AI = 'ai'
}

/**
 * Battle result enumeration
 */
export enum BattleResult {
  ONGOING = 'ongoing',
  PLAYER_WIN = 'player_win',
  OPPONENT_WIN = 'opponent_win',
  DRAW = 'draw'
}

/**
 * Battle action interface
 */
export interface IBattleAction {
  actorId: number;
  targetId: number;
  moveId: string;
  priority: number;
  speed: number;
  source: ActionSource;
  timestampUtc: number;
  debugNotes?: string;
  metadata?: Record<string, any>;
  tieBreakerKey?: number;
}

/**
 * Battle state interface
 */
export interface IBattleState {
  turnNumber: number;
  currentPhase: BattlePhase;
  actionsThisTurn: IBattleAction[];
  pendingActions: IBattleAction[];
  processedActions: IBattleAction[];
  battleResult: BattleResult;
  startTime: number;
  endTime?: number;
  metadata?: Record<string, any>;
}

/**
 * Action selector delegate type
 */
export type ActionSelector = (actorId: number, availableMoves: string[]) => IBattleAction;

/**
 * Battle end condition checker
 */
export type BattleEndChecker = (state: IBattleState) => BattleResult;

/**
 * RNG provider interface (dependency)
 */
export interface IRNGProvider {
  setSeed(seed: number): void;
  nextInt(min?: number, max?: number): number;
  nextFloat(min?: number, max?: number): number;
  shuffle<T>(array: T[]): T[];
}

/**
 * Event bus interface (dependency)
 */
export interface IEventBus {
  publish(event: string, data?: any): void;
  subscribe(event: string, handler: (data?: any) => void): () => void;
}

/**
 * Logger interface (dependency)
 */
export interface ILogger {
  logPhaseChange(phase: BattlePhase): void;
  logAction(action: IBattleAction, result?: any): void;
  logSystem(message: string, category?: string, level?: string): void;
}

/**
 * Battle action implementation
 */
export class BattleAction implements IBattleAction {
  public actorId: number;
  public targetId: number;
  public moveId: string;
  public priority: number;
  public speed: number;
  public source: ActionSource;
  public timestampUtc: number;
  public debugNotes?: string;
  public metadata?: Record<string, any>;
  public tieBreakerKey?: number;

  constructor(
    actorId: number = 0,
    targetId: number = 0,
    moveId: string = '',
    priority: number = 0,
    speed: number = 0,
    source: ActionSource = ActionSource.UNKNOWN,
    debugNotes?: string,
    metadata?: Record<string, any>
  ) {
    this.actorId = actorId;
    this.targetId = targetId;
    this.moveId = moveId;
    this.priority = priority;
    this.speed = speed;
    this.source = source;
    this.timestampUtc = Date.now();
    this.debugNotes = debugNotes;
    this.metadata = metadata;
  }

  /**
   * Create action with specific parameters
   */
  static create(
    actorId: number,
    targetId: number,
    moveId: string,
    priority: number = 0,
    speed: number = 0,
    source: ActionSource = ActionSource.UNKNOWN,
    debugNotes?: string,
    metadata?: Record<string, any>
  ): BattleAction {
    return new BattleAction(actorId, targetId, moveId, priority, speed, source, debugNotes, metadata);
  }

  /**
   * Create player action
   */
  static player(
    actorId: number,
    targetId: number,
    moveId: string,
    priority: number = 0,
    speed: number = 0,
    debugNotes?: string,
    metadata?: Record<string, any>
  ): BattleAction {
    return new BattleAction(actorId, targetId, moveId, priority, speed, ActionSource.PLAYER, debugNotes, metadata);
  }

  /**
   * Create AI action
   */
  static ai(
    actorId: number,
    targetId: number,
    moveId: string,
    priority: number = 0,
    speed: number = 0,
    debugNotes?: string,
    metadata?: Record<string, any>
  ): BattleAction {
    return new BattleAction(actorId, targetId, moveId, priority, speed, ActionSource.AI, debugNotes, metadata);
  }

  /**
   * Get action summary
   */
  getSummary(): string {
    return `Actor=${this.actorId} Target=${this.targetId} Move=${this.moveId} Pri=${this.priority} Spd=${this.speed} Src=${this.source}`;
  }

  /**
   * Get formatted action string
   */
  toString(): string {
    return this.getSummary();
  }

  /**
   * Clone action
   */
  clone(): BattleAction {
    return new BattleAction(
      this.actorId,
      this.targetId,
      this.moveId,
      this.priority,
      this.speed,
      this.source,
      this.debugNotes,
      this.metadata ? { ...this.metadata } : undefined
    );
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return {
      actorId: this.actorId,
      targetId: this.targetId,
      moveId: this.moveId,
      priority: this.priority,
      speed: this.speed,
      source: this.source,
      timestampUtc: this.timestampUtc,
      debugNotes: this.debugNotes,
      metadata: this.metadata,
      tieBreakerKey: this.tieBreakerKey
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: Record<string, any>): BattleAction {
    const action = new BattleAction();
    Object.assign(action, data);
    return action;
  }

  /**
   * Calculate action score for ordering
   */
  getActionScore(): number {
    // Primary: Priority (higher = first)
    // Secondary: Speed (higher = first)
    // Tertiary: Tie-breaker key
    // Quaternary: Timestamp (earlier = first)
    return this.priority * 10000 +
           this.speed * 100 +
           (this.tieBreakerKey || 0) * 0.01 +
           (1000000000 - this.timestampUtc) * 0.000001;
  }

  /**
   * Compare actions for ordering
   */
  static compareActions(a: BattleAction, b: BattleAction): number {
    const scoreA = a.getActionScore();
    const scoreB = b.getActionScore();
    return scoreB - scoreA; // Higher score first
  }

  /**
   * Validate action
   */
  validate(): string[] {
    const errors: string[] = [];

    if (this.actorId < 0) {
      errors.push('Actor ID cannot be negative');
    }

    if (this.targetId < 0) {
      errors.push('Target ID cannot be negative');
    }

    if (!this.moveId || this.moveId.trim() === '') {
      errors.push('Move ID cannot be empty');
    }

    if (this.priority < 0 || this.priority > 10) {
      errors.push('Priority must be between 0 and 10');
    }

    if (this.speed < 0) {
      errors.push('Speed cannot be negative');
    }

    return errors;
  }
}

/**
 * Battle phase manager implementation
 */
export class BattlePhaseManager {
  private currentPhase: BattlePhase = BattlePhase.PRE_TURN;
  private phaseHistory: BattlePhase[] = [BattlePhase.PRE_TURN];

  // Events for observers (logging, effects, UI adapters)
  public onPhaseChanged?: (from: BattlePhase, to: BattlePhase) => void;
  public onPhaseEntered?: (phase: BattlePhase) => void;

  /**
   * Get current phase
   */
  getCurrentPhase(): BattlePhase {
    return this.currentPhase;
  }

  /**
   * Set current phase (internal use)
   */
  private setCurrentPhase(phase: BattlePhase): void {
    const previous = this.currentPhase;
    this.currentPhase = phase;
    this.phaseHistory.push(phase);
    this.onPhaseChanged?.(previous, phase);
  }

  /**
   * Advance to next phase
   */
  advancePhase(): BattlePhase {
    const nextPhase = BattlePhaseManager.getNextPhase(this.currentPhase);
    this.setCurrentPhase(nextPhase);
    this.onPhaseEntered?.(nextPhase);
    return nextPhase;
  }

  /**
   * Get next phase in sequence
   */
  static getNextPhase(phase: BattlePhase): BattlePhase {
    switch (phase) {
      case BattlePhase.PRE_TURN:
        return BattlePhase.SELECT_ACTION;
      case BattlePhase.SELECT_ACTION:
        return BattlePhase.RESOLVE_ACTION;
      case BattlePhase.RESOLVE_ACTION:
        return BattlePhase.END_TURN;
      case BattlePhase.END_TURN:
        return BattlePhase.PRE_TURN;
      default:
        return BattlePhase.PRE_TURN;
    }
  }

  /**
   * Get all phases in order
   */
  static getAllPhases(): BattlePhase[] {
    return [
      BattlePhase.PRE_TURN,
      BattlePhase.SELECT_ACTION,
      BattlePhase.RESOLVE_ACTION,
      BattlePhase.END_TURN
    ];
  }

  /**
   * Check if phase is valid
   */
  static isValidPhase(phase: string): phase is BattlePhase {
    return Object.values(BattlePhase).includes(phase as BattlePhase);
  }

  /**
   * Get phase description
   */
  static getPhaseDescription(phase: BattlePhase): string {
    switch (phase) {
      case BattlePhase.PRE_TURN:
        return 'Preparation phase before turn starts';
      case BattlePhase.SELECT_ACTION:
        return 'Action selection phase';
      case BattlePhase.RESOLVE_ACTION:
        return 'Action resolution phase';
      case BattlePhase.END_TURN:
        return 'Turn cleanup phase';
      default:
        return 'Unknown phase';
    }
  }

  /**
   * Get phase history
   */
  getPhaseHistory(): readonly BattlePhase[] {
    return [...this.phaseHistory];
  }

  /**
   * Get phase count
   */
  getPhaseCount(): number {
    return this.phaseHistory.length;
  }

  /**
   * Reset to initial phase
   */
  reset(): void {
    this.currentPhase = BattlePhase.PRE_TURN;
    this.phaseHistory = [BattlePhase.PRE_TURN];
  }

  /**
   * Force set phase (for testing or recovery)
   */
  forceSetPhase(phase: BattlePhase): void {
    this.setCurrentPhase(phase);
  }
}

/**
 * Action queue for deterministic ordering
 */
export class ActionQueue {
  private actions: BattleAction[] = [];
  private readonly rng: IRNGProvider;

  constructor(rng: IRNGProvider) {
    this.rng = rng;
  }

  /**
   * Add action to queue
   */
  enqueue(action: BattleAction): void {
    // Assign tie-breaker for deterministic ordering
    action.tieBreakerKey = this.rng.nextFloat();

    // Insert in correct position
    const insertIndex = this.findInsertIndex(action);
    this.actions.splice(insertIndex, 0, action);
  }

  /**
   * Remove and return next action
   */
  dequeue(): BattleAction | null {
    return this.actions.shift() || null;
  }

  /**
   * Get next action without removing
   */
  peek(): BattleAction | null {
    return this.actions[0] || null;
  }

  /**
   * Get all actions
   */
  getAllActions(): readonly BattleAction[] {
    return [...this.actions];
  }

  /**
   * Get actions by actor
   */
  getActionsByActor(actorId: number): BattleAction[] {
    return this.actions.filter(action => action.actorId === actorId);
  }

  /**
   * Get actions by source
   */
  getActionsBySource(source: ActionSource): BattleAction[] {
    return this.actions.filter(action => action.source === source);
  }

  /**
   * Remove actions by actor
   */
  removeActionsByActor(actorId: number): BattleAction[] {
    const removed: BattleAction[] = [];

    this.actions = this.actions.filter(action => {
      if (action.actorId === actorId) {
        removed.push(action);
        return false;
      }
      return true;
    });

    return removed;
  }

  /**
   * Clear all actions
   */
  clear(): void {
    this.actions = [];
  }

  /**
   * Get queue length
   */
  getLength(): number {
    return this.actions.length;
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.actions.length === 0;
  }

  /**
   * Find correct insert position for action
   */
  private findInsertIndex(action: BattleAction): number {
    let left = 0;
    let right = this.actions.length;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      const comparison = BattleAction.compareActions(this.actions[mid], action);

      if (comparison < 0) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    return left;
  }

  /**
   * Sort actions (for validation or debugging)
   */
  sortActions(): void {
    this.actions.sort(BattleAction.compareActions);
  }

  /**
   * Validate all actions in queue
   */
  validateActions(): string[] {
    const errors: string[] = [];

    this.actions.forEach((action, index) => {
      const actionErrors = action.validate();
      actionErrors.forEach(error => {
        errors.push(`Action ${index} (Actor ${action.actorId}): ${error}`);
      });
    });

    return errors;
  }
}

/**
 * Battle end manager
 */
export class BattleEndManager {
  private endConditions: Map<BattleResult, BattleEndChecker> = new Map();
  private battleState: IBattleState | null = null;

  constructor() {
    this.initializeDefaultConditions();
  }

  /**
   * Initialize default battle end conditions
   */
  private initializeDefaultConditions(): void {
    // All opponents defeated
    this.endConditions.set(BattleResult.PLAYER_WIN, (state) => {
      const playerActions = state.actionsThisTurn.filter(a => a.source === ActionSource.PLAYER);
      const opponentActions = state.actionsThisTurn.filter(a => a.source === ActionSource.AI);

      if (playerActions.length === 0 && opponentActions.length === 0) {
        return BattleResult.DRAW; // No actions this turn
      }

      return BattleResult.ONGOING;
    });

    // All players defeated
    this.endConditions.set(BattleResult.OPPONENT_WIN, (state) => {
      return BattleResult.ONGOING;
    });

    // Draw conditions
    this.endConditions.set(BattleResult.DRAW, (state) => {
      return BattleResult.ONGOING;
    });
  }

  /**
   * Register custom end condition
   */
  registerEndCondition(result: BattleResult, checker: BattleEndChecker): void {
    this.endConditions.set(result, checker);
  }

  /**
   * Remove end condition
   */
  removeEndCondition(result: BattleResult): boolean {
    return this.endConditions.delete(result);
  }

  /**
   * Check if battle should end
   */
  checkBattleEnd(state: IBattleState): BattleResult {
    this.battleState = state;

    for (const [result, checker] of this.endConditions) {
      const conditionResult = checker(state);
      if (conditionResult !== BattleResult.ONGOING) {
        return conditionResult;
      }
    }

    return BattleResult.ONGOING;
  }

  /**
   * Get battle end reason
   */
  getBattleEndReason(result: BattleResult): string {
    switch (result) {
      case BattleResult.PLAYER_WIN:
        return 'Player team defeated all opponents';
      case BattleResult.OPPONENT_WIN:
        return 'Opponent team defeated all players';
      case BattleResult.DRAW:
        return 'Battle ended in a draw';
      default:
        return 'Battle is ongoing';
    }
  }

  /**
   * Get current battle state
   */
  getBattleState(): IBattleState | null {
    return this.battleState;
  }

  /**
   * Force battle end
   */
  forceEndBattle(result: BattleResult): void {
    if (this.battleState) {
      this.battleState.battleResult = result;
      this.battleState.endTime = Date.now();
    }
  }

  /**
   * Reset end manager
   */
  reset(): void {
    this.battleState = null;
  }
}

/**
 * Battle loop controller implementation
 */
export class BattleLoopController {
  private readonly rng: IRNGProvider;
  private readonly phaseManager: BattlePhaseManager;
  private readonly actionQueue: ActionQueue;
  private readonly endManager: BattleEndManager;
  private readonly logger?: ILogger;
  private readonly eventBus?: IEventBus;

  private battleState: IBattleState;
  private log: string[] = [];

  constructor(
    rng: IRNGProvider,
    logger?: ILogger,
    eventBus?: IEventBus
  ) {
    this.rng = rng;
    this.logger = logger;
    this.eventBus = eventBus;

    this.phaseManager = new BattlePhaseManager();
    this.actionQueue = new ActionQueue(rng);
    this.endManager = new BattleEndManager();

    this.battleState = this.createInitialBattleState();

    // Set up event handlers
    this.setupEventHandlers();
  }

  /**
   * Create initial battle state
   */
  private createInitialBattleState(): IBattleState {
    return {
      turnNumber: 1,
      currentPhase: BattlePhase.PRE_TURN,
      actionsThisTurn: [],
      pendingActions: [],
      processedActions: [],
      battleResult: BattleResult.ONGOING,
      startTime: Date.now()
    };
  }

  /**
   * Set up event handlers
   */
  private setupEventHandlers(): void {
    this.phaseManager.onPhaseChanged = (from, to) => {
      this.log.push(`Phase: ${from} -> ${to}`);
      this.logger?.logPhaseChange(to);
      this.eventBus?.publish('battle/phase', to);
    };

    this.phaseManager.onPhaseEntered = (phase) => {
      this.battleState.currentPhase = phase;
      this.eventBus?.publish('battle/phase_entered', phase);
    };
  }

  /**
   * Get current battle state
   */
  getBattleState(): IBattleState {
    return { ...this.battleState };
  }

  /**
   * Get current phase
   */
  getCurrentPhase(): BattlePhase {
    return this.phaseManager.getCurrentPhase();
  }

  /**
   * Advance to next phase
   */
  advancePhase(): BattlePhase {
    return this.phaseManager.advancePhase();
  }

  /**
   * Execute full turn with action selection
   */
  executeTurn(
    seed: number,
    actionSelector: ActionSelector,
    availableActors: number[],
    availableMoves: Record<number, string[]>
  ): IBattleState {
    this.rng.setSeed(seed);
    this.battleState.turnNumber++;

    // Reset turn state
    this.battleState.actionsThisTurn = [];
    this.battleState.pendingActions = [];
    this.actionQueue.clear();

    // Phase progression
    this.logPhaseChange(BattlePhase.PRE_TURN);

    // Select actions
    this.logPhaseChange(BattlePhase.SELECT_ACTION);
    this.selectActions(actionSelector, availableActors, availableMoves);

    // Resolve actions
    this.logPhaseChange(BattlePhase.RESOLVE_ACTION);
    this.resolveActions();

    // End turn
    this.logPhaseChange(BattlePhase.END_TURN);

    // Check battle end
    this.battleState.battleResult = this.endManager.checkBattleEnd(this.battleState);
    if (this.battleState.battleResult !== BattleResult.ONGOING) {
      this.battleState.endTime = Date.now();
      this.logger?.logSystem(
        `Battle ended: ${this.endManager.getBattleEndReason(this.battleState.battleResult)}`,
        'battle',
        'info'
      );
    }

    return this.getBattleState();
  }

  /**
   * Log phase change
   */
  private logPhaseChange(phase: BattlePhase): void {
    this.phaseManager.advancePhase();
  }

  /**
   * Select actions for all actors
   */
  private selectActions(
    actionSelector: ActionSelector,
    availableActors: number[],
    availableMoves: Record<number, string[]>
  ): void {
    for (const actorId of availableActors) {
      const moves = availableMoves[actorId] || [];

      if (moves.length === 0) {
        this.logger?.logSystem(`No moves available for actor ${actorId}`, 'battle', 'warn');
        continue;
      }

      try {
        const action = actionSelector(actorId, moves);
        this.actionQueue.enqueue(action);
        this.battleState.pendingActions.push(action);
      } catch (error) {
        this.logger?.logSystem(
          `Failed to select action for actor ${actorId}: ${error}`,
          'battle',
          'error'
        );
      }
    }
  }

  /**
   * Resolve all queued actions
   */
  private resolveActions(): void {
    while (!this.actionQueue.isEmpty()) {
      const action = this.actionQueue.dequeue();
      if (action) {
        this.processAction(action);
        this.battleState.processedActions.push(action);
      }
    }
  }

  /**
   * Process individual action
   */
  private processAction(action: IBattleAction): void {
    this.logger?.logAction(action);

    // In a real implementation, this would:
    // 1. Validate action
    // 2. Calculate effects
    // 3. Apply damage/healing
    // 4. Trigger status effects
    // 5. Update battle state

    this.battleState.actionsThisTurn.push(action);
  }

  /**
   * Get battle log
   */
  getBattleLog(): readonly string[] {
    return [...this.log];
  }

  /**
   * Get action queue
   */
  getActionQueue(): ActionQueue {
    return this.actionQueue;
  }

  /**
   * Get phase manager
   */
  getPhaseManager(): BattlePhaseManager {
    return this.phaseManager;
  }

  /**
   * Reset battle state
   */
  reset(): void {
    this.battleState = this.createInitialBattleState();
    this.log = [];
    this.actionQueue.clear();
    this.phaseManager.reset();
    this.endManager.reset();
  }

  /**
   * Set custom end condition
   */
  setEndCondition(result: BattleResult, checker: BattleEndChecker): void {
    this.endManager.registerEndCondition(result, checker);
  }

  /**
   * Force battle end
   */
  forceEndBattle(result: BattleResult): void {
    this.endManager.forceEndBattle(result);
    this.battleState.battleResult = result;
    this.battleState.endTime = Date.now();
  }

  /**
   * Get battle statistics
   */
  getBattleStatistics(): {
    totalActions: number;
    actionsBySource: Record<ActionSource, number>;
    averageActionsPerTurn: number;
    battleDuration: number;
    phasesExecuted: number;
  } {
    const totalActions = this.battleState.actionsThisTurn.length +
                        this.battleState.pendingActions.length +
                        this.battleState.processedActions.length;

    const actionsBySource: Record<ActionSource, number> = {
      [ActionSource.PLAYER]: 0,
      [ActionSource.AI]: 0,
      [ActionSource.UNKNOWN]: 0
    };

    const allActions = [
      ...this.battleState.actionsThisTurn,
      ...this.battleState.pendingActions,
      ...this.battleState.processedActions
    ];

    allActions.forEach(action => {
      actionsBySource[action.source]++;
    });

    const battleDuration = this.battleState.endTime
      ? this.battleState.endTime - this.battleState.startTime
      : Date.now() - this.battleState.startTime;

    const averageActionsPerTurn = this.battleState.turnNumber > 0
      ? totalActions / this.battleState.turnNumber
      : 0;

    return {
      totalActions,
      actionsBySource,
      averageActionsPerTurn,
      battleDuration,
      phasesExecuted: this.phaseManager.getPhaseCount()
    };
  }
}

/**
 * Utility functions for battle loop operations
 */
export const BattleLoopUtils = {
  /**
   * Create default RNG provider (simple implementation)
   */
  createDefaultRNG(): IRNGProvider {
    let seed = 0;

    return {
      setSeed: (newSeed: number) => { seed = newSeed; },
      nextInt: (min: number = 0, max: number = 100) => {
        seed = (seed * 9301 + 49297) % 233280;
        return Math.floor((seed / 233280) * (max - min)) + min;
      },
      nextFloat: (min: number = 0, max: number = 1) => {
        seed = (seed * 9301 + 49297) % 233280;
        return ((seed / 233280) * (max - min)) + min;
      },
      shuffle: <T>(array: T[]): T[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      }
    };
  },

  /**
   * Create default event bus (simple implementation)
   */
  createDefaultEventBus(): IEventBus {
    const handlers = new Map<string, ((data?: any) => void)[]>();

    return {
      publish: (event: string, data?: any) => {
        const eventHandlers = handlers.get(event) || [];
        eventHandlers.forEach(handler => {
          try {
            handler(data);
          } catch (error) {
            console.error(`Error in event handler for ${event}:`, error);
          }
        });
      },
      subscribe: (event: string, handler: (data?: any) => void) => {
        if (!handlers.has(event)) {
          handlers.set(event, []);
        }
        handlers.get(event)!.push(handler);

        // Return unsubscribe function
        return () => {
          const eventHandlers = handlers.get(event) || [];
          const index = eventHandlers.indexOf(handler);
          if (index >= 0) {
            eventHandlers.splice(index, 1);
          }
        };
      }
    };
  },

  /**
   * Create default logger (console implementation)
   */
  createDefaultLogger(): ILogger {
    return {
      logPhaseChange: (phase: BattlePhase) => {
        console.log(`[BATTLE] Phase changed to: ${phase}`);
      },
      logAction: (action: IBattleAction, result?: any) => {
        console.log(`[BATTLE] Action: ${action.getSummary()}${result ? ` Result: ${JSON.stringify(result)}` : ''}`);
      },
      logSystem: (message: string, category?: string, level?: string) => {
        const prefix = category ? `[${category.toUpperCase()}]` : '[SYSTEM]';
        const levelPrefix = level ? `[${level.toUpperCase()}]` : '';
        console.log(`${prefix}${levelPrefix} ${message}`);
      }
    };
  },

  /**
   * Validate battle state
   */
  validateBattleState(state: IBattleState): string[] {
    const errors: string[] = [];

    if (state.turnNumber < 1) {
      errors.push('Turn number must be at least 1');
    }

    if (!BattlePhaseManager.isValidPhase(state.currentPhase)) {
      errors.push('Invalid current phase');
    }

    if (state.startTime <= 0) {
      errors.push('Invalid start time');
    }

    if (state.endTime && state.endTime < state.startTime) {
      errors.push('End time cannot be before start time');
    }

    // Validate actions
    const allActions = [
      ...state.actionsThisTurn,
      ...state.pendingActions,
      ...state.processedActions
    ];

    allActions.forEach((action, index) => {
      const actionErrors = action.validate();
      actionErrors.forEach(error => {
        errors.push(`Action ${index}: ${error}`);
      });
    });

    return errors;
  },

  /**
   * Create standard battle loop controller
   */
  createStandardController(): BattleLoopController {
    const rng = BattleLoopUtils.createDefaultRNG();
    const logger = BattleLoopUtils.createDefaultLogger();
    const eventBus = BattleLoopUtils.createDefaultEventBus();

    return new BattleLoopController(rng, logger, eventBus);
  },

  /**
   * Create battle action from move selection
   */
  createActionFromMove(
    actorId: number,
    targetId: number,
    moveId: string,
    source: ActionSource = ActionSource.PLAYER
  ): BattleAction {
    return BattleAction.create(
      actorId,
      targetId,
      moveId,
      0, // Default priority
      0, // Default speed
      source
    );
  },

  /**
   * Calculate action priority based on speed and modifiers
   */
  calculateActionPriority(baseSpeed: number, modifiers: Record<string, number> = {}): number {
    let priority = Math.floor(baseSpeed / 10); // Base priority from speed
    let speed = baseSpeed;

    // Apply modifiers
    if (modifiers.speed) {
      speed += modifiers.speed;
    }

    if (modifiers.priority) {
      priority += modifiers.priority;
    }

    // Clamp priority
    priority = Math.max(0, Math.min(10, priority));

    return priority;
  },

  /**
   * Compare battle states for equality
   */
  compareBattleStates(state1: IBattleState, state2: IBattleState): boolean {
    return (
      state1.turnNumber === state2.turnNumber &&
      state1.currentPhase === state2.currentPhase &&
      state1.battleResult === state2.battleResult &&
      state1.startTime === state2.startTime &&
      state1.endTime === state2.endTime
    );
  },

  /**
   * Get battle result description
   */
  getBattleResultDescription(result: BattleResult): string {
    switch (result) {
      case BattleResult.PLAYER_WIN:
        return 'Player team wins';
      case BattleResult.OPPONENT_WIN:
        return 'Opponent team wins';
      case BattleResult.DRAW:
        return 'Battle ends in a draw';
      case BattleResult.ONGOING:
        return 'Battle is ongoing';
      default:
        return 'Unknown battle result';
    }
  },

  /**
   * Get phase sequence for validation
   */
  getExpectedPhaseSequence(turnNumber: number): BattlePhase[] {
    const sequence: BattlePhase[] = [];

    for (let turn = 1; turn <= turnNumber; turn++) {
      sequence.push(
        BattlePhase.PRE_TURN,
        BattlePhase.SELECT_ACTION,
        BattlePhase.RESOLVE_ACTION,
        BattlePhase.END_TURN
      );
    }

    return sequence;
  }
};

/**
 * Default instances
 */
export const defaultBattleAction = new BattleAction();
export const defaultBattleLoopController = BattleLoopUtils.createStandardController();
export const defaultBattlePhaseManager = new BattlePhaseManager();
export const defaultActionQueue = new ActionQueue(BattleLoopUtils.createDefaultRNG());
export const defaultBattleEndManager = new BattleEndManager();