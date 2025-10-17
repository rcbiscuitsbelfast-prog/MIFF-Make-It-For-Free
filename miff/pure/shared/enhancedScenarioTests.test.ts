/**
 * Enhanced Scenario Tests with Fixture Injection
 * 
 * This module provides comprehensive tests for the enhanced CLI harness functionality
 * with proper scenario orchestration and fixture injection.
 * 
 * @module enhancedScenarioTests
 * @version 1.0.0
 * @license MIT
 */

import { runCLI, registerReplayHooks, loadFixtureForScenario, validationChecklist } from './enhancedCliHarnessUtils';
import * as path from 'path';

/**
 * Test suite for enhanced scenario orchestration
 */
describe('Enhanced Scenario Orchestration', () => {
  
  // Test each scenario type with fixture injection
  Object.entries({
    TimeSystemPure: 'time_system',
    SpiritTamerDemoPure: 'spirit_tamer_demo', 
    WitcherExplorerDemoPure: 'witcher_explorer_demo',
    QuestScenarioPure: 'quest_scenario',
    CombatCorePure: 'combat_core',
    SkillTreePure: 'skill_tree',
    VisualReplaySystemPure: 'visual_replay'
  }).forEach(([moduleName, scenarioId]) => {
    
    test(`${moduleName} scenario`, async () => {
      const fixture = loadFixtureForScenario(moduleName);
      const cliPath = path.resolve(`miff/pure/${moduleName}/cliHarness.ts`);
      
      const result = await runCLI(cliPath, []);
      const parsedResult = JSON.parse(result);
      
      // Validate runCLI returns proper format with full payload
      if (scenarioId === 'visual_replay') {
        expect(parsedResult.op).toBe("replay");
        expect(parsedResult.session).toBeDefined();
        expect(parsedResult.frames).toBeDefined();
        expect(parsedResult.statistics).toBeDefined();
      } else if (scenarioId === 'toppler_physics_demo') {
        expect(parsedResult.op).toBe("scenario");
        expect(parsedResult.timeline).toBeDefined();
        expect(parsedResult.issues).toBeDefined();
      } else {
        expect(validationChecklist.runCLIReturnsValidFormat(parsedResult)).toBe(true);
        expect(parsedResult.op).toBe("runScenario");
        expect(parsedResult.finalState).toBeDefined();
        expect(parsedResult.outputs).toBeDefined();
        expect(parsedResult.logs).toBeDefined();
      }
      expect(parsedResult.scenarioId).toBe(scenarioId);
    });
  });

  test('VisualReplaySystemPure hook registration', () => {
    const mockSystem = {
      on: jest.fn(),
      hooks: [
        { name: 'player_sprite', type: 'sprite', id: 'player_sprite' },
        { name: 'block_sprite', type: 'sprite', id: 'block_sprite' }
      ]
    };

    registerReplayHooks(mockSystem);

    // Verify hook registration logging
    expect(mockSystem.on).toHaveBeenCalledWith("hookRegistered", expect.any(Function));
    expect(mockSystem.on).toHaveBeenCalledWith("replayStart", expect.any(Function));
    expect(mockSystem.on).toHaveBeenCalledWith("replayEnd", expect.any(Function));
    expect(mockSystem.on).toHaveBeenCalledWith("hookError", expect.any(Function));
  });

  test('Unresolved hooks detection', () => {
    const mockSystem = {
      on: jest.fn(),
      hooks: [
        { name: 'player_sprite', type: 'sprite', id: 'player_sprite' },
        { name: '', type: 'sprite', id: 'incomplete_hook' }, // Incomplete hook
        // Missing required hooks: block_sprite, jump_sound, jump_particles
      ]
    };

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    registerReplayHooks(mockSystem);
    
    // Simulate replay start to trigger unresolved hook detection
    const replayStartHandler = mockSystem.on.mock.calls.find(call => call[0] === "replayStart")[1];
    replayStartHandler();

    // Verify unresolved hooks warning was logged
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ReplayHook] Unresolved hooks:'),
      expect.any(Array)
    );

    consoleSpy.mockRestore();
  });

  test('Fixture injection validation', () => {
    const scenarios = ['TimeSystemPure', 'SpiritTamerDemoPure', 'WitcherExplorerDemoPure', 'QuestScenarioPure'];
    
    scenarios.forEach(scenario => {
      const fixture = loadFixtureForScenario(scenario);
      expect(validationChecklist.fixturesInjected(scenario)).toBe(true);
      expect(fixture).toBeDefined();
      expect(typeof fixture).toBe('object');
    });
  });

  test('Scenario execution with proper final state', async () => {
    const testCases = [
      {
        module: 'CombatCorePure',
        expectedState: { entities: expect.any(Object), combatLog: expect.any(Array) }
      },
      {
        module: 'SkillTreePure', 
        expectedState: { unlocked: expect.any(Array), available: expect.any(Array), progression: expect.any(Number) }
      },
      {
        module: 'TimeSystemPure',
        expectedState: { time: expect.any(Number), timers: expect.any(Array), cooldowns: expect.any(Array) }
      }
    ];

    for (const testCase of testCases) {
      const cliPath = path.resolve(`miff/pure/${testCase.module}/cliHarness.ts`);
      const result = await runCLI(cliPath, []);
      const parsedResult = JSON.parse(result);
      
      expect(parsedResult.finalState).toMatchObject(testCase.expectedState);
    }
  });

  test('Output extraction for different scenario types', async () => {
    const testCases = [
      {
        module: 'CombatCorePure',
        expectedOutputs: expect.arrayContaining([
          expect.objectContaining({ op: 'list' }),
          expect.objectContaining({ attackerId: 'hero' }),
          expect.objectContaining({ op: 'dump' })
        ])
      },
      {
        module: 'SkillTreePure',
        expectedOutputs: expect.arrayContaining([
          expect.objectContaining({ op: 'list' }),
          expect.objectContaining({ op: 'unlock' }),
          expect.objectContaining({ op: 'dump' })
        ])
      }
    ];

    for (const testCase of testCases) {
      const cliPath = path.resolve(`miff/pure/${testCase.module}/cliHarness.ts`);
      const result = await runCLI(cliPath, []);
      const parsedResult = JSON.parse(result);
      
      expect(parsedResult.outputs).toEqual(testCase.expectedOutputs);
    }
  });

  test('Log collection and formatting', async () => {
    const cliPath = path.resolve('miff/pure/CombatCorePure/cliHarness.ts');
    const result = await runCLI(cliPath, []);
    const parsedResult = JSON.parse(result);
    
    expect(parsedResult.logs).toBeDefined();
    expect(Array.isArray(parsedResult.logs)).toBe(true);
    expect(parsedResult.logs.length).toBeGreaterThan(0);
    
    // Verify log format
    parsedResult.logs.forEach((log: string) => {
      expect(log).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });
  });

  test('Error handling for unknown scenarios', async () => {
    const cliPath = path.resolve('miff/pure/UnknownModule/cliHarness.ts');
    const result = await runCLI(cliPath, []);
    const parsedResult = JSON.parse(result);
    
    // Should fall back to demo mode
    expect(parsedResult.op).toBe('demo');
    expect(parsedResult.status).toBe('ok');
    expect(parsedResult.data).toBeDefined();
  });

  test('Backward compatibility with existing mock responses', async () => {
    const cliPath = path.resolve('miff/pure/TopplerDemoPure/cliHarness.ts');
    const result = await runCLI(cliPath, []);
    const parsedResult = JSON.parse(result);
    
    // Should return scenario format for TopplerDemoPure
    expect(parsedResult.op).toBe('scenario');
    expect(parsedResult.timeline).toBeDefined();
    expect(parsedResult.issues).toBeDefined();
  });
});

/**
 * Integration tests for VisualReplaySystemPure
 */
describe('VisualReplaySystemPure Integration', () => {
  
  test('Complete replay session with all hooks', async () => {
    const cliPath = path.resolve('miff/pure/VisualReplaySystemPure/cliHarness.ts');
    const result = await runCLI(cliPath, []);
    const parsedResult = JSON.parse(result);
    
    // Should return replay format
    expect(parsedResult.op).toBe('replay');
    expect(parsedResult.session).toBeDefined();
    expect(parsedResult.frames).toBeDefined();
    expect(parsedResult.statistics).toBeDefined();
    
    // Verify session structure
    expect(parsedResult.session.id).toMatch(/^replay_/);
    expect(parsedResult.session.scenarioId).toBe('toppler_physics_demo');
    expect(parsedResult.session.version).toBe('1.0.0');
    expect(parsedResult.session.frameCount).toBe(3);
    
    // Verify frames have visual hooks
    expect(parsedResult.frames).toHaveLength(3);
    parsedResult.frames.forEach((frame: any) => {
      expect(frame.visualHooks).toBeDefined();
      expect(Array.isArray(frame.visualHooks)).toBe(true);
    });
    
    // Verify statistics
    expect(parsedResult.statistics.totalFrames).toBe(3);
    expect(parsedResult.statistics.duration).toBe(32);
    expect(parsedResult.statistics.frameRate).toBe(60);
  });

  test('Hook registration with complete system', () => {
    const mockSystem = {
      on: jest.fn(),
      hooks: [
        { name: 'player_sprite', type: 'sprite', id: 'player_sprite' },
        { name: 'block_sprite', type: 'sprite', id: 'block_sprite' },
        { name: 'jump_sound', type: 'sound', id: 'jump_sound' },
        { name: 'jump_particles', type: 'particles', id: 'jump_particles' }
      ]
    };

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    registerReplayHooks(mockSystem);
    
    // Simulate hook registration
    const hookRegisteredHandler = mockSystem.on.mock.calls.find(call => call[0] === "hookRegistered")[1];
    mockSystem.hooks.forEach(hook => hookRegisteredHandler(hook));

    // Verify all hooks were logged
    expect(consoleSpy).toHaveBeenCalledWith('[ReplayHook] Registered: player_sprite');
    expect(consoleSpy).toHaveBeenCalledWith('[ReplayHook] Registered: block_sprite');
    expect(consoleSpy).toHaveBeenCalledWith('[ReplayHook] Registered: jump_sound');
    expect(consoleSpy).toHaveBeenCalledWith('[ReplayHook] Registered: jump_particles');

    consoleSpy.mockRestore();
  });
});

/**
 * Performance and reliability tests
 */
describe('Performance and Reliability', () => {
  
  test('Concurrent scenario execution', async () => {
    const scenarios = [
      'CombatCorePure',
      'SkillTreePure', 
      'TimeSystemPure',
      'VisualReplaySystemPure'
    ];

    const promises = scenarios.map(scenario => {
      const cliPath = path.resolve(`miff/pure/${scenario}/cliHarness.ts`);
      return runCLI(cliPath, []);
    });

    const results = await Promise.all(promises);
    
    // All scenarios should complete successfully
    results.forEach(result => {
      const parsed = JSON.parse(result);
      expect(parsed.status).toBe('ok');
    });
  });

  test('Memory usage with large scenarios', async () => {
    const cliPath = path.resolve('miff/pure/VisualReplaySystemPure/cliHarness.ts');
    
    // Run multiple times to test memory stability
    for (let i = 0; i < 10; i++) {
      const result = await runCLI(cliPath, []);
      const parsed = JSON.parse(result);
      expect(parsed.op).toBe('replay');
    }
  });

  test('Error recovery and graceful degradation', async () => {
    // Test with invalid path
    const result = await runCLI('/invalid/path/cliHarness.ts', []);
    const parsed = JSON.parse(result);
    
    expect(parsed.op).toBe('error');
    expect(parsed.status).toBe('error');
    expect(parsed.error).toBeDefined();
  });
});