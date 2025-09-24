/**
 * ProgressionPure Module - AAA Quality XP and Leveling System
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
  target: string;
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

export { XPManager } from './Manager';