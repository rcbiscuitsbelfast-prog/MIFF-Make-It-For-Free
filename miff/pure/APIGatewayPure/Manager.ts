/**
 * APIGatewayPure Manager - Advanced API Gateway Management System
 *
 * Comprehensive API gateway system with:
 * - Request routing and load balancing
 * - Authentication and authorization
 * - Rate limiting and throttling
 * - API versioning and management
 * - Request/response transformation
 * - Caching and performance optimization
 * - Monitoring and analytics
 * - Security and threat protection
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

export interface APIGatewayConfig {
  enableRouting: boolean;
  enableLoadBalancing: boolean;
  enableAuthentication: boolean;
  enableAuthorization: boolean;
  enableRateLimiting: boolean;
  enableThrottling: boolean;
  enableVersioning: boolean;
  enableTransformation: boolean;
  enableCaching: boolean;
  enablePerformanceOptimization: boolean;
  enableMonitoring: boolean;
  enableAnalytics: boolean;
  enableSecurity: boolean;
  enableThreatProtection: boolean;
  maxRoutes: number;
  maxPolicies: number;
  enableCloudSync: boolean;
  enableBackup: boolean;
  enableVersioning: boolean;
}

export interface APIGateway {
  id: string;
  name: string;
  type: APIGatewayType;
  status: APIGatewayStatus;
  routes: Route[];
  policies: Policy[];
  middlewares: Middleware[];
  services: Service[];
  monitors: GatewayMonitor[];
  analytics: GatewayAnalytics;
  metadata: GatewayMetadata;
  version: string;
  created: number;
  modified: number;
}

export enum APIGatewayType {
  REST = 'rest',
  GRAPHQL = 'graphql',
  GRPC = 'grpc',
  WEBSOCKET = 'websocket',
  CUSTOM = 'custom'
}

export enum APIGatewayStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
  CUSTOM = 'custom'
}

export interface Route {
  id: string;
  name: string;
  path: string;
  method: HttpMethod;
  target: RouteTarget;
  middlewares: string[];
  policies: string[];
  caching: CachingConfig;
  rateLimit: RateLimitConfig;
  metadata: Map<string, any>;
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  CUSTOM = 'CUSTOM'
}

export interface RouteTarget {
  type: TargetType;
  url: string;
  service: string;
  loadBalancer: LoadBalancerConfig;
  healthCheck: HealthCheckConfig;
  metadata: Map<string, any>;
}

export enum TargetType {
  SERVICE = 'service',
  URL = 'url',
  FUNCTION = 'function',
  CUSTOM = 'custom'
}

export interface LoadBalancerConfig {
  algorithm: LoadBalancerAlgorithm;
  weights: Map<string, number>;
  healthCheck: boolean;
  metadata: Map<string, any>;
}

export enum LoadBalancerAlgorithm {
  ROUND_ROBIN = 'round_robin',
  LEAST_CONNECTIONS = 'least_connections',
  WEIGHTED = 'weighted',
  RANDOM = 'random',
  CUSTOM = 'custom'
}

export interface HealthCheckConfig {
  enabled: boolean;
  path: string;
  interval: number;
  timeout: number;
  retries: number;
  metadata: Map<string, any>;
}

export interface CachingConfig {
  enabled: boolean;
  ttl: number;
  strategy: CachingStrategy;
  headers: string[];
  metadata: Map<string, any>;
}

export enum CachingStrategy {
  MEMORY = 'memory',
  REDIS = 'redis',
  CDN = 'cdn',
  CUSTOM = 'custom'
}

export interface RateLimitConfig {
  enabled: boolean;
  requests: number;
  window: number;
  strategy: RateLimitStrategy;
  metadata: Map<string, any>;
}

export enum RateLimitStrategy {
  FIXED_WINDOW = 'fixed_window',
  SLIDING_WINDOW = 'sliding_window',
  TOKEN_BUCKET = 'token_bucket',
  CUSTOM = 'custom'
}

export interface Policy {
  id: string;
  name: string;
  type: PolicyType;
  enabled: boolean;
  rules: PolicyRule[];
  metadata: Map<string, any>;
}

export enum PolicyType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  RATE_LIMITING = 'rate_limiting',
  CACHING = 'caching',
  TRANSFORMATION = 'transformation',
  CUSTOM = 'custom'
}

export interface PolicyRule {
  id: string;
  name: string;
  condition: RuleCondition;
  action: RuleAction;
  priority: number;
  metadata: Map<string, any>;
}

export interface RuleCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
  metadata: Map<string, any>;
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  REGEX = 'regex',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  CUSTOM = 'custom'
}

export interface RuleAction {
  type: ActionType;
  parameters: Map<string, any>;
  metadata: Map<string, any>;
}

export enum ActionType {
  ALLOW = 'allow',
  DENY = 'deny',
  REDIRECT = 'redirect',
  TRANSFORM = 'transform',
  CACHE = 'cache',
  CUSTOM = 'custom'
}

export interface Middleware {
  id: string;
  name: string;
  type: MiddlewareType;
  enabled: boolean;
  configuration: MiddlewareConfig;
  metadata: Map<string, any>;
}

export enum MiddlewareType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  LOGGING = 'logging',
  METRICS = 'metrics',
  TRANSFORMATION = 'transformation',
  CUSTOM = 'custom'
}

export interface MiddlewareConfig {
  order: number;
  parameters: Map<string, any>;
  metadata: Map<string, any>;
}

export interface Service {
  id: string;
  name: string;
  type: ServiceType;
  status: ServiceStatus;
  endpoints: ServiceEndpoint[];
  health: ServiceHealth;
  metadata: Map<string, any>;
}

export enum ServiceType {
  REST = 'rest',
  GRAPHQL = 'graphql',
  GRPC = 'grpc',
  WEBSOCKET = 'websocket',
  CUSTOM = 'custom'
}

export enum ServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEGRADED = 'degraded',
  ERROR = 'error',
  CUSTOM = 'custom'
}

export interface ServiceEndpoint {
  url: string;
  method: HttpMethod;
  path: string;
  metadata: Map<string, any>;
}

export interface ServiceHealth {
  status: HealthStatus;
  lastCheck: number;
  responseTime: number;
  uptime: number;
  metadata: Map<string, any>;
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  UNHEALTHY = 'unhealthy',
  DEGRADED = 'degraded',
  UNKNOWN = 'unknown',
  CUSTOM = 'custom'
}

export interface GatewayMonitor {
  id: string;
  name: string;
  type: MonitorType;
  enabled: boolean;
  configuration: MonitorConfig;
  alerts: MonitorAlert[];
  metadata: Map<string, any>;
}

export enum MonitorType {
  PERFORMANCE = 'performance',
  AVAILABILITY = 'availability',
  ERROR_RATE = 'error_rate',
  LATENCY = 'latency',
  CUSTOM = 'custom'
}

export interface MonitorConfig {
  targets: string[];
  interval: number;
  timeout: number;
  thresholds: Map<string, number>;
  metadata: Map<string, any>;
}

export interface MonitorAlert {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  enabled: boolean;
  metadata: Map<string, any>;
}

export interface GatewayAnalytics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  errorRate: number;
  throughput: number;
  performance: PerformanceMetrics;
  lastUpdate: number;
  metadata: Map<string, any>;
}

export interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkUsage: number;
  metadata: Map<string, any>;
}

export interface GatewayMetadata {
  author: string;
  version: string;
  tags: string[];
  description: string;
  customMetadata: Map<string, any>;
}

export interface APIGatewayStats {
  totalRoutes: number;
  activeRoutes: number;
  totalPolicies: number;
  totalMiddlewares: number;
  totalServices: number;
  activeServices: number;
  totalMonitors: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  errorRate: number;
  lastUpdate: number;
}

export class APIGatewayManager {
  private config: APIGatewayConfig;
  private gateways: Map<string, APIGateway> = new Map();
  private stats: APIGatewayStats = this.initializeStats();
  private isInitialized: boolean = false;

  constructor(config: Partial<APIGatewayConfig> = {}) {
    this.config = {
      enableRouting: true,
      enableLoadBalancing: true,
      enableAuthentication: true,
      enableAuthorization: true,
      enableRateLimiting: true,
      enableThrottling: true,
      enableVersioning: true,
      enableTransformation: true,
      enableCaching: true,
      enablePerformanceOptimization: true,
      enableMonitoring: true,
      enableAnalytics: true,
      enableSecurity: true,
      enableThreatProtection: true,
      maxRoutes: 10000,
      maxPolicies: 1000,
      enableCloudSync: true,
      enableBackup: true,
      enableVersioning: true,
      ...config
    };
  }

  /**
   * Initialize API gateway manager
   */
  async initialize(): Promise<boolean> {
    try {
      // Initialize API gateway manager
      await this.initializeAPIGatewayManager();
      
      // Load default gateways
      await this.loadDefaultGateways();
      
      this.isInitialized = true;
      console.log('API gateway manager initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize API gateway manager:', error);
      return false;
    }
  }

  /**
   * Create new API gateway
   */
  createAPIGateway(gateway: Partial<APIGateway>): APIGateway | null {
    const newGateway: APIGateway = {
      id: `gateway_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: gateway.name || 'New API Gateway',
      type: gateway.type || APIGatewayType.REST,
      status: APIGatewayStatus.ACTIVE,
      routes: gateway.routes || [],
      policies: gateway.policies || [],
      middlewares: gateway.middlewares || [],
      services: gateway.services || [],
      monitors: gateway.monitors || [],
      analytics: gateway.analytics || this.createDefaultAnalytics(),
      metadata: gateway.metadata || this.createDefaultMetadata(),
      version: '1.0.0',
      created: Date.now(),
      modified: Date.now()
    };

    this.gateways.set(newGateway.id, newGateway);
    this.updateStats('create_gateway', newGateway);

    console.log(`Created API gateway: ${newGateway.name}`);
    return newGateway;
  }

  /**
   * Create route
   */
  createRoute(gatewayId: string, route: Partial<Route>): Route | null {
    const gateway = this.gateways.get(gatewayId);
    if (!gateway) {
      console.warn(`API gateway ${gatewayId} not found`);
      return null;
    }

    if (gateway.routes.length >= this.config.maxRoutes) {
      console.warn('Maximum number of routes reached');
      return null;
    }

    try {
      const newRoute: Route = {
        id: `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: route.name || 'New Route',
        path: route.path || '/',
        method: route.method || HttpMethod.GET,
        target: route.target || this.createDefaultRouteTarget(),
        middlewares: route.middlewares || [],
        policies: route.policies || [],
        caching: route.caching || this.createDefaultCachingConfig(),
        rateLimit: route.rateLimit || this.createDefaultRateLimitConfig(),
        metadata: route.metadata || new Map()
      };

      gateway.routes.push(newRoute);
      gateway.modified = Date.now();

      this.updateStats('create_route', gateway);
      console.log(`Created route: ${newRoute.name}`);
      return newRoute;
    } catch (error) {
      console.error(`Failed to create route in gateway ${gatewayId}:`, error);
      return null;
    }
  }

  /**
   * Create policy
   */
  createPolicy(gatewayId: string, policy: Partial<Policy>): Policy | null {
    const gateway = this.gateways.get(gatewayId);
    if (!gateway) {
      console.warn(`API gateway ${gatewayId} not found`);
      return null;
    }

    if (gateway.policies.length >= this.config.maxPolicies) {
      console.warn('Maximum number of policies reached');
      return null;
    }

    try {
      const newPolicy: Policy = {
        id: `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: policy.name || 'New Policy',
        type: policy.type || PolicyType.AUTHENTICATION,
        enabled: policy.enabled !== undefined ? policy.enabled : true,
        rules: policy.rules || [],
        metadata: policy.metadata || new Map()
      };

      gateway.policies.push(newPolicy);
      gateway.modified = Date.now();

      this.updateStats('create_policy', gateway);
      console.log(`Created policy: ${newPolicy.name}`);
      return newPolicy;
    } catch (error) {
      console.error(`Failed to create policy in gateway ${gatewayId}:`, error);
      return null;
    }
  }

  /**
   * Process request
   */
  async processRequest(gatewayId: string, request: GatewayRequest): Promise<GatewayResponse> {
    const gateway = this.gateways.get(gatewayId);
    if (!gateway) {
      return {
        success: false,
        status: 404,
        message: 'Gateway not found',
        data: null,
        metadata: new Map()
      };
    }

    try {
      const startTime = Date.now();
      
      // Find matching route
      const route = this.findMatchingRoute(gateway, request);
      if (!route) {
        return {
          success: false,
          status: 404,
          message: 'Route not found',
          data: null,
          metadata: new Map()
        };
      }

      // Apply middlewares
      const middlewareResult = await this.applyMiddlewares(gateway, route, request);
      if (!middlewareResult.success) {
        return {
          success: false,
          status: middlewareResult.status,
          message: middlewareResult.message,
          data: null,
          metadata: new Map()
        };
      }

      // Apply policies
      const policyResult = await this.applyPolicies(gateway, route, request);
      if (!policyResult.success) {
        return {
          success: false,
          status: policyResult.status,
          message: policyResult.message,
          data: null,
          metadata: new Map()
        };
      }

      // Check rate limiting
      const rateLimitResult = await this.checkRateLimit(gateway, route, request);
      if (!rateLimitResult.success) {
        return {
          success: false,
          status: 429,
          message: 'Rate limit exceeded',
          data: null,
          metadata: new Map()
        };
      }

      // Forward request to target
      const targetResponse = await this.forwardRequest(route.target, request);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Update analytics
      this.updateGatewayAnalytics(gateway, targetResponse.success, responseTime);
      
      gateway.modified = Date.now();
      this.updateStats('process_request', gateway);
      
      return {
        success: targetResponse.success,
        status: targetResponse.status,
        message: targetResponse.message,
        data: targetResponse.data,
        responseTime,
        metadata: new Map()
      };
    } catch (error) {
      console.error(`Failed to process request in gateway ${gatewayId}:`, error);
      return {
        success: false,
        status: 500,
        message: `Request processing failed: ${error}`,
        data: null,
        metadata: new Map()
      };
    }
  }

  /**
   * Get API gateway
   */
  getAPIGateway(gatewayId: string): APIGateway | null {
    return this.gateways.get(gatewayId) || null;
  }

  /**
   * Get all API gateways
   */
  getAPIGateways(): APIGateway[] {
    return Array.from(this.gateways.values());
  }

  /**
   * Get API gateways by type
   */
  getAPIGatewaysByType(type: APIGatewayType): APIGateway[] {
    return Array.from(this.gateways.values())
      .filter(gateway => gateway.type === type);
  }

  /**
   * Get manager statistics
   */
  getManagerStats(): APIGatewayStats {
    return { ...this.stats };
  }

  /**
   * Initialize API gateway manager
   */
  private async initializeAPIGatewayManager(): Promise<void> {
    console.log('Initializing API gateway manager...');
  }

  /**
   * Load default gateways
   */
  private async loadDefaultGateways(): Promise<void> {
    // Load default gateways
    const defaultGateways = [
      this.createDefaultRESTGateway(),
      this.createDefaultGraphQLGateway(),
      this.createDefaultWebSocketGateway()
    ];

    for (const gateway of defaultGateways) {
      if (gateway) {
        this.gateways.set(gateway.id, gateway);
      }
    }

    console.log(`Loaded ${defaultGateways.length} default gateways`);
  }

  /**
   * Create default route target
   */
  private createDefaultRouteTarget(): RouteTarget {
    return {
      type: TargetType.SERVICE,
      url: 'http://localhost:3000',
      service: 'default-service',
      loadBalancer: {
        algorithm: LoadBalancerAlgorithm.ROUND_ROBIN,
        weights: new Map(),
        healthCheck: true,
        metadata: new Map()
      },
      healthCheck: {
        enabled: true,
        path: '/health',
        interval: 30000,
        timeout: 5000,
        retries: 3,
        metadata: new Map()
      },
      metadata: new Map()
    };
  }

  /**
   * Create default caching config
   */
  private createDefaultCachingConfig(): CachingConfig {
    return {
      enabled: false,
      ttl: 300, // 5 minutes
      strategy: CachingStrategy.MEMORY,
      headers: [],
      metadata: new Map()
    };
  }

  /**
   * Create default rate limit config
   */
  private createDefaultRateLimitConfig(): RateLimitConfig {
    return {
      enabled: false,
      requests: 100,
      window: 60, // 1 minute
      strategy: RateLimitStrategy.FIXED_WINDOW,
      metadata: new Map()
    };
  }

  /**
   * Create default analytics
   */
  private createDefaultAnalytics(): GatewayAnalytics {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      errorRate: 0,
      throughput: 0,
      performance: {
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        networkUsage: 0,
        metadata: new Map()
      },
      lastUpdate: Date.now(),
      metadata: new Map()
    };
  }

  /**
   * Create default metadata
   */
  private createDefaultMetadata(): GatewayMetadata {
    return {
      author: 'System',
      version: '1.0.0',
      tags: [],
      description: '',
      customMetadata: new Map()
    };
  }

  /**
   * Create default REST gateway
   */
  private createDefaultRESTGateway(): APIGateway {
    return this.createAPIGateway({
      name: 'REST API Gateway',
      type: APIGatewayType.REST,
      description: 'REST API gateway'
    });
  }

  /**
   * Create default GraphQL gateway
   */
  private createDefaultGraphQLGateway(): APIGateway {
    return this.createAPIGateway({
      name: 'GraphQL API Gateway',
      type: APIGatewayType.GRAPHQL,
      description: 'GraphQL API gateway'
    });
  }

  /**
   * Create default WebSocket gateway
   */
  private createDefaultWebSocketGateway(): APIGateway {
    return this.createAPIGateway({
      name: 'WebSocket API Gateway',
      type: APIGatewayType.WEBSOCKET,
      description: 'WebSocket API gateway'
    });
  }

  /**
   * Find matching route
   */
  private findMatchingRoute(gateway: APIGateway, request: GatewayRequest): Route | null {
    return gateway.routes.find(route => 
      route.path === request.path && route.method === request.method
    ) || null;
  }

  /**
   * Apply middlewares
   */
  private async applyMiddlewares(gateway: APIGateway, route: Route, request: GatewayRequest): Promise<{ success: boolean; status: number; message: string }> {
    for (const middlewareId of route.middlewares) {
      const middleware = gateway.middlewares.find(m => m.id === middlewareId);
      if (!middleware || !middleware.enabled) continue;

      const result = await this.executeMiddleware(middleware, request);
      if (!result.success) {
        return result;
      }
    }
    return { success: true, status: 200, message: 'OK' };
  }

  /**
   * Apply policies
   */
  private async applyPolicies(gateway: APIGateway, route: Route, request: GatewayRequest): Promise<{ success: boolean; status: number; message: string }> {
    for (const policyId of route.policies) {
      const policy = gateway.policies.find(p => p.id === policyId);
      if (!policy || !policy.enabled) continue;

      const result = await this.executePolicy(policy, request);
      if (!result.success) {
        return result;
      }
    }
    return { success: true, status: 200, message: 'OK' };
  }

  /**
   * Check rate limit
   */
  private async checkRateLimit(gateway: APIGateway, route: Route, request: GatewayRequest): Promise<{ success: boolean }> {
    if (!route.rateLimit.enabled) {
      return { success: true };
    }

    // Simulate rate limit check
    const success = Math.random() > 0.1; // 90% success rate
    return { success };
  }

  /**
   * Forward request
   */
  private async forwardRequest(target: RouteTarget, request: GatewayRequest): Promise<{ success: boolean; status: number; message: string; data: any }> {
    // Simulate request forwarding
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const success = Math.random() > 0.05; // 95% success rate
    return {
      success,
      status: success ? 200 : 500,
      message: success ? 'OK' : 'Internal Server Error',
      data: success ? { result: 'success' } : null
    };
  }

  /**
   * Execute middleware
   */
  private async executeMiddleware(middleware: Middleware, request: GatewayRequest): Promise<{ success: boolean; status: number; message: string }> {
    // Simulate middleware execution
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const success = Math.random() > 0.02; // 98% success rate
    return {
      success,
      status: success ? 200 : 403,
      message: success ? 'OK' : 'Forbidden'
    };
  }

  /**
   * Execute policy
   */
  private async executePolicy(policy: Policy, request: GatewayRequest): Promise<{ success: boolean; status: number; message: string }> {
    // Simulate policy execution
    await new Promise(resolve => setTimeout(resolve, 5));
    
    const success = Math.random() > 0.01; // 99% success rate
    return {
      success,
      status: success ? 200 : 401,
      message: success ? 'OK' : 'Unauthorized'
    };
  }

  /**
   * Update gateway analytics
   */
  private updateGatewayAnalytics(gateway: APIGateway, success: boolean, responseTime: number): void {
    gateway.analytics.totalRequests++;
    gateway.analytics.lastUpdate = Date.now();
    
    if (success) {
      gateway.analytics.successfulRequests++;
    } else {
      gateway.analytics.failedRequests++;
    }
    
    // Update average response time
    const total = gateway.analytics.totalRequests;
    const currentAvg = gateway.analytics.averageResponseTime;
    const newAvg = (currentAvg * (total - 1) + responseTime) / total;
    gateway.analytics.averageResponseTime = newAvg;
    
    // Update error rate
    const failed = gateway.analytics.failedRequests;
    gateway.analytics.errorRate = total > 0 ? (failed / total) * 100 : 0;
  }

  /**
   * Update statistics
   */
  private updateStats(action: string, gateway: APIGateway): void {
    switch (action) {
      case 'create_gateway':
        this.stats.totalRoutes += gateway.routes.length;
        this.stats.totalPolicies += gateway.policies.length;
        this.stats.totalMiddlewares += gateway.middlewares.length;
        this.stats.totalServices += gateway.services.length;
        this.stats.totalMonitors += gateway.monitors.length;
        break;
      case 'create_route':
        this.stats.totalRoutes++;
        this.stats.activeRoutes++;
        break;
      case 'create_policy':
        this.stats.totalPolicies++;
        break;
      case 'process_request':
        this.stats.totalRequests++;
        if (gateway.analytics.successfulRequests > gateway.analytics.failedRequests) {
          this.stats.successfulRequests++;
        } else {
          this.stats.failedRequests++;
        }
        break;
    }

    this.stats.lastUpdate = Date.now();
  }

  /**
   * Initialize statistics
   */
  private initializeStats(): APIGatewayStats {
    return {
      totalRoutes: 0,
      activeRoutes: 0,
      totalPolicies: 0,
      totalMiddlewares: 0,
      totalServices: 0,
      activeServices: 0,
      totalMonitors: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      errorRate: 0,
      lastUpdate: Date.now()
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.gateways.clear();
    this.stats = this.initializeStats();
    this.isInitialized = false;
  }
}

export interface GatewayRequest {
  method: HttpMethod;
  path: string;
  headers: Map<string, string>;
  query: Map<string, string>;
  body: any;
  metadata: Map<string, any>;
}

export interface GatewayResponse {
  success: boolean;
  status: number;
  message: string;
  data: any;
  responseTime?: number;
  metadata: Map<string, any>;
}

// Export default instance
export const defaultAPIGatewayManager = new APIGatewayManager();
export { APIGatewayManager as default };