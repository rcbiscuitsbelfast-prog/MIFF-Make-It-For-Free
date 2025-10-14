/**
 * QuestScenarioPure Manager - Advanced Quest Scenario Management System
 *
 * Comprehensive quest scenario management system with:
 * - Quest creation and management
 * - Scenario scripting and logic
 * - Quest progression tracking
 * - Performance optimization
 * - Real-time quest monitoring
 * - Quest analytics and reporting
 */

export interface QuestScenarioConfig {
  // Auto-added common properties
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
  enableQuestManagement: boolean;
  enableScenarioCreation: boolean;
  enableQuestScripting: boolean;
  enableProgressionTracking: boolean;
  enablePerformanceOptimization: boolean;
  enableRealTimeMonitoring: boolean;
  enableQuestAnalytics: boolean;
  enableQuestReporting: boolean;
  maxQuests: number;
  maxScenarios: number;
  enableCloudSync: boolean;
  enableBackup: boolean;
  enableVersioning: boolean;
}

export interface QuestScenarioManager {
  // Auto-added common properties
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
  id: string;
  name: string;
  type: QuestScenarioManagerType;
  status: QuestScenarioManagerStatus;
  quests: Quest[];
  scenarios: QuestScenario[];
  scripts: QuestScript[];
  progressions: QuestProgression[];
  performanceMetrics: QuestScenarioPerformanceMetrics;
  analytics: QuestScenarioAnalytics;
  reporting: QuestScenarioReporting;
  cloudSync: CloudSyncConfig;
  backup: BackupConfig;
  versioning: VersioningConfig;
  metadata: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export type QuestScenarioManagerType = 'main' | 'side' | 'daily' | 'event' | 'custom';
export type QuestScenarioManagerStatus = 'active' | 'inactive' | 'maintenance' | 'error';

export interface Quest {
  // Auto-added common properties
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
  id: string;
  name: string;
  type: QuestType;
  status: QuestStatus;
  description: string;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  requirements: QuestRequirement[];
  scenarios: string[];
  progression: QuestProgressionInfo;
  performance: QuestPerformance;
  metadata: Record<string, any>;
}

export type QuestType = 'main' | 'side' | 'daily' | 'weekly' | 'event' | 'custom';
export type QuestStatus = 'draft' | 'active' | 'completed' | 'failed' | 'expired';

export interface QuestObjective {
  // Auto-added common properties
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
  id: string;
  name: string;
  type: ObjectiveType;
  description: string;
  target: ObjectiveTarget;
  progress: ObjectiveProgress;
  rewards: QuestReward[];
  requirements: QuestRequirement[];
  conditions: ObjectiveCondition[];
}

export type ObjectiveType = 'kill' | 'collect' | 'deliver' | 'explore' | 'talk' | 'custom';

export interface ObjectiveTarget {
  // Auto-added common properties
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
  type: TargetType;
  id: string;
  name: string;
  quantity: number;
  location: Vector3;
  radius: number;
}

export type TargetType = 'enemy' | 'item' | 'npc' | 'location' | 'custom';

export interface Vector3 {
  // Auto-added common properties
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
  x: number;
  y: number;
  z: number;
}

export interface ObjectiveProgress {
  // Auto-added common properties
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
  current: number;
  required: number;
  percentage: number;
  completed: boolean;
  lastUpdated: number;
}

export interface QuestReward {
  // Auto-added common properties
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
  id: string;
  type: RewardType;
  itemId: string;
  quantity: number;
  experience: number;
  gold: number;
  reputation: ReputationReward;
  unlocked: UnlockReward;
}

export type RewardType = 'item' | 'experience' | 'gold' | 'reputation' | 'unlock' | 'custom';

export interface ReputationReward {
  // Auto-added common properties
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
  faction: string;
  amount: number;
}

export interface UnlockReward {
  // Auto-added common properties
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
  type: UnlockType;
  id: string;
  name: string;
}

export type UnlockType = 'quest' | 'area' | 'ability' | 'item' | 'custom';

export interface QuestRequirement {
  // Auto-added common properties
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
  id: string;
  type: RequirementType;
  target: string;
  value: number;
  operator: RequirementOperator;
  description: string;
}

export type RequirementType = 'level' | 'quest' | 'item' | 'reputation' | 'custom';
export type RequirementOperator = 'equals' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'custom';

export interface ObjectiveCondition {
  // Auto-added common properties
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
  id: string;
  type: ConditionType;
  field: string;
  operator: ConditionOperator;
  value: any;
  description: string;
}

export type ConditionType = 'stat' | 'item' | 'quest' | 'location' | 'custom';
export type ConditionOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'custom';

export interface QuestProgressionInfo {
  // Auto-added common properties
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
  currentStep: number;
  totalSteps: number;
  completedSteps: number;
  startedAt: number;
  completedAt: number | null;
  timeSpent: number;
}

export interface QuestPerformance {
  // Auto-added common properties
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
  totalAttempts: number;
  successfulAttempts: number;
  averageCompletionTime: number;
  lastAttempt: number;
}

export interface QuestScenario {
  // Auto-added common properties
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
  id: string;
  name: string;
  type: ScenarioType;
  status: ScenarioStatus;
  questId: string;
  order: number;
  script: string;
  conditions: ScenarioCondition[];
  actions: ScenarioAction[];
  performance: ScenarioPerformance;
  metadata: Record<string, any>;
}

export type ScenarioType = 'dialogue' | 'combat' | 'exploration' | 'puzzle' | 'custom';
export type ScenarioStatus = 'draft' | 'ready' | 'active' | 'completed' | 'failed';

export interface ScenarioCondition {
  // Auto-added common properties
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
  id: string;
  type: ConditionType;
  field: string;
  operator: ConditionOperator;
  value: any;
  description: string;
}

export interface ScenarioAction {
  // Auto-added common properties
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
  id: string;
  type: ActionType;
  target: string;
  parameters: Record<string, any>;
  conditions: ScenarioCondition[];
  description: string;
}

export type ActionType = 'spawn' | 'despawn' | 'move' | 'dialogue' | 'reward' | 'custom';

export interface ScenarioPerformance {
  // Auto-added common properties
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
  totalExecutions: number;
  successfulExecutions: number;
  averageExecutionTime: number;
  lastExecution: number;
}

export interface QuestScript {
  // Auto-added common properties
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
  id: string;
  name: string;
  type: ScriptType;
  status: ScriptStatus;
  language: ScriptLanguage;
  source: string;
  functions: ScriptFunction[];
  variables: ScriptVariable[];
  performance: ScriptPerformance;
  metadata: Record<string, any>;
}

export type ScriptType = 'quest' | 'objective' | 'scenario' | 'custom';
export type ScriptStatus = 'draft' | 'ready' | 'active' | 'error';

export type ScriptLanguage = 'javascript' | 'lua' | 'python' | 'custom';

export interface ScriptFunction {
  // Auto-added common properties
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
  name: string;
  parameters: ScriptParameter[];
  returnType: string;
  description: string;
}

export interface ScriptParameter {
  // Auto-added common properties
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
  name: string;
  type: string;
  required: boolean;
  defaultValue: any;
}

export interface ScriptVariable {
  // Auto-added common properties
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
  name: string;
  type: string;
  value: any;
  scope: VariableScope;
}

export type VariableScope = 'global' | 'quest' | 'scenario' | 'local';

export interface ScriptPerformance {
  // Auto-added common properties
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
  totalExecutions: number;
  averageExecutionTime: number;
  memoryUsage: number;
  lastExecution: number;
}

export interface QuestProgression {
  // Auto-added common properties
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
  id: string;
  questId: string;
  playerId: string;
  status: ProgressionStatus;
  currentObjective: string;
  completedObjectives: string[];
  progress: ProgressionProgress;
  rewards: QuestReward[];
  performance: ProgressionPerformance;
  metadata: Record<string, any>;
}

export type ProgressionStatus = 'not_started' | 'in_progress' | 'completed' | 'failed' | 'abandoned';

export interface ProgressionProgress {
  // Auto-added common properties
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
  currentStep: number;
  totalSteps: number;
  percentage: number;
  startedAt: number;
  lastUpdated: number;
  completedAt: number | null;
}

export interface ProgressionPerformance {
  // Auto-added common properties
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
  timeSpent: number;
  objectivesCompleted: number;
  rewardsEarned: number;
  lastActivity: number;
}

export interface QuestScenarioPerformanceMetrics {
  // Auto-added common properties
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
  totalQuests: number;
  activeQuests: number;
  totalScenarios: number;
  activeScenarios: number;
  totalScripts: number;
  totalProgressions: number;
  activeProgressions: number;
  averageCompletionTime: number;
  completionRate: number;
  memoryUsage: number;
  cpuUsage: number;
  uptime: number;
}

export interface QuestScenarioAnalytics {
  // Auto-added common properties
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
  totalQuests: number;
  totalScenarios: number;
  averageCompletionTime: number;
  questTypeDistribution: QuestTypeDistribution[];
  scenarioTypeDistribution: ScenarioTypeDistribution[];
  performanceTrends: PerformanceTrend[];
}

export interface QuestTypeDistribution {
  // Auto-added common properties
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
  type: QuestType;
  count: number;
  percentage: number;
  averageCompletionTime: number;
}

export interface ScenarioTypeDistribution {
  // Auto-added common properties
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
  type: ScenarioType;
  count: number;
  percentage: number;
  averageExecutionTime: number;
}

export interface PerformanceTrend {
  // Auto-added common properties
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
  timestamp: number;
  quests: number;
  scenarios: number;
  completions: number;
  memory: number;
  cpu: number;
}

export interface QuestScenarioReporting {
  // Auto-added common properties
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
  enabled: boolean;
  interval: number;
  format: 'json' | 'csv' | 'xml';
  destination: string;
  includeMetrics: boolean;
  includeAnalytics: boolean;
  includeQuests: boolean;
  lastReport: number;
}

export interface CloudSyncConfig {
  // Auto-added common properties
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
  enabled: boolean;
  provider: string;
  region: string;
  bucket: string;
  interval: number;
  lastSync: number;
}

export interface BackupConfig {
  // Auto-added common properties
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
  enabled: boolean;
  interval: number;
  retention: number;
  destination: string;
  lastBackup: number;
}

export interface VersioningConfig {
  // Auto-added common properties
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
  enabled: boolean;
  currentVersion: string;
  versions: Version[];
  autoUpdate: boolean;
  lastUpdate: number;
}

export interface Version {
  // Auto-added common properties
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
  version: string;
  timestamp: number;
  changes: string[];
  compatible: boolean;
}

export interface QuestScenarioOutput {
  // Auto-added common properties
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
  op: string;
  status: 'ok' | 'error';
  result?: any;
  issues?: string[];
}

export class QuestScenarioPure {
  private managers: Map<string, QuestScenarioManager> = new Map();
  private config: QuestScenarioConfig;
  private performanceMetrics: QuestScenarioPerformanceMetrics;
  private analytics: QuestScenarioAnalytics;

  constructor(config: Partial<QuestScenarioConfig> = {}) {
    this.config = {
      enableQuestManagement: true,
      enableScenarioCreation: true,
      enableQuestScripting: true,
      enableProgressionTracking: true,
      enablePerformanceOptimization: true,
      enableRealTimeMonitoring: true,
      enableQuestAnalytics: true,
      enableQuestReporting: true,
      maxQuests: 10000,
      maxScenarios: 50000,
      enableCloudSync: false,
      enableBackup: false,
      enableVersioning: false,
      ...config
    };

    this.performanceMetrics = {
      totalQuests: 0,
      activeQuests: 0,
      totalScenarios: 0,
      activeScenarios: 0,
      totalScripts: 0,
      totalProgressions: 0,
      activeProgressions: 0,
      averageCompletionTime: 0,
      completionRate: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      uptime: 0
    };

    this.analytics = {
      totalQuests: 0,
      totalScenarios: 0,
      averageCompletionTime: 0,
      questTypeDistribution: [],
      scenarioTypeDistribution: [],
      performanceTrends: []
    };
  }

  /**
   * Create a new quest scenario manager
   */
  createManager(): QuestScenarioOutput {
    if (!this.config.enableQuestManagement) {
      return {
        op: 'create-manager',
        status: 'error',
        issues: ['Quest scenario management is disabled']
      };
    }

    const manager: QuestScenarioManager = {
      id: managerData.id || `questscenario-${Date.now()}`,
      name: managerData.name || 'Unnamed Quest Scenario Manager',
      type: managerData.type || 'main',
      status: 'active',
      quests: [],
      scenarios: [],
      scripts: [],
      progressions: [],
      performanceMetrics: {
        totalQuests: 0,
        activeQuests: 0,
        totalScenarios: 0,
        activeScenarios: 0,
        totalScripts: 0,
        totalProgressions: 0,
        activeProgressions: 0,
        averageCompletionTime: 0,
        completionRate: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        uptime: 0
      },
      analytics: {
        totalQuests: 0,
        totalScenarios: 0,
        averageCompletionTime: 0,
        questTypeDistribution: [],
        scenarioTypeDistribution: [],
        performanceTrends: []
      },
      reporting: {
        enabled: false,
        interval: 300000, // 5 minutes
        format: 'json',
        destination: '',
        includeMetrics: true,
        includeAnalytics: true,
        includeQuests: true,
        lastReport: 0
      },
      cloudSync: {
        enabled: false,
        provider: '',
        region: '',
        bucket: '',
        interval: 3600000, // 1 hour
        lastSync: 0
      },
      backup: {
        enabled: false,
        interval: 86400000, // 24 hours
        retention: 7,
        destination: '',
        lastBackup: 0
      },
      versioning: {
        enabled: false,
        currentVersion: '1.0.0',
        versions: [],
        autoUpdate: false,
        lastUpdate: 0
      },
      metadata: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...managerData
    };

    this.managers.set(manager.id, manager);

    return {
      op: 'create-manager',
      status: 'ok',
      result: manager
    };
  }

  /**
   * Get manager by ID
   */
  getManager(): QuestScenarioOutput {
    const manager = this.managers.get(managerId);
    if (!manager) {
      return {
        op: 'get-manager',
        status: 'error',
        issues: [`Manager ${managerId} not found`]
      };
    }

    return {
      op: 'get-manager',
      status: 'ok',
      result: manager
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): QuestScenarioPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get analytics
   */
  getAnalytics(): QuestScenarioAnalytics {
    return { ...this.analytics };
  }

  /**
   * Get all managers
   */
  getAllManagers(): QuestScenarioManager[] {
    return Array.from(this.managers.values());
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(): void {
    const now = Date.now();
    let totalQuests = 0;
    let activeQuests = 0;
    let totalScenarios = 0;
    let activeScenarios = 0;
    let totalScripts = 0;
    let totalProgressions = 0;
    let activeProgressions = 0;

    for (const manager of this.managers.values()) {
      totalQuests += manager.quests.length;
      activeQuests += manager.quests.filter(q => q.status === 'active').length;
      totalScenarios += manager.scenarios.length;
      activeScenarios += manager.scenarios.filter(s => s.status === 'active').length;
      totalScripts += manager.scripts.length;
      totalProgressions += manager.progressions.length;
      activeProgressions += manager.progressions.filter(p => p.status === 'in_progress').length;
    }

    this.performanceMetrics.totalQuests = totalQuests;
    this.performanceMetrics.activeQuests = activeQuests;
    this.performanceMetrics.totalScenarios = totalScenarios;
    this.performanceMetrics.activeScenarios = activeScenarios;
    this.performanceMetrics.totalScripts = totalScripts;
    this.performanceMetrics.totalProgressions = totalProgressions;
    this.performanceMetrics.activeProgressions = activeProgressions;
    this.performanceMetrics.uptime = now - (this.performanceMetrics.uptime || now);
  }
}