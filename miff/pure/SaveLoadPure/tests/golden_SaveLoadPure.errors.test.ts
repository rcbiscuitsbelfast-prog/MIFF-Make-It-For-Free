import { SaveLoadManager } from '../SaveLoadManager';

describe('SaveLoadPure Errors', () => {
  test('load invalid slot returns error', async () => {
    // Create a mock storage adapter
    const mockStorage = {
      read: async () => null,
      write: async () => {}
    };
    
    const sm = await SaveLoadManager.create(mockStorage);
    
    // Try to load a non-existent slot
    expect(() => sm.load('non-existent-slot')).toThrow('Slot not found: non-existent-slot');
  });
});

