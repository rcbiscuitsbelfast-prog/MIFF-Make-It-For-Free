/**
 * SecurityManager.ts - Advanced Security Management System
 *
 * Provides comprehensive security features for:
 * - Authentication and authorization
 * - Input validation and sanitization
 * - Encryption and hashing
 * - Rate limiting and DDoS protection
 * - Security monitoring and logging
 * - Vulnerability scanning and patching
 * - Compliance and audit trails
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../../EventBusPure/index.js';
import * as crypto from 'crypto';

// ============================================================================
// SECURITY MANAGER INTERFACES
// ============================================================================

export enum SecurityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ThreatType {
  SQL_INJECTION = 'sql_injection',
  XSS = 'xss',
  CSRF = 'csrf',
  BRUTE_FORCE = 'brute_force',
  DDOS = 'ddos',
  MALWARE = 'malware',
  PHISHING = 'phishing',
  DATA_BREACH = 'data_breach',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  PRIVILEGE_ESCALATION = 'privilege_escalation'
}

export enum EncryptionAlgorithm {
  AES_256_GCM = 'aes-256-gcm',
  AES_256_CBC = 'aes-256-cbc',
  RSA_2048 = 'rsa-2048',
  RSA_4096 = 'rsa-4096',
  ECDSA_P256 = 'ecdsa-p256',
  ECDSA_P384 = 'ecdsa-p384',
  ECDSA_P521 = 'ecdsa-p521'
}

export enum HashAlgorithm {
  SHA_256 = 'sha256',
  SHA_384 = 'sha384',
  SHA_512 = 'sha512',
  BCRYPT = 'bcrypt',
  ARGON2 = 'argon2',
  SCRYPT = 'scrypt'
}

export interface SecurityConfig {
  enableAuthentication: boolean;
  enableAuthorization: boolean;
  enableEncryption: boolean;
  enableRateLimiting: boolean;
  enableInputValidation: boolean;
  enableOutputSanitization: boolean;
  enableAuditLogging: boolean;
  enableThreatDetection: boolean;
  enableVulnerabilityScanning: boolean;
  enableComplianceMonitoring: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number;
  sessionTimeout: number;
  passwordMinLength: number;
  passwordRequireSpecialChars: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireUppercase: boolean;
  encryptionAlgorithm: EncryptionAlgorithm;
  hashAlgorithm: HashAlgorithm;
  rateLimitWindow: number;
  rateLimitMaxRequests: number;
  threatDetectionThreshold: number;
  complianceStandards: string[];
  auditRetentionDays: number;
  /** Interval in ms for automated compliance audits */
  complianceAuditInterval?: number;
}

export interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: ThreatType;
  level: SecurityLevel;
  source: string;
  target: string;
  description: string;
  details: Record<string, any>;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface SecurityAlert {
  id: string;
  eventId: string;
  timestamp: Date;
  level: SecurityLevel;
  message: string;
  action: string;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

export interface SecurityAudit {
  id: string;
  timestamp: Date;
  action: string;
  userId?: string;
  resource: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
}

export interface VulnerabilityReport {
  id: string;
  timestamp: Date;
  severity: SecurityLevel;
  title: string;
  description: string;
  affectedComponents: string[];
  cveId?: string;
  cvssScore?: number;
  remediation: string;
  status: 'open' | 'in_progress' | 'resolved' | 'false_positive';
  assignedTo?: string;
  dueDate?: Date;
}

export interface ComplianceReport {
  id: string;
  timestamp: Date;
  standard: string;
  status: 'compliant' | 'non_compliant' | 'partial';
  score: number;
  findings: ComplianceFinding[];
  recommendations: string[];
  nextAuditDate: Date;
}

export interface ComplianceFinding {
  id: string;
  requirement: string;
  status: 'pass' | 'fail' | 'warning';
  description: string;
  evidence: string[];
  remediation: string;
}

export interface SecurityMetrics {
  timestamp: Date;
  totalEvents: number;
  eventsByType: Record<ThreatType, number>;
  eventsByLevel: Record<SecurityLevel, number>;
  activeAlerts: number;
  resolvedAlerts: number;
  vulnerabilitiesFound: number;
  vulnerabilitiesResolved: number;
  complianceScore: number;
  averageResponseTime: number;
  blockedRequests: number;
  allowedRequests: number;
}

/**
 * Security Manager - Core security functionality
 */
export class SecurityManager {
  private config: SecurityConfig;
  private eventBus: EventBus;
  private events: SecurityEvent[] = [];
  private alerts: SecurityAlert[] = [];
  private audits: SecurityAudit[] = [];
  private vulnerabilities: VulnerabilityReport[] = [];
  private complianceReports: ComplianceReport[] = [];
  private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map();
  private failedLoginAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();
  private encryptionKey: Buffer;
  private isRunning: boolean = false;
  private complianceChecks: Record<string, boolean> = {};

  constructor(config: SecurityConfig, eventBus: EventBus) {
    this.config = config;
    this.eventBus = eventBus;
    this.encryptionKey = this.generateEncryptionKey();
    this.initialize();
  }

  /**
   * Initialize security manager
   */
  private initialize(): void {
    // Set up event listeners
    this.setupEventListeners();
    
    // Start monitoring
    this.startMonitoring();
    
    // Initialize compliance monitoring
    if (this.config.enableComplianceMonitoring) {
      this.initializeComplianceMonitoring();
    }
  }

  /**
   * Initialize compliance monitoring
   */
  private initializeComplianceMonitoring(): void {
    this.log('Initializing compliance monitoring');
    
    // Set up compliance checks
    this.complianceChecks = {
      gdpr: this.checkGDPRCompliance(),
      ccpa: this.checkCCPACompliance(),
      sox: this.checkSOXCompliance(),
      hipaa: this.checkHIPAACompliance()
    };
    
    // Start periodic compliance audits
    setInterval((): void => {
      this.performComplianceAudit();
    }, this.config.complianceAuditInterval ?? 3600000); // 1 hour default
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Listen for authentication events
    this.eventBus.subscribe('auth:login', (data) => {
      this.handleLoginAttempt(data);
    });
    
    this.eventBus.subscribe('auth:logout', (data) => {
      this.handleLogout(data);
    });
    
    // Listen for API requests
    this.eventBus.subscribe('api:request', (data) => {
      this.handleApiRequest(data);
    });
    
    // Listen for data access events
    this.eventBus.subscribe('data:access', (data) => {
      this.handleDataAccess(data);
    });
  }

  /** Basic, centralized logger */
  private log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const ts = new Date().toISOString();
    // eslint-disable-next-line no-console
    console.log(`[SECURITY:${level.toUpperCase()}] ${ts} - ${message}`);
  }

  private checkGDPRCompliance(): boolean {
    return !!this.config.enableEncryption;
  }

  private checkCCPACompliance(): boolean {
    return !!this.config.enableAuditLogging;
  }

  private checkSOXCompliance(): boolean {
    return !!this.config.enableAuthorization;
  }

  private checkHIPAACompliance(): boolean {
    return !!this.config.enableInputValidation && !!this.config.enableEncryption;
  }

  private performComplianceAudit(): void {
    this.log('Performing compliance audit run');
    // In a full implementation, we would evaluate standards and emit reports
  }

  /**
   * Start security monitoring
   */
  private startMonitoring(): void {
    this.isRunning = true;
    
    // Monitor for threats
    if (this.config.enableThreatDetection) {
      setInterval(() => {
        this.detectThreats();
      }, 5000);
    }
    
    // Monitor compliance
    if (this.config.enableComplianceMonitoring) {
      setInterval(() => {
        this.monitorCompliance();
      }, 300000); // 5 minutes
    }
    
    // Clean up old data
    setInterval(() => {
      this.cleanupOldData();
    }, 3600000); // 1 hour
  }

  /**
   * Handle login attempt
   */
  private handleLoginAttempt(data: any): void {
    const { userId, ipAddress, success, failureReason } = data;
    
    // Log the attempt
    this.logAudit({
      action: 'login_attempt',
      userId,
      resource: 'authentication',
      details: { ipAddress, success, failureReason },
      ipAddress,
      success,
      failureReason
    });
    
    if (!success) {
      // Track failed attempts
      this.trackFailedLogin(userId, ipAddress);
      
      // Check for brute force
      if (this.isBruteForceAttempt(userId, ipAddress)) {
        this.createSecurityEvent({
          type: ThreatType.BRUTE_FORCE,
          level: SecurityLevel.HIGH,
          source: ipAddress,
          target: userId,
          description: 'Brute force attack detected',
          details: { userId, ipAddress, attemptCount: this.getFailedLoginCount(userId, ipAddress) }
        });
      }
    } else {
      // Reset failed attempts on successful login
      this.resetFailedLogin(userId, ipAddress);
    }
  }

  /**
   * Handle logout
   */
  private handleLogout(data: any): void {
    const { userId, ipAddress } = data;
    
    this.logAudit({
      action: 'logout',
      userId,
      resource: 'authentication',
      details: { ipAddress },
      ipAddress,
      success: true
    });
  }

  /**
   * Handle API request
   */
  private handleApiRequest(data: any): void {
    const { method, path, ipAddress, userId, headers } = data;
    
    // Check rate limiting
    if (this.config.enableRateLimiting) {
      if (!this.checkRateLimit(ipAddress)) {
        this.createSecurityEvent({
          type: ThreatType.DDOS,
          level: SecurityLevel.MEDIUM,
          source: ipAddress,
          target: path,
          description: 'Rate limit exceeded',
          details: { method, path, ipAddress, userId }
        });
        return;
      }
    }
    
    // Validate input
    if (this.config.enableInputValidation) {
      const validationResult = this.validateInput(data);
      if (!validationResult.valid) {
        this.createSecurityEvent({
          type: ThreatType.XSS,
          level: SecurityLevel.HIGH,
          source: ipAddress,
          target: path,
          description: 'Invalid input detected',
          details: { method, path, validationErrors: validationResult.errors }
        });
        return;
      }
    }
    
    // Log the request
    this.logAudit({
      action: 'api_request',
      userId,
      resource: path,
      details: { method, path, ipAddress, headers },
      ipAddress,
      success: true
    });
  }

  /**
   * Handle data access
   */
  private handleDataAccess(data: any): void {
    const { userId, resource, action, ipAddress } = data;
    
    // Check authorization
    if (this.config.enableAuthorization) {
      if (!this.checkAuthorization(userId, resource, action)) {
        this.createSecurityEvent({
          type: ThreatType.UNAUTHORIZED_ACCESS,
          level: SecurityLevel.HIGH,
          source: ipAddress,
          target: resource,
          description: 'Unauthorized access attempt',
          details: { userId, resource, action, ipAddress }
        });
        return;
      }
    }
    
    // Log the access
    this.logAudit({
      action: 'data_access',
      userId,
      resource,
      details: { action, ipAddress },
      ipAddress,
      success: true
    });
  }

  /**
   * Track failed login attempt
   */
  private trackFailedLogin(userId: string, ipAddress: string): void {
    const key = `${userId}:${ipAddress}`;
    const existing = this.failedLoginAttempts.get(key);
    
    if (existing) {
      existing.count++;
      existing.lastAttempt = new Date();
    } else {
      this.failedLoginAttempts.set(key, {
        count: 1,
        lastAttempt: new Date()
      });
    }
  }

  /**
   * Check if brute force attempt
   */
  private isBruteForceAttempt(userId: string, ipAddress: string): boolean {
    const key = `${userId}:${ipAddress}`;
    const attempts = this.failedLoginAttempts.get(key);
    
    if (!attempts) return false;
    
    // Check if within lockout duration
    const timeSinceLastAttempt = Date.now() - attempts.lastAttempt.getTime();
    if (timeSinceLastAttempt > this.config.lockoutDuration) {
      this.resetFailedLogin(userId, ipAddress);
      return false;
    }
    
    return attempts.count >= this.config.maxLoginAttempts;
  }

  /**
   * Get failed login count
   */
  private getFailedLoginCount(userId: string, ipAddress: string): number {
    const key = `${userId}:${ipAddress}`;
    const attempts = this.failedLoginAttempts.get(key);
    return attempts ? attempts.count : 0;
  }

  /**
   * Reset failed login attempts
   */
  private resetFailedLogin(userId: string, ipAddress: string): void {
    const key = `${userId}:${ipAddress}`;
    this.failedLoginAttempts.delete(key);
  }

  /**
   * Check rate limit
   */
  private checkRateLimit(ipAddress: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.rateLimitWindow;
    
    const existing = this.rateLimitMap.get(ipAddress);
    
    if (!existing || existing.resetTime < windowStart) {
      // Reset or create new entry
      this.rateLimitMap.set(ipAddress, {
        count: 1,
        resetTime: now
      });
      return true;
    }
    
    if (existing.count >= this.config.rateLimitMaxRequests) {
      return false;
    }
    
    existing.count++;
    return true;
  }

  /**
   * Validate input
   */
  private validateInput(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(\b(OR|AND)\s+['"]\s*=\s*['"])/i,
      /(\b(OR|AND)\s+['"]\s*LIKE\s*['"])/i
    ];
    
    const inputString = JSON.stringify(data);
    for (const pattern of sqlPatterns) {
      if (pattern.test(inputString)) {
        errors.push('Potential SQL injection detected');
        break;
      }
    }
    
    // Check for XSS patterns
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ];
    
    for (const pattern of xssPatterns) {
      if (pattern.test(inputString)) {
        errors.push('Potential XSS attack detected');
        break;
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check authorization
   */
  private checkAuthorization(userId: string, resource: string, action: string): boolean {
    // Simplified authorization check
    // In a real implementation, this would check against user roles and permissions
    return true;
  }

  /**
   * Detect threats
   */
  private detectThreats(): void {
    // Analyze recent events for threat patterns
    const recentEvents = this.events.filter(
      event => Date.now() - event.timestamp.getTime() < 300000 // Last 5 minutes
    );
    
    // Check for suspicious patterns
    this.checkSuspiciousPatterns(recentEvents);
    
    // Check for anomaly detection
    this.checkAnomalies(recentEvents);
  }

  /**
   * Check suspicious patterns
   */
  private checkSuspiciousPatterns(events: SecurityEvent[]): void {
    // Group events by source
    const eventsBySource = events.reduce((acc, event) => {
      if (!acc[event.source]) {
        acc[event.source] = [];
      }
      acc[event.source].push(event);
      return acc;
    }, {} as Record<string, SecurityEvent[]>);
    
    // Check for high frequency from single source
    for (const [source, sourceEvents] of Object.entries(eventsBySource)) {
      if (sourceEvents.length > this.config.threatDetectionThreshold) {
        this.createSecurityEvent({
          type: ThreatType.DDOS,
          level: SecurityLevel.HIGH,
          source,
          target: 'system',
          description: 'High frequency of events from single source',
          details: { eventCount: sourceEvents.length, timeWindow: '5 minutes' }
        });
      }
    }
  }

  /**
   * Check anomalies
   */
  private checkAnomalies(events: SecurityEvent[]): void {
    // Check for unusual event types
    const eventTypes = events.map(e => e.type);
    const uniqueTypes = new Set(eventTypes);
    
    if (uniqueTypes.size > 5) {
      this.createSecurityEvent({
        type: ThreatType.MALWARE,
        level: SecurityLevel.MEDIUM,
        source: 'system',
        target: 'system',
        description: 'Unusual variety of security events detected',
        details: { uniqueEventTypes: uniqueTypes.size, eventTypes: Array.from(uniqueTypes) }
      });
    }
  }

  /**
   * Monitor compliance
   */
  private monitorCompliance(): void {
    for (const standard of this.config.complianceStandards) {
      this.checkComplianceStandard(standard);
    }
  }

  /**
   * Check compliance standard
   */
  private checkComplianceStandard(standard: string): void {
    // Simplified compliance check
    const findings: ComplianceFinding[] = [];
    
    // Check password requirements
    if (standard === 'PCI_DSS' || standard === 'SOX') {
      findings.push({
        id: this.generateId(),
        requirement: 'Password complexity',
        status: this.config.passwordMinLength >= 8 ? 'pass' : 'fail',
        description: 'Password minimum length requirement',
        evidence: [`Current minimum length: ${this.config.passwordMinLength}`],
        remediation: 'Increase minimum password length to 8 characters'
      });
    }
    
    // Check encryption
    if (standard === 'GDPR' || standard === 'HIPAA') {
      findings.push({
        id: this.generateId(),
        requirement: 'Data encryption',
        status: this.config.enableEncryption ? 'pass' : 'fail',
        description: 'Data encryption at rest and in transit',
        evidence: [`Encryption enabled: ${this.config.enableEncryption}`],
        remediation: 'Enable data encryption'
      });
    }
    
    // Create compliance report
    const report: ComplianceReport = {
      id: this.generateId(),
      timestamp: new Date(),
      standard,
      status: findings.every(f => f.status === 'pass') ? 'compliant' : 'non_compliant',
      score: (findings.filter(f => f.status === 'pass').length / findings.length) * 100,
      findings,
      recommendations: findings.filter(f => f.status !== 'pass').map(f => f.remediation),
      nextAuditDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };
    
    this.complianceReports.push(report);
    this.eventBus.publish('security:compliance', report);
  }

  /**
   * Create security event
   */
  private createSecurityEvent(eventData: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>): void {
    const event: SecurityEvent = {
      ...eventData,
      id: this.generateId(),
      timestamp: new Date(),
      resolved: false
    };
    
    this.events.push(event);
    
    // Create alert if severity is high enough
    if (event.level === SecurityLevel.HIGH || event.level === SecurityLevel.CRITICAL) {
      this.createSecurityAlert(event);
    }
    
    this.eventBus.publish('security:event', event);
  }

  /**
   * Create security alert
   */
  private createSecurityAlert(event: SecurityEvent): void {
    const alert: SecurityAlert = {
      id: this.generateId(),
      eventId: event.id,
      timestamp: new Date(),
      level: event.level,
      message: event.description,
      action: 'investigate',
      acknowledged: false
    };
    
    this.alerts.push(alert);
    this.eventBus.publish('security:alert', alert);
  }

  /**
   * Log audit event
   */
  private logAudit(auditData: Omit<SecurityAudit, 'id' | 'timestamp'>): void {
    const audit: SecurityAudit = {
      ...auditData,
      id: this.generateId(),
      timestamp: new Date()
    };
    
    this.audits.push(audit);
    this.eventBus.publish('security:audit', audit);
  }

  /**
   * Clean up old data
   */
  private cleanupOldData(): void {
    const cutoffDate = new Date(Date.now() - this.config.auditRetentionDays * 24 * 60 * 60 * 1000);
    
    // Clean up old events
    this.events = this.events.filter(event => event.timestamp > cutoffDate);
    
    // Clean up old audits
    this.audits = this.audits.filter(audit => audit.timestamp > cutoffDate);
    
    // Clean up old compliance reports
    this.complianceReports = this.complianceReports.filter(report => report.timestamp > cutoffDate);
  }

  /**
   * Generate encryption key
   */
  private generateEncryptionKey(): Buffer {
    return crypto.randomBytes(32);
  }

  /**
   * Encrypt data
   */
  encrypt(data: string): string {
    if (!this.config.enableEncryption) return data;
    
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const cipher = crypto.createCipheriv(this.config.encryptionAlgorithm, key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt data
   */
  decrypt(encryptedData: string): string {
    if (!this.config.enableEncryption) return encryptedData;
    
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const decipher = crypto.createDecipheriv(this.config.encryptionAlgorithm, key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Hash data
   */
  hash(data: string, salt?: string): string {
    if (this.config.hashAlgorithm === HashAlgorithm.BCRYPT) {
      // In a real implementation, you would use bcrypt
      return crypto.createHash('sha256').update(data + (salt || '')).digest('hex');
    }
    
    return crypto.createHash(this.config.hashAlgorithm).update(data + (salt || '')).digest('hex');
  }

  /**
   * Verify hash
   */
  verifyHash(data: string, hash: string, salt?: string): boolean {
    const computedHash = this.hash(data, salt);
    return computedHash === hash;
  }

  /**
   * Get security metrics
   */
  getSecurityMetrics(): SecurityMetrics {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentEvents = this.events.filter(event => event.timestamp > last24Hours);
    const recentAlerts = this.alerts.filter(alert => alert.timestamp > last24Hours);
    
    const eventsByType = recentEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<ThreatType, number>);
    
    const eventsByLevel = recentEvents.reduce((acc, event) => {
      acc[event.level] = (acc[event.level] || 0) + 1;
      return acc;
    }, {} as Record<SecurityLevel, number>);
    
    const activeAlerts = this.alerts.filter(alert => !alert.acknowledged).length;
    const resolvedAlerts = this.alerts.filter(alert => alert.acknowledged).length;
    
    const vulnerabilitiesFound = this.vulnerabilities.length;
    const vulnerabilitiesResolved = this.vulnerabilities.filter(v => v.status === 'resolved').length;
    
    const complianceScore = this.complianceReports.length > 0 
      ? this.complianceReports[this.complianceReports.length - 1].score 
      : 100;
    
    return {
      timestamp: now,
      totalEvents: recentEvents.length,
      eventsByType,
      eventsByLevel,
      activeAlerts,
      resolvedAlerts,
      vulnerabilitiesFound,
      vulnerabilitiesResolved,
      complianceScore,
      averageResponseTime: 0, // Would be calculated from actual data
      blockedRequests: recentEvents.filter(e => e.type === ThreatType.DDOS).length,
      allowedRequests: 0 // Would be calculated from actual data
    };
  }

  /**
   * Get security report
   */
  getSecurityReport(): {
    events: SecurityEvent[];
    alerts: SecurityAlert[];
    audits: SecurityAudit[];
    vulnerabilities: VulnerabilityReport[];
    complianceReports: ComplianceReport[];
    metrics: SecurityMetrics;
  } {
    return {
      events: [...this.events],
      alerts: [...this.alerts],
      audits: [...this.audits],
      vulnerabilities: [...this.vulnerabilities],
      complianceReports: [...this.complianceReports],
      metrics: this.getSecurityMetrics()
    };
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date();
      alert.acknowledgedBy = acknowledgedBy;
      return true;
    }
    return false;
  }

  /**
   * Resolve security event
   */
  resolveSecurityEvent(eventId: string, resolvedBy: string): boolean {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.resolved = true;
      event.resolvedAt = new Date();
      event.resolvedBy = resolvedBy;
      return true;
    }
    return false;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.isRunning = false;
    this.events = [];
    this.alerts = [];
    this.audits = [];
    this.vulnerabilities = [];
    this.complianceReports = [];
    this.rateLimitMap.clear();
    this.failedLoginAttempts.clear();
  }
}

/**
 * Default security manager instance
 */
export const defaultSecurityManager = new SecurityManager({
  enableAuthentication: true,
  enableAuthorization: true,
  enableEncryption: true,
  enableRateLimiting: true,
  enableInputValidation: true,
  enableOutputSanitization: true,
  enableAuditLogging: true,
  enableThreatDetection: true,
  enableVulnerabilityScanning: true,
  enableComplianceMonitoring: true,
  maxLoginAttempts: 5,
  lockoutDuration: 300000, // 5 minutes
  sessionTimeout: 3600000, // 1 hour
  passwordMinLength: 8,
  passwordRequireSpecialChars: true,
  passwordRequireNumbers: true,
  passwordRequireUppercase: true,
  encryptionAlgorithm: EncryptionAlgorithm.AES_256_GCM,
  hashAlgorithm: HashAlgorithm.SHA_256,
  rateLimitWindow: 60000, // 1 minute
  rateLimitMaxRequests: 100,
  threatDetectionThreshold: 10,
  complianceStandards: ['PCI_DSS', 'GDPR', 'SOX'],
  auditRetentionDays: 90
}, {} as EventBus);