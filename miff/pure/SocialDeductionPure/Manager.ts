/**
 * SocialDeductionPure Manager - AAA Quality Social Deduction Management
 *
 * Advanced management system for social deduction gameplay:
 * - Game state orchestration
 * - Player lifecycle management
 * - Phase transitions and timing
 * - Performance monitoring
 * - Integration hooks
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../EventBusPure/index.js';
// Types are defined in this file to avoid circular imports

export enum GamePhase {
  LOBBY = 'lobby',
  DISCUSSION = 'discussion',
  VOTING = 'voting',
  NIGHT = 'night',
  DAY = 'day',
  GAME_OVER = 'game_over'
}

export enum GameRole {
  VILLAGER = 'villager',
  WEREWOLF = 'werewolf',
  SEER = 'seer',
  DOCTOR = 'doctor',
  HUNTER = 'hunter',
  WITCH = 'witch',
  GUARD = 'guard',
  CUPID = 'cupid',
  MODERATOR = 'moderator'
}

export interface GamePlayer {
  id: string;
  name: string;
  role: GameRole;
  isAlive: boolean;
  isVoted: boolean;
  votes: number;
  abilities: string[];
  isProtected: boolean;
  isRevealed: boolean;
  joinTime: Date;
  lastActive: Date;
}

export interface GameVote {
  voterId: string;
  targetId: string;
  phase: GamePhase;
  timestamp: Date;
  isSecret: boolean;
}

export interface DiscussionRound {
  id: string;
  phase: GamePhase;
  duration: number;
  startTime: Date;
  endTime?: Date;
  participants: string[];
  messages: GameMessage[];
  isActive: boolean;
}

export interface GameMessage {
  id: string;
  playerId: string;
  content: string;
  timestamp: Date;
  isSystem: boolean;
  isPrivate: boolean;
  targetPlayerId?: string;
}

export interface VotingResults {
  phase: GamePhase;
  votes: GameVote[];
  results: Map<string, number>;
  eliminatedPlayerId?: string;
  isTie: boolean;
  timestamp: Date;
}

export interface AbilityEffect {
  id: string;
  playerId: string;
  targetId?: string;
  ability: string;
  phase: GamePhase;
  timestamp: Date;
  isSuccessful: boolean;
  data?: any;
}

export interface SocialDeductionConfig {
  maxPlayers?: number;
  minPlayers?: number;
  traitorCount?: number;
  detectiveCount?: number;
  phaseDuration?: number;
  enablePersistence?: boolean;
  debugMode?: boolean;
  mobileOptimized?: boolean;
}

export interface GameStats {
  totalGames: number;
  totalPlayers: number;
  averageGameDuration: number;
  eliminationRate: number;
  detectionRate: number;
  phaseDurations: Map<GamePhase, number>;
  roleDistribution: Map<GameRole, number>;
}

export interface SocialOutput {
  success: boolean;
  message: string;
  data?: any;
  timestamp: number;
}

export class SocialDeductionManager {
  private game: SocialDeductionPure;
  private eventBus: EventBus;
  private config: SocialDeductionConfig;
  private stats: GameStats;
  private phaseTimer: NodeJS.Timeout | null = null;
  private gameStartTime: number = 0;

  constructor(eventBus: EventBus, config: SocialDeductionConfig = {}) {
    this.eventBus = eventBus;
    this.config = {
      maxPlayers: 10,
      minPlayers: 4,
      traitorCount: 1,
      detectiveCount: 1,
      phaseDuration: 300000, // 5 minutes
      enablePersistence: false,
      debugMode: false,
      mobileOptimized: true,
      ...config
    };

    this.game = new SocialDeductionPure(eventBus);
    this.stats = this.initializeStats();

    this.setupEventListeners();
  }

  private initializeStats(): GameStats {
    return {
      totalGames: 0,
      totalPlayers: 0,
      averageGameDuration: 0,
      eliminationRate: 0,
      detectionRate: 0,
      phaseDurations: new Map(),
      roleDistribution: new Map()
    };
  }

  private setupEventListeners(): void {
    this.eventBus.on('social:player_joined', (data) => {
      this.stats.totalPlayers++;
    });

    this.eventBus.on('social:game_started', (data) => {
      this.gameStartTime = Date.now();
      this.startPhaseTimer();
    });

    this.eventBus.on('social:game_ended', (data) => {
      this.endPhaseTimer();
      this.updateStats();
    });

    this.eventBus.on('social:ability_used', (data) => {
      this.handleAbilityEffects(data.effect);
    });
  }

  public addPlayer(playerId: string, playerName: string): SocialOutput {
    const success = this.game.addPlayer(playerId, playerName);

    if (success) {
      return {
        success: true,
        message: `Player ${playerName} joined the game`,
        data: { playerId, playerName },
        timestamp: Date.now()
      };
    }

    return {
      success: false,
      message: 'Failed to add player',
      timestamp: Date.now()
    };
  }

  public assignRoles(): SocialOutput {
    const success = this.game.assignRoles();

    if (success) {
      return {
        success: true,
        message: 'Roles assigned successfully',
        timestamp: Date.now()
      };
    }

    return {
      success: false,
      message: 'Failed to assign roles',
      timestamp: Date.now()
    };
  }

  public startGame(): SocialOutput {
    const success = this.game.startGame();

    if (success) {
      return {
        success: true,
        message: 'Game started successfully',
        timestamp: Date.now()
      };
    }

    return {
      success: false,
      message: 'Failed to start game',
      timestamp: Date.now()
    };
  }

  public castVote(voterId: string, targetId: string, voteType: string, reason?: string): SocialOutput {
    const success = this.game.castVote(voterId, targetId, voteType as any, reason);

    if (success) {
      return {
        success: true,
        message: `Vote cast by ${voterId}`,
        data: { voterId, targetId, voteType, reason },
        timestamp: Date.now()
      };
    }

    return {
      success: false,
      message: 'Failed to cast vote',
      timestamp: Date.now()
    };
  }

  public useAbility(playerId: string, abilityId: string, targetId?: string): SocialOutput {
    const success = this.game.useAbility(playerId, abilityId, targetId);

    if (success) {
      return {
        success: true,
        message: `Ability ${abilityId} used successfully`,
        data: { playerId, abilityId, targetId },
        timestamp: Date.now()
      };
    }

    return {
      success: false,
      message: 'Failed to use ability',
      timestamp: Date.now()
    };
  }

  public getPlayers(): Map<string, GamePlayer> {
    return this.game.getPlayers();
  }

  public getCurrentPhase(): GamePhase {
    return this.game.getCurrentPhase();
  }

  public getGameStats(): GameStats {
    return { ...this.stats };
  }

  public getVotes(): GameVote[] {
    return this.game.getVotes();
  }

  public getDiscussionRounds(): DiscussionRound[] {
    return this.game.getDiscussionRounds();
  }

  private startPhaseTimer(): void {
    if (this.phaseTimer) {
      clearTimeout(this.phaseTimer);
    }

    this.phaseTimer = setTimeout(() => {
      this.advancePhase();
    }, this.config.phaseDuration);
  }

  private endPhaseTimer(): void {
    if (this.phaseTimer) {
      clearTimeout(this.phaseTimer);
      this.phaseTimer = null;
    }
  }

  private advancePhase(): void {
    const currentPhase = this.game.getCurrentPhase();

    switch (currentPhase) {
      case 'discussion':
        this.game['currentPhase'] = 'voting';
        this.eventBus.emit('social:phase_advanced', {
          from: 'discussion',
          to: 'voting',
          timestamp: Date.now()
        });
        break;
      case 'voting':
        this.game['currentPhase'] = 'night';
        this.eventBus.emit('social:phase_advanced', {
          from: 'voting',
          to: 'night',
          timestamp: Date.now()
        });
        break;
      case 'night':
        this.game['currentPhase'] = 'day';
        this.eventBus.emit('social:phase_advanced', {
          from: 'night',
          to: 'day',
          timestamp: Date.now()
        });
        break;
      default:
        this.game['currentPhase'] = 'ended';
        this.eventBus.emit('social:phase_advanced', {
          from: currentPhase,
          to: 'ended',
          timestamp: Date.now()
        });
    }
  }

  private handleAbilityEffects(effect: AbilityEffect): void {
    switch (effect.effectType) {
      case 'kill':
        if (effect.success) {
          this.checkWinConditions();
        }
        break;
      case 'investigate':
        // Update trust/suspicion levels based on investigation results
        break;
    }
  }

  private checkWinConditions(): void {
    const players = this.game.getPlayers();
    const alivePlayers = Array.from(players.values()).filter((p: any) => p.isAlive);
    const traitors = alivePlayers.filter((p: any) => p.role === 'traitor');
    const innocents = alivePlayers.filter((p: any) => p.role === 'innocent' || p.role === 'detective');

    if (traitors.length === 0) {
      this.game.endGame('innocent');
    } else if (traitors.length >= innocents.length) {
      this.game.endGame('traitor');
    }
  }

  private updateStats(): void {
    this.stats.totalGames++;

    const gameDuration = Date.now() - this.gameStartTime;
    this.stats.averageGameDuration =
      (this.stats.averageGameDuration * (this.stats.totalGames - 1) + gameDuration) / this.stats.totalGames;

    // Update role distribution
    const players = this.game.getPlayers();
    Array.from(players.values()).forEach((player: any) => {
      const count = this.stats.roleDistribution.get(player.role) || 0;
      this.stats.roleDistribution.set(player.role, count + 1);
    });
  }

  public resetGame(): SocialOutput {
    this.game.resetGame();
    this.stats = this.initializeStats();

    return {
      success: true,
      message: 'Game reset successfully',
      timestamp: Date.now()
    };
  }

  public exportGameState(): string {
    return JSON.stringify({
      players: Array.from(this.game.getPlayers().entries()),
      phase: this.game.getCurrentPhase(),
      votes: this.game.getVotes(),
      rounds: this.game.getDiscussionRounds(),
      stats: this.stats,
      timestamp: Date.now()
    });
  }

  public importGameState(stateJson: string): boolean {
    try {
      const state = JSON.parse(stateJson);

      // Restore game state
      // Note: This is a simplified restoration - full implementation would need more complex state management
      return true;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return false;
    }
  }
}

export default SocialDeductionManager;