/**
 * MIFF Validation: Ensure `window.overlinkZone` is safely injected, typed, and accessible across remixable zones.
 *
 * Goals:
 * - Confirm `window.overlinkZone` is defined before use
 * - Validate its structure and expected properties
 * - Surface missing types or unsafe access patterns
 * - Ensure contributor clarity via comments and modular hooks
 *
 * @author MIFF Contributors
 * @version 1.0.0
 * @license MIT
 */

export interface OverlinkZoneValidationResult {
  isValid: boolean;
  isAvailable: boolean;
  hasRequiredMethods: boolean;
  hasOptionalFeatures: boolean;
  warnings: string[];
  errors: string[];
  suggestions: string[];
}

export interface OverlinkZoneHealthCheck {
  core: boolean;
  themes: boolean;
  audio: boolean;
  badges: boolean;
  remix: boolean;
  zones: boolean;
  debug: boolean;
}

/**
 * Comprehensive validation function for window.overlinkZone
 * 
 * This function performs multiple validation checks:
 * 1. Environment check (browser vs Node.js)
 * 2. Property existence check
 * 3. Structure validation
 * 4. Method availability check
 * 5. Type safety validation
 * 
 * @returns OverlinkZoneValidationResult with detailed validation status
 */
export function validateOverlinkZone(): OverlinkZoneValidationResult {
  const result: OverlinkZoneValidationResult = {
    isValid: false,
    isAvailable: false,
    hasRequiredMethods: false,
    hasOptionalFeatures: false,
    warnings: [],
    errors: [],
    suggestions: []
  };

  // Step 1: Environment validation
  if (typeof window === 'undefined') {
    result.errors.push('❌ Window object not available (Node.js environment)');
    result.suggestions.push('This validation should only run in browser environments');
    return result;
  }

  // Step 2: Property existence check
  if (!('overlinkZone' in window)) {
    result.warnings.push('⚠️ overlinkZone not found on window object');
    result.suggestions.push('Ensure overlinkZone is initialized before validation');
    return result;
  }

  result.isAvailable = true;

  // Step 3: Basic structure validation
  const zone = window.overlinkZone;
  
  if (!zone || typeof zone !== 'object') {
    result.errors.push('❌ overlinkZone is not a valid object');
    return result;
  }

  // Step 4: Required methods validation
  const requiredMethods = [
    'id', 'mount', 'unmount', 'activateTheme', 'getCurrentTheme',
    'getAudioPlaybackState', 'getBadgePreview', 'isRemixSafe',
    'getCurrentZone', 'switchZone'
  ];

  const missingMethods: string[] = [];
  const availableMethods: string[] = [];

  requiredMethods.forEach(method => {
    if (method in zone && typeof zone[method as keyof typeof zone] === 'function') {
      availableMethods.push(method);
    } else {
      missingMethods.push(method);
    }
  });

  if (missingMethods.length === 0) {
    result.hasRequiredMethods = true;
    result.isValid = true;
  } else {
    result.errors.push(`❌ Missing required methods: ${missingMethods.join(', ')}`);
    result.suggestions.push('Implement missing methods to ensure full functionality');
  }

  // Step 5: Optional features validation
  const optionalFeatures = [
    'setAudioVolume', 'getContributorBadges', 'getRemixMetadata',
    'enableDebugMode', 'disableDebugMode', 'getDebugState'
  ];

  const availableFeatures: string[] = [];
  optionalFeatures.forEach(feature => {
    if (feature in zone && typeof zone[feature as keyof typeof zone] === 'function') {
      availableFeatures.push(feature);
    }
  });

  if (availableFeatures.length > 0) {
    result.hasOptionalFeatures = true;
    result.warnings.push(`ℹ️ Optional features available: ${availableFeatures.join(', ')}`);
  }

  // Step 6: Type safety validation
  if (typeof zone.id !== 'string' || zone.id.trim() === '') {
    result.warnings.push('⚠️ Zone ID should be a non-empty string');
  }

  if (typeof zone.mount !== 'function') {
    result.errors.push('❌ Mount method must be a function');
  }

  if (typeof zone.unmount !== 'function') {
    result.errors.push('❌ Unmount method must be a function');
  }

  // Step 7: Remix safety validation
  if (typeof zone.isRemixSafe === 'function') {
    try {
      const remixSafe = zone.isRemixSafe();
      if (typeof remixSafe !== 'boolean') {
        result.warnings.push('⚠️ isRemixSafe should return a boolean');
      }
    } catch (error) {
      result.warnings.push(`⚠️ isRemixSafe method threw an error: ${error}`);
    }
  }

  return result;
}

/**
 * Health check function for specific overlinkZone features
 * 
 * This provides a quick status check for individual feature categories
 * Useful for debugging and feature availability checks
 * 
 * @returns OverlinkZoneHealthCheck with boolean status for each category
 */
export function checkOverlinkZoneHealth(): OverlinkZoneHealthCheck {
  const health: OverlinkZoneHealthCheck = {
    core: false,
    themes: false,
    audio: false,
    badges: false,
    remix: false,
    zones: false,
    debug: false
  };

  if (typeof window === 'undefined' || !('overlinkZone' in window)) {
    return health;
  }

  const zone = window.overlinkZone;

  // Core functionality
  health.core = !!(zone && typeof zone.mount === 'function' && typeof zone.unmount === 'function');

  // Theme management
  health.themes = !!(zone && typeof zone.activateTheme === 'function' && typeof zone.getCurrentTheme === 'function');

  // Audio management
  health.audio = !!(zone && typeof zone.getAudioPlaybackState === 'function' && typeof zone.setAudioVolume === 'function');

  // Badge system
  health.badges = !!(zone && typeof zone.getBadgePreview === 'function' && typeof zone.getContributorBadges === 'function');

  // Remix safety
  health.remix = !!(zone && typeof zone.isRemixSafe === 'function' && typeof zone.getRemixMetadata === 'function');

  // Zone management
  health.zones = !!(zone && typeof zone.getCurrentZone === 'function' && typeof zone.switchZone === 'function');

  // Debug features
  health.debug = !!(zone && typeof zone.enableDebugMode === 'function' && typeof zone.getDebugState === 'function');

  return health;
}

/**
 * Safe access wrapper for overlinkZone methods
 * 
 * This provides a safe way to call overlinkZone methods without throwing errors
 * Useful for graceful degradation when features are not available
 * 
 * @param methodName - The method to call
 * @param fallback - Fallback value if method is not available
 * @param args - Arguments to pass to the method
 * @returns The method result or fallback value
 */
export function safeOverlinkZoneCall<T>(
  methodName: keyof Window['overlinkZone'],
  fallback: T,
  ...args: unknown[]
): T {
  try {
    if (typeof window !== 'undefined' && 'overlinkZone' in window) {
      const zone = window.overlinkZone;
      if (zone && typeof zone[methodName] === 'function') {
        return (zone[methodName] as (...args: unknown[]) => T)(...args);
      }
    }
  } catch (error) {
    console.warn(`⚠️ Error calling overlinkZone.${String(methodName)}:`, error);
  }
  
  return fallback;
}

/**
 * Validation hook for React/component integration
 * 
 * This provides a way to validate overlinkZone in component lifecycle
 * Returns validation result and health status
 * 
 * @returns Object with validation result and health check
 */
export function useOverlinkZoneValidation() {
  const validation = validateOverlinkZone();
  const health = checkOverlinkZoneHealth();
  
  return {
    validation,
    health,
    isReady: validation.isValid && validation.hasRequiredMethods,
    hasOptionalFeatures: validation.hasOptionalFeatures
  };
}

// Export default validation function for easy access
export default validateOverlinkZone;