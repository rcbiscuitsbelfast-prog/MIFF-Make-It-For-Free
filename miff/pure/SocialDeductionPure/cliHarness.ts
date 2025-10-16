#!/usr/bin/env node

/**
 * SocialDeductionPure CLI Harness - AAA Quality Social Deduction Testing
 *
 * Interactive command-line interface for testing social deduction mechanics:
 * - Player management and role assignment
 * - Phase transitions and voting
 * - Ability usage and game simulation
 * - Performance benchmarking
 * - Mobile-friendly controls
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../EventBusPure/index.js';
import { SocialDeductionManager, SocialDeductionConfig } from './Manager.js';
import { GamePhase, GameRole } from './index.js';

interface CliCommand {
  command: string;
  description: string;
  handler: (args: string[]) => void;
}

class SocialDeductionCli {
  private manager: SocialDeductionManager;
  private eventBus: EventBus;
  private commands: Map<string, CliCommand> = new Map();
  private isRunning: boolean = true;
  private currentPlayerId: string = '';

  constructor(config?: SocialDeductionConfig) {
    this.eventBus = new EventBus();
    this.manager = new SocialDeductionManager(this.eventBus, config);

    this.setupCommands();
    this.setupEventListeners();

    console.log('🤝 SocialDeductionPure CLI - AAA Social Deduction System');
    console.log('Type "help" for available commands or "quit" to exit.\n');
  }

  private setupCommands(): void {
    this.commands.set('add-player', {
      command: 'add-player <id> <name>',
      description: 'Add a player to the game',
      handler: (args) => this.handleAddPlayer(args)
    });

    this.commands.set('assign-roles', {
      command: 'assign-roles',
      description: 'Assign roles to players',
      handler: (args) => this.handleAssignRoles(args)
    });

    this.commands.set('start-game', {
      command: 'start-game',
      description: 'Start the social deduction game',
      handler: (args) => this.handleStartGame(args)
    });

    this.commands.set('cast-vote', {
      command: 'cast-vote <targetId> [reason!]',
      description: 'Cast a vote against a player',
      handler: (args) => this.handleCastVote(args)
    });

    this.commands.set('use-ability', {
      command: 'use-ability <abilityId> [targetId!]',
      description: 'Use a special ability',
      handler: (args) => this.handleUseAbility(args)
    });

    this.commands.set('show-players', {
      command: 'show-players',
      description: 'Display all players and their status',
      handler: (args) => this.handleShowPlayers(args)
    });

    this.commands.set('show-phase', {
      command: 'show-phase',
      description: 'Display current game phase',
      handler: (args) => this.handleShowPhase(args)
    });

    this.commands.set('show-stats', {
      command: 'show-stats',
      description: 'Display game statistics',
      handler: (args) => this.handleShowStats(args)
    });

    this.commands.set('reset-game', {
      command: 'reset-game',
      description: 'Reset the game to initial state',
      handler: (args) => this.handleResetGame(args)
    });

    this.commands.set('simulate', {
      command: 'simulate <rounds>',
      description: 'Run automated game simulation',
      handler: (args) => this.handleSimulate(args)
    });

    this.commands.set('benchmark', {
      command: 'benchmark <operations>',
      description: 'Run performance benchmark',
      handler: (args) => this.handleBenchmark(args)
    });

    this.commands.set('help', {
      command: 'help',
      description: 'Show available commands',
      handler: (args) => this.handleHelp(args)
    });

    this.commands.set('quit', {
      command: 'quit',
      description: 'Exit the CLI',
      handler: (args) => this.handleQuit(args)
    });
  }

  private setupEventListeners(): void {
    this.eventBus.on('social:player_joined', (data) => {
      console.log(`✅ Player ${data.player.name} (${data.playerId}) joined the game`);
    });

    this.eventBus.on('social:roles_assigned', (data) => {
      console.log('🎭 Roles have been assigned!');
      this.showPlayers();
    });

    this.eventBus.on('social:game_started', (data) => {
      console.log('🎮 Game started! Current phase:', data.phase);
    });

    this.eventBus.on('social:vote_cast', (data) => {
      console.log(`🗳️ Vote cast by ${data.vote.voterId} against ${data.vote.targetId}`);
    });

    this.eventBus.on('social:ability_used', (data) => {
      console.log(`⚡ ${data.playerId} used ability: ${data.abilityId}`);
      if (data.effect.message) {
        console.log(`   Result: ${data.effect.message}`);
      }
    });

    this.eventBus.on('social:game_ended', (data) => {
      console.log(`🏆 Game ended! Winner: ${data.winner}`);
    });
  }

  private handleAddPlayer(args: string[]): void {
    if (args.length < 2) {
      console.log('Usage: add-player <id> <name>');
      return;
    }

    const [playerId, playerName] = args;
    const result = this.manager.addPlayer(playerId, playerName);

    if (result.success) {
      console.log(result.message);
      if (result.data) {
        this.currentPlayerId = result.data.playerId;
        console.log(`Current player set to: ${this.currentPlayerId}`);
      }
    } else {
      console.log('❌', result.message);
    }
  }

  private handleAssignRoles(args: string[]): void {
    const result = this.manager.assignRoles();
    if (result.success) {
      console.log(result.message);
    } else {
      console.log('❌', result.message);
    }
  }

  private handleStartGame(args: string[]): void {
    const result = this.manager.startGame();
    if (result.success) {
      console.log(result.message);
    } else {
      console.log('❌', result.message);
    }
  }

  private handleCastVote(args: string[]): void {
    if (args.length < 1) {
      console.log('Usage: cast-vote <targetId> [reason!]');
      return;
    }

    const [targetId, ...reasonParts] = args;
    const reason = reasonParts.join(' ');
    const result = this.manager.castVote(this.currentPlayerId, targetId, 'accuse', reason);

    if (result.success) {
      console.log(result.message);
    } else {
      console.log('❌', result.message);
    }
  }

  private handleUseAbility(args: string[]): void {
    if (args.length < 1) {
      console.log('Usage: use-ability <abilityId> [targetId!]');
      return;
    }

    const [abilityId, targetId] = args;
    const result = this.manager.useAbility(this.currentPlayerId, abilityId, targetId);

    if (result.success) {
      console.log(result.message);
    } else {
      console.log('❌', result.message);
    }
  }

  private handleShowPlayers(args: string[]): void {
    this.showPlayers();
  }

  private showPlayers(): void {
    const players = this.manager.getPlayers();
    if (players.size === 0) {
      console.log('No players in the game.');
      return;
    }

    console.log('\n📋 Current Players:');
    console.log('─'.repeat(50));
    console.log('ID       | Name         | Role      | Alive | Votes | Abilities');
    console.log('─'.repeat(50));

    players.forEach((player, id) => {
      const role = player.role.padEnd(9);
      const status = player.isAlive ? '✅' : '💀';
      const votes = player.votes.toString().padEnd(5);
      const abilities = player.specialAbilities.join(', ') || 'None';

      console.log(`${id.padEnd(8)} | ${player.name.padEnd(12)} | ${role} | ${status} | ${votes} | ${abilities}`);
    });
    console.log('─'.repeat(50));
  }

  private handleShowPhase(args: string[]): void {
    const phase = this.manager.getCurrentPhase();
    console.log(`Current phase: ${phase}`);
  }

  private handleShowStats(args: string[]): void {
    const stats = this.manager.getGameStats();
    console.log('\n📊 Game Statistics:');
    console.log('─'.repeat(30));
    console.log(`Total Games: ${stats.totalGames}`);
    console.log(`Total Players: ${stats.totalPlayers}`);
    console.log(`Average Game Duration: ${Math.round(stats.averageGameDuration / 1000)}s`);
    console.log(`Elimination Rate: ${(stats.eliminationRate * 100).toFixed(1)}%`);
    console.log(`Detection Rate: ${(stats.detectionRate * 100).toFixed(1)}%`);

    console.log('\nRole Distribution:');
    stats.roleDistribution.forEach((count, role) => {
      console.log(`  ${role}: ${count}`);
    });
  }

  private handleResetGame(args: string[]): void {
    const result = this.manager.resetGame();
    if (result.success) {
      console.log(result.message);
    } else {
      console.log('❌', result.message);
    }
  }

  private handleSimulate(args: string[]): void {
    const rounds = parseInt(args[0]) || 5;
    console.log(`🧪 Running simulation for ${rounds} rounds...`);

    for (let i = 0; i < rounds; i++) {
      console.log(`\n--- Round ${i + 1} ---`);

      // Add players
      for (let j = 1; j <= 6; j++) {
        this.manager.addPlayer(`player${j}`, `Player ${j}`);
      }

      // Assign roles
      this.manager.assignRoles();

      // Start game
      this.manager.startGame();

      // Simulate some votes and abilities
      const players = this.manager.getPlayers();
      const playerIds = Array.from(players.keys());

      // Random votes
      playerIds.forEach(voterId => {
        const targetId = playerIds[Math.floor(Math.random() * playerIds.length)];
        if (voterId !== targetId) {
          this.manager.castVote(voterId, targetId, 'accuse', 'Suspicious behavior');
        }
      });

      // Random ability usage
      players.forEach((player, playerId) => {
        if (player.specialAbilities.length > 0) {
          const ability = player.specialAbilities[0];
          const targetId = playerIds[Math.floor(Math.random() * playerIds.length)];
          this.manager.useAbility(playerId, ability, targetId);
        }
      });

      // Reset for next round
      this.manager.resetGame();
    }

    console.log('\n✅ Simulation completed!');
    this.handleShowStats([]);
  }

  private async handleBenchmark(args: string[]): Promise<void> {
    const operations = parseInt(args[0]) || 1000;
    console.log(`🔬 Running benchmark with ${operations} operations...`);

    const startTime = performance.now();

    for (let i = 0; i < operations; i++) {
      // Add player
      this.manager.addPlayer(`bench${i}`, `Benchmark Player ${i}`);

      // Cast vote
      this.manager.castVote(`bench${i}`, `bench${(i + 1) % operations}`, 'accuse');

      // Use ability (if available)
      this.manager.useAbility(`bench${i}`, 'investigate', `bench${(i + 1) % operations}`);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    const opsPerSecond = (operations / duration) * 1000;

    console.log(`\n📈 Benchmark Results:`);
    console.log(`   Total Operations: ${operations}`);
    console.log(`   Duration: ${duration.toFixed(2)}ms`);
    console.log(`   Operations/sec: ${opsPerSecond.toFixed(0)}`);

    // Cleanup
    this.manager.resetGame();
  }

  private handleHelp(args: string[]): void {
    console.log('\n🛠️ Available Commands:');
    console.log('─'.repeat(40));
    this.commands.forEach((cmd, key) => {
      console.log(`  ${cmd.command.padEnd(30)} | ${cmd.description}`);
    });
    console.log('─'.repeat(40));
  }

  private handleQuit(args: string[]): void {
    console.log('👋 Goodbye!');
    this.isRunning = false;
  }

  public async run(): Promise<void> {
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'social-deduction> '
    });

    rl.prompt();

    rl.on('line', (line) => {
      const input = line.trim();
      if (input) {
        const [command, ...args] = input.split(' ');
        const cmd = this.commands.get(command);

        if (cmd) {
          cmd.handler(args);
        } else {
          console.log(`❌ Unknown command: ${command}. Type "help" for available commands.`);
        }
      }

      if (this.isRunning) {
        rl.prompt();
      } else {
        rl.close();
      }
    });

    rl.on('close', () => {
      console.log('CLI session ended.');
      process.exit(0);
    });
  }
}

// CLI entry point
async function main() {
  const config: SocialDeductionConfig = {
    maxPlayers: 10,
    minPlayers: 4,
    traitorCount: 1,
    detectiveCount: 1,
    phaseDuration: 300000,
    enablePersistence: false,
    debugMode: process.env.NODE_ENV === 'development',
    mobileOptimized: true
  };

  const cli = new SocialDeductionCli(config);
  await cli.run();
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Received SIGINT. Exiting...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Received SIGTERM. Exiting...');
  process.exit(0);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { SocialDeductionCli };