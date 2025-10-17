/**
 * HealthSystemPure Manager
 * 
 * Advanced health system including damage/healing, status effects,
 * regeneration, shields, and comprehensive health management.
 */

export interface HealthEntity {
  id: string;
  maxHp: number;
  currentHp: number;
  shields: Shield[];
  regeneration: RegenerationEffect[];
  immunities: string[];
  resistances: Record<string, number>; // resistance percentage
  lastUpdate: number;
  metadata?: Record<string, any>;
}

export interface Shield {
  id: string;
  type: 'physical' | 'magical' | 'elemental' | 'all';
  amount: number;
  maxAmount: number;
  absorption: number; // percentage of damage absorbed
  duration?: number; // -1 for permanent
  expiresAt?: number;
  metadata?: Record<string, any>;
}

export interface RegenerationEffect {
  id: string;
  type: 'hp' | 'shield' | 'both';
  amount: number; // per second
  duration: number; // seconds
  interval: number; // seconds between ticks
  lastTick: number;
  expiresAt: number;
  metadata?: Record<string, any>;
}

export interface HealthEvent {
  id: string;
  type: 'damage' | 'heal' | 'shield' | 'regeneration' | 'immunity' | 'resistance';
  amount: number;
  source: string;
  target: string;
  damageType?: 'physical' | 'magical' | 'elemental' | 'pure';
  element?: 'fire' | 'ice' | 'lightning' | 'poison' | 'holy' | 'dark';
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface HealthStats {
  totalEntities: number;
  aliveEntities: number;
  deadEntities: number;
  averageHp: number;
  totalShields: number;
  activeRegeneration: number;
  damageDealt: number;
  healingDone: number;
  eventTypes: Record<string, number>;
  damageTypes: Record<string, number>;
}

export interface HealthFilter {
  minHp?: number;
  maxHp?: number;
  hasShields?: boolean;
  hasRegeneration?: boolean;
  isAlive?: boolean;
  hasImmunity?: string;
  hasResistance?: string;
}

export interface HealthOutput {
  op: string;
  status: 'ok' | 'error';
  result?: HealthEntity | HealthEntity[] | HealthEvent | HealthStats | string;
  issues?: string[];
}

export class HealthSystemManager {
  private entities: Map<string, HealthEntity> = new Map();
  private events: HealthEvent[] = [];
  private regenerationTicks: Map<string, number> = new Map();

  constructor() {
    const managerId = this.id ?? `manager_${Date.now()}`;
    // Initialize with default entities
  }

  /**
   * Create a new health entity
   */
  createEntity(id: string, maxHp: number, options: {
    currentHp?: number;
    shields?: Shield[];
    immunities?: string[];
    resistances?: Record<string, number>;
  } = {}): HealthOutput {
    if (this.entities.has(id)) {
      return {
        op: 'create',
        status: 'error',
        issues: [`Entity ${id} already exists`]
      };
    }

    const entity: HealthEntity = {
      id,
      maxHp,
      currentHp: options.currentHp !== undefined ? currentHp: maxHp,
      shields: options.shields || [],
      regeneration: [],
      immunities: options.immunities || [],
      resistances: options.resistances || {},
      lastUpdate: new Date()
    };

    this.entities.set(id, entity);
    return {
      op: 'create',
      status: 'ok',
      result: entity
    };
  }

  /**
   * Get health entity
   */
  getEntity(id: string): HealthOutput {
    const entity = this.entities.get(id);
    if (!entity) {
      return {
        op: 'get',
        status: 'error',
        issues: [`Entity ${id} not found`]
      };
    }

    return {
      op: 'get',
      status: 'ok',
      result: entity
    };
  }

  /**
   * Apply damage to entity
   */
  applyDamage(entityId: string, amount: number, options: {
    damageType?: 'physical' | 'magical' | 'elemental' | 'pure';
    element?: 'fire' | 'ice' | 'lightning' | 'poison' | 'holy' | 'dark';
    source?: string;
    bypassShields?: boolean;
  } = {}): HealthOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'damage',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    // Check immunities
    if (options.damageType && entity.immunities.includes(options.damageType)) {
      const event: HealthEvent = {
        id: `immunity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'immunity',
        amount: 0,
        source: options.source || 'system',
        target: entityId,
        damageType: options.damageType,
        element: options.element,
        timestamp: new Date()
      };
      this.events.push(event);
      return {
        op: 'damage',
        status: 'ok',
        result: { ...entity, event }
      };
    }

    // Apply resistance
    let finalAmount = amount;
    if (options.damageType && entity.resistances[options.damageType]) {
      const resistance = entity.resistances[options.damageType];
      finalAmount = amount * (1 - resistance / 100);
    }

    // Apply shields if not bypassed
    let damageToHp = finalAmount;
    if (!options.bypassShields) {
      for (const shield of entity.shields) {
        if (shield.amount > 0 && this.isShieldEffective(shield, damageType: options.damageType, options.element)) {
          const absorbed = Math.min(shield.amount, damageToHp * (shield.absorption / 100));
          shield.amount -= absorbed;
          damageToHp -= absorbed;
          
          if (shield.amount <= 0) {
            entity.shields = entity.shields.filter((s: any) => s.id !== shield.id);
          }
        }
      }
    }

    // Apply damage to HP
    entity.currentHp = Math.max(0, entity.currentHp - damageToHp);
    entity.lastUpdate = Date.now();

    const event: HealthEvent = {
      id: `damage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'damage',
      amount: finalAmount,
      source: options.source || 'system',
      target: entityId,
      damageType: options.damageType,
      element: options.element,
      timestamp: new Date()
    };
    this.events.push(event);

    return {
      op: 'damage',
      status: 'ok',
      result: entity
    };
  }

  /**
   * Apply healing to entity
   */
  applyHealing(entityId: string, amount: number, options: {
    source?: string;
    overheal?: boolean;
  } = {}): HealthOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'heal',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    const oldHp = entity.currentHp;
    entity.currentHp = Math.min(entity.maxHp, entity.currentHp + amount);
    entity.lastUpdate = Date.now();

    const event: HealthEvent = {
      id: `heal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'heal',
      amount: entity.currentHp - oldHp,
      source: options.source || 'system',
      target: entityId,
      timestamp: new Date()
    };
    this.events.push(event);

    return {
      op: 'heal',
      status: 'ok',
      result: entity
    };
  }

  /**
   * Add shield to entity
   */
  addShield(entityId: string, shield: Shield): HealthOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'add-shield',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    entity.shields.push(shield);
    entity.lastUpdate = Date.now();

    const event: HealthEvent = {
      id: `shield_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'shield',
      amount: shield.amount,
      source: 'system',
      target: entityId,
      timestamp: new Date()
    };
    this.events.push(event);

    return {
      op: 'add-shield',
      status: 'ok',
      result: entity
    };
  }

  /**
   * Add regeneration effect
   */
  addRegeneration(entityId: string, regeneration: RegenerationEffect): HealthOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'add-regeneration',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    entity.regeneration.push(regeneration);
    entity.lastUpdate = Date.now();

    const event: HealthEvent = {
      id: `regeneration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'regeneration',
      amount: regeneration.amount,
      source: 'system',
      target: entityId,
      timestamp: new Date()
    };
    this.events.push(event);

    return {
      op: 'add-regeneration',
      status: 'ok',
      result: entity
    };
  }

  /**
   * Simulate health system tick
   */
  simulateTick(): HealthOutput {
    const now = Date.now();
    const updatedEntities: HealthEntity[] = [];

    for (const entity of this.entities.values()) {
      let updated = false;

      // Process regeneration
      for (const regen of entity.regeneration) {
        if (now - regen.lastTick >= regen.interval * 1000 && now < regen.expiresAt) {
          if (regen.type === 'hp' || regen.type === 'both') {
            entity.currentHp = Math.min(entity.maxHp, entity.currentHp + regen.amount);
          }
          if (regen.type === 'shield' || regen.type === 'both') {
            // Add shield regeneration
            const shieldRegen = entity.shields.find(s => s.id === regen.id);
            if (shieldRegen) {
              shieldRegen.amount = Math.min(shieldRegen.maxAmount, shieldRegen.amount + regen.amount);
            }
          }
          regen.lastTick = now;
          updated = true;
        }
      }

      // Remove expired regeneration
      entity.regeneration = entity.regeneration.filter((regen: any) => now < regen.expiresAt);

      // Remove expired shields
      entity.shields = entity.shields.filter((shield: any) => 
        !shield.expiresAt || now < shield.expiresAt
      );

      if (updated) {
        entity.lastUpdate = now;
        updatedEntities.push(entity);
      }
    }

    return {
      op: 'simulate',
      status: 'ok',
      result: updatedEntities
    };
  }

  /**
   * List health entities
   */
  listEntities(filter?: HealthFilter): HealthOutput {
    let entities = Array.from(this.entities.values());

    if (filter) {
      entities = entities.filter((entity: any) => {
        if (filter.minHp !== undefined && entity.currentHp < filter.minHp) return false;
        if (filter.maxHp !== undefined && entity.currentHp > filter.maxHp) return false;
        if (filter.hasShields !== undefined) {
          const hasShields = entity.shields.length > 0;
          if (filter.hasShields !== hasShields) return false;
        }
        if (filter.hasRegeneration !== undefined) {
          const hasRegen = entity.regeneration.length > 0;
          if (filter.hasRegeneration !== hasRegen) return false;
        }
        if (filter.isAlive !== undefined) {
          const isAlive = entity.currentHp > 0;
          if (filter.isAlive !== isAlive) return false;
        }
        if (filter.hasImmunity && !entity.immunities.includes(filter.hasImmunity)) return false;
        if (filter.hasResistance && !entity.resistances[filter.hasResistance]) return false;
        return true;
      });
    }

    return {
      op: 'list',
      status: 'ok',
      result: entities
    };
  }

  /**
   * Get health statistics
   */
  getHealthStats(): HealthOutput {
    const entities = Array.from(this.entities.values());
    const aliveEntities = entities.filter((e: any) => e.currentHp > 0);
    const deadEntities = entities.filter((e: any) => e.currentHp <= 0);
    
    const averageHp = entities.length > 0 
      ? entities.reduce((sum, e) => sum + e.currentHp, 0) / entities.length 
      : 0;
    
    const totalShields = entities.reduce((sum, e) => 
      sum + e.shields.reduce((shieldSum, s) => shieldSum + s.amount, 0), 0
    );
    
    const activeRegeneration = entities.reduce((sum, e) => sum + e.regeneration.length, 0);

    const damageEvents = this.events.filter((e: any) => e.type === 'damage');
    const healEvents = this.events.filter((e: any) => e.type === 'heal');
    
    const damageDealt = damageEvents.reduce((sum, e) => sum + e.amount, 0);
    const healingDone = healEvents.reduce((sum, e) => sum + e.amount, 0);

    const eventTypes: Record<string, number> = {};
    const damageTypes: Record<string, number> = {};
    
    this.events.forEach((event: any) => {
      eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
      if (event.damageType) {
        damageTypes[event.damageType] = (damageTypes[event.damageType] || 0) + 1;
      }
    });

    const stats: HealthStats = {
      totalEntities: entities.length,
      aliveEntities: aliveEntities.length,
      deadEntities: deadEntities.length,
      averageHp,
      totalShields,
      activeRegeneration,
      damageDealt,
      healingDone,
      eventTypes,
      damageTypes
    };

    return {
      op: 'stats',
      status: 'ok',
      result: stats
    };
  }

  /**
   * Export health data
   */
  exportHealth(format: 'json' | 'manifest' | 'summary' | 'events' = 'json'): HealthOutput {
    const entities = Array.from(this.entities.values());

    switch (format) {
      case 'json':
        return {
          op: 'export',
          status: 'ok',
          result: { entities, total: entities.length }
        };
      
      case 'manifest':
        return {
          op: 'export',
          status: 'ok',
          result: {
            schema: 'miff.health.export.v1',
            entities,
            events: this.events.slice(-100), // Last 100 events
            exportedAt: new Date().toISOString(),
            total: entities.length
          }
        };
      
      case 'summary':
        const stats = this.getHealthStats();
        return {
          op: 'export',
          status: 'ok',
          result: {
            summary: stats.result,
            entities: entities.map((entity: any) => ({
              id: entity.id,
              currentHp: entity.currentHp,
              maxHp: entity.maxHp,
              shields: entity.shields.length,
              regeneration: entity.regeneration.length,
              isAlive: entity.currentHp > 0
            }))
          }
        };
      
      case 'events':
        return {
          op: 'export',
          status: 'ok',
          result: {
            events: this.events,
            total: this.events.length
          }
        };
      
      default:
        return {
          op: 'export',
          status: 'error',
          issues: [`Unknown export format: ${format}`]
        };
    }
  }

  /**
   * Reset health system
   */
  resetHealth(): HealthOutput {
    this.entities.clear();
    this.events = [];
    this.regenerationTicks.clear();
    return {
      op: 'reset',
      status: 'ok',
      result: 'All health data reset'
    };
  }

  /**
   * Private helper methods
   */
  private isShieldEffective(shield: Shield, damageType?: string, element?: string): boolean {
    if (shield.type === 'all') return true;
    if (damageType && shield.type === damageType) return true;
    if (element && shield.type === 'elemental') return true;
    return false;
  }
}