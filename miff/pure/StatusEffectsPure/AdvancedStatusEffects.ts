/**
 * Advanced Status Effects System
 * 
 * Enhanced status effects with complex interactions, 
 * effect chains, and advanced mechanics.
 */

import { StatusEffect, StatusEntity, EffectStackingRule, TickResult, StatusEvent } from './StatusEffectsManager';

export interface EffectChain {
  id: string;
  name: string;
  effects: string[];
  triggers: EffectTrigger[];
  conditions: EffectCondition[];
  rewards: EffectReward[];
}

export interface EffectTrigger {
  id: string;
  type: 'on_apply' | 'on_tick' | 'on_remove' | 'on_damage' | 'on_heal' | 'on_kill' | 'on_death';
  condition: (context: EffectContext) => boolean;
  action: (context: EffectContext) => void;
  probability?: number;
}

export interface EffectCondition {
  id: string;
  type: 'health_threshold' | 'effect_count' | 'time_elapsed' | 'damage_dealt' | 'custom';
  value: any;
  operator: 'equals' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal';
  check: (context: EffectContext) => boolean;
}

export interface EffectReward {
  id: string;
  type: 'stat_boost' | 'effect_immunity' | 'damage_reduction' | 'healing' | 'custom';
  magnitude: number;
  duration?: number;
  apply: (context: EffectContext) => void;
}

export interface EffectContext {
  entity: StatusEntity;
  effect: StatusEffect;
  allEffects: StatusEffect[];
  damage?: number;
  healing?: number;
  timestamp: number;
  metadata?: any;
}

export interface EffectInteraction {
  id: string;
  effect1: string;
  effect2: string;
  interaction: 'synergy' | 'conflict' | 'cancellation' | 'enhancement' | 'transformation';
  modifier: number;
  description: string;
}

export interface EffectAura {
  id: string;
  name: string;
  radius: number;
  effects: StatusEffect[];
  conditions: EffectCondition[];
  duration: number;
  tickInterval: number;
}

export class AdvancedStatusEffects {
  private effectChains: Map<string, EffectChain> = new Map();
  private effectInteractions: Map<string, EffectInteraction> = new Map();
  private effectAuras: Map<string, EffectAura> = new Map();
  private globalEffects: Map<string, StatusEffect> = new Map();
  private effectHistory: Map<string, StatusEvent[]> = new Map();

  constructor() {
    this.initializeDefaultChains();
    this.initializeDefaultInteractions();
    this.initializeDefaultAuras();
  }

  /**
   * Create a new effect chain
   */
  createEffectChain(chain: EffectChain): void {
    this.effectChains.set(chain.id, chain);
  }

  /**
   * Apply an effect chain to an entity
   */
  async applyEffectChain(entityId: string, chainId: string, context: any): Promise<boolean> {
    const chain = this.effectChains.get(chainId);
    if (!chain) {
      throw new Error(`Effect chain ${chainId} not found`);
    }

    // Check if all conditions are met
    for (const condition of chain.conditions) {
      if (!condition.check({ ...context, entityId })) {
        return false;
      }
    }

    // Apply all effects in the chain
    for (const effectId of chain.effects) {
      // This would integrate with the main StatusEffectsManager
      // await this.statusManager.applyEffect(entityId, effectId);
    }

    // Set up triggers
    for (const trigger of chain.triggers) {
      this.setupTrigger(entityId, trigger);
    }

    return true;
  }

  /**
   * Create an effect interaction
   */
  createEffectInteraction(interaction: EffectInteraction): void {
    const key = `${interaction.effect1}-${interaction.effect2}`;
    this.effectInteractions.set(key, interaction);
  }

  /**
   * Check for effect interactions
   */
  checkEffectInteractions(effects: StatusEffect[]): EffectInteraction[] {
    const interactions: EffectInteraction[] = [];

    for (let i = 0; i < effects.length; i++) {
      for (let j = i + 1; j < effects.length; j++) {
        const effect1 = effects[i];
        const effect2 = effects[j];
        
        const key1 = `${effect1.id}-${effect2.id}`;
        const key2 = `${effect2.id}-${effect1.id}`;
        
        const interaction = this.effectInteractions.get(key1) || this.effectInteractions.get(key2);
        if (interaction) {
          interactions.push(interaction);
        }
      }
    }

    return interactions;
  }

  /**
   * Apply effect interactions
   */
  applyEffectInteractions(entity: StatusEntity, interactions: EffectInteraction[]): void {
    for (const interaction of interactions) {
      switch (interaction.interaction) {
        case 'synergy':
          this.applySynergy(entity, interaction);
          break;
        case 'conflict':
          this.applyConflict(entity, interaction);
          break;
        case 'cancellation':
          this.applyCancellation(entity, interaction);
          break;
        case 'enhancement':
          this.applyEnhancement(entity, interaction);
          break;
        case 'transformation':
          this.applyTransformation(entity, interaction);
          break;
      }
    }
  }

  /**
   * Create an effect aura
   */
  createEffectAura(aura: EffectAura): void {
    this.effectAuras.set(aura.id, aura);
  }

  /**
   * Apply an effect aura
   */
  applyEffectAura(auraId: string, centerEntity: StatusEntity, entities: StatusEntity[]): void {
    const aura = this.effectAuras.get(auraId);
    if (!aura) {
      throw new Error(`Effect aura ${auraId} not found`);
    }

    const affectedEntities = entities.filter(entity => {
      const distance = this.calculateDistance(centerEntity, entity);
      return distance <= aura.radius;
    });

    for (const entity of affectedEntities) {
      // Check aura conditions with full EffectContext shape
      const context = { entity, effect: aura.effects[0] as any, allEffects: aura.effects, timestamp: Date.now() } as EffectContext;
      const conditionsMet = aura.conditions.every(condition => condition.check(context));

      if (conditionsMet) {
        // Apply aura effects
        for (const effect of aura.effects) {
          // This would integrate with the main StatusEffectsManager
          // await this.statusManager.applyEffect(entity.id, effect);
        }
      }
    }
  }

  /**
   * Set up an effect trigger
   */
  private setupTrigger(entityId: string, trigger: EffectTrigger): void {
    // This would integrate with the main StatusEffectsManager's event system
    // The trigger would be registered and called when the appropriate event occurs
  }

  /**
   * Apply synergy between effects
   */
  private applySynergy(entity: StatusEntity, interaction: EffectInteraction): void {
    // Increase the magnitude of both effects
    const effect1 = entity.effects.find(e => e.id === interaction.effect1);
    const effect2 = entity.effects.find(e => e.id === interaction.effect2);

    if (effect1) {
      effect1.magnitude *= (1 + interaction.modifier);
    }
    if (effect2) {
      effect2.magnitude *= (1 + interaction.modifier);
    }
  }

  /**
   * Apply conflict between effects
   */
  private applyConflict(entity: StatusEntity, interaction: EffectInteraction): void {
    // Reduce the effectiveness of both effects
    const effect1 = entity.effects.find(e => e.id === interaction.effect1);
    const effect2 = entity.effects.find(e => e.id === interaction.effect2);

    if (effect1) {
      effect1.magnitude *= (1 - interaction.modifier);
    }
    if (effect2) {
      effect2.magnitude *= (1 - interaction.modifier);
    }
  }

  /**
   * Apply cancellation between effects
   */
  private applyCancellation(entity: StatusEntity, interaction: EffectInteraction): void {
    // Remove one of the effects
    const effect1Index = entity.effects.findIndex(e => e.id === interaction.effect1);
    const effect2Index = entity.effects.findIndex(e => e.id === interaction.effect2);

    if (effect1Index !== -1 && effect2Index !== -1) {
      // Remove the effect with lower magnitude
      if (entity.effects[effect1Index].magnitude < entity.effects[effect2Index].magnitude) {
        entity.effects.splice(effect1Index, 1);
      } else {
        entity.effects.splice(effect2Index, 1);
      }
    }
  }

  /**
   * Apply enhancement between effects
   */
  private applyEnhancement(entity: StatusEntity, interaction: EffectInteraction): void {
    // Enhance one effect based on the other
    const effect1 = entity.effects.find(e => e.id === interaction.effect1);
    const effect2 = entity.effects.find(e => e.id === interaction.effect2);

    if (effect1 && effect2) {
      effect1.magnitude += effect2.magnitude * interaction.modifier;
    }
  }

  /**
   * Apply transformation between effects
   */
  private applyTransformation(entity: StatusEntity, interaction: EffectInteraction): void {
    // Transform one effect into another
    const effect1Index = entity.effects.findIndex(e => e.id === interaction.effect1);
    const effect2 = entity.effects.find(e => e.id === interaction.effect2);

    if (effect1Index !== -1 && effect2) {
      // Transform effect1 into a modified version of effect2
      const transformedEffect = {
        ...effect2,
        id: `${effect2.id}_transformed`,
        magnitude: effect2.magnitude * interaction.modifier
      };

      entity.effects[effect1Index] = transformedEffect;
    }
  }

  /**
   * Calculate distance between entities
   */
  private calculateDistance(entity1: StatusEntity, entity2: StatusEntity): number {
    // This would use actual position data if available
    // For now, return a random distance for demonstration
    return Math.random() * 10;
  }

  /**
   * Initialize default effect chains
   */
  private initializeDefaultChains(): void {
    // Poison chain
    this.createEffectChain({
      id: 'poison_chain',
      name: 'Poison Chain',
      effects: ['poison', 'weakness', 'fatigue'],
      triggers: [
        {
          id: 'poison_damage',
          type: 'on_tick',
          condition: (context) => context.effect.category === 'poison',
          action: (context) => {
            // Apply poison damage
          }
        }
      ],
      conditions: [
        {
          id: 'health_threshold',
          type: 'health_threshold',
          value: 0.5,
          operator: 'less_than',
          check: (context) => context.entity.hp < context.entity.maxHp * 0.5
        }
      ],
      rewards: []
    });

    // Regeneration chain
    this.createEffectChain({
      id: 'regen_chain',
      name: 'Regeneration Chain',
      effects: ['regeneration', 'vitality', 'endurance'],
      triggers: [
        {
          id: 'regen_heal',
          type: 'on_tick',
          condition: (context) => context.effect.category === 'regen',
          action: (context) => {
            // Apply healing
          }
        }
      ],
      conditions: [
        {
          id: 'not_full_health',
          type: 'health_threshold',
          value: 1.0,
          operator: 'less_than',
          check: (context) => context.entity.hp < context.entity.maxHp
        }
      ],
      rewards: []
    });
  }

  /**
   * Initialize default effect interactions
   */
  private initializeDefaultInteractions(): void {
    // Fire and Ice interaction
    this.createEffectInteraction({
      id: 'fire_ice_conflict',
      effect1: 'burn',
      effect2: 'freeze',
      interaction: 'cancellation',
      modifier: 0.5,
      description: 'Fire and ice effects cancel each other out'
    });

    // Poison and Regeneration interaction
    this.createEffectInteraction({
      id: 'poison_regen_conflict',
      effect1: 'poison',
      effect2: 'regeneration',
      interaction: 'conflict',
      modifier: 0.3,
      description: 'Poison reduces regeneration effectiveness'
    });

    // Shield and Protection interaction
    this.createEffectInteraction({
      id: 'shield_protection_synergy',
      effect1: 'shield',
      effect2: 'protection',
      interaction: 'synergy',
      modifier: 0.2,
      description: 'Shield and protection effects work together'
    });
  }

  /**
   * Initialize default effect auras
   */
  private initializeDefaultAuras(): void {
    // Healing aura
    this.createEffectAura({
      id: 'healing_aura',
      name: 'Healing Aura',
      radius: 5,
      effects: [
        {
          id: 'aura_heal',
          name: 'Aura Healing',
          type: 'buff',
          category: 'regen',
          magnitude: 2,
          duration: 1,
          stackable: false,
          maxStacks: 1,
          currentStacks: 1,
          source: 'aura',
          appliedAt: Date.now(),
          expiresAt: Date.now() + 1000
        }
      ],
      conditions: [
        {
          id: 'ally_condition',
          type: 'custom',
          value: 'ally',
          operator: 'equals',
          check: (context) => context.entity.metadata?.type === 'ally'
        }
      ],
      duration: 10000,
      tickInterval: 1000
    });

    // Damage aura
    this.createEffectAura({
      id: 'damage_aura',
      name: 'Damage Aura',
      radius: 3,
      effects: [
        {
          id: 'aura_damage',
          name: 'Aura Damage',
          type: 'debuff',
          category: 'burn',
          magnitude: 1,
          duration: 1,
          stackable: false,
          maxStacks: 1,
          currentStacks: 1,
          source: 'aura',
          appliedAt: Date.now(),
          expiresAt: Date.now() + 1000
        }
      ],
      conditions: [
        {
          id: 'enemy_condition',
          type: 'custom',
          value: 'enemy',
          operator: 'equals',
          check: (context) => context.entity.metadata?.type === 'enemy'
        }
      ],
      duration: 15000,
      tickInterval: 2000
    });
  }

  /**
   * Get effect chain
   */
  getEffectChain(chainId: string): EffectChain | null {
    return this.effectChains.get(chainId) || null;
  }

  /**
   * Get all effect chains
   */
  getAllEffectChains(): EffectChain[] {
    return Array.from(this.effectChains.values());
  }

  /**
   * Get effect interaction
   */
  getEffectInteraction(effect1: string, effect2: string): EffectInteraction | null {
    const key1 = `${effect1}-${effect2}`;
    const key2 = `${effect2}-${effect1}`;
    return this.effectInteractions.get(key1) || this.effectInteractions.get(key2) || null;
  }

  /**
   * Get effect aura
   */
  getEffectAura(auraId: string): EffectAura | null {
    return this.effectAuras.get(auraId) || null;
  }

  /**
   * Get all effect auras
   */
  getAllEffectAuras(): EffectAura[] {
    return Array.from(this.effectAuras.values());
  }

  /**
   * Get effect statistics
   */
  getEffectStatistics(): any {
    return {
      chains: this.effectChains.size,
      interactions: this.effectInteractions.size,
      auras: this.effectAuras.size,
      globalEffects: this.globalEffects.size
    };
  }
}