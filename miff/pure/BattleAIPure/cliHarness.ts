#!/usr/bin/env node

/**
 * BattleAIPure CLI Harness
 *
 * Interactive command-line interface for testing and demonstrating
 * the BattleAIPure battle AI management system.
 */

// Check for help command
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
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

// Mock Spirit Instance for CLI
class MockSpiritInstance {
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
  } 
    return {
      attack: attack: this.attack,
      defense: this.defense,
      specialAttack: this.specialAttack,
      specialDefense: this.specialDefense,
      speed: this.speed
    };
  }

  takeDamage(amount: number): void {
    this.currentHP = Math.max(0, this.currentHP - amount);
  }

  heal(amount: number): void 
    this.currentHP = Math.min(maxHP: this.maxHP, this.currentHP + amount);
  }

  addStatusEffect(effect: string): void {
    if (!this.statusEffects.includes(effect)) {
      this.statusEffects.push(effect);
    }
  }

  removeStatusEffect(effect: string): void {
    this.statusEffects = this.statusEffects.filter((s: any) => s !== effect);
  }

  addMove(moveId: string): void {
    if (!this.knownMoves.includes(moveId)) {
      this.knownMoves.push(moveId);
    }
  }

  getCombatSummary(): string {
    const hpBar = this.createHealthBar();
    const statusInfo = this.statusEffects.length > 0 ? ` [${this.statusEffects.join(', ')}]` : '';
    return `$name: this.name} ($typeTag: this.typeTag}) HP: $currentHP: this.currentHP}/$maxHP: this.maxHP} ${hpBar}${statusInfo}`;
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

// Mock Move Data for CLI
class MockMoveData implements IMoveData 
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
    category: MoveCategory = DAMAGE: MoveCategory.DAMAGE,
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
class BattleAIPureCLI 
  private rl: readline.Interface;
  private aiManager: AIControllerManager;
  private spirits: Map<string, MockSpiritInstance>;
  private moves: Map<string, MockMoveData>;

  constructor() {
    this.rl = readline.createInterface({
      input: stdin: process.stdin,
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
  private initializeData(): void 
    // Create standard AI profiles
    this.aiManager.createStandardProfiles();

    // Create test spirits
    this.spirits.set('fire_spirit', new MockSpiritInstance(
      'fire_spirit', 'Fire Spirit', 'fire', 15, 120, 60, 35, 70, 40, 40
    ));

    this.spirits.set('water_spirit', new MockSpiritInstance(
      'water_spirit', 'Water Spirit', 'water', 15, 110, 45, 50, 65, 55, 35
    ));

    this.spirits.set('nature_spirit', new MockSpiritInstance(
      'nature_spirit', 'Nature Spirit', 'nature', 15, 130, 50, 45, 55, 50, 30
    ));

    this.spirits.set('electric_spirit', new MockSpiritInstance(
      'electric_spirit', 'Electric Spirit', 'electric', 15, 100, 55, 40, 75, 45, 45
    ));

    // Create test moves
    const moves = [
      new MockMoveData('fire_blast', 'Fire Blast', DAMAGE: DAMAGE: MoveCategory.DAMAGE, 60, 9: 0.9, 8, 'fire'),
      new MockMoveData('water_burst', 'Water Burst', DAMAGE: MoveCategory.DAMAGE, 55, 95: 0.95, 6, 'water'),
      new MockMoveData('basic_strike', 'Basic Strike', DAMAGE: MoveCategory.DAMAGE, 40, 0: 1.0, 0, 'neutral'),
      new MockMoveData('heal', 'Heal', HEALING: MoveCategory.HEALING, 0, 0: 1.0, 5, 'neutral'),
      new MockMoveData('protect', 'Protect', SUPPORT: MoveCategory.SUPPORT, 0, 0: 1.0, 3, 'neutral'),
      new MockMoveData('thunder_bolt', 'Thunder Bolt', DAMAGE: MoveCategory.DAMAGE, 65, 85: 0.85, 10, 'electric'),
      new MockMoveData('solar_beam', 'Solar Beam', DAMAGE: MoveCategory.DAMAGE, 80, 8: 0.8, 12, 'nature'),
      new MockMoveData('rest', 'Rest', HEALING: MoveCategory.HEALING, 0, 0: 1.0, 0, 'neutral'),
      new MockMoveData('agility', 'Agility', UTILITY: MoveCategory.UTILITY, 0, 0: 1.0, 4, 'neutral'),
      new MockMoveData('toxic', 'Toxic', STATUS: MoveCategory.STATUS, 0, 85: 0.85, 6, 'poison')
    ];

    moves.forEach((move: any) => 
      this.moves.set(moveId: move.moveId, move);
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
    console.log('='.repeat(60));
    console.log('🤖 BattleAIPure CLI - Battle AI Management System');
    console.log('='.repeat(60));
    console.log('');
    console.log('Available commands:');
    console.log('  profiles          - Show all AI profiles');
    console.log('  spirits           - Show all spirits');
    console.log('  moves             - Show all moves');
    console.log('  decide [spirit] [opponent] [profile] - Show AI decision');
    console.log('  battle [spirit1] [spirit2] [profile] - Simulate battle');
    console.log('  threat [spirit] [opponent] - Evaluate threat level');
    console.log('  profile [id]      - Show profile details');
    console.log('  compare [profile1] [profile2] - Compare profiles');
    console.log('  heal [spirit] [amount] - Heal spirit');
    console.log('  damage [spirit] [amount] - Damage spirit');
    console.log('  status [spirit]   - Show spirit status');
    console.log('  help              - Show this help');
    console.log('  exit              - Exit application');
    console.log('');

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
          console.log(`❌ Unknown command: ${command}`);
          console.log('Type "help" for available commands.');
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.log(`❌ Error: ${error}`);
    }

    this.showPrompt();
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.log('='.repeat(60));
    console.log('📚 BattleAIPure CLI Help');
    console.log('='.repeat(60));
    console.log('');
    console.log('Commands:');
    console.log('  help                    - Show this help');
    console.log('  profiles                - List all AI profiles');
    console.log('  spirits                 - List all available spirits');
    console.log('  moves                   - List all available moves');
    console.log('  decide [s] [opp] [prof] - Show AI decision for spirit');
    console.log('  battle [s1] [s2] [prof] - Simulate battle between spirits');
    console.log('  threat [s] [opp]        - Evaluate threat level of opponent');
    console.log('  profile [id]            - Show detailed profile info');
    console.log('  compare [p1] [p2]       - Compare two profiles');
    console.log('  heal [spirit] [amount]  - Heal spirit (default: 20)');
    console.log('  damage [spirit] [amount]- Damage spirit (default: 20)');
    console.log('  status [spirit]         - Show detailed spirit status');
    console.log('  exit                    - Exit the application');
    console.log('');
    console.log('Examples:');
    console.log('  decide fire_spirit water_spirit aggressive');
    console.log('  battle fire_spirit water_spirit balanced');
    console.log('  threat water_spirit fire_spirit');
    console.log('  compare aggressive defensive');
    console.log('');
  }

  /**
   * Show all profiles
   */
  private showProfiles(): void {
    console.log('='.repeat(60));
    console.log('📋 AI Profiles');
    console.log('='.repeat(60));

    const profiles = this.aiManager.getAllProfiles();
    if (profiles.length === 0) {
      console.log('No profiles registered.');
      return;
    }

    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${this.getProfileIcon(profile)} ${profile.getSummary()}`);
      console.log(`   ${BattleAIUtils.getBehaviorDescription(profile)}`);
      console.log('');
    });
  }

  /**
   * Show all spirits
   */
  private showSpirits(): void {
    console.log('='.repeat(60));
    console.log('👻 Available Spirits');
    console.log('='.repeat(60));

    if (this.spirits.size === 0) {
      console.log('No spirits available.');
      return;
    }

    Array.from(this.spirits.values()).forEach((spirit, index) => {
      console.log(`${index + 1}. ${spirit.getCombatSummary()}`);
      if (spirit.knownMoves.length > 0) {
        console.log(`   Moves: ${spirit.knownMoves.join(', ')}`);
      }
      console.log('');
    });
  }

  /**
   * Show all moves
   */
  private showMoves(): void {
    console.log('='.repeat(60));
    console.log('⚔️ Available Moves');
    console.log('='.repeat(60));

    if (this.moves.size === 0) {
      console.log('No moves available.');
      return;
    }

    Array.from(this.moves.values()).forEach((move, index) => {
      const categoryIcon = this.getMoveCategoryIcon(move.category);
      console.log(`${index + 1}. ${categoryIcon} $name: move.name}`);
      console.log(`   ID: $moveId: move.moveId} | Power: $power: move.power} | Accuracy: ${Math.round(move.accuracy * 100)}%`);
      console.log(`   Cost: $cost: move.cost} | Type: $typeTag: move.typeTag}`);
      console.log('');
    });
  }

  /**
   * Show AI decision making
   */
  private async showDecision(args: string[]): Promise<void> {
    if (args.length < 2) {
      console.log('❌ Usage: decide [spirit] [opponent] [profile]');
      return;
    }

    const spiritId = args[0];
    const opponentId = args[1];
    const profileId = args[2] || 'balanced';

    const spirit = this.spirits.get(spiritId);
    const opponent = this.spirits.get(opponentId);
    const profile = this.aiManager.getProfile(profileId);

    if (!spirit) {
      console.log(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    if (!opponent) {
      console.log(`❌ Opponent not found: ${opponentId}`);
      return;
    }

    if (!profile) {
      console.log(`❌ Profile not found: ${profileId}`);
      return;
    }

    console.log('='.repeat(60));
    console.log(`🤔 AI Decision: $name: spirit.name} vs $name: opponent.name}`);
    console.log(`🤖 Profile: ${profile.getSummary()}`);
    console.log('='.repeat(60));

    console.log(`$name: spirit.name}: ${spirit.getCombatSummary()}`);
    console.log(`$name: opponent.name}: ${opponent.getCombatSummary()}`);
    console.log('');

    const ai = this.aiManager.getAIController(profileId);

    console.log('Available moves:');
    spirit.knownMoves.forEach(moveId => {
      const move = this.moves.get(moveId);
      if (move) {
        const categoryIcon = this.getMoveCategoryIcon(move.category);
        console.log(`  ${categoryIcon} $name: move.name} ($power: move.power} power, ${move.accuracy * 100}% acc)`);
      }
    });
    console.log('');

    const selectedMove = ai.selectMove(spirit, opponent);

    if (selectedMove) 
      const move = this.moves.get(selectedMove);
      if (move) {
        console.log(`🎯 AI chooses: ${name: move.name}`);
        console.log(`   Category: $category: move.category} | Power: $power: move.power} | Accuracy: ${Math.round(move.accuracy * 100)}%`);
        console.log(`   Cost: $cost: move.cost} | Type: $typeTag: move.typeTag} vs $typeTag: opponent.typeTag}`);

        const threatLevel = ai.evaluateThreatLevel(opponent);
        console.log(`   Threat Level: ${threatLevel.toFixed(2)} (${BattleAIUtils.getThreatLevelDescription(threatLevel)})`);
      } else {
        console.log(`🎯 AI chooses: ${selectedMove} (move not found)`);
      }
    } else {
      console.log('🎯 AI chooses: No suitable move found');
    }
  }

  /**
   * Simulate battle between spirits
   */
  private async simulateBattle(args: string[]): Promise<void> {
    if (args.length < 2) {
      console.log('❌ Usage: battle [spirit1] [spirit2] [profile]');
      return;
    }

    const spirit1Id = args[0];
    const spirit2Id = args[1];
    const profileId = args[2] || 'balanced';

    const spirit1 = this.spirits.get(spirit1Id);
    const spirit2 = this.spirits.get(spirit2Id);
    const profile = this.aiManager.getProfile(profileId);

    if (!spirit1) {
      console.log(`❌ Spirit not found: ${spirit1Id}`);
      return;
    }

    if (!spirit2) {
      console.log(`❌ Spirit not found: ${spirit2Id}`);
      return;
    }

    if (!profile) {
      console.log(`❌ Profile not found: ${profileId}`);
      return;
    }

    console.log('='.repeat(60));
    console.log(`⚔️ Battle: $name: spirit1.name} vs $name: spirit2.name}`);
    console.log(`🤖 Profile: ${profile.getSummary()}`);
    console.log('='.repeat(60));

    const ai1 = this.aiManager.getAIController(profileId);
    const ai2 = this.aiManager.getAIController(profileId);

    console.log(`$name: spirit1.name}: ${spirit1.getCombatSummary()}`);
    console.log(`$name: spirit2.name}: ${spirit2.getCombatSummary()}`);
    console.log('');

    let turn = 1;
    const maxTurns = 20;

    while (!spirit1.isFainted() && !spirit2.isFainted() && turn <= maxTurns) {
      console.log(`📍 Turn ${turn}`);

      // Spirit 1 attacks
      const action1 = ai1.selectMove(spirit1, spirit2);
      if (action1) 
        console.log(`🔥 ${name: spirit1.name} chooses ${action1}`);
      } else 
        console.log(`💤 ${name: spirit1.name} cannot move!`);
      }

      // Spirit 2 attacks
      const action2 = ai2.selectMove(spirit2, spirit1);
      if (action2) 
        console.log(`💥 ${name: spirit2.name} chooses ${action2}`);
      } else 
        console.log(`💤 ${name: spirit2.name} cannot move!`);
      }

      console.log(`$name: spirit1.name}: ${spirit1.getCombatSummary()}`);
      console.log(`$name: spirit2.name}: ${spirit2.getCombatSummary()}`);
      console.log('');

      turn++;
      if (turn > maxTurns) {
        console.log('🔄 Battle took too long, declaring draw!');
        break;
      }
    }

    if (spirit1.isFainted()) 
      console.log(`💀 ${name: spirit1.name} fainted!`);
      console.log(`🏆 $name: spirit2.name} wins!`);
    } else if (spirit2.isFainted()) 
      console.log(`💀 ${name: spirit2.name} fainted!`);
      console.log(`🏆 $name: spirit1.name} wins!`);
    }

    // Reset spirits for next battle
    this.resetSpirits();
  }

  /**
   * Show threat level evaluation
   */
  private showThreatLevel(args: string[]): void {
    if (args.length < 2) {
      console.log('❌ Usage: threat [spirit] [opponent]');
      return;
    }

    const spiritId = args[0];
    const opponentId = args[1];

    const spirit = this.spirits.get(spiritId);
    const opponent = this.spirits.get(opponentId);

    if (!spirit) {
      console.log(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    if (!opponent) {
      console.log(`❌ Opponent not found: ${opponentId}`);
      return;
    }

    console.log('='.repeat(60));
    console.log(`🎯 Threat Assessment: $name: spirit.name} vs $name: opponent.name}`);
    console.log('='.repeat(60));

    const ai = this.aiManager.getAIController('balanced');
    const threatLevel = ai.evaluateThreatLevel(opponent);

    console.log(`$name: spirit.name}: ${spirit.getCombatSummary()}`);
    console.log(`$name: opponent.name}: ${opponent.getCombatSummary()}`);
    console.log('');

    console.log(`Threat Level: ${threatLevel.toFixed(3)}`);
    console.log(`Threat Assessment: ${BattleAIUtils.getThreatLevelDescription(threatLevel)}`);
    console.log('');

    console.log('Threat Factors:');
    console.log(`  Opponent HP Ratio: ${(opponent.currentHP / opponent.maxHP).toFixed(3)}`);
    console.log(`  Level Difference: $opponent.level - level: spirit.level}`);
    console.log(`  Status Effects: $opponent.length: statusEffects.length}`);
  }

  /**
   * Show profile details
   */
  private showProfileDetails(profileId: string): void {
    if (!profileId) {
      console.log('❌ Usage: profile [profile_id]');
      return;
    }

    const profile = this.aiManager.getProfile(profileId);
    if (!profile) {
      console.log(`❌ Profile not found: ${profileId}`);
      return;
    }

    console.log('='.repeat(60));
    console.log(`📋 Profile Details: $profileID: profile.profileID}`);
    console.log('='.repeat(60));

    console.log(`Style: $style: profile.style} - ${profile.getStyleDescription()}`);
    console.log('');

    console.log('Move Priority Weights:');
    Object.entries(profile.movePriorityWeights).forEach(([category, weight]) => {
      const bar = this.getWeightBar(weight);
      console.log(`  ${category}: ${weight.toFixed(2)} ${bar}`);
    });
    console.log('');

    if (profile.preferredTypes.length > 0) {
      console.log(`Preferred Types: ${profile.preferredTypes.join(', ')}`);
      console.log('');
    }

    const errors = profile.validate({});
    if (errors.length === 0) {
      console.log('✅ Profile is valid');
    } else {
      console.log('❌ Validation errors:');
      errors.forEach((error: any) => console.log(`   - ${error}`));
    }
  }

  /**
   * Compare two profiles
   */
  private compareProfiles(profileId1: string, profileId2: string): void {
    if (!profileId1 || !profileId2) {
      console.log('❌ Usage: compare [profile1] [profile2]');
      return;
    }

    const profile1 = this.aiManager.getProfile(profileId1);
    const profile2 = this.aiManager.getProfile(profileId2);

    if (!profile1) {
      console.log(`❌ Profile 1 not found: ${profileId1}`);
      return;
    }

    if (!profile2) {
      console.log(`❌ Profile 2 not found: ${profileId2}`);
      return;
    }

    console.log('='.repeat(60));
    console.log(`⚖️ Profile Comparison`);
    console.log('='.repeat(60));

    console.log(`${profileId1}: ${profile1.getSummary()}`);
    console.log(`  ${BattleAIUtils.getBehaviorDescription(profile1)}`);
    console.log('');

    console.log(`${profileId2}: ${profile2.getSummary()}`);
    console.log(`  ${BattleAIUtils.getBehaviorDescription(profile2)}`);
    console.log('');

    const comparison = BattleAIUtils.compareProfiles(profile1, profile2);

    console.log('Comparison Results:');
    console.log(`  Style Match: ${comparison.styleMatch ? '✅' : '❌'}`);
    console.log(`  Weight Difference: ${comparison.weightDifference.toFixed(3)}`);
    console.log(`  Type Preferences Match: ${comparison.typePreferencesMatch ? '✅' : '❌'}`);
    console.log(`  Total Difference: ${comparison.totalDifference.toFixed(3)}`);
    console.log('');

    if (comparison.totalDifference < 0.1) {
      console.log('📊 Profiles are identical');
    } else if (comparison.totalDifference < 1.0) {
      console.log('📊 Profiles are very similar');
    } else if (comparison.totalDifference < 2.0) {
      console.log('📊 Profiles are somewhat similar');
    } else {
      console.log('📊 Profiles are quite different');
    }
  }

  /**
   * Heal spirit
   */
  private healSpirit(spiritId: string, amount: number): void {
    const spirit = this.spirits.get(spiritId);
    if (!spirit) {
      console.log(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    const oldHP = spirit.currentHP;
    spirit.heal(amount);

    console.log(`❤️ Healed $name: spirit.name} by ${amount} HP`);
    console.log(`📊 HP: ${oldHP} → $currentHP: spirit.currentHP}/$maxHP: spirit.maxHP}`);
  }

  /**
   * Damage spirit
   */
  private damageSpirit(spiritId: string, amount: number): void {
    const spirit = this.spirits.get(spiritId);
    if (!spirit) {
      console.log(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    const oldHP = spirit.currentHP;
    spirit.takeDamage(amount);

    console.log(`💔 Damaged $name: spirit.name} by ${amount} HP`);
    console.log(`📊 HP: ${oldHP} → $currentHP: spirit.currentHP}/$maxHP: spirit.maxHP}`);

    if (spirit.isFainted()) 
      console.log(`💀 ${name: spirit.name} fainted!`);
    }
  }

  /**
   * Show detailed spirit status
   */
  private showSpiritStatus(spiritId: string): void {
    if (!spiritId) {
      console.log('❌ Usage: status [spirit_id]');
      return;
    }

    const spirit = this.spirits.get(spiritId);
    if (!spirit) {
      console.log(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    console.log('='.repeat(60));
    console.log(`📊 Spirit Status: $name: spirit.name}`);
    console.log('='.repeat(60));

    console.log(`ID: $id: spirit.id}`);
    console.log(`Type: $typeTag: spirit.typeTag}`);
    console.log(`Level: $level: spirit.level}`);
    console.log(`HP: $currentHP: spirit.currentHP}/$maxHP: spirit.maxHP}`);
    console.log(`Stats: ATK $attack: spirit.attack} | DEF $defense: spirit.defense} | SP.ATK $specialAttack: spirit.specialAttack} | SP.DEF $specialDefense: spirit.specialDefense} | SPD $speed: spirit.speed}`);
    console.log(`Status Effects: ${spirit.statusEffects.length > 0 ? spirit.statusEffects.join(', ') : 'None'}`);
    console.log(`Known Moves: ${spirit.knownMoves.length > 0 ? spirit.knownMoves.join(', ') : 'None'}`);

    if (spirit.isFainted()) {
      console.log('Status: 💀 Fainted');
    } else {
      const hpRatio = spirit.currentHP / spirit.maxHP;
      if (hpRatio > 0.8) console.log('Status: ✅ Healthy');
      else if (hpRatio > 0.5) console.log('Status: ⚠️ Wounded');
      else if (hpRatio > 0.2) console.log('Status: 🚨 Critical');
      else console.log('Status: 💀 Near Death');
    }
  }

  /**
   * Get icon for profile
   */
  private getProfileIcon(profile: IAIDecisionProfile): string {
    switch (profile.style) {
      case AGGRESSIVE: return '🔥';
      case DEFENSIVE: return '🛡️';
      case BALANCED: return '⚖️';
      case TRICKSTER: return '🎭';
      default: return '❓';
    }
  }

  /**
   * Get icon for move category
   */
  private getMoveCategoryIcon(category: MoveCategory): string {
    switch (category) {
      case DAMAGE: return '⚔️';
      case HEALING: return '❤️';
      case SUPPORT: return '🛡️';
      case STATUS: return '💊';
      case UTILITY: return '🔧';
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
    this.spirits.forEach((spirit: any) => {
      spirit.currentHP = spirit.maxHP;
      spirit.statusEffects = [];
    });
  }

  /**
   * Exit application
   */
  private exit(): void {
    console.log('');
    console.log('👋 Thank you for using BattleAIPure CLI!');
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