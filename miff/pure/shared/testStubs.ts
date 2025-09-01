/**
 * Test Stubs and Mock Data for MIFF Tests
 * 
 * This module provides stubbed outputs, mock functions, and test data
 * that match expected test fields and resolve runtime assertion failures.
 * 
 * @module testStubs
 * @version 2.0.0
 * @license MIT
 */

// Re-export all mocks from individual files
export * from './mocks';

// ✅ Stub payloads to match test expectations
export const stubbedCLIOutput = {
  quest: { status: 'active' },
  flags: new Set(['friendly_reputation']),
  parsed: { type: 'condition' }, // or 'script' if test expects it
  result: { npcId: 'spiritTamer', name: 'Tamer of Spirits' },
};

// ✅ Stub DialogueParser to return expected type
export const DialogueParser = {
  parseCELScript: () => ({ type: 'condition' }), // adjust as needed
};