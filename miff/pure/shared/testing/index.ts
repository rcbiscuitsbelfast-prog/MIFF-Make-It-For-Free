/**
 * Testing System - Comprehensive testing utilities and implementations
 * Provides realistic test implementations to replace excessive mocks
 */

export * from './TestImplementationFactory';

// Re-export main classes
export { TestImplementationFactory, testImplementationFactory } from './TestImplementationFactory';

// Export types
export type {
  TestEntity,
  TestSpirit,
  TestPlayer,
  TestHealthSystem,
  TestCombatSystem,
  TestRNGSystem,
  TestInventorySystem
} from './TestImplementationFactory';