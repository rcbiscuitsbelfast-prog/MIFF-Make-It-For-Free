/**
 * SpiritTamerDemoPure Manager
 * 
 * Manages spirit taming gameplay including rhythm-based taming mechanics,
 * spirit collection, battle system, and progression tracking.
 */

export interface Spirit {
  id: string;
  name: string;
  type: 'fire' | 'water' | 'earth' | 'air' | 'shadow' | 'light';
  level: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  stats: {
    health: number;
    maxHealth: number;
    attack: number;
    defense: number;
    speed: number;
    tamingDifficulty: number; // 1-10
  };
  abilities: string[];
  location: string;
  isWild: boolean;
}

export interface TamingSession {
  id: string;
  spiritId: string;
  startTime: number;
  beats: TamingBeat[];
  timeline: TimelineEntry[];
  result: 'success' | 'failure' | 'in_progress';
  score: number;
  accuracy: number;
}

export interface TamingBeat {
  time: number;        // Beat timestamp in seconds
  expected: boolean;   // Whether player should hit this beat
  hit?: boolean;       // Whether player actually hit this beat
  timing?: number;     // Timing accuracy (-1 to 1)
}

export interface TimelineEntry {
  time: number;
  hits: number;
  misses: number;
  aggression: number;  // Spirit aggression level (0-10)
  progress: number;    // Taming progress (0-100)
  tamed: boolean;
}

export interface PlayerState {
  name: string;
  level: number;
  experience: number;
  location: { x: number; y: number; zone: string };
  inventory: string[];
  tamedSpirits: string[];
  equipment: {
    instrument: string | null;
    accessory: string | null;
  };
  stats: {
    totalSpirits: number;
    successfulTamings: number;
    battleWins: number;
    rhythmAccuracy: number;
  };
}

export interface BattleResult {
  winner: 'player' | 'spirit';
  turns: BattleTurn[];
  experience: number;
  rewards: string[];
  duration: number;
}

export interface BattleTurn {
  turn: number;
  actor: 'player' | 'spirit';
  action: string;
  damage: number;
  effect?: string;
  healthAfter: { player: number; spirit: number };
}

export class SpiritTamerManager {
  private player: PlayerState;
  private spirits: Map<string, Spirit> = new Map();
  private tamingSessions: Map<string, TamingSession> = new Map();
  private activeSession: TamingSession | null = null;

  constructor() {
    this.player = {
      name: 'Tamer',
      level: 1,
      experience: 0,
      location: { x: 85, y: 262, zone: 'grove' },
      inventory: ['spirit_flute', 'calming_herbs', 'energy_crystal'],
      tamedSpirits: [],
      equipment: {
        instrument: 'spirit_flute',
        accessory: null
      },
      stats: {
        totalSpirits: 0,
        successfulTamings: 0,
        battleWins: 0,
        rhythmAccuracy: 0
      }
    };

    this.initializeSpirits();
  }

  private initializeSpirits() {
    const defaultSpirits: Spirit[] = [
      {
        id: 'emberfox',
        name: 'Emberfox',
        type: 'fire',
        level: 3,
        rarity: 'common',
        stats: {
          health: 45,
          maxHealth: 45,
          attack: 12,
          defense: 8,
          speed: 15,
          tamingDifficulty: 3
        },
        abilities: ['flame_burst', 'quick_strike'],
        location: 'grove',
        isWild: true
      },
      {
        id: 'glimmerbat',
        name: 'Glimmerbat',
        type: 'shadow',
        level: 2,
        rarity: 'common',
        stats: {
          health: 30,
          maxHealth: 30,
          attack: 8,
          defense: 5,
          speed: 20,
          tamingDifficulty: 2
        },
        abilities: ['shadow_dash', 'echo_location'],
        location: 'grove',
        isWild: true
      },
      {
        id: 'whisperwind',
        name: 'Whisperwind',
        type: 'air',
        level: 5,
        rarity: 'uncommon',
        stats: {
          health: 60,
          maxHealth: 60,
          attack: 15,
          defense: 10,
          speed: 25,
          tamingDifficulty: 5
        },
        abilities: ['wind_blade', 'aerial_dance', 'gust_shield'],
        location: 'grove',
        isWild: true
      },
      {
        id: 'stoneheart',
        name: 'Stoneheart',
        type: 'earth',
        level: 7,
        rarity: 'rare',
        stats: {
          health: 100,
          maxHealth: 100,
          attack: 20,
          defense: 25,
          speed: 8,
          tamingDifficulty: 7
        },
        abilities: ['rock_throw', 'earth_armor', 'tremor'],
        location: 'grove',
        isWild: true
      }
    ];

    defaultSpirits.forEach((spirit: any) => {
      this.spirits.set(spirit.id, spirit);
    });
  }

  /**
   * Get player state
   */
  getPlayer(): { ok: boolean; player: PlayerState } {
    return { ok: true, player: this.player };
  }

  /**
   * Update player location
   */
  movePlayer(x: number, y: number, zone?: string): { ok: boolean; location?: PlayerState['location']; errors?: string[] } {
    try {
      this.player.location.x = x;
      this.player.location.y = y;
      if (zone) this.player.location.zone = zone;

      return { ok: true, location: this.player.location };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return { ok: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  /**
   * Get spirit by ID
   */
  getSpirit(spiritId: string): { ok: boolean; spirit?: Spirit; errors?: string[] } {
    const spirit = this.spirits.get(spiritId);
    if (!spirit) {
      return { ok: false, errors: [`Spirit ${spiritId} not found`] };
    }
    return { ok: true, spirit };
  }

  /**
   * List spirits in area or all spirits
   */
  listSpirits(location?: string, includeWild: boolean = true): { ok: boolean; spirits: Spirit[]; total: number } {
    let spirits = Array.from(this.spirits.values());

    if (location) {
      spirits = spirits.filter((s: any) => s.location === location);
    }

    if (!includeWild) {
      spirits = spirits.filter((s: any) => !s.isWild || this.player.tamedSpirits.includes(s.id));
    }

    return { ok: true, spirits, total: spirits.length };
  }

  /**
   * Start taming session
   */
  startTaming(spiritId: string): { ok: boolean; session?: TamingSession; errors?: string[] } {
    try {
      const spirit = this.spirits.get(spiritId);
      if (!spirit) {
        return { ok: false, errors: [`Spirit ${spiritId} not found`] };
      }

      if (!spirit.isWild) {
        return { ok: false, errors: [`Spirit ${spiritId} is already tamed`] };
      }

      if (this.activeSession) {
        return { ok: false, errors: ['Another taming session is already active'] };
      }

      // Generate rhythm pattern based on spirit difficulty
      const beats = this.generateRhythmPattern(spirit.stats.tamingDifficulty);
      
      const session: TamingSession = {
        id: `taming-${spiritId}-${Date.now()}`,
        spiritId,
        startTime: Date.now(),
        beats,
        timeline: [{ time: 0, hits: 0, misses: 0, aggression: spirit.stats.tamingDifficulty, progress: 0, tamed: false }],
        result: 'in_progress',
        score: 0,
        accuracy: 0
      };

      this.activeSession = session;
      this.tamingSessions.set(session.id, session);

      return { ok: true, session };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return { ok: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  /**
   * Process rhythm input during taming
   */
  processRhythmInput(time: number, hit: boolean): { ok: boolean; result?: any; errors?: string[] } {
    if (!this.activeSession) {
      return { ok: false, errors: ['No active taming session'] };
    }

    try {
      const session = this.activeSession;
      const spirit = this.spirits.get(session.spiritId)!;
      
      // Find the closest beat
      const closestBeat = session.beats.reduce((closest, beat) => {
        const currentDistance = Math.abs(beat.time - time);
        const closestDistance = Math.abs(closest.time - time);
        return currentDistance < closestDistance ? beat : closest;
      });

      const timingWindow = 0.2; // 200ms timing window
      const distance = Math.abs(closestBeat.time - time);
      const isInWindow = distance <= timingWindow;
      const timing = isInWindow ? 1 - (distance / timingWindow) : 0;

      // Update beat
      if (isInWindow && closestBeat.expected && !closestBeat.hit) {
        closestBeat.hit = hit;
        closestBeat.timing = timing;
      }

      // Calculate progress
      const hitBeats = session.beats.filter((b: any) => b.hit && b.expected).length;
      const expectedBeats = session.beats.filter((b: any) => b.expected).length;
      const accuracy = expectedBeats > 0 ? hitBeats / expectedBeats : 0;
      const progress = Math.min(100, accuracy * 100);

      // Update timeline
      const lastEntry = session.timeline[session.timeline.length - 1];
      const newEntry: TimelineEntry = {
        time,
        hits: hitBeats,
        misses: expectedBeats - hitBeats,
        aggression: Math.max(0, spirit.stats.tamingDifficulty - (accuracy * 10)),
        progress,
        tamed: progress >= 75 // 75% accuracy needed to tame
      };

      session.timeline.push(newEntry);
      session.accuracy = accuracy;
      session.score = Math.floor(accuracy * 1000 * timing);

      // Check if taming is complete
      if (newEntry.tamed) {
        session.result = 'success';
        this.completeTaming(session.spiritId, true);
      } else if (session.timeline.length > 20 && progress < 25) {
        // Failed if too many attempts with low progress
        session.result = 'failure';
        this.completeTaming(session.spiritId, false);
      }

      return {
        ok: true,
        result: {
          timing,
          accuracy,
          progress,
          aggression: newEntry.aggression,
          tamed: newEntry.tamed,
          sessionComplete: session.result !== 'in_progress'
        }
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return { ok: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  /**
   * Complete taming session
   */
  private completeTaming(spiritId: string, success: boolean): void {
    if (success) {
      this.player.tamedSpirits.push(spiritId);
      this.player.stats.totalSpirits++;
      this.player.stats.successfulTamings++;
      this.player.experience += 50;

      // Mark spirit as tamed
      const spirit = this.spirits.get(spiritId);
      if (spirit) {
        spirit.isWild = false;
      }
    }

    this.activeSession = null;
  }

  /**
   * Simulate battle between player and spirit
   */
  simulateBattle(spiritId: string): { ok: boolean; battle?: BattleResult; errors?: string[] } {
    try {
      const spirit = this.spirits.get(spiritId);
      if (!spirit) {
        return { ok: false, errors: [`Spirit ${spiritId} not found`] };
      }

      const turns: BattleTurn[] = [];
      let playerHealth = 100;
      let spiritHealth = spirit.stats.health;
      let turn = 1;
      const startTime = Date.now();

      while (playerHealth > 0 && spiritHealth > 0 && turn <= 20) {
        // Player turn
        const playerAttack = Math.floor(Math.random() * 20) + 10;
        const spiritDefense = spirit.stats.defense;
        const playerDamage = Math.max(1, playerAttack - spiritDefense);
        spiritHealth = Math.max(0, spiritHealth - playerDamage);

        turns.push({
          turn: turn++,
          actor: 'player',
          action: 'attack',
          damage: playerDamage,
          healthAfter: { player: playerHealth, spirit: spiritHealth }
        });

        if (spiritHealth <= 0) break;

        // Spirit turn
        const spiritAttack = spirit.stats.attack;
        const playerDefense = 5; // Base player defense
        const spiritDamage = Math.max(1, spiritAttack - playerDefense);
        playerHealth = Math.max(0, playerHealth - spiritDamage);

        turns.push({
          turn: turn++,
          actor: 'spirit',
          action: spirit.abilities[Math.floor(Math.random() * spirit.abilities.length)],
          damage: spiritDamage,
          healthAfter: { player: playerHealth, spirit: spiritHealth }
        });
      }

      const winner = playerHealth > 0 ? 'player' : 'spirit';
      const experience = winner === 'player' ? spirit.level * 10 : 0;
      const rewards = winner === 'player' ? ['experience', 'spirit_essence'] : [];

      if (winner === 'player') {
        this.player.stats.battleWins++;
        this.player.experience += experience;
      }

      const battle: BattleResult = {
        winner,
        turns,
        experience,
        rewards,
        duration: Date.now() - startTime
      };

      return { ok: true, battle };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return { ok: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  /**
   * Get taming session by ID
   */
  getTamingSession(sessionId: string): { ok: boolean; session?: TamingSession; errors?: string[] } {
    const session = this.tamingSessions.get(sessionId);
    if (!session) {
      return { ok: false, errors: [`Taming session ${sessionId} not found`] };
    }
    return { ok: true, session };
  }

  /**
   * List all taming sessions
   */
  listTamingSessions(): { ok: boolean; sessions: TamingSession[]; total: number } {
    const sessions = Array.from(this.tamingSessions.values());
    return { ok: true, sessions, total: sessions.length };
  }

  /**
   * Get game statistics
   */
  getStats(): { ok: boolean; stats: any } {
    const wildSpirits = Array.from(this.spirits.values()).filter((s: any) => s.isWild).length;
    const tamedSpirits = this.player.tamedSpirits.length;
    const completedSessions = Array.from(this.tamingSessions.values()).filter((s: any) => s.result !== 'in_progress').length;

    return {
      ok: true,
      stats: {
        player: this.player.stats,
        spirits: {
          total: this.spirits.size,
          wild: wildSpirits,
          tamed: tamedSpirits,
          tamingRate: this.spirits.size > 0 ? (tamedSpirits / this.spirits.size) * 100 : 0
        },
        sessions: {
          total: this.tamingSessions.size,
          completed: completedSessions,
          active: this.activeSession ? 1 : 0
        },
        location: this.player.location
      }
    };
  }

  /**
   * Export game data
   */
  exportData(format: 'save' | 'scenario' | 'summary' = 'save'): { ok: boolean; data?: any; errors?: string[] } {
    try {
      switch (format) {
        case 'save':
          return {
            ok: true,
            data: {
              schema: 'miff.spirit-tamer.save.v1',
              player: this.player,
              spirits: Object.fromEntries(this.spirits.entries()),
              sessions: Object.fromEntries(this.tamingSessions.entries()),
              activeSession: this.activeSession?.id || null,
              exportedAt: new Date().toISOString()
            }
          };

        case 'scenario':
          const activeSession = this.activeSession || Array.from(this.tamingSessions.values())[0];
          return {
            ok: true,
            data: {
              op: 'scenario',
              status: 'ok',
              name: 'SpiritTamerDemoPure',
              beats: activeSession?.beats || [],
              timeline: activeSession?.timeline || [],
              issues: []
            }
          };

        case 'summary':
          const stats = this.getStats();
          return {
            ok: true,
            data: {
              playerName: this.player.name,
              level: this.player.level,
              experience: this.player.experience,
              spiritsTamed: this.player.tamedSpirits.length,
              successRate: stats.stats.spirits.tamingRate,
              currentLocation: this.player.location,
              inventory: this.player.inventory.length
            }
          };

        default:
          return { ok: false, errors: [`Unknown export format: ${format}`] };
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return { ok: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  /**
   * Generate rhythm pattern for taming
   */
  private generateRhythmPattern(difficulty: number): TamingBeat[] {
    const beats: TamingBeat[] = [];
    const duration = 5 + difficulty; // 5-15 seconds based on difficulty
    const beatCount = Math.floor(duration * (1 + difficulty * 0.2)); // More beats for harder spirits

    for (let i = 0; i < beatCount; i++) {
      const time = (i / beatCount) * duration;
      const expected = Math.random() < 0.7; // 70% of beats require input
      beats.push({ time, expected });
    }

    return beats.sort((a: any, b: any) => a.time - b.time);
  }

  /**
   * Reset game state
   */
  reset(): { ok: boolean; message: string } {
    this.player = {
      name: 'Tamer',
      level: 1,
      experience: 0,
      location: { x: 85, y: 262, zone: 'grove' },
      inventory: ['spirit_flute', 'calming_herbs', 'energy_crystal'],
      tamedSpirits: [],
      equipment: { instrument: 'spirit_flute', accessory: null },
      stats: { totalSpirits: 0, successfulTamings: 0, battleWins: 0, rhythmAccuracy: 0 }
    };

    this.spirits.clear();
    this.tamingSessions.clear();
    this.activeSession = null;
    this.initializeSpirits();

    return { ok: true, message: 'Game state reset successfully' };
  }
}