/**
 * InputPure - Input Management System
 *
 * A lightweight input management system for handling input actions,
 * key bindings, and input profiles. Supports remappable inputs and
 * category-based organization for modular gameplay systems.
 *
 * @module InputPure
 * @version 1.0.0
 * @license MIT
 */

/**
 * Represents an input action that can be triggered by various inputs
 */
export interface IInputAction {
  /** Unique identifier for the action */
  actionId: string;
  /** Default input binding (e.g., "W", "Space", "Gamepad:A") */
  defaultInput: string;
  /** Whether this action can be remapped by the user */
  remappable: boolean;
  /** Category for organizing actions (e.g., "movement", "combat", "ui") */
  category: string;
}

/**
 * Input action implementation
 */
export class InputAction implements IInputAction {
  public actionId: string;
  public defaultInput: string;
  public remappable: boolean;
  public category: string;

  constructor(
    actionId: string,
    defaultInput: string = '',
    remappable: boolean = true,
    category: string = 'general'
  ) {
    if (!actionId || actionId.trim() === '') {
      throw new Error('Action ID cannot be empty');
    }

    this.actionId = actionId;
    this.defaultInput = defaultInput;
    this.remappable = remappable;
    this.category = category;
  }
}

/**
 * Manages input-to-action mappings and action registry
 */
export class InputProfile {
  // Map input token -> actionId
  private readonly _map = new Map<string, string>();
  // Registry of actions for lookup
  private readonly _actions = new Map<string, InputAction>();

  /**
   * Register an input action
   */
  registerAction(action: InputAction): void {
    if (!action || !action.actionId || action.actionId.trim() === '') {
      return;
    }

    this._actions.set(action.actionId, action);

    // If action has a default input, bind it if not already bound
    if (action.defaultInput !== undefined && action.defaultInput !== '' && !this._map.has(action.defaultInput)) {
      this._map.set(action.defaultInput, action.actionId);
    }
  }

  /**
   * Rebind an action to a new input
   */
  rebind(actionId: string, newInput: string): boolean {
    const action = this._actions.get(actionId);
    if (!action || !action.remappable) {
      return false;
    }

    // Remove any existing binding of newInput
    this._map.delete(newInput);

    // Remove old bindings for this action
    for (const [input, mappedActionId] of Array.from(this._map.entries())) {
      if (mappedActionId === actionId) {
        this._map.delete(input);
      }
    }

    // Set new binding
    this._map.set(newInput, actionId);
    return true;
  }

  /**
   * Get action for a given input
   */
  getActionForInput(input: string): InputAction | null {
    if (!input) return null;

    // Try exact match first
    let actionId = this._map.get(input);
    if (actionId) {
      return this._actions.get(actionId) || null;
    }

    // Try case-insensitive match
    for (const [mapInput, mapActionId] of this._map.entries()) {
      if (mapInput.toLowerCase() === input.toLowerCase()) {
        return this._actions.get(mapActionId) || null;
      }
    }

    return null;
  }

  /**
   * Get all current input bindings
   */
  getBindings(): ReadonlyMap<string, string> {
    return new Map(this._map);
  }

  /**
   * Get all registered actions
   */
  getActions(): ReadonlyMap<string, InputAction> {
    return new Map(this._actions);
  }

  /**
   * Get actions by category
   */
  getActionsByCategory(category: string): InputAction[] {
    return Array.from(this._actions.values()).filter((action: any) => action.category === category);
  }

  /**
   * Get action by ID
   */
  getAction(actionId: string): InputAction | null {
    return this._actions.get(actionId) || null;
  }

  /**
   * Check if an action exists
   */
  hasAction(actionId: string): boolean {
    return this._actions.has(actionId);
  }

  /**
   * Remove an action
   */
  removeAction(actionId: string): boolean {
    const action = this._actions.get(actionId);
    if (!action) {
      return false;
    }

    // Remove all bindings for this action
    for (const [input, mappedActionId] of Array.from(this._map.entries())) {
      if (mappedActionId === actionId) {
        this._map.delete(input);
      }
    }

    this._actions.delete(actionId);
    return true;
  }

  /**
   * Clear all bindings and actions
   */
  clear(): void {
    this._map.clear();
    this._actions.clear();
  }

  /**
   * Get binding count
   */
  getBindingCount(): number {
    return this._map.size;
  }

  /**
   * Get action count
   */
  getActionCount(): number {
    return this._actions.size;
  }
}

/**
 * Provides a simplified interface to an input profile
 */
export class InputMapper {
  constructor(private readonly _profile: InputProfile) {}

  /**
   * Get the action mapped to an input
   */
  getMappedAction(input: string): InputAction | null {
    return this._profile.getActionForInput(input);
  }

  /**
   * Rebind an action to a new input
   */
  rebindAction(actionId: string, newInput: string): boolean {
    return this._profile.rebind(actionId, newInput);
  }

  /**
   * Get all current bindings
   */
  getBindings(): ReadonlyMap<string, string> {
    return this._profile.getBindings();
  }

  /**
   * Get action by ID
   */
  getAction(actionId: string): InputAction | null {
    return this._profile.getAction(actionId);
  }

  /**
   * Check if an action exists
   */
  hasAction(actionId: string): boolean {
    return this._profile.hasAction(actionId);
  }
}

/**
 * Common input categories
 */
export const InputCategories = {
  MOVEMENT: 'movement',
  COMBAT: 'combat',
  UI: 'ui',
  MENU: 'menu',
  GENERAL: 'general',
  DEBUG: 'debug'
} as const;

/**
 * Common input tokens for different platforms
 */
export const InputTokens = {
  // Keyboard
  KEYBOARD: {
    W: 'w',
    A: 'a',
    S: 's',
    D: 'd',
    SPACE: ' ',
    ENTER: 'Enter',
    ESCAPE: 'Escape',
    SHIFT: 'Shift',
    CTRL: 'Control',
    ALT: 'Alt',
    TAB: 'Tab',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    DIGIT_1: '1',
    DIGIT_2: '2',
    DIGIT_3: '3',
    DIGIT_4: '4'
  },

  // Gamepad
  GAMEPAD: {
    A: 'GamepadA',
    B: 'GamepadB',
    X: 'GamepadX',
    Y: 'GamepadY',
    LB: 'GamepadLeftBumper',
    RB: 'GamepadRightBumper',
    LT: 'GamepadLeftTrigger',
    RT: 'GamepadRightTrigger',
    SELECT: 'GamepadSelect',
    START: 'GamepadStart',
    DPAD_UP: 'GamepadDPadUp',
    DPAD_DOWN: 'GamepadDPadDown',
    DPAD_LEFT: 'GamepadDPadLeft',
    DPAD_RIGHT: 'GamepadDPadRight',
    LEFT_STICK: 'GamepadLeftStick',
    RIGHT_STICK: 'GamepadRightStick'
  },

  // Mouse
  MOUSE: {
    LEFT_CLICK: 'MouseLeft',
    RIGHT_CLICK: 'MouseRight',
    MIDDLE_CLICK: 'MouseMiddle',
    WHEEL_UP: 'MouseWheelUp',
    WHEEL_DOWN: 'MouseWheelDown'
  },

  // Touch
  TOUCH: {
    TAP: 'TouchTap',
    DOUBLE_TAP: 'TouchDoubleTap',
    SWIPE_UP: 'TouchSwipeUp',
    SWIPE_DOWN: 'TouchSwipeDown',
    SWIPE_LEFT: 'TouchSwipeLeft',
    SWIPE_RIGHT: 'TouchSwipeRight',
    PINCH_IN: 'TouchPinchIn',
    PINCH_OUT: 'TouchPinchOut'
  }
} as const;

/**
 * Utility functions for common input operations
 */
export const InputUtils = {
  /**
   * Create a movement action set
   */
  createMovementActions(): InputAction[] {
    return [
      new InputAction('move_up', InputTokens.KEYBOARD.W, true, InputCategories.MOVEMENT),
      new InputAction('move_down', InputTokens.KEYBOARD.S, true, InputCategories.MOVEMENT),
      new InputAction('move_left', InputTokens.KEYBOARD.A, true, InputCategories.MOVEMENT),
      new InputAction('move_right', InputTokens.KEYBOARD.D, true, InputCategories.MOVEMENT),
      new InputAction('jump', ' ', true, InputCategories.MOVEMENT),
      new InputAction('run', InputTokens.KEYBOARD.SHIFT, true, InputCategories.MOVEMENT)
    ];
  },

  /**
   * Create a combat action set
   */
  createCombatActions(): InputAction[] {
    return [
      new InputAction('attack_primary', InputTokens.MOUSE.LEFT_CLICK, true, InputCategories.COMBAT),
      new InputAction('attack_secondary', InputTokens.MOUSE.RIGHT_CLICK, true, InputCategories.COMBAT),
      new InputAction('block', InputTokens.KEYBOARD.SHIFT, true, InputCategories.COMBAT),
      new InputAction('dodge', InputTokens.KEYBOARD.SPACE, true, InputCategories.COMBAT),
      new InputAction('use_item', InputTokens.KEYBOARD.DIGIT_1, true, InputCategories.COMBAT),
      new InputAction('switch_weapon', InputTokens.KEYBOARD.DIGIT_2, true, InputCategories.COMBAT)
    ];
  },

  /**
   * Create a UI action set
   */
  createUIActions(): InputAction[] {
    return [
      new InputAction('interact', InputTokens.KEYBOARD.ENTER, true, InputCategories.UI),
      new InputAction('cancel', InputTokens.KEYBOARD.ESCAPE, true, InputCategories.UI),
      new InputAction('menu', InputTokens.KEYBOARD.TAB, true, InputCategories.UI),
      new InputAction('next_item', InputTokens.KEYBOARD.ARROW_DOWN, true, InputCategories.UI),
      new InputAction('prev_item', InputTokens.KEYBOARD.ARROW_UP, true, InputCategories.UI),
      new InputAction('select', 'Enter', true, InputCategories.UI)
    ];
  },

  /**
   * Create a debug action set (for development)
   */
  createDebugActions(): InputAction[] {
    return [
      new InputAction('toggle_debug', InputTokens.KEYBOARD.DIGIT_4, true, InputCategories.DEBUG),
      new InputAction('console', '`', true, InputCategories.DEBUG),
      new InputAction('free_camera', InputTokens.KEYBOARD.DIGIT_3, true, InputCategories.DEBUG),
      new InputAction('god_mode', InputTokens.KEYBOARD.DIGIT_1, false, InputCategories.DEBUG)
    ];
  },

  /**
   * Create a complete input profile with all common actions
   */
  createStandardProfile(): InputProfile {
    const profile = new InputProfile();

    // Register all action sets
    const allActions = [
      ...this.createMovementActions(),
      ...this.createCombatActions(),
      ...this.createUIActions(),
      ...this.createDebugActions()
    ];

    allActions.forEach((action: any) => profile.registerAction(action));

    return profile;
  },

  /**
   * Check if an input is a modifier key
   */
  isModifierKey(input: string): boolean {
    const modifiers = [
      InputTokens.KEYBOARD.SHIFT,
      InputTokens.KEYBOARD.CTRL,
      InputTokens.KEYBOARD.ALT,
      InputTokens.GAMEPAD.LB,
      InputTokens.GAMEPAD.RB
    ];

    return modifiers.includes(input);
  },

  /**
   * Check if an input is a movement key
   */
  isMovementKey(input: string): boolean {
    const movements = [
      InputTokens.KEYBOARD.W,
      InputTokens.KEYBOARD.A,
      InputTokens.KEYBOARD.S,
      InputTokens.KEYBOARD.D,
      InputTokens.KEYBOARD.ARROW_UP,
      InputTokens.KEYBOARD.ARROW_DOWN,
      InputTokens.KEYBOARD.ARROW_LEFT,
      InputTokens.KEYBOARD.ARROW_RIGHT
    ];

    return movements.includes(input);
  }
};

/**
 * Default input profile instance
 */
export const defaultInputProfile = InputUtils.createStandardProfile();

/**
 * Default input mapper instance
 */
export const defaultInputMapper = new InputMapper(defaultInputProfile);