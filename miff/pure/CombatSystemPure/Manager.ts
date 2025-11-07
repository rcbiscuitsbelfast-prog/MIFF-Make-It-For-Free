/**
 * CombatSystemPure Manager - Combat System Management
 *
 * Comprehensive combat system with:
 * - Multi-combat support
 * - Combat mechanics and rules
 * - Performance optimization
 * - Cross-platform compatibility
 * - Real-time combat processing
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { StructuredLogger } from '../shared/logging/StructuredLogger';
import { PerformanceOptimizer } from '../shared/performance/PerformanceOptimizer';
import { MemoryManager } from '../shared/memory/MemoryManager';
import { StandardErrorHandler } from '../shared/error/StandardErrorHandler';

export interface CombatSystemConfig {
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
  enableMultiCombatSupport: boolean;
  enableCombatMechanics: boolean;
  enablePerformanceOptimization: boolean;
  enableCrossPlatformCompatibility: boolean;
  enableRealTimeProcessing: boolean;
  enableDamageCalculation: boolean;
  enableStatusEffects: boolean;
  enableTurnBasedCombat: boolean;
  enableRealTimeCombat: boolean;
  enableProfiling: boolean;
}

export interface CombatSystem {
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
  type: SystemType;
  combats: Combat[];
  rules: CombatRule[];
  effects: StatusEffect[];
  performance: SystemPerformance;
  analytics: SystemAnalytics;
  version: string;
}

export interface Combat {
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
  type: CombatType;
  participants: CombatParticipant[];
  turnOrder: string[]; // Participant IDs
  currentTurn: number;
  round: number;
  rules: CombatRule[];
  effects: StatusEffect[];
}

export interface CombatParticipant {
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
  type: ParticipantType;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  stats: CombatStats;
  abilities: CombatAbility[];
  effects: StatusEffect[];
  position: Vector3;
}

export interface Vector3 {
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

export interface CombatStats {
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
  strength: number;
  dexterity: number;
  intelligence: number;
  constitution: number;
  wisdom: number;
  charisma: number;
  attack: number;
  defense: number;
  speed: number;
  criticalChance: number;
  criticalMultiplier: number;
}

export interface CombatAbility {
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
  type: AbilityType;
  cost: number; // Mana cost
  cooldown: number; // Turns
  damage: number;
  range: number;
  area: number;
  effects: AbilityEffect[];
}

export interface AbilityEffect {
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
  type: EffectType;
  value: number;
  duration: number; // Turns
  target: EffectTarget;
}

export interface StatusEffect {
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
  type: EffectType;
  value: number;
  duration: number; // Turns
  target: string; // Participant ID
  source: string; // Participant ID
}

export interface CombatRule {
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
  type: RuleType;
  enabled: boolean;
  conditions: RuleCondition[];
  actions: RuleAction[];
}

export interface RuleCondition {
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
  type: ConditionType;
  operator: ConditionOperator;
  value: any;
}

export interface RuleAction {
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
  type: ActionType;
  parameters: Record<string, any>;
}

export interface SystemPerformance {
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
  totalCombats: number;
  activeCombats: number;
  averageTurnTime: number; // milliseconds
  averageDamage: number;
  successRate: number; // 0-1
}

export interface SystemAnalytics {
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
  totalSystems: number;
  activeSystems: number;
  totalCombats: number;
  activeCombats: number;
  totalParticipants: number;
  totalAbilities: number;
  totalEffects: number;
  averagePerformance: number; // 0-100
  lastUpdated: Date;
}

export type SystemType = 'turn_based' | 'real_time' | 'hybrid' | 'custom';
export type SystemStatus = 'active' | 'inactive' | 'error' | 'maintenance';
export type CombatType = 'pvp' | 'pve' | 'pvpve' | 'custom';
export type CombatStatus = 'waiting' | 'active' | 'paused' | 'finished' | 'cancelled';
export type ParticipantType = 'player' | 'npc' | 'enemy' | 'boss' | 'custom';
export type ParticipantStatus = 'alive' | 'dead' | 'unconscious' | 'stunned' | 'custom';
export type AbilityType = 'attack' | 'defense' | 'heal' | 'buff' | 'debuff' | 'custom';
export type EffectType = 'damage' | 'heal' | 'buff' | 'debuff' | 'status' | 'custom';
export type EffectTarget = 'self' | 'enemy' | 'ally' | 'all' | 'custom';
export type RuleType = 'damage' | 'healing' | 'status' | 'turn' | 'custom';
export type ConditionType = 'health' | 'mana' | 'turn' | 'ability' | 'custom';
export type ConditionOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'custom';
export type ActionType = 'damage' | 'heal' | 'buff' | 'debuff' | 'custom';

export class CombatSystemManager {
  
  private performanceOptimizer: PerformanceOptimizer;
  private memoryManager: MemoryManager;
  private errorHandler: StandardErrorHandler;
  private logger: StructuredLogger;
  private config: CombatSystemConfig;
  private systems: Map<string, CombatSystem> = new Map();
  private isInitialized: boolean = false;
  private startTime: Date;

  constructor(config?: Partial<CombatSystemConfig>) {
    
    this.performanceOptimizer = new PerformanceOptimizer({} as any, {} as any);
    this.memoryManager = new MemoryManager();
    this.errorHandler = new StandardErrorHandler();
    this.logger = StructuredLogger.getInstance();
    this.startTime = Date.now();

    this.config = {
      enableMultiCombatSupport: true,
      enableCombatMechanics: true,
      enablePerformanceOptimization: true,
      enableCrossPlatformCompatibility: true,
      enableRealTimeProcessing: true,
      enableDamageCalculation: true,
      enableStatusEffects: true,
      enableTurnBasedCombat: true,
      enableRealTimeCombat: true,
      enableProfiling: false,
      ...config
    };
  }

  /**
   * Initialize the Combat System
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      StructuredLogger.warn('CombatSystemPure', { context: { message: 'Combat System already initialized' } });
      return;
    }

    try {
      StructuredLogger.info('CombatSystemPure', { context: { message: 'Initializing Combat System...' } });

      // Initialize performance optimizer
      if (this.config.enablePerformanceOptimization ?? false) {
        // PerformanceOptimizer does not require initialization
      }

      // Initialize memory manager
      if (this.config.enableProfiling) {
        // MemoryManager initialization handled internally
      }

      this.isInitialized = true;
      StructuredLogger.info('CombatSystemPure', { context: { message: 'Combat System initialized successfully' } });

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.errorHandler.handleError({} as any);
      throw error;
    }
  }

  /**
   * Create a new combat system
   */
  async createSystem(systemData: Omit<CombatSystem, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'analytics'>): Promise<CombatSystem> {
    if (!this.isInitialized) {
      throw new Error('Combat System not initialized');
    }

    try {
      const system: CombatSystem = {
        ...systemData,
        id: this.generateSystemId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0.0',
        analytics: {
          totalSystems: 0,
          activeSystems: 0,
          totalCombats: 0,
          activeCombats: 0,
          totalParticipants: 0,
          totalAbilities: 0,
          totalEffects: 0,
          averagePerformance: 0,
          lastUpdated: new Date()
        }
      };

      this.systems.set(system.id!, system);
      this.updateAnalytics();

      StructuredLogger.info('Combat system created', { systemId: system.id, systemName: system.name });
      return system;

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.errorHandler.handleError({} as any);
      throw error;
    }
  }

  /**
   * Get a combat system by ID
   */
  getSystem(systemId: string): CombatSystem | null {
    if (!this.isInitialized) {
      throw new Error('Combat System not initialized');
    }

    return this.systems.get(systemId) || null;
  }

  /**
   * Update a combat system
   */
  async updateSystem(systemId: string, updates: Partial<CombatSystem>): Promise<CombatSystem | null> {
    if (!this.isInitialized) {
      throw new Error('Combat System not initialized');
    }

    try {
      const system = this.systems.get(systemId);
      if (!system) {
        StructuredLogger.warn('System not found', { systemId });
        return null;
      }

      const updatedSystem: CombatSystem = {
        ...system,
        ...updates,
        updatedAt: Date.now(),
        version: this.incrementVersion(system.version)
      };

      this.systems.set(systemId, updatedSystem);
      this.updateAnalytics();

      StructuredLogger.info('Combat system updated', { systemId, systemName: updatedSystem.name });
      return updatedSystem;

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.errorHandler.handleError({} as any);
      throw error;
    }
  }

  /**
   * Delete a combat system
   */
  async deleteSystem(systemId: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Combat System not initialized');
    }

    try {
      const system = this.systems.get(systemId);
      if (!system) {
        StructuredLogger.warn('System not found', { systemId });
        return false;
      }

      this.systems.delete(systemId);
      this.updateAnalytics();

      StructuredLogger.info('Combat system deleted', { systemId, systemName: system.name });
      return true;

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.errorHandler.handleError({} as any);
      throw error;
    }
  }

  /**
   * Get all combat systems
   */
  getAllSystems(): CombatSystem[] {
    if (!this.isInitialized) {
      throw new Error('Combat System not initialized');
    }

    return Array.from(this.systems.values());
  }

  /**
   * Get systems by type
   */
  getSystemsByType(type: SystemType): CombatSystem[] {
    if (!this.isInitialized) {
      throw new Error('Combat System not initialized');
    }

    return Array.from(this.systems.values()).filter((system: any) => system.type === type);
  }

  /**
   * Get systems by status
   */
  getSystemsByStatus(status: SystemStatus): CombatSystem[] {
    if (!this.isInitialized) {
      throw new Error('Combat System not initialized');
    }

    return Array.from(this.systems.values()).filter((system: any) => system.status === status);
  }

  /**
   * Create a new combat
   */
  async createCombat(systemId: string, combatData: Omit<Combat, 'id' | 'turnOrder' | 'currentTurn' | 'round'>): Promise<Combat | null> {
    if (!this.isInitialized) {
      throw new Error('Combat System not initialized');
    }

    try {
      const system = this.systems.get(systemId);
      if (!system) {
        StructuredLogger.warn('System not found', { systemId });
        return null;
      }

      const combat: Combat = {
        ...combatData,
        id: this.generateCombatId(),
        turnOrder: [],
        currentTurn: 0,
        round: 1
      };

      system.combats.push(combat);
      this.updateAnalytics();

      StructuredLogger.info('Combat created', { systemId, combatId: combat.id, combatName: combat.name });
      return combat;

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.errorHandler.handleError({} as any);
      return null;
    }
  }

  /**
   * Add a participant to combat
   */
  async addParticipant(systemId: string, combatId: string, participantData: Omit<CombatParticipant, 'id'>): Promise<CombatParticipant | null> {
    if (!this.isInitialized) {
      throw new Error('Combat System not initialized');
    }

    try {
      const system = this.systems.get(systemId);
      if (!system) {
        StructuredLogger.warn('System not found', { systemId });
        return null;
      }

      const combat = system.combats.find(c => c.id === combatId);
      if (!combat) {
        StructuredLogger.warn('Combat not found', { systemId, combatId });
        return null;
      }

      const participant: CombatParticipant = {
        ...participantData,
        id: this.generateParticipantId()
      };

      combat.participants.push(participant);
      combat.turnOrder.push(participant.id!);
      this.updateAnalytics();

      StructuredLogger.info('Participant added to combat', { systemId, combatId, participantId: participant.id, participantName: participant.name });
      return participant;

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.errorHandler.handleError({} as any);
      return null;
    }
  }

  /**
   * Start combat
   */
  async startCombat(systemId: string, combatId: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Combat System not initialized');
    }

    try {
      const system = this.systems.get(systemId);
      if (!system) {
        StructuredLogger.warn('System not found', { systemId });
        return false;
      }

      const combat = system.combats.find(c => c.id === combatId);
      if (!combat) {
        StructuredLogger.warn('Combat not found', { systemId, combatId });
        return false;
      }

      if (combat.participants.length < 2) {
        StructuredLogger.warn('Not enough participants to start combat', { systemId, combatId, participantCount: combat.participants.length });
        return false;
      }

      combat.status = 'active';
      combat.currentTurn = 0;
      combat.round = 1;
      this.updateAnalytics();

      StructuredLogger.info('Combat started', { systemId, combatId });
      return true;

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.errorHandler.handleError({} as any);
      return false;
    }
  }

  /**
   * Execute an ability
   */
  async executeAbility(systemId: string, combatId: string, participantId: string, abilityId: string, targetId?: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Combat System not initialized');
    }

    try {
      const system = this.systems.get(systemId);
      if (!system) {
        StructuredLogger.warn('System not found', { systemId });
        return false;
      }

      const combat = system.combats.find(c => c.id === combatId);
      if (!combat) {
        StructuredLogger.warn('Combat not found', { systemId, combatId });
        return false;
      }

      const participant = combat.participants.find(p => p.id === participantId);
      if (!participant) {
        StructuredLogger.warn('Participant not found', { systemId, combatId, participantId });
        return false;
      }

      const ability = participant.abilities.find(a => a.id === abilityId);
      if (!ability) {
        StructuredLogger.warn('Ability not found', { systemId, combatId, participantId, abilityId });
        return false;
      }

      // Check if it's the participant's turn
      if (combat.turnOrder[combat.currentTurn] !== participantId) {
        StructuredLogger.warn('Not participant\'s turn', { systemId, combatId, participantId, currentTurn: combat.currentTurn });
        return false;
      }

      // Check mana cost
      if (participant.mana < ability.cost) {
        StructuredLogger.warn('Insufficient mana', { systemId, combatId, participantId, abilityId, required: ability.cost, available: participant.mana });
        return false;
      }

      // Execute ability
      participant.mana -= ability.cost;
      
      if (targetId) {
        const target = combat.participants.find(p => p.id === targetId);
        if (target) {
          // Apply damage
          target.health = Math.max(0, target.health - ability.damage);
          
          // Apply effects
          for (const effect of ability.effects) {
            this.applyEffect(combat, target, effect);
          }
        }
      }

      this.updateAnalytics();

      StructuredLogger.info('Ability executed', { systemId, combatId, participantId, abilityId, targetId });
      return true;

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.errorHandler.handleError({} as any);
      return false;
    }
  }

  /**
   * Apply effect to participant (internal method)
   */
  private applyEffect(combat: Combat, participant: CombatParticipant, effect: AbilityEffect): void {
    const statusEffect: StatusEffect = {
      id: this.generateEffectId(),
      name: effect.type,
      type: effect.type,
      value: effect.value,
      duration: effect.duration,
      target: participant.id!,
      source: participant.id!,
      metadata: {}
    };

    participant.effects.push(statusEffect);
    combat.effects.push(statusEffect);
  }

  /**
   * End turn
   */
  async endTurn(systemId: string, combatId: string, participantId: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Combat System not initialized');
    }

    try {
      const system = this.systems.get(systemId);
      if (!system) {
        StructuredLogger.warn('System not found', { systemId });
        return false;
      }

      const combat = system.combats.find(c => c.id === combatId);
      if (!combat) {
        StructuredLogger.warn('Combat not found', { systemId, combatId });
        return false;
      }

      // Check if it's the participant's turn
      if (combat.turnOrder[combat.currentTurn] !== participantId) {
        StructuredLogger.warn('Not participant\'s turn', { systemId, combatId, participantId, currentTurn: combat.currentTurn });
        return false;
      }

      // Move to next turn
      combat.currentTurn = (combat.currentTurn + 1) % combat.turnOrder.length;
      
      // If we've completed a full round
      if (combat.currentTurn === 0) {
        combat.round++;
        this.processStatusEffects(combat);
      }

      this.updateAnalytics();

      StructuredLogger.info('Turn ended', { systemId, combatId, participantId, currentTurn: combat.currentTurn, round: combat.round });
      return true;

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.errorHandler.handleError({} as any);
      return false;
    }
  }

  /**
   * Process status effects (internal method)
   */
  private processStatusEffects(combat: Combat): void {
    for (const participant of combat.participants) {
      for (let i = participant.effects.length - 1; i >= 0; i--) {
        const effect = participant.effects[i];
        effect.duration--;
        
        if (effect.duration <= 0) {
          participant.effects.splice(i, 1);
        } else {
          // Apply effect
          switch (effect.type) {
            case 'damage':
              participant.health = Math.max(0, participant.health - effect.value);
              break;
            case 'heal':
              participant.health = Math.min(participant.maxHealth, participant.health + effect.value);
              break;
            // Add more effect types as needed
          }
        }
      }
    }
  }

  /**
   * Generate a unique system ID
   */
  private generateSystemId(): string {
    return `system_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique combat ID
   */
  private generateCombatId(): string {
    return `combat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique participant ID
   */
  private generateParticipantId(): string {
    return `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique effect ID
   */
  private generateEffectId(): string {
    return `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Increment version number
   */
  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2!]) + 1;
    return `${parts[0!]}.${parts[1!]}.${patch}`;
  }

  /**
   * Update analytics
   */
  private updateAnalytics(): void {
    const systems = Array.from(this.systems.values());
    const totalCombats = systems.reduce((sum: any, s: any) => sum + s.combats.length, 0);
    const activeCombats = systems.reduce((sum: any, s: any) => sum + s.combats.filter((c: any) => c.status === 'active').length, 0);
    const totalParticipants = systems.reduce((sum: any, s: any) => sum + s.combats.reduce((sum: any, c: any) => sum + c.participants.length, 0), 0);
    const totalAbilities = systems.reduce((sum: any, s: any) => sum + s.combats.reduce((sum: any, c: any) => sum + c.participants.reduce((sum: any, p: any) => sum + p.abilities.length, 0), 0), 0);
    const totalEffects = systems.reduce((sum: any, s: any) => sum + s.combats.reduce((sum: any, c: any) => sum + c.effects.length, 0), 0);

    for (const system of systems) {
      system.analytics = {
        totalSystems: systems.length,
        activeSystems: systems.filter((s: any) => s.status === 'active').length,
        totalCombats: system.combats.length,
        activeCombats: system.combats.filter((c: any) => c.status === 'active').length,
        totalParticipants: system.combats.reduce((sum: any, c: any) => sum + c.participants.length, 0),
        totalAbilities: system.combats.reduce((sum: any, c: any) => sum + c.participants.reduce((sum: any, p: any) => sum + p.abilities.length, 0), 0),
        totalEffects: system.combats.reduce((sum: any, c: any) => sum + c.effects.length, 0),
        averagePerformance: 85, // Simulate performance score
        lastUpdated: new Date()
      };
    }
  }

  /**
   * Get system statistics
   */
  getStatistics(): {
    totalSystems: number;
    activeSystems: number;
    systemsByType: Record<SystemType, number>;
    systemsByStatus: Record<SystemStatus, number>;
    totalCombats: number;
    activeCombats: number;
    totalParticipants: number;
    totalAbilities: number;
    uptime: number;
  } {
    if (!this.isInitialized) {
      throw new Error('Combat System not initialized');
    }

    const systems = Array.from(this.systems.values());
    const activeSystems = systems.filter((s: any) => s.status === 'active');
    const totalCombats = systems.reduce((sum: any, s: any) => sum + s.combats.length, 0);
    const activeCombats = systems.reduce((sum: any, s: any) => sum + s.combats.filter((c: any) => c.status === 'active').length, 0);
    const totalParticipants = systems.reduce((sum: any, s: any) => sum + s.combats.reduce((sum: any, c: any) => sum + c.participants.length, 0), 0);
    const totalAbilities = systems.reduce((sum: any, s: any) => sum + s.combats.reduce((sum: any, c: any) => sum + c.participants.reduce((sum: any, p: any) => sum + p.abilities.length, 0), 0), 0);

    const systemsByType: Record<SystemType, number> = {
      turn_based: 0,
      real_time: 0,
      hybrid: 0,
      custom: 0
    };

    const systemsByStatus: Record<SystemStatus, number> = {
      active: 0,
      inactive: 0,
      error: 0,
      maintenance: 0
    };

    for (const system of systems) {
      systemsByType[system.type]++;
      systemsByStatus[system.status! as SystemStatus]++;
    }

    return {
      totalSystems: systems.length,
      activeSystems: activeSystems.length,
      systemsByType,
      systemsByStatus,
      totalCombats,
      activeCombats,
      totalParticipants,
      totalAbilities,
      uptime: Date.now() - this.startTime.getTime()
    };
  }

  /**
   * Destroy the Combat System
   */
  async destroy(): Promise<void> {
    StructuredLogger.info('CombatSystemPure', { context: { message: 'Destroying Combat System...' } });

    this.systems.clear();
    this.isInitialized = false;

    StructuredLogger.info('CombatSystemPure', { context: { message: 'Combat System destroyed' } });
  }
}

// Export default instance
export const combatSystemManager = new CombatSystemManager();
export default combatSystemManager;