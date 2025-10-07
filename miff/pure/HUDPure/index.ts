// Re-export advanced HUD Manager API
export * from './Manager';

// Selectively re-export Core primitives, but NOT the Core HUDManager class
export { BattleHUDModel, SpiritHUDState, TurnHUDState, HUDUpdateType, type IHUDUpdateEvent, HUDPureUtils } from './Core';
export { HUDLayoutEnum } from './Manager';
