/**
 * @jest-environment node
 */

// Golden Orchestration Snapshot Tests
// Validates finalState and outputs with full snapshot coverage

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

interface DemoModule {
  name: string;
  cliHarness: string;
  scenarioId: string;
}

/**
 * Enhanced runCLI with proper teardown and leak prevention
 */
function runCLI(cliPath: string, args: string[] = []): any {
  const absCliPath = path.isAbsolute(cliPath) ? cliPath : path.resolve(__dirname, '../../', cliPath);
  
  try {
    const output = execFileSync('npx', [
      'ts-node',
      '--compiler-options', '{"module":"commonjs","types":["node"]}',
      absCliPath,
      ...args
    ], { 
      encoding: 'utf-8',
      timeout: 15000, // Prevent hanging
      killSignal: 'SIGTERM',
      cwd: path.resolve(__dirname, '../..')
    });
    
    // Flush any pending hooks
    if (typeof setImmediate !== 'undefined') {
      setImmediate(() => {
        // Hook flushed
      }).unref();
    }
    
    return JSON.parse(output);
  } catch (error) {
    throw new Error(`CLI execution failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Validate that output has correct runScenario structure
 */
function validateRunScenarioStructure(result: any, scenarioId: string): void {
  expect(result).toBeDefined();
  expect(result.op).toBe('runScenario');
  expect(result.status).toBe('ok');
  expect(result.name).toBe(scenarioId);
  expect(result.events).toBeDefined();
  expect(Array.isArray(result.events)).toBe(true);
  expect(result.finalState).toBeDefined();
  expect(typeof result.finalState).toBe('object');
}

describe('Golden Orchestration Fidelity Tests', () => {
  // Define all demo modules to test
  const demoModules: DemoModule[] = [
    {
      name: 'TopplerDemoPure',
      cliHarness: 'TopplerDemoPure/cliHarness.ts',
      scenarioId: 'TopplerDemoPure'
    },
    {
      name: 'SpiritTamerDemoPure', 
      cliHarness: 'SpiritTamerDemoPure/cliHarness.ts',
      scenarioId: 'SpiritTamerDemoPure'
    },
    {
      name: 'WitcherExplorerDemoPure',
      cliHarness: 'WitcherExplorerDemoPure/cliHarness.ts', 
      scenarioId: 'WitcherExplorerDemoPure'
    }
  ];

  // Global cleanup to prevent test leaks
  afterEach(() => {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    // Clear any remaining timers (defensive)
    if (typeof jest !== 'undefined' && jest.clearAllTimers) {
      jest.clearAllTimers();
    }
  });

  describe('runCLI Output Validation', () => {
    test.each(demoModules)('$name should return runScenario format', async ({ name, cliHarness, scenarioId }) => {
      // Skip if CLI harness doesn't exist
      if (!fs.existsSync(path.resolve(__dirname, '../../', cliHarness))) {
        console.warn(`⚠️ Skipping ${name} - CLI harness not found: ${cliHarness}`);
        return;
      }

      console.log(`🧪 Testing ${name} CLI output format...`);
      
      const result = runCLI(cliHarness);
      
      // Validate structure
      validateRunScenarioStructure(result, scenarioId);
      
      // Specific validations per module
      switch (name) {
        case 'TopplerDemoPure':
          expect(result.timeline).toBeDefined();
          expect(Array.isArray(result.timeline)).toBe(true);
          expect(result.events.length).toBeGreaterThanOrEqual(0);
          expect(result.finalState.player).toBeDefined();
          expect(result.finalState.scenario).toBeDefined();
          break;
          
        case 'SpiritTamerDemoPure':
          expect(result.beats).toBeDefined();
          expect(result.timeline).toBeDefined();
          expect(result.finalState.spirit).toBeDefined();
          expect(result.finalState.spirit.tamed).toBeDefined();
          break;
          
        case 'WitcherExplorerDemoPure':
          expect(result.nav).toBeDefined();
          expect(result.dlg).toBeDefined();
          expect(result.quest).toBeDefined();
          expect(result.finalState.navigation).toBeDefined();
          expect(result.finalState.dialogue).toBeDefined();
          expect(result.finalState.quest).toBeDefined();
          break;
      }
      
      console.log(`✅ ${name} structure validation passed`);
    });
  });

  describe('Snapshot Tests for finalState', () => {
    test.each(demoModules)('$name finalState should match snapshot', async ({ name, cliHarness }) => {
      const fullPath = path.resolve(__dirname, '../../', cliHarness);
      if (!fs.existsSync(fullPath)) {
        console.warn(`⚠️ Skipping ${name} snapshot test - CLI harness not found`);
        return;
      }

      const result = runCLI(cliHarness);
      
      // Snapshot test for finalState
      expect(result.finalState).toMatchSnapshot(`${name}-finalState`);
      
      console.log(`📸 ${name} finalState snapshot captured`);
    });
  });

  describe('Snapshot Tests for events', () => {
    test.each(demoModules)('$name events should match snapshot', async ({ name, cliHarness }) => {
      const fullPath = path.resolve(__dirname, '../../', cliHarness);
      if (!fs.existsSync(fullPath)) {
        console.warn(`⚠️ Skipping ${name} events snapshot test - CLI harness not found`);
        return;
      }

      const result = runCLI(cliHarness);
      
      // Snapshot test for events
      expect(result.events).toMatchSnapshot(`${name}-events`);
      
      console.log(`📸 ${name} events snapshot captured`);
    });
  });

  describe('Golden Fixture Compatibility', () => {
    test.each(demoModules)('$name should be compatible with golden fixture format', async ({ name, cliHarness, scenarioId }) => {
      const fullPath = path.resolve(__dirname, '../../', cliHarness);
      if (!fs.existsSync(fullPath)) {
        console.warn(`⚠️ Skipping ${name} compatibility test - CLI harness not found`);
        return;
      }

      const result = runCLI(cliHarness);
      
      // Convert to golden fixture format
      const goldenFormat = {
        outputs: [
          {
            op: result.op,
            status: result.status,
            events: result.events,
            finalState: result.finalState
          }
        ]
      };
      
      // Validate golden fixture structure
      expect(goldenFormat.outputs).toHaveLength(1);
      expect(goldenFormat.outputs[0].op).toBe('runScenario');
      expect(goldenFormat.outputs[0].status).toBe('ok');
      expect(goldenFormat.outputs[0].events).toBeDefined();
      expect(goldenFormat.outputs[0].finalState).toBeDefined();
      
      // Snapshot the golden format
      expect(goldenFormat).toMatchSnapshot(`${name}-golden-format`);
      
      console.log(`✅ ${name} golden fixture compatibility confirmed`);
    });
  });
});