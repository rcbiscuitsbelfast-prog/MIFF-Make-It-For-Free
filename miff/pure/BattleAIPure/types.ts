import { MoveCategory } from './Manager';

export enum AIDecisionStyle {
  AGGRESSIVE = 'aggressive',
  DEFENSIVE = 'defensive',
  BALANCED = 'balanced',
  TRICKSTER = 'trickster'
}

export enum ThreatLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ISpiritInstance {
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
  name: string;
  level: number;
  typeTag: string;
  maxHP: number;
  currentHP: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  statusEffects: string[];
  knownMoves: string[];
}

export interface IMoveData {
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
  moveId: string;
  name: string;
  category: MoveCategory | string;
  power: number;
  accuracy: number;
  cost: number;
  typeTag: string;
  priority: number;
  effects: string[];
}

export interface IAIDecisionProfile {
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
  profileID: string;
  style: AIDecisionStyle;
  preferredTypes: string[];
  movePriorityWeights: Record<string, number>;
  validate(): string[];
  getSummary(): string;
  getStyleDescription(): string;
  isAggressive: boolean;
  isDefensive: boolean;
  isBalanced: boolean;
  isTrickster: boolean;
}

export interface IBattleAIController {
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
  getDecisionProfile(): IAIDecisionProfile;
  setDecisionProfile(profile: IAIDecisionProfile): void;
  selectMove(spirit: ISpiritInstance | null, opponent: ISpiritInstance | null): string | null;
  getPreferredMoveTypes(): string[];
  getThreatLevelDescription(threatLevel: number): ThreatLevel;
  evaluateThreatLevel(opponent: ISpiritInstance | null): number;
  getProfileSummary(): string;
  isAggressive: boolean;
  isDefensive: boolean;
  isBalanced: boolean;
  isTrickster: boolean;
}

export interface IAIControllerManager {
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
  registerProfile(profile: IAIDecisionProfile): boolean;
  getProfile(id: string): IAIDecisionProfile | null;
  hasProfile(id: string): boolean;
  getAllProfiles(): IAIDecisionProfile[];
  removeProfile(id: string): boolean;
  updateProfile(id: string, updates: Partial<IAIDecisionProfile>): boolean;
  getProfileCount(): number;
  getAIController(profileId: string): IBattleAIController;
  getProfilesByStyle(style: AIDecisionStyle): IAIDecisionProfile[];
  getProfilesWithTypePreferences(): IAIDecisionProfile[];
  createStandardProfiles(): IAIDecisionProfile[];
}

