export * from './Manager';
export { AIManager as default } from './Manager';

// Re-export key classes and enums for convenience
export { AIPolicy, BattleAI, AIUtils } from './Manager';
export {
  AIDecisionStyle,
  AIActionType,
  AIPolicyType,
} from './Manager';
export {
  ActionSource,
  CombatResult,
  TypeEffectiveness,
  MoveCategory,
  MoveData,
  SpiritInstance,
  DamageCalculator,
  BattleEngine,
  CombatUtils,
} from '../CombatPure/engine';
  ItemType,
  ItemRarity,
  ItemEffectType,
  UsageStatus,
  Item,
  ItemInstance,
  ItemEffect,
  ItemUsageManager,
  UsageResult,
  IPlayerContext,
  ISpiritInstance,
  IItemEffectContext,
  ItemsManager
} from '../ItemsPure';
export {
  ICombatant,
  IBattleAction,
  IRNGProvider,
  InventoryHook,
  AIHook,
  SaveHook,
  Stats,
  Combatant,
  Action,
  CombatState,
  MoveCategory,
  ActionSource,
  CombatResult
} from '../CombatPure/engine';
