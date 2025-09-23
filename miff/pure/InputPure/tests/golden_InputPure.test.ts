/**
 * InputPure Golden Tests
 *
 * Comprehensive tests for the InputPure input management system.
 * Tests cover basic functionality, rebinding, categories, and edge cases.
 */

import { InputProfile, InputAction, InputMapper, InputUtils, InputCategories, InputTokens } from '../index';

describe('InputPure Golden Tests', () => {
  let profile: InputProfile;
  let mapper: InputMapper;

  beforeEach(() => {
    profile = new InputProfile();
    mapper = new InputMapper(profile);
  });

  describe('InputAction Creation', () => {
    test('should create actions with valid parameters', () => {
      const action = new InputAction('test_action', 'w', true, 'test');

      expect(action.actionId).toBe('test_action');
      expect(action.defaultInput).toBe('w');
      expect(action.remappable).toBe(true);
      expect(action.category).toBe('test');
    });

    test('should throw error for empty action ID', () => {
      expect(() => new InputAction('', 'w')).toThrow('Action ID cannot be empty');
      expect(() => new InputAction('   ', 'w')).toThrow('Action ID cannot be empty');
    });

    test('should handle default parameters', () => {
      const action = new InputAction('test_action');

      expect(action.actionId).toBe('test_action');
      expect(action.defaultInput).toBe('');
      expect(action.remappable).toBe(true);
      expect(action.category).toBe('general');
    });
  });

  describe('InputProfile Basic Operations', () => {
    test('should register and retrieve actions', () => {
      const action = new InputAction('move_up', 'w', true, 'movement');
      profile.registerAction(action);

      expect(profile.hasAction('move_up')).toBe(true);
      expect(profile.getAction('move_up')).toBe(action);
      expect(profile.getActionCount()).toBe(1);
    });

    test('should handle multiple action registration', () => {
      const actions = [
        new InputAction('move_up', 'w', true, 'movement'),
        new InputAction('move_down', 's', true, 'movement'),
        new InputAction('attack', ' ', true, 'combat')
      ];

      actions.forEach(action => profile.registerAction(action));

      expect(profile.getActionCount()).toBe(3);
      expect(profile.hasAction('move_up')).toBe(true);
      expect(profile.hasAction('move_down')).toBe(true);
      expect(profile.hasAction('attack')).toBe(true);
    });

    test('should handle default input binding', () => {
      const action = new InputAction('jump', ' ', true, 'movement');
      profile.registerAction(action);

      const retrievedAction = profile.getActionForInput(' ');
      expect(retrievedAction).toBe(action);
    });

    test('should handle case-insensitive input matching', () => {
      const action = new InputAction('test', 'W', true, 'test');
      profile.registerAction(action);

      const upperCase = profile.getActionForInput('W');
      const lowerCase = profile.getActionForInput('w');

      expect(upperCase).toBe(action);
      expect(lowerCase).toBe(action);
    });
  });

  describe('Input Binding and Rebinding', () => {
    beforeEach(() => {
      profile.registerAction(new InputAction('move_up', 'w', true, 'movement'));
      profile.registerAction(new InputAction('move_down', 's', true, 'movement'));
      profile.registerAction(new InputAction('attack', ' ', true, 'combat'));
    });

    test('should rebind actions successfully', () => {
      const success = profile.rebind('move_up', 'ArrowUp');
      expect(success).toBe(true);

      const newAction = profile.getActionForInput('ArrowUp');
      expect(newAction?.actionId).toBe('move_up');

      // Old binding should be removed
      const oldAction = profile.getActionForInput('w');
      expect(oldAction).toBeNull();
    });

    test('should handle rebinding conflicts', () => {
      // ArrowUp is bound to move_up after first rebind
      profile.rebind('move_up', 'ArrowUp');

      // Try to bind move_down to ArrowUp (should work, removes old binding)
      const success = profile.rebind('move_down', 'ArrowUp');
      expect(success).toBe(true);

      const action = profile.getActionForInput('ArrowUp');
      expect(action?.actionId).toBe('move_down'); // Should be the new binding
    });

    test('should fail rebinding for non-remappable actions', () => {
      const nonRemappableAction = new InputAction('god_mode', 'F2', false, 'debug');
      profile.registerAction(nonRemappableAction);

      const success = profile.rebind('god_mode', 'F1');
      expect(success).toBe(false);

      // Original binding should remain
      const action = profile.getActionForInput('F2');
      expect(action?.actionId).toBe('god_mode');
    });

    test('should fail rebinding for non-existent actions', () => {
      const success = profile.rebind('nonexistent', 'x');
      expect(success).toBe(false);
    });
  });

  describe('Input Profile Queries', () => {
    beforeEach(() => {
      const actions = [
        new InputAction('move_up', 'w', true, 'movement'),
        new InputAction('move_down', 's', true, 'movement'),
        new InputAction('attack', ' ', true, 'combat'),
        new InputAction('defend', 'Shift', true, 'combat'),
        new InputAction('menu', 'Escape', true, 'ui'),
        new InputAction('debug', 'F3', true, 'debug')
      ];

      actions.forEach(action => profile.registerAction(action));
    });

    test('should get actions by category', () => {
      const movementActions = profile.getActionsByCategory('movement');
      const combatActions = profile.getActionsByCategory('combat');
      const uiActions = profile.getActionsByCategory('ui');

      expect(movementActions).toHaveLength(2);
      expect(combatActions).toHaveLength(2);
      expect(uiActions).toHaveLength(1);

      expect(movementActions.map(a => a.actionId)).toEqual(['move_up', 'move_down']);
      expect(combatActions.map(a => a.actionId)).toEqual(['attack', 'defend']);
      expect(uiActions.map(a => a.actionId)).toEqual(['menu']);
    });

    test('should get all bindings', () => {
      const bindings = profile.getBindings();
      expect(bindings.size).toBe(6);

      // Should include default bindings
      expect(bindings.get('w')).toBe('move_up');
      expect(bindings.get('s')).toBe('move_down');
      expect(bindings.get(' ')).toBe('attack');
      expect(bindings.get('Shift')).toBe('defend');
      expect(bindings.get('Escape')).toBe('menu');
      expect(bindings.get('F3')).toBe('debug');
    });

    test('should get all actions', () => {
      const actions = profile.getActions();
      expect(actions.size).toBe(6);

      const actionIds = Array.from(actions.keys());
      expect(actionIds).toContain('move_up');
      expect(actionIds).toContain('move_down');
      expect(actionIds).toContain('attack');
      expect(actionIds).toContain('defend');
      expect(actionIds).toContain('menu');
      expect(actionIds).toContain('debug');
    });
  });

  describe('InputMapper Interface', () => {
    beforeEach(() => {
      const action = new InputAction('test_action', 'x', true, 'test');
      profile.registerAction(action);
    });

    test('should provide simplified access to profile', () => {
      const action = mapper.getMappedAction('x');
      expect(action?.actionId).toBe('test_action');

      const nullAction = mapper.getMappedAction('y');
      expect(nullAction).toBeNull();
    });

    test('should handle rebinding through mapper', () => {
      const success = mapper.rebindAction('test_action', 'y');
      expect(success).toBe(true);

      const newAction = mapper.getMappedAction('y');
      expect(newAction?.actionId).toBe('test_action');

      const oldAction = mapper.getMappedAction('x');
      expect(oldAction).toBeNull();
    });

    test('should check action existence', () => {
      expect(mapper.hasAction('test_action')).toBe(true);
      expect(mapper.hasAction('nonexistent')).toBe(false);
    });

    test('should get action by ID', () => {
      const action = mapper.getAction('test_action');
      expect(action?.actionId).toBe('test_action');

      const nullAction = mapper.getAction('nonexistent');
      expect(nullAction).toBeNull();
    });

    test('should get bindings through mapper', () => {
      const bindings = mapper.getBindings();
      expect(bindings.size).toBe(1);
      expect(bindings.get('x')).toBe('test_action');
    });
  });

  describe('InputUtils and Presets', () => {
    test('should create movement actions', () => {
      const actions = InputUtils.createMovementActions();

      expect(actions).toHaveLength(6);
      expect(actions.map(a => a.actionId)).toEqual([
        'move_up', 'move_down', 'move_left', 'move_right', 'jump', 'run'
      ]);
      expect(actions.every(a => a.category === 'movement')).toBe(true);
      expect(actions.every(a => a.remappable === true)).toBe(true);
    });

    test('should create combat actions', () => {
      const actions = InputUtils.createCombatActions();

      expect(actions).toHaveLength(6);
      expect(actions.map(a => a.actionId)).toEqual([
        'attack_primary', 'attack_secondary', 'block', 'dodge', 'use_item', 'switch_weapon'
      ]);
      expect(actions.every(a => a.category === 'combat')).toBe(true);
    });

    test('should create UI actions', () => {
      const actions = InputUtils.createUIActions();

      expect(actions).toHaveLength(6);
      expect(actions.map(a => a.actionId)).toEqual([
        'interact', 'cancel', 'menu', 'next_item', 'prev_item', 'select'
      ]);
      expect(actions.every(a => a.category === 'ui')).toBe(true);
    });

    test('should create debug actions', () => {
      const actions = InputUtils.createDebugActions();

      expect(actions).toHaveLength(4);
      expect(actions.map(a => a.actionId)).toEqual([
        'toggle_debug', 'console', 'free_camera', 'god_mode'
      ]);
      expect(actions.every(a => a.category === 'debug')).toBe(true);
      expect(actions.filter(a => !a.remappable)).toHaveLength(1); // god_mode is not remappable
    });

    test('should create standard profile', () => {
      const standardProfile = InputUtils.createStandardProfile();

      // Standard profile includes all action types
      expect(standardProfile.getActionCount()).toBeGreaterThan(15); // At least 15+ actions
      expect(standardProfile.getBindingCount()).toBeGreaterThan(15); // All default bindings

      // Should have actions from movement, combat, and UI categories
      expect(standardProfile.getActionsByCategory('movement')).toHaveLength(6);
      expect(standardProfile.getActionsByCategory('combat')).toHaveLength(6);
      expect(standardProfile.getActionsByCategory('ui')).toHaveLength(6);
    });
  });

  describe('Utility Functions', () => {
    test('should identify modifier keys', () => {
      expect(InputUtils.isModifierKey('Shift')).toBe(true);
      expect(InputUtils.isModifierKey('Control')).toBe(true);
      expect(InputUtils.isModifierKey('Alt')).toBe(true);
      expect(InputUtils.isModifierKey('GamepadLeftBumper')).toBe(true);
      expect(InputUtils.isModifierKey('GamepadRightBumper')).toBe(true);

      expect(InputUtils.isModifierKey('w')).toBe(false);
      expect(InputUtils.isModifierKey(' ')).toBe(false);
      expect(InputUtils.isModifierKey('MouseLeft')).toBe(false);
    });

    test('should identify movement keys', () => {
      expect(InputUtils.isMovementKey('w')).toBe(true);
      expect(InputUtils.isMovementKey('a')).toBe(true);
      expect(InputUtils.isMovementKey('s')).toBe(true);
      expect(InputUtils.isMovementKey('d')).toBe(true);
      expect(InputUtils.isMovementKey('ArrowUp')).toBe(true);
      expect(InputUtils.isMovementKey('ArrowDown')).toBe(true);
      expect(InputUtils.isMovementKey('ArrowLeft')).toBe(true);
      expect(InputUtils.isMovementKey('ArrowRight')).toBe(true);

      expect(InputUtils.isMovementKey(' ')).toBe(false);
      expect(InputUtils.isMovementKey('Enter')).toBe(false);
      expect(InputUtils.isMovementKey('MouseLeft')).toBe(false);
    });
  });

  describe('Action Removal', () => {
    beforeEach(() => {
      profile.registerAction(new InputAction('move_up', 'w', true, 'movement'));
      profile.registerAction(new InputAction('attack', ' ', true, 'combat'));
      profile.rebind('move_up', 'ArrowUp');
    });

    test('should remove actions and their bindings', () => {
      expect(profile.getActionCount()).toBe(2);
      expect(profile.getBindingCount()).toBe(2); // w -> move_up, ArrowUp -> move_up, space -> attack

      const success = profile.removeAction('move_up');
      expect(success).toBe(true);

      expect(profile.getActionCount()).toBe(1);
      expect(profile.getBindingCount()).toBe(1); // Only space -> attack remains
      expect(profile.hasAction('move_up')).toBe(false);
      expect(profile.getActionForInput('w')).toBeNull();
      expect(profile.getActionForInput('ArrowUp')).toBeNull();
      expect(profile.getActionForInput(' ')).not.toBeNull();
    });

    test('should handle removing non-existent actions', () => {
      const success = profile.removeAction('nonexistent');
      expect(success).toBe(false);
      expect(profile.getActionCount()).toBe(2); // Unchanged
    });
  });

  describe('Profile Management', () => {
    test('should clear all data', () => {
      profile.registerAction(new InputAction('test1', 'a', true, 'test'));
      profile.registerAction(new InputAction('test2', 'b', true, 'test'));
      profile.rebind('test1', 'c');

      expect(profile.getActionCount()).toBe(2);
      expect(profile.getBindingCount()).toBe(2);

      profile.clear();

      expect(profile.getActionCount()).toBe(0);
      expect(profile.getBindingCount()).toBe(0);
      expect(profile.getBindings().size).toBe(0);
      expect(profile.getActions().size).toBe(0);
    });

    test('should handle empty profiles', () => {
      expect(profile.getActionCount()).toBe(0);
      expect(profile.getBindingCount()).toBe(0);
      expect(profile.getActionsByCategory('any')).toHaveLength(0);
      expect(profile.getActionForInput('any')).toBeNull();
      expect(mapper.getMappedAction('any')).toBeNull();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle empty input strings', () => {
      const action = new InputAction('test', '', true, 'test');
      profile.registerAction(action);

      const retrieved = profile.getActionForInput('');
      expect(retrieved).toBeNull();
    });

    test('should handle whitespace-only inputs', () => {
      const action = new InputAction('test', '   ', true, 'test');
      profile.registerAction(action);

      const retrieved = profile.getActionForInput('   ');
      expect(retrieved).toBe(action);
    });

    test('should handle null and undefined inputs gracefully', () => {
      const action = new InputAction('test', 'x', true, 'test');
      profile.registerAction(action);

      const nullResult = profile.getActionForInput(null as any);
      const undefinedResult = profile.getActionForInput(undefined as any);

      expect(nullResult).toBeNull();
      expect(undefinedResult).toBeNull();
    });

    test('should handle duplicate action registration', () => {
      const action1 = new InputAction('test', 'x', true, 'test');
      const action2 = new InputAction('test', 'y', true, 'test'); // Same ID, different input

      profile.registerAction(action1);
      profile.registerAction(action2); // Should overwrite

      expect(profile.getActionCount()).toBe(1);
      expect(profile.getAction('test')).toBe(action2); // Should be the second one
    });

    test('should handle rebinding to same input', () => {
      profile.registerAction(new InputAction('test', 'x', true, 'test'));

      const success = profile.rebind('test', 'x'); // Same input
      expect(success).toBe(true);

      const action = profile.getActionForInput('x');
      expect(action?.actionId).toBe('test');
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complex input scenarios', () => {
      // Create a complex input setup
      const profile = InputUtils.createStandardProfile();
      const mapper = new InputMapper(profile);

      // Test various inputs
      const testCases = [
        { input: 'w', expected: 'move_up' },
        { input: 'MouseLeft', expected: 'attack_primary' },
        { input: 'Enter', expected: 'interact' }
      ];

      testCases.forEach(({ input, expected }) => {
        const action = mapper.getMappedAction(input);
        expect(action?.actionId).toBe(expected);
      });

      // Test that Enter is bound to interact (not select) - both should work due to case-insensitive matching
      const enterAction = profile.getActionForInput('Enter');
      expect(enterAction?.actionId).toBe('interact');

      // Test that the standard profile has a good mix of actions
      const allActions = Array.from(profile.getActions().values());
      const categories = new Set(allActions.map(a => a.category));
      expect(categories.size).toBeGreaterThanOrEqual(3); // At least 3 categories

      // Test rebinding
      profile.rebind('move_up', 'ArrowUp');
      expect(profile.getActionForInput('ArrowUp')?.actionId).toBe('move_up');
      expect(profile.getActionForInput('w')).toBeNull(); // Old binding removed
    });

    test('should handle multi-category actions', () => {
      // Some actions might be in multiple categories or have special handling
      const customProfile = new InputProfile();

      // Add actions that might share inputs in different contexts
      customProfile.registerAction(new InputAction('move_up', 'w', true, 'movement'));
      customProfile.registerAction(new InputAction('scroll_up', 'w', true, 'ui')); // Same input, different action

      // The last registered action with the same default input wins
      expect(customProfile.getActionCount()).toBe(2);
      expect(customProfile.getActionForInput('w')?.actionId).toBe('move_up'); // First registered wins (default behavior)
    });

    test('should handle input priority and conflicts', () => {
      // Test scenario where multiple actions could match similar inputs
      const action1 = new InputAction('move', 'wasd', true, 'movement');
      const action2 = new InputAction('type', 'w', true, 'typing');

      profile.registerAction(action1);
      profile.registerAction(action2);

      // Specific input should match specific action
      expect(profile.getActionForInput('w')?.actionId).toBe('type');

      // Rebinding should handle conflicts
      profile.rebind('move', 'arrow_keys');
      expect(profile.getActionForInput('wasd')).toBeNull();
      expect(profile.getActionForInput('arrow_keys')?.actionId).toBe('move');
    });
  });

  describe('Performance', () => {
    test('should handle many actions efficiently', () => {
      const startTime = Date.now();

      // Register many actions
      for (let i = 0; i < 1000; i++) {
        profile.registerAction(new InputAction(`action_${i}`, `key_${i}`, true, 'test'));
      }

      const registrationTime = Date.now() - startTime;
      expect(registrationTime).toBeLessThan(100); // Should be fast

      expect(profile.getActionCount()).toBe(1000);
      expect(profile.getBindingCount()).toBe(1000);

      // Lookup should be fast
      const lookupStart = Date.now();
      const action = profile.getActionForInput('key_500');
      const lookupTime = Date.now() - lookupStart;

      expect(action?.actionId).toBe('action_500');
      expect(lookupTime).toBeLessThan(5); // Very fast lookup
    });

    test('should handle rebinding many actions efficiently', () => {
      // Register many actions
      for (let i = 0; i < 100; i++) {
        profile.registerAction(new InputAction(`action_${i}`, `key_${i}`, true, 'test'));
      }

      const startTime = Date.now();

      // Rebind all actions
      for (let i = 0; i < 100; i++) {
        profile.rebind(`action_${i}`, `new_key_${i}`);
      }

      const rebindTime = Date.now() - startTime;
      expect(rebindTime).toBeLessThan(50); // Should be reasonably fast

      // Verify rebinding
      for (let i = 0; i < 100; i++) {
        const action = profile.getActionForInput(`new_key_${i}`);
        expect(action?.actionId).toBe(`action_${i}`);
      }
    });
  });
});