/**
 * Mock Modding System
 * 
 * Provides mock implementations for modding system functionality
 * in MIFF tests.
 */

export const mockModdingSystem = {
  getPlugin: jest.fn().mockImplementation((name: string) => {
    if (name === 'physics-extended') {
      return { name: 'physics-extended', version: '1.0.0' };
    }
    throw new Error('Plugin not found');
  }),
  loadPlugin: jest.fn().mockReturnValue(Promise.resolve()),
  unloadPlugin: jest.fn().mockReturnValue(Promise.resolve())
};