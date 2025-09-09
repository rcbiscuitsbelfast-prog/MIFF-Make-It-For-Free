## UI Modules Overview

Location: `site/ui_modules/`

Modules (pure, remix-safe):
- MainMenu: Intro overlay with configurable buttons (Start, Credits)
- QuestLog: Scrollable quest list
- InventoryGrid: Simple fixed-size grid with item labels
- DialogueBox: Speaker/title + text content
- HUDBar: Inline HUD indicator (input mode + extra info)
- PauseMenu: Resume/Restart actions

Each module exports functions:
- `init(opts)` → returns context with state and callbacks
- `render(ctx)` → returns DOM element to mount
- `update(ctx, data)` → updates state/DOM
- `destroy(ctx)` → cleanup and remove element

Usage (dispatcher integration):
```js
import { createOverlayDispatcher } from 'site/overlays/dispatcher.js';
import { MainMenu, HUDBar } from 'site/ui_modules/index.js';

const UI = createOverlayDispatcher(rootEl);
UI.useModule('HUD', HUDBar, { inputMode: 'Keyboard' });
UI.showIntro({ title: 'My Zone' });
UI.useModule('IntroModal', MainMenu, { title: 'My Zone', onAction:(id)=>{/* ... */} });
```

Targets for `useModule(target, module, opts)`:
- `IntroModal`, `LoreModal`, `GameOverModal`, `HUD`

Input hooks:
- Call `UI.setInputMode(mode)` to propagate input changes to `HUDBar`

Styling:
- Default: `site/ui_modules/style.css`
- Zones may override in a zone-specific CSS (e.g., `zone.css`)

Remix notes:
- Keep module state isolated; no side effects outside created elements
- Avoid absolute positioning; rely on container positioning


### Style Presets and Overrides

Import presets:
```js
import { UI_STYLES } from 'site/ui_modules/style_presets.js'
const style = UI_STYLES.fantasy
```

Pass style into modules via dispatcher:
```js
UI.setDefaultStyle(UI_STYLES.default)
UI.useModule('IntroModal', MainMenu, { title: 'Zone', style: UI_STYLES.fantasy })
UI.useModule('HUD', HUDBar, { inputMode: 'Keyboard', style: UI_STYLES.sciFi })
```

Custom override example:
```js
const customStyle = {
  fontFamily: 'Courier New', fontSize: '20px', color: '#ffcc00',
  background: '#1a1a1a', borderRadius: '6px', padding: '14px'
}
UI.useModule('IntroModal', MainMenu, { title:'My Zone', style: customStyle })
```

Remix safety:
- Styles are applied inline to mounted module roots only
- Defaults remain remix-safe; zones can override without affecting others

