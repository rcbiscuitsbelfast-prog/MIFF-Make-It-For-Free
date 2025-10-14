/**
 * Mock Modding System
 * 
 * Provides mock implementations for modding system functionality
 * in MIFF tests.
 */

export const mockModdingSystem = {
  getPluginInfo: jest.fn().mockReturnValue({
    name: 'test-plugin',
    version: '1.0.0',
    author: 'test-author'
  }),
  loadPlugin: jest.fn().mockReturnValue(Promise.resolve()),
  unloadPlugin: jest.fn().mockReturnValue(Promise.resolve())
};