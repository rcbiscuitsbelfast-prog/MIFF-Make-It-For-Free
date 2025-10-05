/**
 * RenderWorld Overlay System
 * 
 * Integrates overlays, menus, and inventory into RenderWorld
 * Provides contextual overlays, scan mode, and interactive UI elements
 */

class RenderWorldOverlaySystem {
  constructor(renderer) {
    this.renderer = renderer;
    this.canvas = renderer.canvas;
    this.overlays = new Map();
    this.activeOverlays = new Set();
    this.menuSystem = new MenuSystemCore();
    this.inventorySystem = new InventorySystemCore();
    this.scanMode = false;
    this.lensMode = 'normal';
    
    this.initializeOverlays();
    this.setupEventHandlers();
  }

  initializeOverlays() {
    // Perception Filter Layer - Contextual overlays
    this.overlays.set('perception', new PerceptionFilterLayer({
      scanMode: false,
      dangerZones: true,
      npcAura: true,
      interactableHighlights: true
    }));

    // Scan Feedback Layer - Wireframe overlays and pulse effects
    this.overlays.set('scan', new ScanFeedbackLayer({
      wireframeMode: true,
      pulseCooldown: 2000,
      interactableHighlights: true,
      scanRadius: 5.0
    }));

    // Lens Mode Switcher - Toggle between view modes
    this.overlays.set('lens', new LensModeSwitcher({
      modes: ['normal', 'scan', 'filtered'],
      currentMode: 'normal'
    }));

    // Overlay FX - Visual effects
    this.overlays.set('fx', new OverlayFXPure({
      blur: false,
      vignette: false,
      colorShift: false
    }));

    // HUD Polish Layer - Icon-based HUD
    this.overlays.set('hud', new HUDPolishLayer({
      safeArea: true,
      iconBased: true,
      responsive: true
    }));

    // Dialogue Box Layer - NPC speech and system alerts
    this.overlays.set('dialogue', new DialogueBoxLayer({
      npcSpeech: true,
      portalMessages: true,
      systemAlerts: true
    }));

    // Button Style System - Stateless button styling
    this.overlays.set('buttons', new ButtonStylePure({
      presets: ['primary', 'secondary', 'danger', 'success']
    }));

    // Inventory UI - Stateless inventory display
    this.overlays.set('inventory', new InventoryUIPure({
      displayMode: 'grid',
      maxItems: 20,
      responsive: true
    }));

    // Item Pickup Layer - Proximity detection and pickup animation
    this.overlays.set('pickup', new ItemPickupLayer({
      proximityRadius: 2.0,
      pickupAnimation: true,
      inventoryInsertion: true
    }));

    // Interactable Registry - Maps objects to behaviors
    this.overlays.set('interactables', new InteractableRegistryPure({
      pickup: true,
      talk: true,
      scan: true,
      use: true
    }));
  }

  setupEventHandlers() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      switch(event.key.toLowerCase()) {
        case 'e':
          this.toggleScanMode();
          break;
        case 'i':
          this.toggleInventory();
          break;
        case 'm':
          this.toggleMenu();
          break;
        case 'tab':
          event.preventDefault();
          this.cycleLensMode();
          break;
        case 'escape':
          this.closeAllOverlays();
          break;
      }
    });

    // Mouse interactions
    this.canvas.addEventListener('click', (event) => {
      this.handleCanvasClick(event);
    });

    // Touch interactions for mobile
    this.canvas.addEventListener('touchstart', (event) => {
      this.handleTouchStart(event);
    });
  }

  toggleScanMode() {
    this.scanMode = !this.scanMode;
    
    if (this.scanMode) {
      this.activateOverlay('scan');
      this.activateOverlay('perception');
      this.lensMode = 'scan';
      this.showNotification('Spirit Lens activated - Scan mode ON', 'scan');
    } else {
      this.deactivateOverlay('scan');
      this.deactivateOverlay('perception');
      this.lensMode = 'normal';
      this.showNotification('Spirit Lens deactivated - Normal mode', 'info');
    }
  }

  toggleInventory() {
    const inventoryOverlay = this.overlays.get('inventory');
    if (this.activeOverlays.has('inventory')) {
      this.deactivateOverlay('inventory');
      this.showNotification('Inventory closed', 'info');
    } else {
      this.activateOverlay('inventory');
      this.showNotification('Inventory opened', 'info');
    }
  }

  toggleMenu() {
    this.menuSystem.toggle();
  }

  cycleLensMode() {
    const modes = ['normal', 'scan', 'filtered'];
    const currentIndex = modes.indexOf(this.lensMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    this.lensMode = modes[nextIndex];
    
    this.updateLensMode();
    this.showNotification(`Lens mode: ${this.lensMode}`, 'info');
  }

  updateLensMode() {
    // Deactivate all overlays first
    this.deactivateOverlay('scan');
    this.deactivateOverlay('perception');
    this.deactivateOverlay('fx');

    switch(this.lensMode) {
      case 'scan':
        this.activateOverlay('scan');
        this.activateOverlay('perception');
        break;
      case 'filtered':
        this.activateOverlay('perception');
        this.activateOverlay('fx');
        break;
      case 'normal':
      default:
        // Normal mode - no special overlays
        break;
    }
  }

  activateOverlay(name) {
    const overlay = this.overlays.get(name);
    if (overlay && !this.activeOverlays.has(name)) {
      overlay.activate();
      this.activeOverlays.add(name);
    }
  }

  deactivateOverlay(name) {
    const overlay = this.overlays.get(name);
    if (overlay && this.activeOverlays.has(name)) {
      overlay.deactivate();
      this.activeOverlays.delete(name);
    }
  }

  closeAllOverlays() {
    this.activeOverlays.forEach(name => {
      this.deactivateOverlay(name);
    });
    this.menuSystem.close();
  }

  handleCanvasClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check for interactable objects
    const interactables = this.overlays.get('interactables');
    const clickedObject = interactables.getObjectAt(x, y);

    if (clickedObject) {
      this.handleObjectInteraction(clickedObject);
    }
  }

  handleTouchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Handle touch interactions
    this.handleCanvasClick({ clientX: touch.clientX, clientY: touch.clientY });
  }

  handleObjectInteraction(object) {
    const interactables = this.overlays.get('interactables');
    const behavior = interactables.getBehavior(object.id);

    switch(behavior) {
      case 'pickup':
        this.handleItemPickup(object);
        break;
      case 'talk':
        this.handleNPCDialogue(object);
        break;
      case 'scan':
        this.handleObjectScan(object);
        break;
      case 'use':
        this.handleObjectUse(object);
        break;
    }
  }

  handleItemPickup(object) {
    const pickupLayer = this.overlays.get('pickup');
    const inventory = this.overlays.get('inventory');
    
    if (pickupLayer.canPickup(object)) {
      pickupLayer.pickupItem(object);
      inventory.addItem(object);
      this.showNotification(`Picked up: ${object.name}`, 'success');
    }
  }

  handleNPCDialogue(object) {
    const dialogueLayer = this.overlays.get('dialogue');
    dialogueLayer.startDialogue(object);
  }

  handleObjectScan(object) {
    if (this.scanMode) {
      const scanLayer = this.overlays.get('scan');
      scanLayer.scanObject(object);
      this.showNotification(`Scanned: ${object.name}`, 'scan');
    }
  }

  handleObjectUse(object) {
    this.showNotification(`Used: ${object.name}`, 'info');
  }

  showNotification(message, type = 'info', duration = 3000) {
    // Dispatch custom event for the main HTML to handle
    document.dispatchEvent(new CustomEvent('renderworld-notification', {
      detail: { message, type, duration }
    }));
  }

  update(deltaTime) {
    // Update all active overlays
    this.activeOverlays.forEach(name => {
      const overlay = this.overlays.get(name);
      if (overlay && overlay.update) {
        overlay.update(deltaTime);
      }
    });

    // Update menu system
    this.menuSystem.update(deltaTime);

    // Update inventory system
    this.inventorySystem.update(deltaTime);
  }

  render() {
    // Render all active overlays
    this.activeOverlays.forEach(name => {
      const overlay = this.overlays.get(name);
      if (overlay && overlay.render) {
        overlay.render();
      }
    });

    // Render menu system
    this.menuSystem.render();

    // Render inventory system
    this.inventorySystem.render();
  }
}

// Overlay Layer Classes
class PerceptionFilterLayer {
  constructor(config) {
    this.config = config;
    this.active = false;
    this.dangerZones = [];
    this.npcAuras = [];
    this.interactableHighlights = [];
  }

  activate() {
    this.active = true;
    this.updateFiltering();
  }

  deactivate() {
    this.active = false;
  }

  updateFiltering() {
    // Update contextual overlays based on current scene
    this.dangerZones = this.findDangerZones();
    this.npcAuras = this.findNPCAuras();
    this.interactableHighlights = this.findInteractables();
  }

  findDangerZones() {
    // Find dangerous areas in the scene
    return [];
  }

  findNPCAuras() {
    // Find NPCs and their aura effects
    return [];
  }

  findInteractables() {
    // Find interactable objects
    return [];
  }

  render() {
    if (!this.active) return;

    // Render danger zone overlays
    this.dangerZones.forEach(zone => {
      this.renderDangerZone(zone);
    });

    // Render NPC auras
    this.npcAuras.forEach(aura => {
      this.renderNPCAura(aura);
    });

    // Render interactable highlights
    this.interactableHighlights.forEach(highlight => {
      this.renderInteractableHighlight(highlight);
    });
  }

  renderDangerZone(zone) {
    // Render danger zone visualization
  }

  renderNPCAura(aura) {
    // Render NPC aura effect
  }

  renderInteractableHighlight(highlight) {
    // Render interactable object highlight
  }
}

class ScanFeedbackLayer {
  constructor(config) {
    this.config = config;
    this.active = false;
    this.scannedObjects = [];
    this.pulseTimer = 0;
  }

  activate() {
    this.active = true;
    this.pulseTimer = 0;
  }

  deactivate() {
    this.active = false;
    this.scannedObjects = [];
  }

  scanObject(object) {
    this.scannedObjects.push({
      object: object,
      timestamp: Date.now(),
      pulsePhase: 0
    });
  }

  update(deltaTime) {
    if (!this.active) return;

    this.pulseTimer += deltaTime;
    
    // Update pulse phases for scanned objects
    this.scannedObjects.forEach(item => {
      item.pulsePhase = (this.pulseTimer * 0.001) % (Math.PI * 2);
    });
  }

  render() {
    if (!this.active) return;

    // Render wireframe overlays
    if (this.config.wireframeMode) {
      this.renderWireframeOverlay();
    }

    // Render scanned objects with pulse effect
    this.scannedObjects.forEach(item => {
      this.renderScannedObject(item);
    });
  }

  renderWireframeOverlay() {
    // Render wireframe visualization
  }

  renderScannedObject(item) {
    // Render scanned object with pulse effect
    const pulseIntensity = Math.sin(item.pulsePhase) * 0.5 + 0.5;
    // Apply pulse effect to object rendering
  }
}

class LensModeSwitcher {
  constructor(config) {
    this.config = config;
    this.currentMode = config.currentMode;
  }

  switchTo(mode) {
    if (this.config.modes.includes(mode)) {
      this.currentMode = mode;
    }
  }

  getCurrentMode() {
    return this.currentMode;
  }
}

class OverlayFXPure {
  constructor(config) {
    this.config = config;
    this.active = false;
  }

  activate() {
    this.active = true;
  }

  deactivate() {
    this.active = false;
  }

  render() {
    if (!this.active) return;

    // Apply visual effects
    if (this.config.blur) {
      this.applyBlur();
    }
    if (this.config.vignette) {
      this.applyVignette();
    }
    if (this.config.colorShift) {
      this.applyColorShift();
    }
  }

  applyBlur() {
    // Apply blur effect
  }

  applyVignette() {
    // Apply vignette effect
  }

  applyColorShift() {
    // Apply color shift effect
  }
}

class HUDPolishLayer {
  constructor(config) {
    this.config = config;
    this.active = true; // HUD is always active
    this.elements = [];
  }

  activate() {
    this.active = true;
  }

  deactivate() {
    this.active = false;
  }

  render() {
    if (!this.active) return;

    // Render HUD elements
    this.elements.forEach(element => {
      this.renderHUDElement(element);
    });
  }

  renderHUDElement(element) {
    // Render individual HUD element
  }
}

class DialogueBoxLayer {
  constructor(config) {
    this.config = config;
    this.activeDialogue = null;
    this.systemAlerts = [];
  }

  startDialogue(npc) {
    this.activeDialogue = {
      npc: npc,
      messages: npc.dialogue || [],
      currentMessage: 0
    };
  }

  endDialogue() {
    this.activeDialogue = null;
  }

  showSystemAlert(message, type = 'info') {
    this.systemAlerts.push({
      message: message,
      type: type,
      timestamp: Date.now()
    });
  }

  render() {
    if (this.activeDialogue) {
      this.renderDialogueBox();
    }

    this.systemAlerts.forEach(alert => {
      this.renderSystemAlert(alert);
    });
  }

  renderDialogueBox() {
    // Render dialogue box
  }

  renderSystemAlert(alert) {
    // Render system alert
  }
}

class ButtonStylePure {
  constructor(config) {
    this.config = config;
    this.styles = this.generateStyles();
  }

  generateStyles() {
    return {
      primary: { background: '#00d4ff', color: '#000', border: 'none' },
      secondary: { background: '#666', color: '#fff', border: '1px solid #888' },
      danger: { background: '#ff4444', color: '#fff', border: 'none' },
      success: { background: '#44ff44', color: '#000', border: 'none' }
    };
  }

  getStyle(preset) {
    return this.styles[preset] || this.styles.primary;
  }
}

class InventoryUIPure {
  constructor(config) {
    this.config = config;
    this.active = false;
    this.items = [];
    this.selectedItem = null;
  }

  activate() {
    this.active = true;
  }

  deactivate() {
    this.active = false;
  }

  addItem(item) {
    this.items.push(item);
  }

  removeItem(itemId) {
    this.items = this.items.filter(item => item.id !== itemId);
  }

  render() {
    if (!this.active) return;

    // Render inventory grid/list
    if (this.config.displayMode === 'grid') {
      this.renderGrid();
    } else {
      this.renderList();
    }
  }

  renderGrid() {
    // Render inventory as grid
  }

  renderList() {
    // Render inventory as list
  }
}

class ItemPickupLayer {
  constructor(config) {
    this.config = config;
    this.pickupableItems = [];
    this.pickupAnimations = [];
  }

  canPickup(item) {
    return this.pickupableItems.includes(item);
  }

  pickupItem(item) {
    // Start pickup animation
    this.pickupAnimations.push({
      item: item,
      startTime: Date.now(),
      duration: 500
    });
  }

  update(deltaTime) {
    // Update pickup animations
    this.pickupAnimations = this.pickupAnimations.filter(anim => {
      const elapsed = Date.now() - anim.startTime;
      return elapsed < anim.duration;
    });
  }

  render() {
    // Render pickup animations
    this.pickupAnimations.forEach(anim => {
      this.renderPickupAnimation(anim);
    });
  }

  renderPickupAnimation(anim) {
    // Render pickup animation effect
  }
}

class InteractableRegistryPure {
  constructor(config) {
    this.config = config;
    this.interactables = new Map();
  }

  registerObject(id, behavior, data) {
    this.interactables.set(id, { behavior, data });
  }

  getBehavior(id) {
    const interactable = this.interactables.get(id);
    return interactable ? interactable.behavior : null;
  }

  getObjectAt(x, y) {
    // Find object at screen coordinates
    // This would integrate with the 3D scene
    return null;
  }
}

// Menu System Core
class MenuSystemCore {
  constructor() {
    this.active = false;
    this.currentMenu = null;
    this.menus = new Map();
    this.initializeMenus();
  }

  initializeMenus() {
    this.menus.set('pause', new PauseMenu());
    this.menus.set('settings', new SettingsMenu());
    this.menus.set('main', new MainMenu());
  }

  toggle() {
    this.active = !this.active;
    if (this.active) {
      this.openMenu('pause');
    } else {
      this.close();
    }
  }

  openMenu(name) {
    this.currentMenu = this.menus.get(name);
    this.active = true;
  }

  close() {
    this.currentMenu = null;
    this.active = false;
  }

  update(deltaTime) {
    if (this.currentMenu) {
      this.currentMenu.update(deltaTime);
    }
  }

  render() {
    if (this.currentMenu) {
      this.currentMenu.render();
    }
  }
}

class PauseMenu {
  constructor() {
    this.options = ['Resume', 'Settings', 'Main Menu', 'Exit'];
    this.selectedIndex = 0;
  }

  update(deltaTime) {
    // Handle menu navigation
  }

  render() {
    // Render pause menu
  }
}

class SettingsMenu {
  constructor() {
    this.settings = {
      quality: 'high',
      volume: 1.0,
      controls: 'keyboard'
    };
  }

  update(deltaTime) {
    // Handle settings changes
  }

  render() {
    // Render settings menu
  }
}

class MainMenu {
  constructor() {
    this.options = ['Start Game', 'Load Game', 'Settings', 'Exit'];
    this.selectedIndex = 0;
  }

  update(deltaTime) {
    // Handle menu navigation
  }

  render() {
    // Render main menu
  }
}

// Inventory System Core
class InventorySystemCore {
  constructor() {
    this.items = new Map();
    this.maxSlots = 20;
    this.maxWeight = 100;
  }

  addItem(item) {
    if (this.canAddItem(item)) {
      this.items.set(item.id, item);
      return true;
    }
    return false;
  }

  removeItem(itemId) {
    return this.items.delete(itemId);
  }

  canAddItem(item) {
    return this.items.size < this.maxSlots && this.getTotalWeight() + item.weight <= this.maxWeight;
  }

  getTotalWeight() {
    let total = 0;
    this.items.forEach(item => {
      total += item.weight * item.quantity;
    });
    return total;
  }

  update(deltaTime) {
    // Update inventory state
  }

  render() {
    // Render inventory system
  }
}

// Export for use in RenderWorld
window.RenderWorldOverlaySystem = RenderWorldOverlaySystem;