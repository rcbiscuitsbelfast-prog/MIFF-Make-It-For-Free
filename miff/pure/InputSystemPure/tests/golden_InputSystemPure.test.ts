/**
 * Golden Tests for InputSystemPure
 * 
 * Tests input management, action binding, gesture recognition,
 * and export functionality with comprehensive scenarios.
 * 
 * @module InputSystemPure/tests/golden_InputSystemPure.test
 * @version 1.0.0
 * @license MIT
 */

import { InputSystemManager, InputEvent, InputAction, InputBinding, InputGesture } from '../Manager';

describe('InputSystemPure Golden Tests', () => {
  let manager: InputSystemManager;

  beforeEach(() => {
    manager = new InputSystemManager();
  });

  describe('Profile Management', () => {
    test('should create and manage input profiles', () => {
      const createResult = manager.createProfile('test_profile', 'Test Profile', 'Test input profile');
      expect(createResult.status).toBe('ok');
      expect((createResult.result as any)?.id).toBe('test_profile');
      expect((createResult.result as any)?.name).toBe('Test Profile');

      const setResult = manager.setActiveProfile('test_profile');
      expect(setResult.status).toBe('ok');

      const getResult = manager.getActiveProfile();
      expect(getResult.status).toBe('ok');
      expect((getResult.result as any)?.id).toBe('test_profile');
    });

    test('should handle duplicate profile creation', () => {
      manager.createProfile('duplicate_test', 'Duplicate Test');
      const duplicateResult = manager.createProfile('duplicate_test', 'Duplicate Test');
      expect(duplicateResult.status).toBe('error');
      expect(duplicateResult.issues).toContain('Profile with ID duplicate_test already exists');
    });

    test('should handle invalid profile operations', () => {
      const setResult = manager.setActiveProfile('nonexistent');
      expect(setResult.status).toBe('error');
      expect(setResult.issues).toContain('Profile with ID nonexistent not found');
    });
  });

  describe('Action Management', () => {
    test('should add and manage input actions', () => {
      const action: InputAction = {
        id: 'test_action',
        name: 'Test Action',
        description: 'Test action description',
        category: 'general',
        defaultBindings: [],
        modifiers: [],
        priority: 1,
        enabled: true
      };

      const addResult = manager.addAction(action);
      expect(addResult.status).toBe('ok');
      expect((addResult.result as any)?.id).toBe('test_action');
    });

    test('should handle actions without active profile', () => {
      manager.resetInput(); // Clear default profile
      const action: InputAction = {
        id: 'test_action',
        name: 'Test Action',
        description: 'Test action description',
        category: 'general',
        defaultBindings: [],
        modifiers: [],
        priority: 1,
        enabled: true
      };

      const addResult = manager.addAction(action);
      expect(addResult.status).toBe('error');
      expect(addResult.issues).toContain('No active profile set');
    });
  });

  describe('Binding Management', () => {
    test('should add and manage input bindings', () => {
      const binding: InputBinding = {
        id: 'test_binding',
        actionId: 'test_action',
        inputType: 'key',
        code: 'Space',
        modifiers: [],
        conditions: [],
        enabled: true
      };

      const addResult = manager.addBinding(binding);
      expect(addResult.status).toBe('ok');
      expect((addResult.result as any)?.id).toBe('test_binding');
    });

    test('should handle bindings without active profile', () => {
      manager.resetInput(); // Clear default profile
      const binding: InputBinding = {
        id: 'test_binding',
        actionId: 'test_action',
        inputType: 'key',
        code: 'Space',
        modifiers: [],
        conditions: [],
        enabled: true
      };

      const addResult = manager.addBinding(binding);
      expect(addResult.status).toBe('error');
      expect(addResult.issues).toContain('No active profile set');
    });
  });

  describe('Event Processing', () => {
    test('should process input events', () => {
      const event: InputEvent = {
        id: 'test_event',
        type: 'key',
        code: 'Space',
        value: 1,
        timestamp: new Date(),
        source: 'test'
      };

      const processResult = manager.processInputEvent(event);
      expect(processResult.status).toBe('ok');
      expect(processResult.result?.event).toBeDefined();
    });

    test('should handle events without active profile', () => {
      manager.resetInput(); // Clear default profile
      const event: InputEvent = {
        id: 'test_event',
        type: 'key',
        code: 'Space',
        value: 1,
        timestamp: new Date(),
        source: 'test'
      };

      const processResult = manager.processInputEvent(event);
      expect(processResult.status).toBe('error');
      expect(processResult.issues).toContain('No active profile set');
    });
  });

  describe('Gesture Recognition', () => {
    test('should recognize gestures', () => {
      const gesture: InputGesture = {
        id: 'test_gesture',
        type: 'swipe',
        startPosition: { x: 0, y: 0 },
        endPosition: { x: 100, y: 0 },
        direction: 'right',
        distance: 100,
        duration: 200,
        timestamp: new Date()
      };

      const recognizeResult = manager.recognizeGesture(gesture);
      expect(recognizeResult.status).toBe('ok');
      expect(recognizeResult.result?.recognized).toBe(true);
    });

    test('should handle gestures below threshold', () => {
      const gesture: InputGesture = {
        id: 'test_gesture',
        type: 'swipe',
        startPosition: { x: 0, y: 0 },
        endPosition: { x: 10, y: 0 },
        direction: 'right',
        distance: 10, // Below threshold
        duration: 200,
        timestamp: new Date()
      };

      const recognizeResult = manager.recognizeGesture(gesture);
      expect(recognizeResult.status).toBe('ok');
      expect(recognizeResult.result?.recognized).toBe(false);
    });

    test('should handle gestures without active profile', () => {
      manager.resetInput(); // Clear default profile
      const gesture: InputGesture = {
        id: 'test_gesture',
        type: 'swipe',
        startPosition: { x: 0, y: 0 },
        endPosition: { x: 100, y: 0 },
        direction: 'right',
        distance: 100,
        duration: 200,
        timestamp: new Date()
      };

      const recognizeResult = manager.recognizeGesture(gesture);
      expect(recognizeResult.status).toBe('error');
      expect(recognizeResult.issues).toContain('No active profile set');
    });
  });

  describe('Input Statistics', () => {
    test('should provide input statistics', () => {
      // Process some events to generate stats
      const events = [
        { type: 'key', code: 'Space', value: 1 },
        { type: 'mouse', code: 'Mouse0', value: 1 },
        { type: 'key', code: 'KeyW', value: 1 }
      ];

      events.forEach(eventData => {
        const event: InputEvent = {
          id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: eventData.type as any,
          code: eventData.code,
          value: eventData.value,
          timestamp: new Date(),
          source: 'test'
        };
        manager.processInputEvent(event);
      });

      const statsResult = manager.getInputStats();
      expect(statsResult.status).toBe('ok');
      expect(statsResult.result?.totalEvents).toBeGreaterThan(0);
      expect(statsResult.result?.eventsByType).toBeDefined();
    });
  });

  describe('Event History', () => {
    test('should get recent events', () => {
      // Process some events
      for (let i = 0; i < 5; i++) {
        const event: InputEvent = {
          id: `event_${i}`,
          type: 'key',
          code: `Key${i}`,
          value: 1,
          timestamp: new Date(),
          source: 'test'
        };
        manager.processInputEvent(event);
      }

      const recentResult = manager.getRecentEvents(3);
      expect(recentResult.status).toBe('ok');
      expect(recentResult.result?.length).toBeLessThanOrEqual(3);
    });

    test('should clear event history', () => {
      // Process some events
      const event: InputEvent = {
        id: 'test_event',
        type: 'key',
        code: 'Space',
        value: 1,
        timestamp: new Date(),
        source: 'test'
      };
      manager.processInputEvent(event);

      const clearResult = manager.clearHistory();
      expect(clearResult.status).toBe('ok');

      const recentResult = manager.getRecentEvents();
      expect(recentResult.result?.length).toBe(0);
    });
  });

  describe('Export Functionality', () => {
    test('should export input data in different formats', () => {
      // Process some events
      const event: InputEvent = {
        id: 'export_event',
        type: 'key',
        code: 'Space',
        value: 1,
        timestamp: new Date(),
        source: 'test'
      };
      manager.processInputEvent(event);

      // JSON export
      const jsonResult = manager.exportInput('json');
      expect(jsonResult.status).toBe('ok');
      expect(jsonResult.result?.profiles).toBeDefined();

      // Manifest export
      const manifestResult = manager.exportInput('manifest');
      expect(manifestResult.status).toBe('ok');
      expect(manifestResult.result?.schema).toBe('miff.input.export.v1');

      // Summary export
      const summaryResult = manager.exportInput('summary');
      expect(summaryResult.status).toBe('ok');
      expect(summaryResult.result?.summary).toBeDefined();

      // Events export
      const eventsResult = manager.exportInput('events');
      expect(eventsResult.status).toBe('ok');
      expect(eventsResult.result?.events).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid export formats', () => {
      const exportResult = manager.exportInput('invalid' as any);
      expect(exportResult.status).toBe('error');
      expect(exportResult.issues).toContain('Unknown export format: invalid');
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete input workflow', () => {
      // Create profile
      manager.createProfile('workflow_profile', 'Workflow Profile', 'Complete input workflow');
      manager.setActiveProfile('workflow_profile');

      // Add actions
      const actions = [
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
        }
      ];

      actions.forEach(action => manager.addAction(action));

      // Add bindings
      const bindings = [
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
        }
      ];

      bindings.forEach(binding => manager.addBinding(binding));

      // Process events
      const events = [
        { type: 'key', code: 'KeyW', value: 1 },
        { type: 'key', code: 'Space', value: 1 },
        { type: 'key', code: 'KeyW', value: 0 }
      ];

      const eventResults = events.map(eventData => {
        const event: InputEvent = {
          id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: eventData.type as any,
          code: eventData.code,
          value: eventData.value,
          timestamp: new Date(),
          source: 'workflow'
        };
        return manager.processInputEvent(event);
      });

      // Recognize gestures
      const gesture: InputGesture = {
        id: 'workflow_gesture',
        type: 'swipe',
        startPosition: { x: 0, y: 0 },
        endPosition: { x: 100, y: 0 },
        direction: 'right',
        distance: 100,
        duration: 200,
        timestamp: new Date()
      };
      const gestureResult = manager.recognizeGesture(gesture);

      // Get statistics
      const statsResult = manager.getInputStats();
      expect(statsResult.status).toBe('ok');

      // Export data
      const exportResult = manager.exportInput('manifest');
      expect(exportResult.status).toBe('ok');

      // Reset
      const resetResult = manager.resetInput();
      expect(resetResult.status).toBe('ok');
    });
  });
});