# Input Mode Detection Documentation

## Overview
This document details the comprehensive input mode detection system implemented across all MIFF game zones to properly handle touch, mouse, keyboard, and gamepad input across all devices.

## Input Mode Detection System

### Core Detection Function
```javascript
function detectInputMode() {
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const hasGamepad = navigator.getGamepads ? 
    Array.from(navigator.getGamepads()).filter(Boolean).length > 0 : false;
  
  if (hasGamepad) {
    inputMode = 'Gamepad';
  } else if (isTouch) {
    inputMode = 'Touch';
  } else {
    inputMode = 'Mouse';
  }
  
  console.log('[Zone] Input mode detected:', inputMode, 'touch:', isTouch, 'gamepad:', hasGamepad);
  return inputMode;
}
```

### Detection Logic

1. **Gamepad Detection**: Highest priority - checks for connected gamepads
2. **Touch Detection**: Second priority - detects touch capability
3. **Mouse Detection**: Default fallback for desktop devices

### Touch Detection Methods
- `'ontouchstart' in window` - Checks for touch event support
- `navigator.maxTouchPoints > 0` - Checks for touch point capability

### Gamepad Detection
- Uses `navigator.getGamepads()` API
- Filters out null/undefined gamepads
- Checks for active gamepad connections

## Implementation Across Zones

### Witcher Grove (`site/zones/witcher_grove/index.js`)
```javascript
// Input mode detection
function detectInputMode() {
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const hasGamepad = navigator.getGamepads ? 
    Array.from(navigator.getGamepads()).filter(Boolean).length > 0 : false;
  
  if (hasGamepad) {
    inputMode = 'Gamepad';
  } else if (isTouch) {
    inputMode = 'Touch';
  } else {
    inputMode = 'Mouse';
  }
  
  console.log('[Grove] Input mode detected:', inputMode, 'touch:', isTouch, 'gamepad:', hasGamepad);
  try { updateGameState({ inputMode }); } catch {}
  return inputMode;
}
```

### Toppler (`site/zones/toppler/index.js`)
```javascript
// Input mode detection
function detectInputMode() {
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const hasGamepad = navigator.getGamepads ? 
    Array.from(navigator.getGamepads()).filter(Boolean).length > 0 : false;
  
  if (hasGamepad) {
    game.inputMode = 'Gamepad';
  } else if (isTouch) {
    game.inputMode = 'Touch';
  } else {
    game.inputMode = 'Mouse';
  }
  
  console.log('[Toppler] Input mode detected:', game.inputMode, 'touch:', isTouch, 'gamepad:', hasGamepad);
  return game.inputMode;
}
```

### Spirit Tamer (`site/zones/spirit_tamer/index.js`)
```javascript
function detectInputMode(){
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const hasGamepad = navigator.getGamepads ? 
    Array.from(navigator.getGamepads()).filter(Boolean).length > 0 : false;
  
  if (hasGamepad) {
    model.inputMode = 'Gamepad';
  } else if (isTouch) {
    model.inputMode = 'Touch';
  } else {
    model.inputMode = 'Mouse';
  }
  
  console.log('[SpiritTamer] Input mode detected:', model.inputMode, 'touch:', isTouch, 'gamepad:', hasGamepad);
  persist();
  return model.inputMode;
}
```

## Dynamic Input Mode Updates

### Orientation Change Handling
```javascript
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    resizeCanvas();
    detectInputMode();
  }, 100);
});
```

### Runtime Input Detection
Each zone maintains input mode detection through event listeners:

```javascript
// Keyboard input detection
window.addEventListener('keydown', e => { 
  inputMode = 'Keyboard'; 
  try { updateGameState({ inputMode }); } catch {}
});

// Touch input detection
window.addEventListener('pointerdown', () => { 
  inputMode = 'Touch'; 
  try { updateGameState({ inputMode }); } catch {}
});

// Gamepad detection (polling)
setInterval(() => { 
  const pads = navigator.getGamepads ? 
    Array.from(navigator.getGamepads()).filter(Boolean) : []; 
  if (pads.length){ 
    inputMode = 'Gamepad'; 
    try { updateGameState({ inputMode }); } catch {} 
  }
}, 1000);
```

## Input Mode States

### Available Input Modes
1. **Mouse** - Desktop mouse input
2. **Touch** - Mobile/tablet touch input
3. **Keyboard** - Keyboard input (overrides mouse)
4. **Gamepad** - Gamepad/controller input (highest priority)

### State Management
- Input mode is stored in zone-specific variables (`inputMode`, `game.inputMode`, `model.inputMode`)
- State is persisted to localStorage where applicable
- State is synchronized with global game state via `updateGameState()`

## UI Adaptation

### Touch Mode UI
- Virtual joystick appears for touch input
- Touch-friendly button sizing
- Gesture recognition for game controls

### Gamepad Mode UI
- Gamepad button prompts
- Controller-specific navigation
- Haptic feedback support (where available)

### Mouse/Keyboard Mode UI
- Cursor-based interactions
- Keyboard shortcuts
- Desktop-optimized layouts

## Debugging and Logging

### Console Output
Each zone logs input mode detection:
```
[Zone] Input mode detected: Touch touch: true gamepad: false
[Zone] Input mode detected: Mouse touch: false gamepad: false
[Zone] Input mode detected: Gamepad touch: false gamepad: true
```

### State Verification
Input mode can be verified through:
- Browser console logs
- Game state inspection
- UI element visibility (joystick, button prompts)

## Testing Scenarios

### Desktop Testing
- Mouse input should be detected
- Keyboard input should override mouse
- Gamepad should be detected when connected

### Mobile Testing
- Touch input should be detected
- Orientation changes should maintain input mode
- Virtual controls should appear

### Gamepad Testing
- Gamepad should be detected when connected
- Gamepad input should override other modes
- Disconnection should fall back to previous mode

## Future Enhancements

### Planned Features
- Multi-input support (simultaneous touch + gamepad)
- Custom input mapping
- Accessibility input modes
- Voice input detection
- Eye tracking input support

### Performance Optimizations
- Reduce gamepad polling frequency when not needed
- Implement input mode caching
- Add input mode change debouncing