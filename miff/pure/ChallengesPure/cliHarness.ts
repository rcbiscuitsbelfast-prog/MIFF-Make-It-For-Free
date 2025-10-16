#!/usr/bin/env node

/**
 * ChallengesPure CLI Harness
 *
 * Interactive command-line interface for testing and demonstrating
 * the ChallengesPure challenge management system.
 */

import * as readline from 'readline';
import * as fs from 'fs';
import {
  ChallengeManager,
  BattleChallenge,
  ChallengeResult,
  ChallengeRuleset,
  ChallengeUtils,
  ChallengeCategory,
  ChallengeDifficulty,
  ChallengeStatus,
  ChallengeOutcome,
  IChallengeFilter,
  IPlayerContext,
  IBattleChallenge
} from './index';

// Mock Player Context for CLI
class MockPlayerContext implements IPlayerContext {
  private questFlags = new Set<string>();
  private loreFlags = new Set<string>();
  private currentLocation = 'default_location';
  private playerLevel = 1;
  private completedChallenges = new Set<string>();
  private unlockedLocations = new Set<string>();
  private capturedSpirits = new Set<string>();

  hasQuestFlag(flagId: string): boolean {
    return this.questFlags.has(flagId);
  }

  hasLoreFlag(flagId: string): boolean {
    return this.loreFlags.has(flagId);
  }

  getCurrentLocationId(): string {
    return this.currentLocation;
  }

  getPlayerLevel(): number {
    return this.playerLevel;
  }

  getCompletedChallenges(): string[] {
    return Array.from(this.completedChallenges);
  }

  getUnlockedLocations(): string[] {
    return Array.from(this.unlockedLocations);
  }

  getCapturedSpirits(): string[] {
    return Array.from(this.capturedSpirits);
  }

  setQuestFlag(flagId: string): void {
    this.questFlags.add(flagId);
  }

  setLoreFlag(flagId: string): void {
    this.loreFlags.add(flagId);
  }

  setLocation(locationId: string): void {
    this.currentLocation = locationId;
  }

  setPlayerLevel(level: number): void {
    this.playerLevel = level;
  }

  completeChallenge(challengeId: string): void {
    this.completedChallenges.add(challengeId);
  }

  unlockLocation(locationId: string): void {
    this.unlockedLocations.add(locationId);
  }

  captureSpirit(spiritId: string): void {
    this.capturedSpirits.add(spiritId);
  }
}

// CLI Application
class ChallengesPureCLI {
  private rl: readline.Interface;
  private challengeManager: ChallengeManager;
  private playerContext: MockPlayerContext;
  private currentFilter: IChallengeFilter = {};

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.challengeManager = new ChallengeManager();
    this.playerContext = new MockPlayerContext();

    this.initializeDemoData();
  }

  /**
   * Initialize demo data
   */
  private initializeDemoData(): void {
    console.log('Initializing ChallengesPure CLI with demo data...');

    // Create sample challenges
    this.createDemoChallenges();

    // Set up player context
    this.playerContext.setQuestFlag('tutorial_complete');
    this.playerContext.setLoreFlag('fire_spirit_defeated');
    this.playerContext.setLocation('forest_village');
    this.playerContext.setPlayerLevel(5);
    this.playerContext.captureSpirit('fire_spirit');
    this.playerContext.unlockLocation('mountain_peak');

    console.log('Demo data created. Use "list" to see available challenges.');
  }

  /**
   * Create demo challenges
   */
  private createDemoChallenges(): void {
    // Tutorial challenges
    const tutorial1 = BattleChallenge.tutorial(
      'tutorial_001',
      'First Steps',
      'Learn the basics of spirit combat',
      ['training_dummy'],
      10
    );

    const tutorial2 = BattleChallenge.tutorial(
      'tutorial_002',
      'Elemental Reactions',
      'Discover how different elements interact',
      ['fire_spirit', 'water_spirit'],
      15
    );

    // Main story challenges
    const story1 = BattleChallenge.mainStory(
      'story_001',
      'The Fire Guardian',
      'Defeat the guardian of the ancient flames',
      ['fire_guardian'],
      ['tutorial_complete']
    );

    const story2 = BattleChallenge.mainStory(
      'story_002',
      'Mountain Trial',
      'Prove your worth on the mountain peak',
      ['mountain_spirit', 'rock_elemental'],
      ['fire_spirit_defeated', 'mountain_peak']
    );

    const boss1 = BattleChallenge.boss(
      'boss_001',
      'The Elder Dragon',
      'Face the legendary elder dragon in combat',
      ['elder_dragon'],
      ['story_002_completed', 'player_level_10']
    );

    // Daily challenges
    const daily1 = BattleChallenge.daily(
      'daily_001',
      'Daily Sparring',
      'Test your skills against random opponents',
      ['random_spirit_1', 'random_spirit_2']
    );

    const daily2 = BattleChallenge.daily(
      'daily_002',
      'Elemental Training',
      'Focus on elemental mastery',
      ['fire_spirit', 'water_spirit', 'earth_spirit']
    );

    // Achievement challenges
    const achievement1 = BattleChallenge.achievement(
      'achievement_001',
      'Spirit Master',
      'Defeat 100 different spirits',
      ['spirit_master_100_defeated']
    );

    const achievement2 = BattleChallenge.achievement(
      'achievement_002',
      'Perfect Victory',
      'Win a challenge without taking damage',
      ['perfect_victory_achieved']
    );

    // Special challenge with custom rules
    const special1 = BattleChallenge.create(
      'special_001',
      'No Items Challenge',
      'Defeat the opponent without using any items',
      ['challenge_master'],
      ChallengeRuleset.itemBan(['healing_potion', 'attack_boost']),
      { experience: 500, gold: 200 },
      ChallengeCategory.SPECIAL,
      ChallengeDifficulty.HARD,
      20,
      9,
      ['no_items', 'special'],
      ['challenge_master_unlocked'],
      'challenge_arena'
    );

    // Register all challenges
    this.challengeManager.registerChallenge(tutorial1);
    this.challengeManager.registerChallenge(tutorial2);
    this.challengeManager.registerChallenge(story1);
    this.challengeManager.registerChallenge(story2);
    this.challengeManager.registerChallenge(boss1);
    this.challengeManager.registerChallenge(daily1);
    this.challengeManager.registerChallenge(daily2);
    this.challengeManager.registerChallenge(achievement1);
    this.challengeManager.registerChallenge(achievement2);
    this.challengeManager.registerChallenge(special1);

    // Set up event handlers
    this.challengeManager.onChallengeStarted = (challenge) => {
      console.log(`🎯 Challenge started: ${challenge.name}`);
    };

    this.challengeManager.onChallengeCompleted = (challenge, result) => {
      console.log(`🏆 Challenge completed: ${challenge.name} (${result.outcome})`);
      if (result.itemRewards && Object.keys(result.itemRewards).length > 0) {
        console.log(`  Rewards: ${Object.entries(result.itemRewards).map(([item, amount]) => `${amount} ${item}`).join(', ')}`);
      }
    };
  }

  /**
   * Start CLI application
   */
  start(): void {
    console.log('='.repeat(70));
    console.log('⚔️ ChallengesPure CLI - Challenge Management System');
    console.log('='.repeat(70));
    console.log('');
    console.log('Available commands:');
    console.log('  list [filter]     - List challenges');
    console.log('  show [id]         - Show challenge details');
    console.log('  start [id]        - Start challenge');
    console.log('  complete [id]     - Complete challenge');
    console.log('  search [text]     - Search challenges');
    console.log('  filter [type]     - Set filter');
    console.log('  stats             - Show challenge statistics');
    console.log('  progress          - Show completion progress');
    console.log('  setflag [flag]    - Set quest/lore flag');
    console.log('  setlocation [loc] - Set current location');
    console.log('  setlevel [level]  - Set player level');
    console.log('  capturespirit [id]- Capture spirit');
    console.log('  export [file]     - Export challenges to JSON');
    console.log('  import [file]     - Import challenges from JSON');
    console.log('  clear             - Clear all challenge data');
    console.log('  demo              - Reset demo data');
    console.log('  help              - Show this help');
    console.log('  exit              - Exit application');
    console.log('');

    this.showPrompt();
  }

  /**
   * Show command prompt
   */
  private showPrompt(): void {
    this.rl.question('ChallengesPure> ', (input) => {
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
        case 'list':
        case 'l':
          this.listChallenges(args);
          break;
        case 'show':
        case 's':
          this.showChallenge(args[0]);
          break;
        case 'start':
          this.startChallenge(args[0]);
          break;
        case 'complete':
        case 'c':
          this.completeChallenge(args[0], args.slice(1));
          break;
        case 'search':
          this.searchChallenges(args.join(' '));
          break;
        case 'filter':
        case 'f':
          this.setFilter(args);
          break;
        case 'stats':
          this.showStatistics();
          break;
        case 'progress':
        case 'p':
          this.showProgress();
          break;
        case 'setflag':
          this.setFlag(args[0]);
          break;
        case 'setlocation':
        case 'sl':
          this.setLocation(args[0]);
          break;
        case 'setlevel':
        case 'lvl':
          this.setLevel(args[0]);
          break;
        case 'capturespirit':
        case 'cs':
          this.captureSpirit(args[0]);
          break;
        case 'export':
        case 'e':
          this.exportChallenges(args[0]);
          break;
        case 'import':
        case 'i':
          this.importChallenges(args[0]);
          break;
        case 'clear':
          this.clearChallengeData();
          break;
        case 'demo':
        case 'd':
          this.resetDemo();
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
    console.log('⚔️ ChallengesPure CLI Help');
    console.log('Commands: help, list, show, start, complete, search, filter, stats, progress, setflag, setlocation, setlevel, capturespirit, export, import, clear, demo, exit');
  }

  /**
   * List challenges
   */
  private listChallenges(args: string[]): void {
    const filterType = args[0] || 'all';
    let filter: IChallengeFilter = { ...this.currentFilter };

    switch (filterType.toLowerCase()) {
      case 'available':
        filter.status = ChallengeStatus.AVAILABLE;
        break;
      case 'completed':
        filter.status = ChallengeStatus.COMPLETED;
        break;
      case 'locked':
        filter.status = ChallengeStatus.LOCKED;
        break;
      case 'progress':
        filter.status = ChallengeStatus.IN_PROGRESS;
        break;
      case 'tutorial':
        filter.category = ChallengeCategory.TUTORIAL;
        break;
      case 'story':
        filter.category = ChallengeCategory.MAIN_STORY;
        break;
      case 'daily':
        filter.category = ChallengeCategory.DAILY;
        break;
      case 'boss':
        filter.difficulty = ChallengeDifficulty.HARD;
        break;
      case 'easy':
        filter.difficulty = ChallengeDifficulty.EASY;
        break;
      case 'all':
      default:
        break;
    }

    const challenges = this.challengeManager.getFilteredChallenges(filter);

    console.log('='.repeat(70));
    console.log(`⚔️ Challenges (${challenges.length} found)`);
    console.log('='.repeat(70));

    if (challenges.length === 0) {
      console.log('No challenges match the filter criteria.');
      return;
    }

    challenges.forEach((challenge, index) => {
      const statusIcon = this.getStatusIcon(challenge.status);
      const difficultyIcon = this.getDifficultyIcon(challenge.difficulty);
      const categoryIcon = this.getCategoryIcon(challenge.category);
      const availability = challenge.isAvailable(this.playerContext) ? '✓' : '✗';

      console.log(`${index + 1}. ${statusIcon} ${difficultyIcon} ${categoryIcon} ${challenge.name}`);
      console.log(`   ID: ${challenge.challengeId} | Available: ${availability} | Priority: ${challenge.priority}`);
      console.log(`   Opponents: ${challenge.opponentTeam.length} | Turns: ${challenge.maxTurns || '∞'}`);
      console.log(`   ${challenge.getRewardDescription()}`);
      console.log('');
    });

    console.log(`Filter: ${filterType} | Total: ${challenges.length} challenges`);
  }

  /**
   * Show challenge details
   */
  private showChallenge(challengeId: string): void {
    if (!challengeId) {
      console.log('❌ Usage: show [challenge_id]');
      return;
    }

    const challenge = this.challengeManager.getChallenge(challengeId);
    if (!challenge) {
      console.log(`❌ Challenge not found: ${challengeId}`);
      return;
    }

    console.log('='.repeat(70));
    console.log(`⚔️ ${challenge.name}`);
    console.log('='.repeat(70));

    console.log(`ID: ${challenge.challengeId}`);
    console.log(`Category: ${this.getCategoryDisplay(challenge.category)}`);
    console.log(`Difficulty: ${this.getDifficultyDisplay(challenge.difficulty)}`);
    console.log(`Status: ${this.getStatusDisplay(challenge.status)}`);
    console.log(`Priority: ${challenge.priority}/10`);
    console.log(`Available: ${challenge.isAvailable(this.playerContext) ? '✅ Yes' : '❌ No'}`);
    console.log(`Opponents: ${challenge.opponentTeam.join(', ')}`);
    console.log(`Max Turns: ${challenge.maxTurns || 'No limit'}`);
    console.log(`Estimated Duration: ${challenge.getEstimatedDuration()} minutes`);
    console.log(`Completion: ${challenge.getCompletionPercentage()}%`);

    if (challenge.requiredFlags.length > 0) {
      console.log(`Required Flags: ${challenge.requiredFlags.join(', ')}`);
    }

    if (challenge.requiredLocationId) {
      console.log(`Required Location: ${challenge.requiredLocationId}`);
    }

    if (challenge.tags.length > 0) {
      console.log(`Tags: ${challenge.tags.join(', ')}`);
    }

    console.log('');
    console.log('Description:');
    console.log(challenge.description);

    console.log('');
    console.log('Rules:');
    console.log(`  ${challenge.ruleset.getDescription()}`);

    console.log('');
    console.log('Rewards:');
    console.log(`  ${challenge.getRewardDescription()}`);

    if (challenge.loreFlagsToSet.length > 0) {
      console.log(`  Lore Flags: ${challenge.loreFlagsToSet.join(', ')}`);
    }

    if (Object.keys(challenge.syncBoosts).length > 0) {
      console.log(`  Sync Boosts: ${Object.entries(challenge.syncBoosts).map(([spirit, boost]) => `${spirit} +${boost}`).join(', ')}`);
    }
  }

  /**
   * Start challenge
   */
  private startChallenge(challengeId: string): void {
    if (!challengeId) {
      console.log('❌ Usage: start [challenge_id]');
      return;
    }

    const challenge = this.challengeManager.getChallenge(challengeId);
    if (!challenge) {
      console.log(`❌ Challenge not found: ${challengeId}`);
      return;
    }

    if (challenge.status !== ChallengeStatus.AVAILABLE) {
      console.log(`❌ Challenge is not available (status: ${challenge.status})`);
      return;
    }

    if (!challenge.isAvailable(this.playerContext)) {
      console.log('❌ Challenge requirements not met');
      return;
    }

    if (this.challengeManager.startChallenge(challengeId)) {
      console.log(`✅ Started challenge: ${challenge.name}`);
    } else {
      console.log('❌ Failed to start challenge');
    }
  }

  /**
   * Complete challenge
   */
  private completeChallenge(challengeId: string, args: string[]): void {
    if (!challengeId) {
      console.log('❌ Usage: complete [challenge_id] [victory|defeat|timeout|forfeit] [turns]');
      return;
    }

    const challenge = this.challengeManager.getChallenge(challengeId);
    if (!challenge) {
      console.log(`❌ Challenge not found: ${challengeId}`);
      return;
    }

    if (challenge.status !== ChallengeStatus.IN_PROGRESS) {
      console.log(`❌ Challenge is not in progress (status: ${challenge.status})`);
      return;
    }

    const outcomeStr = args[0] || 'victory';
    const turnsStr = args[1] || '10';

    const outcome = this.parseOutcome(outcomeStr);
    const turns = parseInt(turnsStr);

    if (isNaN(turns) || turns < 0) {
      console.log('❌ Turns must be a non-negative number');
      return;
    }

    let result: ChallengeResult;
    let message = '';

    switch (outcome) {
      case ChallengeOutcome.VICTORY:
        result = ChallengeResult.victory(challenge.rewards, challenge.loreFlagsToSet, challenge.syncBoosts, 'Challenge completed successfully!', turns);
        message = `✅ Completed challenge: ${challenge.name}`;
        break;
      case ChallengeOutcome.DEFEAT:
        result = ChallengeResult.defeat('Challenge failed', turns);
        message = `❌ Failed challenge: ${challenge.name}`;
        break;
      case ChallengeOutcome.TIMEOUT:
        result = ChallengeResult.timeout(turns, 'Challenge timed out');
        message = `⏰ Timed out: ${challenge.name}`;
        break;
      case ChallengeOutcome.FORFEIT:
        result = ChallengeResult.forfeit('Challenge forfeited', turns);
        message = `🏳️ Forfeited: ${challenge.name}`;
        break;
      default:
        console.log('❌ Invalid outcome');
        return;
    }

    if (this.challengeManager.completeChallenge(challengeId, result)) {
      console.log(message);
      this.playerContext.completeChallenge(challengeId);
    } else {
      console.log('❌ Failed to complete challenge');
    }
  }

  /**
   * Search challenges
   */
  private searchChallenges(searchText: string): void {
    if (!searchText) {
      console.log('❌ Usage: search [text]');
      return;
    }

    const filter: IChallengeFilter = { searchText };
    const challenges = this.challengeManager.getFilteredChallenges(filter);

    console.log('='.repeat(70));
    console.log(`🔍 Search Results for "${searchText}" (${challenges.length} found)`);
    console.log('='.repeat(70));

    if (challenges.length === 0) {
      console.log('No challenges found matching the search text.');
      return;
    }

    challenges.forEach((challenge, index) => {
      const statusIcon = this.getStatusIcon(challenge.status);
      const difficultyIcon = this.getDifficultyIcon(challenge.difficulty);
      console.log(`${index + 1}. ${statusIcon} ${difficultyIcon} ${challenge.name}`);
      console.log(`   ${challenge.getSummary()}`);
      console.log('');
    });
  }

  /**
   * Set filter
   */
  private setFilter(args: string[]): void {
    if (args.length < 2) {
      console.log('❌ Usage: filter [type] [value]');
      return;
    }

    const filterType = args[0].toLowerCase();
    const filterValue = args[1];

    this.currentFilter = {};

    switch (filterType) {
      case 'category':
        if (Object.values(ChallengeCategory).includes(filterValue as ChallengeCategory)) {
          this.currentFilter.category = filterValue as ChallengeCategory;
        } else {
          console.log('❌ Invalid category. Available: tutorial, main_story, daily, etc.');
          return;
        }
        break;
      case 'difficulty':
        if (Object.values(ChallengeDifficulty).includes(filterValue as ChallengeDifficulty)) {
          this.currentFilter.difficulty = filterValue as ChallengeDifficulty;
        } else {
          console.log('❌ Invalid difficulty. Available: easy, medium, hard, expert, legendary');
          return;
        }
        break;
      case 'status':
        if (Object.values(ChallengeStatus).includes(filterValue as ChallengeStatus)) {
          this.currentFilter.status = filterValue as ChallengeStatus;
        } else {
          console.log('❌ Invalid status. Available: locked, available, in_progress, completed');
          return;
        }
        break;
    }

    console.log(`✅ Filter set: ${filterType} = ${filterValue}`);
  }

  /**
   * Show statistics
   */
  private showStatistics(): void {
    const stats = this.challengeManager.getStatistics();

    console.log('='.repeat(70));
    console.log('📊 Challenge Statistics');
    console.log('='.repeat(70));

    console.log(`Total Challenges: ${stats.totalChallenges}`);
    console.log(`Completed: ${stats.completedChallenges} (${stats.completionRate.toFixed(1)}%)`);
    console.log(`Available: ${stats.availableChallenges}`);
    console.log(`Locked: ${stats.lockedChallenges}`);
    console.log(`In Progress: ${stats.inProgressChallenges}`);

    console.log('');
    console.log('By Category:');
    Object.entries(stats.challengesByCategory).forEach(([category, count]) => {
      if (count > 0) {
        console.log(`  ${this.getCategoryDisplay(category as ChallengeCategory)}: ${count}`);
      }
    });

    console.log('');
    console.log('By Difficulty:');
    Object.entries(stats.challengesByDifficulty).forEach(([difficulty, count]) => {
      if (count > 0) {
        console.log(`  ${this.getDifficultyDisplay(difficulty as ChallengeDifficulty)}: ${count}`);
      }
    });

    if (Object.keys(stats.totalRewardsEarned).length > 0) {
      console.log('');
      console.log('Total Rewards Earned:');
      Object.entries(stats.totalRewardsEarned).forEach(([item, amount]) => {
        console.log(`  ${item}: ${amount}`);
      });
    }
  }

  /**
   * Show progress
   */
  private showProgress(): void {
    const stats = this.challengeManager.getStatistics();
    const progress = ChallengeUtils.getCompletionPercentage(stats.totalChallenges, stats.completedChallenges);

    console.log('='.repeat(70));
    console.log('📈 Challenge Progress');
    console.log('='.repeat(70));

    console.log(`Completion: ${progress.percentage.toFixed(1)}% (${stats.completedChallenges}/${stats.totalChallenges})`);
    console.log(`Remaining: ${progress.remaining} challenges`);

    const progressBar = this.createProgressBar(progress.percentage / 100, 20);
    console.log(`Progress: ${progressBar}`);

    console.log('');
    console.log('Completion Status:');
    if (progress.percentage >= 90) {
      console.log('🏆 Excellent! Almost complete!');
    } else if (progress.percentage >= 75) {
      console.log('🎉 Great progress! Keep going!');
    } else if (progress.percentage >= 50) {
      console.log('⚔️ Good progress! Halfway there!');
    } else if (progress.percentage >= 25) {
      console.log('🛡️ Making progress! Keep challenging!');
    } else {
      console.log('🌟 Just getting started!');
    }
  }

  /**
   * Set flag
   */
  private setFlag(flagId: string): void {
    if (!flagId) {
      console.log('❌ Usage: setflag [flag_id]');
      return;
    }

    this.playerContext.setQuestFlag(flagId);
    this.playerContext.setLoreFlag(flagId);
    console.log(`✅ Flag "${flagId}" set`);
  }

  /**
   * Set location
   */
  private setLocation(locationId: string): void {
    if (!locationId) {
      console.log('❌ Usage: setlocation [location_id]');
      return;
    }

    this.playerContext.setLocation(locationId);
    console.log(`✅ Current location set to "${locationId}"`);
  }

  /**
   * Set player level
   */
  private setLevel(levelStr: string): void {
    if (!levelStr) {
      console.log('❌ Usage: setlevel [level]');
      return;
    }

    const level = parseInt(levelStr);
    if (isNaN(level) || level < 1) {
      console.log('❌ Level must be a positive number');
      return;
    }

    this.playerContext.setPlayerLevel(level);
    console.log(`✅ Player level set to ${level}`);
  }

  /**
   * Capture spirit
   */
  private captureSpirit(spiritId: string): void {
    if (!spiritId) {
      console.log('❌ Usage: capturespirit [spirit_id]');
      return;
    }

    this.playerContext.captureSpirit(spiritId);
    console.log(`✅ Spirit "${spiritId}" captured`);
  }

  /**
   * Export challenges to file
   */
  private exportChallenges(filename: string): void {
    if (!filename) {
      console.log('❌ Usage: export [filename]');
      return;
    }

    try {
      const challenges = this.challengeManager.getAllChallenges();
      const jsonData = JSON.stringify(challenges.map((c: any) => c.toJSON()), null, 2);
      fs.writeFileSync(filename, jsonData);
      console.log(`✅ Challenges exported to ${filename} (${jsonData.length} bytes)`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.log(`❌ Failed to export challenges: ${error}`);
    }
  }

  /**
   * Import challenges from file
   */
  private importChallenges(filename: string): void {
    if (!filename) {
      console.log('❌ Usage: import [filename]');
      return;
    }

    try {
      if (!fs.existsSync(filename)) {
        console.log(`❌ File not found: ${filename}`);
        return;
      }

      const jsonData = fs.readFileSync(filename, 'utf8');
      const challengesData: any[] = JSON.parse(jsonData);

      const oldCount = this.challengeManager.getAllChallenges().length;

      challengesData.forEach(challengeData => {
        const challenge = BattleChallenge.fromJSON(challengeData);
        this.challengeManager.registerChallenge(challenge);
      });

      const newCount = this.challengeManager.getAllChallenges().length;

      console.log(`✅ Challenges imported from ${filename}`);
      console.log(`📊 Challenges: ${oldCount} → ${newCount}`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.log(`❌ Failed to import challenges: ${error}`);
    }
  }

  /**
   * Clear challenge data
   */
  private clearChallengeData(): void {
    const challengeCount = this.challengeManager.getAllChallenges().length;
    // Note: ChallengeManager doesn't have a clear method, so we'll recreate it
    this.challengeManager = new ChallengeManager();
    console.log(`🗑️ Cleared ${challengeCount} challenges`);
  }

  /**
   * Reset demo data
   */
  private resetDemo(): void {
    this.clearChallengeData();
    this.initializeDemoData();
    console.log('🔄 Demo data reset');
  }

  /**
   * Parse outcome string
   */
  private parseOutcome(outcomeStr: string): ChallengeOutcome {
    switch (outcomeStr.toLowerCase()) {
      case 'victory':
        return ChallengeOutcome.VICTORY;
      case 'defeat':
        return ChallengeOutcome.DEFEAT;
      case 'timeout':
        return ChallengeOutcome.TIMEOUT;
      case 'forfeit':
        return ChallengeOutcome.FORFEIT;
      default:
        return ChallengeOutcome.VICTORY;
    }
  }

  /**
   * Get status icon
   */
  private getStatusIcon(status: ChallengeStatus): string {
    switch (status) {
      case ChallengeStatus.LOCKED: return '🔒';
      case ChallengeStatus.AVAILABLE: return '⚔️';
      case ChallengeStatus.IN_PROGRESS: return '⚡';
      case ChallengeStatus.COMPLETED: return '🏆';
      default: return '❓';
    }
  }

  /**
   * Get difficulty icon
   */
  private getDifficultyIcon(difficulty: ChallengeDifficulty): string {
    switch (difficulty) {
      case ChallengeDifficulty.EASY: return '🟢';
      case ChallengeDifficulty.MEDIUM: return '🟡';
      case ChallengeDifficulty.HARD: return '🟠';
      case ChallengeDifficulty.EXPERT: return '🔴';
      case ChallengeDifficulty.LEGENDARY: return '🟣';
      default: return '⚪';
    }
  }

  /**
   * Get category icon
   */
  private getCategoryIcon(category: ChallengeCategory): string {
    switch (category) {
      case ChallengeCategory.TUTORIAL: return '📚';
      case ChallengeCategory.MAIN_STORY: return '📜';
      case ChallengeCategory.SIDE_QUEST: return '📖';
      case ChallengeCategory.DAILY: return '🌅';
      case ChallengeCategory.WEEKLY: return '📅';
      case ChallengeCategory.SPECIAL: return '✨';
      case ChallengeCategory.ACHIEVEMENT: return '🏅';
      default: return '📄';
    }
  }

  /**
   * Get status display
   */
  private getStatusDisplay(status: ChallengeStatus): string {
    switch (status) {
      case ChallengeStatus.LOCKED: return '🔒 Locked';
      case ChallengeStatus.AVAILABLE: return '⚔️ Available';
      case ChallengeStatus.IN_PROGRESS: return '⚡ In Progress';
      case ChallengeStatus.COMPLETED: return '🏆 Completed';
      default: return 'Unknown';
    }
  }

  /**
   * Get difficulty display
   */
  private getDifficultyDisplay(difficulty: ChallengeDifficulty): string {
    switch (difficulty) {
      case ChallengeDifficulty.EASY: return '🟢 Easy';
      case ChallengeDifficulty.MEDIUM: return '🟡 Medium';
      case ChallengeDifficulty.HARD: return '🟠 Hard';
      case ChallengeDifficulty.EXPERT: return '🔴 Expert';
      case ChallengeDifficulty.LEGENDARY: return '🟣 Legendary';
      default: return 'Unknown';
    }
  }

  /**
   * Get category display
   */
  private getCategoryDisplay(category: ChallengeCategory): string {
    switch (category) {
      case ChallengeCategory.TUTORIAL: return '📚 Tutorial';
      case ChallengeCategory.MAIN_STORY: return '📜 Main Story';
      case ChallengeCategory.SIDE_QUEST: return '📖 Side Quest';
      case ChallengeCategory.DAILY: return '🌅 Daily';
      case ChallengeCategory.WEEKLY: return '📅 Weekly';
      case ChallengeCategory.SPECIAL: return '✨ Special';
      case ChallengeCategory.ACHIEVEMENT: return '🏅 Achievement';
      default: return 'Unknown';
    }
  }

  /**
   * Create progress bar
   */
  private createProgressBar(percentage: number, length: number = 20): string {
    const filledLength = Math.round(percentage * length);
    const emptyLength = length - filledLength;
    const filled = '█'.repeat(filledLength);
    const empty = '░'.repeat(emptyLength);
    return `[${filled}${empty}] ${Math.round(percentage * 100)}%`;
  }

  /**
   * Exit application
   */
  private exit(): void {
    console.log('');
    console.log('👋 Thank you for using ChallengesPure CLI!');
    this.rl.close();
    process.exit(0);
  }
}

// Start CLI if run directly
if (require.main === module) {
  const cli = new ChallengesPureCLI();
  cli.start();
}

export { ChallengesPureCLI };