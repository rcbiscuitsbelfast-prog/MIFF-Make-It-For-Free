/**
 * Mock Dialogue Engine
 * 
 * Provides mock implementations for dialogue-related functionality
 * in MIFF tests.
 */

import { mockInventory } from './mockInventory';
import { mockQuestSystem } from './mockQuestSystem';

export const mockDialogueEngine = {
  flags: new Set(['friendly_reputation']),
  inventory: mockInventory,
  quests: mockQuestSystem,
  history: [],
  continue: jest.fn().mockReturnValue({
    choices: ['greet', 'ignore'],
    text: 'What would you like to do?'
  }),
  setFlag: jest.fn().mockImplementation((flag: string) => {
    mockDialogueEngine.flags.add(flag);
  })
};