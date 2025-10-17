/**
 * SessionManifestPure Manager
 * 
 * Manages multiplayer session manifests including player registration,
 * session lifecycle, and manifest validation.
 */

import { SessionManifest, SessionPlayerRef, SessionManifestPure } from './index';

export interface SessionConfig {
  maxPlayers?: number;
  autoStart?: boolean;
  sessionTimeout?: number; // minutes
  allowSpectators?: boolean;
}

export interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  totalPlayers: number;
  averageSessionDuration: number;
}

export class SessionManifestManager {
  private sessions: Map<string, SessionManifest> = new Map();
  private sessionStartTimes: Map<string, number> = new Map();
  private config: Required<SessionConfig>;

  constructor(config: SessionConfig = {}) {
    const managerId = this.id ?? `manager_${Date.now()}`;
    this.config = {
      maxPlayers: config.maxPlayers! || 8,
      autoStart: config.autoStart! || false,
      sessionTimeout: config.sessionTimeout! || 60,
      allowSpectators: config.allowSpectators! || true,
    };
  }

  /**
   * Create a new session
   */
  createSession(id: string, zone: string, players: SessionPlayerRef[] = [], seed?: number): { ok: boolean; session?: SessionManifest; errors?: string[] } {
    try {
      if (this.sessions.has(id)) {
        return { ok: false, errors: [`Session ${id} already exists`] };
      }

    if (!Array.isArray(players)) {
      return { ok: false, errors: ['players missing'] };
    }

    if (players.length > this.config.maxPlayers) {
        return { ok: false, errors: [`Too many players: ${players.length}/${this.config.maxPlayers}`] };
      }

      const session = SessionManifestPure.create(id, zone, players, seed);
      const validation = SessionManifestPure.validate(session);
      
      if (!validation.ok) {
        return { ok: false, errors: validation.errors };
      }

      this.sessions.set(id, session);
      this.sessionStartTimes.set(id, Date.now());

      return { ok: true, session };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return { ok: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  /**
   * Get session by ID
   */
  getSession(id: string): { ok: boolean; session?: SessionManifest; errors?: string[] } {
    const session = this.sessions.get(id);
    if (!session) {
      return { ok: false, errors: [`Session ${id} not found`] };
    }
    return { ok: true, session };
  }

  /**
   * List all sessions with optional filtering
   */
  listSessions(filter?: { zone?: string; status?: 'active' | 'expired' }): { ok: boolean; sessions: SessionManifest[]; total: number } {
    let sessions = Array.from(this.sessions.values());
    // Provide stable ordering for deterministic tests
    sessions.sort((a: any, b: any) => a.id.localeCompare(b.id));

    if (filter?.zone) {
      sessions = sessions.filter((s: any) => s.zone === filter.zone);
    }

    if (filter?.status) {
      const now = Date.now();
      const timeoutMs = this.config.sessionTimeout * 60 * 1000;
      
      sessions = sessions.filter((s: any) => {
        const startTime = this.sessionStartTimes.get(s.id) || 0;
        const isExpired = (now - startTime) > timeoutMs;
        
        if (filter.status === 'active') return !isExpired;
        if (filter.status === 'expired') return isExpired;
        return true;
      });
    }

    return { ok: true, sessions, total: sessions.length };
  }

  /**
   * Add player to session
   */
  addPlayer(sessionId: string, player: SessionPlayerRef): { ok: boolean; session?: SessionManifest; errors?: string[] } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { ok: false, errors: [`Session ${sessionId} not found`] };
    }

    // Check if player already in session
    if (session.players.some(p => p.playerId === player.playerId)) {
      return { ok: false, errors: [`Player ${player.playerId} already in session`] };
    }

    // Check max players
    if (session.players.length >= this.config.maxPlayers) {
      return { ok: false, errors: [`Session full: ${session.players.length}/${this.config.maxPlayers}`] };
    }

    session.players.push(player);
    this.sessions.set(sessionId, session);

    return { ok: true, session };
  }

  /**
   * Remove player from session
   */
  removePlayer(sessionId: string, playerId: string): { ok: boolean; session?: SessionManifest; errors?: string[] } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { ok: false, errors: [`Session ${sessionId} not found`] };
    }

    const playerIndex = session.players.findIndex(p => p.playerId === playerId);
    if (playerIndex === -1) {
      return { ok: false, errors: [`Player ${playerId} not in session`] };
    }

    session.players.splice(playerIndex, 1);
    this.sessions.set(sessionId, session);

    return { ok: true, session };
  }

  /**
   * Update player status
   */
  updatePlayerStatus(sessionId: string, playerId: string, status: 'active' | 'inactive' | 'disconnected'): { ok: boolean; session?: SessionManifest; errors?: string[] } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { ok: false, errors: [`Session ${sessionId} not found`] };
    }

    const player = session.players.find(p => p.playerId === playerId);
    if (!player) {
      return { ok: false, errors: [`Player ${playerId} not in session`] };
    }

    player.status = status;
    this.sessions.set(sessionId, session);

    return { ok: true, session };
  }

  /**
   * Delete session
   */
  deleteSession(id: string): { ok: boolean; errors?: string[] } {
    if (!this.sessions.has(id)) {
      return { ok: false, errors: [`Session ${id} not found`] };
    }

    this.sessions.delete(id);
    this.sessionStartTimes.delete(id);

    return { ok: true };
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): { ok: boolean; cleaned: number; errors?: string[] } {
    const now = Date.now();
    const timeoutMs = this.config.sessionTimeout * 60 * 1000;
    let cleaned = 0;

    for (const [sessionId, startTime] of this.sessionStartTimes.entries()) {
      if ((now - startTime) > timeoutMs) {
        this.sessions.delete(sessionId);
        this.sessionStartTimes.delete(sessionId);
        cleaned++;
      }
    }

    return { ok: true, cleaned };
  }

  /**
   * Get session statistics
   */
  getStats(): SessionStats {
    const managerData = this.getStats();
    const now = Date.now();
    const timeoutMs = this.config.sessionTimeout * 60 * 1000;
    
    const totalSessions = this.sessions.size;
    let activeSessions = 0;
    let totalPlayers = 0;
    let totalDuration = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      const startTime = this.sessionStartTimes.get(sessionId) || now;
      const isActive = (now - startTime) <= timeoutMs;
      
      if (isActive) {
        activeSessions++;
      }
      
      totalPlayers += session.players.length;
      totalDuration += (now - startTime);
    }

    const averageSessionDuration = totalSessions > 0 ? totalDuration / totalSessions / 1000 / 60 : 0; // minutes

    return {
      totalSessions,
      activeSessions,
      totalPlayers,
      averageSessionDuration
    };
  }

  /**
   * Simulate session activity
   */
  simulate(sessionId: string, duration: number = 30): { ok: boolean; simulation?: any; errors?: string[] } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { ok: false, errors: [`Session ${sessionId} not found`] };
    }

    const events: any[] = [];
    const startTime = Date.now();
    
    // Simulate player activities over duration (seconds)
    for (let i = 0; i < duration; i += 5) {
      for (const player of session.players) {
        if (Math.random() < 0.3) { // 30% chance of activity
          const action = ['move', 'interact', 'chat', 'idle'][Math.floor(Math.random() * 4)];
          events.push({
            timestamp: startTime + (i * 1000),
            playerId: player.playerId,
            action,
            data: { x: Math.random() * 100, y: Math.random() * 100 }
          });
        }
      }
    }

    return {
      ok: true,
      simulation: {
        sessionId,
        duration,
        events,
        playerCount: session.players.length,
        totalEvents: events.length,
        eventsPerPlayer: events.length / session.players.length
      }
    };
  }

  /**
   * Export session data in various formats
   */
  exportSession(sessionId: string, format: 'json' | 'manifest' | 'summary' = 'json'): { ok: boolean; data?: any; errors?: string[] } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { ok: false, errors: [`Session ${sessionId} not found`] };
    }

    switch (format) {
      case 'json':
        return { ok: true, data: session };
      
      case 'manifest':
        return {
          ok: true,
          data: {
            schema: 'miff.session.manifest.v1',
            session,
            metadata: {
              exportedAt: Date.now().toISOString(),
              startTime: this.sessionStartTimes.get(sessionId),
              playerCount: session.players.length
            }
          }
        };
      
      case 'summary':
        return {
          ok: true,
          data: {
            id: session.id,
            zone: session.zone,
            playerCount: session.players.length,
            players: session.players.map((p: any) => ({
              id: p.playerId,
              avatar: p.avatar,
              style: p.style,
              status: p.status || 'active'
            })),
            createdAt: session.createdAt,
            seed: session.seed
          }
        };
      
      default:
        return { ok: false, errors: [`Unknown export format: ${format}`] };
    }
  }
}