# Toppler Medieval - MIFF Orchestration Implementation

## Overview

Toppler Medieval is a fully orchestration-driven implementation of the classic Toppler game, designed to meet MIFF (Modular Interactive Fiction Framework) standards. This implementation removes all legacy UI artifacts and replaces them with orchestration-driven overlays, comprehensive input handling, and persistent state management.

## Architecture

### Core Components

1. **TopplerMedieval.ts** - Main game class with orchestration integration
2. **GameBootstrap.ts** - MIFF-compliant scene launcher
3. **main.ts** - Entry point and global mount function
4. **orchestration.medieval.json** - Configuration driving UI overlays and transitions

### Orchestration Flow

The game follows a strict orchestration-driven flow based on the configuration in `orchestration.medieval.json`:

```
TopplerIntro → TopplerPlay → TopplerGameOver → (loop back to TopplerIntro)
```

#### Scene Transitions

1. **TopplerIntro** 
   - Displays game title, description, and current settings
   - Shows input mode detection status
   - Waits for user input to start the game

2. **TopplerPlay**
   - Active gameplay state
   - Handles player movement, enemy AI, and collision detection
   - Manages score and progression
   - Transitions to GameOver on completion or failure

3. **TopplerGameOver**
   - Displays final score and time
   - Allows return to intro menu
   - Resets game state for new session

### Input Handling System

The game implements comprehensive input mode detection and handling:

#### Input Mode Detection

1. **Gamepad Priority**: Automatically detects connected gamepads via `navigator.getGamepads()`
2. **Touch Fallback**: Detects touch capability via `'ontouchstart' in window`
3. **Keyboard Default**: Falls back to keyboard input when neither gamepad nor touch is available

#### Input Controls

| Input Mode | Movement | Jump | Scene Transition |
|------------|----------|------|------------------|
| Keyboard | Arrow Keys | Space/Up Arrow | Enter |
| Gamepad | Left Stick/D-Pad | A Button | Start Button |
| Touch | Touch Zones | Touch Zone | Tap Anywhere |

#### Touch Zones

For touch input, the game creates three interactive zones:
- **Left Zone**: Move left (◀)
- **Right Zone**: Move right (▶)
- **Jump Zone**: Jump (⤴)

Zones are rendered as semi-transparent overlays with visual indicators.

### Persistence System

#### LocalStorage Schema

The game uses `localStorage.toppler_state` with the following schema:

```json
{
  "score": number,
  "difficulty": "Squire" | "Knight" | "Warlord",
  "inputMode": "touch" | "keyboard" | "gamepad"
}
```

#### Persistence Behavior

- **Store**: Automatically saves state on score changes, difficulty updates, and input mode detection
- **Restore**: Loads saved state on game initialization
- **Reset**: Clears score on game over, preserves difficulty and input mode settings

### Difficulty System

Three difficulty levels affect gameplay mechanics:

| Difficulty | Gravity | Enemy Speed | Platform Life |
|------------|---------|-------------|---------------|
| Squire | 900 | 40 | 8.0s |
| Knight | 980 | 60 | 6.0s |
| Warlord | 1100 | 90 | 4.0s |

### Asset Management

#### Sprites
- **Player**: `/assets/Player.png`
- **Enemy**: `/assets/Skeleton.png`
- **Terrain**: `/assets/Cliff_Tile.png`
- **Platforms**: `/assets/Bridge_Wood.png`
- **Collectibles**: `/assets/Chest.png`

#### Audio
- **Music**: `/assets/audio/music/Loops/1. Dawn of Blades.ogg`
- **Jump SFX**: `/assets/audio/sfx/confirmation_3_sean.wav`
- **Collect SFX**: `/assets/audio/sfx/completion_4_sean.wav`
- **Curse SFX**: `/assets/audio/sfx/damage_5_sean.wav`

## Orchestration Configuration

### orchestration.medieval.json Structure

```json
{
  "zone": "TopplerMedieval",
  "title": "Toppler: Curse of the Hollow Isles",
  "description": "Leap across haunted isles, evade undead foes, and collect enchanted chests in this medieval survival challenge.",
  "ui": {
    "startMenu": {
      "enabled": true,
      "options": [
        { "label": "Start Quest", "action": "startGame" },
        { 
          "label": "Options", 
          "submenu": [
            { "label": "Mute Audio", "toggle": "audioMuted" },
            { "label": "Difficulty", "choices": ["Squire", "Knight", "Warlord"], "bind": "difficultyLevel" },
            { "label": "Input Mode", "choices": ["Touch", "Keyboard", "Gamepad"], "bind": "inputMode" }
          ]
        },
        { "label": "Lore", "action": "showCredits" }
      ]
    }
  },
  "orchestration": {
    "startScene": "TopplerIntro",
    "scenes": ["TopplerIntro", "TopplerPlay", "TopplerGameOver"],
    "transitions": {
      "startGame": { "from": "TopplerIntro", "to": "TopplerPlay" },
      "showCredits": { "from": "*", "to": "TopplerIntro", "modal": "LoreModal" }
    }
  }
}
```

### Transition System

The orchestration system drives scene transitions via:
- **User Actions**: Input-triggered transitions (Enter, tap, gamepad buttons)
- **Game Events**: Automatic transitions on win/lose conditions
- **Modal Overlays**: Contextual information displays

## UI Cleanup Checklist

### ✅ Removed Legacy Elements

1. **Level Selector** (line 49 in original): Dropdown selector in bottom-left corner
2. **[Next Level] Button** (line 63 in original): Manual level progression button
3. **[Back] Button** (line 129 in HTML): Navigation button in game container
4. **Physics Puzzle Buttons**: All hardcoded UI fallback logic
5. **Level References**: Text displays showing level information

### ✅ Replaced With Orchestration

1. **Scene-based Overlays**: Intro, Play, GameOver states
2. **Input-driven Transitions**: Consistent across all input modes
3. **Persistent Settings**: Difficulty and input mode preservation
4. **Touch Gesture Support**: Swipe and tap zones for mobile

## Implementation Verification

### Orchestration Flow Verification

1. **Intro Overlay**: ✅ Appears on game load
2. **Play Transition**: ✅ Triggered by orchestration actions
3. **GameOver Overlay**: ✅ Appears on win/lose conditions
4. **Scene Loop**: ✅ Correctly cycles through all states

### Input System Verification

1. **Gamepad Detection**: ✅ Automatic detection and preference
2. **Touch Zones**: ✅ Rendered and responsive on touch devices
3. **Keyboard Fallback**: ✅ Works when other inputs unavailable
4. **Input Persistence**: ✅ Mode saved and restored correctly

### Persistence Verification

1. **Score Tracking**: ✅ Increments and persists during gameplay
2. **Difficulty Settings**: ✅ Affects gameplay and persists between sessions
3. **Input Mode**: ✅ Detected, stored, and restored on boot
4. **Reset Behavior**: ✅ Clears score on game over, preserves settings

### Legacy UI Removal Verification

1. **No Level Selector**: ✅ Removed from DOM and JavaScript
2. **No Manual Buttons**: ✅ All hardcoded navigation removed
3. **No Physics Puzzle UI**: ✅ Fallback logic eliminated
4. **Clean Orchestration**: ✅ All transitions driven by configuration

## Usage

### Basic Integration

```html
<div id="app"></div>
<script type="module" src="./src/main.js"></script>
<script>window.mountTopplerMedieval();</script>
```

### Programmatic Control

```javascript
import { TopplerMedieval } from './TopplerMedieval.js';

const game = new TopplerMedieval();
await game.mount(canvasElement);

// Game automatically handles orchestration and input
// State persists in localStorage as 'toppler_state'
```

### Configuration Override

Modify `/site/zones/toppler/orchestration.medieval.json` to customize:
- UI text and descriptions
- Scene transitions
- Menu options
- Asset references

## MIFF Compliance

This implementation fully adheres to MIFF standards:

1. **Orchestration-Driven**: All UI and transitions configured via JSON
2. **Scene-Based Architecture**: Clear separation of game states
3. **Input Abstraction**: Unified input handling across all modes
4. **Asset Management**: Proper loading and fallback handling
5. **State Persistence**: Clean localStorage schema and management
6. **Resource Cleanup**: Proper event listener and animation cleanup

## Development Notes

### Building

The TypeScript files need to be compiled to JavaScript for browser use:

```bash
tsc src/TopplerMedieval.ts --target es2020 --module es2020 --outDir src/
tsc src/main.ts --target es2020 --module es2020 --outDir src/
```

### Testing Input Modes

1. **Gamepad**: Connect a controller and refresh the page
2. **Touch**: Open in mobile browser or use browser dev tools touch emulation
3. **Keyboard**: Default mode when no other input detected

### Debugging

The game logs orchestration events and input mode changes to console:

```
[TopplerMedieval] Mounting game...
[TopplerMedieval] Input mode detected: gamepad
[TopplerMedieval] Transitioning to scene: TopplerPlay
[TopplerMedieval] Game started
```

## Future Enhancements

Potential areas for expansion while maintaining MIFF compliance:

1. **Multiplayer Support**: Extend input system for multiple controllers
2. **Level Editor**: Orchestration-driven level configuration
3. **Achievement System**: Persistent progression tracking
4. **Accessibility**: Enhanced input options and visual indicators
5. **Localization**: Multi-language orchestration configurations

---

*This implementation represents a complete restoration of Toppler Medieval to MIFF orchestration standards, eliminating all legacy UI artifacts while providing comprehensive input handling and state persistence.*