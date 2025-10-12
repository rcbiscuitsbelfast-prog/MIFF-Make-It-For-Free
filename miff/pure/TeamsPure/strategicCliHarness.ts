#!/usr/bin/env tsx

/**
 * TeamsPure Strategic CLI Harness
 *
 * Advanced command-line interface for the TeamsPure module with strategic analysis,
 * team composition optimization, threat assessment, and visual team building.
 */

import * as readline from 'readline';
import { StructuredLogger } from '../shared/logging/StructuredLogger';
import {
  TeamManager,
  TeamStrategyAnalyzer,
  Team,
  TeamRules,
  TeamUtils,
  ISpiritInstance,
  IStrategicAnalysis,
  ITeamCompositionRecommendation,
  IThreatAnalysis
} from './index';

/**
 * Strategic CLI for TeamsPure
 */
export class TeamsPureStrategicCLI {
  private logger: StructuredLogger;
  private teamManager: TeamManager;
  private rl: readline.Interface;
  private isRunning: boolean = false;
  private mockSpirits: ISpiritInstance[] = [];

  constructor() {
    this.logger = new StructuredLogger({ module: 'TeamsPureStrategicCLI' });
    this.teamManager = new TeamManager();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.initializeDemoData();
  }

  /**
   * Initialize demo spirits and teams
   */
  private initializeDemoData(): void {
    this.createDemoSpirits();
    this.createDemoTeams();
  }

  /**
   * Create demo spirits with various stats
   */
  private createDemoSpirits(): void {
    this.mockSpirits = [
      this.createMockSpirit('fire_dragon', 'Fire', 45, {
        attack: 95, defense: 75, speed: 80, hp: 85
      }),
      this.createMockSpirit('water_serpent', 'Water', 42, {
        attack: 80, defense: 90, speed: 65, hp: 95
      }),
      this.createMockSpirit('thunder_bird', 'Electric', 48, {
        attack: 90, defense: 70, speed: 95, hp: 80
      }),
      this.createMockSpirit('earth_golem', 'Ground', 40, {
        attack: 85, defense: 95, speed: 45, hp: 90
      }),
      this.createMockSpirit('wind_sprite', 'Flying', 38, {
        attack: 75, defense: 60, speed: 100, hp: 70
      }),
      this.createMockSpirit('psychic_mage', 'Psychic', 50, {
        attack: 100, defense: 80, speed: 85, hp: 75
      }),
      this.createMockSpirit('dark_knight', 'Dark', 47, {
        attack: 88, defense: 85, speed: 75, hp: 88
      }),
      this.createMockSpirit('light_warrior', 'Light', 44, {
        attack: 82, defense: 78, speed: 82, hp: 85
      }),
      this.createMockSpirit('nature_guardian', 'Grass', 41, {
        attack: 78, defense: 85, speed: 70, hp: 92
      }),
      this.createMockSpirit('ice_crystal', 'Ice', 39, {
        attack: 85, defense: 75, speed: 75, hp: 80
      })
    ];
  }

  /**
   * Create demo teams
   */
  private createDemoTeams(): void {
    // Create offensive team
    const offensiveTeam = this.teamManager.createTeam('offensive_force');
    const offensiveSpirits = this.mockSpirits.filter(s => ['Fire', 'Electric', 'Psychic'].includes(s.type));
    offensiveSpirits.forEach(spirit => {
      this.teamManager.addSpiritToTeam('offensive_force', spirit);
    });

    // Create defensive team
    const defensiveTeam = this.teamManager.createTeam('defensive_wall');
    const defensiveSpirits = this.mockSpirits.filter(s => ['Water', 'Ground', 'Grass'].includes(s.type));
    defensiveSpirits.forEach(spirit => {
      this.teamManager.addSpiritToTeam('defensive_wall', spirit);
    });

    // Create balanced team
    const balancedTeam = this.teamManager.createTeam('balanced_squad');
    const balancedSpirits = this.mockSpirits.filter(s => ['Light', 'Dark', 'Ice', 'Flying'].includes(s.type));
    balancedSpirits.forEach(spirit => {
      this.teamManager.addSpiritToTeam('balanced_squad', spirit);
    });
  }

  /**
   * Create mock spirit
   */
  private createMockSpirit(
    name: string,
    type: string,
    level: number,
    stats: { attack: number; defense: number; speed: number; hp: number }
  ): ISpiritInstance {
    return {
      instanceId: `spirit_${name}_${Date.now()}`,
      name,
      type,
      speciesId: `${type.toLowerCase()}_${name}`,
      level,
      stats: { hp: stats.hp, attack: stats.attack, defense: stats.defense, speed: stats.speed, specialAttack: Math.floor(stats.attack * 0.9), specialDefense: Math.floor(stats.defense * 0.9) },
      statusEffects: [],
      abilities: [],
      experience: 0,
      loyalty: 0,
      validate: () => [],
      isAlive: () => true,
      canAct: () => true,
      getEffectiveStats: () => ({
        attack: stats.attack,
        defense: stats.defense,
        speed: stats.speed,
        hp: stats.hp,
        specialAttack: Math.floor(stats.attack * 0.9),
        specialDefense: Math.floor(stats.defense * 0.9)
      }),
      getTypeEffectiveness: () => 1.0,
      toJSON: () => ({}),
      clone: function() { return { ...(this as any) } as ISpiritInstance; }
    } as ISpiritInstance;
  }

  /**
   * Start the CLI
   */
  async start(): Promise<void> {
    this.isRunning = true;
    this.logger.info('🛡️  TeamsPure Strategic CLI - Advanced Team Management');
    this.logger.info('Type "help" for commands or "exit" to quit.\n');

    while (this.isRunning) {
      const input = await this.prompt('teams> ');
      await this.processCommand(input);
    }
  }

  /**
   * Stop the CLI
   */
  stop(): void {
    this.isRunning = false;
    this.rl.close();
    this.logger.info('👋 TeamsPure Strategic CLI stopped.');
  }

  /**
   * Process user command
   */
  private async processCommand(input: string): Promise<void> {
    const parts = input.trim().split(' ');
    const command = parts[0]?.toLowerCase();
    const args = parts.slice(1);

    try {
      switch (command) {
        case 'help':
          this.showHelp();
          break;
        case 'exit':
        case 'quit':
          this.stop();
          break;
        case 'clear':
          console.clear();
          break;
        case 'list-teams':
          this.listTeams();
          break;
        case 'list-spirits':
          this.listSpirits();
          break;
        case 'analyze':
          await this.analyzeTeam(args);
          break;
        case 'optimal':
          await this.getOptimalComposition(args);
          break;
        case 'threats':
          await this.analyzeThreats(args);
          break;
        case 'strategy':
          await this.showStrategy(args);
          break;
        case 'compare':
          await this.compareTeams(args);
          break;
        case 'simulate':
          await this.simulateBattle(args);
          break;
        case 'build':
          await this.buildOptimalTeam(args);
          break;
        case 'demo':
          this.runDemo();
          break;
        default:
          this.logger.info('❌ Unknown command. Type "help" for available commands.');
      }
    } catch (error) {
      this.logger.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    this.logger.info('\n🛡️  TeamsPure Strategic Commands:');
    this.logger.info('  help                    - Show this help message');
    this.logger.info('  exit/quit               - Exit the CLI');
    this.logger.info('  clear                   - Clear the console');
    this.logger.info('');
    this.logger.info('  list-teams              - List all teams');
    this.logger.info('  list-spirits            - List all available spirits');
    this.logger.info('  analyze <team>          - Analyze team strategically');
    this.logger.info('  optimal <team>          - Get optimal composition for team');
    this.logger.info('  threats <team> <enemy>  - Analyze threats against enemy teams');
    this.logger.info('  strategy <team>         - Show recommended strategies');
    this.logger.info('  compare <team1> <team2> - Compare two teams');
    this.logger.info('  simulate <team1> <team2>- Simulate battle between teams');
    this.logger.info('  build <team>            - Build optimal team composition');
    this.logger.info('  demo                    - Run strategic demo');
    this.logger.info('');
    this.logger.info('💡 Examples:');
    this.logger.info('  analyze offensive_force');
    this.logger.info('  optimal balanced_squad');
    this.logger.info('  threats offensive_force defensive_wall');
    this.logger.info('  compare offensive_force defensive_wall');
    this.logger.info('  simulate offensive_force defensive_wall');
  }

  /**
   * List all teams
   */
  private listTeams(): void {
    const teams = this.teamManager.getAllTeams();

    if (teams.length === 0) {
      this.logger.info('No teams found. Try "demo" to create sample teams.');
      return;
    }

    this.logger.info('\n📋 Available Teams:');
    teams.forEach(team => {
      const spirits = team.spirits;
      const types = new Set(spirits.map(s => s.type));
      const avgLevel = spirits.length > 0 ? spirits.reduce((sum, s) => sum + s.level, 0) / spirits.length : 0;

      this.logger.info(`  ${team.name} (${spirits.length}/${team.maxSize} spirits)`);
      this.logger.info(`    Types: ${Array.from(types).join(', ')}`);
      this.logger.info(`    Avg Level: ${avgLevel.toFixed(1)}`);
      this.logger.info(`    Strategy: ${this.getTeamStrategy(team)}`);
    });
  }

  /**
   * List all available spirits
   */
  private listSpirits(): void {
    this.logger.info('\n🧬 Available Spirits:');
    this.mockSpirits.forEach(spirit => {
      const stats = spirit.getEffectiveStats();
      this.logger.info(`  ${spirit.name} (${spirit.type}, Lv${spirit.level})`);
      this.logger.info(`    ATK: ${stats.attack} | DEF: ${stats.defense} | SPD: ${stats.speed} | HP: ${stats.hp}`);
    });
  }

  /**
   * Analyze team strategically
   */
  private async analyzeTeam(args: string[]): Promise<void> {
    if (args.length < 1) {
      this.logger.info('❌ Usage: analyze <team_id>');
      return;
    }

    const teamId = args[0];
    const team = this.teamManager.getTeam(teamId);

    if (!team) {
      this.logger.info('❌ Team not found');
      return;
    }

    this.logger.info(`\n🔍 Strategic Analysis for ${team.name}:`);
    const analysis = this.teamManager.getStrategicAnalysis(teamId);

    this.logger.info(`Overall Strength: ${analysis.overallStrength}/100`);
    this.logger.info(`Offensive Rating: ${analysis.offensiveRating}/100`);
    this.logger.info(`Defensive Rating: ${analysis.defensiveRating}/100`);
    this.logger.info(`Mobility Rating: ${analysis.mobilityRating}/100`);
    this.logger.info(`Synergy Rating: ${analysis.synergyRating}/100`);
    this.logger.info(`Type Coverage: ${analysis.typeCoverage.toFixed(1)}%`);

    this.logger.info('\n💪 Strengths:');
    analysis.strengths.forEach(strength => {
      this.logger.info(`  ✅ ${strength}`);
    });

    if (analysis.weaknesses.length > 0) {
      this.logger.info('\n⚠️  Weaknesses:');
      analysis.weaknesses.forEach(weakness => {
        this.logger.info(`  ⚠️  ${weakness}`);
      });
    }

    this.logger.info('\n🎯 Recommended Strategies:');
    analysis.recommendedStrategies.forEach(strategy => {
      this.logger.info(`  🎯 ${strategy}`);
    });

    if (analysis.riskFactors.length > 0) {
      this.logger.info('\n⚠️  Risk Factors:');
      analysis.riskFactors.forEach(risk => {
        this.logger.info(`  ⚠️  ${risk}`);
      });
    }
  }

  /**
   * Get optimal team composition
   */
  private async getOptimalComposition(args: string[]): Promise<void> {
    if (args.length < 1) {
      this.logger.info('❌ Usage: optimal <team_id>');
      return;
    }

    const teamId = args[0];
    const team = this.teamManager.getTeam(teamId);

    if (!team) {
      this.logger.info('❌ Team not found');
      return;
    }

    this.logger.info(`\n🎯 Optimal Composition for ${team.name}:`);
    const recommendation = this.teamManager.getOptimalTeamComposition(teamId, this.mockSpirits);

    this.logger.info(`Predicted Performance: ${recommendation.predictedPerformance}/100`);
    this.logger.info(`Risk Level: ${recommendation.riskLevel.toUpperCase()}`);

    this.logger.info('\n📋 Recommended Team:');
    recommendation.recommendedTeam.forEach((spirit, index) => {
      const stats = spirit.getEffectiveStats();
      this.logger.info(`  ${index + 1}. ${spirit.name} (${spirit.type}, Lv${spirit.level})`);
      this.logger.info(`     ATK: ${stats.attack} | DEF: ${stats.defense} | SPD: ${stats.speed}`);
    });

    this.logger.info('\n💭 Reasoning:');
    recommendation.reasoning.forEach(reason => {
      this.logger.info(`  • ${reason}`);
    });

    if (recommendation.alternativeCompositions.length > 0) {
      this.logger.info('\n🔄 Alternative Compositions:');
      recommendation.alternativeCompositions.forEach((comp, index) => {
        const types = new Set(comp.map(s => s.type));
        const avgLevel = comp.reduce((sum, s) => sum + s.level, 0) / comp.length;
        this.logger.info(`  ${index + 1}. ${Array.from(types).join(', ')} (Avg Lv${avgLevel.toFixed(1)})`);
      });
    }
  }

  /**
   * Analyze threats against enemy teams
   */
  private async analyzeThreats(args: string[]): Promise<void> {
    if (args.length < 2) {
      this.logger.info('❌ Usage: threats <team_id> <enemy_team_id>');
      return;
    }

    const teamId = args[0];
    const enemyTeamId = args[1];

    const team = this.teamManager.getTeam(teamId);
    const enemyTeam = this.teamManager.getTeam(enemyTeamId);

    if (!team) {
      this.logger.info('❌ Team not found');
      return;
    }

    if (!enemyTeam) {
      this.logger.info('❌ Enemy team not found');
      return;
    }

    this.logger.info(`\n⚔️  Threat Analysis: ${team.name} vs ${enemyTeam.name}`);
    const analysis = this.teamManager.analyzeThreats(teamId, [enemyTeam]);

    this.logger.info(`Threat Level: ${analysis.threatLevel.toUpperCase()}`);
    this.logger.info(`Vulnerability Score: ${analysis.vulnerabilityScore}/100`);

    if (analysis.primaryThreats.length > 0) {
      this.logger.info('\n🚨 Primary Threats:');
      analysis.primaryThreats.forEach(threat => {
        this.logger.info(`  🚨 ${threat}`);
      });
    }

    if (analysis.counterStrategies.length > 0) {
      this.logger.info('\n🛡️  Counter Strategies:');
      analysis.counterStrategies.forEach(strategy => {
        this.logger.info(`  🛡️  ${strategy}`);
      });
    }
  }

  /**
   * Show recommended strategies
   */
  private async showStrategy(args: string[]): Promise<void> {
    if (args.length < 1) {
      this.logger.info('❌ Usage: strategy <team_id>');
      return;
    }

    const teamId = args[0];
    const team = this.teamManager.getTeam(teamId);

    if (!team) {
      this.logger.info('❌ Team not found');
      return;
    }

    this.logger.info(`\n🎯 Strategic Recommendations for ${team.name}:`);
    const analysis = this.teamManager.getStrategicAnalysis(teamId);

    this.logger.info(`Overall Strategy: ${this.getTeamStrategy(team)}`);
    this.logger.info(`Recommended Approach: ${this.getRecommendedApproach(analysis)}`);

    this.logger.info('\n📊 Detailed Recommendations:');
    analysis.recommendedStrategies.forEach((strategy, index) => {
      this.logger.info(`  ${index + 1}. ${strategy}`);
    });

    this.logger.info('\n🎮 Tactical Tips:');
    this.generateTacticalTips(analysis).forEach(tip => {
      this.logger.info(`  💡 ${tip}`);
    });
  }

  /**
   * Compare two teams
   */
  private async compareTeams(args: string[]): Promise<void> {
    if (args.length < 2) {
      this.logger.info('❌ Usage: compare <team1_id> <team2_id>');
      return;
    }

    const team1Id = args[0];
    const team2Id = args[1];

    const team1 = this.teamManager.getTeam(team1Id);
    const team2 = this.teamManager.getTeam(team2Id);

    if (!team1 || !team2) {
      this.logger.info('❌ One or both teams not found');
      return;
    }

    this.logger.info(`\n⚖️  Team Comparison: ${team1.name} vs ${team2.name}`);

    const analysis1 = this.teamManager.getStrategicAnalysis(team1Id);
    const analysis2 = this.teamManager.getStrategicAnalysis(team2Id);

    this.logger.info(`\n${team1.name}:`);
    this.logger.info(`  Strength: ${analysis1.overallStrength}/100`);
    this.logger.info(`  Strategy: ${this.getTeamStrategy(team1)}`);

    this.logger.info(`\n${team2.name}:`);
    this.logger.info(`  Strength: ${analysis2.overallStrength}/100`);
    this.logger.info(`  Strategy: ${this.getTeamStrategy(team2)}`);

    const winner = analysis1.overallStrength > analysis2.overallStrength ? team1 : team2;
    this.logger.info(`\n🏆 Predicted Winner: ${winner.name} (${Math.abs(analysis1.overallStrength - analysis2.overallStrength)} point advantage)`);

    this.showComparisonDetails(analysis1, analysis2);
  }

  /**
   * Simulate battle between teams
   */
  private async simulateBattle(args: string[]): Promise<void> {
    if (args.length < 2) {
      this.logger.info('❌ Usage: simulate <team1_id> <team2_id>');
      return;
    }

    const team1Id = args[0];
    const team2Id = args[1];

    const team1 = this.teamManager.getTeam(team1Id);
    const team2 = this.teamManager.getTeam(team2Id);

    if (!team1 || !team2) {
      this.logger.info('❌ One or both teams not found');
      return;
    }

    this.logger.info(`\n⚔️  Battle Simulation: ${team1.name} vs ${team2.name}`);

    const analysis1 = this.teamManager.getStrategicAnalysis(team1Id);
    const analysis2 = this.teamManager.getStrategicAnalysis(team2Id);

    // Simple battle simulation based on ratings
    const team1Score = (analysis1.offensiveRating * 0.4) + (analysis1.defensiveRating * 0.3) + (analysis1.mobilityRating * 0.3);
    const team2Score = (analysis2.offensiveRating * 0.4) + (analysis2.defensiveRating * 0.3) + (analysis2.mobilityRating * 0.3);

    this.logger.info(`\nRound 1: Positioning`);
    this.logger.info(`  ${team1.name}: ${analysis1.mobilityRating > analysis2.mobilityRating ? 'Takes initiative' : 'Defensive stance'}`);
    this.logger.info(`  ${team2.name}: ${analysis2.mobilityRating > analysis1.mobilityRating ? 'Takes initiative' : 'Defensive stance'}`);

    this.logger.info(`\nRound 2: Combat`);
    if (analysis1.offensiveRating > analysis2.defensiveRating) {
      this.logger.info(`  ${team1.name} breaks through ${team2.name}'s defenses!`);
    } else {
      this.logger.info(`  ${team2.name} holds against ${team1.name}'s assault!`);
    }

    this.logger.info(`\nFinal Result:`);
    if (team1Score > team2Score) {
      this.logger.info(`  🏆 ${team1.name} wins!`);
      this.logger.info(`  Margin of victory: ${((team1Score - team2Score) / team2Score * 100).toFixed(1)}%`);
    } else if (team2Score > team1Score) {
      this.logger.info(`  🏆 ${team2.name} wins!`);
      this.logger.info(`  Margin of victory: ${((team2Score - team1Score) / team1Score * 100).toFixed(1)}%`);
    } else {
      this.logger.info('  🤝 Draw! Both teams are evenly matched.');
    }
  }

  /**
   * Build optimal team composition
   */
  private async buildOptimalTeam(args: string[]): Promise<void> {
    if (args.length < 1) {
      this.logger.info('❌ Usage: build <team_id>');
      return;
    }

    const teamId = args[0];
    const team = this.teamManager.getTeam(teamId);

    if (!team) {
      this.logger.info('❌ Team not found');
      return;
    }

    this.logger.info(`\n🏗️  Building Optimal Team: ${team.name}`);
    const recommendation = this.teamManager.getOptimalTeamComposition(teamId, this.mockSpirits);

    this.logger.info(`Target Performance: ${recommendation.predictedPerformance}/100`);
    this.logger.info(`Risk Level: ${recommendation.riskLevel.toUpperCase()}`);

    // Clear current team
    const currentSpirits = [...team.spirits];
    currentSpirits.forEach(spirit => {
      this.teamManager.removeSpiritFromTeam(teamId, spirit.instanceId);
    });

    // Add recommended spirits
    this.logger.info('\n📋 Adding Optimal Spirits:');
    recommendation.recommendedTeam.forEach((spirit, index) => {
      this.teamManager.addSpiritToTeam(teamId, spirit);
      this.logger.info(`  ✅ Added ${spirit.name} (${spirit.type}, Lv${spirit.level})`);
    });

    this.logger.info('\n🎯 Build Complete!');
    this.logger.info(`Team now has ${recommendation.recommendedTeam.length} spirits`);
    this.logger.info(`Performance: ${recommendation.predictedPerformance}/100`);

    if (recommendation.riskLevel === 'high') {
      this.logger.info('⚠️  Warning: High risk composition - consider alternatives');
    }
  }

  /**
   * Run strategic demo
   */
  public runDemo(): void {
    this.logger.info('🚀 Running TeamsPure Strategic Demo...\n');

    this.listTeams();
    this.listSpirits();

    this.logger.info('\n🎯 Demo Actions:');
    this.logger.info('  1. analyze offensive_force      - Analyze offensive team');
    this.logger.info('  2. optimal balanced_squad       - Get optimal composition');
    this.logger.info('  3. threats offensive_force defensive_wall  - Analyze threats');
    this.logger.info('  4. compare offensive_force defensive_wall  - Compare teams');
    this.logger.info('  5. simulate offensive_force defensive_wall - Simulate battle');
    this.logger.info('  6. strategy offensive_force     - Show strategies');
    this.logger.info('  7. build balanced_squad         - Build optimal team');
    this.logger.info('\n💡 Try these commands to explore strategic features!');
  }

  // Helper methods
  private getTeamStrategy(team: any): string {
    const spirits = team.spirits;
    if (spirits.length === 0) return 'No spirits';

    const offensiveRating = TeamStrategyAnalyzer['calculateOffensiveRating'](spirits);
    const defensiveRating = TeamStrategyAnalyzer['calculateDefensiveRating'](spirits);
    const mobilityRating = TeamStrategyAnalyzer['calculateMobilityRating'](spirits);

    if (offensiveRating > defensiveRating + 10) return 'Aggressive';
    if (defensiveRating > offensiveRating + 10) return 'Defensive';
    if (mobilityRating > 80) return 'Mobility-focused';
    return 'Balanced';
  }

  private getRecommendedApproach(analysis: IStrategicAnalysis): string {
    if (analysis.offensiveRating > 70) return 'Focus on aggressive attacks and exploiting weaknesses';
    if (analysis.defensiveRating > 70) return 'Focus on endurance and counter-attacks';
    if (analysis.mobilityRating > 70) return 'Focus on positioning and hit-and-run tactics';
    return 'Focus on balanced approach and team coordination';
  }

  private generateTacticalTips(analysis: IStrategicAnalysis): string[] {
    const tips: string[] = [];

    if (analysis.offensiveRating > 70) {
      tips.push('Use type advantages to maximize damage output');
      tips.push('Focus high-attack spirits on enemy weak points');
    }

    if (analysis.defensiveRating > 70) {
      tips.push('Protect vulnerable team members with defensive positioning');
      tips.push('Use defensive spirits to create chokepoints');
    }

    if (analysis.mobilityRating > 70) {
      tips.push('Control the battlefield with superior positioning');
      tips.push('Use speed to outmaneuver slower opponents');
    }

    if (analysis.synergyRating > 70) {
      tips.push('Coordinate attacks for maximum combined effectiveness');
      tips.push('Use team synergies to create powerful combinations');
    }

    return tips;
  }

  private showComparisonDetails(analysis1: IStrategicAnalysis, analysis2: IStrategicAnalysis): void {
    this.logger.info('\n📊 Detailed Comparison:');

    const categories = [
      { name: 'Offense', val1: analysis1.offensiveRating, val2: analysis2.offensiveRating },
      { name: 'Defense', val1: analysis1.defensiveRating, val2: analysis2.defensiveRating },
      { name: 'Mobility', val1: analysis1.mobilityRating, val2: analysis2.mobilityRating },
      { name: 'Synergy', val1: analysis1.synergyRating, val2: analysis2.synergyRating },
      { name: 'Type Coverage', val1: analysis1.typeCoverage, val2: analysis2.typeCoverage }
    ];

    categories.forEach(cat => {
      const diff = cat.val1 - cat.val2;
      const symbol = diff > 0 ? '>' : diff < 0 ? '<' : '=';
      this.logger.info(`  ${cat.name}: ${cat.val1} ${symbol} ${cat.val2}`);
    });
  }

  private prompt(query: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(query, resolve);
    });
  }
}

/**
 * CLI entry point
 */
async function main() {
  const cli = new TeamsPureStrategicCLI();

  if (process.argv.includes('--demo')) {
    cli.runDemo();
  }

  await cli.start();
}

// Run CLI
if (require.main === module) {
  main().catch(console.error);
}