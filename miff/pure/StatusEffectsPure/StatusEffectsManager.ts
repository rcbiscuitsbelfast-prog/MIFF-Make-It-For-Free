/**
 * StatusEffectsPure Manager
 * 
 * Advanced status effect system including buffs, debuffs, stacking rules,
 * effect interactions, and comprehensive effect management.
 */

export interface StatusEffect {
  id: string;
  name: string;
  type: 'buff' | 'debuff' | 'neutral';
  category: 'poison' | 'regen' | 'shield' | 'stun' | 'slow' | 'haste' | 'burn' | 'freeze' | 'charm' | 'fear' | 'custom';
  magnitude: number;
  duration: number;
  maxDuration?: number;
  stackable: boolean;
  maxStacks?: number;
  currentStacks: number;
  source: string; // Entity ID that applied the effect
  appliedAt: number;
  expiresAt: number;
  metadata?: Record<string, any>;
}

export interface StatusEntity {
  id: string;
  hp: number;
  maxHp: number;
  effects: StatusEffect[];
  immunities: string[]; // Effect categories this entity is immune to
  resistances: Record<string, number>; // Effect category -> resistance percentage
  lastUpdate: number;
  metadata?: Record<string, any>;
}

export interface EffectStackingRule {
  category: string;
  rule: 'replace' | 'stack' | 'extend' | 'block';
  maxStacks?: number;
  priority?: number;
}

export interface TickResult {
  entityId: string;
  hpDelta: number;
  newHp: number;
  effectsApplied: StatusEffect[];
  effectsExpired: StatusEffect[];
  effectsModified: StatusEffect[];
  events: StatusEvent[];
}

export interface StatusEvent {
  type: 'effect_applied' | 'effect_expired' | 'effect_modified' | 'entity_died' | 'entity_revived' | 'immunity_triggered';
  entityId: string;
  effectId?: string;
  timestamp: number;
  data?: Record<string, any>;
}

export interface StatusStats {
  totalEntities: number;
  entitiesWithEffects: number;
  totalEffects: number;
  effectDistribution: Record<string, number>;
  averageHp: number;
  deadEntities: number;
  mostCommonEffect: string;
}

export interface StatusFilter {
  category?: string;
  type?: string;
  minHp?: number;
  maxHp?: number;
  hasEffects?: boolean;
  isDead?: boolean;
}

export interface StatusOutput {
  op: string;
  status: 'ok' | 'error';
  result?: StatusEntity | StatusEntity[] | TickResult | TickResult[] | StatusStats | Record<string, any>;
  issues?: string[];
}

export class StatusEffectsManager {
  private entities: Map<string, StatusEntity> = new Map();
  private events: StatusEvent[] = [];
  private stackingRules: Map<string, EffectStackingRule> = new Map();

  constructor() {
    this.initializeDefaultStackingRules();
  }

  // Shim methods expected by CLI wrapper
  getActiveEffects(entityId: string): StatusEffect[] {
    const entity = this.entities.get(entityId);
    return entity ? [...entity.effects] : [];
  }

  calculateModifiedStats(entityId: string, base: { attack: number; defense: number; speed: number }) {
    const effects = this.getActiveEffects(entityId);
    return effects.reduce((acc, e) => {
      // Simple modifier: buffs increase attack, debuffs reduce speed
      if (e.type === 'buff') acc.attack += Math.floor(e.magnitude);
      if (e.type === 'debuff') acc.speed = Math.max(0, acc.speed - Math.floor(e.magnitude));
      return acc;
    }, { ...base });
  }

  private initializeDefaultStackingRules() {
    const defaultRules: EffectStackingRule[] = [
      { category: 'poison', rule: 'stack', maxStacks: 5 },
      { category: 'regen', rule: 'extend' },
      { category: 'shield', rule: 'replace' },
      { category: 'stun', rule: 'replace' },
      { category: 'slow', rule: 'stack', maxStacks: 3 },
      { category: 'haste', rule: 'stack', maxStacks: 3 },
      { category: 'burn', rule: 'stack', maxStacks: 10 },
      { category: 'freeze', rule: 'replace' },
      { category: 'charm', rule: 'replace' },
      { category: 'fear', rule: 'stack', maxStacks: 5 }
    ];

    defaultRules.forEach(rule => {
      this.stackingRules.set(rule.category, rule);
    });
  }

  /**
   * Create a new status entity
   */
  createEntity(id: string, maxHp: number, effects: any[] = []): StatusOutput {
    if (this.entities.has(id)) {
      return {
        op: 'create',
        status: 'error',
        issues: [`Entity ${id} already exists`]
      };
    }

    const entity: StatusEntity = {
      id,
      hp: maxHp,
      maxHp,
      effects: [...effects],
      immunities: [],
      resistances: {},
      lastUpdate: Date.now()
    };

    this.entities.set(id, entity);
    return {
      op: 'create',
      status: 'ok',
      result: entity
    };
  }

  /**
   * Apply status effect to entity
   */
  applyEffect(entityId: string, effect: any): StatusOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'apply_effect',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    // Check immunity
    if (entity.immunities.includes(effect.category)) {
      this.recordEvent('immunity_triggered', entityId, effect.id, { category: effect.category });
      return {
        op: 'apply_effect',
        status: 'error',
        issues: [`Entity ${entityId} is immune to ${effect.category} effects`]
      };
    }

    // Apply resistance
    const resistance = entity.resistances[effect.category] || 0;
    const resistanceFactor = 1 - (resistance / 100);
    const finalMagnitude = effect.magnitude * resistanceFactor;
    const finalDuration = Math.floor(effect.duration * resistanceFactor);

    const fullEffect: StatusEffect = {
      ...effect,
      magnitude: finalMagnitude,
      duration: finalDuration,
      appliedAt: Date.now(),
      expiresAt: Date.now() + (finalDuration * 1000),
      currentStacks: 1
    };

    // Handle stacking
    const existingEffect = entity.effects.find(e => e.id === effect.id);
    if (existingEffect) {
      const stackingRule = this.stackingRules.get(effect.category);
      if (stackingRule) {
        switch (stackingRule.rule) {
          case 'replace':
            this.removeEffect(entityId, effect.id);
            break;
          case 'stack':
            if (existingEffect.currentStacks < (stackingRule.maxStacks || 1)) {
              existingEffect.currentStacks++;
              existingEffect.magnitude += effect.magnitude;
              existingEffect.duration = Math.max(existingEffect.duration, effect.duration);
              existingEffect.expiresAt = Date.now() + (existingEffect.duration * 1000);
              this.recordEvent('effect_modified', entityId, effect.id, { stacks: existingEffect.currentStacks });
              return { op: 'apply_effect', status: 'ok', result: entity };
            }
            break;
          case 'extend':
            existingEffect.duration = Math.max(existingEffect.duration, effect.duration);
            existingEffect.expiresAt = Date.now() + (existingEffect.duration * 1000);
            this.recordEvent('effect_modified', entityId, effect.id, { extended: true });
            return { op: 'apply_effect', status: 'ok', result: entity };
          case 'block':
            return {
              op: 'apply_effect',
              status: 'error',
              issues: [`Effect ${effect.id} is blocked by existing effect`]
            };
        }
      }
    }

    entity.effects.push(fullEffect);
    entity.lastUpdate = Date.now();

    this.recordEvent('effect_applied', entityId, effect.id, { category: effect.category, magnitude: finalMagnitude });

    return {
      op: 'apply_effect',
      status: 'ok',
      result: entity
    };
  }

  /**
   * Remove status effect from entity
   */
  removeEffect(): StatusOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'remove_effect',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    const effectIndex = entity.effects.findIndex(e => e.id === effectId);
    if (effectIndex === -1) {
      return {
        op: 'remove_effect',
        status: 'error',
        issues: [`Effect ${effectId} not found on entity ${entityId}`]
      };
    }

    const removedEffect = entity.effects.splice(effectIndex, 1)[0];
    entity.lastUpdate = Date.now();

    this.recordEvent('effect_expired', entityId, effectId, { category: removedEffect.category });

    return {
      op: 'remove_effect',
      status: 'ok',
      result: entity
    };
  }

  /**
   * Simulate status effects for an entity
   */
  simulateEntity(): StatusOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'simulate',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    const result = this.processEntityEffects(entity);
    return {
      op: 'simulate',
      status: 'ok',
      result
    };
  }

  /**
   * Simulate all entities
   */
  simulateAll(): StatusOutput {
    const results: TickResult[] = [];

    for (const [entityId, entity] of this.entities) {
      const result = this.processEntityEffects(entity);
      results.push(result);
    }

    return {
      op: 'simulate_all',
      status: 'ok',
      result: results
    };
  }

  /**
   * Process effects for a specific entity
   */
  processEffects(): StatusOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'process_effects',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    const result = this.processEntityEffects(entity);
    return {
      op: 'process_effects',
      status: 'ok',
      result
    };
  }

  /**
   * Process effects for an entity
   */
  private processEntityEffects(entity: StatusEntity): TickResult {
    const events: StatusEvent[] = [];
    const effectsApplied: StatusEffect[] = [];
    const effectsExpired: StatusEffect[] = [];
    const effectsModified: StatusEffect[] = [];
    let hpDelta = 0;

    const currentTime = Date.now();

    // Process each effect
    for (let i = entity.effects.length - 1; i >= 0; i--) {
      const effect = entity.effects[i];

      // Check if effect has expired
      if (currentTime >= effect.expiresAt) {
        entity.effects.splice(i, 1);
        effectsExpired.push(effect);
        this.recordEvent('effect_expired', entity.id, effect.id, { category: effect.category });
        continue;
      }

      // Apply effect based on category
      switch (effect.category) {
        case 'poison':
          hpDelta -= effect.magnitude * effect.currentStacks;
          break;
        case 'regen':
          hpDelta += effect.magnitude * effect.currentStacks;
          break;
        case 'burn':
          hpDelta -= effect.magnitude * effect.currentStacks;
          break;
        case 'shield':
          // Shield effects are handled separately
          break;
        case 'stun':
          // Stun effects prevent actions
          break;
        case 'slow':
          // Slow effects reduce movement speed
          break;
        case 'haste':
          // Haste effects increase movement speed
          break;
        case 'freeze':
          // Freeze effects prevent movement and actions
          break;
        case 'charm':
          // Charm effects change AI behavior
          break;
        case 'fear':
          // Fear effects cause fleeing behavior
          break;
      }

      // Reduce duration
      effect.duration = Math.max(0, effect.duration - 1);
    }

    // Apply HP changes
    const oldHp = entity.hp;
    entity.hp = Math.max(0, Math.min(entity.maxHp, entity.hp + hpDelta));
    entity.lastUpdate = currentTime;

    // Check for death/revival
    if (oldHp > 0 && entity.hp <= 0) {
      this.recordEvent('entity_died', entity.id, undefined, { hp: entity.hp });
    } else if (oldHp <= 0 && entity.hp > 0) {
      this.recordEvent('entity_revived', entity.id, undefined, { hp: entity.hp });
    }

    return {
      entityId: entity.id,
      hpDelta,
      newHp: entity.hp,
      effectsApplied,
      effectsExpired,
      effectsModified,
      events
    };
  }

  /**
   * Get entity by ID
   */
  getEntity(): StatusOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'get',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    return {
      op: 'get',
      status: 'ok',
      result: entity
    };
  }

  /**
   * List all entities
   */
  listEntities(): StatusOutput {
    let entities = Array.from(this.entities.values());

    if (filter) {
      entities = entities.filter(entity => {
        if (filter.category && !entity.effects.some(e => e.category === filter.category)) return false;
        if (filter.type && !entity.effects.some(e => e.type === filter.type)) return false;
        if (filter.minHp !== undefined && entity.hp < filter.minHp) return false;
        if (filter.maxHp !== undefined && entity.hp > filter.maxHp) return false;
        if (filter.hasEffects !== undefined) {
          const hasEffects = entity.effects.length > 0;
          if (filter.hasEffects !== hasEffects) return false;
        }
        if (filter.isDead !== undefined) {
          const isDead = entity.hp <= 0;
          if (filter.isDead !== isDead) return false;
        }
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
   * Get status statistics
   */
  getStatusStats(): StatusOutput {
    const entities = Array.from(this.entities.values());
    const allEffects = entities.flatMap(e => e.effects);
    
    const stats: StatusStats = {
      totalEntities: entities.length,
      entitiesWithEffects: entities.filter(e => e.effects.length > 0).length,
      totalEffects: allEffects.length,
      effectDistribution: {},
      averageHp: 0,
      deadEntities: entities.filter(e => e.hp <= 0).length,
      mostCommonEffect: ''
    };

    if (entities.length > 0) {
      const totalHp = entities.reduce((sum, e) => sum + e.hp, 0);
      stats.averageHp = totalHp / entities.length;
    }

    // Calculate effect distribution
    allEffects.forEach(effect => {
      stats.effectDistribution[effect.category] = (stats.effectDistribution[effect.category] || 0) + 1;
    });

    // Find most common effect
    const sortedEffects = Object.entries(stats.effectDistribution)
      .sort(([,a], [,b]) => b - a);
    stats.mostCommonEffect = sortedEffects[0]?.[0] || '';

    return {
      op: 'stats',
      status: 'ok',
      result: stats
    };
  }

  /**
   * Add immunity to entity
   */
  addImmunity(): StatusOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'add_immunity',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    if (!entity.immunities.includes(category)) {
      entity.immunities.push(category);
      entity.lastUpdate = Date.now();
    }

    return {
      op: 'add_immunity',
      status: 'ok',
      result: entity
    };
  }

  /**
   * Add resistance to entity
   */
  addResistance(): StatusOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'add_resistance',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    entity.resistances[category] = Math.min(100, (entity.resistances[category] || 0) + percentage);
    entity.lastUpdate = Date.now();

    return {
      op: 'add_resistance',
      status: 'ok',
      result: entity
    };
  }

  /**
   * Export status data
   */
  exportStatus(): StatusOutput {
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
            schema: 'miff.status.export.v1',
            entities,
            events: this.events.slice(-100), // Last 100 events
            stackingRules: Array.from(this.stackingRules.entries()),
            exportedAt: new Date().toISOString(),
            total: entities.length
          }
        };
      
      case 'summary':
        const stats = this.getStatusStats();
        return {
          op: 'export',
          status: 'ok',
          result: {
            summary: stats.result,
            entities: entities.map(entity => ({
              id: entity.id,
              hp: entity.hp,
              maxHp: entity.maxHp,
              effectCount: entity.effects.length,
              immunities: entity.immunities,
              resistances: entity.resistances
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
   * Reset all status data
   */
  resetStatus(): StatusOutput {
    this.entities.clear();
    this.events = [];
    this.initializeDefaultStackingRules();
    return {
      op: 'reset',
      status: 'ok',
      result: { message: 'All status data reset' }
    };
  }

  /**
   * Record status event
   */
  private recordEvent(type: StatusEvent['type'], entityId: string, effectId?: string, data?: Record<string, any>): void {
    const event: StatusEvent = {
      type,
      entityId,
      effectId,
      timestamp: Date.now(),
      data
    };
    this.events.push(event);
  }
}