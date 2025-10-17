/**
 * SocialDeductionPure - AAA Quality Social Deduction System
 *
 * Advanced social gameplay mechanics with:
 * - Role assignment and hidden identities
 * - Voting phases and discussion rounds
 * - Ability-driven interactions
 * - Mobile-optimized social controls
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../EventBusPure/EventBusPure';

export type GameRole = 'innocent' | 'traitor' | 'detective' | 'neutral';
export type GamePhase = 'lobby' | 'role_assignment' | 'discussion' | 'voting' | 'night' | 'day' | 'ended';
export type VoteType = 'skip' | 'accuse' | 'defend' | 'special';

export interface GamePlayer {
  id: string;
  name: string;
  role: GameRole;
  isAlive: boolean;
  votes: number;
  canVote: boolean;
  specialAbilities: string[];
  cooldowns: Map<string, number>;
  suspicionLevel: number; // 0-100
  trustLevel: number;     // 0-100
}

export interface GameVote {
  voterId: string;
  targetId: string;
  voteType: VoteType;
  reason?: string;
  timestamp: number;
}

export interface DiscussionRound {
  id: string;
  phase: GamePhase;
  startTime: number;
  endTime: number;
  messages: GameMessage[];
  votingResults?: VotingResults;
}

export interface GameMessage {
  playerId: string;
  message: string;
  timestamp: number;
  messageType: 'normal' | 'whisper' | 'system' | 'emergency';
}

export interface VotingResults {
  votes: Map<string, number>; // playerId -> vote count
  eliminated: string[];
  skipped: boolean;
  roundId: string;
}

export interface AbilityEffect {
  abilityId: string;
  targetId?: string;
  effectType: 'kill' | 'protect' | 'investigate' | 'block' | 'redirect' | 'special';
  success: boolean;
  message: string;
}

export class SocialDeductionPure {
  private eventBus: EventBus;
  private players: Map<string, GamePlayer> = new Map();
  private currentPhase: GamePhase = 'lobby';
  private discussionRounds: DiscussionRound[] = [];
  private votes: GameVote[] = [];
  private traitorCount: number = 1;
  private detectiveCount: number = 1;
  private maxPlayers: number = 10;
  private minPlayers: number = 4;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  public getPlayers(): Map<string, GamePlayer> {
    return new Map(this.players);
  }

  public getCurrentPhase(): GamePhase {
    return this.currentPhase;
  }

  public getDiscussionRounds(): DiscussionRound[] {
    return [...this.discussionRounds];
  }

  public getVotes(): GameVote[] {
    return [...this.votes];
  }

  public addPlayer(playerId: string, playerName: string): boolean {
    if (this.players.size >= this.maxPlayers || this.currentPhase !== 'lobby') {
      return false;
    }

    const player: GamePlayer = {
      id: playerId,
      name: playerName,
      role: 'innocent',
      isAlive: true,
      votes: 0,
      canVote: true,
      specialAbilities: [],
      cooldowns: new Map(),
      suspicionLevel: 0,
      trustLevel: 50
    };

    this.players.set(playerId, player);

    this.eventBus.publish('social:player_joined', {
      playerId: playerId,
      player: player,
      timestamp: new Date()
    });

    return true;
  }

  public assignRoles(): boolean {
    if (this.players.size < this.minPlayers || this.currentPhase !== 'lobby') {
      return false;
    }

    const playerIds = Array.from(this.players.keys());
    const shuffledIds = this.shuffleArray(playerIds);

    // Assign roles
    for (let i = 0; i < shuffledIds.length; i++) {
      const playerId = shuffledIds[i];
      const player = this.players.get(playerId)!;

      if (i < this.traitorCount) {
        player.role = 'traitor';
        player.specialAbilities = ['kill'];
      } else if (i < this.traitorCount + this.detectiveCount) {
        player.role = 'detective';
        player.specialAbilities = ['investigate'];
      } else {
        player.role = 'innocent';
        player.specialAbilities = [];
      }
    }

    this.currentPhase = 'role_assignment';

    this.eventBus.publish('social:roles_assigned', 
      players: players: this.players,
      timestamp: new Date()
    });

    return true;
  }

  public startGame(): boolean {
    if (this.players.size < this.minPlayers) {
      return false;
    }

    this.currentPhase = 'discussion';

    this.eventBus.publish('social:game_started', 
      phase: currentPhase: this.currentPhase,
      timestamp: new Date()
    });

    return true;
  }

  public castVote(voterId: string, targetId: string, voteType: VoteType, reason?: string): boolean {
    const voter = this.players.get(voterId);
    const target = this.players.get(targetId);

    if (!voter || !target || !voter.canVote || voter.role === 'traitor') {
      return false;
    }

    const vote: GameVote = {
      voterId: voterId,
      targetId: targetId,
      voteType: voteType,
      reason: reason,
      timestamp: new Date()
    };

    this.votes.push(vote);
    voter.canVote = false;

    this.eventBus.publish('social:vote_cast', {
      vote: vote,
      timestamp: new Date()
    });

    return true;
  }

  public useAbility(playerId: string, abilityId: string, targetId?: string): boolean {
    const player = this.players.get(playerId);
    if (!player || !player.specialAbilities.includes(abilityId)) {
      return false;
    }

    const cooldown = player.cooldowns.get(abilityId) || 0;
    if (cooldown > Date.now()) {
      return false; // Ability on cooldown
    }

    const effect = this.processAbility(playerId, abilityId, targetId);

    // Set cooldown (24 hours for most abilities)
    player.cooldowns.set(abilityId, Date.now() + 86400000);

    this.eventBus.publish('social:ability_used', {
      playerId: playerId,
      abilityId: abilityId,
      targetId: targetId,
      effect: effect,
      timestamp: new Date()
    });

    return effect.success;
  }

  private processAbility(playerId: string, abilityId: string, targetId?: string): AbilityEffect 
    const player = this.players.get(playerId)!;

    switch (abilityId) {
      case 'kill':
        if (player.role === 'traitor' && targetId) {
          const target = this.players.get(targetId);
          if (target && target.isAlive) {
            target.isAlive = false;
            return {
              abilityId: abilityId,
              targetId: targetId,
              effectType: 'kill',
              success: true,
              message: `${name: player.name} eliminated $name: target.name}`
            };
          }
        }
        return {
          abilityId: abilityId,
          effectType: 'kill',
          success: false,
          message: 'Kill failed'
        };

      case 'investigate':
        if (player.role === 'detective' && targetId) {
          const target = this.players.get(targetId);
          const roleInfo = target?.role === 'traitor' ? 'Traitor' : 'Innocent';
          return {
            abilityId: abilityId,
            targetId: targetId,
            effectType: 'investigate',
            success: true,
            message: `${target?.name} is: ${roleInfo}`
          };
        }
        return {
          abilityId: abilityId,
          effectType: 'investigate',
          success: false,
          message: 'Investigation failed'
        };

      default:
        return {
          abilityId: abilityId,
          effectType: 'special',
          success: false,
          message: 'Unknown ability'
        };
    }
  }

  private shuffleArray<T extends object>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  public endGame(winner: GameRole): void 
    this.currentPhase = 'ended';

    this.eventBus.publish('social:game_ended', {
      winner: winner,
      finalVotes: votes: this.votes,
      timestamp: new Date()
    });
  }

  public resetGame(): void {
    this.players.clear();
    this.votes = [];
    this.discussionRounds = [];
    this.currentPhase = 'lobby';

    this.eventBus.publish('social:game_reset', {
      timestamp: new Date()
    });
  }
}

export default SocialDeductionPure;