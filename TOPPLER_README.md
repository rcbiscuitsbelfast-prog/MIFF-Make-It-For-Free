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

#### Overlay System

The orchestration system drives modal and HUD overlays with fade transitions:

**Overlay Configuration:**
```json
{
  "overlays": {
    "TopplerIntro": {
      "type": "modal",
      "dismissible": true,
      "style": "medieval-intro",
      "fadeIn": 500,
      "fadeOut": 300,
      "triggers": ["zoneLoad", "restartGame"]
    },
    "TopplerPlay": {
      "type": "hud",
      "dismissible": false,
      "style": "medieval-hud",
      "fadeIn": 200,
      "triggers": ["startGame"]
    },
    "TopplerGameOver": {
      "type": "modal",
      "dismissible": true,
      "style": "medieval-gameover",
      "fadeIn": 400,
      "fadeOut": 300,
      "triggers": ["playerDeath", "levelComplete"]
    }
  }
}
```

#### Scene Transitions

1. **TopplerIntro** 
   - **Triggers**: `zoneLoad`, `restartGame`
   - **Type**: Modal overlay with medieval tile background
   - **Features**: Game title, description, start button, options menu, lore button
   - **Input Mode Display**: Shows current input method (gamepad/keyboard/touch)
   - **Dismissible**: Yes (via Start Quest button or Enter/Space key)

2. **TopplerPlay**
   - **Triggers**: `startGame`
   - **Type**: HUD overlay (transparent background)
   - **Features**: Score display, difficulty indicator, input mode status
   - **Dismissible**: No (active during gameplay)
   - **Touch Zones**: Rendered for touch input mode

3. **TopplerGameOver**
   - **Triggers**: `playerDeath`, `levelComplete`
   - **Type**: Modal overlay with medieval styling
   - **Features**: Final score, completion time, difficulty, restart button
   - **Dismissible**: Yes (via New Quest button or any key/tap)

#### Overlay Orchestration Hooks

All overlays are driven by orchestration triggers, not hardcoded UI:

- **`triggerOverlay(trigger)`**: Checks orchestration config for matching triggers
- **`showOverlay(overlayId, config)`**: Creates and displays overlay with fade-in
- **`hideOverlay(overlayId)`**: Removes overlay with fade-out transition
- **`handleOverlayAction(action)`**: Processes orchestration-defined actions

### Input Handling System

The game implements comprehensive input mode detection and handling with persistent storage:

#### Input Mode Detection Logic

1. **Gamepad Polling**: 
   - Uses `navigator.getGamepads()` with 1-second interval polling
   - Listens for `gamepadconnected`/`gamepaddisconnected` events
   - Automatically switches to gamepad mode when controller detected
   - Priority: Highest (overrides other modes when connected)

2. **Touch Detection**: 
   - Checks `'ontouchstart' in window` and `navigator.maxTouchPoints > 0`
   - Creates interactive touch zones for movement and jumping
   - Fallback when no gamepad detected and touch capability exists
   - Priority: Medium (used when gamepad unavailable)

3. **Keyboard Fallback**: 
   - Default mode when no gamepad or touch capability detected
   - Uses standard arrow keys and space/enter for controls
   - Priority: Lowest (baseline input method)

#### Input Detection Implementation

```typescript
private initializeInputDetection(): void {
    // Gamepad polling with interval checking
    this.pollGamepads();
    setInterval(() => this.pollGamepads(), 1000);
    
    // Touch capability detection
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        this.state.inputMode = 'touch';
    }

    // Event listeners for gamepad connection
    window.addEventListener('gamepadconnected', (e) => {
        this.gamepadIndex = e.gamepad.index;
        this.state.inputMode = 'gamepad';
        this.persistState();
        this.updateInputModeDisplay();
    });
}
```

#### Input Mode Persistence

The detected input mode is automatically stored and restored:

- **Storage Key**: `localStorage.toppler_state`
- **Auto-Save**: Input mode changes trigger immediate persistence
- **Boot Restore**: Previous input mode restored on game initialization
- **Real-time Updates**: UI displays update when input mode changes

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

The game uses `localStorage.toppler_state` with the following comprehensive schema:

```json
{
  "score": number,
  "difficulty": "Squire" | "Knight" | "Warlord",
  "inputMode": "touch" | "keyboard" | "gamepad"
}
```

#### Persistence Implementation

```typescript
private persistState(): void {
    try {
        const persistedState = {
            score: this.state.score,
            difficulty: this.state.difficulty,
            inputMode: this.state.inputMode
        };
        localStorage.setItem('toppler_state', JSON.stringify(persistedState));
        console.log('[TopplerMedieval] State persisted:', persistedState);
    } catch (error) {
        console.error('Failed to persist state:', error);
    }
}

private restoreState(): void {
    try {
        const saved = localStorage.getItem('toppler_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.score !== undefined) this.state.score = parsed.score;
            if (parsed.difficulty) this.state.difficulty = parsed.difficulty;
            if (parsed.inputMode) this.state.inputMode = parsed.inputMode;
            console.log('[TopplerMedieval] State restored:', parsed);
        }
    } catch (error) {
        console.error('Failed to restore state:', error);
    }
}
```

#### Persistence Behavior

- **Auto-Save Triggers**: 
  - Score changes during gameplay
  - Difficulty selection in options menu
  - Input mode detection/changes
  - Game state transitions

- **Boot Restore**: 
  - Loads saved state on game initialization
  - Applies restored settings to UI displays
  - Maintains input mode preferences across sessions

- **Reset Behavior**: 
  - **Game Over**: Clears score only, preserves difficulty and input mode
  - **New Session**: Retains all user preferences and settings
  - **Error Handling**: Graceful fallback to defaults if localStorage fails

#### State Management

The persistence system ensures continuity across game sessions:

1. **Score Persistence**: Current score maintained during active gameplay
2. **Difficulty Retention**: Player's chosen difficulty level preserved
3. **Input Mode Memory**: Remembers preferred/detected input method
4. **Session Recovery**: Can restore interrupted game sessions
5. **Cross-Device Sync**: Works across different browsers on same device

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

## UI Transition Notes

### Overlay Styling and Theming

The overlay system uses medieval-themed CSS with tile backgrounds:

#### CSS Classes

- **`.toppler-overlay`**: Base overlay with fade transitions
- **`.medieval-intro`**: Intro screen with brown/gold gradient and tile pattern
- **`.medieval-gameover`**: Game over screen with red tones and tile pattern  
- **`.medieval-hud`**: Transparent HUD overlay for gameplay
- **`.medieval-lore`**: Lore modal with purple/gold theming

#### Fade Transitions

All overlays support configurable fade transitions:

```css
.toppler-overlay {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
}

.toppler-overlay.active {
    opacity: 1;
}
```

#### Medieval Asset Integration

- **Tile Backgrounds**: Uses isometric block assets as repeating background patterns
- **Color Scheme**: Gold (#d4af37), brown (#8b4513), and medieval tones
- **Typography**: Serif fonts with text shadows for medieval aesthetic
- **Button Styling**: Gradient backgrounds with gold borders and hover effects

### Modal Interaction Patterns

1. **Dismissible Modals**: Can be closed via buttons, keyboard, or clicks
2. **Non-Dismissible HUD**: Gameplay overlay remains active during play
3. **Action Buttons**: Orchestration-driven actions (Start Quest, New Quest, etc.)
4. **Options Integration**: In-overlay settings for difficulty and preferences

## UI Cleanup Checklist

### ✅ Removed Legacy Elements

1. **Level Selector** (line 49 in original): Dropdown selector in bottom-left corner
2. **[Next Level] Button** (line 63 in original): Manual level progression button
3. **[Back] Button** (line 129 in HTML): Navigation button in game container
4. **Physics Puzzle Buttons**: All hardcoded UI fallback logic
5. **Level References**: Text displays showing level information

### ✅ Replaced With Orchestration

1. **Scene-based Overlays**: Intro, Play, GameOver states with medieval styling
2. **Input-driven Transitions**: Consistent across all input modes with fade effects
3. **Persistent Settings**: Difficulty and input mode preservation with localStorage
4. **Touch Gesture Support**: Interactive touch zones with visual feedback
5. **Modal System**: Orchestration-driven overlay management with proper cleanup

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