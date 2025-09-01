/**
 * Mock AI System
 * 
 * Provides mock implementations for AI system functionality
 * in MIFF tests.
 */

import { mockEventBus } from './mockEventBus';

export const mockAISystem = {
  emit: jest.fn(),
  subscribe: jest.fn().mockReturnValue(() => {}),
  eventBus: mockEventBus
};