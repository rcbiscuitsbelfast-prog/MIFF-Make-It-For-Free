export * from './Manager';
export { AIManager as default } from './Manager';

// Re-export key classes and enums for convenience
export { AIPolicy, BattleAI, AIUtils } from './Manager';
export {
  AIDecisionStyle,
  AIActionType,
  AIPolicyType,
} from './Manager';
export type {
  ActionSource,
  CombatResult,
  MoveCategory,
  ICombatant,
  IBattleAction,
  IRNGProvider,
  Stats,
  Combatant,
  Action,
  CombatState
} from '../CombatPure/engine';
export type {
  ItemType,
  ItemRarity,
  ItemEffectType,
  UsageStatus,
  IPlayerContext,
  ISpiritInstance,
  IItemEffectContext
} from '../ItemsPure';
export {
  TypeEffectiveness,
  MoveData,
  SpiritInstance,
  DamageCalculator,
  BattleEngine,
  CombatUtils,
} from '../CombatPure/engine';
