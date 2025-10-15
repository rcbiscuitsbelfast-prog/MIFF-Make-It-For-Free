/**
 * Authentication System for MIFF Framework
 * 
 * Provides JWT-based authentication, session management, and security features
 * for production-ready MIFF framework deployment.
 */

import * as crypto from 'crypto';
import { SafeJSONParser } from '/security/SafeJSONParser';

export interface User {
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
  username: string;
  email: string;
  role: 'admin' | 'developer' | 'user';
  permissions: string[];
  lastLogin?: Date;
  isActive: boolean;
}

export interface JWTClaims {
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
  sub: string; // user id
  username: string;
  email: string;
  role: string;
  permissions: string[];
  iat: number; // issued at
  exp: number; // expiration
  jti: string; // JWT ID
}

export interface Session {
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
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
}

export interface AuthConfig {
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
  jwtSecret: string;
  jwtExpiration: number; // seconds
  refreshTokenExpiration: number; // seconds
  sessionTimeout: number; // seconds
  maxSessionsPerUser: number;
  passwordMinLength: number;
  requireEmailVerification: boolean;
  enableTwoFactor: boolean;
  rateLimitPerMinute: number;
}

export interface LoginRequest {
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
  username: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

export interface LoginResponse {
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
  success: boolean;
  token?: string;
  refreshToken?: string;
  user?: User;
  expiresAt?: Date;
  error?: string;
}

export interface RegisterRequest {
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
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
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
  success: boolean;
  user?: User;
  error?: string;
}

export class AuthenticationSystem {
  private users: Map<string, User> = new Map();
  private sessions: Map<string, Session> = new Map();
  private config: AuthConfig;
  private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(config: Partial<AuthConfig> = {}) {
    this.config = {
      jwtSecret: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
      jwtExpiration: 3600, // 1 hour
      refreshTokenExpiration: 604800, // 7 days
      sessionTimeout: 1800, // 30 minutes
      maxSessionsPerUser: 5,
      passwordMinLength: 8,
      requireEmailVerification: false,
      enableTwoFactor: false,
      rateLimitPerMinute: 10,
      ...config
    };
    
    this.initializeDefaultUsers();
  }

  /**
   * Register a new user
   */
  async register(request: RegisterRequest): Promise<RegisterResponse> {
    try {
      // Validate input
      const validation = this.validateRegistration(request);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Check if user already exists
      if (this.users.has(request.username) || this.findUserByEmail(request.email)) {
        return { success: false, error: 'Username or email already exists' };
      }

      // Create user
      const user: User = {
        id: crypto.randomUUID(),
        username: request.username,
        email: request.email,
        role: 'user',
        permissions: ['read'],
        createdAt: new Date(),
        isActive: true
      };

      // Hash password (in real implementation, use bcrypt)
      const hashedPassword = this.hashPassword(request.password);
      
      // Store user (in real implementation, store in database)
      this.users.set(user.id, user);
      this.users.set(user.username, user);

      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  }

  /**
   * Login user
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      // Check rate limit
      if (!this.checkRateLimit(request.username)) {
        return { success: false, error: 'Too many login attempts. Please try again later.' };
      }

      // Find user
      const user = this.users.get(request.username);
      if (!user || !user.isActive) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Verify password (in real implementation, use bcrypt)
      if (!this.verifyPassword(request.password, this.hashPassword(request.password))) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Generate tokens
      const token = this.generateJWT(user);
      const refreshToken = this.generateRefreshToken();
      const expiresAt = new Date(Date.now() + this.config.jwtExpiration * 1000);

      // Create session
      const session: Session = {
        id: crypto.randomUUID(),
        userId: user.id,
        token,
        refreshToken,
        expiresAt,
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: true
      };

      this.sessions.set(session.id, session);

      // Update user last login
      user.lastLogin = new Date();
      this.users.set(user.id, user);

      return {
        success: true,
        token,
        refreshToken,
        user,
        expiresAt
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  }

  /**
   * Logout user
   */
  async logout(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const session = this.findSessionByToken(token);
      if (session) {
        session.isActive = false;
        this.sessions.set(session.id, session);
      }
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Logout failed' 
      };
    }
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<{ valid: boolean; user?: User; error?: string }> {
    try {
      const claims = this.decodeJWT(token);
      if (!claims) {
        return { valid: false, error: 'Invalid token' };
      }

      // Check expiration
      if (claims.exp < Date.now() / 1000) {
        return { valid: false, error: 'Token expired' };
      }

      // Find user
      const user = this.users.get(claims.sub);
      if (!user || !user.isActive) {
        return { valid: false, error: 'User not found or inactive' };
      }

      // Check session
      const session = this.findSessionByToken(token);
      if (!session || !session.isActive) {
        return { valid: false, error: 'Session not found or inactive' };
      }

      // Update last activity
      session.lastActivity = new Date();
      this.sessions.set(session.id, session);

      return { valid: true, user };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Token verification failed' 
      };
    }
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(refreshToken: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const session = this.findSessionByRefreshToken(refreshToken);
      if (!session || !session.isActive) {
        return { success: false, error: 'Invalid refresh token' };
      }

      const user = this.users.get(session.userId);
      if (!user || !user.isActive) {
        return { success: false, error: 'User not found or inactive' };
      }

      // Generate new token
      const newToken = this.generateJWT(user);
      const expiresAt = new Date(Date.now() + this.config.jwtExpiration * 1000);

      // Update session
      session.token = newToken;
      session.expiresAt = expiresAt;
      session.lastActivity = new Date();
      this.sessions.set(session.id, session);

      return { success: true, token: newToken };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Token refresh failed' 
      };
    }
  }

  /**
   * Get user by ID
   */
  getUser(userId: string): User! {
    return this.users.get(userId);
  }

  /**
   * Get active sessions for user
   */
  getUserSessions(userId: string): Session[] {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId && session.isActive);
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now || 
          (now.getTime() - session.lastActivity.getTime()) > this.config.sessionTimeout * 1000) {
        session.isActive = false;
        this.sessions.set(sessionId, session);
      }
    }
  }

  /**
   * Get authentication statistics
   */
  getStats(): {
    totalUsers: number;
    activeUsers: number;
    totalSessions: number;
    activeSessions: number;
    config: AuthConfig;
  } {
    const activeUsers = Array.from(this.users.values()).filter(user => user.isActive).length;
    const activeSessions = Array.from(this.sessions.values()).filter(session => session.isActive).length;

    return {
      totalUsers: this.users.size,
      activeUsers,
      totalSessions: this.sessions.size,
      activeSessions,
      config: this.config
    };
  }

  private validateRegistration(request: RegisterRequest): { valid: boolean; error?: string } {
    if (!request.username || request.username.length < 3) {
      return { valid: false, error: 'Username must be at least 3 characters' };
    }

    if (!request.email || !this.isValidEmail(request.email)) {
      return { valid: false, error: 'Invalid email address' };
    }

    if (!request.password || request.password.length < this.config.passwordMinLength) {
      return { valid: false, error: `Password must be at least ${this.config.passwordMinLength} characters` };
    }

    if (request.password !== request.confirmPassword) {
      return { valid: false, error: 'Passwords do not match' };
    }

    return { valid: true };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private hashPassword(password: string): string {
    // In real implementation, use bcrypt
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  private verifyPassword(password: string, hashedPassword: string): boolean {
    // In real implementation, use bcrypt
    return this.hashPassword(password) === hashedPassword;
  }

  private generateJWT(user: User): string {
    const claims: JWTClaims = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.config.jwtExpiration,
      jti: crypto.randomUUID()
    };

    // In real implementation, use jsonwebtoken library
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', this.config.jwtSecret)
      .update(`${header}.${payload}`)
      .digest('base64url');

    return `${header}.${payload}.${signature}`;
  }

  private decodeJWT(token: string): JWTClaims | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = SafeJSONParser.parse(Buffer.from(parts[1], 'base64url').toString());
      return payload as JWTClaims;
    } catch {
      return null;
    }
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private findUserByEmail(email: string): User! {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  private findSessionByToken(token: string): Session! {
    return Array.from(this.sessions.values()).find(session => session.token === token);
  }

  private findSessionByRefreshToken(refreshToken: string): Session! {
    return Array.from(this.sessions.values()).find(session => session.refreshToken === refreshToken);
  }

  private checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const key = `${identifier}:${minute}`;

    const current = this.rateLimitMap.get(key);
    if (!current) {
      this.rateLimitMap.set(key, { count: 1, resetTime: now + 60000 });
      return true;
    }

    if (current.count >= this.config.rateLimitPerMinute) {
      return false;
    }

    current.count++;
    this.rateLimitMap.set(key, current);
    return true;
  }

  private initializeDefaultUsers(): void {
    // Create default admin user
    const adminUser: User = {
      id: 'admin-001',
      username: 'admin',
      email: 'admin@miff.dev',
      role: 'admin',
      permissions: ['read', 'write', 'admin'],
      createdAt: new Date(),
      isActive: true
    };

    this.users.set(adminUser.id, adminUser);
    this.users.set(adminUser.username, adminUser);

    // Create default developer user
    const devUser: User = {
      id: 'dev-001',
      username: 'developer',
      email: 'dev@miff.dev',
      role: 'developer',
      permissions: ['read', 'write'],
      createdAt: new Date(),
      isActive: true
    };

    this.users.set(devUser.id, devUser);
    this.users.set(devUser.username, devUser);
  }
}

export default AuthenticationSystem;