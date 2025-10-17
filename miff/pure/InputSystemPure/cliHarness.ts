/**
 * CLI Harness for InputSystemPure
 * 
 * Provides comprehensive CLI interface for input management including
 * input mapping, action binding, gesture recognition, and multi-format export.
 * 
 * @module InputSystemPure/cliHarness
 * @version 1.0.0
 * @license MIT
 */

import { InputSystemManager, InputEvent, InputAction, InputBinding, InputGesture } from './Manager';
import { parseCLIArgs, formatOutput } from '../shared/cliHarnessUtils';

const { mode, args } = parseCLIArgs(process.argv);
const manager = new InputSystemManager();

// Parse additional arguments
const profileId = args.find(arg => arg.startsWith('--profile-id='))?.split('=')[1] || 'default';
const actionId = args.find(arg => arg.startsWith('--action-id='))?.split('=')[1] || 'test_action';
const bindingId = args.find(arg => arg.startsWith('--binding-id='))?.split('=')[1] || 'test_binding';
const eventType = args.find(arg => arg.startsWith('--event-type='))?.split('=')[1] as 'key' | 'mouse' | 'touch' | 'gamepad' | 'gesture' || 'key';
const eventCode = args.find(arg => arg.startsWith('--event-code='))?.split('=')[1] || 'Space';
const eventValue = parseFloat(args.find(arg => arg.startsWith('--event-value='))?.split('=')[1] || '1');
const gestureType = args.find(arg => arg.startsWith('--gesture-type='))?.split('=')[1] as 'swipe' | 'pinch' | 'rotate' | 'tap' | 'hold' | 'drag' || 'tap';
const gestureDistance = parseFloat(args.find(arg => arg.startsWith('--gesture-distance='))?.split('=')[1] || '100');
const format = args.find(arg => arg.startsWith('--format='))?.split('=')[1] as 'json' | 'manifest' | 'summary' | 'events' || 'json';

let output: any;

try {
  switch (mode) {
    case 'create-profile':
      const profileName = args.find(arg => arg.startsWith('--name='))?.split('=')[1] || 'Test Profile';
      const profileDescription = args.find(arg => arg.startsWith('--description='))?.split('=')[1] || 'Test profile description';
      output = manager.createProfile(profileId, profileName, profileDescription);
      break;

    case 'set-profile':
      output = manager.setActiveProfile(profileId);
      break;

    case 'get-profile':
      output = manager.getActiveProfile();
      break;

    case 'add-action':
      const action: InputAction = {
        id: actionId,
        name: args.find(arg => arg.startsWith('--name='))?.split('=')[1] || 'Test Action',
        description: args.find(arg => arg.startsWith('--description='))?.split('=')[1] || 'Test action description',
        category: args.find(arg => arg.startsWith('--category='))?.split('=')[1] || 'general',
        defaultBindings: [],
        modifiers: args.includes('--modifiers') ? JSON.parse(args.find(arg => arg.startsWith('--modifiers='))!.split('=')[1]) : [],
        priority: parseInt(args.find(arg => arg.startsWith('--priority='))?.split('=')[1] || '1'),
        enabled: !args.includes('--disabled')
      };
      output = manager.addAction(action);
      break;

    case 'add-binding':
      const binding: InputBinding = {
        id: bindingId,
        actionId: actionId,
        inputType: eventType,
        code: eventCode,
        modifiers: args.includes('--modifiers') ? JSON.parse(args.find(arg => arg.startsWith('--modifiers='))!.split('=')[1]) : [],
        conditions: args.includes('--conditions') ? JSON.parse(args.find(arg => arg.startsWith('--conditions='))!.split('=')[1]) : [],
        enabled: !args.includes('--disabled')
      };
      output = manager.addBinding(binding);
      break;

    case 'process-event':
      const event: InputEvent = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: eventType,
        code: eventCode,
        value: eventValue,
        timestamp: new Date(),
        source: args.find(arg => arg.startsWith('--source='))?.split('=')[1] || 'cli'
      };
      output = manager.processInputEvent(event);
      break;

    case 'recognize-gesture':
      const gesture: InputGesture = {
        id: `gesture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: gestureType,
        startPosition: { x: 0, y: 0 },
        endPosition: { x: gestureDistance, y: 0 },
        direction: 'right',
        distance: gestureDistance,
        duration: parseInt(args.find(arg => arg.startsWith('--duration='))?.split('=')[1] || '100'),
        timestamp: new Date()
      };
      output = manager.recognizeGesture(gesture);
      break;

    case 'stats':
      output = manager.getInputStats();
      break;

    case 'recent-events':
      const limit = parseInt(args.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '100');
      output = manager.getRecentEvents(limit);
      break;

    case 'clear-history':
      output = manager.clearHistory();
      break;

    case 'export':
      output = manager.exportInput(format);
      break;

    case 'reset':
      output = manager.resetInput();
      break;

    case 'demo':
      // Create demo input scenarios
      manager.createProfile('demo_profile', 'Demo Profile', 'Demo input profile');
      manager.setActiveProfile('demo_profile');

      // Add demo actions
      const demoActions = [
        {
          id: 'move_forward',
          name: 'Move Forward',
          description: 'Move character forward',
          category: 'movement',
          defaultBindings: [],
          modifiers: [],
          priority: 1,
          enabled: true
        },
        {
          id: 'jump',
          name: 'Jump',
          description: 'Jump action',
          category: 'action',
          defaultBindings: [],
          modifiers: [],
          priority: 2,
          enabled: true
        },
        {
          id: 'attack',
          name: 'Attack',
          description: 'Attack action',
          category: 'combat',
          defaultBindings: [],
          modifiers: [],
          priority: 3,
          enabled: true
        }
      ];

      demoActions.forEach((action: any) => manager.addAction(action));

      // Add demo bindings
      const demoBindings = [
        {
          id: 'move_forward_w',
          actionId: 'move_forward',
          inputType: 'key' as const,
          code: 'KeyW',
          modifiers: [],
          conditions: [],
          enabled: true
        },
        {
          id: 'jump_space',
          actionId: 'jump',
          inputType: 'key' as const,
          code: 'Space',
          modifiers: [],
          conditions: [],
          enabled: true
        },
        {
          id: 'attack_mouse',
          actionId: 'attack',
          inputType: 'mouse' as const,
          code: 'Mouse0',
          modifiers: [],
          conditions: [],
          enabled: true
        }
      ];

      demoBindings.forEach((binding: any) => manager.addBinding(binding));

      // Process demo events
      const demoEvents = [
        { type: 'key', code: 'KeyW', value: 1 },
        { type: 'key', code: 'Space', value: 1 },
        { type: 'mouse', code: 'Mouse0', value: 1 },
        { type: 'key', code: 'KeyW', value: 0 }
      ];

      const eventResults = demoEvents.map(eventData => {
        const event: InputEvent = {
          id: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: eventData.type as any,
          code: eventData.code,
          value: eventData.value,
          timestamp: new Date(),
          source: 'demo'
        };
        return manager.processInputEvent(event);
      });

      // Recognize demo gestures
      const demoGesture: InputGesture = {
        id: `demo_gesture_${Date.now()}`,
        type: 'swipe',
        startPosition: { x: 0, y: 0 },
        endPosition: { x: 100, y: 0 },
        direction: 'right',
        distance: 100,
        duration: 200,
        timestamp: new Date()
      };
      const gestureResult = manager.recognizeGesture(demoGesture);

      output = {
        op: 'demo',
        status: 'ok',
        result: {
          message: 'Demo input scenarios completed',
          profile: manager.getActiveProfile().result,
          eventResults,
          gestureResult: gestureResult.result,
          stats: manager.getInputStats().result
        }
      };
      break;

    case 'sample':
      // Create sample input scenarios
      const sampleScenarios = [
        {
          id: 'keyboard_scenario',
          profile: 'keyboard_profile',
          actions: [
            { id: 'move_up', name: 'Move Up', category: 'movement' },
            { id: 'move_down', name: 'Move Down', category: 'movement' },
            { id: 'move_left', name: 'Move Left', category: 'movement' },
            { id: 'move_right', name: 'Move Right', category: 'movement' }
          ],
          bindings: [
            { actionId: 'move_up', inputType: 'key', code: 'KeyW' },
            { actionId: 'move_down', inputType: 'key', code: 'KeyS' },
            { actionId: 'move_left', inputType: 'key', code: 'KeyA' },
            { actionId: 'move_right', inputType: 'key', code: 'KeyD' }
          ]
        },
        {
          id: 'gamepad_scenario',
          profile: 'gamepad_profile',
          actions: [
            { id: 'jump', name: 'Jump', category: 'action' },
            { id: 'attack', name: 'Attack', category: 'combat' },
            { id: 'block', name: 'Block', category: 'combat' }
          ],
          bindings: [
            { actionId: 'jump', inputType: 'gamepad', code: 'ButtonA' },
            { actionId: 'attack', inputType: 'gamepad', code: 'ButtonX' },
            { actionId: 'block', inputType: 'gamepad', code: 'ButtonY' }
          ]
        }
      ];

      const scenarioResults = sampleScenarios.map((scenario: any) => {
        manager.createProfile(scenario.profile, `${scenario.profile} Profile`, `Sample ${scenario.profile} profile`);
        manager.setActiveProfile(scenario.profile);

        scenario.actions.forEach((action: any) => {
          manager.addAction({
            id: action.id,
            name: action.name,
            description: `${action.name} action`,
            category: action.category,
            defaultBindings: [],
            modifiers: [],
            priority: 1,
            enabled: true
          });
        });

        scenario.bindings.forEach((binding: any) => {
          manager.addBinding({
            id: `${binding.actionId}_${binding.code}`,
            actionId: binding.actionId,
            inputType: binding.inputType as any,
            code: binding.code,
            modifiers: [],
            conditions: [],
            enabled: true
          });
        });

        return {
          scenario: scenario.id,
          profile: scenario.profile,
          actions: scenario.actions.length,
          bindings: scenario.bindings.length
        };
      });

      output = {
        op: 'sample',
        status: 'ok',
        result: {
          message: 'Sample input scenarios created',
          scenarios: scenarioResults
        }
      };
      break;

    default:
      output = {
        op: 'help',
        status: 'ok',
        result: {
          availableCommands: [
            'create-profile --profile-id=<id> --name=<name> [--description=<desc>]',
            'set-profile --profile-id=<id>',
            'get-profile',
            'add-action --action-id=<id> --name=<name> [--category=<cat>] [--priority=<num>] [--modifiers=<json>]',
            'add-binding --binding-id=<id> --action-id=<id> --input-type=<type> --code=<code> [--modifiers=<json>] [--conditions=<json>]',
            'process-event --event-type=<type> --event-code=<code> [--event-value=<val>] [--source=<src>]',
            'recognize-gesture --gesture-type=<type> --gesture-distance=<dist> [--duration=<ms>]',
            'stats',
            'recent-events [--limit=<num>]',
            'clear-history',
            'export --format=<json|manifest|summary|events>',
            'reset',
            'demo',
            'sample'
          ],
          examples: [
            'node cliHarness.ts create-profile --profile-id=game --name="Game Profile"',
            'node cliHarness.ts add-action --action-id=jump --name="Jump" --category=action',
            'node cliHarness.ts add-binding --binding-id=jump_space --action-id=jump --input-type=key --code=Space',
            'node cliHarness.ts process-event --event-type=key --event-code=Space --event-value=1',
            'node cliHarness.ts export --format=manifest'
          ]
        }
      };
  }
} catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
  output = {
    op: mode || 'unknown',
    status: 'error',
    issues: [error instanceof Error ? message: 'Unknown error']
  };
}

// Output valid JSON to stdout for test runner to consume
console.log(formatOutput(output));