// UI Modules Registry
// Each module implements: init(), render(), update(data), destroy()

import * as MainMenu from './MainMenu.js';
import * as QuestLog from './QuestLog.js';
import * as InventoryGrid from './InventoryGrid.js';
import * as DialogueBox from './DialogueBox.js';
import * as HUDBar from './HUDBar.js';
import * as PauseMenu from './PauseMenu.js';

export { MainMenu, QuestLog, InventoryGrid, DialogueBox, HUDBar, PauseMenu };

export const UIModules = {
  MainMenu,
  QuestLog,
  InventoryGrid,
  DialogueBox,
  HUDBar,
  PauseMenu
};

export default UIModules;

