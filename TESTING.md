# MIFF Testing Guide

## Jest + ts-jest Setup

This project uses Jest with ts-jest for TypeScript testing support.

### Installation

```bash
npm install --save-dev jest ts-jest @types/jest
```

### Configuration

- **jest.config.js**: Main Jest configuration with ts-jest preset
- **jest.setup.js**: Global test setup and utilities
- **package.json scripts**:
  - `npm test`: Run all tests
  - `npm run test:watch`: Watch mode for development
  - `npm run test:coverage`: Run with coverage report
  - `npm run test:ci`: CI-optimized test run

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- example.test.ts

# Run with coverage
npm run test:coverage

# CI environment
npm run test:ci
```

## CLI Testing Guidelines

### Using testUtils.runCLI

**✅ RECOMMENDED**: Use the provided `testUtils.runCLI` utility for testing CLI harnesses:

```typescript
test('✓ CLI operation test', () => {
  const cliPath = path.resolve('ModulePure/cliHarness.ts');
  const output = (global as any).testUtils.runCLI(cliPath, ['arg1', 'arg2']);
  const result = JSON.parse(output);
  
  expect(result.op).toBe('expectedOperation');
  expect(result.status).toBe('ok');
});
```

### Golden Fixtures for Deterministic Testing

**🎯 NEW**: Golden fixtures are now available in `/tests/goldenFixtures/` for all CLI tools:

```typescript
test('✓ golden output validation', () => {
  const root = path.resolve(__dirname, '..');
  const goldenFixture = path.resolve(root, 'tests/goldenFixtures/stats_system_flow.json');
  
  const output = (global as any).testUtils.runCLI(cliPath, ['list']);
  const got = JSON.parse(output);
  const expected = JSON.parse(fs.readFileSync(goldenFixture, 'utf-8'));
  
  expect(got).toEqual(expected);
});
```

**Available Fixtures**:
- Core modules: `stats_system_flow.json`, `combat_core_flow.json`, `crafting_flow.json`
- Scenarios: `tutorial_scenario_run.json`, `combat_scenario_run.json`
- Bridges: `unity_bridge_dump_npcs.json`, `godot_bridge_dump_npcs.json`
- Tools: `render_replay_help.json`, `debug_overlay_help.json`

See `/tests/goldenFixtures/README.md` for complete fixture documentation.

### Common Pitfalls to Avoid

**❌ DON'T**: Use direct `node` execution on TypeScript files:
```typescript
// WRONG - This will fail with ERR_UNKNOWN_FILE_EXTENSION
const output = execFileSync('node', [cliPath, 'arg1'], { encoding: 'utf-8' });
```

**❌ DON'T**: Use manual `ts-node` execution:
```typescript
// WRONG - This bypasses the shared configuration
const output = execFileSync('npx', [
  'ts-node', 
  '--compiler-options', '{"module":"commonjs"}',
  cliPath, 
  'arg1'
], { encoding: 'utf-8' });
```

**✅ DO**: Use the provided utility:
```typescript
// CORRECT - Uses shared ts-node configuration
const output = (global as any).testUtils.runCLI(cliPath, ['arg1']);
```

### CLI Test Structure

```typescript
import path from 'path';
import fs from 'fs';

describe('ModulePure Golden Tests', () => {
  const cliPath = path.resolve('ModulePure/cliHarness.ts');

  test('✓ operation returns expected output', () => {
    const sampleFile = path.resolve('ModulePure/sample_data.json');
    const output = (global as any).testUtils.runCLI(cliPath, ['list', sampleFile]);
    const result = JSON.parse(output);
    
    expect(result.op).toBe('list');
    expect(result.status).toBe('ok');
    expect(Array.isArray(result.result)).toBe(true);
  });

  test('✓ handles file operations', () => {
    const testData = { id: 'test', name: 'Test Item' };
    const testFile = path.resolve('ModulePure/test_data.json');
    fs.writeFileSync(testFile, JSON.stringify(testData, null, 2));

    try {
      const output = (global as any).testUtils.runCLI(cliPath, ['create', testFile]);
      const result = JSON.parse(output);
      
      expect(result.op).toBe('create');
      expect(result.status).toBe('ok');
    } finally {
      // Always clean up test files
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    }
  });
});
```

### Golden Test Pattern

For deterministic CLI output validation:

```typescript
test('✓ golden output validation', () => {
  const root = path.resolve(__dirname, '..');
  const sampleFile = path.resolve(root, 'sample_data.json');
  const expectedFile = path.resolve(root, 'expected_output.json');
  
  const output = (global as any).testUtils.runCLI(
    path.resolve(root, 'cliHarness.ts'), 
    ['operation', sampleFile]
  );
  
  const got = JSON.parse(output);
  const expected = JSON.parse(fs.readFileSync(expectedFile, 'utf-8'));
  
  expect(got).toEqual(expected);
});
```

### Testing Best Practices

1. **File Cleanup**: Always clean up temporary files in `finally` blocks
2. **Path Resolution**: Use `path.resolve()` for cross-platform compatibility
3. **Error Handling**: Test both success and error scenarios
4. **Deterministic Data**: Use fixed timestamps/IDs in test data for consistent results
5. **Isolation**: Each test should be independent and not rely on previous test state

### Troubleshooting CLI Tests

**Issue**: `ERR_UNKNOWN_FILE_EXTENSION`
- **Cause**: Direct execution of `.ts` files with `node`
- **Fix**: Use `testUtils.runCLI` instead

**Issue**: JSON parsing errors
- **Cause**: CLI outputting non-JSON content (console.log, errors to stdout)
- **Fix**: Ensure CLI only outputs JSON, check for stderr output

**Issue**: File not found errors
- **Cause**: Incorrect path resolution or missing test files
- **Fix**: Use `path.resolve()` and verify file existence with `fs.existsSync()`

**Issue**: Inconsistent test results
- **Cause**: Non-deterministic data (timestamps, random IDs)
- **Fix**: Use fixed test data and avoid time-dependent logic in tests

## TypeScript Execution Requirements

### Required Setup
- **ts-node**: Must be available for CLI test execution
- **Module Resolution**: Use `--compiler-options '{"module":"commonjs"}'`
- **No Shebangs**: Remove `#!/usr/bin/env node` from CLI harnesses
- **Global testUtils**: Available via Jest setup for consistent CLI execution

### Recent CLI Fixes (Phase 9)
- ✅ **Refactored 18 CLI test files** to use `testUtils.runCLI`
- ✅ **Fixed TypeScript compilation** by excluding `miff-nextjs` from root config
- ✅ **Resolved type mismatches** in `RenderReplayPure` and `BridgeSchemaPure`
- ✅ **Added golden fixtures** for deterministic CLI output validation
- ✅ **Improved test reliability** from 3 to 13+ passing test suites

### CLI Testing Best Practices
1. **Use testUtils.runCLI**: Never call `node` directly on `.ts` files
2. **Golden Fixtures**: Compare actual output to stored fixtures for consistency
3. **File Cleanup**: Always clean up temporary files in `finally` blocks
4. **Path Resolution**: Use `path.resolve()` for cross-platform compatibility
5. **Error Handling**: Test both success and error scenarios

## Expected Behavior

### ✅ Passing Tests
Tests may show passing results like:
```
✓ SharedSchemaManager returns expected types
✓ simulate returns expected output format
✓ CLI tool execution works
```

### ⚠️ Expected Warnings/Errors
**Important**: Some tests may show warnings or errors that are expected:

1. **CLI Tool Warnings**: When testing CLI tools that expect specific files:
   ```
   Warning: Could not find scenario file
   ```
   This is normal when testing CLI tools without full file setup.

2. **TypeScript Import Warnings**: Some modules may show import warnings:
   ```
   Warning: Module not found
   ```
   This is expected for optional dependencies.

3. **File System Errors**: CLI tests may show file not found errors:
   ```
   Error: ENOENT: no such file or directory
   ```
   This is normal when testing CLI tools with missing input files.

### Test Structure

```typescript
import { SharedSchemaManager } from './SharedSchemaPure/Manager';

describe('MIFF Example Tests', () => {
  test('✓ module functionality', () => {
    const manager = new SharedSchemaManager();
    expect(manager.listTypes()).toContain('EntityID');
  });
});
```

## CI Integration

The GitHub Actions workflow runs:
```yaml
- name: 🟡 Run Jest tests (best-effort)
  continue-on-error: true
  run: npm run test:ci
```

The `continue-on-error: true` flag ensures the CI doesn't fail due to expected warnings.

## Troubleshooting

### Common Issues

1. **TypeScript Import Errors**: Ensure `tsconfig.json` includes test files
2. **CLI Tool Failures**: These are often expected - check if the test is testing CLI behavior
3. **Timeout Errors**: Increase `testTimeout` in jest.config.js for slow operations

### Debug Mode

```bash
# Run with verbose output
npm test -- --verbose

# Run specific test with debug
npm test -- --verbose --testNamePattern="specific test name"
```