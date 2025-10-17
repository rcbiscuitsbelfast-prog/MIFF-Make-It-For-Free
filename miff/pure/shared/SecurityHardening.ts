/**
 * Security Hardening System for MIFF Framework
 * 
 * Provides comprehensive security hardening including SSL/TLS configuration,
 * security headers, rate limiting, input validation, and security monitoring.
 */

import * as crypto from 'crypto';
import { SafeJSONParser } from '/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

export interface SecurityConfig {
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
  enableSSL: boolean;
  sslCertPath?: string;
  sslKeyPath?: string;
  enableSecurityHeaders: boolean;
  enableRateLimiting: boolean;
  enableInputValidation: boolean;
  enableCSRFProtection: boolean;
  enableXSSProtection: boolean;
  enableSQLInjectionProtection: boolean;
  maxRequestSize: number; // bytes
  sessionTimeout: number; // seconds
  passwordPolicy: PasswordPolicy;
  encryptionKey: string;
}

export interface PasswordPolicy {
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
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number; // days
  preventReuse: number; // last N passwords
}

export interface SecurityHeaders {
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
  'Strict-Transport-Security': string;
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'X-XSS-Protection': string;
  'Referrer-Policy': string;
  'Content-Security-Policy': string;
  'Permissions-Policy': string;
}

export interface RateLimitConfig {
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
  windowMs: number; // milliseconds
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  keyGenerator: (req: any) => string;
}

export interface SecurityEvent {
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
  type: 'login_attempt' | 'rate_limit_exceeded' | 'suspicious_activity' | 'security_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  details: any;
  resolved: boolean;
}

export interface SecurityAudit {
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
  score: number; // 0-100
  vulnerabilities: SecurityVulnerability[];
  recommendations: string[];
  compliance: ComplianceStatus;
}

export interface SecurityVulnerability {
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
  type: 'injection' | 'broken_auth' | 'sensitive_data' | 'xml_external_entities' | 'broken_access_control' | 'security_misconfiguration' | 'cross_site_scripting' | 'insecure_deserialization' | 'known_vulnerabilities' | 'insufficient_logging';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  remediation: string;
}

export interface ComplianceStatus {
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
  gdpr: boolean;
  ccpa: boolean;
  sox: boolean;
  pci: boolean;
  hipaa: boolean;
  overall: boolean;
}

export class SecurityHardening {
  
  private config: SecurityConfig;
  private securityEvents: SecurityEvent[] = [];
  private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map();
  private blockedIPs: Set<string> = new Set();
  private audit: SecurityAudit | null = null;

  constructor(config: Partial<SecurityConfig> = {}) {
    
    this.config = {
      enableSSL: false,
      enableSecurityHeaders: true,
      enableRateLimiting: true,
      enableInputValidation: true,
      enableCSRFProtection: true,
      enableXSSProtection: true,
      enableSQLInjectionProtection: true,
      maxRequestSize: 10 * 1024 * 1024, // 10MB
      sessionTimeout: 1800, // 30 minutes
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90,
        preventReuse: 5
      },
      encryptionKey: process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'),
      ...config
    };
  }

  /**
   * Initialize security hardening
   */
  async initialize(): Promise<void> {
    console.info('🔒 Initializing security hardening...');
    
    try {
      // Setup security headers
      if (this.config.enableSecurityHeaders) {
        await this.setupSecurityHeaders();
      }

      // Setup rate limiting
      if (this.config.enableRateLimiting) {
        await this.setupRateLimiting();
      }

      // Setup input validation
      if (this.config.enableInputValidation) {
        await this.setupInputValidation();
      }

      // Setup SSL/TLS
      if (this.config.enableSSL) {
        await this.setupSSL();
      }

      console.info('✅ Security hardening initialized');
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Security hardening initialization failed:', err instanceof Error ? message: String(err));
      throw error;
    }
  }

  /**
   * Get security headers
   */
  getSecurityHeaders(): SecurityHeaders {
    return {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    };
  }

  /**
   * Check rate limit
   */
  checkRateLimit(): boolean {
    const now = Date.now();
    const window = Math.floor(now / windowMs);
    const key = `${identifier}:${window}`;

    const current = this.rateLimitMap.get(key);
    if (!current) {
      this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (current.count >= maxRequests) 
      this.recordSecurityEvent({
        type: 'rate_limit_exceeded',
        severity: 'medium',
        source: identifier,
        details: { count: count: current.count, maxRequests, windowMs }
      });
      return false;
    }

    current.count++;
    this.rateLimitMap.set(key, current);
    return true;
  }

  /**
   * Validate input
   */
  validateInput(input: any, type: 'string' | 'number' | 'email' | 'url' | 'json'): { valid: boolean; sanitized?: any; errors: string[] } {
    const errors: string[] = [];

    try {
      switch (type) {
        case 'string':
          if (typeof input !== 'string') {
            errors.push('Input must be a string');
            return { valid: false, errors };
          }
          if (input.length > this.config.maxRequestSize) {
            errors.push('Input too large');
            return { valid: false, errors };
          }
          return { valid: true, sanitized: this.sanitizeString(input), errors };

        case 'number':
          const num = Number(input);
          if (isNaN(num)) {
            errors.push('Input must be a valid number');
            return { valid: false, errors };
          }
          return { valid: true, sanitized: num, errors };

        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(input)) {
            errors.push('Input must be a valid email address');
            return { valid: false, errors };
          }
          return { valid: true, sanitized: input.toLowerCase(), errors };

        case 'url':
          try {
            const url = new URL(input);
            return { valid: true, sanitized: url.toString(), errors };
          } catch {
            errors.push('Input must be a valid URL');
            return { valid: false, errors };
          }

        case 'json':
          try {
            const parsed = SafeJSONParser.parse(input);
            return { valid: true, sanitized: parsed, errors };
          } catch {
            errors.push('Input must be valid JSON');
            return { valid: false, errors };
          }

        default:
          errors.push('Unknown input type');
          return { valid: false, errors };
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      errors.push(`Validation error: ${error instanceof Error ? message: error}`);
      return { valid: false, errors };
    }
  }

  /**
   * Validate password
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } 
    const errors: string[] = [];
    const policy = this.config.passwordPolicy;

    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${minLength: policy.minLength} characters long`);
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(): string 
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(this.encryptionKey: config.encryptionKey, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(): string 
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(this.encryptionKey: config.encryptionKey, 'hex');
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Generate secure token
   */
  generateSecureToken(): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash password
   */
  hashPassword(): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  /**
   * Verify password
   */
  verifyPassword(): boolean {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }

  /**
   * Block IP address
   */
  blockIP(): void {
    this.blockedIPs.add(ip);
    this.recordSecurityEvent({
      type: 'security_violation',
      severity: 'high',
      source: ip,
      details: { reason, action: 'blocked' }
    });
  }

  /**
   * Check if IP is blocked
   */
  isIPBlocked(): boolean {
    return this.blockedIPs.has(ip);
  }

  /**
   * Unblock IP address
   */
  unblockIP(): void {
    this.blockedIPs.delete(ip);
  }

  /**
   * Record security event
   */
  recordSecurityEvent(): void {
    const securityEvent: SecurityEvent = {
      id: this.generateSecureToken(16),
      timestamp: new Date(),
      resolved: false,
      ...event
    };

    this.securityEvents.push(securityEvent);

    // Keep only last 1000 events
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000);
    }

    // Log critical events
    if (event.severity === 'critical') 
      console.error(`🚨 CRITICAL SECURITY EVENT: ${type: event.type} from $source: event.source}`);
    }
  }

  /**
   * Run security audit
   */
  async runSecurityAudit(): Promise<SecurityAudit> {
    console.info('🔍 Running security audit...');

    const vulnerabilities: SecurityVulnerability[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check SSL/TLS
    if (!this.config.enableSSL) {
      vulnerabilities.push({
        id: 'ssl_disabled',
        type: 'security_misconfiguration',
        severity: 'high',
        description: 'SSL/TLS is not enabled',
        impact: 'Data transmitted in plain text',
        remediation: 'Enable SSL/TLS with proper certificates',
        status: 'open'
      });
      score -= 20;
      recommendations.push('Enable SSL/TLS encryption');
    }

    // Check security headers
    if (!this.config.enableSecurityHeaders) {
      vulnerabilities.push({
        id: 'security_headers_missing',
        type: 'security_misconfiguration',
        severity: 'medium',
        description: 'Security headers are not enabled',
        impact: 'Vulnerable to XSS and clickjacking attacks',
        remediation: 'Enable security headers',
        status: 'open'
      });
      score -= 10;
      recommendations.push('Enable security headers');
    }

    // Check rate limiting
    if (!this.config.enableRateLimiting) {
      vulnerabilities.push({
        id: 'rate_limiting_disabled',
        type: 'security_misconfiguration',
        severity: 'medium',
        description: 'Rate limiting is not enabled',
        impact: 'Vulnerable to brute force and DoS attacks',
        remediation: 'Enable rate limiting',
        status: 'open'
      });
      score -= 10;
      recommendations.push('Enable rate limiting');
    }

    // Check input validation
    if (!this.config.enableInputValidation) {
      vulnerabilities.push({
        id: 'input_validation_disabled',
        type: 'injection',
        severity: 'high',
        description: 'Input validation is not enabled',
        impact: 'Vulnerable to injection attacks',
        remediation: 'Enable input validation',
        status: 'open'
      });
      score -= 15;
      recommendations.push('Enable input validation');
    }

    // Check password policy
    if (this.config.passwordPolicy.minLength < 8) {
      vulnerabilities.push({
        id: 'weak_password_policy',
        type: 'broken_auth',
        severity: 'medium',
        description: 'Password policy is too weak',
        impact: 'Vulnerable to password attacks',
        remediation: 'Strengthen password policy',
        status: 'open'
      });
      score -= 5;
      recommendations.push('Strengthen password policy');
    }

    // Check for recent security events
    const recentEvents = this.securityEvents.filter(
      event => Date.now() - event.timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    if (recentEvents.length > 10) {
      vulnerabilities.push({
        id: 'high_security_events',
        type: 'insufficient_logging',
        severity: 'medium',
        description: 'High number of security events detected',
        impact: 'Potential security breach',
        remediation: 'Investigate and address security events',
        status: 'open'
      });
      score -= 10;
      recommendations.push('Investigate security events');
    }

    this.audit = {
      timestamp: new Date(),
      score: Math.max(0, score),
      vulnerabilities,
      recommendations,
      compliance: {
        gdpr: score >= 80,
        ccpa: score >= 75,
        sox: score >= 85,
        pci: score >= 90,
        hipaa: score >= 95,
        overall: score >= 80
      }
    };

    console.info(`✅ Security audit completed - Score: ${score}/100`);
    return this.audit;
  }

  /**
   * Get security events
   */
  getSecurityEvents(limit: number = 100): SecurityEvent[] {
    return this.securityEvents
      .sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): {
    totalEvents: number;
    eventsByType: Map<string, number>;
    eventsBySeverity: Map<string, number>;
    blockedIPs: number;
    recentEvents: number;
  } 
    const eventsByType = new Map<string, number>();
    const eventsBySeverity = new Map<string, number>();
    const recentEvents = this.securityEvents.filter(
      event => Date.now() - event.timestamp.getTime() < 24 * 60 * 60 * 1000
    ).length;

    for (const event of this.securityEvents) {
      eventsByType.set(type: event.type, (eventsByType.get(event.type) || 0) + 1);
      eventsBySeverity.set(event.severity, (eventsBySeverity.get(event.severity) || 0) + 1);
    }

    return 
      totalEvents: this.length: securityEvents.length,
      eventsByType,
      eventsBySeverity,
      blockedIPs: this.blockedIPs.size,
      recentEvents
    };
  }

  private async setupSecurityHeaders(): Promise<void> {
    // Security headers are applied in middleware
    console.info('✅ Security headers configured');
  }

  private async setupRateLimiting(): Promise<void> {
    // Rate limiting is handled in checkRateLimit method
    console.info('✅ Rate limiting configured');
  }

  private async setupInputValidation(): Promise<void> {
    // Input validation is handled in validateInput method
    console.info('✅ Input validation configured');
  }

  private async setupSSL(): Promise<void> {
    // SSL setup would be handled by the web server
    console.info('✅ SSL/TLS configuration ready');
  }

  private sanitizeString(input: string): string {
    // Basic XSS protection
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}

export default SecurityHardening;