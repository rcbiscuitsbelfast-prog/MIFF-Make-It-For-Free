# InputPure - Input Management System

A lightweight, flexible input management system for handling input actions, key bindings, and input profiles. Supports remappable inputs, category-based organization, and multiple input sources (keyboard, gamepad, mouse, touch) for modular gameplay systems.

## Features

- **Multi-Platform Support**: Keyboard, gamepad, mouse, and touch input support
- **Remappable Actions**: User-configurable input bindings
- **Category Organization**: Group actions by functionality (movement, combat, UI, etc.)
- **Type-Safe Actions**: Full TypeScript support with proper interfaces
- **Preset Profiles**: Ready-to-use input configurations for common game types
- **Input Utilities**: Helper functions for common input patterns
- **Performance Optimized**: Efficient lookup and management of bindings

## Installation

```bash
npm install miff-framework
```

## Usage

### Basic Usage

```typescript
import { InputProfile, InputAction } from 'miff-framework';

// Create input profile
const profile = new InputProfile();

// Register actions
const moveUpAction = new InputAction('move_up', 'w', true, 'movement');
profile.registerAction(moveUpAction);

// Get action for input
const action = profile.getActionForInput('w');
console.log('W key triggers:', action?.actionId); // 'move_up'

// Rebind action
profile.rebind('move_up', 'ArrowUp');
const newAction = profile.getActionForInput('ArrowUp');
console.log('ArrowUp now triggers:', newAction?.actionId); // 'move_up'
```

### Advanced Usage

```typescript
import { InputProfile, InputMapper, InputUtils, InputCategories } from 'miff-framework';

// Create profile with preset actions
const profile = InputUtils.createStandardProfile();
const mapper = new InputMapper(profile);

// Use mapper for simplified access
const jumpAction = mapper.getMappedAction('Space');
console.log('Space triggers:', jumpAction?.actionId);

// Get actions by category
const movementActions = profile.getActionsByCategory(InputCategories.MOVEMENT);
console.log('Movement actions:', movementActions.map(a => a.actionId));

// Check if action exists
if (mapper.hasAction('attack')) {
  console.log('Attack action is registered');
}
```

### CLI Usage

```bash
# Start interactive CLI
node cliHarness.ts

# Example CLI session:
input> load standard
input> actions movement
input> rebind move_up ArrowUp
input> test ArrowUp
input> add custom_action Space general
input> demo
```

## API Reference

### Classes

#### InputAction
Represents an input action with configurable properties.

**Constructor:**
- `constructor(actionId, defaultInput?, remappable?, category?)`

**Properties:**
- `actionId: string` - Unique identifier
- `defaultInput: string` - Default input binding
- `remappable: boolean` - Whether user can remap
- `category: string` - Category for organization

#### InputProfile
Manages input-to-action mappings and action registry.

**Core Methods:**
- `registerAction(action: InputAction): void` - Register an action
- `rebind(actionId: string, newInput: string): boolean` - Rebind action
- `getActionForInput(input: string): InputAction | null` - Get action for input
- `getBindings(): ReadonlyMap<string, string>` - Get all bindings
- `getActions(): ReadonlyMap<string, InputAction>` - Get all actions
- `getActionsByCategory(category: string): InputAction[]` - Get actions by category
- `removeAction(actionId: string): boolean` - Remove action
- `clear(): void` - Clear all data

#### InputMapper
Simplified interface to an input profile.

**Methods:**
- `getMappedAction(input: string): InputAction | null` - Get action for input
- `rebindAction(actionId: string, newInput: string): boolean` - Rebind action
- `getBindings(): ReadonlyMap<string, string>` - Get bindings
- `getAction(actionId: string): InputAction | null` - Get action
- `hasAction(actionId: string): boolean` - Check if action exists

### Constants

#### InputCategories
Common action categories.

```typescript
export const InputCategories = {
  MOVEMENT: 'movement',
  COMBAT: 'combat',
  UI: 'ui',
  MENU: 'menu',
  GENERAL: 'general',
  DEBUG: 'debug'
};
```

#### InputTokens
Standard input tokens for different platforms.

```typescript
export const InputTokens = {
  KEYBOARD: { W: 'w', SPACE: ' ', ENTER: 'Enter', ... },
  GAMEPAD: { A: 'GamepadA', B: 'GamepadB', ... },
  MOUSE: { LEFT_CLICK: 'MouseLeft', RIGHT_CLICK: 'MouseRight', ... },
  TOUCH: { TAP: 'TouchTap', SWIPE_UP: 'TouchSwipeUp', ... }
};
```

### Utility Functions

#### InputUtils
Static utility functions for common operations.

- `createMovementActions()` - Create standard movement action set
- `createCombatActions()` - Create standard combat action set
- `createUIActions()` - Create standard UI action set
- `createDebugActions()` - Create debug action set
- `createStandardProfile()` - Create complete profile with all actions
- `isModifierKey(input)` - Check if input is a modifier key
- `isMovementKey(input)` - Check if input is a movement key

## Configuration

### Basic Input Profile

```typescript
import { InputProfile, InputAction } from 'miff-framework';

const profile = new InputProfile();

// Register basic actions
profile.registerAction(new InputAction('move_up', 'w', true, 'movement'));
profile.registerAction(new InputAction('move_down', 's', true, 'movement'));
profile.registerAction(new InputAction('attack', 'MouseLeft', true, 'combat'));
profile.registerAction(new InputAction('interact', 'Enter', true, 'ui'));
```

### Advanced Input Profile

```typescript
import { InputProfile, InputAction, InputCategories, InputTokens } from 'miff-framework';

const profile = new InputProfile();

// Create comprehensive input setup
const actions = [
  // Movement (remappable)
  new InputAction('move_up', InputTokens.KEYBOARD.W, true, InputCategories.MOVEMENT),
  new InputAction('move_down', InputTokens.KEYBOARD.S, true, InputCategories.MOVEMENT),
  new InputAction('move_left', InputTokens.KEYBOARD.A, true, InputCategories.MOVEMENT),
  new InputAction('move_right', InputTokens.KEYBOARD.D, true, InputCategories.MOVEMENT),
  new InputAction('jump', InputTokens.KEYBOARD.SPACE, true, InputCategories.MOVEMENT),
  new InputAction('run', InputTokens.KEYBOARD.SHIFT, true, InputCategories.MOVEMENT),

  // Combat (remappable)
  new InputAction('attack_primary', InputTokens.MOUSE.LEFT_CLICK, true, InputCategories.COMBAT),
  new InputAction('attack_secondary', InputTokens.MOUSE.RIGHT_CLICK, true, InputCategories.COMBAT),
  new InputAction('block', InputTokens.KEYBOARD.SHIFT, true, InputCategories.COMBAT),
  new InputAction('dodge', InputTokens.KEYBOARD.SPACE, true, InputCategories.COMBAT),

  // UI (remappable)
  new InputAction('interact', InputTokens.KEYBOARD.ENTER, true, InputCategories.UI),
  new InputAction('cancel', InputTokens.KEYBOARD.ESCAPE, true, InputCategories.UI),
  new InputAction('menu', InputTokens.KEYBOARD.TAB, true, InputCategories.UI),

  // Debug (some non-remappable)
  new InputAction('toggle_debug', InputTokens.KEYBOARD.DIGIT_3, true, InputCategories.DEBUG),
  new InputAction('console', InputTokens.KEYBOARD.BACKQUOTE, true, InputCategories.DEBUG),
  new InputAction('god_mode', InputTokens.KEYBOARD.DIGIT_1, false, InputCategories.DEBUG)
];

actions.forEach(action => profile.registerAction(action));
```

## Examples

### Example 1: Simple Game Controls

```typescript
import { InputProfile, InputAction, InputMapper } from 'miff-framework';

const profile = new InputProfile();
const mapper = new InputMapper(profile);

// Register game controls
profile.registerAction(new InputAction('move_up', 'w', true, 'movement'));
profile.registerAction(new InputAction('move_down', 's', true, 'movement'));
profile.registerAction(new InputAction('move_left', 'a', true, 'movement'));
profile.registerAction(new InputAction('move_right', 'd', true, 'movement'));
profile.registerAction(new InputAction('jump', ' ', true, 'movement'));
profile.registerAction(new InputAction('attack', 'MouseLeft', true, 'combat'));
profile.registerAction(new InputAction('interact', 'Enter', true, 'ui'));

// In game loop
function handleInput(input: string) {
  const action = mapper.getMappedAction(input);
  if (action) {
    switch (action.actionId) {
      case 'move_up':
        player.moveUp();
        break;
      case 'move_down':
        player.moveDown();
        break;
      case 'attack':
        player.attack();
        break;
      case 'interact':
        player.interact();
        break;
    }
  }
}

// Handle input events
window.addEventListener('keydown', (e) => handleInput(e.key));
```

### Example 2: Input Remapping System

```typescript
import { InputProfile, InputAction } from 'miff-framework';

const profile = new InputProfile();

// Register remappable actions
profile.registerAction(new InputAction('move_up', 'w', true, 'movement'));
profile.registerAction(new InputAction('move_down', 's', true, 'movement'));
profile.registerAction(new InputAction('attack', 'MouseLeft', true, 'combat'));
profile.registerAction(new InputAction('god_mode', 'F2', false, 'debug')); // Not remappable

// Allow player to remap controls
function remapControl(actionId: string, newInput: string): boolean {
  const action = profile.getAction(actionId);
  if (action && action.remappable) {
    const success = profile.rebind(actionId, newInput);
    if (success) {
      console.log(`Remapped ${actionId} to ${newInput}`);
      saveInputSettings(); // Persist to storage
    }
    return success;
  }
  return false;
}

// Load saved input settings
function loadInputSettings(settings: Record<string, string>) {
  for (const [actionId, input] of Object.entries(settings)) {
    profile.rebind(actionId, input);
  }
}
```

### Example 3: Multi-Platform Support

```typescript
import { InputProfile, InputAction, InputTokens, InputCategories } from 'miff-framework';

const profile = new InputProfile();

// Support multiple input platforms
const actions = [
  // Keyboard + Mouse
  new InputAction('move_up', InputTokens.KEYBOARD.W, true, InputCategories.MOVEMENT),
  new InputAction('move_down', InputTokens.KEYBOARD.S, true, InputCategories.MOVEMENT),
  new InputAction('attack', InputTokens.MOUSE.LEFT_CLICK, true, InputCategories.COMBAT),

  // Gamepad
  new InputAction('move_up', InputTokens.GAMEPAD.LEFT_STICK + '_up', true, InputCategories.MOVEMENT),
  new InputAction('attack', InputTokens.GAMEPAD.A, true, InputCategories.COMBAT),

  // Touch
  new InputAction('move_up', InputTokens.TOUCH.SWIPE_UP, true, InputCategories.MOVEMENT),
  new InputAction('attack', InputTokens.TOUCH.TAP, true, InputCategories.COMBAT)
];

actions.forEach(action => profile.registerAction(action));

// Detect active input platform and use appropriate bindings
function getActiveInputPlatform(): 'keyboard' | 'gamepad' | 'touch' {
  // Platform detection logic
  if (navigator.getGamepads().some(gp => gp !== null)) return 'gamepad';
  if ('ontouchstart' in window) return 'touch';
  return 'keyboard';
}
```

## Testing

```bash
# Run InputPure tests
npm test -- --testPathPattern="InputPure"

# Run CLI harness tests
node cliHarness.ts
```

## Integration

### With Other Modules
- **EventSystemPure**: Trigger events on input actions
- **PlayerStatePure**: Update player state based on input
- **UIManagerPure**: Handle UI navigation inputs
- **SettingsPure**: Persist input configurations

### Engine Bridges
- **Unity**: Input system integration
- **Godot**: Input event handling
- **Web**: DOM event bridge

## Performance

- **Time Complexity**: O(1) for input lookups, O(n) for category operations where n = actions in category
- **Space Complexity**: O(m + a) where m = bindings, a = actions
- **Optimization Tips**:
  - Cache frequently used actions
  - Use categories to organize related actions
  - Clean up unused actions promptly

## Troubleshooting

### Common Issues
1. **Input not responding**: Check if action is registered and bound correctly
2. **Rebinding fails**: Verify action is remappable and doesn't conflict
3. **Performance issues**: Consider using InputMapper for simplified access
4. **Platform detection**: Implement proper platform detection logic

### Debug Tips
- Use `getBindings()` and `getActions()` to inspect current state
- Test individual inputs with `getActionForInput()`
- Check action categories with `getActionsByCategory()`
- Verify remappability before attempting rebinds

## Contributing

### Adding Features
1. Follow established input token conventions
2. Add comprehensive tests for new functionality
3. Update this documentation
4. Ensure type safety with TypeScript

### Code Style
- Use TypeScript strict mode
- Follow ESLint configuration
- Maintain consistent naming (camelCase)
- Add JSDoc comments for all public APIs

## License

MIT

## Version History

- **v1.0.0**: Initial TypeScript implementation with core input management
- **v1.1.0**: Added preset profiles and utility functions
- **v1.2.0**: Enhanced multi-platform support and performance optimizations