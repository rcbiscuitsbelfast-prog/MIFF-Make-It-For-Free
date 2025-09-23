/**
 * Jest Setup File
 *
 * Minimal setup for MIFF testing
 * @module jest.setup
 * @version 1.0.0
 * @license MIT
 */

// Basic setup for Jest testing environment
(function bootstrapTestEnv() {
  try {
    const fs = require('fs');
    const path = require('path');

    // 1) Ensure top-level symlinks for modules under miff/pure so tests that
    //    use path.resolve('ModulePure/cliHarness.ts') can find the files.
    const rootDir = process.cwd();
    const pureRoot = path.join(rootDir, 'miff', 'pure');
    if (fs.existsSync(pureRoot)) {
      const entries = fs.readdirSync(pureRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const target = path.join(pureRoot, entry.name);
        const link = path.join(rootDir, entry.name);
        try {
          if (!fs.existsSync(link)) {
            fs.symlinkSync(target, link, 'dir');
          }
        } catch (_) {
          // no-op if symlink cannot be created (e.g., already exists or perms)
        }
      }
    }
  } catch (e) {
    // best-effort setup; ignore errors to avoid breaking tests
  }
})();

// Basic mocking for common browser APIs

// Mock global objects and functions needed by tests
global.testUtils = {
  runCLI: function(cliPath, args = []) {
    const path = require('path');
    const { execFileSync } = require('child_process');
    const absCliPath = path.isAbsolute(cliPath) ? cliPath : path.resolve(cliPath);

    try {
      const output = execFileSync('npx', ['tsx', absCliPath, ...args], {
        cwd: path.dirname(absCliPath),
        encoding: 'utf-8',
        timeout: 25000
      });
      return output;
    } catch (error) {
      throw error;
    }
  }
};

// Mock common browser APIs
global.requestAnimationFrame = jest.fn().mockReturnValue(1);
global.cancelAnimationFrame = jest.fn();
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));