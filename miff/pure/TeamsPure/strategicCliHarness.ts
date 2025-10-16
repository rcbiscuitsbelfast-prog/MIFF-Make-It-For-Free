#!/usr/bin/env tsx

/**
 * TeamsPure Strategic CLI Harness
 *
 * Advanced command-line interface for the TeamsPure module with strategic analysis,
 * team composition optimization, threat assessment, and visual team building.
 */

import * as readline from 'readline';
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
  private teamManager: TeamManager;
  private rl: readline.Interface;
  private isRunning: boolean = false;
  private mockSpirits: ISpiritInstance[] = [];

  constructor() {
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
    const offensiveTeam = this.teamManager.createTeam('offensive_force', 'Offensive Force', 6);
    const offensiveSpirits = this.mockSpirits.filter((s: any) => ['Fire', 'Electric', 'Psychic'].includes(s.type));
    offensiveSpirits.forEach((spirit: any) => {
      this.teamManager.addSpiritToTeam('offensive_force', spirit);
    });

    // Create defensive team
    const defensiveTeam = this.teamManager.createTeam('defensive_wall', 'Defensive Wall', 6);
    const defensiveSpirits = this.mockSpirits.filter((s: any) => ['Water', 'Ground', 'Grass'].includes(s.type));
    defensiveSpirits.forEach((spirit: any) => {
      this.teamManager.addSpiritToTeam('defensive_wall', spirit);
    });

    // Create balanced team
    const balancedTeam = this.teamManager.createTeam('balanced_squad', 'Balanced Squad', 6);
    const balancedSpirits = this.mockSpirits.filter((s: any) => ['Light', 'Dark', 'Ice', 'Flying'].includes(s.type));
    balancedSpirits.forEach((spirit: any) => {
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
      level,
      getEffectiveStats: () => ({
        attack: stats.attack,
        defense: stats.defense,
        speed: stats.speed,
        hp: stats.hp,
        specialAttack: Math.floor(stats.attack * 0.9),
        specialDefense: Math.floor(stats.defense * 0.9)
      }),
      evolve: (newSpeciesId: string) => {
        console.log(`Evolving ${name} to ${newSpeciesId}`);
      },
      getSyncPercentage: () => 50,
      hasItem: (itemId: string) => false
    };
  }

  /**
   * Start the CLI
   */
  async start(): Promise<void> {
    this.isRunning = true;
    console.log('🛡️  TeamsPure Strategic CLI - Advanced Team Management');
    console.log('Type "help" for commands or "exit" to quit.\n');

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
    console.log('👋 TeamsPure Strategic CLI stopped.');
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
          console.log('❌ Unknown command. Type "help" for available commands.');
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.log('\n🛡️  TeamsPure Strategic Commands:');
    console.log('  help                    - Show this help message');
    console.log('  exit/quit               - Exit the CLI');
    console.log('  clear                   - Clear the console');
    console.log('');
    console.log('  list-teams              - List all teams');
    console.log('  list-spirits            - List all available spirits');
    console.log('  analyze <team>          - Analyze team strategically');
    console.log('  optimal <team>          - Get optimal composition for team');
    console.log('  threats <team> <enemy>  - Analyze threats against enemy teams');
    console.log('  strategy <team>         - Show recommended strategies');
    console.log('  compare <team1> <team2> - Compare two teams');
    console.log('  simulate <team1> <team2>- Simulate battle between teams');
    console.log('  build <team>            - Build optimal team composition');
    console.log('  demo                    - Run strategic demo');
    console.log('');
    console.log('💡 Examples:');
    console.log('  analyze offensive_force');
    console.log('  optimal balanced_squad');
    console.log('  threats offensive_force defensive_wall');
    console.log('  compare offensive_force defensive_wall');
    console.log('  simulate offensive_force defensive_wall');
  }

  /**
   * List all teams
   */
  private listTeams(): void {
    const teams = this.teamManager.getAllTeams();

    if (teams.length === 0) {
      console.log('No teams found. Try "demo" to create sample teams.');
      return;
    }

    console.log('\n📋 Available Teams:');
    teams.forEach((team: any) => {
      const spirits = team.spirits;
      const types = new Set(spirits.map((s: any) => s.type));
      const avgLevel = spirits.length > 0 ? spirits.reduce((sum, s) => sum + s.level, 0) / spirits.length : 0;

      console.log(`  ${team.name} (${spirits.length}/${team.maxSize} spirits)`);
      console.log(`    Types: ${Array.from(types).join(', ')}`);
      console.log(`    Avg Level: ${avgLevel.toFixed(1)}`);
      console.log(`    Strategy: ${this.getTeamStrategy(team)}`);
    });
  }

  /**
   * List all available spirits
   */
  private listSpirits(): void {
    console.log('\n🧬 Available Spirits:');
    this.mockSpirits.forEach((spirit: any) => {
      const stats = spirit.getEffectiveStats();
      console.log(`  ${spirit.name} (${spirit.type}, Lv${spirit.level})`);
      console.log(`    ATK: ${stats.attack} | DEF: ${stats.defense} | SPD: ${stats.speed} | HP: ${stats.hp}`);
    });
  }

  /**
   * Analyze team strategically
   */
  private async analyzeTeam(args: string[]): Promise<void> {
    if (args.length < 1) {
      console.log('❌ Usage: analyze <team_id>');
      return;
    }

    const teamId = args[0];
    const team = this.teamManager.getTeam(teamId);

    if (!team) {
      console.log('❌ Team not found');
      return;
    }

    console.log(`\n🔍 Strategic Analysis for ${team.name}:`);
    const analysis = this.teamManager.getStrategicAnalysis(teamId);

    console.log(`Overall Strength: ${analysis.overallStrength}/100`);
    console.log(`Offensive Rating: ${analysis.offensiveRating}/100`);
    console.log(`Defensive Rating: ${analysis.defensiveRating}/100`);
    console.log(`Mobility Rating: ${analysis.mobilityRating}/100`);
    console.log(`Synergy Rating: ${analysis.synergyRating}/100`);
    console.log(`Type Coverage: ${analysis.typeCoverage.toFixed(1)}%`);

    console.log('\n💪 Strengths:');
    analysis.strengths.forEach((strength: any) => {
      console.log(`  ✅ ${strength}`);
    });

    if (analysis.weaknesses.length > 0) {
      console.log('\n⚠️  Weaknesses:');
      analysis.weaknesses.forEach((weakness: any) => {
        console.log(`  ⚠️  ${weakness}`);
      });
    }

    console.log('\n🎯 Recommended Strategies:');
    analysis.recommendedStrategies.forEach((strategy: any) => {
      console.log(`  🎯 ${strategy}`);
    });

    if (analysis.riskFactors.length > 0) {
      console.log('\n⚠️  Risk Factors:');
      analysis.riskFactors.forEach((risk: any) => {
        console.log(`  ⚠️  ${risk}`);
      });
    }
  }

  /**
   * Get optimal team composition
   */
  private async getOptimalComposition(args: string[]): Promise<void> {
    if (args.length < 1) {
      console.log('❌ Usage: optimal <team_id>');
      return;
    }

    const teamId = args[0];
    const team = this.teamManager.getTeam(teamId);

    if (!team) {
      console.log('❌ Team not found');
      return;
    }

    console.log(`\n🎯 Optimal Composition for ${team.name}:`);
    const recommendation = this.teamManager.getOptimalTeamComposition(teamId, this.mockSpirits);

    console.log(`Predicted Performance: ${recommendation.predictedPerformance}/100`);
    console.log(`Risk Level: ${recommendation.riskLevel.toUpperCase()}`);

    console.log('\n📋 Recommended Team:');
    recommendation.recommendedTeam.forEach((spirit, index) => {
      const stats = spirit.getEffectiveStats();
      console.log(`  ${index + 1}. ${spirit.name} (${spirit.type}, Lv${spirit.level})`);
      console.log(`     ATK: ${stats.attack} | DEF: ${stats.defense} | SPD: ${stats.speed}`);
    });

    console.log('\n💭 Reasoning:');
    recommendation.reasoning.forEach((reason: any) => {
      console.log(`  • ${reason}`);
    });

    if (recommendation.alternativeCompositions.length > 0) {
      console.log('\n🔄 Alternative Compositions:');
      recommendation.alternativeCompositions.forEach((comp, index) => {
        const types = new Set(comp.map((s: any) => s.type));
        const avgLevel = comp.reduce((sum, s) => sum + s.level, 0) / comp.length;
        console.log(`  ${index + 1}. ${Array.from(types).join(', ')} (Avg Lv${avgLevel.toFixed(1)})`);
      });
    }
  }

  /**
   * Analyze threats against enemy teams
   */
  private async analyzeThreats(args: string[]): Promise<void> {
    if (args.length < 2) {
      console.log('❌ Usage: threats <team_id> <enemy_team_id>');
      return;
    }

    const teamId = args[0];
    const enemyTeamId = args[1];

    const team = this.teamManager.getTeam(teamId);
    const enemyTeam = this.teamManager.getTeam(enemyTeamId);

    if (!team) {
      console.log('❌ Team not found');
      return;
    }

    if (!enemyTeam) {
      console.log('❌ Enemy team not found');
      return;
    }

    console.log(`\n⚔️  Threat Analysis: ${team.name} vs ${enemyTeam.name}`);
    const analysis = this.teamManager.analyzeThreats(teamId, [enemyTeam]);

    console.log(`Threat Level: ${analysis.threatLevel.toUpperCase()}`);
    console.log(`Vulnerability Score: ${analysis.vulnerabilityScore}/100`);

    if (analysis.primaryThreats.length > 0) {
      console.log('\n🚨 Primary Threats:');
      analysis.primaryThreats.forEach((threat: any) => {
        console.log(`  🚨 ${threat}`);
      });
    }

    if (analysis.counterStrategies.length > 0) {
      console.log('\n🛡️  Counter Strategies:');
      analysis.counterStrategies.forEach((strategy: any) => {
        console.log(`  🛡️  ${strategy}`);
      });
    }
  }

  /**
   * Show recommended strategies
   */
  private async showStrategy(args: string[]): Promise<void> {
    if (args.length < 1) {
      console.log('❌ Usage: strategy <team_id>');
      return;
    }

    const teamId = args[0];
    const team = this.teamManager.getTeam(teamId);

    if (!team) {
      console.log('❌ Team not found');
      return;
    }

    console.log(`\n🎯 Strategic Recommendations for ${team.name}:`);
    const analysis = this.teamManager.getStrategicAnalysis(teamId);

    console.log(`Overall Strategy: ${this.getTeamStrategy(team)}`);
    console.log(`Recommended Approach: ${this.getRecommendedApproach(analysis)}`);

    console.log('\n📊 Detailed Recommendations:');
    analysis.recommendedStrategies.forEach((strategy, index) => {
      console.log(`  ${index + 1}. ${strategy}`);
    });

    console.log('\n🎮 Tactical Tips:');
    this.generateTacticalTips(analysis).forEach((tip: any) => {
      console.log(`  💡 ${tip}`);
    });
  }

  /**
   * Compare two teams
   */
  private async compareTeams(args: string[]): Promise<void> {
    if (args.length < 2) {
      console.log('❌ Usage: compare <team1_id> <team2_id>');
      return;
    }

    const team1Id = args[0];
    const team2Id = args[1];

    const team1 = this.teamManager.getTeam(team1Id);
    const team2 = this.teamManager.getTeam(team2Id);

    if (!team1 || !team2) {
      console.log('❌ One or both teams not found');
      return;
    }

    console.log(`\n⚖️  Team Comparison: ${team1.name} vs ${team2.name}`);

    const analysis1 = this.teamManager.getStrategicAnalysis(team1Id);
    const analysis2 = this.teamManager.getStrategicAnalysis(team2Id);

    console.log(`\n${team1.name}:`);
    console.log(`  Strength: ${analysis1.overallStrength}/100`);
    console.log(`  Strategy: ${this.getTeamStrategy(team1)}`);

    console.log(`\n${team2.name}:`);
    console.log(`  Strength: ${analysis2.overallStrength}/100`);
    console.log(`  Strategy: ${this.getTeamStrategy(team2)}`);

    const winner = analysis1.overallStrength > analysis2.overallStrength ? team1 : team2;
    console.log(`\n🏆 Predicted Winner: ${winner.name} (${Math.abs(analysis1.overallStrength - analysis2.overallStrength)} point advantage)`);

    this.showComparisonDetails(analysis1, analysis2);
  }

  /**
   * Simulate battle between teams
   */
  private async simulateBattle(args: string[]): Promise<void> {
    if (args.length < 2) {
      console.log('❌ Usage: simulate <team1_id> <team2_id>');
      return;
    }

    const team1Id = args[0];
    const team2Id = args[1];

    const team1 = this.teamManager.getTeam(team1Id);
    const team2 = this.teamManager.getTeam(team2Id);

    if (!team1 || !team2) {
      console.log('❌ One or both teams not found');
      return;
    }

    console.log(`\n⚔️  Battle Simulation: ${team1.name} vs ${team2.name}`);

    const analysis1 = this.teamManager.getStrategicAnalysis(team1Id);
    const analysis2 = this.teamManager.getStrategicAnalysis(team2Id);

    // Simple battle simulation based on ratings
    const team1Score = (analysis1.offensiveRating * 0.4) + (analysis1.defensiveRating * 0.3) + (analysis1.mobilityRating * 0.3);
    const team2Score = (analysis2.offensiveRating * 0.4) + (analysis2.defensiveRating * 0.3) + (analysis2.mobilityRating * 0.3);

    console.log(`\nRound 1: Positioning`);
    console.log(`  ${team1.name}: ${analysis1.mobilityRating > analysis2.mobilityRating ? 'Takes initiative' : 'Defensive stance'}`);
    console.log(`  ${team2.name}: ${analysis2.mobilityRating > analysis1.mobilityRating ? 'Takes initiative' : 'Defensive stance'}`);

    console.log(`\nRound 2: Combat`);
    if (analysis1.offensiveRating > analysis2.defensiveRating) {
      console.log(`  ${team1.name} breaks through ${team2.name}'s defenses!`);
    } else {
      console.log(`  ${team2.name} holds against ${team1.name}'s assault!`);
    }

    console.log(`\nFinal Result:`);
    if (team1Score > team2Score) {
      console.log(`  🏆 ${team1.name} wins!`);
      console.log(`  Margin of victory: ${((team1Score - team2Score) / team2Score * 100).toFixed(1)}%`);
    } else if (team2Score > team1Score) {
      console.log(`  🏆 ${team2.name} wins!`);
      console.log(`  Margin of victory: ${((team2Score - team1Score) / team1Score * 100).toFixed(1)}%`);
    } else {
      console.log('  🤝 Draw! Both teams are evenly matched.');
    }
  }

  /**
   * Build optimal team composition
   */
  private async buildOptimalTeam(args: string[]): Promise<void> {
    if (args.length < 1) {
      console.log('❌ Usage: build <team_id>');
      return;
    }

    const teamId = args[0];
    const team = this.teamManager.getTeam(teamId);

    if (!team) {
      console.log('❌ Team not found');
      return;
    }

    console.log(`\n🏗️  Building Optimal Team: ${team.name}`);
    const recommendation = this.teamManager.getOptimalTeamComposition(teamId, this.mockSpirits);

    console.log(`Target Performance: ${recommendation.predictedPerformance}/100`);
    console.log(`Risk Level: ${recommendation.riskLevel.toUpperCase()}`);

    // Clear current team
    const currentSpirits = [...team.spirits];
    currentSpirits.forEach((spirit: any) => {
      this.teamManager.removeSpiritFromTeam(teamId, spirit.instanceId);
    });

    // Add recommended spirits
    console.log('\n📋 Adding Optimal Spirits:');
    recommendation.recommendedTeam.forEach((spirit, index) => {
      this.teamManager.addSpiritToTeam(teamId, spirit);
      console.log(`  ✅ Added ${spirit.name} (${spirit.type}, Lv${spirit.level})`);
    });

    console.log('\n🎯 Build Complete!');
    console.log(`Team now has ${recommendation.recommendedTeam.length} spirits`);
    console.log(`Performance: ${recommendation.predictedPerformance}/100`);

    if (recommendation.riskLevel === 'high') {
      console.log('⚠️  Warning: High risk composition - consider alternatives');
    }
  }

  /**
   * Run strategic demo
   */
  private runDemo(): void {
    console.log('🚀 Running TeamsPure Strategic Demo...\n');

    this.listTeams();
    this.listSpirits();

    console.log('\n🎯 Demo Actions:');
    console.log('  1. analyze offensive_force      - Analyze offensive team');
    console.log('  2. optimal balanced_squad       - Get optimal composition');
    console.log('  3. threats offensive_force defensive_wall  - Analyze threats');
    console.log('  4. compare offensive_force defensive_wall  - Compare teams');
    console.log('  5. simulate offensive_force defensive_wall - Simulate battle');
    console.log('  6. strategy offensive_force     - Show strategies');
    console.log('  7. build balanced_squad         - Build optimal team');
    console.log('\n💡 Try these commands to explore strategic features!');
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
    console.log('\n📊 Detailed Comparison:');

    const categories = [
      { name: 'Offense', val1: analysis1.offensiveRating, val2: analysis2.offensiveRating },
      { name: 'Defense', val1: analysis1.defensiveRating, val2: analysis2.defensiveRating },
      { name: 'Mobility', val1: analysis1.mobilityRating, val2: analysis2.mobilityRating },
      { name: 'Synergy', val1: analysis1.synergyRating, val2: analysis2.synergyRating },
      { name: 'Type Coverage', val1: analysis1.typeCoverage, val2: analysis2.typeCoverage }
    ];

    categories.forEach((cat: any) => {
      const diff = cat.val1 - cat.val2;
      const symbol = diff > 0 ? '>' : diff < 0 ? '<' : '=';
      console.log(`  ${cat.name}: ${cat.val1} ${symbol} ${cat.val2}`);
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