/**
 * FusionPure Module - AAA Quality Spirit Fusion System
 *
 * Advanced fusion mechanics with:
 * - Spirit combination and evolution
 * - Rule-based fusion validation
 * - Trait inheritance and genetic systems
 * - Fusion history and tracking
 * - Mobile-optimized fusion interface
 * - Multiplayer fusion coordination
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

export type FusionStatus = 'success' | 'incompatible_pair' | 'already_fused' | 'constraints_not_met' | 'missing_requirements';
export type TraitType = 'stat_boost' | 'ability_learned' | 'type_change' | 'evolution_trigger' | 'special_effect';

export interface FusionTrait {
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
  type: TraitType;
  name: string;
  description: string;
  value: number | string | boolean;
  rarity: number; // 0-100
  sourceSpiritId: string;
}

export interface FusionPairRule {
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
  speciesA: string;
  speciesB: string;
  resultSpeciesId: string;
  minCombinedSync: number;
  requiredFlags: string[];
  requiredItems: string[];
  inheritedTraits: string[];
  energyCost: number;
  successRate: number;
  description: string;
}

export interface PlayerContext {
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
  playerId: string;
  energy: number;
  level: number;
  syncManager?: any;
  loreFlagManager?: any;
  gameData?: any;
  getInventory?: () => any;
}

export interface FusionResult {
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
  status: FusionStatus;
  message: string;
  newSpiritId?: string;
  inheritedTraits?: FusionTrait[];
  success: boolean;
}

export interface FusionStats {
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
  totalFusions: number;
  successfulFusions: number;
  failedFusions: number;
  averageSuccessRate: number;
  rareTraitsObtained: number;
  uniqueCombinations: number;
  favoriteFusionRule: string;
  fusionStreak: number;
  bestStreak: number;
}

export interface FusionRulesStats {
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
  totalRules: number;
  availablePairs: number;
  averageSuccessRate: number;
  mostUsedRule: string;
  rarestCombination: string;
  constraintTypes: Record<string, number>;
  averageEnergyCost: number;
}

export { FusionManager } from './Manager';
export { FusionRules } from './Rules';