// Export the enhanced manager as the main manager
export { EnhancedEconomyManager as EconomyManager } from './EnhancedManager';

// Re-export all types and interfaces for compatibility
export type {
  EconomyConfig,
  Currency,
  PriceRule,
  PriceModifier,
  ModifierCondition,
  VendorState,
  VendorInventoryItem,
  MarketData,
  EconomicEvent,
  PriceResult,
  EconomyStats,
  TradeTransaction,
  EconomyOutput
} from './EnhancedManager';