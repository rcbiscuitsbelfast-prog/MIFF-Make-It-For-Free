// PermissionsPure - Comprehensive permissions and security management for MIFF framework
// Schema Version: v1

export enum PermissionLevel {
  NONE = 'none',
  READ = 'read',
  WRITE = 'write',
  EXECUTE = 'execute',
  ADMIN = 'admin',
  OWNER = 'owner'
}

export enum PermissionScope {
  GLOBAL = 'global',
  PROJECT = 'project',
  MODULE = 'module',
  RESOURCE = 'resource',
  USER = 'user',
  SESSION = 'session'
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXECUTE = 'execute',
  MANAGE = 'manage',
  SHARE = 'share',
  EXPORT = 'export',
  IMPORT = 'import'
}

export interface PermissionRule {
  id: string;
  name: string;
  description: string;
  scope: PermissionScope;
  actions: PermissionAction[];
  resources: string[];
  conditions?: PermissionCondition[];
  inherited?: boolean;
  priority: number;
  enabled: boolean;
}

export interface PermissionCondition {
  type: 'time' | 'location' | 'environment' | 'custom';
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  field: string;
  value: any;
  description?: string;
}

export interface UserPermissions {
  userId: string;
  roles: string[];
  permissions: PermissionLevel[];
  grantedRules: string[];
  deniedRules: string[];
  restrictions: PermissionRestriction[];
  sessionId?: string;
  expiresAt?: number;
}

export interface PermissionRestriction {
  type: 'time_limit' | 'location_limit' | 'session_limit' | 'custom';
  value: any;
  reason: string;
  expiresAt?: number;
}

export interface PermissionRequest {
  userId: string;
  action: PermissionAction;
  resource: string;
  scope: PermissionScope;
  context?: Record<string, any>;
  metadata?: Record<string, any>;
  timestamp?: number;
}

export interface PermissionResponse {
  granted: boolean;
  reason?: string;
  conditions?: PermissionCondition[];
  expiresAt?: number;
  alternatives?: PermissionAction[];
  requiresApproval?: boolean;
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: PermissionRule[];
  parentRoles?: string[];
  priority: number;
  systemRole: boolean;
  mutable: boolean;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: number;
  userId: string;
  action: PermissionAction;
  resource: string;
  scope: PermissionScope;
  granted: boolean;
  reason: string;
  context: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface PermissionStats {
  totalPermissions: number;
  activePermissions: number;
  deniedPermissions: number;
  totalRoles: number;
  activeRoles: number;
  totalUsers: number;
  activeUsers: number;
  securityIncidents: number;
  auditEntries: number;
}

export class PermissionsManager {
  private permissions: Map<string, PermissionRule> = new Map();
  private roles: Map<string, RoleDefinition> = new Map();
  private userPermissions: Map<string, UserPermissions> = new Map();
  private auditLog: SecurityAuditLog[] = [];
  private defaultRoles: RoleDefinition[] = [];
  private securityConfig: SecurityConfiguration;

  constructor() {
    this.initializeDefaultRoles();
    this.initializeSecurityConfig();
    this.initializeDefaultPermissions();
  }

  private initializeDefaultRoles(): void {
    this.defaultRoles = [
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Full system access',
        permissions: [],
        priority: 100,
        systemRole: true,
        mutable: false
      },
      {
        id: 'developer',
        name: 'Developer',
        description: 'Development and testing access',
        permissions: [],
        priority: 80,
        systemRole: true,
        mutable: false
      },
      {
        id: 'user',
        name: 'User',
        description: 'Standard user access',
        permissions: [],
        priority: 50,
        systemRole: true,
        mutable: true
      },
      {
        id: 'guest',
        name: 'Guest',
        description: 'Limited read-only access',
        permissions: [],
        priority: 10,
        systemRole: true,
        mutable: true
      }
    ];

    for (const role of this.defaultRoles) {
      this.roles.set(role.id, role);
    }
  }

  private initializeSecurityConfig(): void {
    this.securityConfig = {
      maxLoginAttempts: 5,
      lockoutDuration: 300000, // 5 minutes
      passwordMinLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      sessionTimeout: 3600000, // 1 hour
      auditLogRetention: 30 * 24 * 60 * 60 * 1000, // 30 days
      enableRateLimiting: true,
      rateLimitRequests: 100,
      rateLimitWindow: 60000, // 1 minute
      enableIPWhitelist: false,
      ipWhitelist: [],
      enableAuditLogging: true,
      sensitiveActions: ['delete', 'manage', 'admin']
    };
  }

  private initializeDefaultPermissions(): void {
    const defaultPermissions: PermissionRule[] = [
      // Global permissions
      {
        id: 'global_read',
        name: 'Global Read',
        description: 'Read access to all resources',
        scope: PermissionScope.GLOBAL,
        actions: [PermissionAction.READ],
        resources: ['*'],
        priority: 10,
        enabled: true
      },
      {
        id: 'global_write',
        name: 'Global Write',
        description: 'Write access to all resources',
        scope: PermissionScope.GLOBAL,
        actions: [PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.DELETE],
        resources: ['*'],
        priority: 20,
        enabled: false
      },
      {
        id: 'global_execute',
        name: 'Global Execute',
        description: 'Execute access to all resources',
        scope: PermissionScope.GLOBAL,
        actions: [PermissionAction.EXECUTE],
        resources: ['*'],
        priority: 15,
        enabled: true
      },
      // Module permissions
      {
        id: 'module_manage',
        name: 'Module Management',
        description: 'Manage game modules',
        scope: PermissionScope.MODULE,
        actions: [PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.MANAGE],
        resources: ['modules/*'],
        priority: 30,
        enabled: true
      },
      // Resource permissions
      {
        id: 'resource_manage',
        name: 'Resource Management',
        description: 'Manage game resources',
        scope: PermissionScope.RESOURCE,
        actions: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE],
        resources: ['resources/*', 'assets/*'],
        priority: 25,
        enabled: true
      },
      // Export permissions
      {
        id: 'export_data',
        name: 'Export Data',
        description: 'Export game data and configurations',
        scope: PermissionScope.RESOURCE,
        actions: [PermissionAction.EXPORT, PermissionAction.READ],
        resources: ['export/*', 'backup/*'],
        priority: 35,
        enabled: true
      }
    ];

    for (const permission of defaultPermissions) {
      this.permissions.set(permission.id, permission);
    }
  }

  // Core permission checking
  checkPermission(request: PermissionRequest): PermissionResponse {
    const userPerms = this.userPermissions.get(request.userId);
    if (!userPerms) {
      this.logAuditEvent({
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        userId: request.userId,
        action: request.action,
        resource: request.resource,
        scope: request.scope,
        granted: false,
        reason: 'User not found',
        context: request.context || {}
      });

      return {
        granted: false,
        reason: 'User permissions not found'
      };
    }

    // Check if user has required role permissions
    const hasRolePermission = this.checkRolePermissions(userPerms, request);

    // Check explicit rule permissions
    const hasRulePermission = this.checkRulePermissions(userPerms, request);

    // Check restrictions
    const restrictionCheck = this.checkRestrictions(userPerms, request);

    const granted = hasRolePermission && hasRulePermission && restrictionCheck.granted;

    this.logAuditEvent({
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      userId: request.userId,
      action: request.action,
      resource: request.resource,
      scope: request.scope,
      granted,
      reason: granted ? 'Permission granted' : 'Permission denied',
      context: request.context || {}
    });

    if (!granted) {
      return {
        granted: false,
        reason: restrictionCheck.reason || 'Insufficient permissions'
      };
    }

    return {
      granted: true,
      conditions: this.getPermissionConditions(userPerms, request)
    };
  }

  private checkRolePermissions(userPerms: UserPermissions, request: PermissionRequest): boolean {
    for (const roleId of userPerms.roles) {
      const role = this.roles.get(roleId);
      if (!role) continue;

      // Check role permissions
      for (const permission of role.permissions) {
        if (this.matchesPermissionRule(permission, request)) {
          return true;
        }
      }

      // Check parent roles
      if (role.parentRoles) {
        for (const parentRoleId of role.parentRoles) {
          const parentRole = this.roles.get(parentRoleId);
          if (parentRole) {
            for (const permission of parentRole.permissions) {
              if (this.matchesPermissionRule(permission, request)) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  private checkRulePermissions(userPerms: UserPermissions, request: PermissionRequest): boolean {
    // Check granted rules
    for (const ruleId of userPerms.grantedRules) {
      const rule = this.permissions.get(ruleId);
      if (rule && this.matchesPermissionRule(rule, request)) {
        return true;
      }
    }

    // Check if any denied rules apply
    for (const ruleId of userPerms.deniedRules) {
      const rule = this.permissions.get(ruleId);
      if (rule && this.matchesPermissionRule(rule, request)) {
        return false; // Explicitly denied
      }
    }

    return true; // No explicit rules, allow by default
  }

  private checkRestrictions(userPerms: UserPermissions, request: PermissionRequest): { granted: boolean; reason?: string } {
    for (const restriction of userPerms.restrictions) {
      if (this.isRestrictionActive(restriction)) {
        return {
          granted: false,
          reason: restriction.reason
        };
      }
    }

    // Check global security config
    if (this.securityConfig.sensitiveActions.includes(request.action)) {
      return {
        granted: false,
        reason: 'Action requires elevated privileges'
      };
    }

    return { granted: true };
  }

  private matchesPermissionRule(rule: PermissionRule, request: PermissionRequest): boolean {
    // Check scope
    if (rule.scope !== request.scope && rule.scope !== PermissionScope.GLOBAL) {
      return false;
    }

    // Check actions
    if (!rule.actions.includes(request.action)) {
      return false;
    }

    // Check resources
    for (const resourcePattern of rule.resources) {
      if (this.matchesResourcePattern(resourcePattern, request.resource)) {
        return true;
      }
    }

    return false;
  }

  private matchesResourcePattern(pattern: string, resource: string): boolean {
    if (pattern === '*') return true;
    if (pattern === resource) return true;

    // Simple wildcard matching
    if (pattern.endsWith('/*')) {
      const prefix = pattern.slice(0, -2);
      return resource.startsWith(prefix);
    }

    if (pattern.startsWith('*/')) {
      const suffix = pattern.slice(2);
      return resource.endsWith(suffix);
    }

    return false;
  }

  private isRestrictionActive(restriction: PermissionRestriction): boolean {
    if (restriction.expiresAt && Date.now() > restriction.expiresAt) {
      return false; // Restriction has expired
    }

    // Add restriction-specific checks here
    switch (restriction.type) {
      case 'time_limit':
        // Check if current time is within allowed range
        return true;
      case 'session_limit':
        // Check if session limit exceeded
        return true;
      default:
        return true;
    }
  }

  private getPermissionConditions(userPerms: UserPermissions, request: PermissionRequest): PermissionCondition[] {
    const conditions: PermissionCondition[] = [];

    // Add role-based conditions
    for (const roleId of userPerms.roles) {
      const role = this.roles.get(roleId);
      if (role) {
        for (const permission of role.permissions) {
          if (this.matchesPermissionRule(permission, request) && permission.conditions) {
            conditions.push(...permission.conditions);
          }
        }
      }
    }

    return conditions;
  }

  private logAuditEvent(event: SecurityAuditLog): void {
    this.auditLog.push(event: any);

    // Keep only recent entries based on retention policy
    const retentionTime = this.securityConfig.auditLogRetention;
    const cutoffTime = Date.now() - retentionTime;

    this.auditLog = this.auditLog.filter((entry: any) => entry.timestamp > cutoffTime);

    // Limit log size to prevent memory issues
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-5000);
    }
  }

  // User and role management
  createUser(userId: string, roles: string[] = ['user']): UserPermissions {
    const userPermissions: UserPermissions = {
      userId,
      roles,
      permissions: [],
      grantedRules: [],
      deniedRules: [],
      restrictions: []
    };

    this.userPermissions.set(userId, userPermissions);
    return userPermissions;
  }

  getUserPermissions(userId: string): UserPermissions | undefined {
    return this.userPermissions.get(userId);
  }

  updateUserPermissions(userId: string, updates: Partial<UserPermissions>): boolean {
    const userPerms = this.userPermissions.get(userId);
    if (!userPerms) return false;

    Object.assign(userPerms, updates);
    return true;
  }

  deleteUser(userId: string): boolean {
    return this.userPermissions.delete(userId);
  }

  // Role management
  createRole(roleDefinition: RoleDefinition): void {
    if (roleDefinition.systemRole) {
      throw new Error('Cannot create system roles');
    }

    this.roles.set(roleDefinition.id, roleDefinition);
  }

  getRole(roleId: string): RoleDefinition | undefined {
    return this.roles.get(roleId);
  }

  updateRole(roleId: string, updates: Partial<RoleDefinition>): boolean {
    const role = this.roles.get(roleId);
    if (!role || role.systemRole) return false;

    Object.assign(role, updates);
    return true;
  }

  deleteRole(roleId: string): boolean {
    const role = this.roles.get(roleId);
    if (!role || role.systemRole) return false;

    this.roles.delete(roleId);
    return true;
  }

  // Permission management
  createPermissionRule(rule: PermissionRule): void {
    this.permissions.set(rule.id, rule);
  }

  getPermissionRule(ruleId: string): PermissionRule | undefined {
    return this.permissions.get(ruleId);
  }

  updatePermissionRule(ruleId: string, updates: Partial<PermissionRule>): boolean {
    const rule = this.permissions.get(ruleId);
    if (!rule) return false;

    Object.assign(rule, updates);
    return true;
  }

  deletePermissionRule(ruleId: string): boolean {
    return this.permissions.delete(ruleId);
  }

  // Security configuration
  getSecurityConfig(): SecurityConfiguration {
    return { ...this.securityConfig };
  }

  updateSecurityConfig(updates: Partial<SecurityConfiguration>): void {
    Object.assign(this.securityConfig, updates);
  }

  // Audit and statistics
  getAuditLog(userId?: string, limit: number = 100): SecurityAuditLog[] {
    let logs = [...this.auditLog];

    if (userId) {
      logs = logs.filter((log: any) => log.userId === userId);
    }

    logs.sort((a: any, b: any) => b.timestamp - a.timestamp);
    return logs.slice(0, limit);
  }

  getStats(): PermissionStats {
    const totalPermissions = this.permissions.size;
    const activePermissions = Array.from(this.permissions.values()).filter((p: any) => p.enabled).length;
    const deniedPermissions = Array.from(this.permissions.values()).filter((p: any) => !p.enabled).length;

    const totalRoles = this.roles.size;
    const activeRoles = Array.from(this.roles.values()).filter((r: any) => !r.systemRole).length;

    const totalUsers = this.userPermissions.size;
    const activeUsers = Array.from(this.userPermissions.values())
      .filter((up: any) => !up.expiresAt || up.expiresAt > Date.now()).length;

    const securityIncidents = this.auditLog.filter((log: any) => !log.granted).length;
    const auditEntries = this.auditLog.length;

    return {
      totalPermissions,
      activePermissions,
      deniedPermissions,
      totalRoles,
      activeRoles,
      totalUsers,
      activeUsers,
      securityIncidents,
      auditEntries
    };
  }

  // Utility methods
  exportPermissions(format: 'json' | 'xml' | 'csv' = 'json'): string {
    const data = {
      permissions: Array.from(this.permissions.values()),
      roles: Array.from(this.roles.values()),
      stats: this.getStats(),
      config: this.securityConfig
    };

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'xml':
        return this.toXml(data);
      case 'csv':
        return this.toCsv(data);
      default:
        return JSON.stringify(data, null, 2);
    }
  }

  private toXml(data: any): string {
    // Simple XML conversion - in a real implementation this would be more robust
    return '<permissions><!-- XML export not fully implemented --></permissions>';
  }

  private toCsv(data: any): string {
    // Simple CSV conversion
    return 'type,id,name,description,enabled\n';
  }

  resetToDefaults(): void {
    this.permissions.clear();
    this.roles.clear();
    this.userPermissions.clear();
    this.auditLog = [];

    this.initializeDefaultRoles();
    this.initializeDefaultPermissions();
  }

  // Advanced features
  assignRoleToUser(userId: string, roleId: string): boolean {
    const userPerms = this.userPermissions.get(userId);
    const role = this.roles.get(roleId);

    if (!userPerms || !role) return false;

    if (!userPerms.roles.includes(roleId)) {
      userPerms.roles.push(roleId);
    }

    return true;
  }

  revokeRoleFromUser(userId: string, roleId: string): boolean {
    const userPerms = this.userPermissions.get(userId);

    if (!userPerms) return false;

    const roleIndex = userPerms.roles.indexOf(roleId);
    if (roleIndex !== -1) {
      userPerms.roles.splice(roleIndex, 1);
      return true;
    }

    return false;
  }

  grantPermissionToUser(userId: string, ruleId: string): boolean {
    const userPerms = this.userPermissions.get(userId);
    const rule = this.permissions.get(ruleId);

    if (!userPerms || !rule || userPerms.deniedRules.includes(ruleId)) return false;

    if (!userPerms.grantedRules.includes(ruleId)) {
      userPerms.grantedRules.push(ruleId);
    }

    return true;
  }

  revokePermissionFromUser(userId: string, ruleId: string): boolean {
    const userPerms = this.userPermissions.get(userId);

    if (!userPerms) return false;

    const ruleIndex = userPerms.grantedRules.indexOf(ruleId);
    if (ruleIndex !== -1) {
      userPerms.grantedRules.splice(ruleIndex, 1);
      return true;
    }

    return false;
  }

  denyPermissionToUser(userId: string, ruleId: string): boolean {
    const userPerms = this.userPermissions.get(userId);
    const rule = this.permissions.get(ruleId);

    if (!userPerms || !rule || userPerms.grantedRules.includes(ruleId)) return false;

    if (!userPerms.deniedRules.includes(ruleId)) {
      userPerms.deniedRules.push(ruleId);
    }

    return true;
  }

  allowPermissionToUser(userId: string, ruleId: string): boolean {
    const userPerms = this.userPermissions.get(userId);

    if (!userPerms) return false;

    const ruleIndex = userPerms.deniedRules.indexOf(ruleId);
    if (ruleIndex !== -1) {
      userPerms.deniedRules.splice(ruleIndex, 1);
      return true;
    }

    return false;
  }
}

// Supporting interfaces and types
export interface SecurityConfiguration {
  maxLoginAttempts: number;
  lockoutDuration: number;
  passwordMinLength: number;
  requireSpecialChars: boolean;
  requireNumbers: boolean;
  sessionTimeout: number;
  auditLogRetention: number;
  enableRateLimiting: boolean;
  rateLimitRequests: number;
  rateLimitWindow: number;
  enableIPWhitelist: boolean;
  ipWhitelist: string[];
  enableAuditLogging: boolean;
  sensitiveActions: string[];
}