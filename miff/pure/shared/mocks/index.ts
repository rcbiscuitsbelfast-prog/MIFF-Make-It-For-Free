/**
 * Mock Index
 * 
 * Re-exports all mock implementations for MIFF tests.
 * This provides a single import point for all test stubs.
 */

// Core system mocks
export { mockInventory } from './mockInventory';
export { mockQuestSystem } from './mockQuestSystem';
export { mockDialogueEngine } from './mockDialogueEngine';
export { mockTransport } from './mockTransport';
export { mockScheduler } from './mockScheduler';
export { mockPlatformBridge } from './mockPlatformBridge';
export { mockModdingSystem } from './mockModdingSystem';
export { mockEventBus } from './mockEventBus';
export { mockAISystem } from './mockAISystem';
export { mockValidation } from './mockValidation';
export { mockExport } from './mockExport';
export { mockFileSystem } from './mockFileSystem';

// Browser/DOM mocks
export { mockConsole } from './mockConsole';
export { mockProcess } from './mockProcess';
export { mockTimers } from './mockTimers';
export { mockBrowserAPIs } from './mockBrowserAPIs';
export { mockCanvas } from './mockCanvas';
export { mockDocument } from './mockDocument';
export { mockWindow } from './mockWindow';

// Utility functions
export { setupGlobalMocks, resetAllMocks } from './mockUtils';