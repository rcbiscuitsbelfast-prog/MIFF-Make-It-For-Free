/**
 * LootTablesPure Module
 * 
 * Advanced loot table management system including weighted drops, rarity tiers,
 * stat rolling, conditional drops, and loot table chaining.
 * 
 * @module LootTablesPure
 * @version 1.0.0
 * @license MIT
 */

export { 
  LootTablesManager,
  type LootTable,
  type LootEntry,
  type LootCondition,
  type LootResult,
  type LootDrop,
  type LootStats,
  type LootFilter,
  type LootOutput
} from './Manager';