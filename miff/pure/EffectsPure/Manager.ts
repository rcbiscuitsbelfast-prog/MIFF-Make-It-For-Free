/**
 * EffectsPure Manager - Status Effects Management System
 *
 * Comprehensive status effects management with:
 * - Battle effects (buffs, debuffs, damage over time)
 * - Environmental effects
 * - Temporary effects with duration
 * - Effect stacking and interaction
 * - Performance optimization
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

export interface EffectConfig {
  id: string;
  name: string;
  description: string;
  type: EffectType;
  category: EffectCategory;
  duration: number;
  maxStacks: number;
  stackType: StackType;
  priority: number;
  canDispel: boolean;
  canRefresh: boolean;
  canExtend: boolean;
  isHidden: boolean;
  isPermanent: boolean;
  icon: string;
  color: [number, number, number, number];
}

export enum EffectType {
  BUFF = 'buff',
  DEBUFF = 'debuff',
  DAMAGE_OVER_TIME = 'damage_over_time',
  HEAL_OVER_TIME = 'heal_over_time',
  SHIELD = 'shield',
  STUN = 'stun',
  SILENCE = 'silence',
  SLOW = 'slow',
  HASTE = 'haste',
  INVISIBILITY = 'invisibility',
  IMMUNITY = 'immunity',
  REFLECT = 'reflect',
  ABSORB = 'absorb',
  TRANSFORM = 'transform',
  CUSTOM = 'custom'
}

export enum EffectCategory {
  COMBAT = 'combat',
  ENVIRONMENTAL = 'environmental',
  MAGICAL = 'magical',
  PHYSICAL = 'physical',
  MENTAL = 'mental',
  TEMPORAL = 'temporal',
  ELEMENTAL = 'elemental',
  DIVINE = 'divine',
  CURSED = 'cursed',
  BLESSED = 'blessed'
}

export enum StackType {
  NONE = 'none',
  ADDITIVE = 'additive',
  MULTIPLICATIVE = 'multiplicative',
  REPLACE = 'replace',
  REFRESH = 'refresh',
  EXTEND = 'extend'
}

export interface EffectInstance {
  id: string;
  config: EffectConfig;
  targetId: string;
  casterId: string;
  stacks: number;
  duration: number;
  maxDuration: number;
  startTime: number;
  lastTick: number;
  tickInterval: number;
  isActive: boolean;
  isPaused: boolean;
  metadata: Map<string, any>;
  modifiers: EffectModifier[];
}

export interface EffectModifier {
  stat: string;
  type: ModifierType;
  value: number;
  isPercentage: boolean;
  isFlat: boolean;
  condition?: string;
}

export enum ModifierType {
  ADD = 'add',
  SUBTRACT = 'subtract',
  MULTIPLY = 'multiply',
  DIVIDE = 'divide',
  SET = 'set',
  MIN = 'min',
  MAX = 'max',
  PERCENTAGE = 'percentage',
  FLAT = 'flat'
}

export interface EffectTrigger {
  id: string;
  effectId: string;
  triggerType: TriggerType;
  condition: string;
  probability: number;
  cooldown: number;
  lastTriggered: number;
  isActive: boolean;
}

export enum TriggerType {
  ON_APPLY = 'on_apply',
  ON_REMOVE = 'on_remove',
  ON_TICK = 'on_tick',
  ON_DAMAGE = 'on_damage',
  ON_HEAL = 'on_heal',
  ON_ATTACK = 'on_attack',
  ON_DEFEND = 'on_defend',
  ON_MOVE = 'on_move',
  ON_DEATH = 'on_death',
  ON_REVIVE = 'on_revive',
  ON_CRITICAL = 'on_critical',
  ON_MISS = 'on_miss',
  ON_BLOCK = 'on_block',
  ON_DODGE = 'on_dodge',
  ON_PARRY = 'on_parry',
  CUSTOM = 'custom'
}

export interface EffectInteraction {
  id: string;
  effectA: string;
  effectB: string;
  interactionType: InteractionType;
  result: string;
  priority: number;
  isActive: boolean;
}

export enum InteractionType {
  CANCEL = 'cancel',
  REPLACE = 'replace',
  MERGE = 'merge',
  AMPLIFY = 'amplify',
  REDUCE = 'reduce',
  TRANSFORM = 'transform',
  BLOCK = 'block',
  ALLOW = 'allow'
}

export interface EffectStats {
  totalEffects: number;
  activeEffects: number;
  buffs: number;
  debuffs: number;
  damageOverTime: number;
  healOverTime: number;
  shields: number;
  stuns: number;
  silences: number;
  customEffects: number;
  averageDuration: number;
  totalStacks: number;
  effectInteractions: number;
  triggersFired: number;
  dispels: number;
  refreshes: number;
  extensions: number;
}

export class EffectsManager {
  private configs: Map<string, EffectConfig> = new Map();
  private instances: Map<string, EffectInstance> = new Map();
  private triggers: Map<string, EffectTrigger> = new Map();
  private interactions: Map<string, EffectInteraction> = new Map();
  private stats: EffectStats = this.initializeStats();
  private isInitialized: boolean = false;

  constructor() {
    this.initializeDefaultEffects();
    this.initializeDefaultInteractions();
    this.isInitialized = true;
  }

  /**
   * Initialize default effects
   */
  private initializeDefaultEffects(): void {
    const defaultEffects = [
      this.createStrengthBuff(),
      this.createWeaknessDebuff(),
      this.createPoisonDoT(),
      this.createRegenerationHoT(),
      this.createShieldEffect(),
      this.createStunEffect(),
      this.createSilenceEffect(),
      this.createSlowEffect(),
      this.createHasteEffect(),
      this.createInvisibilityEffect(),
      this.createImmunityEffect(),
      this.createReflectEffect(),
      this.createAbsorbEffect(),
      this.createTransformEffect()
    ];

    for (const effect of defaultEffects) {
      this.configs.set(effect.id, effect);
    }
  }

  /**
   * Initialize default interactions
   */
  private initializeDefaultInteractions(): void {
    const defaultInteractions = [
      this.createStrengthWeaknessInteraction(),
      this.createPoisonRegenerationInteraction(),
      this.createShieldDamageInteraction(),
      this.createStunSilenceInteraction(),
      this.createSlowHasteInteraction(),
      this.createInvisibilityDetectionInteraction()
    ];

    for (const interaction of defaultInteractions) {
      this.interactions.set(interaction.id, interaction);
    }
  }

  /**
   * Create strength buff effect
   */
  private createStrengthBuff(): EffectConfig {
    return {
      id: 'strength_buff',
      name: 'Strength',
      description: 'Increases physical attack power',
      type: EffectType.BUFF,
      category: EffectCategory.PHYSICAL,
      duration: 30,
      maxStacks: 5,
      stackType: StackType.ADDITIVE,
      priority: 10,
      canDispel: true,
      canRefresh: true,
      canExtend: true,
      isHidden: false,
      isPermanent: false,
      icon: 'strength_icon',
      color: [1, 0.8, 0, 1]
    };
  }

  /**
   * Create weakness debuff effect
   */
  private createWeaknessDebuff(): EffectConfig {
    return {
      id: 'weakness_debuff',
      name: 'Weakness',
      description: 'Decreases physical attack power',
      type: EffectType.DEBUFF,
      category: EffectCategory.PHYSICAL,
      duration: 20,
      maxStacks: 3,
      stackType: StackType.ADDITIVE,
      priority: 10,
      canDispel: true,
      canRefresh: true,
      canExtend: true,
      isHidden: false,
      isPermanent: false,
      icon: 'weakness_icon',
      color: [0.8, 0.2, 0.2, 1]
    };
  }

  /**
   * Create poison damage over time effect
   */
  private createPoisonDoT(): EffectConfig {
    return {
      id: 'poison_dot',
      name: 'Poison',
      description: 'Deals damage over time',
      type: EffectType.DAMAGE_OVER_TIME,
      category: EffectCategory.ELEMENTAL,
      duration: 15,
      maxStacks: 1,
      stackType: StackType.REFRESH,
      priority: 5,
      canDispel: true,
      canRefresh: true,
      canExtend: false,
      isHidden: false,
      isPermanent: false,
      icon: 'poison_icon',
      color: [0.2, 0.8, 0.2, 1]
    };
  }

  /**
   * Create regeneration heal over time effect
   */
  private createRegenerationHoT(): EffectConfig {
    return {
      id: 'regeneration_hot',
      name: 'Regeneration',
      description: 'Restores health over time',
      type: EffectType.HEAL_OVER_TIME,
      category: EffectCategory.DIVINE,
      duration: 20,
      maxStacks: 1,
      stackType: StackType.REFRESH,
      priority: 5,
      canDispel: true,
      canRefresh: true,
      canExtend: false,
      isHidden: false,
      isPermanent: false,
      icon: 'regeneration_icon',
      color: [0.2, 0.8, 0.8, 1]
    };
  }

  /**
   * Create shield effect
   */
  private createShieldEffect(): EffectConfig {
    return {
      id: 'shield',
      name: 'Shield',
      description: 'Absorbs incoming damage',
      type: EffectType.SHIELD,
      category: EffectCategory.MAGICAL,
      duration: 60,
      maxStacks: 1,
      stackType: StackType.ADDITIVE,
      priority: 15,
      canDispel: true,
      canRefresh: true,
      canExtend: true,
      isHidden: false,
      isPermanent: false,
      icon: 'shield_icon',
      color: [0.2, 0.2, 0.8, 1]
    };
  }

  /**
   * Create stun effect
   */
  private createStunEffect(): EffectConfig {
    return {
      id: 'stun',
      name: 'Stun',
      description: 'Prevents all actions',
      type: EffectType.STUN,
      category: EffectCategory.MENTAL,
      duration: 3,
      maxStacks: 1,
      stackType: StackType.REFRESH,
      priority: 20,
      canDispel: true,
      canRefresh: false,
      canExtend: false,
      isHidden: false,
      isPermanent: false,
      icon: 'stun_icon',
      color: [0.8, 0.8, 0.2, 1]
    };
  }

  /**
   * Create silence effect
   */
  private createSilenceEffect(): EffectConfig {
    return {
      id: 'silence',
      name: 'Silence',
      description: 'Prevents spell casting',
      type: EffectType.SILENCE,
      category: EffectCategory.MAGICAL,
      duration: 8,
      maxStacks: 1,
      stackType: StackType.REFRESH,
      priority: 15,
      canDispel: true,
      canRefresh: true,
      canExtend: false,
      isHidden: false,
      isPermanent: false,
      icon: 'silence_icon',
      color: [0.8, 0.2, 0.8, 1]
    };
  }

  /**
   * Create slow effect
   */
  private createSlowEffect(): EffectConfig {
    return {
      id: 'slow',
      name: 'Slow',
      description: 'Reduces movement and action speed',
      type: EffectType.SLOW,
      category: EffectCategory.TEMPORAL,
      duration: 12,
      maxStacks: 3,
      stackType: StackType.ADDITIVE,
      priority: 8,
      canDispel: true,
      canRefresh: true,
      canExtend: true,
      isHidden: false,
      isPermanent: false,
      icon: 'slow_icon',
      color: [0.5, 0.5, 0.8, 1]
    };
  }

  /**
   * Create haste effect
   */
  private createHasteEffect(): EffectConfig {
    return {
      id: 'haste',
      name: 'Haste',
      description: 'Increases movement and action speed',
      type: EffectType.HASTE,
      category: EffectCategory.TEMPORAL,
      duration: 25,
      maxStacks: 2,
      stackType: StackType.ADDITIVE,
      priority: 8,
      canDispel: true,
      canRefresh: true,
      canExtend: true,
      isHidden: false,
      isPermanent: false,
      icon: 'haste_icon',
      color: [0.8, 0.8, 0.2, 1]
    };
  }

  /**
   * Create invisibility effect
   */
  private createInvisibilityEffect(): EffectConfig {
    return {
      id: 'invisibility',
      name: 'Invisibility',
      description: 'Makes the target invisible',
      type: EffectType.INVISIBILITY,
      category: EffectCategory.MAGICAL,
      duration: 30,
      maxStacks: 1,
      stackType: StackType.REFRESH,
      priority: 12,
      canDispel: true,
      canRefresh: true,
      canExtend: true,
      isHidden: false,
      isPermanent: false,
      icon: 'invisibility_icon',
      color: [0.5, 0.5, 0.5, 0.5]
    };
  }

  /**
   * Create immunity effect
   */
  private createImmunityEffect(): EffectConfig {
    return {
      id: 'immunity',
      name: 'Immunity',
      description: 'Prevents all negative effects',
      type: EffectType.IMMUNITY,
      category: EffectCategory.DIVINE,
      duration: 10,
      maxStacks: 1,
      stackType: StackType.REFRESH,
      priority: 25,
      canDispel: true,
      canRefresh: true,
      canExtend: true,
      isHidden: false,
      isPermanent: false,
      icon: 'immunity_icon',
      color: [1, 1, 0.2, 1]
    };
  }

  /**
   * Create reflect effect
   */
  private createReflectEffect(): EffectConfig {
    return {
      id: 'reflect',
      name: 'Reflect',
      description: 'Reflects incoming damage back to attacker',
      type: EffectType.REFLECT,
      category: EffectCategory.MAGICAL,
      duration: 15,
      maxStacks: 1,
      stackType: StackType.REFRESH,
      priority: 18,
      canDispel: true,
      canRefresh: true,
      canExtend: true,
      isHidden: false,
      isPermanent: false,
      icon: 'reflect_icon',
      color: [0.8, 0.2, 0.2, 1]
    };
  }

  /**
   * Create absorb effect
   */
  private createAbsorbEffect(): EffectConfig {
    return {
      id: 'absorb',
      name: 'Absorb',
      description: 'Absorbs and converts damage to healing',
      type: EffectType.ABSORB,
      category: EffectCategory.MAGICAL,
      duration: 20,
      maxStacks: 1,
      stackType: StackType.REFRESH,
      priority: 16,
      canDispel: true,
      canRefresh: true,
      canExtend: true,
      isHidden: false,
      isPermanent: false,
      icon: 'absorb_icon',
      color: [0.2, 0.8, 0.2, 1]
    };
  }

  /**
   * Create transform effect
   */
  private createTransformEffect(): EffectConfig {
    return {
      id: 'transform',
      name: 'Transform',
      description: 'Transforms the target into another form',
      type: EffectType.TRANSFORM,
      category: EffectCategory.MAGICAL,
      duration: 45,
      maxStacks: 1,
      stackType: StackType.REPLACE,
      priority: 22,
      canDispel: true,
      canRefresh: false,
      canExtend: true,
      isHidden: false,
      isPermanent: false,
      icon: 'transform_icon',
      color: [0.8, 0.2, 0.8, 1]
    };
  }

  /**
   * Create strength-weakness interaction
   */
  private createStrengthWeaknessInteraction(): EffectInteraction {
    return {
      id: 'strength_weakness_cancel',
      effectA: 'strength_buff',
      effectB: 'weakness_debuff',
      interactionType: InteractionType.CANCEL,
      result: 'Both effects are removed',
      priority: 10,
      isActive: true
    };
  }

  /**
   * Create poison-regeneration interaction
   */
  private createPoisonRegenerationInteraction(): EffectInteraction {
    return {
      id: 'poison_regeneration_cancel',
      effectA: 'poison_dot',
      effectB: 'regeneration_hot',
      interactionType: InteractionType.CANCEL,
      result: 'Both effects are removed',
      priority: 5,
      isActive: true
    };
  }

  /**
   * Create shield-damage interaction
   */
  private createShieldDamageInteraction(): EffectInteraction {
    return {
      id: 'shield_damage_absorb',
      effectA: 'shield',
      effectB: 'damage',
      interactionType: InteractionType.BLOCK,
      result: 'Shield absorbs damage',
      priority: 15,
      isActive: true
    };
  }

  /**
   * Create stun-silence interaction
   */
  private createStunSilenceInteraction(): EffectInteraction {
    return {
      id: 'stun_silence_merge',
      effectA: 'stun',
      effectB: 'silence',
      interactionType: InteractionType.MERGE,
      result: 'Effects are combined',
      priority: 20,
      isActive: true
    };
  }

  /**
   * Create slow-haste interaction
   */
  private createSlowHasteInteraction(): EffectInteraction {
    return {
      id: 'slow_haste_cancel',
      effectA: 'slow',
      effectB: 'haste',
      interactionType: InteractionType.CANCEL,
      result: 'Both effects are removed',
      priority: 8,
      isActive: true
    };
  }

  /**
   * Create invisibility-detection interaction
   */
  private createInvisibilityDetectionInteraction(): EffectInteraction {
    return {
      id: 'invisibility_detection_cancel',
      effectA: 'invisibility',
      effectB: 'detection',
      interactionType: InteractionType.CANCEL,
      result: 'Invisibility is removed',
      priority: 12,
      isActive: true
    };
  }

  /**
   * Apply an effect to a target
   */
  applyEffect(effectId: string, targetId: string, casterId: string, stacks: number = 1): boolean {
    const config = this.configs.get(effectId);
    if (!config) {
      console.warn(`Effect ${effectId} not found`);
      return false;
    }

    // Check for existing effect
    const existingInstance = this.getInstanceByTargetAndEffect(targetId, effectId);
    if (existingInstance) {
      return this.handleExistingEffect(existingInstance, config, stacks);
    }

    // Create new effect instance
    const instance = this.createEffectInstance(config, targetId, casterId, stacks);
    this.instances.set(instance.id, instance);

    // Check for interactions
    this.checkEffectInteractions(instance);

    // Update stats
    this.updateStats('apply', instance);

    console.log(`Applied effect ${effectId} to target ${targetId}`);
    return true;
  }

  /**
   * Remove an effect from a target
   */
  removeEffect(instanceId: string): boolean {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      console.warn(`Effect instance ${instanceId} not found`);
      return false;
    }

    instance.isActive = false;
    this.instances.delete(instanceId);

    // Update stats
    this.updateStats('remove', instance);

    console.log(`Removed effect ${instance.config.id} from target ${instance.targetId}`);
    return true;
  }

  /**
   * Remove all effects from a target
   */
  removeAllEffects(targetId: string, effectTypes?: EffectType[]): number {
    let removedCount = 0;
    const instancesToRemove: string[] = [];

    for (const [id, instance] of this.instances) {
      if (instance.targetId === targetId && instance.isActive) {
        if (!effectTypes || effectTypes.includes(instance.config.type)) {
          instancesToRemove.push(id);
        }
      }
    }

    for (const id of instancesToRemove) {
      if (this.removeEffect(id)) {
        removedCount++;
      }
    }

    console.log(`Removed ${removedCount} effects from target ${targetId}`);
    return removedCount;
  }

  /**
   * Update all active effects
   */
  updateEffects(deltaTime: number): void {
    const instancesToRemove: string[] = [];

    for (const [id, instance] of this.instances) {
      if (!instance.isActive || instance.isPaused) continue;

      // Update duration
      if (!instance.config.isPermanent) {
        instance.duration -= deltaTime;
        if (instance.duration <= 0) {
          instancesToRemove.push(id);
          continue;
        }
      }

      // Handle ticking effects
      if (instance.tickInterval > 0) {
        const timeSinceLastTick = Date.now() - instance.lastTick;
        if (timeSinceLastTick >= instance.tickInterval) {
          this.handleEffectTick(instance);
          instance.lastTick = Date.now();
        }
      }
    }

    // Remove expired effects
    for (const id of instancesToRemove) {
      this.removeEffect(id);
    }
  }

  /**
   * Get all effects on a target
   */
  getTargetEffects(targetId: string): EffectInstance[] {
    return Array.from(this.instances.values())
      .filter(instance => instance.targetId === targetId && instance.isActive);
  }

  /**
   * Get effects by type
   */
  getEffectsByType(type: EffectType): EffectInstance[] {
    return Array.from(this.instances.values())
      .filter(instance => instance.config.type === type && instance.isActive);
  }

  /**
   * Get effects by category
   */
  getEffectsByCategory(category: EffectCategory): EffectInstance[] {
    return Array.from(this.instances.values())
      .filter(instance => instance.config.category === category && instance.isActive);
  }

  /**
   * Check if target has effect
   */
  hasEffect(targetId: string, effectId: string): boolean {
    return this.getInstanceByTargetAndEffect(targetId, effectId) !== null;
  }

  /**
   * Get effect instance by target and effect
   */
  private getInstanceByTargetAndEffect(targetId: string, effectId: string): EffectInstance | null {
    for (const instance of this.instances.values()) {
      if (instance.targetId === targetId && instance.config.id === effectId && instance.isActive) {
        return instance;
      }
    }
    return null;
  }

  /**
   * Handle existing effect
   */
  private handleExistingEffect(existing: EffectInstance, config: EffectConfig, newStacks: number): boolean {
    switch (config.stackType) {
      case StackType.REFRESH:
        existing.duration = config.duration;
        existing.lastTick = Date.now();
        this.stats.refreshes++;
        return true;

      case StackType.EXTEND:
        if (config.canExtend) {
          existing.duration += config.duration;
          this.stats.extensions++;
          return true;
        }
        return false;

      case StackType.ADDITIVE:
      case StackType.MULTIPLICATIVE:
        if (existing.stacks < config.maxStacks) {
          existing.stacks = Math.min(existing.stacks + newStacks, config.maxStacks);
          return true;
        }
        return false;

      case StackType.REPLACE:
        existing.duration = config.duration;
        existing.stacks = newStacks;
        existing.lastTick = Date.now();
        return true;

      default:
        return false;
    }
  }

  /**
   * Create effect instance
   */
  private createEffectInstance(config: EffectConfig, targetId: string, casterId: string, stacks: number): EffectInstance {
    return {
      id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      config,
      targetId,
      casterId,
      stacks: Math.min(stacks, config.maxStacks),
      duration: config.duration,
      maxDuration: config.duration,
      startTime: Date.now(),
      lastTick: Date.now(),
      tickInterval: this.getTickInterval(config.type),
      isActive: true,
      isPaused: false,
      metadata: new Map(),
      modifiers: this.createEffectModifiers(config)
    };
  }

  /**
   * Get tick interval for effect type
   */
  private getTickInterval(type: EffectType): number {
    switch (type) {
      case EffectType.DAMAGE_OVER_TIME:
      case EffectType.HEAL_OVER_TIME:
        return 1000; // 1 second
      case EffectType.SHIELD:
        return 0; // No ticking
      default:
        return 0;
    }
  }

  /**
   * Create effect modifiers
   */
  private createEffectModifiers(config: EffectConfig): EffectModifier[] {
    const modifiers: EffectModifier[] = [];

    switch (config.type) {
      case EffectType.BUFF:
        modifiers.push({
          stat: 'attack',
          type: ModifierType.ADD,
          value: 10,
          isPercentage: false,
          isFlat: true
        });
        break;

      case EffectType.DEBUFF:
        modifiers.push({
          stat: 'attack',
          type: ModifierType.SUBTRACT,
          value: 10,
          isPercentage: false,
          isFlat: true
        });
        break;

      case EffectType.SLOW:
        modifiers.push({
          stat: 'speed',
          type: ModifierType.MULTIPLY,
          value: 0.5,
          isPercentage: true,
          isFlat: false
        });
        break;

      case EffectType.HASTE:
        modifiers.push({
          stat: 'speed',
          type: ModifierType.MULTIPLY,
          value: 1.5,
          isPercentage: true,
          isFlat: false
        });
        break;

      case EffectType.SHIELD:
        modifiers.push({
          stat: 'health',
          type: ModifierType.ADD,
          value: 100,
          isPercentage: false,
          isFlat: true
        });
        break;
    }

    return modifiers;
  }

  /**
   * Handle effect tick
   */
  private handleEffectTick(instance: EffectInstance): void {
    switch (instance.config.type) {
      case EffectType.DAMAGE_OVER_TIME:
        this.handleDamageOverTime(instance);
        break;
      case EffectType.HEAL_OVER_TIME:
        this.handleHealOverTime(instance);
        break;
    }
  }

  /**
   * Handle damage over time
   */
  private handleDamageOverTime(instance: EffectInstance): void {
    const damage = 5 * instance.stacks; // Base damage per stack
    console.log(`DOT: ${damage} damage to target ${instance.targetId}`);
    // In a real implementation, this would apply damage to the target
  }

  /**
   * Handle heal over time
   */
  private handleHealOverTime(instance: EffectInstance): void {
    const healing = 3 * instance.stacks; // Base healing per stack
    console.log(`HOT: ${healing} healing to target ${instance.targetId}`);
    // In a real implementation, this would apply healing to the target
  }

  /**
   * Check effect interactions
   */
  private checkEffectInteractions(instance: EffectInstance): void {
    for (const interaction of this.interactions.values()) {
      if (!interaction.isActive) continue;

      if (interaction.effectA === instance.config.id || interaction.effectB === instance.config.id) {
        this.handleEffectInteraction(instance, interaction);
      }
    }
  }

  /**
   * Handle effect interaction
   */
  private handleEffectInteraction(instance: EffectInstance, interaction: EffectInteraction): void {
    // Find the other effect
    const otherEffectId = interaction.effectA === instance.config.id ? interaction.effectB : interaction.effectA;
    const otherInstance = this.getInstanceByTargetAndEffect(instance.targetId, otherEffectId);

    if (!otherInstance) return;

    switch (interaction.interactionType) {
      case InteractionType.CANCEL:
        this.removeEffect(instance.id);
        this.removeEffect(otherInstance.id);
        break;

      case InteractionType.REPLACE:
        this.removeEffect(otherInstance.id);
        break;

      case InteractionType.MERGE:
        // Merge effects (implementation depends on specific requirements)
        break;

      case InteractionType.AMPLIFY:
        instance.stacks = Math.min(instance.stacks + 1, instance.config.maxStacks);
        break;

      case InteractionType.REDUCE:
        instance.stacks = Math.max(instance.stacks - 1, 1);
        break;
    }

    this.stats.effectInteractions++;
  }

  /**
   * Update statistics
   */
  private updateStats(action: string, instance: EffectInstance): void {
    switch (action) {
      case 'apply':
        this.stats.totalEffects++;
        this.stats.activeEffects++;
        this.stats.totalStacks += instance.stacks;
        break;

      case 'remove':
        this.stats.activeEffects--;
        this.stats.totalStacks -= instance.stacks;
        break;

      case 'dispel':
        this.stats.dispels++;
        break;
    }

    // Update type-specific stats
    switch (instance.config.type) {
      case EffectType.BUFF:
        this.stats.buffs++;
        break;
      case EffectType.DEBUFF:
        this.stats.debuffs++;
        break;
      case EffectType.DAMAGE_OVER_TIME:
        this.stats.damageOverTime++;
        break;
      case EffectType.HEAL_OVER_TIME:
        this.stats.healOverTime++;
        break;
      case EffectType.SHIELD:
        this.stats.shields++;
        break;
      case EffectType.STUN:
        this.stats.stuns++;
        break;
      case EffectType.SILENCE:
        this.stats.silences++;
        break;
      case EffectType.CUSTOM:
        this.stats.customEffects++;
        break;
    }
  }

  /**
   * Initialize statistics
   */
  private initializeStats(): EffectStats {
    return {
      totalEffects: 0,
      activeEffects: 0,
      buffs: 0,
      debuffs: 0,
      damageOverTime: 0,
      healOverTime: 0,
      shields: 0,
      stuns: 0,
      silences: 0,
      customEffects: 0,
      averageDuration: 0,
      totalStacks: 0,
      effectInteractions: 0,
      triggersFired: 0,
      dispels: 0,
      refreshes: 0,
      extensions: 0
    };
  }

  /**
   * Get effect statistics
   */
  getStats(): EffectStats {
    return { ...this.stats };
  }

  /**
   * Get all effect configs
   */
  getEffectConfigs(): EffectConfig[] {
    return Array.from(this.configs.values());
  }

  /**
   * Get effect config by ID
   */
  getEffectConfig(effectId: string): EffectConfig | null {
    return this.configs.get(effectId) || null;
  }

  /**
   * Add custom effect config
   */
  addEffectConfig(config: EffectConfig): boolean {
    if (this.configs.has(config.id)) {
      console.warn(`Effect config ${config.id} already exists`);
      return false;
    }

    this.configs.set(config.id, config);
    console.log(`Added effect config ${config.id}`);
    return true;
  }

  /**
   * Remove effect config
   */
  removeEffectConfig(effectId: string): boolean {
    if (!this.configs.has(effectId)) {
      console.warn(`Effect config ${effectId} not found`);
      return false;
    }

    // Remove all instances of this effect
    const instancesToRemove: string[] = [];
    for (const [id, instance] of this.instances) {
      if (instance.config.id === effectId) {
        instancesToRemove.push(id);
      }
    }

    for (const id of instancesToRemove) {
      this.removeEffect(id);
    }

    this.configs.delete(effectId);
    console.log(`Removed effect config ${effectId}`);
    return true;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.configs.clear();
    this.instances.clear();
    this.triggers.clear();
    this.interactions.clear();
    this.stats = this.initializeStats();
    this.isInitialized = false;
  }
}

// Export default instance
export const defaultEffectsManager = new EffectsManager();
export { EffectsManager as default };