/**
 * Capability System - Module discovery and introspection
 * Provides comprehensive capability management for the MIFF framework
 */

export * from './CapabilitySystem';
export * from './CapabilityGenerator';

// Re-export main classes
export { CapabilitySystem, capabilitySystem } from './CapabilitySystem';
export { CapabilityGenerator, capabilityGenerator } from './CapabilityGenerator';

// Export types
export type {
  Capability,
  CapabilityMethod,
  CapabilityParameter,
  CapabilityProperty,
  CapabilityEvent,
  CapabilityDiscovery,
  CapabilityRegistry
} from './CapabilitySystem';

export type {
  ModuleInfo
} from './CapabilityGenerator';