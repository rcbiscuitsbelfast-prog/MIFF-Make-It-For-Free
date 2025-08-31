/**
 * MIFF Validation Module Index
 * 
 * This module provides comprehensive validation for the overlinkZone system
 * ensuring type safety, method availability, and contributor clarity.
 * 
 * @author MIFF Contributors
 * @version 1.0.0
 * @license MIT
 */

export * from './overlinkZoneValidator';

// Re-export main validation function as default
export { default as validateOverlinkZone } from './overlinkZoneValidator';

// Export validation utilities
export {
  checkOverlinkZoneHealth,
  safeOverlinkZoneCall,
  useOverlinkZoneValidation
} from './overlinkZoneValidator';

// Export types for external use
export type {
  OverlinkZoneValidationResult,
  OverlinkZoneHealthCheck
} from './overlinkZoneValidator';