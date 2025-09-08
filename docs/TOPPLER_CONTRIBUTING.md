# Toppler Contributor Guide

This guide explains how Toppler Medieval uses orchestration-driven overlays, input handling, and persistence, and how to add or modify overlays safely.

## Orchestration Overview

- Configuration lives in `site/zones/toppler/orchestration.medieval.json`.
- Current keys of interest:
  - `ui.startMenu.enabled`: toggles the Intro overlay.
  - `ui.startMenu.options`: array of menu options and actions.
  - `orchestration.startScene`: conceptual start scene (Intro).
  - `orchestration.scenes`: conceptual scenes `TopplerIntro`, `TopplerPlay`, `TopplerGameOver`.
  - `orchestration.transitions`: conceptual transitions, e.g. `startGame`, `showCredits`.

Note: The current implementation maps these concepts onto DOM overlays in `site/zones/toppler/index.js` and does not yet auto-wire transitions. Buttons call functions that set state and show/hide overlays. Future work may add a small dispatcher to interpret `orchestration.transitions` automatically.

## Overlays and Flow

- Intro overlay: built from `ui.startMenu` when `?theme=medieval`.
- Play HUD: canvas-rendered HUD with state/level/score text.
- Game Over: overlay created by `gameOver()` with a Respawn button.
- LoreModal: opened via `Options → Lore` or the `Lore` menu item.

Typical flow:
1) Show `startMenu` (Intro).
2) On "Start Quest" click → hide Intro → set state to Playing.
3) During play, `gameOver()` shows Game Over overlay; Respawn returns to Idle.
4) LoreModal is dismissible with a Close button.

## Input Handling

- Keyboard: ArrowLeft/ArrowRight to move, ArrowUp to jump. `M` toggles mute. `P` toggles pause.
- Touch: On small screens, `ensureMobileControls()` adds on-screen controls.
- Gamepad: Gamepad polling is stubbed; detection can be added by reading `navigator.getGamepads()` on an interval and updating movement vectors accordingly.

Persist the preferred input mode by writing to `localStorage.toppler_state.inputMode`. Example:

```js
const st = JSON.parse(localStorage.getItem('toppler_state') || '{}');
st.inputMode = 'Keyboard';
localStorage.setItem('toppler_state', JSON.stringify(st));
```

## Persistence Schema

Key: `localStorage.toppler_state` (JSON)

Suggested fields:
- `levelIndex: number`
- `muted: boolean`
- `difficultyLevel: 'Squire' | 'Knight' | 'Warlord'`
- `inputMode: 'Touch' | 'Keyboard' | 'Gamepad'`
- `score: number` (optional, reset on Game Over)

Reset all fields on Game Over when appropriate.

## Adding a New Overlay via Orchestration

1) Extend `orchestration.medieval.json`:

```json
{
  "ui": {
    "startMenu": {
      "enabled": true,
      "options": [
        { "label": "Start Quest", "action": "startGame" },
        { "label": "Lore", "action": "showCredits" },
        { "label": "How to Play", "action": "showHowTo" }
      ]
    }
  },
  "orchestration": {
    "scenes": ["TopplerIntro", "TopplerPlay", "TopplerGameOver", "TopplerHowTo"],
    "transitions": {
      "startGame": { "from": "TopplerIntro", "to": "TopplerPlay" },
      "showHowTo": { "from": "*", "to": "TopplerIntro", "modal": "HowToModal" }
    }
  }
}
```

2) Implement the modal/show function in `site/zones/toppler/index.js` (e.g., `showHowToModal()`), ensuring it:
   - Creates an overlay via `ensureOverlay(id)`
   - Adds content and a close button
   - Removes itself on close

3) Wire the start menu to call your action by matching the `action` value to an implementation (see `showLoreModal()` reference).

## Styling Notes

- Overlays are centered absolutely with a semi-transparent dark background and rounded corners.
- Buttons use `.btn` / `.btn-secondary` classes for consistent styling.
- Keep content readable at 360×640 viewport; verify on mobile.

## UI Cleanup Checklist

- Remove the bottom-left level selector (`#levelSelector`).
- Remove the `[Next Level]` button created in `bindInputs()`.
- Remove the `[Back]` button in `index.html` (`#btn_back`).
- Remove physics puzzle buttons and any fallback logic in favor of orchestration-driven overlays and gestures.

## Verification

- Confirm Intro, Play, Game Over overlays appear via orchestration/UI hooks (not hardcoded timers).
- Confirm input mode detection/persistence across reloads.
- Confirm difficulty binds to gravity/enemy speed as expected.
- Confirm fade/transition responsiveness on mobile and desktop.

