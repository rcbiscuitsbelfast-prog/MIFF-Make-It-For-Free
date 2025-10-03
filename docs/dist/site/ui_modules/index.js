// UI Modules Registry
// Each module implements: init(), render(), update(data), destroy()

import * as MainMenu from './MainMenu.js';
import * as QuestLog from './QuestLog.js';
import * as InventoryGrid from './InventoryGrid.js';
import * as DialogueBox from './DialogueBox.js';
import * as HUDBar from './HUDBar.js';
import * as PauseMenu from './PauseMenu.js';
import * as StyleSelector from './StyleSelector.js';
// Optional contributor + badge + quest overlays
import * as ContributorHUD from './modules/ContributorHUD.js';
import * as RemixBadge from './modules/RemixBadge.js';
import * as QuestOverlay from './modules/QuestOverlay.js';

export { MainMenu, QuestLog, InventoryGrid, DialogueBox, HUDBar, PauseMenu, StyleSelector, ContributorHUD, RemixBadge, QuestOverlay };
export const { wrap: StyleWrap } = StyleSelector;

export const UIModules = {
  MainMenu,
  QuestLog,
  InventoryGrid,
  DialogueBox,
  HUDBar,
  PauseMenu,
  StyleSelector,
  ContributorHUD,
  RemixBadge,
  QuestOverlay
};

export default UIModules;

