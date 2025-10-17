/**
 * Mock Validation System
 * 
 * Provides mock implementations for validation functionality
 * in MIFF tests.
 */

export const mockValidation = {
  validateSchema: jest.fn().mockReturnValue({ valid: true, issues: [] }),
  validateEngineHints: jest.fn().mockReturnValue({ valid: true, issues: [] }),
  validateSignals: jest.fn().mockReturnValue({ valid: true, issues: [] }),
  validateMetadata: jest.fn().mockReturnValue({ valid: true, issues: [] })
};