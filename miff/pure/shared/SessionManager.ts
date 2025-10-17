/**
 * Session Management System for MIFF Framework
 * 
 * Provides comprehensive session management, including session storage,
 * cleanup, monitoring, and security features for production deployment.
 */

import { AuthenticationSystem, Session } from './AuthenticationSystem.js';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

export interface SessionConfig {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  maxSessionsPerUser: number;
  sessionTimeout: number; // seconds
  cleanupInterval: number; // seconds
  enableSessionPersistence: boolean;
  enableSessionEncryption: boolean;
  enableSessionMonitoring: boolean;
  maxInactiveTime: number; // seconds
  enableConcurrentSessionControl: boolean;
}

export interface SessionStats {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
  sessionsByUser: Map<string, number>;
  averageSessionDuration: number;
  peakConcurrentSessions: number;
  currentConcurrentSessions: number;
}

export interface SessionEvent {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  sessionId: string;
  userId: string;
  eventType: 'created' | 'updated' | 'expired' | 'deleted' | 'refreshed';
  details: any;
}

export interface SessionMonitor {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  isEnabled: boolean;
  checkInterval: number; // seconds
  alertThresholds: {
    maxSessionsPerUser: number;
    maxConcurrentSessions: number;
    sessionTimeoutWarning: number; // seconds
  };
  notifications: {
    email: boolean;
    webhook: boolean;
    log: boolean;
  };
}

export class SessionManager {
  
  private authSystem: AuthenticationSystem;
  private config: SessionConfig;
  private monitor: SessionMonitor;
  private events: SessionEvent[] = [];
  private cleanupTimer?: NodeJS.Timeout;
  private monitorTimer?: NodeJS.Timeout;
  private stats: SessionStats;

  constructor(authSystem: AuthenticationSystem, config: Partial<SessionConfig> = {}) {
    
    this.authSystem = authSystem;
    this.config = {
      maxSessionsPerUser: 5,
      sessionTimeout: 1800, // 30 minutes
      cleanupInterval: 300, // 5 minutes
      enableSessionPersistence: true,
      enableSessionEncryption: true,
      enableSessionMonitoring: true,
      maxInactiveTime: 900, // 15 minutes
      enableConcurrentSessionControl: true,
      ...config
    };

    this.monitor = {
      isEnabled: this.config.enableSessionMonitoring,
      checkInterval: 60, // 1 minute
      alertThresholds: {
        maxSessionsPerUser: this.config.maxSessionsPerUser,
        maxConcurrentSessions: 100,
        sessionTimeoutWarning: 300 // 5 minutes
      },
      notifications: {
        email: false,
        webhook: false,
        log: true
      }
    };

    this.stats = this.initializeStats();
    this.startCleanupTimer();
    this.startMonitorTimer();
  }

  /**
   * Create a new session
   */
  async createSession(userId: string, token: string, refreshToken: string, ipAddress?: string, userAgent?: string): Promise<Session> {
    try {
      // Check concurrent session limits
      if (this.config.enableConcurrentSessionControl) {
        const userSessions = this.authSystem.getUserSessions(userId);
        if (userSessions.length >= this.config.maxSessionsPerUser) {
          // Remove oldest session
          const oldestSession = userSessions.reduce((oldest, current) => 
            current.createdAt < oldest.createdAt ? current : oldest
          );
          await this.terminateSession(oldestSession.id);
        }
      }

      const session: Session = {
        id: this.generateSessionId(),
        userId,
        token,
        refreshToken,
        expiresAt: new Date(Date.now() + this.config.sessionTimeout * 1000),
        createdAt: new Date(),
        lastActivity: new Date(),
        ipAddress,
        userAgent,
        isActive: true
      };

      // Store session (in real implementation, use database)
      this.authSystem['sessions'].set(session.id, session);

      // Log event
      this.logEvent({
        id: this.generateEventId(),
        sessionId: session.id,
        userId,
        eventType: 'created',
        timestamp: new Date(),
        details: { ipAddress, userAgent }
      });

      // Update stats
      this.updateStats();

      return session;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new Error(`Failed to create session: ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): Session! {
    return this.authSystem['sessions'].get(sessionId);
  }

  /**
   * Get active sessions for user
   */
  getUserSessions(userId: string): Session[] {
    return this.authSystem.getUserSessions(userId);
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(sessionId: string): Promise<boolean> {
    try {
      const session = this.getSession(sessionId);
      if (!session || !session.isActive) {
        return false;
      }

      session.lastActivity = new Date();
      this.authSystem['sessions'].set(sessionId, session);

      // Log event
      this.logEvent({
        id: this.generateEventId(),
        sessionId,
        userId: session.userId,
        eventType: 'updated',
        timestamp: new Date(),
        details: { activity: 'lastActivity' }
      });

      return true;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Failed to update session activity:', err instanceof Error ? err.message : String(err));
      return false;
    }
  }

  /**
   * Refresh session
   */
  async refreshSession(sessionId: string, newToken: string): Promise<boolean> {
    try {
      const session = this.getSession(sessionId);
      if (!session || !session.isActive) {
        return false;
      }

      session.token = newToken;
      session.expiresAt = new Date(Date.now() + this.config.sessionTimeout * 1000);
      session.lastActivity = new Date();
      this.authSystem['sessions'].set(sessionId, session);

      // Log event
      this.logEvent({
        id: this.generateEventId(),
        sessionId,
        userId: session.userId,
        eventType: 'refreshed',
        timestamp: new Date(),
        details: { newToken: true }
      });

      return true;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Failed to refresh session:', err instanceof Error ? err.message : String(err));
      return false;
    }
  }

  /**
   * Terminate session
   */
  async terminateSession(sessionId: string): Promise<boolean> {
    try {
      const session = this.getSession(sessionId);
      if (!session) {
        return false;
      }

      session.isActive = false;
      this.authSystem['sessions'].set(sessionId, session);

      // Log event
      this.logEvent({
        id: this.generateEventId(),
        sessionId,
        userId: session.userId,
        eventType: 'deleted',
        timestamp: new Date(),
        details: { reason: 'terminated' }
      });

      // Update stats
      this.updateStats();

      return true;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Failed to terminate session:', err instanceof Error ? err.message : String(err));
      return false;
    }
  }

  /**
   * Terminate all sessions for user
   */
  async terminateUserSessions(userId: string): Promise<number> {
    try {
      const userSessions = this.getUserSessions(userId);
      let terminatedCount = 0;

      for (const session of userSessions) {
        if (await this.terminateSession(session.id)) {
          terminatedCount++;
        }
      }

      return terminatedCount;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Failed to terminate user sessions:', err instanceof Error ? err.message : String(err));
      return 0;
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const now = new Date();
      const expiredSessions: Session[] = [];

      for (const session of this.authSystem['sessions'].values()) {
        if (session.isActive && 
            (session.expiresAt < now || 
             (now.getTime() - session.lastActivity.getTime()) > this.config.maxInactiveTime * 1000)) {
          expiredSessions.push(session);
        }
      }

      let cleanedCount = 0;
      for (const session of expiredSessions) {
        session.isActive = false;
        this.authSystem['sessions'].set(session.id, session);

        // Log event
        this.logEvent({
          id: this.generateEventId(),
          sessionId: session.id,
          userId: session.userId,
          eventType: 'expired',
          timestamp: new Date(),
          details: { reason: 'expired' }
        });

        cleanedCount++;
      }

      // Update stats
      this.updateStats();

      return cleanedCount;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Failed to cleanup expired sessions:', err instanceof Error ? err.message : String(err));
      return 0;
    }
  }

  /**
   * Get session statistics
   */
  getStats(): SessionStats {
    return { ...this.stats };
  }

  /**
   * Get session events
   */
  getEvents(limit: number = 100): SessionEvent[] {
    return this.events
      .sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get session events for user
   */
  getUserEvents(userId: string, limit: number = 50): SessionEvent[] {
    return this.events
      .filter((event: any) => event.userId === userId)
      .sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Check if session is valid
   */
  isSessionValid(): boolean {
    const session = this.getSession(sessionId);
    if (!session || !session.isActive) {
      return false;
    }

    const now = new Date();
    return session.expiresAt > now && 
           (now.getTime() - session.lastActivity.getTime()) <= this.config.maxInactiveTime * 1000;
  }

  /**
   * Get monitoring alerts
   */
  getAlerts(): string[] {
    const alerts: string[] = [];
    const now = new Date();

    // Check for sessions approaching timeout
    for (const session of this.authSystem['sessions'].values()) {
      if (session.isActive) {
        const timeUntilExpiry = session.expiresAt.getTime() - now.getTime();
        if (timeUntilExpiry <= this.monitor.alertThresholds.sessionTimeoutWarning * 1000) {
          alerts.push(`Session ${session.id} expires in ${Math.floor(timeUntilExpiry / 1000)} seconds`);
        }
      }
    }

    // Check concurrent session limits
    if (this.stats.currentConcurrentSessions > this.monitor.alertThresholds.maxConcurrentSessions) {
      alerts.push(`High concurrent session count: ${this.stats.currentConcurrentSessions}`);
    }

    return alerts;
  }

  /**
   * Destroy session manager
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(async () => {
      try {
        const cleanedCount = await this.cleanupExpiredSessions();
        if (cleanedCount > 0) {
          console.info(`Cleaned up ${cleanedCount} expired sessions`);
        }
      } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
        console.error('Session cleanup error:', err instanceof Error ? err.message : String(err));
      }
    }, this.config.cleanupInterval * 1000);
  }

  private startMonitorTimer(): void {
    if (!this.monitor.isEnabled) return;

    this.monitorTimer = setInterval(() => {
      try {
        this.updateStats();
        const alerts = this.getAlerts();
        if (alerts.length > 0 && this.monitor.notifications.log) {
          console.info('Session monitoring alerts:', alerts);
        }
      } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
        console.error('Session monitoring error:', err instanceof Error ? err.message : String(err));
      }
    }, this.monitor.checkInterval * 1000);
  }

  private updateStats(): void {
    const sessions = Array.from(this.authSystem['sessions'].values());
    const activeSessions = sessions.filter((s: any) => s.isActive);
    const expiredSessions = sessions.filter((s: any) => !s.isActive);

    // Count sessions by user
    const sessionsByUser = new Map<string, number>();
    for (const session of activeSessions) {
      const count = sessionsByUser.get(session.userId) || 0;
      sessionsByUser.set(session.userId, count + 1);
    }

    // Calculate average session duration
    const completedSessions = sessions.filter((s: any) => !s.isActive);
    const totalDuration = completedSessions.reduce((sum, s) => 
      sum + (s.lastActivity.getTime() - s.createdAt.getTime()), 0);
    const averageDuration = completedSessions.length > 0 ? totalDuration / completedSessions.length : 0;

    this.stats = {
      totalSessions: sessions.length,
      activeSessions: activeSessions.length,
      expiredSessions: expiredSessions.length,
      sessionsByUser,
      averageSessionDuration: averageDuration,
      peakConcurrentSessions: Math.max(this.stats.peakConcurrentSessions, activeSessions.length),
      currentConcurrentSessions: activeSessions.length
    };
  }

  private initializeStats(): SessionStats {
    return {
      totalSessions: 0,
      activeSessions: 0,
      expiredSessions: 0,
      sessionsByUser: new Map(),
      averageSessionDuration: 0,
      peakConcurrentSessions: 0,
      currentConcurrentSessions: 0
    };
  }

  private logEvent(event: SessionEvent): void {
    this.events.push(event: any);
    
    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default SessionManager;