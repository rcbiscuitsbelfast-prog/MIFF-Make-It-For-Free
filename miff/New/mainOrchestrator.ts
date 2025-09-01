/**
 * MIFF Main Orchestrator
 * 
 * Unifies core systems into a playable game loop with:
 * - Zone loading and transitions
 * - Player movement and collision detection
 * - NPC interaction and dialogue
 * - Tile events and triggers
 * - Save/load fidelity
 * - Input handling (keyboard, mouse, touch)
 * - Rendering bridge integration
 * - Scenario and audio integration
 * - Game state management
 */

// Core System Imports
import { getPlayerPosition, movePlayer, setPlayerPosition } from './playerPosition';
import { getWorld, initWorld, setFlag, placeNPC } from './worldState';
import { registerNPC, getNPC, getAllNPCs } from './npcRegistry';
import { registerNPCTrigger, runNPCTrigger } from './npcTriggers';
import { loadZone } from './zoneLoader';
import { transitionToZone } from './zoneTransitions';
import { saveGame, SaveData } from './saveGame';
import { loadGame } from './loadGame';
import { setScenarioFlag, getScenarioFlag, clearScenarioFlags } from './scenarioFlags';
import { registerDialogue, getNextLine, resetDialogue } from './dialogueEngine';
import { on, emit, clearEvent } from './eventBus';
import { registerInteraction, runInteraction } from './interactionHooks';
import { addQuest, completeQuest, getQuestStatus, listQuests } from './questTracker';
import { addItem, removeItem, listInventory } from './inventoryState';

// Tile System Imports
import { TileManager } from '../TileMapPure/tileManager';
import { TileType } from '../TileMapPure/tileTypes';
import { isWalkable, getMovementCost, getTileColor, getTileLabel } from '../TileMapPure/tileUtils';
import { registerTileEvent, triggerTileEvent } from '../TileMapPure/tileEvents';
import { registerTileTrigger, runTileTrigger } from '../TileMapPure/tileTriggers';
import { snapshotTileState, restoreTileState } from '../TileMapPure/tileState';
import { applyScenarioTiles } from '../TileMapPure/tileOrchestrator';

// Advanced Tile Modules
import { addFogTile, removeFogTile, isFogged } from '../TileMapPure/tileFog';
import { spawnLoot, collectLoot, getLootAt } from '../TileMapPure/tileLoot';
import { startCrafting, completeCrafting, getCraftingRecipe } from '../TileMapPure/tileCrafting';
import { playTileAudio, stopTileAudio, setTileAmbient } from '../TileMapPure/tileAudio';
import { applyStatusEffect, removeStatusEffect, getStatusEffects } from './statusEffects';
import { setCombatFlag, getCombatFlag, clearCombatFlags } from './combatFlags';

// Input System Types
export interface InputEvent {
  type: 'keyboard' | 'mouse' | 'touch';
  action: string;
  x?: number;
  y?: number;
  key?: string;
  button?: number;
  touches?: Touch[];
}

export interface TouchGesture {
  type: 'tap' | 'swipe' | 'pinch' | 'pan';
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
  deltaX?: number;
  deltaY?: number;
  scale?: number;
}

// Game State Management
export enum GameState {
  LOADING = 'loading',
  PLAYING = 'playing',
  PAUSED = 'paused',
  DIALOGUE = 'dialogue',
  MENU = 'menu',
  SAVING = 'saving',
  LOADING_GAME = 'loading_game'
}

export interface GameConfig {
  targetFPS: number;
  enableTouch: boolean;
  enableAudio: boolean;
  enableDebug: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
}

export class MainOrchestrator {
  private gameState: GameState = GameState.LOADING;
  private config: GameConfig;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private animationFrameId: number | null = null;
  private autoSaveTimer: number = 0;
  
  // Input handling
  private inputHandlers: Map<string, (event: InputEvent) => void> = new Map();
  private touchStartTime: number = 0;
  private touchStartPos: { x: number; y: number } = { x: 0, y: 0 };
  private lastTouchPos: { x: number; y: number } = { x: 0, y: 0 };
  private isMultiTouch: boolean = false;
  
  // Rendering bridge
  private renderBridge: any = null;
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  
  // UI state
  private showDebugOverlay: boolean = false;
  private showInventory: boolean = false;
  private showQuests: boolean = false;
  private currentDialogue: string | null = null;
  private dialogueNPC: string | null = null;

  constructor(config: Partial<GameConfig> = {}) {
    this.config = {
      targetFPS: 60,
      enableTouch: true,
      enableAudio: true,
      enableDebug: false,
      autoSave: true,
      autoSaveInterval: 30000, // 30 seconds
      ...config
    };
    
    this.initializeSystems();
    this.setupInputHandlers();
    this.setupEventListeners();
  }

  // System Initialization
  private initializeSystems(): void {
    // Initialize default zone
    loadZone('grove');
    
    // Register default NPCs
    this.registerDefaultNPCs();
    
    // Register default interactions
    this.registerDefaultInteractions();
    
    // Register default tile events
    this.registerDefaultTileEvents();
    
    // Setup scenario flags
    this.initializeScenarioFlags();
    
    console.log('MIFF Main Orchestrator initialized');
  }

  private registerDefaultNPCs(): void {
    // Register NPC triggers
    registerNPCTrigger('elderSpirit', (npcId, x, y) => {
      this.startDialogue('elderSpirit', [
        'Welcome, traveler.',
        'The grove remembers you.',
        'What brings you to these ancient woods?'
      ]);
    });

    // Register dialogue
    registerDialogue('elderSpirit', [
      'Welcome, traveler.',
      'The grove remembers you.',
      'What brings you to these ancient woods?'
    ]);
  }

  private registerDefaultInteractions(): void {
    registerInteraction('talkToSpirit', (x, y) => {
      const npc = this.getNPCAtPosition(x, y);
      if (npc) {
        runNPCTrigger(npc.id, x, y);
      }
    });

    registerInteraction('examineTile', (x, y) => {
      const world = getWorld();
      if (world) {
        const tile = world.tiles.getTile(x, y);
        if (tile) {
          this.showTileInfo(tile.type, x, y);
        }
      }
    });
  }

  private registerDefaultTileEvents(): void {
    // Water tile events
    registerTileEvent(TileType.Water, {
      type: 'enter',
      handler: (x, y, tile) => {
        this.showMessage('You cannot enter water!');
        // Prevent movement into water
        const player = getPlayerPosition();
        setPlayerPosition(player.x, player.y);
      }
    });

    // Forest tile events
    registerTileEvent(TileType.Forest, {
      type: 'enter',
      handler: (x, y, tile) => {
        this.showMessage('You enter the dense forest...');
        if (this.config.enableAudio) {
          playTileAudio('forest_ambient', x, y);
        }
      }
    });

    // Sand tile events
    registerTileEvent(TileType.Sand, {
      type: 'enter',
      handler: (x, y, tile) => {
        this.showMessage('Sand slows your movement...');
        applyStatusEffect({ id: 'slowed', name: 'Slowed', duration: 5000, impact: 'movement' }); // 5 second slow effect
      }
    });
  }

  private initializeScenarioFlags(): void {
    setScenarioFlag('game_started', true);
    setScenarioFlag('first_visit_grove', true);
  }

  // Input System
  private setupInputHandlers(): void {
    this.inputHandlers.set('move_up', () => this.movePlayer(0, -1));
    this.inputHandlers.set('move_down', () => this.movePlayer(0, 1));
    this.inputHandlers.set('move_left', () => this.movePlayer(-1, 0));
    this.inputHandlers.set('move_right', () => this.movePlayer(1, 0));
    this.inputHandlers.set('interact', () => this.interactAtPlayerPosition());
    this.inputHandlers.set('inventory', () => this.toggleInventory());
    this.inputHandlers.set('quests', () => this.toggleQuests());
    this.inputHandlers.set('save', () => this.saveGame());
    this.inputHandlers.set('load', () => this.loadGame());
    this.inputHandlers.set('pause', () => this.togglePause());
    this.inputHandlers.set('debug', () => this.toggleDebugOverlay());
  }

  private setupEventListeners(): void {
    // Keyboard events
    document.addEventListener('keydown', (e) => this.handleKeyboardInput(e));
    
    // Mouse events
    document.addEventListener('click', (e) => this.handleMouseInput(e));
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Touch events
    if (this.config.enableTouch) {
      document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
      document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
      document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
    }
    
    // Window events
    window.addEventListener('beforeunload', () => this.saveGame());
    window.addEventListener('resize', () => this.handleResize());
  }

  // Keyboard Input
  private handleKeyboardInput(event: KeyboardEvent): void {
    if (this.gameState === GameState.MENU || this.gameState === GameState.DIALOGUE) {
      this.handleMenuInput(event);
      return;
    }

    const keyMap: Record<string, string> = {
      'ArrowUp': 'move_up',
      'ArrowDown': 'move_down',
      'ArrowLeft': 'move_left',
      'ArrowRight': 'move_right',
      'w': 'move_up',
      's': 'move_down',
      'a': 'move_left',
      'd': 'move_right',
      ' ': 'interact',
      'e': 'interact',
      'i': 'inventory',
      'q': 'quests',
      'F5': 'save',
      'F9': 'load',
      'Escape': 'pause',
      'F12': 'debug'
    };

    const action = keyMap[event.key];
    if (action && this.inputHandlers.has(action)) {
      event.preventDefault();
      this.inputHandlers.get(action)!(this.createInputEvent('keyboard', action, event.key));
    }
  }

  // Mouse Input
  private handleMouseInput(event: MouseEvent): void {
    if (this.gameState !== GameState.PLAYING) return;

    const rect = this.canvas?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.floor((event.clientX - rect.left) / 32); // Assuming 32px tiles
    const y = Math.floor((event.clientY - rect.top) / 32);

    if (event.button === 0) { // Left click
      this.movePlayerTo(x, y);
    } else if (event.button === 2) { // Right click
      this.interactAtPosition(x, y);
    }
  }

  // Touch Input System
  private handleTouchStart(event: TouchEvent): void {
    if (this.gameState !== GameState.PLAYING) return;

    event.preventDefault();
    this.isMultiTouch = event.touches.length > 1;
    
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.touchStartTime = Date.now();
      this.touchStartPos = { x: touch.clientX, y: touch.clientY };
      this.lastTouchPos = { x: touch.clientX, y: touch.clientY };
    } else if (event.touches.length === 2) {
      // Multi-touch gesture (pinch/zoom)
      this.handleMultiTouchStart(event.touches);
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    if (this.gameState !== GameState.PLAYING) return;

    event.preventDefault();
    
    if (event.touches.length === 1 && !this.isMultiTouch) {
      const touch = event.touches[0];
      this.lastTouchPos = { x: touch.clientX, y: touch.clientY };
    } else if (event.touches.length === 2) {
      this.handleMultiTouchMove(event.touches);
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    if (this.gameState !== GameState.PLAYING) return;

    event.preventDefault();
    
    if (event.touches.length === 0) {
      if (!this.isMultiTouch) {
        this.handleSingleTouchEnd();
      }
      this.isMultiTouch = false;
    }
  }

  private handleSingleTouchEnd(): void {
    const touchDuration = Date.now() - this.touchStartTime;
    const deltaX = this.lastTouchPos.x - this.touchStartPos.x;
    const deltaY = this.lastTouchPos.y - this.touchStartPos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (touchDuration < 300 && distance < 10) {
      // Tap gesture
      this.handleTapGesture();
    } else if (distance > 20) {
      // Swipe gesture
      this.handleSwipeGesture(deltaX, deltaY);
    }
  }

  private handleTapGesture(): void {
    const rect = this.canvas?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.floor((this.touchStartPos.x - rect.left) / 32);
    const y = Math.floor((this.touchStartPos.y - rect.top) / 32);
    
    this.movePlayerTo(x, y);
  }

  private handleSwipeGesture(deltaX: number, deltaY: number): void {
    const threshold = 30;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > threshold) {
        this.movePlayer(1, 0); // Right
      } else if (deltaX < -threshold) {
        this.movePlayer(-1, 0); // Left
      }
    } else {
      // Vertical swipe
      if (deltaY > threshold) {
        this.movePlayer(0, 1); // Down
      } else if (deltaY < -threshold) {
        this.movePlayer(0, -1); // Up
      }
    }
  }

  private handleMultiTouchStart(touches: TouchList): void {
    // Initialize pinch/zoom gesture
    const touch1 = touches[0];
    const touch2 = touches[1];
    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
    // Store initial distance for zoom calculation
  }

  private handleMultiTouchMove(touches: TouchList): void {
    // Handle pinch/zoom and pan gestures
    if (touches.length === 2) {
      const touch1 = touches[0];
      const touch2 = touches[1];
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      // Emit zoom event for rendering bridge
      emit('zoom', { scale: currentDistance / 100 }); // Normalize scale
    }
  }

  private createInputEvent(type: 'keyboard' | 'mouse' | 'touch', action: string, key?: string, x?: number, y?: number): InputEvent {
    return { type, action, x, y, key };
  }

  // Game Loop
  public start(): void {
    this.gameState = GameState.PLAYING;
    this.lastFrameTime = performance.now();
    this.gameLoop();
    console.log('MIFF game loop started');
  }

  public stop(): void {
    this.gameState = GameState.LOADING;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    console.log('MIFF game loop stopped');
  }

  private gameLoop(): void {
    if (this.gameState === GameState.PLAYING || this.gameState === GameState.PAUSED) {
      const currentTime = performance.now();
      const deltaTime = currentTime - this.lastFrameTime;
      
      if (this.gameState === GameState.PLAYING) {
        this.update(deltaTime);
      }
      
      this.render();
      
      this.lastFrameTime = currentTime;
      this.frameCount++;
      
      // Auto-save
      if (this.config.autoSave) {
        this.autoSaveTimer += deltaTime;
        if (this.autoSaveTimer >= this.config.autoSaveInterval) {
          this.saveGame();
          this.autoSaveTimer = 0;
        }
      }
    }
    
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  private update(deltaTime: number): void {
    // Update status effects
    this.updateStatusEffects(deltaTime);
    
    // Update tile animations
    this.updateTileAnimations(deltaTime);
    
    // Update audio
    if (this.config.enableAudio) {
      this.updateAudio(deltaTime);
    }
    
    // Emit update event
    emit('gameUpdate', { deltaTime, frameCount: this.frameCount });
  }

  private render(): void {
    if (!this.canvas || !this.context) return;

    // Clear canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render world
    this.renderWorld();
    
    // Render player
    this.renderPlayer();
    
    // Render NPCs
    this.renderNPCs();
    
    // Render UI
    this.renderUI();
    
    // Render debug overlay
    if (this.showDebugOverlay) {
      this.renderDebugOverlay();
    }
  }

  // Player Movement
  private movePlayer(dx: number, dy: number): void {
    if (this.gameState !== GameState.PLAYING) return;

    const world = getWorld();
    if (!world) return;

    const player = getPlayerPosition();
    const newX = player.x + dx;
    const newY = player.y + dy;

    // Check collision
    if (!world.tiles.isTileWalkable(newX, newY)) {
      this.showMessage('Cannot move there!');
      return;
    }

    // Trigger exit event for current tile
    const currentTile = world.tiles.getTile(player.x, player.y);
    if (currentTile) {
      triggerTileEvent(currentTile.type, 'exit', player.x, player.y);
    }

    // Move player
    const moved = movePlayer(dx, dy, world.tiles);
    if (moved) {
      // Trigger enter event for new tile
      const newTile = world.tiles.getTile(newX, newY);
      if (newTile) {
        triggerTileEvent(newTile.type, 'enter', newX, newY);
        runTileTrigger(newX, newY, newTile.type);
      }
      
      // Check for NPCs at new position
      const npc = this.getNPCAtPosition(newX, newY);
      if (npc) {
        this.showMessage(`You see ${npc.name}`);
      }
      
      emit('playerMoved', { x: newX, y: newY, oldX: player.x, oldY: player.y });
    }
  }

  private movePlayerTo(x: number, y: number): void {
    const player = getPlayerPosition();
    const dx = x - player.x;
    const dy = y - player.y;
    
    // Simple pathfinding - move in steps
    if (Math.abs(dx) > Math.abs(dy)) {
      this.movePlayer(dx > 0 ? 1 : -1, 0);
    } else if (dy !== 0) {
      this.movePlayer(0, dy > 0 ? 1 : -1);
    }
  }

  // Interaction System
  private interactAtPlayerPosition(): void {
    const player = getPlayerPosition();
    this.interactAtPosition(player.x, player.y);
  }

  private interactAtPosition(x: number, y: number): void {
    // Check for NPCs
    const npc = this.getNPCAtPosition(x, y);
    if (npc) {
      runNPCTrigger(npc.id, x, y);
      return;
    }

    // Check for tile interactions
    const world = getWorld();
    if (world) {
      const tile = world.tiles.getTile(x, y);
      if (tile) {
        triggerTileEvent(tile.type, 'interact', x, y);
        runInteraction('examineTile', x, y);
      }
    }
  }

  private getNPCAtPosition(x: number, y: number): any {
    const world = getWorld();
    if (!world) return null;

    for (const [id, npc] of Object.entries(world.npcs)) {
      if (npc.x === x && npc.y === y) {
        return getNPC(id);
      }
    }
    return null;
  }

  // Dialogue System
  private startDialogue(npcId: string, lines: string[]): void {
    this.gameState = GameState.DIALOGUE;
    this.dialogueNPC = npcId;
    this.currentDialogue = lines[0] || '...';
    registerDialogue(npcId, lines);
  }

  private handleMenuInput(event: KeyboardEvent): void {
    if (this.gameState === GameState.DIALOGUE) {
      if (event.key === 'Enter' || event.key === ' ') {
        this.advanceDialogue();
      } else if (event.key === 'Escape') {
        this.endDialogue();
      }
    } else if (this.gameState === GameState.MENU) {
      if (event.key === 'Escape') {
        this.closeMenu();
      }
    }
  }

  private advanceDialogue(): void {
    if (!this.dialogueNPC) return;

    const nextLine = getNextLine(this.dialogueNPC);
    if (nextLine) {
      this.currentDialogue = nextLine;
    } else {
      this.endDialogue();
    }
  }

  private endDialogue(): void {
    this.gameState = GameState.PLAYING;
    this.currentDialogue = null;
    this.dialogueNPC = null;
  }

  // Save/Load System
  public saveGame(): void {
    this.gameState = GameState.SAVING;
    const saveData = saveGame();
    if (saveData) {
      localStorage.setItem('miff_save', JSON.stringify(saveData));
      this.showMessage('Game saved!');
      console.log('Game saved:', saveData);
    }
    this.gameState = GameState.PLAYING;
  }

  public loadGame(): void {
    this.gameState = GameState.LOADING_GAME;
    const saveDataStr = localStorage.getItem('miff_save');
    if (saveDataStr) {
      try {
        const saveData: SaveData = JSON.parse(saveDataStr);
        loadGame(saveData);
        this.showMessage('Game loaded!');
        console.log('Game loaded:', saveData);
      } catch (error) {
        console.error('Failed to load game:', error);
        this.showMessage('Failed to load game!');
      }
    } else {
      this.showMessage('No save file found!');
    }
    this.gameState = GameState.PLAYING;
  }

  // UI Management
  private toggleInventory(): void {
    this.showInventory = !this.showInventory;
    if (this.showInventory) {
      this.gameState = GameState.MENU;
    } else {
      this.gameState = GameState.PLAYING;
    }
  }

  private toggleQuests(): void {
    this.showQuests = !this.showQuests;
    if (this.showQuests) {
      this.gameState = GameState.MENU;
    } else {
      this.gameState = GameState.PLAYING;
    }
  }

  private togglePause(): void {
    if (this.gameState === GameState.PLAYING) {
      this.gameState = GameState.PAUSED;
    } else if (this.gameState === GameState.PAUSED) {
      this.gameState = GameState.PLAYING;
    }
  }

  private toggleDebugOverlay(): void {
    this.showDebugOverlay = !this.showDebugOverlay;
  }

  private closeMenu(): void {
    this.showInventory = false;
    this.showQuests = false;
    this.gameState = GameState.PLAYING;
  }

  // Rendering Methods
  private renderWorld(): void {
    const world = getWorld();
    if (!world || !this.context) return;

    const grid = world.tiles.getGrid();
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const tile = grid[y][x];
        const color = getTileColor(tile.type);
        
        this.context.fillStyle = color;
        this.context.fillRect(x * 32, y * 32, 32, 32);
        
        // Draw tile border
        this.context.strokeStyle = '#333';
        this.context.strokeRect(x * 32, y * 32, 32, 32);
      }
    }
  }

  private renderPlayer(): void {
    if (!this.context) return;

    const player = getPlayerPosition();
    this.context.fillStyle = '#FF0000';
    this.context.fillRect(player.x * 32 + 4, player.y * 32 + 4, 24, 24);
  }

  private renderNPCs(): void {
    const world = getWorld();
    if (!world || !this.context) return;

    for (const [id, npc] of Object.entries(world.npcs)) {
      this.context.fillStyle = '#00FF00';
      this.context.fillRect(npc.x * 32 + 8, npc.y * 32 + 8, 16, 16);
    }
  }

  private renderUI(): void {
    if (!this.context) return;

    // Render dialogue
    if (this.currentDialogue) {
      this.context.fillStyle = 'rgba(0, 0, 0, 0.8)';
      this.context.fillRect(0, this.canvas!.height - 100, this.canvas!.width, 100);
      
      this.context.fillStyle = '#FFF';
      this.context.font = '16px Arial';
      this.context.fillText(this.currentDialogue, 20, this.canvas!.height - 60);
      this.context.fillText('Press Enter to continue...', 20, this.canvas!.height - 20);
    }

    // Render inventory
    if (this.showInventory) {
      this.renderInventory();
    }

    // Render quests
    if (this.showQuests) {
      this.renderQuests();
    }
  }

  private renderInventory(): void {
    if (!this.context) return;

    const inventory = listInventory();
    this.context.fillStyle = 'rgba(0, 0, 0, 0.9)';
    this.context.fillRect(50, 50, 300, 400);
    
    this.context.fillStyle = '#FFF';
    this.context.font = '18px Arial';
    this.context.fillText('Inventory', 70, 80);
    
    inventory.forEach((item, index) => {
      if (this.context) {
        this.context.fillText(`${item.name} x${item.quantity}`, 70, 110 + index * 25);
      }
    });
  }

  private renderQuests(): void {
    if (!this.context) return;

    const quests = listQuests();
    this.context.fillStyle = 'rgba(0, 0, 0, 0.9)';
    this.context.fillRect(400, 50, 300, 400);
    
    this.context.fillStyle = '#FFF';
    this.context.font = '18px Arial';
    this.context.fillText('Quests', 420, 80);
    
    quests.forEach((quest, index) => {
      const status = quest.completed ? '✓' : '○';
      if (this.context) {
        this.context.fillText(`${status} ${quest.description}`, 420, 110 + index * 25);
      }
    });
  }

  private renderDebugOverlay(): void {
    if (!this.context) return;

    const player = getPlayerPosition();
    const world = getWorld();
    
    this.context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.context.fillRect(10, 10, 250, 150);
    
    this.context.fillStyle = '#FFF';
    this.context.font = '12px monospace';
    this.context.fillText(`FPS: ${Math.round(1000 / (performance.now() - this.lastFrameTime))}`, 20, 30);
    this.context.fillText(`Player: (${player.x}, ${player.y})`, 20, 50);
    this.context.fillText(`Zone: ${world?.zone || 'none'}`, 20, 70);
    this.context.fillText(`State: ${this.gameState}`, 20, 90);
    this.context.fillText(`Frame: ${this.frameCount}`, 20, 110);
    this.context.fillText(`Touch: ${this.config.enableTouch ? 'ON' : 'OFF'}`, 20, 130);
  }

  // Utility Methods
  private showMessage(message: string): void {
    console.log(message);
    emit('showMessage', message);
  }

  private showTileInfo(type: TileType, x: number, y: number): void {
    const label = getTileLabel(type);
    const walkable = isWalkable(type);
    const cost = getMovementCost(type);
    this.showMessage(`${label} at (${x}, ${y}) - Walkable: ${walkable}, Cost: ${cost}`);
  }

  private updateStatusEffects(deltaTime: number): void {
    // Update status effects (implementation depends on statusEffects module)
    emit('updateStatusEffects', deltaTime);
  }

  private updateTileAnimations(deltaTime: number): void {
    // Update tile animations (implementation depends on tileAnimations module)
    emit('updateTileAnimations', deltaTime);
  }

  private updateAudio(deltaTime: number): void {
    // Update audio (implementation depends on tileAudio module)
    emit('updateAudio', deltaTime);
  }

  private handleResize(): void {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  // Public API
  public setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.handleResize();
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  public getConfig(): GameConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<GameConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Bridge Integration
  public setRenderBridge(bridge: any): void {
    this.renderBridge = bridge;
  }

  public getRenderBridge(): any {
    return this.renderBridge;
  }
}

// Export singleton instance
export const mainOrchestrator = new MainOrchestrator();

// Export for module integration
export default MainOrchestrator;