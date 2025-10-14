/**
 * Mock File System
 * 
 * Provides mock implementations for file system functionality
 * in MIFF tests.
 */

export const mockFileSystem = {
  readFileSync: jest.fn().mockImplementation((path: string) => {
    if (path.includes('package.json')) {
      return '{"name": "test-package", "version": "1.0.0"}';
    }
    return '{}';
  }),
  writeFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true)
};