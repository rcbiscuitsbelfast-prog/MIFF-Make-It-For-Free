#!/usr/bin/env node

/**
 * AIPure CLI Harness
 *
 * Interactive command-line interface for testing and demonstrating
 * the AIPure AI management system.
 */

// Check for help command
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  this.logger.info(`
AIPure CLI Harness - AI Management System

Usage: npx tsx miff/pure/AIPure/cliHarness.ts [command] [options]

Commands:
  test                     - Run basic AI tests
  create-policy <name>     - Create new AI policy
  create-battle-ai <name>  - Create new battle AI
  list-policies            - List all AI policies
  list-battle-ais          - List all battle AIs
  simulate-battle          - Simulate AI battle
  help                     - Show this help

Examples:
  npx tsx miff/pure/AIPure/cliHarness.ts test
  npx tsx miff/pure/AIPure/cliHarness.ts create-policy "aggressive"
  npx tsx miff/pure/AIPure/cliHarness.ts simulate-battle
`);
  process.exit(0);
}

import * as readline from 'readline';
import { StructuredLogger } from '../shared/logging/StructuredLogger';
import {
  AIManager,
  AIPolicy,
  BattleAI,
  AIUtils,
  MoveCategory
} from './Manager';
import {
  ActionSource,
  TypeEffectiveness,
  MoveData,
  SpiritInstance,
  DamageCalculator,
  IRNGProvider
} from '../CombatPure/engine';

// Mock RNG provider for testing
class MockRNGProvider implements IRNGProvider {
  private values: number[] = [];
  private boolValues: boolean[] = [];
  private currentIndex = 0;
  private boolIndex = 0;

  setNextFloat(value: number): void {
    this.values.push(value);
  }

  setNextBool(value: boolean): void {
    this.boolValues.push(value);
  }

  nextFloat(min: number, max: number): number {
    if (this.values.length > this.currentIndex) {
      const value = this.values[this.currentIndex];
      this.currentIndex++;
      return Math.max(min, Math.min(max, value));
    }
    return (min + max) / 2; // Default to midpoint
  }

  nextBool(probability: number): boolean {
    if (this.boolValues.length > this.boolIndex) {
      const value = this.boolValues[this.boolIndex];
      this.boolIndex++;
      return value;
    }
    return Math.random() < probability;
  }

  reset(): void {
    this.currentIndex = 0;
    this.boolIndex = 0;
  }
}

// Mock Spirit Instance for CLI
class MockSpiritInstance {
  public id: string;
  public name: string;
  public level: number;
  public attack: number;
  public defense: number;
  public specialAttack: number;
  public specialDefense: number;
  public maxHP: number;
  public currentHP: number;
  public resourcePoints: number;
  public typeTag: string;
  public attackMultiplier: number = 1.0;
  public defenseMultiplier: number = 1.0;
  public specialAttackMultiplier: number = 1.0;
  public specialDefenseMultiplier: number = 1.0;
  public critChanceBonus: number = 0.0;
  public syncLevel?: number;

  constructor(
    id: string,
    name: string,
    typeTag: string = 'neutral',
    level: number = 10,
    hp: number = 100,
    attack: number = 50,
    defense: number = 40,
    specialAttack: number = 55,
    specialDefense: number = 45,
    resourcePoints: number = 20,
    syncLevel?: number
  ) {
    this.logger = new StructuredLogger({ module: 'MockRNGProvider' });
    this.id = id;
    this.name = name;
    this.typeTag = typeTag;
    this.level = level;
    this.maxHP = hp;
    this.currentHP = hp;
    this.attack = attack;
    this.defense = defense;
    this.specialAttack = specialAttack;
    this.specialDefense = specialDefense;
    this.resourcePoints = resourcePoints;
    this.syncLevel = syncLevel;
  }

  getEffectiveAttack(): number {
    return Math.floor(this.attack * this.attackMultiplier);
  }

  getEffectiveDefense(): number {
    return Math.floor(this.defense * this.defenseMultiplier);
  }

  getEffectiveSpecialAttack(): number {
    return Math.floor(this.specialAttack * this.specialAttackMultiplier);
  }

  getEffectiveSpecialDefense(): number {
    return Math.floor(this.specialDefense * this.specialDefenseMultiplier);
  }

  takeDamage(amount: number): void {
    this.currentHP = Math.max(0, this.currentHP - amount);
  }

  heal(amount: number): void {
    this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
  }

  getCombatSummary(): string {
    const hpBar = this.createHealthBar();
    const syncInfo = this.syncLevel !== undefined ? ` | Sync: ${this.syncLevel}` : '';
    return `${this.name} [${this.typeTag}] HP: ${this.currentHP}/${this.maxHP} ${hpBar}${syncInfo}`;
  }

  private createHealthBar(): string {
    const barLength = 10;
    const filledLength = Math.round((this.currentHP / this.maxHP) * barLength);
    const emptyLength = barLength - filledLength;
    const filled = '█'.repeat(filledLength);
    const empty = '░'.repeat(emptyLength);
    return `[${filled}${empty}]`;
  }

  // Required methods for SpiritInstance compatibility
  isFullHealth(): boolean {
    return this.currentHP >= this.maxHP;
  }

  isCritical(): boolean {
    return this.currentHP <= this.maxHP * 0.25;
  }

  isLowHealth(): boolean {
    return this.currentHP <= this.maxHP * 0.5;
  }

  isKO(): boolean {
    return this.currentHP <= 0;
  }

  getStatusEffects(): string[] {
    return []; // Mock implementation
  }

  hasStatusEffect(effect: string): boolean {
    return false; // Mock implementation
  }

  getEffectiveStats(): any {
    return {
      hp: this.maxHP,
      attack: this.getEffectiveAttack(),
      defense: this.getEffectiveDefense(),
      specialAttack: this.getEffectiveSpecialAttack(),
      specialDefense: this.getEffectiveSpecialDefense(),
      speed: 50 // Mock speed
    };
  }
}

// CLI Application
class AIPureCLI {
  private rl: readline.Interface;
  private aiManager: AIManager;
  private spirits: Map<string, MockSpiritInstance>;
  private moves: Map<string, MoveData>;
  private rng: MockRNGProvider;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.aiManager = new AIManager();
    this.spirits = new Map();
    this.moves = new Map();
    this.rng = new MockRNGProvider();

    this.initializeData();
  }

  /**
   * Initialize test data
   */
  private initializeData(): void {
    // Create standard policies
    this.aiManager.createStandardPolicies();

    // Create test spirits
    this.spirits.set('fire_spirit', new MockSpiritInstance(
      'fire_spirit', 'Fire Spirit', 'fire', 15, 120, 60, 35, 70, 40, 25, 30
    ));

    this.spirits.set('water_spirit', new MockSpiritInstance(
      'water_spirit', 'Water Spirit', 'water', 15, 110, 45, 50, 65, 55, 25, 25
    ));

    this.spirits.set('nature_spirit', new MockSpiritInstance(
      'nature_spirit', 'Nature Spirit', 'nature', 15, 130, 50, 45, 55, 50, 25, 35
    ));

    this.spirits.set('electric_spirit', new MockSpiritInstance(
      'electric_spirit', 'Electric Spirit', 'electric', 15, 100, 55, 40, 75, 45, 25, 40
    ));

    // Create test moves
    const moves = [
      new MoveData('basic_strike', 'Basic Strike', MoveCategory.PHYSICAL, 40, 1.0, 0, 'neutral'),
      new MoveData('fire_blast', 'Fire Blast', MoveCategory.SPECIAL, 60, 0.9, 8, 'fire'),
      new MoveData('water_burst', 'Water Burst', MoveCategory.SPECIAL, 55, 0.95, 6, 'water'),
      new MoveData('nature_heal', 'Nature Heal', MoveCategory.STATUS, 0, 1.0, 5, 'nature'),
      new MoveData('thunder_bolt', 'Thunder Bolt', MoveCategory.SPECIAL, 65, 0.85, 10, 'electric'),
      new MoveData('tackle', 'Tackle', MoveCategory.PHYSICAL, 35, 1.0, 0, 'neutral'),
      new MoveData('quick_attack', 'Quick Attack', MoveCategory.PHYSICAL, 30, 1.0, 3, 'neutral'),
      new MoveData('rest', 'Rest', MoveCategory.STATUS, 0, 1.0, 0, 'neutral')
    ];

    moves.forEach(move => {
      this.moves.set(move.moveId, move);
    });

    this.logger.info(`Loaded ${this.spirits.size} spirits and ${this.moves.size} moves`);
  }

  /**
   * Start CLI application
   */
  start(): void {
    this.logger.info('='.repeat(60));
    this.logger.info('🤖 AIPure CLI - AI Management System');
    this.logger.info('='.repeat(60));
    this.logger.info('');
    this.logger.info('Available commands:');
    this.logger.info('  policies          - Show all AI policies');
    this.logger.info('  spirits           - Show all spirits');
    this.logger.info('  moves             - Show all moves');
    this.logger.info('  battle [spirit1] [spirit2] [policy] - Simulate battle');
    this.logger.info('  decide [spirit] [opponent] [policy] - Show AI decision');
    this.logger.info('  policy [id]       - Show policy details');
    this.logger.info('  compare [policy1] [policy2] - Compare policies');
    this.logger.info('  damage [spirit1] [spirit2] [move] - Calculate damage');
    this.logger.info('  heal [spirit] [amount] - Heal spirit');
    this.logger.info('  damage [spirit] [amount] - Damage spirit');
    this.logger.info('  status            - Show system status');
    this.logger.info('  help              - Show this help');
    this.logger.info('  exit              - Exit application');
    this.logger.info('');

    this.showPrompt();
  }

  /**
   * Show command prompt
   */
  private showPrompt(): void {
    this.rl.question('AIPure> ', (input) => {
      this.processCommand(input.trim());
    });
  }

  /**
   * Process user command
   */
  private async processCommand(input: string): Promise<void> {
    if (!input) {
      this.showPrompt();
      return;
    }

    const parts = input.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    try {
      switch (command) {
        case 'help':
        case 'h':
          this.showHelp();
          break;
        case 'policies':
        case 'p':
          this.showPolicies();
          break;
        case 'spirits':
        case 's':
          this.showSpirits();
          break;
        case 'moves':
        case 'm':
          this.showMoves();
          break;
        case 'battle':
        case 'b':
          await this.simulateBattle(args);
          break;
        case 'decide':
        case 'd':
          await this.showDecision(args);
          break;
        case 'policy':
          this.showPolicyDetails(args[0]);
          break;
        case 'compare':
        case 'c':
          this.comparePolicies(args[0], args[1]);
          break;
        case 'damage':
        case 'dmg':
          await this.calculateDamage(args);
          break;
        case 'heal':
          this.healSpirit(args[0], parseInt(args[1]) || 20);
          break;
        case 'hurt':
          this.damageSpirit(args[0], parseInt(args[1]) || 20);
          break;
        case 'status':
        case 'stat':
          this.showStatus();
          break;
        case 'exit':
        case 'quit':
        case 'q':
          this.exit();
          return;
        default:
          this.logger.info(`❌ Unknown command: ${command}`);
          this.logger.info('Type "help" for available commands.');
      }
    } catch (error) {
      this.logger.info(`❌ Error: ${error}`);
    }

    this.showPrompt();
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    this.logger.info('='.repeat(60));
    this.logger.info('📚 AIPure CLI Help');
    this.logger.info('='.repeat(60));
    this.logger.info('');
    this.logger.info('Commands:');
    this.logger.info('  help                    - Show this help');
    this.logger.info('  policies                - List all AI policies');
    this.logger.info('  spirits                 - List all available spirits');
    this.logger.info('  moves                   - List all available moves');
    this.logger.info('  battle [s1] [s2] [pol]  - Simulate battle between spirits');
    this.logger.info('  decide [s] [opp] [pol]  - Show AI decision for spirit');
    this.logger.info('  policy [id]             - Show detailed policy info');
    this.logger.info('  compare [p1] [p2]       - Compare two policies');
    this.logger.info('  damage [s1] [s2] [mov]  - Calculate damage from move');
    this.logger.info('  heal [spirit] [amount]  - Heal spirit (default: 20)');
    this.logger.info('  hurt [spirit] [amount]  - Damage spirit (default: 20)');
    this.logger.info('  status                  - Show system statistics');
    this.logger.info('  exit                    - Exit the application');
    this.logger.info('');
    this.logger.info('Examples:');
    this.logger.info('  battle fire_spirit water_spirit aggressive');
    this.logger.info('  decide fire_spirit water_spirit balanced');
    this.logger.info('  compare aggressive cautious');
    this.logger.info('  damage fire_spirit water_spirit fire_blast');
    this.logger.info('');
  }

  /**
   * Show all policies
   */
  private showPolicies(): void {
    this.logger.info('='.repeat(60));
    this.logger.info('📋 AI Policies');
    this.logger.info('='.repeat(60));

    const policies = this.aiManager.getAllPolicies();
    if (policies.length === 0) {
      this.logger.info('No policies registered.');
      return;
    }

    policies.forEach((policy, index) => {
      this.logger.info(`${index + 1}. ${this.getPolicyIcon(policy)} ${policy.getSummary()}`);
      this.logger.info(`   Behavior: ${AIUtils.getBehaviorDescription(policy)}`);
      if (policy.overrideRules.length > 0) {
        this.logger.info(`   Override Rules: ${policy.overrideRules.length}`);
      }
      this.logger.info('');
    });
  }

  /**
   * Show all spirits
   */
  private showSpirits(): void {
    this.logger.info('='.repeat(60));
    this.logger.info('👻 Available Spirits');
    this.logger.info('='.repeat(60));

    if (this.spirits.size === 0) {
      this.logger.info('No spirits available.');
      return;
    }

    Array.from(this.spirits.values()).forEach((spirit, index) => {
      const hpBar = this.createHealthBar(spirit.currentHP, spirit.maxHP);
      const syncInfo = spirit.syncLevel !== undefined ? ` | Sync: ${spirit.syncLevel}` : '';
      this.logger.info(`${index + 1}. ${spirit.name} [${spirit.typeTag}]`);
      this.logger.info(`   HP: ${spirit.currentHP}/${spirit.maxHP} ${hpBar}`);
      this.logger.info(`   ATK: ${spirit.getEffectiveAttack()} | DEF: ${spirit.getEffectiveDefense()}${syncInfo}`);
      this.logger.info('');
    });
  }

  /**
   * Show all moves
   */
  private showMoves(): void {
    this.logger.info('='.repeat(60));
    this.logger.info('⚔️ Available Moves');
    this.logger.info('='.repeat(60));

    if (this.moves.size === 0) {
      this.logger.info('No moves available.');
      return;
    }

    Array.from(this.moves.values()).forEach((move, index) => {
      const categoryIcon = this.getMoveCategoryIcon(move.category);
      this.logger.info(`${index + 1}. ${categoryIcon} ${move.name}`);
      this.logger.info(`   ID: ${move.moveId}`);
      this.logger.info(`   Power: ${move.power} | Accuracy: ${Math.round(move.accuracy * 100)}% | Cost: ${move.cost}`);
      this.logger.info(`   Type: ${move.typeTag}`);
      this.logger.info('');
    });
  }

  /**
   * Simulate battle between spirits
   */
  private async simulateBattle(args: string[]): Promise<void> {
    if (args.length < 2) {
      this.logger.info('❌ Usage: battle [spirit1] [spirit2] [policy]');
      return;
    }

    const spirit1Id = args[0];
    const spirit2Id = args[1];
    const policyId = args[2] || 'balanced';

    const spirit1 = this.spirits.get(spirit1Id);
    const spirit2 = this.spirits.get(spirit2Id);
    const policy = this.aiManager.getPolicy(policyId);

    if (!spirit1) {
      this.logger.info(`❌ Spirit not found: ${spirit1Id}`);
      return;
    }

    if (!spirit2) {
      this.logger.info(`❌ Spirit not found: ${spirit2Id}`);
      return;
    }

    if (!policy) {
      this.logger.info(`❌ Policy not found: ${policyId}`);
      return;
    }

    this.logger.info('='.repeat(60));
    this.logger.info(`⚔️ Battle: ${spirit1.name} vs ${spirit2.name}`);
    this.logger.info(`🤖 Policy: ${policy.getSummary()}`);
    this.logger.info('='.repeat(60));

    const ai = this.aiManager.getAI(policyId);
    const availableMoves = Array.from(this.moves.values());

    this.logger.info(`${spirit1.name}: ${spirit1.getCombatSummary()}`);
    this.logger.info(`${spirit2.name}: ${spirit2.getCombatSummary()}`);
    this.logger.info('');

    let turn = 1;
    while (spirit1.currentHP > 0 && spirit2.currentHP > 0) {
      this.logger.info(`📍 Turn ${turn}`);

      // Spirit 1 attacks
      const action1 = ai.selectAction(spirit1, spirit2, availableMoves, this.rng);
      const move1 = action1.moveId ? this.moves.get(action1.moveId) : null;

      if (move1 && spirit1.resourcePoints >= move1.cost) {
        const damageCalculator = new DamageCalculator(new TypeEffectiveness());
        this.rng.setNextFloat(1.0); // Max variance for demo
        this.rng.setNextBool(false); // No crit for demo

        const damageResult = damageCalculator.calculateDamage(move1, spirit1 as any, spirit2 as any);
        spirit2.currentHP -= damageResult.damage;
        spirit1.resourcePoints -= move1.cost;

        this.logger.info(`🔥 ${spirit1.name} uses ${move1.name} for ${damageResult.damage} damage!`);
      } else {
        this.logger.info(`💤 ${spirit1.name} cannot attack!`);
      }

      if (spirit2.currentHP <= 0) {
        this.logger.info(`💀 ${spirit2.name} fainted!`);
        this.logger.info(`🏆 ${spirit1.name} wins!`);
        break;
      }

      // Spirit 2 attacks (if still alive)
      const action2 = ai.selectAction(spirit2, spirit1, availableMoves, this.rng);
      const move2 = action2.moveId ? this.moves.get(action2.moveId) : null;

      if (move2 && spirit2.resourcePoints >= move2.cost) {
        const damageCalculator = new DamageCalculator(new TypeEffectiveness());
        this.rng.setNextFloat(1.0); // Max variance for demo
        this.rng.setNextBool(false); // No crit for demo

        const damageResult = damageCalculator.calculateDamage(move2, spirit2 as any, spirit1 as any);
        spirit1.currentHP -= damageResult.damage;
        spirit2.resourcePoints -= move2.cost;

        this.logger.info(`💥 ${spirit2.name} uses ${move2.name} for ${damageResult.damage} damage!`);
      } else {
        this.logger.info(`💤 ${spirit2.name} cannot attack!`);
      }

      if (spirit1.currentHP <= 0) {
        this.logger.info(`💀 ${spirit1.name} fainted!`);
        this.logger.info(`🏆 ${spirit2.name} wins!`);
        break;
      }

      this.logger.info(`${spirit1.name}: ${spirit1.getCombatSummary()}`);
      this.logger.info(`${spirit2.name}: ${spirit2.getCombatSummary()}`);
      this.logger.info('');

      turn++;
      if (turn > 20) {
        this.logger.info('🔄 Battle took too long, declaring draw!');
        break;
      }
    }

    // Reset spirits for next battle
    this.resetSpirits();
  }

  /**
   * Show AI decision making
   */
  private async showDecision(args: string[]): Promise<void> {
    if (args.length < 2) {
      this.logger.info('❌ Usage: decide [spirit] [opponent] [policy]');
      return;
    }

    const spiritId = args[0];
    const opponentId = args[1];
    const policyId = args[2] || 'balanced';

    const spirit = this.spirits.get(spiritId);
    const opponent = this.spirits.get(opponentId);
    const policy = this.aiManager.getPolicy(policyId);

    if (!spirit) {
      this.logger.info(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    if (!opponent) {
      this.logger.info(`❌ Opponent not found: ${opponentId}`);
      return;
    }

    if (!policy) {
      this.logger.info(`❌ Policy not found: ${policyId}`);
      return;
    }

    this.logger.info('='.repeat(60));
    this.logger.info(`🤔 AI Decision: ${spirit.name} vs ${opponent.name}`);
    this.logger.info(`🤖 Policy: ${policy.getSummary()}`);
    this.logger.info('='.repeat(60));

    const ai = this.aiManager.getAI(policyId);
    const availableMoves = Array.from(this.moves.values());

    this.logger.info(`${spirit.name}: ${spirit.getCombatSummary()}`);
    this.logger.info(`${opponent.name}: ${opponent.getCombatSummary()}`);
    this.logger.info('');

    this.logger.info('Available moves:');
    availableMoves.forEach(move => {
      const categoryIcon = this.getMoveCategoryIcon(move.category);
      const canAfford = spirit.resourcePoints >= move.cost ? '✅' : '❌';
      this.logger.info(`  ${categoryIcon} ${move.name} (${canAfford} Cost: ${move.cost})`);
    });
    this.logger.info('');

    const action = ai.selectAction(spirit, opponent, availableMoves, this.rng);
    const selectedMove = action.moveId ? this.moves.get(action.moveId) : null;

    if (selectedMove) {
      this.logger.info(`🎯 AI chooses: ${selectedMove.name}`);
      this.logger.info(`   Power: ${selectedMove.power} | Accuracy: ${Math.round(selectedMove.accuracy * 100)}%`);
      this.logger.info(`   Type: ${selectedMove.typeTag} vs ${opponent.typeTag}`);

      const typeEffectiveness = new TypeEffectiveness();
      const typeMultiplier = typeEffectiveness.getMultiplier(selectedMove.typeTag, opponent.typeTag);

      if (typeMultiplier > 1) {
        this.logger.info(`   ⚡ Super effective! (${typeMultiplier}x damage)`);
      } else if (typeMultiplier < 1) {
        this.logger.info(`   💧 Not very effective (${typeMultiplier}x damage)`);
      } else {
        this.logger.info(`   ⚖️ Normal effectiveness (${typeMultiplier}x damage)`);
      }

      const damageCalculator = new DamageCalculator(typeEffectiveness);
      const expectedDamage = damageCalculator.calculateExpectedDamage(selectedMove, spirit as any, opponent as any);
      this.logger.info(`   📊 Expected damage: ~${expectedDamage}`);
    } else {
      this.logger.info('🎯 AI chooses: Wait (no suitable move)');
    }
  }

  /**
   * Show policy details
   */
  private showPolicyDetails(policyId: string): void {
    if (!policyId) {
      this.logger.info('❌ Usage: policy [policy_id]');
      return;
    }

    const policy = this.aiManager.getPolicy(policyId);
    if (!policy) {
      this.logger.info(`❌ Policy not found: ${policyId}`);
      return;
    }

    this.logger.info('='.repeat(60));
    this.logger.info(`📋 Policy Details: ${policy.policyId}`);
    this.logger.info('='.repeat(60));

    this.logger.info(`Aggression: ${policy.aggression.toFixed(2)} ${this.getMeterBar(policy.aggression)}`);
    this.logger.info(`Caution: ${policy.caution.toFixed(2)} ${this.getMeterBar(policy.caution)}`);
    this.logger.info(`Efficiency: ${policy.efficiency.toFixed(2)} ${this.getMeterBar(policy.efficiency)}`);
    this.logger.info('');

    this.logger.info(`Behavior: ${AIUtils.getBehaviorDescription(policy)}`);
    this.logger.info('');

    if (policy.overrideRules.length > 0) {
      this.logger.info('Override Rules:');
      policy.overrideRules.forEach((rule, index) => {
        this.logger.info(`  ${index + 1}. ${rule}`);
      });
      this.logger.info('');
    }

    const errors = policy.validate();
    if (errors.length === 0) {
      this.logger.info('✅ Policy is valid');
    } else {
      this.logger.info('❌ Validation errors:');
      errors.forEach(error => this.logger.info(`   - ${error}`));
    }
  }

  /**
   * Compare two policies
   */
  private comparePolicies(policyId1: string, policyId2: string): void {
    if (!policyId1 || !policyId2) {
      this.logger.info('❌ Usage: compare [policy1] [policy2]');
      return;
    }

    const policy1 = this.aiManager.getPolicy(policyId1);
    const policy2 = this.aiManager.getPolicy(policyId2);

    if (!policy1) {
      this.logger.info(`❌ Policy 1 not found: ${policyId1}`);
      return;
    }

    if (!policy2) {
      this.logger.info(`❌ Policy 2 not found: ${policyId2}`);
      return;
    }

    this.logger.info('='.repeat(60));
    this.logger.info(`⚖️ Policy Comparison`);
    this.logger.info('='.repeat(60));

    this.logger.info(`${policyId1}: ${policy1.getSummary()}`);
    this.logger.info(`  ${AIUtils.getBehaviorDescription(policy1)}`);
    this.logger.info('');

    this.logger.info(`${policyId2}: ${policy2.getSummary()}`);
    this.logger.info(`  ${AIUtils.getBehaviorDescription(policy2)}`);
    this.logger.info('');

    const comparison = AIUtils.comparePolicies(policy1, policy2);

    this.logger.info('Differences:');
    this.logger.info(`  Attributes: ${comparison.attributeDifference.toFixed(3)}`);
    this.logger.info(`  Rules match: ${comparison.ruleMatch}`);
    this.logger.info(`  Total: ${comparison.totalDifference.toFixed(3)}`);
    this.logger.info('');

    if (comparison.totalDifference < 0.1) {
      this.logger.info('📊 Policies are very similar');
    } else if (comparison.totalDifference < 0.5) {
      this.logger.info('📊 Policies are somewhat similar');
    } else {
      this.logger.info('📊 Policies are quite different');
    }
  }

  /**
   * Calculate damage from move
   */
  private async calculateDamage(args: string[]): Promise<void> {
    if (args.length < 3) {
      this.logger.info('❌ Usage: damage [attacker] [defender] [move]');
      return;
    }

    const attackerId = args[0];
    const defenderId = args[1];
    const moveId = args[2];

    const attacker = this.spirits.get(attackerId);
    const defender = this.spirits.get(defenderId);
    const move = this.moves.get(moveId);

    if (!attacker) {
      this.logger.info(`❌ Attacker not found: ${attackerId}`);
      return;
    }

    if (!defender) {
      this.logger.info(`❌ Defender not found: ${defenderId}`);
      return;
    }

    if (!move) {
      this.logger.info(`❌ Move not found: ${moveId}`);
      return;
    }

    this.logger.info('='.repeat(60));
    this.logger.info(`💥 Damage Calculation`);
    this.logger.info('='.repeat(60));

    this.logger.info(`${attacker.name} uses ${move.name} on ${defender.name}`);
    this.logger.info(`Attacker: ${attacker.typeTag} | Defender: ${defender.typeTag}`);
    this.logger.info('');

    const typeEffectiveness = new TypeEffectiveness();
    const damageCalculator = new DamageCalculator(typeEffectiveness);

    // Calculate with different RNG values to show variance
    const rngValues = [0.85, 0.9, 0.95, 1.0];
    const results: number[] = [];

    for (const variance of rngValues) {
      this.rng.setNextFloat(variance);
      this.rng.setNextBool(false); // No crit for this demo

      const damageResult = damageCalculator.calculateDamage(move, attacker as any, defender as any);
      results.push(damageResult.damage);
    }

    this.logger.info('Damage Results:');
    results.forEach((damage, index) => {
      const variance = rngValues[index];
      this.logger.info(`  ${variance.toFixed(2)} variance: ${damage} damage`);
    });

    this.logger.info('');
    this.logger.info(`Average: ${Math.round(results.reduce((a, b) => a + b) / results.length)}`);
    this.logger.info(`Min: ${Math.min(...results)} | Max: ${Math.max(...results)}`);

    const typeMultiplier = typeEffectiveness.getMultiplier(move.typeTag, defender.typeTag);
    if (typeMultiplier !== 1.0) {
      this.logger.info(`Type effectiveness: ${typeMultiplier}x`);
    }
  }

  /**
   * Heal spirit
   */
  private healSpirit(spiritId: string, amount: number): void {
    const spirit = this.spirits.get(spiritId);
    if (!spirit) {
      this.logger.info(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    const oldHP = spirit.currentHP;
    spirit.heal(amount);

    this.logger.info(`❤️ Healed ${spirit.name} by ${amount} HP`);
    this.logger.info(`📊 HP: ${oldHP} → ${spirit.currentHP}/${spirit.maxHP}`);
  }

  /**
   * Damage spirit
   */
  private damageSpirit(spiritId: string, amount: number): void {
    const spirit = this.spirits.get(spiritId);
    if (!spirit) {
      this.logger.info(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    const oldHP = spirit.currentHP;
    spirit.takeDamage(amount);

    this.logger.info(`💔 Damaged ${spirit.name} by ${amount} HP`);
    this.logger.info(`📊 HP: ${oldHP} → ${spirit.currentHP}/${spirit.maxHP}`);

    if (spirit.currentHP <= 0) {
      this.logger.info(`💀 ${spirit.name} fainted!`);
    }
  }

  /**
   * Show system status
   */
  private showStatus(): void {
    const policies = this.aiManager.getAllPolicies();

    this.logger.info('='.repeat(60));
    this.logger.info('📊 System Status');
    this.logger.info('='.repeat(60));

    this.logger.info(`Policies: ${policies.length}`);
    this.logger.info(`Spirits: ${this.spirits.size}`);
    this.logger.info(`Moves: ${this.moves.size}`);
    this.logger.info('');

    this.logger.info('Policies:');
    policies.forEach(policy => {
      this.logger.info(`  ${this.getPolicyIcon(policy)} ${policy.policyId}`);
    });
    this.logger.info('');

    this.logger.info('Active Spirits:');
    Array.from(this.spirits.values()).forEach(spirit => {
      this.logger.info(`  ${spirit.getCombatSummary()}`);
    });
  }

  /**
   * Get icon for policy
   */
  private getPolicyIcon(policy: AIPolicy): string {
    if (policy.isAggressive) return '🔥';
    if (policy.isCautious) return '🛡️';
    if (policy.isEfficient) return '⚡';
    return '⚖️';
  }

  /**
   * Get icon for move category
   */
  private getMoveCategoryIcon(category: MoveCategory): string {
    switch (category) {
      case MoveCategory.PHYSICAL: return '⚔️';
      case MoveCategory.SPECIAL: return '🔮';
      case MoveCategory.STATUS: return '💊';
      default: return '❓';
    }
  }

  /**
   * Create meter bar for values
   */
  private getMeterBar(value: number): string {
    const barLength = 10;
    const filledLength = Math.round(value * barLength / 2); // Scale to 0-2 range
    const emptyLength = barLength - filledLength;
    const filled = '█'.repeat(filledLength);
    const empty = '░'.repeat(emptyLength);
    return `[${filled}${empty}]`;
  }

  /**
   * Create health bar string
   */
  private createHealthBar(current: number, max: number): string {
    const barLength = 10;
    const filledLength = Math.round((current / max) * barLength);
    const emptyLength = barLength - filledLength;
    const filled = '█'.repeat(filledLength);
    const empty = '░'.repeat(emptyLength);
    return `[${filled}${empty}]`;
  }

  /**
   * Reset spirits to full health
   */
  private resetSpirits(): void {
    this.spirits.forEach(spirit => {
      spirit.currentHP = spirit.maxHP;
    });
  }

  /**
   * Exit application
   */
  private exit(): void {
    this.logger.info('');
    this.logger.info('👋 Thank you for using AIPure CLI!');
    this.rl.close();
    process.exit(0);
  }
}

// Start CLI if run directly
if (require.main === module) {
  const cli = new AIPureCLI();
  cli.start();
}

export { AIPureCLI };