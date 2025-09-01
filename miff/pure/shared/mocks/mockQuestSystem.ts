/**
 * Mock Quest System
 * 
 * Provides mock implementations for quest-related functionality
 * in MIFF tests.
 */

export const mockQuestSystem = {
  addQuest: jest.fn().mockReturnValue(true),
  completeQuest: jest.fn().mockReturnValue(true),
  getQuest: jest.fn().mockReturnValue({ id: 'test_quest', status: 'active' })
};