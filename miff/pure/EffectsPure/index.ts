/**
 * EffectsPure - Effects Management System
 *
 * A comprehensive effects management system for handling battle effects,
 * stat modifications, and effect resolution. Supports real-time and turn-based
 * effects with stacking, immunity, triggers, and complex stat calculations.
 *
 * @module EffectsPure
 * @version 1.0.0
 * @license MIT
 */

import { Logger } from '../shared/logging';

const logger = Logger.create('Effects');

/**
 * Effect trigger enumeration (flags)
 */
export enum EffectTrigger {
  NONE = 0,
  ON_APPLY = 1 << 0,
  ON_REMOVE = 1 << 1,
  ON_TICK = 1 << 2,
  ON_HIT = 1 << 3,
  ON_CAST = 1 << 4,
  ON_CRIT = 1 << 5
}

/**
 * Effect type enumeration
 */
export enum EffectType {
  STAT_MODIFIER = 'stat_modifier',
  DAMAGE_OVER_TIME = 'damage_over_time',
  HEAL = 'heal',
  STUN = 'stun',
  SHIELD = 'shield',
  CUSTOM = 'custom'
}

/**
 * Target stat enumeration
 */
export enum TargetStat {
  HP = 'hp',
  ATK = 'atk',
  DEF = 'def',
  SPD = 'spd',
  SPATK = 'spatk',
  SPDEF = 'spdef',
  ACC = 'acc',
  EVA = 'eva',
  CUSTOM = 'custom'
}

/**
 * Modifier type enumeration
 */
export enum ModifierType {
  FLAT = 'flat',
  PERCENT = 'percent'
}

/**
 * Effect phase enumeration
 */
export enum EffectPhase {
  PRE_TURN = 'pre_turn',
  SELECT_ACTION = 'select_action',
  RESOLVE_ACTION = 'resolve_action',
  END_TURN = 'end_turn'
}

/**
 * Effect order enumeration
 */
export enum EffectOrder {
  BUFFS = 0,
  DEBUFFS = 1,
  PASSIVES = 2
}

/**
 * Effect application result enumeration
 */
export enum EffectApplicationResult {
  APPLIED = 'applied',
  REFRESHED = 'refreshed',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

/**
 * Effect removal reason enumeration
 */
export enum EffectRemovalReason {
  EXPIRED = 'expired',
  REMOVED = 'removed',
  CLEANSED = 'cleansed',
  OVERWRITTEN = 'overwritten',
  IMMUNITY = 'immunity'
}

/**
 * Entity context interface (dependency)
 */
export interface IEntityContext {
  getEntityStat(entityId: string, stat: TargetStat): number;
  setEntityStat(entityId: string, stat: TargetStat, value: number): void;
  hasImmunity(entityId: string, immunityTag: string): boolean;
  getEntityImmunities(entityId: string): string[];
  isEntityAlive(entityId: string): boolean;
  getCurrentPhase(): EffectPhase;
  [key: string]: any;
}

/**
 * Battle effect interface
 */
export interface IBattleEffect {
  effectId: string;
  name: string;
  description: string;
  durationSeconds: number;
  durationTurns: number;
  stackable: boolean;
  maxStacks: number;
  refreshOnStack: boolean;
  triggers: EffectTrigger;
  effectType: EffectType;
  targetStat: TargetStat;
  modifierType: ModifierType;
  value: number;
  clone(): IBattleEffect;
  validate(): string[];
  getEffectDescription(): string;
  hasTrigger(trigger: EffectTrigger): boolean;
}

/**
 * Active effect instance interface
 */
export interface IActiveEffect {
  effect: IBattleEffect;
  stacks: number;
  remainingSeconds: number;
  remainingTurns: number;
  appliedTime: number;
  lastTickTime: number;
  entityId: string;
  isExpired(): boolean;
  tick(deltaTime: number): void;
  advanceTurn(): void;
  canStack(): boolean;
  addStack(): boolean;
  removeStack(): number;
  markProcessed(): void;
  hasProcessed(): boolean;
  clone(): IActiveEffect;
}

/**
 * Effect resolver interface
 */
export interface IEffectResolver {
  resolveQueue(phase: EffectPhase, effects: IActiveEffect[], targetImmunities: string[]): IActiveEffect[];
  resolveEffects(phase: EffectPhase, entityId: string, effects: IActiveEffect[], context: IEntityContext): EffectResolution;
}

/**
 * Stat modifier aggregator interface
 */
export interface IStatModifierAggregator {
  clear(): void;
  add(type: ModifierType, value: number, isMultiplicative: boolean): void;
  apply(baseValue: number): number;
  getAdditiveModifiers(): Array<{ type: ModifierType; value: number }>;
  getMultiplicativeModifiers(): Array<{ type: ModifierType; value: number }>;
  clone(): IStatModifierAggregator;
}

/**
 * Effect resolution interface
 */
export interface IEffectResolution {
  resolvedEffects: IActiveEffect[];
  appliedEffects: Array<{ effect: IActiveEffect; result: EffectApplicationResult }>;
  expiredEffects: Array<{ effect: IActiveEffect; reason: EffectRemovalReason }>;
  statChanges: Map<string, number>;
  events: EffectEvent[];
  shouldContinue: boolean;
}

/**
 * Effect event interface
 */
export interface IEffectEvent {
  type: 'applied' | 'refreshed' | 'expired' | 'removed' | 'tick';
  entityId: string;
  effect: IBattleEffect;
  activeEffect: IActiveEffect;
  timestamp: number;
  phase: EffectPhase;
  metadata?: Record<string, any>;
}

/**
 * Effect manager interface
 */
export interface IEffectManager {
  applyEffect(entityId: string, effect: IBattleEffect): EffectApplicationResult;
  removeEffect(entityId: string, effectId: string, reason?: EffectRemovalReason): boolean;
  getActiveEffects(entityId: string): IActiveEffect[];
  getEffectsByType(entityId: string, effectType: EffectType): IActiveEffect[];
  hasEffect(entityId: string, effectId: string): boolean;
  updateEffects(deltaTime: number, context: IEntityContext): IEffectResolution;
  clearEffects(entityId: string): void;
  clearAllEffects(): void;
  getEffectCount(entityId: string): number;
  getTotalEffectCount(): number;
  onEffectApplied?: (entityId: string, effect: IBattleEffect, activeEffect: IActiveEffect) => void;
  onEffectRefreshed?: (entityId: string, effect: IBattleEffect, activeEffect: IActiveEffect) => void;
  onEffectExpired?: (entityId: string, effect: IBattleEffect, activeEffect: IActiveEffect) => void;
  onEffectRemoved?: (entityId: string, effect: IBattleEffect, activeEffect: IActiveEffect) => void;
  onEffectTick?: (entityId: string, effect: IBattleEffect, activeEffect: IActiveEffect) => void;
}

/**
 * Battle effect implementation
 */
export class BattleEffect implements IBattleEffect {
  public effectId: string;
  public name: string;
  public description: string;
  public durationSeconds: number;
  public durationTurns: number;
  public stackable: boolean;
  public maxStacks: number;
  public refreshOnStack: boolean;
  public triggers: EffectTrigger;
  public effectType: EffectType;
  public targetStat: TargetStat;
  public modifierType: ModifierType;
  public value: number;

  constructor(
    effectId: string,
    name: string,
    description: string,
    effectType: EffectType = EffectType.STAT_MODIFIER,
    targetStat: TargetStat = TargetStat.CUSTOM,
    modifierType: ModifierType = ModifierType.FLAT,
    value: number = 0,
    durationSeconds: number = 0,
    durationTurns: number = 0,
    stackable: boolean = true,
    maxStacks: number = 5,
    refreshOnStack: boolean = true,
    triggers: EffectTrigger = EffectTrigger.ON_APPLY | EffectTrigger.ON_TICK | EffectTrigger.ON_REMOVE
  ) {
    this.effectId = effectId;
    this.name = name;
    this.description = description;
    this.effectType = effectType;
    this.targetStat = targetStat;
    this.modifierType = modifierType;
    this.value = value;
    this.durationSeconds = durationSeconds;
    this.durationTurns = durationTurns;
    this.stackable = stackable;
    this.maxStacks = maxStacks;
    this.refreshOnStack = refreshOnStack;
    this.triggers = triggers;
  }

  /**
   * Create effect with specific parameters
   */
  static create(
    effectId: string,
    name: string,
    description: string,
    effectType: EffectType = EffectType.STAT_MODIFIER,
    targetStat: TargetStat = TargetStat.CUSTOM,
    modifierType: ModifierType = ModifierType.FLAT,
    value: number = 0,
    durationSeconds: number = 0,
    durationTurns: number = 0,
    stackable: boolean = true,
    maxStacks: number = 5,
    refreshOnStack: boolean = true,
    triggers: EffectTrigger = EffectTrigger.ON_APPLY | EffectTrigger.ON_TICK | EffectTrigger.ON_REMOVE
  ): BattleEffect {
    return new BattleEffect(
      effectId,
      name,
      description,
      effectType,
      targetStat,
      modifierType,
      value,
      durationSeconds,
      durationTurns,
      stackable,
      maxStacks,
      refreshOnStack,
      triggers
    );
  }

  /**
   * Create stat modifier effect
   */
  static statModifier(
    effectId: string,
    name: string,
    description: string,
    targetStat: TargetStat,
    modifierType: ModifierType,
    value: number,
    durationSeconds: number = 0,
    durationTurns: number = 0,
    stackable: boolean = true,
    maxStacks: number = 5
  ): BattleEffect {
    return new BattleEffect(
      effectId,
      name,
      description,
      EffectType.STAT_MODIFIER,
      targetStat,
      modifierType,
      value,
      durationSeconds,
      durationTurns,
      stackable,
      maxStacks,
      true,
      EffectTrigger.ON_APPLY | EffectTrigger.ON_TICK | EffectTrigger.ON_REMOVE
    );
  }

  /**
   * Create damage over time effect
   */
  static damageOverTime(
    effectId: string,
    name: string,
    description: string,
    damagePerTick: number,
    durationSeconds: number = 0,
    durationTurns: number = 0
  ): BattleEffect {
    return new BattleEffect(
      effectId,
      name,
      description,
      EffectType.DAMAGE_OVER_TIME,
      TargetStat.HP,
      ModifierType.FLAT,
      damagePerTick,
      durationSeconds,
      durationTurns,
      false,
      1,
      false,
      EffectTrigger.ON_APPLY | EffectTrigger.ON_TICK | EffectTrigger.ON_REMOVE
    );
  }

  /**
   * Create heal effect
   */
  static heal(
    effectId: string,
    name: string,
    description: string,
    healAmount: number,
    durationSeconds: number = 0,
    durationTurns: number = 0
  ): BattleEffect {
    return new BattleEffect(
      effectId,
      name,
      description,
      EffectType.HEAL,
      TargetStat.HP,
      ModifierType.FLAT,
      healAmount,
      durationSeconds,
      durationTurns,
      false,
      1,
      false,
      EffectTrigger.ON_APPLY | EffectTrigger.ON_REMOVE
    );
  }

  /**
   * Create stun effect
   */
  static stun(
    effectId: string,
    name: string,
    description: string,
    durationSeconds: number = 0,
    durationTurns: number = 0
  ): BattleEffect {
    return new BattleEffect(
      effectId,
      name,
      description,
      EffectType.STUN,
      TargetStat.CUSTOM,
      ModifierType.FLAT,
      0,
      durationSeconds,
      durationTurns,
      false,
      1,
      false,
      EffectTrigger.ON_APPLY | EffectTrigger.ON_REMOVE
    );
  }

  /**
   * Create shield effect
   */
  static shield(
    effectId: string,
    name: string,
    description: string,
    shieldAmount: number,
    durationSeconds: number = 0,
    durationTurns: number = 0
  ): BattleEffect {
    return new BattleEffect(
      effectId,
      name,
      description,
      EffectType.SHIELD,
      TargetStat.HP,
      ModifierType.FLAT,
      shieldAmount,
      durationSeconds,
      durationTurns,
      false,
      1,
      false,
      EffectTrigger.ON_APPLY | EffectTrigger.ON_REMOVE
    );
  }

  /**
   * Check if effect has specific trigger
   */
  hasTrigger(trigger: EffectTrigger): boolean {
    return (this.triggers & trigger) !== 0;
  }

  /**
   * Get effect description
   */
  getEffectDescription(): string {
    switch (this.effectType) {
      case EffectType.STAT_MODIFIER:
        const modType = this.modifierType === ModifierType.FLAT ? 'flat' : 'percent';
        const sign = this.value >= 0 ? '+' : '';
        const displayValue = this.modifierType === ModifierType.PERCENT ?
          `${Math.round(this.value * 100)}%` : `${this.value}`;
        return `${this.name}: ${sign}${displayValue} ${modType} to ${this.targetStat.toUpperCase()}`;
      case EffectType.DAMAGE_OVER_TIME:
        return `${this.name}: ${this.value} damage per tick`;
      case EffectType.HEAL:
        return `${this.name}: ${this.value} healing`;
      case EffectType.STUN:
        return `${this.name}: Stunned for ${this.getDurationDescription()}`;
      case EffectType.SHIELD:
        return `${this.name}: ${this.value} shield`;
      case EffectType.CUSTOM:
        return `${this.name}: ${this.description}`;
      default:
        return `${this.name}: ${this.description}`;
    }
  }

  /**
   * Get duration description
   */
  getDurationDescription(): string {
    const parts: string[] = [];

    if (this.durationSeconds > 0) {
      parts.push(`${this.durationSeconds}s`);
    }

    if (this.durationTurns > 0) {
      parts.push(`${this.durationTurns} turns`);
    }

    return parts.length > 0 ? parts.join(' or ') : 'permanent';
  }

  /**
   * Validate effect
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.effectId || this.effectId.trim() === '') {
      errors.push('Effect ID cannot be empty');
    }

    if (!this.name || this.name.trim() === '') {
      errors.push('Effect name cannot be empty');
    }

    if (!this.description || this.description.trim() === '') {
      errors.push('Effect description cannot be empty');
    }

    if (this.durationSeconds < 0) {
      errors.push('Duration seconds cannot be negative');
    }

    if (this.durationTurns < 0) {
      errors.push('Duration turns cannot be negative');
    }

    if (this.maxStacks < 1) {
      errors.push('Max stacks must be at least 1');
    }

    if (this.value === 0 && this.effectType !== EffectType.STUN) {
      // Some effects might legitimately have 0 value, but warn about it
      logger.warn('Effect has value of 0', { effectId: this.effectId });
    }

    return errors;
  }

  /**
   * Clone effect
   */
  clone(): BattleEffect {
    return new BattleEffect(
      this.effectId,
      this.name,
      this.description,
      this.effectType,
      this.targetStat,
      this.modifierType,
      this.value,
      this.durationSeconds,
      this.durationTurns,
      this.stackable,
      this.maxStacks,
      this.refreshOnStack,
      this.triggers
    );
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return {
      effectId: this.effectId,
      name: this.name,
      description: this.description,
      durationSeconds: this.durationSeconds,
      durationTurns: this.durationTurns,
      stackable: this.stackable,
      maxStacks: this.maxStacks,
      refreshOnStack: this.refreshOnStack,
      triggers: this.triggers,
      effectType: this.effectType,
      targetStat: this.targetStat,
      modifierType: this.modifierType,
      value: this.value
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: Record<string, any>): BattleEffect {
    return new BattleEffect(
      data.effectId,
      data.name,
      data.description,
      data.effectType || EffectType.STAT_MODIFIER,
      data.targetStat || TargetStat.CUSTOM,
      data.modifierType || ModifierType.FLAT,
      data.value || 0,
      data.durationSeconds || 0,
      data.durationTurns || 0,
      data.stackable !== false,
      data.maxStacks || 5,
      data.refreshOnStack !== false,
      data.triggers || (EffectTrigger.ON_APPLY | EffectTrigger.ON_TICK | EffectTrigger.ON_REMOVE)
    );
  }
}

/**
 * Active effect implementation
 */
export class ActiveEffect implements IActiveEffect {
  public effect: IBattleEffect;
  public stacks: number;
  public remainingSeconds: number;
  public remainingTurns: number;
  public appliedTime: number;
  public lastTickTime: number;
  public entityId: string;
  private processed = false;

  constructor(
    effect: IBattleEffect,
    entityId: string,
    stacks: number = 1,
    remainingSeconds: number = 0,
    remainingTurns: number = 0
  ) {
    this.effect = effect;
    this.entityId = entityId;
    this.stacks = Math.max(1, Math.min(stacks, effect.maxStacks));
    this.remainingSeconds = remainingSeconds;
    this.remainingTurns = remainingTurns;
    this.appliedTime = Date.now();
    this.lastTickTime = this.appliedTime;
  }

  /**
   * Create active effect
   */
  static create(
    effect: IBattleEffect,
    entityId: string,
    stacks: number = 1,
    remainingSeconds?: number,
    remainingTurns?: number
  ): ActiveEffect {
    const seconds = remainingSeconds ?? effect.durationSeconds;
    const turns = remainingTurns ?? effect.durationTurns;
    return new ActiveEffect(effect, entityId, stacks, seconds, turns);
  }

  /**
   * Check if effect is expired
   */
  isExpired(): boolean {
    // Effects with no duration are expired unless explicitly permanent
    if (this.effect.durationSeconds === 0 && this.effect.durationTurns === 0) {
      const isPermanent = this.effect.name.toLowerCase().includes('permanent') ||
        this.effect.description.toLowerCase().includes('permanent');
      if (isPermanent) {
        return false;
      }
      return this.processed;
    }

    // Check time-based expiration
    if (this.effect.durationSeconds > 0 && this.remainingSeconds <= 0) {
      return true;
    }

    // Check turn-based expiration
    if (this.effect.durationTurns > 0 && this.remainingTurns <= 0) {
      return true;
    }

    return false;
  }

  /**
   * Tick effect (update time-based duration)
   */
  tick(deltaTime: number): void {
    if (this.effect.durationSeconds > 0) {
      this.remainingSeconds = Math.max(0, this.remainingSeconds - deltaTime);
    }

    this.lastTickTime = Date.now();
  }

  /**
   * Advance turn (update turn-based duration)
   */
  advanceTurn(): void {
    if (this.effect.durationTurns > 0) {
      this.remainingTurns = Math.max(0, this.remainingTurns - 1);
    }
  }

  /**
   * Check if effect can stack
   */
  canStack(): boolean {
    return this.effect.stackable && this.stacks < this.effect.maxStacks;
  }

  /**
   * Add stack
   */
  addStack(): boolean {
    if (this.canStack()) {
      this.stacks++;
      if (this.effect.refreshOnStack) {
        // Refresh duration on stack
        this.remainingSeconds = this.effect.durationSeconds;
        this.remainingTurns = this.effect.durationTurns;
      }
      return true;
    }
    return false;
  }

  /**
   * Remove stack
   */
  removeStack(): number {
    if (this.stacks > 1) {
      this.stacks--;
    }
    return this.stacks;
  }

  /**
   * Clone active effect
   */
  clone(): ActiveEffect {
    const cloned = new ActiveEffect(
      this.effect.clone(),
      this.entityId,
      this.stacks,
      this.remainingSeconds,
      this.remainingTurns
    );

    cloned.appliedTime = this.appliedTime;
    cloned.lastTickTime = this.lastTickTime;
    cloned.processed = this.processed;

    return cloned;
  }

  markProcessed(): void {
    this.processed = true;
  }

  hasProcessed(): boolean {
    return this.processed;
  }

  /**
   * Get effect duration as percentage (0-1)
   */
  getDurationPercentage(): number {
    if (this.effect.durationSeconds > 0) {
      return Math.max(0, this.remainingSeconds / this.effect.durationSeconds);
    }

    if (this.effect.durationTurns > 0) {
      return Math.max(0, this.remainingTurns / this.effect.durationTurns);
    }

    return 1; // Permanent effect
  }

  /**
   * Get effect summary
   */
  getSummary(): string {
    const duration = this.getDurationPercentage();
    const durationStr = duration < 1 ? ` (${Math.round(duration * 100)}%)` : '';
    return `${this.effect.name} x${this.stacks}${durationStr}`;
  }
}

/**
 * Stat modifier aggregator implementation
 */
export class StatModifierAggregator implements IStatModifierAggregator {
  private readonly additive: Array<{ type: ModifierType; value: number }>;
  private readonly multiplicative: Array<{ type: ModifierType; value: number }>;

  constructor() {
    this.additive = [];
    this.multiplicative = [];
  }

  /**
   * Create aggregator
   */
  static create(): StatModifierAggregator {
    return new StatModifierAggregator();
  }

  /**
   * Clear all modifiers
   */
  clear(): void {
    this.additive.length = 0;
    this.multiplicative.length = 0;
  }

  /**
   * Add modifier
   */
  add(type: ModifierType, value: number, isMultiplicative: boolean): void {
    if (isMultiplicative) {
      this.multiplicative.push({ type, value });
    } else {
      this.additive.push({ type, value });
    }
  }

  /**
   * Apply modifiers to base value
   */
  apply(baseValue: number): number {
    // Apply additive modifiers first (flat + percent)
    let result = baseValue;

    // Apply additive flat modifiers
    for (const mod of this.additive) {
      if (mod.type === ModifierType.FLAT) {
        result += mod.value;
      }
    }

    // Apply additive percent modifiers
    for (const mod of this.additive) {
      if (mod.type === ModifierType.PERCENT) {
        result *= (1 + mod.value);
      }
    }

    // Apply multiplicative flat modifiers
    for (const mod of this.multiplicative) {
      if (mod.type === ModifierType.FLAT) {
        result += mod.value;
      }
    }

    // Apply multiplicative percent modifiers
    for (const mod of this.multiplicative) {
      if (mod.type === ModifierType.PERCENT) {
        result *= (1 + mod.value);
      }
    }

    return Math.max(0, result); // Ensure non-negative result
  }

  /**
   * Get additive modifiers
   */
  getAdditiveModifiers(): Array<{ type: ModifierType; value: number }> {
    return [...this.additive];
  }

  /**
   * Get multiplicative modifiers
   */
  getMultiplicativeModifiers(): Array<{ type: ModifierType; value: number }> {
    return [...this.multiplicative];
  }

  /**
   * Clone aggregator
   */
  clone(): StatModifierAggregator {
    const cloned = new StatModifierAggregator();
    cloned.additive.push(...this.additive);
    cloned.multiplicative.push(...this.multiplicative);
    return cloned;
  }

  /**
   * Get total additive bonus (only flat modifiers)
   */
  getTotalAdditive(): number {
    return this.additive
      .filter((mod: any) => mod.type === ModifierType.FLAT)
      .reduce((sum, mod) => sum + mod.value, 0);
  }

  /**
   * Get total multiplicative bonus (only percent modifiers)
   */
  getTotalMultiplicative(): number {
    return this.multiplicative
      .filter((mod: any) => mod.type === ModifierType.PERCENT)
      .reduce((product, mod) => product * (1 + mod.value), 1);
  }
}

/**
 * Effect event implementation
 */
export class EffectEvent implements IEffectEvent {
  public type: 'applied' | 'refreshed' | 'expired' | 'removed' | 'tick';
  public entityId: string;
  public effect: IBattleEffect;
  public activeEffect: IActiveEffect;
  public timestamp: number;
  public phase: EffectPhase;
  public metadata?: Record<string, any>;

  constructor(
    type: 'applied' | 'refreshed' | 'expired' | 'removed' | 'tick',
    entityId: string,
    effect: IBattleEffect,
    activeEffect: IActiveEffect,
    phase: EffectPhase,
    metadata?: Record<string, any>
  ) {
    this.type = type;
    this.entityId = entityId;
    this.effect = effect;
    this.activeEffect = activeEffect;
    this.timestamp = Date.now();
    this.phase = phase;
    this.metadata = metadata;
  }

  /**
   * Create applied event
   */
  static applied(
    entityId: string,
    effect: IBattleEffect,
    activeEffect: IActiveEffect,
    phase: EffectPhase,
    metadata?: Record<string, any>
  ): EffectEvent {
    return new EffectEvent('applied', entityId, effect, activeEffect, phase, metadata);
  }

  /**
   * Create refreshed event
   */
  static refreshed(
    entityId: string,
    effect: IBattleEffect,
    activeEffect: IActiveEffect,
    phase: EffectPhase,
    metadata?: Record<string, any>
  ): EffectEvent {
    return new EffectEvent('refreshed', entityId, effect, activeEffect, phase, metadata);
  }

  /**
   * Create expired event
   */
  static expired(
    entityId: string,
    effect: IBattleEffect,
    activeEffect: IActiveEffect,
    phase: EffectPhase,
    metadata?: Record<string, any>
  ): EffectEvent {
    return new EffectEvent('expired', entityId, effect, activeEffect, phase, metadata);
  }

  /**
   * Create removed event
   */
  static removed(
    entityId: string,
    effect: IBattleEffect,
    activeEffect: IActiveEffect,
    phase: EffectPhase,
    metadata?: Record<string, any>
  ): EffectEvent {
    return new EffectEvent('removed', entityId, effect, activeEffect, phase, metadata);
  }

  /**
   * Create tick event
   */
  static tick(
    entityId: string,
    effect: IBattleEffect,
    activeEffect: IActiveEffect,
    phase: EffectPhase,
    metadata?: Record<string, any>
  ): EffectEvent {
    return new EffectEvent('tick', entityId, effect, activeEffect, phase, metadata);
  }
}

/**
 * Effect resolution implementation
 */
export class EffectResolution implements IEffectResolution {
  public resolvedEffects: IActiveEffect[];
  public appliedEffects: Array<{ effect: IActiveEffect; result: EffectApplicationResult }>;
  public expiredEffects: Array<{ effect: IActiveEffect; reason: EffectRemovalReason }>;
  public statChanges: Map<string, number>;
  public events: EffectEvent[];
  public shouldContinue: boolean;

  constructor(
    resolvedEffects: IActiveEffect[] = [],
    appliedEffects: Array<{ effect: IActiveEffect; result: EffectApplicationResult }> = [],
    expiredEffects: Array<{ effect: IActiveEffect; reason: EffectRemovalReason }> = [],
    statChanges: Map<string, number> = new Map(),
    events: EffectEvent[] = [],
    shouldContinue: boolean = true
  ) {
    this.resolvedEffects = [...resolvedEffects];
    this.appliedEffects = [...appliedEffects];
    this.expiredEffects = [...expiredEffects];
    this.statChanges = new Map(statChanges);
    this.events = [...events];
    this.shouldContinue = shouldContinue;
  }

  /**
   * Create resolution
   */
  static create(
    resolvedEffects: IActiveEffect[] = [],
    appliedEffects: Array<{ effect: IActiveEffect; result: EffectApplicationResult }> = [],
    expiredEffects: Array<{ effect: IActiveEffect; reason: EffectRemovalReason }> = [],
    statChanges: Map<string, number> = new Map(),
    events: EffectEvent[] = [],
    shouldContinue: boolean = true
  ): EffectResolution {
    return new EffectResolution(resolvedEffects, appliedEffects, expiredEffects, statChanges, events, shouldContinue);
  }

  /**
   * Add resolved effect
   */
  addResolvedEffect(effect: IActiveEffect): void {
    this.resolvedEffects.push(effect);
  }

  /**
   * Add applied effect
   */
  addAppliedEffect(effect: IActiveEffect, result: EffectApplicationResult): void {
    this.appliedEffects.push({ effect, result });
  }

  /**
   * Add expired effect
   */
  addExpiredEffect(effect: IActiveEffect, reason: EffectRemovalReason): void {
    this.expiredEffects.push({ effect, reason });
  }

  /**
   * Add stat change
   */
  addStatChange(stat: string, change: number): void {
    const current = this.statChanges.get(stat) || 0;
    this.statChanges.set(stat, current + change);
  }

  /**
   * Add event
   */
  addEvent(event: EffectEvent): void {
    this.events.push(event);
  }

  /**
   * Get total stat changes
   */
  getTotalStatChanges(): Record<string, number> {
    const changes: Record<string, number> = {};
    this.statChanges.forEach((value, key) => {
      changes[key] = value;
    });
    return changes;
  }

  /**
   * Check if any effects were applied
   */
  hasAppliedEffects(): boolean {
    return this.appliedEffects.length > 0;
  }

  /**
   * Check if any effects expired
   */
  hasExpiredEffects(): boolean {
    return this.expiredEffects.length > 0;
  }

  /**
   * Get effects applied count
   */
  getAppliedCount(): number {
    return this.appliedEffects.length;
  }

  /**
   * Get effects expired count
   */
  getExpiredCount(): number {
    return this.expiredEffects.length;
  }
}

/**
 * Effect resolver implementation
 */
export class EffectResolver implements IEffectResolver {
  /**
   * Resolve effect queue for a phase
   */
  resolveQueue(phase: EffectPhase, effects: IActiveEffect[], targetImmunities: string[]): IActiveEffect[] {
    let resolvedEffects = [...effects];
    const normalizedImmunities = targetImmunities.map(tag => tag.toLowerCase());

    const shouldTriggerOnPhase = (effectData: IBattleEffect): boolean => {
      switch (phase) {
        case EffectPhase.PRE_TURN:
          if (!effectData.hasTrigger(EffectTrigger.ON_APPLY)) {
            return false;
          }

          const zeroDuration = effectData.durationSeconds === 0 && effectData.durationTurns === 0;
          if (zeroDuration && effectData.effectType === EffectType.HEAL) {
            return false;
          }

          return true;
        case EffectPhase.SELECT_ACTION:
          return effectData.hasTrigger(EffectTrigger.ON_CAST);
        case EffectPhase.RESOLVE_ACTION:
          return effectData.hasTrigger(EffectTrigger.ON_HIT) || effectData.hasTrigger(EffectTrigger.ON_CRIT);
        case EffectPhase.END_TURN:
          return effectData.hasTrigger(EffectTrigger.ON_TICK) || effectData.hasTrigger(EffectTrigger.ON_REMOVE);
        default:
          return false;
      }
    };

    const isImmuneToEffect = (effect: IActiveEffect): boolean => {
      const effectData = effect.effect;
      const effectId = effectData.effectId.toLowerCase();
      const effectName = effectData.name.toLowerCase();
      const effectType = effectData.effectType;

      return normalizedImmunities.some(tag => {
        if (!tag) {
          return false;
        }

        const segments = tag.split(/[^a-z0-9]+/).filter(Boolean);
        const keywords = segments.filter(segment =>
          !['immune', 'immunity', 'resist', 'resistance'].includes(segment)
        );

        if (segments.includes('damage') || segments.includes('dot')) {
          if (effectType === EffectType.DAMAGE_OVER_TIME) {
            return true;
          }
        }

        if (segments.includes('stun') && effectType === EffectType.STUN) {
          return true;
        }

        if (segments.includes('heal') && effectType === EffectType.HEAL) {
          return true;
        }

        for (const keyword of keywords) {
          if (!keyword) {
            continue;
          }

          if (effectId.includes(keyword) || effectName.includes(keyword)) {
            return true;
          }
        }

        return false;
      });
    };

    resolvedEffects = resolvedEffects.filter(effect => !isImmuneToEffect(effect));
    resolvedEffects = resolvedEffects.filter(effect => shouldTriggerOnPhase(effect.effect));

    if (phase === EffectPhase.END_TURN) {
      const hasCleanse = resolvedEffects.some(effect => {
        const name = effect.effect.name.toLowerCase();
        const description = effect.effect.description.toLowerCase();
        return name.includes('cleanse') || description.includes('cleanse') ||
          name.includes('purify') || description.includes('purify');
      });

      if (hasCleanse) {
        resolvedEffects = resolvedEffects.filter(effect => {
          const data = effect.effect;
          const name = data.name.toLowerCase();
          const description = data.description.toLowerCase();

          if (name.includes('cleanse') || description.includes('cleanse') ||
              name.includes('purify') || description.includes('purify')) {
            return true;
          }

          if (data.effectType === EffectType.STAT_MODIFIER && data.value < 0) {
            return false;
          }

          if (name.includes('debuff') || description.includes('debuff')) {
            return false;
          }

          return true;
        });
      }
    }

    resolvedEffects = this.resolveOverwrites(resolvedEffects);

    resolvedEffects.sort((_a, _b) => 0);

    return resolvedEffects;
  }

  /**
   * Resolve effect overwrites
   */
  private resolveOverwrites(effects: IActiveEffect[]): IActiveEffect[] {
    const effectGroups = new Map<string, IActiveEffect[]>();

    // Group effects by ID
    effects.forEach((effect: any) => {
      const key = effect.effect.effectId;
      if (!effectGroups.has(key)) {
        effectGroups.set(key, []);
      }
      effectGroups.get(key)!.push(effect);
    });

    const resolvedEffects: IActiveEffect[] = [];

    // For each group, keep the effect with highest absolute value
    effectGroups.forEach((group: any) => {
      if (group.length === 1) {
        resolvedEffects.push(group[0!]);
      } else {
        // Find effect with highest absolute value
        const bestEffect = group.reduce((best: IActiveEffect, current: IActiveEffect) =>
          Math.abs(current.effect.value) > Math.abs(best.effect.value) ? current : best
        );
        resolvedEffects.push(bestEffect);
      }
    });

    return resolvedEffects;
  }

  /**
   * Resolve effects with context
   */
  resolveEffects(phase: EffectPhase, entityId: string, effects: IActiveEffect[], context: IEntityContext): EffectResolution {
    const resolution = EffectResolution.create();
    const resolvedEffects = this.resolveQueue(phase, effects, context.getEntityImmunities(entityId));

    // Process each resolved effect
    for (const effect of resolvedEffects) {
      const statChanges = this.applyEffect(effect, context);

      // Create event
      const event = EffectEvent.tick(entityId, effect.effect, effect, phase);
      resolution.addEvent(event);

      effect.markProcessed?.();

      // Add stat changes
      statChanges.forEach((change, stat) => {
        resolution.addStatChange(stat, change);
      });
    }

    resolution.resolvedEffects = resolvedEffects;
    return resolution;
  }

  /**
   * Apply effect and calculate stat changes
   */
  private applyEffect(effect: IActiveEffect, context: IEntityContext): Map<string, number> {
    const statChanges = new Map<string, number>();

    const effectData = effect.effect;

    switch (effectData.effectType) {
      case EffectType.STAT_MODIFIER: {
        const currentValue = context.getEntityStat(effect.entityId, effectData.targetStat);
        const modifiedValue = this.calculateStatModification(effect, currentValue);
        const change = modifiedValue - currentValue;
        if (change !== 0) {
          statChanges.set(effectData.targetStat, change);
          context.setEntityStat?.(effect.entityId, effectData.targetStat, modifiedValue);
        }
        break;
      }

      case EffectType.DAMAGE_OVER_TIME:
        const currentHp = context.getEntityStat(effect.entityId, TargetStat.HP);
        const damage = effectData.value * effect.stacks;
        const newHp = Math.max(0, currentHp - damage);
        statChanges.set(TargetStat.HP, newHp - currentHp);
        context.setEntityStat?.(effect.entityId, TargetStat.HP, newHp);
        break;

      case EffectType.HEAL:
        const existingHp = context.getEntityStat(effect.entityId, TargetStat.HP);
        const healAmount = effectData.value * effect.stacks;
        const healedHp = existingHp + healAmount;
        statChanges.set(TargetStat.HP, healAmount);
        context.setEntityStat?.(effect.entityId, TargetStat.HP, healedHp);
        break;

      case EffectType.SHIELD:
        // Shield effects might add temporary HP
        break;

      case EffectType.STUN:
        // Stun effects don't directly change stats
        break;
    }

    return statChanges;
  }

  /**
   * Calculate stat modification
   */
  private calculateStatModification(effect: IActiveEffect, baseValue: number): number {
    const effectData = effect.effect;

    if (effectData.effectType !== EffectType.STAT_MODIFIER) {
      return baseValue;
    }

    let result = baseValue;
    const stacks = Math.max(1, effect.stacks);

    switch (effectData.modifierType) {
      case ModifierType.FLAT:
        result += effectData.value * stacks;
        break;
      case ModifierType.PERCENT:
        result *= (1 + effectData.value * stacks);
        break;
    }

    return Math.max(0, result);
  }
}

/**
 * Effect manager implementation
 */
export class EffectManager implements IEffectManager {
  private readonly entityEffects = new Map<string, IActiveEffect[]>();
  private readonly effectResolver: IEffectResolver;

  public onEffectApplied?: (entityId: string, effect: IBattleEffect, activeEffect: IActiveEffect) => void;
  public onEffectRefreshed?: (entityId: string, effect: IBattleEffect, activeEffect: IActiveEffect) => void;
  public onEffectExpired?: (entityId: string, effect: IBattleEffect, activeEffect: IActiveEffect) => void;
  public onEffectRemoved?: (entityId: string, effect: IBattleEffect, activeEffect: IActiveEffect) => void;
  public onEffectTick?: (entityId: string, effect: IBattleEffect, activeEffect: IActiveEffect) => void;

  constructor(effectResolver?: IEffectResolver) {
    this.effectResolver = effectResolver || new EffectResolver();
  }

  /**
   * Create effect manager
   */
  static create(effectResolver?: IEffectResolver): EffectManager {
    return new EffectManager(effectResolver);
  }

  /**
   * Apply effect to entity
   */
  applyEffect(entityId: string, effect: IBattleEffect): EffectApplicationResult {
    if (!entityId || !effect) {
      return EffectApplicationResult.REJECTED;
    }

    const errors = effect.validate();
    if (errors.length > 0) {
      logger.warn('Invalid effect', { effectId: effect.effectId, errors });
      return EffectApplicationResult.REJECTED;
    }

    const activeEffects = this.getOrCreateActiveEffects(entityId);
    const existingEffect = activeEffects.find(active => active.effect.effectId === effect.effectId);

    if (existingEffect) {
      if (existingEffect.canStack()) {
        if (existingEffect.addStack()) {
          this.onEffectRefreshed?.(entityId, effect, existingEffect);
          return EffectApplicationResult.REFRESHED;
        }
      }
      return EffectApplicationResult.REJECTED;
    }

    // Create new active effect
    const activeEffect = ActiveEffect.create(effect, entityId);
    activeEffects.push(activeEffect);

    this.onEffectApplied?.(entityId, effect, activeEffect);
    return EffectApplicationResult.APPLIED;
  }

  /**
   * Remove effect from entity
   */
  removeEffect(entityId: string, effectId: string, reason: EffectRemovalReason = EffectRemovalReason.REMOVED): boolean {
    if (!entityId || !effectId) {
      return false;
    }

    const activeEffects = this.entityEffects.get(entityId);
    if (!activeEffects) {
      return false;
    }

    const effectIndex = activeEffects.findIndex(active => active.effect.effectId === effectId);
    if (effectIndex === -1) {
      return false;
    }

    const removedEffect = activeEffects.splice(effectIndex, 1)[0!];
    this.onEffectRemoved?.(entityId, removedEffect.effect, removedEffect);
    return true;
  }

  /**
   * Get active effects for entity
   */
  getActiveEffects(entityId: string): IActiveEffect[] {
    return this.entityEffects.get(entityId) || [];
  }

  /**
   * Get effects by type
   */
  getEffectsByType(entityId: string, effectType: EffectType): IActiveEffect[] {
    const activeEffects = this.getActiveEffects(entityId);
    return activeEffects.filter((effect: any) => effect.effect.effectType === effectType);
  }

  /**
   * Check if entity has effect
   */
  hasEffect(entityId: string, effectId: string): boolean {
    const activeEffects = this.getActiveEffects(entityId);
    return activeEffects.some(effect => effect.effect.effectId === effectId);
  }

  /**
   * Update effects for all entities
   */
  updateEffects(deltaTime: number, context: IEntityContext): IEffectResolution {
    const resolution = EffectResolution.create();
    const entitiesToRemove: string[] = [];

    for (const [entityId, activeEffects] of this.entityEffects) {
      if (!context.isEntityAlive(entityId)) {
        entitiesToRemove.push(entityId);
        continue;
      }

      const entityResolution = this.updateEntityEffects(entityId, activeEffects, deltaTime, context);

      resolution.resolvedEffects.push(...entityResolution.resolvedEffects);
      resolution.appliedEffects.push(...entityResolution.appliedEffects);
      resolution.expiredEffects.push(...entityResolution.expiredEffects);
      resolution.events.push(...entityResolution.events);

      entityResolution.statChanges.forEach((change, stat) => {
        const current = resolution.statChanges.get(stat) || 0;
        resolution.statChanges.set(stat, current + change);
      });

      // Remove expired effects
      const remainingEffects = activeEffects.filter((effect: any) => !effect.isExpired());
      this.entityEffects.set(entityId, remainingEffects);

      if (remainingEffects.length === 0) {
        entitiesToRemove.push(entityId);
      }
    }

    // Remove empty entity entries
    for (const entityId of entitiesToRemove) {
      this.entityEffects.delete(entityId);
    }

    return resolution;
  }

  /**
   * Update effects for specific entity
   */
  private updateEntityEffects(
    entityId: string,
    activeEffects: IActiveEffect[],
    deltaTime: number,
    context: IEntityContext
  ): EffectResolution {
    const resolution = EffectResolution.create();
    const currentPhase = context.getCurrentPhase();

    // Tick time-based effects
    for (const effect of activeEffects) {
      effect.tick(deltaTime);

      if ((effect.effect.triggers & EffectTrigger.ON_TICK) !== 0) {
        this.onEffectTick?.(entityId, effect.effect, effect);
      }
    }

    // Advance turn-based effects
    for (const effect of activeEffects) {
      effect.advanceTurn();

      if (effect.isExpired()) {
        this.onEffectExpired?.(entityId, effect.effect, effect);
        resolution.addExpiredEffect(effect, EffectRemovalReason.EXPIRED);
        resolution.addEvent(EffectEvent.expired(entityId, effect.effect, effect, currentPhase));
      }
    }

    // Resolve effects for current phase
    const entityResolution = this.effectResolver.resolveEffects(currentPhase, entityId, activeEffects, context);
    resolution.resolvedEffects.push(...entityResolution.resolvedEffects);
    resolution.events.push(...entityResolution.events);

    entityResolution.statChanges.forEach((change, stat) => {
      const current = resolution.statChanges.get(stat) || 0;
      resolution.statChanges.set(stat, current + change);
    });

    return resolution;
  }

  /**
   * Clear effects for entity
   */
  clearEffects(entityId: string): void {
    const activeEffects = this.entityEffects.get(entityId);
    if (activeEffects) {
      for (const effect of activeEffects) {
        this.onEffectRemoved?.(entityId, effect.effect, effect);
      }
      this.entityEffects.delete(entityId);
    }
  }

  /**
   * Clear all effects
   */
  clearAllEffects(): void {
    for (const [entityId, activeEffects] of this.entityEffects) {
      for (const effect of activeEffects) {
        this.onEffectRemoved?.(entityId, effect.effect, effect);
      }
    }
    this.entityEffects.clear();
  }

  /**
   * Get effect count for entity
   */
  getEffectCount(entityId: string): number {
    return this.getActiveEffects(entityId).length;
  }

  /**
   * Get total effect count across all entities
   */
  getTotalEffectCount(): number {
    let total = 0;
    for (const activeEffects of this.entityEffects.values()) {
      total += activeEffects.length;
    }
    return total;
  }

  /**
   * Get or create active effects for entity
   */
  private getOrCreateActiveEffects(entityId: string): IActiveEffect[] {
    if (!this.entityEffects.has(entityId)) {
      this.entityEffects.set(entityId, []);
    }
    return this.entityEffects.get(entityId)!;
  }
}

/**
 * Utility functions for effect operations
 */
export const EffectUtils = {
  /**
   * Create default entity context for testing
   */
  createDefaultEntityContext(): IEntityContext {
    const entityStats = new Map<string, Map<TargetStat, number>>();
    const entityImmunities = new Map<string, Set<string>>();
    const aliveEntities = new Set<string>();
    let currentPhase = EffectPhase.PRE_TURN;

    const defaultStats: Array<[TargetStat, number]> = [
      [TargetStat.HP, 100],
      [TargetStat.ATK, 100],
      [TargetStat.DEF, 100],
      [TargetStat.SPD, 100]
    ];

    const ensureEntity = (entityId: string) => {
      if (!entityStats.has(entityId)) {
        entityStats.set(entityId, new Map(defaultStats));
      }
      if (!entityImmunities.has(entityId)) {
        entityImmunities.set(entityId, new Set());
      }
      if (!aliveEntities.has(entityId)) {
        aliveEntities.add(entityId);
      }
    };

    const context: Record<string, any> = {};

    context.getEntityStat = (entityId: string, stat: TargetStat): number => {
      ensureEntity(entityId);
      const stats = entityStats.get(entityId)!;
      if (stats.has(stat)) {
        return stats.get(stat)!;
      }
      if (stat === TargetStat.CUSTOM) {
        return 0;
      }
      return 0;
    };

    context.setEntityStat = (entityId: string, stat: TargetStat, value: number): void => {
      ensureEntity(entityId);
      entityStats.get(entityId)!.set(stat, Math.max(0, value));
    };

    context.hasImmunity = (entityId: string, immunityTag: string): boolean => {
      ensureEntity(entityId);
      return entityImmunities.get(entityId)!.has(immunityTag);
    };

    context.getEntityImmunities = (entityId: string): string[] => {
      ensureEntity(entityId);
      return Array.from(entityImmunities.get(entityId)!);
    };

    context.addImmunity = (entityId: string, immunityTag: string): void => {
      ensureEntity(entityId);
      entityImmunities.get(entityId)!.add(immunityTag);
    };

    context.removeImmunity = (entityId: string, immunityTag: string): void => {
      if (!entityImmunities.has(entityId)) {
        return;
      }
      entityImmunities.get(entityId)!.delete(immunityTag);
    };

    context.isEntityAlive = (entityId: string): boolean => {
      ensureEntity(entityId);
      return aliveEntities.has(entityId);
    };

    context.setEntityAlive = (entityId: string, alive: boolean): void => {
      if (alive) {
        aliveEntities.add(entityId);
      } else {
        aliveEntities.delete(entityId);
      }
    };

    context.getCurrentPhase = (): EffectPhase => currentPhase;

    context.setCurrentPhase = (phase: EffectPhase): void => {
      currentPhase = phase;
    };

    context.setEntityHp = (entityId: string, hp: number): void => {
      context.setEntityStat(entityId, TargetStat.HP, hp);
    };

    context.setEntityAtk = (entityId: string, atk: number): void => {
      context.setEntityStat(entityId, TargetStat.ATK, atk);
    };

    context.getEntityAtk = (entityId: string): number => {
      return context.getEntityStat(entityId, TargetStat.ATK);
    };

    return context as IEntityContext;
  },

  /**
   * Validate battle effect
   */
  validateBattleEffect(effect: IBattleEffect): string[] {
    const errors: string[] = [];

    if (!effect.effectId || effect.effectId.trim() === '') {
      errors.push('Effect ID cannot be empty');
    }

    if (!effect.name || effect.name.trim() === '') {
      errors.push('Effect name cannot be empty');
    }

    if (!effect.description || effect.description.trim() === '') {
      errors.push('Effect description cannot be empty');
    }

    if (effect.durationSeconds < 0) {
      errors.push('Duration seconds cannot be negative');
    }

    if (effect.durationTurns < 0) {
      errors.push('Duration turns cannot be negative');
    }

    if (effect.maxStacks < 1) {
      errors.push('Max stacks must be at least 1');
    }

    return errors;
  },

  /**
   * Create stat modifier aggregator for testing
   */
  createStatModifierAggregator(): StatModifierAggregator {
    return new StatModifierAggregator();
  },

  /**
   * Calculate effect duration in milliseconds
   */
  calculateEffectDuration(effect: IBattleEffect): number {
    const seconds = effect.durationSeconds > 0 ? effect.durationSeconds * 1000 : 0;
    const turns = effect.durationTurns > 0 ? effect.durationTurns * 2000 : 0; // Assume 2 seconds per turn
    return Math.max(seconds, turns);
  },

  /**
   * Check if effect should trigger on phase
   */
  shouldTriggerOnPhase(effect: IBattleEffect, phase: EffectPhase): boolean {
    switch (phase) {
      case EffectPhase.PRE_TURN:
        return effect.hasTrigger(EffectTrigger.ON_APPLY);
      case EffectPhase.SELECT_ACTION:
        return effect.hasTrigger(EffectTrigger.ON_CAST);
      case EffectPhase.RESOLVE_ACTION:
        return effect.hasTrigger(EffectTrigger.ON_HIT) || effect.hasTrigger(EffectTrigger.ON_CRIT);
      case EffectPhase.END_TURN:
        return effect.hasTrigger(EffectTrigger.ON_TICK) || effect.hasTrigger(EffectTrigger.ON_REMOVE);
      default:
        return false;
    }
  },

  /**
   * Get effect priority (higher = more important)
   */
  getEffectPriority(effect: IBattleEffect): number {
    // Base priority on effect type
    switch (effect.effectType) {
      case EffectType.STUN:
        return 100; // Highest priority
      case EffectType.SHIELD:
        return 90;
      case EffectType.HEAL:
        return 80;
      case EffectType.DAMAGE_OVER_TIME:
        return 70;
      case EffectType.STAT_MODIFIER:
        return 50;
      case EffectType.CUSTOM:
        return 25;
      default:
        return 0;
    }
  },

  /**
   * Sort effects by priority
   */
  sortEffectsByPriority(effects: IActiveEffect[]): IActiveEffect[] {
    return [...effects].sort((a: any, b: any) => {
      const priorityA = this.getEffectPriority(a.effect);
      const priorityB = this.getEffectPriority(b.effect);
      return priorityB - priorityA;
    });
  },

  /**
   * Filter effects by type
   */
  filterEffectsByType(effects: IActiveEffect[], effectType: EffectType): IActiveEffect[] {
    return effects.filter((effect: any) => effect.effect.effectType === effectType);
  },

  /**
   * Filter effects by target stat
   */
  filterEffectsByStat(effects: IActiveEffect[], targetStat: TargetStat): IActiveEffect[] {
    return effects.filter((effect: any) => effect.effect.targetStat === targetStat);
  },

  /**
   * Get effects that modify specific stat
   */
  getStatModifyingEffects(effects: IActiveEffect[]): IActiveEffect[] {
    return effects.filter((effect: any) => effect.effect.effectType === EffectType.STAT_MODIFIER);
  }
};

/**
 * Default instances
 */
export const defaultBattleEffect = new BattleEffect('default', 'Default Effect', 'Default effect');
export const defaultActiveEffect = ActiveEffect.create(defaultBattleEffect, 'default_entity');
export const defaultStatModifierAggregator = new StatModifierAggregator();
export const defaultEffectResolver = new EffectResolver();
export const defaultEffectManager = new EffectManager();
export const defaultEffectEvent = EffectEvent.applied('default', defaultBattleEffect, defaultActiveEffect, EffectPhase.PRE_TURN);
export const defaultEffectResolution = EffectResolution.create();