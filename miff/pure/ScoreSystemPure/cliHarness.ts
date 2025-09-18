/**
 * CLI Harness for ScoreSystemPure
 * 
 * Provides comprehensive CLI interface for score management including
 * score tracking, leaderboards, achievements, and multi-format export.
 * 
 * @module ScoreSystemPure/cliHarness
 * @version 1.0.0
 * @license MIT
 */

import { ScoreManager, ScoreEvent, ScoreBonus, ScorePenalty, Achievement } from './Manager';
import { parseCLIArgs, formatOutput } from '../shared/cliHarnessUtils';

const { mode, args } = parseCLIArgs(process.argv);
const manager = new ScoreManager();

// Parse additional arguments
const scoreId = args.find(arg => arg.startsWith('--score-id='))?.split('=')[1] || 'test_score';
const category = args.find(arg => arg.startsWith('--category='))?.split('=')[1] || 'general';
const initialScore = parseInt(args.find(arg => arg.startsWith('--initial-score='))?.split('=')[1] || '0');
const format = args.find(arg => arg.startsWith('--format='))?.split('=')[1] as 'json' | 'manifest' | 'summary' | 'leaderboards' || 'json';

let output: any;

try {
  switch (mode) {
    case 'create-score':
      output = manager.createScore(scoreId, category, initialScore);
      break;

    case 'get-score':
      output = manager.getScore(scoreId);
      break;

    case 'update-score':
      const updates = args.includes('--updates') ? JSON.parse(args.find(arg => arg.startsWith('--updates='))!.split('=')[1]) : {};
      output = manager.updateScore(scoreId, updates);
      break;

    case 'apply-events':
      const events: ScoreEvent[] = args.includes('--events') ? JSON.parse(args.find(arg => arg.startsWith('--events='))!.split('=')[1]) : [
        { id: 'evt1', type: 'add', value: 100, category: 'general', source: 'test', timestamp: Date.now() },
        { id: 'evt2', type: 'multiply', value: 1.5, category: 'bonus', source: 'test', timestamp: Date.now() }
      ];
      output = manager.applyEvents(scoreId, events);
      break;

    case 'add-bonus':
      const bonus: ScoreBonus = {
        id: args.find(arg => arg.startsWith('--bonus-id='))?.split('=')[1] || 'bonus_1',
        name: args.find(arg => arg.startsWith('--name='))?.split('=')[1] || 'Test Bonus',
        multiplier: parseFloat(args.find(arg => arg.startsWith('--multiplier='))?.split('=')[1] || '1.2'),
        duration: args.includes('--duration') ? parseInt(args.find(arg => arg.startsWith('--duration='))!.split('=')[1]) : undefined,
        source: args.find(arg => arg.startsWith('--source='))?.split('=')[1] || 'test',
        metadata: args.includes('--metadata') ? JSON.parse(args.find(arg => arg.startsWith('--metadata='))!.split('=')[1]) : undefined
      };
      output = manager.addBonus(scoreId, bonus);
      break;

    case 'add-penalty':
      const penalty: ScorePenalty = {
        id: args.find(arg => arg.startsWith('--penalty-id='))?.split('=')[1] || 'penalty_1',
        name: args.find(arg => arg.startsWith('--name='))?.split('=')[1] || 'Test Penalty',
        reduction: parseFloat(args.find(arg => arg.startsWith('--reduction='))?.split('=')[1] || '50'),
        duration: args.includes('--duration') ? parseInt(args.find(arg => arg.startsWith('--duration='))!.split('=')[1]) : undefined,
        source: args.find(arg => arg.startsWith('--source='))?.split('=')[1] || 'test',
        metadata: args.includes('--metadata') ? JSON.parse(args.find(arg => arg.startsWith('--metadata='))!.split('=')[1]) : undefined
      };
      output = manager.addPenalty(scoreId, penalty);
      break;

    case 'register-achievement':
      const achievement: Achievement = {
        id: args.find(arg => arg.startsWith('--achievement-id='))?.split('=')[1] || 'achievement_1',
        name: args.find(arg => arg.startsWith('--name='))?.split('=')[1] || 'Test Achievement',
        description: args.find(arg => arg.startsWith('--description='))?.split('=')[1] || 'Test achievement description',
        category: args.find(arg => arg.startsWith('--category='))?.split('=')[1] || 'general',
        requirements: args.includes('--requirements') ? JSON.parse(args.find(arg => arg.startsWith('--requirements='))!.split('=')[1]) : [
          { type: 'score_threshold', value: 1000, category: 'general' }
        ],
        rewards: args.includes('--rewards') ? JSON.parse(args.find(arg => arg.startsWith('--rewards='))!.split('=')[1]) : [
          { type: 'score_bonus', value: 100 }
        ],
        unlocked: false,
        metadata: args.includes('--metadata') ? JSON.parse(args.find(arg => arg.startsWith('--metadata='))!.split('=')[1]) : undefined
      };
      output = manager.registerAchievement(achievement);
      break;

    case 'check-achievements':
      output = manager.checkAchievements(scoreId);
      break;

    case 'update-leaderboard':
      const leaderboardId = args.find(arg => arg.startsWith('--leaderboard-id='))?.split('=')[1] || 'general';
      const playerId = args.find(arg => arg.startsWith('--player-id='))?.split('=')[1] || 'player_1';
      const playerName = args.find(arg => arg.startsWith('--player-name='))?.split('=')[1] || 'Test Player';
      const score = parseInt(args.find(arg => arg.startsWith('--score='))?.split('=')[1] || '1000');
      output = manager.updateLeaderboard(leaderboardId, playerId, playerName, score);
      break;

    case 'get-leaderboard':
      const leaderboardId2 = args.find(arg => arg.startsWith('--leaderboard-id='))?.split('=')[1] || 'general';
      const limit = args.includes('--limit') ? parseInt(args.find(arg => arg.startsWith('--limit='))!.split('=')[1]) : undefined;
      output = manager.getLeaderboard(leaderboardId2, limit);
      break;

    case 'list-scores':
      const filter: any = {};
      if (args.includes('--category')) filter.category = category;
      if (args.includes('--min-score')) filter.minScore = parseInt(args.find(arg => arg.startsWith('--min-score='))!.split('=')[1]);
      if (args.includes('--max-score')) filter.maxScore = parseInt(args.find(arg => arg.startsWith('--max-score='))!.split('=')[1]);
      if (args.includes('--has-achievements')) filter.hasAchievements = true;
      if (args.includes('--level')) filter.level = parseInt(args.find(arg => arg.startsWith('--level='))!.split('=')[1]);
      if (args.includes('--source')) filter.source = args.find(arg => arg.startsWith('--source='))!.split('=')[1];
      
      output = manager.listScores(filter);
      break;

    case 'stats':
      output = manager.getStats();
      break;

    case 'export':
      output = manager.exportScores(format);
      break;

    case 'reset':
      output = manager.resetScores();
      break;

    case 'demo':
      // Create demo score scenarios
      manager.createScore('demo_player_1', 'combat', 500);
      manager.createScore('demo_player_2', 'exploration', 750);
      manager.createScore('demo_player_3', 'crafting', 300);

      // Apply events
      manager.applyEvents('demo_player_1', [
        { id: 'combat_win', type: 'add', value: 200, category: 'combat', source: 'battle', timestamp: Date.now() },
        { id: 'bonus_multiplier', type: 'multiply', value: 1.5, category: 'bonus', source: 'achievement', timestamp: Date.now() }
      ]);

      // Add bonuses and penalties
      manager.addBonus('demo_player_1', {
        id: 'streak_bonus',
        name: 'Win Streak Bonus',
        multiplier: 1.2,
        duration: 3600,
        source: 'streak'
      });

      manager.addPenalty('demo_player_2', {
        id: 'time_penalty',
        name: 'Time Penalty',
        reduction: 50,
        duration: 1800,
        source: 'timeout'
      });

      // Register achievements
      manager.registerAchievement({
        id: 'first_blood',
        name: 'First Blood',
        description: 'Win your first battle',
        category: 'combat',
        requirements: [{ type: 'score_threshold', value: 100, category: 'combat' }],
        rewards: [{ type: 'score_bonus', value: 50 }],
        unlocked: false
      });

      // Check achievements
      manager.checkAchievements('demo_player_1');

      // Update leaderboards
      manager.updateLeaderboard('combat_leaderboard', 'demo_player_1', 'Player 1', 750);
      manager.updateLeaderboard('exploration_leaderboard', 'demo_player_2', 'Player 2', 750);
      manager.updateLeaderboard('crafting_leaderboard', 'demo_player_3', 'Player 3', 300);

      output = {
        op: 'demo',
        status: 'ok',
        result: {
          message: 'Demo score scenarios completed',
          scores: manager.listScores().result,
          leaderboards: {
            combat: manager.getLeaderboard('combat_leaderboard').result,
            exploration: manager.getLeaderboard('exploration_leaderboard').result,
            crafting: manager.getLeaderboard('crafting_leaderboard').result
          },
          stats: manager.getStats().result
        }
      };
      break;

    case 'sample':
      // Create sample score scenarios
      const sampleScenarios = [
        {
          id: 'tournament_scenario',
          scores: [
            { id: 'tournament_winner', category: 'tournament', initialScore: 1000 },
            { id: 'tournament_runner_up', category: 'tournament', initialScore: 750 },
            { id: 'tournament_third', category: 'tournament', initialScore: 500 }
          ]
        },
        {
          id: 'daily_challenge_scenario',
          scores: [
            { id: 'daily_challenger_1', category: 'daily', initialScore: 200 },
            { id: 'daily_challenger_2', category: 'daily', initialScore: 150 },
            { id: 'daily_challenger_3', category: 'daily', initialScore: 100 }
          ]
        }
      ];

      const scenarioResults = sampleScenarios.map(scenario => {
        scenario.scores.forEach(score => {
          manager.createScore(score.id, score.category, score.initialScore);
        });

        return {
          scenario: scenario.id,
          scores: scenario.scores.length,
          scoreIds: scenario.scores.map(s => s.id)
        };
      });

      output = {
        op: 'sample',
        status: 'ok',
        result: {
          message: 'Sample score scenarios created',
          scenarios: scenarioResults
        }
      };
      break;

    default:
      output = {
        op: 'help',
        status: 'ok',
        result: {
          availableCommands: [
            'create-score --score-id=<id> --category=<category> [--initial-score=<num>]',
            'get-score --score-id=<id>',
            'update-score --score-id=<id> --updates=<json>',
            'apply-events --score-id=<id> [--events=<json>]',
            'add-bonus --score-id=<id> --bonus-id=<id> --name=<name> --multiplier=<num> [--duration=<num>]',
            'add-penalty --score-id=<id> --penalty-id=<id> --name=<name> --reduction=<num> [--duration=<num>]',
            'register-achievement --achievement-id=<id> --name=<name> --description=<desc> [--requirements=<json>]',
            'check-achievements --score-id=<id>',
            'update-leaderboard --leaderboard-id=<id> --player-id=<id> --player-name=<name> --score=<num>',
            'get-leaderboard --leaderboard-id=<id> [--limit=<num>]',
            'list-scores [--category=<category>] [--min-score=<num>] [--max-score=<num>]',
            'stats',
            'export --format=<json|manifest|summary|leaderboards>',
            'reset',
            'demo',
            'sample'
          ],
          examples: [
            'node cliHarness.ts create-score --score-id=player1 --category=combat --initial-score=100',
            'node cliHarness.ts apply-events --score-id=player1 --events=[{"type":"add","value":50}]',
            'node cliHarness.ts add-bonus --score-id=player1 --bonus-id=streak --name="Win Streak" --multiplier=1.5',
            'node cliHarness.ts export --format=manifest'
          ]
        }
      };
  }
} catch (error) {
  output = {
    op: mode || 'unknown',
    status: 'error',
    issues: [error instanceof Error ? error.message : 'Unknown error']
  };
}

// Output valid JSON to stdout for test runner to consume
console.log(formatOutput(output));