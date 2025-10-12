#!/usr/bin/env node

/**
 * BattleAIPure CLI Harness
 *
 * Interactive command-line interface for testing and demonstrating
 * the BattleAIPure battle AI management system.
 */

// Check for help command
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  this.logger.info(`
BattleAIPure CLI Harness - Battle AI Management System

Usage: npx tsx miff/pure/BattleAIPure/cliHarness.ts [command] [options]

Commands:
  test                     - Run basic battle AI tests
  create-profile <name>    - Create new AI decision profile
  create-controller <name> - Create new battle AI controller
  list-profiles            - List all AI decision profiles
  list-controllers          - List all battle AI controllers
  simulate-battle          - Simulate AI battle decision making
  help                     - Show this help

Examples:
  npx tsx miff/pure/BattleAIPure/cliHarness.ts test
  npx tsx miff/pure/BattleAIPure/cliHarness.ts create-profile "defensive"
  npx tsx miff/pure/BattleAIPure/cliHarness.ts simulate-battle
`);
  process.exit(0);
}

import * as readline from 'readline';
import {
  AIControllerManager,
  AIDecisionProfile,
  BattleAIController,
  BattleAIUtils,
  AIDecisionStyle,
  ThreatLevel,
  MoveCategory,
  ISpiritInstance,
  IMoveData,
  IAIDecisionProfile
} from './index';
import { Spirit } from '../SpiritsPure/index';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

// Real Spirit Instance for CLI - using actual Spirit class
class CLISpiritInstance extends Spirit implements ISpiritInstance {
  public id: string;
  public name: string;
  public level: number;
  public typeTag: string;
  public maxHP: number;
  public currentHP: number;
  public attack: number;
  public defense: number;
  public specialAttack: number;
  public specialDefense: number;
  public speed: number;
  public statusEffects: string[];
  public knownMoves: string[];

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
    speed: number = 35
  ) {
    this.logger = new StructuredLogger({ module: 'class' });
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
    this.speed = speed;
    this.statusEffects = [];
    this.knownMoves = [];
  }

  isFainted(): boolean {
    return this.currentHP <= 0;
  }

  getEffectiveStats(): {
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  } {
    return {
      attack: this.attack,
      defense: this.defense,
      specialAttack: this.specialAttack,
      specialDefense: this.specialDefense,
      speed: this.speed
    };
  }

  takeDamage(amount: number): void {
    this.currentHP = Math.max(0, this.currentHP - amount);
  }

  heal(amount: number): void {
    this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
  }

  addStatusEffect(effect: string): void {
    if (!this.statusEffects.includes(effect)) {
      this.statusEffects.push(effect);
    }
  }

  removeStatusEffect(effect: string): void {
    this.statusEffects = this.statusEffects.filter(s => s !== effect);
  }

  addMove(moveId: string): void {
    if (!this.knownMoves.includes(moveId)) {
      this.knownMoves.push(moveId);
    }
  }

  getCombatSummary(): string {
    const hpBar = this.createHealthBar();
    const statusInfo = this.statusEffects.length > 0 ? ` [${this.statusEffects.join(', ')}]` : '';
    return `${this.name} (${this.typeTag}) HP: ${this.currentHP}/${this.maxHP} ${hpBar}${statusInfo}`;
  }

  private createHealthBar(): string {
    const barLength = 10;
    const filledLength = Math.round((this.currentHP / this.maxHP) * barLength);
    const emptyLength = barLength - filledLength;
    const filled = '█'.repeat(filledLength);
    const empty = '░'.repeat(emptyLength);
    return `[${filled}${empty}]`;
  }
}

// Real Move Data for CLI - using actual move system
class CLIMoveData implements IMoveData {
  public moveId: string;
  public name: string;
  public category: MoveCategory;
  public power: number;
  public accuracy: number;
  public cost: number;
  public typeTag: string;
  public priority: number;
  public effects: string[];

  constructor(
    moveId: string,
    name: string,
    category: MoveCategory = MoveCategory.DAMAGE,
    power: number = 40,
    accuracy: number = 0.95,
    cost: number = 5,
    typeTag: string = 'neutral',
    priority: number = 0,
    effects: string[] = []
  ) {
    this.moveId = moveId;
    this.name = name;
    this.category = category;
    this.power = power;
    this.accuracy = accuracy;
    this.cost = cost;
    this.typeTag = typeTag;
    this.priority = priority;
    this.effects = [...effects];
  }
}

// CLI Application
class BattleAIPureCLI {
  private rl: readline.Interface;
  private aiManager: AIControllerManager;
  private spirits: Map<string, MockSpiritInstance>;
  private moves: Map<string, MockMoveData>;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.aiManager = new AIControllerManager();
    this.spirits = new Map();
    this.moves = new Map();

    this.initializeData();
  }

  /**
   * Initialize test data
   */
  private initializeData(): void {
    // Create standard AI profiles
    this.aiManager.createStandardProfiles();

    // Create test spirits using real Spirit class
    this.spirits.set('fire_spirit', new CLISpiritInstance({
      id: 'fire_spirit',
      name: 'Fire Spirit',
      species: 'Fire Spirit',
      type: ['fire'],
      level: 15,
      stats: { hp: 120, attack: 60, defense: 35, specialAttack: 70, specialDefense: 40, speed: 40 },
      moves: ['ember', 'flame_burst', 'fire_spin'],
      experience: 1500,
      syncLevel: 75
    }));

    this.spirits.set('water_spirit', new CLISpiritInstance({
      id: 'water_spirit',
      name: 'Water Spirit',
      species: 'Water Spirit',
      type: ['water'],
      level: 15,
      stats: { hp: 110, attack: 45, defense: 50, specialAttack: 65, specialDefense: 55, speed: 35 },
      moves: ['water_gun', 'bubble_beam', 'aqua_ring'],
      experience: 1500,
      syncLevel: 75
    }));

    this.spirits.set('nature_spirit', new CLISpiritInstance({
      id: 'nature_spirit',
      name: 'Nature Spirit',
      species: 'Nature Spirit',
      type: ['grass'],
      level: 15,
      stats: { hp: 130, attack: 50, defense: 45, specialAttack: 55, specialDefense: 50, speed: 30 },
      moves: ['vine_whip', 'leaf_storm', 'synthesis'],
      experience: 1500,
      syncLevel: 75
    }));

    this.spirits.set('electric_spirit', new CLISpiritInstance({
      id: 'electric_spirit',
      name: 'Electric Spirit',
      species: 'Electric Spirit',
      type: ['electric'],
      level: 15,
      stats: { hp: 100, attack: 55, defense: 40, specialAttack: 75, specialDefense: 45, speed: 45 },
      moves: ['thunder_shock', 'spark', 'thunder_wave'],
      experience: 1500,
      syncLevel: 75
    }));

    // Create test moves using real move data
    const moves = [
      new CLIMoveData('fire_blast', 'Fire Blast', MoveCategory.DAMAGE, 60, 0.9, 8, 'fire'),
      new CLIMoveData('water_burst', 'Water Burst', MoveCategory.DAMAGE, 55, 0.95, 6, 'water'),
      new CLIMoveData('basic_strike', 'Basic Strike', MoveCategory.DAMAGE, 40, 1.0, 0, 'neutral'),
      new CLIMoveData('heal', 'Heal', MoveCategory.HEALING, 0, 1.0, 5, 'neutral'),
      new CLIMoveData('protect', 'Protect', MoveCategory.SUPPORT, 0, 1.0, 3, 'neutral'),
      new CLIMoveData('thunder_bolt', 'Thunder Bolt', MoveCategory.DAMAGE, 65, 0.85, 10, 'electric'),
      new CLIMoveData('solar_beam', 'Solar Beam', MoveCategory.DAMAGE, 80, 0.8, 12, 'nature'),
      new CLIMoveData('rest', 'Rest', MoveCategory.HEALING, 0, 1.0, 0, 'neutral'),
      new CLIMoveData('agility', 'Agility', MoveCategory.UTILITY, 0, 1.0, 4, 'neutral'),
      new CLIMoveData('toxic', 'Toxic', MoveCategory.STATUS, 0, 0.85, 6, 'poison')
    ];

    moves.forEach(move => {
      this.moves.set(move.moveId, move);
    });

    // Assign moves to spirits
    this.assignMovesToSpirits();
  }

  /**
   * Assign moves to spirits
   */
  private assignMovesToSpirits(): void {
    const moveSets: Record<string, string[]> = {
      'fire_spirit': ['fire_blast', 'basic_strike', 'heal', 'protect'],
      'water_spirit': ['water_burst', 'basic_strike', 'heal', 'agility'],
      'nature_spirit': ['solar_beam', 'basic_strike', 'heal', 'rest'],
      'electric_spirit': ['thunder_bolt', 'basic_strike', 'protect', 'toxic']
    };

    Object.entries(moveSets).forEach(([spiritId, moveIds]) => {
      const spirit = this.spirits.get(spiritId);
      if (spirit) {
        spirit.knownMoves = moveIds;
      }
    });
  }

  /**
   * Start CLI application
   */
  start(): void {
    this.logger.info('='.repeat(60));
    this.logger.info('🤖 BattleAIPure CLI - Battle AI Management System');
    this.logger.info('='.repeat(60));
    this.logger.info('');
    this.logger.info('Available commands:');
    this.logger.info('  profiles          - Show all AI profiles');
    this.logger.info('  spirits           - Show all spirits');
    this.logger.info('  moves             - Show all moves');
    this.logger.info('  decide [spirit] [opponent] [profile] - Show AI decision');
    this.logger.info('  battle [spirit1] [spirit2] [profile] - Simulate battle');
    this.logger.info('  threat [spirit] [opponent] - Evaluate threat level');
    this.logger.info('  profile [id]      - Show profile details');
    this.logger.info('  compare [profile1] [profile2] - Compare profiles');
    this.logger.info('  heal [spirit] [amount] - Heal spirit');
    this.logger.info('  damage [spirit] [amount] - Damage spirit');
    this.logger.info('  status [spirit]   - Show spirit status');
    this.logger.info('  help              - Show this help');
    this.logger.info('  exit              - Exit application');
    this.logger.info('');

    this.showPrompt();
  }

  /**
   * Show command prompt
   */
  private showPrompt(): void {
    this.rl.question('BattleAIPure> ', (input) => {
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
        case 'profiles':
        case 'p':
          this.showProfiles();
          break;
        case 'spirits':
        case 's':
          this.showSpirits();
          break;
        case 'moves':
        case 'm':
          this.showMoves();
          break;
        case 'decide':
        case 'd':
          await this.showDecision(args);
          break;
        case 'battle':
        case 'b':
          await this.simulateBattle(args);
          break;
        case 'threat':
        case 't':
          this.showThreatLevel(args);
          break;
        case 'profile':
          this.showProfileDetails(args[0]);
          break;
        case 'compare':
        case 'c':
          this.compareProfiles(args[0], args[1]);
          break;
        case 'heal':
          this.healSpirit(args[0], parseInt(args[1]) || 20);
          break;
        case 'damage':
        case 'dmg':
          this.damageSpirit(args[0], parseInt(args[1]) || 20);
          break;
        case 'status':
          this.showSpiritStatus(args[0]);
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
    this.logger.info('📚 BattleAIPure CLI Help');
    this.logger.info('='.repeat(60));
    this.logger.info('');
    this.logger.info('Commands:');
    this.logger.info('  help                    - Show this help');
    this.logger.info('  profiles                - List all AI profiles');
    this.logger.info('  spirits                 - List all available spirits');
    this.logger.info('  moves                   - List all available moves');
    this.logger.info('  decide [s] [opp] [prof] - Show AI decision for spirit');
    this.logger.info('  battle [s1] [s2] [prof] - Simulate battle between spirits');
    this.logger.info('  threat [s] [opp]        - Evaluate threat level of opponent');
    this.logger.info('  profile [id]            - Show detailed profile info');
    this.logger.info('  compare [p1] [p2]       - Compare two profiles');
    this.logger.info('  heal [spirit] [amount]  - Heal spirit (default: 20)');
    this.logger.info('  damage [spirit] [amount]- Damage spirit (default: 20)');
    this.logger.info('  status [spirit]         - Show detailed spirit status');
    this.logger.info('  exit                    - Exit the application');
    this.logger.info('');
    this.logger.info('Examples:');
    this.logger.info('  decide fire_spirit water_spirit aggressive');
    this.logger.info('  battle fire_spirit water_spirit balanced');
    this.logger.info('  threat water_spirit fire_spirit');
    this.logger.info('  compare aggressive defensive');
    this.logger.info('');
  }

  /**
   * Show all profiles
   */
  private showProfiles(): void {
    this.logger.info('='.repeat(60));
    this.logger.info('📋 AI Profiles');
    this.logger.info('='.repeat(60));

    const profiles = this.aiManager.getAllProfiles();
    if (profiles.length === 0) {
      this.logger.info('No profiles registered.');
      return;
    }

    profiles.forEach((profile, index) => {
      this.logger.info(`${index + 1}. ${this.getProfileIcon(profile)} ${profile.getSummary()}`);
      this.logger.info(`   ${BattleAIUtils.getBehaviorDescription(profile)}`);
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
      this.logger.info(`${index + 1}. ${spirit.getCombatSummary()}`);
      if (spirit.knownMoves.length > 0) {
        this.logger.info(`   Moves: ${spirit.knownMoves.join(', ')}`);
      }
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
      this.logger.info(`   ID: ${move.moveId} | Power: ${move.power} | Accuracy: ${Math.round(move.accuracy * 100)}%`);
      this.logger.info(`   Cost: ${move.cost} | Type: ${move.typeTag}`);
      this.logger.info('');
    });
  }

  /**
   * Show AI decision making
   */
  private async showDecision(args: string[]): Promise<void> {
    if (args.length < 2) {
      this.logger.info('❌ Usage: decide [spirit] [opponent] [profile]');
      return;
    }

    const spiritId = args[0];
    const opponentId = args[1];
    const profileId = args[2] || 'balanced';

    const spirit = this.spirits.get(spiritId);
    const opponent = this.spirits.get(opponentId);
    const profile = this.aiManager.getProfile(profileId);

    if (!spirit) {
      this.logger.info(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    if (!opponent) {
      this.logger.info(`❌ Opponent not found: ${opponentId}`);
      return;
    }

    if (!profile) {
      this.logger.info(`❌ Profile not found: ${profileId}`);
      return;
    }

    this.logger.info('='.repeat(60));
    this.logger.info(`🤔 AI Decision: ${spirit.name} vs ${opponent.name}`);
    this.logger.info(`🤖 Profile: ${profile.getSummary()}`);
    this.logger.info('='.repeat(60));

    this.logger.info(`${spirit.name}: ${spirit.getCombatSummary()}`);
    this.logger.info(`${opponent.name}: ${opponent.getCombatSummary()}`);
    this.logger.info('');

    const ai = this.aiManager.getAIController(profileId);

    this.logger.info('Available moves:');
    spirit.knownMoves.forEach(moveId => {
      const move = this.moves.get(moveId);
      if (move) {
        const categoryIcon = this.getMoveCategoryIcon(move.category);
        this.logger.info(`  ${categoryIcon} ${move.name} (${move.power} power, ${move.accuracy * 100}% acc)`);
      }
    });
    this.logger.info('');

    const selectedMove = ai.selectMove(spirit, opponent);

    if (selectedMove) {
      const move = this.moves.get(selectedMove);
      if (move) {
        this.logger.info(`🎯 AI chooses: ${move.name}`);
        this.logger.info(`   Category: ${move.category} | Power: ${move.power} | Accuracy: ${Math.round(move.accuracy * 100)}%`);
        this.logger.info(`   Cost: ${move.cost} | Type: ${move.typeTag} vs ${opponent.typeTag}`);

        const threatLevel = ai.evaluateThreatLevel(opponent);
        this.logger.info(`   Threat Level: ${threatLevel.toFixed(2)} (${BattleAIUtils.getThreatLevelDescription(threatLevel)})`);
      } else {
        this.logger.info(`🎯 AI chooses: ${selectedMove} (move not found)`);
      }
    } else {
      this.logger.info('🎯 AI chooses: No suitable move found');
    }
  }

  /**
   * Simulate battle between spirits
   */
  private async simulateBattle(args: string[]): Promise<void> {
    if (args.length < 2) {
      this.logger.info('❌ Usage: battle [spirit1] [spirit2] [profile]');
      return;
    }

    const spirit1Id = args[0];
    const spirit2Id = args[1];
    const profileId = args[2] || 'balanced';

    const spirit1 = this.spirits.get(spirit1Id);
    const spirit2 = this.spirits.get(spirit2Id);
    const profile = this.aiManager.getProfile(profileId);

    if (!spirit1) {
      this.logger.info(`❌ Spirit not found: ${spirit1Id}`);
      return;
    }

    if (!spirit2) {
      this.logger.info(`❌ Spirit not found: ${spirit2Id}`);
      return;
    }

    if (!profile) {
      this.logger.info(`❌ Profile not found: ${profileId}`);
      return;
    }

    this.logger.info('='.repeat(60));
    this.logger.info(`⚔️ Battle: ${spirit1.name} vs ${spirit2.name}`);
    this.logger.info(`🤖 Profile: ${profile.getSummary()}`);
    this.logger.info('='.repeat(60));

    const ai1 = this.aiManager.getAIController(profileId);
    const ai2 = this.aiManager.getAIController(profileId);

    this.logger.info(`${spirit1.name}: ${spirit1.getCombatSummary()}`);
    this.logger.info(`${spirit2.name}: ${spirit2.getCombatSummary()}`);
    this.logger.info('');

    let turn = 1;
    const maxTurns = 20;

    while (!spirit1.isFainted() && !spirit2.isFainted() && turn <= maxTurns) {
      this.logger.info(`📍 Turn ${turn}`);

      // Spirit 1 attacks
      const action1 = ai1.selectMove(spirit1, spirit2);
      if (action1) {
        this.logger.info(`🔥 ${spirit1.name} chooses ${action1}`);
      } else {
        this.logger.info(`💤 ${spirit1.name} cannot move!`);
      }

      // Spirit 2 attacks
      const action2 = ai2.selectMove(spirit2, spirit1);
      if (action2) {
        this.logger.info(`💥 ${spirit2.name} chooses ${action2}`);
      } else {
        this.logger.info(`💤 ${spirit2.name} cannot move!`);
      }

      this.logger.info(`${spirit1.name}: ${spirit1.getCombatSummary()}`);
      this.logger.info(`${spirit2.name}: ${spirit2.getCombatSummary()}`);
      this.logger.info('');

      turn++;
      if (turn > maxTurns) {
        this.logger.info('🔄 Battle took too long, declaring draw!');
        break;
      }
    }

    if (spirit1.isFainted()) {
      this.logger.info(`💀 ${spirit1.name} fainted!`);
      this.logger.info(`🏆 ${spirit2.name} wins!`);
    } else if (spirit2.isFainted()) {
      this.logger.info(`💀 ${spirit2.name} fainted!`);
      this.logger.info(`🏆 ${spirit1.name} wins!`);
    }

    // Reset spirits for next battle
    this.resetSpirits();
  }

  /**
   * Show threat level evaluation
   */
  private showThreatLevel(args: string[]): void {
    if (args.length < 2) {
      this.logger.info('❌ Usage: threat [spirit] [opponent]');
      return;
    }

    const spiritId = args[0];
    const opponentId = args[1];

    const spirit = this.spirits.get(spiritId);
    const opponent = this.spirits.get(opponentId);

    if (!spirit) {
      this.logger.info(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    if (!opponent) {
      this.logger.info(`❌ Opponent not found: ${opponentId}`);
      return;
    }

    this.logger.info('='.repeat(60));
    this.logger.info(`🎯 Threat Assessment: ${spirit.name} vs ${opponent.name}`);
    this.logger.info('='.repeat(60));

    const ai = this.aiManager.getAIController('balanced');
    const threatLevel = ai.evaluateThreatLevel(opponent);

    this.logger.info(`${spirit.name}: ${spirit.getCombatSummary()}`);
    this.logger.info(`${opponent.name}: ${opponent.getCombatSummary()}`);
    this.logger.info('');

    this.logger.info(`Threat Level: ${threatLevel.toFixed(3)}`);
    this.logger.info(`Threat Assessment: ${BattleAIUtils.getThreatLevelDescription(threatLevel)}`);
    this.logger.info('');

    this.logger.info('Threat Factors:');
    this.logger.info(`  Opponent HP Ratio: ${(opponent.currentHP / opponent.maxHP).toFixed(3)}`);
    this.logger.info(`  Level Difference: ${opponent.level - spirit.level}`);
    this.logger.info(`  Status Effects: ${opponent.statusEffects.length}`);
  }

  /**
   * Show profile details
   */
  private showProfileDetails(profileId: string): void {
    if (!profileId) {
      this.logger.info('❌ Usage: profile [profile_id]');
      return;
    }

    const profile = this.aiManager.getProfile(profileId);
    if (!profile) {
      this.logger.info(`❌ Profile not found: ${profileId}`);
      return;
    }

    this.logger.info('='.repeat(60));
    this.logger.info(`📋 Profile Details: ${profile.profileID}`);
    this.logger.info('='.repeat(60));

    this.logger.info(`Style: ${profile.style} - ${profile.getStyleDescription()}`);
    this.logger.info('');

    this.logger.info('Move Priority Weights:');
    Object.entries(profile.movePriorityWeights).forEach(([category, weight]) => {
      const bar = this.getWeightBar(weight);
      this.logger.info(`  ${category}: ${weight.toFixed(2)} ${bar}`);
    });
    this.logger.info('');

    if (profile.preferredTypes.length > 0) {
      this.logger.info(`Preferred Types: ${profile.preferredTypes.join(', ')}`);
      this.logger.info('');
    }

    const errors = profile.validate();
    if (errors.length === 0) {
      this.logger.info('✅ Profile is valid');
    } else {
      this.logger.info('❌ Validation errors:');
      errors.forEach(error => this.logger.info(`   - ${error}`));
    }
  }

  /**
   * Compare two profiles
   */
  private compareProfiles(profileId1: string, profileId2: string): void {
    if (!profileId1 || !profileId2) {
      this.logger.info('❌ Usage: compare [profile1] [profile2]');
      return;
    }

    const profile1 = this.aiManager.getProfile(profileId1);
    const profile2 = this.aiManager.getProfile(profileId2);

    if (!profile1) {
      this.logger.info(`❌ Profile 1 not found: ${profileId1}`);
      return;
    }

    if (!profile2) {
      this.logger.info(`❌ Profile 2 not found: ${profileId2}`);
      return;
    }

    this.logger.info('='.repeat(60));
    this.logger.info(`⚖️ Profile Comparison`);
    this.logger.info('='.repeat(60));

    this.logger.info(`${profileId1}: ${profile1.getSummary()}`);
    this.logger.info(`  ${BattleAIUtils.getBehaviorDescription(profile1)}`);
    this.logger.info('');

    this.logger.info(`${profileId2}: ${profile2.getSummary()}`);
    this.logger.info(`  ${BattleAIUtils.getBehaviorDescription(profile2)}`);
    this.logger.info('');

    const comparison = BattleAIUtils.compareProfiles(profile1, profile2);

    this.logger.info('Comparison Results:');
    this.logger.info(`  Style Match: ${comparison.styleMatch ? '✅' : '❌'}`);
    this.logger.info(`  Weight Difference: ${comparison.weightDifference.toFixed(3)}`);
    this.logger.info(`  Type Preferences Match: ${comparison.typePreferencesMatch ? '✅' : '❌'}`);
    this.logger.info(`  Total Difference: ${comparison.totalDifference.toFixed(3)}`);
    this.logger.info('');

    if (comparison.totalDifference < 0.1) {
      this.logger.info('📊 Profiles are identical');
    } else if (comparison.totalDifference < 1.0) {
      this.logger.info('📊 Profiles are very similar');
    } else if (comparison.totalDifference < 2.0) {
      this.logger.info('📊 Profiles are somewhat similar');
    } else {
      this.logger.info('📊 Profiles are quite different');
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

    if (spirit.isFainted()) {
      this.logger.info(`💀 ${spirit.name} fainted!`);
    }
  }

  /**
   * Show detailed spirit status
   */
  private showSpiritStatus(spiritId: string): void {
    if (!spiritId) {
      this.logger.info('❌ Usage: status [spirit_id]');
      return;
    }

    const spirit = this.spirits.get(spiritId);
    if (!spirit) {
      this.logger.info(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    this.logger.info('='.repeat(60));
    this.logger.info(`📊 Spirit Status: ${spirit.name}`);
    this.logger.info('='.repeat(60));

    this.logger.info(`ID: ${spirit.id}`);
    this.logger.info(`Type: ${spirit.typeTag}`);
    this.logger.info(`Level: ${spirit.level}`);
    this.logger.info(`HP: ${spirit.currentHP}/${spirit.maxHP}`);
    this.logger.info(`Stats: ATK ${spirit.attack} | DEF ${spirit.defense} | SP.ATK ${spirit.specialAttack} | SP.DEF ${spirit.specialDefense} | SPD ${spirit.speed}`);
    this.logger.info(`Status Effects: ${spirit.statusEffects.length > 0 ? spirit.statusEffects.join(', ') : 'None'}`);
    this.logger.info(`Known Moves: ${spirit.knownMoves.length > 0 ? spirit.knownMoves.join(', ') : 'None'}`);

    if (spirit.isFainted()) {
      this.logger.info('Status: 💀 Fainted');
    } else {
      const hpRatio = spirit.currentHP / spirit.maxHP;
      if (hpRatio > 0.8) this.logger.info('Status: ✅ Healthy');
      else if (hpRatio > 0.5) this.logger.info('Status: ⚠️ Wounded');
      else if (hpRatio > 0.2) this.logger.info('Status: 🚨 Critical');
      else this.logger.info('Status: 💀 Near Death');
    }
  }

  /**
   * Get icon for profile
   */
  private getProfileIcon(profile: IAIDecisionProfile): string {
    switch (profile.style) {
      case AIDecisionStyle.AGGRESSIVE: return '🔥';
      case AIDecisionStyle.DEFENSIVE: return '🛡️';
      case AIDecisionStyle.BALANCED: return '⚖️';
      case AIDecisionStyle.TRICKSTER: return '🎭';
      default: return '❓';
    }
  }

  /**
   * Get icon for move category
   */
  private getMoveCategoryIcon(category: MoveCategory): string {
    switch (category) {
      case MoveCategory.DAMAGE: return '⚔️';
      case MoveCategory.HEALING: return '❤️';
      case MoveCategory.SUPPORT: return '🛡️';
      case MoveCategory.STATUS: return '💊';
      case MoveCategory.UTILITY: return '🔧';
      default: return '❓';
    }
  }

  /**
   * Create weight bar for values
   */
  private getWeightBar(value: number): string {
    const barLength = 10;
    const filledLength = Math.round(value * barLength);
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
      spirit.statusEffects = [];
    });
  }

  /**
   * Exit application
   */
  private exit(): void {
    this.logger.info('');
    this.logger.info('👋 Thank you for using BattleAIPure CLI!');
    this.rl.close();
    process.exit(0);
  }
}

// Start CLI if run directly
if (require.main === module) {
  const cli = new BattleAIPureCLI();
  cli.start();
}

export { BattleAIPureCLI };