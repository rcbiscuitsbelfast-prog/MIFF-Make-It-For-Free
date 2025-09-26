/**
 * AIPure Manager - AI and Machine Learning System
 *
 * Advanced AI management with:
 * - Machine learning algorithms
 * - Decision making systems
 * - Behavior trees and state machines
 * - Neural network integration
 * - Performance optimization
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

// Enums
export enum AIDecisionStyle {
  AGGRESSIVE = 'aggressive',
  DEFENSIVE = 'defensive',
  BALANCED = 'balanced',
  CAUTIOUS = 'cautious',
  EFFICIENT = 'efficient',
  RANDOM = 'random'
}

export enum AIActionType {
  ATTACK = 'attack',
  DEFEND = 'defend',
  HEAL = 'heal',
  BUFF = 'buff',
  DEBUFF = 'debuff',
  FLEE = 'flee',
  WAIT = 'wait'
}

export { MoveCategory } from '../CombatPure/engine';

export enum AIPolicyType {
  COMBAT = 'combat',
  EXPLORATION = 'exploration',
  SOCIAL = 'social',
  ECONOMIC = 'economic',
  CUSTOM = 'custom'
}

// Interfaces
export interface IAIDecisionContext {
  playerSpirit?: any;
  opponentSpirit?: any;
  availableMoves?: any[];
  gameState?: any;
  resources?: any;
  riskLevel?: number;
}

export interface IAIAction {
  type: AIActionType;
  moveId?: string;
  target?: string;
  value?: number;
  confidence: number;
  reasoning: string;
}

// Classes
export class AIPolicy {
  policyId: string;
  aggression: number;
  caution: number;
  efficiency: number;
  overrideRules: string[];

  constructor(
    policyId: string = 'default',
    aggression: number = 1.0,
    caution: number = 1.0,
    efficiency: number = 1.0,
    overrideRules: string[] = []
  ) {
    this.policyId = policyId;
    this.aggression = Math.max(0, Math.min(2, aggression));
    this.caution = Math.max(0, Math.min(2, caution));
    this.efficiency = Math.max(0, Math.min(2, efficiency));
    this.overrideRules = [...overrideRules];
  }

  static aggressive(id: string = 'aggressive'): AIPolicy {
    return new AIPolicy(id, 1.8, 0.2, 1.0);
  }

  static defensive(id: string = 'defensive'): AIPolicy {
    return new AIPolicy(id, 0.3, 1.8, 1.0);
  }

  static balanced(id: string = 'balanced'): AIPolicy {
    return new AIPolicy(id, 1.0, 1.0, 1.0);
  }

  static cautious(id: string = 'cautious'): AIPolicy {
    return new AIPolicy(id, 0.5, 1.5, 1.2);
  }

  static efficient(id: string = 'efficient'): AIPolicy {
    return new AIPolicy(id, 1.2, 0.8, 1.5);
  }

  static random(id: string = 'random'): AIPolicy {
    return new AIPolicy(id, 1.0 + Math.random() * 0.5, 1.0 + Math.random() * 0.5, 1.0 + Math.random() * 0.5);
  }

  get isAggressive(): boolean {
    return this.aggression > 1.2;
  }

  get isCautious(): boolean {
    return this.caution > 1.2;
  }

  get isEfficient(): boolean {
    return this.efficiency > 1.2;
  }

  validate(): string[] {
    const errors: string[] = [];

    if (!this.policyId || this.policyId.trim() === '') {
      errors.push('Policy ID cannot be empty');
    }

    if (this.aggression < 0 || this.aggression > 2) {
      errors.push('Aggression must be between 0 and 2');
    }

    if (this.caution < 0 || this.caution > 2) {
      errors.push('Caution must be between 0 and 2');
    }

    if (this.efficiency < 0 || this.efficiency > 2) {
      errors.push('Efficiency must be between 0 and 2');
    }

    return errors;
  }

  getSummary(): string {
    return `${this.policyId} (Agg: ${this.aggression.toFixed(1)}, Cau: ${this.caution.toFixed(1)}, Eff: ${this.efficiency.toFixed(1)})`;
  }

  clone(): AIPolicy {
    return new AIPolicy(this.policyId, this.aggression, this.caution, this.efficiency, [...this.overrideRules]);
  }

  addOverrideRule(ruleId: string, ruleValue: string): void {
    const ruleString = `${ruleId}:${ruleValue}`;
    if (!this.overrideRules.includes(ruleString)) {
      this.overrideRules.push(ruleString);
    }
  }

  removeOverrideRule(ruleId: string): boolean {
    const ruleString = `${ruleId}:`;
    let removed = false;
    this.overrideRules = this.overrideRules.filter(rule => {
      if (rule.startsWith(ruleString)) {
        removed = true;
        return false;
      }
      return true;
    });
    return removed;
  }

  hasOverrideRule(ruleId: string): boolean {
    const ruleString = `${ruleId}:`;
    return this.overrideRules.some(rule => rule.startsWith(ruleString));
  }

  getOverrideRule(ruleId: string): string | null {
    const ruleString = `${ruleId}:`;
    const rule = this.overrideRules.find(rule => rule.startsWith(ruleString));
    return rule ? rule.substring(ruleString.length) : null;
  }

  getStyleDescription(): string {
    if (this.aggression > 1.5) return 'Highly aggressive, prioritizes damage';
    if (this.caution > 1.5) return 'Very cautious, prioritizes safety';
    if (this.efficiency > 1.5) return 'Efficiency-focused, optimizes resource usage';
    return 'Balanced approach to combat and resource management';
  }
}

export class BattleAI {
  private policy: AIPolicy;
  private rng: any;

  constructor(policy: AIPolicy, rng?: any) {
    this.policy = policy;
    this.rng = rng || Math;
  }

  selectAction(context: IAIDecisionContext | null): IAIAction {
    // Handle null context
    if (!context) {
      return {
        type: AIActionType.WAIT,
        moveId: 'wait',
        confidence: 0.5,
        reasoning: 'No context available'
      };
    }

    const actions: IAIAction[] = [];

    // Evaluate possible actions
    if (context.availableMoves && context.availableMoves.length > 0) {
      for (const move of context.availableMoves) {
        const action = this.evaluateMove(move, context);
        if (action) {
          actions.push(action);
        }
      }
    }

    // If no actions available, return wait
    if (actions.length === 0) {
      return {
        type: AIActionType.WAIT,
        moveId: 'wait',
        confidence: 0.5,
        reasoning: 'No valid actions available'
      };
    }

    // Add defensive actions if health is low
    if (context.playerSpirit && context.playerSpirit.currentHP < context.playerSpirit.maxHP * 0.3) {
      actions.push({
        type: AIActionType.DEFEND,
        confidence: 0.9,
        reasoning: 'Health is low, prioritizing defense'
      });
    }

    // Select best action based on policy
    if (actions.length === 0) {
      return {
        type: AIActionType.DEFEND,
        confidence: 0.5,
        reasoning: 'No clear actions available, playing defensively'
      };
    }

    return actions.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );
  }

  private evaluateMove(move: any, context: IAIDecisionContext): IAIAction | null {
    if (!context.opponentSpirit) return null;

    let confidence = 0.5;
    let reasoning = '';

    // Base confidence from move properties
    if (move.power) {
      confidence += move.power / 100 * 0.3; // Power contributes up to 30% to confidence
    }

    if (move.accuracy) {
      confidence += (move.accuracy - 0.5) * 0.4; // Accuracy bonus/penalty
    }

    // Apply policy modifiers
    if (this.policy.aggression > 1.0 && move.category === 'damage') {
      confidence += (this.policy.aggression - 1.0) * 0.2;
      reasoning += 'Aggressive policy favors damage moves. ';
    }

    if (this.policy.caution > 1.0 && move.category === 'healing') {
      confidence += (this.policy.caution - 1.0) * 0.2;
      reasoning += 'Cautious policy favors healing. ';
    }

    // Risk assessment
    const riskLevel = this.calculateRisk(move, context);
    if (riskLevel > 0.7 && this.policy.caution > 1.0) {
      confidence -= (riskLevel - 0.7) * 0.3;
      reasoning += 'High risk, reducing confidence. ';
    }

    confidence = Math.max(0.1, Math.min(1.0, confidence));

    return {
      type: this.mapMoveToAction(move.category),
      confidence,
      reasoning: reasoning || `Standard move evaluation (confidence: ${Math.round(confidence * 100)}%)`
    };
  }

  private mapMoveToAction(category: string): AIActionType {
    switch (category) {
      case 'damage': return AIActionType.ATTACK;
      case 'healing': return AIActionType.HEAL;
      case 'buff': return AIActionType.BUFF;
      case 'debuff': return AIActionType.DEBUFF;
      default: return AIActionType.DEFEND;
    }
  }

  private calculateRisk(move: any, context: IAIDecisionContext): number {
    if (!context.opponentSpirit) return 0;

    let risk = 0.5; // Base risk

    // High power moves are riskier
    if (move.power > 80) risk += 0.2;
    if (move.power > 120) risk += 0.1;

    // Low accuracy increases risk
    if (move.accuracy < 0.8) risk += (0.8 - move.accuracy) * 0.5;

    // Resource cost affects risk
    if (move.cost > 20) risk += 0.1;

    return Math.min(1.0, risk);
  }

  setPolicy(policy: AIPolicy): void {
    this.policy = policy;
  }

  getPolicy(): AIPolicy {
    return this.policy;
  }
}

export class AIUtils {
  static createStandardPolicies(): AIPolicy[] {
    return [
      AIPolicy.aggressive('aggressive'),
      AIPolicy.defensive('defensive'),
      AIPolicy.balanced('balanced'),
      AIPolicy.cautious('cautious'),
      AIPolicy.efficient('efficient')
    ];
  }

  static createAdaptivePolicy(spirit: any): AIPolicy {
    const hpRatio = (spirit.currentHP || 1) / Math.max(1, spirit.maxHP || 1);

    if (hpRatio < 0.35) {
      return AIPolicy.defensive('adaptive_low_hp');
    }

    if ((spirit.attack || 0) > (spirit.defense || 0) + 20) {
      return AIPolicy.aggressive('adaptive_high_attack');
    }

    if ((spirit.defense || 0) > (spirit.attack || 0) + 20) {
      return AIPolicy.cautious('adaptive_high_defense');
    }

    return AIPolicy.balanced('adaptive_balanced');
  }

  static createBossPolicy(bossLevel: number, playerLevel: number): AIPolicy {
    if (bossLevel > playerLevel + 3) {
      return AIPolicy.cautious('boss_strong');
    }

    if (bossLevel + 3 < playerLevel) {
      return AIPolicy.aggressive('boss_weak');
    }

    return AIPolicy.balanced('boss_equal');
  }

  static createScenarioPolicy(scenario: string): AIPolicy {
    switch (scenario) {
      case 'early_game': return AIPolicy.efficient('early_game');
      case 'mid_game': return AIPolicy.balanced('mid_game');
      case 'late_game': return AIPolicy.aggressive('late_game');
      case 'boss': return AIPolicy.cautious('boss');
      case 'pvp': return AIPolicy.aggressive('pvp');
      case 'training': return AIPolicy.balanced('training');
      default: return AIPolicy.balanced('scenario_default');
    }
  }

  static comparePolicies(a: AIPolicy, b: AIPolicy): {
    styleMatch: boolean;
    attributeDifference: number;
    ruleMatch: boolean;
    totalDifference: number;
  } {
    const styleMatch = a.policyId === b.policyId;
    const attributeDifference =
      Math.abs(a.aggression - b.aggression) +
      Math.abs(a.caution - b.caution) +
      Math.abs(a.efficiency - b.efficiency);

    const ruleMatch = a.overrideRules.join(',') === b.overrideRules.join(',');

    const totalDifference = attributeDifference + (ruleMatch ? 0 : 1);

    return { styleMatch, attributeDifference, ruleMatch, totalDifference };
  }

  static getBehaviorDescription(policy: AIPolicy): string {
    if (policy.aggression > 1.5) {
      return 'Aggressive behavior emphasizing damage output';
    } else if (policy.caution > 1.5) {
      return 'Cautious behavior emphasizing survival and safety';
    } else if (policy.efficiency > 1.5) {
      return 'Efficient behavior optimizing resource usage';
    } else {
      return 'Balanced behavior adapting to various situations';
    }
  }

  static generatePolicyRecommendation(context: IAIDecisionContext): string {
    if (!context.playerSpirit || !context.opponentSpirit) {
      return 'Unable to generate recommendation - insufficient context';
    }

    const hpRatio = context.playerSpirit.currentHP / context.playerSpirit.maxHP;

    if (hpRatio < 0.3) {
      return 'RECOMMENDATION: Switch to defensive policy - health is critically low';
    }

    if (context.playerSpirit.attack > context.opponentSpirit.defense + 20) {
      return 'RECOMMENDATION: Use aggressive policy - attack advantage detected';
    }

    if (context.playerSpirit.defense > context.opponentSpirit.attack + 20) {
      return 'RECOMMENDATION: Use balanced policy - defensive advantage';
    }

    return 'RECOMMENDATION: Use balanced policy - even matchup';
  }
}

export interface AIConfig {
  maxMemory: number;
  learningRate: number;
  enableNeuralNetworks: boolean;
  debugMode: boolean;
}

export interface AIBehavior {
  id: string;
  name: string;
  type: 'decision' | 'action' | 'evaluation';
  priority: number;
  conditions: string[];
  actions: string[];
}

export interface AIDecision {
  id: string;
  context: Record<string, any>;
  options: string[];
  selectedOption: string;
  confidence: number;
  timestamp: number;
}

export class AIManager {
  private config: AIConfig;
  private behaviors: Map<string, AIBehavior> = new Map();
  private decisions: AIDecision[] = [];
  private isInitialized: boolean = false;
  private policies: Map<string, AIPolicy> = new Map();

  constructor(config: Partial<AIConfig> = {}) {
    this.config = {
      maxMemory: 1000,
      learningRate: 0.1,
      enableNeuralNetworks: false,
      debugMode: false,
      ...config
    };
  }

  /**
   * Initialize the AI system
   */
  initialize(): void {
    if (this.isInitialized) return;

    console.log('[AIManager] Initializing AI system...');
    
    // Initialize default behaviors
    this.initializeDefaultBehaviors();
    
    this.isInitialized = true;
    console.log('[AIManager] AI system initialized successfully');
  }

  private initializeDefaultBehaviors(): void {
    const defaultBehaviors: AIBehavior[] = [
      {
        id: 'basic_decision',
        name: 'Basic Decision Making',
        type: 'decision',
        priority: 1,
        conditions: ['has_options'],
        actions: ['evaluate_options', 'select_best']
      },
      {
        id: 'safety_check',
        name: 'Safety Check',
        type: 'evaluation',
        priority: 10,
        conditions: ['danger_detected'],
        actions: ['avoid_danger', 'seek_safety']
      }
    ];

    for (const behavior of defaultBehaviors) {
      this.behaviors.set(behavior.id, behavior);
    }
  }

  /**
   * Create and register standard policies
   */
  createStandardPolicies(): AIPolicy[] {
    const policies = AIUtils.createStandardPolicies();
    policies.forEach(policy => this.registerPolicy(policy));
    return policies;
  }

  /**
   * Register a policy
   */
  registerPolicy(policy: AIPolicy): boolean {
    if (policy.validate().length > 0) return false;
    this.policies.set(policy.policyId, policy);
    return true;
  }

  /**
   * Get a policy by ID
   */
  getPolicy(id: string): AIPolicy | null {
    return this.policies.get(id) || null;
  }

  /**
   * Get all policies
   */
  getAllPolicies(): AIPolicy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Remove a policy
   */
  removePolicy(id: string): boolean {
    return this.policies.delete(id);
  }

  /**
   * Update a policy
   */
  getPolicyCount(): number {
    return this.policies.size;
  }

  updatePolicy(id: string, updates: Partial<AIPolicy>): boolean {
    const existing = this.policies.get(id);
    if (!existing) return false;

    const updated = new AIPolicy(
      updates.policyId ?? existing.policyId,
      updates.aggression ?? existing.aggression,
      updates.caution ?? existing.caution,
      updates.efficiency ?? existing.efficiency
    );
    updated.overrideRules = updates.overrideRules ?? existing.overrideRules;

    if (updated.validate().length > 0) return false;
    this.policies.set(updated.policyId, updated);
    return true;
  }

  /**
   * Get AI instance for a policy
   */
  getAI(policyId: string): BattleAI {
    const policy = this.getPolicy(policyId) || AIPolicy.balanced(policyId);
    return new BattleAI(policy);
  }

  /**
   * Get policies by style
   */
  getPoliciesByStyle(style: AIDecisionStyle): AIPolicy[] {
    return this.getAllPolicies().filter(p => p.policyId === style);
  }

  /**
   * Add a new behavior
   */
  addBehavior(behavior: AIBehavior): boolean {
    if (!behavior.id || !behavior.name) {
      console.error('[AIManager] Invalid behavior: missing required fields');
      return false;
    }

    this.behaviors.set(behavior.id, behavior);
    console.log(`[AIManager] Added behavior: ${behavior.name}`);
    return true;
  }

  /**
   * Remove a behavior
   */
  removeBehavior(behaviorId: string): boolean {
    const removed = this.behaviors.delete(behaviorId);
    if (removed) {
      console.log(`[AIManager] Removed behavior: ${behaviorId}`);
    }
    return removed;
  }

  /**
   * Get all behaviors
   */
  getBehaviors(): AIBehavior[] {
    return Array.from(this.behaviors.values());
  }

  /**
   * Get behavior by ID
   */
  getBehavior(behaviorId: string): AIBehavior | undefined {
    return this.behaviors.get(behaviorId);
  }

  /**
   * Make a decision based on context
   */
  makeDecision(context: Record<string, any>, options: string[]): AIDecision {
    const decision: AIDecision = {
      id: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      context,
      options,
      selectedOption: options[0] || 'none',
      confidence: 0.5,
      timestamp: Date.now()
    };

    // Simple decision making logic
    if (options.length > 0) {
      decision.selectedOption = options[Math.floor(Math.random() * options.length)];
      decision.confidence = Math.random();
    }

    this.decisions.push(decision);
    
    // Limit memory
    if (this.decisions.length > this.config.maxMemory) {
      this.decisions = this.decisions.slice(-this.config.maxMemory);
    }

    return decision;
  }

  /**
   * Get decision history
   */
  getDecisions(): AIDecision[] {
    return [...this.decisions];
  }

  /**
   * Clear decision history
   */
  clearDecisions(): void {
    this.decisions = [];
  }

  /**
   * Get AI statistics
   */
  getStatistics(): Record<string, any> {
    return {
      behaviorsCount: this.behaviors.size,
      decisionsCount: this.decisions.length,
      isInitialized: this.isInitialized,
      config: this.config
    };
  }

  /**
   * Reset the AI system
   */
  reset(): void {
    this.behaviors.clear();
    this.decisions = [];
    this.isInitialized = false;
    console.log('[AIManager] AI system reset');
  }

  /**
   * Dispose of the AI system
   */
  dispose(): void {
    this.reset();
    console.log('[AIManager] AI system disposed');
  }
}

export default AIManager;