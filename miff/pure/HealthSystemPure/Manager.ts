/**
 * HealthSystemPure Manager
 * 
 * Advanced health system including damage/healing, status effects,
 * regeneration, shields, and comprehensive health management.
 */

export interface HealthEntity {
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
  type: 'physical' | 'magical' | 'elemental' | 'all';
  amount: number;
  maxAmount: number;
  absorption: number; // percentage of damage absorbed
  duration?: number; // -1 for permanent
  expiresAt?: number;
  metadata?: Record<string, any>;
}

export interface RegenerationEffect {
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
  type: 'hp' | 'shield' | 'both';
  amount: number; // per second
  duration: number; // seconds
  interval: number; // seconds between ticks
  lastTick: number;
  expiresAt: number;
  metadata?: Record<string, any>;
}

export interface HealthEvent {
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
  type: 'damage' | 'heal' | 'shield' | 'regeneration' | 'immunity' | 'resistance';
  amount: number;
  source: string;
  target: string;
  damageType?: 'physical' | 'magical' | 'elemental' | 'pure';
  element?: 'fire' | 'ice' | 'lightning' | 'poison' | 'holy' | 'dark';
  metadata?: Record<string, any>;
}

export interface HealthOutput {
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

export interface DamageResult {
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
  damageDealt: number;
  damageAbsorbed: number;
  damageBlocked: number;
  criticalHit: boolean;
  resisted: boolean;
  immuned: boolean;
}

export class HealthSystemPure {
  private entities: Map<string, HealthEntity> = new Map();
  private events: HealthEvent[] = [];
  private maxEvents: number = 1000;

  constructor(...args: any[]) {
    // Initialize the health system
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
      currentHp: options.currentHp ?? maxHp,
      shields: options.shields ?? [],
      regeneration: [],
      immunities: options.immunities ?? [],
      resistances: options.resistances ?? {},
      lastUpdate: Date.now(),
      metadata: {}
    };

    this.entities.set(id, entity);

    return {
      op: 'create',
      status: 'ok',
      result: entity
    };
  }

  /**
   * Get entity health information
   */
  getEntity(): HealthOutput {
    const entity = this.entities.get(id);
    if (!entity) {
      return {
        op: 'get-entity',
        status: 'error',
        issues: [`Entity ${id} not found`]
      };
    }

    return {
      op: 'get-entity',
      status: 'ok',
      result: entity
    };
  }

  /**
   * Deal damage to an entity
   */
  dealDamage(): HealthOutput {
    const entity = this.entities.get(targetId);
    if (!entity) {
      return {
        op: 'damage',
        status: 'error',
        issues: [`Entity ${targetId} not found`]
      };
    }

    // Check immunity
    if (entity.immunities.includes(damageType) || (element && entity.immunities.includes(element))) {
      this.addEvent({
        id: `immunity-${Date.now()}`,
        type: 'immunity',
        amount: 0,
        source: 'system',
        target: targetId,
        damageType,
        element,
        timestamp: Date.now()
      });

      return {
        op: 'damage',
        status: 'ok',
        result: {
          damageDealt: 0,
          damageAbsorbed: 0,
          damageBlocked: amount,
          criticalHit: false,
          resisted: false,
          immuned: true
        }
      };
    }

    // Apply resistance
    let finalAmount = amount;
    const resistance = entity.resistances[damageType] || 0;
    if (resistance > 0) {
      finalAmount = Math.max(0, amount * (1 - resistance / 100));
    }

    // Apply shields
    let damageDealt = finalAmount;
    let damageAbsorbed = 0;
    const remainingShields = [...entity.shields];

    for (const shield of remainingShields) {
      if (shield.amount <= 0) continue;
      if (shield.type !== 'all' && shield.type !== damageType) continue;

      const absorbed = Math.min(shield.amount, damageDealt * (shield.absorption / 100));
      shield.amount -= absorbed;
      damageDealt -= absorbed;
      damageAbsorbed += absorbed;

      if (shield.amount <= 0) {
        const index = entity.shields.indexOf(shield);
        if (index > -1) {
          entity.shields.splice(index, 1);
        }
      }
    }

    // Apply damage to HP
    entity.currentHp = Math.max(0, entity.currentHp - damageDealt);
    entity.lastUpdate = Date.now();

    // Add event
    this.addEvent({
      id: `damage-${Date.now()}`,
      type: 'damage',
      amount: damageDealt,
      source: 'system',
      target: targetId,
      damageType,
      element,
      timestamp: Date.now()
    });

    return {
      op: 'damage',
      status: 'ok',
      result: {
        damageDealt,
        damageAbsorbed,
        damageBlocked: finalAmount - damageDealt,
        criticalHit: false,
        resisted: resistance > 0,
        immuned: false
      }
    };
  }

  /**
   * Heal an entity
   */
  heal(): HealthOutput {
    const entity = this.entities.get(targetId);
    if (!entity) {
      return {
        op: 'heal',
        status: 'error',
        issues: [`Entity ${targetId} not found`]
      };
    }

    const oldHp = entity.currentHp;
    entity.currentHp = Math.min(entity.maxHp, entity.currentHp + amount);
    entity.lastUpdate = Date.now();

    const actualHealing = entity.currentHp - oldHp;

    this.addEvent({
      id: `heal-${Date.now()}`,
      type: 'heal',
      amount: actualHealing,
      source: 'system',
      target: targetId,
      timestamp: Date.now()
    });

    return {
      op: 'heal',
      status: 'ok',
      result: {
        healing: actualHealing,
        currentHp: entity.currentHp,
        maxHp: entity.maxHp
      }
    };
  }

  /**
   * Add shield to entity
   */
  addShield(): HealthOutput {
    const entity = this.entities.get(targetId);
    if (!entity) {
      return {
        op: 'add-shield',
        status: 'error',
        issues: [`Entity ${targetId} not found`]
      };
    }

    const newShield = {
      ...shield,
      expiresAt: shield.duration && shield.duration > 0 ? Date.now() + shield.duration * 1000 : undefined
    };

    entity.shields.push(newShield);
    entity.lastUpdate = Date.now();

    this.addEvent({
      id: `shield-${Date.now()}`,
      type: 'shield',
      amount: shield.amount,
      source: 'system',
      target: targetId,
      timestamp: Date.now()
    });

    return {
      op: 'add-shield',
      status: 'ok',
      result: newShield
    };
  }

  /**
   * Add regeneration effect
   */
  addRegeneration(): HealthOutput {
    const entity = this.entities.get(targetId);
    if (!entity) {
      return {
        op: 'add-regeneration',
        status: 'error',
        issues: [`Entity ${targetId} not found`]
      };
    }

    const newRegen = {
      ...regeneration,
      lastTick: Date.now(),
      expiresAt: Date.now() + regeneration.duration * 1000
    };

    entity.regeneration.push(newRegen);
    entity.lastUpdate = Date.now();

    return {
      op: 'add-regeneration',
      status: 'ok',
      result: newRegen
    };
  }

  /**
   * Update all entities (call this regularly)
   */
  update(): HealthOutput {
    const now = Date.now();
    let updatedCount = 0;

    for (const entity of this.entities.values()) {
//       const dt = (now - entity.lastUpdate) / 1000; // Convert to seconds
      
      // Update regeneration
      for (let i = entity.regeneration.length - 1; i >= 0; i--) {
        const regen = entity.regeneration[i];
        
        // Check if expired
        if (now >= regen.expiresAt) {
          entity.regeneration.splice(i, 1);
          continue;
        }

        // Check if it's time for a tick
        if (now - regen.lastTick >= regen.interval * 1000) {
          if (regen.type === 'hp' || regen.type === 'both') {
            this.heal(entity.id, regen.amount * regen.interval);
          }
          
          if (regen.type === 'shield' || regen.type === 'both') {
            // Add shield regeneration
            for (const shield of entity.shields) {
              if (shield.amount < shield.maxAmount) {
                shield.amount = Math.min(shield.maxAmount, shield.amount + regen.amount * regen.interval);
              }
            }
          }

          regen.lastTick = now;
          updatedCount++;
        }
      }

      // Update shields
      for (let i = entity.shields.length - 1; i >= 0; i--) {
        const shield = entity.shields[i];
        if (shield.expiresAt && now >= shield.expiresAt) {
          entity.shields.splice(i, 1);
        }
      }

      entity.lastUpdate = now;
    }

    return {
      op: 'update',
      status: 'ok',
      result: { updatedEntities: updatedCount }
    };
  }

  /**
   * Get all events
   */
  getEvents(limit?: number): HealthEvent[] {
    const events = this.events.slice(-(limit || this.maxEvents));
    return events.reverse();
  }

  /**
   * Clear events
   */
  clearEvents(): HealthOutput {
    const count = this.events.length;
    this.events = [];
    
    return {
      op: 'clear-events',
      status: 'ok',
      result: { cleared: count }
    };
  }

  /**
   * Remove entity
   */
  removeEntity(): HealthOutput {
    if (!this.entities.has(id)) {
      return {
        op: 'remove-entity',
        status: 'error',
        issues: [`Entity ${id} not found`]
      };
    }

    this.entities.delete(id);
    
    return {
      op: 'remove-entity',
      status: 'ok',
      result: { removed: id }
    };
  }

  /**
   * Get all entities
   */
  getAllEntities(): HealthEntity[] {
    return Array.from(this.entities.values());
  }

  /**
   * Check if entity is alive
   */
  isAlive(): boolean {
    const entity = this.entities.get(id);
    return entity ? entity.currentHp > 0 : false;
  }

  /**
   * Get entity health percentage
   */
  getHealthPercentage(): number {
    const entity = this.entities.get(id);
    if (!entity) return 0;
    return (entity.currentHp / entity.maxHp) * 100;
  }

  /**
   * Add event to the event log
   */
  private addEvent(event: HealthEvent): void {
    this.events.push(event);
    
    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }
}