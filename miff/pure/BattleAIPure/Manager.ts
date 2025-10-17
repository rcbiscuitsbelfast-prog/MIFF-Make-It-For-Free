/**
 * BattleAIPure Manager - Advanced Battle AI Management
 *
 * Comprehensive AI system for:
 * - Intelligent battle decision making
 * - Strategy planning and execution
 * - Adaptive difficulty scaling
 * - Performance optimization
 * - Machine learning integration
 * - Behavior pattern analysis
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus, createEventBus } from '../EventBusPure';
import { AIDecisionStyle, ThreatLevel, IAIDecisionProfile, IBattleAIController, IAIControllerManager, ISpiritInstance } from './types';

// ============================================================================
// BATTLE AI MANAGER INTERFACES
// ============================================================================

export enum AIDifficulty {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard',
  EXPERT = 'expert',
  MASTER = 'master'
}

export enum AIStrategyType {
  AGGRESSIVE = 'aggressive',
  DEFENSIVE = 'defensive',
  BALANCED = 'balanced',
  ADAPTIVE = 'adaptive',
  RANDOM = 'random'
}

export enum MoveCategory {
  DAMAGE = 'damage',
  HEALING = 'healing',
  BUFF = 'buff',
  DEBUFF = 'debuff',
  STATUS = 'status',
  SUPPORT = 'support',
  UTILITY = 'utility'
}

export enum AIActionType {
  ATTACK = 'attack',
  DEFEND = 'defend',
  HEAL = 'heal',
  BUFF = 'buff',
  DEBUFF = 'debuff',
  SPECIAL = 'special',
  WAIT = 'wait'
}

export interface AIAction {
  id: string;
  type: AIActionType;
  targetId?: string;
  priority: number;
  confidence: number;
  damage?: number;
  healing?: number;
  effects?: string[];
  cooldown: number;
  manaCost: number;
  description: string;
}

export interface AIState {
  id: string;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  level: number;
  experience: number;
  stats: {
    attack: number;
    defense: number;
    speed: number;
    intelligence: number;
    luck: number;
  };
  statusEffects: string[];
  buffs: string[];
  debuffs: string[];
  position: { x: number; y: number };
  isAlive: boolean;
  lastAction?: AIAction;
}

export interface AIContext {
  battleId: string;
  turnNumber: number;
  phase: 'preparation' | 'action' | 'resolution';
  allies: AIState[];
  enemies: AIState[];
  environment: {
    weather: string;
    terrain: string;
    obstacles: any[];
  };
  objectives: string[];
  constraints: string[];
  timeLimit?: number;
}

export interface AIStrategyConfig {
  id: string;
  name: string;
  type: AIStrategyType;
  difficulty: AIDifficulty;
  priority: number;
  conditions: AICondition[];
  actions: AIAction[];
  successRate: number;
  usageCount: number;
  lastUsed: Date;
  isActive: boolean;
}

export interface AICondition {
  id: string;
  type: 'health' | 'mana' | 'enemy_count' | 'ally_count' | 'status_effect' | 'turn_number' | 'custom';
  operator: 'equals' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'not_equals';
  value: any;
  target: 'self' | 'enemy' | 'ally' | 'all_enemies' | 'all_allies';
  description: string;
}

export interface AIDecision {
  id: string;
  action: AIAction;
  reasoning: string;
  confidence: number;
  alternatives: AIAction[];
  expectedOutcome: {
    damage?: number;
    healing?: number;
    effects?: string[];
    probability: number;
  };
  timestamp: Date;
}

export interface AIPerformance {
  totalDecisions: number;
  successfulDecisions: number;
  averageConfidence: number;
  averageResponseTime: number;
  strategyUsage: Record<string, number>;
  actionUsage: Record<string, number>;
  winRate: number;
  lastUpdated: Date;
}

export interface AIConfig {
  defaultDifficulty: AIDifficulty;
  defaultStrategy: AIStrategyType;
  enableLearning: boolean;
  enableAdaptiveDifficulty: boolean;
  maxDecisionTime: number;
  confidenceThreshold: number;
  strategySwitchThreshold: number;
  enablePerformanceTracking: boolean;
  enableDebugMode: boolean;
  maxStrategies: number;
  learningRate: number;
}

export interface AIIntegration {
  systemId: string;
  enabled: boolean;
  priority: number;
  callbacks: {
    onDecisionMade?: (decision: AIDecision) => void;
    onStrategyChanged?: (oldStrategy: AIStrategyConfig, newStrategy: AIStrategyConfig) => void;
    onPerformanceUpdated?: (performance: AIPerformance) => void;
    onActionExecuted?: (action: AIAction, result: any) => void;
  };
}

/**
 * Battle AI manager configuration
 */
export interface BattleAIManagerConfig {
  eventBus: EventBus;
  config: AIConfig;
  integrations: AIIntegration[];
}

/**
 * Battle AI Manager - Core AI functionality
 */
export class BattleAIManager {
  private eventBus: EventBus;
  private config: AIConfig;
  private integrations: AIIntegration[];
  private strategies: Map<string, AIStrategyConfig> = new Map();
  private performance: AIPerformance;
  private decisionHistory: AIDecision[] = [];
  private currentStrategy?: AIStrategyConfig;

  constructor(config: BattleAIManagerConfig) {
    const managerId = this.id ?? `manager_${Date.now()}`;
    this.eventBus = config.eventBus;
    this.config = config.config;
    this.integrations = config.integrations;
    this.performance = {
      totalDecisions: 0,
      successfulDecisions: 0,
      averageConfidence: 0,
      averageResponseTime: 0,
      strategyUsage: {},
      actionUsage: {},
      winRate: 0,
      lastUpdated: Date.now()
    };

    this.initialize();
  }

  /**
   * Initialize AI manager
   */
  private initialize(): void {
    // Load default strategies
    this.loadDefaultStrategies();
    
    // Set initial strategy
    this.setStrategy(this.config.defaultStrategy);
  }

  /**
   * Load default strategies
   */
  private loadDefaultStrategies(): void {
    // Aggressive Strategy
    this.addStrategy({
      id: 'aggressive_default',
      name: 'Aggressive Default',
      type: AIStrategyType.AGGRESSIVE,
      difficulty: AIDifficulty.NORMAL,
      priority: 1,
      conditions: [
        {
          id: 'health_above_50',
          type: 'health',
          operator: 'greater_than',
          value: 0.5,
          target: 'self',
          description: 'Health above 50%'
        }
      ],
      actions: [
        {
          id: 'attack_primary',
          type: AIActionType.ATTACK,
          priority: 1,
          confidence: 0.8,
          damage: 100,
          cooldown: 0,
          manaCost: 10,
          description: 'Primary attack'
        }
      ],
      successRate: 0.7,
      usageCount: 0,
      lastUsed: Date.now(),
      isActive: true
    });

    // Defensive Strategy
    this.addStrategy({
      id: 'defensive_default',
      name: 'Defensive Default',
      type: AIStrategyType.DEFENSIVE,
      difficulty: AIDifficulty.NORMAL,
      priority: 1,
      conditions: [
        {
          id: 'health_below_30',
          type: 'health',
          operator: 'less_than',
          value: 0.3,
          target: 'self',
          description: 'Health below 30%'
        }
      ],
      actions: [
        {
          id: 'defend',
          type: AIActionType.DEFEND,
          priority: 1,
          confidence: 0.9,
          cooldown: 0,
          manaCost: 5,
          description: 'Defensive stance'
        }
      ],
      successRate: 0.8,
      usageCount: 0,
      lastUsed: Date.now(),
      isActive: true
    });

    // Balanced Strategy
    this.addStrategy({
      id: 'balanced_default',
      name: 'Balanced Default',
      type: AIStrategyType.BALANCED,
      difficulty: AIDifficulty.NORMAL,
      priority: 1,
      conditions: [],
      actions: [
        {
          id: 'balanced_attack',
          type: AIActionType.ATTACK,
          priority: 1,
          confidence: 0.7,
          damage: 75,
          cooldown: 0,
          manaCost: 8,
          description: 'Balanced attack'
        }
      ],
      successRate: 0.75,
      usageCount: 0,
      lastUsed: Date.now(),
      isActive: true
    });
  }

  /**
   * Make AI decision
   */
  async makeDecision(context: AIContext, aiState: AIState): Promise<AIDecision> {
    const startTime = Date.now();
    
    try {
      // Get available strategies
      const availableStrategies = this.getAvailableStrategies(context, aiState);
      
      // Select best strategy
      const strategy = this.selectStrategy(availableStrategies, context, aiState);
      
      // Generate actions from strategy
      const actions = this.generateActions(strategy, context, aiState);
      
      // Select best action
      const action = this.selectAction(actions, context, aiState);
      
      // Create decision
      const decision: AIDecision = {
        id: this.generateId(),
        action,
        reasoning: this.generateReasoning(strategy, action, context, aiState),
        confidence: action.confidence,
        alternatives: actions.filter((a: any) => a.id !== action.id),
        expectedOutcome: this.calculateExpectedOutcome(action, context, aiState),
        timestamp: new Date()
      };

      // Update performance
      this.updatePerformance(decision, Date.now() - startTime);
      
      // Store decision
      this.decisionHistory.push(decision);
      
      // Notify integrations
      this.integrations.forEach((integration: any) => {
        integration.callbacks.onDecisionMade?.(decision);
      });

      this.eventBus.publish('ai:decisionMade', decision);
      return decision;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      // Fallback to random action
      const fallbackAction = this.getFallbackAction(context, aiState);
      const decision: AIDecision = {
        id: this.generateId(),
        action: fallbackAction,
        reasoning: 'Fallback due to error',
        confidence: 0.1,
        alternatives: [],
        expectedOutcome: { probability: 0.1 },
        timestamp: new Date()
      };
      
      this.eventBus.publish('ai:error', { error, context, aiState });
      return decision;
    }
  }

  /**
   * Get available strategies
   */
  private getAvailableStrategies(context: AIContext, aiState: AIState): AIStrategyConfig[] {
    return Array.from(this.strategies.values())
      .filter((strategy: any) => strategy.isActive)
      .filter((strategy: any) => this.evaluateConditions(strategy.conditions, context, aiState))
      .sort((a: any, b: any) => b.priority - a.priority);
  }

  /**
   * Select strategy
   */
  private selectStrategy(strategies: AIStrategyConfig[], context: AIContext, aiState: AIState): AIStrategyConfig {
    if (strategies.length === 0) {
      return this.getDefaultStrategy();
    }

    // Use strategy with highest success rate and priority
    return strategies.reduce((best, current) => {
      const bestScore = best.successRate * best.priority;
      const currentScore = current.successRate * current.priority;
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * Generate actions from strategy
   */
  private generateActions(strategy: AIStrategyConfig, context: AIContext, aiState: AIState): AIAction[] {
    return strategy.actions
      .filter((action: any) => this.canExecuteAction(action, context, aiState))
      .map((action: any) => ({
        ...action,
        confidence: this.calculateActionConfidence(action, context, aiState)
      }))
      .sort((a: any, b: any) => b.priority - a.priority);
  }

  /**
   * Select best action
   */
  private selectAction(actions: AIAction[], context: AIContext, aiState: AIState): AIAction {
    if (actions.length === 0) {
      return this.getFallbackAction(context, aiState);
    }

    // Select action with highest confidence and priority
    return actions.reduce((best, current) => {
      const bestScore = best.confidence * best.priority;
      const currentScore = current.confidence * current.priority;
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * Evaluate conditions
   */
  private evaluateConditions(conditions: AICondition[], context: AIContext, aiState: AIState): boolean {
    return conditions.every(condition => this.evaluateCondition(condition, context, aiState));
  }

  /**
   * Evaluate single condition
   */
  private evaluateCondition(condition: AICondition, context: AIContext, aiState: AIState): boolean {
    let value: any;
    
    switch (condition.target) {
      case 'self':
        value = this.getConditionValue(condition.type, aiState);
        break;
      case 'enemy':
        value = this.getConditionValue(condition.type, context.enemies[0]);
        break;
      case 'ally':
        value = this.getConditionValue(condition.type, context.allies[0]);
        break;
      case 'all_enemies':
        value = context.enemies.length;
        break;
      case 'all_allies':
        value = context.allies.length;
        break;
      default:
        return true;
    }

    return this.compareValues(value, condition.operator, condition.value);
  }

  /**
   * Get condition value
   */
  private getConditionValue(type: string, state: AIState): any {
    switch (type) {
      case 'health':
        return state.health / state.maxHealth;
      case 'mana':
        return state.mana / state.maxMana;
      case 'turn_number':
        return 0; // Would need to be passed from context
      default:
        return 0;
    }
  }

  /**
   * Compare values
   */
  private compareValues(value: any, operator: string, target: any): boolean {
    switch (operator) {
      case 'equals':
        return value === target;
      case 'greater_than':
        return value > target;
      case 'less_than':
        return value < target;
      case 'greater_equal':
        return value >= target;
      case 'less_equal':
        return value <= target;
      case 'not_equals':
        return value !== target;
      default:
        return true;
    }
  }

  /**
   * Check if action can be executed
   */
  private canExecuteAction(action: AIAction, context: AIContext, aiState: AIState): boolean {
    return aiState.mana >= action.manaCost && aiState.isAlive;
  }

  /**
   * Calculate action confidence
   */
  private calculateActionConfidence(action: AIAction, context: AIContext, aiState: AIState): number {
    let confidence = action.confidence;
    
    // Adjust based on health
    const healthRatio = aiState.health / aiState.maxHealth;
    if (healthRatio < 0.3) {
      confidence *= 0.8; // Lower confidence when low health
    }
    
    // Adjust based on enemy count
    const enemyCount = context.enemies.length;
    if (enemyCount > 2) {
      confidence *= 0.9; // Lower confidence against multiple enemies
    }
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Generate reasoning
   */
  private generateReasoning(strategy: AIStrategyConfig, action: AIAction, context: AIContext, aiState: AIState): string {
    return `Using ${strategy.name} strategy: ${action.description} (confidence: ${(action.confidence * 100).toFixed(1)}%)`;
  }

  /**
   * Calculate expected outcome
   */
  private calculateExpectedOutcome(action: AIAction, context: AIContext, aiState: AIState): any {
    return {
      damage: action.damage || 0,
      healing: action.healing || 0,
      effects: action.effects || [],
      probability: action.confidence
    };
  }

  /**
   * Get fallback action
   */
  private getFallbackAction(context: AIContext, aiState: AIState): AIAction {
    return {
      id: 'fallback_wait',
      type: AIActionType.WAIT,
      priority: 0,
      confidence: 0.1,
      cooldown: 0,
      manaCost: 0,
      description: 'Wait (fallback)'
    };
  }

  /**
   * Get default strategy
   */
  private getDefaultStrategy(): AIStrategyConfig {
    return Array.from(this.strategies.values())
      .find(s => s.type === this.config.defaultStrategy) || 
      Array.from(this.strategies.values())[0];
  }

  /**
   * Update performance metrics
   */
  private updatePerformance(decision: AIDecision, responseTime: number): void {
    this.performance.totalDecisions++;
    this.performance.averageConfidence = 
      (this.performance.averageConfidence * (this.performance.totalDecisions - 1) + decision.confidence) / 
      this.performance.totalDecisions;
    this.performance.averageResponseTime = 
      (this.performance.averageResponseTime * (this.performance.totalDecisions - 1) + responseTime) / 
      this.performance.totalDecisions;
    this.performance.lastUpdated = Date.now();
  }

  /**
   * Add strategy
   */
  addStrategy(strategy: AIStrategyConfig): void {
    this.strategies.set(strategy.id, strategy);
    this.eventBus.publish('ai:strategyAdded', strategy);
  }

  /**
   * Remove strategy
   */
  removeStrategy(strategyId: string): boolean {
    const removed = this.strategies.delete(strategyId);
    if (removed) {
      this.eventBus.publish('ai:strategyRemoved', strategyId);
    }
    return removed;
  }

  /**
   * Set current strategy
   */
  setStrategy(strategyType: AIStrategyType): boolean {
    const strategy = Array.from(this.strategies.values())
      .find(s => s.type === strategyType);
    
    if (strategy) {
      const oldStrategy = this.currentStrategy;
      this.currentStrategy = strategy;
      
      // Notify integrations
      this.integrations.forEach((integration: any) => {
        integration.callbacks.onStrategyChanged?.(oldStrategy!, strategy);
      });
      
      this.eventBus.publish('ai:strategyChanged', { oldStrategy, newStrategy: strategy });
      return true;
    }
    return false;
  }

  /**
   * Get current strategy
   */
  getCurrentStrategy(): AIStrategyConfig | null {
    return this.currentStrategy || null;
  }

  /**
   * Get all strategies
   */
  getAllStrategies(): AIStrategyConfig[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Get performance metrics
   */
  getPerformance(): AIPerformance {
    return { ...this.performance };
  }

  /**
   * Get decision history
   */
  getDecisionHistory(limit?: number): AIDecision[] {
    const history = [...this.decisionHistory];
    return limit ? history.slice(-limit) : history;
  }

  /**
   * Update strategy success rate
   */
  updateStrategySuccess(strategyId: string, success: boolean): void {
    const strategy = this.strategies.get(strategyId);
    if (strategy) {
      strategy.usageCount++;
      strategy.lastUsed = Date.now();
      
      // Update success rate using exponential moving average
      const alpha = this.config.learningRate;
      strategy.successRate = alpha * (success ? 1 : 0) + (1 - alpha) * strategy.successRate;
      
      this.eventBus.publish('ai:strategyUpdated', strategy);
    }
  }

  /**
   * Clear decision history
   */
  clearHistory(): void {
    this.decisionHistory = [];
  }

  /**
   * Export AI state
   */
  exportState(): any {
    return {
      strategies: Array.from(this.strategies.values()),
      performance: this.performance,
      decisionHistory: this.decisionHistory,
      currentStrategy: this.currentStrategy,
      config: this.config
    };
  }

  /**
   * Import AI state
   */
  importState(state): void {
    if (state.strategies) {
      this.strategies = new Map(state.strategies.map((s: AIStrategyConfig) => [s.id, s]));
    }
    if (state.performance) {
      this.performance = state.performance;
    }
    if (state.decisionHistory) {
      this.decisionHistory = state.decisionHistory;
    }
    if (state.currentStrategy) {
      this.currentStrategy = state.currentStrategy;
    }
    if (state.config) {
      this.config = state.config;
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.strategies.clear();
    this.decisionHistory = [];
    this.currentStrategy = undefined;
  }
}

/**
 * Default battle AI manager instance
 */
export const defaultBattleAIManager = new BattleAIManager({
  eventBus: createEventBus(),
  config: {
    defaultDifficulty: AIDifficulty.NORMAL,
    defaultStrategy: AIStrategyType.BALANCED,
    enableLearning: true,
    enableAdaptiveDifficulty: true,
    maxDecisionTime: 1000,
    confidenceThreshold: 0.5,
    strategySwitchThreshold: 0.3,
    enablePerformanceTracking: true,
    enableDebugMode: false,
    maxStrategies: 50,
    learningRate: 0.1
  },
  integrations: []
});