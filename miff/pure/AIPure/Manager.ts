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

import { TypeEffectiveness } from '../CombatPure/engine';
import { Logger } from '../shared/logging';

const typeEffectiveness = new TypeEffectiveness();
const logger = Logger.create('AIManager');

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
    this.overrideRules = this.overrideRules.filter((rule: any) => {
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

  selectAction(playerSpirit: any, opponentSpirit: any, availableMoves: any[], rng?: any): IAIAction {
    // Create context from parameters
    const context: IAIDecisionContext = {
      playerSpirit,
      opponentSpirit,
      availableMoves,
      resources: { rng: rng || this.rng }
    };

    return this.selectActionWithContext(context);
  }

  private selectActionWithContext(context: IAIDecisionContext | null): IAIAction {
    // Handle null context
    if (!context || !context.availableMoves || context.availableMoves.length === 0) {
      return {
        type: AIActionType.WAIT,
        moveId: 'wait',
        confidence: 0.5,
        reasoning: 'No context or moves available'
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

    // HP-based decision modifiers
    const isLowHP = context.playerSpirit && context.playerSpirit.currentHP < context.playerSpirit.maxHP * 0.3;
    if (isLowHP) {
      // When HP is low, give healing moves a significant bonus
      // But still evaluate all moves to find the best option
    }

    // Select best action based on policy
    if (actions.length === 0) {
      return {
        type: AIActionType.DEFEND,
        confidence: 0.5,
        reasoning: 'No clear actions available, playing defensively'
      };
    }

    // Prioritize actions that were selected by HP-based override rules
    const hpActions = actions.filter((action: any) => action.reasoning.includes('Critical HP override rule'));
    if (hpActions.length > 0) {
      return hpActions[0!]; // Return the first HP-prioritized action
    }

    // Otherwise, select the action with highest confidence
    return actions.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );
  }

  private evaluateMove(move: any, context: IAIDecisionContext): IAIAction | null {
    if (!context.playerSpirit || !context.opponentSpirit) return null;

    let confidence = 0.5;
    let reasoning = '';

    // Base confidence from move properties
    if (move.power) {
      confidence += move.power / 100 * 0.3; // Power contributes up to 30% to confidence
    }

    if (move.accuracy) {
      confidence += (move.accuracy - 0.5) * 0.4; // Accuracy bonus/penalty
    }

    // Resource cost consideration
    if (move.cost !== undefined) {
      if (move.cost === 0) {
        confidence += 0.15; // Bonus for free moves
        reasoning += 'Free move (no resource cost). ';
      } else if (context.playerSpirit && context.playerSpirit.resourcePoints) {
        const resourceRatio = context.playerSpirit.resourcePoints / move.cost;
        if (resourceRatio < 1.0) {
          confidence -= (1.0 - resourceRatio) * 0.5; // Cannot afford move, major penalty
          reasoning += 'Cannot afford move (insufficient resources). ';
        } else if (resourceRatio < 2.0) {
          confidence -= (2.0 - resourceRatio) * 0.2; // Can afford but expensive
          reasoning += 'Expensive move for current resources. ';
        }
      }
    }

    // Type effectiveness bonus - MAJOR FACTOR (but cautious policies deprioritize this)
    if (context.playerSpirit && context.opponentSpirit && move.typeTag && context.opponentSpirit.typeTag) {
      const effectiveness = typeEffectiveness.getMultiplier(move.typeTag, context.opponentSpirit.typeTag);
      const typeBonus = (effectiveness - 1.0) * 0.4;
      const typePenalty = (1.0 - effectiveness) * 0.3;

      // Cautious policies significantly reduce the impact of type effectiveness and prioritize accuracy
      if (this.policy.caution > 1.0) {
        const cautionFactor = Math.min(1.0, this.policy.caution - 1.0);
        if (effectiveness > 1.0) {
          confidence += typeBonus * (1.0 - cautionFactor * 0.6); // Reduced type advantage bonus for cautious (60% reduction)
          reasoning += `Super effective against ${context.opponentSpirit.typeTag} (+${Math.round((effectiveness - 1.0) * 100)}% effectiveness, reduced by caution). `;
        } else if (effectiveness < 1.0) {
          confidence -= typePenalty * (1.0 + cautionFactor * 0.4); // Increased type disadvantage penalty for cautious
          reasoning += `Not very effective against ${context.opponentSpirit.typeTag} (-${Math.round((1.0 - effectiveness) * 100)}% effectiveness, increased by caution). `;
        }

        // Cautious policies get major accuracy bonus
        if (move.accuracy && move.accuracy >= 0.95) {
          confidence += 0.3 * cautionFactor; // Up to 30% bonus for high accuracy moves
          reasoning += 'High accuracy move favored by cautious policy. ';
        }
      } else {
        // Normal type effectiveness evaluation for non-cautious policies
        if (effectiveness > 1.0) {
          confidence += typeBonus;
          reasoning += `Super effective against ${context.opponentSpirit.typeTag} (+${Math.round((effectiveness - 1.0) * 100)}% effectiveness). `;
        } else if (effectiveness < 1.0) {
          confidence -= typePenalty;
          reasoning += `Not very effective against ${context.opponentSpirit.typeTag} (-${Math.round((1.0 - effectiveness) * 100)}% effectiveness). `;
        }
      }
    }

    // Apply policy modifiers
    if (this.policy.aggression > 1.0 && (move.category === 'damage' || move.category === 'physical')) {
      confidence += (this.policy.aggression - 1.0) * 0.2;
      reasoning += 'Aggressive policy favors damage moves. ';
    }

    if (this.policy.caution > 1.0 && (move.category === 'healing' || move.category === 'status')) {
      confidence += (this.policy.caution - 1.0) * 0.2;
      reasoning += 'Cautious policy favors healing. ';
    }

    // HP-based decisions
    if (context.playerSpirit) {
      const hpRatio = context.playerSpirit.currentHP / context.playerSpirit.maxHP;
      if (hpRatio <= 0.3) {
        if (move.category === 'healing' || move.category === 'status') {
          confidence += 0.5; // Major bonus for healing when HP is low
          reasoning += 'Health is low, strongly favoring healing. ';
        } else if (move.category === 'damage' || move.category === 'physical') {
          confidence -= 0.3; // Penalty for damage when HP is low
          reasoning += 'Health is low, avoiding damage moves. ';
        }
      } else if (hpRatio < 0.5) {
        if (move.category === 'healing' || move.category === 'status') {
          confidence += 0.2; // Minor bonus for healing when HP is moderate
          reasoning += 'Health is moderate, favoring healing. ';
        }
      }
    }

    // Apply override rules FIRST (before risk assessment)
    // Prioritize HP-based rules over other types
    let overrideApplied = false;
    let isHPRule = false;
    if (this.policy.overrideRules && this.policy.overrideRules.length > 0) {
      // First, check for HP-based rules (critical priority)
      for (const rule of this.policy.overrideRules) {
        const [ruleType, ruleValue] = rule.split(':');
        if (ruleType === 'force_move_if_hp_below') {
          if (this.evaluateOverrideRule(ruleType, ruleValue, move, context)) {
            confidence += 0.9; // Higher priority for HP-based rules
            reasoning += `Critical HP override rule applied: ${ruleType} -> ${ruleValue}. `;
            overrideApplied = true;
            isHPRule = true;
            break; // HP rules take priority - stop here
          }
        }
      }

      // If no HP rule applied, check other override rules
      if (!overrideApplied) {
        for (const rule of this.policy.overrideRules) {
          const [ruleType, ruleValue] = rule.split(':');
          if (this.evaluateOverrideRule(ruleType, ruleValue, move, context)) {
            confidence += 0.8; // Standard bonus for other override rules
            reasoning += `Override rule applied: ${ruleType} -> ${ruleValue}. `;
            overrideApplied = true;
            break; // Only apply the first matching override rule
          }
        }
      }
    }

    // If this move was selected by an HP rule, it takes absolute priority
    if (isHPRule) {
      return {
        type: this.mapMoveToAction(move.category),
        moveId: move.moveId,
        confidence: confidence,
        reasoning: reasoning
      };
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
      moveId: move.moveId,
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

  private evaluateOverrideRule(ruleType: string, ruleValue: string, move: any, context: IAIDecisionContext): boolean {
    switch (ruleType) {
      case 'force_move_if_hp_below':
        if (context.playerSpirit) {
          const hpRatio = context.playerSpirit.currentHP / context.playerSpirit.maxHP;
          const threshold = parseFloat(ruleValue) || 0.3;
          return hpRatio < threshold && move.moveId === 'heal';
        }
        return false;

      case 'prefer_move_if_type_advantage':
        if (context.playerSpirit && context.opponentSpirit && move.typeTag && context.opponentSpirit.typeTag) {
          const effectiveness = typeEffectiveness.getMultiplier(move.typeTag, context.opponentSpirit.typeTag);
          return effectiveness > 1.0 && move.moveId === ruleValue;
        }
        return false;

      case 'prefer_move_type':
        return move.category === ruleValue;

      case 'prefer_high_accuracy':
        return (move.accuracy || 0) > 0.9;

      case 'prefer_low_cost':
        return (move.cost || 0) <= 5;

      case 'prefer_healing':
        return move.category === 'healing' || move.category === 'status';

      default:
        return false;
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
    const attack = spirit.attack || 0;
    const defense = spirit.defense || 0;

    if (hpRatio < 0.35) {
      return AIPolicy.defensive('adaptive_low_hp');
    }

    if (attack > defense + 20) {
      return AIPolicy.aggressive('adaptive_high_attack');
    }

    if (defense > attack + 20) {
      return AIPolicy.cautious('adaptive_high_defense');
    }

    return AIPolicy.balanced('adaptive_balanced');
  }

  static createAdaptivePolicyWithId(spirit: any, id: string): AIPolicy {
    const hpRatio = (spirit.currentHP || 1) / Math.max(1, spirit.maxHP || 1);

    if (hpRatio < 0.35) {
      return AIPolicy.defensive(id);
    }

    if ((spirit.attack || 0) > (spirit.defense || 0) + 20) {
      return AIPolicy.aggressive(id);
    }

    if ((spirit.defense || 0) > (spirit.attack || 0) + 20) {
      return AIPolicy.cautious(id);
    }

    return AIPolicy.balanced(id);
  }

  static createBossPolicy(bossLevel: number, playerLevel: number): AIPolicy {
    if (bossLevel >= playerLevel) {
      return AIPolicy.cautious('boss_equal_or_strong');
    }

    return AIPolicy.aggressive('boss_weak');
  }

  static createScenarioPolicy(scenario: string): AIPolicy {
    switch (scenario) {
      case 'early_game': return AIPolicy.aggressive('early_game');
      case 'mid_game': return AIPolicy.cautious('mid_game');
      case 'late_game': return AIPolicy.efficient('late_game');
      case 'boss': return AIPolicy.cautious('boss');
      case 'pvp': return AIPolicy.aggressive('pvp');
      case 'training': return AIPolicy.balanced('training');
      default: return AIPolicy.balanced('scenario_default');
    }
  }

  static comparePolicies(a: AIPolicy, b: AIPolicy): {
    styleMatch: boolean;
    aggressionDiff: number;
    cautionDiff: number;
    efficiencyDiff: number;
    attributeDifference: number;
    ruleMatch: boolean;
    totalDifference: number;
  } {
    const styleMatch = a.policyId === b.policyId;
    const aggressionDiff = Math.abs(a.aggression - b.aggression);
    const cautionDiff = Math.abs(a.caution - b.caution);
    const efficiencyDiff = Math.abs(a.efficiency - b.efficiency);
    const attributeDifference = aggressionDiff + cautionDiff + efficiencyDiff;

    const ruleMatch = a.overrideRules.join(',') === b.overrideRules.join(',');

    const totalDifference = attributeDifference + (ruleMatch ? 0 : 1);

    return { styleMatch, aggressionDiff, cautionDiff, efficiencyDiff, attributeDifference, ruleMatch, totalDifference };
  }

  static getBehaviorDescription(policy: AIPolicy): string {
    if (policy.aggression >= 1.5) {
      return 'Aggressive behavior emphasizing damage output';
    } else if (policy.caution >= 1.5) {
      return 'Cautious behavior emphasizing survival and safety';
    } else if (policy.efficiency >= 1.5) {
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
  neuralNetworkLayers?: number[];
  trainingIterations?: number;
  activationFunction?: 'sigmoid' | 'relu' | 'tanh';
  lossFunction?: 'mse' | 'cross_entropy';
  batchSize?: number;
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

export interface TrainingData {
  input: number[];
  expectedOutput: number[];
  actualOutput?: number[];
  error?: number;
  timestamp: number;
}

export interface NeuralNetworkConfig {
  inputSize: number;
  outputSize: number;
  hiddenLayers: number[];
  activationFunction: 'sigmoid' | 'relu' | 'tanh';
  learningRate: number;
  batchSize: number;
}

export class SimpleNeuralNetwork {
  private config: NeuralNetworkConfig;
  private weights: number[][][] = [];
  private biases: number[][] = [];
  private activations: number[][] = [];

  constructor(config: NeuralNetworkConfig) {
    this.config = config;
    this.initialize();
  }

  private initialize(): void {
    const { inputSize, hiddenLayers, outputSize } = this.config;
    const layers = [inputSize, ...hiddenLayers, outputSize];

    for (let i = 0; i < layers.length - 1; i++) {
      const layerWeights: number[][] = [];
      const layerBiases: number[] = [];

      for (let j = 0; j < layers[i + 1]; j++) {
        layerBiases.push(0.1 * (Math.random() - 0.5));

        const neuronWeights: number[] = [];
        for (let k = 0; k < layers[i]; k++) {
          neuronWeights.push(0.1 * (Math.random() - 0.5));
        }
        layerWeights.push(neuronWeights);
      }

      this.weights.push(layerWeights);
      this.biases.push(layerBiases);
    }
  }

  private activationFunction(x: number): number {
    switch (this.config.activationFunction) {
      case 'sigmoid':
        return 1 / (1 + Math.exp(-x));
      case 'tanh':
        return Math.tanh(x);
      case 'relu':
      default:
        return Math.max(0, x);
    }
  }

  private activationDerivative(x: number): number {
    switch (this.config.activationFunction) {
      case 'sigmoid':
        const sigmoid = this.activationFunction(x);
        return sigmoid * (1 - sigmoid);
      case 'tanh':
        const tanh = this.activationFunction(x);
        return 1 - tanh * tanh;
      case 'relu':
      default:
        return x > 0 ? 1 : 0;
    }
  }

  predict(input: number[]): number[] {
    this.activations = [input];

    for (let layer = 0; layer < this.weights.length; layer++) {
      const layerActivations: number[] = [];

      for (let neuron = 0; neuron < this.weights[layer].length; neuron++) {
        let sum = this.biases[layer][neuron];

        for (let weight = 0; weight < this.weights[layer][neuron].length; weight++) {
          sum += this.activations[layer][weight] * this.weights[layer][neuron][weight];
        }

        layerActivations.push(this.activationFunction(sum));
      }

      this.activations.push(layerActivations);
    }

    return this.activations[this.activations.length - 1];
  }

  train(input: number[], expectedOutput: number[]): number {
    const prediction = this.predict(input);
    const error = this.calculateError(prediction, expectedOutput);

    // Backpropagation
    const gradients: number[][] = [];
    const weightDeltas: number[][][] = [];
    const biasDeltas: number[][] = [];

    // Calculate output layer gradients
    const outputGradients: number[] = [];
    for (let i = 0; i < prediction.length; i++) {
      outputGradients.push(error[i] * this.activationDerivative(prediction[i]));
    }
    gradients.push(outputGradients);

    // Calculate hidden layer gradients
    for (let layer = this.weights.length - 1; layer > 0; layer--) {
      const layerGradients: number[] = [];

      for (let neuron = 0; neuron < this.weights[layer][0!].length; neuron++) {
        let gradient = 0;

        for (let nextNeuron = 0; nextNeuron < this.weights[layer].length; nextNeuron++) {
          for (let weight = 0; weight < this.weights[layer][nextNeuron].length; weight++) {
            if (weight === neuron) {
              gradient += gradients[0!][nextNeuron] * this.weights[layer][nextNeuron][weight];
            }
          }
        }

        gradient *= this.activationDerivative(this.activations[layer][neuron]);
        layerGradients.push(gradient);
      }

      gradients.unshift(layerGradients);
    }

    // Update weights and biases
    for (let layer = 0; layer < this.weights.length; layer++) {
      if (!weightDeltas[layer]) weightDeltas[layer] = [];
      if (!biasDeltas[layer]) biasDeltas[layer] = [];

      for (let neuron = 0; neuron < this.weights[layer].length; neuron++) {
        if (!weightDeltas[layer][neuron]) weightDeltas[layer][neuron] = [];

        biasDeltas[layer][neuron] = gradients[layer][neuron] * this.config.learningRate;

        for (let weight = 0; weight < this.weights[layer][neuron].length; weight++) {
          const delta = gradients[layer][neuron] * this.activations[layer][weight] * this.config.learningRate;
          weightDeltas[layer][neuron][weight] = delta;

          this.weights[layer][neuron][weight] -= delta;
        }

        this.biases[layer][neuron] -= biasDeltas[layer][neuron];
      }
    }

    return this.calculateTotalError(error);
  }

  private calculateError(prediction: number[], expected: number[]): number[] {
    const error: number[] = [];
    for (let i = 0; i < prediction.length; i++) {
      error.push(expected[i] - prediction[i]);
    }
    return error;
  }

  private calculateTotalError(error: number[]): number {
    return error.reduce((sum, e) => sum + Math.abs(e), 0) / error.length;
  }

  getWeights(): number[][][] {
    return JSON.parse(JSON.stringify(this.weights));
  }

  setWeights(weights: number[][][]): void {
    this.weights = JSON.parse(JSON.stringify(weights));
  }

  getBiases(): number[][] {
    return JSON.parse(JSON.stringify(this.biases));
  }

  setBiases(biases: number[][]): void {
    this.biases = JSON.parse(JSON.stringify(biases));
  }
}

export class AIManager {
  private config: AIConfig;
  private behaviors: Map<string, AIBehavior> = new Map();
  private decisions: AIDecision[] = [];
  private isInitialized: boolean = false;
  private policies: Map<string, AIPolicy> = new Map();
  private neuralNetworks: Map<string, SimpleNeuralNetwork> = new Map();
  private trainingData: Map<string, TrainingData[]> = new Map();

  constructor(config: Partial<AIConfig> = {}) {
    this.config = {
      maxMemory: 1000,
      learningRate: 0.1,
      enableNeuralNetworks: false,
      debugMode: false,
      neuralNetworkLayers: [8, 16, 8, 4],
      trainingIterations: 1000,
      activationFunction: 'relu',
      lossFunction: 'mse',
      batchSize: 32,
      ...config
    };
  }

  /**
   * Initialize the AI system
   */
  initialize(): void {
    if (this.isInitialized) return;

    logger.info('Initializing AI system');
    
    // Initialize default behaviors
    this.initializeDefaultBehaviors();
    
    this.isInitialized = true;
    logger.info('AI system initialized successfully');
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
    policies.forEach((policy: any) => this.registerPolicy(policy));
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
    return this.getAllPolicies().filter((p: any) => p.policyId === style);
  }

  /**
   * Add a new behavior
   */
  addBehavior(behavior: AIBehavior): boolean {
    if (!behavior.id || !behavior.name) {
      logger.error('Invalid behavior: missing required fields', { behavior });
      return false;
    }

    this.behaviors.set(behavior.id, behavior);
    logger.info('Behavior added', { behaviorId: behavior.id, behaviorName: behavior.name, behaviorType: behavior.type });
    return true;
  }

  /**
   * Remove a behavior
   */
  removeBehavior(behaviorId: string): boolean {
    const removed = this.behaviors.delete(behaviorId);
    if (removed) {
      logger.info('Behavior removed', { behaviorId });
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
      selectedOption: options[0!] || 'none',
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
    logger.info('AI system reset');
  }

  /**
   * Dispose of the AI system
   */
  dispose(): void {
    this.reset();
    this.neuralNetworks.clear();
    this.trainingData.clear();
    logger.info('AI system disposed');
  }

  /**
   * Create a neural network for a specific task
   */
  createNeuralNetwork(networkId: string, inputSize: number, outputSize: number): SimpleNeuralNetwork | null {
    if (!this.config.enableNeuralNetworks) {
      logger.warn('Neural networks are disabled', { networkId });
      return null;
    }

    const network = new SimpleNeuralNetwork({
      inputSize,
      outputSize,
      hiddenLayers: this.config.neuralNetworkLayers! || [8, 16, 8],
      activationFunction: this.config.activationFunction! || 'relu',
      learningRate: this.config.learningRate,
      batchSize: this.config.batchSize! || 32
    });

    this.neuralNetworks.set(networkId, network);
    logger.info('Neural network created', { networkId, inputSize, outputSize, layers: this.config.neuralNetworkLayers });
    return network;
  }

  /**
   * Get a neural network by ID
   */
  getNeuralNetwork(networkId: string): SimpleNeuralNetwork | null {
    return this.neuralNetworks.get(networkId) || null;
  }

  /**
   * Train a neural network with data
   */
  trainNeuralNetwork(networkId: string, trainingData: TrainingData[]): boolean {
    const network = this.getNeuralNetwork(networkId);
    if (!network) {
      logger.error('Neural network not found for training', { networkId });
      return false;
    }

    let totalError = 0;
    let samples = 0;

    for (const data of trainingData) {
      const error = network.train(data.input, data.expectedOutput);
      totalError += error;
      samples++;

      // Store training data for analysis
      data.actualOutput = network.predict(data.input);
      data.error = error;
      data.timestamp = Date.now();
    }

    this.trainingData.set(networkId, trainingData);

    const avgError = totalError / samples;
    logger.info('Training completed', { networkId, averageError: avgError.toFixed(4), samples, iterations: this.config.trainingIterations });

    return avgError < 0.1; // Training successful if average error < 10%
  }

  /**
   * Use neural network to make predictions
   */
  predictWithNeuralNetwork(networkId: string, input: number[]): number[] | null {
    const network = this.getNeuralNetwork(networkId);
    if (!network) {
      logger.error('Neural network not found for prediction', { networkId });
      return null;
    }

    return network.predict(input);
  }

  /**
   * Train AI to learn from battle outcomes
   */
  trainFromBattleOutcomes(battleHistory: any[]): boolean {
    if (!this.config.enableNeuralNetworks! || battleHistory.length < 10) {
      return false;
    }

    // Create training data from battle history
    const trainingData: TrainingData[] = [];

    for (const battle of battleHistory) {
      // Extract features from battle state
      const input = this.extractFeaturesFromBattleState(battle.initialState);
      const output = this.extractOutputFromBattleResult(battle.result);

      if (input.length > 0 && output.length > 0) {
        trainingData.push({
          input,
          expectedOutput: output,
          timestamp: Date.now()
        });
      }
    }

    // Create or get neural network for battle prediction
    const networkId = 'battle_prediction_network';
    let network = this.getNeuralNetwork(networkId);

    if (!network) {
      network = this.createNeuralNetwork(networkId, trainingData[0!]?.input.length || 8, trainingData[0!]?.expectedOutput.length || 4);
    }

    if (!network || trainingData.length === 0) {
      return false;
    }

    return this.trainNeuralNetwork(networkId, trainingData);
  }

  /**
   * Extract features from battle state for neural network input
   */
  private extractFeaturesFromBattleState(battleState: any): number[] {
    const features: number[] = [];

    if (battleState.playerSpirit) {
      features.push(
        battleState.playerSpirit.currentHP / battleState.playerSpirit.maxHP,
        battleState.playerSpirit.attack / 100,
        battleState.playerSpirit.defense / 100,
        battleState.playerSpirit.specialAttack / 100,
        battleState.playerSpirit.specialDefense / 100,
        battleState.playerSpirit.resourcePoints / 50
      );
    } else {
      // Default values if no player spirit
      features.push(1.0, 0.5, 0.4, 0.6, 0.5, 0.4);
    }

    if (battleState.opponentSpirit) {
      features.push(
        battleState.opponentSpirit.currentHP / battleState.opponentSpirit.maxHP,
        battleState.opponentSpirit.attack / 100,
        battleState.opponentSpirit.defense / 100,
        battleState.opponentSpirit.specialAttack / 100,
        battleState.opponentSpirit.specialDefense / 100,
        battleState.opponentSpirit.resourcePoints / 50
      );
    } else {
      // Default values if no opponent spirit
      features.push(1.0, 0.5, 0.4, 0.6, 0.5, 0.4);
    }

    return features;
  }

  /**
   * Extract output from battle result for neural network training
   */
  private extractOutputFromBattleResult(result: any): number[] {
    // Convert battle result to numerical representation
    // [player_health_ratio, opponent_health_ratio, battle_duration, victory_status]
    return [
      result.playerHealthRatio || 0,
      result.opponentHealthRatio || 0,
      Math.min(1.0, result.duration / 100), // Normalize duration
      result.victory ? 0: 0.0
    ];
  }

  /**
   * Predict battle outcome using neural network
   */
  predictBattleOutcome(playerSpirit: any, opponentSpirit: any): {
    playerWinProbability: number;
    expectedDamage: number;
    recommendedStrategy: string;
  } | null {
    if (!this.config.enableNeuralNetworks) {
      return null;
    }

    const network = this.getNeuralNetwork('battle_prediction_network');
    if (!network) {
      return null;
    }

    const battleState = { playerSpirit, opponentSpirit };
    const input = this.extractFeaturesFromBattleState(battleState);
    const prediction = network.predict(input);

    return {
      playerWinProbability: Math.max(0, Math.min(1, prediction[3!] || 0)),
      expectedDamage: (prediction[0!] || 0) * 100, // Convert to actual damage
      recommendedStrategy: this.getStrategyRecommendation(prediction)
    };
  }

  /**
   * Get strategy recommendation based on neural network prediction
   */
  private getStrategyRecommendation(prediction: number[]): string {
    const playerHealthRatio = prediction[0!] || 0;
    const opponentHealthRatio = prediction[1!] || 0;

    if (playerHealthRatio < 0.3) {
      return 'DEFENSIVE_HEALING';
    } else if (opponentHealthRatio < 0.3) {
      return 'AGGRESSIVE_ATTACK';
    } else if (playerHealthRatio > opponentHealthRatio + 0.2) {
      return 'BALANCED_ATTACK';
    } else {
      return 'CAUTIOUS_DEFENSE';
    }
  }

  /**
   * Get AI performance monitoring data
   */
  getPerformanceMetrics(): {
    neuralNetworksCount: number;
    totalTrainingData: number;
    averageError: number;
    decisionAccuracy: number;
    processingTime: number;
    timestamp: number;
  } {
    const neuralNetworksCount = this.neuralNetworks.size;
    let totalTrainingData = 0;
    let totalError = 0;
    let errorCount = 0;

    for (const [networkId, data] of this.trainingData) {
      for (const sample of data) {
        totalTrainingData++;
        if (sample.error !== undefined) {
          totalError += sample.error;
          errorCount++;
        }
      }
    }

    const averageError = errorCount > 0 ? totalError / errorCount : 0;
    const decisionAccuracy = Math.max(0, 1 - averageError);

    return {
      neuralNetworksCount,
      totalTrainingData,
      averageError,
      decisionAccuracy,
      processingTime: 0, // Would need to implement timing
      timestamp: Date.now()
    };
  }
}

export class AIPerformanceMonitor {
  private aiManager: AIManager;
  private metricsHistory: any[] = [];
  private isMonitoring: boolean = false;
  private monitorInterval?: NodeJS.Timeout;

  constructor(aiManager: AIManager) {
    this.aiManager = aiManager;
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(intervalMs: number = 5000): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitorInterval = setInterval(() => {
      this.collectMetrics();
    }, intervalMs);

    logger.info('AI performance monitoring started', { intervalMs });
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = undefined;
    }

    this.isMonitoring = false;
    logger.info('AI performance monitoring stopped');
  }

  /**
   * Collect current metrics
   */
  private collectMetrics(): void {
    const baseMetrics = this.aiManager.getPerformanceMetrics();
    const metrics = {
      ...baseMetrics,
      timestamp: new Date()
    };

    this.metricsHistory.push(metrics);

    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metricsHistory.length > 1000) {
      this.metricsHistory = this.metricsHistory.slice(-1000);
    }

    this.logMetricsIfNeeded(metrics);
  }

  /**
   * Log metrics if thresholds are exceeded
   */
  private logMetricsIfNeeded(metrics: any): void {
    if (metrics.averageError > 0.5) {
      logger.warn('High average error detected', { averageError: metrics.averageError.toFixed(4) });
    }

    if (metrics.decisionAccuracy < 0.7) {
      logger.warn('Low decision accuracy detected', { decisionAccuracy: (metrics.decisionAccuracy * 100).toFixed(1) + '%' });
    }

    if (metrics.neuralNetworksCount > 10) {
      logger.info('High neural network count detected', { count: metrics.neuralNetworksCount });
    }
  }

  /**
   * Get performance history
   */
  getMetricsHistory(): any[] {
    return [...this.metricsHistory];
  }

  /**
   * Get latest metrics
   */
  getLatestMetrics(): any | null {
    return this.metricsHistory.length > 0 ? this.metricsHistory[this.metricsHistory.length - 1] : null;
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    if (this.metricsHistory.length === 0) {
      return 'No performance data available';
    }

    const latest = this.getLatestMetrics();
    const averageError = this.metricsHistory.reduce((sum, m) => sum + m.averageError, 0) / this.metricsHistory.length;
    const averageAccuracy = this.metricsHistory.reduce((sum, m) => sum + m.decisionAccuracy, 0) / this.metricsHistory.length;

    return `
AI Performance Report
=====================

Latest Metrics:
- Neural Networks: ${latest.neuralNetworksCount}
- Training Data Points: ${latest.totalTrainingData}
- Average Error: ${latest.averageError.toFixed(4)}
- Decision Accuracy: ${(latest.decisionAccuracy * 100).toFixed(1)}%

Historical Averages:
- Average Error: ${averageError.toFixed(4)}
- Average Accuracy: ${(averageAccuracy * 100).toFixed(1)}%

Monitoring Status: ${this.isMonitoring ? 'Active' : 'Inactive'}
Total Metrics Collected: ${this.metricsHistory.length}
    `.trim();
  }

  /**
   * Reset metrics history
   */
  resetHistory(): void {
    this.metricsHistory = [];
    logger.info('AI metrics history reset');
  }
}

export default AIManager;