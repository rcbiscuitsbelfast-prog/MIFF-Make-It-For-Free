/**
 * Mock Index - Now with Real Implementations
 * 
 * Re-exports mock implementations for MIFF tests, with critical mocks
 * replaced by real implementations for better test fidelity.
 * This provides a single import point for all test stubs.
 */

// Core system mocks (some replaced with real implementations)
export { mockInventory } from './mockInventory';
export { mockQuestSystem } from './mockQuestSystem';
export { mockDialogueEngine } from './mockDialogueEngine';
export { mockTransport } from './mockTransport';
export { mockScheduler } from './mockScheduler';
export { mockPlatformBridge } from './mockPlatformBridge';
export { mockModdingSystem } from './mockModdingSystem';
export { mockAISystem } from './mockAISystem';
export { mockExport } from './mockExport';

// Real implementations replacing critical mocks
export { realEventBus as mockEventBus } from '../realImplementations/RealEventBus';
export { realFileSystem as mockFileSystem } from '../realImplementations/RealFileSystem';
export { realValidation as mockValidation } from '../realImplementations/RealValidation';

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