#!/usr/bin/env node

/**
 * ChallengesPure CLI Harness
 *
 * Interactive command-line interface for testing and demonstrating
 * the ChallengesPure challenge management system.
 */

import * as readline from 'readline';
import * as fs from 'fs';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';
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
    this.logger = new StructuredLogger({ module: 'MockPlayerContext' });
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
    this.logger.info('Initializing ChallengesPure CLI with demo data...');

    // Create sample challenges
    this.createDemoChallenges();

    // Set up player context
    this.playerContext.setQuestFlag('tutorial_complete');
    this.playerContext.setLoreFlag('fire_spirit_defeated');
    this.playerContext.setLocation('forest_village');
    this.playerContext.setPlayerLevel(5);
    this.playerContext.captureSpirit('fire_spirit');
    this.playerContext.unlockLocation('mountain_peak');

    this.logger.info('Demo data created. Use "list" to see available challenges.');
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
      this.logger.info(`🎯 Challenge started: ${challenge.name}`);
    };

    this.challengeManager.onChallengeCompleted = (challenge, result) => {
      this.logger.info(`🏆 Challenge completed: ${challenge.name} (${result.outcome})`);
      if (result.itemRewards && Object.keys(result.itemRewards).length > 0) {
        this.logger.info(`  Rewards: ${Object.entries(result.itemRewards).map(([item, amount]) => `${amount} ${item}`).join(', ')}`);
      }
    };
  }

  /**
   * Start CLI application
   */
  start(): void {
    this.logger.info('='.repeat(70));
    this.logger.info('⚔️ ChallengesPure CLI - Challenge Management System');
    this.logger.info('='.repeat(70));
    this.logger.info('');
    this.logger.info('Available commands:');
    this.logger.info('  list [filter]     - List challenges');
    this.logger.info('  show [id]         - Show challenge details');
    this.logger.info('  start [id]        - Start challenge');
    this.logger.info('  complete [id]     - Complete challenge');
    this.logger.info('  search [text]     - Search challenges');
    this.logger.info('  filter [type]     - Set filter');
    this.logger.info('  stats             - Show challenge statistics');
    this.logger.info('  progress          - Show completion progress');
    this.logger.info('  setflag [flag]    - Set quest/lore flag');
    this.logger.info('  setlocation [loc] - Set current location');
    this.logger.info('  setlevel [level]  - Set player level');
    this.logger.info('  capturespirit [id]- Capture spirit');
    this.logger.info('  export [file]     - Export challenges to JSON');
    this.logger.info('  import [file]     - Import challenges from JSON');
    this.logger.info('  clear             - Clear all challenge data');
    this.logger.info('  demo              - Reset demo data');
    this.logger.info('  help              - Show this help');
    this.logger.info('  exit              - Exit application');
    this.logger.info('');

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
    this.logger.info('⚔️ ChallengesPure CLI Help');
    this.logger.info('Commands: help, list, show, start, complete, search, filter, stats, progress, setflag, setlocation, setlevel, capturespirit, export, import, clear, demo, exit');
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

    this.logger.info('='.repeat(70));
    this.logger.info(`⚔️ Challenges (${challenges.length} found)`);
    this.logger.info('='.repeat(70));

    if (challenges.length === 0) {
      this.logger.info('No challenges match the filter criteria.');
      return;
    }

    challenges.forEach((challenge, index) => {
      const statusIcon = this.getStatusIcon(challenge.status);
      const difficultyIcon = this.getDifficultyIcon(challenge.difficulty);
      const categoryIcon = this.getCategoryIcon(challenge.category);
      const availability = challenge.isAvailable(this.playerContext) ? '✓' : '✗';

      this.logger.info(`${index + 1}. ${statusIcon} ${difficultyIcon} ${categoryIcon} ${challenge.name}`);
      this.logger.info(`   ID: ${challenge.challengeId} | Available: ${availability} | Priority: ${challenge.priority}`);
      this.logger.info(`   Opponents: ${challenge.opponentTeam.length} | Turns: ${challenge.maxTurns || '∞'}`);
      this.logger.info(`   ${challenge.getRewardDescription()}`);
      this.logger.info('');
    });

    this.logger.info(`Filter: ${filterType} | Total: ${challenges.length} challenges`);
  }

  /**
   * Show challenge details
   */
  private showChallenge(challengeId: string): void {
    if (!challengeId) {
      this.logger.info('❌ Usage: show [challenge_id]');
      return;
    }

    const challenge = this.challengeManager.getChallenge(challengeId);
    if (!challenge) {
      this.logger.info(`❌ Challenge not found: ${challengeId}`);
      return;
    }

    this.logger.info('='.repeat(70));
    this.logger.info(`⚔️ ${challenge.name}`);
    this.logger.info('='.repeat(70));

    this.logger.info(`ID: ${challenge.challengeId}`);
    this.logger.info(`Category: ${this.getCategoryDisplay(challenge.category)}`);
    this.logger.info(`Difficulty: ${this.getDifficultyDisplay(challenge.difficulty)}`);
    this.logger.info(`Status: ${this.getStatusDisplay(challenge.status)}`);
    this.logger.info(`Priority: ${challenge.priority}/10`);
    this.logger.info(`Available: ${challenge.isAvailable(this.playerContext) ? '✅ Yes' : '❌ No'}`);
    this.logger.info(`Opponents: ${challenge.opponentTeam.join(', ')}`);
    this.logger.info(`Max Turns: ${challenge.maxTurns || 'No limit'}`);
    this.logger.info(`Estimated Duration: ${challenge.getEstimatedDuration()} minutes`);
    this.logger.info(`Completion: ${challenge.getCompletionPercentage()}%`);

    if (challenge.requiredFlags.length > 0) {
      this.logger.info(`Required Flags: ${challenge.requiredFlags.join(', ')}`);
    }

    if (challenge.requiredLocationId) {
      this.logger.info(`Required Location: ${challenge.requiredLocationId}`);
    }

    if (challenge.tags.length > 0) {
      this.logger.info(`Tags: ${challenge.tags.join(', ')}`);
    }

    this.logger.info('');
    this.logger.info('Description:');
    this.logger.info(challenge.description);

    this.logger.info('');
    this.logger.info('Rules:');
    this.logger.info(`  ${challenge.ruleset.getDescription()}`);

    this.logger.info('');
    this.logger.info('Rewards:');
    this.logger.info(`  ${challenge.getRewardDescription()}`);

    if (challenge.loreFlagsToSet.length > 0) {
      this.logger.info(`  Lore Flags: ${challenge.loreFlagsToSet.join(', ')}`);
    }

    if (Object.keys(challenge.syncBoosts).length > 0) {
      this.logger.info(`  Sync Boosts: ${Object.entries(challenge.syncBoosts).map(([spirit, boost]) => `${spirit} +${boost}`).join(', ')}`);
    }
  }

  /**
   * Start challenge
   */
  private startChallenge(challengeId: string): void {
    if (!challengeId) {
      this.logger.info('❌ Usage: start [challenge_id]');
      return;
    }

    const challenge = this.challengeManager.getChallenge(challengeId);
    if (!challenge) {
      this.logger.info(`❌ Challenge not found: ${challengeId}`);
      return;
    }

    if (challenge.status !== ChallengeStatus.AVAILABLE) {
      this.logger.info(`❌ Challenge is not available (status: ${challenge.status})`);
      return;
    }

    if (!challenge.isAvailable(this.playerContext)) {
      this.logger.info('❌ Challenge requirements not met');
      return;
    }

    if (this.challengeManager.startChallenge(challengeId)) {
      this.logger.info(`✅ Started challenge: ${challenge.name}`);
    } else {
      this.logger.info('❌ Failed to start challenge');
    }
  }

  /**
   * Complete challenge
   */
  private completeChallenge(challengeId: string, args: string[]): void {
    if (!challengeId) {
      this.logger.info('❌ Usage: complete [challenge_id] [victory|defeat|timeout|forfeit] [turns]');
      return;
    }

    const challenge = this.challengeManager.getChallenge(challengeId);
    if (!challenge) {
      this.logger.info(`❌ Challenge not found: ${challengeId}`);
      return;
    }

    if (challenge.status !== ChallengeStatus.IN_PROGRESS) {
      this.logger.info(`❌ Challenge is not in progress (status: ${challenge.status})`);
      return;
    }

    const outcomeStr = args[0] || 'victory';
    const turnsStr = args[1] || '10';

    const outcome = this.parseOutcome(outcomeStr);
    const turns = parseInt(turnsStr);

    if (isNaN(turns) || turns < 0) {
      this.logger.info('❌ Turns must be a non-negative number');
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
        this.logger.info('❌ Invalid outcome');
        return;
    }

    if (this.challengeManager.completeChallenge(challengeId, result)) {
      this.logger.info(message);
      this.playerContext.completeChallenge(challengeId);
    } else {
      this.logger.info('❌ Failed to complete challenge');
    }
  }

  /**
   * Search challenges
   */
  private searchChallenges(searchText: string): void {
    if (!searchText) {
      this.logger.info('❌ Usage: search [text]');
      return;
    }

    const filter: IChallengeFilter = { searchText };
    const challenges = this.challengeManager.getFilteredChallenges(filter);

    this.logger.info('='.repeat(70));
    this.logger.info(`🔍 Search Results for "${searchText}" (${challenges.length} found)`);
    this.logger.info('='.repeat(70));

    if (challenges.length === 0) {
      this.logger.info('No challenges found matching the search text.');
      return;
    }

    challenges.forEach((challenge, index) => {
      const statusIcon = this.getStatusIcon(challenge.status);
      const difficultyIcon = this.getDifficultyIcon(challenge.difficulty);
      this.logger.info(`${index + 1}. ${statusIcon} ${difficultyIcon} ${challenge.name}`);
      this.logger.info(`   ${challenge.getSummary()}`);
      this.logger.info('');
    });
  }

  /**
   * Set filter
   */
  private setFilter(args: string[]): void {
    if (args.length < 2) {
      this.logger.info('❌ Usage: filter [type] [value]');
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
          this.logger.info('❌ Invalid category. Available: tutorial, main_story, daily, etc.');
          return;
        }
        break;
      case 'difficulty':
        if (Object.values(ChallengeDifficulty).includes(filterValue as ChallengeDifficulty)) {
          this.currentFilter.difficulty = filterValue as ChallengeDifficulty;
        } else {
          this.logger.info('❌ Invalid difficulty. Available: easy, medium, hard, expert, legendary');
          return;
        }
        break;
      case 'status':
        if (Object.values(ChallengeStatus).includes(filterValue as ChallengeStatus)) {
          this.currentFilter.status = filterValue as ChallengeStatus;
        } else {
          this.logger.info('❌ Invalid status. Available: locked, available, in_progress, completed');
          return;
        }
        break;
    }

    this.logger.info(`✅ Filter set: ${filterType} = ${filterValue}`);
  }

  /**
   * Show statistics
   */
  private showStatistics(): void {
    const stats = this.challengeManager.getStatistics();

    this.logger.info('='.repeat(70));
    this.logger.info('📊 Challenge Statistics');
    this.logger.info('='.repeat(70));

    this.logger.info(`Total Challenges: ${stats.totalChallenges}`);
    this.logger.info(`Completed: ${stats.completedChallenges} (${stats.completionRate.toFixed(1)}%)`);
    this.logger.info(`Available: ${stats.availableChallenges}`);
    this.logger.info(`Locked: ${stats.lockedChallenges}`);
    this.logger.info(`In Progress: ${stats.inProgressChallenges}`);

    this.logger.info('');
    this.logger.info('By Category:');
    Object.entries(stats.challengesByCategory).forEach(([category, count]) => {
      if (count > 0) {
        this.logger.info(`  ${this.getCategoryDisplay(category as ChallengeCategory)}: ${count}`);
      }
    });

    this.logger.info('');
    this.logger.info('By Difficulty:');
    Object.entries(stats.challengesByDifficulty).forEach(([difficulty, count]) => {
      if (count > 0) {
        this.logger.info(`  ${this.getDifficultyDisplay(difficulty as ChallengeDifficulty)}: ${count}`);
      }
    });

    if (Object.keys(stats.totalRewardsEarned).length > 0) {
      this.logger.info('');
      this.logger.info('Total Rewards Earned:');
      Object.entries(stats.totalRewardsEarned).forEach(([item, amount]) => {
        this.logger.info(`  ${item}: ${amount}`);
      });
    }
  }

  /**
   * Show progress
   */
  private showProgress(): void {
    const stats = this.challengeManager.getStatistics();
    const progress = ChallengeUtils.getCompletionPercentage(stats.totalChallenges, stats.completedChallenges);

    this.logger.info('='.repeat(70));
    this.logger.info('📈 Challenge Progress');
    this.logger.info('='.repeat(70));

    this.logger.info(`Completion: ${progress.percentage.toFixed(1)}% (${stats.completedChallenges}/${stats.totalChallenges})`);
    this.logger.info(`Remaining: ${progress.remaining} challenges`);

    const progressBar = this.createProgressBar(progress.percentage / 100, 20);
    this.logger.info(`Progress: ${progressBar}`);

    this.logger.info('');
    this.logger.info('Completion Status:');
    if (progress.percentage >= 90) {
      this.logger.info('🏆 Excellent! Almost complete!');
    } else if (progress.percentage >= 75) {
      this.logger.info('🎉 Great progress! Keep going!');
    } else if (progress.percentage >= 50) {
      this.logger.info('⚔️ Good progress! Halfway there!');
    } else if (progress.percentage >= 25) {
      this.logger.info('🛡️ Making progress! Keep challenging!');
    } else {
      this.logger.info('🌟 Just getting started!');
    }
  }

  /**
   * Set flag
   */
  private setFlag(flagId: string): void {
    if (!flagId) {
      this.logger.info('❌ Usage: setflag [flag_id]');
      return;
    }

    this.playerContext.setQuestFlag(flagId);
    this.playerContext.setLoreFlag(flagId);
    this.logger.info(`✅ Flag "${flagId}" set`);
  }

  /**
   * Set location
   */
  private setLocation(locationId: string): void {
    if (!locationId) {
      this.logger.info('❌ Usage: setlocation [location_id]');
      return;
    }

    this.playerContext.setLocation(locationId);
    this.logger.info(`✅ Current location set to "${locationId}"`);
  }

  /**
   * Set player level
   */
  private setLevel(levelStr: string): void {
    if (!levelStr) {
      this.logger.info('❌ Usage: setlevel [level]');
      return;
    }

    const level = parseInt(levelStr);
    if (isNaN(level) || level < 1) {
      this.logger.info('❌ Level must be a positive number');
      return;
    }

    this.playerContext.setPlayerLevel(level);
    this.logger.info(`✅ Player level set to ${level}`);
  }

  /**
   * Capture spirit
   */
  private captureSpirit(spiritId: string): void {
    if (!spiritId) {
      this.logger.info('❌ Usage: capturespirit [spirit_id]');
      return;
    }

    this.playerContext.captureSpirit(spiritId);
    this.logger.info(`✅ Spirit "${spiritId}" captured`);
  }

  /**
   * Export challenges to file
   */
  private exportChallenges(filename: string): void {
    if (!filename) {
      this.logger.info('❌ Usage: export [filename]');
      return;
    }

    try {
      const challenges = this.challengeManager.getAllChallenges();
      const jsonData = JSON.stringify(challenges.map(c => c.toJSON()), null, 2);
      fs.writeFileSync(filename, jsonData);
      this.logger.info(`✅ Challenges exported to ${filename} (${jsonData.length} bytes)`);
    } catch (error) {
      this.logger.info(`❌ Failed to export challenges: ${error}`);
    }
  }

  /**
   * Import challenges from file
   */
  private importChallenges(filename: string): void {
    if (!filename) {
      this.logger.info('❌ Usage: import [filename]');
      return;
    }

    try {
      if (!fs.existsSync(filename)) {
        this.logger.info(`❌ File not found: ${filename}`);
        return;
      }

      const jsonData = fs.readFileSync(filename, 'utf8');
      const challengesData: any[] = SafeJSONParser.parse(jsonData);

      const oldCount = this.challengeManager.getAllChallenges().length;

      challengesData.forEach(challengeData => {
        const challenge = BattleChallenge.fromJSON(challengeData);
        this.challengeManager.registerChallenge(challenge);
      });

      const newCount = this.challengeManager.getAllChallenges().length;

      this.logger.info(`✅ Challenges imported from ${filename}`);
      this.logger.info(`📊 Challenges: ${oldCount} → ${newCount}`);
    } catch (error) {
      this.logger.info(`❌ Failed to import challenges: ${error}`);
    }
  }

  /**
   * Clear challenge data
   */
  private clearChallengeData(): void {
    const challengeCount = this.challengeManager.getAllChallenges().length;
    // Note: ChallengeManager doesn't have a clear method, so we'll recreate it
    this.challengeManager = new ChallengeManager();
    this.logger.info(`🗑️ Cleared ${challengeCount} challenges`);
  }

  /**
   * Reset demo data
   */
  private resetDemo(): void {
    this.clearChallengeData();
    this.initializeDemoData();
    this.logger.info('🔄 Demo data reset');
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
    this.logger.info('');
    this.logger.info('👋 Thank you for using ChallengesPure CLI!');
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