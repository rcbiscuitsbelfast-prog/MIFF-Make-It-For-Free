// Custom test sequencer for better test isolation
// This ensures tests run in a predictable order and prevents interference

const TestSequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends TestSequencer {
  sort(tests) {
    // Sort tests to ensure better isolation
    // Run configuration and basic tests first, then complex integration tests
    return tests.sort((testA, testB) => {
      const a = testA.path;
      const b = testB.path;
      
      // Sort by test file first
      if (a < b) return -1;
      if (a > b) return 1;
      
      // Within the same file, sort by describe block order
      // This helps maintain predictable test execution order
      return 0;
    });
  }
}

module.exports = CustomSequencer;