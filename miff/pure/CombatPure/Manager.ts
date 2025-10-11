/**
 * CombatPure Manager - Advanced Combat Management System
 *
 * Comprehensive combat management with:
 * - Battle orchestration and state management
 * - AI integration and decision making
 * - Performance optimization and caching
 * - Combat analytics and reporting
 * - Multi-battle support and persistence
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import {
  CombatEngine,
  CombatState,
  Combatant,
  Action,
  ActionSource,
  CombatResult,
  MoveCategory,
  ICombatant,
  IBattleAction,
  IRNGProvider,
  InventoryHook,
  AIHook,
  SaveHook,
  Stats
} from './engine.js';

export interface CombatManagerConfig {
  enableCaching: boolean;
  enableAnalytics: boolean;
  enableAI: boolean;
  enablePersistence: boolean;
  maxConcurrentBattles: number;
  battleTimeout: number;
  enablePerformanceMetrics: boolean;
  enableReplay: boolean;
}

export interface BattleSession {
  id: string;
  state: CombatState;
  startTime: number;
  endTime?: number;
  result?: CombatResult;
  actions: Action[];
  metadata: Record<string, any>;
  performance: {
    totalActions: number;
    averageActionTime: number;
    aiDecisionTime: number;
    engineProcessingTime: number;
  };
}

export interface CombatAnalytics {
  totalBattles: number;
  victories: number;
  defeats: number;
  draws: number;
  averageBattleDuration: number;
  mostUsedMoves: Array<{ moveId: string; count: number }>;
  aiPerformance: {
    totalDecisions: number;
    averageDecisionTime: number;
    accuracy: number;
  };
  performanceMetrics: {
    averageFrameTime: number;
    memoryUsage: number;
    cacheHitRate: number;
  };
}

export interface AIDecisionContext {
  combatantId: string;
  state: CombatState;
  availableActions: Action[];
  threatLevel: number;
  teamAdvantage: number;
  resourceStatus: 'high' | 'medium' | 'low';
  battlePhase: 'early' | 'mid' | 'late';
}

export class CombatManager {
  private config: CombatManagerConfig;
  private activeBattles: Map<string, BattleSession>;
  private battleHistory: BattleSession[];
  private analytics: CombatAnalytics;
  private aiHook?: AIHook;
  private inventoryHook?: InventoryHook;
  private saveHook?: SaveHook;
  private rngProvider?: IRNGProvider;
  private performanceMetrics: {
    totalOperations: number;
    averageResponseTime: number;
    cacheHitRate: number;
    lastOptimization: number;
  };

  constructor(config: Partial<CombatManagerConfig> = {}) {
    this.config = {
      enableCaching: true,
      enableAnalytics: true,
      enableAI: true,
      enablePersistence: true,
      maxConcurrentBattles: 10,
      battleTimeout: 300000, // 5 minutes
      enablePerformanceMetrics: true,
      enableReplay: true,
      ...config
    };

    this.activeBattles = new Map();
    this.battleHistory = [];
    this.analytics = this.initializeAnalytics();
    this.performanceMetrics = {
      totalOperations: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      lastOptimization: Date.now()
    };
  }

  /**
   * Start a new battle session
   */
  startBattle(
    combatants: Combatant[],
    options: {
      battleId?: string;
      metadata?: Record<string, any>;
      aiEnabled?: boolean;
      timeout?: number;
    } = {}
  ): string {
    const startTime = performance.now();
    
    if (this.activeBattles.size >= this.config.maxConcurrentBattles) {
      throw new Error('Maximum concurrent battles reached');
    }

    const battleId = options.battleId || `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create initial combat state
    const combatantsMap: Record<string, Combatant> = {};
    combatants.forEach(c => {
      combatantsMap[c.id] = {
        ...c,
        status: { ...c.status, ko: false, fled: false, defending: false }
      };
    });

    const initialState: CombatState = {
      combatants: combatantsMap,
      order: combatants.map(c => c.id),
      queue: [],
      phase: 'preparation',
      turnNumber: 0
    };

    // Create battle session
    const session: BattleSession = {
      id: battleId,
      state: initialState,
      startTime: Date.now(),
      actions: [],
      metadata: options.metadata || {},
      performance: {
        totalActions: 0,
        averageActionTime: 0,
        aiDecisionTime: 0,
        engineProcessingTime: 0
      }
    };

    this.activeBattles.set(battleId, session);
    this.updatePerformanceMetrics(performance.now() - startTime);

    return battleId;
  }

  /**
   * Execute an action in a battle
   */
  async executeAction(
    battleId: string,
    action: Action
  ): Promise<{ success: boolean; result?: CombatResult; message: string; newState?: CombatState }> {
    const startTime = performance.now();
    
    const session = this.activeBattles.get(battleId);
    if (!session) {
      return { success: false, message: 'Battle not found' };
    }

    if (session.state.result !== CombatResult.ONGOING) {
      return { success: false, message: 'Battle has ended' };
    }

    // Check timeout
    if (Date.now() - session.startTime > (this.config.battleTimeout)) {
      session.state.result = CombatResult.DRAW;
      session.endTime = Date.now();
      return { success: false, message: 'Battle timed out', result: CombatResult.DRAW };
    }

    try {
      // Create combat engine for this action
      const engine = new CombatEngine();
      
      // Set up hooks if available
      if (this.aiHook) engine.setAIHook(this.aiHook);
      if (this.inventoryHook) engine.setInventoryHook(this.inventoryHook);
      if (this.saveHook) engine.setSaveHook(this.saveHook);
      if (this.rngProvider) engine.setRNGProvider(this.rngProvider);

      // Execute action
      const actionStartTime = performance.now();
      const result = await engine.processAction(session.state, action);
      const actionTime = performance.now() - actionStartTime;

      // Update session
      session.state = result.newState;
      session.actions.push(action);
      session.performance.totalActions++;
      session.performance.averageActionTime = 
        (session.performance.averageActionTime * (session.performance.totalActions - 1) + actionTime) 
        / session.performance.totalActions;

      // Check if battle ended
      if (result.newState.result !== CombatResult.ONGOING) {
        session.endTime = Date.now();
        session.result = result.newState.result;
        
        // Move to history
        this.battleHistory.push(session);
        this.activeBattles.delete(battleId);
        
        // Update analytics
        if (this.config.enableAnalytics) {
          this.updateAnalytics(session);
        }
      }

      this.updatePerformanceMetrics(performance.now() - startTime);
      
      return {
        success: true,
        result: result.newState.result,
        message: 'Action executed successfully',
        newState: result.newState
      };

    } catch (error) {
      this.updatePerformanceMetrics(performance.now() - startTime);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get AI-suggested action for a combatant
   */
  async getAIAction(battleId: string, combatantId: string): Promise<Action | null> {
    const startTime = performance.now();
    
    const session = this.activeBattles.get(battleId);
    if (!session || !this.aiHook) {
      return null;
    }

    try {
      const aiStartTime = performance.now();
      const action = await this.aiHook.pickAction(session.state, combatantId);
      const aiTime = performance.now() - aiStartTime;
      
      session.performance.aiDecisionTime = 
        (session.performance.aiDecisionTime * session.performance.totalActions + aiTime) 
        / (session.performance.totalActions + 1);

      this.updatePerformanceMetrics(performance.now() - startTime);
      return action;
    } catch (error) {
      this.updatePerformanceMetrics(performance.now() - startTime);
      return null;
    }
  }

  /**
   * Get current battle state
   */
  getBattleState(battleId: string): CombatState | null {
    const session = this.activeBattles.get(battleId);
    return session ? session.state : null;
  }

  /**
   * Get battle session details
   */
  getBattleSession(battleId: string): BattleSession | null {
    return this.activeBattles.get(battleId) || null;
  }

  /**
   * Get all active battles
   */
  getActiveBattles(): BattleSession[] {
    return Array.from(this.activeBattles.values());
  }

  /**
   * End a battle manually
   */
  endBattle(battleId: string, result: CombatResult = CombatResult.DRAW): boolean {
    const session = this.activeBattles.get(battleId);
    if (!session) {
      return false;
    }

    session.endTime = Date.now();
    session.result = result;
    session.state.result = result;

    // Move to history
    this.battleHistory.push(session);
    this.activeBattles.delete(battleId);

    // Update analytics
    if (this.config.enableAnalytics) {
      this.updateAnalytics(session);
    }

    return true;
  }

  /**
   * Get battle replay data
   */
  getBattleReplay(battleId: string): { session: BattleSession; replay: Action[] } | null {
    const session = this.battleHistory.find(s => s.id === battleId) || this.activeBattles.get(battleId);
    if (!session) {
      return null;
    }

    return {
      session,
      replay: session.actions
    };
  }

  /**
   * Get combat analytics
   */
  getAnalytics(): CombatAnalytics {
    return { ...this.analytics };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): typeof this.performanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Set AI hook for automated decision making
   */
  setAIHook(hook: AIHook): void {
    this.aiHook = hook;
  }

  /**
   * Set inventory hook for item management
   */
  setInventoryHook(hook: InventoryHook): void {
    this.inventoryHook = hook;
  }

  /**
   * Set save hook for persistence
   */
  setSaveHook(hook: SaveHook): void {
    this.saveHook = hook;
  }

  /**
   * Set RNG provider for deterministic battles
   */
  setRNGProvider(provider: IRNGProvider): void {
    this.rngProvider = provider;
  }

  /**
   * Optimize performance by cleaning up old data
   */
  optimizePerformance(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    // Clean up old battle history
    this.battleHistory = this.battleHistory.filter(session => 
      (session.endTime || now) - session.startTime < maxAge
    );

    // Clean up timed out battles
    for (const [battleId, session] of this.activeBattles) {
      if (now - session.startTime > this.config.battleTimeout) {
        this.endBattle(battleId, CombatResult.DRAW);
      }
    }

    this.performanceMetrics.lastOptimization = now;
  }

  /**
   * Get battle statistics for a specific combatant
   */
  getCombatantStats(combatantId: string): {
    totalBattles: number;
    victories: number;
    defeats: number;
    draws: number;
    winRate: number;
    averageBattleDuration: number;
    mostUsedMoves: Array<{ moveId: string; count: number }>;
  } {
    const combatantBattles = this.battleHistory.filter(session =>
      session.state.combatants.some(c => c.id === combatantId)
    );

    const victories = combatantBattles.filter(session => {
      const combatant = session.state.combatants.find(c => c.id === combatantId);
      const isWinner = session.result === CombatResult.VICTORY && 
        combatant && !combatant.status?.ko && !combatant.status?.fled;
      return isWinner;
    }).length;

    const defeats = combatantBattles.filter(session => {
      const combatant = session.state.combatants.find(c => c.id === combatantId);
      const isLoser = session.result === CombatResult.DEFEAT && 
        combatant && (combatant.status?.ko || combatant.status?.fled);
      return isLoser;
    }).length;

    const draws = combatantBattles.length - victories - defeats;
    const winRate = combatantBattles.length > 0 ? victories / combatantBattles.length : 0;

    const averageBattleDuration = combatantBattles.length > 0
      ? combatantBattles.reduce((sum, session) => 
          sum + ((session.endTime || Date.now()) - session.startTime), 0) / combatantBattles.length
      : 0;

    // Count move usage
    const moveCounts = new Map<string, number>();
    for (const session of combatantBattles) {
      for (const action of session.actions) {
        if (action.actorId === combatantId && action.moveId) {
          const count = moveCounts.get(action.moveId) || 0;
          moveCounts.set(action.moveId, count + 1);
        }
      }
    }

    const mostUsedMoves = Array.from(moveCounts.entries())
      .map(([moveId, count]) => ({ moveId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalBattles: combatantBattles.length,
      victories,
      defeats,
      draws,
      winRate,
      averageBattleDuration,
      mostUsedMoves
    };
  }

  /**
   * Initialize analytics data structure
   */
  private initializeAnalytics(): CombatAnalytics {
    return {
      totalBattles: 0,
      victories: 0,
      defeats: 0,
      draws: 0,
      averageBattleDuration: 0,
      mostUsedMoves: [],
      aiPerformance: {
        totalDecisions: 0,
        averageDecisionTime: 0,
        accuracy: 0
      },
      performanceMetrics: {
        averageFrameTime: 0,
        memoryUsage: 0,
        cacheHitRate: 0
      }
    };
  }

  /**
   * Update analytics with battle data
   */
  private updateAnalytics(session: BattleSession): void {
    this.analytics.totalBattles++;
    
    if (session.result === CombatResult.VICTORY) {
      this.analytics.victories++;
    } else if (session.result === CombatResult.DEFEAT) {
      this.analytics.defeats++;
    } else {
      this.analytics.draws++;
    }

    // Update average battle duration
    const battleDuration = (session.endTime || Date.now()) - session.startTime;
    this.analytics.averageBattleDuration = 
      (this.analytics.averageBattleDuration * (this.analytics.totalBattles - 1) + battleDuration) 
      / this.analytics.totalBattles;

    // Update move usage statistics
    const moveCounts = new Map<string, number>();
    for (const action of session.actions) {
      if (action.moveId) {
        const count = moveCounts.get(action.moveId) || 0;
        moveCounts.set(action.moveId, count + 1);
      }
    }

    // Merge with existing move counts
    for (const [moveId, count] of moveCounts) {
      const existing = this.analytics.mostUsedMoves.find(m => m.moveId === moveId);
      if (existing) {
        existing.count += count;
      } else {
        this.analytics.mostUsedMoves.push({ moveId, count });
      }
    }

    // Sort and keep top 10
    this.analytics.mostUsedMoves.sort((a, b) => b.count - a.count);
    this.analytics.mostUsedMoves = this.analytics.mostUsedMoves.slice(0, 10);

    // Update AI performance
    this.analytics.aiPerformance.totalDecisions += session.performance.totalActions;
    this.analytics.aiPerformance.averageDecisionTime = 
      (this.analytics.aiPerformance.averageDecisionTime * (this.analytics.aiPerformance.totalDecisions - session.performance.totalActions) + 
       session.performance.aiDecisionTime * session.performance.totalActions) 
      / this.analytics.aiPerformance.totalDecisions;

    // Update performance metrics
    this.analytics.performanceMetrics.averageFrameTime = this.performanceMetrics.averageResponseTime;
    this.analytics.performanceMetrics.cacheHitRate = this.performanceMetrics.cacheHitRate;
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(responseTime: number): void {
    if (this.config.enablePerformanceMetrics) {
      this.performanceMetrics.totalOperations++;
      this.performanceMetrics.averageResponseTime = 
        (this.performanceMetrics.averageResponseTime * (this.performanceMetrics.totalOperations - 1) + responseTime) 
        / this.performanceMetrics.totalOperations;
    }
  }
}

// Export default instance
export const defaultCombatManager = new CombatManager();
export { CombatManager as default };