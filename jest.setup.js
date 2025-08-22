// Jest setup file for MIFF tests
// This runs before each test file

// Set test timeout for CLI operations
jest.setTimeout(10000);

// Mock console.error to reduce noise in tests
const originalError = console.error;
console.error = (...args) => {
  // Only show errors that aren't from our CLI tools
  if (!args[0]?.includes?.('miff-')) {
    originalError(...args);
  }
};

// Global test utilities
global.testUtils = {
  loadScenario: (path) => {
    const fs = require('fs');
    return JSON.parse(fs.readFileSync(path, 'utf-8'));
  },
  runCLI: (script, args = []) => {
    const { execFileSync } = require('child_process');
    return execFileSync('npx', ['ts-node', '--compiler-options', '{"module":"commonjs"}', script, ...args], { 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
  }
};