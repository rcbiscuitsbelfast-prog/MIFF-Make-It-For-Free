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
//     const offensiveTeam = this.teamManager.createTeam('offensive_force');
    const offensiveSpirits = this.mockSpirits.filter(s => ['Fire', 'Electric', 'Psychic'].includes(s.type));
    offensiveSpirits.forEach(spirit => {
      this.teamManager.addSpiritToTeam('offensive_force', spirit);
    });

    // Create defensive team
//     const defensiveTeam = this.teamManager.createTeam('defensive_wall');
    const defensiveSpirits = this.mockSpirits.filter(s => ['Water', 'Ground', 'Grass'].includes(s.type));
    defensiveSpirits.forEach(spirit => {
      this.teamManager.addSpiritToTeam('defensive_wall', spirit);
    });

    // Create balanced team
//     const balancedTeam = this.teamManager.createTeam('balanced_squad');
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
    console.info('🛡️  TeamsPure Strategic CLI - Advanced Team Management');
    console.info('Type "help" for commands or "exit" to quit.\n');

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
    console.info('👋 TeamsPure Strategic CLI stopped.');
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
          console.info('❌ Unknown command. Type "help" for available commands.');
      }
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.info('\n🛡️  TeamsPure Strategic Commands:');
    console.info('  help                    - Show this help message');
    console.info('  exit/quit               - Exit the CLI');
    console.info('  clear                   - Clear the console');
    console.info('');
    console.info('  list-teams              - List all teams');
    console.info('  list-spirits            - List all available spirits');
    console.info('  analyze <team>          - Analyze team strategically');
    console.info('  optimal <team>          - Get optimal composition for team');
    console.info('  threats <team> <enemy>  - Analyze threats against enemy teams');
    console.info('  strategy <team>         - Show recommended strategies');
    console.info('  compare <team1> <team2> - Compare two teams');
    console.info('  simulate <team1> <team2>- Simulate battle between teams');
    console.info('  build <team>            - Build optimal team composition');
    console.info('  demo                    - Run strategic demo');
    console.info('');
    console.info('💡 Examples:');
    console.info('  analyze offensive_force');
    console.info('  optimal balanced_squad');
    console.info('  threats offensive_force defensive_wall');
    console.info('  compare offensive_force defensive_wall');
    console.info('  simulate offensive_force defensive_wall');
  }

  /**
   * List all teams
   */
  private listTeams(): void {
    const teams = this.teamManager.getAllTeams();

    if (teams.length === 0) {
      console.info('No teams found. Try "demo" to create sample teams.');
      return;
    }

    console.info('\n📋 Available Teams:');
    teams.forEach(team => {
      const spirits = team.spirits;
      const types = new Set(spirits.map(s => s.type));
      const avgLevel = spirits.length > 0 ? spirits.reduce((sum, s) => sum + s.level, 0) / spirits.length : 0;

      console.info(`  ${team.name} (${spirits.length}/${team.maxSize} spirits)`);
      console.info(`    Types: ${Array.from(types).join(', ')}`);
      console.info(`    Avg Level: ${avgLevel.toFixed(1)}`);
      console.info(`    Strategy: ${this.getTeamStrategy(team)}`);
    });
  }

  /**
   * List all available spirits
   */
  private listSpirits(): void {
    console.info('\n🧬 Available Spirits:');
    this.mockSpirits.forEach(spirit => {
      const stats = spirit.getEffectiveStats();
      console.info(`  ${spirit.name} (${spirit.type}, Lv${spirit.level})`);
      console.info(`    ATK: ${stats.attack} | DEF: ${stats.defense} | SPD: ${stats.speed} | HP: ${stats.hp}`);
    });
  }

  /**
   * Analyze team strategically
   */
  private async analyzeTeam(args: string[]): Promise<void> {
    if (args.length < 1) {
      console.info('❌ Usage: analyze <team_id>');
      return;
    }

    const teamId = args[0];
    const team = this.teamManager.getTeam(teamId);

    if (!team) {
      console.info('❌ Team not found');
      return;
    }

    console.info(`\n🔍 Strategic Analysis for ${team.name}:`);
    const analysis = this.teamManager.getStrategicAnalysis(teamId);

    console.info(`Overall Strength: ${analysis.overallStrength}/100`);
    console.info(`Offensive Rating: ${analysis.offensiveRating}/100`);
    console.info(`Defensive Rating: ${analysis.defensiveRating}/100`);
    console.info(`Mobility Rating: ${analysis.mobilityRating}/100`);
    console.info(`Synergy Rating: ${analysis.synergyRating}/100`);
    console.info(`Type Coverage: ${analysis.typeCoverage.toFixed(1)}%`);

    console.info('\n💪 Strengths:');
    analysis.strengths.forEach(strength => {
      console.info(`  ✅ ${strength}`);
    });

    if (analysis.weaknesses.length > 0) {
      console.info('\n⚠️  Weaknesses:');
      analysis.weaknesses.forEach(weakness => {
        console.info(`  ⚠️  ${weakness}`);
      });
    }

    console.info('\n🎯 Recommended Strategies:');
    analysis.recommendedStrategies.forEach(strategy => {
      console.info(`  🎯 ${strategy}`);
    });

    if (analysis.riskFactors.length > 0) {
      console.info('\n⚠️  Risk Factors:');
      analysis.riskFactors.forEach(risk => {
        console.info(`  ⚠️  ${risk}`);
      });
    }
  }

  /**
   * Get optimal team composition
   */
  private async getOptimalComposition(args: string[]): Promise<void> {
    if (args.length < 1) {
      console.info('❌ Usage: optimal <team_id>');
      return;
    }

    const teamId = args[0];
    const team = this.teamManager.getTeam(teamId);

    if (!team) {
      console.info('❌ Team not found');
      return;
    }

    console.info(`\n🎯 Optimal Composition for ${team.name}:`);
    const recommendation = this.teamManager.getOptimalTeamComposition(teamId, this.mockSpirits);

    console.info(`Predicted Performance: ${recommendation.predictedPerformance}/100`);
    console.info(`Risk Level: ${recommendation.riskLevel.toUpperCase()}`);

    console.info('\n📋 Recommended Team:');
    recommendation.recommendedTeam.forEach((spirit, index) => {
      const stats = spirit.getEffectiveStats();
      console.info(`  ${index + 1}. ${spirit.name} (${spirit.type}, Lv${spirit.level})`);
      console.info(`     ATK: ${stats.attack} | DEF: ${stats.defense} | SPD: ${stats.speed}`);
    });

    console.info('\n💭 Reasoning:');
    recommendation.reasoning.forEach(reason => {
      console.info(`  • ${reason}`);
    });

    if (recommendation.alternativeCompositions.length > 0) {
      console.info('\n🔄 Alternative Compositions:');
      recommendation.alternativeCompositions.forEach((comp, index) => {
        const types = new Set(comp.map(s => s.type));
        const avgLevel = comp.reduce((sum, s) => sum + s.level, 0) / comp.length;
        console.info(`  ${index + 1}. ${Array.from(types).join(', ')} (Avg Lv${avgLevel.toFixed(1)})`);
      });
    }
  }

  /**
   * Analyze threats against enemy teams
   */
  private async analyzeThreats(args: string[]): Promise<void> {
    if (args.length < 2) {
      console.info('❌ Usage: threats <team_id> <enemy_team_id>');
      return;
    }

    const teamId = args[0];
    const enemyTeamId = args[1];

    const team = this.teamManager.getTeam(teamId);
    const enemyTeam = this.teamManager.getTeam(enemyTeamId);

    if (!team) {
      console.info('❌ Team not found');
      return;
    }

    if (!enemyTeam) {
      console.info('❌ Enemy team not found');
      return;
    }

    console.info(`\n⚔️  Threat Analysis: ${team.name} vs ${enemyTeam.name}`);
    const analysis = this.teamManager.analyzeThreats(teamId, [enemyTeam]);

    console.info(`Threat Level: ${analysis.threatLevel.toUpperCase()}`);
    console.info(`Vulnerability Score: ${analysis.vulnerabilityScore}/100`);

    if (analysis.primaryThreats.length > 0) {
      console.info('\n🚨 Primary Threats:');
      analysis.primaryThreats.forEach(threat => {
        console.info(`  🚨 ${threat}`);
      });
    }

    if (analysis.counterStrategies.length > 0) {
      console.info('\n🛡️  Counter Strategies:');
      analysis.counterStrategies.forEach(strategy => {
        console.info(`  🛡️  ${strategy}`);
      });
    }
  }

  /**
   * Show recommended strategies
   */
  private async showStrategy(args: string[]): Promise<void> {
    if (args.length < 1) {
      console.info('❌ Usage: strategy <team_id>');
      return;
    }

    const teamId = args[0];
    const team = this.teamManager.getTeam(teamId);

    if (!team) {
      console.info('❌ Team not found');
      return;
    }

    console.info(`\n🎯 Strategic Recommendations for ${team.name}:`);
    const analysis = this.teamManager.getStrategicAnalysis(teamId);

    console.info(`Overall Strategy: ${this.getTeamStrategy(team)}`);
    console.info(`Recommended Approach: ${this.getRecommendedApproach(analysis)}`);

    console.info('\n📊 Detailed Recommendations:');
    analysis.recommendedStrategies.forEach((strategy, index) => {
      console.info(`  ${index + 1}. ${strategy}`);
    });

    console.info('\n🎮 Tactical Tips:');
    this.generateTacticalTips(analysis).forEach(tip => {
      console.info(`  💡 ${tip}`);
    });
  }

  /**
   * Compare two teams
   */
  private async compareTeams(args: string[]): Promise<void> {
    if (args.length < 2) {
      console.info('❌ Usage: compare <team1_id> <team2_id>');
      return;
    }

    const team1Id = args[0];
    const team2Id = args[1];

    const team1 = this.teamManager.getTeam(team1Id);
    const team2 = this.teamManager.getTeam(team2Id);

    if (!team1 || !team2) {
      console.info('❌ One or both teams not found');
      return;
    }

    console.info(`\n⚖️  Team Comparison: ${team1.name} vs ${team2.name}`);

    const analysis1 = this.teamManager.getStrategicAnalysis(team1Id);
    const analysis2 = this.teamManager.getStrategicAnalysis(team2Id);

    console.info(`\n${team1.name}:`);
    console.info(`  Strength: ${analysis1.overallStrength}/100`);
    console.info(`  Strategy: ${this.getTeamStrategy(team1)}`);

    console.info(`\n${team2.name}:`);
    console.info(`  Strength: ${analysis2.overallStrength}/100`);
    console.info(`  Strategy: ${this.getTeamStrategy(team2)}`);

    const winner = analysis1.overallStrength > analysis2.overallStrength ? team1 : team2;
    console.info(`\n🏆 Predicted Winner: ${winner.name} (${Math.abs(analysis1.overallStrength - analysis2.overallStrength)} point advantage)`);

    this.showComparisonDetails(analysis1, analysis2);
  }

  /**
   * Simulate battle between teams
   */
  private async simulateBattle(args: string[]): Promise<void> {
    if (args.length < 2) {
      console.info('❌ Usage: simulate <team1_id> <team2_id>');
      return;
    }

    const team1Id = args[0];
    const team2Id = args[1];

    const team1 = this.teamManager.getTeam(team1Id);
    const team2 = this.teamManager.getTeam(team2Id);

    if (!team1 || !team2) {
      console.info('❌ One or both teams not found');
      return;
    }

    console.info(`\n⚔️  Battle Simulation: ${team1.name} vs ${team2.name}`);

    const analysis1 = this.teamManager.getStrategicAnalysis(team1Id);
    const analysis2 = this.teamManager.getStrategicAnalysis(team2Id);

    // Simple battle simulation based on ratings
    const team1Score = (analysis1.offensiveRating * 0.4) + (analysis1.defensiveRating * 0.3) + (analysis1.mobilityRating * 0.3);
    const team2Score = (analysis2.offensiveRating * 0.4) + (analysis2.defensiveRating * 0.3) + (analysis2.mobilityRating * 0.3);

    console.info(`\nRound 1: Positioning`);
    console.info(`  ${team1.name}: ${analysis1.mobilityRating > analysis2.mobilityRating ? 'Takes initiative' : 'Defensive stance'}`);
    console.info(`  ${team2.name}: ${analysis2.mobilityRating > analysis1.mobilityRating ? 'Takes initiative' : 'Defensive stance'}`);

    console.info(`\nRound 2: Combat`);
    if (analysis1.offensiveRating > analysis2.defensiveRating) {
      console.info(`  ${team1.name} breaks through ${team2.name}'s defenses!`);
    } else {
      console.info(`  ${team2.name} holds against ${team1.name}'s assault!`);
    }

    console.info(`\nFinal Result:`);
    if (team1Score > team2Score) {
      console.info(`  🏆 ${team1.name} wins!`);
      console.info(`  Margin of victory: ${((team1Score - team2Score) / team2Score * 100).toFixed(1)}%`);
    } else if (team2Score > team1Score) {
      console.info(`  🏆 ${team2.name} wins!`);
      console.info(`  Margin of victory: ${((team2Score - team1Score) / team1Score * 100).toFixed(1)}%`);
    } else {
      console.info('  🤝 Draw! Both teams are evenly matched.');
    }
  }

  /**
   * Build optimal team composition
   */
  private async buildOptimalTeam(args: string[]): Promise<void> {
    if (args.length < 1) {
      console.info('❌ Usage: build <team_id>');
      return;
    }

    const teamId = args[0];
    const team = this.teamManager.getTeam(teamId);

    if (!team) {
      console.info('❌ Team not found');
      return;
    }

    console.info(`\n🏗️  Building Optimal Team: ${team.name}`);
    const recommendation = this.teamManager.getOptimalTeamComposition(teamId, this.mockSpirits);

    console.info(`Target Performance: ${recommendation.predictedPerformance}/100`);
    console.info(`Risk Level: ${recommendation.riskLevel.toUpperCase()}`);

    // Clear current team
    const currentSpirits = [...team.spirits];
    currentSpirits.forEach(spirit => {
      this.teamManager.removeSpiritFromTeam(teamId, spirit.instanceId);
    });

    // Add recommended spirits
    console.info('\n📋 Adding Optimal Spirits:');
    recommendation.recommendedTeam.forEach((spirit, index) => {
      this.teamManager.addSpiritToTeam(teamId, spirit);
      console.info(`  ✅ Added ${spirit.name} (${spirit.type}, Lv${spirit.level})`);
    });

    console.info('\n🎯 Build Complete!');
    console.info(`Team now has ${recommendation.recommendedTeam.length} spirits`);
    console.info(`Performance: ${recommendation.predictedPerformance}/100`);

    if (recommendation.riskLevel === 'high') {
      console.info('⚠️  Warning: High risk composition - consider alternatives');
    }
  }

  /**
   * Run strategic demo
   */
  public runDemo(): void {
    console.info('🚀 Running TeamsPure Strategic Demo...\n');

    this.listTeams();
    this.listSpirits();

    console.info('\n🎯 Demo Actions:');
    console.info('  1. analyze offensive_force      - Analyze offensive team');
    console.info('  2. optimal balanced_squad       - Get optimal composition');
    console.info('  3. threats offensive_force defensive_wall  - Analyze threats');
    console.info('  4. compare offensive_force defensive_wall  - Compare teams');
    console.info('  5. simulate offensive_force defensive_wall - Simulate battle');
    console.info('  6. strategy offensive_force     - Show strategies');
    console.info('  7. build balanced_squad         - Build optimal team');
    console.info('\n💡 Try these commands to explore strategic features!');
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
    console.info('\n📊 Detailed Comparison:');

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
      console.info(`  ${cat.name}: ${cat.val1} ${symbol} ${cat.val2}`);
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