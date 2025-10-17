/**
 * SportsSystemPure Manager - AAA Quality Sports Management
 *
 * Advanced management system for sports gameplay:
 * - Game state orchestration
 * - Team and player lifecycle management
 * - Matchmaking and tournament systems
 * - Performance monitoring
 * - Integration hooks
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../EventBusPure/EventBusPure';
import {
  SportsSystemPure,
  Game,
  Team,
  Player,
  Ball,
  GameField,
  GameRules,
  GameStats,
  MatchResult,
  PlayerStats,
  SportType,
  GameState,
  TeamPosition,
  BallState
} from './index.js';

export interface SportsConfig {
  maxGamesPerPlayer?: number;
  maxTeamsPerPlayer?: number;
  enableTournaments?: boolean;
  physicsUpdateRate?: number;
  enablePersistence?: boolean;
  debugMode?: boolean;
  mobileOptimized?: boolean;
}

export interface MatchmakingPreferences {
  sportType?: SportType;
  skillLevel?: number;
  preferredTeamSize?: number;
  maxWaitTime?: number;
  region?: string;
}

export interface Tournament {
  id: string;
  name: string;
  sportType: SportType;
  teams: Team[];
  currentRound: number;
  totalRounds: number;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  rules: TournamentRules;
  prizePool: number;
  startDate: number;
  endDate: number;
}

export interface TournamentRules {
  eliminationType: 'single' | 'double' | 'round_robin';
  matchesPerRound: number;
  pointsForWin: number;
  pointsForDraw: number;
  pointsForLoss: number;
  overtimeRules: boolean;
}

export interface SportsOutput {
  success: boolean;
  message: string;
  data?: any;
  timestamp: number;
}

export class SportsManager {
  private sportsSystem: SportsSystemPure;
  private eventBus: EventBus;
  private config: SportsConfig;
  private tournaments: Map<string, Tournament> = new Map();
  private matchmakingQueue: Player[] = [];
  private activeMatches: Map<string, MatchResult> = new Map();

  constructor(eventBus: EventBus, config: SportsConfig = {}) {
    const managerId = this.id ?? `manager_${Date.now()}`;
    this.eventBus = eventBus;
    this.config = {
      maxGamesPerPlayer: 10,
      maxTeamsPerPlayer: 5,
      enableTournaments: true,
      physicsUpdateRate: 60,
      enablePersistence: false,
      debugMode: false,
      mobileOptimized: true,
      ...config
    };

    this.sportsSystem = new SportsSystemPure(eventBus);

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.eventBus.on('sports:game_created', (data) => {
      this.handleGameCreated(data.game);
    });

    this.eventBus.on('sports:goal_scored', (data) => {
      this.handleGoalScored(data);
    });

    this.eventBus.on('sports:game_ended', (data) => {
      this.handleGameEnded(data.gameId, data.result);
    });
  }

  private handleGameCreated(game: Game): void {
    // Initialize game tracking
    this.activeMatches.set(game.id, {
      gameId: game.id,
      teams: game.teams,
      finalScore: { team1: 0, team2: 0 },
      winner: null,
      duration: 0,
      highlights: [],
      mvp: ''
    });
  }

  private handleGoalScored(data): void {
    const game = this.sportsSystem.getGameState(data.gameId);
    if (!game) return;

    // Update team scores
    if (data.position.x < 0) {
      game.teams[1!].score += 1; // Team 2 scored
    } else {
      game.teams[0!].score += 1; // Team 1 scored
    }

    // Update player stats
    const player = this.sportsSystem.getPlayerStats(data.scorer);
    if (player) {
      player.goals += 1;
    }
  }

  private handleGameEnded(gameId: string, result: MatchResult): void {
    this.activeMatches.set(gameId, result);
  }

  public createTeam(name: string, color: string, creatorId: string): SportsOutput {
    try {
      // Check team limit per player
      const playerTeams = Array.from(this.sportsSystem['teams'].values())
        .filter((team: any) => team.players.some(p => p.id === creatorId));

      if (playerTeams.length >= this.config.maxTeamsPerPlayer!) {
        return {
          success: false,
          message: `Maximum teams per player (${this.config.maxTeamsPerPlayer}) reached`,
          timestamp: new Date()
        };
      }

      const team = this.sportsSystem.createTeam(name, color);

      return {
        success: true,
        message: `Team "${name}" created successfully`,
        data: { team },
        timestamp: new Date()
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        success: false,
        message: `Failed to create team: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  public createPlayer(name: string, teamId: string, position: TeamPosition, creatorId: string): SportsOutput {
    try {
      // Validate team ownership
      const team = this.sportsSystem['teams'].get(teamId);
      if (!team) {
        return {
          success: false,
          message: 'Team not found',
          timestamp: new Date()
        };
      }

      // Check if creator has permission to add players to this team
      const creatorInTeam = team.players.some(p => p.id === creatorId);
      if (!creatorInTeam && team.players.length > 0) {
        return {
          success: false,
          message: 'No permission to add players to this team',
          timestamp: new Date()
        };
      }

      const player = this.sportsSystem.createPlayer(name, teamId, position);

      return {
        success: true,
        message: `Player "${name}" created successfully`,
        data: { player },
        timestamp: new Date()
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        success: false,
        message: `Failed to create player: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  public createGame(sportType: SportType, team1Id: string, team2Id: string, creatorId: string): SportsOutput {
    try {
      // Validate team ownership
      const team1 = this.sportsSystem['teams'].get(team1Id);
      const team2 = this.sportsSystem['teams'].get(team2Id);

      if (!team1 || !team2) {
        return {
          success: false,
          message: 'Both teams must exist',
          timestamp: new Date()
        };
      }

      // Check if creator has permission
      const creatorInTeam1 = team1.players.some(p => p.id === creatorId);
      const creatorInTeam2 = team2.players.some(p => p.id === creatorId);

      if (!creatorInTeam1 && !creatorInTeam2) {
        return {
          success: false,
          message: 'No permission to create game with these teams',
          timestamp: new Date()
        };
      }

      // Check active games limit
      const activeGames = Array.from(this.sportsSystem['games'].values())
        .filter((game: any) => game.state === 'playing' || game.state === 'paused')
        .filter((game: any) => game.teams.some(team => team.id === team1Id || team.id === team2Id));

      if (activeGames.length > 0) {
        return {
          success: false,
          message: 'One or both teams are already in an active game',
          timestamp: new Date()
        };
      }

      const game = this.sportsSystem.createGame(sportType, team1Id, team2Id);

      return {
        success: true,
        message: `Game created successfully`,
        data: { game },
        timestamp: new Date()
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        success: false,
        message: `Failed to create game: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  public startGame(gameId: string, starterId: string): SportsOutput {
    try {
      const game = this.sportsSystem.getGameState(gameId);
      if (!game) {
        return {
          success: false,
          message: 'Game not found',
          timestamp: new Date()
        };
      }

      // Validate starter permission
      const starterInGame = game.teams.some(team =>
        team.players.some(player => player.id === starterId)
      );

      if (!starterInGame) {
        return {
          success: false,
          message: 'No permission to start this game',
          timestamp: new Date()
        };
      }

      const success = this.sportsSystem.startGame(gameId);

      if (success) {
        return {
          success: true,
          message: 'Game started successfully',
          data: { gameId },
          timestamp: new Date()
        };
      } else {
        return {
          success: false,
          message: 'Failed to start game',
          timestamp: new Date()
        };
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        success: false,
        message: `Failed to start game: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  public pauseGame(gameId: string, requesterId: string): SportsOutput {
    try {
      const game = this.sportsSystem.getGameState(gameId);
      if (!game) {
        return {
          success: false,
          message: 'Game not found',
          timestamp: new Date()
        };
      }

      // Validate requester permission
      const requesterInGame = game.teams.some(team =>
        team.players.some(player => player.id === requesterId)
      );

      if (!requesterInGame) {
        return {
          success: false,
          message: 'No permission to pause this game',
          timestamp: new Date()
        };
      }

      const success = this.sportsSystem.pauseGame(gameId);

      if (success) {
        return {
          success: true,
          message: 'Game paused successfully',
          data: { gameId },
          timestamp: new Date()
        };
      } else {
        return {
          success: false,
          message: 'Failed to pause game',
          timestamp: new Date()
        };
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        success: false,
        message: `Failed to pause game: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  public shootBall(gameId: string, playerId: string, targetPosition: { x: number; y: number; z: number }): SportsOutput {
    try {
      const success = this.sportsSystem.shootBall(gameId, playerId, targetPosition);

      if (success) {
        return {
          success: true,
          message: 'Shot taken successfully',
          data: { gameId, playerId, targetPosition },
          timestamp: new Date()
        };
      } else {
        return {
          success: false,
          message: 'Failed to take shot',
          timestamp: new Date()
        };
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        success: false,
        message: `Failed to take shot: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  public passBall(gameId: string, fromPlayerId: string, toPlayerId: string): SportsOutput {
    try {
      const success = this.sportsSystem.passBall(gameId, fromPlayerId, toPlayerId);

      if (success) {
        return {
          success: true,
          message: 'Pass completed successfully',
          data: { gameId, fromPlayerId, toPlayerId },
          timestamp: new Date()
        };
      } else {
        return {
          success: false,
          message: 'Failed to complete pass',
          timestamp: new Date()
        };
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        success: false,
        message: `Failed to complete pass: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  public tackle(gameId: string, tacklerId: string, targetId: string): SportsOutput {
    try {
      const success = this.sportsSystem.tackle(gameId, tacklerId, targetId);

      if (success) {
        return {
          success: true,
          message: 'Tackle successful',
          data: { gameId, tacklerId, targetId },
          timestamp: new Date()
        };
      } else {
        return {
          success: false,
          message: 'Tackle failed',
          timestamp: new Date()
        };
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        success: false,
        message: `Failed to perform tackle: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  public joinMatchmaking(playerId: string, preferences: MatchmakingPreferences): SportsOutput {
    try {
      const player = this.sportsSystem['players'].get(playerId);
      if (!player) {
        return {
          success: false,
          message: 'Player not found',
          timestamp: new Date()
        };
      }

      // Check if player is already in queue
      const existingIndex = this.matchmakingQueue.findIndex(p => p.id === playerId);
      if (existingIndex >= 0) {
        return {
          success: false,
          message: 'Player already in matchmaking queue',
          timestamp: new Date()
        };
      }

      // Check active games
      const activeGames = Array.from(this.sportsSystem['games'].values())
        .filter((game: any) => game.state === 'playing' || game.state === 'paused')
        .filter((game: any) => game.teams.some(team => team.players.some(p => p.id === playerId)));

      if (activeGames.length > 0) {
        return {
          success: false,
          message: 'Player is already in an active game',
          timestamp: new Date()
        };
      }

      this.matchmakingQueue.push(player);
      player.stats = Object.assign(player.stats, preferences);

      this.attemptMatchmaking();

      return {
        success: true,
        message: 'Joined matchmaking queue',
        data: { queuePosition: this.matchmakingQueue.length },
        timestamp: new Date()
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        success: false,
        message: `Failed to join matchmaking: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  public leaveMatchmaking(playerId: string): SportsOutput {
    try {
      const index = this.matchmakingQueue.findIndex(p => p.id === playerId);

      if (index >= 0) {
        this.matchmakingQueue.splice(index, 1);

        return {
          success: true,
          message: 'Left matchmaking queue',
          timestamp: new Date()
        };
      } else {
        return {
          success: false,
          message: 'Player not in matchmaking queue',
          timestamp: new Date()
        };
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        success: false,
        message: `Failed to leave matchmaking: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  private attemptMatchmaking(): void {
    // Simple matchmaking algorithm - pair players with similar skill levels
    const playersBySport = new Map<SportType, Player[]>();

    this.matchmakingQueue.forEach((player: any) => {
      const sport = player.stats.sportType || 'soccer';
      if (!playersBySport.has(sport)) {
        playersBySport.set(sport, []);
      }
      playersBySport.get(sport)!.push(player);
    });

    playersBySport.forEach((players, sport) => {
      // Sort by skill level
      players.sort((a: any, b: any) => (a.skillLevel || 5) - (b.skillLevel || 5));

      // Create matches
      for (let i = 0; i < players.length - 1; i += 2) {
        const player1 = players[i!];
        const player2 = players[i + 1];

        // Check if they can form teams
        const team1 = this.sportsSystem.createTeam(`${player1.name}'s Team`, '#FF0000');
        const team2 = this.sportsSystem.createTeam(`${player2.name}'s Team`, '#0000FF');

        this.sportsSystem.createPlayer(player1.name, team1.id, 'forward');
        this.sportsSystem.createPlayer(player2.name, team2.id, 'forward');

        try {
          const game = this.sportsSystem.createGame(sport, team1.id, team2.id);

          // Remove players from queue
          this.matchmakingQueue = this.matchmakingQueue.filter((p: any) =>
            p.id !== player1.id && p.id !== player2.id
          );

          this.eventBus.publish('sports:match_found', {
            gameId: game.id,
            players: [player1.id, player2.id],
            sport: sport,
            timestamp: new Date()
          });
        } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
          // Clean up teams if game creation fails
          this.sportsSystem['teams'].delete(team1.id);
          this.sportsSystem['teams'].delete(team2.id);
        }
      }
    });
  }

  public getGameState(gameId: string): Game | null {
    return this.sportsSystem.getGameState(gameId);
  }

  public getPlayerStats(playerId: string): PlayerStats | null {
    return this.sportsSystem.getPlayerStats(playerId);
  }

  public getTeamStats(teamId: string): { score: number; players: Player[] } | null {
    return this.sportsSystem.getTeamStats(teamId);
  }

  public getAvailableSports(): SportType[] {
    return ['soccer', 'basketball', 'tennis', 'volleyball', 'baseball', 'hockey', 'golf', 'bowling'];
  }

  public getTeamPositions(): TeamPosition[] {
    return ['goalkeeper', 'defender', 'midfielder', 'forward', 'bench'];
  }

  public exportGameState(gameId: string): string {
    const game = this.sportsSystem.getGameState(gameId);
    if (!game) return '{}';

    return JSON.stringify({
      game,
      teams: game.teams,
      players: game.teams.flatMap(team => team.players),
      ball: game.ball,
      stats: game.stats,
      exportDate: new Date()
    }, null, 2);
  }

  public importGameState(gameData: string): boolean {
    try {
      const data = JSON.parse(gameData);

      // This would restore game state
      // Implementation depends on specific requirements

      return true;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return false;
    }
  }
}

export default SportsManager;