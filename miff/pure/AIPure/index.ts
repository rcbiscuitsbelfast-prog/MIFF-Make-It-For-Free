/**
 * AIPure - AI Management System
 *
 * A comprehensive AI management system for handling battle decisions, policy-based behavior,
 * and deterministic move selection. Supports configurable policies with aggression, caution,
 * and efficiency weights, plus override rules for complex scenarios.
 *
 * @module AIPure
 * @version 1.0.0
 * @license MIT
 */

// Import dependencies
import { TypeEffectiveness, MoveData, MoveCategory, SpiritInstance, DamageCalculator } from '../CombatPure/index';
import { IRNGProvider } from '../CombatPure/index';

// Re-export for convenience
export { TypeEffectiveness, MoveData, MoveCategory, DamageCalculator, IRNGProvider };
export type { IRNGProvider };
export type { SpiritInstance };

/**
 * Action source enumeration
 */
export enum ActionSource {
  PLAYER = 'player',
  AI = 'ai',
  ENGINE = 'engine'
}

/**
 * Battle action structure
 */
export interface IBattleAction {
  actorId: string;
  targetId?: string;
  moveId: string;
  priority: number;
  speed: number;
  source: ActionSource;
  itemId?: string;
  type: 'attack' | 'defend' | 'item' | 'flee';
}

/**
 * AI policy interface
 */
export interface IAIPolicy {
  policyId: string;
  aggression: number;
  caution: number;
  efficiency: number;
  overrideRules: string[];
  clone(): IAIPolicy;
  validate(): string[];
}

/**
 * AI manager interface
 */
export interface IAIManager {
  registerPolicy(policy: IAIPolicy): boolean;
  getAI(spiritIdOrPolicyId: string): IBattleAI;
  getPolicy(policyId: string): IAIPolicy | null;
  getAllPolicies(): IAIPolicy[];
  clearPolicies(): void;
}

/**
 * Battle AI interface
 */
export interface IBattleAI {
  selectAction(
    self: ISpiritInstance,
    opponent: ISpiritInstance,
    availableMoves: IMoveData[],
    rng: IRNGProvider
  ): IBattleAction;
  getPolicy(): IAIPolicy;
  setPolicy(policy: IAIPolicy): void;
}

/**
 * Spirit instance interface (dependency)
 */
export interface ISpiritInstance {
  id: string;
  name: string;
  level: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  maxHP: number;
  currentHP: number;
  resourcePoints: number;
  typeTag: string;
  attackMultiplier?: number;
  defenseMultiplier?: number;
  specialAttackMultiplier?: number;
  specialDefenseMultiplier?: number;
  critChanceBonus?: number;
  syncLevel?: number;
}

/**
 * Move data interface (dependency)
 */
export interface IMoveData {
  moveId: string;
  name: string;
  category: MoveCategory;
  power: number;
  accuracy: number;
  cost: number;
  typeTag: string;
}

/**
 * AI policy implementation
 */
export class AIPolicy implements IAIPolicy {
  public policyId: string;
  public aggression: number;
  public caution: number;
  public efficiency: number;
  public overrideRules: string[];

  constructor(
    policyId: string = 'default',
    aggression: number = 1.0,
    caution: number = 1.0,
    efficiency: number = 1.0,
    overrideRules: string[] = []
  ) {
    this.policyId = policyId;
    this.aggression = Math.max(0, Math.min(2, aggression)); // Clamp 0-2
    this.caution = Math.max(0, Math.min(2, caution)); // Clamp 0-2
    this.efficiency = Math.max(0, Math.min(2, efficiency)); // Clamp 0-2
    this.overrideRules = [...overrideRules]; // Deep copy
  }

  /**
   * Create a balanced policy
   */
  static balanced(id: string = 'balanced'): AIPolicy {
    return new AIPolicy(id, 1.0, 1.0, 1.0);
  }

  /**
   * Create an aggressive policy
   */
  static aggressive(id: string = 'aggressive'): AIPolicy {
    return new AIPolicy(id, 1.8, 0.5, 0.8);
  }

  /**
   * Create a cautious policy
   */
  static cautious(id: string = 'cautious'): AIPolicy {
    return new AIPolicy(id, 0.5, 1.8, 1.2);
  }

  /**
   * Create an efficient policy
   */
  static efficient(id: string = 'efficient'): AIPolicy {
    return new AIPolicy(id, 1.0, 1.0, 1.8);
  }

  /**
   * Create a defensive policy
   */
  static defensive(id: string = 'defensive'): AIPolicy {
    return new AIPolicy(id, 0.3, 2.0, 1.5);
  }

  /**
   * Create a random policy (for testing)
   */
  static random(id: string = 'random'): AIPolicy {
    return new AIPolicy(
      id,
      0.5 + Math.random(),
      0.5 + Math.random(),
      0.5 + Math.random(),
      []
    );
  }

  /**
   * Clone this policy
   */
  clone(): AIPolicy {
    return new AIPolicy(
      this.policyId,
      this.aggression,
      this.caution,
      this.efficiency,
      [...this.overrideRules]
    );
  }

  /**
   * Check if policy has override rule
   */
  hasOverrideRule(ruleKey: string): boolean {
    return this.overrideRules.some(rule => rule.startsWith(ruleKey + ':'));
  }

  /**
   * Get override rule value
   */
  getOverrideRule(ruleKey: string): string | null {
    const rule = this.overrideRules.find(r => r.startsWith(ruleKey + ':'));
    return rule ? rule.split(':')[1] : null;
  }

  /**
   * Add override rule
   */
  addOverrideRule(ruleKey: string, value: string): void {
    // Remove existing rule with same key
    this.overrideRules = this.overrideRules.filter(r => !r.startsWith(ruleKey + ':'));
    this.overrideRules.push(`${ruleKey}:${value}`);
  }

  /**
   * Remove override rule
   */
  removeOverrideRule(ruleKey: string): boolean {
    const initialLength = this.overrideRules.length;
    this.overrideRules = this.overrideRules.filter(r => !r.startsWith(ruleKey + ':'));
    return this.overrideRules.length < initialLength;
  }

  /**
   * Validate policy configuration
   */
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

    // Validate override rules format
    this.overrideRules.forEach((rule, index) => {
      if (!rule.includes(':')) {
        errors.push(`Override rule ${index} is malformed: ${rule}`);
      }
    });

    return errors;
  }

  /**
   * Get policy summary
   */
  getSummary(): string {
    return `${this.policyId} (Agg: ${this.aggression.toFixed(1)}, Cau: ${this.caution.toFixed(1)}, Eff: ${this.efficiency.toFixed(1)})`;
  }

  /**
   * Check if policy is aggressive
   */
  get isAggressive(): boolean {
    return this.aggression > 1.2;
  }

  /**
   * Check if policy is cautious
   */
  get isCautious(): boolean {
    return this.caution > 1.2;
  }

  /**
   * Check if policy is efficient
   */
  get isEfficient(): boolean {
    return this.efficiency > 1.2;
  }
}

/**
 * AI manager implementation
 */
export class AIManager implements IAIManager {
  private readonly policies = new Map<string, AIPolicy>();
  private readonly typeEffectiveness: TypeEffectiveness;

  constructor(typeEffectiveness?: TypeEffectiveness) {
    this.typeEffectiveness = typeEffectiveness || new TypeEffectiveness();
  }

  /**
   * Register an AI policy
   */
  registerPolicy(policy: AIPolicy): boolean {
    if (!policy || !policy.policyId || policy.policyId.trim() === '') {
      console.warn('Invalid policy registration: missing or empty policy ID');
      return false;
    }

    const errors = policy.validate();
    if (errors.length > 0) {
      console.warn(`Invalid policy ${policy.policyId}:`, errors);
      return false;
    }

    this.policies.set(policy.policyId, policy);
    return true;
  }

  /**
   * Get AI instance for spirit or policy ID
   */
  getAI(spiritIdOrPolicyId: string): IBattleAI {
    const policyId = spiritIdOrPolicyId || 'default';

    if (!this.policies.has(policyId)) {
      // Create default balanced policy
      const defaultPolicy = AIPolicy.balanced(policyId);
      this.policies.set(policyId, defaultPolicy);
    }

    const policy = this.policies.get(policyId)!;
    return new BattleAI(policy, this.typeEffectiveness);
  }

  /**
   * Get policy by ID
   */
  getPolicy(policyId: string): AIPolicy | null {
    return this.policies.get(policyId) || null;
  }

  /**
   * Get all registered policies
   */
  getAllPolicies(): AIPolicy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Get policy count
   */
  getPolicyCount(): number {
    return this.policies.size;
  }

  /**
   * Check if policy exists
   */
  hasPolicy(policyId: string): boolean {
    return this.policies.has(policyId);
  }

  /**
   * Remove policy
   */
  removePolicy(policyId: string): boolean {
    return this.policies.delete(policyId);
  }

  /**
   * Update policy
   */
  updatePolicy(policyId: string, updates: Partial<AIPolicy>): boolean {
    const existingPolicy = this.policies.get(policyId);
    if (!existingPolicy) {
      return false;
    }

    // Create updated policy
    const updatedPolicy = new AIPolicy(
      updates.policyId || existingPolicy.policyId,
      updates.aggression ?? existingPolicy.aggression,
      updates.caution ?? existingPolicy.caution,
      updates.efficiency ?? existingPolicy.efficiency,
      updates.overrideRules || [...existingPolicy.overrideRules]
    );

    const errors = updatedPolicy.validate();
    if (errors.length > 0) {
      console.warn(`Invalid policy update for ${policyId}:`, errors);
      return false;
    }

    this.policies.set(policyId, updatedPolicy);
    return true;
  }

  /**
   * Clear all policies
   */
  clearPolicies(): void {
    this.policies.clear();
  }

  /**
   * Get or create policy for spirit
   */
  getOrCreatePolicy(spiritId: string): AIPolicy {
    if (!this.policies.has(spiritId)) {
      this.policies.set(spiritId, AIPolicy.balanced(spiritId));
    }
    return this.policies.get(spiritId)!;
  }

  /**
   * Create standard policy set
   */
  createStandardPolicies(): void {
    this.registerPolicy(AIPolicy.balanced('balanced'));
    this.registerPolicy(AIPolicy.aggressive('aggressive'));
    this.registerPolicy(AIPolicy.cautious('cautious'));
    this.registerPolicy(AIPolicy.efficient('efficient'));
    this.registerPolicy(AIPolicy.defensive('defensive'));
  }
}

/**
 * Battle AI implementation
 */
export class BattleAI implements IBattleAI {
  private readonly policy: AIPolicy;
  private readonly typeEffectiveness: TypeEffectiveness;
  private readonly damageCalculator: DamageCalculator;

  constructor(policy: AIPolicy, typeEffectiveness: TypeEffectiveness) {
    this.policy = policy || AIPolicy.balanced();
    this.typeEffectiveness = typeEffectiveness || new TypeEffectiveness();
    this.damageCalculator = new DamageCalculator(this.typeEffectiveness);
  }

  /**
   * Select best action based on policy
   */
  selectAction(
    self: ISpiritInstance,
    opponent: ISpiritInstance,
    availableMoves: IMoveData[],
    rng: IRNGProvider
  ): IBattleAction {
    if (!self || !opponent || !availableMoves || availableMoves.length === 0) {
      return this.createWaitAction(self, opponent);
    }

    // Filter moves by affordability
    const affordableMoves = availableMoves.filter(move => self.resourcePoints >= move.cost);

    if (affordableMoves.length === 0) {
      // No affordable moves, use wait or cheapest move
      const cheapestMove = availableMoves.reduce((cheapest, move) =>
        move.cost < cheapest.cost ? move : cheapest
      );
      return this.createAction(self, opponent, cheapestMove, rng);
    }

    // Score all moves
    const scoredMoves = affordableMoves.map(move => ({
      move,
      score: this.scoreMove(self, opponent, move, rng)
    }));

    // Sort by score (descending)
    scoredMoves.sort((a, b) => b.score - a.score);

    // Select best move
    const bestMove = scoredMoves[0].move;

    // Apply override rules if any
    const overriddenMove = this.applyOverrideRules(self, opponent, availableMoves, rng);
    const selectedMove = overriddenMove || bestMove;

    return this.createAction(self, opponent, selectedMove, rng);
  }

  /**
   * Score a move based on policy
   */
  private scoreMove(self: ISpiritInstance, opponent: ISpiritInstance, move: IMoveData, rng: IRNGProvider): number {
    let score = 0;

    // Skip unaffordable moves (already filtered, but double-check)
    if (self.resourcePoints < move.cost) {
      return score - 10 * this.policy.efficiency;
    }

    // Type advantage factor
    const typeMultiplier = this.typeEffectiveness.getMultiplier(move.typeTag, opponent.typeTag);
    score += (typeMultiplier - 1) * 2.0 * this.policy.aggression;

    // Expected damage estimate
    const expectedDamage = this.damageCalculator.calculateExpectedDamage(self as any, opponent as any, move as any);
    score += expectedDamage * 0.1 * this.policy.aggression;

    // Accuracy factor (cautious AI prefers high accuracy)
    const accuracyPenalty = (1 - move.accuracy) * 5 * this.policy.caution;
    score -= accuracyPenalty;

    // Resource cost factor (efficient AI prefers low cost)
    const costPenalty = move.cost * 0.5 * this.policy.efficiency;
    score -= costPenalty;

    // HP-based decision making
    const hpRatio = self.currentHP / self.maxHP;
    if (hpRatio < 0.3) {
      // Low HP: prefer defensive or healing moves
      if (move.category === MoveCategory.STATUS) {
        score += 10 * this.policy.caution;
      }
    } else if (hpRatio > 0.8) {
      // High HP: can be more aggressive
      score += 5 * this.policy.aggression;
    }

    // Opponent HP consideration
    const opponentHpRatio = opponent.currentHP / opponent.maxHP;
    if (opponentHpRatio < 0.3) {
      // Opponent is weak: prefer finishing moves
      if (expectedDamage > opponent.currentHP * 0.5) {
        score += 15 * this.policy.aggression;
      }
    }

    // Sync level consideration (if available)
    if (self.syncLevel !== undefined && opponent.syncLevel !== undefined) {
      const syncAdvantage = self.syncLevel - opponent.syncLevel;
      if (syncAdvantage > 10) {
        score += 3 * this.policy.aggression;
      }
    }

    return score;
  }

  /**
   * Apply override rules
   */
  private applyOverrideRules(
    self: ISpiritInstance,
    opponent: ISpiritInstance,
    availableMoves: IMoveData[],
    rng: IRNGProvider
  ): IMoveData | null {
    // Check override rules
    for (const rule of this.policy.overrideRules) {
      const [condition, action, value] = rule.split(':');

      switch (condition) {
        case 'force_move_if_hp_below':
          if (self.currentHP / self.maxHP < parseFloat(value)) {
            const forcedMove = availableMoves.find(m => m.moveId === action);
            if (forcedMove) return forcedMove;
          }
          break;

        case 'prefer_move_if_type_advantage':
          if (this.typeEffectiveness.getMultiplier(action, opponent.typeTag) > 1) {
            const preferredMove = availableMoves.find(m => m.moveId === value);
            if (preferredMove) return preferredMove;
          }
          break;

        case 'avoid_move_if_low_accuracy':
          if (parseFloat(value) > 0.5) { // Avoid if accuracy below threshold
            const moveToAvoid = availableMoves.find(m => m.moveId === action);
            if (moveToAvoid && moveToAvoid.accuracy < parseFloat(value)) {
              // Remove from available moves for this decision
              return null; // Let main algorithm choose
            }
          }
          break;
      }
    }

    return null;
  }

  /**
   * Create action for move
   */
  private createAction(
    self: ISpiritInstance,
    opponent: ISpiritInstance,
    move: IMoveData,
    rng: IRNGProvider
  ): IBattleAction {
    return {
      actorId: self.id.toString(),
      targetId: opponent.id.toString(),
      moveId: move.moveId,
      priority: 0,
      speed: self.level, // Use level as speed determinant
      source: ActionSource.AI,
      type: 'attack'
    };
  }

  /**
   * Create wait action
   */
  private createWaitAction(self: ISpiritInstance, opponent: ISpiritInstance): IBattleAction {
    return {
      actorId: self?.id.toString() || '-1',
      targetId: opponent?.id.toString() || '-1',
      moveId: 'wait',
      priority: 0,
      speed: 0,
      source: ActionSource.AI,
      type: 'defend'
    };
  }

  /**
   * Get current policy
   */
  getPolicy(): AIPolicy {
    return this.policy;
  }

  /**
   * Set new policy
   */
  setPolicy(policy: AIPolicy): void {
    // Note: In a real implementation, this would need to be handled carefully
    // as BattleAI instances are created by AIManager
    console.warn('Policy change ignored - create new BattleAI instance instead');
  }

  /**
   * Get policy summary
   */
  getPolicySummary(): string {
    return this.policy.getSummary();
  }

  /**
   * Check if AI is aggressive
   */
  get isAggressive(): boolean {
    return this.policy.isAggressive;
  }

  /**
   * Check if AI is cautious
   */
  get isCautious(): boolean {
    return this.policy.isCautious;
  }

  /**
   * Check if AI is efficient
   */
  get isEfficient(): boolean {
    return this.policy.isEfficient;
  }
}

/**
 * Utility functions for AI operations
 */
export const AIUtils = {
  /**
   * Create standard AI policy set
   */
  createStandardPolicies(): AIPolicy[] {
    return [
      AIPolicy.balanced('balanced'),
      AIPolicy.aggressive('aggressive'),
      AIPolicy.cautious('cautious'),
      AIPolicy.efficient('efficient'),
      AIPolicy.defensive('defensive')
    ];
  },

  /**
   * Create adaptive policy based on spirit stats
   */
  createAdaptivePolicy(spirit: ISpiritInstance): AIPolicy {
    const hpRatio = spirit.currentHP / spirit.maxHP;
    const attackRatio = spirit.attack / (spirit.attack + spirit.specialAttack);
    const defenseRatio = spirit.defense / (spirit.defense + spirit.specialDefense);

    let aggression = 1.0;
    let caution = 1.0;
    let efficiency = 1.0;

    // High HP and attack: aggressive
    if (hpRatio > 0.7 && attackRatio > 0.6) {
      aggression = 1.5;
      caution = 0.7;
    }
    // Low HP: cautious
    else if (hpRatio < 0.3) {
      aggression = 0.5;
      caution = 1.8;
    }
    // High defense: defensive
    else if (defenseRatio > 0.6) {
      aggression = 0.7;
      caution = 1.5;
    }
    // Balanced
    else {
      aggression = 1.0;
      caution = 1.0;
      efficiency = 1.2;
    }

    return new AIPolicy(
      `adaptive_${spirit.id}`,
      aggression,
      caution,
      efficiency
    );
  },

  /**
   * Create policy for boss battles
   */
  createBossPolicy(bossLevel: number, playerLevel: number): AIPolicy {
    const levelDifference = bossLevel - playerLevel;

    if (levelDifference > 5) {
      // Much stronger boss: cautious and efficient
      return new AIPolicy('boss_strong', 0.8, 1.6, 1.4);
    } else if (levelDifference > 0) {
      // Slightly stronger boss: balanced with caution
      return new AIPolicy('boss_challenging', 1.0, 1.3, 1.2);
    } else {
      // Weaker or equal boss: aggressive
      return new AIPolicy('boss_weak', 1.4, 0.9, 1.1);
    }
  },

  /**
   * Create policy for specific scenarios
   */
  createScenarioPolicy(scenario: 'early_game' | 'mid_game' | 'late_game' | 'boss' | 'pvp'): AIPolicy {
    switch (scenario) {
      case 'early_game':
        return new AIPolicy('early_game', 1.2, 1.0, 0.8);
      case 'mid_game':
        return new AIPolicy('mid_game', 1.0, 1.2, 1.2);
      case 'late_game':
        return new AIPolicy('late_game', 0.8, 1.4, 1.6);
      case 'boss':
        return new AIPolicy('boss_fight', 1.0, 1.5, 1.3);
      case 'pvp':
        return new AIPolicy('pvp', 1.3, 1.1, 1.0);
      default:
        return AIPolicy.balanced('default_scenario');
    }
  },

  /**
   * Validate AI manager configuration
   */
  validateAIManager(manager: IAIManager): string[] {
    const errors: string[] = [];

    if (!manager) {
      errors.push('AI manager is null or undefined');
      return errors;
    }

    const policies = manager.getAllPolicies();
    if (policies.length === 0) {
      errors.push('No AI policies registered');
    }

    policies.forEach((policy, index) => {
      const policyErrors = policy.validate();
      policyErrors.forEach(error => {
        errors.push(`Policy ${index} (${policy.policyId}): ${error}`);
      });
    });

    return errors;
  },

  /**
   * Test AI decision making
   */
  testAIDecision(
    ai: IBattleAI,
    self: ISpiritInstance,
    opponent: ISpiritInstance,
    moves: IMoveData[],
    expectedMoveId: string
  ): boolean {
    // Mock RNG provider
    const mockRNG: IRNGProvider = {
      nextFloat: (min, max) => (min + max) / 2,
      nextBool: (probability) => Math.random() < probability
    };

    const action = ai.selectAction(self, opponent, moves, mockRNG);
    return action.moveId === expectedMoveId;
  },

  /**
   * Compare AI policies
   */
  comparePolicies(policy1: IAIPolicy, policy2: IAIPolicy): {
    aggressionDiff: number;
    cautionDiff: number;
    efficiencyDiff: number;
    totalDifference: number;
  } {
    const aggressionDiff = Math.abs(policy1.aggression - policy2.aggression);
    const cautionDiff = Math.abs(policy1.caution - policy2.caution);
    const efficiencyDiff = Math.abs(policy1.efficiency - policy2.efficiency);
    const totalDifference = aggressionDiff + cautionDiff + efficiencyDiff;

    return {
      aggressionDiff,
      cautionDiff,
      efficiencyDiff,
      totalDifference
    };
  },

  /**
   * Get AI behavior description
   */
  getBehaviorDescription(policy: IAIPolicy): string {
    const behaviors: string[] = [];

    if (policy.aggression > 1.2) {
      behaviors.push('aggressive (prioritizes damage and type advantages)');
    } else if (policy.aggression < 0.8) {
      behaviors.push('passive (avoids risky moves)');
    }

    if (policy.caution > 1.2) {
      behaviors.push('cautious (prefers high accuracy moves)');
    } else if (policy.caution < 0.8) {
      behaviors.push('reckless (accepts low accuracy moves)');
    }

    if (policy.efficiency > 1.2) {
      behaviors.push('efficient (minimizes resource usage)');
    } else if (policy.efficiency < 0.8) {
      behaviors.push('wasteful (ignores resource costs)');
    }

    if (behaviors.length === 0) {
      behaviors.push('balanced (moderate behavior)');
    }

    return behaviors.join(', ');
  }
};

/**
 * Default instances
 */
export const defaultAIPolicy = AIPolicy.balanced();
export const defaultAIManager = new AIManager();
export const defaultBattleAI = new BattleAI(defaultAIPolicy, new TypeEffectiveness());