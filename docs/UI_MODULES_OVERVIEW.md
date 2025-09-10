# MIFF UI Modules Overview

## Overview
This document provides an overview of the existing UI module system in MIFF, including the dispatcher overlays and input systems that have been recovered and verified.

## Existing UI System Architecture

### Dispatcher System (`site/overlays/dispatcher.js`)
The MIFF overlay dispatcher provides a unified interface for managing game UI overlays across all zones.

#### Core Functions
- `showIntro(opts)` - Display intro modal with start button
- `showHUD(opts)` - Display heads-up display with progress/inventory
- `showGameOver(opts)` - Display game over modal with restart options
- `showLore(opts)` - Display lore/information modal
- `hide(kind)` - Hide specific overlay types

#### Usage Example
```javascript
// Initialize dispatcher
UI = createOverlayDispatcher($('gameContainer'));

// Show intro modal
UI.showIntro({
  title: 'Witcher Grove',
  message: 'Use joystick or Arrow/WASD. Press C for Credits.',
  onStart: () => {
    UI.showHUD({ inputMode, fullscreenToggle: true });
  }
});

// Show HUD with progress
UI.showHUD({
  inputMode: 'Touch (Joystick)',
  progress: '3/6',
  inventory: 'Herb, Potion',
  fullscreenToggle: true
});
```

### Attribution Footer (`site/overlays/footer.js`)
Provides consistent attribution across all zones.

#### Functions
- `createAttributionFooter()` - Create footer element
- `addAttributionFooter()` - Add footer to page

## Input System Integration

### Input Mode Detection
All zones now properly detect and report input modes:
- **Touch** - Mobile touch input with joystick
- **Mouse** - Desktop mouse input
- **Keyboard** - Keyboard input (WASD/Arrow keys)
- **Gamepad** - Gamepad controller input

### Joystick System
Each zone implements a touch-friendly joystick for mobile input:

```javascript
// Joystick creation and positioning
function createJoystick() {
  const ui = getUIComponent('joystick');
  const { base, knob, spec } = ui;
  
  // Apply CSS positioning
  base.style.position = 'absolute';
  base.style.left = spec.left + 'px';
  base.style.bottom = spec.bottom + 'px';
  base.style.width = spec.base + 'px';
  base.style.height = spec.base + 'px';
  base.style.zIndex = '20';
}
```

## Zone-Specific UI Implementations

### 1. Witcher Grove
- **IntroModal**: Welcome message with controls
- **LoreModal**: NPC dialogue and item descriptions
- **HUD**: Input mode, fullscreen toggle
- **Joystick**: 96px base, 48px knob, positioned at 80px left/bottom

### 2. Toppler
- **IntroModal**: Game start with character selection
- **GameOverModal**: Level completion with restart options
- **HUD**: Progress, input mode, fullscreen toggle
- **Joystick**: 96px base, 20px knob, positioned at 80px left/bottom

### 3. Spirit Tamer
- **IntroModal**: Spirit taming introduction
- **GameOverModal**: Spirit tamed celebration
- **HUD**: Progress bar, input mode, fullscreen toggle
- **Joystick**: 96px base, 20px knob, positioned at 80px left/bottom

### 4. Map Builder
- **IntroModal**: Builder welcome and instructions
- **HUD**: Tile count, trigger count, input mode, fullscreen toggle
- **Toolbar**: Game type, biome, tile selection
- **Trigger Panel**: Trigger assignment interface
- **Collaboration Panel**: Contributor management

## UI Module Registry

### Asset-Based UI Components
UI components are defined in zone asset files and retrieved via:

```javascript
function getUIComponent(name) {
  return registry.ui[name] || null;
}

// Example joystick configuration
ui: {
  joystick: { 
    base: 96, 
    knob: 48, 
    left: 80, 
    bottom: 80 
  }
}
```

### Remix-Safe Styling
All UI modules use remix-safe CSS that:
- Uses relative positioning
- Avoids fixed pixel values where possible
- Supports theme overrides
- Maintains accessibility standards

## Input Event Handling

### Keyboard Events
```javascript
window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  keys[k] = true;
  inputMode = 'Keyboard';
  
  // Zone-specific key handling
  if (k === 'c') {
    UI.showLore({ title: 'Credits', text: 'MIFF Framework' });
  }
});
```

### Touch Events
```javascript
// Joystick touch handling
base.addEventListener('touchstart', startInteraction, { passive: false });
base.addEventListener('touchmove', e => {
  e.preventDefault();
  moveInteraction(e);
}, { passive: false });
base.addEventListener('touchend', endInteraction);
```

### Gamepad Detection
```javascript
setInterval(() => {
  const pads = navigator.getGamepads ? 
    Array.from(navigator.getGamepads()).filter(Boolean) : [];
  if (pads.length) inputMode = 'Gamepad';
}, 1000);
```

## Fullscreen Support

All zones support fullscreen mode via:

```javascript
window.__miffToggleFullscreen = () => {
  const el = document.documentElement;
  if (!document.fullscreenElement) {
    el.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
};
```

## Status Verification

### ✅ Working Components
- Dispatcher overlays (Intro, HUD, GameOver, Lore)
- Input mode detection and switching
- Joystick system for touch input
- Fullscreen toggle functionality
- Attribution footer
- Asset-based UI component loading

### ✅ Zone Integration
- All zones properly initialize UI systems
- Consistent overlay behavior across zones
- Proper input event handling
- Responsive design for mobile/desktop

### ✅ Remix Safety
- UI modules use relative positioning
- CSS classes support theme overrides
- No hardcoded dependencies
- Modular component architecture

## Future Enhancements

1. **UI Module Registry**: Expand the existing asset-based system
2. **Theme System**: Add support for multiple UI themes
3. **Accessibility**: Enhanced screen reader support
4. **Animation System**: Smooth transitions between overlays
5. **Custom Overlays**: Allow zones to define custom overlay types

## Files Involved

- `site/overlays/dispatcher.js` - Core overlay system
- `site/overlays/footer.js` - Attribution footer
- `site/overlays/style.css` - Base UI styles
- Zone-specific asset files - UI component definitions
- Zone index.js files - UI initialization and event handling

## Status: ✅ VERIFIED

The existing UI module system is working correctly across all zones. The dispatcher provides a clean, consistent interface for overlay management, and the input system properly handles multiple input methods with appropriate UI feedback.