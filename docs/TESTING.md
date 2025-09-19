# Testing Configuration

## Jest Configuration

The canonical Jest configuration for MIFF is `jest.pure.config.cjs`. This configuration is optimized for testing pure modules and includes:

- **Test Environment**: jsdom (for DOM testing)
- **Setup**: Uses `jest.setup.js` for global test setup
- **Worker Configuration**: Limited to 1 worker to avoid IPC issues
- **Test Patterns**: Focuses on `miff/pure/**/tests/**/*.test.ts` and `src/modules/**/tests/**/*.test.ts`
- **Timeout**: 15 seconds for complex tests
- **Transform**: Uses @swc/jest for TypeScript compilation

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test.test.ts
```

## Test Structure

Tests are organized under each module's `tests/` directory:
- `golden_*.test.ts` - Golden master tests for module outputs
- `*.errors.test.ts` - Error path testing
- `*.flow.test.ts` - Flow/sequence testing
- `*.large.test.ts` - Large dataset testing

## Legacy Configurations

The following Jest configurations have been removed as redundant:
- `jest.config.cjs` (node environment)
- `jest.config.js` (jsdom environment)

All testing now uses the unified `jest.pure.config.cjs` configuration.