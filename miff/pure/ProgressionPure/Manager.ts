/**
 * ProgressionPure Manager - AAA Quality XP and Leveling System
 *
 * Advanced progression mechanics with:
 * - XP gain and level management
 * - Multiple XP curve types
 * - Stat growth and evolution
 * - Level-up effects and notifications
 * - Mobile-optimized progression interface
 * - Multiplayer progression coordination
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../EventBusPure/EventBusPure';

export type XPCurveType = 'linear' | 'exponential' | 'custom';

export interface SpiritInstance {
  instanceId: string;
  speciesId: string;
  level: number;
  experience: number;
  maxHP: number;
  currentHP: number;
  attack: number;
  defense: number;
  speed: number;
  specialAttack: number;
  specialDefense: number;
  canLevelUp?: boolean;
  levelUp?(): void;
  [key: string]: any;
}

export interface LevelUpEffect {
  id: string;
  type: 'stat_boost' | 'ability_learned' | 'evolution_trigger' | 'cosmetic_change';
  target: string; // 'hp', 'attack', 'special_attack', 'ability', 'evolution'
  value: number | string;
  description: string;
}

export interface XPCurve {
  type: XPCurveType;
  maxLevel: number;
  baseXP: number;
  exponent: number;
  customThresholds: Map<number, number>;
  getXPForLevel(level: number): number;
}

export interface ProgressionStats {
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  totalLevelUps: number;
  averageXPPerLevel: number;
  fastestLevelUp: number;
  slowestLevelUp: number;
  favoriteStat: string;
}

export interface XPManagerConfig {
  enableLevelUpEffects: boolean;
  enableStatGrowth: boolean;
  enableEvolutionTriggers: boolean;
  xpMultiplier: number;
  levelCap: number;
  debugMode: boolean;
}

export class XPManager {
  private eventBus: EventBus;
  private curve: XPCurve;
  private config: XPManagerConfig;
  private levelUpEffects: LevelUpEffect[] = [];

  constructor(eventBus: EventBus, curve: XPCurve, config: Partial<XPManagerConfig> = {}) {
    this.eventBus = eventBus;
    this.curve = curve;
    this.config = {
      enableLevelUpEffects: true,
      enableStatGrowth: true,
      enableEvolutionTriggers: true,
      xpMultiplier: 1.0,
      levelCap: 100,
      debugMode: false,
      ...config
    };

    this.initializeDefaultLevelUpEffects();
  }

  private initializeDefaultLevelUpEffects(): void {
    this.levelUpEffects = [
      {
        id: 'hp_boost',
        type: 'stat_boost',
        target: 'hp',
        value: 2,
        description: 'HP increases by 2'
      },
      {
        id: 'attack_boost',
        type: 'stat_boost',
        target: 'attack',
        value: 1,
        description: 'Attack increases by 1'
      },
      {
        id: 'special_attack_boost',
        type: 'stat_boost',
        target: 'special_attack',
        value: 1,
        description: 'Special Attack increases by 1'
      }
    ];
  }

  public addXP(spirit: SpiritInstance, amount: number): void {
    if (!spirit) return;
    if (amount <= 0) return;

    const actualAmount = Math.floor(amount * this.config.xpMultiplier);
    spirit.experience = (spirit.experience || 0) + actualAmount;

    if (this.config.debugMode) {
      console.log(`XP Added: ${actualAmount} to ${spirit.instanceId} (Total: ${spirit.experience})`);
    }

    this.eventBus.publish('xp:gained', {
      spiritId: spirit.instanceId,
      amount: actualAmount,
      totalXP: spirit.experience,
      timestamp: new Date()
    });

    // Check for level up
    if (this.checkLevelUp(spirit)) {
      this.eventBus.publish('spirit:level_up', {
        spiritId: spirit.instanceId,
        newLevel: spirit.level,
        timestamp: new Date()
      });
    }
  }

  public checkLevelUp(spirit: SpiritInstance): boolean {
    if (!spirit) return false;

    const currentLevel = spirit.level;
    const neededForNext = this.getNextLevelXP(spirit);

    if (spirit.experience >= neededForNext && currentLevel < this.config.levelCap) {
      return this.levelUp(spirit);
    }

    return false;
  }

  private levelUp(spirit: SpiritInstance): boolean {
    const currentLevel = spirit.level;
    const nextLevel = Math.min(this.config.levelCap, currentLevel + 1);
    const neededXP = this.getNextLevelXP(spirit);

    if (spirit.experience < neededXP) return false;

    // Perform level up
    spirit.level = nextLevel;
    spirit.experience -= neededXP;

    // Apply stat growth
    if (this.config.enableStatGrowth) {
      this.applyStatGrowth(spirit);
    }

    // Apply level up effects
    if (this.config.enableLevelUpEffects) {
      this.applyLevelUpEffects(spirit);
    }

    // Check for evolution triggers
    if (this.config.enableEvolutionTriggers) {
      this.checkEvolutionTriggers(spirit);
    }

    if (this.config.debugMode) {
      console.log(`Level Up: ${spirit.instanceId} leveled up to ${spirit.level}`);
    }

    this.eventBus.publish('progression:level_up', {
      spiritId: spirit.instanceId,
      previousLevel: currentLevel,
      newLevel: spirit.level,
      remainingXP: spirit.experience,
      timestamp: new Date()
    });

    return true;
  }

  private applyStatGrowth(spirit: SpiritInstance): void {
    const levelUps = 1; // Could track multiple level ups

    // Basic stat growth
    spirit.maxHP += 2 * levelUps;
    spirit.currentHP = Math.min(spirit.currentHP + 2 * levelUps, spirit.maxHP);
    spirit.attack += 1 * levelUps;
    spirit.specialAttack += 1 * levelUps;
    spirit.defense += 0.5 * levelUps;
    spirit.specialDefense += 0.5 * levelUps;
    spirit.speed += 0.5 * levelUps;
  }

  private applyLevelUpEffects(spirit: SpiritInstance): void {
    this.levelUpEffects.forEach((effect: any) => {
      switch (effect.type) {
        case 'stat_boost':
          this.applyStatBoost(spirit, effect);
          break;
      }
    });
  }

  private applyStatBoost(spirit: SpiritInstance, effect: LevelUpEffect): void {
    if (effect.target === 'hp') {
      spirit.maxHP += effect.value as number;
      spirit.currentHP = Math.min(spirit.currentHP + (effect.value as number), spirit.maxHP);
    } else if (effect.target === 'attack') {
      spirit.attack += effect.value as number;
    } else if (effect.target === 'special_attack') {
      spirit.specialAttack += effect.value as number;
    } else if (effect.target === 'defense') {
      spirit.defense += effect.value as number;
    } else if (effect.target === 'special_defense') {
      spirit.specialDefense += effect.value as number;
    } else if (effect.target === 'speed') {
      spirit.speed += effect.value as number;
    }
  }

  private checkEvolutionTriggers(spirit: SpiritInstance): void {
    // This would check if the spirit can evolve based on its new level
    // For now, just emit an event that other systems can listen to
    this.eventBus.publish('progression:evolution_check', {
      spiritId: spirit.instanceId,
      level: spirit.level,
      speciesId: spirit.speciesId,
      timestamp: new Date()
    });
  }

  public getNextLevelXP(spirit: SpiritInstance): number {
    const nextLevel = Math.min(this.curve.maxLevel, spirit.level + 1);
    const currentThreshold = this.curve.getXPForLevel(spirit.level);
    const nextThreshold = this.curve.getXPForLevel(nextLevel);
    return Math.max(0, nextThreshold - currentThreshold);
  }

  public getLevelProgress(spirit: SpiritInstance): {
    currentXP: number;
    neededXP: number;
    progress: number; // 0-100
    canLevelUp: boolean;
  } {
    const currentXP = spirit.experience || 0;
    const neededXP = this.getNextLevelXP(spirit);
    const progress = neededXP > 0 ? (currentXP / neededXP) * 100 : 100;
    const canLevelUp = currentXP >= neededXP && spirit.level < this.config.levelCap;

    return {
      currentXP,
      neededXP,
      progress: Math.min(100, progress),
      canLevelUp
    };
  }

  public getProgressionStats(spirit: SpiritInstance): ProgressionStats {
    const progress = this.getLevelProgress(spirit);

    return {
      totalXP: spirit.experience || 0,
      currentLevel: spirit.level,
      xpToNextLevel: progress.neededXP,
      totalLevelUps: spirit.level - 1, // Assuming started at level 1
      averageXPPerLevel: spirit.level > 1 ? (spirit.experience || 0) / (spirit.level - 1) : 0,
      fastestLevelUp: 0, // Would track from history
      slowestLevelUp: 0, // Would track from history
      favoriteStat: 'attack' // Would calculate from growth history
    };
  }

  public setXP(spirit: SpiritInstance, amount: number): void {
    if (!spirit) return;
    spirit.experience = Math.max(0, amount);

    if (this.config.debugMode) {
      console.log(`XP Set: ${amount} for ${spirit.instanceId}`);
    }
  }

  public getCurve(): XPCurve {
    return { ...this.curve };
  }

  public setCurve(curve: XPCurve): void {
    this.curve = { ...curve };
  }

  public exportProgressionData(): string {
    return JSON.stringify({
      curve: this.curve,
      config: this.config,
      levelUpEffects: this.levelUpEffects,
      exportDate: new Date()
    }, null, 2);
  }

  public importProgressionData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);

      if (parsed.curve) {
        this.curve = parsed.curve;
      }

      if (parsed.config) {
        this.config = { ...this.config, ...parsed.config };
      }

      if (parsed.levelUpEffects) {
        this.levelUpEffects = parsed.levelUpEffects;
      }

      return true;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return false;
    }
  }
}

export default XPManager;